import { ScrollTrigger } from "gsap/ScrollTrigger";

let pendingFrame = null;

/**
 * Coalesce refresh requests into a single pass.
 *
 * A case study mounts dozens of reveal animations at once; refreshing per
 * instance costs a long frame right where the video transition lands.
 */
export function scheduleScrollTriggerRefresh() {
  if (pendingFrame !== null) return;
  pendingFrame = requestAnimationFrame(() => {
    pendingFrame = null;
    ScrollTrigger.refresh();
  });
}
