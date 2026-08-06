# Handoff: Service area Model 1 + quote travel fee

**Date:** 2026-08-06  
**Branch:** `feat/where-we-work-config`  
**PR base:** `develop` only  

---

## Product locks (owner)

1. **Longest drive (minutes) = not product** — hide/remove from Settings later; do not gate booking until Distance Matrix exists.
2. **Model 1 — free zone + pay only outside**
   - Inside radius (“We travel up to X”): **no travel fee**, no Travel line.
   - Outside radius: still bookable (**soft wall**); fee = **`ops.farFee`**; show on Where + Price + checkout totals.
   - Hard refuse: non-TX, ZIP refuse — not default outside radius.
3. **Distance tiers** stay in Settings for a future graduated model; **do not** charge customers under Model 1.
4. **Shop address** stays origin.
5. **Stripe:** deposit % applies to subtotal **including** travel; server re-prices; never trust client cents.

---

## Done this session

| Item | Path / notes |
|------|----------------|
| Pure Model 1 rules | `lib/quote/travel-pricing.ts` |
| Client totals + Travel line | `pricing.ts`, `PriceStep`, `QuoteAside`, `WhereStep` |
| Soft wall AddressField + Hero | accept outside radius + notice |
| Public `farFee` | `GET /api/public/service-area` |
| Server re-price | `server-pricing.ts`, draft + book-demo + soft-gate |
| Vault | architecture, security, components |
| Docs | `WHERE-WE-WORK.md` |

---

## Still open

1. Settings UI: hide drive minutes; Model 1 labels; clarify tiers = future  
2. Optional: Settings tester copy matches free zone language  
3. Order persistence / confirmation UI show travel line if desired  
4. ZIP exceptions fully enforced on book path when exceptions list is used  

---

## North star

Admin owns hub + radius + farFee; booking **prices only past the free zone**, never silent refuse past radius without a visible surcharge; drive minutes stay non-product until real Maps time; Stripe deposit always server-derived.
