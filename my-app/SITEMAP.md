# Screw It Pro — Sitemap & Information Architecture

The complete route tree for every role in the MVP, the global navigation chrome per role, and the cross-cutting public/auth surface.

**Companions:**
- `Project.md` — original proposal
- `.../plans/examien-the-contetfiles-nad-valiant-hamming.md` — architecture brief (Decision #3 locks role-prefixed paths)
- `DESIGN.md` — visual tokens
- `USER-FLOWS.md` — flow diagrams that trace these routes

**This is deliverable #3** in the design sequence. Wireframes (deliverables #4–6) are built screen-by-screen against this tree.

---

## Route Architecture Summary

**Decision #3 lock-in:** Role-prefixed paths under one Next.js app with route-group layouts.

```
/                            ← public marketing root
/pricing                     ← public quote calculator
/faq                         ← static FAQ (or inline on landing)
/contact                     ← public contact form (logs to /admin/inbox)

/auth/sign-up                ← customer self sign-up
/auth/sign-in                ← all roles
/auth/forgot-password
/auth/accept-invite          ← workforce invite acceptance (Decision #7)

/403                         ← wrong-role / suspended account

/customer/*                  ← role guard: profile.role == 'customer'
/admin/*                     ← role guard: profile.role == 'admin'
/tech/*                      ← role guard: profile.role == 'technician'
/driver/*                    ← role guard: profile.role == 'driver'
```

**Middleware:** Single Next.js middleware reads the Supabase session, fetches `profiles.role`, and:
- Rewrites `/` → role's home if signed in (skip the marketing page).
- 403s deep-links into a portal whose role-prefix doesn't match the user.
- Allows public routes (`/`, `/pricing`, `/faq`, `/contact`, `/auth/*`) regardless of session state.

**Post-login landing per role:**
- `customer` → `/customer/orders`
- `admin` → `/admin`
- `technician` → `/tech/jobs`
- `driver` → `/driver/route`

---

## A. Public Surface (no auth)

```
/                            Landing page (existing — refinement needed)
│   Nav: top bar (logo · Pricing · FAQ · Contact · Sign in)
│   Sections: Hero · How It Works · Service Area · CTA · FAQ · Footer
│   Components present: Hero.tsx, AssemblyHighlight.tsx, FeatureSection.tsx, FAQ.tsx, Footer.tsx, Navbar.tsx
│   Components to remove/hide for MVP: ChatWidget.tsx (Decision #15)
│
/pricing                     Public quote calculator
│   Hero: "Know exactly what you'll pay"
│   Body: item-class picker (Small/Medium/Large/Complex) + modifiers (rush)
│   Live price card sticky on right
│   CTA: "Book this job" → triggers sign-up modal with state preserved
│
/faq                         Optional standalone FAQ (Decision #15 — chatbot replaced by static)
│   May be inline on /; otherwise its own page
│   Content from faq_entries table
│
/contact                     Contact form
│   Fields: name, email, optional order #, message
│   If signed in: name/email/order # prefilled
│   POST → inquiries row (source=contact_form) → /admin/inbox
│   Success state: "Thanks — we'll reply within 24 hours"
```

**Public global nav (Navbar.tsx):**
```
[Logo]                                            Pricing  FAQ  Contact  [Sign in]
```
On mobile (< 768px), collapses to a hamburger that opens a full-screen menu.

**Public footer (Footer.tsx):**
```
[Logo]                            Service · Pricing · FAQ · Contact · Sign in
                                  Privacy · Terms · © Screw It Pro 2026
```

---

## B. Auth Surface

```
/auth/sign-up                Standalone variant of the sign-up modal
│   Fields: email, password (or "Send magic link" button)
│   Note: most sign-ups happen via the inline modal mid-funnel (Decision #4),
│         this standalone page exists for direct links from emails / SEO
│
/auth/sign-in                Standalone sign-in page
│   Used by returning users + email deep links that 401'd
│   Same two-tab UX (magic link | password)
│   Forgot-password link below the form
│
/auth/forgot-password        Password reset flow
│   Email entry → "We sent you a link" confirmation
│   /auth/reset-password?token=... is the landing for the link
│
/auth/accept-invite          Workforce invite acceptance (Decision #7)
│   Token in query string → validate → show one of three states:
│     · valid: profile form (name, phone, password, accept terms)
│     · expired: "Ask your admin to resend" message
│     · used: same expired message
│   On submit: profile created with role from invite, auto-signed-in,
│              redirected to role's portal home
```

**Auth chrome:** Logo top-left, no full nav. Centered single-column form, max-width 420px. Same DESIGN.md tokens as everywhere else.

---

## C. Customer Portal (`/customer/*`)

```
/customer/orders                     Dashboard — "My Orders"
│   Empty state: "Book your first assembly" CTA
│   List: order cards with status chip, item summary, action hint
│
/customer/orders/[id]                Order Detail — the customer's central screen
│   Sections:
│     · Status timeline (events from order_status_events)
│     · Photos (intake damage + final assembly + POD as they accrue)
│     · Payment status (Stripe)
│     · Delivery info (window if chosen, address, distance from hub as text)
│     · Damage panel (visible when status = on_hold_damage_reported)
│     · Refusal panel (visible when status = refused_pending_resolution)
│     · Contact-us link / "Talk to human" CTA
│   Realtime: Supabase subscription on the order row
│
/customer/orders/[id]/schedule       Window picker (after Assembly Completed, Decision #6)
│   Reached from: email signed link OR portal CTA
│   Layout: assembled-photo carousel on top + calendar/list of open slots
│   Pick → status = ready_for_delivery
│
/customer/orders/[id]/quote          Quote review (Pending Quote flow, Decision #17)
│   Reached from: email signed link (preferred) or portal
│   Itemized price, "Approve & Pay" → Stripe Checkout
│   Decline / no action 7d → cancelled_no_payment
│
/customer/orders/[id]/damage-resolve   Damage resolution (Decision #13)
│   Reached from: email signed link
│   Three choices: Refund · Wait for Replacement · Talk to Human
│   Item-level granularity for partial-order damage
│
/customer/orders/[id]/refusal-resolve  Refusal resolution (Decision #14)
│   Reached from: email signed link
│   Three choices: Reschedule · Refund · Talk to Human
│   Driver's reason + photos visible
│
/customer/book                       New booking — 5-step form
│   Step 1: items (pre-filled from /pricing if applicable, with per-item "unusual/oversized" toggle)
│   Step 2: service type (Hub Assembly + Delivery — only option) + rush vs standard
│   Step 3: tracking number(s) for inbound shipments
│   Step 4: delivery address (geocoded + service-area-validated) + window preference
│   Step 5: review →
│     · standard: Stripe Checkout
│     · any flagged item: Submit for Quote → status = pending_quote
│
/customer/profile                    Profile + addresses + password
│   Sections: name, email, phone, password change, saved addresses
```

**Customer global nav (top bar, desktop):**
```
[Logo]    My Orders    Book New    Help (→/contact)             [Avatar menu ▾]
                                                                    ├ Profile
                                                                    └ Sign out
```
Mobile: hamburger → same items in a slide-in.

**Deep-link chrome:** When the customer lands from an email (window picker, quote review, damage-resolve, refusal-resolve), nav collapses to **logo + sign-out only**. Receipt-style minimal chrome per DESIGN.md §4 (`deep_link_landing_chrome` component).

---

## D. Admin Portal (`/admin/*`)

```
/admin                               Today dashboard (Decision #8) — post-login landing
│   Top metric strip: orders this week · revenue · on-time %
│   Action queues in lifecycle order:
│     · Pending Quote
│     · Inbound today
│     · At the hub, awaiting assignment
│     · In assembly now
│     · Awaiting customer scheduling
│     · Delivering today
│     · On Hold / Damage / Refused
│   ⚠ aging icon on items > 1 day in queue
│
/admin/orders                        Full Orders Table
│   Filters: status, date range, service type, customer name
│   Bulk actions: tag, export CSV
│
/admin/orders/[id]                   Order Detail (admin) — the workhorse screen
│   Panels:
│     · Customer info + notes
│     · Items (item class, requires_quote, retailer link)
│     · Pricing (computed, override, final, payment status, send-quote action)
│     · Expected Inbounds + Box Receipts (timeline)
│     · Assembly Job (tech, timing, QC, final photos)
│     · Delivery (slot, driver, POD photos, signature, distance + drive-time as text)
│     · Damage Report panel (if any)
│     · Refusal panel (if any)
│     · Returned Items (if any)
│     · Status control (full enum, with audit trail)
│     · Audit log (all order_status_events)
│
/admin/inbound                       Inbound queue (desktop view)
│   List: expected boxes for today, sorted by carrier ETA
│   Search bar (manual tracking-number entry)
│   "Open scan view" button → /admin/inbound/scan
│
/admin/inbound/scan                  Camera-scan UI (mobile/tablet) — Decision #12
│   Camera viewport with reticle
│   Sibling tab: "Type tracking #" (manual fallback)
│   Confirm card adapts to 7 match states:
│     exact · multi-box partial · last-of-N · no match · ambiguous · already received · damage at intake
│
/admin/inbound/orphans               Orphan packages (no tracking match)
│   Photos + label OCR text + "Resolve to order #X" action
│
/admin/inbound/returns               Returned-item intake from refused deliveries
│   Same scan pattern, different bucket
│   Assigns hub shelf location (e.g., "R-12")
│
/admin/assembly                      Assembly Board (kanban, Decision #9)
│   Columns: Boxes Received (unassigned) · Assigned (per-tech swim lanes) · In Progress · Completed Today
│   Drag-and-drop to assign or reassign
│   Filter: by tech, by item class, by aging
│
/admin/schedule                      Delivery Scheduler (Decision #10) + Google Maps embed (Decision #11)
│   Top half: Google Map with hub pin + today's stops (color-coded by slot)
│   Bottom half: 5 slot columns (8–10, 10–12, 12–2, 2–4, 4–6) — drag stops between
│   Side panel: Unscheduled (Ready-for-Delivery orders with no slot)
│   Click pin ↔ highlight card
│
/admin/team                          Workforce roster (Decision #7)
│   Sections: Active Team · Pending Invites · Removed (audit trail)
│   "Invite Teammate" button → modal (email, role, optional note)
│   Edit drawer per teammate: change role, suspend, view assignments
│
/admin/pricing                       Item-class price table + modifiers
│   Edit base prices per item class
│   Modifier rules (rush surcharge, distance bands once mapped, volume rules)
│   Active period scheduling (for future seasonal pricing)
│
/admin/inbox                         Unified inquiry queue (Decision #16)
│   Three sources: contact form · damage escalation · refusal escalation
│   List: aging-sorted, filterable by source + status (open/replied/resolved)
│   Reply composer with templates ("Damage refund issued," "Reschedule confirmed", etc.)
│   Outbound replies route via transactional email
│
/admin/holds                         On-Hold + Refused-Pending-Resolution queue
│   Aging-sorted with customer-response state visible
│   Subfilters: awaiting customer · awaiting retailer · needs admin action
│
/admin/faq                           FAQ content management
│   CRUD on faq_entries
│   Powers the static FAQ component on landing page
│   (Chat logs / eval tabs removed since chatbot is out of MVP scope)
│
/admin/settings                      System configuration
│   Service area: hub address + radius (geocoded)
│   Delivery slot definitions: time blocks, capacity per slot, day-of-week availability
│   Truck capacity defaults
│   Refusal policy: max free reschedules, restocking fee default
│   SLA defaults: first-response on inquiries
│   Email templates (preview-only in MVP; edits via code)
│   Pricing rule periods (cross-link to /admin/pricing)
```

**Admin global nav (left sidebar, desktop):**
```
┌──────────────────────┐
│ [Logo]               │
│                      │
│ ⌂ Today              │ → /admin
│ ▤ Orders             │ → /admin/orders
│ ⇩ Inbound            │ → /admin/inbound
│ ⚙ Assembly           │ → /admin/assembly
│ ⌚ Schedule           │ → /admin/schedule
│ ⚐ Holds              │ → /admin/holds
│ ✉ Inbox              │ → /admin/inbox
│ ⃞ Team               │ → /admin/team
│ $  Pricing           │ → /admin/pricing
│ ? FAQ                │ → /admin/faq
│ ⚒ Settings           │ → /admin/settings
│                      │
│ ──                   │
│ [Avatar] Sign out    │
└──────────────────────┘
```
Mobile: collapses to a hamburger; sidebar items appear in a vertical drawer.

---

## E. Technician Portal (`/tech/*`, mobile-first)

```
/tech/jobs                           Today's Jobs (post-login landing)
│   List of admin-assigned jobs
│   Each row: item name, customer notes preview, status chip
│   Empty state: "No jobs assigned yet. Check with your manager."
│   "Show completed" toggle to hide finished jobs
│
/tech/jobs/[id]                      Job Detail
│   Sections:
│     · Item info, retailer link, customer notes
│     · Status controls: Start Assembly → Complete Assembly
│       (Complete is disabled until QC + final photos done)
│     · Unbox/intake photos uploader
│     · QC checklist (tickbox list, required to complete)
│     · Final assembly photos uploader
│     · Damage Report link
│
/tech/jobs/[id]/damage               Damage report form
│   Required: ≥ 1 photo, notes
│   Optional: severity toggle (minor/major — admin info only)
│   Submit → order = on_hold_damage_reported + admin alerted
│
/tech/history                        Past jobs (read-only)
│
/tech/profile                        Profile (name, phone, password, photo)
```

**Technician bottom nav (mobile chrome):**
```
┌────────────┬────────────┬────────────┐
│   Jobs     │  History   │  Profile   │
└────────────┴────────────┴────────────┘
```
**Reserved Phase 2 slot:** "Available" tab between Jobs and History when `profiles.can_claim_jobs` flips on (Decision #9 scaffolding).

---

## F. Driver Portal (`/driver/*`, mobile-first)

```
/driver/route                        Today's route (post-login landing)
│   Grouped by slot: "8–10 AM · 2 stops" header → stop cards
│   Stop cards: address summary, customer name, status chip
│   End-of-day summary at bottom: "5 of 5 delivered"
│
/driver/route/[stopId]               Stop Detail
│   Address (huge, copyable)
│   One-tap "Open in Google Maps"
│   Tap-to-call customer phone
│   Item summary + customer notes
│   "I'm here" status update
│   "Capture POD" or "Refuse delivery"
│
/driver/route/[stopId]/pod           Proof of Delivery
│   Step 1: Multi-photo capture (room view + close-up)
│   Step 2: Signature canvas (touch-first, "Clear" + "Done")
│   Step 3: Confirm "Delivered"
│
/driver/route/[stopId]/refuse        Refusal modal/screen
│   Reason radio: "No one home" · "Customer refused" · "Won't fit" · "Damage at delivery" · "Wrong item" · "Other"
│   Required photo
│   Optional note
│   Confirm → order = refused_pending_resolution
│   10-minute reverse window before customer email goes out
│
/driver/history                      Past routes (read-only)
│
/driver/profile                      Profile (name, phone, password, photo)
```

**Driver bottom nav (mobile chrome):**
```
┌────────────┬────────────┬────────────┐
│   Route    │  History   │  Profile   │
└────────────┴────────────┴────────────┘
```
**Reserved Phase 2 slot:** an "Available" tab if `profiles.can_claim_deliveries` flips on.

---

## Cross-cutting Routes

```
/403                                 Wrong-role / forbidden / suspended
│   Friendly message + "Go to my portal" CTA (routes to user's actual portal home)
│   Used by middleware when role-prefix mismatch
│
/(catch-all 404)                     Standard Next.js not-found page
│   "Looks like that page doesn't exist." Search box optional.
```

---

## Route-Level Concerns

### Role guards
Every `/customer/*`, `/admin/*`, `/tech/*`, `/driver/*` route runs through middleware that:
1. Reads Supabase session cookie.
2. If absent → redirect to `/auth/sign-in?return_to=<original>`.
3. Fetches `profiles.role`.
4. If role doesn't match URL prefix → redirect to `/403`.
5. If `profiles.suspended_at` is non-null → redirect to `/403` with suspended message.

### Signed deep-link routes
Four customer-facing routes accept a single-use token via query param and bypass the normal auth gate (the token *is* auth for one action):
- `/customer/orders/[id]/schedule?token=...` (window pick)
- `/customer/orders/[id]/quote?token=...` (quote approval)
- `/customer/orders/[id]/damage-resolve?token=...&choice=...`
- `/customer/orders/[id]/refusal-resolve?token=...&choice=...`

Token validation: `deep_link_tokens` row exists, `expires_at` in the future, `used_at` is null. On valid action → mark used_at.

### Realtime subscriptions
- `/customer/orders/[id]` subscribes to its order row → status timeline updates live as admin/tech/driver actions land.
- `/admin` (Today dashboard) subscribes to filtered order rows for each queue → live counts and arrival animations.

### Mobile-vs-desktop
- Customer portal: responsive both ways (heavy use on mobile expected).
- Admin: desktop-first; Today dashboard accordion-collapses on mobile.
- Technician + Driver: mobile-first; desktop view is a courtesy (managers occasionally peek).

---

## Verification

- Every screen named in the architecture brief's **Wireframe Inventory** appears in this sitemap (and vice versa).
- Every flow node in `USER-FLOWS.md` lands on a route that exists here.
- Every role has a single, unambiguous post-login landing.
- Every route is either: (a) public, (b) role-gated by middleware, or (c) signed-token-gated.
- No route exists without a clear nav path or deep-link entry point.
