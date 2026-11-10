import * as THREE from 'three';
import { randomFrom } from './materials.js';
import { COLUMNS, CONCOURSE, DISPLAYS, PLANTERS, ROOM, SERVICE_DESK, SIDE_BENCHES, STORE_PLANTERS, TABLE_HEIGHT } from './world.js';

const flat = [-Math.PI / 2, 0, 0];
const facingDown = [Math.PI / 2, 0, 0];

function tree(parent, k, m, x, y, z, seed, scale = 1) {
  const random = randomFrom(seed);
  const trunk = [
    new THREE.Vector3(x, y, z),
    new THREE.Vector3(x + 0.1 * scale, y + 0.7 * scale, z + 0.02),
    new THREE.Vector3(x - 0.05 * scale, y + 1.61 * scale, z + 0.10),
  ];
  const tube = (points, radius) => k.mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 9, radius * scale, 6, false),
    m.bark, [0, 0, 0], { parent },
  );
  tube(trunk, 0.045);
  const leafGeometry = new THREE.BufferGeometry();
  leafGeometry.setAttribute('position', new THREE.Float32BufferAttribute([
    -1, 0, 0, 0, 0.38, -1, 1, 0.10, 0, 0, 0.35, 1, 0, 0.86, 0,
  ], 3));
  leafGeometry.setIndex([0, 1, 4, 1, 2, 4, 2, 3, 4, 3, 0, 4]);
  leafGeometry.computeVertexNormals();
  const leaves = new THREE.InstancedMesh(leafGeometry, m.leaf, 336);
  const pivot = new THREE.Object3D();
  const color = new THREE.Color();
  let leaf = 0;
  for (let b = 0; b < 12; b++) {
    const a = b * 2.39996;
    const r = (0.39 + random() * 0.35) * scale;
    const start = new THREE.Vector3(x, y + (1.08 + random() * 0.59) * scale, z);
    const tip = new THREE.Vector3(x + Math.cos(a) * r, start.y + (0.33 + random() * 0.39) * scale, z + Math.sin(a) * r);
    tube([start, start.clone().lerp(tip, 0.58).add(new THREE.Vector3(0, -0.10 * scale, 0)), tip], 0.015);
    for (let i = 0; i < 28; i++) {
      pivot.position.copy(tip).add(new THREE.Vector3((random() - 0.5) * 0.57, (random() - 0.46) * 0.48, (random() - 0.5) * 0.61).multiplyScalar(scale));
      pivot.rotation.set(random() * 3.2, random() * 6.3, random() * 3.2);
      const size = (0.66 + random() * 0.72) * scale;
      pivot.scale.set(0.088 * size, 0.012 * size, 0.035 * size);
      pivot.updateMatrix();
      leaves.setMatrixAt(leaf, pivot.matrix);
      leaves.setColorAt(leaf++, color.setHSL(0.21 + random() * 0.095, 0.13 + random() * 0.23, 0.37 + random() * 0.24));
    }
  }
  parent.add(leaves);
}

