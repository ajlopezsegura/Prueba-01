# CLAUDE.md — Project Context for AI Sessions

## Project Overview

Luxury real estate web app for **Las Conchas** — a 24-unit beachfront residential development in Marbella, Spain. Built for **The Visuals Boutique Studio** as a presentation/sales tool.

**Stack:** React 18 + Vite + Tailwind CSS + Framer Motion + Supabase (PostgreSQL, JSONB)
**Routing:** HashRouter (deployed to GitHub Pages)
**Deploy:** GitHub Actions from branch `claude/check-progress-VPlBw`

---

## Key Architecture

- **Inline styles + Tailwind hybrid** — most components use inline styles for fine-grained control, Tailwind for layout utilities
- **CSS custom properties:** `--color-bg`, `--color-text`, `--color-accent` (#B89848 gold), `--color-text-muted`
- **`label-luxury` class:** `font-weight: 400`, `font-size: 0.75rem` mobile / `0.72rem` desktop, `letter-spacing: 0.16-0.18em`
- **`display-heading` class:** Montserrat uppercase tracking
- **`AnimatePresence mode="sync"`** in App.jsx — do NOT change to "wait", causes blank page bug on route transitions
- **FilterControls in AvailabilityPage** called as `{FilterControls({})}` not `<FilterControls />` — prevents unmount/remount that causes input focus loss
- **Code splitting** — all page components use `React.lazy()` + `Suspense` in App.jsx. Never revert to static imports.
- **`useIsMobile(bp=640)` hook** — JS-based responsive logic required because inline styles don't respond to CSS media queries. Pattern: `const mob = useIsMobile()` then `mob ? mobileStyle : desktopStyle`. Defined locally in each file that needs it (AppFooter, AdminPage, etc.)

---

## Routing Structure

```
/                        → CoverPage
/proyecto                → ContextPage (project info, amenities, construction)
/availability            → AvailabilityPage (unit listing + filters)
/availability/:slug      → UnitDetailPage
/inmersion/:unitId       → ImmersionPage (3D configurator)
/decision                → DecisionPage
/compare                 → ComparePage
/contact                 → ContactPage (lead form)
/summary/:slug           → SummaryPage (PDF dossier)
/map                     → MapPage
/privacy                 → PrivacyPage
/admin                   → AdminPage (password-protected management panel)
```

---

## Key Files

| File | Purpose |
|------|---------|
| `src/App.jsx` | Root router, lazy-loads all pages, renders LuxuryCursor + AppFooter + Suspense wrapper |
| `src/context/ProjectContext.jsx` | Supabase data fetch, provides project/units/amenities |
| `src/context/SessionContext.jsx` | Anonymous session tracking (page views, events → Supabase) |
| `src/context/CompareContext.jsx` | Compare bar state (selected unit IDs) |
| `src/context/LangContext.jsx` | ES/EN language toggle |
| `src/components/layout/AppFooter.jsx` | Fixed 52px footer: CONTACTAR centered + journey progress left |
| `src/components/cursor/LuxuryCursor.jsx` | Custom gold dot+ring cursor (hidden on touch) |
| `src/data/project.json` | Local fallback data (Supabase is primary) |
| `src/styles/index.css` | CSS variables, custom classes, global styles |
| `supabase/schema.sql` | Full DB schema + seed data |
| `supabase/migrations/001_add_visitor_tracking.sql` | Adds visitor_id, visit_number, referrer, user_lang, screen_size columns |

---

## Design System

- **Background:** Dark navy (`--color-bg`)
- **Text:** Off-white `rgba(244,241,234,x)` at various opacities (0.78-0.85 for body, 0.65 for secondary)
- **Accent:** Gold `#B89848` / `rgba(184,152,72,x)`
- **Borders:** Gold at low opacity `rgba(184,152,72,0.08-0.25)`
- **Font sizes:** Deliberately small for luxury feel — body `0.6-0.72rem`, labels `0.55-0.65rem`
- **Letter spacing:** Wide tracking on labels `0.1-0.2em`
- **Hover patterns:** Inline `onMouseEnter`/`onMouseLeave` changing style properties directly

---

## AppFooter

- Fixed bottom, **52px height**, `backgroundColor: var(--color-bg)`
- **Journey progress** — absolute left, 4 steps with dots + connecting lines + labels (desktop only)
- **CONTACTAR button** — absolute center via `left: 50%, transform: translate(-50%, -50%)`
- Hidden on: `/`, `/contact`, `/admin`, `/privacy`, `/summary/*`, `/inmersion/*`
- Compare bar hides footer only on exact `/availability` path (not on `/availability/:slug`)
- All scrollable pages need `pb-14` to prevent content overlap

### Journey steps (`getStepIndex` in AppFooter.jsx):
```
/proyecto, /map          → step 0 (PROYECTO)
/availability, /compare  → step 1 (DISPONIB.)
/availability/:slug      → step 2 (VIVIENDA)
/decision                → step 3 (DECISIÓN)
```

---

## Session Tracking (SessionContext)

### What's tracked:
- `device_info` — device type, screen size, browser language, referrer source
- `page_view` — page path + time spent (duration_ms stamped on navigation away)
- `section_view` — obra, entorno, amenities sections in ContextPage
- `amenity_open` — which amenity card was opened
- `nearby_view` — which entorno item was viewed
- `compare_add` — which unit was added to compare

### Persistence:
- `tvbs_sid` in `sessionStorage` — session ID (resets on tab close)
- `tvbs_vid` in `localStorage` — visitor ID (persists across sessions)
- `tvbs_visits_[vid]` in `localStorage` — visit counter per visitor

### Referrer detection (`getReferrerSource`):
Detects: google, instagram, facebook, linkedin, twitter, whatsapp, tiktok, or raw hostname. Falls back to 'directo'.

### Supabase `page_sessions` columns:
`session_id, visitor_id, visit_number, referrer, user_lang, screen_size, project_slug, trail (JSONB), pages_count, converted, started_at, updated_at`

### On contact form submit:
Trail is copied to `leads.session_trail` and session marked `converted: true`.

---

## Admin Panel (`/admin`)

- Password-protected via `VITE_ADMIN_PASSWORD` env var
- Auth state stored in `localStorage` as `tvbs_admin`
- **Three tabs:**
  - **DISPONIBILIDAD** — unit status management (available/reserved/sold) with StatusSelect dropdown
  - **LEADS** — contact form submissions with temperature (hot/cold), expandable trail
  - **ACTIVIDAD** — anonymous sessions with badges for returning visitors, referrer source, journey depth
- **Activity stats:** VISITAS | HOY | ÚNICOS | RECURRENTES
- **Activity card badges:** `Nª VISITA` (orange, returning), source (blue), journey actions (gold)
- **Expanded detail:** ORIGEN, IDIOMA, PANTALLA, VISITA metadata + full page trail

---

## Mobile Responsive Status

All 15 pages audited and fixed (640px breakpoint):

| Page | Status | Notes |
|------|--------|-------|
| AdminPage | ✅ | `useIsMobile`, card layouts, 2x2 stats grid |
| ImmersionPage | ✅ | Room nav → horizontal bar at bottom, time controls → icon-only row |
| ComparePage | ✅ | Narrower label col `max(140px, 12vw)` desktop, compact mobile |
| UnitDetailPage | ✅ | Hero stacks vertically, CTAs stack, compare buttons stack |
| AvailabilityPage | ✅ | Compare hint bar, pb-14, compact compare button |
| ContextPage | ✅ | object-contain for vertical images |
| SummaryPage | ✅ | Specs grid 2-col mobile, pb-14 |
| ContactPage | ✅ | max-w-xl, px-6, responsive grid |
| DecisionPage | ✅ | max-w-2xl, flex-wrap, clamp() sizes |
| CoverPage | ✅ | clamp(), centered flex |
| MapPage | ✅ | object-contain, responsive padding |
| PrivacyPage | ✅ | — |
| SummaryPage | ✅ | — |
| SplashPage | ✅ | clamp(), centered layout |
| LandingPage | ✅ | clamp(), responsive padding |

---

## Open Graph / SEO

`index.html` has full OG + Twitter Card meta tags:
- Image: `/assets/images/las-conchas-aerea.jpg`
- URL: `https://ajlopezsegura.github.io/prueba-01/`
- Note: HashRouter limits SEO (JS-rendered). OG tags work for social sharing previews.

---

## Known Issues / Pending Work

1. **Supabase columns** — `tagline`/`tagline_en` don't exist in projects table yet (hardcoded fallback works)
2. **Real images** — Some amenity/entorno items use Unsplash placeholders
3. **AppShell component** — orphaned, not used in App.jsx
4. **ContactCTA component** — orphaned, replaced by AppFooter
5. **Compare state persistence** — Compare selection lost on page reload (could use localStorage)

---

## Commit Convention

Commits end with the Claude session URL. Messages describe the "why" not the "what".

## Commands

```bash
npm run dev          # Dev server (Vite)
npx vite build       # Production build
git push -u origin claude/check-progress-VPlBw  # Deploy branch
```

---

## Reusing This as a Template

This codebase is designed to be duplicated for other high-consideration product verticals (wardrobes, carpentry, urban development, etc.). The generic core is:

**Keep as-is:**
- `src/context/SessionContext.jsx` — analytics engine, works for any product
- `src/context/CompareContext.jsx` — compare logic
- `src/context/LangContext.jsx` — ES/EN toggle
- `src/components/layout/AppFooter.jsx` — update STEPS array and getStepIndex() for new journey
- `src/components/cursor/LuxuryCursor.jsx` — luxury cursor
- `src/pages/AdminPage.jsx` — update column labels for new data model
- `src/pages/ContactPage.jsx` — update fields as needed
- `src/pages/ComparePage.jsx` — update compared attributes
- `src/styles/index.css` — retheme `--color-accent` and `--color-bg`
- `supabase/schema.sql` — adapt units table columns for new product type

**Replace content:**
- `src/data/project.json` — new product data
- `public/assets/images/` — new imagery
- All page copy (ContextPage, CoverPage, DecisionPage)
- `index.html` OG tags

**Adapt per vertical:**
- Journey steps in AppFooter (4 steps, name them for the new flow)
- Unit/product data model in Supabase
- ImmersionPage configurator (3D rooms → product configurator)
- AvailabilityPage filters (bedrooms/surface → relevant product attributes)
