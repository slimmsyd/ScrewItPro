# Customer Portal — Low-Fi Wireframes

ASCII wireframes for the customer-facing surface (public + authenticated). Trace each screen to the corresponding flow node in `USER-FLOWS.md` and the route in `SITEMAP.md`. Components reference tokens defined in `DESIGN.md`.

**Conventions used in this file:**
- `[Button Label]` = primary CTA button.
- `[ Button ]` = secondary button.
- `( Ghost )` = ghost button.
- `▾` = dropdown affordance.
- `▢` = empty checkbox; `■` = checked.
- `🔵 status_chip_name` = status chip (colors from DESIGN.md).
- `<placeholder>` = dynamic content / data-bound.
- Right column annotations explain behavior.
- Mobile (M) and Desktop (D) variants noted where they meaningfully differ.

---

## 1. `/` Landing Page (existing — refinement annotations only)

The existing components (`Hero`, `AssemblyHighlight`, `FeatureSection`, `FAQ`, `Footer`) cover most of this. The MVP refinements are inline below.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ [LOGO]                              Pricing   FAQ   Contact   [ Sign in ]   │  ← Navbar.tsx
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                                                                              │
│                  Never assemble furniture again                              │  ← Hero.tsx
│      Shop your favorite retailers. We receive, assemble, and deliver         │
│                       white-glove style.                                     │
│                                                                              │
│                       [  Get Started — Book a Job  ]                         │  ← routes to /pricing
│                                                                              │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                          How It Works                                        │  ← FeatureSection (not 3 equal cards)
│                                                                              │
│   ┌──────────────────┐                            ┌──────────────────────┐   │  ← 2-col zig-zag
│   │  [photo: shop]   │   1. Shop your retailer    │                      │   │
│   └──────────────────┘   Buy from Wayfair, IKEA   │                      │   │
│                          → ship to our hub        │                      │   │
│                                                                              │
│   ┌──────────────────────┐                  ┌──────────────────────────┐    │
│   │                      │   2. We unbox    │ [photo: hub assembly]    │    │
│   │                      │   + inspect      └──────────────────────────┘    │
│                                                                              │
│   ┌──────────────────┐    3. We assemble   ┌──────────────────────────┐    │
│   │ [photo: tech]    │    + QA + photo     │                          │    │
│                                                                              │
│   ┌──────────────────────┐                  ┌──────────────────────────┐    │
│   │                      │   4. White-glove │ [photo: delivery]        │    │
│   │                      │   delivery       │                          │    │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                  Serving <Service Area Name>                                 │  ← from settings.service_area
│              <starts-at copy>   [  See Pricing  →  ]                         │  ← anchor; resolved at design review
├──────────────────────────────────────────────────────────────────────────────┤
│                          Frequently Asked Questions                          │  ← FAQ.tsx, content from faq_entries
│   ▸ How long does assembly take?                                             │
│   ▸ What retailers do you support?                                           │
│   ▸ How is pricing calculated?                                               │
│   ▸ What if my furniture arrives damaged?                                    │
│   ▸ When will I see the assembled photos?                                    │
│                                                                              │
│                  Still have questions?  [  Contact Us  ]                     │  ← routes to /contact
├──────────────────────────────────────────────────────────────────────────────┤
│ [LOGO]           Service · Pricing · FAQ · Contact · Sign in                │  ← Footer.tsx
│                  Privacy · Terms · © Screw It Pro 2026                       │
└──────────────────────────────────────────────────────────────────────────────┘
```

**MVP changes from current state:**
- ChatWidget.tsx removed/hidden (Decision #15).
- Hero CTA "Get Started" routes to `/pricing` (not "#" placeholder).
- Service area copy reads from `settings.service_area` config (parameterized).
- "How It Works" uses 2-column zig-zag (NOT 3 equal cards — DESIGN.md ban).
- FAQ section has a "Contact Us" CTA at the bottom (replaces chatbot).

---

## 2. `/pricing` — Public Quote Calculator (NEW)

The chatbot-less self-serve answer to "how much does this cost?" Drives conversion.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ [LOGO]                              Pricing   FAQ   Contact   [ Sign in ]   │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                  Know exactly what you'll pay                                │  ← Hero copy, no scroll arrow
│       Pick what you need assembled. We'll do the rest, white-glove.          │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────┐  ┌─────────────────────────┐    │
│  │  Add items                              │  │  Your Quote             │    │  ← sticky on scroll (D)
│  │                                          │  │                         │    │
│  │  ┌────────────────────────────────┐    │  │  No items yet.          │    │
│  │  │ Item class                      │    │  │  Pick some on the left  │    │
│  │  │ [ Small ▾ ]                    │    │  │  to see your total.     │    │
│  │  │  $XX flat                       │    │  │                         │    │
│  │  │  e.g., chair, side table, lamp  │    │  │                         │    │
│  │  │                                 │    │  │                         │    │
│  │  │ Item description (optional)     │    │  │                         │    │
│  │  │ [______________________]        │    │  │                         │    │
│  │  │                                 │    │  │                         │    │
│  │  │ ▢ Not sure / unusual / oversize │    │  │                         │    │  ← Pending Quote toggle
│  │  │   (we'll quote within 24h)     │    │  │                         │    │     (Decision #17)
│  │  │                                 │    │  │                         │    │
│  │  │       [  +  Add Item  ]         │    │  │                         │    │
│  │  └────────────────────────────────┘    │  │                         │    │
│  │                                          │  │                         │    │
│  │  Service window                          │  │                         │    │
│  │  ◉  Standard (7–10 days)                 │  │                         │    │
│  │  ○  Rush (3 days, +$XX)                  │  │                         │    │
│  │                                          │  │                         │    │
│  └────────────────────────────────────────┘  └─────────────────────────┘    │
│                                                                              │
│                                          ┌─────────────────────────┐         │
│                                          │  After adding items:    │         │
│                                          │                         │         │
│                                          │  Dresser (Medium)  $99  │         │
│                                          │  Desk (Medium)     $99  │         │
│                                          │  Rush window      $40  │         │
│                                          │  ─────────────────────  │         │
│                                          │  Total            $238  │         │
│                                          │  (price you pay)        │         │
│                                          │                         │         │
│                                          │  [  Book this Job  ]    │         │  ← routes through sign-up modal
│                                          │                         │         │     (Decision #4)
│                                          └─────────────────────────┘         │
│                                                                              │
│  ─── If any item has "Not sure" toggled ───                                  │
│                                                                              │
│                                          ┌─────────────────────────┐         │
│                                          │  Dresser (Medium)  $99  │         │
│                                          │  Wall unit         ?    │         │  ← "Quote required" badge
│                                          │   (Quote required)      │         │
│                                          │  ─────────────────────  │         │
│                                          │  Confirmed items  $99   │         │
│                                          │  Quote items: 1 (TBD)  │         │
│                                          │                         │         │
│                                          │  [  Submit for Quote  ] │         │  ← path forks (Decision #17)
│                                          │  Your final price will  │         │
│                                          │  be set within 24h.     │         │
│                                          └─────────────────────────┘         │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Mobile (M):** Quote panel collapses to a sticky footer bar with "Total $238 · [Book this Job]" — full quote expands on tap.

**Behavior notes:**
- Each item row independent; rows persist in URL state + localStorage so the cart survives the sign-up modal.
- Prices read from `pricing_rules` (admin-editable).
- "Not sure" toggle on any item → entire order routes to Pending Quote at submit.

---

## 3. `/contact` — Contact Form (NEW)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ [LOGO]                              Pricing   FAQ   Contact   [ Sign in ]   │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                              Contact us                                       │
│                We typically reply within 24 hours.                            │
│                                                                              │
│   ┌──────────────────────────────────────────────────────┐                  │
│   │  Your name                                            │                  │
│   │  [____________________________________________]      │                  │
│   │                                                       │                  │
│   │  Email                                                │                  │
│   │  [____________________________________________]      │                  │
│   │                                                       │                  │
│   │  Order # (optional)                                   │                  │
│   │  [ #1042 ▾ ]                                          │  ← dropdown if signed in,
│   │                                                       │     text input otherwise
│   │  How can we help?                                     │                  │
│   │  ┌──────────────────────────────────────────────┐   │                  │
│   │  │                                              │   │                  │
│   │  │                                              │   │                  │
│   │  │                                              │   │                  │
│   │  └──────────────────────────────────────────────┘   │                  │
│   │                                                       │                  │
│   │                          [  Send Message  ]           │                  │
│   └──────────────────────────────────────────────────────┘                  │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Success state:** Replaces the form with: "Thanks! We've sent a copy to your email. Reference: Inquiry #IQ-039. We'll reply within 24 hours."

**Behavior:** POST → `inquiries` row (source = `contact_form`) → `/admin/inbox` queue.

---

## 4. Sign-Up Modal (the Conversion Moment, Decision #4)

Triggered from `/pricing` "Book this job" or from `/auth/sign-up`. State preserved on dismiss/back.

```
                ┌────────────────────────────────────────────────────┐
                │                                                  ✕ │
                │                                                    │
                │         Save your quote to book this job           │
                │     We'll keep your items ready. ~10 seconds.      │
                │                                                    │
                │   ┌────────────────────────────────────────────┐  │
                │   │ Email                                       │  │
                │   │ [_________________________________________]│  │
                │   └────────────────────────────────────────────┘  │
                │                                                    │
                │      [  Send me a magic link  ]   ◄ primary        │
                │                                                    │
                │            ── or ──                                │
                │                                                    │
                │   ┌────────────────────────────────────────────┐  │
                │   │ Set a password                              │  │
                │   │ [_________________________________________]│  │
                │   └────────────────────────────────────────────┘  │
                │      [ Create account with password ]              │
                │                                                    │
                │   ─── Already have an account?  [ Sign in ]  ───   │  ← toggle to sign-in modal
                │                                                    │
                │   By continuing you agree to our Terms & Privacy.  │
                └────────────────────────────────────────────────────┘
