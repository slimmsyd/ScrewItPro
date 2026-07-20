# ScrewIt Pros — MVP Gates & Next Steps

_Last updated: 2026-07-20 · Phase: **Sprint 0 closed** (waitlist launch)_

This tracks what is **built and working now** vs. what is **blocked on a
credential or a manual setup step**. Everything gated was scaffolded with a
readiness check, so **going live = provide the credential + redeploy. No code
change.**

**Phase status:** see [`SPRINT-0-STATUS.md`](./SPRINT-0-STATUS.md) for the
closeout verdict. Sprint 0 is complete for waitlist operation. Only Gate 2
(Stripe) remains open, and it does not block capture. Team notify is optional
at low lead volume.

---

## ✅ Working now (production)

| Capability | Where | Notes |
|---|---|---|
| Email template designs + preview | `/dev/emails` | In-browser gallery. Dev-only (404 in prod). |
| Transactional email (Resend) | `dispatchEmail()` + `email_log` | **Gate 1 closed** — live sends in prod. |
| People capture → Supabase | `POST /api/waitlist`, `POST /api/inquiries` | Waitlist + quote leads persist. |
| People mirror → Users CRM Google Sheet | n8n workflow | **Gate 3 closed in prod.** |
| Waitlist confirmation + first-join team path | `upsertWaitlistEntry` | Confirmation on all 3 join paths; team notice only if notify list set. |
| Internal leads view + CSV | `/admin/leads?key=…` | **Gate 4 closed in prod** (`ADMIN_DASHBOARD_TOKEN`). |
| GA4 + SEO | gtag, sitemap, robots, JSON-LD | **Gate 5 closed in prod.** |
| Domain cutover | `NEXT_PUBLIC_APP_URL` | **Closed** → `https://www.screwitpro.com` (canonical/OG/sitemap/JSON-LD/OAuth origin). |
| Stripe deposit checkout + webhook | `/api/payments/*` | Fully written; returns 503 until keys (**Gate 2 open**). |

### Database migrations applied
- `supabase/migrations/20260715120000_inquiries.sql` — lead capture table
- `supabase/migrations/20260715140000_orders_payments_interim.sql` — deposit-checkout tables
- `supabase/migrations/20260720120000_email_log.sql` — email send log + reminder idempotency guard — **applied via psql 2026-07-20**

---

## ✅ Gate 1 — Transactional email (Resend) — CLOSED (prod)

**Status:** live in production. `RESEND_API_KEY` + `RESEND_FROM_EMAIL` set on
Vercel (Preview + Production). `isEmailReady()` is true; sends go through Resend
and are logged to `email_log`.

**Optional companion:** `TEAM_NOTIFY_EMAILS` (or legacy `INQUIRY_NOTIFY_EMAIL`)
for internal new-lead pings. Deferred while lead volume is low — does not block
customer confirmation email. See scoreboard below.

**Templates:** waitlist confirmation, inquiry ack, new-lead notice (live).
`verification` / `welcome` remain design stubs until M1 auth email wiring.

---

## 🔒 Gate 2 — Payments (Stripe) — OPEN (non-blocking for waitlist)

**Blocked on:** Stripe keys + webhook registration.

**Does not block Sprint 0 / waitlist.** Checkout and webhook return 503 until
configured. No customer booking UI depends on this yet (full book flow is M2).

**Provide:**
- `STRIPE_SECRET_KEY` (`sk_test_…` then `sk_live_…`)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (`pk_…`)
- `STRIPE_WEBHOOK_SECRET` (`whsec_…`) — from the webhook endpoint you register

**Setup once keys exist:**
1. Register a webhook endpoint in Stripe →  
   `https://www.screwitpro.com/api/payments/webhook`  
   events `checkout.session.completed`, `checkout.session.expired`.  
   Copy its signing secret into `STRIPE_WEBHOOK_SECRET`.
2. Local test: `stripe listen --forward-to localhost:3000/api/payments/webhook`,  
   then pay with test card `4242 4242 4242 4242`.
3. Verify the `orders` row flips to `deposit_paid` and a `payments` row is written.

**Cutover:** `isStripeReady()` / `isStripeWebhookReady()` flip; checkout + webhook
routes go live. Card is saved off-session for the balance-at-delivery charge (M4).

---

## ✅ Gate 3 — People mirror to Users CRM Google Sheet (n8n) — CLOSED (prod)

**Status:** built, configured, and **active in production**. Verified end-to-end
(a waitlist signup wrote a correct row). `N8N_CRM_WEBHOOK_URL` is set on Vercel.

- Workflow: "ScrewIt Pros — Users CRM → Google Sheets"  
  (`https://oncode.app.n8n.cloud/workflow/zRkcIerGqorr0zN7`), **active**.
- Webhook path: `screwitpro-crm` → prod URL  
  `https://oncode.app.n8n.cloud/webhook/screwitpro-crm`.
- Sheet: **ScrewIt Pros — Users CRM**  
  (`https://docs.google.com/spreadsheets/d/1Ye_dRK7Bi0MpddnbPhvRvHji2qg7H9oiIpnOCh1KgTk`).
- Node operation: **append-or-update keyed on `email`** (upsert — no duplicate people).
- Columns: `email, name, on_waitlist, provider, source, created_at, converted_at, user_id`.

