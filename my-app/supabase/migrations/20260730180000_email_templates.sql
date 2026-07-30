-- Phase: email_templates — admin-editable transactional copy (booking first)
-- Service role only (no authenticated policies). Code falls back if table empty.

create table if not exists public.email_templates (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  name text not null,
  subject_template text not null,
  html_body_template text not null,
  text_body_template text not null,
  description text,
  is_active boolean not null default true,
  version integer not null default 1,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint email_templates_code_unique unique (code)
);

comment on table public.email_templates is
  'Admin-editable email subject/body. Inner HTML only; app wraps with brand layout.';
comment on column public.email_templates.code is
  'Stable code matching EmailTemplateCode / email_log.template_code.';
comment on column public.email_templates.html_body_template is
  'Mustache-lite {{vars}}; values escaped by app except URL keys.';

create index if not exists email_templates_active_idx
  on public.email_templates (code)
  where is_active = true;

alter table public.email_templates enable row level security;
-- No policies for authenticated/anon — service role bypasses RLS.

create or replace function public.set_email_templates_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists email_templates_set_updated_at on public.email_templates;
create trigger email_templates_set_updated_at
  before update on public.email_templates
  for each row
  execute function public.set_email_templates_updated_at();

-- Seed booking-confirmation (matches code default intent)
insert into public.email_templates (
  code,
  name,
  subject_template,
  html_body_template,
  text_body_template,
  description,
  is_active,
  version
) values (
  'booking-confirmation',
  'Booking confirmation',
  'You''re booked! Order {{orderNumber}}',
  $html$
<h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;font-weight:700;color:#04209b;">You're booked! 🎉</h1>
<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#2a3050;">Hi {{customerName}},</p>
<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#2a3050;">Your ScrewIt Pros job is confirmed. Order number: <strong style="color:#04209b;">{{orderNumber}}</strong>.</p>
<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#2a3050;">Build: <strong style="color:#04209b;">{{itemSummary}}</strong></p>
<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#2a3050;">Delivery: {{deliveryLine}}</p>
<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#2a3050;">Deposit (shown on quote): <strong>{{depositFormatted}}</strong></p>
<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#545b7a;"><em>{{paymentNote}}</em></p>
<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#2a3050;">{{hubHint}}</p>
<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#2a3050;"><a href="{{trackUrl}}" style="color:#1d6efe;">Track your order</a> · <a href="{{jobsUrl}}" style="color:#1d6efe;">My Jobs</a></p>
$html$,
  $text$
You're booked!

Hi {{customerName}},

Your ScrewIt Pros job is confirmed. Order number: {{orderNumber}}.
Build: {{itemSummary}}
Delivery: {{deliveryLine}}
Deposit (shown on quote): {{depositFormatted}}
{{paymentNote}}
{{hubHint}}

Track: {{trackUrl}}
My Jobs: {{jobsUrl}}
$text$,
  'Vars: customerName, orderNumber, trackUrl, jobsUrl, deliveryLine, itemSummary, depositFormatted, paymentNote, hubHint',
  true,
  1
)
on conflict (code) do nothing;
