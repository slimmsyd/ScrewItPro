# Technician & Driver Portals — Low-Fi Wireframes

ASCII wireframes for the two mobile-first workforce portals. Both are thumb-driven, camera-heavy, and used in the field — at the hub for technicians, in vehicles for drivers.

**Conventions:** see `customer-portal.md` header. Mobile viewport is approximately drawn at 40 chars wide to evoke the visual constraint.

---

# Part A — Technician Portal (`/tech/*`)

## A1. `/tech/jobs` — Today's Jobs (post-login landing)

```
 ┌──────────────────────────────────────┐
 │  [LOGO]              [Avatar ▾]      │  ← thin header
 ├──────────────────────────────────────┤
 │                                      │
 │   Today, Wed Mar 11                  │
 │   3 jobs assigned · 1 completed      │
 │                                      │
 │   ─────────────────────────────────  │
 │                                      │
 │   ┌────────────────────────────────┐ │
 │   │ #1042  Wayfair dresser + desk  │ │  ← active job card
 │   │ 🔵 in_assembly · 38m elapsed   │ │
 │   │ "Top drawer has cracked rail,  │ │
 │   │  see photos"                   │ │
 │   │                       [ Open ] │ │
 │   └────────────────────────────────┘ │
 │                                      │
 │   ┌────────────────────────────────┐ │
 │   │ #1044  IKEA bed frame          │ │  ← next job
 │   │ ⚪ assigned · ready to start    │ │
 │   │ "Standard build, no notes"     │ │
 │   │                       [ Open ] │ │
 │   └────────────────────────────────┘ │
 │                                      │
 │   ┌────────────────────────────────┐ │
 │   │ #1037  Wayfair wardrobe        │ │  ← completed (collapsed)
 │   │ 🟢 assembly_completed          │ │
 │   │ Finished 11:08 AM              │ │
 │   └────────────────────────────────┘ │
 │                                      │
 │   ▢ Show completed (1)                │
 │                                      │
 ├──────────────────────────────────────┤
 │   [ Jobs ●  ]   [ History ]   [ Me ] │  ← bottom nav (3 tabs)
 └──────────────────────────────────────┘
```

**Empty state:**
```
 ┌──────────────────────────────────────┐
 │                                      │
 │           No jobs assigned yet.      │
 │           Check with your manager.   │
 │                                      │
 │           [ Refresh ]                │
 └──────────────────────────────────────┘
```

**End-of-day state (all jobs completed):**
```
 ┌──────────────────────────────────────┐
 │                                      │
 │            All done.                 │
 │            Great work today.         │
 │                                      │
 │            3 of 3 completed          │
 │                                      │
 └──────────────────────────────────────┘
```

**Toast — reassigned:** `[ ⓘ This job was reassigned ]` slides in from top when an order leaves this tech's queue.

---

## A2. `/tech/jobs/[id]` — Job Detail

```
 ┌──────────────────────────────────────┐
 │   ← Jobs                             │
 ├──────────────────────────────────────┤
 │                                      │
 │   Order #1042                        │
 │   🔵 in_assembly · 38m elapsed       │
 │                                      │
 │   ──── Items ────                    │
 │   • Wayfair dresser (Medium)         │
 │     [link to retailer]               │
 │   • Wayfair desk (Medium)            │
 │     [link to retailer]               │
 │                                      │
 │   ──── Customer notes ────           │
 │   "Top drawer of dresser has a       │
 │    cracked rail, see photos."        │
 │                                      │
 │   ──── Unbox / intake photos ────    │
 │   [📷] [📷] (2)                       │
 │   [ + Add unbox photo ]              │
 │                                      │
 │   ──── Status ────                   │
 │                                      │
 │   ┌──────────────────────────────┐  │
 │   │   [  Start Assembly  ]       │  │  ← disabled if status != 'boxes_received'
 │   │                              │  │     enabled → big primary CTA
 │   └──────────────────────────────┘  │
 │                                      │
 │   (after Start) →                    │
 │                                      │
 │   ──── QC checklist (4 of 12) ────   │
 │   ■ All hardware accounted for       │
 │   ■ Drawers slide smoothly           │
 │   ■ Doors aligned                    │
 │   ■ No wobble (level check)          │
 │   ▢ Hardware torqued                 │
 │   ▢ Hinges seated                    │
 │   ▢ Drawer stops installed           │
 │   ▢ Cable management cleared         │
 │   ▢ Surface scratches checked        │
 │   ▢ Stickers + protective film off   │
 │   ▢ Item wiped down                  │
 │   ▢ Photos taken                     │
 │                                      │
 │   ──── Final photos ────             │
 │   No photos uploaded yet (need ≥1)   │
 │   [ + Add final photo ]              │
 │                                      │
 │   ┌──────────────────────────────┐  │
 │   │  [  Complete Assembly  ]     │  │  ← disabled until QC + ≥1 final photo
 │   └──────────────────────────────┘  │
 │                                      │
 │   ──── Damage? ────                  │
 │   [ Report damage ]   ← link         │
 │                                      │
 ├──────────────────────────────────────┤
 │   [ Jobs ]   [ History ]   [ Me ]    │
 └──────────────────────────────────────┘
```

