# BEYOND REALITY — Photographic Shopping Gallery (Commercial UX Prototype)

**Live experience scope:** The complete five-chapter cinematic journey plus a redesigned mobile-first photographic shopping showroom in chapter 05. This branch does not overwrite the production versions of Phase 1, Phase 2, or the completed original journey.

## What is new

- A cinematic retail gallery hero and curated editorial layout.
- 3 departments: **Tech & Design**, **Ritual & Home**, **Style & Motion**.
- 9 sample product concepts, with illustrative SAR prices and lifestyle photographs.
- Search across Arabic and English product names/descriptions.
- Featured, low-to-high and high-to-low sorting.
- Product detail dialogs, demo basket, quantity changes, and subtotal.
- Full Arabic RTL / English LTR support, keyboard dialog controls, mobile responsiveness, reduced-motion support.
- Lightweight graphic fallback art when external photos are unavailable.

**No live selling:** All products, prices and descriptions are illustrative. No real stock, merchants, orders, checkout, payments, accounts, customer data or shipping integrations. Checkout is deliberately disabled.

## Photography and permissions

The template references real photographic images served from `images.unsplash.com` with responsive compression parameters and lazy loading, using the [Unsplash License](https://unsplash.com/license). The photography is **representative** only; it is not evidence that the named sample products are actually photographed, stocked, supplied or endorsed. The Unsplash licence permits many commercial uses but does not grant third-party trademark, identifiable-person or other separate rights ([terms](https://unsplash.com/terms)). Validate every image, brand and product claim before a commercial launch.

The image endpoints are external and require network access. Local automated browser tests ran in an isolated environment without external photo access and confirmed that the graphical fallback still renders. Image network availability must be checked on real mobile devices.

## Launching a real store later

1. Pick verified merchants and obtain real product data, stock, images and selling rights.
2. Replace the nine illustrative items with accurate SKUs, prices, descriptions and media.
3. Integrate inventory/catalogue backend with proper access controls.
4. Implement a payment service provider, order lifecycle, delivery, returns, tax, compliance and support.
5. Validate accessibility, privacy, performance, conversion and real mobile conditions.

## Deployment

Static, no-build, no backend. Deploy `index.html` as the root of a **separate** Vercel project; or set Vercel root directory to `experiences/beyond-reality-commercial-gallery`. No npm packages required. For private testing, browse to `#mall` only after entering the cinematic site; the gallery is Chapter 05 within the full journey.

## Local checks

Tested at 360, 390, 430 and 1440 px using automated Chromium interaction scripts, covering portal navigation, category filters, search, sorting, quantity increment, cart reset, product details, Arabic switch, and horizontal overflow. Those are browser simulations, not real-device performance certification.

© 2026 BEYOND REALITY — UX concept demonstration.
