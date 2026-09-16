import { useLayoutEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import useTransitionGate from "./useTransitionGate";
import { scheduleScrollTriggerRefresh } from "../utils/scrollTriggerRefresh";

gsap.registerPlugin(ScrollTrigger);

/**
 * Rise-up-from-baseline animation (same as case study section titles).
 * Sets initial state opacity: 0, y: 30, then on scroll into view animates to opacity: 1, y: 0.
 * While a card-to-page video overlay is running, stays hidden and only starts
 * after the overlay finishes so first-screen content does not jump-cut in.
 * @param {React.RefObject} ref - Ref to the title/element
 * @param {Object} options
 * @param {string} [options.start="top 80%"] - ScrollTrigger start (e.g. "top 80%" when element enters view)
 * @param {number} [options.delay=0] - Delay in seconds before the rise animation runs
 * @param {number} [options.duration=1] - Tween duration in seconds
 * @param {number} [options.y=30] - Initial translateY in pixels
 * @param {boolean} [options.triggerOnMount=false] - If true, run animation on mount (for hero at top of page) instead of scroll
 */
export default function useRiseUpOnScroll(ref, options = {}) {
  const {
    start = "top 80%",
    delay = 0,
    duration = 1,
    y = 30,
    triggerOnMount = false,
  } = options;
  const runWhenSettled = useTransitionGate();

  useLayoutEffect(() => {
    const el = ref?.current;
    if (!el) return undefined;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let tween = null;
    let scrollTrigger = null;
    let timeoutId = null;

    gsap.set(el, { opacity: 0, y: reducedMotion ? 0 : y });

    const rise = () => {
      tween = gsap.to(el, {
        opacity: 1,
        y: 0,
        duration,
        ease: "power2.out",
        delay,
      });
    };

    const startReveal = () => {
      if (reducedMotion) {
        gsap.set(el, { opacity: 1, y: 0 });
        return;
      }

      if (triggerOnMount) {
        tween = gsap.to(el, {
          opacity: 1,
          y: 0,
          duration,
          delay: 0.15 + delay,
          ease: "power2.out",
        });
        return;
      }

      timeoutId = setTimeout(() => {
        scrollTrigger = ScrollTrigger.create({
          trigger: el,
          start,
          once: true,
          onEnter: rise,
        });
        scheduleScrollTriggerRefresh();
      }, 100);
    };

    const cancelGate = runWhenSettled(startReveal);

    return () => {
      cancelGate();
      if (timeoutId) clearTimeout(timeoutId);
      if (scrollTrigger) scrollTrigger.kill();
      if (tween) tween.kill();
    };
  }, [ref, start, delay, duration, y, triggerOnMount, runWhenSettled]);
}
