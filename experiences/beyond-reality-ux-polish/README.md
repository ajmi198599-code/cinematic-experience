# BEYOND REALITY — UX polished preview and audit

This is a **separate, non-destructive feature branch** based on the photographic gallery prototype. Previous Vercel projects are untouched.

## Links
- UX-improved showcase: https://beyond-reality-ux-preview.vercel.app
- Direct showroom: https://beyond-reality-ux-preview.vercel.app/#mall
- Interactive UX report: https://beyond-reality-ux-report.vercel.app
- Original live gallery: https://beyond-reality-gallery.vercel.app

## Implemented in the UX preview
- Clear **Skip to Showroom** navigation at the opening scene
- Larger mobile touch targets
- Arabic letter variant and tokenised product search, plus keyword synonyms
- Search clear/reset, result status and empty-results recovery
- Basket feedback toast and session-scoped demo persistence
- Focus management, underlying-page inert state and keyboard trap within modal dialogs
- Better external-image fallback art
- More readable catalogue details and control labels

## Where replacement content goes
- `docs/CATALOGUE_REPLACEMENT_TEMPLATE.csv` is a **planning worksheet only**, **not an automatically imported data feed**.
- The demonstration catalogue currently lives in the `inventory` array inside `experiences/beyond-reality-ux-polish/index.html`.
- Editing the GitHub files alone does **not** automatically redeploy this Vercel preview; it was explicitly deployed from a file snapshot.
- Before selling real goods: connect a verified catalogue/inventory source, checkout, fulfilment, policies and merchant-rights records. Do not treat illustrative item prices/photos as real offers.

## Test scope and limitations
Automated Chromium simulations checked widths 360, 390, 430, 768, 1440px, navigation, bilingual search, category filters, sorting, basket changes and dialog keyboard focus. Tests showed no JS exceptions in the sampled flows and no horizontal scrolling on sampled layouts. External Unsplash image delivery, actual iPhone/Android performance, complete screen-reader accessibility and commercial readiness remain unverified.

## Audit files
- `docs/UX_AUDIT_2026-11-10.md` — full findings, evidence and priorities
- `reports/ux-audit-2026-11-10/index.html` — mobile-friendly interactive report
- `docs/CATALOGUE_REPLACEMENT_TEMPLATE.csv` — content replacement worksheet

© 2026 BEYOND REALITY
