export const ROOM = { halfWidth: 6, depth: 11.4, height: 4.25, doorHalf: 2.17 };
export const CONCOURSE = { halfWidth: 12, depth: 11, height: 6.35 };
export const EYE_HEIGHT = 1.66;
export const TABLE_HEIGHT = 1.01;

export const DISPLAYS = [
  { id: 'headphones', x: -2.26, z: -6.25, width: 1.65, depth: 1.02, modelZ: 0.13, modelScale: 0.9, focusY: 1.24, rise: 0.20, markerY: 1.67, distance: 1.10, fov: 31 },
  { id: 'watch', x: 0, z: -8.37, width: 1.55, depth: 1.04, modelZ: 0.22, modelScale: 0.7, focusY: 1.12, rise: 0.10, markerY: 1.55, distance: 0.88, fov: 13.5 },
  { id: 'camera', x: 2.26, z: -6.25, width: 1.65, depth: 1.02, modelZ: 0.16, modelScale: 0.72, focusY: 1.105, rise: 0.13, markerY: 1.58, distance: 0.99, fov: 19.5 },
];

export const PLANTERS = [
  { x: -5.82, z: 3.62, width: 2.46, depth: 1.07 },
  { x: 5.82, z: 3.62, width: 2.46, depth: 1.07 },
];

export const COLUMNS = [-8.25, 8.25].map(x => ({ x, z: 2.3, width: 0.76, depth: 0.78 }));
export const SIDE_BENCHES = [-5.22, 5.22].map(x => ({ x, z: -7.84, width: 0.86, depth: 3.50 }));
export const STORE_PLANTERS = [-4.64, 4.64].map(x => ({ x, z: -10.10, width: 0.69, depth: 0.69 }));
export const SERVICE_DESK = { x: 0, z: -10.48, width: 3.7, depth: 0.58 };

export const VIEWS = {
  concourse: { position: [0.57, EYE_HEIGHT, 9.42], look: [0.10, 2.00, -1.5], fov: 55 },
  showroom: { position: [0, EYE_HEIGHT, -1.11], look: [0, 1.40, -7.65], fov: 57 },
};

export const ANGLES = [-44, 0, 44];
export const ENTRY_MARKER = [0, 1.14, 0.16];

export function inspectionView(id, angleIndex = 1) {
  const display = DISPLAYS.find(item => item.id === id);
  const angle = ANGLES[angleIndex] * Math.PI / 180;
  const z = display.z + display.modelZ;
  return {
    position: [
      display.x + Math.sin(angle) * display.distance,
      display.focusY + display.rise,
      z + Math.cos(angle) * display.distance,
    ],
    look: [display.x, display.focusY, z],
    fov: display.fov,
  };
}

const clearance = 0.25;
const limits = {
  minX: -CONCOURSE.halfWidth + 0.37, maxX: CONCOURSE.halfWidth - 0.37,
  minZ: -ROOM.depth + 0.32, maxZ: CONCOURSE.depth - 0.31,
};

function rectangle({ x, z, width, depth }) {
  return {
    minX: x - width / 2 - clearance, maxX: x + width / 2 + clearance,
    minZ: z - depth / 2 - clearance, maxZ: z + depth / 2 + clearance,
  };
}

const obstacles = [
  ...[...DISPLAYS, ...PLANTERS, ...COLUMNS, ...SIDE_BENCHES, ...STORE_PLANTERS, SERVICE_DESK].map(rectangle),
  { minX: -13, maxX: -ROOM.doorHalf + clearance, minZ: -0.43, maxZ: 0.43 },
  { minX: ROOM.doorHalf - clearance, maxX: 13, minZ: -0.43, maxZ: 0.43 },
  { minX: -13, maxX: -ROOM.halfWidth + 0.33, minZ: -12, maxZ: 0 },
  { minX: ROOM.halfWidth - 0.33, maxX: 13, minZ: -12, maxZ: 0 },
];

export function isWalkable(x, z) {
  return x > limits.minX && x < limits.maxX && z > limits.minZ && z < limits.maxZ
    && !obstacles.some(rect => x >= rect.minX && x <= rect.maxX && z >= rect.minZ && z <= rect.maxZ);
}

