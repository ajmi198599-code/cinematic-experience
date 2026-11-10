# BEYOND REALITY · Technology Showroom

A walkable concourse and connected technology shop. The showroom keeps Phase A’s bilingual three-product catalogue and gives each concept object a physical display. The experience runs entirely in the browser.

## Run

Use Node 20.19+ or 22.12+ from this directory. Keep the sibling Phase A catalogue in the checkout.

```sh
npm ci
npm run dev
npm test
npm run build
npm run preview
```

Select the doorway or **Enter showroom**. In the view, drag to look and use the four directional buttons, arrows or WASD to walk. The product index also takes visitors directly to any display through the open doorway. Use **Controls** to reduce camera motion. To browse the catalogue without loading the 3D engine, open the site with `?view=catalogue`.

## Source map

| File | Role |
| --- | --- |
| `src/world.js` | Scene scale, fixture positions, camera stops, collision shapes and route planning |
| `src/building.js` and `src/materials.js` | Storefront, room, furniture, material textures and baked surface lighting |
| `src/products.js` | Three original concept meshes and display mounts |
| `src/scene.js` | WebGL renderer, picking, camera motion and render scheduling |
| `src/app.js`, `src/catalog.js`, `src/copy.js` | Accessible interface, language, floor plan and shared Phase A catalogue |
| `tests/navigation.test.js` | Doorway, obstacle and route coverage |
| [Specification](docs/SPECIFICATION.md) | Architecture, design direction and acceptance criteria |

## Deploy

Serve the generated `dist/` directory as a static site. The showroom has its own Vercel project. A preview can be deployed from the built files without linking the repository root or copying historical prototypes.

The three objects and their descriptions are demonstration content. The project has no commerce integrations.
