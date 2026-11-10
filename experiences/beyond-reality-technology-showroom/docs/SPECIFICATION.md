# BEYOND REALITY · Technology Showroom

## Baseline

The Phase A live site is a bilingual editorial gallery. Entering scrolls to a product feature and selecting a product changes its representative photo. The live route has no 3D canvas or continuous spatial navigation. The Phase A branch provides a canonical three-product catalogue, bilingual copy, a restrained visual system, 44 px touch targets and reduced-motion conventions. Those are the inputs for this milestone.

The repository root is a separate React and Three.js perfume experience. Its model presentation confirms the stack is familiar to the project. V4 supplies direct shop and catalogue selection, but its display and photo logic are bound to its document. The technology showroom is a sibling experience, based on Phase A. The root and other experiments are outside its runtime.

## Experience

1. Arrive at eye height in a short mall concourse with a visible storefront. Select the shop from its doorway, the shop card or the floor plan.
2. Follow the camera through the open central threshold, with the storefront and room visible throughout the move.
3. Walk with keyboard or touch buttons and drag to look. Select a numbered marker, display or catalogue entry. A direct catalogue selection from the concourse follows the same connected route.
4. Approach each fixture from its open aisle. Inspect the object in place from front and side viewpoints, read the concept details, and return to the central aisle or the concourse.
5. Use the same product index and room plan in catalogue mode when 3D is unavailable. Arabic mirrors the interface while the physical coordinate system stays consistent.

## Art direction

| Element | Specification |
| --- | --- |
| Building | 12 × 11.4 m store with a 4.3 m ceiling, connected to a 24 m wide concourse section |
| Composition | Recognizable shopfront, open doorway, side glazing, overhead signage, three retail islands with an uninterrupted central aisle |
| Materials | Pale limestone, honed terrazzo, walnut, blackened metal, warm ivory and pine green from Phase A |
| Lighting | Skylight geometry, baked diffuse shading and floor shadows, and reflected studio lighting on the concept models |
| Products | Original concept models based on the catalogue identities. Headphones on a stand, watch on a display cradle, camera on a low mount |
| Interface | Paper and pine-green shell, concise directions, floor plan, and an index accessible outside the 3D canvas |

## Technical contract

- Vite builds a static client. Three.js renders the scene on demand. The renderer batches opaque meshes, bakes static shading at startup and lowers the pixel budget during travel on software graphics. The release has no CDN, font, model, inventory or payment requests.
- `world.js` owns the floor bounds, fixture positions, camera poses and routing. The renderer and SVG floor plan consume those definitions. Routes are built across visible segments around padded collision shapes. Rounded corners are accepted only when the new segments are clear.
- `scene.js` owns the renderer and camera, with building and product geometry separated into modules. The accessible DOM owns shop selection, product copy, focus, language and instructions. Three.js loads separately so the catalogue survives renderer failure.
- Guided travel remains interruptible by selecting another destination. The planner starts from the camera's current position. Direct movement respects the same clearance as guided travel.
- Respect the system's reduced-motion preference and expose a motion control. Stop drawing when the camera is idle. Preserve product access on WebGL startup failure or context loss.
- Ship only the reviewed build to an isolated Vercel project as a Preview. Product entries are clearly identified as concepts.

## Acceptance criteria

- Complete concourse → storefront → showroom → each of three products → showroom → concourse in a real browser. Verify that intermediate camera positions pass through the doorway and remain outside display furniture.
- Verify drag, desktop movement keys, phone-width controls, product angles, interruption, right-to-left layout and reduced motion. Check that fallback users can reach all product details.
- Inspect the scene at eye level on desktop and phone-width viewports. Look for clipping, unreadable landmarks, floating products, controls that obscure the model, and content overflow.
- Target under 350 KiB gzip for the initial build assets and one stationary frame after the camera settles. Record transfer and frame evidence, the browser and viewport, and any device or graphics limitations.
