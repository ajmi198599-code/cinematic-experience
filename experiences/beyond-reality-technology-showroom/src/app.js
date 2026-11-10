import './styles.css';
import { products } from './catalog.js';
import { copy } from './copy.js';
import { DISPLAYS, ROOM, VIEWS, inspectionView } from './world.js';

const $ = id => document.getElementById(id);
const stage = $('stage');
const controlsDialog = $('controls-dialog');
const reduceMotion = $('reduce-motion');
const systemMotion = matchMedia('(prefers-reduced-motion: reduce)');
const words = () => copy[language];
const initial = { kind: 'concourse' };
let language = 'en';
let current = initial;
let journey = null;
let scene;
let sceneStatus = 'loading';
let lastFrame = null;
let motionPreference = null;

const indexButtons = new Map();
const markers = new Map();
const angleButtons = [...document.querySelectorAll('[data-angle]')];
const movement = $('movement');
const entryHotspot = $('entry-hotspot');
const keyDirections = {
  ArrowLeft: 'left', a: 'left', ArrowUp: 'forward', w: 'forward',
  ArrowDown: 'back', s: 'back', ArrowRight: 'right', d: 'right',
};
const reduced = () => motionPreference ?? systemMotion.matches;
const symbol = (name, className = 'icon') => `<svg class="${className}" aria-hidden="true"><use href="#icon-${name}"/></svg>`;

for (const product of products) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'object-button';
  button.dataset.product = product.id;
  button.innerHTML = `
    <span class="object-icon-frame">${symbol(product.id, 'object-icon')}</span>
    <span class="object-copy"><span class="object-code"></span><span class="object-name"></span></span>
    ${symbol('out', 'icon direction-icon')}`;
  indexButtons.set(product.id, button);
  $('index-list').append(button);

  const marker = document.createElement('button');
  marker.type = 'button';
  marker.className = 'hotspot object-hotspot';
  marker.dataset.product = product.id;
  marker.textContent = product.number;
  marker.hidden = true;
  markers.set(product.id, marker);
  $('object-hotspots').append(marker);
}

function mapX(x) { return 130 + x * 14.3; }
function mapZ(z) { return 11 + (z + ROOM.depth) * 8.15; }
const wallX = mapX(ROOM.halfWidth);
const wallLeft = mapX(-ROOM.halfWidth);
const doorZ = mapZ(0);
const map = $('floor-plan');
map.innerHTML = `
  <rect x="1" y="1" width="258" height="144" rx="6" fill="#eee9dd" stroke="#d8cfbd"/>
  <path d="M${wallLeft} ${doorZ}V11H${wallX}V${doorZ}H${mapX(ROOM.doorHalf)}M${mapX(-ROOM.doorHalf)} ${doorZ}H${wallLeft}" fill="none" stroke="#797d6b" stroke-width="1.4"/>
  <path d="M${mapX(-ROOM.doorHalf)} ${doorZ}H${mapX(ROOM.doorHalf)}" stroke="#a88154" stroke-dasharray="3 3" stroke-width="1.3"/>
  <path d="M9 ${doorZ}H${wallLeft - 6}M${wallX + 6} ${doorZ}H251" stroke="#c6bdab" stroke-width="1"/>
  ${DISPLAYS.map(({ id, x, z, width, depth }, i) => `
    <g><rect id="map-${id}" class="map-table" x="${mapX(x) - 14.3 * width / 2}" y="${mapZ(z) - 6.2}" width="${14.3 * width}" height="${Math.max(12.4, depth * 8.15)}" rx="2"/>
    <text x="${mapX(x)}" y="${mapZ(z) + 2.8}">0${i + 1}</text></g>`).join('')}
  <g id="map-position"><circle r="5.4" fill="#32674c" stroke="#fbf9f3" stroke-width="1.6"/><path d="M0-11 3.1-7h-6.2Z" fill="#32674c"/></g>`;

function drawMap({ x, z, yaw = 0 }) {
  $('map-position').setAttribute('transform', `translate(${Math.min(250, Math.max(10, mapX(x)))},${Math.min(134, Math.max(9, mapZ(z)))}) rotate(${-yaw * 180 / Math.PI})`);
}

function moveHotspot(button, anchor) {
  const hidden = !anchor;
  if (button.hidden !== hidden) {
    if (!anchor && document.activeElement === button) stage.focus({ preventScroll: true });
    button.hidden = hidden;
  }
  if (!anchor) return;
  button.style.left = `${anchor[0] * 100}%`;
  button.style.top = `${anchor[1] * 100}%`;
}

function updateHotspots() {
  const anchors = sceneStatus === 'ready' && !journey ? lastFrame?.anchors ?? {} : {};
  moveHotspot(entryHotspot, current.kind === 'concourse' ? anchors.entry : null);
  for (const [id, button] of markers) moveHotspot(button, current.kind === 'showroom' ? anchors[id] : null);
}

