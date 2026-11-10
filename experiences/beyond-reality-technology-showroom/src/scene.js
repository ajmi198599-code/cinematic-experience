import * as THREE from 'three';
import { buildConcourse, buildFixtures, buildShowroom, buildStorefront } from './building.js';
import { batchStatic, kit, palette } from './materials.js';
import { buildProducts } from './products.js';
import { DISPLAYS, ENTRY_MARKER, EYE_HEIGHT, VIEWS, isClearSegment, planRoute, sampleRoute } from './world.js';

const clamp = THREE.MathUtils.clamp;
const lerp = THREE.MathUtils.lerp;
const halfTurn = Math.PI;
const angleDelta = (from, to) => THREE.MathUtils.euclideanModulo(to - from + halfTurn, 2 * halfTurn) - halfTurn;
const eased = t => (1 - Math.cos(Math.PI * t)) * 0.5;
const xz = ({ x, z }) => [x, z];

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
  const target = generator.fromScene(studio, 0.04, 0.1, 25, { size: 128 });
  studio.traverse(object => object.material?.dispose());
  geometry.dispose();
  generator.dispose();
  return target;
}

function lightProducts(scene) {
  scene.add(new THREE.HemisphereLight(0xfff6e7, 0xa6a69a, 1.62));
  const sunlight = new THREE.DirectionalLight(0xfff2dc, 2.0);
  sunlight.position.set(-3.6, 13.4, 7.8);
  const softbox = new THREE.DirectionalLight(0xe6e7db, 0.81);
  softbox.position.set(3.5, 4.5, -6.5);
  scene.add(sunlight, softbox);
}