**Reassigned toast appears here too if admin reassigns mid-view.**

**Photo capture flow (tap "+ Add unbox photo" or "+ Add final photo"):**
```
 ┌──────────────────────────────────────┐
 │                                      │
 │       (camera viewport, rear cam)    │
 │                                      │
 │       ──────────────                 │
 │       [  Capture  ]                  │
 │       ──────────────                 │
 │                                      │
 │       [ Retake ]   [ Use this ]      │  ← after capture
 │                                      │
 │   ⬆ uploading 70%   (queued if offline) │
 └──────────────────────────────────────┘
```

---

## A3. `/tech/jobs/[id]/damage` — Damage Report

```
 ┌──────────────────────────────────────┐
 │   ← Job #1042                        │
 ├──────────────────────────────────────┤
 │                                      │
 │   Report damage                      │
 │                                      │
 │   ──── What you saw ────             │
 │                                      │
 │   Photos (≥1 required)               │
 │   [📷] [📷]                           │
 │   [ + Add photo ]                    │
 │                                      │
 │   Severity (your call — admin info)  │
 │   ○ Minor (cosmetic, can proceed)    │
 │   ◉ Major (can't proceed safely)     │
 │                                      │
 │   Notes (required)                   │
 │   ┌──────────────────────────────┐  │
 │   │                              │  │
 │   │                              │  │
 │   └──────────────────────────────┘  │
 │                                      │
 │   This will:                         │
 │   • Flip order to On Hold            │
 │   • Notify admin immediately         │
 │   • Pause this job until resolved    │
 │                                      │
 │   ┌──────────────────────────────┐  │
 │   │  [  Submit Damage Report  ]  │  │
 │   └──────────────────────────────┘  │
 │                                      │
 │   [ Cancel ]                         │
 │                                      │
 └──────────────────────────────────────┘
```

---

## A4. `/tech/history`

```
 ┌──────────────────────────────────────┐
 │   History                            │
 ├──────────────────────────────────────┤
 │   Filter: [ Last 7 days ▾ ]          │
 │                                      │
 │   #1037  Wayfair wardrobe            │
 │   🟢 completed Mar 11, 11:08 AM      │
 │   Elapsed: 2h 14m                    │
 │                                      │
 │   #1029  IKEA bed frame              │
 │   🟢 completed Mar 10, 4:12 PM       │
 │   Elapsed: 1h 38m                    │
 │                                      │
 │   #1028  Wayfair dresser             │
 │   🔴 on_hold_damage (you reported)   │
 │   Mar 10, 9:51 AM                    │
 │                                      │
 │   ... (paginated)                    │
 │                                      │
 ├──────────────────────────────────────┤
 │   [ Jobs ]   [ History ●]  [ Me ]    │
 └──────────────────────────────────────┘
```

---

## A5. `/tech/profile`

```
 ┌──────────────────────────────────────┐
 │   Me                                 │
 ├──────────────────────────────────────┤
 │                                      │
 │   ┌────────┐                         │
 │   │ photo  │   Aisha S.              │
 │   └────────┘   technician            │
 │                                      │
 │   ──── Profile ────                  │
 │   Name   [ Aisha S.            ]     │
 │   Phone  [ (555) 391-0014      ]     │
 │   Photo  [ Replace photo ]           │
 │                                      │
 │   ──── Account ────                  │
 │   Email  aisha@example.com (read-only)│
 │   [ Change password ]                │
 │                                      │
 │   ──── Stats this month ────         │
 │   Jobs completed:  18                │
 │   Avg time:        1h 42m            │
 │                                      │
 │   ──────────────────────────         │
 │   [ Sign out ]                       │
 │                                      │
 ├──────────────────────────────────────┤
 │   [ Jobs ]   [ History ]   [ Me ● ]  │
 └──────────────────────────────────────┘
```

