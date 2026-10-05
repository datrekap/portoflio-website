import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { motionPreviewSrc } from "../../data/motionWork";
import "../../components/Work/WorkProjectCard.css";

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

export default function MotionProjectCard({ project, onOpen, paused = false }) {
  const cardRef = useRef(null);
  const gridRef = useRef(null);
  const gridShiftRef = useRef(null);
  const gridTweenRef = useRef(null);
  const videoRef = useRef(null);
  const rafRef = useRef(null);
  const targetOffsetRef = useRef({ x: 0, y: 0 });
  const currentOffsetRef = useRef({ x: 0, y: 0 });
  const isHoveredRef = useRef(false);
  const inViewRef = useRef(false);
  const [isHovered, setIsHovered] = useState(false);
  const [gridLines, setGridLines] = useState({ v: [], h: [] });
  const [inView, setInView] = useState(false);
  const [previewLoaded, setPreviewLoaded] = useState(false);

  const canHover =
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const shouldAnimatePreview = !prefersReducedMotion();
  const src = motionPreviewSrc(project.preview);

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

  const syncPlayback = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (paused || !inViewRef.current || !shouldAnimatePreview) {
      video.pause();
      return;
    }
    video.play().catch(() => {});
  }, [paused, shouldAnimatePreview]);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.isIntersecting;
        setInView(entry.isIntersecting);
        if (entry.isIntersecting) setPreviewLoaded(true);
      },
      { threshold: 0.2, rootMargin: "200px 0px" },
    );
    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    syncPlayback();
  }, [inView, paused, syncPlayback]);

  // Seek just before the natural end so the browser does not hitch on
  // ended → loop. Previews are encoded without B-frames for instant seeks.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !shouldAnimatePreview) return undefined;

    const LOOP_PAD = 0.04;
    const wrap = () => {
      if (!video.duration || Number.isNaN(video.duration)) return;
      if (video.currentTime >= video.duration - LOOP_PAD) {
        video.currentTime = 0;
      }
    };

    if (typeof video.requestVideoFrameCallback === "function") {
      let handle = 0;
      const onFrame = () => {
        wrap();
        handle = video.requestVideoFrameCallback(onFrame);
      };
      handle = video.requestVideoFrameCallback(onFrame);
      return () => video.cancelVideoFrameCallback(handle);
    }

    video.addEventListener("timeupdate", wrap);
    return () => video.removeEventListener("timeupdate", wrap);
  }, [shouldAnimatePreview, src]);

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

  useEffect(
    () => () => {
      stopGridAnimation();
      stopGridFollow();
    },
    [stopGridAnimation, stopGridFollow],
  );

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
    if (settling) rafRef.current = requestAnimationFrame(tickGridFollow);
    else rafRef.current = null;
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
    stopGridAnimation();
    if (prefersReducedMotion()) {
      gsap.set(root, { opacity: GRID_REST_OPACITY });
      gsap.set([vertical, horizontal], {
        scaleX: 1,
        scaleY: 1,
        backgroundColor: GRID_REST_COLOR,
      });
      return;
    }
    gsap.set(root, { opacity: GRID_REST_OPACITY });
    gsap.set(vertical, { scaleX: 1, scaleY: 0, backgroundColor: GRID_REST_COLOR });
    gsap.set(horizontal, { scaleX: 0, scaleY: 1, backgroundColor: GRID_REST_COLOR });
    const timeline = gsap.timeline();
    gridTweenRef.current = timeline;
    timeline.to(
      vertical,
      {
        scaleY: 1,
        duration: GRID_DRAW_DUR,
        ease: DRAW_EASE,
        stagger: { each: GRID_STAGGER, from: "center" },
      },
      0,
    );
    timeline.to(
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
    if (prefersReducedMotion()) {
      gsap.set(root, { opacity: 0 });
      return;
    }
    const timeline = gsap.timeline();
    gridTweenRef.current = timeline;
    timeline.to(root, { opacity: 0, duration: 0.32, ease: "power2.in" }, 0);
    timeline.to(
      vertical,
      {
        scaleY: 0,
        duration: 0.38,
        ease: "power2.in",
        stagger: { each: 0.01, from: "center" },
      },
      0,
    );
    timeline.to(
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

  const handleMouseEnter = useCallback(() => {
    if (!canHover || prefersReducedMotion()) return;
    isHoveredRef.current = true;
    setIsHovered(true);
    playGridIn();
  }, [canHover, playGridIn]);

  const handleMouseLeave = useCallback(() => {
    if (!canHover) return;
    isHoveredRef.current = false;
    setIsHovered(false);
    playGridOut();
    targetOffsetRef.current = { x: 0, y: 0 };
    startGridFollow();
  }, [canHover, playGridOut, startGridFollow]);

  const handleMouseMove = useCallback(
    (event) => {
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
    [canHover, startGridFollow],
  );

  const open = useCallback(() => {
    videoRef.current?.pause();
    onOpen(project);
  }, [onOpen, project]);

  const handleKeyDown = (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    open();
  };

  return (
    <article
      ref={cardRef}
      className={`work-project-card motion-work-card${
        isHovered ? " is-hovered" : ""
      }`}
      role="button"
      tabIndex={0}
      aria-label={`Watch ${project.title}`}
      onClick={open}
      onKeyDown={handleKeyDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      <div ref={gridRef} className="work-project-card__grid" aria-hidden="true">
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
        className={`work-project-card__media${isHovered ? " is-hovered" : ""} is-video-active`}
      >
        <div className="work-project-card__visual">
          <video
            ref={videoRef}
            className="work-project-card__video"
            src={previewLoaded ? src : undefined}
            muted
            loop
            playsInline
            autoPlay={shouldAnimatePreview && previewLoaded}
            preload={previewLoaded ? "metadata" : "none"}
            disableRemotePlayback
            aria-hidden="true"
            onLoadedData={syncPlayback}
          />
          {project.tags?.length ? (
            <ul
              className={`motion-work-card__tags${isHovered ? " is-visible" : ""}`}
              aria-hidden="true"
            >
              {project.tags.map((tag) => (
                <li key={tag} className="motion-work-card__tag">
                  {tag}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
      <div className="work-project-card__body">
        <div className="work-project-card__header">
          <h2 className="work-project-card__title">{project.title}</h2>
        </div>
        <p className="work-project-card__summary">{project.description}</p>
      </div>
    </article>
  );
}
