# Security

**Status:** as-built standards (2026-07-30)  
**Scope note:** ScrewIt Pros is **user-scoped** (customer owns their rows), not multi-tenant SaaS with org tenancy. “Tenant scoping” here means **ownership by `auth.uid()` / `customer_id` / verified email**, not org_id isolation.

---

## Principles

1. **Secrets never leave the server.** No service role key, Stripe secret, Resend key, or webhook secret in client bundles or `NEXT_PUBLIC_*`.
2. **Validate at the boundary.** Every API route parses input with Zod (or equivalent); reject with stable machine codes.
3. **Least privilege clients.** Browser uses anon + user session (RLS). Privileged writes use `createAdminClient()` only in server modules.
4. **Don’t trust the client for identity or role.** Role and user id come from Supabase Auth session / server verification — never from request body alone.
5. **Fail closed.** Missing config → 503 with clear machine code, not fake success (waitlist pattern). Same for Maps/Places and Stripe soft-gate in **production** — never invent a successful booking or `inServiceArea: true` on the client.
6. **Soft-gate demo book (C2.5):** `POST /api/quote/book-demo` may create a real owned order **only when `NODE_ENV !== "production"`**. Production returns 403 `demo_booking_disabled`. Writes use service role server-side; never claim Stripe deposit succeeded (`payment_status` stays unpaid + `metadata.demoBooking`).

---

## Authentication (as-built)

| Mechanism | Implementation |
|-----------|----------------|
| Session | Supabase Auth cookies via `@supabase/ssr` |
| Email/password | `POST /api/auth/signup` → Supabase Auth user + waitlist enroll; client may `signInWithPassword` |
| Google | `GET /auth/google` → `supabase.auth.signInWithOAuth({ provider: 'google' })` → `GET /auth/callback` → `exchangeCodeForSession(code)` |
| Profile provisioning | DB trigger `handle_new_user` creates `profiles` from `auth.users` |
| Middleware | `src/middleware.ts` → `updateSession()` refreshes session; **clears legacy `sip_session` cookie** |

### Forbidden / retired

- Hand-rolled Google OAuth that only set an unsigned `sip_session` cookie (no Supabase user).
- Treating `sip_session` as proof of login.
- Putting Google client secret in client code.

### Supabase dashboard requirements

- Redirect URLs must include app `/auth/callback` (local + production).
- Google provider configured in Supabase (app does not own the Google handshake anymore).

---

## Supabase client roles

| Client | File | Key | Use |
|--------|------|-----|-----|
| Browser | `lib/supabase/client.ts` | anon | Client components; RLS applies |
| Server (user) | `lib/supabase/server.ts` | anon + cookies | RSC, route handlers with user session; RLS applies |
| Admin | `lib/supabase/admin.ts` | **service role** | Server-only privileged writes; **bypasses RLS** |
| Middleware | `lib/supabase/middleware.ts` | anon + cookies | Session refresh + **coarse route gates** (`/customer`, `/admin`, …). Always copy cookies onto redirects. |

**Rule:** Never import `createAdminClient` (or `serverEnv` secrets) from a Client Component or any module that re-exports to the browser.

Env access: `lib/env.ts` — `publicEnv` vs `serverEnv` getters that throw when required secrets are missing.

---

## Authorization & RLS (as-built)

### Self-scoped (authenticated user, RLS)

Typical pattern: `auth.uid() = id` or `auth.uid() = user_id`.

| Area | Notes |
|------|--------|
| `profiles` | SELECT/UPDATE own row; pin trigger blocks client changes to `role`, `status`, `points_balance`, `referral_code`, `referred_by` |
| subscriptions / point_ledger / reward_redemptions | SELECT own |
| `referral_attributions` | SELECT own (as referrer or referee); no client writes |

### Service-role only (no useful client policies)

Writes go through Next.js API + `createAdminClient()`. RLS enabled; anon/authenticated have no write path.

| Area | Notes |
|------|--------|
| `waitlist_entries` | Public join via API only |
| `inquiries` | Contact form via API |
| interim `orders` / `payments` | Checkout + webhook server paths |
| `email_log` | Send pipeline only |
| `email_templates` | **Service role only** (no authenticated policies). Mutations via admin API + `requireAdmin` |
| Referral claim / code assign | `claim_referral`, `ensure_referral_code` RPCs (service_role); points only via `apply_points` |
| `sip_ref` cookie | httpOnly, SameSite=Lax; set by `GET /r/[code]`; cleared after signup claim |

