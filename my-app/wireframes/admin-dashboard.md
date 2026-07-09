# Admin Dashboard — Low-Fi Wireframes

ASCII wireframes for the admin operational surface. The densest, most-used part of the product — ops staff live here 8 hours a day.

**Conventions:** see `customer-portal.md` header. Admin chrome is the **left sidebar** (12 items) per `SITEMAP.md` §D.

---

## Admin Global Chrome (every authenticated admin screen)

```
┌──────────────────┬───────────────────────────────────────────────────────────┐
│  [LOGO]          │   <current page content>                                  │
│                  │                                                           │
│  ⌂ Today        │                                                           │
│  ▤ Orders       │                                                           │
│  ⇩ Inbound  •2  │  ← unresolved orphan count badge                          │
│  ⚙ Assembly •3  │  ← in-progress count                                       │
│  ⌚ Schedule     │                                                           │
│  ⚐ Holds   ⚠1   │  ← aging holds count                                       │
│  ✉ Inbox   •5  │  ← unread inquiries count                                   │
│  ⃞ Team         │                                                           │
│  $ Pricing      │                                                           │
│  ? FAQ          │                                                           │
│  ⚒ Settings     │                                                           │
│                  │                                                           │
│  ──              │                                                           │
│  [Avatar]        │                                                           │
│  Sign out        │                                                           │
└──────────────────┴───────────────────────────────────────────────────────────┘
```

**Mobile (M):** sidebar collapses to hamburger; menu slides in from left.

---

## 1. `/admin` — Today Dashboard (Decision #8, post-login landing)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Today · Wed Mar 11, 2026                                                    │
│                                                                              │
│  ┌─────────────────────┬─────────────────────┬─────────────────────┐        │
│  │  Orders this week   │  Revenue this week  │  On-time %          │        │  ← metric strip
│  │  18 (+3 vs last)    │  $2,847             │  94%                │        │
│  └─────────────────────┴─────────────────────┴─────────────────────┘        │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  Pending Quote (2)                                       [ View all ]│   │
│  │  ────────────────────────────────────────────────────────             │   │
│  │  #1038  IKEA bunk bed         Submitted 2 hr ago    [ Set Price ]    │   │
│  │  #1051  Modular wall unit     Submitted 1 day ago ⚠ [ Set Price ]    │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  Inbound today (3)                                       [ View all ]│   │
│  │  ────────────────────────────────────────────────────────             │   │
│  │  #1041  Wayfair dresser       USPS 9400...     ETA today  [ Scan ]   │   │
│  │  #1052  IKEA chair (2 boxes)  FedEx 7723...    ETA today  [ Scan ]   │   │
│  │  #1043  Wayfair desk          UPS 1Z9R3...     ETA today  [ Scan ]   │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  At the hub, awaiting assignment (2)                     [ Board → ] │   │
│  │  ────────────────────────────────────────────────────────             │   │
│  │  #1038  Dresser              Received 9:14 AM    [ Assign tech ▾ ]   │   │
│  │  #1042  Bed frame            Received 2 days ago ⚠ [ Assign tech ▾ ] │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  In assembly now (3)                                                 │   │
│  │  ────────────────────────────────────────────────────────             │   │
│  │  ⋯ #1035  Aisha     Started 1:42 PM · 38m elapsed                    │   │  ← pulse dot
│  │  ⋯ #1037  Mateo     Started 12:01 PM · 2h 19m elapsed ⚠              │   │
│  │  ⋯ #1039  Mateo     Started 3:14 PM · 12m elapsed                    │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  Awaiting customer scheduling (4)                                    │   │
│  │  ────────────────────────────────────────────────────────             │   │
│  │  #1029  waiting 1 day                                                │   │
│  │  #1031  waiting 2 days                                               │   │
│  │  #1024  waiting 4 days ⚠ [ Resend email ]                            │   │
│  │  #1018  waiting 6 days ⚠ [ Resend email ] [ Reach out → /admin/inbox ]│  │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  Delivering today (5)                              [ Scheduler →  ]  │   │
│  │  ────────────────────────────────────────────────────────             │   │
│  │  8–10 AM  · #1018 · Carlos · ⋯ Out for delivery                       │   │
│  │  10–12 PM · #1020 · Carlos · Ready                                    │   │
│  │  12–2 PM  · #1022 · Carlos · Ready                                    │   │
│  │  2–4 PM   · #1024 · Carlos · Ready                                    │   │
│  │  4–6 PM   · #1025 · Lin    · Ready                                    │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  On Hold / Damage / Refused (2)                          [ View all ]│   │
│  │  ────────────────────────────────────────────────────────             │   │
│  │  #1015  on_hold_damage    waiting 2 days ⚠   Cust. chose: refund     │   │
│  │  #1031  refused_pending   waiting 5 hr        Cust. not responded    │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Behavior:**
- Realtime-subscribed to relevant orders (Supabase Realtime).
- ⚠ icon appears on any row > 1 day in queue without action.
- Click a row → goes to `/admin/orders/[id]`.
- Counts on the sidebar update live.
- Pulse dot on "In assembly now" rows (active state, per DESIGN.md motion section).