---

# Part B — Driver Portal (`/driver/*`)

## B1. `/driver/route` — Today's Route (post-login landing)

```
 ┌──────────────────────────────────────┐
 │  [LOGO]              [Avatar ▾]      │
 ├──────────────────────────────────────┤
 │                                      │
 │   Today, Wed Mar 11                  │
 │   5 stops · 1 delivered              │
 │                                      │
 │   ──────────────────────────         │
 │                                      │
 │   ▌ 8–10 AM · 2 stops                │  ← slot header
 │                                      │
 │   ┌────────────────────────────────┐ │
 │   │ ✓ #1018  Maya Tran             │ │  ← delivered
 │   │   442 Linden Ave, Apt 3B       │ │
 │   │   🟢 delivered 9:14 AM         │ │
 │   └────────────────────────────────┘ │
 │                                      │
 │   ┌────────────────────────────────┐ │
 │   │ #1019  Lin Tran                │ │  ← in progress
 │   │ 88 Maple St                    │ │
 │   │ ⋯ Out for delivery             │ │
 │   │ "Use service entrance"         │ │
 │   │                       [ Open ] │ │
 │   └────────────────────────────────┘ │
 │                                      │
 │   ▌ 10–12 PM · 1 stop                │
 │                                      │
 │   ┌────────────────────────────────┐ │
 │   │ #1020  Sam Patel               │ │
 │   │ 19 Oak Plaza, Suite 4          │ │
 │   │ Ready                          │ │
 │   │                       [ Open ] │ │
 │   └────────────────────────────────┘ │
 │                                      │
 │   ▌ 12–2 PM · 2 stops                │
 │                                      │
 │   ┌────────────────────────────────┐ │
 │   │ #1022  Aisha S.                │ │
 │   │ 12 Pine Court                  │ │
 │   │ Ready                          │ │
 │   │                       [ Open ] │ │
 │   └────────────────────────────────┘ │
 │                                      │
 │   ┌────────────────────────────────┐ │
 │   │ #1024  Carlos R.               │ │
 │   │ 7 Cherry Ln, Floor 2           │ │
 │   │ Ready                          │ │
 │   │                       [ Open ] │ │
 │   └────────────────────────────────┘ │
 │                                      │
 │   ────────────────                   │
 │   1 of 5 delivered                   │
 │                                      │
 ├──────────────────────────────────────┤
 │   [ Route ●]  [ History ]  [ Me ]    │
 └──────────────────────────────────────┘
```

**End-of-day state (all stops complete):**
```
 ┌──────────────────────────────────────┐
 │                                      │
 │       5 of 5 delivered               │
 │       Great work.                    │
 │                                      │
 │       Drive safe home.               │
 │                                      │
 └──────────────────────────────────────┘
```

---

## B2. `/driver/route/[stopId]` — Stop Detail

```
 ┌──────────────────────────────────────┐
 │   ← Route                            │
 ├──────────────────────────────────────┤
 │                                      │
 │   Stop · Order #1020                 │
 │   Slot: 10–12 PM                     │
 │                                      │
 │   ──── Address ────                  │
 │                                      │
 │   ┌────────────────────────────────┐ │
 │   │ 19 Oak Plaza, Suite 4          │ │  ← LARGE, copyable
 │   │ Brooklyn, NY 11215             │ │
 │   │                                │ │
 │   │  [  Open in Google Maps  ]     │ │  ← deeplink to maps://...
 │   │                                │ │
 │   │  3.2 mi · ~12 min from hub     │ │  ← mono font
 │   └────────────────────────────────┘ │
 │                                      │
 │   ──── Customer ────                 │
 │   Sam Patel                          │
 │   📞 [ (555) 482-9911 ]              │  ← tap-to-call
 │                                      │
 │   ──── Item ────                     │
 │   Wayfair dresser                    │
 │   Photo: [📷]                         │
 │                                      │
 │   ──── Notes ────                    │
 │   "Building entry code 8841.         │
 │    Suite 4 is at end of hall."       │
 │                                      │
 │   ──── Status ────                   │
 │                                      │
 │   ┌──────────────────────────────┐  │
 │   │   [  I'm here  ]             │  │  ← tap on arrival
 │   └──────────────────────────────┘  │
 │                                      │
 │   (after arrival) →                  │
 │                                      │
 │   How did it go?                     │
 │   ┌──────────────────────────────┐  │
 │   │   [  Delivered → POD  ]      │  │
 │   └──────────────────────────────┘  │
 │   ┌──────────────────────────────┐  │
 │   │   [  Refuse delivery  ]      │  │  ← destructive variant
 │   └──────────────────────────────┘  │
 │                                      │
 ├──────────────────────────────────────┤
 │   [ Route ]   [ History ]   [ Me ]   │
 └──────────────────────────────────────┘
```

