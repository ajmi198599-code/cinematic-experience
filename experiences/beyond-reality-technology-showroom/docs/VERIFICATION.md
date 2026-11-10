# Technology Showroom verification

Tested on 10 November 2026 using the [public Vercel Preview](https://beyond-reality-technology-showroom-2ut4ki02z.vercel.app/). The source build is commit `62146d3`. A clean npm install, all three routing tests and the production build passed. The six served build files matched their local SHA-256 digests. The preview deployment reported READY, and the existing [Phase A preview](https://beyond-reality-signature-showroom.vercel.app/) retained its original deployment ID.

## Browser checks

| Check | Evidence |
| --- | --- |
| Storefront entry | The same camera moved from the concourse at `z = 9.42 m` through the open threshold to the room at `z = -1.11 m`. An intermediate sample captured the camera at `z = 2.917 m`. All three markers appeared on arrival. |
| Three in-place inspections | The Studio Headphones marker opened the headphones at the left island. The object index opened Everyday Watch and Creator Camera at their fixtures. The scene, detail panel and map followed the selected object. |
| Viewing angles | The headphones left view moved the camera from `x = -2.260 m` to `x = -3.024 m`. The watch right view moved it to `x = 0.611 m`. |
| Free navigation and return | The W key moved the camera forward from `z = -1.110 m` to `-1.351 m`. Drag changed yaw and pitch. The room and concourse return controls reached their respective destinations. |
| Phone-width layout | Chrome at 390 × 844 showed all three room markers and four 44 × 44 CSS-pixel walk buttons. The forward control moved the camera 0.14 m. The document and content viewport widths matched. |
| Arabic and motion | Chrome at 360 × 800 switched to Arabic RTL and retained the selected product and angle. The document and content viewport widths matched. The motion toggle returned to the showroom in one frame at 0 ms of travel. |
| Mid-journey selection | A direct camera selection started from the concourse. While its journey was active at `z = 6.118 m`, selecting Everyday Watch redirected the camera and opened the watch display. |
| Catalogue mode | Opening the preview with `?view=catalogue` exercised the same text-first fallback interface. All three products opened their details, with the angle controls hidden. |
| Browser console | The product, responsive and Arabic checks returned zero warnings or errors. |

The routing tests exercised 121 pairs of configured viewpoints, 44 perimeter-to-viewpoint routes and direct collision checks against the storefront glass and display furniture.

## Performance

The built HTML, CSS, JavaScript and favicon total **151 KiB gzip**. Product and architecture textures are generated on the client. At the sampled desktop poses, Three.js reported 52 draw calls and 31,524 triangles in the concourse, 42 and 28,820 in the showroom, and 29 and 23,166 at the camera display. The render count stayed at 438 between consecutive settled inspection samples.

| Guided move on the published preview | Duration | Frames | 95th-percentile frame interval |
| --- | ---: | ---: | ---: |
| Concourse to showroom, repeated desktop run | 3.60 s | 63 | 50 ms |
| Showroom to headphones | 2.69 s | 101 | 17 ms |
| Headphones front to left angle | 0.73 s | 43 | 17 ms |
| Headphones to watch | 1.68 s | 100 | 17 ms |
| Watch to camera | 2.48 s | 53 | 67 ms |
| Camera to showroom at 390 × 844 | 1.85 s | 66 | 50 ms |

Frame pacing varied. An earlier entry run on the same published build took 4.10 s and recorded only six frames. These are observations from the browser session, with physical device performance still to verify.

## Visual evidence

| View | Captured state |
| --- | --- |
| [Desktop showroom](evidence/desktop-showroom.jpg) | The three numbered displays, fixture shadows and uninterrupted aisle |
| [Camera inspection](evidence/camera-inspection.jpg) | The mounted camera and viewing angle controls at the display |
| [Phone-width showroom](evidence/phone-width-showroom.jpg) | Three markers in view and the reachable walk controls |

## Scope and next priorities

This release covers one showroom and a concourse segment. The models are fictional products. The room uses baked lighting and English architectural signage, with English and Arabic interface copy.

1. Test repeat visits and guided motion on physical iPhones and mid-range Android devices. Record frame pacing, load time and touch reach.
2. Refine the room lighting and replace the concepts with measured, optimized models when verified product assets are available.
3. Add a second shop using the same floor-plan and navigation contract once the first shop passes the device checks.
