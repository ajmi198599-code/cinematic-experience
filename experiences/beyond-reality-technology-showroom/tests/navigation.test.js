import test from 'node:test';
import assert from 'node:assert/strict';
import { ANGLES, DISPLAYS, VIEWS, inspectionView, isClearSegment, isWalkable, planRoute, sampleRoute } from '../src/world.js';

const xz = ([x, , z]) => [x, z];
const destinations = [
  ...Object.values(VIEWS).map(view => xz(view.position)),
  ...DISPLAYS.flatMap(({ id }) => ANGLES.map((_, index) => xz(inspectionView(id, index).position))),
];

test('every camera destination and route clears walls and furniture', () => {
  for (const from of destinations) {
    for (const to of destinations) {
      const route = planRoute(from, to);
      assert.ok(route, `No route from ${from} to ${to}`);
      assert.deepEqual(route[0], from);
      assert.deepEqual(route.at(-1), to);
      assert.ok(route.slice(1).every((p, i) => isClearSegment(route[i], p)));
      const motion = sampleRoute(route);
      for (let step = 0; step <= 100; step++) {
        assert.ok(isWalkable(...motion.at(step / 100)));
      }
    }
  }
});

test('glass and display islands block direct movement', () => {
  assert.equal(isClearSegment([3.5, 1], [3.5, -1]), false);
  const { x, z } = DISPLAYS[0];
  assert.equal(isClearSegment([x, z + 2], [x, z - 2]), false);
  assert.equal(isClearSegment([0, 1], [0, -1]), true);
  assert.equal(planRoute([DISPLAYS[1].x, DISPLAYS[1].z], [0, 2]), null);
});

test('visitors at the perimeter can route through the door and around fixtures', () => {
  for (const from of [[-10.2, 5.8], [10.9, 0.8], [4.2, -10.8], [-4.4, -9.5]]) {
    for (const to of destinations) {
      const route = planRoute(from, to);
      assert.ok(route?.slice(1).every((p, i) => isClearSegment(route[i], p)));
    }
  }
});