function productById(id) {
  return products.find(product => product.id === id);
}

function destinationView(destination) {
  return destination.kind === 'inspect'
    ? inspectionView(destination.id, destination.angle)
    : VIEWS[destination.kind];
}

function travelText(destination) {
  const t = words();
  if (destination.kind === 'showroom') return t.entering;
  if (destination.kind === 'concourse') return t.returning;
  if (current.kind === 'inspect' && current.id === destination.id) return t.adjusting;
  return t.approaching(productById(destination.id).name[language]);
}

function translate() {
  const t = words();
  document.documentElement.lang = language;
  document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  document.title = `${t.shopName} · BEYOND REALITY`;
  document.querySelectorAll('[data-i18n]').forEach(node => { node.textContent = t[node.dataset.i18n]; });
  document.querySelectorAll('[data-label]').forEach(node => { node.setAttribute('aria-label', t[node.dataset.label]); });
  stage.setAttribute('aria-label', t.stageLabel);
  movement.setAttribute('aria-label', t.movementLabel);
  $('object-hotspots').setAttribute('aria-label', t.markersLabel);
  $('language').setAttribute('aria-label', t.switchLanguage);
  $('language').lang = language === 'en' ? 'ar' : 'en';
  $('language').textContent = language === 'en' ? 'عربي' : 'English';
  for (const product of products) {
    const name = product.name[language];
    const button = indexButtons.get(product.id);
    button.querySelector('.object-code').textContent = `${product.number} / ${product.code[language]}`;
    button.querySelector('.object-name').textContent = name;
    button.setAttribute('aria-label', t.inspectName(name));
    markers.get(product.id).setAttribute('aria-label', t.markerName(product.number, name));
  }
  updateUI();
}

function updateUI() {
  const t = words();
  const { kind, id, angle } = current;
  const item = id ? productById(id) : null;
  stage.dataset.location = kind;
  stage.dataset.journey = journey ? journey.id ?? journey.kind : '';
  stage.dataset.angle = item ? String(angle) : '';
  stage.dataset.scene = sceneStatus;
  $('scene-mode').textContent = t[sceneStatus];
  $('placeholder-title').textContent = sceneStatus === 'fallback' ? t.fallbackTitle : t.preparing;
  $('placeholder-copy').textContent = t.fallbackCopy;
  $('placeholder-copy').hidden = sceneStatus !== 'fallback';
  $('scene-number').textContent = item?.number ?? (kind === 'concourse' ? 'G' : '01');
  $('scene-location').textContent = item?.name[language] ?? t[kind];
  $('scene-footer').hidden = sceneStatus !== 'ready';
  $('walk-hint').hidden = kind === 'inspect';
  movement.hidden = kind === 'inspect';
  $('travel-note').textContent = journey ? travelText(journey) : '';
  $('travel-note').hidden = !journey;
  $('shop-card').hidden = kind !== 'concourse';
  $('inside-actions').hidden = kind !== 'showroom';
  $('inspection-actions').hidden = kind !== 'inspect';
  $('angle-section').hidden = sceneStatus !== 'ready';

  if (item) {
    $('rail-label').textContent = `${item.number} / ${item.code[language]}`;
    $('rail-title').textContent = item.name[language];
    $('rail-copy').textContent = item.description[language];
    $('features').replaceChildren(...item.features[language].map(text => {
      const li = document.createElement('li');
      li.textContent = text;
      return li;
    }));
  } else {
    const outside = kind === 'concourse';
    $('rail-label').textContent = outside ? t.floorDirectory : t.insideLabel;
    $('rail-title').textContent = outside ? t.chooseShop : t.insideTitle;
    $('rail-copy').textContent = outside ? t.concourseCopy : sceneStatus === 'fallback' ? t.insideFallback : t.insideCopy;
  }
  for (const button of angleButtons) button.setAttribute('aria-pressed', String(Number(button.dataset.angle) === (journey?.angle ?? angle)));
  for (const product of products) {
    const active = product.id === (journey?.id ?? id);
    indexButtons.get(product.id).setAttribute('aria-pressed', String(active));
    $(`map-${product.id}`).dataset.current = String(active);
  }
  updateHotspots();
}

function finish(destination, timing) {
  current = destination;
  journey = null;
  if (timing) {
    stage.dataset.travelMs = String(timing.ms);
    stage.dataset.travelFrames = String(timing.frames);
    stage.dataset.travelP95 = String(timing.p95);
  } else if (sceneStatus !== 'ready') {
    const { position: [x, , z] } = destinationView(destination);
    drawMap({ x, z });
  }
  updateUI();
  const item = current.id ? productById(current.id) : null;
  $('live-status').textContent = item ? words().arrived(item.name[language]) : words()[current.kind];
}

