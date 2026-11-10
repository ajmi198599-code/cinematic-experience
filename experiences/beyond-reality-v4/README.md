# BEYOND REALITY V4 — Walk In. Discover.

A simpler, customer-first virtual shopping gallery demonstration.

## One-tap customer journey
- Visitors land inside the gallery immediately, with three obvious shops.
- Click/tap a shop to see the featured product large and directly in front of them.
- Browse using product thumbnails, arrows, or mobile swiping.
- Switch shops in place, search all products, and use a demo basket with quantities and subtotal.
- Arabic RTL and English LTR supported; reduced-motion preferences respected.

## Data and editing
`catalogue.json` is the editable demonstration catalogue. `catalogue-studio.html` is a local-only editor allowing additions, edits and export; changes require GitHub upload and redeployment to go live. Nine embedded example items act as an offline fallback.

## Product and legal limits
No real items, no verified supplier photographs, no inventory, no orders, no checkout or payment. All prices are illustrative. The representative photos are external Unsplash images and may fail without network access. Never present these as official supplier media. Actual sale requires authorised merchant assets, genuine stock and prices, payment, compliance and fulfilment services.

## Tests
Automated Chromium checks at 360, 390, 430, 768 and 1440 pixels: shop entry, product switching, cart quantities, language, store switching, search, return and no horizontal overflow or uncaught JavaScript errors. The browser test environment cannot load external images, and real-device visual quality/Web Vitals remain unverified.

## Deploy
Static site; Vercel Framework Preset Other; Root Directory `experiences/beyond-reality-v4`. Preserve previous demos.
