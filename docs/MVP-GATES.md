# ScrewIt Pros — MVP Gates & Next Steps

_Last updated: 2026-07-15 · Branch: `mvp` (feature work merges here before `main`)_

This tracks what is **built and working now** vs. what is **blocked on a
credential or a manual setup step**. Everything gated was scaffolded with a
readiness check, so **going live = provide the credential + redeploy. No code
change.**

---

## ✅ Working now (no credentials beyond Supabase, which you already have)

| Capability | Where | Notes |
|---|---|---|
| Email template designs + preview | `/dev/emails` | In-browser gallery of every transactional email. Dev-only (404 in prod). |
| Email "outbox" capture | `/dev/emails` sidebar | Real signups/inquiries render the email and capture it here while Resend is gated. |
| People capture → Supabase | `POST /api/waitlist`, `POST /api/inquiries` | Waitlist signups + quote leads persist to Supabase. |
| People mirror → Users CRM Google Sheet | n8n workflow (**live**) | Upserts each person by email; `N8N_CRM_WEBHOOK_URL` set (see Gate 3). |
| Waitlist confirmation email | `POST /api/waitlist` | Renders + captures to outbox on first join. |
| Internal leads view + CSV | `/admin/leads?key=…` | Gated by `ADMIN_DASHBOARD_TOKEN` (see Gate 4). |
| Stripe deposit checkout + webhook | `/api/payments/*` | Fully written; returns 503 until keys (see Gate 2). |

### Database migrations to apply (Supabase SQL Editor or `supabase db push`)
- `supabase/migrations/20260715120000_inquiries.sql` — lead capture table
- `supabase/migrations/20260715140000_orders_payments_interim.sql` — deposit-checkout tables

---

## 🔒 Gate 1 — Transactional email (Resend)

**Blocked on:** client sets up the sender mailbox + verifies the sending domain,
then provides the API key.

**Provide:**
- `RESEND_API_KEY` — Resend dashboard → API Keys
- `RESEND_FROM_EMAIL` — e.g. `ScrewIt Pros <hello@screwitpros.com>` (domain must be verified in Resend first)
- `INQUIRY_NOTIFY_EMAIL` — internal address that receives "new lead" alerts (optional)

**Cutover:** set the vars + redeploy. `isEmailReady()` flips and
`dispatchEmail()` starts sending live instead of capturing to the outbox. No
code change. Templates are already approved via `/dev/emails`.

---

## 🔒 Gate 2 — Payments (Stripe)

**Blocked on:** client provides Stripe keys.

**Provide:**
- `STRIPE_SECRET_KEY` (`sk_test_…` then `sk_live_…`)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (`pk_…`)
- `STRIPE_WEBHOOK_SECRET` (`whsec_…`) — from the webhook endpoint you register

**Setup once keys exist:**
1. Register a webhook endpoint in Stripe → `https://<domain>/api/payments/webhook`, events `checkout.session.completed`, `checkout.session.expired`. Copy its signing secret into `STRIPE_WEBHOOK_SECRET`.
2. Local test: `stripe listen --forward-to localhost:3000/api/payments/webhook`, then pay with test card `4242 4242 4242 4242`.
3. Verify the `orders` row flips to `deposit_paid` and a `payments` row is written.

**Cutover:** `isStripeReady()` / `isStripeWebhookReady()` flip; checkout + webhook
routes go live. Card is saved off-session for the balance-at-delivery charge (M4).

---

## ✅ Gate 3 — People mirror to Users CRM Google Sheet (n8n) — DONE & LIVE

**Status:** built, configured, and **active**. Verified end-to-end (a waitlist
signup wrote a correct row).

- Workflow: "ScrewIt Pros — Users CRM → Google Sheets" (`https://oncode.app.n8n.cloud/workflow/zRkcIerGqorr0zN7`), **active**.
- Webhook path: `screwitpro-crm` → prod URL `https://oncode.app.n8n.cloud/webhook/screwitpro-crm`.
- Sheet: **ScrewIt Pros — Users CRM** (`https://docs.google.com/spreadsheets/d/1Ye_dRK7Bi0MpddnbPhvRvHji2qg7H9oiIpnOCh1KgTk`), owned by oncodesoftware@gmail.com. Credential: "Oncode |Account".
- Node operation: **append-or-update keyed on `email`** (upsert — no duplicate people).
- Columns: `email, name, on_waitlist, provider, source, created_at, converted_at, user_id`.

**Model:** one row per person. A waitlist entry and a "user" are the same person
until conversion, so they share this sheet, distinguished by `on_waitlist`
(TRUE = waiting, FALSE = converted). Both waitlist signups (`source=join`) and
quote inquiries (`source=quote`) upsert here.