### Roles (schema present, portal gates incomplete)

`profiles.role`: `customer` | `admin` | `technician` | `driver`.

**As-built gap:** middleware does **not** yet enforce role-based route prefixes (`/admin`, `/tech`, `/driver`). Do not assume URL privacy. When adding admin tools, require server-side role checks immediately (see Planned below).

---

## Data-handling rules

### Input validation

```text
JSON body → Zod schema.parse → typed input
  on ZodError → 400 { ok: false, error: "…", message }
```

Copy the style of `src/app/api/waitlist/route.ts` and domain schemas in `lib/*`.

### Response contract

- Success: `{ ok: true, ... }` with 200/201.
- Failure: `{ ok: false, error: "<stable_machine_code>", message?: string }`.
- Never return stack traces, SQL errors, or secret material to clients.
- Prefer codes like `waitlist_not_configured`, `invalid_email`, `auth_failed` over free-form only.

### Ownership / scoping

| Context | Scope rule |
|---------|------------|
| Signed-in customer | Rows tied to `auth.uid()` or `customer_id = auth.uid()` |
| Guest quote / checkout | Minimize PII; attach email on order; convert to user when they auth |
| Waitlist lead | Email-normalized uniqueness; `converted_user_id` when they create an account |
| Admin leads | Service role only; must gate admin UI/API by role when hardened |

There is **no org_id multi-tenancy** yet. Do not invent cross-customer reads “for convenience.”

### Payments

- Card data never hits our servers — Stripe Checkout / Elements only.
- Webhook handlers must verify Stripe signatures when `STRIPE_WEBHOOK_SECRET` is set.
- Persist payment/order state server-side after verified events; do not trust client “I paid” flags alone.

### Email & PII

- Log sends in `email_log` (server).
- Team notify lists from env (`TEAM_NOTIFY_EMAILS` / legacy `INQUIRY_NOTIFY_EMAIL`) — not hardcoded personal addresses in commits.
- Avoid putting full payment methods or secrets in email payloads/logs.

### Product lookup / scraping

`/api/quote/lookup-product` may fetch external product pages server-side. Treat external HTML as untrusted: sanitize what you store/display; rate-limit as needed; no SSRF to internal networks.

---

## API surface (security-relevant)

| Route | Risk notes |
|-------|------------|
| `POST /api/waitlist` | Public write; service role; Zod; rate-limit ideal later |
| `POST /api/auth/signup` | Account creation; no secret leak |
| `GET /api/auth/session` | Session read only |
| `POST /api/inquiries` | Public write; service role |
| `POST /api/quote/draft` | **Auth required**; server-prices items; inserts `pending_payment` order |
| `POST /api/payments/checkout` | **Auth required**; body `{ orderId }` only; ownership + status checks; Stripe secret |
| `POST /api/payments/webhook` | Must verify signature |
| `GET /api/admin/leads/export` | **requireAdmin()** — `profiles.role = admin` (no URL token) |
| `/admin/leads` | Same requireAdmin; bootstrap first admin via SQL |
| `GET /api/health` | Config booleans only — no secrets |
| `POST /api/quote/lookup-product` | Server-side fetch; untrusted HTML |

---

## Forbidden patterns

- Shipping `SUPABASE_SERVICE_ROLE_KEY` or `STRIPE_SECRET_KEY` to the browser
- Client-side role claims (`localStorage.role = 'admin'`)
- Direct Supabase client inserts into service-only tables from the browser
- Disabling RLS “temporarily” in production migrations
- Committing `.env.local`, service keys, or webhook secrets
- Logging Authorization headers, cookies, or full card/bank data
- Using deep links / tokens without server-side hash + expiry + single-use (when that system lands)
- **Client-side mock places** that hardcode `inServiceArea: true` (service-area bypass)
- **Fixture PII fallbacks** on real customer screens (e.g. confirmation email → `morgan@…`)
- **Client-invented product catalogs** competing with the real paste-link lookup path
- **Demo booking continue** in production when Stripe is not configured
- **Hardcoded prices in Chip/chat** that contradict the quote rate card

---

## Service area

