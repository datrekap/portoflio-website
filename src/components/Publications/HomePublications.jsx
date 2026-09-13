import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { publicationSections } from "../../data/publications";
import "./HomePublications.css";

gsap.registerPlugin(ScrollTrigger);

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

const PublicationEntry = ({ paper }) => {
  const content = (
    <>
      <h4 className="home-publications-paper-title">{paper.title}</h4>
      <PublicationAuthors authors={paper.authors} venue={paper.venue} />
    </>
  );

  if (paper.url) {
    return (
      <a
        href={paper.url}
        className="home-publications-entry home-publications-entry--link"
        target="_blank"
        rel="noopener noreferrer"
      >
        {content}
      </a>
    );
  }

  return <article className="home-publications-entry">{content}</article>;
};

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

        <div className="home-publications-content">
          {publicationSections.map((section) => (
            <div key={section.id} className="home-publications-section">
              <h3 className="home-publications-section-title">{section.title}</h3>
              <div className="home-publications-list">
                {section.papers.map((paper) => (
                  <PublicationEntry key={paper.id} paper={paper} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomePublications;
