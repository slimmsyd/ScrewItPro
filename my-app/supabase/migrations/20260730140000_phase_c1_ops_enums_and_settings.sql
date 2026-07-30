-- Phase C1: ops enums + app_settings
-- Customer-dashboard-first order spine. Apply via SQL Editor or supabase db push.
-- Does not drop interim order_status_interim (checkout still uses it).

create extension if not exists "pgcrypto";

-- ─── Lifecycle status (ops machine — USER-FLOWS / ARCHITECTURE-PLAN) ───
do $$
begin
  if not exists (select 1 from pg_type where typname = 'order_lifecycle_status') then
    create type public.order_lifecycle_status as enum (
      'draft',
      'pending_quote',
      'quote_sent',
      'awaiting_arrival',
      'boxes_received',
      'in_assembly',
      'assembly_completed',
      'ready_for_delivery',
      'out_for_delivery',
      'delivered',
      'on_hold_damage_reported',
      'refused_pending_resolution',
      'refunded_closed',
      'cancelled_no_payment'
    );
  end if;
end$$;

-- ─── Payment status (orthogonal to lifecycle) ───
do $$
begin
  if not exists (select 1 from pg_type where typname = 'payment_status') then
    create type public.payment_status as enum (
      'unpaid',
      'deposit_paid',
      'paid_in_full',
      'balance_failed',
      'partially_refunded',
      'refunded'
    );
  end if;
end$$;

-- ─── Fulfillment mode (load-bearing: some items cannot travel assembled) ───
do $$
begin
  if not exists (select 1 from pg_type where typname = 'fulfillment_mode') then
    create type public.fulfillment_mode as enum (
      'warehouse_assembly',
      'hybrid',
      'onsite_only'
    );
  end if;
end$$;

-- ─── Per-item status (minimal for C1; expand later) ───
do $$
begin
  if not exists (select 1 from pg_type where typname = 'order_item_status') then
    create type public.order_item_status as enum (
      'awaiting',
      'received',
      'in_assembly',
      'assembled',
      'out_for_delivery',
      'delivered',
      'damaged',
      'refund_pending',
      'refunded',
      'returned'
    );
  end if;
end$$;

-- ─── App settings (single-row config bag) ───
create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

comment on table public.app_settings is
  'Key/jsonb product config. Phase C seeds hub radius 40mi and deposit 30%.';

insert into public.app_settings (key, value) values
  (
    'hub',
    jsonb_build_object(
      'address', 'Houston, TX',
      'lat', 29.7604,
      'lng', -95.3698,
      'radius_miles', 40,
      'radius_m', 64374,
      'timezone', 'America/Chicago'
    )
  ),
  (
    'deposit_percent',
    '30'::jsonb
  ),
  (
    'quote_expiry_days',
    '7'::jsonb
  )
on conflict (key) do nothing;

alter table public.app_settings enable row level security;

-- Authenticated can read settings (radius/deposit are not secrets)
drop policy if exists "app_settings_select_authenticated" on public.app_settings;
create policy "app_settings_select_authenticated"
  on public.app_settings for select
  to authenticated
  using (true);

-- Writes: service role only (no insert/update policies for authenticated)
