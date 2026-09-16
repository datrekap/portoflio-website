export const NAV_REVEAL_DURATION = 0.7;

/** Pages without an intro timeline reveal the nav shortly after mount (ms). */
export const NAV_REVEAL_DELAY_MS = 600;

/** Safety net so the nav still appears if an intro timeline never finishes (ms). */
export const NAV_REVEAL_TIMEOUT_MS = 6000;

const NAV_REVEAL_EVENT = "nav:reveal";

/** Call once a page's intro animation is done so the nav appears last. */
export function revealNav() {
  window.dispatchEvent(new CustomEvent(NAV_REVEAL_EVENT));
}

export function onNavReveal(handler) {
  window.addEventListener(NAV_REVEAL_EVENT, handler);
  return () => window.removeEventListener(NAV_REVEAL_EVENT, handler);
}
