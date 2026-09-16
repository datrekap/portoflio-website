import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLenis } from "@studio-freight/react-lenis";
import { gsap } from "gsap";
import Appear from "../../components/Appear/Appear";
import Footer from "../../components/Footer/Footer";
import { revealNav } from "../../constants/navTiming";
import {
  CaseStudyMediaProvider,
  useCaseStudyManagedVideo,
  useCaseStudyMedia,
} from "../../components/CaseStudy/CaseStudyMedia";
import { playTiles } from "../../data/playTiles";
import { playOverlays } from "../../data/playOverlays";
import PlayProjectOverlay from "./PlayProjectOverlay";
import PlayExhibitionBadge from "./PlayExhibitionBadge";
import PlayHeroRunner from "./PlayHeroRunner";
import "./Play.css";

const TILE_STAGGER = 0.05;
const CURSOR_FOLLOW_OUT_MS = 400;
const isVideoSrc = (src = "") => src.endsWith(".mp4");

function useFinePointerHover() {
  const [canHover, setCanHover] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setCanHover(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return canHover;
}

function usePlayTileCursorFollow(enabled) {
  const rootRef = useRef(null);
  const hideTimerRef = useRef(null);
  const [phase, setPhase] = useState("idle");
  const canHover = useFinePointerHover();
  const active = enabled && canHover;

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    };
  }, []);

  const moveTo = (clientX, clientY) => {
    if (!rootRef.current) return;
    rootRef.current.style.transform = `translate3d(${clientX}px, ${clientY}px, 0)`;
  };

  const onPointerEnter = (event) => {
    if (!active) return;
    if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    moveTo(event.clientX, event.clientY);
    setPhase("in");
  };

  const onPointerMove = (event) => {
    if (!active) return;
    moveTo(event.clientX, event.clientY);
  };

  const onPointerLeave = () => {
    if (!active) return;
    setPhase("out");
    if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    hideTimerRef.current = window.setTimeout(() => {
      setPhase("idle");
    }, CURSOR_FOLLOW_OUT_MS);
  };

  return {
    active,
    phase,
    rootRef,
    onPointerEnter,
    onPointerMove,
    onPointerLeave,
  };
}

