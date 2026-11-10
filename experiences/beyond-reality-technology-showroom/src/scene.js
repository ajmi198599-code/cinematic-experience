import * as THREE from 'three';
import { buildConcourse, buildFixtures, buildShowroom, buildStorefront } from './building.js';
import { batchStatic, kit, palette } from './materials.js';
import { buildProducts } from './products.js';
import { cameraStep, routeDuration, routeProgress, STALL_MS, summarizeTravel, walkingStep } from './motion.js';
import { createProfile } from './profile.js';
import { DISPLAYS, ENTRY_MARKER, EYE_HEIGHT, VIEWS, inspectionView, isClearSegment, planRoute, sampleRoute } from './world.js';

const clamp = THREE.MathUtils.clamp;
const lerp = THREE.MathUtils.lerp;
const halfTurn = Math.PI;
const angleDelta = (from, to) => THREE.MathUtils.euclideanModulo(to - from + halfTurn, 2 * halfTurn) - halfTurn;
const xz = ({ x, z }) => [x, z];
const yieldWork = () => typeof scheduler !== 'undefined' && scheduler.yield
  ? scheduler.yield() : new Promise(resolve => setTimeout(resolve, 0));

function viewAngles({ position, look }) {
  const dx = look[0] - position[0];
  const dy = look[1] - position[1];
  const dz = look[2] - position[2];
  return { yaw: Math.atan2(-dx, -dz), pitch: Math.atan2(dy, Math.hypot(dx, dz)) };
}

function reflectionRoom(renderer) {
  const studio = new THREE.Scene();
  studio.background = new THREE.Color(0xb3aaa0);
  const geometry = new THREE.PlaneGeometry();
  const panels = [
    { at: [-2.4, 3.8, 0], size: [7.4, 4.4], color: [3.1, 2.9, 2.55] },
    { at: [1.7, 3.8, -3.5], size: [2.4, 6.4], color: [2.85, 2.65, 2.2] },
    { at: [3.6, 0.8, 0.9], size: [3.8, 2.7], color: [1.16, 1.21, 1.19] },
    { at: [-0.4, 1.3, 4.6], size: [3.1, 3.8], color: [1.6, 1.72, 1.82] },
  ];
  for (const { at, size, color } of panels) {
    const panel = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
      color: new THREE.Color(...color), side: THREE.DoubleSide, toneMapped: false,
    }));
    panel.position.set(...at);
    panel.scale.set(...size, 1);
    panel.lookAt(0, 0, 0);
    studio.add(panel);
  }
  const generator = new THREE.PMREMGenerator(renderer);
  const target = generator.fromScene(studio, 0.04, 0.1, 25, { size: 64 });
  studio.traverse(object => object.material?.dispose());
  geometry.dispose();
  generator.dispose();
  return target;
}

function lightProducts(scene) {
  scene.add(new THREE.HemisphereLight(0xf1f4ee, 0xb1a18d, 1.22));
  const sunlight = new THREE.DirectionalLight(0xffebd0, 2.2);
  sunlight.position.set(-3.9, 9.4, 3.8);
  const softbox = new THREE.DirectionalLight(0xe0ecf0, 0.75);
  softbox.position.set(4.4, 5.2, -5.8);
  scene.add(sunlight, softbox);
}

