# Architecture

**Status:** as-built snapshot (2026-07-30)  
**App root:** `my-app/`  
**Planning corpus (deeper specs):** `docs/` — vault wins for *standards*; plans win for *roadmap detail*.

### Git / deploy surfaces

| Branch | Role |
|--------|------|
| **`main`** | Marketing-only production. No product portal/quote/booking merges without an explicit launch call. |
| **`develop`** | Product integration (quote, My Jobs, soft-gate, emails, Phase C). **Default PR target.** |

---

## Product

**ScrewIt Pros** is a hub-based furniture assembly + white-glove delivery business (Houston, **40 mi** service radius from downtown hub — locked 2026-07-30 / plan D1).

Flow: customer buys flat-pack → ships/sends to hub → staff receive / assemble / QC → white-glove delivery and in-home placement.

**Moat (locked product intent):** TaskRabbit-like demand (item pricing, book, track) with **managed hub ops** instead of a marketplace supply side.

---

## Tech stack (as-built)

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router), React 19 |
| Language | TypeScript |
| Styling | Tailwind 4 + **inline styles** + CSS variables (`globals.css`) |
| Motion | Framer Motion, GSAP |
| Validation | Zod |
| Icons | lucide-react |
| Auth / DB | Supabase (`@supabase/ssr`, Auth + Postgres + RLS) |
| Payments | Stripe (Checkout deposit + webhook scaffold) |
| Email | Resend + `email_log` |
| AI | DeepSeek client (Chip / support chat) |
| Maps | Google Maps JS + Places |
| CRM mirror | Optional n8n webhook |
| Analytics | GA4 (optional) |
| i18n | Custom `LocaleProvider` (en / es) on public surface |

**Not used today:** shadcn/ui, Server Actions as primary mutation path, multi-tenant org model.

---

## Repository layout

```
ScrewItPro/
├── vault/                    # ← Standards source of truth (this folder)
├── docs/                     # Roadmaps, data model, flows, handoffs
├── CLAUDE.md / AGENTS.md     # Agent ToC → vault/
├── README.md
└── my-app/                   # Only runnable application
    ├── public/assets/        # Logos, mascot, media, retailer marks
    ├── supabase/migrations/  # SQL applied to Supabase
    ├── DESIGN.md             # Design notes (partially stale vs live CSS)
    ├── SITEMAP.md, USER-FLOWS.md, wireframes/, Project.md
    └── src/
        ├── app/              # Routes (pages + API route handlers)
        ├── components/       # UI primitives + domain components
        ├── lib/              # Env, integrations, domain modules
        ├── i18n/             # Dictionaries + config
        ├── hooks/
        ├── content/          # AEO content modules
        ├── fonts/
        └── middleware.ts     # Supabase session refresh
```

### `src/lib` domain modules (high level)

| Path | Responsibility |
|------|----------------|
| `lib/env.ts` | `publicEnv` / `serverEnv` central access |
| `lib/supabase/*` | Browser, server cookie, middleware, **admin (service role)** clients |
| `lib/auth/*` | Origin helpers; OAuth moved to Supabase |
| `lib/waitlist.ts` | Waitlist upsert + Zod schema |
| `lib/inquiries.ts` | Contact / inquiry writes |
| `lib/payments.ts`, `lib/stripe.ts` | Checkout + Stripe client |
| `lib/orders/*` | Order types, status helpers, booked snapshot, portal jobs (WIP) |
| `lib/quote/*` | Quote draft context, pricing, product lookup, catalog |
| `lib/emails/*` | Templates, layout, dispatch, log |
| `lib/admin/leads.ts` | Admin lead export data |
| `lib/member.ts` | Member/session helpers for UI |
| `lib/site.ts` | Paths, assets, `SITE_MODE` (quote vs waitlist CTAs) |
| `lib/seo/*`, `lib/deepseek.ts`, `lib/resend.ts`, `lib/crm.ts`, `lib/places.ts` | Integrations |

---

## Request lifecycle

```text
Browser
  → middleware (updateSession: refresh Supabase cookies; clear legacy sip_session)
  → App Router page (RSC and/or client island)
  → mutations/data writes prefer API route handlers under src/app/api/*
       → Zod validate
       → lib/* service
       → Supabase (user client + RLS) OR createAdminClient() (service role)
       → Stripe / Resend / external APIs as needed
  → response shape: { ok: true, ... } | { ok: false, error: "machine_code", message? }
```

