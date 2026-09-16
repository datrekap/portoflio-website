import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

const WorkVideoTransitionContext = createContext(null);

/**
 * Stable half of the transition API.
 *
 * Kept separate from the live `transition` object so that content-reveal hooks
 * can ask whether a transition is running without re-rendering — and without
 * tearing down their effects — every time the phase changes.
 */
const WorkTransitionApiContext = createContext(null);

function resetDocumentScroll(lenis) {
  const atTop =
    (window.scrollY || document.documentElement.scrollTop || 0) === 0;
  if (atTop) return;

  if (lenis) {
    lenis.scrollTo(0, { immediate: true, force: true });
  }
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

export function WorkVideoTransitionProvider({ children }) {
  const [transition, setTransition] = useState(null);
  const onCompleteRef = useRef(null);
  const claimedVideoRef = useRef(null);
  const lenisRef = useRef(null);
  const isTransitioningRef = useRef(false);
  const settledSubscribersRef = useRef(new Set());

  const registerLenis = useCallback((instance) => {
    lenisRef.current = instance;
  }, []);

  const claimVideo = useCallback((videoEl) => {
    if (!videoEl) return false;
    claimedVideoRef.current = videoEl;
    return true;
  }, []);

  const getClaimedVideo = useCallback(() => claimedVideoRef.current, []);

  const releaseClaimedVideo = useCallback(() => {
    const video = claimedVideoRef.current;
    claimedVideoRef.current = null;
    return video;
  }, []);

  const scrollToTopNow = useCallback(() => {
    resetDocumentScroll(lenisRef.current);
  }, []);

  const getIsTransitioning = useCallback(() => isTransitioningRef.current, []);

  const subscribeTransitionSettled = useCallback((handler) => {
    settledSubscribersRef.current.add(handler);
    return () => {
      settledSubscribersRef.current.delete(handler);
    };
  }, []);

  const notifyTransitionSettled = useCallback(() => {
    const subscribers = [...settledSubscribersRef.current];
    settledSubscribersRef.current.clear();
    subscribers.forEach((handler) => handler());
  }, []);

  const startTransition = useCallback((payload) => {
    isTransitioningRef.current = true;
    // Momentum scroll would slide the page out from under the pinned overlay
    // during the exit, and would invalidate the measured destination rect
    // during the expand.
    lenisRef.current?.stop();
    setTransition({
      ...payload,
      phase: "exiting",
    });
  }, []);

  /** The outgoing page has dissolved; the overlay can take over the viewport. */
  const enterOverlayPhase = useCallback(() => {
    setTransition((current) => {
      if (!current || current.phase !== "exiting") return current;
      return { ...current, phase: "overlay" };
    });
  }, []);

  const registerTarget = useCallback((rect, onComplete) => {
    onCompleteRef.current = onComplete;
    setTransition((current) => {
      if (!current) return current;
      return {
        ...current,
        phase: "animating",
        targetRect: rect,
      };
    });
  }, []);

  const completeTransition = useCallback(() => {
    const claimed = claimedVideoRef.current;
    const payload = {
      playbackTime: claimed?.currentTime,
      claimedVideo: claimed,
    };

    const finalizeAfterHandoff = () => {
      claimedVideoRef.current = null;
      isTransitioningRef.current = false;
      resetDocumentScroll(lenisRef.current);
      lenisRef.current?.start();
      setTransition(null);
      notifyTransitionSettled();
    };

    const result = onCompleteRef.current?.(payload);
    onCompleteRef.current = null;

    if (result && typeof result.then === "function") {
      result.then(finalizeAfterHandoff).catch(finalizeAfterHandoff);
      return;
    }

    finalizeAfterHandoff();
  }, [notifyTransitionSettled]);

  const api = useMemo(
    () => ({
      startTransition,
      enterOverlayPhase,
      registerTarget,
      completeTransition,
      claimVideo,
      getClaimedVideo,
      releaseClaimedVideo,
      registerLenis,
      scrollToTopNow,
      getIsTransitioning,
      subscribeTransitionSettled,
    }),
    [
      startTransition,
      enterOverlayPhase,
      registerTarget,
      completeTransition,
      claimVideo,
      getClaimedVideo,
      releaseClaimedVideo,
      registerLenis,
      scrollToTopNow,
      getIsTransitioning,
      subscribeTransitionSettled,
    ],
  );

  const value = useMemo(
    () => ({
      ...api,
      transition,
      isTransitioning: Boolean(transition),
    }),
    [api, transition],
  );

  return (
    <WorkTransitionApiContext.Provider value={api}>
      <WorkVideoTransitionContext.Provider value={value}>
        {children}
      </WorkVideoTransitionContext.Provider>
    </WorkTransitionApiContext.Provider>
  );
}

export function useWorkVideoTransition() {
  const context = useContext(WorkVideoTransitionContext);
  if (!context) {
    throw new Error(
      "useWorkVideoTransition must be used within WorkVideoTransitionProvider",
    );
  }
  return context;
}

export function useWorkTransitionApi() {
  const context = useContext(WorkTransitionApiContext);
  if (!context) {
    throw new Error(
      "useWorkTransitionApi must be used within WorkVideoTransitionProvider",
    );
  }
  return context;
}
