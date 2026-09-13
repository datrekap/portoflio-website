import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useWorkVideoTransition } from "../../context/WorkVideoTransitionContext";
import {
  useCaseStudyManagedVideo,
  useCaseStudyMedia,
} from "./CaseStudyMedia";

export default function CaseStudyHeroVideo({
  projectId,
  videoSrc,
  posterSrc,
  posterAlt,
  heroMediaRef,
}) {
  const { videoRef } = useCaseStudyManagedVideo("page-hero", { eager: true });
  const { reducedMotion, register, setVisible, setInView, notifyReady } =
    useCaseStudyMedia();
  const mediaContainerRef = useRef(null);
  const location = useLocation();
  const { transition, registerTarget, isTransitioning, scrollToTopNow } =
    useWorkVideoTransition();
  const isIncomingTransition =
    Boolean(transition) &&
    transition.projectId === projectId &&
    (!transition.route || transition.route === location.pathname);
  const [revealed, setRevealed] = useState(!isIncomingTransition);
  const [videoFailed, setVideoFailed] = useState(false);
  const [hasTransferredVideo, setHasTransferredVideo] = useState(false);
  const hasRegisteredRef = useRef(false);

  useLayoutEffect(() => {
    if (!isIncomingTransition) {
      hasRegisteredRef.current = false;
      return undefined;
    }

    if (hasRegisteredRef.current) {
      return undefined;
    }

    const measureEl = mediaContainerRef.current || heroMediaRef.current;
    if (!measureEl) return undefined;

    const onComplete = ({ claimedVideo }) => {
      const mediaEl = mediaContainerRef.current;

      if (claimedVideo && mediaEl) {
        claimedVideo.muted = true;
        claimedVideo.defaultMuted = true;
        claimedVideo.className = "cs-hero-media__video pfal-hero-media__video";
        claimedVideo.style.cssText = "";
        mediaEl.prepend(claimedVideo);
        setHasTransferredVideo(true);
        setRevealed(true);
        register("page-hero", claimedVideo, 0);
        setVisible("page-hero", true);
        setInView("page-hero", true);
        if (!reducedMotion) claimedVideo.play().catch(() => {});
        return undefined;
      }

      const video = videoRef.current;
      setRevealed(true);
      if (!reducedMotion) video?.play().catch(() => {});
      return undefined;
    };

    scrollToTopNow();

    const readTargetRect = () => {
      scrollToTopNow();
      return measureEl.getBoundingClientRect();
    };

    const tryRegister = (rect) => {
      if (hasRegisteredRef.current) return true;
      if (!rect || rect.width < 8 || rect.height < 8) return false;
      hasRegisteredRef.current = true;
      registerTarget(
        {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        },
        onComplete,
      );
      return true;
    };

    let lastRect = null;
    let stableFrames = 0;
    let frames = 0;
    let rafId = 0;
    const maxFrames = 24;

    const tick = () => {
      if (hasRegisteredRef.current) return;
      frames += 1;
      const rect = readTargetRect();
      const sameSize =
        lastRect &&
        Math.abs(lastRect.width - rect.width) < 0.5 &&
        Math.abs(lastRect.height - rect.height) < 0.5 &&
        Math.abs(lastRect.top - rect.top) < 0.5 &&
        Math.abs(lastRect.left - rect.left) < 0.5;
      stableFrames = sameSize ? stableFrames + 1 : 0;
      lastRect = {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      };

      if (stableFrames >= 2 || frames >= maxFrames) {
        tryRegister(lastRect);
        return;
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [
    isIncomingTransition,
    heroMediaRef,
    projectId,
    registerTarget,
    register,
    setVisible,
    setInView,
    reducedMotion,
    scrollToTopNow,
    videoRef,
  ]);

  useEffect(() => {
    if (!isTransitioning && !isIncomingTransition) {
      setRevealed(true);
    }
  }, [isTransitioning, isIncomingTransition]);

  useEffect(() => {
    const el = mediaContainerRef.current;
    if (!el) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView("page-hero", entry.isIntersecting);
      },
      { rootMargin: "80px 0px", threshold: 0.01 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [setInView, hasTransferredVideo]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || reducedMotion || hasTransferredVideo) return undefined;
    if (isIncomingTransition && !revealed) return undefined;

    const tryPlay = () => {
      notifyReady();
      video.play().catch(() => {});
    };

    video.addEventListener("loadeddata", tryPlay);
    video.addEventListener("canplay", tryPlay);
    if (video.readyState >= 2) tryPlay();

    const retries = [50, 200, 500].map((ms) => window.setTimeout(tryPlay, ms));

    return () => {
      video.removeEventListener("loadeddata", tryPlay);
      video.removeEventListener("canplay", tryPlay);
      retries.forEach((id) => window.clearTimeout(id));
    };
  }, [
    videoSrc,
    revealed,
    isIncomingTransition,
    reducedMotion,
    hasTransferredVideo,
    notifyReady,
    videoRef,
  ]);

  const showVideo = !videoFailed;
  const holdForTransition = isIncomingTransition && !revealed;

  return (
    <div
      ref={mediaContainerRef}
      className={`cs-hero-media pfal-hero-media${revealed ? " is-revealed" : ""}${
        holdForTransition ? " is-transition-target" : ""
      }`}
    >
      {showVideo && !hasTransferredVideo ? (
        <video
          ref={videoRef}
          src={holdForTransition ? undefined : videoSrc}
          className="cs-hero-media__video pfal-hero-media__video"
          poster={posterSrc}
          muted
          playsInline
          loop
          autoPlay={!reducedMotion && !holdForTransition}
          preload={holdForTransition ? "none" : "auto"}
          onError={(event) => {
            const code = event.currentTarget.error?.code;
            if (code === 1) return;
            setVideoFailed(true);
          }}
        />
      ) : null}
      {!showVideo ? (
        <img
          src={posterSrc}
          alt={posterAlt}
          className="cs-hero-media__poster pfal-hero-media__poster"
          loading="eager"
        />
      ) : null}
    </div>
  );
}
