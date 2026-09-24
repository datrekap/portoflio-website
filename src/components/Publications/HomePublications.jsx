import React, { forwardRef, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Appear from "../Appear/Appear";
import { publicationSections } from "../../data/publications";
import "./HomePublications.css";

gsap.registerPlugin(ScrollTrigger);

const APPEAR_STAGGER = 0.06;

const PublicationAuthors = ({ authors, venue }) => (
  <p className="home-publications-authors">
    {authors.map((author, index) => (
      <React.Fragment key={author.name}>
        {index > 0 ? ", " : null}
        {author.highlighted ? (
          <strong className="home-publications-author-highlight">{author.name}</strong>
        ) : (
          author.name
        )}
      </React.Fragment>
    ))}
    {venue ? `. ${venue}` : "."}
  </p>
);

const PublicationEntry = forwardRef(function PublicationEntry({ paper }, ref) {
  const content = (
    <>
      <h4 className="home-publications-paper-title">{paper.title}</h4>
      <PublicationAuthors authors={paper.authors} venue={paper.venue} />
    </>
  );

  if (paper.url) {
    return (
      <a
        ref={ref}
        href={paper.url}
        className="home-publications-entry home-publications-entry--link"
        target="_blank"
        rel="noopener noreferrer"
      >
        {content}
      </a>
    );
  }

  return (
    <article ref={ref} className="home-publications-entry">
      {content}
    </article>
  );
});

const HomePublications = () => {
  const sectionRef = useRef(null);
  const gridRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const grid = gridRef.current;
    if (!section || !grid) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion) {
      gsap.set(grid, { opacity: 0.07, scale: 1 });
      return;
    }

    const resetGrid = () => {
      gsap.killTweensOf(grid);
      gsap.set(grid, { opacity: 0, scale: 1.06 });
    };

    const animateGrid = () => {
      gsap.killTweensOf(grid);
      gsap.fromTo(
        grid,
        { opacity: 0, scale: 1.06 },
        {
          opacity: 0.07,
          scale: 1,
          duration: 1.2,
          ease: "power2.out",
        },
      );
    };

    resetGrid();

    const scrollTrigger = ScrollTrigger.create({
      trigger: section,
      start: "top 82%",
      onEnter: animateGrid,
      onEnterBack: animateGrid,
      onLeave: resetGrid,
      onLeaveBack: resetGrid,
    });

    ScrollTrigger.refresh();

    return () => {
      scrollTrigger.kill();
      gsap.killTweensOf(grid);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="publications"
      className="home-publications"
      aria-labelledby="home-publications-title"
    >
      <div ref={gridRef} className="home-publications-grid-overlay" aria-hidden="true" />
      <div className="page-content-shell home-publications-inner">
        <Appear asChild>
          <h2 id="home-publications-title" className="home-publications-title">
            <img
              src="/work/icons/dash.svg"
              alt=""
              className="home-publications-dash"
              width={17}
              height={1}
            />
            PUBLICATIONS
          </h2>
        </Appear>

        <div className="home-publications-content">
          {publicationSections.map((section, sectionIndex) => {
            const priorPapers = publicationSections
              .slice(0, sectionIndex)
              .reduce((count, item) => count + item.papers.length, 0);
            const sectionDelay = (sectionIndex + priorPapers + 1) * APPEAR_STAGGER;

            return (
              <div key={section.id} className="home-publications-section">
                <Appear asChild delay={sectionDelay}>
                  <h3 className="home-publications-section-title">{section.title}</h3>
                </Appear>
                <div className="home-publications-list">
                  {section.papers.map((paper, paperIndex) => (
                    <Appear
                      key={paper.id}
                      asChild
                      delay={(sectionIndex + priorPapers + paperIndex + 2) * APPEAR_STAGGER}
                    >
                      <div className="home-publications-item">
                        <PublicationEntry paper={paper} />
                      </div>
                    </Appear>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HomePublications;