```

**After magic-link path:**
```
                ┌────────────────────────────────────────────────────┐
                │                                                  ✕ │
                │                                                    │
                │           Check your email                          │
                │                                                    │
                │   We sent a link to <email>. Tap it to             │
                │   continue your booking — we've saved your quote.  │
                │                                                    │
                │   Didn't get it?  [ Resend ]  [ Use password ]     │
                │                                                    │
                └────────────────────────────────────────────────────┘
```

**Sign-in variant:** Same modal, swap heading to "Welcome back" and replace fields with email + password OR magic link. "Forgot password?" link below.

**State preservation:** Quote items live in URL hash + localStorage; modal close/dismiss preserves them. After magic-link click, user lands on `/customer/book` Step 1 with items pre-filled (USER-FLOWS.md Flow 2).

---

## 5. `/customer/orders` — My Orders (post-login landing)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ [LOGO]   My Orders   Book New   Help                       [ Avatar ▾ ]    │  ← Customer global nav
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   My Orders                                                                  │
│                                                                              │
│   ┌──────────────────────────────────────────────────────────────────────┐  │
│   │ #1042 · Wayfair dresser + Wayfair desk          🔵 in_assembly      │  │  ← card
│   │ Booked Mar 8 · $238 · Maya Tran                              ●●○○○○ │  │  ← progress dots
│   │                                                          [ View → ] │  │
│   └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│   ┌──────────────────────────────────────────────────────────────────────┐  │
│   │ #1038 · IKEA bunk bed                       🟡 pending_quote        │  │
│   │ Booked Mar 9 · Awaiting your approval        ●○○○○○                  │  │
│   │ Quote ready: $329 ·             [ Approve & Pay → ]                  │  │
│   └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│   ┌──────────────────────────────────────────────────────────────────────┐  │
│   │ #1015 · Wayfair sectional                       🟢 delivered        │  │
│   │ Delivered Mar 3 · $189                          ●●●●●● ✓             │  │
│   │                                            [ View ] [ Book Again ] │  │
│   └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Empty state (no orders):**
```
                                                                                
                       You don't have any orders yet.                          
                                                                                
                       Get a quote in under a minute.                          
                                                                                
                       [  Get Started — See Pricing  ]                         
                                                                                
