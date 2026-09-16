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
import {
  DESIGN_ENG_LINES,
  OPENER_LINES,
  RESEARCHER_LINES,
  SLOT_BEATS,
  SLOT_NEEDLES,
  SLOT_OPENERS,
  SLOT_POINTERS,
  WALKER_LINES,
  WARMUP_ACCLIMATE_LINES,
  WARMUP_GUIDE_LINES,
} from "../../data/homeHeroLines";

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
const GROUND_TILE = 1521.08;
const WALK_SPEED = 140;
const DISMISS_MS = 2400;
const CLICK_PULSE_MS = 80;
const RESEARCHER_RIVE_DELAY_MS = 500;
const RECENT_WINDOW = 8;
const SLOT_BATCH = 12;
const MAX_WORDS = 5;

const SLOT_PATTERNS = [
  [SLOT_OPENERS, SLOT_BEATS],
  [SLOT_NEEDLES],
  [SLOT_POINTERS],
  [SLOT_OPENERS, SLOT_NEEDLES],
  [SLOT_BEATS],
  [SLOT_OPENERS, SLOT_POINTERS],
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

function pick(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function wordCount(line) {
  return line.trim().split(/\s+/).filter(Boolean).length;
}

function buildSlotLine(recent) {
  for (let attempt = 0; attempt < 16; attempt += 1) {
    const pattern = pick(SLOT_PATTERNS);
    const line = pattern.map((slot) => pick(slot)).join(" ");
    if (wordCount(line) > MAX_WORDS) continue;
    if (recent.includes(line)) continue;
    return line;
  }
  return pick(SLOT_BEATS);
}

function makeSlotBatch(recent) {
  const batch = [];
  const blocked = recent.slice();
  for (let i = 0; i < SLOT_BATCH; i += 1) {
    const line = buildSlotLine(blocked);
    batch.push(line);
    blocked.push(line);
  }
  return batch;
}

function pickWarmupDeck() {
  const acclimate = shuffle(WARMUP_ACCLIMATE_LINES);
  const guides = shuffle(WARMUP_GUIDE_LINES);
  return shuffle([acclimate[0], acclimate[1], guides[0]]);
}

function createSessionDecks() {
  // One opener on load, then three warmup pokes, then walker lines.
  const openers = shuffle(OPENER_LINES);
  return {
    intro: openers.slice(0, 1),
    warmup: pickWarmupDeck(),
    poke: shuffle(WALKER_LINES),
    design: shuffle(DESIGN_ENG_LINES),
    research: shuffle(RESEARCHER_LINES),
    pokeRefills: 0,
  };
}

function takeFromDeck(deck, source, recent) {
  if (deck.length === 0) {
    deck.push(...shuffle(source));
  }
  let line = deck.pop();
  if (recent.includes(line) && deck.length > 0) {
    const swapAt = deck.findIndex((item) => !recent.includes(item));
    if (swapAt >= 0) {
      const swap = deck[swapAt];
      deck[swapAt] = line;
      line = swap;
    }
  }
  return line;
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
  const researcherRiveRef = useRef(0);
  const decksRef = useRef(null);
  const recentRef = useRef([]);
  const hasSpokenRef = useRef(false);
  const captionTextRef = useRef(null);
  if (decksRef.current === null) {
    decksRef.current = createSessionDecks();
  }
  const [caption, setCaption] = useState(null);
  const [isClicked, setIsClicked] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  const rememberLine = useCallback((line) => {
    const recent = recentRef.current;
    recent.push(line);
    if (recent.length > RECENT_WINDOW) recent.shift();
  }, []);

  const nextWalkerLine = useCallback(() => {
    const decks = decksRef.current;
    const recent = recentRef.current;
    if (decks.intro.length > 0) {
      return decks.intro.shift();
    }
    if (decks.warmup.length > 0) {
      return decks.warmup.shift();
    }
    if (decks.poke.length === 0) {
      decks.pokeRefills += 1;
      decks.poke =
        decks.pokeRefills % 2 === 1
          ? makeSlotBatch(recent)
          : shuffle(WALKER_LINES);
    }
    return takeFromDeck(decks.poke, WALKER_LINES, recent);
  }, []);

  const nextRoleLine = useCallback((role) => {
    const decks = decksRef.current;
    const source = role === "design" ? DESIGN_ENG_LINES : RESEARCHER_LINES;
    const deck = role === "design" ? decks.design : decks.research;
    return takeFromDeck(deck, source, recentRef.current);
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
      hasSpokenRef.current = true;
      rememberLine(line);
      captionTextRef.current = line;
      setCaption(line);
      scheduleDismiss();
    },
    [rememberLine, scheduleDismiss],
  );

  const pulseClicked = useCallback(() => {
    if (prefersReducedMotion()) return;
    window.clearTimeout(clickPulseRef.current);
    setIsClicked(true);
    clickPulseRef.current = window.setTimeout(() => {
      setIsClicked(false);
    }, CLICK_PULSE_MS);
  }, []);

  const hopWalker = useCallback(() => {
    const walker = walkerRef.current;
    if (walker && !prefersReducedMotion()) {
      walker.classList.remove("is-poking");
      void walker.offsetWidth;
      walker.classList.add("is-poking");
    }
    pulseClicked();
  }, [pulseClicked]);

  const showLine = useCallback(
    (line) => {
      clearDismiss();
      const present = () => presentLine(line);
      if (captionTextRef.current) {
        hideCaption(present);
        return;
      }
      present();
    },
    [clearDismiss, hideCaption, presentLine],
  );

  const playRole = useCallback(
    (role) => {
      hopWalker();
      if (role === "design") {
        triggerFireRef.current?.playDesignEng?.();
      } else {
        window.clearTimeout(researcherRiveRef.current);
        researcherRiveRef.current = window.setTimeout(() => {
          triggerFireRef.current?.playResearcher?.();
        }, RESEARCHER_RIVE_DELAY_MS);
      }
      showLine(nextRoleLine(role));
    },
    [hopWalker, nextRoleLine, showLine],
  );

  useImperativeHandle(
    ref,
    () => ({
      playDesignEng() {
        playRole("design");
      },
      playResearcher() {
        playRole("research");
      },
      startIdleSpeech() {
        if (hasSpokenRef.current || captionTextRef.current) return;
        presentLine(nextWalkerLine());
      },
    }),
    [playRole, presentLine, nextWalkerLine],
  );

  const onPoke = useCallback(() => {
    hopWalker();
    showLine(nextWalkerLine());
  }, [hopWalker, nextWalkerLine, showLine]);

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
      window.clearTimeout(researcherRiveRef.current);
      tweenRef.current?.kill();
    };
  }, []);

  return (
    <div ref={sceneRef} className="home-hero-scene">
      <div className="home-hero-floor" aria-hidden="true">
        <div className="home-hero-apron" />
        <div className="home-hero-ground" />
      </div>
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
