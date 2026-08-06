# Admin UI port — scoreboard

**Kit source:** `~/Desktop/ui_kits 2/admin/admin-export/`  
**App:** `my-app/` under `/admin/*`  
**Branch policy:** PRs → `develop` only (`vault/decisions.md` D-BRANCH).

Status values: `planned` | `in_progress` | `ui_only` | `read_live` | `read_write` | `done`

| # | Page | Kit file | App route | Status | Notes |
|---|------|----------|-----------|--------|-------|
| 0 | Shell + progressive nav | `Admin.html` | `admin/(app)/layout` | **done** | Shipped links only; unshipped disabled |
| 1 | Settings | `admin-settings.jsx` | `/admin/settings` | **read_write** | Shell + sections. **Service area live** (hub, free radius, farFee, ZIP). Deposit % live. Hours/work/pricing fields saved; board/quote not fully driven. **Roles pane = kit only** — next: `docs/HANDOFF-settings-next-roles.md`. |
| — | Leads (pre-kit) | — | `/admin/leads` | **done** | Kept under shell; CSV export |
| 2 | Email templates | `admin-emails.jsx` | `/admin/emails` | planned | Partial API exists |
| 3 | Overview | `admin-overview.jsx` | `/admin/overview` | planned | |
| 4 | Orders + Inspector | `admin-orders.jsx` | `/admin/orders` | planned | Needs order list API |
| 5 | Customers | `admin-customers.jsx` | `/admin/customers` | planned | |
| 6 | Team | `admin-team.jsx` | `/admin/team` | planned | |
| 7 | Payments | `admin-payments.jsx` | `/admin/payments` | planned | |
| 8 | Reports | `admin-reports.jsx` | `/admin/reports` | planned | |
| 9 | Today’s Board | `admin-board.jsx` | `/admin/board` | planned | **Blocked** on legs model |
| 10 | Schedule | `admin-schedule.jsx` | `/admin/schedule` | planned | **Blocked** with Board |

## How to use this file

1. One slice per PR; update the row status in the same change.
2. Progressive nav (`adminNav.ts`) marks `shipped: true` only when the route works.
3. Stop after each slice for owner review — do not auto-start the next page.

## Product truths (override kit seed)

| Setting | Product | Kit seed (do not copy) |
|---------|---------|------------------------|
| Deposit | **30%** (`app_settings.deposit_percent`) | 70% |
| Service radius | **40 mi** (`app_settings.hub` / `BUSINESS.geo`) | 30 mi |

## Vault

When adding shells, routes, or admin APIs, update `vault/components.md`, `vault/architecture.md`, and `vault/security.md` in the same PR.
