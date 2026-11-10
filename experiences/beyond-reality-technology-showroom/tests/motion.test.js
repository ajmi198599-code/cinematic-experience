import test from 'node:test';
import assert from 'node:assert/strict';
import { cameraStep, percentile95, routeDuration, routeProgress, summarizeTravel, walkingStep } from '../src/motion.js';

test('camera time advances normally on smooth frames and bounds delayed steps', () => {
  assert.equal(cameraStep(16.7), 16.7);
  assert.equal(cameraStep(32), 32);
  assert.equal(cameraStep(50), 50);
  assert.equal(cameraStep(70), 50);
  assert.equal(cameraStep(1017), 1000 / 60);
  assert.equal(walkingStep(50), 1000 / 24);
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
    nativeP95: 1017, nativeMax: 1017, timerFrames: 0,
    nativeFrames: 5, nativeInitialWait: 30,
  });
  assert.equal(percentile95([]), 0);
});

test('timer recovery retains separate native frame cadence', () => {
  const report = summarizeTravel({
    started: 0, intervals: [32, 33, 32, 33], renderCosts: [0.7, 0.5],
    nativeIntervals: [1016], timerFrames: 4, clock: 130, renders: 5, pauses: 0,
  }, 160);
  assert.equal(report.p95, 33);
  assert.equal(report.nativeP95, 1016);
  assert.equal(report.timerFrames, 4);
});

test('a route with no native callback reports the cadence as unobserved', () => {
  const report = summarizeTravel({
    started: 0, intervals: [32, 32], renderCosts: [0.7],
    nativeIntervals: [], nativeFrames: 0, nativeInitialWait: null,
    timerFrames: 3, clock: 64, renders: 3, pauses: 0,
  }, 190);
  assert.equal(report.nativeP95, null);
  assert.equal(report.nativeMax, null);
  assert.equal(report.nativeInitialWait, null);
  assert.equal(report.timerFrames, 3);
});
