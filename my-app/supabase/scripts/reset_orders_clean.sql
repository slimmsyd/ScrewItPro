-- =============================================================================
-- Reset order spine to a clean "pale" state (dev / staging only)
-- =============================================================================
-- Use when soft-gate demo books pile up and you want My Jobs empty again,
-- without re-engineering the booking path.
--
-- SAFE: only touches order-related tables + order_number sequence.
-- Does NOT delete profiles, waitlist, auth users, or app_settings.
--
-- HOW TO RUN
--   Supabase Dashboard → SQL Editor → paste → Run
--   or: supabase db execute -f supabase/scripts/reset_orders_clean.sql
--
-- OPTIONS (pick one block below)
-- =============================================================================

-- ─── Option A (recommended): wipe ALL orders + payments + events + items ───
-- Returns My Jobs to empty for every user. Resets SIP sequence to 10001.

begin;

-- Child tables first (cascade also works if FKs are ON DELETE CASCADE)
truncate table public.order_status_events restart identity cascade;
truncate table public.order_items restart identity cascade;
truncate table public.payments restart identity cascade;
truncate table public.orders restart identity cascade;

-- Optional: clear Stripe webhook ledger if you were testing hooks
-- truncate table public.stripe_webhook_events restart identity cascade;

-- Human order numbers start at SIP-10001 again
alter sequence if exists public.order_number_seq restart with 10001;

commit;

-- Verify:
-- select count(*) from public.orders;           -- 0
-- select nextval('public.order_number_seq');    -- 10001 (then optionally setval back)
-- select setval('public.order_number_seq', 10000, true); -- if you advanced it by verify

-- =============================================================================
-- Option B: delete ONLY soft-gate demo books (keep any other orders)
-- Uncomment and run INSTEAD of Option A if you need selective cleanup.
-- =============================================================================
/*
begin;

delete from public.order_items
where order_id in (
  select id from public.orders
  where metadata->>'source' = 'soft_gate_demo'
     or (metadata->>'demoBooking')::boolean is true
);

delete from public.order_status_events
where order_id in (
  select id from public.orders
  where metadata->>'source' = 'soft_gate_demo'
     or (metadata->>'demoBooking')::boolean is true
);

delete from public.payments
where order_id in (
  select id from public.orders
  where metadata->>'source' = 'soft_gate_demo'
     or (metadata->>'demoBooking')::boolean is true
);

delete from public.orders
where metadata->>'source' = 'soft_gate_demo'
   or (metadata->>'demoBooking')::boolean is true;

-- Do not restart sequence on selective delete (avoid renumbering history).
commit;
*/

-- =============================================================================
-- Option C: one test user's jobs only (replace UUID)
-- =============================================================================
/*
begin;
delete from public.order_items where order_id in (
  select id from public.orders where customer_id = 'YOUR-USER-UUID'
);
delete from public.order_status_events where order_id in (
  select id from public.orders where customer_id = 'YOUR-USER-UUID'
);
delete from public.payments where order_id in (
  select id from public.orders where customer_id = 'YOUR-USER-UUID'
);
delete from public.orders where customer_id = 'YOUR-USER-UUID';
commit;
*/
