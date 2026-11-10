import test from 'node:test';
import assert from 'node:assert/strict';
import { createGpuProfile } from '../src/gpu-profile.js';

function context() {
  const extension = { TIME_ELAPSED_EXT: 1, GPU_DISJOINT_EXT: 2 };
  const status = { ready: false, disjoint: false, deletes: 0, starts: 0 };
  const gl = {
    QUERY_RESULT_AVAILABLE: 3, QUERY_RESULT: 4,
    getExtension: () => extension,
    createQuery: () => ({}),
    beginQuery() { status.starts++; },
    endQuery() {},
    deleteQuery() { status.deletes++; },
    getParameter: () => status.disjoint,
    getQueryParameter: (_, parameter) => parameter === 3 ? status.ready : 2500000,
  };
  return { gl, status };
}

test('unsupported GPU queries remain explicitly unavailable', () => {
  const p = createGpuProfile({ getExtension: () => null });
  p.begin();
  p.end();
  assert.deepEqual(p.result(), { available: false, disjoint: false, samples: 0, p95Ms: null });
});

test('GPU results are read only after availability and stop after four samples', () => {
  const { gl, status } = context();
  const p = createGpuProfile(gl);
  p.begin();
  p.end();
  assert.equal(p.result().samples, 0);
  assert.equal(status.deletes, 0);
  status.ready = true;
  assert.equal(p.result().p95Ms, 2.5);
  for (let i = 0; i < 10; i++) { p.begin(); p.end(); p.result(); }
  assert.equal(p.result().samples, 4);
  assert.equal(status.starts, 4);
  assert.equal(status.deletes, 4);
});

test('disjoint results are discarded and pending queries are released', () => {
  const { gl, status } = context();
  const p = createGpuProfile(gl);
  p.begin();
  p.end();
  status.disjoint = true;
  assert.deepEqual(p.result(), { available: true, disjoint: true, samples: 0, p95Ms: null });
  assert.equal(status.deletes, 1);
  p.begin();
  assert.equal(status.starts, 1);
  p.reset();
  status.disjoint = false;
  p.begin();
  p.end();
  p.dispose();
  assert.equal(status.deletes, 2);
});
