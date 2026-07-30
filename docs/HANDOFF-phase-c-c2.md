# Handoff: ScrewItPro — Phase C next (C2 My Jobs API)

**Date:** 2026-07-30  
**Repo:** `/Users/sydneysanders/Desktop/Code_Projects/ScrewItPro`  
**Branch to start from:** `develop` @ `14d5196` (includes merged Phase C1)  
**Status:** C2 **implemented** on branch `feat/phase-c2-customer-jobs-api` (2026-07-30).  
**Next session goal:** Open PR / merge C2 when ready; then **C3** (book writes items) or **quote UI polish** — do not auto-start either unless user asks.

---

## First actions for the next agent

1. **Read these PRs for full context (required):**
   - **Phase C1 (just merged):** https://github.com/slimmsyd/ScrewItPro/pull/31 — order spine DB scaffold  
   - **Slice 2 (auth/paths/checkout):** https://github.com/slimmsyd/ScrewItPro/pull/30  
   - **Slice 1 (placeholders/security):** https://github.com/slimmsyd/ScrewItPro/pull/29  
   - **Portal shell earlier:** https://github.com/slimmsyd/ScrewItPro/pull/28  

2. **Read vault (source of truth):**
   - `vault/architecture.md` — **Phase C** section, ops→customer status map  
   - `vault/security.md` — order spine RLS matrix  
   - `CLAUDE.md` / `AGENTS.md` — self-doc rules  

3. **Read plan / diagram:**
   - Session plan: Phase C slices C0–C6 (customer-dashboard-first)  
   - `docs/diagrams/phase-c-order-spine.html` — architecture flow (open in browser)  
   - `docs/diagrams/PHASE_C1_APPLY.md` — how SQL was applied  

4. **Confirm DB:** User applied C1 migrations in Supabase SQL Editor successfully (verified columns/tables). Do not re-run blindly; use `IF NOT EXISTS` migrations if re-applying.

---

## What was accomplished this session

### Product / process
- Moved from vibe coding → **vault** standards + structured slices.
- **Slice 1** + **Slice 2** merged to `develop` (fail-closed booking, 40mi radius, `/customer/*`, admin `requireAdmin`, checkout `{orderId}` + draft API).
- Designed **Phase C** order persistence spine: backend/DB first, prove on **My Jobs / tracker / notifications** (customer portal only — no tech/driver yet).
- Drew architecture flowchart; saved under `docs/diagrams/`.
- Implemented **C0 + C1**, merged **PR #31**.

### C1 deliverables (in tree)
Migrations (in order):
- `my-app/supabase/migrations/20260730140000_phase_c1_ops_enums_and_settings.sql`
- `…41000_phase_c1_orders_extend.sql` — `order_number`, `lifecycle_status`, `payment_status`, contact_*
- `…42000_phase_c1_order_items.sql`
- `…43000_phase_c1_status_machine.sql` — transitions + events + trigger
- `…44000_phase_c1_item_classes_addresses_webhooks.sql`

App (prep for C2):
- `my-app/src/lib/orders/map-ops-to-customer.ts` + tests  
- Legacy interim `orders.status` kept for checkout compatibility  

### User environment
- SQL applied via **Supabase dashboard paste** (not CLI).  
- Early paste errors were incomplete clipboard (`i` / missing `select`); final verification checks passed.

---

## What is NOT done (backlog order)

| Slice | Work | Status |
|-------|------|--------|
| **C2** | `GET /api/customer/jobs`, `GET /api/customer/orders/[id]`; map DB → portal DTO; wire `MyJobsView` / `portal-jobs.ts` | **NEXT** |
| C3 | Draft/book writes `order_items` + real lifecycle on book | later |
| C4 | `transitionOrder` + tracker from events; dev transition endpoint | later |
| C5 | Stripe webhook uses `stripe_webhook_events` ledger | later |
| C6 | Cutover mocks; notifications from `customer_visible` events | later |

**Out of Phase C:** tech scan, driver routes, damage/RMA portals.

---

## C2 implementation sketch (for next agent)

- Branch off **`develop`**: e.g. `feat/phase-c2-customer-jobs-api`
- APIs under `my-app/src/app/api/customer/` (session via `createClient` + `getUser()`)
- Reuse `mapLifecycleToCustomer` for list/detail
- Prefer DTO compatible with existing `MockOrder` / My Jobs fields so UI changes stay thin
- Empty state when no rows; optional demo fixtures only behind explicit flag/`?demo=1`
- Auth: `/customer/*` already middleware-gated; API still 401 if no user
- Seed option: SQL insert one order for the signed-in test user to verify My Jobs before C3
- Update vault when C2 lands; open PR → `develop`
- Return to user after C2; do not auto-start C3

---

## Key product decisions already locked

- Service radius **40 mi** (`BUSINESS.geo`)  
- Deposit still **30%** in code (D2 open long-term)  
- Quote public; book needs sign-in (Decision #2)  
- Portal routes under **`/customer/*`**  
- Customer UI statuses: 7 states in `lib/orders/types.ts` / `status.ts`  
- Vault wins over chat memory  

---

## Skills suggested for next session

| Skill | When |
|-------|------|
| **using-superpowers** | Start of session |
| **vault / CLAUDE.md rules** | Always (check components, update as you go) |
| **tdd** (optional) | Mapper/API tests for C2 |
| **check-work** / verification | Before claiming C2 done |
| **handoff** | End of C2 if stopping again |

Do **not** need: full gsd pipeline unless user asks.

---

## Commands

```bash
cd /Users/sydneysanders/Desktop/Code_Projects/ScrewItPro
git checkout develop && git pull origin develop
# open PR context
gh pr view 31 --web   # merged C1 — read files/commits
gh pr view 30 --web   # Slice 2 auth/checkout
```

Open diagram:
```bash
open docs/diagrams/phase-c-order-spine.html
```

---

## User preference note

- Prefers **slice → stop → report**; merge to develop when asked.  
- Asked this handoff so the next session has context and **reads PRs**.  
- **Do not start C2 until they say go** in that session (they said “don’t start yet” after C1 merge; this handoff is for when they *are* ready for C2).
