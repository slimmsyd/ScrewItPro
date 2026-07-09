# Screw It Pro — Design Phase Index

This directory is the **design-phase deliverable hub** for the Screw It Pro MVP. Everything in `my-app/*.md` and `my-app/wireframes/*.md` together forms the complete brief the build phase will consume.

**No code in this phase** (per user constraint). All artifacts are markdown + ASCII wireframes — version-controllable, reviewable in any editor, and liftable into Figma later without intent loss.

---

## What's Here

```
my-app/
├── Project.md                       — Original proposal (source of truth for scope)
├── DESIGN.md                        — Visual design system (Google Stitch DESIGN.md format)
├── USER-FLOWS.md                    — Mermaid flow diagrams per role + state machine
├── SITEMAP.md                       — Route tree per role + global nav chrome
└── wireframes/
    ├── README.md                    — (this file)
    ├── customer-portal.md           — 13 customer-facing screens
    ├── admin-dashboard.md           — 14 admin operational screens
    ├── tech-driver-portals.md       — 11 mobile-first workforce screens
    └── email-templates.md           — 18 transactional email templates

Companion (lives outside the repo):
~/.claude/plans/examien-the-contetfiles-nad-valiant-hamming.md
                                    — Architecture brief (18 locked decisions)
```

---

## Deliverable Crosswalk

| # | Deliverable | File | Status |
|---|---|---|---|
| — | Architecture brief | `~/.claude/plans/examien-...md` | ✅ |
| 1 | DESIGN.md (visual system spec) | `my-app/DESIGN.md` | ✅ |
| 2 | User flow diagrams | `my-app/USER-FLOWS.md` | ✅ |
| 3 | Information architecture / sitemap | `my-app/SITEMAP.md` | ✅ |
| 4 | Customer portal wireframes | `my-app/wireframes/customer-portal.md` | ✅ |
| 5 | Admin dashboard wireframes | `my-app/wireframes/admin-dashboard.md` | ✅ |
| 6 | Tech + Driver mobile wireframes | `my-app/wireframes/tech-driver-portals.md` | ✅ |
| 7 | Email template panels | `my-app/wireframes/email-templates.md` | ✅ |
| 8 | Edge-case + empty-state pass | Inline within each wireframe file | ✅ (inline) |
| 9 | Design spec / component inventory | See "Component Inventory" below | ✅ (this file) |
| 10 | Click-through prototype | Figma — not produced in this phase | ⏸ deferred |
| 11 | DESIGN.md refresh | After build-phase wireframe review | ⏸ deferred |
| 12 | Build-phase handoff brief | (this file) | ✅ |

---

## How to Use This Brief (build-phase guidance)

### Order of consumption

1. **Architecture brief first** (`~/.claude/plans/...`). It contains the 18 locked decisions, the data model, and the "why" behind every screen. Read it once before touching code.
2. **DESIGN.md second.** Internalize the token vocabulary and the anti-slop bans. Generators (Claude Code, Cursor, Stitch, Figma Make) should read this directly.
3. **USER-FLOWS.md + SITEMAP.md third.** These two together define every route and every state transition. Bookmark them.
4. **Wireframes last,** when actually implementing a specific screen. Open the matching file (customer / admin / tech-driver / email), find the screen, build to spec.

### Build sequencing (recommended)

Maps to the architecture brief's "Suggested Design Deliverable Sequencing" but framed for code:

1. **Foundation** — Next.js App Router setup, Supabase project, role-based auth, RLS, role-router middleware, route-group layouts per role.
2. **Public surface** — Landing refinement (existing components), `/pricing` quote calculator, `/contact`, `/faq`.
3. **Auth surface** — Sign-up modal, sign-in, forgot-password, `/auth/accept-invite`.
4. **Customer booking → payment** — `/customer/book` 5-step form, Stripe Checkout, `/customer/orders`, `/customer/orders/[id]`.
5. **Pending Quote loop** — Customer-flag toggle, admin Set Price flow, `/customer/orders/[id]/quote`, signed-deep-link tokens.
6. **Admin order management** — `/admin` Today dashboard, `/admin/orders`, `/admin/orders/[id]`, status control, audit log.
7. **Inbound flow** — `/admin/inbound` queue, camera scan UI with 7 matching states, orphans + returns.
8. **Assembly loop** — `/admin/assembly` kanban, `/tech/*` mobile portal, photo upload + QC + damage report.
9. **Delivery loop** — `/admin/schedule` calendar + Google Maps embed, slot capacity, driver assignment, `/driver/*` mobile portal, POD + refusal flows.
10. **Damage + Refusal resolution** — `/customer/.../damage-resolve`, `/customer/.../refusal-resolve`, Stripe refunds, returns intake.
11. **Notifications** — Email templates wired to status transitions via Resend (or chosen provider). 18 templates.
12. **Help surface** — `/contact` form, `/admin/inbox` unified queue, "Talk to a human" CTAs wired in.
13. **Settings + Team + FAQ + Pricing CMS** — Admin configuration screens.
14. **Polish + pilot** — End-to-end test cases, sample jobs through hub, deploy, beta with one hub/city.

