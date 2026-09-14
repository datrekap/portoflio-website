import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  Alignment,
  Fit,
  Layout,
  useRive,
  useStateMachineInput,
} from "@rive-app/react-canvas";
import { gsap } from "gsap";

const RIVE_SRC = "/play/dk-character.riv";
const RIVE_ARTBOARD = "Artboard 1";
const RIVE_STATE_MACHINE = "Home";
const RIVE_CLICKED_INPUT = "isClicked";
const RIVE_DESIGN_ENG_INPUT = "playDesignEng";
const RIVE_RESEARCHER_INPUT = "playResearcher";
const RIVE_LAYOUT = new Layout({
  fit: Fit.Contain,
  alignment: Alignment.BottomCenter,
});
const GROUND_TILE = 1517;
const WALK_SPEED = 140;
const DISMISS_MS = 2400;
const CLICK_PULSE_MS = 80;

const INTRO_LINES = [
  "HEY.",
  "YOU MADE IT.",
  "DON'T MIND THE SLOPE.",
  "I LIVE HERE.",
  "NAME'S ON THE LEFT.",
  "I JUST WALK.",
  "I'M STILL HERE.",
  "THE WORK IS DOWN.",
  "OR KEEP POKING.",
  "BUSY.",
  "I SAW THAT.",
  "TWO DEGREES. ON PURPOSE.",
  "I DO NOT JUMP HERE.",
  "PLAY IS THE OTHER PAGE.",
  "GRID IS DECORATIVE. MOSTLY.",
  "THAT IS NOT A BUTTON.",
  "STILL WALKING.",
  "NOT THE CASE STUDY.",
  "&",
  "AGAIN?",
];

const SHUFFLE_LINES = [
  "FINE.",
  "WE DID THIS.",
  "STILL HERE.",
  "WALKING. STILL.",
  "THE SLOPE HASN'T MOVED.",
  "YOU'RE PERSISTENT.",
  "I'LL ALLOW IT.",
  "SCROLL WHEN YOU'RE READY.",
  "WORK. DOWN THERE.",
  "PLAY. OTHER PAGE.",
  "THIS IS THE HERO.",
  "NOT A GAME.",
  "ORANGE IS THE &.",
  "DON'T FALL IN.",
  "LEFT FOOT. RIGHT FOOT.",
  "NO NEW LINES.",
  "OKAY. ONE MORE.",
  "NOTED.",
  "&",
  "AGAIN?",
];

function wrapMod(n, m) {
  return ((n % m) + m) % m;
}

function shuffle(items) {
  const next = items.slice();
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const hold = next[i];
    next[i] = next[j];
    next[j] = hold;
  }
  return next;
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function fireRiveTrigger(input) {
  if (typeof input?.fire === "function") input.fire();
}

function HomeFigure({ isClicked, reducedMotion, triggerFireRef }) {
  const { rive, RiveComponent, setContainerRef } = useRive(
    {
      src: RIVE_SRC,
      artboard: RIVE_ARTBOARD,
      stateMachines: RIVE_STATE_MACHINE,
      autoplay: !reducedMotion,
      layout: RIVE_LAYOUT,
      shouldDisableRiveListeners: true,
    },
    {
      shouldResizeCanvasToContainer: true,
    },
  );

  const clickedInput = useStateMachineInput(
    rive,
    RIVE_STATE_MACHINE,
    RIVE_CLICKED_INPUT,
    isClicked,
  );
  const playDesignEngInput = useStateMachineInput(
    rive,
    RIVE_STATE_MACHINE,
    RIVE_DESIGN_ENG_INPUT,
  );
  const playResearcherInput = useStateMachineInput(
    rive,
    RIVE_STATE_MACHINE,
    RIVE_RESEARCHER_INPUT,
  );

  useEffect(() => {
    if (clickedInput) clickedInput.value = isClicked;
  }, [clickedInput, isClicked]);

  useEffect(() => {
    if (!triggerFireRef) return undefined;
    triggerFireRef.current = {
      playDesignEng: () => fireRiveTrigger(playDesignEngInput),
      playResearcher: () => fireRiveTrigger(playResearcherInput),
    };
    return () => {
      triggerFireRef.current = null;
    };
  }, [triggerFireRef, playDesignEngInput, playResearcherInput]);

  useEffect(() => {
    if (!rive) return;
    if (reducedMotion) {
      rive.pause();
      return;
    }
    rive.play();
  }, [rive, reducedMotion]);

  return (
    <div ref={setContainerRef} className="home-hero-rive-wrap">
      <RiveComponent className="home-hero-rive" aria-hidden="true" />
    </div>
  );
}