export async function createShowroom(canvas, viewport, callbacks, reducedMotion) {
  let phase = performance.now();
  const renderer = new THREE.WebGLRenderer({
    canvas, antialias: false, alpha: false, powerPreference: 'default',
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  const profile = createProfile(viewport);
  const context = renderer.getContext();
  const debug = context.getExtension('WEBGL_debug_renderer_info');
  const graphics = debug ? context.getParameter(debug.UNMASKED_RENDERER_WEBGL) : '';
  const software = /swiftshader|llvmpipe|software/i.test(graphics);
  const graphicsMode = !graphics ? 'unverified' : software ? 'software' : 'reported';
  profile?.phase('webgl-context', phase);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xc8bdac);
  phase = performance.now();
  const environment = reflectionRoom(renderer);
  scene.environment = environment.texture;
  scene.environmentIntensity = 0.74;
  lightProducts(scene);
  const materials = palette();
  profile?.phase('reflection-and-textures', phase);
  await yieldWork();
  phase = performance.now();
  const concourse = new THREE.Group();
  const interior = new THREE.Group();
  const outside = kit(concourse);
  const inside = kit(interior);
  buildConcourse(concourse, outside, materials);
  buildStorefront(outside, materials);
  batchStatic(concourse);
  profile?.phase('concourse-geometry', phase);
  await yieldWork();
  phase = performance.now();
  buildShowroom(interior, inside, materials);
  buildFixtures(inside, materials);
  batchStatic(interior);
  const zones = [concourse, interior].map(group => ({ group, bounds: new THREE.Box3().setFromObject(group) }));
  profile?.phase('showroom-geometry', phase);
  await yieldWork();
  phase = performance.now();
  const models = buildProducts(inside, materials);
  scene.add(concourse, interior);
  for (const { close, distant } of models) scene.add(close, distant);
  scene.updateMatrixWorld(true);
  scene.matrixWorldAutoUpdate = false;
  profile?.phase('product-geometry', phase);

  const camera = new THREE.PerspectiveCamera(VIEWS.concourse.fov, 1, 0.032, 45);
  camera.rotation.order = 'YXZ';
  camera.position.set(...VIEWS.concourse.position);
  let { yaw, pitch } = viewAngles(VIEWS.concourse);
  let lens = VIEWS.concourse.fov;
  let bufferDirty = false;
  let bufferPixels = 0;
  let bufferChanges = 0;
  let quality = 1;
  let nextQuality = quality;
  let slowFrames = 0;
  let lastPublish = -Infinity;
  let width = viewport.clientWidth;
  let height = viewport.clientHeight;
  let frame = 0;
  let frameCount = 0;
  let previousTime = null;
  let previousCallback = 0;
  let travel = null;
  let pointer = null;
  let failed = false;
  let modalOpen = false;
  let transitioningToEye = false;
  const held = new Map();
  const ray = new THREE.Raycaster();
  const frustum = new THREE.Frustum();
  const viewProjection = new THREE.Matrix4();
  const listeners = new AbortController();
  const planePointer = new THREE.Vector2();
  const projection = new THREE.Vector3();
  const hitPoint = new THREE.Vector3();
  const routePoint = [0, 0];
  const pickBounds = DISPLAYS.map(({ id, x, z, width, depth, markerY }) => ({
    id, bounds: new THREE.Box3(
      new THREE.Vector3(x - width / 2, 0, z - depth / 2),
      new THREE.Vector3(x + width / 2, markerY, z + depth / 2),
    ),
  }));
  const markers = Object.fromEntries([
    ['entry', ENTRY_MARKER],
    ...DISPLAYS.map(({ id, x, z, markerY }) => [id, [x, markerY, z + 0.24]]),
  ]);

  function paused() {
    return document.hidden || modalOpen;
  }

  function requestDraw() {
    if (!frame && !failed && !paused()) frame = requestAnimationFrame(draw);
  }

  function updateLens(force = false) {
    const narrow = clamp((1.18 - camera.aspect) * 49, 0, 17);
    const fov = lens + narrow * clamp((lens - 39) / 18, 0, 1);
    if (!force && camera.fov === fov) return;
    camera.fov = fov;
    camera.updateProjectionMatrix();
  }

  function resize() {
    if (!width || !height) return;
    const budget = software ? 145000 : width < 620 ? 230000 : graphics ? 360000 : 300000;
    const ratio = Math.min(devicePixelRatio * 1.14, 1.65, Math.sqrt(budget * quality / (width * height)));
    renderer.setDrawingBufferSize(width, height, ratio);
    bufferDirty = false;
    bufferPixels = canvas.width * canvas.height;
    bufferChanges++;
    camera.aspect = width / height;
    updateLens(true);
  }

  function setView(view) {
    camera.position.set(...view.position);
    ({ yaw, pitch } = viewAngles(view));
    lens = view.fov;
    updateLens();
  }

  function advance(distance, lateral, forward) {
    const magnitude = Math.hypot(lateral, forward);
    if (!magnitude) return;
    const x = (Math.cos(yaw) * lateral - Math.sin(yaw) * forward) * distance / magnitude;
    const z = (-Math.sin(yaw) * lateral - Math.cos(yaw) * forward) * distance / magnitude;
    const from = xz(camera.position);
    const to = [from[0] + x, from[1] + z];
    if (isClearSegment(from, to)) {
      [camera.position.x, camera.position.z] = to;
      return;
    }
    if (isClearSegment(from, [to[0], from[1]])) camera.position.x = to[0];
    if (isClearSegment(xz(camera.position), [camera.position.x, to[1]])) camera.position.z = to[1];
  }

  function render(now, publish, warming = false) {
    if (bufferDirty) resize();
    camera.rotation.set(pitch, yaw, 0, 'YXZ');
    camera.updateMatrixWorld(true);
    frustum.setFromProjectionMatrix(viewProjection.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));
    for (const { group, bounds } of zones) group.visible = frustum.intersectsBox(bounds);
    const { x, y, z } = camera.position;
    for (const model of models) {
      const distance = (x - model.x) ** 2 + (z - model.z) ** 2;
      const visible = frustum.intersectsBox(model.bounds);
      model.near = distance < (model.near ? 5.8 : 4.8);
      model.close.visible = visible && model.near;
      model.distant.visible = visible && !model.near;
    }
    const before = performance.now();
    renderer.render(scene, camera);
    const cost = performance.now() - before;
    if (warming) return cost;
    frameCount++;
    if (publish || now - lastPublish >= 70) {
      lastPublish = now;
      const anchors = {};
      if (!travel) {
        const margin = Math.max(0.063, 24 / width);
        for (const [id, point] of Object.entries(markers)) {
          projection.set(...point).project(camera);
          const u = 0.5 + projection.x * 0.5;
          const v = 0.5 - projection.y * 0.5;
          if (projection.z > -1 && projection.z < 1 && u > margin && u < 1 - margin && v > 0.12 && v < 0.75) anchors[id] = [u, v];
        }
      }
      callbacks.onFrame({
        x, y, z, yaw, pitch, anchors, frameCount, bufferPixels, bufferChanges,
        draws: renderer.info.render.calls, triangles: renderer.info.render.triangles, graphics: graphicsMode,
      });
    }
    return cost;
  }

  function draw(now) {
    frame = 0;
    if (paused()) return;
    const frameStarted = profile ? performance.now() : 0;
    const gap = previousTime === null ? null : now - previousTime;
    const callbackGap = gap === null ? null : frameStarted - previousCallback;
    previousTime = now;
    previousCallback = frameStarted;
    const active = travel;
    let arrived = false;
    if (active) {
      if (active.renders === 0) active.initialWait = Math.max(0, now - active.started);
      if (gap !== null && active.renders) active.intervals.push(gap);
      if (gap >= STALL_MS && ++active.stalls === 2) callbacks.onDelay();
      active.renders++;
      active.clock = Math.min(active.duration, active.clock + (gap === null ? 0 : cameraStep(gap)));
      const t = routeProgress(active.clock / active.duration);
      const [x, z] = active.route.at(t, routePoint);
      camera.position.set(x, lerp(active.y, active.view.position[1], t), z);
      yaw = active.yaw + active.turn * t;
      pitch = lerp(active.pitch, active.targetPitch, t);
      lens = lerp(active.fov, active.view.fov, t);
      updateLens();
      arrived = active.clock >= active.duration;
      if (arrived) travel = null;
    } else if (held.size || transitioningToEye) {
      const dt = walkingStep(gap) / 1000;
      const directions = [...held.values()];
      const lateral = Number(directions.includes('right')) - Number(directions.includes('left'));
      const forward = Number(directions.includes('forward')) - Number(directions.includes('back'));
      if (held.size) advance(dt * 2.02, lateral, forward);
      if (transitioningToEye) {
        const amount = reducedMotion ? 1 : Math.min(dt * 11, 1);
        const targetFov = camera.position.z < 0 ? VIEWS.showroom.fov : VIEWS.concourse.fov;
        camera.position.y = lerp(camera.position.y, EYE_HEIGHT, amount);
        lens = lerp(lens, targetFov, amount);
        if (Math.abs(camera.position.y - EYE_HEIGHT) < 0.004 && Math.abs(lens - targetFov) < 0.12) {
          camera.position.y = EYE_HEIGHT;
          lens = targetFov;
          transitioningToEye = false;
        }
        updateLens();
      }
    }

    const moving = Boolean(travel || held.size || transitioningToEye);
    const cost = render(now, !moving);
    if (active) {
      active.renderCosts.push(cost);
      profile?.frame(now, gap, frameStarted, callbackGap);
      if (!arrived && gap !== null && gap < STALL_MS) {
        slowFrames = gap >= 39 || cost > 13 ? slowFrames + 1 : Math.max(0, slowFrames - 1);
        if (slowFrames >= 8 && nextQuality === quality && quality > 0.58) nextQuality *= 0.78;
      }
      if (arrived) {
        profile?.finish();
        callbacks.onArrive(active.destination, summarizeTravel(active, performance.now()));
      }
    }
    if (moving) requestDraw();
    else {
      previousTime = null;
      if (nextQuality !== quality) {
        quality = nextQuality;
        bufferDirty = true;
        requestDraw();
      }
    }
  }

  function complete(view, destination) {
    travel = null;
    profile?.cancel();
    previousTime = null;
    setView(view);
    render(performance.now(), true);
    callbacks.onArrive(destination, {
      ms: 0, frames: 1, p95: 0, activeP95: 0, max: 0, stalls: 0, pauses: 0, cameraMs: 0, renderP95: 0, initialWait: 0,
    });
  }

  function go(view, destination) {
    const routePoints = planRoute(xz(camera.position), [view.position[0], view.position[2]]);
    if (!routePoints || failed) return false;
    const route = sampleRoute(routePoints);
    const angles = viewAngles(view);
    transitioningToEye = false;
    held.clear();
    previousTime = null;
    slowFrames = 0;
    if (reducedMotion) {
      complete(view, destination);
      return true;
    }
    travel = {
      route, destination, view, intervals: [], renderCosts: [], started: performance.now(),
      clock: 0, renders: 0, pauses: 0, stalls: 0, duration: routeDuration(route.length),
      y: camera.position.y, yaw, pitch, fov: lens,
      turn: angleDelta(yaw, angles.yaw), targetPitch: angles.pitch,
    };
    profile?.begin(destination.id ?? destination.kind);
    requestDraw();
    return true;
  }

  function resumeWalking() {
    travel = null;
    profile?.cancel();
    transitioningToEye = true;
    callbacks.onManual(camera.position.z < 0 ? 'showroom' : 'concourse');
    requestDraw();
  }

  function press(direction, token, repeat = false) {
    if (failed || paused() || held.has(token)) return;
    resumeWalking();
    advance(0.14, Number(direction === 'right') - Number(direction === 'left'), Number(direction === 'forward') - Number(direction === 'back'));
    if (repeat) held.set(token, direction);
  }

  function resetInput() {
    if (held.size) {
      held.clear();
      requestDraw();
    }
    pointer = null;
  }
  function syncPause() {
    if (paused()) {
      if (frame && travel) travel.pauses++;
      cancelAnimationFrame(frame);
      frame = 0;
      previousTime = null;
      resetInput();
    } else {
      requestDraw();
    }
  }
  const { signal } = listeners;
  window.addEventListener('blur', resetInput, { signal });
  document.addEventListener('visibilitychange', syncPause, { signal });
  const observer = new ResizeObserver(([entry]) => {
    if (failed) return;
    const nextWidth = Math.round(entry.contentRect.width);
    const nextHeight = Math.round(entry.contentRect.height);
    if (width === nextWidth && height === nextHeight) return;
    width = nextWidth;
    height = nextHeight;
    bufferDirty = true;
    requestDraw();
  });

  canvas.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0 || paused()) return;
    viewport.focus({ preventScroll: true });
    pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, startX: event.clientX, startY: event.clientY, distance: 0, orbit: callbacks.isInspecting() };
    canvas.setPointerCapture(event.pointerId);
  }, { signal });
  canvas.addEventListener('pointermove', event => {
    if (pointer?.id !== event.pointerId) return;
    const dx = event.clientX - pointer.x;
    const dy = event.clientY - pointer.y;
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    const previous = pointer.distance;
    pointer.distance += Math.hypot(dx, dy);
    if (pointer.distance < 5 || pointer.orbit) return;
    if (previous < 5) resumeWalking();
    yaw += dx * 0.0039;
    pitch = clamp(pitch + dy * 0.0039, -0.82, 0.76);
    requestDraw();
  }, { signal });
  canvas.addEventListener('pointerup', event => {
    if (pointer?.id !== event.pointerId) return;
    const { distance: gesture, orbit, startX, startY } = pointer;
    pointer = null;
    const swipe = event.clientX - startX;
    if (orbit && Math.abs(swipe) >= 30 && Math.abs(swipe) > Math.abs(event.clientY - startY)) {
      callbacks.onOrbit(swipe < 0 ? 1 : -1);
      return;
    }
    const tap = gesture < 5;
    if (!tap || travel || camera.position.z >= -0.43) return;
    const box = canvas.getBoundingClientRect();
    planePointer.set(((event.clientX - box.left) / box.width) * 2 - 1, 1 - ((event.clientY - box.top) / box.height) * 2);
    ray.setFromCamera(planePointer, camera);
    let chosen = null;
    let distance = Infinity;
    for (const { id, bounds } of pickBounds) {
      const hit = ray.ray.intersectBox(bounds, hitPoint);
      if (!hit) continue;
      const depth = hit.distanceToSquared(camera.position);
      if (depth < distance) {
        chosen = id;
        distance = depth;
      }
    }
    if (chosen) callbacks.onPick(chosen);
  }, { signal });
  canvas.addEventListener('pointercancel', () => { pointer = null; }, { signal });
  canvas.addEventListener('lostpointercapture', () => { pointer = null; }, { signal });
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    failed = true;
    cancelAnimationFrame(frame);
    observer.disconnect();
    listeners.abort();
    resetInput();
    profile?.dispose();
    callbacks.onUnavailable();
  }, { once: true, signal });

  resize();
  phase = performance.now();
  await renderer.compileAsync(scene, camera);
  profile?.phase('shader-precompile', phase);
  phase = performance.now();
  // Submit visible buffers and textures at each stop before visitors reach them.
  renderer.setScissorTest(true);
  renderer.setScissor(0, 0, 4, 4);
  for (const view of [VIEWS.showroom, ...DISPLAYS.map(({ id }) => inspectionView(id))]) {
    if (failed || context.isContextLost()) throw new Error('The 3D context was lost during setup.');
    setView(view);
    render(0, false, true);
    await yieldWork();
  }
  renderer.setScissorTest(false);
  if (failed || context.isContextLost()) throw new Error('The 3D context was lost during setup.');
  profile?.phase('view-warmup', phase);
  phase = performance.now();
  setView(VIEWS.concourse);
  render(performance.now(), true);
  profile?.phase('first-visible-render', phase);
  profile?.ready({ graphics: graphicsMode, pixels: bufferPixels, draws: renderer.info.render.calls, triangles: renderer.info.render.triangles });
  observer.observe(viewport);
  return {
    go,
    press,
    release(token) {
      if (held.delete(token)) requestDraw();
    },
    skipJourney() {
      if (travel) complete(travel.view, travel.destination);
    },
    setModalOpen(value) {
      modalOpen = value;
      syncPause();
    },
    setReducedMotion(value) {
      reducedMotion = value;
      if (value && travel) complete(travel.view, travel.destination);
    },
  };
}
