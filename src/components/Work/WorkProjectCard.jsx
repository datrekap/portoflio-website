import React, { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useWorkVideoTransition } from "../../context/WorkVideoTransitionContext";
import { prefetchCaseStudy } from "../../routes/caseStudyRoutes";
import { playPageExit } from "../../utils/pageExitAnimation";
import { resolveWorkProjectMedia } from "../../utils/workProjectMedia";
import ExhibitionBadge from "../ExhibitionBadge/ExhibitionBadge";
import "../ExhibitionBadge/ExhibitionBadge.css";
import "./WorkProjectCard.css";

const GRID_MAX_OFFSET = 12;
const GRID_LERP = 0.14;

const WorkProjectCard = forwardRef(function WorkProjectCard({ project }, ref) {
  const navigate = useNavigate();
  const {
    startTransition,
    enterOverlayPhase,
    claimVideo,
    getIsTransitioning,
  } = useWorkVideoTransition();
  const CardTag = project.route ? Link : "article";
  const { imageSrc, hoverVideo } = resolveWorkProjectMedia(project.image);

  const cardRef = useRef(null);
  const mediaRef = useRef(null);
  const visualRef = useRef(null);
  const videoRef = useRef(null);
  const gridRef = useRef(null);
  const rafRef = useRef(null);
  const targetOffsetRef = useRef({ x: 0, y: 0 });
  const currentOffsetRef = useRef({ x: 0, y: 0 });
  const isHoveredRef = useRef(false);

  const [isHovered, setIsHovered] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  const canHover =
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const showVideo = Boolean(hoverVideo) && !videoFailed;

  const stopGridAnimation = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const tickGrid = useCallback(() => {
    const current = currentOffsetRef.current;
    const target = targetOffsetRef.current;

    current.x += (target.x - current.x) * GRID_LERP;
    current.y += (target.y - current.y) * GRID_LERP;

    if (gridRef.current) {
      gridRef.current.style.transform = `translate3d(${current.x}px, ${current.y}px, 0)`;
    }

    const settling =
      Math.abs(target.x - current.x) > 0.05 ||
      Math.abs(target.y - current.y) > 0.05 ||
      isHoveredRef.current;

    if (settling) {
      rafRef.current = requestAnimationFrame(tickGrid);
    } else {
      rafRef.current = null;
    }
  }, []);

  const startGridAnimation = useCallback(() => {
    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(tickGrid);
    }
  }, [tickGrid]);

  const handleMouseMove = useCallback(
    (event) => {
      if (!canHover || !mediaRef.current) return;

      const rect = mediaRef.current.getBoundingClientRect();
      const xRatio = (event.clientX - rect.left) / rect.width - 0.5;
      const yRatio = (event.clientY - rect.top) / rect.height - 0.5;

      targetOffsetRef.current = {
        x: xRatio * GRID_MAX_OFFSET * 2,
        y: yRatio * GRID_MAX_OFFSET * 2,
      };
      startGridAnimation();
    },
    [canHover, startGridAnimation],
  );

  const handleMouseEnter = useCallback(() => {
    if (!canHover) return;

    isHoveredRef.current = true;
    setIsHovered(true);

    // Warm the case study chunk now so the click does not pay for it mid-transition.
    prefetchCaseStudy(project.route);

    const video = videoRef.current;
    if (showVideo && video) {
      video.currentTime = 0;
      video.play().catch(() => {
        setVideoFailed(true);
      });
    }
  }, [canHover, showVideo, project.route]);

  const handleMouseLeave = useCallback(() => {
    if (!canHover) return;

    isHoveredRef.current = false;
    setIsHovered(false);
    targetOffsetRef.current = { x: 0, y: 0 };
    startGridAnimation();

    const video = videoRef.current;
    if (!video) return;

    // Keep the last frame while the video fades out; reset after the crossfade
    // so badges/media don't hitch when the hover ends.
    window.setTimeout(() => {
      if (isHoveredRef.current) return;
      video.pause();
      video.currentTime = 0;
    }, 450);
  }, [canHover, startGridAnimation]);

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
      navigate,
    ],
  );

  useEffect(() => stopGridAnimation, [stopGridAnimation]);

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
      className="work-project-card work-bento-item"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...(project.route ? { to: project.route, onClick: handleNavigateClick } : {})}
      data-project-id={project.id}
    >
      <div
        ref={gridRef}
        className="work-project-card__grid"
        aria-hidden="true"
      />
      <div
        ref={mediaRef}
        className={`work-project-card__media${isHovered ? " is-hovered" : ""}${
          isHovered && showVideo ? " is-video-active" : ""
        }`}
        onMouseMove={handleMouseMove}
      >
        <div ref={visualRef} className="work-project-card__visual">
          <img
            src={imageSrc}
            alt=""
            className="work-project-card__image"
            loading="lazy"
          />
          {showVideo ? (
            <video
              ref={videoRef}
              src={hoverVideo}
              className="work-project-card__video"
              muted
              playsInline
              loop
              preload="metadata"
              aria-hidden="true"
              onError={handleVideoError}
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
    </CardTag>
  );
});

export default WorkProjectCard;