function PlayViewIcon() {
  return (
    <svg
      className="play-tile-view-icon"
      viewBox="4 0 44 45"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="44" height="45" x="4" y="0" fill="var(--view-fill)" />
      <path
        d="M18.4402 18.5942C16.5525 19.2814 16.51 21.9357 18.3747 22.683L23.3981 24.6961C23.5831 24.7702 23.7298 24.9168 23.804 25.102L25.8171 30.1252C26.5643 31.99 29.2187 31.9475 29.9058 30.0599L34.8633 16.4424C35.4995 14.6951 33.8049 13.0006 32.0576 13.6367L18.4402 18.5942Z"
        stroke="var(--view-stroke)"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function PlayTileVideo({ id, src, poster, alt }) {
  const { reducedMotion, notifyReady } = useCaseStudyMedia();
  const { videoRef, shouldLoad } = useCaseStudyManagedVideo(id);

  return (
    <video
      ref={videoRef}
      className="play-tile-video"
      loop
      muted
      playsInline
      poster={poster}
      preload={shouldLoad ? "metadata" : "none"}
      src={shouldLoad ? src : undefined}
      aria-label={alt}
      onLoadedMetadata={(event) => {
        if (!reducedMotion) return;
        const video = event.currentTarget;
        try {
          video.currentTime = 0.001;
        } catch {
          /* ignore */
        }
        video.pause();
      }}
      onCanPlay={(event) => {
        if (reducedMotion) {
          event.currentTarget.pause();
          return;
        }
        notifyReady();
      }}
    />
  );
}

function PlayTile({ tile, index, onOpenOverlay }) {
  const labels = (tile.labels || []).slice(0, 2);
  const isOverlayTile = Boolean(tile.overlayId);
  const showView = Boolean(tile.showView) && !isOverlayTile;
  const cursorFollow = usePlayTileCursorFollow(isOverlayTile);

  const openOverlay = () => {
    if (tile.overlayId) onOpenOverlay(tile.overlayId);
  };

  return (
    <Appear
      as="figure"
      className={`play-tile ${tile.className}${isOverlayTile ? " is-clickable" : ""}`}
      delay={index * TILE_STAGGER}
    >
      <div
        className="play-tile-media"
        role={isOverlayTile ? "button" : undefined}
        tabIndex={isOverlayTile ? 0 : undefined}
        onClick={isOverlayTile ? openOverlay : undefined}
        onKeyDown={
          isOverlayTile
            ? (event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  openOverlay();
                }
              }
            : undefined
        }
        onPointerEnter={isOverlayTile ? cursorFollow.onPointerEnter : undefined}
        onPointerMove={isOverlayTile ? cursorFollow.onPointerMove : undefined}
        onPointerLeave={isOverlayTile ? cursorFollow.onPointerLeave : undefined}
      >
        {isVideoSrc(tile.src) ? (
          <PlayTileVideo
            id={tile.id}
            src={tile.src}
            poster={tile.poster}
            alt={tile.alt}
          />
        ) : (
          <img src={tile.src} alt={tile.alt} loading="lazy" decoding="async" />
        )}
        <PlayExhibitionBadge>{tile.badge}</PlayExhibitionBadge>
      </div>
      {cursorFollow.active
        ? createPortal(
            <div
              ref={cursorFollow.rootRef}
              className={`play-tile-cursor-follow is-${cursorFollow.phase}`}
              aria-hidden="true"
            >
              <div className="play-tile-cursor-follow-anchor">
                <img
                  className="play-tile-cursor-follow-art"
                  src="/play/hover-effect.svg"
                  alt=""
                />
              </div>
            </div>,
            document.body,
          )
        : null}
      {labels.length > 0 ? (
        <div className="play-tile-chips">
          {labels.map((label, labelIndex) => (
            <span key={`${tile.id}-${labelIndex}`} className="play-tile-chip">
              {label}
            </span>
          ))}
        </div>
      ) : null}
      {showView ? (
        tile.viewHref ? (
          <a
            className="play-tile-view"
            href={tile.viewHref}
            target="_blank"
            rel="noreferrer"
            aria-label="View"
            onClick={(event) => event.stopPropagation()}
          >
            <PlayViewIcon />
          </a>
        ) : (
          <button
            type="button"
            className="play-tile-view"
            aria-label="View"
            onClick={(event) => event.stopPropagation()}
          >
            <PlayViewIcon />
          </button>
        )
      ) : null}
    </Appear>
  );
}

const PLAY_ENTER = "back.out(1.8)";
const PLAY_FADE = "back.out(1.2)";
const PLAY_FLOOR_DUR = 0.85;
const PLAY_SKY_DUR = 0.8;
const PLAY_REST_DUR = 0.9;

const Play = () => {
  const lenis = useLenis();
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const titleInnerRef = useRef(null);
  const kickerRef = useRef(null);
  const timelineRef = useRef(null);
  const [openOverlayId, setOpenOverlayId] = useState(null);
  const overlay = openOverlayId ? playOverlays[openOverlayId] : null;
  const closeOverlay = useCallback(() => setOpenOverlayId(null), []);

  useLayoutEffect(() => {
    const hero = heroRef.current;
    const titleInner = titleInnerRef.current;
    const kicker = kickerRef.current;
    if (!hero || !titleInner) return undefined;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let attempts = 0;
    let frame = 0;

    const settle = (nodes) => {
      Object.entries(nodes).forEach(([key, node]) => {
        if (!node || (node.length !== undefined && !node.length)) return;
        // Score/start keep vertical centering via the CSS `translate` property;
        // clearing GSAP's transform avoids leaving them stuck lower than intended.
        if (key === "extras") {
          gsap.set(node, { clearProps: "transform,opacity,y" });
          gsap.set(node, { opacity: 1 });
          return;
        }
        gsap.set(node, { clearProps: "transform,opacity" });
        gsap.set(node, { opacity: 1, y: 0 });
      });
      revealNav();
    };

    const run = () => {
      const floor = hero.querySelector(".play-hero-floor");
      const skyline = hero.querySelector(".play-hero-skyline");
      const figure = hero.querySelector(".play-hero-runner-slot");
      const extras = hero.querySelectorAll(
        ".play-hero-hi, .play-hero-score, .play-hero-start",
      );

      if (!floor || !skyline || !figure) {
        attempts += 1;
        if (attempts < 30) {
          frame = requestAnimationFrame(run);
          return;
        }
        settle({ floor, skyline, figure, extras, titleInner, kicker });
        return;
      }

      if (reduced) {
        settle({ floor, skyline, figure, extras, titleInner, kicker });
        hero.classList.add("is-intro-ready");
        return;
      }

      gsap.set(floor, { opacity: 0, y: 56 });
      gsap.set(skyline, { opacity: 0, y: 28 });
      gsap.set(figure, { opacity: 0, y: 44 });
      gsap.set(titleInner, { opacity: 0, y: "110%" });
      if (kicker) gsap.set(kicker, { opacity: 0, y: 28 });
      if (extras.length) gsap.set(extras, { opacity: 0 });

      timelineRef.current = gsap.timeline({
        defaults: { ease: PLAY_ENTER },
        onComplete: () => {
          hero.classList.add("is-intro-ready");
          revealNav();
        },
      });

      // Floor first; buildings start halfway through floor;
      // figure/type/UI start halfway through buildings.
      const skyAt = PLAY_FLOOR_DUR * 0.5;
      const restAt = skyAt + PLAY_SKY_DUR * 0.5;

      timelineRef.current.to(
        floor,
        {
          opacity: 1,
          y: 0,
          duration: PLAY_FLOOR_DUR,
        },
        0,
      );

      timelineRef.current.to(
        skyline,
        {
          opacity: 1,
          y: 0,
          duration: PLAY_SKY_DUR,
        },
        skyAt,
      );

      timelineRef.current.to(
        figure,
        {
          opacity: 1,
          y: 0,
          duration: PLAY_REST_DUR,
        },
        restAt,
      );
      timelineRef.current.to(
        titleInner,
        {
          opacity: 1,
          y: "0%",
          duration: PLAY_REST_DUR,
        },
        restAt,
      );
      if (kicker) {
        timelineRef.current.to(
          kicker,
          {
            opacity: 1,
            y: 0,
            duration: PLAY_REST_DUR,
            ease: PLAY_FADE,
          },
          restAt,
        );
      }
      if (extras.length) {
        timelineRef.current.to(
          extras,
          {
            opacity: 1,
            duration: PLAY_REST_DUR * 0.9,
            stagger: 0.04,
            ease: PLAY_FADE,
          },
          restAt,
        );
      }
    };

    frame = requestAnimationFrame(run);

    return () => {
      cancelAnimationFrame(frame);
      if (timelineRef.current) {
        timelineRef.current.kill();
        timelineRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      let frameCount = 0;
      const maxFrames = 120;

      const preventScrollJump = () => {
        if (frameCount >= maxFrames) return;

        const currentScroll =
          window.scrollY || document.documentElement.scrollTop;

        if (currentScroll > 0) {
          window.scrollTo(0, 0);
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;

          if (lenis) {
            lenis.scrollTo(0, { duration: 0, immediate: true, force: true });
          }
        }

        frameCount++;
        requestAnimationFrame(preventScrollJump);
      };

      requestAnimationFrame(preventScrollJump);
    }, 50);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [lenis]);

  return (
    <main className="play-page">
      <section ref={heroRef} className="play-hero" aria-labelledby="play-title">
        <div className="page-content-shell play-hero-type">
          <h1 ref={titleRef} id="play-title" className="play-hero-title">
            <span ref={titleInnerRef} className="play-hero-title-inner">
              EXPERIMENTS
            </span>
          </h1>
          <p ref={kickerRef} className="play-hero-kicker">
            Inspired by the world{" "}
            <span className="play-hero-kicker-amp">&amp;</span> letting the
            world be inspired by me
          </p>
          <div id="play-hero-hi-slot" className="play-hero-hi-slot" />
        </div>

        <div className="play-hero-figure">
          <PlayHeroRunner paused={Boolean(overlay)} />
        </div>
      </section>

      <CaseStudyMediaProvider maxPlaying={16} playRootMargin="0px">
        <section className="play-mosaic-section" aria-label="Experiments">
          <div className="page-content-shell">
            <div className="play-mosaic">
              {playTiles.map((tile, index) => (
                <PlayTile
                  key={tile.id}
                  tile={tile}
                  index={index}
                  onOpenOverlay={setOpenOverlayId}
                />
              ))}
            </div>
          </div>
        </section>
      </CaseStudyMediaProvider>

      <Footer />

      {overlay ? (
        <PlayProjectOverlay
          overlay={overlay}
          onClose={closeOverlay}
        />
      ) : null}
    </main>
  );
};

export default Play;