Phase 2 features (deliberately deferred — see architecture brief Decisions #5, #9, #10, #15): SMS notifications, tech-claim mode, driver-claim mode, AI mascot chatbot, advanced route optimization.

---

## Component Inventory (Deliverable #9)

Every reusable component identified across the wireframes, mapped to DESIGN.md tokens.

### Atoms (single-purpose primitives)

| Component | DESIGN.md token | Used in |
|---|---|---|
| Logo wordmark | `typography.display`, brand color | Every header + email |
| Status chip (12 variants) | `components.status_chip` + `colors.status_*` | Every list + detail showing an order |
| Status dot | `components.status_chip.dot` | Status chip internal |
| Animated pulse | `motion.perpetual.pulse` | `in_assembly` + `out_for_delivery` chips only |
| Mono number | `typography.mono` | Prices, distances, durations, IDs, tracking #s |
| Loading skeleton | `components.loading_skeleton` | Every async data load |
| Toast | `components.toast` (4 variants) | Confirmations, errors, info |

### Buttons

| Variant | DESIGN.md component | Examples |
|---|---|---|
| Primary | `button_primary` | "Get Started", "Pay $238", "Confirm Window", "Send Quote" |
| Secondary | `button_secondary` | "Back", "Edit", "Cancel" |
| Ghost | `button_ghost` | "Resend", "Decline", "Clear" |
| Destructive | `button_destructive` | "Confirm Refusal", "Issue Refund", "Revoke Invite" |

### Forms

| Component | DESIGN.md | Used in |
|---|---|---|
| Text input | `input` | Every form (booking, contact, settings) |
| Textarea | `input` (variant) | Notes, message body, damage description |
| Select dropdown | `input` (variant) | Item class, role, slot capacity |
| Radio group | inline | Refusal reason, service window, severity |
| Checkbox | inline | QC checklist, terms acceptance, item flag |
| Calendar / slot picker | composite (input grid) | `/customer/.../schedule`, `/admin/schedule` |

### Composites

| Component | Composition | Used in |
|---|---|---|
| Order card | `card` + status_chip + mono numbers | `/customer/orders` list, search results |
| Status timeline | vertical list with status_chip dots + audit-log links | `/customer/orders/[id]` |
| Photo uploader | `photo_uploader` (DESIGN.md) — drag-drop + camera | Tech intake, tech final, damage report, refusal, return intake, POD |
| Signature canvas | `signature_canvas` (DESIGN.md) | Driver POD only |
| Kanban card | `kanban_card` | `/admin/assembly` only |
| Kanban swim lane | per-tech grouped column | `/admin/assembly` |
| Map pin | `map_pin` (hub / stop / selected) | `/admin/schedule` only |
| Slot capacity bar | progress bar (`accent` fill) | `/admin/schedule` slot columns |
| Audit log row | flat list with timestamp + actor + action | `/admin/orders/[id]` Audit log panel |
| Email chrome | `email_chrome` plain-HTML scaffold | All 18 email templates |
| Deep-link landing chrome | `deep_link_landing_chrome` | `/customer/.../schedule`, `/quote`, `/damage-resolve`, `/refusal-resolve` |

### Layout / Chrome

| Component | Per role | Notes |
|---|---|---|
| Marketing top nav | Public | Existing `Navbar.tsx` — refinement only |
| Customer top nav | `/customer/*` | "My Orders / Book New / Help" + avatar menu |
| Admin left sidebar | `/admin/*` | 12 items, count badges, mobile-collapse to hamburger |
| Tech bottom nav | `/tech/*` | 3 tabs (Jobs / History / Me); Phase-2 reserves "Available" slot |
| Driver bottom nav | `/driver/*` | 3 tabs (Route / History / Me); Phase-2 reserves "Available" slot |
| Footer | Marketing only | Existing `Footer.tsx` |

### Tables

| Component | Notes |
|---|---|
| Admin Orders Table | sortable columns, mono cells for numbers, hover highlight, row-click → detail |
| Inbound Expected Table | Carrier, tracking, ETA, action column |
| Audit log table | timestamp + actor + transition; collapsible per order |
| Slot grid (capacity view) | day × slot grid with bar charts inline |

### Empty / Error / Loading States

Every screen has at least four variants per the architecture brief verification:
- **Empty** — friendly call-to-action, no error tone
- **Loading** — skeletal (never a circular spinner)
- **Error** — restrained, with retry + contact CTA
- **Permission-denied / 403** — friendly redirect to user's actual portal

See `customer-portal.md` "Cross-Cutting States" section for canonical patterns; same patterns apply across admin, tech, driver.

---

## Open Questions Still to Resolve

(From the architecture brief — they don't block wireframe sign-off but should be answered before each becomes load-bearing in code.)

1. **Item-class price points** — actual dollar amounts for Small / Medium / Large / Complex. Wireframes use $52 / $99 / $169 / $279 as plausible placeholders based on TaskRabbit's $52 IKEA floor.
2. **Rush vs standard window** — "standard" turnaround duration (proposed: 7–10 days) and rush surcharge (proposed: +$40 flat for 3-day).
3. **Refusal policy specifics** — max free reschedules (proposed: 1), restocking fee default (proposed: $25), final disposition path for refused items.
4. **Damage reported post-delivery** — currently out of MVP scope (routes via `/contact`); confirm or design a customer-facing flow.
5. **Partial-order damage / refusal at item level** — wireframes assume per-item granularity on resolution; confirm scope.
6. **Landing-page hero price anchor** — should the hero show "starts at $X" or stay copy-only?
7. **Tip / gratuity** — post-delivery tip prompt for tech + driver? Affects customer Order Detail + POD flow.
8. **Email provider** — Resend recommended; Postmark + SES considered.
9. **SLA defaults** — first-response on inquiries (24h proposed), customer-response timeouts (7d proposed).
10. **Multi-admin permissions** — single `admin` role tier in MVP or sub-roles (owner / ops manager / hub worker)?

---

## Anti-Slop Quality Gates

Before any wireframe is approved as "ready for build," it passes this checklist (drawn from DESIGN.md §8):

- [ ] No emojis in product UI (status dots are colored circles, not emoji glyphs).
- [ ] No `Inter` font referenced.
- [ ] No pure `#000000` anywhere.
- [ ] No outer-glow / neon shadows.
- [ ] No oversaturated accent fills.
- [ ] No 3-equal-cards feature row.
- [ ] No `LABEL // YEAR` typography conventions.
- [ ] No fabricated metrics (placeholders in `[brackets]` instead).
- [ ] No fake customer reviews / testimonials.
- [ ] No AI copywriting clichés ("Elevate," "Seamless," "Unleash," "Next-Gen").
- [ ] No bouncing chevron / scroll-arrow on hero.
- [ ] No centered hero on internal portal screens (landing only).
- [ ] No playful illustration on damage / refusal flows.
- [ ] Mono font on numbers across all tables.
- [ ] Touch targets ≥ 44px on tech / driver portals.
- [ ] Mobile-first collapse below 768px on every multi-column layout.

---

## Verification (full design phase)

- ✅ Every screen named in `SITEMAP.md` has a wireframe.
- ✅ Every flow node in `USER-FLOWS.md` lands on a wireframed screen.
- ✅ Every status in the lifecycle state machine has a corresponding UI surface.
- ✅ Every customer-facing email transition from the architecture-brief Communications Spine has a template.
- ✅ Every signed-deep-link purpose (`window_pick`, `damage_resolve`, `refusal_resolve`, `quote_approve`) has a destination wireframe + an email template that links to it.
- ✅ Every component identified in wireframes is mapped to a `DESIGN.md` token.
- ✅ The 18 architectural decisions in the brief are reflected in at least one wireframe each.
- ✅ Phase 2 scaffolding (tech-claim, driver-claim, SMS, AI chatbot) is reserved in data model + nav without surfacing in MVP UI.

---

## Where to Pick Up Next

If the design phase is being handed off:
- **For a designer:** Lift the ASCII wireframes into Figma. DESIGN.md tokens import cleanly into Figma variables. Use the wireframe files as a comprehensive screen list.
- **For an engineer:** Start the foundation step in the build sequencing above. Reference DESIGN.md tokens via Tailwind's theme extension. Wireframes are the visual spec — Figma is optional.
- **For an AI agent (Claude Code / Stitch / Cursor):** Read `DESIGN.md` first, then the relevant wireframe file when generating a screen. The anti-slop bans in DESIGN.md §8 are non-negotiable.

If the user has feedback to incorporate before handoff:
- Format objections (ASCII vs HTML mock vs Figma) → re-render the wireframe files in the preferred format. Content remains valid.
- Decision changes → update the architecture brief Decision Log first; everything else follows from that.
