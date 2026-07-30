-- Phase C1: item_classes seed, addresses, stripe_webhook_events

-- ─── Pricing catalog (admin-editable later; seed matches lib/quote/pricing.ts) ───
create table if not exists public.item_classes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  base_price_cents integer not null check (base_price_cents >= 0),
  default_fulfillment_mode public.fulfillment_mode not null default 'warehouse_assembly',
  est_assembly_min integer,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

comment on table public.item_classes is
  'Assembly rate card. Snapshot into order_items.assembly_cents at book time.';

insert into public.item_classes (code, name, base_price_cents, sort_order) values
  ('bed', 'Bed', 6900, 10),
  ('dresser', 'Dresser', 5900, 20),
  ('table', 'Table', 4500, 30),
  ('shelf', 'Shelf', 3900, 40),
  ('chair', 'Chair', 3500, 50),
  ('other', 'Other / default', 4900, 60),
  ('default', 'Default assembly', 4900, 70)
on conflict (code) do nothing;

alter table public.item_classes enable row level security;

drop policy if exists "item_classes_select_active" on public.item_classes;
create policy "item_classes_select_active"
  on public.item_classes for select
  to authenticated, anon
  using (is_active = true);

-- ─── Addresses (server sets in_service_area) ───
create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete cascade,
  label text,
  line1 text not null,
  line2 text,
  city text,
  state text,
  zip text,
  country text not null default 'US',
  lat double precision,
  lng double precision,
  place_id text,
  formatted_address text,
  access_notes text,
  in_service_area boolean,
  distance_from_hub_miles numeric(8, 2),
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists addresses_user_id_idx on public.addresses (user_id);

comment on column public.addresses.in_service_area is
  'Set server-side only — never trust client.';

alter table public.addresses enable row level security;

drop policy if exists "addresses_select_own" on public.addresses;
create policy "addresses_select_own"
  on public.addresses for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "addresses_insert_own" on public.addresses;
create policy "addresses_insert_own"
  on public.addresses for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "addresses_update_own" on public.addresses;
create policy "addresses_update_own"
  on public.addresses for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- FK from orders.delivery_address_id (added in orders_extend)
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'orders_delivery_address_id_fkey'
  ) then
    alter table public.orders
      add constraint orders_delivery_address_id_fkey
      foreign key (delivery_address_id) references public.addresses (id)
      on delete set null;
  end if;
exception
  when others then
    raise notice 'orders_delivery_address_id_fkey skipped: %', sqlerrm;
end$$;

-- ─── Stripe webhook idempotency ledger (used in C5) ───
create table if not exists public.stripe_webhook_events (
  event_id text primary key,
  event_type text not null,
  processed_at timestamptz not null default now(),
  payload jsonb,
  error text
);

comment on table public.stripe_webhook_events is
  'Idempotency ledger for Stripe webhooks. Insert event_id before side effects.';

alter table public.stripe_webhook_events enable row level security;
-- No policies: service_role only