**Wiring:** `N8N_CRM_WEBHOOK_URL` is set in local `.env.local`. **For production:
add `N8N_CRM_WEBHOOK_URL=https://oncode.app.n8n.cloud/webhook/screwitpro-crm` to
the deployed environment.** Unset = Supabase only, no error.

**Note:** the sheet's first tab is named "Untitled" (gid `1098182048`); the
workflow targets it by gid, so you can rename the tab to "Users" in the sheet UI
without breaking anything. There is one leftover test row ("CRM Verify") — delete
it whenever; it just confirms the pipe works.

**Later — flip on_waitlist to FALSE on conversion:** when a person becomes an
active/serviced customer (M2 first order), POST the same webhook with
`on_waitlist=FALSE` + `converted_at` + `user_id`; the upsert updates their row.

> Prefer Microsoft Excel (OneDrive/365)? Swap the Google Sheets node for the
> Excel node — the app side is destination-agnostic and needs no change.

---

## 🔒 Gate 4 — Internal leads dashboard token

**Blocked on:** nothing — just choose a token.

**Provide:** `ADMIN_DASHBOARD_TOKEN` = any strong random string. Then open
`/admin/leads?key=<token>`. Until M1 role-based auth lands, this shared token is
the interim gate. Leave unset to keep the page disabled. (Set locally already.)

---

## ✅ Gate 5 — Google Analytics (GA4) — CLOSED (local); production env still needed

**Status:** SEO + analytics **built and live locally**. `sitemap.ts`, `robots.ts`,
JSON-LD (`LocalBusiness` + `WebSite`), GA4 loader, per-page metadata + noindex on
private pages.

Measurement ID **`G-42LFZYNNQ2`** is set in `.env.local`. Verified in a real
browser: gtag injects post-hydration, `window.gtag` is a function, and
`POST google-analytics.com/g/collect?...&tid=G-42LFZYNNQ2&en=page_view` returns
**204**. Data is collecting.

**Remaining:** set `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-42LFZYNNQ2` in the
**production (Vercel) env** — `.env.local` is gitignored and does not deploy.

**Stream URL is just a label.** GA4 never verifies domain ownership (that's Search
Console). The Measurement ID binds to the *data stream*, not the domain, so the
property was created against the Vercel URL. At domain cutover, edit
Admin → Data streams → stream URL. The ID does not change and no code changes.

**Recommended GA4 console settings** (not code, do once):
- **Data retention → 14 months** (Admin → Data retention). Defaults to 2 months and is **not retroactive**.
- **Add `stripe.com` to unwanted referrals** (Admin → Data streams → Configure tag settings). Checkout sends users to Stripe and back; without this, Stripe gets credited as the referral source and clobbers real attribution.
- Expect a hostname split in historical data: pre-cutover hits record the `vercel.app` host, post-cutover the real domain.

**Note:** `anonymize_ip` is deliberately **not** passed. GA4 anonymizes IPs
unconditionally; passing it makes gtag send it as a custom event parameter
(`ep.anonymize_ip=true`) on every hit while doing nothing for privacy.

**Domain cutover (one env var, flips everything):** set `NEXT_PUBLIC_APP_URL` to
the real domain → all canonical URLs, Open Graph URLs, `sitemap.xml`, `robots.txt`
sitemap line, and JSON-LD URLs update at once. Until then they read `localhost`.

---

## Deferred to M1+ (per docs/ARCHITECTURE-PLAN.md)

- Replace hand-rolled Google OAuth (`sip_session`) with Supabase OAuth + role hook.
- Sign-in / password-reset / logout; email verification wired into signup (templates already built: `verification`, `welcome`).
- 13 canonical migrations; the interim `orders`/`payments`/`inquiries` tables are forward-compatible subsets that M1 extends.
- Role-based guards replace the `ADMIN_DASHBOARD_TOKEN` gate.

---

## "Ready to flip" checklist

- [x] Supabase migrations applied (`inquiries`, `orders_payments_interim`) — applied via psql
- [x] Gate 3: Users CRM sheet created + n8n workflow active + `N8N_CRM_WEBHOOK_URL` set locally — **add it to the production env too**
- [ ] Gate 1: `RESEND_API_KEY` + `RESEND_FROM_EMAIL` set → live email
- [ ] Gate 2: Stripe keys + webhook endpoint registered → live payments
- [x] Gate 4: `ADMIN_DASHBOARD_TOKEN` set locally → leads dashboard accessible — **add to production env too**
- [x] Gate 5: `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-42LFZYNNQ2` set locally → analytics verified collecting (204 on `/g/collect`) — **add to production env too**
- [ ] Domain cutover: set `NEXT_PUBLIC_APP_URL` to the real domain → canonical/OG/sitemap/JSON-LD URLs all update
