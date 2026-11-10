# BEYOND REALITY — Gallery Walk V3

A mobile-first **guided photographic retail prototype**. This revision replaces the previous flat glowing-door corridor with four large photo-backed destinations (entrance, tech, home, style), directional scene movement, subtle pointer parallax, touch swipes, keyboard arrows and direct entry to a collection. The original five-chapter cinematic journey, bilingual catalogue, product search, and demonstration basket remain.

## Visit

Open the site, choose **SKIP TO SHOWROOM** or explore the chapters. In the showroom select **WALK THE MALL**, then use Previous and Next. Enter a collection, or bypass to all products.

## Files

- `index.html`: complete experience and gallery walk
- `catalogue.json`: nine static fictional products used by the storefront
- `catalogue-studio.html`: local-only product export editor

## Constraints

This is *not* a freely navigable photoreal 3D mall, a genuine physical business or a live store. It is a light 2.5D, guided experience, with external Unsplash representative photographic imagery. Scenes are not documented real storefronts; items and prices are illustrative, and checkout is disabled. Photos may be unavailable without an internet connection, and precise usage rights, commercial claims and brand permissions must be checked before launch.

## Tests

Automated local Chromium interaction walkthroughs passed at 360, 390, 430, 768 and 1440 px, including visiting the gallery, moving scenes, entering a specific collection and adding a demo item to the basket. External photo traffic was restricted in testing. Real-device image rendering, Core Web Vitals, accessibility and screen readers remain to be validated.

Static deployment: Vercel Framework Preset Other; root directory `experiences/beyond-reality-v3`. Keep earlier project versions unchanged.
