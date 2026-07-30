# Branding & design

**Live source of truth for tokens:** `my-app/src/app/globals.css`  
**Asset root:** `my-app/public/assets/`  
**Secondary / historical notes:** `my-app/DESIGN.md` (contains older teal/Zinc placeholder sections — **do not reintroduce teal** without an explicit brand decision and CSS update)

---

## Brand personality

- White-glove, operational, trustworthy — daily-use product density, not portfolio fluff.
- Confident blues (deep + electric), cool neutrals, restrained motion.
- Tagline energy: *If You Don't Want to Do It, ScrewIt!*

---

## Color system (live CSS variables)

### Brand blues

| Token | Hex | Role |
|-------|-----|------|
| `--blue-deep` | `#04209B` | Primary brand, headings, primary buttons |
| `--blue-electric` | `#1D6EFE` | Accent, links, focus, CTAs secondary emphasis |
| `--blue-navy` | `#29388D` | Supporting navy |
| `--blue-steel` | `#436DB5` | Supporting steel |
| `--blue-50` … `--blue-900` | scale | Surfaces, borders, hover steps (`--blue-700` used on primary hover) |

Semantic aliases:

- `--color-primary` → deep  
- `--color-accent` → electric  
- `--text-heading` → deep  
- `--text-link` / `--border-focus` → electric  

### Neutrals

| Token | Role |
|-------|------|
| `--ink-900` / `--ink-700` / `--ink-500` / `--ink-300` | Text hierarchy |
| `--gray-200` / `--gray-100` / `--gray-50` | Borders, washes, subtle surfaces |
| `--white` | Cards, page surface |

### Status

| Token | Use |
|-------|-----|
| `--status-success` (+ `-bg`) | Success states |
| `--status-warning` (+ `-bg`) | Warnings / pending attention |
| `--status-error` / `--status-error-text` (+ `-bg`) | Errors |

Order lifecycle chips: prefer `orders/OrderStatusTag` and order status helpers over inventing a new chip palette. Full lifecycle palette intent also appears in `DESIGN.md` (align with CSS when implementing ops UI).

---

## Typography

| Role | Live stack |
|------|------------|
| Display | `--font-display` → Miguer Sans (`next/font/local` → `--font-miguer`) |
| Body | `--font-body` → Instrument Sans stack |

Scale tokens: `--text-hero`, `--text-h1` … `--text-xs`; weights `--weight-regular` … `--weight-bold`.

### Avoid

- Defaulting premium UI to **Inter** without decision
- Random serif in ops/portal surfaces
- Introducing a third font family for a single page

---

## Spacing, radius, shadow, layout

From `globals.css`:

- Spacing: `--space-1` (4px) … `--space-10` (128px)
- Radius: `--radius-sm` 6px → `--radius-pill` 999px (buttons use pill)
- Shadows: `--shadow-sm|md|lg` and `--shadow-focus` (blue-tinted)
- Container: `--container-max: 1200px`; section pad `--section-pad-y: 72px`
- Motion: `--ease-out`, `--ease-reveal`, `--duration-fast` (120ms), `--duration-base` (200ms)

---

## Assets & visual anchors

Centralize paths via `my-app/src/lib/site.ts` → `ASSETS` when possible.

| Asset | Typical path | Use |
|-------|--------------|-----|
| Wordmark / primary logo | `/assets/logo-primary-full-color.jpg` | Marketing headers |
| S mark deep blue | `/assets/logo-icon-deep-blue.png` | Favicons, brand icon |
| S mark white | `/assets/logo-s-white.png` | On deep surfaces |
| Electric mark | `/assets/logo-icon-electric-blue.jpg` | Accent treatments |
| Mascot wave / living room / thumbs-up | `/assets/mascot-*.jpg|png` | Marketing, empty states, personality |
| Crew / community | `/assets/team-community.png` | Trust / audiences |
| Retailer marks | `/assets/retailers/*` | Quote / catalog credibility |
| Hero / route media | `hero-loop.*`, `houston-route-map.jpg`, etc. | Landing motion/map |

**OG / share:** white S on deep blue (see `opengraph-image` routes).

---

## Motion guidelines

- **Restrained** — product is used for real ops, not spectacle.
- Marketing: `Reveal` + Framer Motion section entrances; hero media.
- Quote / book: short transitions (`ScreenTransition`); confetti on successful book (`lib/confetti.ts`) — brand celebration, not constant particle noise.
- Respect reduced motion where `MotionProvider` / hooks provide mode.
- Prefer opacity/transform over layout thrash.

---

## UI composition patterns

1. **Primary button** = deep blue fill, white text, pill radius (`Button` primary).
2. **Secondary** = white + gray border + deep text.
3. **Ghost** = transparent, ink text.
4. **Focus** = electric ring (`--shadow-focus` / `--border-focus`).
5. **Cards** = white surface, subtle border/shadow, generous padding from spacing scale.
6. **Church vs state:** marketing Nav vs `CustomerAppShell` — different chrome; keep visual tokens the same.

---

## Inspiration & reference pack

| Source | What it’s for |
|--------|----------------|
| Live site tokens | `globals.css` (authoritative) |
| Component examples | `vault/components.md` + existing quote/orders/portal screens |
| Long-form design notes | `my-app/DESIGN.md` (status chips, density intent) — reconcile with CSS |
| Wireframes | `my-app/wireframes/*` |
| Flows | `my-app/USER-FLOWS.md` |
| Historical handoff note | README mentions design handoff packages on disk (tokens/sections/chat launcher) |

### Optional “mood” notes (fill as you collect)

Add screenshots, competitor refs, or approved mock links **below** as the team gathers them — do not invent brand directions here.

```
<!-- Inspiration inbox
- 
-->
```

---

## Anti-patterns (AI slop guards)

- Teal/mint accent systems from stale DESIGN placeholders
- Purple-gradient “SaaS default” heroes
- Inter + gray-only admin look that ignores brand blues
- New button component per page
- Hard-coded hex in components when a CSS variable exists
- Heavy glassmorphism / noisy backgrounds on ops screens
- Mixing marketing Nav into portal shell pages without intent

---

## When tokens change

1. Update `globals.css` first.
2. Update this file’s tables.
3. Grep for old hex values in components.
4. Note the decision in the changelog below (and `architecture.md` if structural).

---

## Changelog

| Date | Change |
|------|--------|
| 2026-07-30 | Vault branding baseline; CSS declared live SoT over DESIGN.md placeholders |
