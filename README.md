# Dishrated — Website

An art-directed editorial landing experience for **Dishrated**, a personal food
journal. *Good food deserves to be remembered.*

Built as a real frontend: **Vite + React 18 + Framer Motion**.

## Run it

```bash
npm install        # already done
npm run dev        # dev server → http://localhost:5173
npm run build      # production build → /dist
npm run preview    # preview the production build
```

## Creative direction

Editorial gastronomy meets a quiet, tactile archive. Warm ivory ground,
espresso ink, a tomato-red accent and muted olive. Type pairs **Instrument
Serif** (expressive display) with **DM Sans** (interface) and **Space Mono**
(ratings & metadata); handwritten notes use **Caveat**.

## Sections

| # | Section | Highlight |
|---|---------|-----------|
| 01 | Hero | Layered, parallaxing food "prints" + a live score instrument |
| 02 | The problem | Headline that illuminates word-by-word on scroll |
| 03 | The meal journal | Asymmetric editorial archive of scored dishes |
| 04 | The taste score | Interactive 0–100 dial + slider (demo, nothing saved) |
| 05 | The details | Pinned, handwritten tasting notes |
| 06 | How it works | Four-step editorial sequence |
| 07 | The app | Honest, art-directed representation of the journal UI in a 3D browser frame |
| 08 | Final CTA | Cinematic closing → the live app |
| 09 | Footer | Brand, navigation, the idea |

## Notes

- **Imagery** is referenced by Unsplash photo id in `src/data/content.js` and is
  trivially swappable for the brand's own photography. `SmartImage` degrades to a
  tinted plate if any source fails — no broken images.
- **Motion** respects `prefers-reduced-motion` globally (`MotionConfig reducedMotion="user"`).
- **Theme**: light by default, with a dark "late-night cellar" variant via the
  nav toggle / OS preference.
- The product showcase is a faithful *representation* of the real feature set
  (taste 0–100, health, cost, notes, order-again) — not a fabricated screenshot.
  Every CTA points to the live app at `dishrated.xyz`.

## Structure

```
src/
  main.jsx              # entry + MotionConfig
  App.jsx               # section composition
  index.css             # design tokens + globals
  data/content.js       # all copy, meals, steps, image ids
  components/           # SmartImage, Reveal, ScrollProgress, shared.css
  sections/             # one folder-free pair (.jsx + .css) per section
```
