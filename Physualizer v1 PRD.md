# Physualizer v1 PRD

Nov 10, 2026 · @Henry Apollo

## Summary

Physualizer (physualizer.com) is a free, no-login web tool where physics students build, animate and share visualizations of the problem they are working on. Version 1 covers special relativity only: an interactive spacetime diagram workspace with a linked animation of the same scene in space.

This document is the build brief for Claude Code. Henry is the product owner and writes the physics module himself.

| Decision | v1 choice |
| --- | --- |
| Physics scope | Special relativity in one space dimension plus time |
| How a problem gets in | Pick a template, then edit it directly |
| Accounts, payments, ads | None |
| Devices | Laptop-first; pointer events so touch is not broken |
| Stack | Next.js, TypeScript, Tailwind, Vercel; no database |
| Units | c = 1 by default (ns and ft, matching Henry's course), with a units toggle |
| Physics code | Written by Henry, not by Claude Code |
| Look | Black and white, Times New Roman chrome; colour only inside the visuals |

## Goals and non-goals

v1 succeeds when a student can open a template, change the numbers to match their own problem, and see a correct diagram in under 60 seconds without signing in.

**Goals**

- Frame switching is the centrepiece: a boost slider transforms the whole diagram continuously.
- A linked animation shows the same scene playing out in space, with clocks. This is what a graphing calculator cannot do.
- Every scene is a shareable link, with no account.
- Diagrams export as SVG and PNG, clean enough to paste into a problem set.
- Every number on screen matches the analytic answer (see Correctness).
- Henry can explain every physics function in an interview.

**Not in v1**

- Mechanics, E&M, thermodynamics, free body diagrams.
- Accounts, payments, ads, school-email verification.
- AI that reads a pasted problem.
- Two or three space dimensions, accelerating worldlines (beyond straight segments joined at events), general relativity.
- Four-momentum and collision problems.
- A phone layout, dark mode, real-time collaboration, any backend.

## Users and use cases

The first user is a student in a calculus-based intro course doing a special relativity problem set, starting with Henry's own class at UChicago. Instructors and TAs are the second user: they make figures and share links with a whole section.

1. **Check my setup.** Enter the events from a problem and see where they land in another frame.
2. **Understand a paradox.** Open the twin paradox, drag the boost slider, watch simultaneity shift.
3. **Make a figure.** Export the diagram for a problem set or lab report.
4. **Share it.** Paste a link in a study group chat; it opens exactly as the sender saw it.

## v1 features

The workspace is one screen: a spacetime diagram in the centre, objects on the left, measurements and equations on the right, and a space animation strip along the bottom.

**F1. Diagram canvas.** x horizontal, t vertical. Drag to pan, scroll to zoom. Grid, axes, and light cones at 45 degrees.

**F2. Objects.**

- Events: a labelled point with coordinates.
- Worldlines: either a straight line through an event at a given velocity, or straight segments joining an ordered list of events. Every segment must be slower than light; reject anything else with an inline message.
- Light signals: a 45 degree line from an event, left or right.
- Rods: two parallel worldlines marking the ends of an extended object, with the strip between them shaded.
- Frames: a named inertial frame with a velocity relative to the base frame.
- Annotations: text labels that accept inline LaTeX.

**F3. Frame switching.** A "View from" selector lists the scene's frames, and a slider sets any velocity from -0.999 to 0.999. The diagram redraws in the viewing frame. Switching animates over about 400 ms, interpolating linearly in rapidity.

**F4. Overlays, each a toggle.**

- Light cone at the selected event.
- A second frame's tilted axes and grid drawn over the current view.
- Lines of simultaneity for any frame.
- Proper-time tick marks along worldlines.
- The invariant hyperbola through a selected event.

**F5. Measurements.**

- Two events selected: the time and space separation in the viewing frame, the interval, whether it is timelike, spacelike or lightlike, and the proper time or proper length.
- A worldline selected: its velocity and Lorentz factor in the viewing frame.
- A rod selected: its rest length and contracted length.

**F6. Space animation.** A strip showing the x axis at one instant of the viewing frame's time. Objects are dots, each with a clock reading its proper time. Rods are drawn at contracted length. Light signals are moving pulses. Play, pause, scrub and speed controls. A horizontal "now" line sweeps up the diagram in sync.

**F7. Editing.** Click to add, drag to move, and a numeric inspector for exact values. Coordinates can be typed in any frame the scene defines. Undo and redo, delete, rename, keyboard shortcuts.

**F8. Equations panel.** Read-only in v1. Shows the Lorentz transformation and derived quantities with the scene's current numbers substituted, rendered with KaTeX.

**F9. Units toggle.** Each scene picks a preset. The first three keep c = 1; SI converts for display only.

| Preset | Time | Length | Typical use |
| --- | --- | --- | --- |
| ns and ft (default) | ns | ft, treating c as 1 ft/ns | Particle problems, Henry's course |
| s and light-seconds | s | light-s | General |
| yr and ly | yr | ly | Twin paradox, space travel |
| SI | s | m | Courses that keep c explicit |

**F10. Share and export.** The whole scene, including the current view, is compressed into the URL fragment. "Copy link" button. Export SVG, PNG at 2x, and scene JSON; import scene JSON.

**F11. Template gallery.** See Launch templates.

**F12. Local autosave.** The last scene is kept in localStorage, wrapped in try/catch. Nothing is sent to a server.

## Launch templates

v1 ships seven templates plus a blank diagram. Each is a scene JSON file, has its own indexable page, and doubles as an acceptance test. Velocities are fractions of c.

| Template | Default inputs | Expected result |
| --- | --- | --- |
| Time dilation: muon decay | Proper lifetime 2,200 ns, velocity 0.98 | Lab lifetime 11,055.4 ns; distance 10,834.3 ft with c = 1 ft/ns (3,248.0 m in SI) |
| Relativity of simultaneity: train and platform | Two strikes at t = 0, x = -5 and x = +5; train velocity 0.6 | In the train frame: t' = +3.75 and -3.75, x' = -6.25 and +6.25 |
| Length contraction | Rod of rest length 10, velocity 0.8 | Length 6 in the viewing frame |
| Twin paradox | Destination 4 ly away, velocity 0.8 out and back | Home twin ages 10 yr, traveller ages 6 yr |
| Pole in the barn | Pole rest length 10, barn rest length 8, velocity 0.6 | Pole is 8 in the barn frame; barn is 6.4 in the pole frame |
| Velocity addition | Frame at 0.6, object at 0.6 within that frame | 0.882353 in the base frame (15/17) |
| Doppler shift | Source receding at 0.6, one signal per unit of its proper time | Signals arrive 2 units apart |

The defaults are textbook-standard scenarios. Do not copy assigned problems from any specific course.

## Scene model

A scene is one JSON document, and every feature reads and writes it: templates, the editor, share links, export, and later an AI that turns a pasted problem into a scene.

```json
{
  "version": 1,
  "kind": "sr-1d",
  "title": "Twin paradox",
  "units": "yr-ly",
  "frames": [
    { "id": "earth", "label": "Earth", "beta": 0 },
    { "id": "outbound", "label": "Outbound ship", "beta": 0.8 }
  ],
  "events": [
    { "id": "depart", "label": "Departure", "t": 0, "x": 0 },
    { "id": "turn", "label": "Turnaround", "t": 5, "x": 4 },
    { "id": "reunion", "label": "Reunion", "t": 10, "x": 0 }
  ],
  "worldlines": [
    { "id": "home", "label": "Home twin", "through": ["depart", "reunion"] },
    { "id": "ship", "label": "Travelling twin", "through": ["depart", "turn", "reunion"] }
  ],
  "signals": [],
  "rods": [],
  "annotations": [],
  "view": {
    "frame": "earth",
    "beta": 0,
    "center": { "t": 5, "x": 2 },
    "zoom": 1,
    "overlays": ["lightCones", "properTimeTicks"]
  }
}
```

Rules:

- All coordinates are stored in the base frame (the frame with beta 0) in the scene's c = 1 unit pair. The SI preset converts at display time only.
- A frame is defined by its velocity relative to the base frame.
- A worldline is either `through` (ordered event ids) or an `event` plus a `beta` for an infinite straight line.
- The view is part of the scene, so a shared link opens exactly as the sender saw it.
- Validate every scene with Zod on load. An invalid scene shows a readable error; it never renders wrong physics.
- `version` and a migration function exist from day one, so old links keep working.
- `kind` leaves room for later scene types such as `mechanics-2d`.

## Physics core

All physics lives in `src/physics/` as pure TypeScript functions with no React or DOM imports, and Henry writes the function bodies.

Claude Code creates the files with typed signatures, a doc comment saying what each function must return, and failing unit tests. Then it stops. Henry implements until the tests pass. Claude Code may explain a failing test or review his code, but does not write the bodies unless Henry asks for that in the session.

All functions work in c = 1 units. `beta` is velocity as a fraction of c.

| Function | Returns |
| --- | --- |
| `gamma(beta)` | The Lorentz factor, 1 / sqrt(1 - beta^2). Throws if the magnitude of beta is 1 or more. |
| `rapidity(beta)` and `betaFromRapidity(phi)` | atanh(beta) and tanh(phi) |
| `boost(event, beta)` | The event's coordinates in a frame moving at beta: t' = gamma (t - beta x), x' = gamma (x - beta t) |
| `inverseBoost(event, beta)` | The reverse transformation |
| `addVelocities(u, v)` | (u + v) / (1 + u v) |
| `relativeBeta(betaA, betaB)` | The velocity of B as seen from A, both given in the base frame |
| `interval2(a, b)` | Time separation squared minus space separation squared. Positive means timelike. |
| `classify(a, b)` | "timelike", "spacelike" or "lightlike", with a tolerance |
| `properTime(events)` | Total proper time along straight segments joining the events. Throws if any segment is not timelike. |
| `contractedLength(restLength, beta)` | restLength / gamma |
| `dopplerFactor(beta)` | sqrt((1 + beta) / (1 - beta)); positive beta means receding |

Notes for the implementation:

- Compose and interpolate boosts in rapidity, which adds linearly and stays accurate near the speed of light.
- Unit conversion lives in `src/physics/units.ts`. It is bookkeeping, so Claude Code writes it.
- Henry writes `docs/PHYSICS.md`: a short derivation of each function in his own words.

## Visual design and UX

The chrome looks like a typeset physics paper, and colour appears only inside the visuals.

**Chrome**

- Black (#000) on white (#fff). No greys except disabled text.
- Times New Roman everywhere, including buttons and inputs: `"Times New Roman", Times, serif`.
- 1px black rules. No rounded corners, shadows, gradients or icons where a word works.
- Buttons are words in a 1px border. Links are underlined.
- Generous whitespace. The wordmark is the word "Physualizer" in the same font.

**Visuals**

- White canvas, black axes, light grey grid (#ddd).
- Objects take colours from the Okabe-Ito colourblind-safe palette: #0072B2, #D55E00, #009E73, #CC79A7, #56B4E9.
- Light signals and light cones are always #E69F00, dashed.
- Worldlines 2px, grid 0.5px. Every line carries a text label, so colour is never the only identifier.
- Math labels and the equations panel use KaTeX.

**Layout at 1024px and wider**

- Top bar: wordmark on the left; Templates, Share and Export on the right.
- Left panel, 280px: object list and inspector.
- Centre: the diagram.
- Right panel, 300px: measurements and equations.
- Bottom strip, 120px: space animation and transport controls.
- Side panels collapse.

**Behaviour**

- The home page is the template gallery: a plain list, each entry a small live thumbnail and one sentence. One click lands the student in a working diagram.
- Dragging the boost slider holds 60 fps with 50 objects on screen.
- Honour `prefers-reduced-motion`: frame switches cut instead of animating.
- Everything is keyboard operable and every control has a label.
- Use pointer events throughout so touch input works, even though the layout targets laptops.

## Tech stack and architecture

v1 is a fully client-side Next.js app on Vercel with no database, no auth and no API routes.

| Concern | Choice |
| --- | --- |
| Framework | Next.js (App Router), TypeScript in strict mode |
| Styling | Tailwind, with the design rules above as tokens |
| Diagram rendering | SVG through React components: crisp export, simple hit-testing |
| State | Zustand store holding the scene and undo history |
| Validation | Zod |
| Math typesetting | KaTeX |
| Share links | lz-string compression into the URL fragment |
| Tests | Vitest for units, Playwright for a small end-to-end set |
| Hosting | Vercel, domain physualizer.com |
| Analytics | Vercel Web Analytics, page views only, no cookies |

Use the current stable release of each at build time and pin versions in `package.json`.

**Routes**

- `/` is the template gallery.
- `/t/[slug]` is one statically generated page per template, with its own title and description for search.
- `/d` is the workspace for a custom scene read from the URL fragment.
- `/about` says what the tool is and who made it.

**Directory layout**

```text
src/
  app/        routes
  physics/    pure functions, no UI imports (Henry writes lorentz.ts)
    index.ts
    lorentz.ts
    lorentz.test.ts
    units.ts
  scene/      Zod schema, migrations, URL encode and decode, templates/
  render/     SVG diagram components, space animation strip
  state/      store, undo and redo
  ui/         panels, inspector, top bar
docs/
  ARCHITECTURE.md
  PHYSICS.md
```

**Rules**

- `render/` and `ui/` reach physics only through `src/physics/index.ts`. No component computes a Lorentz factor inline.
- A lint rule blocks React and DOM imports inside `src/physics/`.
- Data flows one way: scene JSON, then physics transforms it into the viewing frame, then `render/` draws it.

## Correctness

Nothing deploys until every check below passes in CI, because a diagram that is subtly wrong teaches wrong physics.

**Unit tests on the physics module**

| Check | Expected |
| --- | --- |
| `gamma` at 0.6, 0.8, 0.98 | 1.25, 1.666667, 5.025189 |
| `boost` then `inverseBoost` | Returns the original event to within 1e-12 |
| Interval invariance | `interval2` unchanged under any boost, to 1e-9 relative, over 1,000 random cases |
| Boost composition | Boosting by a then b equals one boost by `addVelocities(a, b)` |
| `addVelocities(0.6, 0.6)` | 0.882353 |
| `properTime` on the twin paradox path | 6 for the traveller, 10 for the home twin |
| `contractedLength(10, 0.8)` | 6 |
| `dopplerFactor(0.6)` | 2 |
| Guards | A beta of magnitude 1 or more throws; a spacelike worldline segment is rejected |

**Template tests**

- Each template has an end-to-end test that opens it and asserts the measurements panel shows the expected result from Launch templates.
- Each template has an SVG snapshot test in its default view and in one boosted view.

**Scene tests**

- Encoding a scene to a URL and decoding it returns an identical scene.
- A malformed or out-of-range scene produces the error state, never a drawing.

## Milestones

Eight milestones: seven Claude Code sessions and one that is Henry's own, with Henry reviewing between them. Target: live on physualizer.com by Nov 30, 2026, then paused until finals end. Henry's time is capped at about 3 hours a week until Thanksgiving break.

1. **M0, scaffold (Claude Code, week of Nov 10).** Repo, design tokens, routes, scene schema with validation and URL encoding, physics signatures with failing tests, docs skeleton. Stop and hand off.
2. **M1, physics (Henry, by Nov 20).** Implement `lorentz.ts` until every unit test passes. Write `docs/PHYSICS.md`.
3. **M2, static diagram (Claude Code).** Axes, grid, events, worldlines, light cones, pan and zoom. The twin paradox renders from its JSON.
4. **M3, frames (Claude Code, before break).** View-from selector, boost slider, animated transitions, second-frame axes, simultaneity lines, proper-time ticks.
5. **M4, editing (Thanksgiving break).** Add, drag, inspector, undo and redo, measurements panel, equations panel.
6. **M5, animation (Thanksgiving break).** Space strip with clocks, linked "now" line, transport controls.
7. **M6, content and sharing (Thanksgiving break).** All seven templates and their pages, share links, SVG and PNG export, units toggle.
8. **M7, ship (by Nov 30).** Accessibility pass, end-to-end tests, about page, deploy to physualizer.com.

After finals: five classmates or Society of Physics Students members each try one problem while Henry watches. Fix the top three problems they hit before telling anyone else about the site.

A milestone is done when its tests pass, a Vercel preview is up, `docs/ARCHITECTURE.md` is current, and Henry has reviewed it.

## Working agreement for Claude Code

Build this so its owner, who is in his first quarter of learning to code, can explain all of it.

- **Do not write the bodies in `src/physics/lorentz.ts`.** Write signatures, doc comments and tests. Explain and review when asked.
- **One milestone per session.** At the end, stop and summarise in plain language what changed and which files were touched.
- **Keep `docs/ARCHITECTURE.md` current.** It explains what each directory does and how data flows, written for someone in a first CS course.
- **End each milestone with three questions** Henry should be able to answer about the code just written.
- **Prefer readable over clever.** Small files, descriptive names, comments that say why.
- **No physics in UI code.** If a component needs a number, it calls `src/physics/`.
- **Name every new dependency** and why it is needed in the session summary.
- **Ask before** adding a backend, accounts, analytics beyond page views, a breaking schema change, or anything outside this PRD.
- **When the PRD is ambiguous,** take the simpler option and record it under "Decisions" in `docs/ARCHITECTURE.md`.
- **No secrets.** v1 needs no API keys.

## Roadmap after v1

None of this is built in v1; it is here so v1's structure leaves room for it.

1. **More relativity.** Four-momentum and collision diagrams (invariant mass, centre-of-mass energy), constant proper acceleration, a second space dimension.
2. **Mechanics.** Kinematics, a free body diagram builder, user-set coordinate systems and origins, inclines and pulleys, as a new `mechanics-2d` scene kind.
3. **Paste a problem.** An AI model reads a pasted problem and emits scene JSON, which is validated against the schema before anything renders. Each request costs money, so this is the paid feature: a small free allowance, then a subscription. Accounts and payments arrive with it, not before.
4. **User-written equations** that drive objects in the scene.
5. **E&M and thermodynamics.**
6. **Embeds for instructors** and a proper iPad layout.

## Open questions

Each has a default that Claude Code should use unless Henry says otherwise.

- [ ] **ft and ns preset:** treat c as exactly 1 ft/ns, as Henry's course does, or use 0.9836 ft/ns? Default: exactly 1, with a one-line note in the units menu.
- [ ] **Interval sign:** timelike positive (time squared minus space squared). Does that match the course's convention? Default: yes.
- [ ] **Vertical axis label:** t in c = 1 presets, ct in SI. Default: yes.
- [ ] **Repository:** public on GitHub under the MIT licence, or private? Default: public, since a readable repo is part of the point.
- [ ] **Domain:** Henry connects physualizer.com to the Vercel project before M7.
