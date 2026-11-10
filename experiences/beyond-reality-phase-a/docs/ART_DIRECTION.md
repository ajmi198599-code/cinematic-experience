# BEYOND REALITY — PHASE A / Creative Direction

## Design premise
**A premium destination that disappears behind the act of discovery.** The visitor should see one coherent room, choose an object and immediately understand what to do next. No obligatory portal, whale animation or fantasy sequence stands between a customer and a product. The visual objective is *photographic credibility with generous space*, not a simulated 3D mall.

## Experience architecture
1. **Arrival** — quiet architectural hero, plain-language promise and two clear CTAs: Enter the Showroom / Browse the Collection.
2. **Editorial bridge** — succinct value proposition: fewer distractions, more discovery.
3. **Technology Atelier** — one persistent room for all three objects. Large image, one clear product title, honest sample price, next object, thumbnails and demo bag. Product changes in place rather than opening another site.
4. **Direct catalogue** — 3 responsive cards and text search. Clicking a card selects that item in the same showroom.
5. **Product inspection** — enlarged photograph dialog. Photo is representative; it is not a verified exact-item photograph.

## Design tokens
| Purpose | Token | Value |
| --- | --- | --- |
| Primary ink | `--ink` | `#15231e` |
| Paper | `--paper` | `#f3f0e9` |
| Linen | `--linen` | `#ded7c9` |
| Soft bronze | `--bronze` | `#a28059` |
| Olive | `--olive` | `#737b6c` |
| Pale white | `--white` | `#fffdfa` |

Use a *single architectural backdrop* for both the arrival and the presentation room. Different cropping is fine; unrelated rooms are not. The original warm architectural photo is referenced from Unsplash and should be replaced with a licensed, dedicated venue photograph before commercial use. The three object photographs are representative and not matched to genuine SKUs. No real product brands are claimed.

## Typography and motion
- Use system sans serif for text and Georgia italic for a small number of editorial phrases.
- Large hero headings should lead, short copy should explain, and controls should be legible on first glance.
- Animation belongs only at intentional interaction points: hover lift, product cross-fade, and section navigation.
- No endless glow pulses or automatic camera movement. Honour reduced-motion preferences.
- Maintain touch targets at least 44×44 pixels for interactive buttons.

## Language
Full Arabic RTL and English LTR with explicit translation values for every visible interface string. Product names and descriptions are supplied independently in both languages, rather than machine-generated at runtime.

## Commercial integrity
No live pricing, no inventory claims, no checkout. Keep the demo disclosure visible and keep the checkout button disabled. A real launch needs verified vendor contracts, SKUs, content rights, VAT and delivery rules, payment processing, privacy/security compliance, and real-device user testing.

## Phase B handoff
Validate this **single Technology Atelier** in real mobile browsers, obtain one cohesive set of architectural and product assets, then implement it as the reusable Next.js + TypeScript / CMS-backed component system for more shops. Do **not** extend to Home or Style before the first shop meets the agreed quality bar.