**Model:** one row per person. Waitlist entry and "user" share this sheet until
conversion (`on_waitlist` TRUE = waiting, FALSE = converted). Both waitlist
signups (`source=join`) and quote inquiries (`source=quote`) upsert here.

**Later — flip on_waitlist to FALSE on conversion:** when a person becomes an
active/serviced customer (M2 first order), POST the same webhook with
`on_waitlist=FALSE` + `converted_at` + `user_id`; the upsert updates their row.

> Prefer Microsoft Excel (OneDrive/365)? Swap the Google Sheets node for the
> Excel node — the app side is destination-agnostic and needs no change.

---

## ✅ Gate 4 — Internal leads dashboard token — CLOSED (prod)

**Status:** `ADMIN_DASHBOARD_TOKEN` set on Vercel (Preview + Production).  
Open `/admin/leads?key=<token>`. Until M1 role-based auth lands, this shared
token is the interim gate.

---

## ✅ Gate 5 — Google Analytics (GA4) — CLOSED (prod)

**Status:** SEO + analytics built; Measurement ID **`G-42LFZYNNQ2`** set on
Vercel as `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID`. Collecting in production.

**Stream URL is just a label.** GA4 never verifies domain ownership (that's Search
Console). The Measurement ID binds to the *data stream*, not the domain. After
domain cutover, update the stream website URL in the GA4 console to
`https://www.screwitpro.com` (see steps in `SPRINT-0-STATUS.md` / below). The
ID does not change and no code changes.

### How to update the GA4 stream to the real domain

1. Open [Google Analytics](https://analytics.google.com/) → select the ScrewIt property.
2. Bottom-left **Admin** (gear).
3. Under **Data collection and modification** (or property column) → **Data streams**.
4. Click the **Web** stream that uses measurement ID `G-42LFZYNNQ2`.
5. Click the pencil / edit control next to **Stream details** (or **Website URL**).
6. Set **Website URL** to `https://www.screwitpro.com` (match production; www is canonical).
7. Save. No redeploy required — hits already use the Measurement ID.

**Recommended GA4 console settings** (not code, do once):
- **Data retention → 14 months** (Admin → Data retention). Defaults to 2 months and is **not retroactive**.
- **Add `stripe.com` to unwanted referrals** (Admin → Data streams → Configure tag settings → List unwanted referrals). Checkout sends users to Stripe and back; without this, Stripe gets credited as the referral source.
- Expect a hostname split in historical data: pre-cutover hits may show `vercel.app`; post-cutover show `www.screwitpro.com`.

**Note:** `anonymize_ip` is deliberately **not** passed. GA4 anonymizes IPs
unconditionally; passing it makes gtag send it as a custom event parameter
(`ep.anonymize_ip=true`) on every hit while doing nothing for privacy.

---

## ✅ Domain cutover — CLOSED

**Status:** `NEXT_PUBLIC_APP_URL` set on Vercel to **`https://www.screwitpro.com`**.

Verified live: `/robots.txt` host + `/sitemap.xml` locs all use
`https://www.screwitpro.com`. Apex `screwitpro.com` 308s to www.

This single var drives canonical URLs, Open Graph, sitemap, robots host,
JSON-LD, OAuth redirect origin, and (when Gate 2 opens) Stripe return URLs.

---

## Deferred / optional

### Team notify (optional — deferred at low volume)

| Env | Purpose |
|---|---|
| `TEAM_NOTIFY_EMAILS` | Comma-separated team inboxes for new-lead notices |
| `INQUIRY_NOTIFY_EMAIL` | Legacy single-address fallback |

Unset = no team ping; customer confirmation + Supabase + CRM + admin still work.
Enable when lead volume or SLA needs inbox alerts.

### Deferred to M1+ (per docs/ARCHITECTURE-PLAN.md)

- Full portal route groups + role middleware (token admin is interim).
- Sign-in / password-reset pages; email verification wired into signup
  (`verification` / `welcome` templates already designed).
- 13 canonical ops migrations; interim `orders` / `payments` / `inquiries` are
  forward-compatible subsets that M1 extends.
- Role-based guards replace the `ADMIN_DASHBOARD_TOKEN` gate.
- CRM `on_waitlist=FALSE` flip on first serviced order (M2).

---

## Scoreboard / "ready to operate" checklist

- [x] Supabase migrations applied (`inquiries`, `orders_payments_interim`, `email_log`)
- [x] **Gate 1:** Resend live in prod → customer emails sending
- [ ] **Gate 2:** Stripe keys + webhook → live payments (**open — non-blocking**)
- [x] **Gate 3:** n8n CRM webhook live in prod → sheet rows on join
- [x] **Gate 4:** `ADMIN_DASHBOARD_TOKEN` in prod → leads dashboard
- [x] **Gate 5:** `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` in prod → GA4 collecting
- [x] **Domain:** `NEXT_PUBLIC_APP_URL=https://www.screwitpro.com`
- [ ] **Optional:** `TEAM_NOTIFY_EMAILS` when volume warrants team pings
- [ ] **Optional:** GA4 stream Website URL label → `https://www.screwitpro.com`
- [ ] **Optional:** GA4 data retention 14 months + `stripe.com` unwanted referral

**Sprint 0 operate-as-waitlist: YES.**  
**Next product phase: M1 (or Gate 2 when you want deposits).**
