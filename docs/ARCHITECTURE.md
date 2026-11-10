# Architecture

How Physualizer is put together. Written to be read top to bottom by someone in a first CS course. Updated at the end of every milestone. Current as of **M0 (scaffold)**.

## The big idea

Everything is built around one JSON document called a **scene**. A scene lists the frames, events, worldlines, signals, rods and annotations in a problem, plus how the diagram is being viewed (which frame, how zoomed in, which overlays are on).

Templates are scenes saved as files. A share link is a scene squeezed into the URL. An exported file is a scene. The editor (from M4) changes a scene. Because every feature speaks the same format, a feature never needs to know about another feature, only about scenes.

Data flows one way:

```text
scene JSON  ──►  src/physics/ transforms it into the viewing frame  ──►  src/render/ draws it
```

The drawing code never changes the scene, and it never does physics itself. If it needs a number (a Lorentz factor, a boosted coordinate), it asks `src/physics/`.

## Directories

| Folder | What lives there | Status |
| --- | --- | --- |
| `src/app/` | The pages of the site. In Next.js, each folder here is a URL: `src/app/about/page.tsx` is `/about`. | M0: all four routes exist as placeholders |
| `src/physics/` | Pure math: functions that take numbers and return numbers. No React, no browser. | M0: signatures and tests. **Henry writes the bodies in M1.** |
| `src/scene/` | The scene format: its schema (what a valid scene looks like), migrations (upgrading old scenes), share-link encoding, and the template files. | M0: done |
| `src/render/` | SVG components that draw the diagram and the space animation. | Arrives in M2 |
| `src/state/` | The store that holds the current scene, plus undo and redo. | Arrives in M3–M4 |
| `src/ui/` | Panels, the inspector, the top bar. | Arrives in M2–M4 |
| `docs/` | This file, and `PHYSICS.md` (Henry's derivations). | |

### The routes

| URL | File | What it shows |
| --- | --- | --- |
| `/` | `src/app/page.tsx` | The template gallery: a plain list of templates. |
| `/t/<slug>` | `src/app/t/[slug]/page.tsx` | One page per template, e.g. `/t/twin-paradox`. Built ahead of time (at deploy) so search engines can find each one. `[slug]` in the folder name means "this part of the URL is a variable". |
| `/d#<scene>` | `src/app/d/page.tsx` | A custom scene read from a share link. |
| `/about` | `src/app/about/page.tsx` | What the tool is. Placeholder until M7. |

`src/app/layout.tsx` wraps every page: it holds the top bar and loads the styles.

### `src/physics/`

| File | Who writes it | What it is |
| --- | --- | --- |
| `lorentz.ts` | **Henry** | The Lorentz transformation and everything built on it: `gamma`, `boost`, `properTime`, and so on. Each function has a comment saying exactly what it must return. |
| `lorentz.test.ts` | Claude Code | The checks from the PRD's Correctness section. They fail until `lorentz.ts` is written. |
| `units.ts` | Claude Code | Unit presets (ns and ft, years and light-years, ...). Bookkeeping, not physics. |
| `units.test.ts` | Claude Code | Checks the muon numbers convert to SI correctly. |
| `index.ts` | Claude Code | The only way in. Other folders import from `@/physics`, never from a file inside it. |

### `src/scene/`

| File | What it does |
| --- | --- |
| `schema.ts` | Describes a valid scene using [Zod](https://zod.dev), a library that checks data at runtime. Also exports `parseScene`, which takes untrusted data and returns either `{ ok: true, scene }` or `{ ok: false, error }`. It never throws, so a caller can't forget to handle a bad scene. |
| `migrate.ts` | Upgrades scenes saved by older versions of the site, so old share links keep working. Only version 1 exists today. |
| `url.ts` | `sceneToHash` and `sceneFromHash`: turns a scene into the text after `#` in a link and back. |
| `templates/` | One JSON file per template, plus `index.ts`, the list the gallery reads. Templates are validated when the site builds, so a typo in one breaks the build instead of reaching a student. |
| `scene.test.ts` | Share links round-trip exactly; bad scenes are rejected. |

## How a share link works

1. `sceneToHash` turns the scene into a JSON string, then compresses it with [lz-string](https://github.com/pieroxy/lz-string) into URL-safe characters.
2. That text goes after `#` in `/d#...`. Browsers never send the part after `#` to a server, so the scene stays between the people who have the link, and the site needs no database.
3. When someone opens the link, `src/app/d/page.tsx` (running in their browser) reads the fragment and calls `sceneFromHash`, which decompresses it, parses the JSON, migrates it to the current version, and validates it with the schema.
4. If anything fails, the page shows a readable error. It never draws a scene that failed validation, because a wrong diagram teaches wrong physics.

## Rules the code follows

- **No physics outside `src/physics/`.** A component that needs a Lorentz factor calls `gamma` from `@/physics`.
- **`src/physics/` is pure.** No React, Next.js or browser code. A lint rule in `eslint.config.mjs` enforces this and fails if someone imports React there.
- **Physics is reached only through `src/physics/index.ts`.** Also enforced by a lint rule.
- **Every scene is validated on load.** Templates, links and imported files all go through `parseScene`.
- **Design rules are tokens.** `src/app/globals.css` defines the only colours, fonts and layout sizes that exist. It deletes Tailwind's default palette, rounded corners and shadows, so `bg-blue-500` or `rounded-lg` do nothing.

## Running it

```bash
npm install      # once, to download the libraries
npm run dev      # the site at http://localhost:3000, reloads as you edit
npm test         # the unit tests, re-running as you edit
npm run lint     # style and architecture rules
npm run build    # what Vercel runs; fails on type errors
```

GitHub Actions (`.github/workflows/ci.yml`) runs lint, build and tests on every push and pull request. Until M1 is done the physics tests fail, so CI is red on purpose.

## Libraries

| Library | Why |
| --- | --- |
| Next.js, React | The site framework. |
| Tailwind CSS | Styling with utility classes, limited to the design tokens. |
| TypeScript | Types catch mistakes before the code runs. Strict mode is on. |
| Zod | Checks that a scene is valid at runtime, and gives TypeScript the matching type. |
| lz-string | Compresses scenes so share links stay short. |
| Vitest | Runs the unit tests. |
| ESLint | Enforces code style and the architecture rules above. |

Not installed yet, added in the milestone that first uses them: Zustand (store, M3–M4), KaTeX (equations, M4), Playwright (end-to-end tests, M7), Vercel Web Analytics (M7).

## Decisions

Places where the PRD left a choice open, and what was picked. Each took the simpler option.

1. **What the SI preset stores.** A scene with SI units stores seconds and light-seconds (so c = 1 still holds) and shows lengths in metres. Switching presets rescales the stored numbers with `convertBetweenPresets`, so the physics never changes. The muon's 10,834.3 ft becomes 3,248.0 m, matching the PRD.
2. **ns and ft.** c is exactly 1 ft/ns (the open question's default). The "ft" is really a light-nanosecond. The units menu will say so in one line.
3. **Years.** One year is a Julian year, 365.25 days, the one used to define the light-year.
4. **Interval sign.** Timelike is positive: (Δt)² − (Δx)² (the open question's default).
5. **Rod format.** A rod is `{ id, label, event, beta, restLength }`. Its rear (left) end passes through `event` at velocity `beta`; the front end is `restLength` ahead in the rod's own rest frame. The PRD didn't give a format.
6. **Signal format.** A signal is `{ id, label, event, direction }` with direction `"left"` or `"right"`.
7. **Annotation format.** An annotation is `{ id, text, t, x }`. Inline LaTeX goes between `$` signs.
8. **Overlay names.** `lightCones`, `secondFrame`, `simultaneity`, `properTimeTicks`, `hyperbola`.
9. **Ids are unique across the whole scene,** not just within one list, so "the selected object" is never ambiguous.
10. **Every scene needs a frame with beta 0,** because that is the base frame all coordinates are stored in.
11. **Unknown keys are errors.** A misspelled key (`"restlenght"`) fails validation instead of being silently dropped.
12. **Faster-than-light segments are not checked by the schema yet.** That check is physics (`classify`), and `classify` is written in M1. M2 adds it, through `@/physics`.
13. **Impossible inputs throw `RangeError`.** The tests check for `RangeError` specifically, so the M0 stubs (which throw a plain `Error`) can't pass a guard test by accident.
14. **`classify` tolerance** is an absolute 1e-9 by default. **`properTime`** of fewer than two events is 0.
15. **The share fragment is the compressed scene directly** (`/d#N4Ig...`), with no `scene=` prefix.
16. **M0 ships two templates,** the twin paradox (the PRD's example, which M2 renders) and the blank diagram. The other six arrive in M6.
17. **The top bar links to About,** which the PRD doesn't place. Share and Export join the top bar in M6, when they work.
