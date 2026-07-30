# Components catalog

**Rule:** Always check this file before creating a new component. Prefer reuse or a small variant extension over a parallel button/badge/shell.

**Paths** are relative to `my-app/src/components/`.

**Update as you go:** when you add a reusable primitive or domain shell, add a row here in the same change.

---

## Rules of the road

1. **Primitives live in `ui/`.** Buttons, badges, layout containers, loaders — not feature-specific cards.
2. **Domain components live in domain folders** (`quote/`, `orders/`, `portal/`, `home/`, …). Do not dump feature UI into `ui/`.
3. **Extend variants** (e.g. `Button` `primary|secondary|ghost`) before inventing `PrimaryButton.tsx`.
4. **Shells own chrome.** New portal pages should wrap `CustomerAppShell` (or the correct domain shell), not re-implement sidebars.
5. **Match styling system:** CSS variables + inline styles (see `vault/branding_and_design.md`). Do not introduce a second component library without an architecture decision.
6. **WIP marker:** components marked *in flux* may move while portal work lands — prefer importing existing paths over copying.

---

## UI primitives (`ui/`)

| Name | Path | Kind | API / variants | Use when | Do not reinvent |
|------|------|------|----------------|----------|-----------------|
| **Button** | `ui/Button.tsx` | Primitive | `variant`: primary \| secondary \| ghost; `size`: sm \| md \| lg; standard button HTML attrs | CTAs, form submits, secondary actions | Ad-hoc `<button>` with brand blues hard-coded |
| **Badge** | `ui/Badge.tsx` | Primitive | `variant`: brand \| accent \| neutral | Pills, labels, small status chips (non-order) | New pill styles without reason |
| **Container** | `ui/Container.tsx` | Layout | Client-friendly max-width wrapper | Marketing / client sections | Random max-width divs |
| **ServerContainer** | `ui/ServerContainer.tsx` | Layout | RSC-safe container | Server components needing same width rhythm | Duplicate container logic |
| **Eyebrow** | `ui/Eyebrow.tsx` | Typography | Small uppercase/label text above titles | Section kicker labels | One-off tracking CSS each time |
| **SectionTitle** | `ui/SectionTitle.tsx` | Typography | Section heading block | Landing / long-form section headers | Inconsistent h2/h3 stacks |
| **ImageSlot** | `ui/ImageSlot.tsx` | Media | Placeholder / framed image slot | Layouts awaiting assets | Unstyled empty boxes |
| **Reveal** | `ui/Reveal.tsx` | Motion | Scroll/enter reveal wrapper | Marketing section entrance motion | New Framer boilerplate per section |
| **ThinkingLoader** | `ui/ThinkingLoader.tsx` | Feedback | “Thinking” / processing indicator | Chat, async AI, soft waits | Spinners that break brand motion |

---

## Providers

| Name | Path | Kind | Use when |
|------|------|------|----------|
| **LocaleProvider** | `providers/LocaleProvider.tsx` | Context | Public i18n (`useLocale` / `t()`) |
| **MemberProvider** | `providers/MemberProvider.tsx` | Context | Signed-in member chip / avatar / session UI |
| **MotionProvider** | `providers/MotionProvider.tsx` | Context | Global motion preferences / reduced motion |

---

## Shells (layout chrome)

| Name | Path | Kind | Use when | Notes |
|------|------|------|----------|-------|
| **CustomerAppShell** | `portal/CustomerAppShell.tsx` | Portal shell | Customer “state” app pages (jobs, account, notifications) | Sidebar desktop; drawer mobile; progressive nav via `portalNav.ts` |
| **ConfirmationShell** | `portal/ConfirmationShell.tsx` | Portal shell | Post-book confirmation framing | Church/state boundary helper |
| **QuoteShell** | `quote/QuoteShell.tsx` | Flow shell | Quote journey steps | Step layout + aside patterns |
| **AccountPageShell** | `account/AccountPageShell.tsx` | Page shell | Account page framing | May compose with portal shell |
| **LegalPageShell** | `legal/LegalPageShell.tsx` | Page shell | Privacy / terms | Long-form legal layout |
| **AeoShell** | `aeo/AeoShell.tsx` | Page shell | AEO/SEO content landings | Answer-engine optimized structure |

