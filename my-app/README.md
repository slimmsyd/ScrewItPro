# ScrewIt Pros

Marketing site and private-beta waitlist for **ScrewIt Pros**: furniture pickup, workshop assembly, and white-glove delivery.

> If You Don't Want to Do It, ScrewIt!

**Live app path:** `my-app/`  
**Stack:** Next.js 16 (App Router), React 19, Tailwind 4, Framer Motion, Supabase-ready clients, Stripe-ready clients, Resend-ready clients, DeepSeek-ready clients, Google OAuth + Google Maps.

---

## Quick start

```bash
cd my-app
npm install
cp .env.example .env.local
# Fill keys in .env.local (see Environment below)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

| Command | Description |
| --- | --- |
| `npm run dev` | Local development |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |

---

## What's built

### Marketing homepage (`/`)
- Splash loader (spinning S mark)
- Announcement bar + scroll-aware nav (logo rotates with scroll)
- Hero with service search combobox
- How It Works, Services, Why Us
- **Who We Serve** infinite audience marquee
- Service Area with **live Houston Google Map** + coverage radius
- FAQ, credibility CTA, footer (white S mark)
- **Chip** support chat (guided quote flow + thinking loader)

### Waitlist (`/join`)
- Email join form
- **Continue with Google** (full OAuth code flow, no Supabase required)
- Continue with Apple (UI; Apple not connected yet)
- Success state with queue position

### Auth routes
| Route | Purpose |
| --- | --- |
| `GET /auth/google` | Start Google OAuth |
| `GET /auth/callback` | Exchange code, set session cookie |
| `GET /api/auth/session` | Read lightweight session for join UI |
| `GET /api/health` | Integration status (no secrets) |

---

## Project layout

```
my-app/
├── public/assets/          # Logos, mascot, crew photo, Miguer Sans
├── src/app/
│   ├── page.tsx            # Homepage
│   ├── join/               # Waitlist
│   ├── auth/               # Google OAuth start + callback
│   ├── api/health          # Env status
│   └── globals.css         # Design tokens
├── src/components/home/    # Landing sections + SupportChat + HoustonMap
├── src/components/ui/      # Button, Badge, Reveal, ThinkingLoader, …
├── src/lib/                # env, stripe, supabase, google, auth, motion
├── .env.example            # All keys (copy to .env.local)
├── DESIGN.md / SITEMAP.md / USER-FLOWS.md / wireframes/
└── Project.md              # Original proposal
```

---

## Environment

Copy `.env.example` to `.env.local` and fill values. **Never commit `.env.local`.**

### Required for Google sign-in
```bash
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Google Cloud OAuth **Web client** must allow:

**JavaScript origins**
```
http://localhost:3000
http://127.0.0.1:3000
```

**Redirect URIs**
```
http://localhost:3000/auth/callback
http://127.0.0.1:3000/auth/callback
```

### Required for Houston map
```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
```
Enable **Maps JavaScript API**. Restrict key by HTTP referrer (`http://localhost:3000/*`).

### Optional (wired, not fully productized yet)
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Resend
RESEND_API_KEY=
RESEND_FROM_EMAIL=

# DeepSeek (AI)
DEEPSEEK_API_KEY=
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat

# Analytics
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=
GOOGLE_MAPS_SERVER_KEY=
```

Check wiring (no secrets returned):

```bash
curl http://localhost:3000/api/health
```

---

## Design source

Hand-off packages used for pixel reference:

- `~/Desktop/design_handoff_screwit_website` (tokens, sections, assets)
- `~/Desktop/launcher_handoff` (screw-in chat launcher)

Brand: deep blue `#04209B`, electric blue `#1D6EFE`, Miguer Sans (display) + Instrument Sans (body).

---

## Internationalization (EN / ES)

- Nav **English / Español** switcher and mobile language buttons flip the whole UI.
- Dictionaries: `src/i18n/dictionaries/en.ts` + `es.ts`
- Provider: `src/components/providers/LocaleProvider.tsx` (`useLocale()` / `t("section.key")`)
- Preference stored in `localStorage` (`screwitpro_locale`) and sets `html lang`.

To add a string: put the key in **both** dictionaries, then call `t("section.key")` in the component.

## Notes

- Site mode is **waitlist** (primary CTAs say Join Now and go to `/join`).
- Google OAuth uses a lightweight `sip_session` cookie until Supabase is connected.
- Chip chat uses a thinking loader between steps (API-ready pattern).
- Audience marquee uses Framer Motion with `reducedMotion="never"` so it always scrolls.

---

## License

Private. ScrewIt Pros LLC. All rights reserved.
