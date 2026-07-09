# Reverse-Engineering TaskRabbit for ScrewItPro

**The blueprint: how TaskRabbit works (product, process, architecture), what ScrewItPro has today, and a phased plan to build a TaskRabbit-class assembly platform — adapted to our model: items ship to OUR warehouse, WE assemble, WE deliver and place in the customer's home.**

---

## 1. Executive Summary

TaskRabbit is a two-sided marketplace: clients post tasks, independent "Taskers" set their own hourly rates, and the platform matches them by category, location, availability, and reviews. Its killer distribution move was the IKEA integration — assembly sold *inside* the retailer's checkout, priced flat per item, with the Tasker auto-assigned. That integration lifted assembly attach rate +50%, cut returns −40%, and grew average order value ~5x.

**ScrewItPro is NOT a marketplace clone.** Our model inverts the fulfillment: instead of a stranger assembling in your living room, items are delivered to our warehouse, assembled by our crew, then white-glove delivered and placed in your home. That means we clone TaskRabbit's **demand side** (booking flow, item-based flat pricing, scheduling, chat, payments, reviews) but replace its **supply side** (open marketplace of Taskers) with **managed operations** (warehouse assembly queue + delivery routing). We are operationally closer to "IKEA flat-rate assembly + white-glove last-mile 3PL" than to the open TaskRabbit marketplace — which is simpler to build (no marketplace liquidity problem) and more defensible (service quality is ours to control).

---

## 2. How TaskRabbit Works — Product Anatomy

### 2.1 Client-side flow (the booking funnel)

1. **Category selection** — Homepage or search: 50+ categories (Furniture Assembly, Mounting, Moving, Cleaning, Handyman…). Each category is an SEO landing page (`taskrabbit.com/services/handyman/assemble-furniture`).
2. **Task details form** — Address (determines the market/metro), task size (S/M/L or item list), free-text description, optional photos.
3. **"See Taskers & Prices"** — The core conversion screen. A ranked list of available Taskers, each card showing: photo, hourly rate, review score + count *in this category*, completed-task count, a short pitch, and "Elite" badges. Filters: date, time window, price.
4. **Select + schedule** — Pick a Tasker, pick a day/time (up to 14 days out; IKEA flow allows 90 days). A one-hour deposit is authorized at booking and applied to the final bill.
5. **Confirm & chat** — Booking opens an in-app chat thread. The Tasker must confirm they have the skills/tools/availability. Details (parking, supplies, constraints) get worked out in chat.
6. **Task day** — Tasker arrives, works, marks complete; hourly tasks are billed by actual time, flat-rate tasks (IKEA) are fixed.
7. **Invoice + payment** — Card on file charged automatically: Tasker's rate/flat price + 15% service fee + 7.5% "Trust & Support" fee. Tips optional.
8. **Review** — Two-sided ratings; reviews are per-category, which powers ranking.

### 2.2 Tasker-side flow (supply)

- **Onboarding**: apply → identity verification (SSN, legal name, DOB) → background check → one-time **$25 registration fee** → orientation → activated in a metro.
- **Setup**: choose categories, set an **hourly rate per category**, define a **work area** (geofence), set a **weekly availability calendar**, opt in/out of same-day jobs.
- **Job flow**: get booking requests → confirm/decline → chat → complete → invoice → paid by direct deposit in 3–5 days. Taskers keep 100% of their rate plus tips (fees are charged to the client on top).
- **Reputation loop**: positive reviews + completion rate + responsiveness → higher ranking → more bookings. "Elite Tasker" status for top performers.

### 2.3 The IKEA integration (the piece to study hardest)

This is the closest analog to ScrewItPro's business, because it removes marketplace choice and replaces hourly pricing with a **per-item flat-rate catalog**:

- **Embedded checkout**: Assembly is offered *inside* IKEA's checkout (web, app, and in-store). Customer enters a zip → availability check → adds assembly to the cart → pays IKEA once for furniture + assembly.
- **Task-based (flat) pricing**: Every IKEA SKU has a predetermined assembly price based on **item type + assembly complexity** (e.g., minimum ~$52 per job; each item priced individually; a Tasker minimum guarantee of ~$36.92 per job). No hourly billing, no on-site upsells — the price is known before anyone shows up.
- **Auto-match, not browse**: The customer doesn't pick a Tasker. TaskRabbit's system assigns one by location, skill (IKEA-assembly qualified), and availability. Customer gets a welcome email → activates a TaskRabbit account → chats with the assigned Tasker.
- **Scheduling**: next-day to 90 days out.
- **Trust wrapper**: background-checked assemblers, "TaskProtect" damage coverage up to $1,000, wall-anchoring included per IKEA instructions.
- **Measured results**: +50% share of shoppers attaching assembly after checkout embedding, −40% returns, ~5x AOV lift.

