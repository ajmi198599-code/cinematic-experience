import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { CONCOURSE, COLUMNS, DISPLAYS, PLANTERS, ROOM, SERVICE_DESK, SIDE_BENCHES, STORE_PLANTERS } from './world.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export function randomFrom(seed) {
  return () => {
    seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

export function texture(width, height, paint) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  paint(context, width, height);
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 4;
  return map;
}

export function finish(color, roughness = 0.68, metalness = 0, extra = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });
}

function mineral(rgb, seed, floor = false) {
  const random = randomFrom(seed);
  return texture(256, 256, (ctx, width, height) => {
    const pixels = ctx.createImageData(width, height);
    for (let y = 0; y < height; y++) {
      const vein = Math.sin(y * 0.066) * 2.5 + Math.sin(y * 0.19) * 0.65;
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const mottling = Math.sin(x * 0.089 + y * 0.027) * 2.3 + Math.cos((x + y) * 0.052) * 1.8;
        const noise = (random() - 0.5) * (floor ? 9 : 7) + mottling + vein;
        pixels.data[i] = rgb[0] + noise;
        pixels.data[i + 1] = rgb[1] + noise;
        pixels.data[i + 2] = rgb[2] + noise;
        pixels.data[i + 3] = 255;
      }
    }
    ctx.putImageData(pixels, 0, 0);
    for (let i = 0; i < (floor ? 820 : 330); i++) {
      const x = random() * width;
      const y = random() * height;
      ctx.fillStyle = random() > 0.54 ? 'rgba(76,66,54,.24)' : 'rgba(250,244,227,.43)';
      ctx.beginPath();
      const size = random() * (floor ? 1.55 : 0.55);
      ctx.moveTo(x - size, y);
      ctx.lineTo(x + size * 0.1, y - size * 0.55);
      ctx.lineTo(x + size * 0.86, y + size * 0.36);
      ctx.lineTo(x - size * 0.24, y + size * 0.69);
      ctx.fill();
    }
    if (floor) {
      ctx.fillStyle = 'rgba(66,55,44,.25)';
      ctx.fillRect(0, 0, width, 1.1);
      ctx.fillRect(0, 0, 1.1, height);
      ctx.fillStyle = 'rgba(250,245,232,.40)';
      ctx.fillRect(1, 1, width, 0.7);
      ctx.fillRect(1, 1, 0.7, height);
    }
  });
}

function walnut() {
  const random = randomFrom(43);
  return texture(256, 512, (ctx, width, height) => {
    const image = ctx.createImageData(width, height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const wave = x + Math.sin(y * 0.011 + x * 0.025) * 3.2 + Math.sin(y * 0.022 + x * 0.017) * 1.4;
        const grain = Math.sin(wave * 0.71) * 4.5 + Math.sin(wave * 2.51) * 2.1
          + Math.cos(wave * 0.082 + Math.sin(y * 0.013)) * 8 + (random() - 0.5) * 4;
        image.data[i] = 128 + grain;
        image.data[i + 1] = 91 + grain * 0.83;
        image.data[i + 2] = 67 + grain * 0.68;
        image.data[i + 3] = 255;
      }
    }
    ctx.putImageData(image, 0, 0);
  });
}

function baked(color, extra = {}) {
  const material = new THREE.MeshBasicMaterial({ color, vertexColors: true, toneMapped: false, ...extra });
  material.userData.baked = material.vertexColors;
  return material;
}

