# Screw It Pro — Data Architecture (Foundation)

**Status:** v0 foundation  
**Date:** 2026-07-09  
**Goal:** Smallest schema that supports today’s waitlist/newsletter + tomorrow’s roles, subscriptions, and rewards — without overbuilding orders yet.

---

## Design principles

1. **People = one `profiles` row** linked 1:1 to Supabase `auth.users`. Role is a column, not separate user tables.
2. **Leads ≠ accounts.** Waitlist and newsletter are pre-auth tables. When someone upgrades to a real account, we link them (`converted_user_id`).
3. **Catalog vs instance.** Plans and rewards are catalogs; subscriptions and redemptions are per-user instances.
4. **Points are append-only.** Balance is derived from a ledger (and cached on `profiles` for fast reads). Never “edit points” without a ledger row.
5. **Expand later, don’t invent now.** No `orders`, `jobs`, `boxes`, or driver tables in v0. Those attach to `profiles` when MVP ops starts.

---

## Roles (single source of truth)

| Role | Portal | Notes |
|------|--------|--------|
| `customer` | `/customer/*` | Default for self sign-up |
| `admin` | `/admin/*` | Ops / control center |
| `technician` | `/tech/*` | Hub assembly workforce |
| `driver` | `/driver/*` | Reserved now; same pattern later |

Workforce extras (invite tokens, claim flags, capacity) can be columns or a `staff_profiles` extension table later. v0 only needs `role` + `status`.

---

## Entity map (v0)

```text
auth.users  (Supabase Auth)
    │ 1:1
    ▼
profiles ──────────────┬── subscriptions ──► subscription_plans
    │                  │
    │                  └── point_ledger
    │                          │
    │                          └── reward_redemptions ──► reward_items
    │
    │ (optional link when lead converts)
    │
waitlist_entries
newsletter_subscribers
```

### What’s intentionally out of v0

- Orders / inbound boxes / assembly jobs / delivery slots  
- Chat / FAQ CMS / pricing rules  
- Stripe webhooks (columns reserved nullable for later)  
- Driver-specific tables  

Those hang off `profiles.id` and won’t require a redesign.

---

## Tables

### 1. `profiles`

App identity for every signed-in person.

| Column | Type | Notes |
|--------|------|--------|
| `id` | uuid PK | = `auth.users.id` |
| `email` | text | Denormalized for admin lists |
| `full_name` | text | |
| `avatar_url` | text | |
| `phone` | text | nullable |
| `role` | enum | `customer` \| `admin` \| `technician` \| `driver` |
| `status` | enum | `active` \| `suspended` \| `invited` |
| `points_balance` | int | Cached total (ledger is source of truth) |
| `metadata` | jsonb | Escape hatch |
| `created_at` / `updated_at` | timestamptz | |

**Expand later:** `staff_profiles` (skills, can_claim_jobs), addresses, preferred language.

### 2. `waitlist_entries`

Private-beta queue (already designed). Pre-auth.

| Column | Notes |
|--------|--------|
| email / email_normalized | Unique normalized email |
| name, picture, provider | email \| google \| apple |
| source | e.g. `join` |
| `converted_user_id` | nullable FK → profiles when they create an account |
| metadata | jsonb |

Writes: **server / service role only** (existing Next.js `/api/waitlist`).

### 3. `newsletter_subscribers`

Marketing list, separate intent from waitlist.

| Column | Notes |
|--------|--------|
| email_normalized | Unique |
| source | footer, launch, etc. |
| status | `subscribed` \| `unsubscribed` |
| `converted_user_id` | optional link to profile |
| consented_at | timestamp |

### 4. `subscription_plans` (catalog)

What packages exist.

| Column | Notes |
|--------|--------|
| `code` | stable key: `free`, `basic`, `pro` |
| `name`, `description` | display |
| `price_cents`, `billing_interval` | `month` \| `year` \| `one_time` \| `none` |
| `stripe_price_id` | nullable until Stripe wired |
| `points_multiplier` | e.g. 1.0 / 1.5 |
| `features` | jsonb list of feature flags |
| `sort_order`, `is_active` | |

