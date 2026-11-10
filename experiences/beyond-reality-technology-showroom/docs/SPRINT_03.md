# BEYOND REALITY · Sprint 03 · Phoenix

[Public preview](https://beyond-reality-technology-showroom-1yzr69oi5.vercel.app/) · [Sprint 02 preview](https://beyond-reality-technology-showroom-1yuz2s358.vercel.app/) · [Sprint 02 baseline](SPRINT_02.md) · [Original verification](VERIFICATION.md)

The Preview deployment `dpl_9wRazWJQdgQEtVY1QYDx2hQSoouq` serves `9f531fa5c66c7e972c46afc243d2b91fd7e25295` from `feature/beyond-reality-showroom-sprint-03`.

## Engineering and UX

- **Motion.** Guided routes retain the same duration formula and collision-checked waypoints. A smooth acceleration ramp and constant-speed middle lower peak path speed by about 18%. A gap of at least 250 ms resumes with one nominal 60 Hz step. Ordinary guided steps can advance up to 50 ms with a peak displacement comparable to the old 41.7 ms cap. Repeated stalls call out Skip motion. The route sampler reuses its coordinate buffer, and visitors can retarget or use reduced motion.
- **Rendering.** Startup yields between texture preparation, concourse, interior and product geometry. Shader precompilation and four small-scissor warm-up renders submit buffers and textures before visitors reach the display stations. Sustained pressure queues a resolution change for the idle frame after travel. Indexed geometry stays indexed when all pieces in a batch support it. A focused, visible guided route can submit from a 32 ms timer when native frame delivery stalls for 125 ms. Healthy native callbacks take over automatically. The metrics retain native cadence independently of submission cadence.
- **Architecture.** The storefront, dimensions and circulation follow the existing showroom. Limestone courses, walnut grain, chipped terrazzo, layered fixture shadows and softer warm pools of light bring more depth to the same space. The slim storefront fascia and recessed display bases improve proportion. Material highlights are baked or reflected from a small environment map. There are no real-time shadow passes.
- **Products.** The original fictional headphones have recessed fabric cups and rounded cushions. The watch has a sunburst dial, inset date, textured strap and more distinct metal trim. The camera has a ribbed barrel, a convex coated element, a separated rear display and tactile controls. Distant silhouettes retain simpler geometry.
- **Mobile.** Product actions, angles and a keyboard-operable details disclosure sit directly below the view. Display cards remain one row away from the inspection controls. The interface mirrors in Arabic and keeps spatial left and right consistent.
- **Commerce.** The existing local demo basket retains three concept products, quantity controls, removal, keyboard dismissal and position restoration. Checkout is visibly disabled.

## Vercel and the root check

The dedicated `beyond-reality-technology-showroom` project built 19 uploaded source files. Its Vite root is `experiences/beyond-reality-technology-showroom`. The sibling Phase A catalogue is the only source outside it. The build runs `npm ci --include=dev` and `npm run build`, outputs `dist` and uses Node 24. The deployment has no production target or alias. Sprint 01, Sprint 02 and Phase A all returned their original READY deployment IDs. [Preview build log](https://vercel.com/mohammed-ajmis-projects/beyond-reality-technology-showroom/9wRazWJQdgQEtVY1QYDx2hQSoouq)

The separate `files-mentioned-by-the-user-may` project still launches a Preview build on this branch. The Sprint 02 log shows the repository-root `obsidian-essence` Vite command failing with exit 126. Its checked-in `node_modules/.bin/vite` has Git mode `100644`. The showroom preview installs and runs its own Vite. [Root build log](https://vercel.com/mohammed-ajmis-projects/files-mentioned-by-the-user-may/EnF9bzJ7xY3MQY6H1YVL7YiyUuuh) · [Sprint 03 root check](https://vercel.com/mohammed-ajmis-projects/files-mentioned-by-the-user-may/GZKFrDjrK9xB6t8zssi8PcCBs9ma)

Proposed project-level **Ignored Build Step** for the root project, subject to owner approval. It skips only Preview builds on the showroom sprint branch family. Vercel interprets exit 0 as skip and exit 1 as build. [Vercel guidance](https://vercel.com/kb/guide/how-do-i-use-the-ignored-build-step-field-on-vercel)

```sh
case "${VERCEL_ENV:-}:${VERCEL_GIT_COMMIT_REF:-}" in
  preview:feature/beyond-reality-showroom-sprint-*) exit 0 ;;
  *) exit 1 ;;
esac
```

Shell checks confirmed that the example skips the showroom Preview branch and permits unrelated Preview, production and missing-branch cases. Review tracked root dependencies and install scripts separately with the root project's owner.

## What the stall instrumentation isolated

The same visible Chrome session reproduced Sprint 02's approximately one-second frame gaps. In the Sprint 03 diagnostic build, six consecutive gaps measured 1,016.4–1,016.6 ms in `requestAnimationFrame`, with observed callback spacing of 1,013.9–1,018.5 ms. The page reported visible and focused. The 75 ms heartbeat fired 13–14 times inside each gap, and Chrome's Long Tasks API reported zero overlapping tasks of at least 50 ms. This isolates native animation callback delivery as the immediate bottleneck in that sample. The exact browser compositor, driver or host policy behind it remains unverified.

The diagnostic startup reported 76.3 ms for reflections and textures, 42.8 ms for concourse geometry, 32.0 ms for showroom geometry, 28.3 ms for product geometry, 34.8 ms elapsed for shader precompile, 92.2 ms elapsed for the yielded warm-up and 30.8 ms for the first full render. Its longest startup task was 91 ms. These costs are distinct from the one-second travel gaps. The run cannot attribute shorter tasks to GC or establish GPU execution time.

The native Chromium surface reported software-only compositing, Mesa llvmpipe and WebGL disabled on `chrome://gpu`. Its network access could not reach the preview. The connected Chrome surface supported the showroom and browser timing APIs, with no verified hardware acceleration or engine trace. A full Chrome DevTools recording with GC, compositor and GPU attribution remains a hardware verification item.

## Paired release measurements

Three doorway entries per viewport and preview used the same connected Chrome session and tab, the same starting pose and the same navigation action. The document was visible in all samples. Sprint 02 reported native animation timestamps only. Sprint 03 measures the native cadence and WebGL submissions separately. Native callbacks are the comparable frame-clock measure. Neither measure confirms actual display presentation.

| Median of three entries | 1440 × 900 Sprint 02 | 1440 × 900 Sprint 03 | 390 × 844 Sprint 02 | 390 × 844 Sprint 03 |
| --- | ---: | ---: | ---: | ---: |
| Native frame p95 | 50 ms | 17 ms | 50 ms | 17 ms |
| Submission interval p95 | — | 23 ms | — | 22 ms |
| Elapsed entry | 4.978 s | 3.599 s | 4.997 s | 3.597 s |
| Submitted frames | 102 | 212 | 97 | 212 |
| Drawing buffer pixels | 419,490 | 359,541 | 159,991 | 144,905 |
| CPU render submission p95 | 0.5 ms | 0.8 ms | 0.5 ms | 5.1 ms |
| Long gaps across all three entries | 2 | 0 | 3 | 0 |

Sprint 03 desktop native p95 was 17, 17 and 33 ms. The longest native interval was 50 ms. The 390 px native p95 was 17 ms in each run and the maximum was 33 ms. All six release runs used native callbacks throughout. They show better observed cadence in this sample. They cannot isolate a causal improvement in Chrome's scheduling or establish physical GPU performance. The final route still used 3,581 ms of camera time.

At 1440 px, the entrance submitted 19,494 triangles in 58 calls and the showroom 11,138 in 35. Sprint 02 submitted 19,594 in 59 calls and 11,238 in 36. Lower buffer area is the larger rendering cost change. The final six build assets total 162,605 gzip bytes, approximately 159 KiB, and matched the served files byte for byte.

One separate final-profile entry recorded 21.2 ms callback p95, 1.1 ms p95 for the full application frame handler and zero Long Tasks API entries during travel. Startup ready time was 2.79 s on the first release visit and 0.59 s in that later diagnostic visit. These startup observations were collected under different cache and session conditions. The watchdog stayed idle. A simulated scheduler exercised the 125 ms timeout, 32 ms recovery cadence, native recovery after healthy callbacks, the focus guard and cancellation. Actual browser presentation under timer recovery remains unverified. [Individual samples and diagnostic data](evidence/sprint-03/measurements.json)

## Release verification

Clean install with `npm ci --include=dev`, production Vite build and `npm audit` passed. All 11 Node tests passed. The navigation suite checks 121 destination pairs across the concourse, showroom and nine product viewpoints, including segment clearance around door glass, islands, perimeter obstacles and rear planters. Timing and basket tests cover bounded camera motion, separate native telemetry and local storage failure.

| Browser check | Observed result |
| --- | --- |
| Desktop exploration | Keyboard W moved the camera from z = −1.110 m to −1.250 m. Guided routes reached all three fixtures. Headphones, watch and camera entries took 1.78 s, 1.24 s and 1.49 s in the walkthrough. The right headphone angle was reachable with Enter. |
| Mobile discovery | At 390 px, a pointer tap on the projected watch hotspot started the route and arrived in 2.33 s. Product details opened inline with three feature labels. The right angle, add action, direct switch to the camera and showroom return all worked. |
| Demo basket | The three products appeared with quantities 1, 2 and 1 after desktop and mobile adds. Camera quantity went to 2 and back to 1. Removing the watch left two items. Escape restored focus to the basket button. Continue exploring restored the same camera pose. Both remaining items survived reload. Checkout was disabled. |
| Pause and resume | Opening the basket during the camera route held the pose at 0.139, 1.527, 2.297 m and held the frame counter at 529. Closing it resumed the route, with one explicit pause recorded. |
| Retarget and skip | Changed an active Creator Camera route to Everyday Watch and reached the watch. A fresh camera route settled in one rendered frame after Skip motion. The concourse return also completed. |
| RTL and reduced motion | The 360 px Arabic header, display cards and watch details fit. Enter toggled the details disclosure. Reduced motion reached the selected watch and returned in one rendered frame per transition. |
| Catalogue and WebGL startup failure | The skip link focused the product index in catalogue mode. Keyboard selection opened all three products with angles hidden. The forced WebGL creation error then reached the real fallback path, where product details and the persisted basket were available. |
| Console | The regular 3D journeys produced no captured warnings or errors in the tested browser. |

| CSS viewport | Showroom display cards | Width check |
| --- | ---: | --- |
| 360 × 800 | y 561–650 | Fits |
| 390 × 844 | y 543–632 | Fits |
| 430 × 932 | y 577–665 | Fits |
| 768 × 1024 | y 642–706 | Fits |
| 1440 × 900 | y 799–863 | Fits |

All three cards fit in the visible height after entry. At 390 px, cards start 40 px earlier than in Sprint 02. With watch details collapsed, cards still fit below inspection controls at y 643–732. Walk and header controls retained their 44 px minimum in the tested layouts. These were Chrome viewport and pointer tests. Physical touch, Safari and screen-reader behavior are pending.

## Before and after

| View | Sprint 02 | Sprint 03 |
| --- | --- | --- |
| Mall entrance | [Before](evidence/sprint-03/before-entrance.jpg) | [After](evidence/sprint-03/after-entrance.jpg) |
| Showroom | [Before](evidence/sprint-03/before-showroom.jpg) | [After](evidence/sprint-03/after-showroom.jpg) |
| Studio Headphones | [Before](evidence/sprint-03/before-headphones.jpg) | [After](evidence/sprint-03/after-headphones.jpg) |
| Everyday Watch | [Before](evidence/sprint-03/before-watch.jpg) | [After](evidence/sprint-03/after-watch.jpg) |
| Creator Camera | [Before](evidence/sprint-03/before-camera.jpg) | [After](evidence/sprint-03/after-camera.jpg) |
| 390 px product discovery | [Before](evidence/sprint-03/before-mobile.jpg) | [After](evidence/sprint-03/after-mobile.jpg) |

[Side-by-side comparison](evidence/sprint-03/visual-comparison.jpg) · [Mobile inspection](evidence/sprint-03/after-mobile-inspection.jpg) · [Arabic inspection](evidence/sprint-03/after-mobile-rtl.jpg) · [Demo basket](evidence/sprint-03/after-basket.jpg)

## Recommendation and open issues

**CONDITIONAL PASS for review.** The tested desktop and phone-width journeys and build passed. The paired sample met the frame-interval targets in the connected browser. Hardware performance sign-off remains open.

| Severity | Open issue |
| --- | --- |
| High for sign-off | Capture a foreground hardware-accelerated DevTools trace and verify presentation through timer recovery. The sampled native gaps were independent of 50 ms main-thread tasks. Their underlying browser, compositor or host trigger is still unknown. |
| Medium | Test real iOS and Android touch, Safari WebGL, and screen-reader navigation. |
| Low | The unrelated root preview check continues to fail. The report includes a branch-scoped filter proposal for the root project owner. |

## Repeat the hardware performance check

1. On a desktop with working WebGL, check `chrome://gpu` and record whether WebGL and compositing report hardware acceleration. Keep the browser window foreground and visible. Use one tab, the same device pixel ratio and a 1440 × 900 CSS viewport on both previews. Disable CPU and network throttling in DevTools.
2. In Chrome DevTools **Performance**, record a cold reload to inspect startup and capture warm entries separately. Click the same storefront button three times per preview, returning to the concourse between trials. Stop each recording after arrival. Inspect **Frames**, **Main** and **GPU** tracks around any gaps over 250 ms. Check script evaluation, shader or GPU work, GC and main-thread idle time against the gap. [Chrome Performance reference](https://developer.chrome.com/docs/devtools/performance/reference)
3. On Sprint 03, use `?profile=1` to add `showroom:*` User Timing measures and inspect the stage's `data-profile` JSON in DevTools. It reports startup work, long tasks, raw frame and callback gaps, and timer heartbeats. Use the plain preview for paired throughput comparisons.
4. Repeat at 390 × 844, then do the complete route on a physical Android phone with Chrome remote debugging and a physical iPhone with Safari Web Inspector. Record device, browser, actual viewport, WebGL renderer and any thermal or power-saving state. Verify all three display visits, switching, basket return, RTL and touch controls.
5. Accept the performance gate after p95 stays at or below 33 ms desktop and 50 ms mobile, and no unexplained foreground gap exceeds 250 ms. Record startup and travel separately. `?view=catalogue` exercises the catalogue directly. `?profile=1&webgl=unavailable` intentionally acquires a different context type on the showroom canvas so the normal WebGL creation and fallback path runs.

For a deliberate watchdog test, open the final preview with `?profile=1`. After Live 3D appears and before starting a journey, replace the callbacks in that tab's DevTools Console. Click the doorway, then compare `data-travel-timer-frames`, `data-travel-native-max` and `data-travel-max` on the stage. Record a Performance trace to check presentation. Restore the native functions after arrival or reload the test tab. This emulates sparse callbacks and does not replace the normal hardware acceptance run.

```js
const restoreFrames = (() => {
  const request = window.requestAnimationFrame;
  const cancel = window.cancelAnimationFrame;
  window.requestAnimationFrame = callback => setTimeout(() => callback(performance.now()), 1000);
  window.cancelAnimationFrame = id => clearTimeout(id);
  return () => {
    window.requestAnimationFrame = request;
    window.cancelAnimationFrame = cancel;
  };
})();
// After the test journey completes, run restoreFrames().
```
