import React, { useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { gsap } from "gsap";
import Footer from "../../components/Footer/Footer";
import WorkProjectCard from "../../components/Work/WorkProjectCard";
import HomePublications from "../../components/Publications/HomePublications";
import { workProjects } from "../../data/workProjects";
import HomeHeroWalk from "./HomeHeroWalk";
import "./Home.css";

const LANDING_FADE_DURATION = 1;
const LANDING_EASE = "power2.out";
const HOME_SELECTED_WORK = workProjects.slice(0, 4);

const Home = () => {
  const location = useLocation();
  const heroTitleRef = useRef(null);
  const bioRef = useRef(null);

  useEffect(() => {
    const titleEl = heroTitleRef.current;
    const bioEl = bioRef.current;
    if (!titleEl || !bioEl) return;

    const titleLines = titleEl.querySelectorAll(".home-hero-line-inner");
    const bioLines = bioEl.querySelectorAll(".home-bio-line-inner");
    if (!titleLines.length || !bioLines.length) return;

    gsap.set(titleLines, { y: "100%" });
    gsap.set(bioLines, { y: "100%" });

    const tl = gsap.timeline();
    tl.to(titleLines, {
      y: 0,
      duration: LANDING_FADE_DURATION,
      ease: LANDING_EASE,
    }).to(
      bioLines,
      {
        y: 0,
        duration: LANDING_FADE_DURATION,
        ease: LANDING_EASE,
      },
      "-=0.2",
    );

    return () => tl.kill();
  }, [location.pathname]);

  return (
    <main className="home" style={{ backgroundColor: "#f3f3f3" }}>
      <section id="landing" className="home-landing">
        <div className="home-grid-overlay" aria-hidden="true" />
        <HomeHeroWalk />
        <div className="home-landing-content page-content-shell">
          <div className="home-landing-grid">
            <div className="home-landing-inner">
              <h1 ref={heroTitleRef} className="home-hero">
                <span className="home-hero-line">
                  <span className="home-hero-line-inner">DAKSH KAPOOR</span>
                </span>
              </h1>
              <p ref={bioRef} className="home-bio">
                <span className="home-bio-line">
                  <span className="home-bio-line-inner">
                    Design Engineer{" "}
                    <span className="home-bio-ampersand">&amp;</span>
                  </span>
                </span>
                <span className="home-bio-line">
                  <span className="home-bio-line-inner">Researcher</span>
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
          <div className="home-selected-work-grid">
            {HOME_SELECTED_WORK.map((project) => (
              <WorkProjectCard key={project.id} project={project} />
            ))}
          </div>
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
        </div>
      </section>

      <HomePublications />

      <Footer />
    </main>
  );
};

export default Home;
