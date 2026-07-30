-- Phase C1: order_status_transitions + order_status_events + validate trigger

create table if not exists public.order_status_transitions (
  from_status public.order_lifecycle_status not null,
  to_status public.order_lifecycle_status not null,
  primary key (from_status, to_status)
);

comment on table public.order_status_transitions is
  'Legal edges for lifecycle_status. Enforced by trigger on orders.';

-- Happy-path + cancellation edges (expand later for damage/refusal loops)
insert into public.order_status_transitions (from_status, to_status) values
  ('draft', 'pending_quote'),
  ('draft', 'awaiting_arrival'),
  ('draft', 'cancelled_no_payment'),
  ('pending_quote', 'quote_sent'),
  ('pending_quote', 'cancelled_no_payment'),
  ('quote_sent', 'awaiting_arrival'),
  ('quote_sent', 'cancelled_no_payment'),
  ('awaiting_arrival', 'boxes_received'),
  ('awaiting_arrival', 'cancelled_no_payment'),
  ('boxes_received', 'in_assembly'),
  ('in_assembly', 'assembly_completed'),
  ('assembly_completed', 'ready_for_delivery'),
  ('ready_for_delivery', 'out_for_delivery'),
  ('out_for_delivery', 'delivered'),
  ('out_for_delivery', 'on_hold_damage_reported'),
  ('out_for_delivery', 'refused_pending_resolution'),
  ('on_hold_damage_reported', 'in_assembly'),
  ('on_hold_damage_reported', 'refunded_closed'),
  ('refused_pending_resolution', 'out_for_delivery'),
  ('refused_pending_resolution', 'refunded_closed'),
  ('delivered', 'refunded_closed')
on conflict do nothing;

create table if not exists public.order_status_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  from_status public.order_lifecycle_status,
  to_status public.order_lifecycle_status not null,
  actor_id uuid,
  actor_role text,
  note text,
  customer_visible boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists order_status_events_order_id_idx
  on public.order_status_events (order_id, created_at desc);

comment on table public.order_status_events is
  'Append-only lifecycle audit. customer_visible rows feed tracker + notifications.';

-- Belt: validate lifecycle_status changes + auto-insert event
create or replace function public.orders_validate_lifecycle_transition()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid;
begin
  if tg_op = 'UPDATE'
     and new.lifecycle_status is distinct from old.lifecycle_status then
    if not exists (
      select 1 from public.order_status_transitions t
      where t.from_status = old.lifecycle_status
        and t.to_status = new.lifecycle_status
    ) then
      raise exception 'illegal lifecycle transition: % → %',
        old.lifecycle_status, new.lifecycle_status
        using errcode = 'check_violation';
    end if;

    begin
      actor := nullif(current_setting('app.actor_id', true), '')::uuid;
    exception when others then
      actor := null;
    end;

    insert into public.order_status_events (
      order_id, from_status, to_status, actor_id, actor_role, customer_visible, note
    ) values (
      new.id,
      old.lifecycle_status,
      new.lifecycle_status,
      actor,
      nullif(current_setting('app.actor_role', true), ''),
      true,
      null
    );
  end if;

  -- Initial event on insert
  if tg_op = 'INSERT' then
    insert into public.order_status_events (
      order_id, from_status, to_status, customer_visible, note
    ) values (
      new.id,
      null,
      new.lifecycle_status,
      new.lifecycle_status not in ('draft', 'pending_quote'),
      'order created'
    );
  end if;

  return new;
end;
$$;

drop trigger if exists orders_validate_lifecycle on public.orders;
create trigger orders_validate_lifecycle
  after insert or update of lifecycle_status on public.orders
  for each row
  execute function public.orders_validate_lifecycle_transition();

alter table public.order_status_transitions enable row level security;
alter table public.order_status_events enable row level security;

drop policy if exists "transitions_select_authenticated" on public.order_status_transitions;
create policy "transitions_select_authenticated"
  on public.order_status_transitions for select
  to authenticated
  using (true);

drop policy if exists "events_select_own_visible" on public.order_status_events;
create policy "events_select_own_visible"
  on public.order_status_events for select
  to authenticated
  using (
    customer_visible = true
    and exists (
      select 1 from public.orders o
      where o.id = order_id and o.customer_id = auth.uid()
    )
  );