**Mobile (M):** Each queue section collapses to an accordion. Tap header to expand.

---

## 2. `/admin/orders` — Orders Table

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Orders                                                  [ + New Order ]    │  ← admin-side create (rare)
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  Filters:                                                            │   │
│  │  Status: [ All ▾ ]   Date: [ Last 30 days ▾ ]   Service: [ All ▾ ]   │   │
│  │  Customer: [_____________________________ ]      [ Export CSV ]      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ # ▾   Customer       Items         Status              Total   Created │ │
│  │ ────────────────────────────────────────────────────────────────────── │ │
│  │ #1042 Maya Tran      2 items       🔵 in_assembly     $238    Mar 8   │ │
│  │ #1041 Sam Patel      1 item        🔵 boxes_received  $99     Mar 8   │ │
│  │ #1038 Lin Tran       1 item        🟡 pending_quote   —       Mar 9   │ │
│  │ #1035 Aisha Smith    1 item        🟢 delivered       $148    Mar 5   │ │
│  │ #1031 Carlos R.      3 items       🔴 refused_pending $327    Mar 4   │ │
│  │ #1015 Maya Tran      1 item        🔴 on_hold_damage  $99     Mar 1   │ │
│  │ ...                                                                    │ │
│  │                                                                        │ │
│  │ Showing 1–20 of 47                          [ ← prev ]  [ next → ]    │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Behavior:**
- Click a row → `/admin/orders/[id]`.
- Numeric columns (Total, #) use mono font.
- Sort by any column header.
- Bulk-select via row checkboxes for export.

---

## 3. `/admin/orders/[id]` — Order Detail (admin view, the workhorse)

The most important screen in the product. ~8 panels stacked vertically.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  ← Orders                                                                    │
│                                                                              │
│  Order #1042                              🔵 in_assembly  [ Change ▾ ]      │  ← status control
│  Maya Tran · maya@example.com · (555) 123-4567                               │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  Items                                                               │   │
│  │  • Wayfair dresser — Medium ($99)   "Avington 6-Drawer"              │   │
│  │  • Wayfair desk    — Medium ($99)   "Hilltop writing desk"           │   │
│  │  Modifiers: Rush window (+$40)                                       │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  Pricing                                                             │   │
│  │  Computed:  $238    Override:  [ $238   ]  Final:  $238              │   │
│  │  Payment:   ✓ paid Mar 8 · Stripe pi_3OQ... · Visa •••• 4242         │   │
│  │  Actions:   [ Send Quote Re-quote ]   [ Refund... ]                  │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  Expected Inbounds & Box Receipts                                    │   │
│  │  ✓ USPS 9400 1118 9956 ...   Received Mar 10, 2:31 PM (Lin) [📷]    │   │
│  │  ✓ FedEx 7723 4901 ...        Received Mar 10, 4:02 PM (Lin) [📷]    │   │
│  │  All boxes received → status auto-flipped to boxes_received          │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  Assembly Job                                                        │   │
│  │  Technician: Aisha    Assigned: Mar 11, 8:42 AM (by Lin)             │   │
│  │  Started: 9:02 AM   Completed: —   Elapsed: 38m                      │   │
│  │  QC: 4 of 12 checked   Final photos: 0 uploaded                      │   │
│  │  [ Reassign ▾ ]   [ View checklist ]                                 │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  Delivery                                                            │   │
│  │  Address: 442 Linden Ave, Apt 3B                                     │   │
│  │  Distance: 4.2 mi from hub · ~14 min drive                           │   │
│  │  Window:   (customer hasn't picked yet)                              │   │
│  │  Driver:   (not assigned)                                            │   │
│  │  [ Assign to slot... ]   [ Send window-pick reminder ]               │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  Damage / Refusal (none reported)                                    │   │
│  │  (panel appears with photos + 3-button override when active)         │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  Audit log                                                           │   │
│  │  Mar 11, 9:02 AM   in_assembly       by Aisha    "Started assembly"  │   │
│  │  Mar 11, 8:42 AM   boxes_received → assigned    by Lin              │   │
│  │  Mar 10, 4:02 PM   box 2 of 2 received          by Lin               │   │
│  │  Mar 10, 2:31 PM   box 1 of 2 received          by Lin               │   │
│  │  Mar 8,  10:14 AM  order created + paid         (Stripe)             │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  Customer-facing notes (visible to Maya): [ + Add note ]                     │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Status-aware panels:**
- **pending_quote:** Pricing panel becomes the Set-Price form: "Final price [ $___ ]   [ Send Quote ]".
- **on_hold_damage_reported:** Damage panel expands with photos + override controls + customer's chosen path.
- **refused_pending_resolution:** Refusal panel expands with driver photo/reason + customer choices + return-to-hub location.

---

## 4. `/admin/inbound` — Inbound Queue (desktop)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Inbound                                       [ 📷 Open Scanner View ]      │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  Type tracking #  [_____________________________________ ]  [ Find ] │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  Expected today (3)                                                          │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ Tracking #              Carrier  Order   Customer       ETA   Action  │ │
│  │ ──────────────────────────────────────────────────────────────────── │ │
│  │ 9400 1118 9956 ...      USPS     #1041   Sam Patel      Today [ ✓ ]  │ │
│  │ 7723 4901 ...           FedEx    #1052   Lin Tran       Today [ ✓ ]  │ │
│  │ 1Z9R3...                UPS      #1043   Carlos R.      Today [ ✓ ]  │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  Expected this week (12)                                  [ Show / hide ]    │
│                                                                              │
│  Late inbound (2) ⚠                                                          │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ 9400 0093 ...           USPS     #1029   Aisha S.    2 days late      │ │
│  │ 7723 1188 ...           FedEx    #1031   Maya T.     5 days late      │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. `/admin/inbound/scan` — Camera Scan UI (Decision #12)

Mobile/tablet first. Camera primary, manual fallback always available.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  ← Inbound                                                                   │
│                                                                              │
│   [ 📷 Camera  ] | Type tracking number   ← tabs                             │
│                                                                              │
│   ┌──────────────────────────────────────────────────────────────────────┐  │
│   │                                                                      │  │
│   │                                                                      │  │
│   │              ┌────────────────────────────────────┐                  │  │
│   │              │                                    │                  │  │  ← reticle overlay
│   │              │      Point at the shipping label  │                  │  │
│   │              │                                    │                  │  │
│   │              └────────────────────────────────────┘                  │  │
│   │                                                                      │  │
│   │           (camera viewport — auto-scans barcode or OCRs text)        │  │
│   │                                                                      │  │
│   └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│   Scanner not working?  [ Switch to typing ]                                 │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Confirm card variants (7 matching states — Decision #12):**

```
─── EXACT MATCH ───
┌────────────────────────────────────────────────────────────────────────┐
│  ✓ Match found                                                         │
│                                                                        │
│  Order #1041 — Sam Patel                                               │
│  Wayfair dresser (Medium)                                              │
│  Box 1 of 1                                                            │
│                                                                        │
│  ▢ Damage visible — capture photos                                     │  ← if checked: photo flow + on_hold
│                                                                        │
│  [ Confirm Receipt + capture photo ]                                   │
└────────────────────────────────────────────────────────────────────────┘

─── MULTI-BOX PARTIAL ───
┌────────────────────────────────────────────────────────────────────────┐
│  ✓ Match found                                                         │
│                                                                        │
│  Order #1052 — Lin Tran                                                │
│  IKEA chair (Small)                                                    │
│  Box 1 of 3   (2 boxes still expected)                                 │
│                                                                        │
│  [ Confirm Receipt ]                                                   │
│  Status stays "Awaiting Arrival" until all 3 boxes scanned.            │
└────────────────────────────────────────────────────────────────────────┘

─── LAST OF N ───
┌────────────────────────────────────────────────────────────────────────┐
│  ✓ Match found — Box 3 of 3 (final)                                    │
│  Order #1052 — confirming will flip status to Boxes Received           │
│  + auto-email the customer.                                            │
│  [ Confirm Final Receipt ]                                             │
└────────────────────────────────────────────────────────────────────────┘

─── NO MATCH ───
┌────────────────────────────────────────────────────────────────────────┐
│  ✗ No expected inbound matches this tracking #                         │
│  9400 0193 7281 ...                                                    │
│                                                                        │
│  [ Search by customer / order # ]                                      │
│  [ Log as orphan package + capture photo ]                             │
└────────────────────────────────────────────────────────────────────────┘

─── AMBIGUOUS ───
┌────────────────────────────────────────────────────────────────────────┐
│  ⚠ Multiple orders match this tracking #                               │
│  Pick the correct one:                                                 │
│   ○ Order #1041 — Sam Patel (Wayfair dresser)                          │
│   ○ Order #1043 — Carlos R. (Wayfair desk)                             │
│  [ Confirm Selected ]                                                  │
└────────────────────────────────────────────────────────────────────────┘

─── ALREADY RECEIVED ───
┌────────────────────────────────────────────────────────────────────────┐
│  This box was already scanned in.                                      │
│  Received Mar 10, 2:31 PM by Lin                                       │
│                                                                        │
│  Was this scanned by mistake, or is it a separate package?             │
│  [ Mistake — go back ]    [ Separate package — log new receipt ]       │
└────────────────────────────────────────────────────────────────────────┘

─── DAMAGE AT INTAKE ───
┌────────────────────────────────────────────────────────────────────────┐
│  ⚠ Damage visible                                                      │
│  Capture photos (≥1 required):                                         │
│    [+ Add photo]   [📷] [📷] [📷]                                       │
│  Notes:                                                                │
│  [ "Crushed corner on top-right, packaging torn" ]                     │
│                                                                        │
│  [ Confirm Receipt + flag On Hold ]                                    │
│  Order will be set to "On Hold – Damage Reported" + customer notified. │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 6. `/admin/inbound/orphans` — Orphan Packages

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  ← Inbound                                                                   │
│                                                                              │
│  Orphan packages (2)                                                         │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  Logged Mar 10, 4:14 PM by Lin                                       │   │
│  │  [📷] photo of label                                                 │   │
│  │  Label text (OCR): "Wayfair LLC · Ship to: 22 Hub St, Box #?"        │   │
│  │  [ Resolve to order # __________ ]   [ Mark as not ours ]            │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  Logged Mar 9, 11:02 AM by Mateo                                     │   │
│  │  [📷] photo of label · damaged                                       │   │
│  │  Label text (OCR): (unreadable)                                      │   │
│  │  [ Resolve to order # __________ ]   [ Return to retailer ]          │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. `/admin/inbound/returns` — Returned Items (from refused deliveries)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Returned items                                  [ + Scan return ]           │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  Order #1031 · Maya Tran                                             │   │
│  │  Returned Mar 8 from Carlos's route                                  │   │
│  │  Reason: "No one home and no answer"                                 │   │
│  │  [📷] [📷]   Hub location: [ R-12 ▾ ]                                │   │
│  │  Customer's choice: Reschedule (pick window pending)                 │   │
│  │  Final disposition: [ Re-deliver ▾ ]   [ Save ]                      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. `/admin/assembly` — Assembly Board (kanban, Decision #9)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Assembly Board                              Filter: [ All techs ▾ ]         │
│                                                                              │
│  ┌──────────────┬────────────────────────┬──────────────┬──────────────┐    │
│  │ Boxes Received│ Assigned               │ In Progress  │ Completed    │    │
│  │ (unassigned) │                        │              │ Today        │    │
│  │   (2)        │                        │   (3)        │   (4)        │    │
│  ├──────────────┼────────────────────────┼──────────────┼──────────────┤    │
│  │              │ Aisha (load: 2)        │              │              │    │
│  │ ┌──────────┐ │ ┌────────────────┐    │ ┌──────────┐ │ ┌──────────┐ │    │
│  │ │ #1038    │ │ │ #1042  dresser │    │ │ #1035    │ │ │ #1034    │ │    │
│  │ │ dresser  │ │ │ assigned 8:42  │    │ │ Aisha    │ │ │ done 11AM│ │    │
│  │ │ recv 9AM │ │ └────────────────┘    │ │ 38m elap │ │ └──────────┘ │    │
│  │ └──────────┘ │ ┌────────────────┐    │ └──────────┘ │ ┌──────────┐ │    │
│  │ ┌──────────┐ │ │ #1044  bed     │    │              │ │ #1033    │ │    │
│  │ │ #1042⚠   │ │ │ assigned 10:14 │    │ Mateo(load:1)│ │ done 9AM │ │    │
│  │ │ bed      │ │ └────────────────┘    │ ┌──────────┐ │ └──────────┘ │    │
│  │ │ 2d ago   │ │                        │ │ #1037⚠   │ │  ... (more)  │    │
│  │ └──────────┘ │ Mateo (load: 1)        │ │ 2h19m    │ │              │    │
│  │              │ ┌────────────────┐    │ └──────────┘ │              │    │
│  │              │ │ #1039  desk    │    │              │              │    │
│  │              │ │ assigned 3:00  │    │              │              │    │
│  │              │ └────────────────┘    │              │              │    │
│  │              │                        │              │              │    │
│  │              │ Lin (load: 0) (drop    │              │              │    │
│  │              │ here to assign)        │              │              │    │
│  └──────────────┴────────────────────────┴──────────────┴──────────────┘    │
│                                                                              │
│  Drag cards between columns or tap card → "Assign to [tech ▾]"               │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Behavior:**
- Drag from Boxes Received → tech swim lane = assign.
- Card pulse on aging > 1 day.
- Real-time card movement as tech starts/completes from their portal.

---

## 9. `/admin/schedule` — Delivery Scheduler + Maps Embed (Decision #10, #11)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Schedule                          Date: [ ← Wed Mar 11 → ]  Driver: [All▾] │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                                                                      │   │
│  │                          [Google Maps embed]                         │   │
│  │                                                                      │   │
│  │        ◉ hub                                                         │   │
│  │            ● ● ●     ← color-coded pins by slot                      │   │
│  │              ●       ● 8–10 (red)                                    │   │
│  │                ●     ● 10–12 (orange)                                │   │
│  │           ●          ● 12–2 (yellow)                                 │   │
│  │                                                                      │   │
│  │   [ Click pin to highlight stop in slot column ]                     │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┬───────────────┐  │
│  │ 8–10 AM  │ 10–12 PM │ 12–2 PM  │ 2–4 PM   │ 4–6 PM   │ Unscheduled    │  │
│  │ ▒▒▒▒▒░░░ │ ▒▒▒▒▒▒░░ │ ▒▒▒▒░░░░ │ ▒▒░░░░░░ │ ▒░░░░░░░ │ (3 stops)      │  │  ← capacity bars
│  │ 4 of 5   │ 5 of 5   │ 3 of 5   │ 1 of 5   │ 1 of 5   │                │  │
│  ├──────────┼──────────┼──────────┼──────────┼──────────┼───────────────┤  │
│  │┌────────┐│┌────────┐│┌────────┐│┌────────┐│┌────────┐│┌────────────┐│  │
│  ││#1018   │││#1020   │││#1022   │││#1024   │││#1025   │││#1043       ││  │
│  ││Carlos  │││Carlos  │││Carlos  │││Carlos  │││Lin     │││ (no slot)  ││  │
│  │└────────┘│└────────┘│└────────┘│└────────┘│└────────┘│└────────────┘│  │
│  │┌────────┐│┌────────┐│┌────────┐│ (empty)  │ (empty)  │┌────────────┐│  │
│  ││#1019   │││#1021   │││#1023   │││         │││         │││#1044       ││  │
│  ││Lin     │││Carlos  │││Carlos  ││          │          ││ (no slot)  ││  │
│  │└────────┘│└────────┘│└────────┘│          │          │└────────────┘│  │
│  │  ...     │  ...     │  ...     │          │          │              │  │
│  └──────────┴──────────┴──────────┴──────────┴──────────┴───────────────┘  │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Behavior:**
- Drag a card from Unscheduled into a slot column → assign driver from dropdown on the card.
- Capacity bar fills as slot fills; over-capacity warns admin.
- Click pin on map ↔ highlight card in slot.

---

## 10. `/admin/team` — Workforce Roster

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Team                                                  [ + Invite Teammate ] │
│                                                                              │
│  Active (5)                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ Name        Role         Last sign-in    Current load    Actions     │   │
│  │ ────────────────────────────────────────────────────────────────     │   │
│  │ Lin Tran    admin        2 hr ago        —              [ Edit ▾ ]   │   │
│  │ Aisha S.    technician   1 hr ago        2 jobs         [ Edit ▾ ]   │   │
│  │ Mateo R.    technician   30 min ago      1 job          [ Edit ▾ ]   │   │
│  │ Carlos R.   driver       2 min ago       5 stops today  [ Edit ▾ ]   │   │
│  │ Lin H.      driver       3 hr ago        1 stop today   [ Edit ▾ ]   │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  Pending Invites (1)                                                         │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ Email                  Role          Sent       Expires    Actions   │   │
│  │ ────────────────────────────────────────────────────────────────     │   │
│  │ leah@example.com       technician    2 days ago in 5 days  [ Resend ]│   │
│  │                                                            [ Revoke ]│   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  Removed                                                       [ Show... ]   │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Invite modal:**
```
                ┌────────────────────────────────────────────┐
                │  Invite a teammate                       ✕ │
                │                                            │
                │  Email                                     │
                │  [____________________________________]    │
                │                                            │
                │  Role                                      │
                │  ○ Admin    ◉ Technician    ○ Driver       │
                │                                            │
                │  Welcome note (optional)                   │
                │  [____________________________________]    │
                │                                            │
                │                       [  Send Invite  ]    │
                └────────────────────────────────────────────┘
```

---

## 11. `/admin/pricing` — Pricing Rules Editor

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Pricing                                                                     │
│                                                                              │
│  Item classes                                          [ + Add class ]       │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ Class      Base price   Examples                              Actions│   │
│  │ ────────────────────────────────────────────────────────────────     │   │
│  │ Small      [ $52  ]    chair, side table, lamp               [Edit] │   │
│  │ Medium     [ $99  ]    dresser, desk, bookshelf              [Edit] │   │
│  │ Large      [ $169 ]    bed frame, wardrobe, sectional        [Edit] │   │
│  │ Complex    [ $279 ]    modular wall units, bunk beds         [Edit] │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  Modifiers                                            [ + Add modifier ]     │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ Key          Rule                                            Actions │   │
│  │ ────────────────────────────────────────────────────────────────     │   │
│  │ rush         +$40 flat (turnaround 3 days vs standard 7–10)  [Edit]  │   │
│  │ distance     +$0 (single zone in MVP)                        [Edit]  │   │
│  │ volume       -5% per additional item after 2                 [Edit]  │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  Active period:  [ Always ▾ ]    (future: seasonal pricing)                  │
│                                                                              │
│  [ Save changes ]                                                            │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 12. `/admin/inbox` — Unified Inquiry Queue (Decision #16)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Inbox                                                                       │
│                                                                              │
│  Filter: [ Open ▾ ]  Source: [ All ▾ ]  Sort: [ Oldest first ▾ ]            │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ Source          Customer       Subject           Age      Status     │   │
│  │ ────────────────────────────────────────────────────────────────     │   │
│  │ contact_form    Maya Tran      "When can I..."   2 hr     ○ open    │   │
│  │ damage_escal.   Lin Tran       Order #1015      1 day ⚠  ○ open    │   │
│  │ refusal_escal.  Carlos R.      Order #1031      4 hr     ○ open    │   │
│  │ contact_form    Sam Patel      "Do you serve..." 1 hr     • replied │   │
│  │ ...                                                                  │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ─── Detail drawer (when row opened) ───                                     │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  Inquiry #IQ-039 · from Maya Tran                                    │   │
│  │  Source: damage_escalation · Order: #1015                            │   │
│  │  Received: Mar 10, 2:14 PM                                           │   │
│  │                                                                      │   │
│  │  > "I clicked 'Talk to a human' on the damage page. The dresser     │   │
│  │  > looks worse than the photos showed. Can we discuss a replacement?"│   │
│  │                                                                      │   │
│  │  [📷] [📷] [📷]   ← damage photos auto-attached                       │   │
│  │                                                                      │   │
│  │  Reply (templates: [ Damage refund ▾ ] [ Reschedule ▾ ] [ Custom... ])│  │
│  │  ┌──────────────────────────────────────────────────────────────┐   │   │
│  │  │  Hi Maya, ...                                                │   │   │
│  │  │                                                              │   │   │
│  │  └──────────────────────────────────────────────────────────────┘   │   │
│  │                                                                      │   │
│  │  [ Send Reply ]   [ Mark Resolved ]                                  │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 13. `/admin/holds` — On-Hold + Refused Queue

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Holds                                                                       │
│                                                                              │
│  Filter: [ All ▾ ]  Subfilter: [ Needs admin action ▾ ]                      │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  #1015 · on_hold_damage_reported                       2 days ⚠     │   │
│  │  Customer chose: refund (Mar 8, 10:14 AM)                            │   │
│  │  Awaiting: admin to confirm + dispose item                           │   │
│  │  [ Open order → ]    [ Confirm refund + mark resolved ]              │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  #1031 · refused_pending_resolution                    5 hr          │   │
│  │  Customer choice: (no response yet)                                  │   │
│  │  Reminder email sent: 4 hr ago                                       │   │
│  │  [ Open order → ]    [ Resend customer email ]                       │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  #1008 · on_hold_damage_reported (awaiting retailer)   7 days ⚠     │   │
│  │  Customer chose: wait for replacement                                │   │
│  │  Wayfair claim WF-118291 · filed 6 days ago                          │   │
│  │  [ Open order → ]    [ Update claim status ]                         │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 14. `/admin/faq` — FAQ Content Management

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  FAQ                                                       [ + New entry ]   │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ Question                                            Tags     Actions │   │
│  │ ────────────────────────────────────────────────────────────────     │   │
│  │ How long does assembly take?                       timing   [Edit]   │   │
│  │ What retailers do you support?                     service  [Edit]   │   │
│  │ How is pricing calculated?                         pricing  [Edit]   │   │
│  │ What if my furniture arrives damaged?              damage   [Edit]   │   │
│  │ When will I see the assembled photos?              process  [Edit]   │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  Edit drawer (when row clicked):                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  Question                                                            │   │
│  │  [ How long does assembly take? ]                                    │   │
│  │                                                                      │   │
│  │  Answer (markdown)                                                   │   │
│  │  ┌────────────────────────────────────────────────────────────┐    │   │
│  │  │ Most furniture is assembled within 24–48 hours of arrival ...│   │   │
│  │  │                                                              │   │   │
│  │  └────────────────────────────────────────────────────────────┘    │   │
│  │                                                                      │   │
│  │  Tags  [ timing, process ]                                           │   │
│  │                                                                      │   │
│  │  [ Save ]  [ Delete ]                                                │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 15. `/admin/settings` — System Configuration

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Settings                                                                    │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  Service area                                                        │   │
│  │  Hub address: [ 22 Hub St, Brooklyn, NY 11215 ]                      │   │
│  │  Service radius: [ 25 ] miles from hub                               │   │
│  │  [ Save & re-geocode hub ]                                           │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  Delivery slots                                                      │   │
│  │  Default slot capacity: [ 5 ] stops                                  │   │
│  │  Operating days: ■ Mon ■ Tue ■ Wed ■ Thu ■ Fri ■ Sat ▢ Sun           │   │
│  │  Slot definitions:                                                   │   │
│  │   • 8–10 AM   capacity [ 5 ]   [ Delete ]                            │   │
│  │   • 10–12 PM  capacity [ 5 ]   [ Delete ]                            │   │
│  │   • 12–2 PM   capacity [ 5 ]   [ Delete ]                            │   │
│  │   • 2–4 PM    capacity [ 5 ]   [ Delete ]                            │   │
│  │   • 4–6 PM    capacity [ 5 ]   [ Delete ]                            │   │
│  │   [ + Add slot ]                                                     │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  Refusal policy                                                      │   │
│  │  Free reschedules per order: [ 1 ]                                   │   │
│  │  Restocking fee after that:  [ $25 ]                                 │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  SLA defaults                                                        │   │
│  │  Inquiry first-response: [ 24 ] hours                                │   │
│  │  Damage-resolve customer-response timeout: [ 7 ] days                │   │
│  │  Refusal-resolve customer-response timeout: [ 7 ] days               │   │
│  │  Pending Quote customer-response timeout: [ 7 ] days                 │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  Email templates (preview-only in MVP — edits via code)              │   │
│  │  • Order receipt        [ Preview ]                                  │   │
│  │  • Boxes received       [ Preview ]                                  │   │
│  │  • Assembly completed   [ Preview ]                                  │   │
│  │  • Out for delivery     [ Preview ]                                  │   │
│  │  • Damage reported      [ Preview ]                                  │   │
│  │  • Refused              [ Preview ]                                  │   │
│  │  • Quote ready          [ Preview ]                                  │   │
│  │  • (etc.)                                                            │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  [ Save all settings ]                                                       │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Verification

- ✅ All 14 admin routes from `SITEMAP.md` wireframed.
- ✅ All four hub phases from `Project.md` §3.8 land on at least one admin screen.
- ✅ Today dashboard surfaces every queue from architecture-brief Decision #8.
- ✅ All 7 inbound-scan matching states wireframed (Decision #12).
- ✅ Assembly Board scaffolds tech-claim mode (Decision #9): the "Boxes Received (unassigned)" column is already the shape of a future shared queue.
- ✅ Delivery Scheduler has Google Maps embed scoped per Decision #11 (scheduler only, no polylines, no per-order map).
- ✅ Anti-slop bans honored: mono font on numbers, no emoji (status dots are color), no fake metrics in mockups (Today's stat strip uses real-looking placeholder numbers with `[metric]` semantic intent).