// A slab intersection checks the entire segment, including its endpoints.
function intersectsRect(a, b, rect) {
  let enter = 0;
  let exit = 1;
  for (const [axis, min, max] of [[0, rect.minX, rect.maxX], [1, rect.minZ, rect.maxZ]]) {
    const delta = b[axis] - a[axis];
    if (Math.abs(delta) < 1e-9) {
      if (a[axis] < min || a[axis] > max) return false;
      continue;
    }
    const lo = (min - a[axis]) / delta;
    const hi = (max - a[axis]) / delta;
    enter = Math.max(enter, Math.min(lo, hi));
    exit = Math.min(exit, Math.max(lo, hi));
    if (enter > exit) return false;
  }
  return true;
}

export function isClearSegment(a, b) {
  return isWalkable(...a) && isWalkable(...b) && !obstacles.some(rect => intersectsRect(a, b, rect));
}

const margin = 0.12;
const corners = obstacles.flatMap(({ minX, maxX, minZ, maxZ }) => [
  [minX - margin, minZ - margin], [minX - margin, maxZ + margin],
  [maxX + margin, minZ - margin], [maxX + margin, maxZ + margin],
]).filter(point => isWalkable(...point));

const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

function routeBetween(start, end) {
  if (isClearSegment(start, end)) return [start, end];
  const points = [start, end, ...corners];
  const cost = points.map(() => Infinity);
  const previous = points.map(() => -1);
  const visited = new Set();
  cost[0] = 0;
  while (visited.size < points.length) {
    let current = -1;
    for (let i = 0; i < points.length; i++) {
      if (!visited.has(i) && Number.isFinite(cost[i]) && (current < 0 || cost[i] < cost[current])) current = i;
    }
    if (current < 0) return null;
    if (current === 1) {
      const route = [];
      for (let i = current; i >= 0; i = previous[i]) route.unshift(points[i]);
      return route;
    }
    visited.add(current);
    for (let next = 1; next < points.length; next++) {
      if (visited.has(next) || !isClearSegment(points[current], points[next])) continue;
      const candidate = cost[current] + distance(points[current], points[next]);
      if (candidate < cost[next]) {
        cost[next] = candidate;
        previous[next] = current;
      }
    }
  }
  return null;
}

function softenCorners(points) {
  const route = [points[0]];
  for (let i = 1; i < points.length - 1; i++) {
    const [before, corner, after] = points.slice(i - 1, i + 2);
    const cut = Math.min(0.33, distance(before, corner) * 0.24, distance(corner, after) * 0.24);
    if (cut < 0.02) {
      route.push(corner);
      continue;
    }
    const incoming = mix(corner, before, cut / distance(before, corner));
    const outgoing = mix(corner, after, cut / distance(corner, after));
    const arc = Array.from({ length: 7 }, (_, step) => {
      const t = step / 6;
      return mix(mix(incoming, corner, t), mix(corner, outgoing, t), t);
    });
    const candidate = [route.at(-1), ...arc, after];
    route.push(...(candidate.slice(1).every((p, j) => isClearSegment(candidate[j], p)) ? arc : [corner]));
  }
  route.push(points.at(-1));
  return route;
}

export function planRoute(start, end) {
  if (!isWalkable(...start) || !isWalkable(...end)) return null;
  const crossesDoor = (start[1] > 0) !== (end[1] > 0);
  if (crossesDoor) {
    const threshold = [0, 0];
    const first = routeBetween(start, threshold);
    const second = routeBetween(threshold, end);
    return first && second ? softenCorners([...first, ...second.slice(1)]) : null;
  }
  const route = routeBetween(start, end);
  return route && softenCorners(route);
}

export function sampleRoute(points) {
  const lengths = points.slice(1).map((point, i) => distance(points[i], point));
  const length = lengths.reduce((sum, part) => sum + part, 0);
  return {
    length,
    at(fraction, target = []) {
      let offset = Math.max(0, Math.min(1, fraction)) * length;
      for (let i = 0; i < lengths.length; i++) {
        if (offset <= lengths[i] && lengths[i] > 0) {
          const [x, z] = points[i];
          const [nextX, nextZ] = points[i + 1];
          const t = offset / lengths[i];
          target[0] = x + (nextX - x) * t;
          target[1] = z + (nextZ - z) * t;
          return target;
        }
        offset -= lengths[i];
      }
      [target[0], target[1]] = points.at(-1);
      return target;
    },
  };
}
