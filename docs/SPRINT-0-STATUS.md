# Sprint 0 — Phase status

_Last updated: 2026-07-20_

**Verdict: Sprint 0 is closed for waitlist launch.**  
The capture layer is live in production. Remaining items do **not** block
running the waitlist, collecting leads, emailing joiners, or operating CRM +
admin.

---

## Phase map

| Phase | Goal | Status |
|---|---|---|
| **Sprint 0** | Marketing + waitlist + email + CRM + SEO/GA4 + interim payments scaffold + Google→Supabase auth | **✅ Complete** (waitlist-ready) |
| **M1** | Full ops schema, role guards, portal shells, invite/reset auth | Not started |
| **M2** | Customer booking + deposit checkout as a product surface | Scaffold only (Gate 2 open) |
| **M3–M5** | Admin ops, tech/driver, Chip AI | Not started |

Canonical build plan: [`ARCHITECTURE-PLAN.md`](./ARCHITECTURE-PLAN.md).  
Gate detail (env / credentials): [`MVP-GATES.md`](./MVP-GATES.md).  
Waitlist flow (how join works): [`WAITLIST-FLOW.md`](./WAITLIST-FLOW.md) (may land separately).

---

## What Sprint 0 delivered (live)

| Capability | Production state |
|---|---|
| Landing + waitlist UX (`SITE_MODE = waitlist`) | Live |
| Join ×3 (email signup, email login, Google OAuth → Supabase) | Live |
| Waitlist confirmation email (Resend) | Live — Gate 1 closed |
| `email_log` audit of every send attempt | Live (migration applied 2026-07-20) |
| People → Supabase + n8n → Users CRM sheet | Live — Gate 3 closed in prod |
| Internal leads dashboard + CSV (`/admin/leads?key=…`) | Live — Gate 4 token in prod |
| GA4 (`G-42LFZYNNQ2`) | Connected in prod — Gate 5 closed |
| Domain cutover (`NEXT_PUBLIC_APP_URL`) | Live → `https://www.screwitpro.com` |
| SEO (sitemap, robots, JSON-LD, AEO Houston page) | Live (URLs use real domain) |
| Interim Stripe checkout + webhook | **Code only** — 503 until Gate 2 |

---

## Open items (non-blocking for waitlist)

### Gate 2 — Stripe (still open)

**Does not break waitlist.** Checkout routes return `503` until keys exist.

When ready to take deposits:

1. Set `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` on Vercel.
2. Register webhook → `https://www.screwitpro.com/api/payments/webhook`  
   events: `checkout.session.completed`, `checkout.session.expired`.
3. Test with `4242…` in test mode before going live.

Full product booking UI is still **M2**; this gate only unlocks the interim API path.

### Team notify emails (optional / deferred)

`TEAM_NOTIFY_EMAILS` (falls back to `INQUIRY_NOTIFY_EMAIL`) pings the team on
each new lead. **Optional at low volume.**

- Customer confirmation still sends (Gate 1).
- Leads still land in Supabase + CRM sheet + admin export.
- Turn team notify on when volume or response-time needs inbox pings.

Does **not** make or break Sprint 0.

---

## Gate scoreboard (2026-07-20)

| Gate | What | Status |
|---|---|---|
| 1 | Resend transactional email | ✅ Closed (prod) |
| 2 | Stripe deposit path | 🔒 Open — non-blocking for waitlist |
| 3 | n8n → Users CRM | ✅ Closed (prod) |
| 4 | Admin dashboard token | ✅ Closed (prod) |
| 5 | GA4 | ✅ Closed (prod) |
| — | Domain cutover (`NEXT_PUBLIC_APP_URL`) | ✅ Closed → `https://www.screwitpro.com` |
| — | Team notify list | ⏸️ Deferred (optional) |

---

## Next phase when you resume product work

1. **Optional:** flip Gate 2 when ready for money.  
2. **M1** per `ARCHITECTURE-PLAN.md` — ops schema, role-based auth, portal shells.  
3. **M2** — real booking + deposit as the customer product (replaces interim-only path).

Until then, operate as: **waitlist capture business** (site → join → email → CRM → admin).
