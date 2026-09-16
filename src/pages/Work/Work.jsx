import React, { useEffect, useRef, useLayoutEffect } from "react";
import { useLenis } from "@studio-freight/react-lenis";
import { gsap } from "gsap";
import WorkProjectGrid from "../../components/Work/WorkProjectGrid";
import Footer from "../../components/Footer/Footer";
import { revealNav } from "../../constants/navTiming";
import "./Work.css";

const Work = () => {
  const lenis = useLenis();
  const titleRef = useRef(null);
  const titleWrapperRef = useRef(null);
  const subtitleRef = useRef(null);
  const pillsContainerRef = useRef(null);
  const timelineRef = useRef(null);
  const workGridContainerRef = useRef(null);

  useLayoutEffect(() => {
    if (!titleRef.current || !titleWrapperRef.current) return;

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

    if (workGridContainerRef.current) {
      gsap.set(workGridContainerRef.current, {
        opacity: 0,
      });
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const pillsContainer = document.querySelector(".filter-pills-container");
        const projectCards = document.querySelectorAll(".work-project-card");

        if (pillsContainer) {
          pillsContainerRef.current = pillsContainer;
          gsap.set(pillsContainer, {
            opacity: 0,
          });
        }

        if (projectCards.length > 0) {
          gsap.set(projectCards, {
            opacity: 0,
          });
        }

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

        if (workGridContainerRef.current) {
          timelineRef.current.to(
            workGridContainerRef.current,
            {
              opacity: 1,
              duration: 0.5,
              ease: "power2.out",
            },
            "-=0.3",
          );
        }

        if (pillsContainerRef.current) {
          timelineRef.current.to(
            pillsContainerRef.current,
            {
              opacity: 1,
              duration: 1,
              ease: "power2.out",
            },
            "-=0.3",
          );
        }

        if (projectCards.length > 0) {
          timelineRef.current.to(
            projectCards,
            {
              opacity: 1,
              stagger: { each: 0.08, from: "start" },
              duration: 1.2,
              ease: "power2.out",
            },
            "-=1",
          );
        }
      });
    });

    return () => {
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
    <>
      <main
        className="work-page min-h-screen relative"
        style={{ backgroundColor: "#f3f3f3" }}
      >
        <section className="work-page__hero">
          <div className="page-content-shell">
            <h1 ref={titleRef} className="work-page-title">
              <span ref={titleWrapperRef} className="work-page-title-wrapper">
                EXPERIENCES BUILT
              </span>
            </h1>
            <p ref={subtitleRef} className="work-page-subtitle">
              I strive to solve meaningful problems through products and 
              experiences that invite participation, spark curiosity, 
              and make everyday interactions more enjoyable.
            </p>
            <WorkProjectGrid containerRef={workGridContainerRef} />
          </div>
        </section>
        <Footer />
      </main>
    </>
  );
};

export default Work;