export function buildConcourse(root, k, m) {
  const { halfWidth, depth, height } = CONCOURSE;
  k.surface(m.concourse, halfWidth * 2, depth, [0, 0, depth / 2], flat, [17, 8]);
  k.box(m.stone, [24.15, 2.1, 0.40], [0, 5.27, -0.10]);
  k.box(m.bronze, [24.2, 0.022, 0.32], [0, 4.23, 0.13]);
  k.box(m.desk, [23.9, 0.018, 0.011], [0, 5.31, 0.104]);
  for (const x of [-9, -6, -3, 0, 3, 6, 9]) {
    k.box(m.desk, [0.012, 1.03, 0.011], [x, 5.83, 0.106]);
  }
  k.box(m.stone, [24.25, 6.42, 0.38], [0, 3.17, depth + 0.07]);
  for (const x of [-12.11, 12.11]) k.box(m.stone, [0.34, 6.5, depth + 0.4], [x, 3.22, depth / 2]);

  for (const side of [-1, 1]) {
    k.box(m.ceiling, [7.82, 0.28, depth + 0.3], [side * 8.09, height + 0.12, depth / 2]);
    k.box(m.dark, [0.14, 0.32, depth], [side * 4.17, height - 0.1, depth / 2]);
    k.box(m.lamp, [0.055, 0.022, 10.58], [side * 4.30, height - 0.035, depth / 2]);
    k.box(m.stone, [5.9, 4.24, 0.38], [side * 9.07, 2.11, -0.065]);
    k.box(m.darkOak, [3.76, 2.99, 0.15], [side * 9.4, 1.65, 0.18]);
    for (let i = 0; i < 11; i++) {
      k.box(m.dark, [0.018, 2.96, 0.025], [side * 9.4 + (i - 5) * 0.34, 1.65, 0.267]);
    }
    k.box(m.dark, [3.91, 0.105, 0.26], [side * 9.4, 3.15, 0.19]);
    k.box(m.lamp, [3.82, 0.025, 0.055], [side * 9.4, 3.08, 0.26]);
    k.box(m.black, [3.90, 0.17, 0.24], [side * 9.4, 0.09, 0.18]);
    k.box(m.pine, [2.0, 2.30, 0.08], [side * 8.4, 1.35, depth - 0.18]);
  }
  k.surface(m.skylight, 8.4, depth, [0, height + 0.23, depth / 2], facingDown);
  for (const x of [-2.05, 0, 2.05]) k.box(m.dark, [0.055, 0.18, depth], [x, height + 0.07, depth / 2]);
  for (let z = 0.5; z < depth; z += 1.75) k.box(m.dark, [8.4, 0.21, 0.067], [0, height + 0.045, z]);

  for (const { x, z, width, depth: d } of COLUMNS) {
    k.softBox(m.stone, [width, height, d], 0.035, [x, height / 2, z]);
    k.box(m.dark, [width + 0.035, 0.105, d + 0.035], [x, 0.055, z]);
  }
  for (const { x, z, width, depth: d } of PLANTERS) {
    k.softBox(m.desk, [width, 0.47, d], 0.115, [x, 0.235, z]);
    k.softBox(m.soil, [width - 0.18, 0.05, d - 0.17], 0.022, [x, 0.464, z]);
    k.softBox(m.oak, [width - 0.12, 0.085, 0.28], 0.035, [x, 0.49, z + 0.39]);
    tree(root, k, m, x - Math.sign(x) * 0.37, 0.47, z - 0.08, x < 0 ? 129 : 279, 1.12);
  }

  k.sign([{ value: 'G  /  THE CONCOURSE', y: 0.50, size: 53, color: '#323d33', spacing: 6 }], 2.25, 0.39, [-7.6, 3.78, 0.153]);
  for (const x of [-4.7, 4.7]) {
    k.box(m.bronze, [0.017, 0.003, 10.25], [x, 0.002, 5.40]);
  }
}