function navigate(destination, source) {
  const t = words();
  const nextView = destinationView(destination);
  if (source && sceneStatus === 'ready') {
    const viewport = stage.getBoundingClientRect();
    if (viewport.top < -45 || viewport.bottom > window.innerHeight + 55) {
      stage.scrollIntoView({ block: 'start', behavior: reduced() ? 'instant' : 'smooth' });
    }
  }
  if (source?.closest('#shop-card, #inside-actions, #inspection-actions') && !source.matches('[data-angle]')) {
    stage.focus({ preventScroll: true });
  }
  if (sceneStatus !== 'ready') {
    finish(destination);
    return;
  }
  journey = destination;
  updateUI();
  $('live-status').textContent = travelText(destination);
  if (!scene.go(nextView, destination)) {
    journey = null;
    updateUI();
    $('live-status').textContent = t.unavailableRoute;
  }
}

function updatePose(data) {
  lastFrame = data;
  const { x, y, z, yaw, pitch, frameCount, draws, triangles, software } = data;
  stage.dataset.camera = [x, y, z].map(value => value.toFixed(3)).join(',');
  stage.dataset.yaw = yaw.toFixed(3);
  stage.dataset.pitch = pitch.toFixed(3);
  stage.dataset.frames = String(frameCount);
  stage.dataset.draws = String(draws);
  stage.dataset.triangles = String(triangles);
  stage.dataset.graphics = software ? 'software' : 'standard';
  drawMap(data);
  if (!journey && current.kind !== 'inspect') {
    if (z < -0.43 && current.kind === 'concourse') finish({ kind: 'showroom' });
    if (z > 0.43 && current.kind === 'showroom') finish(initial);
  }
  updateHotspots();
}

function enableFallback() {
  if (sceneStatus === 'fallback') return;
  sceneStatus = 'fallback';
  scene = null;
  lastFrame = null;
  finish(journey ?? current);
  $('live-status').textContent = words().fallbackCopy;
}

document.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.go) navigate({ kind: button.dataset.go }, button);
  if (button.dataset.product) navigate({ kind: 'inspect', id: button.dataset.product, angle: 1 }, button);
  if (button.dataset.angle && current.id) {
    const angle = Number(button.dataset.angle);
    if ((journey?.angle ?? current.angle) !== angle) navigate({ kind: 'inspect', id: current.id, angle }, button);
  }
});

for (const button of movement.querySelectorAll('button')) {
  const direction = button.dataset.move;
  button.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0) return;
    button.setPointerCapture(event.pointerId);
    scene?.press(direction, button, true);
  });
  for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    button.addEventListener(event, () => scene?.release(button));
  }
  button.addEventListener('click', event => {
    if (event.detail === 0) scene?.press(direction, button);
  });
}

document.addEventListener('keydown', event => {
  if (!scene || controlsDialog.open || event.ctrlKey || event.metaKey || event.altKey
    || event.target.matches('input, textarea, select, [contenteditable]')) return;
  if (event.key === 'Escape' && (current.kind === 'inspect' || journey?.kind === 'inspect')) {
    stage.focus({ preventScroll: true });
    navigate({ kind: 'showroom' });
    return;
  }
  if (!stage.contains(document.activeElement)) return;
  const direction = keyDirections[event.key.toLowerCase()] ?? keyDirections[event.key];
  if (!direction || event.repeat) return;
  event.preventDefault();
  scene.press(direction, event.code, true);
});
document.addEventListener('keyup', event => scene?.release(event.code));

$('language').addEventListener('click', () => {
  language = language === 'en' ? 'ar' : 'en';
  translate();
});
$('help').addEventListener('click', () => controlsDialog.showModal());
reduceMotion.addEventListener('change', () => {
  motionPreference = reduceMotion.checked;
  scene?.setReducedMotion(reduced());
});
systemMotion.addEventListener('change', () => {
  reduceMotion.checked = reduced();
  scene?.setReducedMotion(reduced());
});

reduceMotion.checked = reduced();
drawMap({ x: VIEWS.concourse.position[0], z: VIEWS.concourse.position[2] });
translate();

async function initialize() {
  if (new URLSearchParams(window.location.search).get('view') === 'catalogue') {
    enableFallback();
    return;
  }
  try {
    const { createShowroom } = await import('./scene.js');
    scene = await createShowroom($('room'), stage, {
      onFrame: updatePose,
      onArrive: finish,
      onManual(kind) {
        journey = null;
        current = { kind };
        updateUI();
      },
      onPick(id) {
        if (current.kind === 'showroom') navigate({ kind: 'inspect', id, angle: 1 });
      },
      canLook: () => current.kind !== 'inspect' || Boolean(journey),
      onUnavailable: enableFallback,
    }, reduced());
    sceneStatus = 'ready';
    performance.mark('showroom-ready');
    scene.setReducedMotion(reduced());
    if (current.kind !== 'concourse') navigate(current);
    else updateUI();
  } catch {
    enableFallback();
  }
}
initialize();
