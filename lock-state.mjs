export function createLock(onChange, delay = 1000, clock = globalThis) {
  let locked = false, timer = null;
  const cancel = () => { if (timer !== null) clock.clearTimeout(timer); timer = null; };
  return {
    get locked() { return locked; },
    lock() { cancel(); locked = true; onChange(true); },
    hold() { cancel(); if (locked) timer = clock.setTimeout(() => { timer = null; locked = false; onChange(false); }, delay); },
    cancel,
  };
}
