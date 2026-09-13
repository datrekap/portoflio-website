import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

const WorkVideoTransitionContext = createContext(null);

function resetDocumentScroll(lenis) {
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

  const startTransition = useCallback((payload) => {
    setTransition({
      ...payload,
      phase: "overlay",
    });
  }, []);

  const registerTarget = useCallback((rect, onComplete) => {
    resetDocumentScroll(lenisRef.current);
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
      resetDocumentScroll(lenisRef.current);
      setTransition(null);
    };

    const result = onCompleteRef.current?.(payload);
    onCompleteRef.current = null;

    if (result && typeof result.then === "function") {
      result.then(finalizeAfterHandoff).catch(finalizeAfterHandoff);
      return;
    }

    finalizeAfterHandoff();
  }, []);

  const value = useMemo(
    () => ({
      transition,
      startTransition,
      registerTarget,
      completeTransition,
      claimVideo,
      getClaimedVideo,
      releaseClaimedVideo,
      registerLenis,
      scrollToTopNow,
      isTransitioning: Boolean(transition),
    }),
    [
      transition,
      startTransition,
      registerTarget,
      completeTransition,
      claimVideo,
      getClaimedVideo,
      releaseClaimedVideo,
      registerLenis,
      scrollToTopNow,
    ],
  );

  return (
    <WorkVideoTransitionContext.Provider value={value}>
      {children}
    </WorkVideoTransitionContext.Provider>
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
