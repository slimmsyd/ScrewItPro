-- Durable record of every transactional email the app attempts to send.
-- Apply via Supabase SQL Editor or: supabase db push
-- Writes go through the Next.js API with the service role (bypasses RLS).
-- Mirrors the waitlist_entries / inquiries locked-down pattern.
--
-- Two jobs (see docs/ARCHITECTURE-PLAN.md:82):
--   1. Observability. Replaces the in-memory outbox ring buffer, which dies on
--      every deploy and never spans serverless instances.
--   2. Reminder idempotency guard. ARCHITECTURE-PLAN.md:136 specifies reminders
--      are "computed from state + email_log absence" — i.e. the dispatcher
--      decides whether to send by checking no row exists for a
--      (template_code, order) pair. M5 acceptance (:195) requires
--      "every reminder fires exactly once".
--
-- Because job 2 reads this table to SUPPRESS sends, a wrongly-recorded 'sent'
-- row silently cancels a real reminder. Hence the strict status vocabulary
-- below: only a Resend-confirmed send may be 'sent'.

create extension if not exists "pgcrypto";

create table if not exists public.email_log (
  id uuid primary key default gen_random_uuid(),

  -- Stable template identifier, from RenderedEmail.code (src/lib/emails/templates.ts).
  -- Append-only vocabulary; never rename a code once rows carry it.
  template_code text not null,

  to_email text not null,
  subject text,

  -- Optional subject-of-record links. Nullable: waitlist/lead mail predates both.
  order_id uuid,
  inquiry_id uuid,

  -- Resend's message id, from the { data: { id } } success envelope.
  -- Null for 'skipped' and 'failed'. Non-null 'sent' rows are traceable to the
  -- Resend dashboard.
  resend_id text,

  status text not null
    check (status in ('sent', 'failed', 'skipped')),

  -- WHY a send failed. Without this a 'failed' row records that something broke
  -- but not what, which defeats the point of the table.
  error_message text,

  -- Arbitrary send context (recipient name, position, source, …).
  payload jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 'sent' is the status the idempotency guard trusts, so hold it to Resend's
-- own confirmation: a sent row must carry the id Resend returned.
alter table public.email_log
  drop constraint if exists email_log_sent_requires_resend_id;
alter table public.email_log
  add constraint email_log_sent_requires_resend_id
  check (status <> 'sent' or resend_id is not null);

-- Conditional FKs: only wire them up if the referenced tables exist, so this
-- migration is safe on a DB that hasn't had orders/inquiries applied yet.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'email_log_order_id_fkey'
  ) then
    if exists (
      select 1 from information_schema.tables
      where table_schema = 'public' and table_name = 'orders'
    ) then
      alter table public.email_log
        add constraint email_log_order_id_fkey
        foreign key (order_id)
        references public.orders (id)
        on delete set null;
    end if;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'email_log_inquiry_id_fkey'
  ) then
    if exists (
      select 1 from information_schema.tables
      where table_schema = 'public' and table_name = 'inquiries'
    ) then
      alter table public.email_log
        add constraint email_log_inquiry_id_fkey
        foreign key (inquiry_id)
        references public.inquiries (id)
        on delete set null;
    end if;
  end if;
end $$;

-- Diagnostics: "what happened to template X recently", "what did we send to Y".
create index if not exists email_log_template_code_created_at_idx
  on public.email_log (template_code, created_at desc);

create index if not exists email_log_to_email_idx
  on public.email_log (to_email);

create index if not exists email_log_status_idx
  on public.email_log (status);

create index if not exists email_log_order_id_idx
  on public.email_log (order_id)
  where order_id is not null;

-- The M5 guarantee, enforced by the database rather than trusted to an
-- application-level "check before send" (which races under concurrent dispatch).
-- Scoped to successful sends: a failed attempt must not permanently block a retry.
create unique index if not exists email_log_once_per_order_template_idx
  on public.email_log (template_code, order_id)
  where order_id is not null and status = 'sent';

comment on table public.email_log is
  'Every transactional email attempt (sent/failed/skipped). Server API only. Doubles as the reminder idempotency guard — see docs/ARCHITECTURE-PLAN.md:82.';

comment on column public.email_log.status is
  'sent = Resend confirmed and returned an id; failed = attempted and rejected/errored (see error_message); skipped = never attempted, RESEND_API_KEY absent.';

-- Keep updated_at fresh on change
create or replace function public.set_email_log_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists email_log_set_updated_at on public.email_log;
create trigger email_log_set_updated_at
  before update on public.email_log
  for each row
  execute function public.set_email_log_updated_at();

-- Lock down: no direct client access; Next.js uses service role.
-- ARCHITECTURE-PLAN.md:110 lists email_log under "service-role only, no exceptions".
alter table public.email_log enable row level security;

drop policy if exists "No public read on email_log" on public.email_log;
drop policy if exists "No public write on email_log" on public.email_log;

-- No policies = no access for roles subject to RLS (service_role still full access).
