# Handoff: Admin Settings (Service Area done) → Roles & access next

**Date:** 2026-08-06  
**PR base:** `develop` only (`vault/decisions.md` D-BRANCH)  
**Session temp copy:** also written via handoff skill (`mktemp handoff-*.md`)

---

## Tracked work (merged on develop)

| PR | Summary |
|----|---------|
| [#35](https://github.com/slimmsyd/ScrewItPro/pull/35) | Where we work + Model 1 travel + admin shell/settings |
| [#36](https://github.com/slimmsyd/ScrewItPro/pull/36) | Remove Settings address tester + free-zone blurb |
| [#37](https://github.com/slimmsyd/ScrewItPro/pull/37) / [#38](https://github.com/slimmsyd/ScrewItPro/pull/38) | Settings `?` help tips + unclip/portal fix |
| [#39](https://github.com/slimmsyd/ScrewItPro/pull/39) | Remove unused distance-tier UI |
| [#40](https://github.com/slimmsyd/ScrewItPro/pull/40) | Wire ZIP exceptions end-to-end |

Also: `docs/WHERE-WE-WORK.md`, `docs/HANDOFF-service-area-model-b.md`, vault updates.

---

## Settings sections — reality check

**UI:** `my-app/src/components/admin/SettingsView.tsx`  
**API:** `GET/PUT /api/admin/settings` → `deposit_percent`, `hub`, `ops_rules`  
**Help pattern:** `HelpTip` / `Row help=` / `Head help=` in `settingsPrimitives.tsx`

| Key | Section | Status | Used by product? |
|-----|---------|--------|------------------|
| `area` | Service area | **Done / live** | Hub, free radius, farFee, ZIP exceptions → map + quote + server draft |
| `price` | Pricing | Partial | **Deposit % live**; base/perItem/membership mostly stored only |
| `hours` | Hours and capacity | Partial | Saved; not full board/schedule driver |
| `work` | Work durations | Partial | Saved; not full legs engine |
| `emails` | Customer emails | Mostly chrome | List + note; full templates port planned |
| `access` | **Roles and access** | **UI kit only** | **Next target** — table is not enforcement |

**Service area locks (do not reopen):**

- Free zone = radius; fee only past radius (`farFee`)  
- No distance-tier editor  
- ZIP refuse/surcharge wired (server authoritative)  
- Drive minutes = policy only  

---

## Next: Roles and access

### Live authz (read vault first)

- `requireAdmin()` — only real admin gate for `/admin/*` APIs  
- Super-admin: `SUPER_ADMIN_EMAILS`  
- DB admin: `profiles.role = 'admin'` + `status = 'active'`  
- Enum as-built: `customer` | `admin` | `technician` | `driver`  
- Display role: `session-identity.ts` + account menu — **not** authorization  
- Field portals / kit “Field only” **not** shipped  

### Suggested first PR for Roles

1. Replace kit matrix with **truthful** copy: who can open Admin today + how to bootstrap.  
2. Optional: `requireAdmin` list of profiles with `role = admin`.  
3. Do **not** ship promote/demote without explicit product + security review.  
4. Do **not** issue technician/driver logins until those surfaces exist.  

**Open first:**

- `lib/auth/require-admin.ts`, `roles.ts`, `session-identity.ts`  
- Settings `access` pane in `SettingsView.tsx`  
- `vault/security.md`  
- `docs/ADMIN-PORT.md` (Team / Settings scoreboard)  

---

## After Roles (other Settings dropdowns)

1. Pricing — wire quote to admin base/perItem if product wants  
2. Hours / work — when board/schedule consumes ops_rules  
3. Emails — `/admin/emails` port  

Full admin page order: still `docs/ADMIN-PORT.md`.

---

## Skills

Vault + security first → optional TDD for role helpers → optional ui-ux-pro-max for access pane polish.

---

## North star

Every Settings control is either **live end-to-end** (like Service area) or **honestly marked planned**. Next: make **Roles and access** honest and, if scoped, list real admins—without fake multi-role enforcement.
