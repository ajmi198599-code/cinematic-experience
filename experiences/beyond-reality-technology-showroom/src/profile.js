import { percentile95, STALL_MS } from './motion.js';

const round = value => Math.round(value * 10) / 10;

export function createProfile(stage) {
  if (new URLSearchParams(location.search).get('profile') !== '1') return null;
  const phases = {};
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

  function taskStats(start, end) {
    if (observer) consume(observer.takeRecords());
    const matched = tasks.filter(task => task.startTime < end && task.startTime + task.duration > start);
    return { count: matched.length, maxMs: round(Math.max(0, ...matched.map(task => task.duration))) };
  }

  function cancel() {
    clearInterval(timer);
    route = null;
  }

  return {
    phase(name, start) {
      const measure = performance.measure(`showroom:${name}`, { start, end: performance.now() });
      phases[name] = round(measure.duration);
    },
    ready(details) {
      const end = performance.now();
      setTimeout(() => {
        startup = { ...details, phases, longTasks: taskStats(boot, end) };
        stage.dataset.profile = JSON.stringify({ startup, longTasksAvailable });
      }, 0);
    },
    begin(destination) {
      cancel();
      const started = performance.mark('showroom:journey-start').startTime;
      route = { destination, started, ticks: [], gaps: [], work: [], initialVisibility: document.visibilityState };
      const active = route;
      timer = setInterval(() => active.ticks.push(performance.now()), 75);
    },
    frame(now, gap, started) {
      if (!route) return;
      route.work.push(performance.now() - started);
      if (gap >= STALL_MS) route.gaps.push({ now, gap, visibility: document.visibilityState, focused: document.hasFocus() });
    },
    finish() {
      if (!route) return;
      const end = performance.mark('showroom:journey-end').startTime;
      const { destination, started, ticks, gaps, work, initialVisibility } = route;
      cancel();
      performance.measure('showroom:journey', { start: started, end });
      setTimeout(() => {
        stage.dataset.profile = JSON.stringify({
          startup, longTasksAvailable,
          route: {
            destination, initialVisibility, longTasks: taskStats(started, end), frameWorkP95Ms: round(percentile95(work)),
            gaps: gaps.map(({ now, gap, visibility, focused }) => ({
              ms: round(gap), visibility, focused,
              timerTicks: ticks.filter(t => t > now - gap && t < now).length,
              ...taskStats(now - gap, now),
            })),
          },
        });
      }, 0);
    },
    cancel,
    dispose() {
      cancel();
      observer?.disconnect();
    },
  };
}
