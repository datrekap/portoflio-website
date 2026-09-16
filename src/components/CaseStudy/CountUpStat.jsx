import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import useTransitionGate from "../../hooks/useTransitionGate";
import { scheduleScrollTriggerRefresh } from "../../utils/scrollTriggerRefresh";

gsap.registerPlugin(ScrollTrigger);

/**
 * Count-up number that animates from 0 to `number` when it appears in view.
 * Pair with `Appear` so the rise-in and count-up start together.
 */
export default function CountUpStat({
  prefix = "",
  number,
  decimals = 0,
  suffix = "",
  color,
  label,
  className = "",
  valueClassName = "",
  labelClassName = "",
  prefixClassName = "",
  suffixClassName = "",
  delay = 0,
  duration = 1.4,
}) {
  const rootRef = useRef(null);
  const [display, setDisplay] = useState((0).toFixed(decimals));
  const runWhenSettled = useTransitionGate();

  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return undefined;

    const format = (value) => value.toFixed(decimals);
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let tween = null;
    let scrollTrigger = null;
    let timeoutId = null;

    if (!reducedMotion) {
      const obj = { value: 0 };
      setDisplay(format(0));

      tween = gsap.to(obj, {
        value: number,
        duration,
        delay,
        ease: "power2.out",
        paused: true,
        onUpdate: () => setDisplay(format(obj.value)),
      });
    }

    const startCount = () => {
      if (reducedMotion) {
        setDisplay(format(number));
        return;
      }

      timeoutId = setTimeout(() => {
        scrollTrigger = ScrollTrigger.create({
          trigger: el,
          start: "top 80%",
          once: true,
          onEnter: () => tween.play(),
        });
        scheduleScrollTriggerRefresh();
      }, 100);
    };

    const cancelGate = runWhenSettled(startCount);

    return () => {
      cancelGate();
      if (timeoutId) clearTimeout(timeoutId);
      if (scrollTrigger) scrollTrigger.kill();
      if (tween) tween.kill();
    };
  }, [number, decimals, delay, duration, runWhenSettled]);

  const formattedFinal = `${prefix}${number.toFixed(decimals)}${suffix}`;

  return (
    <div ref={rootRef} className={className}>
      <p
        className={valueClassName}
        style={{ color }}
        aria-label={formattedFinal}
      >
        {prefix ? (
          <span className={prefixClassName} aria-hidden="true">
            {prefix}
          </span>
        ) : null}
        <span aria-hidden="true">{display}</span>
        {suffix ? (
          <span className={suffixClassName} aria-hidden="true">
            {suffix}
          </span>
        ) : null}
      </p>
      {label ? <p className={labelClassName}>{label}</p> : null}
    </div>
  );
}
