import { percentile95 } from './motion.js';

export function createGpuProfile(gl) {
  const extension = gl.getExtension('EXT_disjoint_timer_query_webgl2');
  let pending = null;
  let active = null;
  let disjoint = false;
  const samples = [];

  function clear() {
    if (pending) gl.deleteQuery(pending);
    pending = null;
  }

  function poll() {
    if (!extension || !pending) return;
    if (gl.getParameter(extension.GPU_DISJOINT_EXT)) {
      disjoint = true;
      samples.length = 0;
      clear();
      return;
    }
    if (!gl.getQueryParameter(pending, gl.QUERY_RESULT_AVAILABLE)) return;
    samples.push(gl.getQueryParameter(pending, gl.QUERY_RESULT) / 1e6);
    clear();
  }

  return {
    begin() {
      poll();
      if (!extension || pending || active || disjoint || samples.length >= 4) return;
      active = gl.createQuery();
      if (active) gl.beginQuery(extension.TIME_ELAPSED_EXT, active);
    },
    end() {
      if (!active) return;
      gl.endQuery(extension.TIME_ELAPSED_EXT);
      pending = active;
      active = null;
    },
    reset() {
      clear();
      samples.length = 0;
      disjoint = false;
    },
    result() {
      poll();
      return {
        available: Boolean(extension), disjoint, samples: samples.length,
        p95Ms: samples.length ? Math.round(percentile95(samples) * 100) / 100 : null,
      };
    },
    dispose: clear,
  };
}
