# BEYOND REALITY · Technology Showroom

A walkable concourse and connected technology shop. The showroom keeps Phase A’s bilingual three-product catalogue and gives each concept object a physical display. The experience and demo basket run entirely in the browser.

## Run

Use Node 20.19+ or 22.12+ from this directory. Keep the sibling Phase A catalogue in the checkout.

```sh
npm ci --include=dev
npm run dev
npm test
npm run build
npm run preview
```

Select the doorway or **Enter showroom**. In the view, drag to look and use the four directional buttons, arrows or WASD to walk. The product index also takes visitors directly to any display through the open doorway. Use **Controls** to reduce camera motion, or use **Skip motion** for the current trip. Add an inspected concept object to the demo basket, adjust quantities and return to the same scene. To browse the catalogue without loading the 3D engine, open the site with `?view=catalogue`.

## Source map

| File | Role |
| --- | --- |
| `src/world.js` | Scene scale, fixture positions, camera stops, collision shapes and route planning |
| `src/building.js` and `src/materials.js` | Storefront, room, furniture, material textures and baked surface lighting |
| `src/products.js` | Three original concept meshes and display mounts |
| `src/scene.js` and `src/motion.js` | WebGL renderer, picking, bounded camera steps and frame measurements |
| `src/basket.js` | Quantity validation and browser-local persistence |
| `src/app.js`, `src/catalog.js`, `src/copy.js` | Accessible interface, language, floor plan and shared Phase A catalogue |
| `tests/` | Doorway clearance, camera timing and basket persistence |
| [Specification](docs/SPECIFICATION.md) | Architecture, design direction and acceptance criteria |
| [Sprint 01 verification](docs/VERIFICATION.md) | Baseline browser and performance evidence |
| [Sprint 02 review](docs/SPRINT_02.md) | Build repair, responsive checks and before-and-after evidence |
| [Sprint 03 review](docs/SPRINT_03.md) | Phoenix visual refinements, frame-delivery diagnosis and release verification |

## Deploy

Use the dedicated Vercel project `beyond-reality-technology-showroom`. Set **Root Directory** to `experiences/beyond-reality-technology-showroom` and enable **Include source files outside the Root Directory** for the shared Phase A catalogue. The showroom's [Vercel configuration](vercel.json) sets Vite, `npm ci --include=dev`, `npm run build` and `dist`. The dedicated project uses Node 24.

For a source upload, keep the showroom files at their repository paths and include `experiences/beyond-reality-phase-a/data.json`. The deployment builds its own dependencies from the showroom lockfile. The generated `dist/` can also be served locally with `npm run preview`.

The three objects and their descriptions are demonstration content. The basket stores quantities per browser origin. Checkout is disabled.
