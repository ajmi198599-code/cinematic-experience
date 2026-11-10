import * as THREE from 'three';
import { batchStatic, finish, randomFrom, texture } from './materials.js';
import { DISPLAYS, TABLE_HEIGHT } from './world.js';

const radians = degrees => degrees * Math.PI / 180;
const flat = [-Math.PI / 2, 0, 0];

function band(k, parent, material, path, width, thickness, depthAxis, rounded = false, steps = 24) {
  const positions = [];
  const indices = [];
  const uv = [];
  const corners = rounded
    ? [[-0.7, -1], [0.7, -1], [1, -0.55], [1, 0.55], [0.7, 1], [-0.7, 1], [-1, 0.55], [-1, -0.55]]
    : [[-1, -1], [1, -1], [1, 1], [-1, 1]];
  const sides = corners.length;
  const across = depthAxis === 'z' ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(1, 0, 0);
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const point = path.getPoint(t);
    const tangent = path.getTangent(t);
    const normal = tangent.clone().cross(across).normalize();
    for (const [w, h] of corners) {
      const p = point.clone().addScaledVector(across, w * width / 2).addScaledVector(normal, h * thickness / 2);
      positions.push(...p.toArray());
      uv.push(t, w / 2 + 0.5);
    }
    if (i === 0) continue;
    for (let side = 0; side < sides; side++) {
      const a = (i - 1) * sides + side;
      const b = (i - 1) * sides + (side + 1) % sides;
      indices.push(a, b, a + sides, b, b + sides, a + sides);
    }
  }
  const end = sides * steps;
  for (let i = 1; i < sides - 1; i++) indices.push(0, i + 1, i, end, end + i, end + i + 1);
  const shape = new THREE.BufferGeometry();
  shape.setIndex(indices);
  shape.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  shape.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  shape.computeVertexNormals();
  return k.mesh(shape, material, [0, 0, 0], { parent });
}

function curve(points) {
  return new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
}

function grain(seed, base, weave = false) {
  const random = randomFrom(seed);
  return texture(128, 64, (ctx, width, height) => {
    const pixels = ctx.createImageData(width, height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const variation = (random() - 0.5) * 8 + (weave ? (x % 4 < 2 ? 2 : -2) + (y % 4 < 2 ? 1 : -1) : 0);
        pixels.data[i] = base[0] + variation;
        pixels.data[i + 1] = base[1] + variation;
        pixels.data[i + 2] = base[2] + variation;
        pixels.data[i + 3] = 255;
      }
    }
    ctx.putImageData(pixels, 0, 0);
  });
}

function makeTools(k, parent) {
  const opts = { parent };
  return {
    softBox: (m, size, edge, p) => k.softBox(m, size, edge, p, opts),
    box: (m, size, p) => k.box(m, size, p, opts),
    disk(m, radius, thickness, p, axis = 'y', segments = 32) {
      const disk = k.mesh(new THREE.CylinderGeometry(radius, radius, thickness, segments), m, p, opts);
      if (axis === 'z') disk.rotation.x = Math.PI / 2;
      if (axis === 'x') disk.rotation.z = Math.PI / 2;
      return disk;
    },
    ring(m, radius, thickness, p, axis = 'z') {
      const ring = k.mesh(new THREE.TorusGeometry(radius, thickness, 8, 40), m, p, opts);
      if (axis === 'x') ring.rotation.y = Math.PI / 2;
      return ring;
    },
    sign: (lines, w, h, position, options = {}) => k.sign(lines, w, h, position, { ...options, parent }),
  };
}

