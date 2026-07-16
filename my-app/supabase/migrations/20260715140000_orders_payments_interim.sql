-- Interim orders + payments tables for the deposit-checkout scaffold.
-- Apply via Supabase SQL Editor or: supabase db push
--
-- These are a deliberately SMALL, forward-compatible subset of the canonical
-- order model in docs/ARCHITECTURE-PLAN.md (§A). M1's full migrations EXTEND
-- these (add columns / widen the status enum) rather than replacing them, so
-- the Stripe rails built now keep working. Writes go through the service role.

create extension if not exists "pgcrypto";

-- Minimal order status subset (M1 widens to the full 14-state lifecycle).
do $$
begin
  if not exists (select 1 from pg_type where typname = 'order_status_interim') then
    create type public.order_status_interim as enum (
      'pending_payment',
      'deposit_paid',
      'cancelled'
    );
  end if;
end$$;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  -- Nullable now (guest/quote pre-account); M1 ties to profiles/auth.users.
  customer_id uuid,
  customer_email text,
  status public.order_status_interim not null default 'pending_payment',
  total_cents integer not null default 0 check (total_cents >= 0),
  deposit_cents integer not null default 0 check (deposit_cents >= 0),
  currency text not null default 'usd',
  stripe_customer_id text,
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_checkout_session_idx
  on public.orders (stripe_checkout_session_id);

comment on table public.orders is
  'Interim orders for the deposit-checkout scaffold. Extended by M1 canonical migrations.';

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  kind text not null default 'deposit'
    check (kind in ('deposit', 'balance', 'refund')),
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null default 'usd',
  status text not null default 'pending'
    check (status in ('pending', 'succeeded', 'failed', 'refunded')),
  stripe_payment_intent_id text,
  stripe_checkout_session_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists payments_order_id_idx on public.payments (order_id);
create index if not exists payments_intent_idx
  on public.payments (stripe_payment_intent_id);

comment on table public.payments is
  'Payment ledger (deposit/balance/refund) for interim orders.';

-- updated_at trigger for orders
create or replace function public.set_orders_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
  before update on public.orders
  for each row
  execute function public.set_orders_updated_at();

-- Lock down: no direct client access; Next.js uses service role.
alter table public.orders enable row level security;
alter table public.payments enable row level security;

drop policy if exists "No public access on orders" on public.orders;
drop policy if exists "No public access on payments" on public.payments;
-- No policies = no access for roles subject to RLS (service_role bypasses).