### Portal nav

| Name | Path | Kind | Use when |
|------|------|------|----------|
| **portalNav** | `portal/portalNav.ts` | Config | Adding/removing portal nav items | Only ship links for routes that exist |

---

## Quote flow (`quote/`)

| Name | Path | Kind | Use when |
|------|------|------|----------|
| **QuoteStepper** | `quote/QuoteStepper.tsx` | Nav | Step indicator for quote wizard |
| **ItemsStep** | `quote/ItemsStep.tsx` | Step | Orchestrates entry mode + mode panels (keep thin) |
| **BuyMode** | `quote/items/BuyMode.tsx` | Step panel | Buy-new: **paste-link only** (no mock catalog); advisory retailer logos |
| **HomeMode** | `quote/items/HomeMode.tsx` | Step panel | Boxed-at-home item form + voice notes |
| **StoreMode** | `quote/items/StoreMode.tsx` | Step panel | Store pickup order form (`COLLECTION_STORES`) |
| **items/shared** | `quote/items/shared.tsx` | Shared | FieldLabel, inputStyle, stepperBtn for items panels |
| **retailers** | `lib/quote/retailers.ts` | Config | `SUPPORTED_RETAILERS` (display only) + `COLLECTION_STORES` — never gate lookup |
| **WhereStep** | `quote/WhereStep.tsx` | Step | Address / service area |
| **PriceStep** | `quote/PriceStep.tsx` | Step | Pricing + deposit presentation |
| **AddressField** | `quote/AddressField.tsx` | Field | Address entry with places behavior |
| **BuildCart** | `quote/BuildCart.tsx` | Domain | Cart/line items in quote |
| **PaymentAside** | `quote/PaymentAside.tsx` | Aside | Payment summary rail |
| **QuoteAside** | `quote/QuoteAside.tsx` | Aside | Quote summary rail |
| **QuoteAccountMenu** | `quote/QuoteAccountMenu.tsx` | Chrome | Account menu / initials in quote mode |
| **ScreenTransition** | `quote/ScreenTransition.tsx` | Motion | Step transitions |

Supporting domain logic: `my-app/src/lib/quote/*` (not components — do not duplicate pricing math in UI).

## Join / waitlist (`join/`)

| Name | Path | Kind | Use when |
|------|------|------|----------|
| **JoinPage** | `app/join/page.tsx` | Page | Thin Suspense shell only |
| **JoinForm** | `join/JoinForm.tsx` | Form | Signup / login / success / share flow |
| **joinUi** | `join/joinUi.tsx` | Shared | GoogleMark, PasswordField, field styles |
| **joinHelpers** | `join/joinHelpers.ts` | Helpers | Error maps, waitlist enroll, readiness |

---

---

## Orders (`orders/`)

| Name | Path | Kind | Use when |
|------|------|------|----------|
| **ConfirmationPanel** | `orders/ConfirmationPanel.tsx` | Domain | Post-book confirmation body |
| **TrackOrderView** | `orders/TrackOrderView.tsx` | Domain | Tracking page main view |
| **OrderTimeline** | `orders/OrderTimeline.tsx` | Domain | Status timeline |
| **OrderStatusTag** | `orders/OrderStatusTag.tsx` | Domain | Order status chip (prefer this over free-form badges for order state) |
| **OrderSummaryAside** | `orders/OrderSummaryAside.tsx` | Aside | Order money/items summary |
| **OrderItemThumb** | `orders/OrderItemThumb.tsx` | Media | Product thumbnail in order UI |
| **useDisplayOrder** | `orders/useDisplayOrder.ts` | Hook | Resolve display order model |

Supporting domain logic: `my-app/src/lib/orders/*`.

---

## Portal customer app (*in flux*)

These exist on the current branch; structure may still change. **Import — don’t fork.**

