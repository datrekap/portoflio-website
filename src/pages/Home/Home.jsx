import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { gsap } from "gsap";
import { useLenis } from "@studio-freight/react-lenis";
import Appear from "../../components/Appear/Appear";
import PageShell from "../../components/PageShell/PageShell";
import WorkProjectCard from "../../components/Work/WorkProjectCard";
import HomePublications from "../../components/Publications/HomePublications";
import { workProjects } from "../../data/workProjects";
import { revealNav } from "../../constants/navTiming";
import { useLenisScroll } from "../../hooks/useLenisScroll";
import HomeHeroWalk from "./HomeHeroWalk";
import "./Home.css";

const APPEAR_STAGGER = 0.08;
const GRID_BOLD_SCALE = 1.5;
const GRID_BOLD_OPACITY = 1;
const GRID_BOLD_COLOR = "#000000";
const GRID_REST_COLOR = "#333333";
const GRID_REST_OPACITY = 0.05;
const DRAW_EASE = "back.out(1.6)";
const BOLD_EASE = "back.out(1.4)";
const FADE_EASE = "power2.out";
const ENTER_EASE = "back.out(1.8)";
const GRID_DRAW_DUR = 0.62;
const GRID_SETTLE_DUR = 0.68;
const GRID_STAGGER = 0.014;
/* Larger settle stagger = tighter center→out wave (less of the grid settles at once). */
const GRID_SETTLE_STAGGER = 0.02;
const TEXT_EASE = "power3.out";
/* Trial letter appear for the home name. Swap LETTER_TRIAL to try others later. */
const LETTER_TRIAL = "elastic-pop"; // elastic-pop | masked-rise | center-wave
const LETTER_EASE = "back.out(2.6)";
const HOME_TITLE = "DAKSH KAPOOR";
const HOME_SELECTED_WORK = workProjects.slice(0, 4);
/* Flip to true to restore the home “SEE MORE WORK” link to /work. */
const SHOW_HOME_SEE_MORE_WORK = false;

function splitTitleLetters(text) {
  return Array.from(text).map((char, index) => ({
    char,
    index,
    isSpace: char === " ",
  }));
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function buildGridLines(root) {
  const size =
    parseFloat(getComputedStyle(root).getPropertyValue("--home-grid-size")) ||
    60;
  const width = root.offsetWidth;
  const height = root.offsetHeight;
  return {
    v: Array.from({ length: Math.ceil(width / size) + 1 }, (_, i) => i * size),
    h: Array.from({ length: Math.ceil(height / size) + 1 }, (_, i) => i * size),
  };
}

function gridLinesKey(lines) {
  return `${lines.v.length}:${lines.v[lines.v.length - 1] ?? 0}|${lines.h.length}:${lines.h[lines.h.length - 1] ?? 0}`;
}

function settleGridLines(root) {
  if (!root) return;
  const vertical = root.querySelectorAll(".home-grid-line--v");
  const horizontal = root.querySelectorAll(".home-grid-line--h");
  gsap.killTweensOf(vertical);
  gsap.killTweensOf(horizontal);
  gsap.set(root, { opacity: GRID_REST_OPACITY });
  if (vertical.length) {
    gsap.set(vertical, {
      scaleX: 1,
      scaleY: 1,
      backgroundColor: GRID_REST_COLOR,
    });
  }
  if (horizontal.length) {
    gsap.set(horizontal, {
      scaleX: 1,
      scaleY: 1,
      backgroundColor: GRID_REST_COLOR,
    });
  }
}

function HomeGridOverlay({ overlayRef }) {
  const rootRef = useRef(null);
  const [lines, setLines] = useState({ v: [], h: [] });
  const initializedRef = useRef(false);
  const lenis = useLenis();

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    overlayRef.current = root;

    const syncLines = () => {
      const next = buildGridLines(root);
      setLines((prev) =>
        gridLinesKey(prev) === gridLinesKey(next) ? prev : next,
      );
    };

    syncLines();
    const observer = new ResizeObserver(syncLines);
    observer.observe(root);

    return () => {
      observer.disconnect();
      overlayRef.current = null;
    };
  }, [overlayRef]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || (!lines.v.length && !lines.h.length)) return;

    if (!initializedRef.current) {
      initializedRef.current = true;
      return;
    }

    settleGridLines(root);
  }, [lines]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const landing = root.closest(".home-landing");
    const reduced = prefersReducedMotion();

    const apply = () => {
      if (reduced || !landing) {
        root.style.setProperty("--home-grid-parallax-y", "0px");
        return;
      }
      const scrolled = Math.min(
        Math.max(-landing.getBoundingClientRect().top, 0),
        landing.offsetHeight,
      );
      root.style.setProperty(
        "--home-grid-parallax-y",
        `${scrolled * 0.32}px`,
      );
    };

    apply();

    if (reduced) return undefined;

    if (lenis) {
      lenis.on("scroll", apply);
      return () => lenis.off("scroll", apply);
    }

    window.addEventListener("scroll", apply, { passive: true });
    return () => window.removeEventListener("scroll", apply);
  }, [lenis, lines]);

  return (
    <div ref={rootRef} className="home-grid-overlay" aria-hidden="true">
      {lines.v.map((x, index) => (
        <span
          key={`v-${index}`}
          className="home-grid-line home-grid-line--v"
          style={{ left: `${x}px` }}
        />
      ))}
      {lines.h.map((y, index) => (
        <span
          key={`h-${index}`}
          className="home-grid-line home-grid-line--h"
          style={{ top: `${y}px` }}
        />
      ))}
    </div>
  );
}

