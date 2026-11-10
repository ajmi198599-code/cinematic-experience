# BEYOND REALITY — Signature Showroom / Phase A

A freshly designed, bilingual, mobile-first **Technology Atelier** concept.

**Phase A deliverables:** visual art direction, coherent entrance, three-object curated showroom, animated in-place product reveal, product inspection, direct collection browse/search, functional demonstration bag, Arabic RTL / English LTR and mobile responsiveness. This prototype intentionally contains no checkout and no claimed real stock.

## Files
- `index.html` — semantic entrypoint and page layout
- `src/styles.css` — responsive design system and motion
- `src/app.js` — accessible interactions, search, UI state and demonstration bag
- `src/products.js` — static fallback catalogue
- `data.json` — editable canonical illustrative product catalogue
- `docs/ART_DIRECTION.md` — creative specification and commercial constraints
- `tests/verify.py` — browser regression checks

## Local run
Run `python -m http.server 8080` inside this folder and open `http://127.0.0.1:8080/`. The website is dependency-free: no build, API key or payment account required. Vercel Framework Preset is **Other**, root directory `experiences/beyond-reality-phase-a`.

## Behaviour
Click **Enter the showroom** to scroll to the presentation; choose another object in the thumbnail selector, click **Next object**, or use any card in the catalogue to reveal that product. Search accepts Arabic and English product text. Use the language toggle for RTL/LTR. Demo basket quantities persist for the browser session only. The enlarged photo and basket are keyboard-accessible dialogs with Escape support.

## Asset status
The single shared architectural photo and representative product photos are loaded on the visitor's device from `images.unsplash.com`; locally rendered browsers with no external network will display styled fallbacks. Unsplash's image copyright licence generally allows use in websites, but **privacy, property, brands and other rights still need individual review**. The photographs are not authentic merchant listings. We cannot certify their visual appearance or image network performance from offline tests; test the preview on a connected phone before presenting it to clients.

## Testing
Local simulated Chromium tests at 360, 390, 430, 768 and 1440 px checked navigation, featured product selection, Arabic search, shopping-bag quantities, dialogs, language switching, reduced motion, no horizontal overflow and uncaught JS errors. Passed in the tested configurations. No external photography was loaded in these isolated tests. A formal assistive-technology and Core Web Vitals audit remains outstanding.

## Next milestone
**Phase B:** Approve a consistent real showroom media pack, test on iPhone/Android hardware, improve first-load performance, and migrate this approved interaction pattern to a modular Next.js/TypeScript project. Real ecommerce integration follows supplier verification.