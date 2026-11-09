# BEYOND REALITY — UX Release v2

A fully public, mobile-first **cinematic showcase prototype**, incorporating a lightweight three-door **2.5D mall corridor** and a more usable catalogue. **Not a real ecommerce shop.**

## What's here

- `index.html` — complete five-chapter journey, interactive corridor, accessible demo catalogue, fuzzy search, product detail, cart, Arabic/English
- `catalogue.json` — static demo product records, canonical when served over HTTP(S); embedded fallback keeps the site working offline
- `catalogue-studio.html` — client-side form for adding, editing, removing, importing, exporting demo records; changes remain local until uploaded to GitHub
- `catalogue.schema.json` — schema for ID/SKU, bilingual descriptions, image and price fields

## Deploy

Vercel framework **Other**, root directory `experiences/beyond-reality-v2`. Preserve previous production projects. Direct shopping entry: `/#mall`; click **Walk the Mall** to access the three doorways, then choose Tech & Design, Ritual & Home or Style & Motion.

## Replace/add a product

1. Open `/catalogue-studio.html` on the hosted site.
2. Edit an existing record or use **Add new product**. Fill in English/Arabic, a unique ID, a unique SKU, one shop, representative image ID and demo price.
3. **Save product locally** and **Export catalogue.json**.
4. Upload the resulting file as `experiences/beyond-reality-v2/catalogue.json` in GitHub, and deploy again.
5. Test the storefront, product details, search, cart and Arabic. The editor cannot change the live site by itself; no authentication, publishing API or order processing is included.

## Product and legal disclaimer

All photographs are *representative lifestyle photos*, not supplier-verified images; all items and prices are fictional/illustrative. No real products, stock, purchase flow, taxes, delivery or payments. Before commercial launch, obtain genuine product image rights, verified brand/SKU, availability, returns/tax/shipping information, an authenticated admin system, and a secure order and payment backend.

## Testing

Browser simulation on 360 / 390 / 430 / 768 / 1440 px: corridor and shop doors, search (English typo `cofee`, Arabic `شاى`), reset, 9 catalogue records, session basket and focus recovery, languages, no horizontal overflow, core cinematic route and no uncaught JavaScript errors. Catalogue JSON hydration was separately tested by a mocked valid response introducing a tenth product, and the editor was tested for adding and exporting a tenth demo product. Real iOS/Android hardware and Web Vitals still need manual tests.

© 2026 Beyond Reality — demonstration.
