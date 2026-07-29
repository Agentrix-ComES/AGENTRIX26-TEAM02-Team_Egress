# client-v2

React + Vite build of the **CeylonTrips** landing experience — the AI-powered
Sri Lanka travel OTA. Ported from the Figma prototype in
`frontend-design/Surf camp landing page with AI search/Travel OTA v4.dc.html`.

Everything on the page is interactive against mock data: AI search, the
day-by-day planner, the cart, the trial paywall, the live companion feed and
the voice guide.

## Quick start

```bash
cd client-v2
npm install
npm run dev      # http://localhost:5174
```

| Script              | What it does                          |
| ------------------- | ------------------------------------- |
| `npm run dev`       | Dev server with HMR on port 5174      |
| `npm run build`     | Typecheck, then production build       |
| `npm run preview`   | Serve the production build            |
| `npm run typecheck` | `tsc --noEmit` only                    |

> **WSL note.** The repo lives on a Windows drive, where inotify never fires —
> HMR would silently serve stale modules. `vite.config.ts` enables
> `server.watch.usePolling` to work around it. If saves still don't reload,
> restart the dev server.

## Why it's built this way

Deliberately minimal — React, ReactDOM and Vite, nothing else (23 packages,
~83 kB gzipped). No UI kit, no CSS framework, no icon package, no router. The
page is one route, and the design is a pixel-specific Figma export, so a
component library would have been something to fight rather than use.

Layout is written as **inline style objects** because that is the form the
export came in; keeping it means the JSX can be diffed against the original
HTML line by line. Design tokens live in CSS and are mirrored in TS.

## Structure

```
src/
  main.tsx              entry
  App.tsx               section order + overlays
  components/
    Header · Hero · SearchPanel · Planner · Companion
    Stays · Activities · Packages · Plans · Faq · Footer
    CartDrawer · PaywallModal · VoiceGuide          (overlays)
    ui/  Section · Icon · ImageSlot · PlanCard      (shared)
  state/store.tsx       all app state, one provider
  data/                 mock catalogue + editorial copy
  lib/                  theme · types · money · search · config
  styles/               tokens.css · global.css
public/fonts/           Poppins (brand typeface)
```

One file per section, matching the page top to bottom — pick a section, own
that file. The shared pieces in `ui/` are the only places two people are
likely to collide.

## Conventions

**Colours** — import `c` from `@/lib/theme`, never paste hex values.
`src/styles/tokens.css` is the source of truth; `theme.ts` mirrors it for the
inline styles. Change both together.

**Hover states** — React has no inline `:hover`, so buttons declare a variant
and `global.css` supplies the rule:

```tsx
<button data-hover="primary">   // primary · ink · outline · text · light · yellow
```

**Responsive** — the mock is a 1240px desktop canvas. Two mechanisms cover
smaller screens:

- Type scales with `clamp()` inline (`fontSize: 'clamp(30px, 5vw, 62px)'`).
- Grids declare `data-grid="two-up" | "three-up" | "four-up" | "split" |
  "search-form" | "footer"` and collapse at 1080px / 720px via `global.css`.

Also available: `data-hide-sm` (hidden ≤720px) and `data-hide-xs` (≤480px).
Add new breakpoint behaviour to `global.css` rather than inline.

**State** — one `AppProvider` in `src/state/store.tsx`; read it with
`useApp()`. Search feeds the planner, the planner feeds the cart, and any AI
action can trip the paywall, so a single store is easier to follow than
several. Split by feature if it outgrows a couple of screens.

## Swapping in the real backend

Two seams, both isolated:

- **`src/data/catalogue.ts`** — stays, activities, packages, inventory and the
  base itinerary. Replace these constants with gateway calls; no component
  changes needed.
- **`src/lib/search.ts`** — `parseQuery` is a regex pass standing in for the
  Planner Agent, and `runSearch` scores the local inventory. Swap the body for
  an API call that returns `{ results, criteria, answer }`.

`src/lib/config.ts` holds the demo knobs — result count, fake thinking delay,
free-trial allowance, currency, fee rates.

## Images

Every photo is an `<ImageSlot id="..." placeholder="..." />` rendering a tinted
placeholder. To use real photos, drop files in `public/images/` and register
them in the `IMAGES` map at the top of `src/components/ui/ImageSlot.tsx`:

```ts
const IMAGES: Record<string, string> = {
  'v4-hero': '/images/hero-coastline.jpg',
  'v4-stay1': '/images/cape-weligama.jpg',
}
```

Slot ids are on each record in `src/data/catalogue.ts`.

## Icons

`src/components/ui/Icon.tsx` inlines the six glyphs the design uses (24×24
Material Symbols paths). Add to the `PATHS` map rather than pulling in an icon
package.
