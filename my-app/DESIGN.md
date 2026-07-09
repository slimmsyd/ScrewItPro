---
# ─────────────────────────────────────────────────────────────────
# Screw It Pro — DESIGN.md
# Google Stitch format (open-sourced, agent-consumable).
# Machine-readable tokens up here; human rationale in the Markdown body below.
# Branding placeholders: Zinc neutral base + deep teal accent.
# Replace ~6 hex values when real brand assets arrive.
# ─────────────────────────────────────────────────────────────────

meta:
  project: Screw It Pro
  product: Integrated Assembly & Logistics Platform
  audience: customer / admin / technician / driver
  density: 5          # balanced — daily ops app, not a portfolio
  variance: 6         # confident asymmetry where appropriate
  motion: 4           # restrained — this is an 8-hour-a-day tool
  brand_status: placeholder

colors:
  # Neutrals — single Zinc family across the entire product
  canvas:               "#FAFAF9"   # primary page background (warm zinc)
  surface:              "#FFFFFF"   # cards, modals, raised containers
  surface_subtle:       "#F4F4F5"   # input fields, nested containers
  surface_inverse:      "#18181B"   # dark surfaces (rare; reserved for hero overlays)

  ink_primary:          "#18181B"   # primary text — Charcoal Ink, NOT pure black
  ink_secondary:        "#52525B"   # body text on light surface
  ink_tertiary:         "#71717A"   # metadata, captions, helper text
  ink_disabled:         "#A1A1AA"
  ink_on_dark:          "#FAFAF9"   # text on inverse surface

  border_subtle:        "#E4E4E7"   # 1px structural lines
  border_strong:        "#D4D4D8"   # divider where contrast matters
  border_focus:         "#0F766E"   # focus rings (uses accent)

  # Single accent — deep teal. Saturation < 80%. Hints at existing landing page.
  accent:               "#0F766E"   # primary CTA, links, focus, selected state
  accent_hover:         "#0D655E"   # hover/active for accent
  accent_subtle:        "#CCFBF1"   # accent-tinted backgrounds (badges, pills)
  accent_ink:           "#134E4A"   # text/icon on accent_subtle

  # Semantic colors — calibrated, NOT oversaturated
  success:              "#16A34A"
  success_subtle:       "#DCFCE7"
  success_ink:          "#14532D"
  warning:              "#CA8A04"
  warning_subtle:       "#FEF9C3"
  warning_ink:          "#713F12"
  alert:                "#DC2626"
  alert_subtle:         "#FEE2E2"
  alert_ink:            "#7F1D1D"
  info:                 "#2563EB"
  info_subtle:          "#DBEAFE"
  info_ink:             "#1E3A8A"

  # Order-status chip palette — 1:1 with the lifecycle enum.
  # Each chip uses {background: *_subtle, text: *_ink, dot: *} so dots stack on tables.
  status_pending_quote:        { bg: "#FEF9C3", fg: "#713F12", dot: "#CA8A04" }  # warning tone
  status_quote_sent:           { bg: "#FEF3C7", fg: "#92400E", dot: "#D97706" }  # warning lighter
  status_awaiting_arrival:     { bg: "#F4F4F5", fg: "#3F3F46", dot: "#71717A" }  # neutral
  status_boxes_received:       { bg: "#DBEAFE", fg: "#1E3A8A", dot: "#2563EB" }  # info
  status_in_assembly:          { bg: "#CCFBF1", fg: "#134E4A", dot: "#0F766E", animate: "pulse" }   # accent + pulse
  status_assembly_completed:   { bg: "#DCFCE7", fg: "#14532D", dot: "#16A34A" }  # success
  status_ready_for_delivery:   { bg: "#DBEAFE", fg: "#1E3A8A", dot: "#2563EB" }  # info
  status_out_for_delivery:     { bg: "#CCFBF1", fg: "#134E4A", dot: "#0F766E", animate: "pulse" }   # accent + pulse
  status_delivered:            { bg: "#DCFCE7", fg: "#14532D", dot: "#16A34A" }  # success
  status_refused:              { bg: "#FEE2E2", fg: "#7F1D1D", dot: "#DC2626" }  # alert
  status_on_hold_damage:       { bg: "#FEE2E2", fg: "#7F1D1D", dot: "#DC2626" }  # alert
  status_refunded_closed:      { bg: "#F4F4F5", fg: "#52525B", dot: "#A1A1AA" }  # muted
  status_cancelled_no_payment: { bg: "#F4F4F5", fg: "#52525B", dot: "#A1A1AA" }  # muted