### 5. `subscriptions` (instance)

Which plan a user is on.

| Column | Notes |
|--------|--------|
| `user_id` | FK profiles |
| `plan_id` | FK subscription_plans |
| `status` | `active` \| `trialing` \| `past_due` \| `canceled` \| `expired` |
| period start/end | nullable for free tier |
| `stripe_subscription_id` | nullable until Stripe |
| one active subscription per user (partial unique) |

### 6. `point_ledger`

Immutable credit/debit log.

| Column | Notes |
|--------|--------|
| `user_id` | |
| `delta` | +earn / −spend |
| `balance_after` | snapshot after change |
| `reason` | signup_bonus, order_earn, redemption, admin_adjust, subscription_bonus |
| `reference_type` / `reference_id` | polymorphic link later (order, reward, …) |
| `note` | admin optional |

### 7. `reward_items` (catalog)

| Column | Notes |
|--------|--------|
| name, description | |
| `points_cost` | |
| `inventory` | nullable = unlimited |
| `is_active` | |

### 8. `reward_redemptions`

| Column | Notes |
|--------|--------|
| user_id, reward_id | |
| points_spent | |
| status | `pending` \| `fulfilled` \| `canceled` |
| ledger_entry_id | optional FK to point_ledger |

---

## Auth & RLS (v0 rules)

| Table | Anon | Authenticated user | Service role |
|-------|------|--------------------|--------------|
| profiles | — | read/update **own** row | full |
| waitlist_entries | — | — | full (API only) |
| newsletter_subscribers | — | — | full (API only) |
| subscription_plans | read active | read active | full |
| subscriptions | — | read **own** | full |
| point_ledger | — | read **own** | full |
| reward_items | read active | read active | full |
| reward_redemptions | — | read **own** | full |

Admins: for v0, admin portal uses **service role on the server** (or a later `is_admin()` policy). Don’t put service role in the browser.

---

## App layer (already / next)

```text
Next.js App Router
  ├── Browser client   → createBrowserClient (anon + user JWT)
  ├── Server client    → createServerClient (cookies / SSR)
  └── Admin client     → service role (API routes only)

Current: POST /api/waitlist  → waitlist_entries
Next:    newsletter API, profile bootstrap on sign-up, plan read, points read
Later:   orders, jobs, Stripe webhooks → subscriptions + ledger
```

---

## Seed plans (v0 defaults)

| code | name | price | notes |
|------|------|-------|--------|
| `free` | Free | $0 | Default for new customers |
| `basic` | Basic | placeholder | Expand when pricing locked |
| `pro` | Pro | placeholder | Expand when pricing locked |

Exact dollar amounts are placeholders — change in admin later without schema changes.

---

## Migration path (how we expand)

| Phase | Add |
|-------|-----|
| **Now (v0)** | profiles, waitlist, newsletter, plans, subscriptions, points, rewards |
| **Auth polish** | Trigger: on `auth.users` insert → create `profiles` + free subscription |
| **MVP ops** | orders, order_items, inbound_boxes, status history |
| **Workforce** | assignments, delivery_slots, staff extensions |
| **Money** | Stripe customer id on profiles; webhook → subscriptions + ledger |
| **Loyalty depth** | tiers, expiring points, partner rewards |

---

## Source of truth files

| Artifact | Path |
|----------|------|
| This doc | `docs/DATA_ARCHITECTURE.md` |
| Waitlist migration (original) | `my-app/supabase/migrations/20260709120000_waitlist_entries.sql` |
| Foundation migration | `my-app/supabase/migrations/20260709140000_foundation_schema.sql` |
| Role routes | `my-app/SITEMAP.md` |
| Product roles / flows | `my-app/USER-FLOWS.md` |
