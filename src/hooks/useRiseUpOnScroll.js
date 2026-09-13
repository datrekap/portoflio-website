import { useLayoutEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useWorkVideoTransition } from "../context/WorkVideoTransitionContext";

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
  const { isTransitioning } = useWorkVideoTransition();

  useLayoutEffect(() => {
    if (!ref?.current) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      if (isTransitioning) {
        gsap.set(ref.current, { opacity: 0, y: 0 });
        return undefined;
      }
      gsap.set(ref.current, { opacity: 1, y: 0 });
      return undefined;
    }

    gsap.set(ref.current, { opacity: 0, y });

    if (isTransitioning) {
      return undefined;
    }

    if (triggerOnMount) {
      const tween = gsap.to(ref.current, {
        opacity: 1,
        y: 0,
        duration,
        delay: 0.15 + delay,
        ease: "power2.out",
      });
      return () => tween.kill();
    }

    let scrollTrigger = null;
    const timeoutId = setTimeout(() => {
      ScrollTrigger.refresh();
      scrollTrigger = ScrollTrigger.create({
        trigger: ref.current,
        start,
        once: true,
        onEnter: () => {
          gsap.to(ref.current, {
            opacity: 1,
            y: 0,
            duration,
            ease: "power2.out",
            delay,
          });
        },
      });
      ScrollTrigger.refresh();
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (scrollTrigger) scrollTrigger.kill();
    };
  }, [ref, start, delay, duration, y, triggerOnMount, isTransitioning]);
}
