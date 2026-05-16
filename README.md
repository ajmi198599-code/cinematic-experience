# OBSIDIAN ESSENCE

A cinematic React + Vite luxury perfume landing page for the fictional fragrance brand **OBSIDIAN ESSENCE**, created by Mohammad Al-Ajmi.

## Stack

- React + Vite
- Tailwind CSS
- Three.js / React Three Fiber
- GSAP ScrollTrigger
- Lenis smooth scroll
- Lucide icons

## Run Locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, usually:

```text
http://127.0.0.1:5173
```

For a production-style local preview:

```bash
npm run build
npm run preview
```

## Build

```bash
npm run build
```

## Notes

- The uploaded perfume image is included as `public/assets/obsidian-master-reference.png` and is used as the master visual reference for the black and gold palette, marble/smoke mood, bottle styling, and creator-signature direction.
- Runtime visuals use resized JPEG derivatives (`obsidian-reference-900.jpg` and `obsidian-reference-560.jpg`) so the original reference does not have to be loaded repeatedly in scroll scenes.
- Smoke, particles, marble veins, and gold streaks are procedural CSS layers so the page avoids unlicensed third-party media.
- The bottle is a lightweight WebGL construction inspired by the reference image, with a CSS image fallback if WebGL is unavailable. WebGL pixel ratio is capped and the render loop pauses outside active product moments.
