import test from 'node:test';
import assert from 'node:assert/strict';
import { createFrameLoop } from '../src/frame-loop.js';

function harness() {
  let time = 0;
  let nextId = 0;
  const frames = new Map();
  const timers = new Map();
  const draws = [];
  const native = [];
  const state = { moving: true, visible: true, focused: true };
  const loop = createFrameLoop({
    draw(now, source) {
      draws.push({ now, source });
      if (state.moving) loop.request();
      else loop.stop();
    },
    onNative(timestamp, gap) { native.push({ timestamp, gap }); },
    canDraw: () => state.visible,
    canRecover: () => state.moving && state.focused,
  }, {
    now: () => time,
    requestFrame(callback) {
      frames.set(++nextId, callback);
      return nextId;
    },
    cancelFrame: id => frames.delete(id),
    setTimer(callback, delay) {
      timers.set(++nextId, { callback, at: time + delay });
      return nextId;
    },
    clearTimer: id => timers.delete(id),
  });

  function advance(milliseconds) {
    const end = time + milliseconds;
    let next = [...timers].sort((a, b) => a[1].at - b[1].at)[0];
    while (next && next[1].at <= end) {
      const [id, task] = next;
      time = task.at;
      timers.delete(id);
      task.callback();
      assert.ok(frames.size <= 1 && timers.size <= 1, 'multiple pending render callbacks');
      next = [...timers].sort((a, b) => a[1].at - b[1].at)[0];
    }
    time = end;
  }

  function emitNative(milliseconds) {
    advance(milliseconds);
    const [id, callback] = frames.entries().next().value;
    frames.delete(id);
    callback(time);
  }
  return { loop, frames, timers, draws, native, state, advance, emitNative };
}

test('repeated requests share one native callback and one watchdog', () => {
  const h = harness();
  for (let i = 0; i < 20; i++) h.loop.request();
  assert.equal(h.frames.size, 1);
  assert.equal(h.timers.size, 1);
  h.emitNative(17);
  assert.equal(h.draws.length, 1);
  assert.equal(h.frames.size, 1);
  assert.equal(h.timers.size, 1);
});

test('a stationary draw stops both callback sources and stays idle', () => {
  const h = harness();
  h.state.moving = false;
  h.loop.request();
  assert.equal(h.timers.size, 0);
  h.emitNative(17);
  h.loop.refresh();
  h.advance(60000);
  assert.equal(h.draws.length, 1);
  assert.equal(h.frames.size, 0);
  assert.equal(h.timers.size, 0);
  assert.equal(h.loop.pending, false);
});

test('healthy native frames keep timer recovery dormant', () => {
  const h = harness();
  h.loop.request();
  for (let i = 0; i < 30; i++) h.emitNative(17);
  assert.equal(h.draws.length, 30);
  assert.ok(h.draws.every(frame => frame.source === 'native'));
  h.loop.stop();
  h.advance(2000);
  assert.equal(h.draws.length, 30);
});

test('missing native callbacks recover at 32 ms with one pending native request', () => {
  const h = harness();
  h.loop.request();
  const original = [...h.frames.keys()][0];
  h.advance(124);
  assert.equal(h.draws.length, 0);
  h.advance(1 + 32 * 30);
  assert.equal(h.draws.length, 31);
  assert.deepEqual(h.draws.slice(0, 3).map(frame => frame.now), [125, 157, 189]);
  assert.equal([...h.frames.keys()][0], original);
  assert.equal(h.frames.size, 1);
  assert.equal(h.timers.size, 1);
});

test('an adjacent native callback avoids a duplicate draw and later restores the watchdog', () => {
  const h = harness();
  h.loop.request();
  h.advance(125);
  h.emitNative(1);
  assert.equal(h.draws.length, 1);
  for (let i = 0; i < 4; i++) h.emitNative(17);
  assert.equal(h.draws.filter(frame => frame.source === 'timer').length, 1);
  const remaining = [...h.timers.values()][0].at - h.draws.at(-1).now;
  assert.equal(remaining, 125);
});

test('stale callbacks cannot draw or replace a restarted route', () => {
  const h = harness();
  h.loop.request();
  const staleNative = [...h.frames.values()][0];
  const staleTimer = [...h.timers.values()][0].callback;
  h.loop.stop();
  h.loop.request();
  const currentNative = [...h.frames.keys()][0];
  const currentTimer = [...h.timers.keys()][0];
  staleNative(1000);
  staleTimer();
  assert.equal(h.draws.length, 0);
  assert.equal([...h.frames.keys()][0], currentNative);
  assert.equal([...h.timers.keys()][0], currentTimer);
});

test('focus changes remove and rearm recovery without starting an idle loop', () => {
  const h = harness();
  h.loop.request();
  h.state.focused = false;
  h.loop.refresh();
  h.advance(1000);
  assert.equal(h.draws.length, 0);
  assert.equal(h.timers.size, 0);
  h.state.focused = true;
  h.loop.refresh();
  h.advance(125);
  assert.equal(h.draws.length, 1);
  h.loop.stop();
  h.loop.refresh();
  assert.equal(h.frames.size + h.timers.size, 0);
});

test('pausing or stopping a tour prevents queued recovery work', () => {
  const h = harness();
  h.loop.request();
  const queuedNative = [...h.frames.values()][0];
  const queuedTimer = [...h.timers.values()][0].callback;
  h.state.visible = false;
  h.loop.stop();
  queuedNative(1000);
  queuedTimer();
  h.advance(5000);
  assert.equal(h.draws.length, 0);
  assert.equal(h.loop.pending, false);
  h.state.visible = true;
  h.loop.request();
  h.emitNative(17);
  assert.equal(h.draws.length, 1);
});
