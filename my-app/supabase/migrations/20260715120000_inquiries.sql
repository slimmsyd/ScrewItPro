-- Inbound lead / quote-request capture for ScrewIt Pros.
-- Apply via Supabase SQL Editor or: supabase db push
-- Writes go through the Next.js API with the service role (bypasses RLS).
-- Mirrors the waitlist_entries locked-down pattern.

create extension if not exists "pgcrypto";

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text not null,
  email_normalized text not null,
  phone text,
  service text,
  message text,
  -- Optional address context (from the hero pickup/delivery bar)
  pickup_address text,
  delivery_address text,
  source text not null default 'quote_dialog',
  status text not null default 'new'
    check (status in ('new', 'contacted', 'qualified', 'closed', 'spam')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists inquiries_created_at_idx
  on public.inquiries (created_at desc);

create index if not exists inquiries_email_normalized_idx
  on public.inquiries (email_normalized);

create index if not exists inquiries_status_idx
  on public.inquiries (status);

comment on table public.inquiries is
  'Inbound quote/contact leads (site forms). Server API only; also mirrored to n8n → Excel.';

-- Keep updated_at fresh on change
create or replace function public.set_inquiries_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists inquiries_set_updated_at on public.inquiries;
create trigger inquiries_set_updated_at
  before update on public.inquiries
  for each row
  execute function public.set_inquiries_updated_at();

-- Lock down: no direct client access; Next.js uses service role
alter table public.inquiries enable row level security;

drop policy if exists "No public read on inquiries" on public.inquiries;
drop policy if exists "No public write on inquiries" on public.inquiries;

-- No policies = no access for roles subject to RLS (service_role still full access).
