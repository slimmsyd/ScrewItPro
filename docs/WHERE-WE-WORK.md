# Where we work + travel fee (Model 1)

**Branch:** `feat/where-we-work-config`  
**Goal:** Admin hub radius drives map + free zone; outside radius stays bookable with a visible travel fee.

| Phase | Status | Notes |
|-------|--------|--------|
| 1 Config + public GET | done | `lib/config/service-area.ts`, `/api/public/service-area` (+ `farFee`) |
| 2 Booking Where | done | soft wall outside radius; travel callout |
| 3 Marketing map | done | HoustonMap uses radiusM |
| 4 Model 1 travel pure rules | done | `lib/quote/travel-pricing.ts` |
| 5 Quote Price + totals | done | Travel line when outside; deposit includes travel |
| 6 Server re-price (Stripe) | done | draft + soft-gate use delivery lat/lng + hub/ops |
| 5 Settings UX polish | open | hide drive minutes; Model 1 copy; tiers labeled “future” |
| Vault | done | architecture + security + components |

## Model 1 (locked)

| Distance | Customer effect |
|----------|-----------------|
| **≤ “We travel up to” (radius)** | No travel fee; no Travel line on Price |
| **> radius** | Still bookable; **Travel · out of area** + `farFee`; in total before 30% deposit |
| **Non-TX** | Hard refuse |
| **ZIP refuse** | Hard refuse (when exception set) |

Distance **tiers** in Admin Settings are **reserved** (future graduated pricing). They do **not** charge under Model 1.

## Manual test

1. Admin Settings: radius **40**, farFee **45**. Save.  
2. Quote: delivery **downtown** → no Travel line; total = assembly + delivery (+ pickup if any).  
3. Delivery ~**50 mi** out → Where callout + Price **Travel · out of area $45**; deposit 30% of full total.  
4. Map circle still matches radius.  
5. Book path (when signed in): order `total_cents` / `deposit_cents` must match server re-price (not client spoof).

## Stripe readiness

- Client preview only for UX.  
- `POST /api/quote/draft` and soft-gate book recompute travel from `deliveryLat` / `deliveryLng` / `deliveryZip`.  
- Checkout still `{ orderId }` only — deposit from order row.

## Non-goals (still open)

Drive-minutes gate, tier-based fees on quote, SEO schema from live hub, Settings copy cleanup.