const HomeHeroWalk = forwardRef((props, ref) => {
  const sceneRef = useRef(null);
  const walkerRef = useRef(null);
  const captionRef = useRef(null);
  const triggerFireRef = useRef(null);
  const tweenRef = useRef(null);
  const dismissRef = useRef(0);
  const clickPulseRef = useRef(0);
  const introIndexRef = useRef(0);
  const poolRef = useRef([]);
  const captionTextRef = useRef(null);
  const [caption, setCaption] = useState(null);
  const [isClicked, setIsClicked] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  const nextLine = useCallback(() => {
    if (introIndexRef.current < INTRO_LINES.length) {
      const line = INTRO_LINES[introIndexRef.current];
      introIndexRef.current += 1;
      return line;
    }
    if (poolRef.current.length === 0) {
      poolRef.current = shuffle(SHUFFLE_LINES);
    }
    return poolRef.current.pop();
  }, []);

  const clearDismiss = useCallback(() => {
    window.clearTimeout(dismissRef.current);
  }, []);

  const hideCaption = useCallback((onDone) => {
    const el = captionRef.current;
    tweenRef.current?.kill();
    const finish = () => {
      if (onDone) {
        onDone();
        return;
      }
      captionTextRef.current = null;
      setCaption(null);
    };
    if (!el || !captionTextRef.current) {
      finish();
      return;
    }
    if (prefersReducedMotion()) {
      gsap.set(el, { opacity: 0, scale: 0.4, y: 28 });
      finish();
      return;
    }
    tweenRef.current = gsap.to(el, {
      scale: 0.45,
      y: 28,
      opacity: 0,
      duration: 0.16,
      ease: "back.in(3)",
      onComplete: finish,
    });
  }, []);

  const scheduleDismiss = useCallback(() => {
    clearDismiss();
    dismissRef.current = window.setTimeout(() => {
      hideCaption();
    }, DISMISS_MS);
  }, [clearDismiss, hideCaption]);

  useLayoutEffect(() => {
    const el = captionRef.current;
    if (!caption || !el) return undefined;
    tweenRef.current?.kill();
    if (prefersReducedMotion()) {
      gsap.set(el, { opacity: 1, scale: 1, y: 0 });
      return undefined;
    }
    tweenRef.current = gsap.fromTo(
      el,
      { scale: 0.4, y: 36, opacity: 0 },
      {
        scale: 1,
        y: 0,
        opacity: 1,
        duration: 0.38,
        ease: "back.out(4)",
      },
    );
    return undefined;
  }, [caption]);

  const presentLine = useCallback(
    (line) => {
      captionTextRef.current = line;
      setCaption(line);
      scheduleDismiss();
    },
    [scheduleDismiss],
  );

  useImperativeHandle(ref, () => ({
    playDesignEng() {
      triggerFireRef.current?.playDesignEng?.();
    },
    playResearcher() {
      triggerFireRef.current?.playResearcher?.();
    },
  }));

  const pulseClicked = useCallback(() => {
    if (prefersReducedMotion()) return;
    window.clearTimeout(clickPulseRef.current);
    setIsClicked(true);
    clickPulseRef.current = window.setTimeout(() => {
      setIsClicked(false);
    }, CLICK_PULSE_MS);
  }, []);

  const onPoke = useCallback(() => {
    const walker = walkerRef.current;
    if (walker && !prefersReducedMotion()) {
      walker.classList.remove("is-poking");
      void walker.offsetWidth;
      walker.classList.add("is-poking");
    }
    pulseClicked();
    const line = nextLine();
    clearDismiss();
    const present = () => presentLine(line);
    if (captionTextRef.current) {
      hideCaption(present);
      return;
    }
    present();
  }, [clearDismiss, hideCaption, nextLine, presentLine, pulseClicked]);

  useEffect(() => {
    let cancelled = false;
    const LANDING_MS = 1800;
    const afterLanding = new Promise((resolve) => {
      window.setTimeout(resolve, LANDING_MS);
    });
    const afterLoad =
      document.readyState === "complete"
        ? Promise.resolve()
        : new Promise((resolve) => {
            window.addEventListener("load", resolve, { once: true });
          });

    Promise.all([afterLoad, afterLanding]).then(() => {
      if (cancelled) return;
      if (introIndexRef.current !== 0 || captionTextRef.current) return;
      presentLine(nextLine());
    });

    return () => {
      cancelled = true;
    };
  }, [nextLine, presentLine]);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncReduced = () => setReducedMotion(reduced.matches);
    syncReduced();
    let raf = 0;
    let last = performance.now();
    let groundX = 0;

    const paint = (now) => {
      if (reduced.matches) {
        sceneRef.current?.style.setProperty("--home-ground-x", "0px");
        return;
      }

      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      groundX = wrapMod(groundX + WALK_SPEED * dt, GROUND_TILE);
      sceneRef.current?.style.setProperty("--home-ground-x", `${-groundX}px`);
      raf = requestAnimationFrame(paint);
    };

    const onMotionChange = () => {
      syncReduced();
      cancelAnimationFrame(raf);
      last = performance.now();
      raf = requestAnimationFrame(paint);
    };

    reduced.addEventListener("change", onMotionChange);
    raf = requestAnimationFrame(paint);

    return () => {
      reduced.removeEventListener("change", onMotionChange);
      cancelAnimationFrame(raf);
      window.clearTimeout(dismissRef.current);
      window.clearTimeout(clickPulseRef.current);
      tweenRef.current?.kill();
    };
  }, []);

  return (
    <div ref={sceneRef} className="home-hero-scene">
      <div className="home-hero-apron" aria-hidden="true" />
      <div className="home-hero-ground" aria-hidden="true" />
      <div className="home-hero-walker-slot">
        <button
          ref={walkerRef}
          type="button"
          className="home-hero-walker"
          aria-label="Stick figure. Poke to hear from him."
          onClick={onPoke}
          onAnimationEnd={(event) => {
            if (event.animationName !== "home-walker-poke") return;
            event.currentTarget.classList.remove("is-poking");
          }}
        >
          <HomeFigure
            isClicked={isClicked}
            reducedMotion={reducedMotion}
            triggerFireRef={triggerFireRef}
          />
        </button>
        <span className="home-hero-caption-anchor">
          <span
            ref={captionRef}
            className={`home-hero-caption${caption ? " is-visible" : ""}`}
            aria-live="polite"
            aria-atomic="true"
          >
            {caption}
          </span>
        </span>
      </div>
    </div>
  );
});

HomeHeroWalk.displayName = "HomeHeroWalk";

export default HomeHeroWalk;
