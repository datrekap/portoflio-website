import { useCallback } from "react";
import { useLenis } from "@studio-freight/react-lenis";
import {
  getCaseStudyScrollOffset,
  getSectionScrollAnchor,
} from "../constants/caseStudyScroll";

function getCurrentScrollY(lenis) {
  if (lenis && typeof lenis.scroll === "number") {
    return lenis.scroll;
  }
  return window.scrollY || document.documentElement.scrollTop;
}

function measureSectionScrollTop(sectionEl, lenis, offset = getCaseStudyScrollOffset()) {
  const anchor = getSectionScrollAnchor(sectionEl) ?? sectionEl;
  return anchor.getBoundingClientRect().top + getCurrentScrollY(lenis) - offset;
}

function correctSectionScroll(sectionEl, lenis, offset, onComplete) {
  const anchor = getSectionScrollAnchor(sectionEl) ?? sectionEl;
  const drift = anchor.getBoundingClientRect().top - offset;

  if (Math.abs(drift) <= 2) {
    onComplete?.();
    return;
  }

  if (lenis) {
    lenis.scrollTo(getCurrentScrollY(lenis) + drift, {
      immediate: true,
      force: true,
      onComplete,
    });
    return;
  }

  window.scrollTo({
    top: getCurrentScrollY(lenis) + drift,
    left: 0,
    behavior: "auto",
  });
  onComplete?.();
}

/**
 * Shared Lenis scroll helpers. Use this instead of duplicating lenis.scrollTo + fallback logic.
 * Returns stable callbacks that work with or without Lenis (fallback to native scroll).
 */
export function useLenisScroll() {
  const lenis = useLenis();

  const scrollToTop = useCallback(
    (opts = {}) => {
      const { immediate = false, duration = 1.2, force, onComplete } = opts;
      if (lenis) {
        lenis.scrollTo(0, {
          duration: immediate ? 0 : duration,
          immediate: !!immediate,
          ...(force !== undefined && { force }),
          ...(onComplete && { onComplete }),
        });
      } else {
        window.scrollTo({ top: 0, left: 0, behavior: immediate ? "auto" : "smooth" });
        onComplete?.();
      }
    },
    [lenis],
  );

  const scrollToElement = useCallback(
    (el, opts = {}) => {
      if (!el) return;
      const { offset = 0, duration = 1.2, immediate = false, force, onComplete } =
        opts;
      if (lenis) {
        lenis.scrollTo(el, {
          offset,
          duration: immediate ? 0 : duration,
          immediate: !!immediate,
          ...(force !== undefined && { force }),
          ...(onComplete && { onComplete }),
        });
      } else {
        el.scrollIntoView({
          behavior: immediate ? "auto" : "smooth",
          block: "start",
        });
        if (offset !== 0) {
          const offsetPx = Math.abs(offset);
          setTimeout(() => window.scrollBy(0, offsetPx), 100);
        }
        onComplete?.();
      }
    },
    [lenis],
  );

  const scrollToSection = useCallback(
    (sectionEl, opts = {}) => {
      if (!sectionEl) return;

      const {
        offset = getCaseStudyScrollOffset(),
        duration = 1.2,
        immediate = false,
        force,
        onComplete,
      } = opts;

      const runScroll = () => {
        const target = measureSectionScrollTop(sectionEl, lenis, offset);
        const finish = () => {
          requestAnimationFrame(() => {
            correctSectionScroll(sectionEl, lenis, offset, onComplete);
          });
        };

        if (lenis) {
          lenis.scrollTo(target, {
            duration: immediate ? 0 : duration,
            immediate: !!immediate,
            force: true,
            onComplete: finish,
          });
          return;
        }

        window.scrollTo({
          top: target,
          left: 0,
          behavior: immediate ? "auto" : "smooth",
        });
        finish();
      };

      requestAnimationFrame(() => {
        requestAnimationFrame(runScroll);
      });
    },
    [lenis],
  );

  return { lenis, scrollToTop, scrollToElement, scrollToSection };
}
