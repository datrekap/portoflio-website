import React, { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { useWorkVideoTransition } from "../../context/WorkVideoTransitionContext";
import { resetPageExit } from "../../utils/pageExitAnimation";
import "./WorkVideoTransitionOverlay.css";

const TRANSITION_MS = 700;

/**
 * Number of samples used to bake the easing curve into the keyframe list.
 *
 * The window scale and the video counter-scale are related non-linearly, so
 * endpoint-only interpolation would drift. Pre-sampling lets the animation run
 * on the compositor while still tracing the exact curve.
 */
const EASE_SAMPLES = 24;

/** gsap's power3.inOut. */
function easeInOutCubic(progress) {
  return progress < 0.5
    ? 4 * progress * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 3) / 2;
}

/** Snap to the device pixel grid so the resting frame cannot shimmer. */
function snap(value) {
  const ratio = window.devicePixelRatio || 1;
  return Math.round(value * ratio) / ratio;
}

/**
 * Build transforms that carry the shell from the card's rect to its own layout
 * box, which is already the destination.
 *
 * The shell is the clipping window and takes a non-uniform scale. The inner
 * wrapper takes the reciprocal, plus a cover-fit factor, so the video keeps its
 * aspect ratio and `object-fit: cover` framing instead of squashing.
 */
function buildKeyframes(fromRect, targetRect, coverBottom) {
  const targetWidth = targetRect.width;
  const targetHeight = targetRect.height;
  const fromX = snap(fromRect.left - targetRect.left);
  const fromY = snap(fromRect.top - targetRect.top);
  const fromScaleX = fromRect.width / targetWidth;
  const fromScaleY = fromRect.height / targetHeight;

  const shell = [];
  const inner = [];

  for (let i = 0; i <= EASE_SAMPLES; i += 1) {
    const progress = easeInOutCubic(i / EASE_SAMPLES);
    const scaleX = fromScaleX + (1 - fromScaleX) * progress;
    const scaleY = fromScaleY + (1 - fromScaleY) * progress;
    const x = fromX * (1 - progress);
    const y = fromY * (1 - progress);

    const cover = Math.max(scaleX, scaleY);
    const counterX = cover / scaleX;
    const counterY = cover / scaleY;
    const offsetX = (targetWidth * (1 - counterX)) / 2;
    const offsetY = coverBottom
      ? targetHeight * (1 - counterY)
      : (targetHeight * (1 - counterY)) / 2;

    shell.push({
      transform: `translate3d(${x}px, ${y}px, 0) scale(${scaleX}, ${scaleY})`,
    });
    inner.push({
      transform: `translate3d(${offsetX}px, ${offsetY}px, 0) scale(${counterX}, ${counterY})`,
    });
  }

  return { shell, inner };
}

function attachClaimedVideo(inner, claimed) {
  if (!inner || !claimed || inner.contains(claimed)) return;

  claimed.className = "work-video-transition-video";
  claimed.muted = true;
  claimed.defaultMuted = true;
  claimed.removeAttribute("aria-hidden");
  claimed.style.cssText = "";
  inner.appendChild(claimed);
}

/**
 * Leave a still of the current frame in the overlay so reparenting the live
 * <video> cannot flash the page chrome or an empty black shell.
 */
