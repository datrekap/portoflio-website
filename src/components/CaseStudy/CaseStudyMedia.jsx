import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLenis } from "@studio-freight/react-lenis";

const MAX_PLAYING = 3;
const LOAD_ROOT_MARGIN = "800px 80px";
const PLAY_ROOT_MARGIN = "560px 0px";
const REVEAL_AFTER_FRAMES = 3;
let videoOrder = 0;

function isElementOnScreen(el) {
  if (!el || typeof window === "undefined") return false;
  const rect = el.getBoundingClientRect();
  return (
    rect.width > 1 &&
    rect.height > 1 &&
    rect.bottom > 0 &&
    rect.top < window.innerHeight &&
    rect.right > 0 &&
    rect.left < window.innerWidth
  );
}

const CaseStudyMediaContext = createContext({
  activeVolumeId: null,
  toggleVolume: () => {},
  register: () => () => {},
  setVisible: () => {},
  setInView: () => {},
  notifyReady: () => {},
  reducedMotion: false,
  playRootMargin: PLAY_ROOT_MARGIN,
});

export function CaseStudyMediaProvider({
  children,
  maxPlaying = MAX_PLAYING,
  playRootMargin = PLAY_ROOT_MARGIN,
}) {
  const itemsRef = useRef(new Map());
  const volumePriorityIdRef = useRef(null);
  const [activeVolumeId, setActiveVolumeId] = useState(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const maxPlayingRef = useRef(maxPlaying);
  maxPlayingRef.current = maxPlaying;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const reconcile = useCallback(() => {
    const items = [...itemsRef.current.values()];
    const visible = items
      .filter(
        (item) =>
          item.video && (item.visible || isElementOnScreen(item.video)),
      )
      .sort((a, b) => {
        if (a.id === volumePriorityIdRef.current) return -1;
        if (b.id === volumePriorityIdRef.current) return 1;
        const aOn = Boolean(a.inView) || isElementOnScreen(a.video);
        const bOn = Boolean(b.inView) || isElementOnScreen(b.video);
        if (aOn !== bOn) return aOn ? -1 : 1;
        return a.order - b.order;
      });

    const playIds = new Set();
    if (!reducedMotion) {
      visible
        .slice(0, maxPlayingRef.current)
        .forEach((item) => playIds.add(item.id));
    }

    items.forEach((item) => {
      const video = item.video;
      if (!video) return;

      if (playIds.has(item.id)) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, [reducedMotion]);

  const lenis = useLenis();
  const reconcileRafRef = useRef(null);

  useEffect(() => {
    reconcile();
  }, [reconcile]);

  useEffect(() => {
    if (!lenis) return undefined;

    const onScroll = () => {
      if (reconcileRafRef.current != null) return;
      reconcileRafRef.current = requestAnimationFrame(() => {
        reconcileRafRef.current = null;
        reconcile();
      });
    };

    lenis.on("scroll", onScroll);
    return () => {
      lenis.off("scroll", onScroll);
      if (reconcileRafRef.current != null) {
        cancelAnimationFrame(reconcileRafRef.current);
        reconcileRafRef.current = null;
      }
    };
  }, [lenis, reconcile]);

  const register = useCallback((id, video, order) => {
    const prev = itemsRef.current.get(id) || {
      id,
      visible: false,
      inView: false,
    };
    itemsRef.current.set(id, { ...prev, id, video, order });
    return () => {
      const current = itemsRef.current.get(id);
      if (current?.video === video) {
        video.pause();
        itemsRef.current.delete(id);
      }
    };
  }, []);

  const setVisible = useCallback(
    (id, visible) => {
      const prev = itemsRef.current.get(id) || {
        id,
        video: null,
        order: 0,
        inView: false,
      };
      if (prev.visible === visible && prev.video) {
        itemsRef.current.set(id, { ...prev, visible });
        return;
      }
      itemsRef.current.set(id, { ...prev, visible });
      reconcile();
    },
    [reconcile],
  );

  const setInView = useCallback(
    (id, inView) => {
      const prev = itemsRef.current.get(id) || {
        id,
        video: null,
        order: 0,
        visible: false,
      };
      if (prev.inView === inView && prev.video) {
        itemsRef.current.set(id, { ...prev, inView });
        return;
      }
      itemsRef.current.set(id, { ...prev, inView });
      reconcile();
    },
    [reconcile],
  );

  const toggleVolume = useCallback(
    (id) => {
      setActiveVolumeId((current) => {
        const next = current === id ? null : id;
        volumePriorityIdRef.current = next;
        queueMicrotask(reconcile);
        return next;
      });
    },
    [reconcile],
  );

  const notifyReady = useCallback(() => {
    reconcile();
  }, [reconcile]);

  const value = useMemo(
    () => ({
      activeVolumeId,
      toggleVolume,
      register,
      setVisible,
      setInView,
      notifyReady,
      reducedMotion,
      playRootMargin,
    }),
    [
      activeVolumeId,
      toggleVolume,
      register,
      setVisible,
      setInView,
      notifyReady,
      reducedMotion,
      playRootMargin,
    ],
  );

  return (
    <CaseStudyMediaContext.Provider value={value}>
      {children}
    </CaseStudyMediaContext.Provider>
  );
}

export function useCaseStudyMedia() {
  return useContext(CaseStudyMediaContext);
}

function paintFirstFrame(video) {
  if (!video || !video.paused) return;
  if (video.currentTime >= 0.05) return;
  try {
    video.currentTime = 0.001;
  } catch {
    /* ignore seek errors before ready */
  }
}

function markVideoReady(video) {
  video?.classList.add("is-ready");
}

function applyPlaybackRate(video, rate) {
  if (!video || rate == null || rate === 1) return;
  video.playbackRate = rate;
}

function revealPausedFrame(video) {
  if (!video || !video.paused || video.classList.contains("is-ready")) return;

  const reveal = () => markVideoReady(video);
  window.setTimeout(reveal, 400);

  if (video.currentTime >= 0.05) {
    reveal();
    return;
  }

  const onSeeked = () => {
    video.removeEventListener("seeked", onSeeked);
    reveal();
  };
  video.addEventListener("seeked", onSeeked);
  paintFirstFrame(video);
}

function revealAfterPresentedFrames(video, frameCount = REVEAL_AFTER_FRAMES) {
  if (!video || video.classList.contains("is-ready")) return;

  let done = false;
  const reveal = () => {
    if (done) return;
    done = true;
    markVideoReady(video);
  };

  window.setTimeout(reveal, 400);

  if (typeof video.requestVideoFrameCallback === "function") {
    const wait = (remaining) => {
      video.requestVideoFrameCallback(() => {
        if (remaining <= 1) reveal();
        else wait(remaining - 1);
      });
    };
    wait(frameCount);
    return;
  }

  const startedAt = video.currentTime;
  const onTimeUpdate = () => {
    if (video.currentTime - startedAt >= 0.1 || video.currentTime >= 0.1) {
      video.removeEventListener("timeupdate", onTimeUpdate);
      reveal();
    }
  };
  video.addEventListener("timeupdate", onTimeUpdate);
}

export function useCaseStudyManagedVideo(id, { eager = false } = {}) {
  const videoRef = useRef(null);
  const orderRef = useRef(0);
  if (orderRef.current === 0) {
    videoOrder += 1;
    orderRef.current = videoOrder;
  }

  const { register, setVisible, setInView, playRootMargin } = useContext(
    CaseStudyMediaContext,
  );
  const [shouldLoad, setShouldLoad] = useState(eager);
  const playMargin = playRootMargin || PLAY_ROOT_MARGIN;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    const unregister = register(id, video, orderRef.current);

    const loadObserver = eager
      ? null
      : new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              setShouldLoad(true);
              loadObserver.disconnect();
            }
          },
          { rootMargin: LOAD_ROOT_MARGIN, threshold: 0 },
        );

    const playObserver = new IntersectionObserver(
      ([entry]) => {
        setVisible(id, entry.isIntersecting);
      },
      { rootMargin: playMargin, threshold: 0 },
    );

    const inViewObserver = new IntersectionObserver(
      ([entry]) => {
        setInView(id, entry.isIntersecting);
      },
      { rootMargin: "0px", threshold: 0 },
    );

    loadObserver?.observe(video);
    playObserver.observe(video);
    inViewObserver.observe(video);
    if (eager) {
      setShouldLoad(true);
      setVisible(id, true);
      setInView(id, true);
    }

    return () => {
      loadObserver?.disconnect();
      playObserver.disconnect();
      inViewObserver.disconnect();
      unregister();
    };
  }, [id, eager, register, setVisible, setInView, playMargin]);

  return { videoRef, shouldLoad };
}

