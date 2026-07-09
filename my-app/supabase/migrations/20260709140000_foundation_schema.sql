-- =============================================================================
-- Screw It Pro — Foundation schema (v0)
-- Expandable base: profiles/roles, waitlist, newsletter, plans, points, rewards.
-- Apply via SQL Editor or: supabase db push
-- See docs/DATA_ARCHITECTURE.md
-- =============================================================================

create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------

do $$ begin
  create type public.user_role as enum (
    'customer',
    'admin',
    'technician',
    'driver'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.profile_status as enum (
    'active',
    'suspended',
    'invited'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.subscription_status as enum (
    'active',
    'trialing',
    'past_due',
    'canceled',
    'expired'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.billing_interval as enum (
    'none',
    'month',
    'year',
    'one_time'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.newsletter_status as enum (
    'subscribed',
    'unsubscribed'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.point_reason as enum (
    'signup_bonus',
    'order_earn',
    'subscription_bonus',
    'redemption',
    'admin_adjust',
    'referral',
    'other'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.redemption_status as enum (
    'pending',
    'fulfilled',
    'canceled'
  );
exception when duplicate_object then null;
end $$;

-- -----------------------------------------------------------------------------
-- Updated-at helper (shared)
-- -----------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- profiles (1:1 with auth.users)
-- -----------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  phone text,
  role public.user_role not null default 'customer',
  status public.profile_status not null default 'active',
  points_balance integer not null default 0
    check (points_balance >= 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists profiles_status_idx on public.profiles (status);
create index if not exists profiles_email_idx on public.profiles (email);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

comment on table public.profiles is
  'App identity for every signed-in user. Role drives portal access.';

-- Auto-create profile when a Supabase Auth user is created
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      null
    ),
    coalesce(
      new.raw_user_meta_data ->> 'avatar_url',
      new.raw_user_meta_data ->> 'picture',
      null
    ),
    coalesce(
      (new.raw_user_meta_data ->> 'role')::public.user_role,
      'customer'::public.user_role
    )
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- waitlist_entries (pre-auth leads)
-- -----------------------------------------------------------------------------

create table if not exists public.waitlist_entries (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  email_normalized text not null,
  name text,
  picture text,
  provider text not null default 'email'
    check (provider in ('email', 'google', 'apple')),
  source text not null default 'join',
  metadata jsonb not null default '{}'::jsonb,
  converted_user_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint waitlist_entries_email_normalized_key unique (email_normalized)
);

create index if not exists waitlist_entries_created_at_idx
  on public.waitlist_entries (created_at);
create index if not exists waitlist_entries_provider_idx
  on public.waitlist_entries (provider);
create index if not exists waitlist_entries_converted_user_id_idx
  on public.waitlist_entries (converted_user_id);

drop trigger if exists waitlist_entries_set_updated_at on public.waitlist_entries;
create trigger waitlist_entries_set_updated_at
  before update on public.waitlist_entries
  for each row
  execute function public.set_updated_at();

comment on table public.waitlist_entries is
  'Private-beta waitlist signups. Server API only until conversion.';

-- -----------------------------------------------------------------------------
-- newsletter_subscribers
-- -----------------------------------------------------------------------------

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  email_normalized text not null,
  source text not null default 'footer',
  status public.newsletter_status not null default 'subscribed',
  converted_user_id uuid references public.profiles (id) on delete set null,
  consented_at timestamptz not null default now(),
  unsubscribed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint newsletter_subscribers_email_normalized_key unique (email_normalized)
);

create index if not exists newsletter_subscribers_status_idx
  on public.newsletter_subscribers (status);

drop trigger if exists newsletter_subscribers_set_updated_at on public.newsletter_subscribers;
create trigger newsletter_subscribers_set_updated_at
  before update on public.newsletter_subscribers
  for each row
  execute function public.set_updated_at();

comment on table public.newsletter_subscribers is
  'Marketing newsletter list (separate intent from waitlist).';

-- -----------------------------------------------------------------------------
-- subscription_plans (catalog)
-- -----------------------------------------------------------------------------

create table if not exists public.subscription_plans (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  name text not null,
  description text,
  price_cents integer not null default 0
    check (price_cents >= 0),
  billing_interval public.billing_interval not null default 'none',
  stripe_price_id text,
  points_multiplier numeric(4, 2) not null default 1.00
    check (points_multiplier >= 0),
  features jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subscription_plans_code_key unique (code)
);

drop trigger if exists subscription_plans_set_updated_at on public.subscription_plans;
create trigger subscription_plans_set_updated_at
  before update on public.subscription_plans
  for each row
  execute function public.set_updated_at();

comment on table public.subscription_plans is
  'Catalog of membership / subscription packages.';

-- Seed default plans (idempotent)
insert into public.subscription_plans (code, name, description, price_cents, billing_interval, features, sort_order)
values
  (
    'free',
    'Free',
    'Default plan for new customers.',
    0,
    'none',
    '["book_jobs", "track_orders"]'::jsonb,
    0
  ),
  (
    'basic',
    'Basic',
    'Placeholder basic membership — pricing TBD.',
    0,
    'month',
    '["book_jobs", "track_orders", "priority_support"]'::jsonb,
    10
  ),
  (
    'pro',
    'Pro',
    'Placeholder pro membership — pricing TBD.',
    0,
    'month',
    '["book_jobs", "track_orders", "priority_support", "points_boost"]'::jsonb,
    20
  )
on conflict (code) do nothing;

-- -----------------------------------------------------------------------------
-- subscriptions (per-user instance)
-- -----------------------------------------------------------------------------

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  plan_id uuid not null references public.subscription_plans (id),
  status public.subscription_status not null default 'active',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  stripe_subscription_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subscriptions_user_id_idx on public.subscriptions (user_id);
create index if not exists subscriptions_plan_id_idx on public.subscriptions (plan_id);
create index if not exists subscriptions_status_idx on public.subscriptions (status);

-- At most one active/trialing/past_due subscription per user
create unique index if not exists subscriptions_one_open_per_user_idx
  on public.subscriptions (user_id)
  where status in ('active', 'trialing', 'past_due');

drop trigger if exists subscriptions_set_updated_at on public.subscriptions;
create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row
  execute function public.set_updated_at();

comment on table public.subscriptions is
  'Which plan a user currently has (or had).';

-- Assign free plan when a profile is created
create or replace function public.handle_new_profile_subscription()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  free_plan_id uuid;
begin
  select id into free_plan_id
  from public.subscription_plans
  where code = 'free' and is_active = true
  limit 1;

  if free_plan_id is not null then
    insert into public.subscriptions (user_id, plan_id, status)
    values (new.id, free_plan_id, 'active')
    on conflict do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists on_profile_created_subscription on public.profiles;
create trigger on_profile_created_subscription
  after insert on public.profiles
  for each row
  execute function public.handle_new_profile_subscription();

-- -----------------------------------------------------------------------------
-- point_ledger (append-only)
-- -----------------------------------------------------------------------------

create table if not exists public.point_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  delta integer not null
    check (delta <> 0),
  balance_after integer not null
    check (balance_after >= 0),
  reason public.point_reason not null default 'other',
  reference_type text,
  reference_id uuid,
  note text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists point_ledger_user_id_created_at_idx
  on public.point_ledger (user_id, created_at desc);
create index if not exists point_ledger_reason_idx
  on public.point_ledger (reason);

comment on table public.point_ledger is
  'Immutable points credit/debit log. profiles.points_balance is a cache.';

-- Atomic apply: insert ledger row + update balance
create or replace function public.apply_points(
  p_user_id uuid,
  p_delta integer,
  p_reason public.point_reason default 'other',
  p_reference_type text default null,
  p_reference_id uuid default null,
  p_note text default null,
  p_created_by uuid default null
)
returns public.point_ledger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_balance integer;
  entry public.point_ledger;
begin
  if p_delta = 0 then
    raise exception 'delta must be non-zero';
  end if;

  update public.profiles
  set points_balance = points_balance + p_delta
  where id = p_user_id
  returning points_balance into new_balance;

  if not found then
    raise exception 'profile % not found', p_user_id;
  end if;

  if new_balance < 0 then
    raise exception 'insufficient points (would be %)', new_balance;
  end if;

  insert into public.point_ledger (
    user_id, delta, balance_after, reason,
    reference_type, reference_id, note, created_by
  )
  values (
    p_user_id, p_delta, new_balance, p_reason,
    p_reference_type, p_reference_id, p_note, p_created_by
  )
  returning * into entry;

  return entry;
end;
$$;

-- -----------------------------------------------------------------------------
-- reward_items (catalog)
-- -----------------------------------------------------------------------------

create table if not exists public.reward_items (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  name text not null,
  description text,
  points_cost integer not null
    check (points_cost > 0),
  inventory integer
    check (inventory is null or inventory >= 0),
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reward_items_code_key unique (code)
);

drop trigger if exists reward_items_set_updated_at on public.reward_items;
create trigger reward_items_set_updated_at
  before update on public.reward_items
  for each row
  execute function public.set_updated_at();

comment on table public.reward_items is
  'Redeemable rewards catalog (points cost).';

-- Minimal placeholder rewards
insert into public.reward_items (code, name, description, points_cost, is_active)
values
  (
    'welcome_swag',
    'Welcome sticker pack',
    'Placeholder reward — replace with real offers later.',
    100,
    true
  ),
  (
    'service_credit_10',
    '$10 service credit',
    'Placeholder reward — wire to Stripe credit later.',
    500,
    true
  )
on conflict (code) do nothing;

-- -----------------------------------------------------------------------------
-- reward_redemptions
-- -----------------------------------------------------------------------------

create table if not exists public.reward_redemptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  reward_id uuid not null references public.reward_items (id),
  points_spent integer not null
    check (points_spent > 0),
  status public.redemption_status not null default 'pending',
  ledger_entry_id uuid references public.point_ledger (id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reward_redemptions_user_id_idx
  on public.reward_redemptions (user_id);
create index if not exists reward_redemptions_status_idx
  on public.reward_redemptions (status);

drop trigger if exists reward_redemptions_set_updated_at on public.reward_redemptions;
create trigger reward_redemptions_set_updated_at
  before update on public.reward_redemptions
  for each row
  execute function public.set_updated_at();

comment on table public.reward_redemptions is
  'User redemptions against reward_items.';

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.waitlist_entries enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.subscription_plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.point_ledger enable row level security;
alter table public.reward_items enable row level security;
alter table public.reward_redemptions enable row level security;

-- profiles: own row
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    -- users cannot escalate role/status/points via client
    and role = (select p.role from public.profiles p where p.id = auth.uid())
    and status = (select p.status from public.profiles p where p.id = auth.uid())
    and points_balance = (select p.points_balance from public.profiles p where p.id = auth.uid())
  );

-- waitlist + newsletter: no direct client access (service role bypasses RLS)
-- (no policies)

-- plans: anyone can read active catalog
drop policy if exists "plans_select_active" on public.subscription_plans;
create policy "plans_select_active"
  on public.subscription_plans for select
  to anon, authenticated
  using (is_active = true);

-- subscriptions: own rows
drop policy if exists "subscriptions_select_own" on public.subscriptions;
create policy "subscriptions_select_own"
  on public.subscriptions for select
  to authenticated
  using (auth.uid() = user_id);

-- point ledger: own rows
drop policy if exists "point_ledger_select_own" on public.point_ledger;
create policy "point_ledger_select_own"
  on public.point_ledger for select
  to authenticated
  using (auth.uid() = user_id);

-- rewards catalog: active items public-readable
drop policy if exists "reward_items_select_active" on public.reward_items;
create policy "reward_items_select_active"
  on public.reward_items for select
  to anon, authenticated
  using (is_active = true);

-- redemptions: own rows
drop policy if exists "reward_redemptions_select_own" on public.reward_redemptions;
create policy "reward_redemptions_select_own"
  on public.reward_redemptions for select
  to authenticated
  using (auth.uid() = user_id);
