const NOMINAL_FRAME_MS = 1000 / 60;
export const STALL_MS = 250;
const RAMP = 0.22;
const rampProgress = t => (t - RAMP * Math.sin(Math.PI * t / RAMP) / Math.PI) / (2 * (1 - RAMP));

// A stalled frame resumes with a normal step. Ordinary delays can use one 24 fps step.
export function cameraStep(interval) {
  if (interval >= STALL_MS) return NOMINAL_FRAME_MS;
  return Math.min(1000 / 24, Math.max(0, interval ?? NOMINAL_FRAME_MS));
}

// Integrate a smooth acceleration ramp into a constant-speed middle section.
export function routeProgress(fraction) {
  if (fraction < RAMP) return rampProgress(Math.max(0, fraction));
  if (fraction > 1 - RAMP) return 1 - rampProgress(Math.max(0, 1 - fraction));
  return (fraction - RAMP / 2) / (1 - RAMP);
}

export function routeDuration(metres) {
  return Math.max(540, Math.min(3950, 470 + metres * 295));
}

export function percentile95(samples) {
  if (!samples.length) return 0;
  const ordered = [...samples].sort((a, b) => a - b);
  return ordered[Math.ceil(ordered.length * 0.95) - 1];
}

export function summarizeTravel({ started, intervals, renderCosts, initialWait, pauses, clock, renders }, now) {
  const stalls = intervals.filter(ms => ms >= STALL_MS).length;
  const active = intervals.filter(ms => ms < STALL_MS);
  return {
    ms: Math.round(now - started),
    frames: renders,
    p95: Math.round(percentile95(intervals)),
    activeP95: Math.round(percentile95(active)),
    max: Math.round(Math.max(0, ...intervals)),
    stalls,
    pauses,
    cameraMs: Math.round(clock),
    renderP95: Math.round(percentile95(renderCosts) * 10) / 10,
    initialWait: Math.round(initialWait ?? 0),
  };
}
