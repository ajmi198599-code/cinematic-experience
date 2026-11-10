import * as THREE from 'three';
import { batchStatic, finish, texture } from './materials.js';
import { DISPLAYS, TABLE_HEIGHT } from './world.js';

const radians = degrees => degrees * Math.PI / 180;
const flat = [-Math.PI / 2, 0, 0];

function band(k, parent, material, path, width, thickness, depthAxis) {
  const positions = [];
  const indices = [];
  const uv = [];
  for (let i = 0; i <= 32; i++) {
    const t = i / 32;
    const point = path.getPoint(t);
    const tangent = path.getTangent(t);
    const across = depthAxis === 'z' ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(1, 0, 0);
    const normal = tangent.clone().cross(across).normalize();
    for (const [w, h] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      const p = point.clone().addScaledVector(across, w * width / 2).addScaledVector(normal, h * thickness / 2);
      positions.push(...p.toArray());
      uv.push(t, w / 2 + 0.5);
    }
    if (i === 0) continue;
    for (let side = 0; side < 4; side++) {
      const a = (i - 1) * 4 + side;
      const b = (i - 1) * 4 + (side + 1) % 4;
      indices.push(a, b, a + 4, b, b + 4, a + 4);
    }
  }
  indices.push(0, 3, 2, 0, 2, 1, 128, 129, 130, 128, 130, 131);
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
  const cushion = finish(0x493c31, 0.89);
  const blackPlastic = finish(0x262e2b, 0.49, 0.15);
  const graphite = finish(0x4c524e, 0.34, 0.72);
  const champagne = finish(0x9b8872, 0.36, 0.66);
  softBox(m.pineDark, [0.34, 0.036, 0.23], 0.017, [0, 0.018, 0]);
  disk(m.dark, 0.015, 0.340, [0, 0.204, -0.061]);
  softBox(m.dark, [0.132, 0.024, 0.10], 0.011, [0, 0.377, -0.019]);

  band(k, parent, graphite, curve([
    [-0.128, 0.210, 0.001], [-0.124, 0.302, 0.006], [-0.083, 0.371, 0.013],
    [0, 0.394, 0.017], [0.083, 0.371, 0.013], [0.124, 0.302, 0.006], [0.128, 0.210, 0.001],
  ]), 0.065, 0.014, 'z');
  band(k, parent, cushion, curve([
    [-0.101, 0.305, 0.009], [-0.078, 0.350, 0.014], [0, 0.376, 0.017],
    [0.078, 0.350, 0.014], [0.101, 0.305, 0.009],
  ]), 0.057, 0.025, 'z');

  for (const side of [-1, 1]) {
    const x = side * 0.126;
    const body = disk(graphite, 0.057, 0.026, [x, 0.199, 0.002], 'x');
    body.scale.set(1.16, 1, 0.96);
    const trim = ring(champagne, 0.048, 0.0016, [x + side * 0.014, 0.199, 0.002], 'x');
    trim.scale.set(0.96, 1.13, 1);
    const back = disk(blackPlastic, 0.047, 0.004, [x + side * 0.014, 0.199, 0.002], 'x');
    back.scale.set(1.14, 1, 0.97);
    const cup = disk(cushion, 0.056, 0.024, [x - side * 0.022, 0.199, 0.002], 'x');
    cup.scale.set(1.13, 1, 0.97);
    const lip = ring(cushion, 0.045, 0.009, [x - side * 0.036, 0.199, 0.002], 'x');
    lip.scale.set(1, 1.17, 1);
    disk(m.black, 0.036, 0.002, [x - side * 0.037, 0.199, 0.002], 'x');
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
  return texture(256, 256, (ctx) => {
    const face = ctx.createRadialGradient(107, 80, 12, 128, 128, 153);
    face.addColorStop(0, '#526456');
    face.addColorStop(1, '#0e1715');
    ctx.fillStyle = face;
    ctx.fillRect(0, 0, 256, 256);
    ctx.save();
    ctx.translate(128, 128);
    for (let i = 0; i < 60; i++) {
      ctx.rotate(Math.PI / 30);
      ctx.strokeStyle = i % 5 === 4 ? '#eddbb2' : '#7f8b81';
      ctx.lineWidth = i % 5 === 4 ? 3.5 : 1;
      ctx.beginPath();
      ctx.moveTo(0, -108);
      ctx.lineTo(0, i % 5 === 4 ? -92 : -103);
      ctx.stroke();
    }
    ctx.strokeStyle = '#e4dbbf';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-43, -33);
    ctx.lineTo(0, 0);
    ctx.lineTo(63, -42);
    ctx.stroke();
    ctx.strokeStyle = '#b68d5d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(10, -13);
    ctx.lineTo(-41, 71);
    ctx.stroke();
    ctx.fillStyle = '#e4dbbf';
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, 2 * Math.PI);
    ctx.fill();
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
  const strap = finish(0x6d6554, 0.82);
  const casing = finish(0xb5afa1, 0.24, 0.74);
  const edge = finish(0x83715a, 0.32, 0.65);
  const dial = new THREE.MeshStandardMaterial({ map: watchDial(), roughness: 0.43, metalness: 0.05 });
  softBox(m.pineDark, [0.24, 0.033, 0.20], 0.016, [0, 0.0165, 0.005]);
  softBox(m.dark, [0.043, 0.071, 0.059], 0.015, [0, 0.065, -0.020]);
  softBox(m.fabric, [0.050, 0.136, 0.075], 0.024, [0, 0.133, -0.028]);
  band(k, parent, strap, curve([
    [0, 0.163, 0.029], [0, 0.196, 0.016], [0, 0.208, -0.013], [0, 0.189, -0.063],
    [0, 0.131, -0.075], [0, 0.080, -0.055], [0, 0.075, -0.014], [0, 0.100, 0.018], [0, 0.144, 0.029],
  ]), 0.034, 0.006, 'x');
  box(casing, [0.038, 0.009, 0.012], [0, 0.088, -0.051]);
  disk(casing, 0.034, 0.014, [0, 0.160, 0.031], 'z');
  ring(casing, 0.0313, 0.0033, [0, 0.160, 0.039], 'z');
  ring(edge, 0.0290, 0.0006, [0, 0.160, 0.041], 'z');
  for (const y of [0.125, 0.194]) {
    for (const x of [-0.014, 0.014]) {
      softBox(casing, [0.005, 0.012, 0.014], 0.002, [x, y, 0.026]);
    }
  }
  // A flat UV disc keeps the artwork legible independent of the sidewall UVs.
  k.mesh(new THREE.CircleGeometry(0.029, 48), dial, [0, 0.160, 0.0394], { parent });
  disk(casing, 0.0056, 0.007, [0.035, 0.159, 0.032], 'x', 16);
  disk(m.dark, 0.0035, 0.0015, [0.039, 0.159, 0.032], 'x', 16);
  k.shadow(0, 0.002, 0, 0.36, 0.30, parent);
}

function camera(k, parent, m) {
  const { softBox, box, disk, ring, sign } = makeTools(k, parent);
  const alloy = finish(0x4d504b, 0.34, 0.69);
  const black = finish(0x212526, 0.65, 0.22);
  const rubber = finish(0x333632, 0.94);
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0x334640, roughness: 0.16, metalness: 0.46, clearcoat: 1, clearcoatRoughness: 0.11,
  });
  softBox(m.pineDark, [0.37, 0.033, 0.29], 0.014, [0, 0.0165, 0.016]);
  softBox(m.dark, [0.126, 0.032, 0.074], 0.012, [0, 0.046, -0.006]);
  softBox(black, [0.242, 0.137, 0.085], 0.012, [0, 0.119, -0.009]);
  softBox(alloy, [0.239, 0.031, 0.084], 0.010, [0, 0.178, -0.008]);
  softBox(alloy, [0.089, 0.033, 0.051], 0.009, [-0.021, 0.198, -0.010]);
  softBox(rubber, [0.045, 0.107, 0.034], 0.013, [0.096, 0.113, 0.033]);
  for (let i = 0; i < 8; i++) {
    box(black, [0.020, 0.0015, 0.002], [0.099, 0.082 + i * 0.010, 0.0507]);
  }
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
  const optic = k.mesh(new THREE.SphereGeometry(1, 32, 16), glass, [-0.018, 0.119, 0.097], { parent });
  optic.scale.set(0.038, 0.038, 0.0055);
  for (const [x, radius] of [[0.083, 0.025], [-0.087, 0.018]]) {
    disk(black, radius, 0.014, [x, 0.197, -0.010], 'y', 36);
    disk(alloy, radius * 0.83, 0.003, [x, 0.206, -0.010]);
  }
  disk(m.bronze, 0.009, 0.003, [0.093, 0.202, 0.024], 'y', 20);
  softBox(m.black, [0.047, 0.024, 0.010], 0.005, [-0.023, 0.195, -0.042]);
  softBox(glass, [0.112, 0.073, 0.005], 0.005, [-0.025, 0.118, -0.053]);
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
    ]), 0.061, 0.023, 'z');
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
  return DISPLAYS.map(({ id, x, z, modelZ }) => {
    const groups = [builders[id], (kit, parent, palette) => distantModel(id, kit, parent, palette)];
    const [close, distant] = groups.map(build => {
      const root = new THREE.Group();
      const mount = new THREE.Group();
      mount.position.set(x, TABLE_HEIGHT, z + modelZ);
      root.add(mount);
      build(k, mount, materials);
      batchStatic(root);
      return root;
    });
    const bounds = new THREE.Box3().setFromObject(close).union(new THREE.Box3().setFromObject(distant));
    return { x, z: z + modelZ, close, distant, bounds, near: false };
  });
}