typography:
  display:
    family:  "Geist, ui-sans-serif, system-ui, sans-serif"
    weights: [500, 600, 700]
    tracking: "-0.02em"            # track-tight
    leading:  "1.05"
    scale:
      hero:    { size: "clamp(2.5rem, 6vw, 4.5rem)", weight: 700 }
      h1:      { size: "clamp(2rem, 4vw, 3rem)",     weight: 600 }
      h2:      { size: "1.875rem",                   weight: 600 }
      h3:      { size: "1.5rem",                     weight: 600 }
      h4:      { size: "1.25rem",                    weight: 600 }
  body:
    family:  "Geist, ui-sans-serif, system-ui, sans-serif"
    weights: [400, 500]
    leading: "1.6"                 # relaxed
    max_measure: "65ch"            # max characters per line for readability
    scale:
      base:    { size: "1rem",   line_height: "1.6" }    # 16px
      sm:      { size: "0.875rem", line_height: "1.5" }  # 14px
      xs:      { size: "0.75rem",  line_height: "1.5" }  # 12px — metadata only
  mono:
    family:  "JetBrains Mono, ui-monospace, SFMono-Regular, monospace"
    weights: [400, 500]
    use_for:
      - "prices in tables (e.g., $129.00)"
      - "distances (e.g., 4.2 mi)"
      - "durations (e.g., 1h 24m)"
      - "tracking numbers"
      - "order numbers"

  banned:
    - "Inter (overused; ban for premium contexts)"
    - "Times New Roman, Georgia, Garamond, Palatino (generic serifs)"
    - "Any serif in admin/tech/driver portals — sans-serif only"

spacing:
  scale: [0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128]   # px, 4px base
  section_y: "clamp(3rem, 8vw, 6rem)"   # vertical gap between landing sections
  container_max: "1400px"
  gutter: "1.5rem"

radius:
  none: "0"
  sm:   "4px"
  md:   "8px"
  lg:   "12px"
  xl:   "16px"
  pill: "9999px"
  card: "16px"            # default card radius
  button: "9999px"        # pill-style CTAs (matches existing Hero)
  input: "8px"

shadow:
  # Tinted shadows — NOT pure black, NEVER neon
  none:    "none"
  xs:      "0 1px 2px 0 rgba(24, 24, 27, 0.05)"
  sm:      "0 1px 3px 0 rgba(24, 24, 27, 0.08), 0 1px 2px -1px rgba(24, 24, 27, 0.04)"
  md:      "0 4px 6px -1px rgba(24, 24, 27, 0.08), 0 2px 4px -2px rgba(24, 24, 27, 0.04)"
  lg:      "0 10px 15px -3px rgba(24, 24, 27, 0.08), 0 4px 6px -4px rgba(24, 24, 27, 0.04)"
  focus:   "0 0 0 3px rgba(15, 118, 110, 0.25)"

motion:
  spring:
    default:    { stiffness: 100, damping: 20 }     # premium, weighty
    snappy:     { stiffness: 240, damping: 24 }     # for menu open/close, toasts
    soft:       { stiffness:  80, damping: 22 }     # for large layout transitions
  duration:
    instant:    "100ms"
    fast:       "150ms"
    base:       "200ms"
    slow:       "320ms"
  easing:
    standard:   "cubic-bezier(0.2, 0.0, 0, 1)"      # default — never linear
    decel:      "cubic-bezier(0.0, 0.0, 0.2, 1)"
    accel:      "cubic-bezier(0.4, 0.0, 1.0, 1.0)"
  stagger_ms:   40                                  # list cascade delay
  perpetual:
    pulse:      "2s ease-in-out infinite"           # for "In Assembly" / "Out for Delivery" status
    shimmer:    "1.5s linear infinite"              # for skeletal loaders only
  banned:
    - "Linear easing on UI transitions"
    - "Animating top/left/width/height — use transform + opacity only"
    - "Bouncing chevron / scroll-arrow on hero"
    - "Decorative loops on idle/non-active states"

