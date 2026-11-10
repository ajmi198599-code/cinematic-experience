# BEYOND REALITY · Sprint 03.1 · Final quality gate

Date: 10 November 2026. This continues the existing Technology Showroom.

**CONDITIONAL PASS for review. Hardware-accelerated performance and physical-device gates: NOT VERIFIED.** The available code/build and browser checks pass. Full release sign-off and expansion to another shop remain open.

[Public Sprint 03.1 preview](https://beyond-reality-technology-showroom-nh5j5ik6m.vercel.app/) · [Exact Sprint 03 baseline](https://beyond-reality-technology-showroom-1yzr69oi5.vercel.app/) · [Working branch](https://github.com/ajmi198599-code/cinematic-experience/tree/feature/beyond-reality-showroom-sprint-03-1) · [Implementation commit](https://github.com/ajmi198599-code/cinematic-experience/commit/a336e200903f5002ccd1b419e6143df2267a66dd)

The preview serves implementation commit `a336e200903f5002ccd1b419e6143df2267a66dd`, deployment `dpl_5Rj5tZNcuGyGszbY1aFoimjKspDR`. The new branch starts at Sprint 03 head `2e2cd6230c58657c97e91f9a8976963b4e38926e`. The baseline preview serves `9f531fa5c66c7e972c46afc243d2b91fd7e25295`; the later baseline commit contains documentation. The final report, screenshots and safer root-project proposal are a documentation/test follow-up to the deployed implementation. They do not change its runtime assets.

## Engineering changes

### Frame scheduling and diagnostics

The production scheduler now lives in `src/frame-loop.js`, so regression tests exercise the same implementation used by the browser.

- A single pending native animation callback and a single recovery timer have explicit ownership tickets. A cancelled callback cannot draw into, clear or replace a restarted route.
- The 125 ms watchdog retains Sprint 03's 32 ms recovery interval. Native requests stay pending during recovery. Native callbacks within 12 ms of a recovery draw avoid a duplicate draw; four healthy native intervals restore the normal watchdog.
- Recovery is limited to a visible, focused guided route. Blur removes recovery eligibility. Hidden pages and modal dialogs stop both callback sources. Arrival, reduced motion and Skip motion cancel pending requests.
- The stationary scene has no polling render loop. The optional profiling heartbeat runs only during active, unpaused routes.
- Camera step limits, acceleration, route duration and collision geometry are retained. A stall of at least 250 ms advances the camera by one nominal 60 Hz step rather than applying the stalled wall-clock time.
- The adaptive drawing buffer now responds to sustained CPU render submission cost above 13 ms, rather than treating callback delays as evidence that resolution is too high. Eight expensive frames queue a reduction for arrival, with a 0.64 quality floor. This preserves image quality when scheduling stalls despite inexpensive rendering.
- Diagnostics distinguish submitted renders, native callbacks and the first native wait. A short route with no usable native intervals reports `null`, rather than an apparent zero-millisecond success.
- Profile publication has cancellation/revision guards. Heartbeats are bounded, and gap evidence captures timer activity at observation time.
- `?profile=1` records browser/renderer identity, startup phases, long tasks, frame-handler work and optional asynchronous GPU timer queries. Queries are limited to four samples per route, read only after availability, and discarded when disjoint. There is no blocking GPU finish or idle polling.
- `?profile=1&frames=slow` deliberately supplies one simulated native callback per second. Its `frameSource` is explicitly `simulated-1hz`. It is a recovery regression check, excluded from normal acceptance measurements.

This hardens the scheduler and improves the evidence. It does **not** establish the compositor/driver cause of the intermittent one-second native gaps.

### Product presentation

All geometry and textures remain original procedural work. No supplier claims, branded assets, purchases or new dependencies were introduced.

| Product | Refinement |
| --- | --- |
| Studio Headphones | Softer cushion response, quieter fabric grain, refined graphite/champagne materials, two fine headband seams and a lower front/three-quarter viewing composition. |
| Everyday Watch | A 512 px original dial, applied hour indices and three-dimensional hands, date opening, restrained crystal and metal response. The case is approximately 44.8 mm in scene units, with a 21 mm strap. |
| Creator Camera | Original iris/aperture artwork behind a convex glass element, layered barrel response, additional body/control details and a closer optical composition. The body is approximately 174 mm wide. |

Model scales now match their display furniture more convincingly. Inspection uses narrower optical fields of view, especially for the watch, while retaining collision-safe camera positions outside the islands. Product bases and their existing contact-shadow geometry scale together.

The limestone, walnut, terrazzo and deep-green architecture remains the same room. Lighting uses the existing small environment map and restrained directional/hemisphere setup. Contact shadows and room illumination remain approximations; there are no dynamic shadow or ray-traced reflection passes. This is a refined concept showroom, not a photoreal supplier catalogue.

Whole-view rendering counts at 1440 × 900, the front inspection pose and 359,541 drawing-buffer pixels:

| View | Sprint 03 triangles / calls | Sprint 03.1 triangles / calls |
| --- | ---: | ---: |
| Entrance | 19,494 / 58 | 19,494 / 58 |
| Showroom | 11,138 / 35 | 11,138 / 35 |
| Headphones | 14,910 / 31 | 15,170 / 31 |
| Watch | 12,936 / 27 | 13,216 / 29 |
| Camera | 16,846 / 31 | 16,758 / 32 |

These are visible-scene counts, including changing culling and LOD, rather than isolated model polygon totals.

## Performance evidence and its limits

### Actual test environment

| Item | Recorded condition |
| --- | --- |
| Browser | Connected Chrome 157.0.0.0, Windows x64; user agent reports NT 10.0 |
| Physical make, CPU model and exact OS build | Not exposed; no physical-machine claim |
| Logical processors / DPR | Browser reports 20 / 1 |
| Graphics renderer | `ANGLE (Microsoft, Microsoft Basic Render Driver (0x0000008C) Direct3D11 vs_5_0 ps_5_0, D3D11)` |
| WebGL | WebGL 2.0 / OpenGL ES 3.0 Chromium |
| GPU elapsed queries | Unavailable; zero samples; GPU time is null |
| Paired viewports | 1440 × 900 and 390 × 844 CSS pixels |
| Runs | Three doorway entries per version per viewport, same Chrome session and tab |
| Visibility | Visible in the paired samples; diagnostic gaps also report focused |
| Cache | Both origins visited; HTTP, shader and driver caches not cleared or controlled |
| Physical phones / Safari | None tested |

Microsoft documents the Basic Render adapter as a software rendering path. This environment cannot supply hardware-accelerated acceptance evidence. The app's coarse `graphics="reported"` telemetry means that a renderer string was available, not that hardware acceleration was verified. [Microsoft DXGI reference](https://learn.microsoft.com/en-us/windows/win32/direct3ddxgi/d3d10-graphics-programming-guide-dxgi) · [WARP reference](https://learn.microsoft.com/en-us/windows/win32/direct3darticles/directx-warp)

The available browser API provides page inspection, interaction and console logs. It does not expose a Chrome Performance trace, compositor track, GC events or GPU execution track. Application User Timing, the Long Tasks API and nonblocking GPU-query availability were inspected instead. A zero long-task count does not rule out shorter GC or rendering work.

### Exact-baseline comparison

Every entry starts at the same concourse pose and uses the doorway action. The camera clock remains 3,581 ms. These are **medians of three per-run measurements**, not a pooled p95, and not measurements of actual display presentation.

| Measure | Desktop Sprint 03 | Desktop 03.1 | 390 px Sprint 03 | 390 px 03.1 |
| --- | ---: | ---: | ---: | ---: |
| Native callback p95 | 67 ms | 50 ms | 1,017 ms | 17 ms |
| Render submission interval p95 | 47 ms | 51 ms | 48 ms | 18 ms |
| Elapsed doorway route | 3.901 s | 3.664 s | 3.713 s | 3.597 s |
| Submitted frames | 145 | 88 | 87 | 216 |
| CPU render submission p95 | 0.7 ms | 0.6 ms | 5.7 ms | 0.5 ms |
| Recovery draws | 25 | 0 | 75 | 0 |

| Individual entry measure | Desktop Sprint 03 | Desktop 03.1 | 390 px Sprint 03 | 390 px 03.1 |
| --- | --- | --- | --- | --- |
| Native p95, ms | 117, 67, 17 | 50, 50, 50 | 1017, 1017, 117 | 50, 17, 17 |
| Submission p95, ms | 47, 48, 19 | 52, 51, 51 | 48, 48, 84 | 52, 18, 18 |
| Elapsed, ms | 3921, 3901, 3597 | 3714, 3664, 3646 | 3692, 3713, 4186 | 3703, 3597, 3597 |
| Native maximum, ms | 1017, 1000, 50 | 1000, 50, 67 | 1017, 1017, 517 | 1017, 17, 17 |
| Submission maximum, ms | 132, 140, 50 | 142, 52, 68 | 132, 49, 140 | 131, 19, 19 |

The candidate's observed median route time is 6.1% lower on desktop and 3.1% lower at phone width. Desktop submission p95 is worse. Native delivery varies substantially between trials. These samples do not establish a causal frame-pacing improvement or resolution of the one-second gap.

The same initial drawing buffer was used in each version: 359,541 pixels desktop and 144,905 at 390 px. Sprint 03 reduced its buffer to 170,328 desktop and 108,704 mobile during the sequence. The candidate retained the initial buffer throughout. This is a measured image-quality preservation improvement, but also a confounder when comparing renderer cost.

[Conditions, summary and raw-file index](evidence/sprint-03-1/measurements.json) · [Before desktop](evidence/sprint-03-1/before-desktop.json) · [After desktop](evidence/sprint-03-1/after-desktop.json) · [Before mobile](evidence/sprint-03-1/before-mobile.json) · [After mobile](evidence/sprint-03-1/after-mobile.json)

### Startup and warm scene entry

Three profiled, already-visited-origin loads per version at 1440 × 900 produced:

| Startup measure | Sprint 03 | Sprint 03.1 |
| --- | --- | --- |
| Ready times | 900, 494, 449 ms | 1021, 505, 432 ms |
| Median ready | 494 ms | 505 ms |
| Median reflections/textures | 78 ms | 66.6 ms |
| Median product geometry | 30.8 ms | 35.6 ms |
| Median shader precompile elapsed | 23.9 ms | 29 ms |
| Median yielded view warm-up elapsed | 39.2 ms | 42.5 ms |
| Median first visible render CPU submission | 14.9 ms | 16 ms |

There is no demonstrated startup speed gain. Product refinement adds a small preparation cost. Compilation/warm-up phase durations include asynchronous waiting; they are not GPU execution timings. The first candidate-origin visit in the normal comparison reported 2,726 ms to ready. The baseline had already been visited before its recorded 963 ms load. These are **not matched cold-cache measurements**. Controlled cold startup remains NOT VERIFIED. Warm movement is measured separately above. [All startup samples](evidence/sprint-03-1/warm-startups.json)

A separate candidate desktop profile recorded a 1,000 ms native callback gap while visible and focused, with 14 heartbeat ticks and zero overlapping long tasks of at least 50 ms. Frame-handler work p95 was 9.2 ms, CPU render submission p95 9 ms, and the maximum submission gap 133 ms. The startup's longest task was 99 ms, with shader precompile elapsed 24.4 ms. Native delivery was the immediate observed bottleneck. Basic Render identifies the software backend; it does not conclusively explain the precise one-second scheduling pattern. [Native profile](evidence/sprint-03-1/profile-native.json)

### Recovery, interruption and idle checks

The deliberate one-Hz frame-source run exercised the real production scheduler. It submitted 83 recovery frames, observed only three native callbacks, and reported a 48 ms submission p95/max in this software-rendered browser. The configured 32 ms timer is a requested delay, not a guaranteed screen refresh rate.

Opening the basket paused that journey at camera pose `0.144,1.660,2.381`. The pose and frame counter 53 remained unchanged for 25,226 ms. Closing it resumed and completed the route with one pause recorded. Its 30.266 s wall time includes the deliberate modal pause and is excluded from performance comparisons. After arrival the frame counter remained 85 and the pose stayed unchanged for another 40,300 ms. Escape restored focus to `basket-open`.

A normal native-frame walkthrough also retargeted an active camera journey to the headphones and arrived correctly. Skip motion completed an active doorway route in one explicit render. The direct production-scheduler tests additionally cover stale callbacks after cancellation, native/timer deduplication, focus eligibility and 60 seconds of simulated idle time.

These checks verify scheduler ownership and absence of continuous idle rendering. They do not measure battery consumption or compositor presentation under recovery. [Pause](evidence/sprint-03-1/recovery-paused.json) · [Resume/idle start](evidence/sprint-03-1/recovery-resumed.json) · [Idle confirmation and journey](evidence/sprint-03-1/journey-basket.json) · [Retarget and skip](evidence/sprint-03-1/interruptions.json)

## Functional, mobile and accessibility verification

Clean `npm ci --include=dev`, `npm test`, `npm run build`, `npm audit` and `git diff --check` passed. Node 24.22.1 / npm 11.9.0 were used locally. Vite 7.3.8 produced the deployment. All **24 Node tests passed**, including 13 additions. The navigation test checks 121 destination pairs plus sampled route clearance around glass, islands, benches and rear planters. No dependencies changed. [Test output](evidence/sprint-03-1/tests.txt)

The five-width flow entered the shop, inspected and added each concept product, changed the watch angle, returned to the showroom and exited to the concourse. Reduced motion was enabled for this repeated layout/functional matrix. Separate animated desktop and 390 px journeys exercised the normal camera transitions.

| CSS viewport | Observed showroom cards, y | Watch cards, y | Horizontal overflow |
| --- | --- | --- | --- |
| 360 × 800 | 455–544 | 618–707 | None |
| 390 × 844 | 477–566 | 643–732 | None |
| 430 × 932 | 535–623 | 677–765 | None |
| 768 × 1024 | 642–706 | 742–806 | None |
| 1440 × 900 | 799–863 | 769–833 | None |

Coordinates reflect each observed scroll/focus state, including the app's scene alignment; they are not claims of a fixed page-top position. All three cards fit in the visible height at each recorded state. Mobile header, movement, add, back and angle controls retained at least 44 px dimensions. At 390 px the projected watch hotspot measured 44 × 44 px. A coordinate-based pointer click reached the watch in 2.466 s; dragging left across the canvas reached its right three-quarter view. These were desktop Chrome viewport and mouse/pointer tests, **not physical touch or mobile-browser testing**.

| Browser check | Actual observation |
| --- | --- |
| Spatial navigation | Entered through the doorway and reached all three stations without observed wall/furniture clipping. Keyboard W moved z from −1.110 to −1.284 m. Front product journeys took 1.942, 1.529 and 1.566 s in the desktop walkthrough. |
| Product presentation | Front and right three-quarter screenshots inspected for all three products. Watch face and camera lens details are larger and more legible. No added overlay covers the product centre. |
| Basket | Added all three at quantity 1. Camera quantity increased to 2, decreased to 1, and headphones were removed. Watch and camera at quantity 1 survived reload. Storage was available; the session-only notice was hidden. |
| Scene restoration | Continue exploring returned to the exact same camera pose. Escape restored basket-button focus. Checkout remained disabled and explicitly demonstration-only. |
| Keyboard and focus | Enter selected products and angles. Native dialog Escape and focus restoration worked. Repeated reduced-motion routes used one explicit rendered frame. OS media-query handling remains in source; an OS-level preference toggle was not tested. |
| Arabic RTL | At 360 px, Arabic names, descriptions, details, header controls and three mirrored cards fit with no horizontal overflow. Enter expanded details and selected the left viewpoint. Angle 0 remained the spatial left pose at x = −0.611 m. Basket focus restored correctly. |
| Console before fallback | No captured warnings or errors in the regular 3D, basket and RTL checks. |

Accessible names, semantic product descriptions, native details/dialog behavior, disabled checkout and focus restoration were inspected. This is an accessibility basics check, not a WCAG conformance or screen-reader certification. Physical iPhone/Android touch, Safari, VoiceOver/TalkBack, high-DPR appearance and thermal behavior are NOT VERIFIED.

One mobile automation attempt used an incorrect dialog-close selector, and one large-width batch timed out after its successful 430/768 px checks. Both were inspected and corrected; the full 1440 px flow was rerun successfully. The raw logs retain these automation errors. They are not counted as successful first-attempt test runs or application runtime errors.

[Small widths](evidence/sprint-03-1/responsive-small.json) · [430/768 px](evidence/sprint-03-1/responsive-large.json) · [1440 px rerun](evidence/sprint-03-1/responsive-desktop.json) · [Pointer interaction](evidence/sprint-03-1/mobile-pointer.json) · [Basket](evidence/sprint-03-1/basket-results.json) · [RTL and focus](evidence/sprint-03-1/rtl-accessibility.json)

Catalogue mode passed at 360 px: the skip link focused `object-index`, Enter selected all three products, and angle controls were hidden. The opt-in `?profile=1&webgl=unavailable` check intentionally acquired a different canvas context type, then reached the normal renderer-creation failure handler. It displayed the catalogue, opened watch details and retained the persisted demo basket. The three captured Three.js context-creation errors belong to this intentional failure test. [Fallback results](evidence/sprint-03-1/fallback.json) · [Catalogue screenshot](evidence/sprint-03-1/after-catalogue.jpg) · [WebGL failure screenshot](evidence/sprint-03-1/after-webgl-fallback.jpg)

## Deployment and the unrelated root project

The dedicated showroom Preview is READY, uses root `experiences/beyond-reality-technology-showroom`, installs with `npm ci --include=dev`, builds with `npm run build` and outputs `dist`. Node 24 is selected. The only sibling input is Phase A's catalogue JSON. No production target or alias was assigned.

All six served build files matched the local production build byte for byte, with SHA-256 values recorded. Their combined gzip size using the recorded local compression method is 163,294 bytes (159.5 KiB). Build logs include Vercel/npm environment, engines and install-script warnings; the clean install and production build succeeded. [Served asset hashes](evidence/sprint-03-1/served-assets.json) · [Build log](https://vercel.com/mohammed-ajmis-projects/beyond-reality-technology-showroom/5Rj5tZNcuGyGszbY1aFoimjKspDR)

The original Sprint 01, Sprint 02, Sprint 03 and Phase A deployment IDs remained READY, along with the unrelated production deployment. No deployment was deleted or overwritten, no main merge occurred, and no payment infrastructure was activated. [Preserved deployment evidence](evidence/sprint-03-1/preserved-deployments.json)

### Ownership, affected work and build failure

Read-only inspection places `files-mentioned-by-the-user-may` and the showroom under the authenticated **Mohammed Ajmi's projects** team, `team_jfqIapFvnvzWMaobnqMeMD0c`. Project ownership at team scope is confirmed; the tool did not expose an individual owner's administrative role.

The root project has a READY production deployment `dpl_7McaL1c33iw3rQghEB7hEGApCbQP`, associated with `main` and commit `46a0aa96f00e0ef3c57cb5fc027f9f0111e8f693`. Its public alias [files-mentioned-by-the-user-may-livid.vercel.app](https://files-mentioned-by-the-user-may-livid.vercel.app/) returned HTTP 200 with title **THE GOLDEN CAMEL | Mohammed Ajmi**. It therefore serves unrelated work and must be preserved. Fetching that production source commit through the repository connector returned 404, so its source equivalence with the current root application is not established.

The inspected 35 recent root previews were ERROR deployments across showroom Sprint 02/03, original Technology, Phase A and earlier mall-development branches. The latest inspected failure on Sprint 03 documentation commit `2e2cd62`, deployment `dpl_AHj3c1nZmdr6DhBxqq6ZN1KkkSb7`, runs repository-root `obsidian-essence@1.0.0`, then `vite build`, and fails at `/vercel/path0/node_modules/.bin/vite: Permission denied`, exit 126. Git records that root launcher with mode `100644`. The showroom's clean dependency installation and build are independent of that tracked root launcher.

The new Sprint 03.1 branch also triggered the existing root integration: `dpl_HFZjwFe49c4CnUbto413EX6L3nwT` is ERROR on implementation commit `a336e20`. Its build repeats the same root Vite permission failure. The dedicated showroom is separately READY on that commit. [Final project/branch check and root build events](evidence/sprint-03-1/final-deployment-check.json)

### Validated proposal, not applied

Sprint 03's branch-only Ignored Build Step would suppress every root preview on matching showroom sprint branches, even if a commit changed root application files. It leaves other earlier branch families unaffected. That is broader than a safe file-scoped policy.

The revised [proposal script](proposed-ignore-root-preview.sh) skips only a matching **Preview** when the complete diff since `VERCEL_GIT_PREVIOUS_SHA` contains no files outside the showroom directory. Shared Phase A data changes, root changes, unknown environments, other branches and unavailable history all request a build. It compares the complete range so an earlier unbuilt root change cannot be hidden by a later showroom-only commit.

Vercel defines that variable as the previous successful deployment for the same project and branch. Consequently, the conservative proposal **will not silence a first-time or never-successful showroom branch by itself**. Missing or shallow history fails open. The project owner must approve a trusted initial comparison policy or separate branch exclusion if those first-branch failures are to be suppressed. This limitation is intentional and documented. The shell regression uses a temporary Git repository to verify these outcomes, including multiple unbuilt commits.

Possible owner-approved setting: `sh experiences/beyond-reality-technology-showroom/docs/proposed-ignore-root-preview.sh`, run from the repository root. **No setting was applied to the unrelated project.** Repair of its tracked dependencies also belongs in a separate owner-approved root-application change.

[Vercel ignored-build semantics](https://vercel.com/kb/guide/how-do-i-use-the-ignored-build-step-field-on-vercel) · [Previous successful SHA](https://vercel.com/docs/environment-variables/system-environment-variables#vercel_git_previous_sha) · [Read-only deployment audit and candidate build events](evidence/sprint-03-1/deployment-audit.json)

## Visual evidence

[Product comparison montage](evidence/sprint-03-1/product-comparison.jpg) · [Responsive comparison](evidence/sprint-03-1/responsive-comparison.jpg)

| View | Exact Sprint 03 before | Sprint 03.1 after |
| --- | --- | --- |
| Entrance, desktop | [Before](evidence/sprint-03-1/before-entrance-desktop.jpg) | [After](evidence/sprint-03-1/after-entrance-desktop.jpg) |
| Showroom, desktop | [Before](evidence/sprint-03-1/before-showroom-desktop.jpg) | [After](evidence/sprint-03-1/after-showroom-desktop.jpg) |
| Headphones, front / right | [Front](evidence/sprint-03-1/before-headphones-front.jpg) / [Right](evidence/sprint-03-1/before-headphones-right.jpg) | [Front](evidence/sprint-03-1/after-headphones-front.jpg) / [Right](evidence/sprint-03-1/after-headphones-right.jpg) |
| Watch, front / right | [Front](evidence/sprint-03-1/before-watch-front.jpg) / [Right](evidence/sprint-03-1/before-watch-right.jpg) | [Front](evidence/sprint-03-1/after-watch-front.jpg) / [Right](evidence/sprint-03-1/after-watch-right.jpg) |
| Camera, front / right | [Front](evidence/sprint-03-1/before-camera-front.jpg) / [Right](evidence/sprint-03-1/before-camera-right.jpg) | [Front](evidence/sprint-03-1/after-camera-front.jpg) / [Right](evidence/sprint-03-1/after-camera-right.jpg) |
| 390 px watch | [Before](evidence/sprint-03-1/before-watch-mobile.jpg) | [After](evidence/sprint-03-1/after-watch-mobile.jpg) |

Additional evidence: [360 px](evidence/sprint-03-1/after-360-watch.jpg), [430 px](evidence/sprint-03-1/after-430-watch.jpg), [768 px](evidence/sprint-03-1/after-768-watch.jpg), [1440 px](evidence/sprint-03-1/after-1440-watch.jpg), [Arabic details](evidence/sprint-03-1/after-rtl.jpg), [basket](evidence/sprint-03-1/after-basket.jpg).

## Release decision and remaining work

**CONDITIONAL PASS.** Implementation, build, spatial navigation, basket, available responsive/RTL/keyboard checks and fallback verification pass. No critical application regression was observed in those checks. This is a review candidate, with the performance/device gate still open.

| Gate | Status |
| --- | --- |
| 24 automated tests, clean dependency installation, production build and served files | PASS |
| Available desktop/phone-width journey, all products, basket, keyboard/RTL and fallback checks | PASS within the recorded browser scope |
| Scheduler cancellation, modal pause and no continuous idle rendering | PASS in production-module tests and the recorded browser checks |
| Desktop p95 ≤33 ms on hardware acceleration | NOT VERIFIED; software-rendered sample is 50 ms native / 51 ms submission median |
| Mobile p95 ≤50 ms on actual devices | NOT VERIFIED; phone-width median is 17 / 18 ms, with one 52 ms submission-p95 entry |
| No unexplained foreground presentation stall above 250 ms | NOT VERIFIED; one-second native gaps persist |
| Physical devices, controlled cold cache, GPU/GC/compositor attribution | NOT VERIFIED |

| Severity | Outstanding issue | Required next evidence/action |
| --- | --- | --- |
| High: release gate | One-second native gaps remain; desktop sample misses the 33 ms target. Compositor presentation and hardware GPU performance are unverified. | Matched foreground hardware-accelerated traces, including timer-recovery presentation. |
| Medium | Physical iPhone/Android touch, Safari, high DPR, thermal/battery behavior and screen-reader testing are unverified. | Complete the same journey on actual devices and record device/browser details. |
| Medium | Controlled cold-cache startup and GC/GPU attribution are unavailable in the present browser tools. | Cold reload and separate warm-route DevTools recordings. |
| Low | Root-project Preview checks continue to fail. Conservative first-branch filtering needs an owner decision. | Review the proposal and root dependency repair separately; preserve its live Golden Camel production site. |
| Low | Focus-driven scrolling can partly crop the desktop header or the mobile scene heading. Products and primary inspection controls remained usable in the recorded views. | Refine scroll alignment across keyboard focus, details expansion and RTL. |
| Low: visual scope | Static contact/reflection approximations and original procedural concept meshes remain visible limitations. | Review on a real GPU/high-DPR screen before considering higher-cost assets or lighting. |

The interface keeps the six-step journey in one scene: doorway, three visible choices, useful product views, nearby add/return controls and a resumable demo basket. The clearer product scale/composition and scheduler safeguards are concrete improvements. The evidence does not support a full performance PASS or expansion to a second shop yet.

## Reproduce the remaining acceptance runs

1. Use a desktop with a functioning GPU driver. Record machine/CPU/GPU model, OS and driver version, Chrome version, refresh rate, DPR, zoom, viewport and power/thermal state. Verify WebGL and compositing acceleration on `chrome://gpu`; a software renderer is not a hardware acceptance run.
2. Compare the exact two preview URLs above in one foreground browser under the same conditions. Use 1440 × 900 and 390 × 844 CSS viewports. Disable CPU/network throttling. Keep the tab visible and focused.
3. In Chrome DevTools Performance, record a cache-disabled cold reload of each origin. Then re-enable the intended cache condition, allow startup to settle, and record at least three warm entries and visits to every product station separately. Inspect Frames, Main, GC, shader work, compositor and GPU tracks around any interval above 250 ms. [Chrome Performance reference](https://developer.chrome.com/docs/devtools/performance/reference)
4. Use the plain URLs for paired cadence measurements. In separate `?profile=1` runs, inspect the stage's `data-profile` JSON and `data-travel-*` metrics. Native timing and render submission timing remain distinct; neither alone proves display presentation. GPU query availability is optional and an unavailable or disjoint result must remain null.
5. On the candidate, use `?profile=1&frames=slow` only for a deliberate recovery test. Open/close the basket during travel, retarget, skip and enable reduced motion. Check that idle frame counts stop and that the actual displayed motion remains comfortable. Exclude this simulated source from acceptance statistics.
6. Run the journey on a physical iPhone with Safari Web Inspector and a physical Android device with Chrome remote debugging. Test tap targets, horizontal inspection gestures, scrolling, basket persistence/quantities, return position, RTL, device reduced motion, VoiceOver/TalkBack and WebGL failure/catalogue operation. Record actual device and browser identity; CSS viewport overrides do not substitute for this.
7. Award full PASS only after desktop p95 ≤33 ms and mobile p95 ≤50 ms under matched hardware conditions, no unexplained foreground freeze above 250 ms, and all required mobile/accessibility checks pass. Obtain approval for this quality gate before starting another shop.
