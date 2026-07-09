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

<!-- TARGET_ARCH -->

---

## 7. Data Model (proposed schema)

<!-- DATA_MODEL -->

---

## 8. Order Lifecycle State Machine

<!-- STATE_MACHINE -->

---

## 9. Pricing Engine

<!-- PRICING -->

---

## 10. Phased Build Plan

<!-- BUILD_PLAN -->

---

## 11. Sources

- TaskRabbit support: [How Do I Hire a Tasker](https://support.taskrabbit.com/hc/en-us/articles/210861763-How-Do-I-Hire-a-Tasker), [Service Fee](https://support.taskrabbit.com/hc/en-us/articles/46260411872155-What-s-the-Taskrabbit-Service-Fee), [Registration Fee](https://support.taskrabbit.com/hc/en-us/articles/360032936511-What-s-the-Registration-Fee), [Task-Based Pricing for IKEA](https://support.taskrabbit.com/hc/en-us/articles/24513108035085-Task-Based-Pricing-Model-for-Clients-at-IKEA-Stores-and-Online)
- [Taskrabbit IKEA assembly page](https://www.taskrabbit.com/ikea) · [IKEA Assembly by Taskrabbit](https://www.ikea.com/us/en/customer-service/services/assembly/)
- [Retail Dive: IKEA integrates Taskrabbit into checkout](https://www.retaildive.com/news/ikea-streamlines-taskrabbit-furniture-assembly-service-checkout/740315/) · [Omni Talk analysis](https://omnitalk.blog/2025/02/19/ikeas-taskrabbit-integration-revolutionizes-furniture-assembly/) · [Taskrabbit press release](https://www.taskrabbit.com/press/release/taskrabbit-scales-partnership-with-ikea-across-north-america-and-europe)
- TaskRabbit engineering (TechRabbit, now offline): [Architecture: Models](http://tech.taskrabbit.com/blog/2017/02/24/architecture-models/), [rails_engines_example](https://github.com/taskrabbit/rails_engines_example)
- [Become a Tasker](https://www.taskrabbit.com/become-a-tasker) · [Taskrabbit business model breakdowns](https://www.radicalstart.com/blog/taskrabbit-business-model/)
- White-glove ops references: [FIDELITONE](https://www.fidelitone.com/industries/furniture/), [Ryder white glove](https://www.ryder.com/en-us/logistics/last-mile-delivery/white-glove-delivery), [ShipBob explainer](https://www.shipbob.com/blog/white-glove-delivery/)