function headphones(k, parent, m) {
  const { box, softBox, disk, ring, sign } = makeTools(k, parent);
  const cushion = finish(0xffffff, 0.78, 0, { map: grain(13, [66, 52, 43]) });
  const cloth = finish(0xffffff, 0.96, 0, { map: grain(17, [44, 43, 38], true) });
  const blackPlastic = finish(0x28312e, 0.49, 0.1);
  const graphite = finish(0x626763, 0.38, 0.78);
  const champagne = finish(0xad9478, 0.32, 0.7);
  softBox(m.pineDark, [0.34, 0.036, 0.23], 0.017, [0, 0.018, 0]);
  disk(m.dark, 0.015, 0.340, [0, 0.204, -0.061]);
  softBox(m.dark, [0.132, 0.024, 0.10], 0.011, [0, 0.377, -0.019]);

  band(k, parent, graphite, curve([
    [-0.128, 0.210, 0.001], [-0.124, 0.302, 0.006], [-0.083, 0.371, 0.013],
    [0, 0.394, 0.017], [0.083, 0.371, 0.013], [0.124, 0.302, 0.006], [0.128, 0.210, 0.001],
  ]), 0.066, 0.014, 'z', true);
  band(k, parent, cushion, curve([
    [-0.101, 0.305, 0.009], [-0.078, 0.350, 0.014], [0, 0.376, 0.017],
    [0.078, 0.350, 0.014], [0.101, 0.305, 0.009],
  ]), 0.060, 0.023, 'z', true);
  const seam = finish(0x83705a, 0.9);
  for (const z of [-0.009, 0.043]) {
    const path = curve([
      [-0.097, 0.309, z], [-0.074, 0.352, z], [0, 0.378, z],
      [0.074, 0.352, z], [0.097, 0.309, z],
    ]);
    k.mesh(new THREE.TubeGeometry(path, 20, 0.0007, 4, false), seam, [0, 0, 0], { parent });
  }

  const padGeometry = new THREE.LatheGeometry([
    [0.034, -0.009], [0.051, -0.011], [0.057, -0.006], [0.058, 0.005],
    [0.054, 0.015], [0.047, 0.019], [0.039, 0.015], [0.034, 0.007], [0.034, -0.009],
  ].map(point => new THREE.Vector2(...point)), 36);

  for (const side of [-1, 1]) {
    const x = side * 0.126;
    const body = disk(graphite, 0.057, 0.026, [x, 0.199, 0.002], 'x');
    body.scale.set(1.16, 1, 0.96);
    const trim = ring(champagne, 0.048, 0.0016, [x + side * 0.014, 0.199, 0.002], 'x');
    trim.scale.set(0.96, 1.13, 1);
    const back = disk(blackPlastic, 0.047, 0.004, [x + side * 0.014, 0.199, 0.002], 'x');
    back.scale.set(1.14, 1, 0.97);
    const pad = k.mesh(padGeometry, cushion, [x - side * 0.022, 0.199, 0.002], { parent });
    pad.rotation.z = side * Math.PI / 2;
    pad.scale.set(1.12, 1, 0.94);
    disk(cloth, 0.035, 0.003, [x - side * 0.020, 0.199, 0.002], 'x').scale.x = 1.12;
    disk(champagne, 0.018, 0.011, [x + side * 0.010, 0.256, -0.003], 'x');
    const yoke = box(champagne, [0.012, 0.064, 0.025], [side * 0.126, 0.267, 0]);
    yoke.rotation.z = radians(side * 7);
  }
  softBox(champagne, [0.010, 0.010, 0.015], 0.003, [0.142, 0.164, 0.024]);
  softBox(m.black, [0.017, 0.004, 0.005], 0.001, [0.125, 0.138, 0.019]);
  sign([{ value: 'BR', y: 0.50, size: 50, spacing: 1, color: '#d2c2a8' }], 0.068, 0.03, [0, 0.037, 0.077], { rotation: flat, resolution: 256, canvasHeight: 112 });
  k.shadow(0, 0.002, 0, 0.49, 0.35, parent);
}

function watchDial() {
  return texture(512, 512, (ctx) => {
    ctx.scale(2, 2);
    const face = ctx.createRadialGradient(107, 80, 12, 128, 128, 153);
    face.addColorStop(0, '#526456');
    face.addColorStop(1, '#0e1715');
    ctx.fillStyle = face;
    ctx.fillRect(0, 0, 256, 256);
    ctx.save();
    ctx.translate(128, 128);
    for (let i = 0; i < 120; i++) {
      ctx.rotate(Math.PI / 60);
      ctx.strokeStyle = i % 3 ? 'rgba(231,235,200,.065)' : 'rgba(4,13,11,.13)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, -8);
      ctx.lineTo(0, -120);
      ctx.stroke();
    }
    for (let i = 0; i < 60; i++) {
      ctx.rotate(Math.PI / 30);
      ctx.strokeStyle = i % 5 === 4 ? '#eddbb2' : '#7f8b81';
      ctx.lineWidth = i % 5 === 4 ? 3.5 : 1;
      ctx.beginPath();
      ctx.moveTo(0, -108);
      ctx.lineTo(0, i % 5 === 4 ? -92 : -103);
      ctx.stroke();
    }
    ctx.fillStyle = '#c7b694';
    ctx.fillRect(66, -11, 24, 22);
    ctx.fillStyle = '#212d25';
    ctx.fillRect(68, -9, 20, 18);
    ctx.fillStyle = '#eee5d1';
    ctx.font = '700 11px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('18', 78, 4);
    ctx.restore();
    ctx.textAlign = 'center';
    ctx.font = '700 19px Arial';
    ctx.fillText('B R', 128, 79);
    ctx.font = '8px Arial';
    ctx.fillText('E V E R Y D A Y', 128, 175);
  });
}

