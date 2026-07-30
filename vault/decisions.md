# Locked decisions

**Status:** active until the product owner **explicitly updates** this file.  
Agents and humans: if chat memory conflicts with this page, **this page wins**.

---

## D-BRANCH — Git branch policy (2026-07-30)

| Branch | Role | May receive |
|--------|------|-------------|
| **`main`** | **Marketing production only** | Landing, waitlist/`SITE_MODE=waitlist`, join, legal, AEO marketing pages. Tip reference: `dac1a31` (Sprint 0 closeout era marketing surface). |
| **`develop`** | **Product integration / DEV** | Quote flow, soft-gate book, My Jobs, portal, booking emails, Phase C, vault product work. **Default PR base.** |

### Rules (mandatory until updated)

1. **All product engineering PRs target `develop`**, never `main`.
2. **Do not merge** quote, `/customer/*`, booking, My Jobs, order spine product UI, or ops platform onto `main` without an **explicit product-owner instruction** that marketing launch is intentional.
3. Branch from **`develop`** for features. Name like `feat/…` → open PR → **`develop`**.
4. Fixes that only touch marketing on production: rare; still prefer confirming with the owner. Default is still `develop` unless they say “marketing-only on main.”
5. **`SITE_MODE` on `main` stays `waitlist`** (Join Now, not Get a Free Quote portal) until the owner changes this decision.

### Forbidden (on `main`) until owner updates this decision

- Shipping full quote wizard as primary CTA  
- Soft-gate / real booking paths as public production product  
- Customer portal as the marketed experience  
- Assuming “merge to main” means “ship the platform”

### History note

- 2026-07-30: Product work was briefly merged to `main` via PR #33; **reverted** and `main` reset to marketing tip `dac1a31`. Product remains on **`develop`**.

### How to change this decision

Only the product owner (or an agent under their direct instruction) may edit this section. When launching product from marketing:

1. Update this file (new date + “launch” note).  
2. Plan a deliberate `develop` → `main` (or release) merge.  
3. Flip `SITE_MODE` / deploy config as specified in that update.

---

## D-REFERRAL-POINTS — Referral point amounts (2026-07-30)

**Locked product intent**

| Rule | Detail |
|------|--------|
| Unit of record | **Points** (not dollars). Dollar conversion is a future redemption layer. |
| Earn trigger (v1) | Friend’s **first signup** via opaque personal link (`/r/{code}`). Both sides earn. |
| Who may change amounts | **Ops admin via Admin UI** — not hardcoded forever in app deploys. |
| Until Admin UI ships | Scaffold amounts live in SQL `claim_referral` + `lib/referrals/config.ts` (**must stay in sync**). Eng-only edits. |

### Deferred (revisit when Admin UI is built)

1. Admin screen to set **referrer** and **referee** points (and optionally caps / earn trigger).  
2. Prefer `app_settings` (or admin-owned config table) as single source of truth so claim RPC + portal copy read the same values.  
3. Changing rates does **not** retroactively rewrite past `referral_attributions` / ledger rows unless ops explicitly chooses a migration tool.  
4. Points → dollars conversion rates and redeem UX — separate decision after Admin + rewards catalog.

### Forbidden until Admin UI decision is implemented

- Assuming dollar store credit is the referral reward  
- Building a second ad-hoc “credit balance” parallel to `points_balance` without an ADR

### How to change this decision

Product owner updates this section when Admin referral settings ship or earn trigger moves (e.g. first book / delivered).

---

## Related vault files

- `vault/architecture.md` — stack + surfaces (mirrors branch summary)  
- `CLAUDE.md` / `AGENTS.md` — agent entrypoints point here  