export function buildStorefront(k, m) {
  const opening = ROOM.doorHalf;
  for (const side of [-1, 1]) {
    const w = ROOM.halfWidth - opening;
    const center = (opening + ROOM.halfWidth) * side / 2;
    k.box(m.dark, [w + 0.024, 0.15, 0.21], [center, 0.085, 0]);
    k.box(m.dark, [w + 0.024, 0.095, 0.19], [center, 2.95, 0]);
    for (const x of [opening, opening + w * 0.49, ROOM.halfWidth]) {
      k.box(m.dark, [0.092, 3.02, 0.23], [side * x, 1.51, 0]);
    }
    k.surface(m.glass, w - 0.09, 2.82, [center, 1.55, 0.02]);
    k.box(m.bronze, [0.020, 2.92, 0.015], [side * (opening + 0.05), 1.51, 0.12]);
    k.softBox(m.stone, [0.49, 4.25, 0.51], 0.032, [side * 6.18, 2.125, 0.047]);
  }
  k.box(m.darkOak, [11.99, 1.24, 0.38], [0, 3.625, -0.026]);
  for (let x = -5.91; x < 6; x += 0.218) {
    k.box(m.oak, [0.179, 1.16, 0.055], [x, 3.63, 0.17]);
  }
  k.softBox(m.pineDark, [5.95, 0.89, 0.16], 0.026, [0, 3.62, 0.235]);
  k.box(m.bronze, [5.95, 0.014, 0.016], [0, 3.175, 0.322]);
  k.sign([
    { value: 'T E C H N O L O G Y', y: 0.37, size: 53, spacing: 5 },
    { value: 'S H O W R O O M   /   0 1', y: 0.72, size: 22, spacing: 4, color: '#d6c2a3' },
  ], 5.58, 0.78, [0, 3.63, 0.32], { resolution: 1024 });
  k.box(m.dark, [12.01, 0.10, 0.42], [0, 3.00, -0.02]);
  k.box(m.lamp, [4.22, 0.019, 0.035], [0, 2.944, 0.063]);
  k.box(m.bronze, [opening * 2, 0.005, 0.092], [0, 0.003, 0]);
}

function wallPanel(k, m, side, z, line, subline) {
  const x = side * 5.94;
  k.box(m.pine, [0.11, 1.51, 2.36], [x, 2.08, z]);
  k.box(m.bronze, [0.028, 0.024, 2.16], [x - side * 0.068, 1.385, z]);
  k.sign([
    { value: line, y: 0.42, size: 45, spacing: 8 },
    { value: subline, y: 0.71, size: 23, spacing: 3, color: '#d3ba99' },
  ], 2.12, 0.72, [x - side * 0.065, 2.09, z], { rotation: [0, -side * Math.PI / 2, 0] });
}