function watch(k, parent, m) {
  const { softBox, box, disk, ring } = makeTools(k, parent);
  const strap = finish(0xffffff, 0.84, 0, { map: grain(35, [99, 91, 75], true) });
  const casing = finish(0xaeb4b3, 0.24, 0.81);
  const edge = finish(0x8e775d, 0.33, 0.65);
  const dial = new THREE.MeshStandardMaterial({ map: watchDial(), roughness: 0.43, metalness: 0.05 });
  const hands = finish(0xe0d8bb, 0.27, 0.76);
  const crystal = finish(0xf0f5ef, 0.1, 0.05, {
    transparent: true, opacity: 0.1, depthWrite: false, envMapIntensity: 0.65,
  });
  softBox(m.pineDark, [0.24, 0.033, 0.20], 0.016, [0, 0.0165, 0.005]);
  softBox(m.dark, [0.043, 0.071, 0.059], 0.015, [0, 0.065, -0.020]);
  softBox(m.fabric, [0.050, 0.136, 0.075], 0.024, [0, 0.133, -0.028]);
  band(k, parent, strap, curve([
    [0, 0.163, 0.029], [0, 0.196, 0.016], [0, 0.208, -0.013], [0, 0.189, -0.063],
    [0, 0.131, -0.075], [0, 0.080, -0.055], [0, 0.075, -0.014], [0, 0.100, 0.018], [0, 0.144, 0.029],
  ]), 0.030, 0.006, 'x', true);
  softBox(casing, [0.036, 0.008, 0.014], 0.003, [0, 0.088, -0.051]);
  box(edge, [0.032, 0.004, 0.009], [0, 0.098, -0.065]);
  disk(casing, 0.032, 0.014, [0, 0.160, 0.031], 'z');
  ring(casing, 0.0302, 0.0024, [0, 0.160, 0.039], 'z');
  ring(edge, 0.0287, 0.0007, [0, 0.160, 0.041], 'z');
  for (const y of [0.125, 0.194]) {
    for (const x of [-0.014, 0.014]) {
      softBox(casing, [0.005, 0.012, 0.014], 0.002, [x, y, 0.026]);
    }
  }
  // A flat UV disc keeps the artwork legible independent of the sidewall UVs.
  k.mesh(new THREE.CircleGeometry(0.029, 48), dial, [0, 0.160, 0.0394], { parent });
  for (let i = 0; i < 12; i++) {
    if (i === 3) continue;
    const angle = i * Math.PI / 6;
    const marker = box(casing, [0.0011, 0.0034, 0.0006], [
      Math.sin(angle) * 0.0245, 0.160 + Math.cos(angle) * 0.0245, 0.040,
    ]);
    marker.rotation.z = -angle;
  }
  for (const [material, length, width, angle, z] of [
    [hands, 0.015, 0.0018, -0.91, 0.041],
    [hands, 0.022, 0.0012, 0.98, 0.0416],
    [edge, 0.024, 0.00045, -2.64, 0.0422],
  ]) {
    const hand = box(material, [width, length, 0.0005], [
      Math.sin(angle) * length / 2, 0.160 + Math.cos(angle) * length / 2, z,
    ]);
    hand.rotation.z = -angle;
  }
  disk(edge, 0.0017, 0.001, [0, 0.160, 0.0428], 'z', 16);
  k.mesh(new THREE.CircleGeometry(0.0289, 48), crystal, [0, 0.160, 0.0435], { parent });
  disk(casing, 0.0056, 0.006, [0.033, 0.159, 0.032], 'x', 16);
  ring(edge, 0.0048, 0.0008, [0.036, 0.159, 0.032], 'x');
  disk(m.dark, 0.0035, 0.0015, [0.037, 0.159, 0.032], 'x', 16);
  k.shadow(0, 0.002, 0, 0.36, 0.30, parent);
}

