-- Waitlist entries for ScrewIt Pros private beta.
-- Apply via Supabase SQL Editor or: supabase db push
-- Writes go through the Next.js API with the service role (bypasses RLS).

create extension if not exists "pgcrypto";

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
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint waitlist_entries_email_normalized_key unique (email_normalized)
);

create index if not exists waitlist_entries_created_at_idx
  on public.waitlist_entries (created_at);

create index if not exists waitlist_entries_provider_idx
  on public.waitlist_entries (provider);

comment on table public.waitlist_entries is
  'Private-beta waitlist signups (email + OAuth). Server API only.';

-- Keep updated_at fresh on change
create or replace function public.set_waitlist_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists waitlist_entries_set_updated_at on public.waitlist_entries;
create trigger waitlist_entries_set_updated_at
  before update on public.waitlist_entries
  for each row
  execute function public.set_waitlist_updated_at();

-- Lock down: no direct client access; Next.js uses service role
alter table public.waitlist_entries enable row level security;

-- Explicit deny for anon/authenticated (service_role bypasses RLS)
drop policy if exists "No public read on waitlist" on public.waitlist_entries;
drop policy if exists "No public write on waitlist" on public.waitlist_entries;

-- No policies = no access for roles subject to RLS
-- (service_role still has full access)
