/** Default scroll offset for spy nav + programmatic section jumps (px). */
export const CASE_STUDY_SCROLL_OFFSET = 140;

/** Visible fixed header clearance used when scrolling to a section. */
export function getCaseStudyScrollOffset() {
  if (typeof document === "undefined") {
    return CASE_STUDY_SCROLL_OFFSET;
  }

  const nav = document.querySelector("nav");
  if (nav) {
    const { bottom } = nav.getBoundingClientRect();
    if (bottom > 0) {
      return Math.ceil(bottom) + 16;
    }
  }

  return CASE_STUDY_SCROLL_OFFSET;
}

/** First visible content node inside a case study section. */
export function getSectionScrollAnchor(sectionEl) {
  if (!sectionEl) return null;

  return (
    sectionEl.querySelector("[data-section-anchor]") ||
    sectionEl.querySelector(":scope > .page-content-shell > .pfal-label") ||
    sectionEl.querySelector(":scope > .page-content-shell > :first-child") ||
    sectionEl.querySelector(":scope > :first-child") ||
    sectionEl
  );
}
