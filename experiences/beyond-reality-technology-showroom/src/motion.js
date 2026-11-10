const NOMINAL_FRAME_MS = 1000 / 60;
export const STALL_MS = 250;

// A delayed frame can move the camera by at most one 24 fps step.
export function cameraStep(interval) {
  return Math.min(1000 / 24, Math.max(0, interval ?? NOMINAL_FRAME_MS));
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
