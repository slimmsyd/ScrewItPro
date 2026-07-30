# Architecture

**Status:** as-built snapshot (2026-07-30)  
**App root:** `my-app/`  
**Planning corpus (deeper specs):** `docs/` — vault wins for *standards*; plans win for *roadmap detail*.

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
| Portal (customer) | `/account`, `/jobs`, `/notifications`, `/referrals` | Shell + WIP views/panels (in flux on branch) |
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
- **Interim orders/payments** — status enum subset: `pending_payment` | `deposit_paid` | `cancelled`. Service-role writes.
- **email_log** — template sends, idempotency guard.

### Planned (not built — do not implement from vault alone)

Full platform in `docs/ARCHITECTURE-PLAN.md` and `docs/DATA_ARCHITECTURE.md`:

- 14-state order lifecycle, assembly jobs, inbound scan, routes/stops, damage/refusal flows
- Role route groups: `/customer`, `/admin`, `/tech`, `/driver` with middleware role gates
- Custom Access Token Hook (`app_metadata.sip_role`)
- Service layer under `src/server/*` (not present yet)

When implementing those, update this file and `security.md` in the same change.

---

## Integrations map

| Integration | Client / module | Config |
|-------------|-----------------|--------|
| Supabase | `lib/supabase/{client,server,admin,middleware}` | `NEXT_PUBLIC_SUPABASE_*`, `SUPABASE_SERVICE_ROLE_KEY` |
| Stripe | `lib/stripe.ts`, `lib/payments.ts` | Publishable + secret + webhook secret |
| Resend | `lib/resend.ts`, `lib/emails/*` | `RESEND_API_KEY`, from address |
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
| (prior) | Google Auth unified onto Supabase OAuth; legacy `sip_session` cleared in middleware |
| (prior) | Interim orders/payments for deposit Checkout scaffold |
| (prior) | Customer portal Phase 0 shell (church vs state) |
