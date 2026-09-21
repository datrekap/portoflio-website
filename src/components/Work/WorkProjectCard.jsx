import React, { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { useWorkVideoTransition } from "../../context/WorkVideoTransitionContext";
import { prefetchCaseStudy } from "../../routes/caseStudyRoutes";
import { playPageExit } from "../../utils/pageExitAnimation";
import { resolveWorkProjectMedia } from "../../utils/workProjectMedia";
import ExhibitionBadge from "../ExhibitionBadge/ExhibitionBadge";
import "../ExhibitionBadge/ExhibitionBadge.css";
import "./WorkProjectCard.css";

const FOLLOW_OUT_MS = 400;
const COMING_SOON_HOVER_SRC = "/work/hover-effect-work.svg";
const GRID_MAX_OFFSET = 12;
const GRID_LERP = 0.14;
const GRID_REST_COLOR = "#333333";
const GRID_REST_OPACITY = 0.05;
const DRAW_EASE = "back.out(1.6)";
const GRID_DRAW_DUR = 0.62;
const GRID_STAGGER = 0.014;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function buildGridLines(root) {
  const size =
    parseFloat(getComputedStyle(root).getPropertyValue("--site-grid-size")) ||
    60;
  const width = root.offsetWidth;
  const height = root.offsetHeight;
  return {
    v: Array.from({ length: Math.ceil(width / size) + 1 }, (_, i) => i * size),
    h: Array.from({ length: Math.ceil(height / size) + 1 }, (_, i) => i * size),
  };
}

function gridLinesEqual(a, b) {
  return (
    a.v.length === b.v.length &&
    a.h.length === b.h.length &&
    a.v[a.v.length - 1] === b.v[b.v.length - 1] &&
    a.h[a.h.length - 1] === b.h[b.h.length - 1]
  );
}

const WorkProjectCard = forwardRef(function WorkProjectCard({ project }, ref) {
  const navigate = useNavigate();
  const {
    startTransition,
    enterOverlayPhase,
    claimVideo,
    getIsTransitioning,
  } = useWorkVideoTransition();
  const CardTag = project.route ? Link : "article";
  const showComingSoonHover = !project.route;
  const { imageSrc, hoverVideo } = resolveWorkProjectMedia(project.image);

  const cardRef = useRef(null);
  const mediaRef = useRef(null);
  const visualRef = useRef(null);
  const videoRef = useRef(null);
  const gridRef = useRef(null);
  const gridShiftRef = useRef(null);
  const gridTweenRef = useRef(null);
  const rafRef = useRef(null);
  const targetOffsetRef = useRef({ x: 0, y: 0 });
  const currentOffsetRef = useRef({ x: 0, y: 0 });
  const isHoveredRef = useRef(false);
  const followRef = useRef(null);
  const followPhaseRef = useRef("idle");
  const hideFollowTimerRef = useRef(0);
  const [followPhase, setFollowPhase] = useState("idle");
  const [gridLines, setGridLines] = useState({ v: [], h: [] });

  const [isHovered, setIsHovered] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [videoArmed, setVideoArmed] = useState(false);
  const [isMobile, setIsMobile] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 767px)").matches,
  );

  const canHover =
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const showVideo = Boolean(hoverVideo) && !videoFailed;
  const autoplayVideo = showVideo && isMobile;

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const sync = () => setIsMobile(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!autoplayVideo) return undefined;
    setVideoArmed(true);
    return undefined;
  }, [autoplayVideo]);

  useEffect(() => {
    if (!autoplayVideo) return undefined;
    const media = mediaRef.current;
    if (!media) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const video = videoRef.current;
        if (!video) return;
        if (entry.isIntersecting) {
          video.play().catch(() => setVideoFailed(true));
        } else {
          video.pause();
        }
      },
      { threshold: 0.2, rootMargin: "80px 0px" },
    );

    observer.observe(media);
    return () => observer.disconnect();
  }, [autoplayVideo, videoArmed]);

  const moveFollow = useCallback((clientX, clientY) => {
    if (!followRef.current) return;
    followRef.current.style.transform = `translate3d(${clientX}px, ${clientY}px, 0)`;
  }, []);

  const showFollow = useCallback(
    (clientX, clientY) => {
      if (!showComingSoonHover) return;
      if (hideFollowTimerRef.current) {
        window.clearTimeout(hideFollowTimerRef.current);
        hideFollowTimerRef.current = 0;
      }
      moveFollow(clientX, clientY);
      followPhaseRef.current = "in";
      setFollowPhase("in");
    },
    [moveFollow, showComingSoonHover],
  );

  const hideFollow = useCallback(() => {
    if (!showComingSoonHover) return;
    followPhaseRef.current = "out";
    setFollowPhase("out");
    if (hideFollowTimerRef.current) {
      window.clearTimeout(hideFollowTimerRef.current);
    }
    hideFollowTimerRef.current = window.setTimeout(() => {
      followPhaseRef.current = "idle";
      setFollowPhase("idle");
    }, FOLLOW_OUT_MS);
  }, [showComingSoonHover]);

  const stopGridAnimation = useCallback(() => {
    gridTweenRef.current?.kill();
    gridTweenRef.current = null;
  }, []);

  const stopGridFollow = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const tickGridFollow = useCallback(() => {
    const current = currentOffsetRef.current;
    const target = targetOffsetRef.current;

    current.x += (target.x - current.x) * GRID_LERP;
    current.y += (target.y - current.y) * GRID_LERP;

    if (gridShiftRef.current) {
      gridShiftRef.current.style.transform = `translate3d(${current.x}px, ${current.y}px, 0)`;
    }

    const settling =
      Math.abs(target.x - current.x) > 0.05 ||
      Math.abs(target.y - current.y) > 0.05 ||
      isHoveredRef.current;

    if (settling) {
      rafRef.current = requestAnimationFrame(tickGridFollow);
    } else {
      rafRef.current = null;
    }
  }, []);

  const startGridFollow = useCallback(() => {
    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(tickGridFollow);
    }
  }, [tickGridFollow]);

  const playGridIn = useCallback(() => {
    const root = gridRef.current;
    if (!root) return;
    const vertical = root.querySelectorAll(".work-project-card__grid-line--v");
    const horizontal = root.querySelectorAll(".work-project-card__grid-line--h");
    if (!vertical.length && !horizontal.length) return;

    stopGridAnimation();

    if (prefersReducedMotion()) {
      gsap.set(root, { opacity: GRID_REST_OPACITY });
      gsap.set(vertical, {
        scaleX: 1,
        scaleY: 1,
        backgroundColor: GRID_REST_COLOR,
      });
      gsap.set(horizontal, {
        scaleX: 1,
        scaleY: 1,
        backgroundColor: GRID_REST_COLOR,
      });
      return;
    }

    gsap.set(root, { opacity: GRID_REST_OPACITY });
    gsap.set(vertical, {
      scaleX: 1,
      scaleY: 0,
      backgroundColor: GRID_REST_COLOR,
    });
    gsap.set(horizontal, {
      scaleX: 0,
      scaleY: 1,
      backgroundColor: GRID_REST_COLOR,
    });

    const tl = gsap.timeline();
    gridTweenRef.current = tl;
    tl.to(
      vertical,
      {
        scaleY: 1,
        duration: GRID_DRAW_DUR,
        ease: DRAW_EASE,
        stagger: { each: GRID_STAGGER, from: "center" },
      },
      0,
    );
    tl.to(
      horizontal,
      {
        scaleX: 1,
        duration: GRID_DRAW_DUR,
        ease: DRAW_EASE,
        stagger: { each: GRID_STAGGER, from: "center" },
      },
      0,
    );
  }, [stopGridAnimation]);

  const playGridOut = useCallback(() => {
    const root = gridRef.current;
    if (!root) return;
    const vertical = root.querySelectorAll(".work-project-card__grid-line--v");
    const horizontal = root.querySelectorAll(".work-project-card__grid-line--h");
    stopGridAnimation();

    if (prefersReducedMotion() || (!vertical.length && !horizontal.length)) {
      gsap.set(root, { opacity: 0 });
      return;
    }

    const tl = gsap.timeline();
    gridTweenRef.current = tl;
    tl.to(root, { opacity: 0, duration: 0.32, ease: "power2.in" }, 0);
    tl.to(
      vertical,
      {
        scaleY: 0,
        duration: 0.38,
        ease: "power2.in",
        stagger: { each: 0.01, from: "center" },
      },
      0,
    );
    tl.to(
      horizontal,
      {
        scaleX: 0,
        duration: 0.38,
        ease: "power2.in",
        stagger: { each: 0.01, from: "center" },
      },
      0,
    );
  }, [stopGridAnimation]);

  const handleMouseMove = useCallback(
    (event) => {
      if (showComingSoonHover && canHover && followPhaseRef.current === "in") {
        moveFollow(event.clientX, event.clientY);
      }

      if (!canHover || !cardRef.current) return;

      const rect = cardRef.current.getBoundingClientRect();
      const xRatio = (event.clientX - rect.left) / rect.width - 0.5;
      const yRatio = (event.clientY - rect.top) / rect.height - 0.5;

      targetOffsetRef.current = {
        x: xRatio * GRID_MAX_OFFSET * 2,
        y: yRatio * GRID_MAX_OFFSET * 2,
      };
      startGridFollow();
    },
    [canHover, moveFollow, showComingSoonHover, startGridFollow],
  );

  const handleMouseEnter = useCallback(
    (event) => {
      if (showComingSoonHover && canHover) {
        showFollow(event.clientX, event.clientY);
      }

      if (!canHover) return;

      isHoveredRef.current = true;
      setIsHovered(true);
      playGridIn();
      if (showVideo) setVideoArmed(true);

      if (project.route) prefetchCaseStudy(project.route);

      const video = videoRef.current;
      if (showVideo && video) {
        video.currentTime = 0;
        video.play().catch(() => {
          setVideoFailed(true);
        });
      }
    },
    [
      canHover,
      playGridIn,
      project.route,
      showComingSoonHover,
      showFollow,
      showVideo,
    ],
  );

  const handleMouseLeave = useCallback(() => {
    if (showComingSoonHover && canHover) hideFollow();

    if (!canHover) return;

    isHoveredRef.current = false;
    setIsHovered(false);
    playGridOut();
    targetOffsetRef.current = { x: 0, y: 0 };
    startGridFollow();

    const video = videoRef.current;
    if (!video) return;

    window.setTimeout(() => {
      if (isHoveredRef.current) return;
      video.pause();
      video.currentTime = 0;
    }, 450);
  }, [canHover, hideFollow, playGridOut, showComingSoonHover, startGridFollow]);

  const handleComingSoonClick = useCallback(
    (event) => {
      if (!showComingSoonHover || canHover) return;
      event.preventDefault();
      if (followPhaseRef.current === "in") {
        hideFollow();
        return;
      }
      showFollow(event.clientX, event.clientY);
    },
    [canHover, hideFollow, showComingSoonHover, showFollow],
  );

  const handleVideoError = useCallback(() => {
    setVideoFailed(true);
  }, []);

  const handleNavigateClick = useCallback(
    (event) => {
      if (!project.route || !project.videoTransition || !canHover) return;

      const shouldAnimate =
        isHovered &&
        hoverVideo &&
        visualRef.current &&
        (videoRef.current || !videoFailed);

      if (!shouldAnimate) return;

      event.preventDefault();

      // A transition is already dissolving the page; swallow further clicks.
      if (getIsTransitioning()) return;

      const rect = visualRef.current.getBoundingClientRect();
      const currentTime = videoRef.current?.currentTime ?? 0;
      const usesClaimedVideo = claimVideo(videoRef.current);

      // Free the main thread for the transition and the destination's mount.
      stopGridAnimation();
      stopGridFollow();

      startTransition({
        projectId: project.id,
        videoSrc: hoverVideo,
        fromRect: {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        },
        currentTime,
        route: project.route,
        usesClaimedVideo,
        heroVideoCrop: project.heroVideoCrop,
      });

      const goToCaseStudy = () => {
        enterOverlayPhase();
        navigate(project.route);
      };

      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (reducedMotion || !cardRef.current) {
        goToCaseStudy();
        return;
      }

      // Dissolve the rest of the page first, then hand over to the overlay.
      playPageExit(cardRef.current, goToCaseStudy);
    },
    [
      project.route,
      project.id,
      project.videoTransition,
      project.heroVideoCrop,
      canHover,
      isHovered,
      hoverVideo,
      videoFailed,
      startTransition,
      enterOverlayPhase,
      claimVideo,
      getIsTransitioning,
      stopGridAnimation,
      stopGridFollow,
      navigate,
    ],
  );

  useEffect(() => {
    return () => {
      stopGridAnimation();
      stopGridFollow();
    };
  }, [stopGridAnimation, stopGridFollow]);

  useEffect(
    () => () => {
      if (hideFollowTimerRef.current) {
        window.clearTimeout(hideFollowTimerRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return undefined;

    const syncLines = () => {
      const next = buildGridLines(card);
      setGridLines((prev) => (gridLinesEqual(prev, next) ? prev : next));
    };

    syncLines();
    const observer = new ResizeObserver(syncLines);
    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!showComingSoonHover || canHover) return undefined;

    const onPointerDown = (event) => {
      if (followPhaseRef.current !== "in") return;
      if (cardRef.current?.contains(event.target)) return;
      hideFollow();
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [canHover, hideFollow, showComingSoonHover]);

  const setCardRef = useCallback(
    (node) => {
      cardRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  return (
    <CardTag
      ref={setCardRef}
      className={`work-project-card work-bento-item${
        showComingSoonHover ? " is-coming-soon" : ""
      }${isHovered ? " is-hovered" : ""}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      {...(project.route
        ? { to: project.route, onClick: handleNavigateClick }
        : { onClick: handleComingSoonClick })}
      data-project-id={project.id}
    >
      <div
        ref={gridRef}
        className="work-project-card__grid"
        aria-hidden="true"
      >
        <div ref={gridShiftRef} className="work-project-card__grid-shift">
          {gridLines.v.map((x, index) => (
            <span
              key={`v-${index}`}
              className="work-project-card__grid-line work-project-card__grid-line--v"
              style={{ left: `${x}px` }}
            />
          ))}
          {gridLines.h.map((y, index) => (
            <span
              key={`h-${index}`}
              className="work-project-card__grid-line work-project-card__grid-line--h"
              style={{ top: `${y}px` }}
            />
          ))}
        </div>
      </div>
      <div
        ref={mediaRef}
        className={`work-project-card__media${isHovered ? " is-hovered" : ""}${
          (isHovered && showVideo) || autoplayVideo ? " is-video-active" : ""
        }`}
      >
        <div ref={visualRef} className="work-project-card__visual">
          {!(autoplayVideo && !videoFailed) ? (
            <img
              src={imageSrc}
              alt=""
              className="work-project-card__image"
              loading="lazy"
              decoding="async"
            />
          ) : null}
          {(canHover && showVideo && videoArmed) || autoplayVideo ? (
            <video
              ref={videoRef}
              src={hoverVideo}
              className="work-project-card__video"
              autoPlay={autoplayVideo}
              muted
              playsInline
              loop
              preload="auto"
              aria-hidden="true"
              onError={handleVideoError}
              onCanPlay={(event) => {
                if (autoplayVideo) {
                  event.currentTarget.play().catch(() => {
                    setVideoFailed(true);
                  });
                  return;
                }
                if (canHover && !isHoveredRef.current) return;
                event.currentTarget.play().catch(() => {
                  setVideoFailed(true);
                });
              }}
            />
          ) : null}
        </div>
        {project.badges?.length ? (
          <div className="work-project-card__badges">
            {project.badges.map((badge) => (
              <ExhibitionBadge key={badge}>{badge}</ExhibitionBadge>
            ))}
          </div>
        ) : null}
      </div>

      <div className="work-project-card__body">
        <div className="work-project-card__header">
          <h2 className="work-project-card__title">{project.title}</h2>
          <p className="work-project-card__role">{project.role}</p>
        </div>
        <p className="work-project-card__summary">{project.summary}</p>
      </div>
      {showComingSoonHover
        ? createPortal(
            <div
              ref={followRef}
              className={`work-card-cursor-follow is-${followPhase}`}
              aria-hidden="true"
            >
              <div className="work-card-cursor-follow-anchor">
                <img
                  className="work-card-cursor-follow-art"
                  src={COMING_SOON_HOVER_SRC}
                  alt=""
                />
              </div>
            </div>,
            document.body,
          )
        : null}
    </CardTag>
  );
});

export default WorkProjectCard;
