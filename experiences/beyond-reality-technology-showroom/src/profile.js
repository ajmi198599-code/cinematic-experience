import { percentile95, STALL_MS } from './motion.js';
import { createGpuProfile } from './gpu-profile.js';

const round = value => Math.round(value * 10) / 10;

export function createProfile(stage, context) {
  if (new URLSearchParams(location.search).get('profile') !== '1') return null;
  const phases = {};
  const gpu = createGpuProfile(context);
  const tasks = [];
  const longTasksAvailable = globalThis.PerformanceObserver?.supportedEntryTypes?.includes('longtask') ?? false;
  const consume = entries => {
    for (const { startTime, duration } of entries) tasks.push({ startTime, duration });
    if (tasks.length > 80) tasks.splice(0, tasks.length - 80);
  };
  const observer = longTasksAvailable ? new PerformanceObserver(list => consume(list.getEntries())) : null;
  observer?.observe({ type: 'longtask', buffered: true });
  const boot = performance.now();
  let startup = {};
  let route;
  let timer;
  let deferred;
  let startupTask;
  let paused = false;
  let disposed = false;
  let revision = 0;

  function taskStats(start, end) {
    if (observer) consume(observer.takeRecords());
    const matched = tasks.filter(task => task.startTime < end && task.startTime + task.duration > start);
    return { count: matched.length, maxMs: round(Math.max(0, ...matched.map(task => task.duration))) };
  }

  function cancel() {
    clearInterval(timer);
    clearTimeout(deferred);
    revision++;
    route = null;
  }

  function heartbeat() {
    clearInterval(timer);
    if (!route || paused) return;
    const active = route;
    timer = setInterval(() => {
      if (route !== active) return;
      active.ticks.push(performance.now());
      if (active.ticks.length > 160) active.ticks.shift();
    }, 75);
  }

  function publish(active, end, complete) {
    const { destination, started, gaps, work, callbacks, initialVisibility, initiallyFocused } = active;
    stage.dataset.profile = JSON.stringify({
      startup, longTasksAvailable,
      route: {
        destination, complete, initialVisibility, initiallyFocused,
        longTasks: taskStats(started, end), frameWorkP95Ms: round(percentile95(work)),
        callbackP95Ms: round(percentile95(callbacks)),
        gpu: gpu.result(),
        gaps: gaps.map(({ now, gap, visibility, focused, source, timerTicks }) => ({
          ms: round(gap), source, visibility, focused,
          timerTicks, heartbeatWindowLimited: gap > 12000,
          ...taskStats(now - gap, now),
        })),
      },
    });
  }

  function recordGap(now, gap, source) {
    if (!route || gap < STALL_MS || gap === null || route.gaps.length >= 12) return;
    route.gaps.push({
      now, gap, source, visibility: document.visibilityState, focused: document.hasFocus(),
      timerTicks: route.ticks.filter(t => t > now - gap && t < now).length,
    });
    publish(route, performance.now(), false);
  }

  return {
    phase(name, start) {
      const measure = performance.measure(`showroom:${name}`, { start, end: performance.now() });
      phases[name] = round(measure.duration);
    },
    ready(details) {
      const end = performance.now();
      startupTask = setTimeout(() => {
        if (disposed) return;
        startup = { ...details, phases, gpu: gpu.result(), longTasks: taskStats(boot, end) };
        if (route) publish(route, performance.now(), false);
        else stage.dataset.profile = JSON.stringify({ startup, longTasksAvailable });
      }, 0);
    },
    begin(destination) {
      cancel();
      gpu.reset();
      const started = performance.mark('showroom:journey-start').startTime;
      route = {
        destination, started, ticks: [], gaps: [], work: [], callbacks: [],
        initialVisibility: document.visibilityState, initiallyFocused: document.hasFocus(),
      };
      heartbeat();
    },
    beforeRender() { if (route) gpu.begin(); },
    afterRender() { if (route) gpu.end(); },
    frame(now, gap) {
      if (!route) return;
      route.work.push(performance.now() - now);
      if (gap !== null) route.callbacks.push(gap);
      recordGap(now, gap, 'submission');
    },
    nativeFrame(now, gap) {
      recordGap(now, gap, 'native');
    },
    finish() {
      if (!route) return;
      const end = performance.mark('showroom:journey-end').startTime;
      const active = route;
      const currentRevision = revision;
      clearInterval(timer);
      route = null;
      performance.measure('showroom:journey', { start: active.started, end });
      deferred = setTimeout(() => {
        if (!disposed && revision === currentRevision) publish(active, end, true);
      }, 0);
    },
    cancel,
    setPaused(value) {
      paused = value;
      heartbeat();
    },
    dispose() {
      disposed = true;
      clearTimeout(startupTask);
      cancel();
      observer?.disconnect();
      gpu.dispose();
    },
  };
}
