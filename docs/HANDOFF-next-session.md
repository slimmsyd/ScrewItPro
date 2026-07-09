# Handoff: ScrewIt Pros

**For:** New Grok session (context full in previous session)  
**Date:** 2026-07-09  
**Repo:** https://github.com/slimmsyd/ScrewItPro (`main`)  
**App root:** `my-app/`  
**Latest commit (at handoff):** `7347f5a` - Use ScrewIt Pros logo as Open Graph share image  
**Local dirty (do not lose):** `docs/TASKRABBIT_REVERSE_ENGINEERING.md` (uncommitted)

---

## What this project is

ScrewIt Pros marketing site + private-beta waitlist:

- Hub-based furniture assembly + white-glove delivery (Houston Metro first)
- Stack: Next.js **16.2.10**, React 19, Framer Motion, Tailwind 4
- Env-ready: Stripe, Supabase, Resend, DeepSeek, Google OAuth + Maps

Primary product mode: **waitlist** (CTAs → `/join`).

---

## Where things live

| Area | Path |
| --- | --- |
| App | `my-app/` |
| Homepage sections | `my-app/src/components/home/` |
| UI primitives | `my-app/src/components/ui/` |
| i18n EN/ES | `my-app/src/i18n/` + `LocaleProvider` |
| Auth (Google OAuth, no Supabase yet) | `my-app/src/app/auth/`, `src/lib/auth/` |
| Maps | `HoustonMap.tsx` + `src/lib/google.ts` |
| Env template | `my-app/.env.example` (secrets in `.env.local`, gitignored) |
| Design handoffs (desktop) | `~/Desktop/design_handoff_screwit_website`, `~/Desktop/launcher_handoff` |
| Project README | `README.md` + `my-app/README.md` |

---

## Already shipped (on `main`)

1. **Landing page** from design handoff (tokens, Miguer Sans, sections)
2. **Framer Motion** scroll reveals; audience marquee infinite (force `reducedMotion="never"`)
3. **EN/ES i18n** - nav/mobile language switcher, dictionaries `en.ts` / `es.ts`, localStorage
4. **Join page** - email + Continue with Google/Apple UI
5. **Google OAuth** (direct, not Supabase) - `/auth/google` → Google → `/auth/callback` → session cookie `sip_session`
6. **Chip support chat** - guided Q&A, thinking loader between steps
7. **Houston Google Map** - full-bleed Service Area, coverage circle
8. **OG/Twitter** share images = **logo** (not people photo) - `opengraph-image.tsx`
9. **Favicon / icons** - brand S, deep blue
10. **Next.js 16.2.10** security upgrade (Vercel had flagged 16.0.4)

---

## Env / integrations status

| Integration | Status |
| --- | --- |
| `GOOGLE_CLIENT_ID` / `SECRET` | Set locally; OAuth works when redirect = `http://localhost:3000/auth/callback` |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | May still be empty in some envs - map shows fallback if missing |
| Supabase | Clients exist; keys often empty; waitlist not persisted to DB yet |
| Stripe / Resend / DeepSeek | Wired in `src/lib/*`, not fully productized |

**Vercel:** Root Directory must be **`my-app`**. Set production `NEXT_PUBLIC_APP_URL`.

---

## Known quirks / fixes already applied

- Client cannot read non-`NEXT_PUBLIC_` env (OAuth check must be server-side only)
- Mid-page sections once stuck at opacity 0 via Reveal - fixed (no opacity hide)
- Search dropdown z-index over next section - hero z-index raised
- Marquee killed by CSS `prefers-reduced-motion` + parent transforms - now Framer + `MotionConfig reducedMotion="never"`
- Em dashes stripped from site UI copy

---

## Suggested next-session work (pick based on goal)

### Done this session (code on branch / ready to ship)
- **Supabase waitlist wiring** - `POST /api/waitlist`, OAuth callback upsert, real queue position UI
- Migration: `my-app/supabase/migrations/20260709120000_waitlist_entries.sql`
- **Still needs:** real Supabase project keys in `.env.local` + apply migration (keys were empty at handoff)

### High value product
1. **Activate Supabase** - create project, paste keys, run migration, smoke-test email + Google join
2. **Production env on Vercel** - all keys, Maps, OAuth redirect URIs for prod domain
3. **Apple Sign-In** - currently UI only
4. **Chip → real API** - replace thinking delay with pricing/quote fetch

### Polish
5. QA EN/ES gaps (any leftover hardcoded English)
6. Force-refresh OG caches after deploy (Facebook debugger etc.)
7. Commit or discard `docs/TASKRABBIT_REVERSE_ENGINEERING.md`

---

## Skills for the next session

| If the next session is… | Use skill |
| --- | --- |
| **Continuing product / features** | Read this handoff first; then `brainstorming` only if new product surface |
| **Deploy / Vercel / env** | No special skill; check `my-app/README.md` + Vercel root `my-app` |
| **UI polish / design QA** | `ui-ux-pro-max` or gstack `design-review` / `qa` |
| **Bug / broken flow** | Superpowers `systematic-debugging` or `diagnose` |
| **Ship PR / release** | gstack `ship` |
| **Auth/security review** | gstack `cso` |
| **Resume mid-milestone GSD** | `gsd-resume-work` (only if using GSD planning dirs) |
| **Save state again later** | This **`handoff`** skill, or gstack `context-save` |

**Primary skill for this handoff request:** `handoff` (`~/.agents/skills/handoff/SKILL.md`)  
**Related Superpowers entry:** `using-superpowers` (always check skills first)  
**Session checkpoint alternative:** gstack `context-save` / `context-restore`

---

## How to start the new Grok session

Paste something like:

```text
Continue ScrewIt Pros from handoff:
- Project handoff: docs/HANDOFF-next-session.md
- Also: (temp path if needed)
- Repo: github.com/slimmsyd/ScrewItPro main
- App: my-app/
- Goal: [what you want next, e.g. Supabase waitlist + Vercel prod env]
```

---

## Do not re-do

- Scaffolding Next app / re-porting full design handoff from scratch
- Re-implementing i18n plumbing or Google OAuth routes unless broken
- Replacing logo OG with people photo (user explicitly wanted logo)
