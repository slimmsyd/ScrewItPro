# AEO: Next Steps to Finalize

Status of `/furniture-assembly-pickup-delivery-houston` and the JSON-LD schema
foundation shipped in this PR, and what's still needed to close out
`docs/ScrewIt_Pros_Houston_AEO_Schema_Spec.docx`.

## Shipped in this PR

- `/furniture-assembly-pickup-delivery-houston` — answer-first landing page,
  fully server-rendered, zero client JS.
- Schema foundation: `src/lib/seo/business.ts` (single source of NAP facts),
  `src/lib/seo/schema.ts` (JSON-LD builders), `src/components/seo/SiteJsonLd.tsx`.
- `LocalBusiness` + `WebSite` on every page that needs them; `Service`,
  `FAQPage`, `BreadcrumbList` on the AEO page; `FAQPage` now also on the
  homepage (the existing 10 FAQs were invisible to answer engines before).
- Sitemap entry, Footer link (so the page isn't an orphan).

## Missing information — blocks full spec completion

These are **deliberately omitted** from the emitted schema rather than
filled with placeholders (see spec §3: "Do NOT add an aggregateRating or
review markup until you have real reviews... the same applies to inventing a
phone number"). Each is a one-line change in `src/lib/seo/business.ts` once
the real value exists:

| Field | `business.ts` key | What's needed |
|---|---|---|
| Phone | `telephone` | A real business line. The spec's placeholder (`+1-000-000-0000`) was intentionally not used. |
| Directory profiles | `sameAs` | Claim free profiles — Yelp, Thumbtack, Angi, Nextdoor — then paste the URLs in. Per spec §4, this can start now (pre-launch, no reviews needed to claim a profile). |
| Operating hours | `openingHours` | Confirm real hours with the business. The spec proposed Mon–Sat 8am–6pm, but the site's own copy says "seven days a week" (`en.ts`) — these contradict each other. Whichever is true needs to be the single source, and this file should match it. |

## Sequenced per the spec (§4)

**Do now (no domain or reviews required):**
- [ ] Create the Google Business Profile, begin verification (~2 weeks lead time — start this early)
- [ ] Claim Yelp / Thumbtack / Angi / Nextdoor profiles → fill `sameAs`
- [ ] Set up the review-request flow (short link + QR + follow-up text) so reviews start accumulating from day one of launch
- [ ] Confirm real phone number and hours → fill `telephone` / `openingHours`

**At launch (custom domain live):**
- [ ] Confirm `NEXT_PUBLIC_APP_URL` points at the real domain — all schema URLs derive from it and self-correct automatically, no code change needed
- [ ] Point the Google Business Profile at the new domain
- [ ] Submit the sitemap in Google Search Console; request indexing for the AEO page specifically
- [ ] Flip `SITE_MODE` from `"waitlist"` to `"quote"` in `src/lib/site.ts` — the AEO page's CTAs and `Service.offers.availability` (`PreOrder` → `InStock`) update automatically, no other change required

**After reviews accumulate:**
- [ ] Add `aggregateRating`/`review` markup to `buildLocalBusiness` in `schema.ts` — not before. Inventing ratings risks a Google penalty.
- [ ] Clone the AEO page structure for neighborhood pages (Katy, Sugar Land, The Woodlands, Pearland, Cypress) and retailer pages (IKEA, Wayfair). The content module (`src/content/aeo/furniture-assembly-houston.ts`) and schema builders (`src/lib/seo/schema.ts`) are written to be reused — a neighborhood page needs a new content file plus a `buildService`/`buildFaqPage` call with a different `pageUrl`, not new schema code.

## Verification checklist for whoever picks this up

Run these before considering the schema "done":
- `curl -s <url>/furniture-assembly-pickup-delivery-houston | python3 -c "..."` — confirm the answer paragraph (`data-answer`) is still the first text node after `<h1>`. Future edits to `AnswerBlock.tsx` should never add anything above it.
- Every `{"@id": X}` reference in the page's JSON-LD must resolve to a matching node **on that same page** — `SiteJsonLd` must be present anywhere `Service`/`FAQPage` references `#business`.
- FAQ text in the JSON-LD must match the rendered `<summary>`/`<p>` text exactly — this is guaranteed by construction (both read `PAGE.faqs`), so a mismatch means someone re-typed a string instead of editing the shared array.
- https://validator.schema.org/ — paste the page's rendered JSON-LD, expect 0 errors.
- https://search.google.com/test/rich-results — expect only `BreadcrumbList` to register as a rich result. `FAQPage`/`LocalBusiness`/`Service` reporting "no rich results" is correct, not a bug — the value here is LLM extraction, not SERP rich snippets.
