# ScrewIt Pros — Full Platform Build Plan (End-to-End)

## Context

ScrewIt Pros is a hub-based furniture assembly + white-glove delivery business (Houston, 25mi radius): customer buys flat-pack furniture → ships to hub → staff receive/assemble/QC → delivered placed in-home. The repo today contains only the marketing site + waitlist (`my-app/`, Next.js 16 / React 19 / Supabase / Tailwind-4-with-inline-styles). The planning corpus (SITEMAP.md, USER-FLOWS.md, wireframes/, TASKRABBIT_REVERSE_ENGINEERING.md, DATA_ARCHITECTURE.md, Project.md) specs the full platform — 4 role portals, ~40 screens, 18 emails, a 14-state order lifecycle — but **none of the ops schema or portal code exists**. This plan reconciles the three conflicting doc threads into one canonical spec and sequences the entire build.

**Moat (from docs):** clone TaskRabbit's demand side (item-based flat all-in pricing, booking, tracking) but replace the marketplace supply side with managed hub operations — no liquidity problem, no geo-matching engine, quality owned end-to-end. Load-bearing schema insight: per-item `fulfillment_mode` (warehouse_assembly | hybrid | onsite_only) — some furniture can't survive transport assembled.

**User decisions (locked, resolve doc conflicts):**
1. **Chip AI chatbot IS in MVP** (overrides Decision #15) — wire `SupportChat.tssx` shell to DeepSeek; also still build static FAQ + /contact + admin inbox.
2. **Payments: deposit at booking (default 50%, settings-driven), balance charged off-session at delivery.** Deposit is a capture (not auth hold), so the Stripe 7-day auth expiry never conflicts with 7–10 day turnaround.
3. **Loyalty: schema stays dormant** — silent `apply_points()` on signup/order-delivered, no rewards UI.
4. **Vertical-slice milestones**, each independently testable.

**Canonical thread:** the design-phase docs (SITEMAP + USER-FLOWS + wireframes) win where docs conflict. The 14-state enum in USER-FLOWS.md §1 is the single source of truth for order status.

---

## Verified current-state facts the plan builds on

- **Auth mismatch (must fix first):** hand-rolled Google OAuth (`src/app/auth/google/route.ts`, `src/app/auth/callback/route.ts`, `src/lib/auth/google.ts`) sets an unsigned `sip_session` JSON cookie and creates **no Supabase user/profile**. Email/password signup (`src/app/api/auth/signup/route.ts`) correctly uses Supabase Auth. Nothing anywhere reads `profiles.role`.
- **Existing schema to keep** (`supabase/migrations/20260709140000_foundation_schema.sql`): profiles (role enum customer|admin|technician|driver), waitlist, newsletter, subscription_plans/subscriptions, point_ledger + `apply_points()` RPC, reward_items/redemptions; `handle_new_user` trigger auto-creates profiles from `auth.users` (reads role from `raw_user_meta_data`). RLS is SELECT-only self-scoped; no staff policies; no ops tables.
- **Ready-but-unused clients:** `src/lib/stripe.ts`, `resend.ts`, `deepseek.ts`, `google.ts` (loadGoogleMaps + geocodeAddress), `env.ts` lazy validation.
- **API convention to copy** (`src/app/api/waitlist/route.ts`): zod `.parse` in try/catch, `{ok, error: stable_machine_code}`, 201/200/400/409/503/500, typed error classes.
- **Frontend conventions:** inline styles + CSS vars from `globals.css` token system; custom i18n via `LocaleProvider` (en/es); UI primitives in `src/components/ui/`; all interactive components `"use client"`.
- No tests, no CI, empty `next.config.ts`.

---

## A) Canonical domain model — 13 new migrations

Deliver as `my-app/supabase/migrations/2026MMDDHHMMSS_*.sql`, in order:
`ops_enums_and_settings` → `addresses_and_catalog` → `orders_core` → `payments` → `inbound` → `assembly` → `delivery` → `exceptions` → `comms` → `auth_ops` → `rls_policies` → `storage_buckets` → `seeds`.

### Enums
```sql
order_status: draft, pending_quote, quote_sent, awaiting_arrival, boxes_received,
  in_assembly, assembly_completed, ready_for_delivery, out_for_delivery, delivered,
  on_hold_damage_reported, refused_pending_resolution, refunded_closed, cancelled_no_payment
payment_status: unpaid, deposit_paid, paid_in_full, balance_failed, partially_refunded, refunded
fulfillment_mode: warehouse_assembly, hybrid, onsite_only
order_item_status: awaiting, received, in_assembly, assembled, out_for_delivery,
  delivered, damaged, refund_pending, refunded, returned
scan_result: exact_match, multi_box_partial, last_of_n, no_match, ambiguous,
  already_received, damaged_at_intake
assembly_job_status: queued, assigned, in_progress, completed, blocked
route_status: planned, dispatched, completed
stop_status: pending, en_route, on_site, delivered, refused, returned_to_hub
refusal_reason: no_one_home, customer_refused, wont_fit, damage_at_delivery, wrong_item, other
damage_stage: intake, assembly, delivery      damage_status: open, awaiting_customer,
  resolved_refund, resolved_replacement, escalated, admin_override_proceed
resolution_choice: refund, wait_replacement, reschedule, talk_to_human
inquiry_source: contact_form, damage_escalation, refusal_escalation, chatbot
inquiry_status: open, replied, resolved
token_purpose: schedule_window, quote_approve, damage_resolve, refusal_resolve, balance_pay
invitation_status: pending, accepted, expired, revoked
payment_kind: deposit, balance, refund
payment_record_status: pending, requires_action, succeeded, failed, cancelled
media_kind: intake, damage, assembly_final, pod, pod_signature, refusal, return_intake, orphan_label
```

### Tables (key columns; full FK/index detail per Plan-agent design)

- **`app_settings`** — key/jsonb single-row config: `hub {address,lat,lng,radius_miles:25}`, `deposit_percent:50`, `rush_surcharge_cents:4000`, `quote_expiry_days:7`, `refusal_policy {free_reschedules:1, restocking_fee_cents}`, `damage_change_window_minutes:60`, `refusal_reverse_window_minutes:10`, `slot_capacity_default`, `sla_first_response_hours:24`, `timezone:'America/Chicago'`.
- **`addresses`** — user_id FK, line1/2, city/state/zip, lat/lng, access_notes, `in_service_area bool`, distance_from_hub_miles, is_default.
- **`item_classes`** (table not enum — admin-editable pricing) — code (small/medium/large/complex), base_price_cents, `default_fulfillment_mode`, `est_assembly_min`, active_from/to (price changes = new row; orders snapshot price). **`pricing_modifiers`** — rush etc., flat/percent, active period.
- **`orders`** — order_number (human `SIP-1042`, sequence-backed), customer_id, `status order_status`, `payment_status` (orthogonal to status), delivery_address_id, is_rush, snapshot money columns (subtotal/modifiers/total/deposit/balance/refunded_cents), stripe_customer_id + stripe_payment_method_id (saved card for balance), quote_expires_at, delivery_slot_id, window_preference, notes, free_reschedules_used, placed/delivered/closed_at. Partial index on `(status)` for cron scans.
- **`order_items`** — name, retailer, retailer_url, item_class_id, `fulfillment_mode`, `requires_quote` (unusual/oversized toggle), quantity, unit_price_cents (null while pending_quote), `status order_item_status`, `expected_box_count` (multi-box items), est_assembly_min.
- **`order_status_events`** (audit = customer timeline) — from/to status, actor_id (null = system), actor_role, note, `customer_visible`, metadata.
- **`order_status_transitions`** — `(from_status, to_status)` PK, seeded exactly from USER-FLOWS.md §1 Mermaid plus three justified additions: `draft→cancelled_no_payment` (abandonment), `out_for_delivery→on_hold_damage_reported` (damage at delivery), `refused_pending_resolution→out_for_delivery` (driver 10-min undo).
- **`order_quotes`** (Decision #17, versioned) — order_id, version, line_items jsonb, total_cents, sent/expires/approved/declined_at.
- **`payments`** — kind (deposit/balance/refund), status, amount_cents, stripe ids, failure code/message, attempt, refund_reason + related damage/refusal FKs. **`stripe_webhook_events`** — event-id PK idempotency ledger.
- **`expected_inbounds`** — order_id, order_item_id, carrier, tracking_number + `tracking_normalized` (generated; NON-unique — ambiguous duplicates are a real state), expected_at, status. **`box_receipts`** — every scan event with `scan_result` (all 7 states), box_seq/box_total, damage_flag. **`orphan_packages`** — scanned_tracking, label_ocr_text, shelf_location, resolved_order_id.
- **`assembly_jobs`** — one per order_item, order_item_id UNIQUE, status, assigned_to, est vs `actual_minutes`, qc_template_id, blocked_reason. **`qc_templates`** (checklist jsonb, per item_class) + **`qc_checks`** (checklist_state, all_passed).
- **`media_assets`** (one unified photo/signature table) — `kind media_kind`, nullable FKs to order/item/box_receipt/assembly_job/route_stop/damage_report/refusal, storage_path, `client_uuid UNIQUE` (offline-queue idempotency key), uploaded_by.
- **`delivery_slot_templates`** (weekday × time-block × capacity) + **`delivery_slots`** (concrete: slot_date, start/end time, capacity, `booked_count CHECK ≤ capacity`, unique (slot_date, start_time)). **`routes`** (slot-as-route, Decision #10: delivery_slot_id UNIQUE, driver_id, status) + **`route_stops`** (route_id, order_id, seq, status, pod_signature_asset_id, refusal_id).
- **`damage_reports`** — order_id, order_item_id (nullable = whole order; item-level granularity), stage, severity, status, customer_choice, choice_made_at, `choice_locked_at` (= +1h window). **`refusals`** — route_stop_id, reason, driver_note, `reversed_at`, `email_scheduled_for` (= +10 min), customer_choice, restocking_fee_cents. **`retailer_claims`** (RMA lifecycle) + **`returned_items`** (shelf_location, disposition).
- **`inquiries`** (inquiry_number serial, source, status, first_response_due_at) + **`inquiry_messages`** (direction, body, email_log_id). **`faq_entries`** (question/answer/category/locale, is_published, `chip_context bool`).
- **`chat_conversations`** (nullable user_id — anonymous allowed, session_key, escalated_inquiry_id) + **`chat_messages`** (role, content, tokens_in/out, latency_ms).
- **`team_invitations`** — email, role (CHECK ≠ customer), `token_hash` UNIQUE, expires_at (+7d), status, accepted_user_id.
- **`deep_link_tokens`** — `token_hash` UNIQUE (sha256 of 32-byte random; raw only in email), purpose, order_id, damage/refusal FK, expires_at, used_at.
- **`email_log`** — template code (18 stable codes), to_email, order_id/inquiry_id, resend_id, status, payload. Doubles as reminder idempotency guard.
- **`scheduled_jobs`** (deferred-action spine) — kind (`send_refusal_email`, `execute_damage_refund`, `expire_quote`, …), run_after, payload, status, attempts. Index `(status, run_after)`.
- **`profiles` ALTER** — add suspended_at, can_claim_jobs, can_claim_deliveries, preferred_locale, stripe_customer_id.

### Payment model (deposit + balance)
- **Booking:** Stripe Checkout `mode:'payment'`, amount = deposit (default 50%), `payment_intent_data.setup_future_usage:'off_session'`. Webhook `checkout.session.completed` → payments row, save payment method, `payment_status='deposit_paid'`, `draft→awaiting_arrival`, email #1 (copy shows deposit paid + balance due on delivery).
- **Pending quote:** no charge at submission; deposit Checkout on quote approval via deep link.
- **Balance:** on driver POD → order `delivered`, then off-session PaymentIntent (`off_session:true, confirm:true`) for balance. Failure → `payment_status='balance_failed'` (order STAYS `delivered` — fulfillment truth ≠ money truth), "complete your payment" email with `balance_pay` deep link → hosted Checkout; daily retry ×3 via cron; admin Today attention row.
- **Refunds:** always against succeeded payments, recorded as `payments(kind='refund')`; item-level damage refund = item price from deposit (capped), recompute balance; whole-order → full deposit refund + `refunded_closed`; refusal refund = deposit − restocking fee (waived for `no_one_home`).

### State machine enforcement — both layers
1. **DB trigger (belt):** `before update of status on orders` validates against `order_status_transitions`, auto-inserts `order_status_events` (actor via `set_config('app.actor_id')` GUC). Catches all writers including scripts.
2. **Service layer (brains):** `src/server/orders/transitions.ts` — `transitionOrder(orderId, to, ctx)` is the ONLY app path that updates status; dispatches side effects (emails, token minting, scheduled_jobs, apply_points on delivered). Vitest test asserts TS map ↔ SQL seed parity.

### Storage buckets (all private, server-signed URLs)
- `order-media` (`{order_id}/intake|assembly|damage|pod|refusal|returns/…`) — staff write via server-minted `createSignedUploadUrl`; customers read only through server-signed URLs (no direct storage RLS for customers).
- `signatures` (`{order_id}/{stop_id}.png`), `orphans`, `avatars` (owner-write, public read).
- Emails embed photos via 90-day signed URLs generated at send time.

---

## B) RLS + authz

Role claim via **Supabase Custom Access Token Hook** (`app_metadata.sip_role`, `sip_status`) so policies use `auth_role()` helpers — never join profiles (no recursion, no per-query cost). Policy matrix:
- **customer:** own orders/items/events(customer_visible)/quotes/payments/damage/refusals/media via `customer_id = auth.uid()`; own addresses CRUD; own inquiries; read active catalog/slots/published FAQ.
- **technician:** rows reachable via `assembly_jobs.assigned_to = auth.uid()`; may UPDATE own job status/QC only while assigned.
- **driver:** rows via `routes.driver_id = auth.uid()`; may UPDATE stop status/POD on own route.
- **admin:** full read; writes for assignment/composition.
- **service-role only, no exceptions:** `deep_link_tokens`, `stripe_webhook_events`, `scheduled_jobs`, `email_log`, all order status/money mutations, `profiles.role` changes.

**Deep-link bypass (secure):** the 4 customer deep-link pages + `balance_pay` are server components: verify `sha256(token)` server-side (purpose + order + expiry + `used_at is null`), render via service client scoped to that order; action POST re-verifies and marks used atomically (`update … where used_at is null returning id`). Anon browser client never touches these tables. Damage-resolve token stays usable inside the 1-hour change window.

---

## C) Auth unification (M1, blocking)

1. Configure Google provider in Supabase dashboard (reuse existing GOOGLE_CLIENT_ID/SECRET).
2. Replace `/auth/google` with `supabase.auth.signInWithOAuth({provider:'google'})`; rewrite `src/app/auth/callback/route.ts` to `exchangeCodeForSession(code)` + role-routed redirect. Existing `handle_new_user` trigger provisions the profile (verify customer default when metadata role absent).
3. **Delete** `src/lib/auth/google.ts` + `src/lib/auth/oauth.ts` custom flow; rewrite `/api/auth/session` to read the Supabase session; middleware expires lingering `sip_session` cookies. No user migration needed (Google users never became Supabase users; waitlist rows link by email on first real login via existing converted_user_id mechanism).
4. **Middleware guards** in `src/lib/supabase/middleware.ts` `updateSession()`: `supabase.auth.getClaims()` (local JWT verify, no DB call) → `sip_role` → prefix guard (`/customer|/admin|/tech|/driver`): unauthenticated → `/auth/sign-in?return_to=`, wrong role → `/403`, suspended → `/403?reason=suspended`. Deep-link routes with `?token=`, public, and api routes allow-listed. Portal layouts (RSC) re-assert role from `profiles` as the authoritative gate; suspension of staff also calls `auth.admin.signOut(userId,'global')`.
5. **Invite acceptance** `/auth/accept-invite?token=`: verify hash+expiry → form → `admin.createUser` with role metadata → mark accepted → sign in → role redirect. **Forgot/reset:** standard `resetPasswordForEmail` + `updateUser`.

---

## D) Application architecture

**Route groups:** `(public)` (existing pages + `/pricing`, `/faq`, `/contact`), `(auth)/auth/*`, `(customer)/customer/*`, `(admin)/admin/*` (Today, orders, inbound+scan+orphans+returns, assembly kanban, schedule, holds, inbox, team, pricing, faq, settings), `(tech)/tech/*`, `(driver)/driver/*`, `/403` — per SITEMAP.md.

**Data access:** RSC pages fetch via modular service layer `src/server/{orders,payments,inbound,assembly,delivery,exceptions,comms,auth,email}/`. **Mutations = API route handlers** (NOT server actions — matches existing convention, token/cron-friendly), thin: parse → authz → service → `{ok,…}` response. Client islands only where interactive: booking wizard, kanban (dnd-kit), scan camera (`BarcodeDetector` + manual tab fallback), schedule board, uploaders, signature canvas, chat, realtime subscribers.

**Realtime:** Supabase `postgres_changes` (RLS-respecting) on `orders`, `order_status_events`, `assembly_jobs`, `route_stops` — customer order page live timeline, admin Today re-bucketing, tech reassignment toast, driver route updates.

**Photos + offline:** client → `POST /api/media/sign-upload` → direct PUT to Storage → `POST /api/media/confirm` writes `media_assets` (`client_uuid` idempotency). `src/lib/offline-queue.ts` — IndexedDB queue of uploads + status mutations for tech/driver, optimistic UI, flush on `online`. No PWA in MVP.

**Email:** `src/server/email/templates/*.ts` — 18 typed template functions (plain-HTML 560px single-table per wireframes; string templates, not React Email) + `send.ts` wrapping existing `src/lib/resend.ts` with `email_log` idempotency. **Scheduling: Supabase `pg_cron` every minute + `pg_net` POST → `/api/cron/dispatch?secret=`** (Vercel Cron minutely needs Pro). Dispatch processes due `scheduled_jobs` + query-driven reminders (window-pick 72h, damage/refusal 48h, quote 72h — computed from state + email_log absence) + balance retries + quote expiry + draft cleanup.

**Chip chatbot:** rework `src/components/home/SupportChat.tsx` (strip fake PRICES/delays, keep shell + ThinkingLoader). `POST /api/chat` streams SSE from DeepSeek (`src/lib/deepseek.ts`). System prompt assembled server-side: published `faq_entries where chip_context` (whole corpus injected — <50 entries, no embeddings in MVP) + live `item_classes` price table + `app_settings` service facts. Guardrails: never invent prices, escalate to `/contact` / "Talk to a human" (creates `inquiries(source='chatbot')`), 20-turn cap, input cap, per-session rate limit. Log every turn to `chat_messages` with tokens/latency; disclosure line in UI (third-party LLM).

**i18n/timezone:** portals ship EN-only (strings still in the `en` dictionary namespaced for later ES fill-in; language toggle hidden in portals; public surface keeps EN/ES). All timestamps `timestamptz`; `HUB_TZ='America/Chicago'` in `src/lib/time.ts` with date-fns-tz; slots stored as slot_date + local times in hub TZ.

---

## E) Edge cases → mechanisms (all 24)

| Case | Mechanism |
|---|---|
| 7 scan states | `matchScan(tracking)` service on `tracking_normalized`: exact / ambiguous (picker) / multi_box_partial (box N of M) / last_of_n (→ all items received, order → boxes_received, email #4) / no_match (→ orphan) / already_received / damaged_at_intake (→ damage report + on_hold) |
| Orphan boxes | `orphan_packages` + label photo + shelf tag; "resolve to order" creates synthetic expected_inbound + receipt |
| Multi-box items | `expected_box_count`; boxes_received fires only when every expected_inbound received |
| Per-item damage | `damage_reports.order_item_id`; refund that item's share from deposit; survivors proceed; whole order → refunded_closed |
| 1-hr damage change window | Execution deferred via `scheduled_jobs(+1h)`; choice changeable (customer via same token, or admin override) until locked → cancel + re-enqueue |
| Refusal 10-min undo | `email_scheduled_for=+10min` via scheduled_jobs; driver Undo sets `reversed_at`, cancels job, stop → on_site, order → out_for_delivery |
| Quote 7-day expiry | `quote_expires_at` + cron → cancelled_no_payment + email #16; reminder #15 @72h |
| Balance charge fails | Order stays delivered; `balance_failed`; balance_pay deep link → hosted Checkout; daily ×3 retry; admin attention row |
| Auth-hold vs turnaround | Non-issue: deposit is captured, balance is a fresh charge |
| Offline tech/driver | IndexedDB queue + client_uuid idempotency + optimistic UI |
| Suspended mid-order | Middleware+layout → 403; staff suspension global-signs-out; their jobs surface as attention |
| Reassign mid-job | Realtime toast to old tech; RLS `assigned_to=auth.uid()` hard-blocks stale writes |
| Slot capacity race | `book_delivery_slot()` SECURITY DEFINER RPC with `select … for update` + CHECK backstop; reschedule decrements old slot |
| Out of service area | Geocode (existing `geocodeAddress`) + haversine vs hub → block + waitlist capture |
| Token reuse/expiry | Hash-stored, atomic single-use; purpose-scoped expiries (quote 7d, schedule 30d, damage/refusal 14d, balance 30d); friendly fallback page |
| Forwarded deep link | Accepted risk — bearer token scoped to one order+purpose; money actions still go through Stripe Checkout |
| Draft abandonment | 14-day cron cancel, no email |
| Damage at delivery | Refusal reason `damage_at_delivery` re-routes → damage_report(stage=delivery), email #9 not #10, order → on_hold |
| Reschedule <24h / after dispatch | Slot RPC rejects <24h → contact path; `free_reschedules_used` + settings enforce first-free |
| Admin override of damage choice | Same 1h window mechanic; `admin_override_proceed` → on_hold → in_assembly |
| Duplicate tracking across orders | Non-unique index + ambiguous scan state |
| Stripe webhook replay | `stripe_webhook_events` id-PK ledger + signature verify + idempotent handlers |
| onsite_only items | Force `requires_quote=true` (admin decides feasibility); hybrid items flag "on-site finish" on route stop card |
| Timezone/day boundaries | All "today" queries + cron rollovers in HUB_TZ |

---

## F) Milestones (vertical slices; emails ship with their slice)

### M1 — Foundation: schema, auth, guards (~15%)
All 13 migrations land now (schema complete up front; later slices add only code). Google→Supabase unification + kill sip_session; access-token hook; middleware guards + `/403`; portal route-group shells with nav chrome; all `/auth/*` pages incl. accept-invite, forgot/reset; `/admin/team` (roster/invite/suspend) + emails #17/#18; seeds. Test infra: Vitest + transition-parity test; pgTAP RLS tests via `supabase test db`; GitHub Actions CI (typecheck, lint, vitest, db tests).
**Accept:** invite→accept→tech lands `/tech/jobs`; Google + password both yield Supabase sessions with role routing; wrong prefix → 403; suspended locked out; sip_session gone.

### M2 — Customer booking + payment (~25%)
`/pricing` calculator; soft-wall signup modal with state preserved (Decision #4); 5-step `/customer/book` wizard (geocode validation, tracking → expected_inbounds); Stripe deposit Checkout + `/api/payments/webhook`; pending-quote path + admin quote-send (minimal form on admin order detail) + quote-approve deep link; `/customer/orders` + `[id]` (live timeline); `/customer/profile`; `/contact` + inquiries. Emails #1 #2 #3 #11 #16; pg_cron dispatch endpoint. Admin raw status-transition dropdown = ops escape hatch + M2 simulation tool. Silent signup points.
**Accept:** customer books and pays 50% deposit end-to-end in Stripe test mode; card saved off-session; flagged item → quote → approve → deposit; 7-day expiry auto-cancels; timeline live-updates.

### M3 — Admin ops (~30%, largest)
Today dashboard (7 lifecycle queues + metrics + aging ⚠ + realtime); orders table + full order detail (8 panels); inbound queue + camera scan (7 confirm states) + orphans + returns; assembly kanban (dnd-kit assignment); schedule board (slot grid + capacity bars + Google Map pins via existing loadGoogleMaps) + slot generation from templates; holds; unified inbox with reply templates; pricing admin; FAQ admin; settings. Email #4.
**Accept:** admin drives an entire order lifecycle from their screens (all 7 scan states exercisable); every action in audit trail; inbox reply emails customer.

### M4 — Tech + driver portals (~20%)
`/tech/*` (jobs, job detail with start/QC-checklist/final-photo gating, damage form) + `/driver/*` (route by slot, stop detail with Maps deep link + tap-to-call, POD ≥2 photos + signature canvas, refusal + 10-min undo countdown); offline queue; **balance off-session charge on Delivered** + failure path + balance_pay deep link; customer schedule-picker + damage/refusal resolve pages (need real upstream events); returns tie-in. Emails #5–#10 + delayed refusal send. `apply_points('order_earn')` on delivered.
**Accept:** full device dress rehearsal: book → scan → assemble (QC+photos) → customer picks window from email → driver POD → balance auto-charges → receipt; refusal undo works; damage 1h window works; airplane-mode upload recovers.

### M5 — Chip, reminders, polish (~10%)
Chip on DeepSeek (streaming, FAQ+pricing context, logging, inbox escalation); reminder suite (#12–#15, balance retries, draft cleanup, invite-expired cron); `/faq` public page; admin chat-log tab; en-dictionary sweep; empty/error states; one Playwright smoke (book→deposit); `next.config.ts` image domains for storage.
**Accept:** Chip quotes only catalog prices, logs, escalates; every reminder fires exactly once (email_log idempotency proven in tests).

**Test strategy:** Vitest for pure logic (pricing calc, refund math, transition map, token hashing, scan matcher, slot math); pgTAP for RLS + transition trigger; one Playwright money-path smoke; all in CI.

---

## G) Risks / business inputs (flag, don't block)

1. Real pricing ($52/$99/$169/$279 + $40 rush are placeholders — admin-editable day one).
2. Deposit %, restocking fee, reschedule fee — settings-driven, defaults chosen.
3. Refund/refusal policy legalese + cargo/GL insurance before first custody of goods.
4. Off-session decline rates — recovery path designed; consider raising deposit % if painful.
5. `BarcodeDetector` absent on iOS Safari — manual tab is guaranteed fallback; budget zxing-wasm polyfill if hub uses iPads.
6. pg_cron/pg_net must be enabled on the Supabase plan (fallback: Vercel Cron Pro).
7. Custom Access Token Hook needs dashboard config (per-request-fetch fallback path exists).
8. Resend domain SPF/DKIM before M2 acceptance.
9. Styling: default = follow existing inline-style + CSS-var convention; optional pre-M3 call to adopt Tailwind utilities for new portal surfaces only.
10. Missing architecture brief (`examien-the-contetfiles…md`): Decisions #1/#18 unrecoverable — this plan document now supersedes it as the canonical brief.

---

## Key reuse targets

- `supabase/migrations/20260709140000_foundation_schema.sql` — interlock with existing enums/triggers/`apply_points()`
- `src/lib/supabase/middleware.ts` (`updateSession`) — role-guard hook point
- `src/app/api/waitlist/route.ts` — API convention template
- `src/lib/{stripe,resend,deepseek,google,env}.ts` — existing service clients, wire don't rewrite
- `src/components/home/SupportChat.tsx` — Chip shell; `src/components/ui/*` — primitives; `globals.css` — token system
- `src/app/auth/{google,callback}/route.ts` + `src/lib/auth/{google,oauth}.ts` — replace/delete in M1

## Verification (per milestone)

Run `supabase start` + `supabase db reset` locally; `npm run dev`; execute each milestone's acceptance script manually + CI suite. M2+: Stripe test mode with CLI webhook forwarding (`stripe listen --forward-to localhost:3000/api/payments/webhook`). M4: real-device test for camera/signature/offline. Final: full dress rehearsal of the golden path + all three exception paths (damage, refusal, quote-expiry).
