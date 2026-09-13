import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLenis } from "@studio-freight/react-lenis";
import {
  getCaseStudyScrollOffset,
  getSectionScrollAnchor,
} from "../constants/caseStudyScroll";

function resolveActiveSection(sectionIds, offset = getCaseStudyScrollOffset()) {
  if (!sectionIds.length) return null;

  let currentId = null;

  for (const id of sectionIds) {
    const el = document.getElementById(id);
    if (!el) continue;

    const anchor = getSectionScrollAnchor(el);
    const probeTop = (anchor ?? el).getBoundingClientRect().top;
    const sectionBottom = el.getBoundingClientRect().bottom;

    if (probeTop <= offset && sectionBottom > offset) {
      return id;
    }

    if (probeTop > offset) {
      break;
    }

    currentId = id;
  }

  return currentId;
}

export function useScrollSpy(sectionIds) {
  const lenis = useLenis();
  const sectionKey = sectionIds.join("|");
  const stableSectionIds = useMemo(() => sectionIds, [sectionKey]);
  const [activeId, setActiveId] = useState(null);
  const lockRef = useRef(null);

  const setActiveSection = useCallback((id, { lock = false } = {}) => {
    setActiveId(id);
    lockRef.current = lock ? id : null;
  }, []);

  const releaseActiveLock = useCallback(
    (fallbackId = null) => {
      lockRef.current = null;
      const resolved = resolveActiveSection(stableSectionIds);
      setActiveId(fallbackId ?? resolved);
    },
    [stableSectionIds],
  );

  useEffect(() => {
    if (!stableSectionIds.length) return;

    let rafId = null;

    const updateActiveSection = () => {
      if (rafId != null) return;

      rafId = requestAnimationFrame(() => {
        rafId = null;

        if (lockRef.current) {
          setActiveId((prev) =>
            prev === lockRef.current ? prev : lockRef.current,
          );
          return;
        }

        const currentId = resolveActiveSection(stableSectionIds);
        setActiveId((prev) => (prev === currentId ? prev : currentId));
      });
    };

    updateActiveSection();

    if (lenis) {
      lenis.on("scroll", updateActiveSection);
      return () => {
        if (rafId != null) cancelAnimationFrame(rafId);
        lenis.off("scroll", updateActiveSection);
      };
    }

    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);

    return () => {
      if (rafId != null) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, [lenis, stableSectionIds]);

  return { activeId, setActiveSection, releaseActiveLock };
}
