import test from 'node:test';
import assert from 'node:assert/strict';
import { cameraStep, percentile95, routeDuration, routeProgress, summarizeTravel } from '../src/motion.js';

test('camera time advances normally on smooth frames and bounds delayed steps', () => {
  assert.equal(cameraStep(16.7), 16.7);
  assert.equal(cameraStep(32), 32);
  assert.equal(cameraStep(70), 1000 / 24);
  assert.equal(cameraStep(1017), 1000 / 60);
  assert.equal(cameraStep(0), 0);
  assert.equal(routeDuration(10), 3420);
});

test('guided routes ease in and out with a lower peak speed over the same duration', () => {
  assert.equal(routeProgress(0), 0);
  assert.equal(routeProgress(1), 1);
  assert.equal(routeProgress(0.5), 0.5);
  assert.ok(routeProgress(0.001) < 0.0001);
  for (let i = 1; i <= 1000; i++) {
    const step = routeProgress(i / 1000) - routeProgress((i - 1) / 1000);
    assert.ok(step >= 0 && step < 0.00129);
  }
});

test('the performance report separates raw stalls from active frame intervals', () => {
  const record = summarizeTravel({
    started: 100, intervals: [16, 17, 33, 1017], renderCosts: [1.2, 2.2, 7.8, 2],
    initialWait: 30, pauses: 0, clock: 110, renders: 5,
  }, 1213);
  assert.deepEqual(record, {
    ms: 1113, frames: 5, p95: 1017, activeP95: 33, max: 1017, stalls: 1, pauses: 0,
    cameraMs: 110, renderP95: 7.8, initialWait: 30,
  });
  assert.equal(percentile95([]), 0);
});