---

## B3. `/driver/route/[stopId]/pod` — Proof of Delivery

Three steps: photos → signature → confirm.

### Step 1 — Photos

```
 ┌──────────────────────────────────────┐
 │   ← Stop                             │
 ├──────────────────────────────────────┤
 │                                      │
 │   Proof of Delivery                  │
 │   Order #1020 · Sam Patel            │
 │                                      │
 │   Step 1 of 3 — Photos               │
 │                                      │
 │   Capture the item in the room.      │
 │   At least one wide shot + one       │
 │   close-up.                          │
 │                                      │
 │   [📷] [📷] (2)                       │
 │   [ + Add photo ]                    │
 │                                      │
 │   ┌──────────────────────────────┐  │
 │   │  [  Continue → Signature  ]  │  │  ← disabled until ≥2 photos
 │   └──────────────────────────────┘  │
 │                                      │
 └──────────────────────────────────────┘
```

### Step 2 — Signature

```
 ┌──────────────────────────────────────┐
 │   ← Photos                           │
 ├──────────────────────────────────────┤
 │                                      │
 │   Step 2 of 3 — Signature            │
 │                                      │
 │   Hand the phone to the customer.    │
 │                                      │
 │   ┌────────────────────────────────┐ │
 │   │                                │ │  ← signature canvas (240px tall)
 │   │                                │ │
 │   │                                │ │
 │   │                                │ │
 │   └────────────────────────────────┘ │
 │                                      │
 │   [ Clear ]              [ Done ]    │  ← Done disabled until ≥1 stroke
 │                                      │
 └──────────────────────────────────────┘
```

### Step 3 — Confirm

```
 ┌──────────────────────────────────────┐
 │   ← Signature                        │
 ├──────────────────────────────────────┤
 │                                      │
 │   Step 3 of 3 — Confirm              │
 │                                      │
 │   Photos: [📷] [📷]                   │
 │                                      │
 │   Signature: [✎ captured]            │
 │                                      │
 │   ┌──────────────────────────────┐  │
 │   │  [  Mark Delivered  ]        │  │  ← big primary CTA
 │   └──────────────────────────────┘  │
 │                                      │
 │   This will:                         │
 │   • Mark order #1020 as delivered    │
 │   • Send receipt + review prompt     │
 │     to customer                      │
 │   • Move to next stop on your route  │
 │                                      │
 │   [ ← Go back ]                      │
 │                                      │
 └──────────────────────────────────────┘
```

---

## B4. `/driver/route/[stopId]/refuse` — Refusal

```
 ┌──────────────────────────────────────┐
 │   ← Stop                             │
 ├──────────────────────────────────────┤
 │                                      │
 │   Refuse delivery                    │
 │   Order #1020 · Sam Patel            │
 │                                      │
 │   ──── Reason ────                   │
 │                                      │
 │   ○ No one home & no answer          │
 │   ○ Customer refused                 │
 │   ○ Won't fit / wrong fit            │
 │   ○ Damage spotted at delivery       │  ← routes to damage flow (Q13)
 │   ○ Wrong item delivered             │
 │   ○ Other                            │
 │                                      │
 │   ──── Photo (required) ────         │
 │   [📷]                                │
 │   [ + Add photo ]                    │
 │                                      │
 │   ──── Note (optional) ────          │
 │   ┌──────────────────────────────┐  │
 │   │                              │  │
 │   └──────────────────────────────┘  │
 │                                      │
 │   ⚠ This will:                       │
 │   • Mark order as Refused           │
 │   • Notify the customer with photos │
 │     and your reason                  │
 │   • Truck returns this item to hub   │
 │                                      │
 │   You have ~10 minutes to undo this  │
 │   before the customer email is sent. │
 │                                      │
 │   ┌──────────────────────────────┐  │
 │   │  [  Confirm Refusal  ]       │  │
 │   └──────────────────────────────┘  │
 │                                      │
 │   [ ← Go back ]                      │
 │                                      │
 └──────────────────────────────────────┘
```

