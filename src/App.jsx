import React, { lazy, Suspense, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ReactLenis, useLenis } from "@studio-freight/react-lenis";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Analytics } from "@vercel/analytics/react";
import { WorkVideoTransitionProvider } from "./context/WorkVideoTransitionContext";
import WorkVideoTransitionOverlay from "./components/WorkVideoTransition/WorkVideoTransitionOverlay";
import WorkVideoTransitionLenisBridge from "./components/WorkVideoTransition/WorkVideoTransitionLenisBridge";
import Nav from "./components/Nav/Nav";
import ScrollToTop from "./components/ScrollToTop";
import DocumentMeta from "./components/DocumentMeta";
import BackToTop from "./components/BackToTop/BackToTop";
import Home from "./pages/Home/Home";
import Work from "./pages/Work/Work";
import Play from "./pages/Play/Play";
import About from "./pages/About/About";
import NotFound from "./pages/NotFound/NotFound";
import { caseStudyLoader } from "./routes/caseStudyRoutes";
import "./App.css";

const PFALCaseStudy = lazy(caseStudyLoader("/public-future-arts-lab"));
const TrojanStepCaseStudy = lazy(caseStudyLoader("/trojanstep"));
const PropertyworksCaseStudy = lazy(caseStudyLoader("/sitehub-2"));
const ParkwiseCaseStudy = lazy(caseStudyLoader("/parkwise"));

const LenisScrollTriggerIntegration = () => {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    let rafId = null;
    const onScroll = () => {
      if (rafId != null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        ScrollTrigger.update();
      });
    };

    lenis.on("scroll", onScroll);

    return () => {
      if (rafId != null) cancelAnimationFrame(rafId);
      lenis.off("scroll", onScroll);
    };
  }, [lenis]);

  return null;
};

function App() {
  return (
    <ReactLenis
      root
      options={{
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        smoothTouch: false,
        wheelMultiplier: 1,
        touchMultiplier: 2,
      }}
    >
      <Router>
        <WorkVideoTransitionProvider>
          <LenisScrollTriggerIntegration />
          <WorkVideoTransitionLenisBridge />
          <DocumentMeta />
          <ScrollToTop />
          <BackToTop />
          <WorkVideoTransitionOverlay />
          <div className="app min-h-screen relative">
          <div
            className="fixed top-0 left-0 w-full"
            style={{
              zIndex: 100,
              pointerEvents: "none",
            }}
          >
            <Nav />
          </div>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/google-creative" element={<Home />} />
            <Route path="/work" element={<Work />} />
            <Route path="/play" element={<Play />} />
            <Route path="/about" element={<About />} />
            <Route path="/about/creative" element={<About />} />
            <Route
              path="/public-future-arts-lab"
              element={
                <Suspense fallback={<div className="min-h-screen" style={{ background: "#f3f3f3" }} />}>
                  <PFALCaseStudy />
                </Suspense>
              }
            />
            <Route
              path="/sitehub-2"
              element={
                <Suspense fallback={<div className="min-h-screen" style={{ background: "#f3f3f3" }} />}>
                  <PropertyworksCaseStudy />
                </Suspense>
              }
            />
            <Route
              path="/parkwise"
              element={
                <Suspense fallback={<div className="min-h-screen" style={{ background: "#f3f3f3" }} />}>
                  <ParkwiseCaseStudy />
                </Suspense>
              }
            />
            <Route
              path="/trojanstep"
              element={
                <Suspense fallback={<div className="min-h-screen" style={{ background: "#f3f3f3" }} />}>
                  <TrojanStepCaseStudy />
                </Suspense>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <Analytics />
        </WorkVideoTransitionProvider>
      </Router>
    </ReactLenis>
  );
}

export default App;