- Authoritative center + radius: `lib/seo/business.ts` → `BUSINESS.geo` (**40 miles** / `radiusM: 64_374`).
- Gate: `isInHoustonMetro()` in `lib/places.ts` after Places `resolvePlace`.
- Address UI (`AddressField`, `HeroAddressBar`) must fail closed if Maps is missing or predictions fail — no mock autocomplete.

---

## Planned hardening (partially done — Slice 2)

| Item | Status |
|------|--------|
| Middleware prefix guards `/customer|/admin|/tech|/driver` | **As-built** (coarse UX; cookie-safe redirects) |
| Admin leads without URL secrets | **As-built** (`requireAdmin`) |
| Checkout auth + no client money | **As-built** (draft + orderId) |
| Custom Access Token Hook → `sip_role` | **Dashboard setup still required** — code reads claim when present, defaults customer |
| profiles update recursion fix | **Migration shipped** — apply via SQL editor / `db push` |
| Order spine customer read RLS (own orders/items/visible events) | **C1 migration** — apply SQL |
| Status/money mutations | **service-role only** (transition service in C4) |
| Stripe webhook idempotency ledger table | **C1 table**; use in C5 |
| Deep-link tokens | Planned (post C4) |
| Rate limits | Planned |
| Full tech/driver RLS | Planned (not Phase C) |

### Order spine RLS (Phase C)

| Table | authenticated customer | service role |
|-------|------------------------|--------------|
| `orders` | SELECT where `customer_id = auth.uid()` | full (draft, checkout, transitions) |
| `order_items` | SELECT via parent order ownership | full |
| `order_status_events` | SELECT where `customer_visible` and owns order | full insert via transitions |
| `addresses` | SELECT/INSERT/UPDATE own `user_id` | full |
| `item_classes` | SELECT active | full |
| `app_settings` | SELECT (public config keys only if exposed later) | full |
| `stripe_webhook_events` | none | full |
| `order_status_transitions` | SELECT (read legal edges) | full |

**Never** let the client set `lifecycle_status`, `payment_status`, or money columns directly.

### Bootstrap first admin

```sql
-- After user has signed up once:
select set_config('app.allow_profile_privilege_update', 'true', true);
update public.profiles set role = 'admin' where email = 'you@example.com';
```

---

## Incident / bug log (security-relevant)

Record funky authz/authn bugs here so we do not repeat them.

| Date | Issue | Fix / rule |
|------|-------|------------|
| (prior) | Google sign-in created no Supabase user (unsigned cookie) | Route Google through Supabase Auth; clear `sip_session` in middleware |
| 2026-07-30 | Vault security baseline documented | — |
| 2026-07-30 | Confirmation showed fixture email `morgan@…` when snapshot omitted email | Pass member email into `saveBookedSnapshot`; never fall back to fixture `base.email` — use neutral "your email on file" |
| 2026-07-30 | Places failure fell back to mock places with `inServiceArea: true` (incl. Woodlands/Katy edge fixtures) | Delete mocks; fail closed with actionable errors; radius locked to **40 mi** |
| 2026-07-30 | Stripe soft-gate offered "Continue to confirmation" in all envs | `DEMO_BOOKING_ENABLED = NODE_ENV !== "production"`; production terminal modal only |
| 2026-07-30 | Checkout trusted client `totalCents` / missing auth / IDOR on orderId | Auth first; draft API server-prices; checkout only `{ orderId }` + ownership + pending_payment |
| 2026-07-30 | Admin leads gated by `?key=` secret in URL/HTML | Deleted; `requireAdmin()` from profiles.role |
| 2026-07-30 | Phase C1 order spine tables + customer SELECT RLS | Migrations under `20260730*_phase_c1_*` |
| 2026-07-30 | Referral points: client cannot set codes/points; claim via service-role RPC only | `sip_ref` httpOnly; pin trigger includes `referral_code`/`referred_by` |

---

## Checklist for new features

- [ ] Which Supabase client? (user vs admin) — justify admin
- [ ] Zod schema on every external input
- [ ] Ownership filter on every read/write of user data
- [ ] No new secrets in `NEXT_PUBLIC_*`
- [ ] Error responses use machine codes
- [ ] If admin UI: server-side role check (not URL-only)
- [ ] Update this file if you introduce a new privileged path or RLS class
