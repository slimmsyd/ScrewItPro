# Phase C1 — Apply order spine migrations

SQL files (in order) under `my-app/supabase/migrations/`:

1. `20260730140000_phase_c1_ops_enums_and_settings.sql`
2. `20260730141000_phase_c1_orders_extend.sql`
3. `20260730142000_phase_c1_order_items.sql`
4. `20260730143000_phase_c1_status_machine.sql`
5. `20260730144000_phase_c1_item_classes_addresses_webhooks.sql`

Also ensure earlier migrations are applied, including:

- `20260715140000_orders_payments_interim.sql` (base `orders` / `payments`)
- `20260730120000_profiles_update_own_no_recursion.sql`

## Supabase SQL Editor

1. Open project → SQL → New query  
2. Paste each file in order → Run  
3. Confirm tables: `order_items`, `order_status_events`, `app_settings`, `addresses`, `item_classes`, `stripe_webhook_events`  
4. Confirm `orders` has `order_number`, `lifecycle_status`, `payment_status`

## CLI (if linked)

```bash
cd my-app
npx supabase db push
# or
npx supabase migration up
```

## App compatibility

Checkout still writes legacy `status` (`pending_payment` | …).  
New columns get defaults (`lifecycle_status=draft`, `payment_status=unpaid`) and triggers fill `order_number`.  
**C2** reads jobs for My Jobs. **C2.5** soft-gate writes real `SIP-*` jobs (non-prod).  
To empty the order tables and restart numbers: `my-app/supabase/scripts/reset_orders_clean.sql`.

## Diagram

Open `phase-c-order-spine.html` in a browser for the architecture flow.
