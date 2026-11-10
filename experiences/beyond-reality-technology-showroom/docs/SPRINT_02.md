# BEYOND REALITY · Sprint 02 review

[Published Vercel preview](https://beyond-reality-technology-showroom-1yuz2s358.vercel.app/) · [Sprint 01 baseline](https://beyond-reality-technology-showroom-2ut4ki02z.vercel.app/) · [Baseline verification](VERIFICATION.md)

Test date 10 November 2026. The published preview was built from `a8c7f1e11ae36ac802ee70f1b472d17a3a1d4a60` on `feature/beyond-reality-showroom-sprint-02`.

## Engineering and UX

- **Motion.** Sprint 01 sampled the camera directly from wall-clock time and changed drawing-buffer size when movement began and ended. It also published map and hotspot state on every frame. Sprint 02 advances camera time from rendered frames, caps a delayed step at 41.7 ms and pauses while the page is hidden or a dialog is open. A new destination starts from the current camera pose. Skip motion is available during travel.
- **Rendering.** The drawing buffer stays stable across ordinary starts and stops. Sustained slow active frames can lower the pixel budget. Concourse and shop meshes are batched separately, offscreen zones are culled, and distant fixtures use simplified product silhouettes. Detailed models appear within inspection range. The renderer skips hotspot projection during travel and limits UI telemetry updates to roughly 14 Hz.
- **Discovery.** On narrow screens, the three display cards follow the scene controls. The return action, viewing angles and add button sit by the scene. A sideways drag in inspection changes angle, while drag and directional controls support free movement. Collision bounds include the rear planters. The compact mobile header keeps the language, help and basket buttons visible in Arabic at 360 px.
- **Art.** The same spatial layout now uses wider walnut ceiling boards, limestone joints, glazed storefront highlights, thinner stone fixture tops and baked pools of warm light. Close-range models gain lens-ring ridges, watch case lugs and headphone trim. The interface identifies the items as concepts.
- **Basket.** Adding keeps visitors in the showroom. Quantities and removals persist for the browser origin when local storage is available. The drawer pauses camera motion and closing restores the scene and control focus. The checkout button is disabled.

## Deployment repair

The historical [failed Vercel build](https://vercel.com/mohammed-ajmis-projects/files-mentioned-by-the-user-may/J9ut4ZTxSdMp4DFbSPF717coWLAX) cloned the showroom branch into `files-mentioned-by-the-user-may` and ran `obsidian-essence@1.0.0 build` at repository entrypoint `.`. The log showed `/vercel/path0/node_modules/.bin/vite: Permission denied` and exit 126. Git records the root Vite wrapper and entry script as mode `100644`.

| Dedicated showroom setting | Verified value |
| --- | --- |
| Vercel project | `beyond-reality-technology-showroom` |
| Root Directory | `experiences/beyond-reality-technology-showroom` |
| Framework and Node | Vite and Node 24 |
| Install and build | `npm ci --include=dev` and `npm run build` |
| Output | `dist` |
| Shared input | `experiences/beyond-reality-phase-a/data.json` |
| Deployment | Preview, READY, `dpl_92QUqfhjVdjzZp1sKSW6dzZAKfy2` |

The source upload included the showroom and the sibling catalogue. The [release build logs](https://vercel.com/mohammed-ajmis-projects/beyond-reality-technology-showroom/92QUqfhjVdjzZp1sKSW6dzZAKfy2) show the showroom package building with Vite 7.3.8 and emitting `dist`. All six served files matched their clean local SHA-256 digests. The previous showroom and Signature Showroom deployment IDs still resolve to their original builds.

## Performance

Three full concourse-to-showroom runs per build used the same Chrome session, 1440 × 900 CSS viewport, doorway pointer action and start/end positions. The paired Sprint 02 run used the [preview immediately before the mobile header fix](https://beyond-reality-technology-showroom-by8eed8d2.vercel.app/). The 3D and application JavaScript served by the two Sprint 02 previews is identical. Frame intervals come from browser animation timestamps. CPU submission timing measures the Three.js render call and excludes GPU execution.

| Metric | Sprint 01 | Sprint 02 |
| --- | ---: | ---: |
| Entrance triangles | 31,524 | 19,594 (−38%) |
| Entrance draw calls | 52 | 59 |
| Showroom triangles | 28,824 | 11,238 (−61%) |
| Showroom draw calls | 44 | 36 |
| Median frames rendered on entry | 64 | 99 |
| Median p95 animation interval | 50 ms | 50 ms |
| Median elapsed entry time | 3.59 s | 4.99 s |
| Initial HTML, CSS, JS and favicon | 151 KiB gzip | 156 KiB gzip |

The individual Sprint 02 entry runs rendered 99, 97 and 122 frames. They recorded one, one and two intervals over 250 ms, with maximum gaps of 1,000–1,017 ms. CPU render submission p95 was 0.5–2.8 ms. The drawing buffer stayed at 419,490 pixels through the three runs and returns. Camera time was 3.58 s each run, with elapsed time increasing as the route retained intermediate motion through the stalls.

In an additional 1920 × 889 run, Sprint 02 recorded 205 frames with 17 ms p95 and two long stalls. Earlier Sprint 01 runs in the same test session sometimes advanced the entire route in four frames. These observations confirm reduced geometry and more continuous camera positions. They leave the source of the intermittent one-second browser gaps and physical-device frame pacing open. [Browser animation timing reference](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame)

On the final preview, a 1440 × 900 retest returned 97 frames, 50 ms p95, one 1,000 ms gap and 4.99 s elapsed. The drawing buffer adapted from 419,490 to 310,488 pixels during that run. At 390 × 844, two Sprint 02 source previews recorded 214 frames at 17 ms p95 in 3.60 s and 97 frames at 50 ms p95 in 5.00 s. The former recorded no long gaps. The latter recorded one 1,017 ms gap. These are browser-session measurements with CSS viewport overrides.

## Browser verification

Clean dependency install and production build passed. All nine Node tests passed, covering route clearance through the door and around furniture, bounded camera steps and frame telemetry, and basket persistence, validation and storage failure. The scoped dependency audit reported zero vulnerabilities.

| Scenario | Observed in Chrome |
| --- | --- |
| Enter and explore | Entered through the storefront and returned to the same concourse pose. Walked forward by keyboard and by clicking the phone-width walking control. Dragging the scene changed view direction. |
| Inspect all three | Selected the headphone hotspot and the watch and camera cards. Each route finished at its display. Used the headphone angle control and a horizontal drag to change the watch angle. |
| Interrupt travel | Selected the camera from the concourse and changed the destination to the watch while moving. The watch route completed. On a fresh watch journey, Skip motion reached the target in one rendered frame. |
| Demo basket | Added all three concepts, increased and decreased a quantity, removed the watch and reloaded to verify the other items persisted. Continue exploring restored the same camera pose. Escape returned focus to the basket button. Opening the basket mid-route stopped both camera movement and frame submission. Closing it resumed the route. Checkout was disabled. |
| Arabic and reduced motion | At 360 px, all three header controls fit. Entered the showroom, inspected the watch, selected its right angle and returned. With reduced motion selected, each transition reported one frame and zero animation time. |
| Catalogue fallback and keyboard | Opened `?view=catalogue`, used Tab and Enter to focus the product index, entered the shop, inspected all three products, added an item and returned from the demo basket. Angle controls were hidden. This exercised the fallback interface through its preview URL. GPU context loss was outside this browser test. |
| Visual review | Checked the door opening, display stands, product framing, visible controls and first-screen discovery against Sprint 01 captures. |

| CSS viewport | Display cards, page y range | Horizontal overflow |
| --- | ---: | --- |
| 360 × 800, Arabic | 570–659 px | None |
| 390 × 844 | 583–672 px | None |
| 430 × 932 | 620–709 px | None |
| 768 × 1024 | 689–753 px | None |
| 1440 × 900 | 799–863 px | None |

At 390 px, the cards began at 965 px in Sprint 01 and 583 px in Sprint 02, a 382 px improvement. All three fit within the initial 844 px height after entering. The four walking buttons measured 44 × 44 CSS px at each checked size. Phone-width input checks used pointer taps and drags in Chrome. Physical phone, Safari and screen-reader testing are pending.

## Visual evidence

| View | Sprint 01 | Sprint 02 |
| --- | --- | --- |
| Entrance | [Baseline](evidence/sprint-02/before-entrance.jpg) | [Updated](evidence/sprint-02/after-entrance.jpg) |
| Shop | [Baseline](evidence/sprint-02/before-showroom.jpg) | [Updated](evidence/sprint-02/after-showroom.jpg) |
| Camera inspection | [Baseline](evidence/camera-inspection.jpg) | [Updated](evidence/sprint-02/after-inspection.jpg) |
| 390 px showroom | [Baseline](evidence/sprint-02/before-mobile.jpg) | [Updated](evidence/sprint-02/after-mobile.jpg) |

[Side-by-side comparison](evidence/sprint-02/visual-comparison.jpg) · [360 px Arabic inspection](evidence/sprint-02/after-mobile-rtl.jpg) · [Demo basket](evidence/sprint-02/after-basket.jpg)

## Open issues

| Severity | Issue | Next step |
| --- | --- | --- |
| High for sign-off | About one-second gaps occurred on desktop and one phone-width run. The paired p95 stayed at 50 ms, and entry elapsed time increased when the camera preserved intermediate positions. | Capture a visible-tab Chromium trace on a hardware-rendered desktop and profile on representative iOS and Android devices before expanding the mall. |
| Medium | The responsive and pointer results are from one Chrome environment. Physical touch, iOS Safari and screen-reader behavior remain unverified. | Run the full walk, inspect and basket flow on those devices and assistive technologies. |
| Low | A separate repo-linked Vercel project still runs the unrelated root build on this branch and reports a failing preview check. The dedicated showroom preview builds successfully. | Review the root project's branch filters and dependency tracking separately. |

The tested showroom and basket flows are ready for review. Performance sign-off remains open.
