import { useEffect } from "react";

/**
 * Infinite horizontal loop (same behavior as the TrojanStep dance strip).
 * Optionally drifts left at `driftSpeed` pixels per second while not dragging.
 * Set `enableDrag` to false for auto-loop only.
 */
export default function useInfiniteDragLoop(
  scrollerRef,
  trackRef,
  { driftSpeed = 0, enableDrag = true } = {},
) {
  useEffect(() => {
    const el = scrollerRef.current;
    const track = trackRef.current;
    if (!el || !track) return undefined;

    const xRef = { current: 0 };
    const dragRef = {
      active: false,
      startX: 0,
      pointerId: null,
    };
    let rafId = null;
    let lastTs = 0;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const speed = reducedMotion ? 0 : driftSpeed;

    const itemSpan = () => {
      const first = track.firstElementChild;
      if (!first) return 0;
      const styles = getComputedStyle(track);
      const gap = Number.parseFloat(styles.columnGap || styles.gap) || 0;
      return first.offsetWidth + gap;
    };

    const apply = () => {
      track.style.transform = `translate3d(${xRef.current}px, 0, 0)`;
    };

    const normalize = () => {
      const span = itemSpan();
      if (!span) return;

      while (xRef.current <= -span) {
        track.appendChild(track.firstElementChild);
        xRef.current += span;
      }

      while (xRef.current > 0) {
        track.insertBefore(track.lastElementChild, track.firstElementChild);
        xRef.current -= span;
      }

      apply();
    };

    const onPointerDown = (event) => {
      if (event.button != null && event.button !== 0) return;
      dragRef.active = true;
      dragRef.startX = event.clientX;
      dragRef.pointerId = event.pointerId;
      lastTs = 0;
      el.setPointerCapture(event.pointerId);
    };

    const onPointerMove = (event) => {
      if (!dragRef.active) return;
      if (event.pointerId !== dragRef.pointerId) return;
      event.preventDefault();
      xRef.current += event.clientX - dragRef.startX;
      dragRef.startX = event.clientX;
      normalize();
    };

    const endDrag = (event) => {
      if (!dragRef.active) return;
      if (event.pointerId !== dragRef.pointerId) return;
      dragRef.active = false;
      lastTs = 0;
    };

    const tick = (ts) => {
      if (!dragRef.active && speed > 0) {
        if (lastTs) {
          const dt = Math.min(48, ts - lastTs) / 1000;
          xRef.current -= speed * dt;
          normalize();
        }
        lastTs = ts;
      } else {
        lastTs = ts;
      }
      rafId = requestAnimationFrame(tick);
    };

    if (enableDrag) {
      el.addEventListener("pointerdown", onPointerDown);
      el.addEventListener("pointermove", onPointerMove, { passive: false });
      el.addEventListener("pointerup", endDrag);
      el.addEventListener("pointercancel", endDrag);
      el.addEventListener("lostpointercapture", endDrag);
    }

    const observer = new ResizeObserver(() => {
      normalize();
    });
    observer.observe(el);
    observer.observe(track);

    normalize();
    rafId = requestAnimationFrame(tick);

    return () => {
      if (rafId != null) cancelAnimationFrame(rafId);
      if (enableDrag) {
        el.removeEventListener("pointerdown", onPointerDown);
        el.removeEventListener("pointermove", onPointerMove);
        el.removeEventListener("pointerup", endDrag);
        el.removeEventListener("pointercancel", endDrag);
        el.removeEventListener("lostpointercapture", endDrag);
      }
      observer.disconnect();
    };
  }, [driftSpeed, enableDrag]);
}

