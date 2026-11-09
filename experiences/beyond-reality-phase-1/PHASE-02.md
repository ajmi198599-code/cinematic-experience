# Phase 02 — The Deep Blue

This branch adds a playable second chapter to **BEYOND REALITY**, building directly on the cinematic arrival from Phase 01.

### Explore it
1. Start at the original glowing portal and select **STEP INSIDE**.
2. The portal expands into a brief dimensional tunnel before the ocean is revealed.
3. In the underwater scene, watch the original animated whale drift across the environment.
4. Touch or click the water to generate expanding ripples.
5. Use the language control for English / العربية, the optional sound control, or **RETURN TO ARRIVAL**.

### Engineering
- A single standalone **HTML/CSS/JavaScript** file.
- Original SVG whale illustration and procedural canvas particles.
- CSS lighting, caustic reflections and distant seabed silhouettes.
- Mobile-first, works with pointer and touch, no external network assets.
- Supports `prefers-reduced-motion`: simplified transitions, no continuous animation or touch effects.
- Audio only when the visitor explicitly opts in; visibility changes pause canvases.
- No analytics, payment, products, tracking or personal data capture.

### QA performed
Browser automation at 360 × 640, 390 × 844, 430 × 932 and 1440 × 900; checked mobile layout, portal entry, interactive ripples, Arabic text, return navigation, and reduced-motion preference. No JavaScript page errors observed in the completed local runs. The destination is a standalone preview of Phase 02, **not** the existing public Phase 01 site.

### Deploy
Vercel project root directory: `experiences/beyond-reality-phase-1`. Static HTML only; no build dependencies. Phase 02 should be deployed as a **preview** of branch `feature/beyond-reality-phase-2-deep-blue`, with Phase 01 production kept unchanged.