breakpoints:
  sm:  "640px"
  md:  "768px"
  lg:  "1024px"
  xl:  "1280px"
  "2xl": "1400px"

touch:
  min_target: "44px"          # all interactive elements

# ─── Component property bags ─────────────────────────────────────
components:
  button_primary:
    backgroundColor: accent
    textColor: "#FFFFFF"
    typography: { family: display, weight: 500, size: base }
    rounded: button
    paddingX: 24
    paddingY: 14
    height: 48
    shadow: sm
    hover: { backgroundColor: accent_hover, transform: "translateY(-1px)" }
    active: { transform: "translateY(0)", shadow: xs }
    focus: { shadow: focus }
    disabled: { backgroundColor: ink_disabled, cursor: "not-allowed" }
    banned: ["outer glow", "gradient fill", "letter-spacing > 0"]

  button_secondary:
    backgroundColor: surface
    textColor: ink_primary
    border: "1px solid border_strong"
    typography: { family: display, weight: 500, size: base }
    rounded: button
    paddingX: 24
    paddingY: 14
    height: 48
    hover: { backgroundColor: surface_subtle }
    focus: { shadow: focus }

  button_ghost:
    backgroundColor: "transparent"
    textColor: ink_primary
    typography: { family: display, weight: 500, size: base }
    rounded: button
    paddingX: 16
    paddingY: 10
    hover: { backgroundColor: surface_subtle }

  button_destructive:
    backgroundColor: alert
    textColor: "#FFFFFF"
    rounded: button
    paddingX: 24
    paddingY: 14
    hover: { backgroundColor: alert_ink }

  card:
    backgroundColor: surface
    border: "1px solid border_subtle"
    rounded: card
    padding: 24
    shadow: sm
    hover: { shadow: md }
    note: "Use ONLY when elevation communicates hierarchy. High-density admin tables: replace with border-top dividers."

  input:
    backgroundColor: surface
    border: "1px solid border_strong"
    textColor: ink_primary
    placeholderColor: ink_tertiary
    typography: { family: body, size: base }
    rounded: input
    paddingX: 16
    paddingY: 12
    height: 48
    focus: { borderColor: border_focus, shadow: focus }
    error: { borderColor: alert, shadow: "0 0 0 3px rgba(220, 38, 38, 0.15)" }
    label: { position: "above", typography: { weight: 500, size: sm } }
    helper: { position: "below", color: ink_tertiary, typography: { size: xs } }
    error_text: { position: "below", color: alert, typography: { size: xs } }
    banned: ["floating labels", "labels inside the field"]

  status_chip:
    typography: { family: body, weight: 500, size: xs }
    rounded: pill
    paddingX: 10
    paddingY: 4
    height: 24
    dot: { size: 6, marginRight: 6, rounded: pill }
    note: "Background, text, and dot colors come from colors.status_* tokens. Pulse animation only on in_assembly and out_for_delivery."

  photo_uploader:
    # Used in 6 surfaces: tech intake, tech final, damage report, refusal, return intake, POD
    layout: "drag-drop region + camera button on mobile"
    rounded: lg
    border: "2px dashed border_strong"
    backgroundColor: surface_subtle
    minHeight: 160
    thumbnail: { size: 96, rounded: md, gap: 8 }
    progressBar: { color: accent, height: 2 }
    error: { borderColor: alert }
    accept: "image/*"
    mobile_capture: "environment"   # rear camera by default
    states: [empty, uploading, uploaded, error, retry]

  signature_canvas:
    # Driver POD only
    rounded: md
    border: "1px solid border_strong"
    backgroundColor: surface
    strokeColor: ink_primary
    strokeWidth: 2.5
    height: 240
    affordances: ["Clear (ghost button)", "Done (primary button, disabled until any stroke)"]
    note: "Touch-first. No mouse cursor customization."

  kanban_card:
    # Admin Assembly Board only
    backgroundColor: surface
    border: "1px solid border_subtle"
    rounded: md
    padding: 12
    shadow: xs
    dragging: { shadow: lg, transform: "rotate(1deg)" }
    columns: [boxes_received, assigned, in_progress, completed_today]
    swim_lanes: "per-technician under Assigned column"

  map_pin:
    # /admin/schedule only
    hub: { color: ink_primary, icon: "hub", size: 32, shadow: md }
    stop: { color: "slot-colored", size: 24, shadow: sm }
    selected: { scale: 1.15, ring: "2px solid accent" }
    hover: { scale: 1.08 }

  table_row:
    height: 56
    border_bottom: "1px solid border_subtle"
    hover: { backgroundColor: surface_subtle }
    selected: { backgroundColor: accent_subtle }
    number_cells: { typography: { family: mono } }

  toast:
    rounded: lg
    paddingX: 16
    paddingY: 12
    shadow: lg
    backgroundColor: surface_inverse
    textColor: ink_on_dark
    variants: [info, success, warning, alert]
    duration: 5000

  modal:
    rounded: card
    backgroundColor: surface
    shadow: lg
    overlay: "rgba(24, 24, 27, 0.5)"
    maxWidth: 560
    paddingX: 32
    paddingY: 32

  loading_skeleton:
    backgroundColor: surface_subtle
    shimmer: "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)"
    animation: "shimmer 1.5s linear infinite"
    note: "Skeletal loaders matching exact layout dimensions. NEVER use circular spinners."

  email_chrome:
    # Plain-HTML-safe — works in Gmail / Outlook / Apple Mail
    body_backgroundColor: "#FAFAF9"
    container_backgroundColor: "#FFFFFF"
    container_maxWidth: 560
    container_padding: 32
    container_borderRadius: 0       # not all email clients render rounded corners
    header_logoHeight: 28
    cta_button:
      backgroundColor: accent
      textColor: "#FFFFFF"
      paddingX: 24
      paddingY: 14
      borderRadius: 999             # inline style; clients that ignore fall back to rectangle
    footer:
      color: ink_tertiary
      fontSize: 12
    banned: ["external CSS files", "background-image on body", "web fonts in emails"]

  deep_link_landing_chrome:
    # When a customer arrives from an email CTA (window picker, damage resolve, refusal resolve, quote approve)
    nav: "minimal — logo + sign-out only"
    container_padding: 32
    receipt_styling: true            # feels like a confirmation page, not a portal page
    return_to_portal_cta: "always visible at bottom"