export function CaseStudyInlineVideo({
  id,
  src,
  className = "",
  eager = false,
  playbackRate = 1,
  ...props
}) {
  const { reducedMotion, notifyReady } = useContext(CaseStudyMediaContext);
  const { videoRef, shouldLoad } = useCaseStudyManagedVideo(id, { eager });
  const videoClassName = className
    ? `cs-inline-video ${className}`
    : "cs-inline-video";

  return (
    <video
      ref={videoRef}
      className={videoClassName}
      loop
      playsInline
      preload={shouldLoad ? "auto" : "none"}
      {...props}
      muted
      src={shouldLoad ? src : undefined}
      onLoadedMetadata={(event) => {
        props.onLoadedMetadata?.(event);
        applyPlaybackRate(event.currentTarget, playbackRate);
        if (reducedMotion) paintFirstFrame(event.currentTarget);
      }}
      onLoadedData={(event) => {
        props.onLoadedData?.(event);
        applyPlaybackRate(event.currentTarget, playbackRate);
        if (reducedMotion) {
          paintFirstFrame(event.currentTarget);
          event.currentTarget.pause();
          event.currentTarget.currentTime = 0;
          markVideoReady(event.currentTarget);
          return;
        }
        revealPausedFrame(event.currentTarget);
        if (event.currentTarget.readyState >= 3) notifyReady();
      }}
      onCanPlay={(event) => {
        props.onCanPlay?.(event);
        applyPlaybackRate(event.currentTarget, playbackRate);
        if (!reducedMotion) notifyReady();
      }}
      onPlaying={(event) => {
        props.onPlaying?.(event);
        applyPlaybackRate(event.currentTarget, playbackRate);
        revealAfterPresentedFrames(event.currentTarget);
      }}
    />
  );
}