function pinFreezeFrame(inner, video, coverBottom) {
  if (!inner || !video) return null;

  const width = Math.max(1, Math.round(inner.clientWidth || video.clientWidth || 1));
  const height = Math.max(
    1,
    Math.round(inner.clientHeight || video.clientHeight || 1),
  );
  const ratio = window.devicePixelRatio || 1;
  const canvas = document.createElement("canvas");
  canvas.className = "work-video-transition-freeze";
  canvas.width = Math.max(1, Math.round(width * ratio));
  canvas.height = Math.max(1, Math.round(height * ratio));
  canvas.setAttribute("aria-hidden", "true");

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const vw = video.videoWidth || width;
  const vh = video.videoHeight || height;
  if (vw < 2 || vh < 2) return null;

  // Match object-fit: cover. Cover-bottom heroes use a taller crop anchored
  // to the bottom (same idea as the 165% CSS rule).
  const sourceH = coverBottom ? vh / 1.65 : vh;
  const sourceY = coverBottom ? vh - sourceH : 0;
  const scale = Math.max(canvas.width / vw, canvas.height / sourceH);
  const dw = vw * scale;
  const dh = sourceH * scale;
  const dx = (canvas.width - dw) / 2;
  const dy = coverBottom ? canvas.height - dh : (canvas.height - dh) / 2;

  try {
    ctx.drawImage(video, 0, sourceY, vw, sourceH, dx, dy, dw, dh);
  } catch {
    return null;
  }

  inner.appendChild(canvas);
  return canvas;
}