---

# Screw It Pro — Visual Design System

## 1. Visual Theme & Atmosphere

Screw It Pro is a **white-glove operations platform** — a service customers pay for so they never have to assemble furniture again. The visual language must communicate three things at once: **calm trust** (your money and your stuff are safe), **operational competence** (we know where every box is, every minute), and **clinical warmth** (this is a service for people, not a warehouse robot).

Treat it as the design language of a quiet premium logistics service: think Apple Store back-of-house meets a high-end moving company's customer dashboard. **Not** a startup landing page; **not** a SaaS marketing site; **not** a playful consumer app.

- **Density: 5/10.** Balanced — admins live in dense tables, but customers want generous whitespace. Each surface tunes its own density inside the same token vocabulary.
- **Variance: 6/10.** Confident asymmetry on marketing surfaces (landing, pricing) — symmetric, predictable layouts inside operational portals where speed-of-comprehension wins.
- **Motion: 4/10.** Restrained. This is a tool people use 8 hours a day; motion supports state changes, never decorates idle screens. Only **active** states (a job currently in assembly, a delivery currently out) animate.

The brand mascot from the original proposal is irrelevant in MVP (the AI chatbot is out of scope per Decision #15 in the architecture brief). No mascot art, no playful illustration. Iconography is functional and minimal (Lucide or Phosphor at 1.5px stroke).

## 2. Color Palette & Roles

**Single neutral family: Zinc.** No drift between warm and cool gray; the whole product reads as one surface.

**Single accent: deep teal (#0F766E).** Saturation < 80%. The accent appears in CTAs, focus rings, selected states, the "In Assembly" / "Out for Delivery" status chips, and the map pin selected state. Nowhere else gets accent color — the rest of the product is neutral with **semantic** color used surgically.

Hard bans on the palette:
- **No pure black (`#000000`).** Use `ink_primary: #18181B` (Charcoal Ink, Zinc-950).
- **No purple / neon / outer-glow AI aesthetic.** This is a logistics product, not a Web3 dashboard.
- **No gradient backgrounds on dashboards.** Reserved for the marketing hero only, and even there subtle.
- **No oversaturated semantic colors.** Success/warning/alert are calibrated to the Zinc neutral family, not vibrant Bootstrap defaults.

The **order-status chip palette** (12 distinct states) is a first-class part of the system. Each chip is `{ bg: *_subtle, text: *_ink, dot: * }`. The two **active** states — `in_assembly` and `out_for_delivery` — get a perpetual 2s pulse on the dot, signaling live work to admins scanning the Today dashboard. Every other status is static. WCAG AA contrast verified on every chip.

Branding placeholder strategy: when real brand colors arrive, swap **only** `accent`, `accent_hover`, `accent_subtle`, `accent_ink`, and the focus ring. The neutral and semantic families stay regardless of brand.

## 3. Typography Rules

**Display + body: Geist** (or Outfit / Cabinet Grotesk / Satoshi as alternates). **Inter is banned** — overexposed, no unique character.
**Mono: JetBrains Mono.** Used for prices, distances, durations, tracking numbers, and order numbers. Anywhere a number is read across rows in a table.
**Serif: none.** No serifs anywhere in this product. Admin / tech / driver portals are strictly sans-serif. The landing page is sans-serif too — we are not an editorial brand.

Scale principles:
- Hierarchy comes from **weight + color**, not from massive size jumps.
- Body line-height is relaxed (1.6) and capped at 65ch per line for readability.
- Hero uses `clamp()` so it scales with viewport, never `font-size: 5rem` hardcoded.
- Numbers in tables (admin Orders Table, Assembly Board, Today dashboard queues) use Mono so columns align vertically — visual scanning gets free regularity.

Typographic anti-slop:
- No `LABEL // YEAR` formatting ("SYSTEM // 2026") — it's an AI tell, not real design.
- No letter-spacing on buttons (`tracking: 0.05em` on CTAs looks generic and ages badly).
- No all-caps eyebrow labels stacking on every section header.
- No `text-shadow` on display text.

## 4. Component Stylings

Every component is defined in the YAML `components:` block above. The body here is the **why**.

- **Buttons.** Primary is the pill-shape teal CTA already on the landing page (kept intentionally — `#0F766E` is the brand placeholder accent). Tactile `-1px translate` on active state for physical feedback. No outer glow, no gradient fill, no letter-spacing.
- **Cards.** Used only when **elevation communicates hierarchy**. High-density admin tables and the Orders Table use **border-top dividers** instead of card chrome — the card wrapper there would create noise without information. Same vocabulary, different application.
- **Inputs.** Label above, helper below. Error text below in alert color. No floating labels (an AI cliché). Focus ring uses the accent color so the eye lands on the active field.
- **Status chips.** The single most-reused component in the product. Every order list, every order detail, every email header has one. Two animated states (`in_assembly`, `out_for_delivery`) — the rest static. The dot is a small visual signature; it carries the color even when the text is truncated.
- **Photo uploader.** Reused in 6 surfaces — tech intake, tech final, damage report, refusal report, return intake, driver POD. **One component, one visual language.** Drag-drop on desktop, camera-launch on mobile. Multi-photo queue with retry-on-poor-signal state for tech/driver portals.
- **Signature canvas.** Driver POD only. Touch-first, 240px tall, "Clear" + "Done" affordances. Done is disabled until ≥1 stroke. No mouse-cursor customization.
- **Kanban card.** Admin Assembly Board only. Subtle shadow, rotation effect while dragging. Per-technician swim lanes inside the "Assigned" column.
- **Map pin.** `/admin/schedule` only. Hub pin is distinct (dark, taller, hub icon); stop pins inherit color from their assigned slot (Q11). Selected state pops with a 1.15× scale and accent-color ring.
- **Loading.** Skeletal loaders matching exact layout dimensions. **No circular spinners** — they're the universal AI tell. Skeletons feel intentional; spinners feel like something is broken.
- **Toasts + modals.** Inverse surface for toasts (dark background, light text) so they read as system notifications. Modals use accent focus ring; backdrop is `rgba(24, 24, 27, 0.5)` — Charcoal Ink at 50%, not pure black.
- **Email chrome.** Constrained to plain-HTML-safe rules. No web fonts (fall back to system stack), no external CSS, no background images. Container max-width 560 for outlook/gmail compatibility. CTA button uses inline `border-radius: 999px` and degrades gracefully.

## 5. Layout Principles

- **Max-width containment** at 1400px on marketing and admin surfaces. Customer order detail and tech/driver portals run narrower for readability.
- **CSS Grid first**, Flexbox second. No `calc()` percentage math.
- **No overlapping elements.** Every element gets a clean spatial zone. No absolute-positioned content stacking on top of inline content (a common AI generation tell).
- **Section spacing via `clamp()`.** `clamp(3rem, 8vw, 6rem)` so vertical rhythm scales with viewport without ratio breakage.
- **No 3-equal-cards feature row.** When showcasing three things (e.g., "How It Works" on the landing page), use 2-column zig-zag or asymmetric grid — the 3-card row is universally generic.
- **Centered hero allowed on the landing page** because the existing landing page already commits to it and it suits the brand voice. Internal portal screens never use centered hero — they're tools, not pitches.
- **`min-h-[100dvh]` over `h-screen`** — iOS Safari's address-bar jump on `h-screen` is catastrophic. `dvh` is non-negotiable.

## 6. Responsive Rules

Three breakpoints matter: **mobile (< 768px), tablet (768–1024px), desktop (> 1024px)**.

- **Mobile-first collapse below 768px is mandatory** for every multi-column layout. No exceptions. Tech and driver portals are mobile-first by default — they only run on phones in the field.
- **Admin is desktop-first**, but the Today dashboard collapses to accordion sections on mobile (admins do check on phones, especially for the "Pending Quote" and "On Hold" queues).
- **Touch targets ≥ 44px** everywhere. Driver POD signature, tech "Start Assembly" / "Complete Assembly" buttons, photo capture buttons — all sized for gloved hands.
- **No horizontal scroll on mobile.** Ever. Tables on the admin portal collapse to vertically-stacked rows on mobile, not horizontal scroll containers.
- **Headlines scale via `clamp()`.** Body text never goes below `1rem` (16px) — driver portal is read in moving vehicles, tech portal is read with grease on the screen.

## 7. Motion & Interaction

Spring physics by default — never linear easing. Three spring presets:
- **default** (stiffness 100, damping 20): the workhorse for hovers, toasts, modal opens.
- **snappy** (stiffness 240, damping 24): tight feedback for menu open/close, focus state shifts.
- **soft** (stiffness 80, damping 22): large layout transitions like sheet drawers.

**Staggered list reveals** with 40ms cascade — applied to the Today dashboard queues (each queue section reveals in order on first paint) and the Orders Table (rows cascade in on filter change). It signals "loading completed, here's your data" without using a spinner.

**Perpetual micro-interactions only on active states.** The "In Assembly" and "Out for Delivery" status chips pulse their dots at 2s ease-in-out infinite. Nothing else loops. Idle screens are still. Floating particle backgrounds, animated gradients, decorative hover effects on non-actionable elements are all banned — they're the AI marketing-site tell.

**Performance non-negotiables:**
- Animate `transform` and `opacity` only.
- Never animate `top`, `left`, `width`, `height`.
- Grain/noise textures (if any) live on fixed pseudo-elements, not animated layers.
- Heavy animations get isolated into Client Components so the rest of the tree stays static.

## 8. Anti-Patterns (Banned)

Encoded as explicit "NEVER" rules so any agent (Claude Code, Stitch, Cursor, Figma Make) generating UI for this project will refuse them:

- **No emojis in product UI.** Functional iconography only (Lucide / Phosphor at 1.5px stroke).
- **No Inter.** Use Geist or its alternates.
- **No generic serifs** (Times New Roman, Georgia, Garamond, Palatino). No serifs at all in this product.
- **No pure `#000000`.** Use Charcoal Ink (`#18181B`).
- **No neon / outer-glow shadows.** Tinted Zinc shadows only.
- **No oversaturated accent fills** (saturation < 80% always).
- **No gradient text on large headers.** It ages badly and screams AI-generated.
- **No custom mouse cursors.** System cursor on every surface.
- **No overlapping elements.** Clean spatial separation always.
- **No 3-equal-cards feature rows.**
- **No generic placeholder names.** No "John Doe," no "Acme Corp," no "Nexus Solutions." In wireframes, use real-sounding but obviously placeholder names (e.g., "Maya Tran — Order #1042") or `[customer name]` brackets.
- **No fabricated metrics.** "99.98% UPTIME," "124ms RESPONSE," "18.5k DEPLOY CYCLES" are invented AI filler. Use `[metric]` brackets in wireframes; populate with real numbers when they exist.
- **No fake "System / By the Numbers" stat cards** stuffed with invented data.
- **No `LABEL // YEAR` typography conventions.**
- **No AI copywriting clichés.** "Elevate," "Seamless," "Unleash," "Next-Gen," "Reimagine," "Transform" — all banned in any product copy.
- **No filler UI text.** "Scroll to explore," "Swipe down," bouncing chevrons, animated scroll arrows.
- **No broken Unsplash links** in wireframes. Use `picsum.photos`, SVG placeholders, or `[photo]` brackets.
- **No centered hero with scroll-arrow on internal portal screens.** Centered hero is only acceptable on the public landing.

**Domain-specific bans (Screw It Pro only):**

- **No "fun" treatment on damage or refusal flows.** These are emotionally loaded moments (Decision #13, #14). Restraint and clarity win — no playful illustration, no celebratory micro-copy, no exclamation marks. Customer needs information and clear choices, fast.
- **No surfacing dollar amounts as "starting at $X" with vague phrasing** on the landing page — the proposal explicitly bans vague pricing. Show real flat-rate-per-item-class numbers on `/pricing` or don't show numbers at all on the hero.
- **No fake assembly photos in marketing.** Until real hub photos exist, use neutral placeholder boxes or the SVG placeholder system.
- **No customer reviews on the landing page until real reviews exist.** Fabricated testimonials destroy trust the day a customer recognizes a name.

---

## Where This File Lives

- **Path:** `my-app/DESIGN.md` (repo root of the Next.js app).
- **Consumed by:** Claude Code / Cursor / Codex when generating UI from prompts; Stitch when generating screens; Figma Make when round-tripping; humans on every design review.
- **Updated when:** real brand assets arrive (swap the 6 accent tokens + logo), new component patterns surface during wireframing (per Step 11 in the architecture brief's Design Deliverable Sequencing), pilot feedback exposes accessibility or density gaps.
- **Companion document:** `/Users/sydneysanders/.claude/plans/examien-the-contetfiles-nad-valiant-hamming.md` — the architecture brief. This file handles the visual half; that file handles the behavioral half. Both are required to scope wireframes correctly.