**Canonical API example:** `src/app/api/waitlist/route.ts`.

---

## Surfaces (as-built)

| Surface | Routes | Notes |
|---------|--------|--------|
| Marketing | `/` | `components/home/*` landing |
| Waitlist / join | `/join` | Email signup + Google; waitlist persistence |
| Auth | `/auth/google`, `/auth/callback` | Supabase OAuth code exchange |
| Quote | `/quote`, `/quote/items`, `/quote/where`, `/quote/price` | Multi-step Get-a-Price |
| Checkout | `/checkout/success`, `/checkout/cancelled` | Stripe return URLs |
| Orders | `/orders/[id]`, `/orders/[id]/track` | Confirmation + tracker UI |
| Portal (customer) | `/customer/{jobs,account,notifications,referrals,orders/*}` | Shell under real URL prefix for middleware guards; old paths redirect |
| Admin | `/admin/leads` | Lead list + export API |
| Legal | `/privacy`, `/terms` | Legal shells |
| AEO | `/furniture-assembly-pickup-delivery-houston` | SEO/AEO landing |
| Dev | `/dev/emails`, `/dev/demo-reset` | Local tooling — not product |

### Site mode

`src/lib/site.ts` — `SITE_MODE = "quote"` drives primary CTAs to the quote journey (vs waitlist-era marketing). Do not flip production modes casually.

---

## Locked design decisions (as-built)

1. **Mutations = API route handlers** (not Server Actions) — matches existing convention; token/webhook/cron friendly.
2. **Styling = CSS variables + inline styles** on components; Tailwind available but product UI is not a shadcn kit.
3. **Church vs state** — marketing chrome (Nav, landing) vs customer portal chrome (`CustomerAppShell`). Do not mix nav systems without intent.
4. **Quote drafts** live client-side (`lib/quote/draft-storage`) until checkout materializes an order.
5. **Deposit model** — Stripe Checkout payment for deposit (scaffold); full balance-at-delivery lifecycle is planned.
6. **Orders UI may use snapshots/mocks** (`lib/orders/booked-snapshot`, `mock-order`) until the full lifecycle backend exists.
7. **i18n** — public EN/ES dictionaries; portal surfaces may stay EN-first.
8. **Env access** — always through `publicEnv` / `serverEnv` in `lib/env.ts`.
9. **Service radius = 40 miles** from downtown Houston hub (`BUSINESS.geo`). Client must never invent `inServiceArea: true`.
10. **BuyMode is paste-link only** — no mock product catalog. Retailer logo strip is advisory, never an allowlist for lookup.
11. **Demo booking soft-gate** is local/preview only (`NODE_ENV !== "production"`). Production fails closed when Stripe is not configured.

---

## Data model (as-built vs planned)

### As-built (migrations under `my-app/supabase/migrations/`)

- **Foundation:** `profiles` (role enum: customer | admin | technician | driver), waitlist, newsletter, subscription plans/subscriptions, point ledger + rewards (loyalty schema largely dormant in UI).
- **Inquiries** table + API.
- **Interim pay columns on `orders`:** legacy `status` (`order_status_interim`: pending_payment | deposit_paid | cancelled) kept for checkout compatibility.
- **Phase C1 spine (customer-first):** extended `orders` + `order_items` + `order_status_events` + transitions + `addresses` + `item_classes` + `app_settings` + `stripe_webhook_events`. See **Phase C** below.
- **email_log** — template sends, idempotency guard.

### Phase C — order persistence spine (customer dashboard first)

**Goal:** My Jobs / confirmation / tracker / notifications eventually read real DB rows. **Not** building tech/driver ops UIs yet.

