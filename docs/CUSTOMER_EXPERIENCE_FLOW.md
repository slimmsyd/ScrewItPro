# Screw It Pro — Customer Experience Flow (Designer Handoff)

**Scope:** Phase 1 MVP, customer-facing screens only. Grounded in the signed Development Proposal (§3.2, §8, Appendix A). Admin/technician/driver screens are out of scope for this doc — we design the customer first.

**For the designer:** this is the *sequence* and the *content* of each screen — what the customer sees and does, in order. It is not visual direction (colors/type/spacing come from the brand). Treat each numbered block as one screen or state to lay out. Edge cases and empty states are called out because they need designs too, not just the happy path.

**One thing to hold onto:** the customer never sees "who is doing the work." They see *their order moving through stages*. All the admin/tech/driver machinery is invisible to them. Their whole world is: **book it → pay → watch it progress → get it delivered.**

---

## The flow at a glance

```
1  Landing page  ──►  2  Sign up / Log in  ──►  3  New Assembly Request
                                                        │
                                                        ▼
                                    4  Choose Delivery Window
                                                        │
                                                        ▼
                                    5  Checkout (Stripe: deposit or full)
                                                        │
                                                        ▼
                                    6  Order Confirmation
                                                        │
                                                        ▼
        ┌───────────────  7  Order Tracking (the home base)  ───────────────┐
        │   Awaiting Arrival → Boxes Received → In Assembly →                │
        │   Assembly Completed → Ready for Delivery → Out for Delivery →     │
        │   Delivered                                                        │
        └────────────────────────────────────────────────────────────────────┘
                                                        │
                        ┌───────────────┬───────────────┼───────────────┐
                        ▼               ▼               ▼               ▼
                 8 Assembly       9 Order         10 Loyalty /     11 Account /
                   Photos           History          Rewards          Profile
```

Supporting layer, present the whole time: **email notification on every status change** (§3.2), and **payment status (Paid / Pending)** visible on the order.

---

## Screen-by-screen

### 1. Landing page + FAQ
**Purpose:** marketing front door; convert a visitor into someone who starts a request.
**Customer sees:** hero + value proposition ("If You Don't Want to Do It, Screw It"), "How It Works" (Shop → Ship to Hub → We Assemble → We Deliver), service-area / city focus (Houston at launch), primary CTA (**Book Now / Get Started**), and a static FAQ.
**States to design:** default; sticky/hovered CTA; FAQ expanded item.
**Note:** already built in the current site — design here is refinement, not net-new.

### 2. Sign up / Log in
**Purpose:** create an account or return to one before booking.
**Customer sees:** email-based registration and secure login. Social sign-in (Google is live in the build; Apple is planned).
**States to design:** signup (new), login (returning), error (wrong password / email taken), post-Google-auth landing.
**Note:** account creation is required to book — the flow gates here.

### 3. New Assembly Request
**Purpose:** the customer tells us what to assemble. This is the most important customer screen — design it carefully.
**Customer enters (§3.2):**
- Furniture details (what the item is)
- Retailer link(s) (where they bought it)
- Tracking number (so we can match the inbound boxes)
- Notes (anything special)
- Where it's coming from: shipping to our hub, or we pick it up
**States to design:** empty form; multi-item (they may have more than one piece); validation errors; "add another item."
**Design tension to solve:** this can feel like a lot to type. Make it feel light. Consider a guided/stepped feel rather than one long form.

### 4. Choose Delivery Window
**Purpose:** pick when they want it delivered.
**Customer sees:** available delivery windows to choose from (date + time window).
**States to design:** windows available; a window that's full/unavailable; nothing available (fallback message).

### 5. Checkout (Stripe)
**Purpose:** pay.
**Customer sees:** order summary + Stripe checkout. They pay a **deposit or the full amount** (Phase 1). **Price is set by our team, not auto-calculated** — so this screen may show an estimate/quote the customer approves rather than an instant number. Confirm with the team how price is presented to the customer.
**States to design:** review-before-pay; processing; success; payment failed / declined.
**Note:** instant SKU-based auto-pricing is Phase 2, not this build.

### 6. Order Confirmation
**Purpose:** reassure them it worked and set expectations.
**Customer sees:** confirmation of the booking, what happens next, order number, and a confirmation email is sent.
**States to design:** the confirmation screen + the confirmation email template.

### 7. Order Tracking — the customer's home base
**Purpose:** the screen they'll come back to most. Shows where their order is in the lifecycle.
**Customer-facing statuses, in order (§3.2):**
1. **Awaiting Arrival** — waiting for the boxes to reach our hub
2. **Boxes Received** — we have the items
3. **In Assembly** — a tech is building it
4. **Assembly Completed** — built and passed our check
5. **Ready for Delivery** — scheduled out
6. **Out for Delivery** — on the way / being placed in the home
7. **Delivered** — done
**Customer also sees on this screen:** payment status (Paid / Pending), the delivery window, and a link to assembly photos once available.
**States to design:** each of the 7 statuses as a distinct visual step (a progress tracker); a "Refused" / exception state; an order with a flagged damage note (if we surface that to the customer — confirm).
**Note:** this is a great emotional-delight moment — each status change is also an email. Design the tracker and the matching email set together.

### 8. Assembly Photos
**Purpose:** proof + delight — the customer sees their item built before it even arrives.
**Customer sees:** photo(s) of the completed assembly at the hub, viewable once the item hits "Assembly Completed."
**States to design:** photos available; not yet available (locked/placeholder).

### 9. Order History
**Purpose:** see current and past orders.
**Customer sees:** list of all their orders with status, date, total.
**States to design:** has orders; first-time / empty state (no orders yet → nudge to book).

### 10. Loyalty / Rewards
**Purpose:** repeat-customer incentive.
**Customer sees (§3.2):** points that accrue on completed orders, a sign-up bonus, and a points ledger in their profile.
**States to design:** points balance; ledger/history; "how to earn / redeem" explainer.

### 11. Account / Profile
**Purpose:** manage their info.
**Customer sees:** their details, saved address, payment status/receipts, and the loyalty ledger.
**States to design:** view; edit.

---

## Cross-cutting things the designer should plan for

- **Email templates** — every status change triggers an email (§3.2). Design the email set alongside the tracker (screens 6, 7).
- **Payment status** — Paid / Pending shows on the order and profile.
- **Mobile-first** — customers will mostly do this on a phone; design mobile layouts first.
- **Empty / first-time states** — no orders yet, no photos yet, no points yet.
- **Error / exception states** — payment failed, delivery window full, order refused.

## Explicitly NOT in this (Phase 1) customer flow — do not design yet
- Instant AI/SKU auto-quoting and the "Chip" mascot chatbot (Phase 2)
- Self-serve reschedule/cancel UI (confirm whether Phase 1 or handled by support)
- Native mobile app (Phase 1 is web, mobile browser)
