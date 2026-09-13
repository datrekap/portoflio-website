import { useLayoutEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useLenisScroll } from "../hooks/useLenisScroll";
import { useWorkVideoTransition } from "../context/WorkVideoTransitionContext";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const { scrollToTop } = useLenisScroll();
  const { scrollToTopNow } = useWorkVideoTransition();
  const prevPathnameRef = useRef(pathname);

  useLayoutEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    if (pathname === prevPathnameRef.current) return undefined;
    prevPathnameRef.current = pathname;
    scrollToTopNow();
    scrollToTop({ immediate: true, force: true });
    return undefined;
  }, [pathname, scrollToTop, scrollToTopNow]);

  return null;
};

export default ScrollToTop;
