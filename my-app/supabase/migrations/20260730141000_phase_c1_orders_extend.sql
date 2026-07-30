-- Phase C1: extend interim orders for spine (non-breaking for checkout)
-- Keeps status order_status_interim; adds lifecycle_status + payment_status + identity.

-- Human-readable order numbers SIP-10001+
create sequence if not exists public.order_number_seq start 10001;

create or replace function public.next_order_number()
returns text
language sql
as $$
  select 'SIP-' || lpad(nextval('public.order_number_seq')::text, 5, '0');
$$;

-- New columns (nullable first where needed for backfill)
alter table public.orders
  add column if not exists order_number text,
  add column if not exists payment_status public.payment_status,
  add column if not exists lifecycle_status public.order_lifecycle_status,
  add column if not exists contact_email text,
  add column if not exists contact_phone text,
  add column if not exists contact_name text,
  add column if not exists delivery_address_id uuid,
  add column if not exists subtotal_cents integer,
  add column if not exists balance_cents integer,
  add column if not exists notes text;

-- Backfill payment + lifecycle from interim status
update public.orders set
  payment_status = case status::text
    when 'deposit_paid' then 'deposit_paid'::public.payment_status
    else 'unpaid'::public.payment_status
  end,
  lifecycle_status = case status::text
    when 'pending_payment' then 'draft'::public.order_lifecycle_status
    when 'deposit_paid' then 'awaiting_arrival'::public.order_lifecycle_status
    when 'cancelled' then 'cancelled_no_payment'::public.order_lifecycle_status
    else 'draft'::public.order_lifecycle_status
  end
where payment_status is null or lifecycle_status is null;

update public.orders set
  contact_email = coalesce(contact_email, customer_email),
  subtotal_cents = coalesce(subtotal_cents, total_cents),
  balance_cents = coalesce(balance_cents, greatest(0, total_cents - deposit_cents))
where true;

-- Assign order numbers to existing rows
update public.orders
set order_number = public.next_order_number()
where order_number is null;

-- Defaults for new inserts
alter table public.orders
  alter column payment_status set default 'unpaid'::public.payment_status,
  alter column lifecycle_status set default 'draft'::public.order_lifecycle_status;

alter table public.orders
  alter column payment_status set not null,
  alter column lifecycle_status set not null;

-- Unique order_number
create unique index if not exists orders_order_number_uidx
  on public.orders (order_number);

create index if not exists orders_customer_id_idx
  on public.orders (customer_id);

create index if not exists orders_lifecycle_status_idx
  on public.orders (lifecycle_status);

create index if not exists orders_payment_status_idx
  on public.orders (payment_status);

-- Optional FK to profiles when customer_id set (soft: only if profiles exists)
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'orders_customer_id_fkey'
  ) then
    alter table public.orders
      add constraint orders_customer_id_fkey
      foreign key (customer_id) references public.profiles (id)
      on delete set null;
  end if;
exception
  when others then
    raise notice 'orders_customer_id_fkey skipped: %', sqlerrm;
end$$;

-- Auto-fill order_number on insert
create or replace function public.orders_set_order_number()
returns trigger
language plpgsql
as $$
begin
  if new.order_number is null or new.order_number = '' then
    new.order_number := public.next_order_number();
  end if;
  if new.contact_email is null and new.customer_email is not null then
    new.contact_email := new.customer_email;
  end if;
  if new.subtotal_cents is null then
    new.subtotal_cents := new.total_cents;
  end if;
  if new.balance_cents is null then
    new.balance_cents := greatest(0, coalesce(new.total_cents, 0) - coalesce(new.deposit_cents, 0));
  end if;
  return new;
end;
$$;

drop trigger if exists orders_set_order_number on public.orders;
create trigger orders_set_order_number
  before insert on public.orders
  for each row
  execute function public.orders_set_order_number();

comment on column public.orders.lifecycle_status is
  'Ops fulfillment state (14-value enum). Map to customer 7-state UI in API.';
comment on column public.orders.payment_status is
  'Money state orthogonal to lifecycle_status.';
comment on column public.orders.order_number is
  'Human display id SIP-#####; sequence-backed.';
comment on column public.orders.status is
  'LEGACY interim pay scaffold (pending_payment|deposit_paid|cancelled). Prefer lifecycle_status + payment_status.';

-- Customer read own orders (service role still full access)
drop policy if exists "orders_select_own" on public.orders;
create policy "orders_select_own"
  on public.orders for select
  to authenticated
  using (customer_id = auth.uid());
