# ScrewIt Pros — Agent instructions

White-glove furniture assembly + hub logistics platform (Houston).  
**Runnable app:** `my-app/`  
**Stack (summary):** Next.js 16 · React 19 · Supabase · Stripe · Resend · Tailwind 4 / CSS variables · Framer Motion

---

## Branch policy (locked)

| Branch | Purpose |
|--------|---------|
| **`main`** | **Marketing site only** (public landing / waitlist-era production). Do **not** merge quote, portal, My Jobs, booking, or ops platform work here until an explicit product launch decision. |
| **`develop`** | **Default integration branch** for all product engineering (quote, soft-gate book, My Jobs, emails, Phase C, etc.). Open PRs → `develop`. |

**Agents:** Always branch from and PR into **`develop`**, never **`main`**, unless the user explicitly asks for a marketing-only fix on `main`.

---

## Source of truth: the Vault

**Project standards live in [`vault/`](./vault/).**  
If a habit, component choice, security rule, or visual token conflicts with scattered docs or chat memory, **prefer the Vault.**

| File | Purpose |
|------|---------|
| [`vault/architecture.md`](./vault/architecture.md) | Tech stack, directory map, surfaces, locked design decisions, as-built vs planned |
| [`vault/security.md`](./vault/security.md) | Auth, Supabase client roles, RLS classes, data-handling, forbidden patterns |
| [`vault/components.md`](./vault/components.md) | Catalog of UI primitives + domain shells — **check before creating components** |
| [`vault/branding_and_design.md`](./vault/branding_and_design.md) | Live tokens (CSS), brand colors, typography, assets, motion, anti-patterns |

Deeper roadmaps and specs remain in [`docs/`](./docs/) and `my-app/{DESIGN,SITEMAP,USER-FLOWS}.md` / `wireframes/`. Those explain *where we’re going*; the Vault defines *how we build*.

---

## Self-documentation rules (mandatory)

### 1. Check first

- Before **new UI**, read `vault/components.md` and reuse or extend what exists.
- Before **auth / data / API** work, read `vault/security.md`.
- Before **structure / integrations**, read `vault/architecture.md`.
- Before **visual / styling** work, read `vault/branding_and_design.md` (live tokens = `my-app/src/app/globals.css`).

### 2. Update as you go

Whenever you:

- make a major architectural decision,
- introduce a reusable component or shell,
- change authz/RLS/secret handling, or
- solve a “funky” bug that would burn the next session,

**update the relevant Vault file in the same change.** Do not leave tribal knowledge only in chat.

### 3. Anchor to examples

- UI: cataloged components in `vault/components.md` (e.g. `Button`, `CustomerAppShell`, `QuoteShell`, `OrderStatusTag`).
- API: `my-app/src/app/api/waitlist/route.ts` — Zod + `{ ok, error }` machine codes.
- Env: `my-app/src/lib/env.ts` — `publicEnv` / `serverEnv`.
- Styling: CSS variables from `globals.css`, not one-off hex systems.

---

## Working agreements

- Application code lives under **`my-app/`**. Repo root holds Vault, docs, and agent instructions.
- Prefer **API route handlers** for mutations (not ad-hoc Server Actions) unless architecture explicitly changes.
- **Church vs state:** marketing chrome (`components/home`) vs customer portal (`CustomerAppShell`) — don’t mix casually.
- Never commit `.env.local`, secrets, or local `.vercel/` deploy junk.
- Respect **in-progress uncommitted WIP** on shared branches (portal account/notifications/orders mocks) — don’t rewrite others’ files without coordination.
- Separate **as-built** from **planned** (full ops platform in `docs/ARCHITECTURE-PLAN.md` is largely not built).

---

## Quick start (local)

```bash
cd my-app
npm install
cp .env.example .env.local   # fill keys
npm run dev
```

See `my-app/README.md` for env details. Prefer code + Vault over outdated README sections when they disagree (e.g. auth is Supabase OAuth now).

---

## Table of contents

1. [Vault — architecture](./vault/architecture.md)
2. [Vault — security](./vault/security.md)
3. [Vault — components](./vault/components.md)
4. [Vault — branding & design](./vault/branding_and_design.md)
5. [Docs corpus](./docs/)
6. [App README](./my-app/README.md)