function WorkVideoTransitionOverlay() {
  const { transition, completeTransition, getClaimedVideo } =
    useWorkVideoTransition();
  const shellRef = useRef(null);
  const innerRef = useRef(null);
  const fallbackVideoRef = useRef(null);
  const hasAnimatedRef = useRef(false);
  const hasCompletedRef = useRef(false);
  const hasSeekedRef = useRef(false);

  useEffect(() => {
    hasAnimatedRef.current = false;
    hasCompletedRef.current = false;
    hasSeekedRef.current = false;
  }, [transition?.projectId, transition?.route]);

  const coverBottom = transition?.heroVideoCrop === "cover-bottom";

  const setInnerRef = useCallback(
    (node) => {
      innerRef.current = node;
      if (node && transition?.usesClaimedVideo) {
        attachClaimedVideo(node, getClaimedVideo());
      }
    },
    [transition?.usesClaimedVideo, getClaimedVideo],
  );

  useLayoutEffect(() => {
    if (!transition?.usesClaimedVideo) return;
    attachClaimedVideo(innerRef.current, getClaimedVideo());
  }, [transition?.usesClaimedVideo, transition?.fromRect, getClaimedVideo]);

  useEffect(() => {
    if (!transition?.fromRect) return undefined;

    const shell = shellRef.current;
    const inner = innerRef.current;
    const video = transition.usesClaimedVideo
      ? getClaimedVideo()
      : fallbackVideoRef.current;
    if (!shell || !inner || !video) return undefined;

    const { fromRect, targetRect, currentTime = 0 } = transition;

    const syncPlayback = () => {
      // Seek only once. Re-seeking when the phase flips to "animating" would
      // snap playback backwards at the exact moment motion starts.
      if (
        !transition.usesClaimedVideo &&
        !hasSeekedRef.current &&
        Number.isFinite(currentTime)
      ) {
        try {
          video.currentTime = currentTime;
          hasSeekedRef.current = true;
        } catch {
          /* metadata may not be ready yet */
        }
      }
      video.play().catch(() => {});
    };

    if (!transition.usesClaimedVideo) {
      video.addEventListener("loadeddata", syncPlayback);
    }
    syncPlayback();

    const cleanupPlayback = () => {
      if (!transition.usesClaimedVideo) {
        video.removeEventListener("loadeddata", syncPlayback);
      }
    };

    const setShellBox = (rect) => {
      shell.style.top = `${snap(rect.top)}px`;
      shell.style.left = `${snap(rect.left)}px`;
      shell.style.width = `${snap(rect.width)}px`;
      shell.style.height = `${snap(rect.height)}px`;
    };

    const isAnimating = transition.phase === "animating" && Boolean(targetRect);

    if (!isAnimating) {
      // Park on the card until the destination reports its geometry.
      setShellBox(fromRect);
      shell.style.transform = "none";
      inner.style.transform = "none";
      return cleanupPlayback;
    }

    if (hasAnimatedRef.current) return cleanupPlayback;
    hasAnimatedRef.current = true;

    const frames = buildKeyframes(fromRect, targetRect, coverBottom);

    // Lay the shell out at its destination and offset it back onto the card in
    // the same write, so nothing but transforms changes once motion starts.
    setShellBox(targetRect);
    shell.style.transform = frames.shell[0].transform;
    inner.style.transform = frames.inner[0].transform;

    const settleTransforms = () => {
      shell.style.transform = "none";
      inner.style.transform = "none";
    };

    const finish = () => {
      if (hasCompletedRef.current) return;
      hasCompletedRef.current = true;

      settleTransforms();

      // Freeze the current frame in the overlay, then hand the live video to
      // the hero underneath. The still covers the shell until the hero has
      // painted, so neither #000 nor the page grey can flash through.
      const liveVideo = transition.usesClaimedVideo
        ? getClaimedVideo()
        : fallbackVideoRef.current;
      pinFreezeFrame(inner, liveVideo, coverBottom);

      resetPageExit();
      completeTransition();
    };

    if (typeof shell.animate !== "function") {
      // Composited CSS fallback; endpoint-only, so the counter-scale drifts a
      // little mid-flight but the start and end frames still line up.
      const easing = "cubic-bezier(0.65, 0, 0.35, 1)";
      const onEnd = (event) => {
        if (event.target !== shell || event.propertyName !== "transform") return;
        finish();
      };
      shell.addEventListener("transitionend", onEnd);

      const rafId = requestAnimationFrame(() => {
        shell.style.transition = `transform ${TRANSITION_MS}ms ${easing}`;
        inner.style.transition = `transform ${TRANSITION_MS}ms ${easing}`;
        shell.style.transform = "none";
        inner.style.transform = "none";
      });

      const fallbackTimer = window.setTimeout(finish, TRANSITION_MS + 120);

      return () => {
        cleanupPlayback();
        cancelAnimationFrame(rafId);
        shell.removeEventListener("transitionend", onEnd);
        window.clearTimeout(fallbackTimer);
      };
    }

    const options = {
      duration: TRANSITION_MS,
      easing: "linear",
      fill: "forwards",
    };
    const shellAnimation = shell.animate(frames.shell, options);
    const innerAnimation = inner.animate(frames.inner, options);

    const onFinished = () => {
      if (hasCompletedRef.current) return;
      try {
        shellAnimation.commitStyles?.();
        innerAnimation.commitStyles?.();
      } catch {
        /* commitStyles can throw if the element was detached */
      }
      shellAnimation.cancel();
      innerAnimation.cancel();
      finish();
    };

    shellAnimation.finished.then(onFinished).catch(() => {});
    const fallbackTimer = window.setTimeout(onFinished, TRANSITION_MS + 120);

    return () => {
      cleanupPlayback();
      window.clearTimeout(fallbackTimer);
      shellAnimation.cancel();
      innerAnimation.cancel();
    };
  }, [transition, coverBottom, completeTransition, getClaimedVideo]);

  if (!transition?.fromRect) {
    return null;
  }

  return (
    <div className="work-video-transition-layer" aria-hidden="true">
      <div
        className={`work-video-transition-backdrop${
          transition.phase === "exiting" ? "" : " is-covering"
        }`}
      />
      <div
        ref={shellRef}
        className={`work-video-transition-shell${
          coverBottom
            ? " work-video-transition-shell--cover-bottom work-video-transition-shell--pfal"
            : ""
        }${transition.phase === "animating" ? " is-animating" : ""}`}
      >
        <div ref={setInnerRef} className="work-video-transition-inner">
          {!transition.usesClaimedVideo ? (
            <video
              ref={fallbackVideoRef}
              src={transition.videoSrc}
              className="work-video-transition-video"
              muted
              playsInline
              loop
              autoPlay
              preload="auto"
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default WorkVideoTransitionOverlay;