const Home = () => {
  const location = useLocation();
  const { scrollToElement } = useLenisScroll();
  const landingRef = useRef(null);
  const overlayRef = useRef(null);
  const heroTitleRef = useRef(null);
  const bioRef = useRef(null);
  const walkerRef = useRef(null);
  const [bioReady, setBioReady] = useState(false);

  useLayoutEffect(() => {
    const landing = landingRef.current;
    const overlay = overlayRef.current;
    const titleEl = heroTitleRef.current;
    const bioEl = bioRef.current;
    if (!landing || !overlay || !titleEl || !bioEl) return undefined;

    const titleLetters = titleEl.querySelectorAll(".home-hero-letter");
    const bioLines = bioEl.querySelectorAll(".home-bio-line-inner");
    if (!titleLetters.length || !bioLines.length) return undefined;

    const reduced = prefersReducedMotion();
    setBioReady(false);

    let attempts = 0;
    let frame = 0;
    let tl = null;

    const finish = () => {
      walkerRef.current?.startIdleSpeech?.();
      setBioReady(true);
      revealNav();
    };

    const settleInstantly = ({ vertical, horizontal, floor, figure }) => {
      gsap.set(overlay, { opacity: GRID_REST_OPACITY });
      if (vertical?.length) {
        gsap.set(vertical, {
          scaleX: 1,
          scaleY: 1,
          backgroundColor: GRID_REST_COLOR,
        });
      }
      if (horizontal?.length) {
        gsap.set(horizontal, {
          scaleX: 1,
          scaleY: 1,
          backgroundColor: GRID_REST_COLOR,
        });
      }
      gsap.set(titleLetters, {
        y: 0,
        x: 0,
        scale: 1,
        rotation: 0,
        opacity: 1,
        filter: "blur(0px)",
      });
      gsap.set(bioLines, { y: 0 });
      if (floor) gsap.set(floor, { opacity: 1, y: 0 });
      if (figure) gsap.set(figure, { opacity: 1, y: 0 });
      finish();
    };

    const run = () => {
      const vertical = overlay.querySelectorAll(".home-grid-line--v");
      const horizontal = overlay.querySelectorAll(".home-grid-line--h");
      const floor = landing.querySelector(".home-hero-floor");
      const figure = landing.querySelector(".home-hero-walker-slot");

      if (!vertical.length || !horizontal.length) {
        attempts += 1;
        if (attempts < 30) {
          frame = requestAnimationFrame(run);
          return;
        }
        settleInstantly({ floor, figure });
        return;
      }

      if (reduced) {
        settleInstantly({ vertical, horizontal, floor, figure });
        return;
      }

      gsap.set(overlay, { opacity: GRID_BOLD_OPACITY });
      gsap.set(vertical, {
        scaleX: GRID_BOLD_SCALE,
        scaleY: 0,
        backgroundColor: GRID_BOLD_COLOR,
      });
      gsap.set(horizontal, {
        scaleX: 0,
        scaleY: GRID_BOLD_SCALE,
        backgroundColor: GRID_BOLD_COLOR,
      });
      if (LETTER_TRIAL === "masked-rise") {
        gsap.set(titleLetters, { y: "110%", opacity: 1, scale: 1, rotation: 0 });
      } else if (LETTER_TRIAL === "center-wave") {
        gsap.set(titleLetters, {
          y: 36,
          opacity: 0,
          scale: 0.7,
          filter: "blur(6px)",
        });
      } else {
        // elastic-pop trial (default)
        gsap.set(titleLetters, {
          y: "1.05em",
          scale: 0.4,
          opacity: 0,
          rotation: (i) => (i % 2 === 0 ? -12 : 12),
          transformOrigin: "50% 100%",
        });
      }
      gsap.set(bioLines, { y: "100%" });
      if (floor) gsap.set(floor, { opacity: 0, y: 64 });
      if (figure) gsap.set(figure, { opacity: 0, y: 44 });

      tl = gsap.timeline({ onComplete: finish });

      // Bold lines grow from the centre; settle starts mid-draw so there is
      // no pause between "appear thick" and "drop to default".
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

      tl.addLabel("settle", GRID_DRAW_DUR * 0.45);

      tl.to(
        vertical,
        {
          scaleX: 1,
          backgroundColor: GRID_REST_COLOR,
          duration: GRID_SETTLE_DUR,
          ease: BOLD_EASE,
          stagger: { each: GRID_SETTLE_STAGGER, from: "center" },
        },
        "settle",
      );
      tl.to(
        horizontal,
        {
          scaleY: 1,
          backgroundColor: GRID_REST_COLOR,
          duration: GRID_SETTLE_DUR,
          ease: BOLD_EASE,
          stagger: { each: GRID_SETTLE_STAGGER, from: "center" },
        },
        "settle",
      );
      tl.to(
        overlay,
        { opacity: GRID_REST_OPACITY, duration: GRID_SETTLE_DUR, ease: FADE_EASE },
        "settle",
      );

      if (floor) {
        tl.to(floor, { opacity: 1, y: 0, duration: 1, ease: ENTER_EASE }, "settle");
      }
      if (LETTER_TRIAL === "masked-rise") {
        tl.to(
          titleLetters,
          {
            y: "0%",
            duration: 0.9,
            ease: LETTER_EASE,
            stagger: 0.04,
          },
          "settle+=0.05",
        );
      } else if (LETTER_TRIAL === "center-wave") {
        tl.to(
          titleLetters,
          {
            y: 0,
            opacity: 1,
            scale: 1,
            filter: "blur(0px)",
            duration: 0.85,
            ease: LETTER_EASE,
            stagger: { each: 0.04, from: "center" },
          },
          "settle+=0.05",
        );
      } else {
        tl.to(
          titleLetters,
          {
            y: 0,
            scale: 1,
            opacity: 1,
            rotation: 0,
            duration: 0.9,
            ease: LETTER_EASE,
            stagger: 0.045,
          },
          "settle+=0.05",
        );
      }
      tl.to(bioLines, { y: 0, duration: 1.05, ease: TEXT_EASE }, "settle+=0.12");
      if (figure) {
        tl.to(
          figure,
          { opacity: 1, y: 0, duration: 1.05, ease: ENTER_EASE },
          "settle+=0.08",
        );
      }
    };

    frame = requestAnimationFrame(run);

    return () => {
      cancelAnimationFrame(frame);
      tl?.kill();
    };
  }, [location.pathname]);

  useEffect(() => {
    if (location.hash !== "#work") return undefined;

    const id = window.setTimeout(() => {
      const el = document.getElementById("work");
      if (el) scrollToElement(el, { duration: 1.2 });
    }, 80);

    return () => window.clearTimeout(id);
  }, [location.hash, location.pathname, scrollToElement]);

  return (
    <PageShell className="home" style={{ backgroundColor: "#f3f3f3" }}>
      <section ref={landingRef} id="landing" className="home-landing">
        <HomeGridOverlay overlayRef={overlayRef} />
        <HomeHeroWalk ref={walkerRef} />
        <div className="home-landing-content page-content-shell">
          <div className="home-landing-grid">
            <div className="home-landing-inner">
              <h1
                ref={heroTitleRef}
                className={`home-hero home-hero--letters home-hero--trial-${LETTER_TRIAL}`}
                aria-label={HOME_TITLE}
              >
                <span className="home-hero-line" aria-hidden="true">
                  <span className="home-hero-line-inner">
                    {splitTitleLetters(HOME_TITLE).map(({ char, index, isSpace }) => (
                      <span
                        key={`${char}-${index}`}
                        className={`home-hero-letter${isSpace ? " is-space" : ""}`}
                      >
                        {isSpace ? "\u00a0" : char}
                      </span>
                    ))}
                  </span>
                </span>
              </h1>
              <p ref={bioRef} className={`home-bio${bioReady ? " is-intro-done" : ""}`}>
                <span className="home-bio-line">
                  <span className="home-bio-line-inner">
                    <button
                      type="button"
                      className="home-bio-hotspot"
                      onClick={() => walkerRef.current?.playDesignEng()}
                    >
                      Design Engineer
                    </button>{" "}
                    <span className="home-bio-ampersand">&amp;</span>
                  </span>
                </span>
                <span className="home-bio-line">
                  <span className="home-bio-line-inner">
                    <button
                      type="button"
                      className="home-bio-hotspot"
                      onClick={() => walkerRef.current?.playResearcher()}
                    >
                      Researcher
                    </button>
                  </span>
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="work"
        className="home-selected-work"
        aria-labelledby="home-selected-work-title"
      >
        <div className="page-content-shell">
          <Appear asChild>
            <h2 id="home-selected-work-title" className="home-selected-work-title">
              <img
                src="/work/icons/dash.svg"
                alt=""
                className="home-selected-work-dash"
                width={17}
                height={1}
              />
              SELECTED WORKS
            </h2>
          </Appear>
          <div className="home-selected-work-grid">
            {HOME_SELECTED_WORK.map((project, index) => (
              <div key={project.id} className="home-selected-work-slot">
                <Appear asChild delay={index * APPEAR_STAGGER}>
                  <WorkProjectCard project={project} />
                </Appear>
              </div>
            ))}
          </div>
          {SHOW_HOME_SEE_MORE_WORK ? (
            <Appear asChild delay={HOME_SELECTED_WORK.length * APPEAR_STAGGER}>
              <div className="home-selected-work-more">
                <Link to="/work" className="home-see-more-work">
                  <span>SEE MORE WORK</span>
                  <img
                    src="/work/icons/arrow.svg"
                    alt=""
                    className="home-see-more-work-arrow"
                    width={34}
                    height={8}
                  />
                </Link>
              </div>
            </Appear>
          ) : null}
        </div>
      </section>

      <HomePublications />
    </PageShell>
  );
};

export default Home;
