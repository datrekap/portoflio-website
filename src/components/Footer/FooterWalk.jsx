import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alignment,
  Fit,
  Layout,
  useRive,
} from "@rive-app/react-canvas";
import { gsap } from "gsap";
import useTransitionGate from "../../hooks/useTransitionGate";
import {
  FOOTER_IDLE_LINES,
  FOOTER_POKE_LINES,
} from "../../data/footerFallLines";

const RIVE_SRC = "/play/dk-character.riv";
const RIVE_ARTBOARD = "Artboard 1";
const RIVE_STATE_MACHINE = "Footer";
const RIVE_LAYOUT = new Layout({
  fit: Fit.Contain,
  alignment: Alignment.BottomCenter,
});
const GROUND_TILE = 1521.08;
const WALK_SPEED = 90;
const WALK_SPEED_PHONE = 36;
const RIVE_SPEED_PHONE = 0.45;
const PHONE_MQ = "(max-width: 768px)";
const DISMISS_MS = 2400;
const IDLE_GAP_MS = 4200;
const MAX_WORDS = 5;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function wrapMod(value, size) {
  return ((value % size) + size) % size;
}

function shuffle(list) {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function takeFromDeck(deck, source, lastLine) {
  if (!deck.length) deck.push(...shuffle(source));
  let line = deck.shift();
  if (line === lastLine && deck.length) {
    const swapAt = deck.findIndex((item) => item !== lastLine);
    if (swapAt >= 0) {
      const swap = deck[swapAt];
      deck[swapAt] = line;
      line = swap;
    }
  }
  return line;
}

function wordCount(line) {
  return line.trim().split(/\s+/).filter(Boolean).length;
}

function FooterWalkerFigure({ paused, reducedMotion }) {
  const { rive, RiveComponent, setContainerRef } = useRive(
    {
      src: RIVE_SRC,
      artboard: RIVE_ARTBOARD,
      stateMachines: RIVE_STATE_MACHINE,
      autoplay: !reducedMotion && !paused,
      layout: RIVE_LAYOUT,
      shouldDisableRiveListeners: true,
    },
    { shouldResizeCanvasToContainer: true },
  );

  useEffect(() => {
    if (!rive) return;
    if (reducedMotion || paused) rive.pause();
    else rive.play();
  }, [rive, paused, reducedMotion]);

  useEffect(() => {
    if (!rive || !("speed" in rive)) return undefined;
    const apply = () => {
      rive.speed = window.matchMedia(PHONE_MQ).matches ? RIVE_SPEED_PHONE : 1;
    };
    apply();
    const mq = window.matchMedia(PHONE_MQ);
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [rive]);

  return (
    <div ref={setContainerRef} className="footer-walker-rive">
      <RiveComponent aria-hidden="true" />
    </div>
  );
}

export default function FooterWalk() {
  const stageRef = useRef(null);
  const walkerRef = useRef(null);
  const captionRef = useRef(null);
  const captionTweenRef = useRef(null);
  const idleTimerRef = useRef(0);
  const captionTextRef = useRef(null);
  const lastLineRef = useRef(null);
  const decksRef = useRef(null);
  const xRef = useRef(0);
  const groundRef = useRef(0);
  const runWhenSettled = useTransitionGate();
  const [paused, setPaused] = useState(true);
  const [caption, setCaption] = useState(null);
  const [reducedMotion, setReducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  if (decksRef.current === null) {
    decksRef.current = {
      idle: shuffle(FOOTER_IDLE_LINES),
      poke: shuffle(FOOTER_POKE_LINES),
    };
  }

  const hideCaption = useCallback((onDone) => {
    const el = captionRef.current;
    captionTweenRef.current?.kill();
    const finish = () => {
      captionTextRef.current = null;
      setCaption(null);
      onDone?.();
    };
    if (!el || !captionTextRef.current) {
      finish();
      return;
    }
    if (prefersReducedMotion()) {
      gsap.set(el, { opacity: 0, y: 8, scale: 0.92 });
      finish();
      return;
    }
    captionTweenRef.current = gsap.to(el, {
      opacity: 0,
      y: 10,
      scale: 0.92,
      duration: 0.28,
      ease: "power2.in",
      onComplete: finish,
    });
  }, []);

  const showLine = useCallback(
    (line) => {
      if (!line || wordCount(line) > MAX_WORDS) return;
      lastLineRef.current = line;
      hideCaption(() => {
        captionTextRef.current = line;
        setCaption(line);
        requestAnimationFrame(() => {
          const el = captionRef.current;
          if (!el) return;
          captionTweenRef.current?.kill();
          if (prefersReducedMotion()) {
            gsap.set(el, { opacity: 1, y: 0, scale: 1 });
            return;
          }
          gsap.fromTo(
            el,
            { opacity: 0, y: 12, scale: 0.9 },
            { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: "power2.out" },
          );
        });
        window.clearTimeout(idleTimerRef.current);
        idleTimerRef.current = window.setTimeout(() => {
          hideCaption();
        }, DISMISS_MS);
      });
    },
    [hideCaption],
  );

  const nextIdleLine = useCallback(
    () =>
      takeFromDeck(
        decksRef.current.idle,
        FOOTER_IDLE_LINES,
        lastLineRef.current,
      ),
    [],
  );

  const nextPokeLine = useCallback(
    () =>
      takeFromDeck(
        decksRef.current.poke,
        FOOTER_POKE_LINES,
        lastLineRef.current,
      ),
    [],
  );

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(reduced.matches);
    sync();
    reduced.addEventListener("change", sync);
    return () => reduced.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;

    let observer = null;
    const cancelGate = runWhenSettled(() => {
      observer = new IntersectionObserver(
        ([entry]) => {
          setPaused(!entry?.isIntersecting);
        },
        { threshold: 0.05 },
      );
      observer.observe(stage);
    });

    return () => {
      cancelGate();
      observer?.disconnect();
    };
  }, [runWhenSettled]);

  useEffect(() => {
    if (paused || reducedMotion) return undefined;
    idleTimerRef.current = window.setTimeout(() => {
      showLine(nextIdleLine());
    }, IDLE_GAP_MS);
    const id = window.setInterval(() => {
      showLine(nextIdleLine());
    }, IDLE_GAP_MS + DISMISS_MS);
    return () => {
      window.clearTimeout(idleTimerRef.current);
      window.clearInterval(id);
    };
  }, [paused, reducedMotion, nextIdleLine, showLine]);

  useEffect(() => {
    const stage = stageRef.current;
    const walker = walkerRef.current;
    if (!stage || !walker) return undefined;

    let raf = 0;
    let last = performance.now();
    const walkerWidth = () => walker.offsetWidth || 160;
    const speedForView = () =>
      window.matchMedia(PHONE_MQ).matches ? WALK_SPEED_PHONE : WALK_SPEED;

    const reset = () => {
      xRef.current = -walkerWidth();
      groundRef.current = 0;
      walker.style.transform = `translate3d(${xRef.current}px, 0, 0)`;
      stage.style.setProperty("--footer-ground-x", "0px");
    };

    if (reducedMotion || paused) {
      reset();
      return undefined;
    }

    const paint = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const width = stage.clientWidth;
      const speed = speedForView();
      xRef.current += speed * dt;
      if (xRef.current > width) xRef.current = -walkerWidth();
      groundRef.current = wrapMod(
        groundRef.current + speed * dt,
        GROUND_TILE,
      );
      walker.style.transform = `translate3d(${xRef.current}px, 0, 0)`;
      stage.style.setProperty(
        "--footer-ground-x",
        `${-groundRef.current}px`,
      );
      raf = requestAnimationFrame(paint);
    };

    reset();
    raf = requestAnimationFrame(paint);
    return () => cancelAnimationFrame(raf);
  }, [paused, reducedMotion]);

  useEffect(
    () => () => {
      window.clearTimeout(idleTimerRef.current);
      captionTweenRef.current?.kill();
    },
    [],
  );

  return (
    <div ref={stageRef} className="footer-walk">
      <div className="footer-ground" aria-hidden="true" />
      <div
        ref={walkerRef}
        className="footer-walker"
      >
        <button
          type="button"
          className="footer-walker-hit"
          aria-label="Walking figure. Click for a goodbye."
          onClick={() => showLine(nextPokeLine())}
        >
          <FooterWalkerFigure paused={paused} reducedMotion={reducedMotion} />
        </button>
        <span className="footer-walker-caption-anchor">
          <span
            ref={captionRef}
            className={`footer-walker-caption${caption ? " is-visible" : ""}`}
            aria-hidden={!caption}
          >
            {caption}
          </span>
        </span>
      </div>
    </div>
  );
}
