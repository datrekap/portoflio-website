import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import PageShell from "../../components/PageShell/PageShell";
import { revealNav } from "../../constants/navTiming";
import { MOTION_INTRO, MOTION_PROJECTS } from "../../data/motionWork";
import MotionProjectCard from "./MotionProjectCard";
import MotionVideoOverlay from "./MotionVideoOverlay";
import "./Motion.css";

export { MOTION_PATH } from "../../data/motionWork";

const Motion = () => {
  const [activeProject, setActiveProject] = useState(null);
  const titleRef = useRef(null);
  const titleWrapperRef = useRef(null);
  const subtitleRef = useRef(null);
  const introCtaRef = useRef(null);
  const galleryRef = useRef(null);
  const timelineRef = useRef(null);

  const onOpen = useCallback((project) => {
    document
      .querySelectorAll(".motion-work-card video")
      .forEach((video) => video.pause());
    setActiveProject(project);
  }, []);

  const onClose = useCallback(() => {
    setActiveProject(null);
    window.requestAnimationFrame(() => {
      document
        .querySelectorAll(".motion-work-card video")
        .forEach((video) => {
          video.play().catch(() => {});
        });
    });
  }, []);

  useLayoutEffect(() => {
    if (!titleRef.current || !titleWrapperRef.current) return undefined;

    const cards = galleryRef.current?.querySelectorAll(".motion-work-card") ?? [];

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(titleWrapperRef.current, { opacity: 1, y: "0%" });
      if (subtitleRef.current) gsap.set(subtitleRef.current, { opacity: 1, y: 0 });
      if (introCtaRef.current) gsap.set(introCtaRef.current, { opacity: 1, y: 0 });
      if (cards.length) gsap.set(cards, { opacity: 1 });
      revealNav();
      return undefined;
    }

    gsap.set(titleWrapperRef.current, {
      opacity: 0,
      y: "100%",
    });

    if (subtitleRef.current) {
      gsap.set(subtitleRef.current, {
        opacity: 0,
        y: 24,
      });
    }

    if (introCtaRef.current) {
      gsap.set(introCtaRef.current, {
        opacity: 0,
        y: 16,
      });
    }

    if (cards.length) {
      gsap.set(cards, { opacity: 0 });
    }

    const frame = requestAnimationFrame(() => {
      timelineRef.current = gsap.timeline({
        defaults: { ease: "power2.out" },
        onComplete: revealNav,
      });

      timelineRef.current.to(titleWrapperRef.current, {
        opacity: 1,
        y: "0%",
        duration: 1.5,
        ease: "power2.out",
      });

      if (subtitleRef.current) {
        timelineRef.current.to(
          subtitleRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 1,
          },
          "-=1.1",
        );
      }

      if (introCtaRef.current) {
        timelineRef.current.to(
          introCtaRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
          },
          "-=0.85",
        );
      }

      if (cards.length) {
        timelineRef.current.to(
          cards,
          {
            opacity: 1,
            stagger: { each: 0.08, from: "start" },
            duration: 1.2,
            ease: "power2.out",
          },
          "-=0.75",
        );
      }
    });

    return () => {
      cancelAnimationFrame(frame);
      timelineRef.current?.kill();
      timelineRef.current = null;
    };
  }, []);

  return (
    <PageShell className="motion-page">
      <header className="motion-hero">
        <div className="page-content-shell">
          <h1 ref={titleRef} className="motion-title" aria-label={MOTION_INTRO.title}>
            <span ref={titleWrapperRef} className="motion-title-wrapper">
              {MOTION_INTRO.titleLines.map((line, index) => (
                <span key={line} className="motion-title-line">
                  {index > 0 ? <br /> : null}
                  {line}
                </span>
              ))}
            </span>
          </h1>
          <div className="motion-intro-row">
            <p ref={subtitleRef} className="motion-intro">
              {MOTION_INTRO.body}
            </p>
            <div ref={introCtaRef} className="motion-intro-cta">
              <Link to="/work" className="motion-see-product-work">
                <span>SEE PRODUCT WORK</span>
                <img
                  src="/work/icons/arrow.svg"
                  alt=""
                  className="motion-see-product-work-arrow"
                  width={34}
                  height={8}
                />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="motion-gallery-section" aria-label="Selected films">
        <div className="page-content-shell" ref={galleryRef}>
          <ul className="motion-gallery">
            {MOTION_PROJECTS.map((project) => (
              <li key={project.id}>
                <MotionProjectCard
                  project={project}
                  onOpen={onOpen}
                  paused={Boolean(activeProject)}
                />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {activeProject ? (
        <MotionVideoOverlay
          project={activeProject}
          projects={MOTION_PROJECTS}
          onNavigate={setActiveProject}
          onClose={onClose}
        />
      ) : null}
    </PageShell>
  );
};

export default Motion;