```

---

## 6. `/customer/orders/[id]` — Order Detail (the central screen)

Customer's main hub. Realtime-subscribed to the order row.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ [LOGO]   My Orders   Book New   Help                       [ Avatar ▾ ]    │
├──────────────────────────────────────────────────────────────────────────────┤
│  ←  Back to My Orders                                                        │
│                                                                              │
│   Order #1042                              🔵 in_assembly                    │  ← status chip (DESIGN.md)
│   Booked Mar 8, 2026 · $238 paid                                             │
│                                                                              │
│   ┌──────────────────────────────────────────────────────────────────────┐  │
│   │  Status                                                              │  │
│   │                                                                      │  │
│   │  ● Order placed             Mar 8, 10:14 AM                          │  │  ← timeline
│   │  │                                                                   │  │
│   │  ● Boxes received            Mar 10, 2:31 PM   (2 boxes)            │  │
│   │  │                                                                   │  │
│   │  ● In assembly  ⋯           Mar 11, 9:02 AM   (Aisha, technician)   │  │  ← active state (pulse)
│   │  │                                                                   │  │
│   │  ○ Assembly completed                                                │  │
│   │  ○ Pick delivery window                                              │  │
│   │  ○ Out for delivery                                                  │  │
│   │  ○ Delivered                                                         │  │
│   └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  Items                                                              │   │
│   │  • Wayfair dresser — Medium · $99                                   │   │
│   │  • Wayfair desk    — Medium · $99                                   │   │
│   │  • Rush window     —          $40                                   │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  Photos                                                             │   │
│   │  [□] [□]      ← intake photos (2)                                   │   │
│   │  Final photos will appear here when assembly completes.             │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  Delivery                                                           │   │
│   │  Address: 442 Linden Ave, Apt 3B                                    │   │
│   │  Distance from hub: 4.2 mi · ~14 min                                │   │  ← mono font for numbers
│   │  Delivery window: not yet selected                                  │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  Payment                                                            │   │
│   │  Paid Mar 8 · $238 · Visa •••• 4242                                 │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│   ──                                                                         │
│   Need help with this order?   [ Contact us ]                                │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Status-specific variants:**
- **assembly_completed:** A prominent "Your furniture is ready — pick a window" CTA replaces the timeline section's "Pick delivery window" placeholder; carousel of final photos appears above. Big primary CTA: `[ Pick Delivery Window → ]`.
- **on_hold_damage_reported:** A damage panel appears at the top with: photos, severity, "Your options" with 3 buttons (Refund / Wait for Replacement / Talk to Human) — same as the damage-resolve page, inline.
- **refused_pending_resolution:** Similar inline panel with driver reason + 3 buttons.
- **delivered:** Status chip is success-tone; POD photos appear above final photos; "Leave a review" CTA replaces "Pick window."

---

## 7. `/customer/orders/[id]/schedule` — Window Picker

Reached from email signed link (`token=...`) or from inside the portal after Assembly Completed.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ [LOGO]                                                  [ Sign out ]         │  ← deep-link chrome (minimal)
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│              ✓ Your furniture is ready!                                      │
│                                                                              │
│   ┌──────────────────────────────────────────────────────────────────────┐  │
│   │  [ □ ]  [ □ ]  [ □ ]  [ □ ]              ← carousel of final photos │  │
│   │   1/4    2/4    3/4    4/4                                           │  │
│   └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│   Order #1042 · Wayfair dresser + desk                                       │
│                                                                              │
│   Pick a delivery window                                                     │
│                                                                              │
│   Date    Thu Mar 14                Fri Mar 15               Sat Mar 16     │
│           ────────────              ────────────              ────────────   │
│   8–10 AM   Available                Available                Full           │
│   10–12 PM  Available                Available                Available      │
│   12–2 PM   Full                     Available                Available      │
│   2–4 PM    Available                Available                Available      │
│   4–6 PM    Available                Full                     Available      │
│                                                                              │
│   Selected: Fri Mar 15 · 10–12 PM                                            │
│                                                                              │
│                              [  Confirm Window  ]                            │
│                                                                              │
│   Need a different time? No openings work?   [ Contact us ]                  │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Mobile (M):** date selector collapses to horizontal-scroll chips; slot list stacks vertically per selected date.

**Behavior:**
- Slot availability driven by `delivery_slots.capacity` minus assigned deliveries.
- Selecting + confirming flips order to `ready_for_delivery`, fires confirmation email.
- If no slots available in next 7 days → "Request a slot" CTA flags admin.

---

## 8. `/customer/orders/[id]/quote` — Quote Review

For Pending Quote orders. Reached from signed email link.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ [LOGO]                                                  [ Sign out ]         │  ← deep-link chrome
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│              Your quote is ready                                             │
│                                                                              │
│   Order #1038 · IKEA bunk bed                                                │
│                                                                              │
│   ┌──────────────────────────────────────────────────────────────────────┐  │
│   │  Itemized quote                                                      │  │
│   │                                                                      │  │
│   │  IKEA bunk bed (complex)                              $279           │  │
│   │  Standard window (7–10 days)                            $0           │  │
│   │  ─────────────────────────────────────                               │  │
│   │  Total                                               $279           │  │
│   │                                                                      │  │
│   │  Set by: ops team · Mar 9, 11:42 AM                                  │  │
│   └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│   What's included:                                                           │
│   • Receiving + unboxing at our hub                                          │
│   • Full assembly with QA                                                    │
│   • Photo documentation before delivery                                      │
│   • White-glove delivery + room placement                                    │
│                                                                              │
│                          [  Approve & Pay  →  ]                              │
│                                                                              │
│           Not what you expected?   [ Decline ]   [ Contact us ]              │
│                                                                              │
│   This quote expires Mar 16. After that, you'll need to re-book.             │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

**On "Approve & Pay":** Stripe Checkout → success → order flips to `awaiting_arrival`, box matching unlocks.
**On "Decline":** Confirmation modal ("Are you sure?") → order flips to `cancelled_no_payment`; admin notified.

---

## 9. `/customer/orders/[id]/damage-resolve` — Damage Resolution (Decision #13)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ [LOGO]                                                  [ Sign out ]         │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ⚠ We found damage on your order                                            │  ← alert tone, restrained
│                                                                              │
│   Order #1042 · Wayfair dresser                                              │
│                                                                              │
│   ┌──────────────────────────────────────────────────────────────────────┐  │
│   │  What we found                                                       │  │
│   │  [□] [□] [□]   ← intake/assembly photos                              │  │
│   │                                                                      │  │
│   │  Reported by: Aisha (technician) at intake                           │  │
│   │  Notes: "Top-right corner of the dresser has a deep scratch          │  │
│   │  ~3 inches long. Drawer 2 of 4 is cracked at the rail."              │  │
│   └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│   Your options                                                               │
│                                                                              │
│   ┌──────────────────────────────────────────────────────────────────────┐  │
│   │  ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐     │  │
│   │  │ Refund          │   │ Wait for        │   │ Talk to a       │     │  │
│   │  │                 │   │ replacement     │   │ human           │     │  │
│   │  │ $99 back to     │   │                 │   │                 │     │  │
│   │  │ Visa •••• 4242  │   │ We'll work the  │   │ A team member   │     │  │
│   │  │                 │   │ retailer claim  │   │ will reach out  │     │  │
│   │  │ Item disposed   │   │ + ship a new    │   │ within 4 hours. │     │  │
│   │  │ at our hub.     │   │ one. ~7–14 days │   │                 │     │  │
│   │  │                 │   │ added.          │   │                 │     │  │
│   │  │  [ Refund Me ]  │   │  [ I'll Wait ]  │   │ [ Connect Me ]  │     │  │
│   │  └─────────────────┘   └─────────────────┘   └─────────────────┘     │  │
│   └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│   You can change your mind for up to 1 hour after selecting.                 │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Behavior:**
- Each button → confirmation screen → action (Stripe refund, admin task created, inbox row written).
- 1-hour admin override window (Decision #13).
- Partial-order damage: cards reference the damaged item by name; resolution applies per-item.

---

## 10. `/customer/orders/[id]/refusal-resolve` — Refusal Resolution (Decision #14)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ [LOGO]                                                  [ Sign out ]         │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   Your delivery was refused                                                  │
│                                                                              │
│   Order #1042 · Wayfair dresser + desk                                       │
│                                                                              │
│   ┌──────────────────────────────────────────────────────────────────────┐  │
│   │  Driver's report                                                     │  │
│   │  Reason: "No one home and no answer after 15 minutes"                │  │
│   │  Mar 15, 11:14 AM                                                    │  │
│   │  Driver: Carlos                                                      │  │
│   │  [□]   ← photo of attempt                                            │  │
│   └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│   Your options                                                               │
│                                                                              │
│   ┌──────────────────────────────────────────────────────────────────────┐  │
│   │  ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐     │  │
│   │  │ Reschedule      │   │ Refund          │   │ Talk to a       │     │  │
│   │  │                 │   │                 │   │ human           │     │  │
│   │  │ Pick a new      │   │ $238 back to    │   │                 │     │  │
│   │  │ delivery time.  │   │ Visa •••• 4242  │   │ A team member   │     │  │
│   │  │ First reschedule│   │ Item returns    │   │ will reach out  │     │  │
│   │  │ is free.        │   │ to retailer.    │   │ within 4 hours. │     │  │
│   │  │                 │   │                 │   │                 │     │  │
│   │  │ [ Pick a Time ] │   │ [  Refund Me  ] │   │ [ Connect Me ]  │     │  │
│   │  └─────────────────┘   └─────────────────┘   └─────────────────┘     │  │
│   └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│   Reason-aware: the "no one home" case emphasizes Reschedule. A "won't fit"  │
│   refusal would emphasize Talk to a Human instead.                           │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Behavior maps to refusal reason** (Decision #14): "No one home" → reschedule highlighted; "Customer refused" → refund highlighted with restocking-fee note; "Won't fit" → human highlighted.

---

## 11. `/customer/book` — Booking Flow (5 steps)

### Step 1 — Items

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ [LOGO]   My Orders   Book New   Help                       [ Avatar ▾ ]    │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   New Booking                                                                │
│   ●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━○     │  ← progress: 1 of 5
│   1. Items   2. Service   3. Tracking   4. Delivery   5. Review              │
│                                                                              │
│   What are we assembling for you?                                            │
│                                                                              │
│   ┌──────────────────────────────────────────────────────────────────────┐  │
│   │  Item 1                                                          [✕] │  │
│   │                                                                      │  │
│   │  Retailer       [ Wayfair ▾ ]      Item class  [ Medium ▾ ] $99      │  │
│   │  Item link      [ https://wayfair.com/... ]                          │  │
│   │  Description    [ "Avington 6-Drawer Dresser - Walnut" ]             │  │
│   │  Notes          [ "Has detached mirror, separate box" ]              │  │
│   │  ▢ Not sure / unusual / oversized                                    │  │
│   └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│   ┌──────────────────────────────────────────────────────────────────────┐  │
│   │  Item 2                                                          [✕] │  │
│   │  (same fields)                                                       │  │
│   └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│   [ + Add Another Item ]                                                     │
│                                                                              │
│                                                Running total: $198           │
│                                                                              │
│                                       [  Continue → Service  ]               │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Step 2 — Service

```
│   ●━━━━●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━○     │
│   1. Items   2. Service   3. Tracking   4. Delivery   5. Review              │
│                                                                              │
│   How should we get it to you?                                               │
│                                                                              │
│   ◉ Hub Assembly + White-Glove Delivery (only option in MVP)                 │
│                                                                              │
│   How soon do you need it?                                                   │
│                                                                              │
│   ◉ Standard window — 7–10 business days from box arrival                    │
│   ○ Rush window — 3 business days (+$40)                                    │
│                                                                              │
│        [ ← Back ]                  [  Continue → Tracking  ]                 │
```

### Step 3 — Tracking

```
│   ●━━━━●━━━━●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━○     │
│   1. Items   2. Service   3. Tracking   4. Delivery   5. Review              │
│                                                                              │
│   When you order from the retailer, add the tracking number(s) here.         │
│   This lets us match incoming boxes to your order.                           │
│                                                                              │
│   ┌──────────────────────────────────────────────────────────────────────┐  │
│   │  Tracking #1 — Carrier [ USPS ▾ ]                                    │  │
│   │  [_______________________________________________________]          │  │
│   │  For: Wayfair dresser                                                │  │
│   └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│   ┌──────────────────────────────────────────────────────────────────────┐  │
│   │  Tracking #2 — Carrier [ FedEx ▾ ]                                   │  │
│   │  [_______________________________________________________]          │  │
│   │  For: Wayfair desk                                                   │  │
│   └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│   [ + Add Another Tracking Number ]                                          │
│                                                                              │
│   Don't have tracking yet?  [ Skip — I'll add later ]                        │
│                                                                              │
│        [ ← Back ]                  [  Continue → Delivery  ]                 │
```

### Step 4 — Delivery Address

```
│   ●━━━━●━━━━●━━━━●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━○     │
│   1. Items   2. Service   3. Tracking   4. Delivery   5. Review              │
│                                                                              │
│   Where should we deliver?                                                   │
│                                                                              │
│   Street    [______________________________________________]                │
│   Unit/Apt  [_______________]   City  [____________________]                 │
│   State     [ NY ▾ ]            Zip   [_______]                              │
│                                                                              │
│   Delivery notes (optional)                                                  │
│   [ "Building has a freight elevator, use service entrance on 7th St." ]    │
│                                                                              │
│   Window preference (we'll confirm after assembly)                           │
│   ◉ Anytime works                                                            │
│   ○ Weekdays only                                                            │
│   ○ Weekends only                                                            │
│   ○ Mornings (8 AM – 12 PM)                                                  │
│   ○ Afternoons (12 PM – 6 PM)                                                │
│                                                                              │
│        [ ← Back ]                  [  Continue → Review  ]                   │
```

**Geocode validation:** synchronous on continue. If address falls outside service area → "We don't serve this area yet. [ See service area ]"

### Step 5 — Review

```
│   ●━━━━●━━━━●━━━━●━━━━●                                                      │
│   1. Items   2. Service   3. Tracking   4. Delivery   5. Review              │
│                                                                              │
│   Review your booking                                                        │
│                                                                              │
│   ┌──────────────────────────────────────────────────────────────────────┐  │
│   │  Items                                                          [Edit]│  │
│   │  • Wayfair dresser — Medium · $99                                    │  │
│   │  • Wayfair desk    — Medium · $99                                    │  │
│   │  • Rush window     —          $40                                    │  │
│   │  ────────────────────────────                                        │  │
│   │  Total                          $238                                 │  │
│   └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│   ┌──────────────────────────────────────────────────────────────────────┐  │
│   │  Service                                                       [Edit]│  │
│   │  Hub Assembly + White-Glove Delivery · Rush window (3 days)          │  │
│   └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│   ┌──────────────────────────────────────────────────────────────────────┐  │
│   │  Tracking                                                      [Edit]│  │
│   │  USPS 9400 1118 9956 ... · FedEx 7723 4901 ...                       │  │
│   └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│   ┌──────────────────────────────────────────────────────────────────────┐  │
│   │  Delivery                                                      [Edit]│  │
│   │  442 Linden Ave, Apt 3B · Anytime works                              │  │
│   └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│   Standard path:                                                             │
│        [ ← Back ]                  [  Pay $238 with Stripe  →  ]             │
│                                                                              │
│   Pending Quote path (any item flagged):                                     │
│        [ ← Back ]                  [  Submit for Quote  ]                    │
│        We'll send your final price within 24 hours. You won't pay yet.       │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 12. `/customer/profile`

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ [LOGO]   My Orders   Book New   Help                       [ Avatar ▾ ]    │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   Profile                                                                    │
│                                                                              │
│   ┌──────────────────────────────────────────────────────────────────────┐  │
│   │  Name           [ Maya Tran                            ]             │  │
│   │  Email          [ maya@example.com                     ]  (read-only)│  │
│   │  Phone          [ (555) 123-4567                       ]             │  │
│   │                                                          [ Save ]    │  │
│   └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│   ┌──────────────────────────────────────────────────────────────────────┐  │
│   │  Saved addresses                                                     │  │
│   │  ● 442 Linden Ave, Apt 3B (default)                          [Edit] │  │
│   │  ○ 88 Maple St                                          [Edit] [✕]  │  │
│   │  [ + Add Address ]                                                   │  │
│   └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│   ┌──────────────────────────────────────────────────────────────────────┐  │
│   │  Password                                                            │  │
│   │  [ Change password ]                                                 │  │
│   └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│   ──                                                                         │
│   [ Sign out ]                                                               │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Cross-Cutting States (apply to all customer screens)

### Empty state
```
                                                                                
                       Nothing here yet.                                       
                                                                                
                       [  Get Started  ]                                       
                                                                                
```

### Error state
```
                                                                                
                       ⚠ We hit a problem loading that.                        
                                                                                
                       [  Try Again  ]   [ Contact us ]                        
                                                                                
```

### Loading state — skeletal (DESIGN.md §4)
```
   ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
   ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒                                                    
   ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
```
(NEVER circular spinner.)

### Permission-denied / 403
```
                                                                                
                       This isn't your page.                                   
                                                                                
                       [  Go to my orders  ]   [ Sign in as different user ]  
                                                                                
```

---

## Wireframe → Component / Token Crosswalk

| Wireframe element | DESIGN.md token / component |
|---|---|
| Primary CTAs (Get Started, Confirm Window, Pay) | `button_primary` (pill, accent fill) |
| Secondary CTAs (Back, Edit) | `button_secondary` |
| Ghost CTAs (Decline, Resend, etc.) | `button_ghost` |
| Status chips (in_assembly, delivered, etc.) | `status_chip` + matching `status_*` color set |
| Order card on My Orders | `card` |
| Form inputs across booking flow | `input` |
| Order Detail timeline | inline list with status_chip dots (not a card per item) |
| Final-photo carousels | image grid (rounded `md`, 96px thumb size) |
| Window-picker grid | table-like grid; cells use `surface` + `surface_subtle` for unavailable |
| Deep-link chrome (window, quote, resolve) | `deep_link_landing_chrome` |
| Loading | `loading_skeleton` |
| Pricing total | mono font (`typography.mono`) for the number |

---

## Verification

- ✅ Every customer-side route in `SITEMAP.md` has a wireframe in this file.
- ✅ Every customer flow node in `USER-FLOWS.md` Flow 2 lands on a wireframed screen.
- ✅ Every status in the lifecycle state machine has a corresponding customer-facing surface (Order Detail status variants).
- ✅ Empty/error/loading/permission-denied states defined (cross-cutting section).
- ✅ Anti-slop bans honored: no emojis in product UI (status dots are color, not emoji), no fake metrics, no fabricated reviews, no centered hero on internal screens.
