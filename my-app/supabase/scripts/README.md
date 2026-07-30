# Supabase scripts (manual)

Run these in the **Supabase SQL Editor** (or CLI) against the project you use for local/preview. Prefer **not** on production without a backup.

| Script | Purpose |
|--------|---------|
| [`reset_orders_clean.sql`](./reset_orders_clean.sql) | Wipe orders / items / payments / status events and reset `SIP-` sequence to 10001. My Jobs goes empty. Soft-gate book then mints a fresh real `SIP-10001`. |

## After a clean reset

1. Soft-gate **Book my build → Continue** (signed in, non-prod).
2. You get a **real** `order_number` (e.g. `/customer/orders/SIP-10001`) — no `?demo=1`.
3. **My Jobs** lists that job.
4. When the list gets noisy, re-run Option A in the SQL script.