function lensIris() {
  return texture(256, 256, ctx => {
    const depth = ctx.createRadialGradient(113, 110, 6, 128, 128, 126);
    depth.addColorStop(0, '#0e191b');
    depth.addColorStop(0.43, '#1a2928');
    depth.addColorStop(0.72, '#31423d');
    depth.addColorStop(1, '#080d0e');
    ctx.fillStyle = depth;
    ctx.fillRect(0, 0, 256, 256);
    for (const radius of [61, 84, 103, 119]) {
      ctx.strokeStyle = radius < 100 ? '#52605b' : '#7c8074';
      ctx.lineWidth = radius < 100 ? 1.6 : 1;
      ctx.beginPath();
      ctx.arc(128, 128, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.save();
    ctx.translate(128, 128);
    for (let i = 0; i < 7; i++) {
      ctx.rotate(Math.PI * 2 / 7);
      ctx.fillStyle = i % 2 ? '#27342f' : '#34413a';
      ctx.beginPath();
      ctx.moveTo(0, -46);
      ctx.lineTo(39, -20);
      ctx.lineTo(16, 15);
      ctx.lineTo(-9, 10);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = '#050b0c';
    ctx.beginPath();
    ctx.arc(0, 0, 17, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

function camera(k, parent, m) {
  const { softBox, box, disk, ring, sign } = makeTools(k, parent);
  const alloy = finish(0x4d504b, 0.34, 0.69);
  const black = finish(0x212526, 0.65, 0.22);
  const rubber = finish(0xffffff, 0.91, 0, { map: grain(53, [55, 55, 48], true) });
  const glass = finish(0xd8e7e1, 0.11, 0.1, {
    transparent: true, opacity: 0.19, depthWrite: false, envMapIntensity: 0.85,
  });
  const optics = finish(0xffffff, 0.46, 0.13, { map: lensIris() });
  const screen = finish(0x1f2c30, 0.22, 0.22);
  softBox(m.pineDark, [0.37, 0.033, 0.29], 0.014, [0, 0.0165, 0.016]);
  softBox(m.dark, [0.126, 0.032, 0.074], 0.012, [0, 0.046, -0.006]);
  softBox(black, [0.242, 0.137, 0.085], 0.012, [0, 0.119, -0.009]);
  softBox(alloy, [0.239, 0.031, 0.084], 0.010, [0, 0.178, -0.008]);
  softBox(alloy, [0.089, 0.033, 0.051], 0.009, [-0.021, 0.198, -0.010]);
  softBox(rubber, [0.045, 0.107, 0.034], 0.013, [0.096, 0.113, 0.033]);
  softBox(rubber, [0.049, 0.032, 0.015], 0.006, [0.092, 0.140, -0.049]);
  disk(alloy, 0.060, 0.013, [-0.018, 0.119, 0.036], 'z');
  disk(black, 0.054, 0.058, [-0.018, 0.119, 0.066], 'z');
  disk(rubber, 0.056, 0.031, [-0.018, 0.119, 0.078], 'z', 64);
  ring(alloy, 0.0535, 0.0020, [-0.018, 0.119, 0.094], 'z');
  disk(m.black, 0.0478, 0.005, [-0.018, 0.119, 0.094], 'z');
  ring(m.bronze, 0.045, 0.0011, [-0.018, 0.119, 0.098], 'z');
  ring(alloy, 0.0405, 0.0016, [-0.018, 0.119, 0.099], 'z');
  for (let i = 0; i < 28; i++) {
    const angle = i * Math.PI / 14;
    const ridge = box(alloy, [0.0024, 0.0019, 0.020], [
      -0.018 + Math.sin(angle) * 0.0556, 0.119 + Math.cos(angle) * 0.0556, 0.079,
    ]);
    ridge.rotation.z = -angle;
  }
  ring(black, 0.0386, 0.0018, [-0.018, 0.119, 0.101], 'z');
  k.mesh(new THREE.CircleGeometry(0.038, 48), optics, [-0.018, 0.119, 0.1005], { parent });
  const cap = new THREE.LatheGeometry([
    [0, 0.006], [0.012, 0.0055], [0.025, 0.0038], [0.033, 0.0016], [0.038, 0],
  ].map(point => new THREE.Vector2(...point)), 40);
  const optic = k.mesh(cap, glass, [-0.018, 0.119, 0.102], { parent });
  optic.rotation.x = Math.PI / 2;
  for (const [x, radius] of [[0.083, 0.025], [-0.087, 0.018]]) {
    disk(black, radius, 0.014, [x, 0.197, -0.010], 'y', 36);
    disk(alloy, radius * 0.83, 0.003, [x, 0.206, -0.010]);
  }
  disk(m.bronze, 0.009, 0.003, [0.093, 0.202, 0.024], 'y', 20);
  disk(alloy, 0.006, 0.005, [0.054, 0.095, 0.036], 'z', 16);
  for (const x of [-0.104, 0.105]) {
    disk(alloy, 0.0026, 0.002, [x, 0.172, 0.036], 'z', 12);
  }
  softBox(m.black, [0.047, 0.024, 0.010], 0.005, [-0.023, 0.195, -0.042]);
  softBox(screen, [0.112, 0.073, 0.005], 0.005, [-0.025, 0.118, -0.053]);
  for (const y of [0.101, 0.123, 0.145]) disk(black, 0.005, 0.004, [0.052, y, -0.054], 'z', 10);
  sign([{ value: 'BR / C01', y: 0.50, size: 42, color: '#e1dac8' }], 0.069, 0.021, [-0.073, 0.176, 0.035], { resolution: 256, canvasHeight: 80 });
  k.shadow(0, 0.002, 0.009, 0.49, 0.39, parent);
}

const builders = { headphones, watch, camera };

function distantModel(id, k, parent, m) {
  const { box, disk } = makeTools(k, parent);
  if (id === 'headphones') {
    box(m.pineDark, [0.34, 0.036, 0.23], [0, 0.018, 0]);
    disk(m.dark, 0.015, 0.34, [0, 0.204, -0.061], 'y', 8);
    band(k, parent, m.dark, curve([
      [-0.127, 0.209, 0.003], [-0.106, 0.340, 0.011], [0, 0.393, 0.017],
      [0.106, 0.340, 0.011], [0.127, 0.209, 0.003],
    ]), 0.061, 0.023, 'z', false, 12);
    for (const side of [-1, 1]) {
      const cup = disk(m.black, 0.056, 0.043, [side * 0.125, 0.199, 0.002], 'x', 12);
      cup.scale.x = 1.15;
    }
  } else if (id === 'watch') {
    box(m.pineDark, [0.24, 0.033, 0.20], [0, 0.0165, 0.005]);
    box(m.dark, [0.035, 0.15, 0.062], [0, 0.108, -0.019]);
    disk(m.bronze, 0.034, 0.015, [0, 0.160, 0.031], 'z', 12);
    disk(m.pineDark, 0.028, 0.002, [0, 0.160, 0.040], 'z', 12);
  } else {
    box(m.pineDark, [0.37, 0.033, 0.29], [0, 0.0165, 0.016]);
    box(m.dark, [0.24, 0.14, 0.085], [0, 0.121, -0.009]);
    box(m.black, [0.092, 0.028, 0.050], [-0.021, 0.198, -0.010]);
    disk(m.black, 0.054, 0.061, [-0.018, 0.119, 0.066], 'z', 12);
    disk(m.bronze, 0.045, 0.003, [-0.018, 0.119, 0.097], 'z', 12);
    disk(m.pineDark, 0.039, 0.003, [-0.018, 0.119, 0.099], 'z', 12);
  }
}

export function buildProducts(k, materials) {
  return DISPLAYS.map(({ id, x, z, modelZ, modelScale }) => {
    const groups = [builders[id], (kit, parent, palette) => distantModel(id, kit, parent, palette)];
    const [close, distant] = groups.map(build => {
      const root = new THREE.Group();
      const mount = new THREE.Group();
      mount.position.set(x, TABLE_HEIGHT, z + modelZ);
      mount.scale.setScalar(modelScale);
      root.add(mount);
      build(k, mount, materials);
      batchStatic(root);
      return root;
    });
    const bounds = new THREE.Box3().setFromObject(close).union(new THREE.Box3().setFromObject(distant));
    return { x, z: z + modelZ, close, distant, bounds, near: false };
  });
}