export function CaseStudyVolumeVideo({
  id,
  src,
  className = "",
  eager = false,
  ...props
}) {
  const { activeVolumeId, toggleVolume, reducedMotion, notifyReady } =
    useContext(CaseStudyMediaContext);
  const { videoRef, shouldLoad } = useCaseStudyManagedVideo(id, { eager });
  const unmuted = activeVolumeId === id;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;
    video.muted = !unmuted;
    if (unmuted) video.volume = 1;
    return undefined;
  }, [unmuted, videoRef]);

  return (
    <div
      className={`cs-volume-video pfal-volume-video${className ? ` ${className}` : ""}`}
    >
      <video
        ref={videoRef}
        loop
        muted={!unmuted}
        playsInline
        preload={shouldLoad ? "auto" : "none"}
        {...props}
        src={shouldLoad ? src : undefined}
        onLoadedMetadata={(event) => {
          props.onLoadedMetadata?.(event);
          if (reducedMotion) paintFirstFrame(event.currentTarget);
        }}
        onLoadedData={(event) => {
          props.onLoadedData?.(event);
          if (reducedMotion) {
            paintFirstFrame(event.currentTarget);
            event.currentTarget.pause();
            event.currentTarget.currentTime = 0;
            markVideoReady(event.currentTarget);
            return;
          }
          revealPausedFrame(event.currentTarget);
          if (event.currentTarget.readyState >= 3) notifyReady();
        }}
        onCanPlay={(event) => {
          props.onCanPlay?.(event);
          if (!reducedMotion) notifyReady();
        }}
        onPlaying={(event) => {
          props.onPlaying?.(event);
          revealAfterPresentedFrames(event.currentTarget);
        }}
      />
      <button
        type="button"
        className="cs-volume-toggle pfal-volume-toggle"
        aria-label={unmuted ? "Mute video" : "Unmute video"}
        aria-pressed={unmuted}
        onClick={() => toggleVolume(id)}
      >
        <img
          src={`/work/icons/${unmuted ? "volume-on" : "volume-off"}.svg`}
          alt=""
        />
      </button>
    </div>
  );
}