function floorLightMap(interior) {
  const halfWidth = interior ? ROOM.halfWidth : CONCOURSE.halfWidth;
  const depth = interior ? ROOM.depth : CONCOURSE.depth;
  const nearZ = interior ? -ROOM.depth : 0;
  const map = texture(512, 384, (ctx, width, height) => {
    const px = x => (x / (halfWidth * 2) + 0.5) * width;
    const py = z => (z - nearZ) / depth * height;
    const illumination = ctx.createLinearGradient(0, 0, width * 0.8, height);
    illumination.addColorStop(0, interior ? '#c5c3ba' : '#ebe6dd');
    illumination.addColorStop(0.48, interior ? '#e4e1d8' : '#fcfaf5');
    illumination.addColorStop(1, interior ? '#f5f1e8' : '#e5e0d6');
    ctx.fillStyle = illumination;
    ctx.fillRect(0, 0, width, height);

    if (!interior) {
      // Soft skylight mullion shadows projected in the direction of the daylight.
      ctx.save();
      ctx.filter = 'blur(1.9px)';
      ctx.strokeStyle = 'rgba(70,62,46,.23)';
      ctx.lineWidth = 3.4;
      const shiftX = CONCOURSE.height * 0.39;
      const shiftZ = CONCOURSE.height * -0.61;
      const line = (ax, az, bx, bz) => {
        ctx.beginPath();
        ctx.moveTo(px(ax + shiftX), py(az + shiftZ));
        ctx.lineTo(px(bx + shiftX), py(bz + shiftZ));
        ctx.stroke();
      };
      for (const x of [-4.17, -2.05, 0, 2.05, 4.17]) line(x, 0, x, depth + 4.0);
      for (let z = 0.5; z < depth + 4.0; z += 1.75) line(-4.17, z, 4.17, z);
      ctx.restore();
    }

    if (interior) {
      for (const { x, z } of DISPLAYS) {
        const cx = px(x);
        const cy = py(z + 0.22);
        const wash = ctx.createRadialGradient(cx, cy, 3, cx, cy, 69);
        wash.addColorStop(0, 'rgba(255,246,226,.61)');
        wash.addColorStop(0.5, 'rgba(252,244,223,.23)');
        wash.addColorStop(1, 'rgba(255,246,226,0)');
        ctx.fillStyle = wash;
        ctx.fillRect(cx - 69, cy - 69, 138, 138);
      }
    }

    const furniture = interior
      ? [...DISPLAYS, ...SIDE_BENCHES, SERVICE_DESK, ...STORE_PLANTERS]
      : [...PLANTERS, ...COLUMNS];
    for (const { x, z, width: w, depth: d } of furniture) {
      ctx.save();
      ctx.translate(px(x + 0.10), py(z - 0.05));
      ctx.scale(width * w / (halfWidth * 2) * 0.94, height * d / depth * 0.95);
      const shade = ctx.createRadialGradient(0, 0, 0.08, 0, 0, 1);
      shade.addColorStop(0, 'rgba(34,28,22,.65)');
      shade.addColorStop(0.46, 'rgba(34,28,22,.51)');
      shade.addColorStop(0.73, 'rgba(38,31,24,.19)');
      shade.addColorStop(1, 'rgba(38,31,24,0)');
      ctx.fillStyle = shade;
      ctx.fillRect(-1, -1, 2, 2);
      ctx.restore();
    }
  });
  map.channel = 1;
  return map;
}

export function palette() {
  const atriumTile = mineral([208, 198, 182], 271, true);
  const storeTile = mineral([217, 209, 195], 883, true);
  const limestone = mineral([218, 210, 192], 31);
  const countertop = mineral([232, 225, 211], 484);
  const wood = walnut();
  for (const map of [atriumTile, storeTile, limestone, wood]) {
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
  }
  return {
    concourse: baked(0xffffff, { map: atriumTile, lightMap: floorLightMap(false), lightMapIntensity: Math.PI }),
    store: baked(0xffffff, { map: storeTile, lightMap: floorLightMap(true), lightMapIntensity: Math.PI }),
    stone: baked(0xffffff, { map: limestone }),
    ceiling: baked(0xc7bcac),
    oak: baked(0xffffff, { map: wood }),
    darkOak: baked(0xd0bdab, { map: wood }),
    dark: baked(0x292c27),
    black: baked(0x191e1b),
    pine: baked(0x35483f),
    pineDark: baked(0x293b31),
    backPanel: baked(0xffffff, {
      map: texture(128, 128, (ctx, width, height) => {
        const wash = ctx.createRadialGradient(width * 0.49, height * 0.18, 0, width * 0.49, height * 0.22, width * 0.72);
        wash.addColorStop(0, '#46594c');
        wash.addColorStop(0.55, '#32453a');
        wash.addColorStop(1, '#263a30');
        ctx.fillStyle = wash;
        ctx.fillRect(0, 0, width, height);
      }),
    }),
    bronze: baked(0x9b7e59),
    desk: baked(0xb8aa90),
    table: baked(0xffffff, { map: countertop }),
    fabric: baked(0x756b5a),
    soil: baked(0x51473a),
    leaf: baked(0xa2af8a, { side: THREE.DoubleSide, vertexColors: false }),
    bark: baked(0x70563e),
    glass: new THREE.MeshBasicMaterial({
      map: texture(128, 128, (ctx, width, height) => {
        const glass = ctx.createLinearGradient(0, 0, width, height * 0.28);
        glass.addColorStop(0, 'rgba(167,198,191,.16)');
        glass.addColorStop(0.24, 'rgba(228,241,237,.24)');
        glass.addColorStop(0.30, 'rgba(244,249,247,.54)');
        glass.addColorStop(0.335, 'rgba(222,239,233,.19)');
        glass.addColorStop(0.73, 'rgba(229,242,237,.27)');
        glass.addColorStop(1, 'rgba(174,199,190,.14)');
        ctx.fillStyle = glass;
        ctx.fillRect(0, 0, width, height);
      }),
      transparent: true, opacity: 0.46, depthWrite: false, side: THREE.DoubleSide,
    }),
    skylight: new THREE.MeshBasicMaterial({ color: 0xe5edf2, toneMapped: false }),
    lamp: new THREE.MeshBasicMaterial({ color: 0xffeac4, toneMapped: false }),
  };
}