**Lesson for ScrewItPro:** the winning UX is *SKU-based instant quoting + auto-assignment + scheduled window*, not "browse contractors." That is exactly the shape of our warehouse model.

### 2.4 Trust & safety mechanics

- Background + identity checks before activation (funded by the $25 registration fee).
- TaskProtect: up to $1,000 damage coverage, structured claims process.
- Two-sided reviews, category-scoped.
- All chat and payment kept on-platform (disintermediation resistance).
- Cancellation policy with fees inside a cutoff window; reschedule flows built in.

### 2.5 Revenue model

| Stream | Mechanics |
|---|---|
| Service fee | 15% added on top of the Tasker's price, paid by client |
| Trust & Support fee | +7.5% on top, paid by client |
| Registration fee | $25 one-time per Tasker (covers background check) |
| Partnerships | IKEA revenue share / embedded distribution |

---

## 3. TaskRabbit's Technical Architecture

### 3.1 Stack (from their engineering blog "TechRabbit" and public sources)

- **Backend**: Ruby on Rails (primary), some Node.js and Sinatra services.
- **Data**: MySQL (Percona XtraDB Cluster) as system of record; **Elasticsearch** for search/matching (Tasker discovery is fundamentally a geo + availability + skill search problem); Couchbase for caching; Redis + Resque for background jobs.
- **Clients**: native iOS + Android apps (separate Client and Tasker apps), JavaScript web frontend.

### 3.2 Architectural evolution (three eras — instructive for us)

1. **Monolith** (2008–2013): one Rails app, 100+ models/controllers. The original product was auction-style: clients posted tasks, Taskers *bid*. In 2014 they killed bidding and rebuilt around direct booking of rate-setting Taskers — a full product pivot.
2. **SOA** (2013–2016): several apps with their own logic calling the main app over API. They found the operational overhead heavy for their team size.
3. **Modular monolith via Rails Engines** (2017+): one deployable app composed of engines — **one frontend engine owning all UI**, every other engine exposing **JSON-only API endpoints** (jbuilder), with shared mixins. Deliberate middle ground: monolith deployability, service-style module boundaries.

**Lesson for ScrewItPro:** don't build microservices. Build a modular monolith with hard module boundaries (booking, pricing, ops, logistics, messaging, payments) inside one deployable app. TaskRabbit converged there at far bigger scale than we'll have for years.

### 3.3 Inferred core domain model

From their public writing and product behavior, the domain decomposes roughly as:

- **Identity**: `User`, `TaskerProfile` (rates per category, work area polygon, availability calendar, badges), background-check records.
- **Catalog**: `Category` → `Skill`; for IKEA: an **item catalog** with per-SKU assembly complexity and flat price.
- **Booking**: `Task` (the client's request: category, address, details, photos) → `Appointment` (scheduled slot) → assignment record linking a Tasker.
- **Fulfillment lifecycle**: a state machine roughly `draft → posted → matched → confirmed → scheduled → in_progress → completed → invoiced → paid → reviewed`, with branches for `cancelled`, `expired`, `reschedule`, `disputed`.
- **Money**: `Invoice` (line items: labor/flat items, fees, tips, promos), `Payment` (card auth at booking = the 1-hour deposit; capture on completion), `Payout` (Tasker direct deposit, 3–5 day settlement).
- **Comms**: `Thread`/`Message` per booking, push + email notification fan-out.
- **Reputation**: `Review` (two-sided, category-scoped), completion metrics feeding ranking.
- **Matching**: an Elasticsearch-backed query — filter by (geo ∩ category ∩ availability window ∩ active status), rank by (review score, completion rate, responsiveness, recency, price fit). "Instant Match" = same query with auto-assign top result.

---

## 4. ScrewItPro Today — Current State

**Stack:** Next.js 16 (App Router) + React 19 + TypeScript in `my-app/`, Tailwind v4 declared (styling mostly inline + CSS vars), Framer Motion, custom en/es i18n. Deployed-shape: Vercel.

**What's real today:**
- Marketing homepage (`/`) with 18 sections, Houston service-area map (Google Maps JS, 55 km coverage circle from downtown hub), FAQ, audiences marquee.
- `/join` waitlist page — but the email form is **simulated** (`setTimeout`, no DB write, random queue position).
- **Google OAuth is fully implemented** (custom authorization-code flow, `sip_session` httpOnly cookie, CSRF state cookie) — `auth/google` + `auth/callback` + `/api/auth/session`.
- **Chip chat** (`SupportChat.tsx`, 610 lines) — a guided quote flow (location → item → pickup → timeline) that is **entirely client-side simulated**, with hardcoded `PRICES` (Bed $129, Desk $69, Wardrobe $129, Office setup $99) and a `LOCATION_TIER` map (Houston live; Austin/Dallas/San Antonio/Atlanta expanding). Code comments explicitly mark the fake delays as "stand-in for future POST /api/chat or pricing fetch."
- `/api/health` reports integration readiness.

**Wired but unused (free runway):** Supabase (3 clients, zero queries, no schema), Stripe (server + browser clients, no checkout/webhooks), Resend (`sendEmail()` never called), DeepSeek via OpenAI SDK (for Chip later), Zod (unused), GA4 (env only).

**Already designed but unbuilt:** `my-app/wireframes/` contains markdown wireframes for the **admin dashboard, customer portal, tech/driver portals, and email templates** — the ops surface this report specifies. `SITE_MODE` in `src/lib/site.ts` already supports `"quote"` (hardcoded to `"waitlist"`).

**Takeaway:** the demand-side shell exists and the vendor plumbing is pre-wired. Nothing persists, nothing charges, nothing quotes for real. The build plan below turns each simulation into the real thing in order of revenue-criticality, and the hardcoded `PRICES`/`LOCATION_TIER` maps in Chip are the embryo of the pricing engine and market model.

---

## 5. Adapting the Model: Marketplace → Warehouse ("Hub-and-Spoke Assembly")

### 5.1 What changes vs TaskRabbit

| Dimension | TaskRabbit | ScrewItPro |
|---|---|---|
| Supply | Open marketplace of independent Taskers | Our W2/1099 crew: assemblers (warehouse) + delivery teams |
| Where work happens | Customer's home | Our warehouse, then last-mile delivery + placement |
| Pricing | Tasker-set hourly OR per-item flat (IKEA) | **Per-item flat rate + delivery fee** (clone the IKEA model, skip hourly entirely) |
| Matching | Rank/browse Taskers | **No browse.** Customer picks a delivery window; we schedule internally |
| Trust problem | Stranger in your home | Minimal — customer never hosts the assembly |
| New complexity | — | Inbound receiving, warehouse queue, QC, routing, vehicle capacity, damage-in-transit liability |

### 5.2 The operational flow to build

```
Customer buys furniture (IKEA/Wayfair/Amazon/anywhere)
        │
        ├── Option A: ships/addressed to OUR warehouse (customer uses our receiving address)
        ├── Option B: we pick up from store/curb ("procurement pickup" fee)
        │
        ▼
RECEIVING  → scan/photo intake, match to order, damage inspection
        ▼
ASSEMBLY QUEUE → job card per item (SKU, est. minutes, instructions), assembler assigned
        ▼
QC + STAGING → photo proof, blanket-wrap, stage by delivery route
        ▼
DELIVERY → routed van run, in-home placement, packaging haul-away, photo proof-of-delivery
        ▼
INVOICE CAPTURE → review request
```

### 5.3 ⚠️ The physical constraint nobody should skip

**Some furniture cannot be transported assembled.** A PAX wardrobe or large bookcase won't fit through a van door or a hallway once built, and particleboard racks/loosens when moved assembled. The item catalog therefore needs a per-SKU **fulfillment mode**:

- `WAREHOUSE_ASSEMBLY` — small/medium rigid items (chairs, small dressers, nightstands, desks): assemble at hub, deliver whole.
- `HYBRID` — assemble sub-modules at hub, final join/anchor on site (beds, wardrobes, sectionals).
- `ONSITE_ONLY` — must be built in place (PAX systems, wall units, anything anchored).

This single enum drives pricing, van capacity math, and crew scheduling. It's the most important schema decision in the whole system.

### 5.4 Liability & policy checklist (before scale)

- Cargo + general liability insurance covering goods in our custody (we hold the item; TaskRabbit never does — this is our biggest new risk).
- Intake damage documentation (photos at receiving) to separate carrier damage from our damage.
- Our own "Protect"-style guarantee (match TaskProtect's $1,000 framing).
- Background checks for delivery crew (they still enter homes).
- Clear SLA: e.g., "assembled and delivered within X days of receiving."

---

## 6. Target Architecture for ScrewItPro

**Principle (stolen from TaskRabbit's third era): one deployable app, hard module boundaries.** Keep everything in the existing Next.js app; organize server code as modules that only talk through typed service interfaces — the Next.js equivalent of their Rails-engines setup. Split nothing into services until a module demonstrably needs it.

```
Next.js (Vercel) ── one deployable
│
├── web (public)          /            marketing (exists)
│                         /quote       SKU picker → instant price (Chip + page)
│                         /book        schedule + address + Stripe checkout
│                         /account     customer portal: orders, chat, tracking (wireframe exists)
│
├── ops (staff-only)      /admin       orders board, receiving, assembly queue, QC,
│                                      routing, catalog & pricing editor (wireframe exists)
│                         /crew        driver/assembler PWA: job cards, photos, POD (wireframe exists)
│
├── api modules (src/server/*)
│   ├── identity/         users, roles (customer|admin|assembler|driver), sessions (extend existing OAuth)
│   ├── catalog/          items, complexity tiers, fulfillment modes, retailer SKU maps
│   ├── pricing/          quote calculation (pure functions + catalog lookups)
│   ├── booking/          orders, order_items, scheduling windows, cancellation/reschedule
│   ├── warehouse/        inbound shipments, receiving, assembly jobs, QC
│   ├── logistics/        routes, stops, capacity, proof-of-delivery
│   ├── billing/          Stripe: deposit auth → capture on delivery; invoices; refunds
│   ├── messaging/        order-scoped threads; email (Resend) + SMS (Twilio) fan-out
│   └── reviews/          post-delivery ratings
│
├── data      Supabase Postgres (schema below) + Supabase Storage (intake/QC/POD photos)
│             RLS ON for customer-facing tables; service-role only inside server modules
├── jobs      Vercel Cron / Supabase cron for: quote expiry, reminder emails/SMS,
│             payment capture retries, review requests, route-day rollover
├── payments  Stripe PaymentIntents (manual capture) + webhooks /api/webhooks/stripe
├── ai        DeepSeek behind POST /api/chat — Chip becomes a thin NLU layer that maps
│             free text → catalog items → SAME pricing engine (never lets the LLM invent prices)
└── maps      existing Google Maps + Distance Matrix (server key) for zone/route math
```

**Why not clone TaskRabbit's Elasticsearch matching layer:** their hardest engineering problem — ranked geo/availability search over 200k independent Taskers — *does not exist* in our model. Scheduling ~a-dozen internal crew against delivery windows is a Postgres query. This deletes the most expensive third of their architecture.

---

## 7. Data Model (proposed schema)

Supabase Postgres. This is the TaskRabbit domain model with the marketplace tables (tasker profiles, rate cards, work areas, ranking) removed and warehouse/logistics tables added.

```sql
-- IDENTITY ------------------------------------------------------------------
users            (id, email, name, picture, provider, role: customer|admin|assembler|driver,
                  phone, created_at)                      -- extend existing sip_session OAuth
addresses        (id, user_id, label, line1, line2, city, state, zip, lat, lng, notes,
                  access_notes /* stairs, elevator, gate code */)

-- MARKET --------------------------------------------------------------------
markets          (id, name /* Houston */, hub_lat, hub_lng, coverage_radius_m,
                  status: live|expanding|unserved, launch_eta)   -- replaces LOCATION_TIER map
zones            (id, market_id, name, delivery_fee_cents, zips text[])

-- CATALOG (the IKEA move) ---------------------------------------------------
catalog_items    (id, brand /* IKEA, Wayfair, generic */, sku, name, category,
                  complexity_tier: 1..5,
                  fulfillment_mode: warehouse|hybrid|onsite_only,   -- §5.3, load-bearing
                  est_assembly_min, assembled_dims_cm /* fits-in-van + through-door math */,
                  flat_price_cents, active)
price_tiers      (tier, base_price_cents)                 -- fallback for unknown items

-- QUOTES & ORDERS -----------------------------------------------------------
quotes           (id, user_id nullable, market_id, items jsonb, subtotal_cents,
                  delivery_fee_cents, pickup_fee_cents, total_cents,
                  source: chip|web|phone, expires_at)
orders           (id, quote_id, user_id, address_id, market_id, status /* §8 */,
                  intake_mode: ship_to_warehouse|store_pickup|customer_dropoff,
                  delivery_window_id, totals…, stripe_payment_intent_id, created_at)
order_items      (id, order_id, catalog_item_id, qty, unit_price_cents,
                  status: awaiting|received|assembling|qc_passed|staged|delivered|damaged)
order_events     (id, order_id, actor_id, from_status, to_status, note, created_at)
                                                          -- audit log = customer tracking feed
delivery_windows (id, market_id, date, start_t, end_t, capacity, booked_count)

-- WAREHOUSE -----------------------------------------------------------------
inbound_shipments(id, order_id, carrier, tracking_no, expected_at, received_at)
receiving_records(id, order_item_id, photos text[], condition: ok|damaged, notes, staff_id)
assembly_jobs    (id, order_item_id, assigned_to, started_at, finished_at,
                  actual_min, status: queued|in_progress|done|blocked)
qc_checks        (id, assembly_job_id, staff_id, passed bool, photos text[], notes)

-- LOGISTICS -----------------------------------------------------------------
vehicles         (id, market_id, name, cargo_dims_cm, max_stops)
routes           (id, market_id, date, vehicle_id, driver_id, status)
route_stops      (id, route_id, order_id, seq, eta, arrived_at, completed_at,
                  pod_photos text[], signature_url)       -- proof of delivery

-- MONEY ---------------------------------------------------------------------
invoices         (id, order_id, line_items jsonb, subtotal, fees, tip_cents, total, status)
payments         (id, invoice_id, stripe_pi, kind: deposit_auth|capture|refund, amount, status)
promo_codes      (id, code, kind: percent|fixed, value, max_uses, expires_at)

-- COMMS & REPUTATION --------------------------------------------------------
threads          (id, order_id) / messages (id, thread_id, sender_id, body, read_at)
notifications    (id, user_id, channel: email|sms|push, template, payload jsonb, sent_at)
reviews          (id, order_id, rating 1..5, body, photos text[], published)
waitlist_signups (id, email, market_id, source, position serial, created_at)  -- Phase 0
```

---

## 8. Order Lifecycle State Machine

TaskRabbit's `draft → posted → matched → confirmed → … → reviewed` lifecycle, re-cut for hub-and-spoke fulfillment. Enforce transitions in one place (`src/server/booking/transitions.ts`) and write every transition to `order_events` — that audit log doubles as the customer's tracking timeline (their "where's my order" page) and the ops dashboard feed.

```
QUOTED ──book+deposit auth──▶ BOOKED
BOOKED ──items en route──────▶ AWAITING_INBOUND ──all items scanned──▶ RECEIVED
                                   │ (damaged on arrival → ITEM_ISSUE, customer notified,
                                   │  carrier claim; resumes or partial-refunds)
RECEIVED ──job cards created─▶ IN_ASSEMBLY ──QC pass──▶ STAGED
STAGED ──added to route──────▶ SCHEDULED ──van departs──▶ OUT_FOR_DELIVERY
OUT_FOR_DELIVERY ──placed in home + POD photos──▶ DELIVERED
DELIVERED ──Stripe capture───▶ PAID ──review request (T+1 day)──▶ REVIEWED / CLOSED

side states: CANCELLED (fee if past cutoff — clone TaskRabbit's policy),
             RESCHEDULED (window swap, capacity re-check),
             DISPUTED (freeze capture, claims flow — our TaskProtect analog),
             ONSITE_FINISH (hybrid SKUs: delivery includes final join/anchoring step)
```

Key money rule cloned from TaskRabbit: **authorize at booking, capture only after completion** (theirs: 1-hour deposit → invoice; ours: deposit or full-amount auth at booking → capture on POD). Never charge before delivery is proven.

---

## 9. Pricing Engine

Clone the **IKEA task-based model**, not TaskRabbit's hourly marketplace. Everything is a flat per-item price known before booking:

```
quote_total = Σ item_price(sku)            -- catalog flat rate by complexity tier 1–5
            + delivery_fee(zone)           -- by zone table, distance from hub
            + pickup_fee (if store_pickup) -- optional procurement service
            + hybrid_onsite_surcharge      -- for fulfillment_mode = hybrid
            − promo
subject to: job_minimum (≈ $52, IKEA-parity)
```

- **Complexity tiers, not per-SKU guessing**: tier 1 (nightstand, ~$45) → tier 5 (large sectional/bed with storage, ~$180). Map known IKEA/Wayfair best-sellers to tiers explicitly; unknown items fall back to tier by category + a photo-review step. Chip's current hardcoded `PRICES` map (Bed 129, Desk 69, Wardrobe 129, Office 99) becomes seed rows.
- **All-in display pricing.** TaskRabbit stacks a visible 15% + 7.5% fee on top at checkout, and it's their most-hated UX. We take the same margin but *bake it into the item price*. One number, no fee-surprise — this is also how IKEA presents it.
- **One engine, every surface**: `POST /api/quote` (pure function over catalog + zones) serves the Chip chat, the `/quote` page, and the booking checkout. The LLM never computes a price — it only maps free text to catalog items, then calls the same endpoint. Persist every quote (`quotes` table, 7-day expiry) — quotes are your demand-signal dataset and abandoned-quote remarketing list.
- **Unit-economics guardrail**: store `est_assembly_min` vs `actual_min` on every job; weekly report re-prices tiers where realized $/hour falls below target. TaskRabbit gets this calibration for free from Tasker rate-setting; we must close the loop ourselves.

---

## 10. Phased Build Plan

Ordered by revenue-criticality; each phase ships alone and has a review gate. Estimates assume one focused builder + Claude.

### Phase 0 — Make the waitlist real (≈2–3 days)
The site currently lies to users (fake save, random queue position). Fix trust first.
- Supabase: create `waitlist_signups` (+ `markets` seed for Houston/expanding cities). First real schema + migrations in repo.
- `POST /api/waitlist` (Zod-validated — the dependency is already installed), called from `join/page.tsx` and from Chip's unserved/expanding branches; real `position` from serial.
- Resend confirmation email (helper already built, never called); wire GA4.
- **Review gate:** signup lands in DB, email arrives, duplicate email handled, `/api/health` stays green.

### Phase 1 — Catalog + real quotes (≈1 week)
- `catalog_items`, `price_tiers`, `zones` tables; seed ~50 top IKEA/Wayfair SKUs with tier, `fulfillment_mode`, assembled dimensions.
- `POST /api/quote` pure pricing engine + `quotes` persistence.
- Chip v2: replace `PRICES`/`LOCATION_TIER`/fake `thinkDelay` with real `/api/quote` + `markets` lookups; optionally add DeepSeek (`/api/chat`) for free-text item → SKU mapping. Flip `SITE_MODE` to `"quote"`; build `/quote` page (SKU search → running total).
- **Review gate:** same item list yields identical price via Chip, `/quote`, and API; unknown-item fallback works; quotes visible in admin SQL.

### Phase 2 — Booking + payments (≈1–2 weeks)
- `orders`, `order_items`, `delivery_windows`, `order_events`; transition module.
- `/book`: address (validate inside market radius — reuse map/hub math) → window picker (capacity-aware) → Stripe PaymentIntent **manual capture** → confirmation email/SMS.
- `/api/webhooks/stripe`; cancellation/reschedule with cutoff policy (clone TaskRabbit's); customer portal `/account` v1 from the existing wireframe: order status timeline fed by `order_events`, order-scoped chat thread.
- **Review gate:** end-to-end test booking in Stripe test mode; auth-at-booking/capture-only-on-delivered enforced; double-booked window impossible (capacity constraint).

### Phase 3 — Warehouse ops (≈2 weeks)
- Staff roles on existing auth; `/admin` from wireframe: orders board (kanban = state machine), receiving flow (scan/photo → `receiving_records`, damage branch), assembly queue (job cards, assign, start/stop timing), QC checklist with photos.
- Supabase Storage for intake/QC photos; `order_events` → customer notifications ("Your desk passed inspection ✅" — this is the marketing moment, make statuses delightful).
- **Review gate:** run one real order through receive → assemble → QC → staged with photos at every step; `est_assembly_min` vs `actual_min` captured.

### Phase 4 — Delivery logistics (≈2 weeks)
- `vehicles`, `routes`, `route_stops`; admin route builder (drag orders onto a van/day; Distance Matrix for sequencing); van-capacity check against `assembled_dims_cm`.
- `/crew` PWA from wireframe: driver's stop list, navigate, POD photos + signature, mark delivered → triggers Stripe capture + review request (T+1 cron).
- SMS day-of updates (Twilio): "Your Tasker is on the way" equivalent.
- **Review gate:** full dress rehearsal — book, receive, assemble, route, deliver, auto-capture, review email; DISPUTED path freezes capture.

### Phase 5 — Growth (ongoing)
- Reviews on site (replace the "Coming Soon" Credibility placeholder with real ones), referral codes, abandoned-quote email drip.
- **The IKEA move, local edition:** partner embeds — furniture stores, property managers, stagers, moving companies get a co-branded quote link/API (`?partner=` on `/quote`) with rev-share. This is TaskRabbit's single biggest lesson: distribution at the point of purchase beats marketing.
- Second market = new `markets` row + zones + hub (architecture is multi-market from Phase 1); Apple Sign-In; Spanish coverage for the new surfaces (i18n system already exists).

### Standing risks to review each phase
1. **Fulfillment-mode discipline** (§5.3) — never sell warehouse assembly for an item that can't survive transport assembled.
2. **Custody liability** — cargo/GL insurance before the first real order; intake photos are the evidence chain.
3. **Unit economics** — flat rates only work if tier pricing tracks actual minutes; review weekly.
4. **Don't rebuild the marketplace** — resist adding tasker-style contractor onboarding until managed ops is saturated; TaskRabbit's hardest problems (liquidity, matching, trust) are the reward for exhausting this simpler model, not the starting point.

---

## 11. Sources

- TaskRabbit support: [How Do I Hire a Tasker](https://support.taskrabbit.com/hc/en-us/articles/210861763-How-Do-I-Hire-a-Tasker), [Service Fee](https://support.taskrabbit.com/hc/en-us/articles/46260411872155-What-s-the-Taskrabbit-Service-Fee), [Registration Fee](https://support.taskrabbit.com/hc/en-us/articles/360032936511-What-s-the-Registration-Fee), [Task-Based Pricing for IKEA](https://support.taskrabbit.com/hc/en-us/articles/24513108035085-Task-Based-Pricing-Model-for-Clients-at-IKEA-Stores-and-Online)
- [Taskrabbit IKEA assembly page](https://www.taskrabbit.com/ikea) · [IKEA Assembly by Taskrabbit](https://www.ikea.com/us/en/customer-service/services/assembly/)
- [Retail Dive: IKEA integrates Taskrabbit into checkout](https://www.retaildive.com/news/ikea-streamlines-taskrabbit-furniture-assembly-service-checkout/740315/) · [Omni Talk analysis](https://omnitalk.blog/2025/02/19/ikeas-taskrabbit-integration-revolutionizes-furniture-assembly/) · [Taskrabbit press release](https://www.taskrabbit.com/press/release/taskrabbit-scales-partnership-with-ikea-across-north-america-and-europe)
- TaskRabbit engineering (TechRabbit, now offline): [Architecture: Models](http://tech.taskrabbit.com/blog/2017/02/24/architecture-models/), [rails_engines_example](https://github.com/taskrabbit/rails_engines_example)
- [Become a Tasker](https://www.taskrabbit.com/become-a-tasker) · [Taskrabbit business model breakdowns](https://www.radicalstart.com/blog/taskrabbit-business-model/)
- White-glove ops references: [FIDELITONE](https://www.fidelitone.com/industries/furniture/), [Ryder white glove](https://www.ryder.com/en-us/logistics/last-mile-delivery/white-glove-delivery), [ShipBob explainer](https://www.shipbob.com/blog/white-glove-delivery/)
