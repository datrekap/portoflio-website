/**
 * Shared chunk loaders for the lazy case-study routes.
 *
 * Route rendering and hover prefetch go through the same cached promise, so a
 * card that has been hovered has its chunk parsed before the click lands and
 * the video transition no longer competes with a network fetch.
 */
const loaders = {
  "/public-future-arts-lab": () =>
    import("../pages/PFALCaseStudy/PFALCaseStudy"),
  "/sitehub-2": () =>
    import("../pages/PropertyworksCaseStudy/PropertyworksCaseStudy"),
  "/parkwise": () => import("../pages/ParkwiseCaseStudy/ParkwiseCaseStudy"),
  "/trojanstep": () =>
    import("../pages/TrojanStepCaseStudy/TrojanStepCaseStudy"),
};

const started = new Map();

function load(route) {
  if (!started.has(route)) {
    started.set(route, loaders[route]());
  }
  return started.get(route);
}

export function caseStudyLoader(route) {
  return () => load(route);
}

export function prefetchCaseStudy(route) {
  if (!route || !loaders[route]) return;
  load(route).catch(() => {
    started.delete(route);
  });
}