| Name | Path | Kind | Use when |
|------|------|------|----------|
| **MyJobsView** | `portal/MyJobsView.tsx` | View | Jobs list / my jobs page |
| **JobStatusPill** | `portal/JobStatusPill.tsx` | Domain | Job status pill (portal jobs) |
| **NotificationsView** | `portal/NotificationsView.tsx` | View | Notifications list UI |
| **ReferralsView** | `portal/ReferralsView.tsx` | View | Referrals page UI |
| **AccountTabsView** | `portal/account/AccountTabsView.tsx` | View | Account tab shell |
| **ProfilePanel** | `portal/account/ProfilePanel.tsx` | Panel | Profile fields |
| **AddressesPanel** | `portal/account/AddressesPanel.tsx` | Panel | Saved addresses |
| **PaymentPanel** | `portal/account/PaymentPanel.tsx` | Panel | Payment methods UI |
| **accountStyles** | `portal/account/accountStyles.ts` | Styles | Shared portal account styles |

---

## Marketing / home (`home/`)

Prefer composing existing sections rather than rebuilding the landing page.

| Name | Path | Kind | Use when |
|------|------|------|----------|
| **LandingPage** | `home/LandingPage.tsx` | Page | Full homepage composition |
| **Nav** | `home/Nav.tsx` | Chrome | Marketing nav (not portal sidebar) |
| **MobileMenu** | `home/MobileMenu.tsx` | Chrome | Marketing mobile nav |
| **Hero** (+ HeroSearch, HeroAddressBar, HeroBackdrop) | `home/Hero*.tsx` | Section | Above-the-fold marketing |
| **SupportChat** | `home/SupportChat.tsx` | Widget | Chip concierge / support chat shell |
| **HoustonMap** | `home/HoustonMap.tsx` | Map | Service area map |
| **Footer** | `home/Footer.tsx` | Chrome | Site footer |
| Other sections | `home/*` | Section | HowItWorks, Services, FAQ, WhyUs, Audiences, etc. |

Also: `home/index.ts` re-exports — use when already established.

---

## AEO / SEO / analytics / legal

| Name | Path | Kind | Use when |
|------|------|------|----------|
| AEO blocks | `aeo/AnswerBlock.tsx`, `FaqList.tsx`, `ProofGrid.tsx`, `ComparisonTable.tsx`, `CtaBand.tsx`, `ExamplesLists.tsx` | Content | AEO landing building blocks |
| **JsonLdScript** / **SiteJsonLd** | `seo/*` | SEO | Structured data injection |
| **GoogleAnalytics** | `analytics/GoogleAnalytics.tsx` | Analytics | GA4 snippet when ID configured |
| **LegalPageShell** | `legal/LegalPageShell.tsx` | Shell | Legal pages |

---

## Intentionally not components (don’t rebuild as UI kits)

| Concern | Location |
|---------|----------|
| Design tokens | `my-app/src/app/globals.css` |
| Site paths / assets / mode | `my-app/src/lib/site.ts` |
| Quote state / pricing | `my-app/src/lib/quote/*` |
| Order status model | `my-app/src/lib/orders/*` |
| Confetti | `my-app/src/lib/confetti.ts` |

---

## Adding a new component (checklist)

1. Search this catalog + `components/` for an existing match.
2. If extending a primitive, add a variant — update this table’s API column.
3. If domain-specific, place under the domain folder.
4. Prefer CSS variables (`var(--blue-deep)`) over raw hex.
5. Add a row to this file.
6. If it changes architecture (new shell, new design system), also update `architecture.md` / `branding_and_design.md`.

---

## Gaps / known missing primitives

Not yet in `ui/` — create carefully if needed, then catalog:

- Text input / select / checkbox / radio (many forms inline today; join uses `join/joinUi` PasswordField)
- Modal / dialog primitive (quote may use custom dialogs)
- Table primitive (admin leads may be page-local)
- Toast / snackbar system

When you add any of these, they become the single source — no second series.

### Size guardrail

Prefer **no single source file over ~1,000 lines** (components/pages). Split by mode/panel/helpers when approaching the limit. Token CSS in `globals.css` may stay longer as design-system surface.

---

## Changelog

| Date | Change |
|------|--------|
| 2026-07-30 | Initial catalog from codebase inventory |
| 2026-07-30 | Split ItemsStep → quote/items/*; join page → JoinForm + joinUi + helpers |
| 2026-07-30 | Slice 1: delete OrdersShell + mock-catalog; BuyMode paste-only; retailers.ts |