| Slice | Deliverable | Status |
|-------|-------------|--------|
| **C0** | Vault freeze + ops→customer status map | done |
| **C1** | DB migrations (scaffold) | done (PR #31) |
| **C2** | `GET /api/customer/jobs` + order detail + My Jobs wire-up | **as-built** |
| **C2.5** | Soft-gate demo book write (no Stripe) → real job on My Jobs | **as-built** (non-prod) |
| **C3** | Real Stripe book writes items + lifecycle on deposit | planned (next) |
| **C4** | `transitionOrder` + tracker events | planned |
| **C5** | Stripe webhook idempotency | planned |
| **C6** | Portal cutover + notifications from events | planned |

#### C2 customer read APIs (as-built)

| Route | Auth | Behavior |
|-------|------|----------|
| `GET /api/customer/jobs` | Session required (401) | List own orders via user client + RLS; map with `mapDbOrderToPortal`; omit pre-book/cancelled lifecycles |
| `GET /api/customer/orders/[id]` | Session required | One job by `order_number` (SIP-…) or uuid; 404 if missing/not owned/not visible |
| My Jobs UI | `/customer/jobs` | Fetches list API; empty state when no rows; fixtures only with `?demo=1` |

**Helpers:** `lib/orders/map-db-order-to-portal.ts`, `lib/orders/customer-jobs.ts` (no service role).  

#### C2.5 soft-gate booking write (as-built, non-prod)

| Route | Auth | Behavior |
|-------|------|----------|
| `POST /api/quote/book-demo` | Session + `NODE_ENV !== production` | Service-role insert: order + `order_items`, `lifecycle_status=awaiting_arrival`, `payment_status=unpaid`, `metadata.demoBooking` |
| Price soft-gate Continue | Same gate | Calls book-demo → confirmation with real `order_number` → My Jobs lists job |

**Stripe deposit / webhook lifecycle:** still deferred (TODO on webhook). When wired, set `awaiting_arrival` + `payment_status=deposit_paid` on real pay — do not rely on soft-gate in production.

**Principles**

1. **Extend** interim `orders` / `payments` — do not drop Stripe columns.
2. Dual status during cutover: legacy `status` (pay scaffold) + `lifecycle_status` (ops enum).
3. Customer UI keeps **7** `CustomerOrderStatus` labels; DB stores **ops** lifecycle; map at API edge (`map-ops-to-customer`).
4. Service-role for status/money mutations; customer **SELECT own** RLS on orders/items/visible events.
5. Mocks/snapshots allowed only as explicit demo fallback until C6.

#### Ops → customer status map (frozen for C1–C4)

| `lifecycle_status` (DB ops) | Customer UI (`CustomerOrderStatus`) |
|-----------------------------|-------------------------------------|
| `draft`, `pending_quote`, `quote_sent` | *(pre-book — not shown on My Jobs active list)* |
| `awaiting_arrival` | `booked` |
| *(optional future slot)* | `pickup_scheduled` |
| `boxes_received` | `picked_up` |
| `in_assembly` | `in_workshop` |
| `assembly_completed`, `ready_for_delivery` | `assembled_inspected` |
| `out_for_delivery` | `out_for_delivery` |
| `delivered` | `delivered` |
| `cancelled_no_payment`, `refunded_closed` | past / cancelled handling later |
| `on_hold_damage_reported`, `refused_pending_resolution` | **deferred** (no customer mapping yet) |

Legacy interim `status` mapping into lifecycle:

| Interim `status` | → `lifecycle_status` | → `payment_status` |
|------------------|----------------------|--------------------|
| `pending_payment` | `draft` | `unpaid` |
| `deposit_paid` | `awaiting_arrival` | `deposit_paid` |
| `cancelled` | `cancelled_no_payment` | `unpaid` |

#### Tables introduced in C1

- `app_settings` — hub radius 40, deposit_percent 30  
- `orders` extended — order_number, payment_status, lifecycle_status, contact_*, delivery_address_id  
- `order_items`  
- `order_status_transitions` + `order_status_events` (+ validate trigger)  
- `item_classes` (seeded)  
- `addresses`  
- `stripe_webhook_events` (ledger empty until C5)  
- Sequence for `SIP-#####` order numbers  

Diagram: `docs/diagrams/phase-c-order-spine.html`

### Planned later (not Phase C)

Full platform extras in `docs/ARCHITECTURE-PLAN.md`: assembly jobs, inbound scan, routes/stops, damage/refusal, deep_link_tokens UI, tech/driver portals.

When implementing those, update this file and `security.md` in the same change.

---

## Integrations map

| Integration | Client / module | Config |
|-------------|-----------------|--------|
| Supabase | `lib/supabase/{client,server,admin,middleware}` | `NEXT_PUBLIC_SUPABASE_*`, `SUPABASE_SERVICE_ROLE_KEY` |
| Stripe | `lib/stripe.ts`, `lib/payments.ts` | Publishable + secret + webhook secret |
| Resend | `lib/resend.ts`, `lib/emails/*` | `RESEND_API_KEY`, from address |

### Booking email cycle (as-built)

| Step | Detail |
|------|--------|
| Trigger (now) | After `POST /api/quote/book-demo` success → `sendBookingConfirmationEmail` |
| Template code | `booking-confirmation` (stable; `email_log.template_code`) |
| Resolve | Active row in `email_templates` (mustache `{{vars}}`) **or** code default in `templates.ts` |
| Layout | Brand chrome always from `layout.renderLayout` (not admin-editable in v1) |
| Dispatch | `dispatchEmail` → Resend or outbox; never fails book API |
| Idempotency | Skip if `email_log` already has **sent** for `(booking-confirmation, order_id)` |
| Admin edit | `GET/PATCH /api/admin/email-templates/[code]` via `requireAdmin`; or Supabase Table Editor |
| Later | Stripe webhook reuses same send helper after deposit |
| DeepSeek | `lib/deepseek.ts` | `DEEPSEEK_API_KEY` (+ model/base URL) |
| Google Maps | `lib/google.ts`, `lib/places.ts` | Maps keys |
| Google Auth | Supabase provider (app routes only start/callback) | Supabase dashboard redirect URLs |
| n8n CRM | `lib/crm.ts` | `N8N_CRM_WEBHOOK_URL` (optional) |
| GA4 | `components/analytics/GoogleAnalytics.tsx` | `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` |

Health (no secrets): `GET /api/health` via `getEnvStatus()`.

---

## Frontend conventions

- Interactive components: `"use client"` at top when needed.
- Import alias: `@/` → `my-app/src/`.
- Prefer existing shells (Quote, Orders, Customer portal) over new layout systems.
- Reuse primitives from `components/ui/` — see `vault/components.md`.

---

## Testing & CI (current gap)

No project-wide test runner or CI pipeline is established in-repo as of this snapshot. When added, document the command matrix here.

---

## Related docs

| Doc | Use for |
|-----|---------|
| `docs/ARCHITECTURE-PLAN.md` | End-to-end target platform |
| `docs/DATA_ARCHITECTURE.md` | Foundation schema rationale |
| `docs/CUSTOMER_EXPERIENCE_FLOW.md` | CX narrative |
| `my-app/USER-FLOWS.md` | Detailed flows / status machine intent |
| `my-app/SITEMAP.md` | Screen inventory (target) |
| `my-app/wireframes/` | Portal wireframes |
| `vault/security.md` | Authz, RLS, secrets |
| `vault/components.md` | Component reuse catalog |
| `vault/branding_and_design.md` | Visual system |

---

## Changelog (architecture decisions)

| Date | Decision |
|------|----------|
| 2026-07-30 | Vault initialized; as-built architecture documented |
| 2026-07-30 | Soft 1k-line file cap for components/pages; ItemsStep + join page split into panels/helpers |
| 2026-07-30 | **Service radius locked to 40 mi** (`BUSINESS.geo.radiusM = 64_374`). Source of truth: `lib/seo/business.ts`. |
| 2026-07-30 | Slice 1: delete mock catalog; BuyMode paste-only; AddressField fail-closed; soft-gate fails closed in production; no fixture-email fallback |
| 2026-07-30 | Slice 2: `/customer/*` prefix + redirects; Vitest; middleware coarse gates; admin via profiles.role; checkout `{orderId}` only + `POST /api/quote/draft` |
| 2026-07-30 | Phase C started: customer-first order spine; C0 map + C1 schema (extend interim orders) |
| (prior) | Google Auth unified onto Supabase OAuth; legacy `sip_session` cleared in middleware |
| (prior) | Interim orders/payments for deposit Checkout scaffold |
| (prior) | Customer portal Phase 0 shell (church vs state) |
