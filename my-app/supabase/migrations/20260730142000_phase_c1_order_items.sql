-- Phase C1: order_items — real line items for My Jobs / tracker

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  name text not null,
  brand text,
  retailer text,
  retailer_url text,
  article_id text,
  quantity integer not null default 1 check (quantity > 0 and quantity <= 99),
  unit_price_cents integer not null default 0 check (unit_price_cents >= 0),
  assembly_cents integer not null default 0 check (assembly_cents >= 0),
  fulfillment_mode public.fulfillment_mode not null default 'warehouse_assembly',
  status public.order_item_status not null default 'awaiting',
  image_url text,
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists order_items_order_id_idx on public.order_items (order_id);

comment on table public.order_items is
  'Line items for an order. Prices are snapshots at book time.';

create or replace function public.set_order_items_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists order_items_set_updated_at on public.order_items;
create trigger order_items_set_updated_at
  before update on public.order_items
  for each row
  execute function public.set_order_items_updated_at();

alter table public.order_items enable row level security;

-- Customer SELECT own items via parent order
drop policy if exists "order_items_select_own" on public.order_items;
create policy "order_items_select_own"
  on public.order_items for select
  to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.customer_id = auth.uid()
    )
  );

-- No insert/update/delete policies for authenticated — service role only