export function buildShowroom(root, k, m) {
  const { halfWidth, depth, height } = ROOM;
  k.surface(m.store, 12, depth, [0, 0, -depth / 2], flat, [8, 8]);
  k.box(m.ceiling, [12.28, 0.18, depth + 0.15], [0, height + 0.081, -depth / 2]);
  k.box(m.pine, [12.28, height, 0.25], [0, height / 2, -depth - 0.10]);
  for (const side of [-1, 1]) {
    k.box(side < 0 ? m.stone : m.ivory, [0.21, height, depth + 0.1], [side * (halfWidth + 0.075), height / 2, -depth / 2]);
    k.box(m.dark, [0.073, 0.105, depth], [side * (halfWidth - 0.028), 0.057, -depth / 2]);
    for (const z of [-1.2, -3.62, -6.04, -8.46, -10.88]) {
      k.box(m.desk, [0.017, 4.05, 0.013], [side * (halfWidth - 0.038), 2.10, z]);
    }
    k.box(m.pineDark, [0.63, 0.09, 9.94], [side * 5.64, 4.17, -5.65]);
    k.box(m.lamp, [0.044, 0.026, 9.84], [side * 5.38, 4.113, -5.65]);
    k.box(m.oak, [2.8, 3.92, 0.145], [side * 4.58, 2.0, -11.315]);
    for (let i = 0; i < 22; i++) {
      k.box(m.darkOak, [0.082, 3.90, 0.044], [side * 4.58 + (i - 10.5) * 0.121, 2.0, -11.223]);
    }
    k.box(m.bronze, [2.72, 0.016, 0.017], [side * 4.58, 3.85, -11.183]);
    k.box(m.lamp, [2.62, 0.020, 0.041], [side * 4.58, 3.819, -11.182]);
  }

  for (const { x, z, width, depth } of STORE_PLANTERS) {
    k.softBox(m.desk, [width, 0.61, depth], 0.105, [x, 0.305, z]);
    k.box(m.soil, [width - 0.18, 0.028, depth - 0.18], [x, 0.613, z]);
    tree(root, k, m, x, 0.61, z, x < 0 ? 212 : 311, 0.77);
  }

  for (let x = -4.96; x <= 5; x += 0.318) {
    k.box(m.darkOak, [0.216, 0.088, 10.88], [x, 4.168, -5.72]);
  }
  for (const x of [-3.37, 0, 3.37]) {
    k.box(m.black, [0.120, 0.073, 10.86], [x, 4.113, -5.73]);
    for (const z of [-1.55, -4.42, -7.50, -9.98]) {
      const housing = k.mesh(new THREE.CylinderGeometry(0.078, 0.069, 0.14, 12), m.dark, [x, 4.025, z]);
      housing.rotation.x = 0.11;
      k.mesh(new THREE.CylinderGeometry(0.057, 0.057, 0.012, 12), m.lamp, [x, 3.950, z]);
    }
  }

  const rear = SERVICE_DESK;
  k.softBox(m.darkOak, [rear.width, 0.83, rear.depth], 0.043, [rear.x, 0.465, rear.z]);
  k.softBox(m.table, [rear.width + 0.07, 0.063, rear.depth + 0.06], 0.024, [rear.x, 0.901, rear.z]);
  k.box(m.backPanel, [5.40, 2.44, 0.08], [0, 2.57, -11.317]);
  k.box(m.bronze, [4.9, 0.014, 0.010], [0, 1.59, -11.273]);
  k.sign([
    { value: 'BEYOND REALITY', y: 0.42, size: 57, spacing: 8 },
    { value: 'T H E   T E C H N O L O G Y   E D I T', y: 0.68, size: 22, spacing: 4, color: '#dbc6a3' },
  ], 4.84, 1.27, [0, 2.66, -11.269], { resolution: 1024, canvasHeight: 256 });

  wallPanel(k, m, -1, -5.62, '01   /   SOUND', 'STUDIO SERIES');
  wallPanel(k, m, 1, -5.62, '03   /   IMAGE', 'CREATOR SERIES');
  for (const { x, z, width, depth: d } of SIDE_BENCHES) {
    k.softBox(m.darkOak, [width - 0.07, 0.39, d - 0.06], 0.033, [x, 0.215, z]);
    k.softBox(m.fabric, [width, 0.10, d], 0.045, [x, 0.447, z]);
  }
}

const fixtureText = {
  headphones: ['STUDIO HEADPHONES', '01   /   SOUND'],
  watch: ['EVERYDAY WATCH', '02   /   TIME'],
  camera: ['CREATOR CAMERA', '03   /   IMAGE'],
};

export function buildFixtures(k, m) {
  for (const item of DISPLAYS) {
    const { id, x, z, width, depth } = item;
    k.softBox(m.black, [width - 0.24, 0.097, depth - 0.24], 0.036, [x, 0.052, z]);
    k.softBox(m.darkOak, [width - 0.14, 0.81, depth - 0.13], 0.053, [x, 0.502, z]);
    k.softBox(m.dark, [width - 0.10, 0.035, depth - 0.09], 0.010, [x, 0.925, z]);
    k.softBox(m.table, [width, 0.067, depth], 0.021, [x, TABLE_HEIGHT - 0.0335, z]);
    k.box(m.bronze, [width - 0.20, 0.009, 0.014], [x, 0.944, z + depth * 0.46]);
    k.softBox(m.dark, [0.36, 0.017, 0.128], 0.010, [x, 1.023, z + 0.398]);
    k.sign([
      { value: fixtureText[id][1], y: 0.26, size: 32, spacing: 5, color: '#d9b88a', weight: 700 },
      { value: fixtureText[id][0], y: 0.66, size: 39, spacing: 3, weight: 600 },
    ], 0.338, 0.108, [x, 1.033, z + 0.397], { resolution: 512, canvasHeight: 144, rotation: flat, background: '#252d27' });
  }
}
