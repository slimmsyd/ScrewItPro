# Email Templates — Low-Fi Wireframes

18 transactional email templates designed to plain-HTML-safe constraints per `DESIGN.md` §4 `email_chrome` component. These are the spine of the customer experience under email-only MVP (Decision #5).

**Plain-HTML constraints (re-stated from DESIGN.md):**
- Single `<table>` layout, max-width 560px.
- Body bg `#FAFAF9`, container bg `#FFFFFF`, container padding 32px.
- No external CSS files. No background images. No web fonts (system stack fallback).
- CTA buttons use inline `border-radius: 999px` (Gmail/Apple Mail render; Outlook falls back to rectangle — acceptable).
- Plain-text alternative auto-generated.
- All photos hosted on Supabase Storage public URLs with `?width=600` resizing.

**Common scaffold (every template):**
```
┌──────────────────────────────────────────────────┐
│  body bg #FAFAF9                                 │
│  ┌────────────────────────────────────────────┐  │
│  │  [ Screw It Pro ]                          │  │  ← logo wordmark, 28px tall
│  │  ─────────────────────────                 │  │
│  │                                            │  │
│  │  <CONTENT BLOCK>                           │  │
│  │                                            │  │
│  │  ─────────────────────────                 │  │
│  │  This email was sent to <customer email>.  │  │  ← footer 12px
│  │  Privacy · Terms · © Screw It Pro 2026     │  │
│  └────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

**Conventions:** `[Button Label]` = teal pill CTA. `<variable>` = dynamic. Subject lines included above each layout.

---

## 1. Order Receipt — sent immediately after standard checkout

**Subject:** `Your order is in — #<order_id> · Screw It Pro`

```
┌────────────────────────────────────────────┐
│  [ Screw It Pro ]                          │
│  ─────────────────────────                 │
│                                            │
│  Thanks, <first_name>.                     │
│                                            │
│  We received your order and your payment.  │
│  Here's what happens next:                 │
│                                            │
│  1. You ship your items to our hub using   │
│     the tracking numbers you gave us.      │
│  2. We unbox + inspect each piece.         │
│  3. Our technicians assemble + QA.         │
│  4. We deliver white-glove style to your   │
│     door.                                  │
│                                            │
│  ──── Order #<order_id> ────               │
│  • Wayfair dresser (Medium)        $99     │
│  • Wayfair desk (Medium)           $99     │
│  • Rush window                     $40     │
│  ─────────────────────────                 │
│  Paid                              $238    │
│  Visa •••• 4242 on <date>                  │
│                                            │
│  Tracking numbers on file:                 │
│  • USPS 9400 1118 9956 ...                 │
│  • FedEx 7723 4901 ...                     │
│                                            │
│  Delivery address:                         │
│  442 Linden Ave, Apt 3B                    │
│                                            │
│  [  View My Order  →  ]                    │
│                                            │
│  ─────────────────────────                 │
│  This email was sent to maya@example.com.  │
│  Privacy · Terms · © Screw It Pro 2026     │
└────────────────────────────────────────────┘
```

---

## 2. Pending-Quote Acknowledgment — sent when order submitted as pending_quote

**Subject:** `We're working on your quote — #<order_id>`

```
┌────────────────────────────────────────────┐
│  [ Screw It Pro ]                          │
│  ─────────────────────────                 │
│                                            │
│  Thanks for your interest, <first_name>.   │
│                                            │
│  We're putting together a quote for your   │
│  order. Some of your items are unusual or  │
│  oversized, so a real human reviews them.  │
│                                            │
│  You'll hear back within 24 hours with     │
│  the final price.                          │
│                                            │
│  ──── Order #<order_id> ────               │
│  • <item 1>                                │
│  • <item 2 — quote required>               │
│                                            │
│  You won't be charged until you approve    │
│  the quote.                                │
│                                            │
│  [  View My Order  →  ]                    │
│                                            │
│  Reply to this email or use our contact    │
│  form if you have questions.               │
│                                            │
└────────────────────────────────────────────┘
```

---

## 3. Quote Ready — sent when admin sets price + sends

**Subject:** `Your quote is ready — $<amount> · #<order_id>`

```
┌────────────────────────────────────────────┐
│  [ Screw It Pro ]                          │
│  ─────────────────────────                 │
│                                            │
│  Hi <first_name> — your quote is ready.    │
│                                            │
│  ──── Order #<order_id> ────               │
│  • IKEA bunk bed (complex)        $279     │
│  • Standard window                $0       │
│  ─────────────────────────                 │
│  Total                            $279     │
│                                            │
│  What's included:                          │
│  • Receiving + unboxing at our hub         │
│  • Full assembly with QA                   │
│  • Photo documentation                     │
│  • White-glove delivery + room placement   │
│                                            │
│  [  Review & Approve  →  ]                 │  ← signed deep link
│                                            │
│  This quote expires <expires_at>.          │
│  No charge until you approve.              │
│                                            │
└────────────────────────────────────────────┘
```

---

## 4. Boxes Received — sent when all expected boxes have been received

**Subject:** `Your boxes are at our hub — #<order_id>`

```
┌────────────────────────────────────────────┐
│  [ Screw It Pro ]                          │
│  ─────────────────────────                 │
│                                            │
│  Good news, <first_name> — your boxes have │
│  arrived at our hub.                       │
│                                            │
│  ──── Order #<order_id> ────               │
│  • 2 of 2 boxes received                   │
│  • Last box received <date>                │
│                                            │
│  We're scheduling assembly now. You'll     │
│  get another email when it's complete,     │
│  with photos of the finished item.         │
│                                            │
│  [  View My Order  →  ]                    │
│                                            │
└────────────────────────────────────────────┘
```

---

## 5. Assembly Completed — the highest-engagement email

**Subject:** `<first_name>, your furniture is ready! Pick a delivery window`

```
┌────────────────────────────────────────────┐
│  [ Screw It Pro ]                          │
│  ─────────────────────────                 │
│                                            │
│  Your furniture is ready, <first_name>.    │
│                                            │
│  ──── Order #<order_id> ────               │
│                                            │
│  [photo of assembled item]                 │  ← 480px wide, hosted
│  [photo of assembled item]                 │  ← 2nd photo, smaller grid
│  [photo of assembled item]                 │
│                                            │
│  Pick a delivery window:                   │
│                                            │
│  [  Pick a Delivery Window  →  ]           │  ← signed deep link → /schedule
│                                            │
│  See all photos and details on your        │
│  order page:                               │
│  [  View My Order  →  ]                    │
│                                            │
│  We'll keep your furniture safely at the   │
│  hub until you pick a time.                │
│                                            │
└────────────────────────────────────────────┘
```

**Critical note:** This is the email with the highest emotional payoff (customer sees their furniture for the first time, looking great). Photos should be the visual focus. Subject line uses customer name for personalization.

---

## 6. Window Confirmed — sent after customer picks slot

**Subject:** `Delivery confirmed for <date> · <time_window> · #<order_id>`

```
┌────────────────────────────────────────────┐
│  [ Screw It Pro ]                          │
│  ─────────────────────────                 │
│                                            │
│  Confirmed, <first_name>.                  │
│                                            │
│  We'll deliver your order on:              │
│                                            │
│      <weekday> <date>                       │
│      <time_window>                          │
│                                            │
│  ──── Order #<order_id> ────               │
│  Delivering to:                            │
│  442 Linden Ave, Apt 3B                    │
│                                            │
│  Need to change the time? You can up to    │
│  24 hours before delivery.                 │
│                                            │
│  [  Manage Delivery  →  ]                  │
│                                            │
└────────────────────────────────────────────┘
```

---

## 7. Out for Delivery — sent morning of delivery

**Subject:** `Out for delivery today · <time_window> · #<order_id>`

```
┌────────────────────────────────────────────┐
│  [ Screw It Pro ]                          │
│  ─────────────────────────                 │
│                                            │
│  Delivery today, <first_name>.             │
│                                            │
│  Your driver <driver_name> will arrive in  │
│  the <time_window> window.                 │
│                                            │
│  ──── What to expect ────                  │
│  • Driver will call/text on arrival        │
│  • Item will be brought to your room of    │
│    choice                                  │
│  • You'll be asked to sign for delivery    │
│                                            │
│  [  Track My Order  →  ]                   │
│                                            │
│  Need to be home but can't? Contact us     │
│  ASAP — there's a small reschedule fee     │
│  after the truck leaves the hub.           │
│                                            │
│  [  Contact us  ]                          │
│                                            │
└────────────────────────────────────────────┘
```

---

## 8. Delivered + Review Prompt

**Subject:** `Delivered! Hope you love it · #<order_id>`

```
┌────────────────────────────────────────────┐
│  [ Screw It Pro ]                          │
│  ─────────────────────────                 │
│                                            │
│  Delivered, <first_name>.                  │
│                                            │
│  Your order was delivered <date_time> by   │
│  <driver_name>.                            │
│                                            │
│  [photo from POD]                          │
│  [signature thumbnail]                     │
│                                            │
│  ──── Order #<order_id> ────               │
│  Final: $238 · Paid                        │
│                                            │
│  ──────────────────────────                │
│                                            │
│  How was your experience?                  │
│                                            │
│  [  Leave a 1-minute review  →  ]          │
│                                            │
│  Book another assembly:                    │
│  [  Get Started  →  ]                      │
│                                            │
└────────────────────────────────────────────┘
```

---

## 9. Damage Reported — the highest-stakes email (Decision #13)

**Subject:** `We found damage — your options · #<order_id>`

```
┌────────────────────────────────────────────┐
│  [ Screw It Pro ]                          │
│  ─────────────────────────                 │
│                                            │
│  Hi <first_name> — we need to tell you     │
│  about something.                          │
│                                            │
│  When we <unboxed your dresser at our      │
│  hub / were assembling your order>, we     │
│  found damage. Here's exactly what we      │
│  saw:                                      │
│                                            │
│  [photo]  [photo]  [photo]                 │
│                                            │
│  Notes from <reporter_name>:               │
│  "<damage notes>"                          │
│                                            │
│  ──── Your options ────                    │
│                                            │
│  [  Refund this item — $<amount>  ]        │  ← signed deep link
│                                            │
│  [  Wait for a replacement  ]              │  ← signed deep link
│  We file the claim with <retailer>;        │
│  ~7–14 extra days.                         │
│                                            │
│  [  Talk to a human  ]                     │  ← signed deep link → inbox
│                                            │
│  We're sorry. Whatever you pick, it's      │
│  on us.                                    │
│                                            │
└────────────────────────────────────────────┘
```

**Critical tone notes:** restrained, direct, no playful illustration (DESIGN.md domain-specific ban). No exclamation marks. Apology at the end is short.

---

## 10. Refused — sent ~10 minutes after driver marks refused (Decision #14)

**Subject:** `Your delivery was refused — your options · #<order_id>`

```
┌────────────────────────────────────────────┐
│  [ Screw It Pro ]                          │
│  ─────────────────────────                 │
│                                            │
│  Hi <first_name>,                          │
│                                            │
│  We tried to deliver your order today      │
│  and weren't able to complete it. Here's   │
│  what our driver reported:                 │
│                                            │
│  ──── Driver's report ────                 │
│  Reason: <driver_reason>                   │
│  Time: <date_time>                         │
│  Driver: <driver_name>                     │
│                                            │
│  [photo]                                   │
│                                            │
│  <driver_note (if any)>                    │
│                                            │
│  ──── Your options ────                    │
│                                            │
│  [  Reschedule — pick a new time  ]        │  ← emphasized for "no one home"
│  First reschedule is free.                 │
│                                            │
│  [  Refund — $<amount>  ]                  │
│  Item returns to retailer.                 │
│                                            │
│  [  Talk to a human  ]                     │
│                                            │
└────────────────────────────────────────────┘
```

**Variant per reason** (Decision #14):
- "No one home" → Reschedule is the highlighted primary button.
- "Customer refused" / "Changed my mind" → Refund highlighted, restocking fee note shown.
- "Won't fit" → Talk to a human highlighted.
- "Damage at delivery" → email is actually the **damage** email (template #9) instead, since the flow re-routes.

---

## 11. Inquiry Receipt — sent on /contact form submit + on damage/refusal "Talk to human"

**Subject:** `We got your message · Inquiry #<inquiry_id>`

```
┌────────────────────────────────────────────┐
│  [ Screw It Pro ]                          │
│  ─────────────────────────                 │
│                                            │
│  Thanks, <name>.                           │
│                                            │
│  We received your message and we'll        │
│  reply within 24 hours during business     │
│  days.                                     │
│                                            │
│  ──── Reference ────                       │
│  Inquiry: #<inquiry_id>                    │
│  <if related to order: Order #<order_id>>  │
│                                            │
│  ──── Your message ────                    │
│  "<inquiry body, truncated to 300 chars>"  │
│                                            │
│  If you need to add anything, just reply   │
│  to this email or send another note via    │
│  our contact form.                         │
│                                            │
│  [  Contact us  ]                          │
│                                            │
└────────────────────────────────────────────┘
```

---

## 12. Window-Pick Reminder — sent 72h after Assembly Completed if no window picked

**Subject:** `Reminder: Pick your delivery window — #<order_id>`

```
┌────────────────────────────────────────────┐
│  [ Screw It Pro ]                          │
│  ─────────────────────────                 │
│                                            │
│  Hi <first_name> — just a quick reminder.  │
│                                            │
│  Your order is assembled and ready to      │
│  deliver, but we don't have a time from    │
│  you yet.                                  │
│                                            │
│  [photo of assembled item]                 │
│                                            │
│  [  Pick a Delivery Window  →  ]           │
│                                            │
│  Can't find a slot that works? Reply or    │
│  use our contact form — we'll find         │
│  something.                                │
│                                            │
└────────────────────────────────────────────┘
```

---

## 13. Damage-Resolve Reminder — sent 48h after damage email if no choice made

**Subject:** `Reminder: We need a decision on your damaged item — #<order_id>`

```
┌────────────────────────────────────────────┐
│  [ Screw It Pro ]                          │
│  ─────────────────────────                 │
│                                            │
│  Hi <first_name>,                          │
│                                            │
│  We're still waiting on your decision      │
│  about the damaged item we found on        │
│  order #<order_id>.                        │
│                                            │
│  Three options are still open:             │
│                                            │
│  [  Refund this item  ]                    │
│  [  Wait for replacement  ]                │
│  [  Talk to a human  ]                     │
│                                            │
│  No rush — but the sooner we know, the     │
│  sooner we can move forward.               │
│                                            │
└────────────────────────────────────────────┘
```

---

## 14. Refusal-Resolve Reminder

**Subject:** `Reminder: Choose what's next for your delivery — #<order_id>`

Same structure as #13, three buttons (Reschedule / Refund / Talk to Human).

---

## 15. Quote-Approve Reminder — sent 72h after quote email if no action

**Subject:** `Reminder: Your quote is waiting — #<order_id>`

```
┌────────────────────────────────────────────┐
│  [ Screw It Pro ]                          │
│  ─────────────────────────                 │
│                                            │
│  Hi <first_name>,                          │
│                                            │
│  Your quote for order #<order_id> is       │
│  still waiting for your approval.          │
│                                            │
│  Total: $<amount>                          │
│  Expires: <expires_at>                     │
│                                            │
│  [  Review & Approve  →  ]                 │
│                                            │
│  Not interested? Just let it expire —      │
│  no charge.                                │
│                                            │
└────────────────────────────────────────────┘
```

---

## 16. Auto-Cancellation Notice — sent when pending_quote expires unpaid

**Subject:** `Your order has been cancelled — #<order_id>`

```
┌────────────────────────────────────────────┐
│  [ Screw It Pro ]                          │
│  ─────────────────────────                 │
│                                            │
│  Hi <first_name>,                          │
│                                            │
│  Your order #<order_id> was cancelled      │
│  because we didn't hear back on the        │
│  quote within 7 days. No charge was made.  │
│                                            │
│  Want to start over? Pricing might be      │
│  different now, but we'd be happy to       │
│  re-quote.                                 │
│                                            │
│  [  Start a New Booking  ]                 │
│                                            │
└────────────────────────────────────────────┘
```

---

## 17. Workforce Invite — sent when admin adds a teammate (Decision #7)

**Subject:** `You're invited to join Screw It Pro as a <role>`

```
┌────────────────────────────────────────────┐
│  [ Screw It Pro ]                          │
│  ─────────────────────────                 │
│                                            │
│  Hi,                                       │
│                                            │
│  <inviter_name> invited you to join the    │
│  Screw It Pro team as a <role>.            │
│                                            │
│  <optional welcome note from inviter>      │
│                                            │
│  Set up your account in about 30 seconds:  │
│                                            │
│  [  Accept Invite  →  ]                    │  ← signed token → /auth/accept-invite
│                                            │
│  This invite expires in 7 days.            │
│                                            │
│  Didn't expect this? You can ignore the    │
│  email or reply to let us know.            │
│                                            │
└────────────────────────────────────────────┘
```

---

## 18. Invite-Token Expired (admin-side notification, optional)

**Subject:** `<invitee_email> hasn't accepted their invite yet`

```
┌────────────────────────────────────────────┐
│  [ Screw It Pro ]                          │
│  ─────────────────────────                 │
│                                            │
│  Hi <admin_name>,                          │
│                                            │
│  The invite you sent to <invitee_email>    │
│  expired 7 days after sending without      │
│  being accepted.                           │
│                                            │
│  Want to send a new one?                   │
│                                            │
│  [  Re-invite  →  ]                        │
│                                            │
└────────────────────────────────────────────┘
```

---

## Variant Coverage Matrix

| Template | Trigger | Signed deep link? | Reminder follow-up? |
|---|---|---|---|
| 1. Order Receipt | order paid | no | no |
| 2. Pending Quote Ack | order submitted as pending_quote | no | no |
| 3. Quote Ready | admin sends quote | yes (Approve&Pay) | #15 at 72h |
| 4. Boxes Received | all boxes scanned in | no | no |
| 5. Assembly Completed | tech submits final photos | yes (Pick Window) | #12 at 72h |
| 6. Window Confirmed | customer picks slot | no | no |
| 7. Out for Delivery | driver dispatched | no | no |
| 8. Delivered | driver completes POD | no | no |
| 9. Damage Reported | damage submitted by tech or intake | yes ×3 (3 CTAs) | #13 at 48h |
| 10. Refused | driver marks refused | yes ×3 (3 CTAs) | #14 at 48h |
| 11. Inquiry Receipt | /contact submit or "Talk to human" CTA | no | no |
| 12. Window-Pick Reminder | scheduled job | yes | no further |
| 13. Damage-Resolve Reminder | scheduled job | yes ×3 | no further |
| 14. Refusal-Resolve Reminder | scheduled job | yes ×3 | no further |
| 15. Quote-Approve Reminder | scheduled job | yes | no further |
| 16. Auto-Cancellation | quote_sent expires 7d | no | no |
| 17. Workforce Invite | admin invites via /admin/team | yes (Accept Invite) | optional #18 |
| 18. Invite Expired Admin Notification | scheduled job | no | no |

---

## Email Provider Selection (still open — see architecture brief Open Question #8)

Recommendation: **Resend** for MVP.
- Best DX for Next.js + TypeScript.
- Strong free tier (3,000/mo) covers MVP volume comfortably.
- Solid deliverability defaults; SPF/DKIM/DMARC setup straightforward on a custom domain.
- React Email for templating, which means these wireframes translate cleanly to typed React components when the build phase starts.

Alternatives evaluated:
- **Postmark** — best deliverability reputation, but ~2× the price. Defer until volume justifies.
- **SES** — cheapest at scale, worst DX, no UI; not worth the operational tax in MVP.

---

## Verification

- ✅ Every email referenced in the architecture brief's Communications Spine table is covered.
- ✅ All four signed-deep-link purposes from architecture-brief data model exist in at least one template (window_pick, damage_resolve, refusal_resolve, quote_approve).
- ✅ Workforce invite flow (Decision #7) has a template.
- ✅ Auto-cancellation path (Decision #17) has a template.
- ✅ Plain-HTML-safe constraints honored throughout: no web fonts, no external CSS, no background images.
- ✅ Anti-slop: damage/refusal emails are restrained (no emoji, no exclamation marks, no playful illustration). Subjects use customer name on the most emotional moments (#5, #9, #10).
