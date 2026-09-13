import React, { useRef } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { caseStudyNavConfig } from "../../data/caseStudyNavConfig";
import { useLenisScroll } from "../../hooks/useLenisScroll";
import { usePinnedSpyNav } from "../../hooks/usePinnedSpyNav";
import { useScrollSpy } from "../../hooks/useScrollSpy";
import "./CaseStudyLayout.css";

function CaseStudySpyNav({
  sections,
  accentColor,
  slotRef,
  mainRef,
  navVariant,
}) {
  const navRef = useRef(null);
  const trackRef = useRef(null);
  const listRef = useRef(null);
  const linkRefs = useRef([]);
  const sectionIds = sections.map((section) => section.id);
  const { activeId, setActiveSection, releaseActiveLock } =
    useScrollSpy(sectionIds);
  const { lenis, scrollToTop, scrollToSection } = useLenisScroll();
  const { pinStyle, atBottom } = usePinnedSpyNav(slotRef, mainRef, navRef);
  const isEditorial = navVariant === "editorial";

  const handleClick = (id, index) => {
    const el = document.getElementById(id);
    if (!el) return;

    setActiveSection(id, { lock: true });

    const finish = () => releaseActiveLock(id);

    if (index === 0 && !isEditorial) {
      scrollToTop({
        duration: 1.2,
        force: true,
        onComplete: finish,
      });
      return;
    }

    ScrollTrigger.refresh();
    lenis?.resize?.();

    scrollToSection(el, {
      duration: 1.2,
      force: true,
      onComplete: finish,
    });
  };

  return (
    <div ref={slotRef} className="case-study-spy-nav-slot">
      <div
        ref={navRef}
        className={`case-study-spy-nav${pinStyle ? " is-pinned" : ""}${
          atBottom ? " is-at-bottom" : ""
        }${isEditorial ? " case-study-spy-nav--editorial case-study-spy-nav--pfal" : ""}`}
        role="navigation"
        aria-label="Case study sections"
        style={{
          "--case-study-spy-accent": accentColor,
          ...pinStyle,
        }}
      >
        <div ref={trackRef} className="case-study-spy-nav__track">
          <ul ref={listRef} className="case-study-spy-nav__list">
            {sections.map((section, index) => (
              <li
                key={section.id}
                className="case-study-spy-nav__item"
                style={{ "--nav-stagger-index": index }}
              >
                <button
                  ref={(el) => {
                    linkRefs.current[index] = el;
                  }}
                  type="button"
                  className={`case-study-spy-nav__link${
                    activeId === section.id ? " is-active" : ""
                  }`}
                  onClick={() => handleClick(section.id, index)}
                  aria-current={activeId === section.id ? "true" : undefined}
                >
                  {isEditorial ? null : (
                    <span
                      className="case-study-spy-nav__dot"
                      aria-hidden="true"
                    />
                  )}
                  <span className="case-study-spy-nav__label">
                    {section.label}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function CaseStudyLayout({ projectId, children }) {
  const config = caseStudyNavConfig[projectId];
  const mainRef = useRef(null);
  const slotRef = useRef(null);

  if (!config) {
    return children;
  }

  return (
    <div className="case-study-layout">
      <CaseStudySpyNav
        navVariant={config.navVariant}
        sections={config.sections}
        accentColor={config.accentColor}
        slotRef={slotRef}
        mainRef={mainRef}
      />
      <div ref={mainRef} className="case-study-layout__main">{children}</div>
    </div>
  );
}
