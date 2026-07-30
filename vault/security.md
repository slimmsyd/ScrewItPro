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
| Middleware | `lib/supabase/middleware.ts` | anon + cookies | Session refresh only |

**Rule:** Never import `createAdminClient` (or `serverEnv` secrets) from a Client Component or any module that re-exports to the browser.

Env access: `lib/env.ts` — `publicEnv` vs `serverEnv` getters that throw when required secrets are missing.

---

## Authorization & RLS (as-built)

### Self-scoped (authenticated user, RLS)

Typical pattern: `auth.uid() = id` or `auth.uid() = user_id`.

| Area | Notes |
|------|--------|
| `profiles` | SELECT/UPDATE own row; cannot self-escalate `role`, `status`, `points_balance` via RLS WITH CHECK |
| subscriptions / point_ledger / reward_redemptions | SELECT own |

### Service-role only (no useful client policies)

Writes go through Next.js API + `createAdminClient()`. RLS enabled; anon/authenticated have no write path.

| Area | Notes |
|------|--------|
| `waitlist_entries` | Public join via API only |
| `inquiries` | Contact form via API |
| interim `orders` / `payments` | Checkout + webhook server paths |
| `email_log` | Send pipeline only |

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
| `POST /api/payments/checkout` | Creates Checkout session; server Stripe secret |
| `POST /api/payments/webhook` | Must verify signature |
| `GET /api/admin/leads/export` | **Sensitive** — must be admin-gated (verify current guards before expanding) |
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

## Planned hardening (not fully implemented)

From `docs/ARCHITECTURE-PLAN.md` — implement then **update this file**:

1. Custom Access Token Hook → `app_metadata.sip_role` / `sip_status`
2. Middleware prefix guards for `/admin|/tech|/driver|/customer`
3. Full order RLS matrix (customer own orders; tech via assignment; driver via route)
4. Deep-link tokens (sha256, purpose-bound, single-use) for quote approve / balance pay / damage resolve
5. Storage signed URLs only (private buckets)
6. Rate limits on public POST endpoints and chat

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

---

## Checklist for new features

- [ ] Which Supabase client? (user vs admin) — justify admin
- [ ] Zod schema on every external input
- [ ] Ownership filter on every read/write of user data
- [ ] No new secrets in `NEXT_PUBLIC_*`
- [ ] Error responses use machine codes
- [ ] If admin UI: server-side role check (not URL-only)
- [ ] Update this file if you introduce a new privileged path or RLS class