**Post-refusal screen (with reverse window):**
```
 ┌──────────────────────────────────────┐
 │                                      │
 │   Order #1020 marked Refused         │
 │                                      │
 │   Customer email will send in:       │
 │   ⏱ 9:42                              │
 │                                      │
 │   Mistake? Undo now:                 │
 │   [ Reverse this refusal ]           │
 │                                      │
 │   Otherwise →                        │
 │   [ Continue to next stop ]          │
 │                                      │
 └──────────────────────────────────────┘
```

---

## B5. `/driver/history`

```
 ┌──────────────────────────────────────┐
 │   History                            │
 ├──────────────────────────────────────┤
 │   Filter: [ Last 7 days ▾ ]          │
 │                                      │
 │   Wed Mar 11                         │
 │   ✓ 4 delivered · 1 refused          │
 │                                      │
 │   Tue Mar 10                         │
 │   ✓ 5 delivered                      │
 │                                      │
 │   Mon Mar 9                          │
 │   ✓ 6 delivered                      │
 │                                      │
 │   ... (paginated)                    │
 │                                      │
 ├──────────────────────────────────────┤
 │   [ Route ]   [ History ●][ Me ]     │
 └──────────────────────────────────────┘
```

Tap a day → drilldown to stops list with outcomes.

---

## B6. `/driver/profile`

Same shape as `/tech/profile` — name, phone, photo, password, stats, sign-out. Stats become:
```
   ──── Stats this month ────         │
   Stops delivered:   84              │
   Refused (avg):     4%              │
```

---

# Cross-Cutting Mobile Concerns (apply to both portals)

## Offline + poor-signal handling

```
 ┌──────────────────────────────────────┐
 │  ⓘ Offline — changes will sync when  │  ← persistent banner at top
 │    you reconnect.                    │
 ├──────────────────────────────────────┤
 │  (rest of UI continues to work       │
 │   read-only or with queued writes)   │
 └──────────────────────────────────────┘
```

Photo uploads queue locally with a retry indicator:
```
   [📷] uploading...  [📷] ⚠ retry     │
```

Status changes (Start Assembly, Complete Assembly, Delivered, Refused) queue locally and apply optimistically with a "Syncing..." toast.

## 403 / suspended-account state

```
 ┌──────────────────────────────────────┐
 │                                      │
 │       This account is suspended.     │
 │       Contact your admin.            │
 │                                      │
 │       [ Sign out ]                   │
 │                                      │
 └──────────────────────────────────────┘
```

## Phase-2 "Available" tab (currently hidden)

When `profiles.can_claim_jobs = true` (tech) or `profiles.can_claim_deliveries = true` (driver), the bottom nav adds a new "Available" tab between the primary tab and History — showing the unassigned shared queue:

```
 ┌──────────────────────────────────────┐
 │   Available jobs                     │
 │                                      │
 │   ┌────────────────────────────────┐ │
 │   │ #1051  Modular wall unit       │ │
 │   │ ⚪ unassigned · waiting 2 hr    │ │
 │   │                       [ Claim ]│ │
 │   └────────────────────────────────┘ │
 │   ...                                │
 │                                      │
 ├──────────────────────────────────────┤
 │ [Jobs] [Available●] [History] [Me]   │
 └──────────────────────────────────────┘
```

---

## Verification

- ✅ Every tech route in `SITEMAP.md` §E wireframed (5 routes).
- ✅ Every driver route in `SITEMAP.md` §F wireframed (6 routes).
- ✅ All technician flow nodes from `USER-FLOWS.md` Flow 4 covered.
- ✅ All driver flow nodes from `USER-FLOWS.md` Flow 5 covered.
- ✅ Phase 2 scaffolding visible (Available tab placeholder, can_claim_* flags).
- ✅ Mobile-first conventions per DESIGN.md §6: ≥44px touch targets, no horizontal scroll, single-column collapse.
- ✅ Camera-heavy surfaces: photo uploader component reused across intake, final, damage, POD, refusal.
- ✅ Anti-slop: signature canvas uses ink color (DESIGN.md `ink_primary`), no celebratory animations on damage/refusal flows, no fake metrics in stats panels.
