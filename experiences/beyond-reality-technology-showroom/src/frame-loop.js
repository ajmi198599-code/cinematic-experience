const WATCHDOG_MS = 125;
const RECOVERY_MS = 32;

const browserClock = {
  now: () => performance.now(),
  requestFrame: callback => requestAnimationFrame(callback),
  cancelFrame: id => cancelAnimationFrame(id),
  setTimer: (callback, delay) => setTimeout(callback, delay),
  clearTimer: id => clearTimeout(id),
};

export function createFrameLoop({ draw, onNative, canDraw, canRecover }, clock = browserClock) {
  let nativeRequest = null;
  let timerRequest = null;
  let recovering = false;
  let healthyFrames = 0;
  let lastNative = null;
  let lastDraw = null;

  function clearTimer() {
    if (timerRequest) clock.clearTimer(timerRequest.id);
    timerRequest = null;
  }

  function scheduleTimer() {
    if (timerRequest || !nativeRequest || !canDraw() || !canRecover()) return;
    const ticket = {};
    timerRequest = ticket;
    ticket.id = clock.setTimer(() => {
      if (timerRequest !== ticket) return;
      timerRequest = null;
      if (!canDraw() || !canRecover()) return;
      if (!recovering) healthyFrames = 0;
      recovering = true;
      lastDraw = clock.now();
      draw(lastDraw, 'timer');
    }, recovering ? RECOVERY_MS : WATCHDOG_MS);
  }

  function request() {
    if (!canDraw()) return;
    if (!nativeRequest) {
      const ticket = {};
      nativeRequest = ticket;
      ticket.id = clock.requestFrame(timestamp => {
        if (nativeRequest !== ticket) return;
        nativeRequest = null;
        clearTimer();
        if (!canDraw()) return;
        const gap = lastNative === null ? null : timestamp - lastNative;
        lastNative = timestamp;
        if (gap !== null) {
          healthyFrames = gap <= 65 ? healthyFrames + 1 : 0;
          if (healthyFrames >= 4) recovering = false;
        }
        onNative(timestamp, gap);
        const now = clock.now();
        if (recovering && lastDraw !== null && now - lastDraw < 12) {
          request();
          return;
        }
        lastDraw = now;
        draw(now, 'native');
      });
    }
    if (!canRecover()) clearTimer();
    scheduleTimer();
  }

  return {
    request,
    get pending() { return nativeRequest !== null || timerRequest !== null; },
    refresh() {
      clearTimer();
      scheduleTimer();
    },
    stop() {
      if (nativeRequest) clock.cancelFrame(nativeRequest.id);
      nativeRequest = null;
      clearTimer();
      recovering = false;
      healthyFrames = 0;
      lastNative = lastDraw = null;
    },
  };
}