export function kit(root) {
  const cube = new THREE.BoxGeometry();
  const rounded = new Map();
  const shadowMap = texture(64, 64, (ctx, width, height) => {
    const gradient = ctx.createRadialGradient(32, 32, 5, 32, 32, 31);
    gradient.addColorStop(0, 'rgba(28,23,18,.63)');
    gradient.addColorStop(0.47, 'rgba(28,23,18,.34)');
    gradient.addColorStop(1, 'rgba(28,23,18,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  });
  const shadowMaterial = new THREE.MeshBasicMaterial({
    map: shadowMap, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1,
  });
  const patch = new THREE.PlaneGeometry();

  function mesh(geometry, material, position, options = {}) {
    const object = new THREE.Mesh(geometry, material);
    object.position.set(...position);
    (options.parent ?? root).add(object);
    return object;
  }

  function box(material, [w, h, d], position, options = {}) {
    const object = mesh(cube, material, position, options);
    object.scale.set(w, h, d);
    return object;
  }

  function softBox(material, [w, h, d], radius, position, options = {}) {
    const segments = options.parent ? 2 : 1;
    const key = [w, h, d, radius, segments].join('/');
    if (!rounded.has(key)) rounded.set(key, new RoundedBoxGeometry(w, h, d, segments, radius));
    return mesh(rounded.get(key), material, position, options);
  }

  function surface(material, w, h, position, rotation = [0, 0, 0], repeat = [1, 1]) {
    const geometry = new THREE.PlaneGeometry(w, h);
    const uv = geometry.attributes.uv;
    if (material.lightMap) geometry.setAttribute('uv1', uv.clone());
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * repeat[0], uv.getY(i) * repeat[1]);
    const object = mesh(geometry, material, position);
    object.rotation.set(...rotation);
    return object;
  }

  function shadow(x, y, z, w, depth, parent = root) {
    const object = mesh(patch, shadowMaterial, [x, y, z], { parent });
    object.rotation.x = -Math.PI / 2;
    object.scale.set(w, depth, 1);
    return object;
  }

  function sign(lines, w, h, position, options = {}) {
    const map = texture(options.resolution ?? 768, options.canvasHeight ?? 176, (ctx, width, height) => {
      if (options.background) {
        ctx.fillStyle = options.background;
        ctx.fillRect(0, 0, width, height);
      }
      ctx.textAlign = options.align ?? 'center';
      ctx.textBaseline = 'middle';
      for (const { value, y, size, color = '#eee8db', spacing = 3, weight = 600 } of lines) {
        ctx.font = `${weight} ${size}px Arial`;
        ctx.letterSpacing = `${spacing}px`;
        ctx.fillStyle = color;
        ctx.fillText(value, options.align === 'left' ? width * 0.065 : width / 2, height * y, width * 0.91);
      }
    });
    const material = new THREE.MeshBasicMaterial({
      map, transparent: !options.background, toneMapped: false, depthWrite: Boolean(options.background),
    });
    const object = mesh(new THREE.PlaneGeometry(w, h), material, position, { parent: options.parent });
    if (options.rotation) object.rotation.set(...options.rotation);
    return object;
  }

  return { mesh, box, softBox, surface, shadow, sign };
}

function bakeSurfaceLight(geometry) {
  const normal = geometry.attributes.normal;
  const position = geometry.attributes.position;
  const colors = new Float32Array(position.count * 3);
  for (let i = 0; i < position.count; i++) {
    const nx = normal.getX(i);
    const ny = normal.getY(i);
    const nz = normal.getZ(i);
    const y = position.getY(i);
    const daylight = Math.max(0, -0.35 * nx + 0.78 * ny + 0.52 * nz);
    const softFill = Math.max(0, 0.50 * nx + 0.32 * nz);
    const bounce = 0.75 + 0.12 * Math.max(0, ny) - 0.10 * Math.max(0, -ny);
    const groundOcclusion = ny < 0.3 ? Math.min(0.09, Math.max(0, y) * 0.13) : 0.09;
    const light = bounce + groundOcclusion + 0.27 * daylight + 0.13 * softFill;
    colors[i * 3] = light * 1.016;
    colors[i * 3 + 1] = light;
    colors[i * 3 + 2] = light * 0.965;
  }
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
}

// Bake diffuse light once and merge static opaque meshes by material.
export function batchStatic(root) {
  root.updateMatrixWorld(true);
  const batches = new Map();
  root.traverse(object => {
    if (!object.isMesh || object.isInstancedMesh || object.material.transparent || Array.isArray(object.material)) return;
    const { material } = object;
    if (!batches.has(material)) batches.set(material, []);
    batches.get(material).push(object);
  });
  for (const [material, objects] of batches) {
    if (objects.length < 2 && !material.userData.baked) continue;
    const keepIndices = objects.every(object => object.geometry.index);
    const pieces = objects.map(object => {
      const source = object.geometry.index && !keepIndices ? object.geometry.toNonIndexed() : object.geometry.clone();
      source.applyMatrix4(object.matrixWorld);
      if (material.userData.baked) bakeSurfaceLight(source);
      return source;
    });
    const geometry = pieces.length === 1 ? pieces[0] : mergeGeometries(pieces);
    if (pieces.length > 1) pieces.forEach(piece => piece.dispose());
    if (!geometry) continue;
    objects.forEach(object => object.removeFromParent());
    root.add(new THREE.Mesh(geometry, material));
  }
}