export async function createShowroom(canvas, viewport, callbacks, reducedMotion) {
  const renderer = new THREE.WebGLRenderer({
    canvas, antialias: false, alpha: false, powerPreference: 'high-performance',
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.03;
  const context = renderer.getContext();
  const debug = context.getExtension('WEBGL_debug_renderer_info');
  const graphics = debug ? context.getParameter(debug.UNMASKED_RENDERER_WEBGL) : '';
  const software = /swiftshader|llvmpipe|software/i.test(graphics);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xc8bdac);
  const environment = reflectionRoom(renderer);
  scene.environment = environment.texture;
  scene.environmentIntensity = 0.61;
  lightProducts(scene);
  const root = new THREE.Group();
  const k = kit(root);
  const materials = palette();
  buildConcourse(root, k, materials);
  buildStorefront(k, materials);
  buildShowroom(root, k, materials);
  buildFixtures(k, materials);
  buildProducts(root, k, materials);
  batchStatic(root);
  scene.add(root);

  const camera = new THREE.PerspectiveCamera(VIEWS.concourse.fov, 1, 0.032, 45);
  camera.rotation.order = 'YXZ';
  camera.position.set(...VIEWS.concourse.position);
  let { yaw, pitch } = viewAngles(VIEWS.concourse);
  let lens = VIEWS.concourse.fov;
  let size = [0, 0, 0];
  let width = viewport.clientWidth;
  let height = viewport.clientHeight;
  let frame = 0;
  let frameCount = 0;
  let previousTime = 0;
  let travel = null;
  let pointer = null;
  let failed = false;
  let transitioningToEye = false;
  const held = new Map();
  const ray = new THREE.Raycaster();
  const planePointer = new THREE.Vector2();
  const projection = new THREE.Vector3();
  const hitPoint = new THREE.Vector3();
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

  function requestDraw() {
    if (!frame && !failed) frame = requestAnimationFrame(draw);
  }

  function updateLens() {
    const narrow = clamp((1.18 - camera.aspect) * 49, 0, 17);
    camera.fov = lens + narrow * clamp((lens - 39) / 18, 0, 1);
    camera.updateProjectionMatrix();
  }

  function resize(moving = false) {
    if (!width || !height) return;
    const budget = moving ? (software ? 180000 : 390000) : 1050000;
    const dpr = devicePixelRatio * (moving ? 1 : 1.18);
    const pixelRatio = Math.min(dpr, width < 620 ? 1.55 : 1.42, Math.sqrt(budget / (width * height)));
    if (size[0] === width && size[1] === height && size[2] === pixelRatio) return;
    size = [width, height, pixelRatio];
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    updateLens();
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

  function render() {
    resize(Boolean(travel || held.size));
    camera.rotation.set(pitch, yaw, 0, 'YXZ');
    renderer.render(scene, camera);
    const anchors = {};
    for (const [id, point] of Object.entries(markers)) {
      projection.set(...point).project(camera);
      const x = 0.5 + projection.x * 0.5;
      const y = 0.5 - projection.y * 0.5;
      if (projection.z > -1 && projection.z < 1 && x > 0.085 && x < 0.915 && y > 0.12 && y < 0.78) anchors[id] = [x, y];
    }
    const { x, y, z } = camera.position;
    callbacks.onFrame({
      x, y, z, yaw, pitch, anchors, moving: Boolean(travel), frameCount: ++frameCount,
      draws: renderer.info.render.calls, triangles: renderer.info.render.triangles, software,
    });
  }

  function draw(now) {
    frame = 0;
    const dt = Math.min(0.05, (now - previousTime) / 1000 || 0.016);
    previousTime = now;
    let arrival = null;
    if (travel) {
      const progress = clamp((now - travel.started) / travel.duration, 0, 1);
      if (travel.lastFrame) travel.intervals.push(now - travel.lastFrame);
      travel.lastFrame = now;
      const t = eased(progress);
      const [x, z] = travel.route.at(t);
      camera.position.set(x, lerp(travel.y, travel.view.position[1], t), z);
      yaw = travel.yaw + travel.turn * t;
      pitch = lerp(travel.pitch, travel.targetPitch, t);
      lens = lerp(travel.fov, travel.view.fov, t);
      updateLens();
      if (progress >= 1) {
        arrival = travel;
        travel = null;
      }
    } else if (held.size || transitioningToEye) {
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
    render();
    if (arrival) {
      const intervals = arrival.intervals.sort((a, b) => a - b);
      callbacks.onArrive(arrival.destination, {
        ms: Math.round(now - arrival.started), frames: intervals.length + 1,
        p95: Math.round(intervals[Math.floor((intervals.length - 1) * 0.95)] ?? 0),
      });
    }
    if (travel || held.size || transitioningToEye) requestDraw();
  }

  function go(view, destination) {
    const routePoints = planRoute(xz(camera.position), [view.position[0], view.position[2]]);
    if (!routePoints) return false;
    const route = sampleRoute(routePoints);
    const angles = viewAngles(view);
    transitioningToEye = false;
    held.clear();
    if (reducedMotion) {
      travel = null;
      setView(view);
      render();
      callbacks.onArrive(destination, { ms: 0, frames: 1, p95: 0 });
      return true;
    }
    travel = {
      route, destination, view, intervals: [], started: performance.now(),
      duration: clamp(470 + route.length * 295, 540, 3950),
      y: camera.position.y, yaw, pitch, fov: lens,
      turn: angleDelta(yaw, angles.yaw), targetPitch: angles.pitch,
    };
    requestDraw();
    return true;
  }

  function resumeWalking() {
    travel = null;
    transitioningToEye = true;
    callbacks.onManual(camera.position.z < 0 ? 'showroom' : 'concourse');
    requestDraw();
  }

  function press(direction, token, repeat = false) {
    if (failed || held.has(token)) return;
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
  window.addEventListener('blur', resetInput);
  document.addEventListener('visibilitychange', resetInput);
  const observer = new ResizeObserver(([entry]) => {
    if (failed) return;
    width = Math.round(entry.contentRect.width);
    height = Math.round(entry.contentRect.height);
    requestDraw();
  });

  canvas.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0) return;
    viewport.focus({ preventScroll: true });
    pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, distance: 0 };
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointermove', event => {
    if (pointer?.id !== event.pointerId) return;
    const dx = event.clientX - pointer.x;
    const dy = event.clientY - pointer.y;
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    const previous = pointer.distance;
    pointer.distance += Math.hypot(dx, dy);
    if (pointer.distance < 5 || !callbacks.canLook()) return;
    if (previous < 5) resumeWalking();
    yaw += dx * 0.0039;
    pitch = clamp(pitch + dy * 0.0039, -0.82, 0.76);
    requestDraw();
  });
  canvas.addEventListener('pointerup', event => {
    if (pointer?.id !== event.pointerId) return;
    const tap = pointer.distance < 5;
    pointer = null;
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
  });
  canvas.addEventListener('pointercancel', () => { pointer = null; });
  canvas.addEventListener('lostpointercapture', () => { pointer = null; });
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    failed = true;
    cancelAnimationFrame(frame);
    observer.disconnect();
    resetInput();
    callbacks.onUnavailable();
  }, { once: true });

  resize();
  await renderer.compileAsync(scene, camera);
  if (failed) throw new Error('The 3D context was lost during setup.');
  render();
  observer.observe(viewport);
  return {
    go,
    press,
    release(token) {
      if (held.delete(token)) requestDraw();
    },
    setReducedMotion(value) {
      reducedMotion = value;
      if (value && travel) go(travel.view, travel.destination);
    },
  };
}
