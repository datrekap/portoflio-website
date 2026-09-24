import { useLayoutEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useLenisScroll } from "../hooks/useLenisScroll";
import { useWorkVideoTransition } from "../context/WorkVideoTransitionContext";
import { ABOUT_CREATIVE_PATH } from "../data/aboutCreativeWork";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const { scrollToTop } = useLenisScroll();
  const { scrollToTopNow } = useWorkVideoTransition();
  const prevPathnameRef = useRef(pathname);

  useLayoutEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const previousPath = prevPathnameRef.current;
    const staysOnAbout =
      (pathname === "/about" || pathname === ABOUT_CREATIVE_PATH) &&
      (previousPath === "/about" || previousPath === ABOUT_CREATIVE_PATH);

    if (pathname === previousPath || staysOnAbout) {
      prevPathnameRef.current = pathname;
      return undefined;
    }
    prevPathnameRef.current = pathname;
    scrollToTopNow();
    scrollToTop({ immediate: true, force: true });
    return undefined;
  }, [pathname, scrollToTop, scrollToTopNow]);

  return null;
};

export default ScrollToTop;
