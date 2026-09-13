import React, { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { useWorkVideoTransition } from "../../context/WorkVideoTransitionContext";
import "./WorkVideoTransitionOverlay.css";

const TRANSITION_MS = 920;
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

function attachClaimedVideo(shell, claimed, coverBottom) {
  if (!shell || !claimed || shell.contains(claimed)) return;

  claimed.className = "work-video-transition-video";
  claimed.muted = true;
  claimed.defaultMuted = true;
  claimed.removeAttribute("aria-hidden");
  claimed.style.cssText = coverBottom
    ? "display:block;"
    : "display:block;width:100%;height:100%;object-fit:cover;position:absolute;inset:0;";
  shell.appendChild(claimed);
}

function WorkVideoTransitionOverlay() {
  const { transition, completeTransition, getClaimedVideo } =
    useWorkVideoTransition();
  const shellRef = useRef(null);
  const fallbackVideoRef = useRef(null);
  const hasAnimatedRef = useRef(false);
  const hasCompletedRef = useRef(false);

  useEffect(() => {
    hasAnimatedRef.current = false;
    hasCompletedRef.current = false;
  }, [transition?.projectId, transition?.route]);

  const coverBottom = transition?.heroVideoCrop === "cover-bottom";

  const setShellRef = useCallback(
    (node) => {
      shellRef.current = node;
      if (node && transition?.usesClaimedVideo) {
        attachClaimedVideo(
          node,
          getClaimedVideo(),
          transition?.heroVideoCrop === "cover-bottom",
        );
      }
    },
    [transition?.usesClaimedVideo, transition?.heroVideoCrop, getClaimedVideo],
  );

  useLayoutEffect(() => {
    if (!transition?.usesClaimedVideo) return undefined;
    attachClaimedVideo(
      shellRef.current,
      getClaimedVideo(),
      transition?.heroVideoCrop === "cover-bottom",
    );
    return undefined;
  }, [
    transition?.usesClaimedVideo,
    transition?.fromRect,
    transition?.heroVideoCrop,
    getClaimedVideo,
  ]);

  useEffect(() => {
    if (!transition?.fromRect) return undefined;

    const shell = shellRef.current;
    const fallbackVideo = fallbackVideoRef.current;
    const video = transition.usesClaimedVideo
      ? getClaimedVideo()
      : fallbackVideo;
    if (!shell || !video) return undefined;

    const { fromRect, targetRect, currentTime = 0 } = transition;

    const applyFromRect = () => {
      shell.style.transition = "none";
      shell.style.opacity = "1";
      shell.style.top = `${fromRect.top}px`;
      shell.style.left = `${fromRect.left}px`;
      shell.style.width = `${fromRect.width}px`;
      shell.style.height = `${fromRect.height}px`;
    };

    applyFromRect();

    const syncPlayback = () => {
      if (!transition.usesClaimedVideo && Number.isFinite(currentTime)) {
        try {
          video.currentTime = currentTime;
        } catch {
          /* metadata may not be ready yet */
        }
      }
      video.play().catch(() => {});
    };

    if (!transition.usesClaimedVideo) {
      video.addEventListener("loadeddata", syncPlayback);
      if (video.readyState >= 2) syncPlayback();
      else syncPlayback();
    } else {
      syncPlayback();
    }

    const finishTransition = () => {
      if (hasCompletedRef.current) return;
      hasCompletedRef.current = true;
      completeTransition();
    };

    const isAnimating =
      transition.phase === "animating" && Boolean(targetRect);

    if (
      isAnimating &&
      targetRect &&
      !hasAnimatedRef.current
    ) {
      hasAnimatedRef.current = true;

      const changedProps = ["top", "left", "width", "height"].filter(
        (prop) => Math.abs(fromRect[prop] - targetRect[prop]) >= 0.5,
      );
      const finishedProps = new Set();

      const handleTransitionEnd = (event) => {
        if (event.target !== shell) return;
        if (!changedProps.includes(event.propertyName)) return;
        finishedProps.add(event.propertyName);
        if (finishedProps.size >= changedProps.length) finishTransition();
      };

      shell.addEventListener("transitionend", handleTransitionEnd);

      const fallbackTimer = window.setTimeout(
        finishTransition,
        TRANSITION_MS + 80,
      );

      requestAnimationFrame(() => {
        applyFromRect();
        shell.style.transition = `top ${TRANSITION_MS}ms ${EASE}, left ${TRANSITION_MS}ms ${EASE}, width ${TRANSITION_MS}ms ${EASE}, height ${TRANSITION_MS}ms ${EASE}`;
        shell.style.top = `${targetRect.top}px`;
        shell.style.left = `${targetRect.left}px`;
        shell.style.width = `${targetRect.width}px`;
        shell.style.height = `${targetRect.height}px`;
      });

      return () => {
        if (!transition.usesClaimedVideo) {
          video.removeEventListener("loadeddata", syncPlayback);
        }
        shell.removeEventListener("transitionend", handleTransitionEnd);
        window.clearTimeout(fallbackTimer);
      };
    }

    return () => {
      if (!transition.usesClaimedVideo) {
        video.removeEventListener("loadeddata", syncPlayback);
      }
    };
  }, [transition, completeTransition, getClaimedVideo]);

  if (!transition?.fromRect) {
    return null;
  }

  return (
    <div className="work-video-transition-layer" aria-hidden="true">
      <div
        ref={setShellRef}
        className={`work-video-transition-shell${
          coverBottom ? " work-video-transition-shell--cover-bottom work-video-transition-shell--pfal" : ""
        }${transition.phase === "animating" ? " is-animating" : ""}`}
      >
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
  );
}

export default WorkVideoTransitionOverlay;
