import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  Alignment,
  Fit,
  Layout,
  useRive,
  useStateMachineInput,
} from "@rive-app/react-canvas";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  FOOTER_IDLE_LINES,
  FOOTER_POKE_LINES,
} from "../../data/footerFallLines";

gsap.registerPlugin(ScrollTrigger);

const RIVE_SRC = "/play/dk-character.riv";
const RIVE_ARTBOARD = "Artboard 1";
const RIVE_STATE_MACHINE = "Footer";
const RIVE_STRETCH_INPUT = "Boolean 1";
const RIVE_LAYOUT = new Layout({
  fit: Fit.Contain,
  alignment: Alignment.BottomCenter,
});
const CLOUD_SRC = "/play/cloud.png";
const BOB_PX = 10;
const IDLE_DWELL_MS = 3600;
const IDLE_GAP_MS = 2600;
const IDLE_RESUME_MS = 400;
const PREP_Y = -98;
const PREP_DURATION = 0.5;
const PREP_HOLD = 0;
const FALL_DURATION = 0.48;
const STRETCH_DELAY = 0.2;

const CLOUDS = [
  { id: "small", className: "footer-cloud footer-cloud--small", speed: 180 },
  { id: "medium", className: "footer-cloud footer-cloud--medium", speed: 300 },
  { id: "large", className: "footer-cloud footer-cloud--large", speed: 520 },
];

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

function takeFromDeck(deck, source, lastLine) {
  if (deck.length === 0) {
    deck.push(...shuffle(source));
  }
  let line = deck.pop();
  if (line === lastLine && deck.length > 0) {
    const swapAt = deck.findIndex((item) => item !== lastLine);
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

function FooterFigure({ paused, reducedMotion, stretchInputRef }) {
  const { rive, RiveComponent, setContainerRef } = useRive(
    {
      src: RIVE_SRC,
      artboard: RIVE_ARTBOARD,
      stateMachines: RIVE_STATE_MACHINE,
      autoplay: !reducedMotion && !paused,
      layout: RIVE_LAYOUT,
      shouldDisableRiveListeners: true,
    },
    {
      shouldResizeCanvasToContainer: true,
    },
  );

  const stretchInput = useStateMachineInput(
    rive,
    RIVE_STATE_MACHINE,
    RIVE_STRETCH_INPUT,
    false,
  );

  useEffect(() => {
    if (!stretchInputRef) return undefined;
    stretchInputRef.current = stretchInput;
    return () => {
      stretchInputRef.current = null;
    };
  }, [stretchInput, stretchInputRef]);

  useEffect(() => {
    if (!rive) return;
    if (reducedMotion || paused) {
      rive.pause();
      return;
    }
    rive.play();
  }, [rive, paused, reducedMotion]);

  return (
    <div ref={setContainerRef} className="footer-faller-rive-wrap">
      <RiveComponent className="footer-faller-rive" aria-hidden="true" />
    </div>
  );
}

const FooterFall = () => {
  const stageRef = useRef(null);
  const fallerRef = useRef(null);
  const bobTargetRef = useRef(null);
  const captionRef = useRef(null);
  const cloudRefs = useRef([]);
  const tweenRef = useRef(null);
  const captionTweenRef = useRef(null);
  const bobRef = useRef(null);
  const busyRef = useRef(false);
  const reducedRef = useRef(false);
  const stretchInputRef = useRef(null);
  const idleTimerRef = useRef(0);
  const idleResumeRef = useRef(0);
  const pokeHoldRef = useRef(0);
  const idleActiveRef = useRef(false);
  const captionTextRef = useRef(null);
  const lastLineRef = useRef(null);
  const decksRef = useRef(null);
  const startIdleTalkRef = useRef(() => {});
  const stopIdleTalkRef = useRef(() => {});
  const hideCaptionNowRef = useRef(() => {});
  if (decksRef.current === null) {
    decksRef.current = {
      idle: shuffle(FOOTER_IDLE_LINES),
      poke: shuffle(FOOTER_POKE_LINES),
    };
  }
  const [paused, setPaused] = useState(true);
  const [caption, setCaption] = useState(null);
  const [reducedMotion, setReducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  const setStretch = useCallback((value) => {
    const input = stretchInputRef.current;
    if (!input) return;
    input.value = value;
  }, []);

  const stopBob = useCallback(() => {
    bobRef.current?.kill();
    bobRef.current = null;
    if (bobTargetRef.current) gsap.set(bobTargetRef.current, { y: 0 });
  }, []);

  const startBob = useCallback(() => {
    const el = bobTargetRef.current;
    if (!el || reducedRef.current) return;
    stopBob();
    bobRef.current = gsap.to(el, {
      y: BOB_PX,
      duration: 1.9,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });
  }, [stopBob]);

  const nextIdleLine = useCallback(() => {
    return takeFromDeck(
      decksRef.current.idle,
      FOOTER_IDLE_LINES,
      lastLineRef.current,
    );
  }, []);

  const nextPokeLine = useCallback(() => {
    return takeFromDeck(
      decksRef.current.poke,
      FOOTER_POKE_LINES,
      lastLineRef.current,
    );
  }, []);

  const clearIdleTimers = useCallback(() => {
    window.clearTimeout(idleTimerRef.current);
    window.clearTimeout(idleResumeRef.current);
  }, []);

  const hideCaption = useCallback((onDone) => {
    const el = captionRef.current;
    captionTweenRef.current?.kill();
    const finish = () => {
      captionTextRef.current = null;
      setCaption(null);
      if (onDone) onDone();
    };
    if (!el || !captionTextRef.current) {
      finish();
      return;
    }
    if (prefersReducedMotion()) {
      gsap.set(el, { opacity: 0, x: 36, y: 0, scale: 0.9 });
      finish();
      return;
    }
    captionTweenRef.current = gsap.to(el, {
      x: 36,
      y: 0,
      scale: 0.9,
      opacity: 0,
      duration: 0.18,
      ease: "power2.in",
      onComplete: finish,
    });
  }, []);

  const presentLineRef = useRef(() => {});

  const presentLine = useCallback(
    (line) => {
      lastLineRef.current = line;
      captionTextRef.current = line;
      setCaption(line);
      if (!idleActiveRef.current || busyRef.current) return;
      window.clearTimeout(idleTimerRef.current);
      idleTimerRef.current = window.setTimeout(() => {
        if (!idleActiveRef.current || busyRef.current) return;
        const next = nextIdleLine();
        hideCaption(() => {
          idleResumeRef.current = window.setTimeout(() => {
            if (!idleActiveRef.current || busyRef.current) return;
            presentLineRef.current(next);
          }, IDLE_GAP_MS);
        });
      }, IDLE_DWELL_MS);
    },
    [hideCaption, nextIdleLine],
  );
  presentLineRef.current = presentLine;

  const showLine = useCallback(
    (line) => {
      const present = () => presentLine(line);
      if (captionTextRef.current) {
        hideCaption(present);
        return;
      }
      present();
    },
    [hideCaption, presentLine],
  );

  const stopIdleTalk = useCallback(() => {
    idleActiveRef.current = false;
    clearIdleTimers();
  }, [clearIdleTimers]);

  const startIdleTalk = useCallback(() => {
    idleActiveRef.current = true;
    clearIdleTimers();
    idleResumeRef.current = window.setTimeout(() => {
      if (!idleActiveRef.current || busyRef.current) return;
      showLine(nextIdleLine());
    }, IDLE_RESUME_MS);
  }, [clearIdleTimers, nextIdleLine, showLine]);

  const hideCaptionNow = useCallback(() => {
    captionTweenRef.current?.kill();
    captionTextRef.current = null;
    setCaption(null);
    const el = captionRef.current;
    if (el) gsap.set(el, { opacity: 0, x: 36, y: 0, scale: 0.9 });
  }, []);

  startIdleTalkRef.current = startIdleTalk;
  stopIdleTalkRef.current = stopIdleTalk;
  hideCaptionNowRef.current = hideCaptionNow;

  useLayoutEffect(() => {
    const el = captionRef.current;
    if (!caption || !el) return undefined;
    captionTweenRef.current?.kill();
    if (prefersReducedMotion()) {
      gsap.set(el, { opacity: 1, x: 0, y: 0, scale: 1 });
      return undefined;
    }
    captionTweenRef.current = gsap.fromTo(
      el,
      { x: -12, y: 0, scale: 0.6, opacity: 0 },
      {
        x: 0,
        y: 0,
        scale: 1,
        opacity: 1,
        duration: 0.32,
        ease: "back.out(3)",
      },
    );
    return undefined;
  }, [caption]);

  const dropIn = useCallback(() => {
    const el = fallerRef.current;
    const stage = stageRef.current;
    if (!el || !stage) return;
    stopBob();
    setStretch(false);
    const h = stage.offsetHeight;
    busyRef.current = true;
    tweenRef.current?.kill();
    tweenRef.current = gsap.fromTo(
      el,
      { y: -h * 0.85 },
      {
        y: 0,
        duration: 1.15,
        ease: "back.out(2.2)",
        onComplete: () => {
          busyRef.current = false;
          startBob();
          startIdleTalkRef.current();
        },
      },
    );
  }, [setStretch, startBob, stopBob]);

  const beginFall = useCallback(() => {
    const el = fallerRef.current;
    const stage = stageRef.current;
    if (!el || !stage) return;
    setStretch(false);
    const h = stage.offsetHeight;
    tweenRef.current?.kill();
    tweenRef.current = gsap
      .timeline({
        onComplete: () => {
          hideCaptionNowRef.current();
          gsap.set(el, { y: -h * 0.85 });
          dropIn();
        },
      })
      .to(
        el,
        {
          y: PREP_Y,
          duration: PREP_DURATION,
          ease: "back.out(1.8)",
        },
        0,
      )
      .call(() => setStretch(true), null, STRETCH_DELAY)
      .to(el, {
        y: PREP_Y,
        duration: PREP_HOLD,
        ease: "none",
      })
      .to(el, {
        y: h * 0.9,
        duration: FALL_DURATION,
        ease: "expo.in",
      });
  }, [dropIn, setStretch]);

  const onPoke = useCallback(() => {
    if (busyRef.current) return;
    const el = fallerRef.current;
    const stage = stageRef.current;
    if (!el || !stage) return;
    stopIdleTalk();
    busyRef.current = true;
    stopBob();
    presentLine(nextPokeLine());
    if (reducedRef.current) {
      window.clearTimeout(pokeHoldRef.current);
      pokeHoldRef.current = window.setTimeout(() => {
        busyRef.current = false;
        startIdleTalk();
      }, IDLE_DWELL_MS);
      return;
    }
    beginFall();
  }, [
    beginFall,
    nextPokeLine,
    presentLine,
    startIdleTalk,
    stopBob,
    stopIdleTalk,
  ]);

  useEffect(() => {
    const stage = stageRef.current;
    const el = fallerRef.current;
    if (!stage || !el) return undefined;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedRef.current = reduced.matches;
    setReducedMotion(reduced.matches);

    let raf = 0;
    let last = performance.now();
    let running = false;
    const cloudTravel = CLOUDS.map(() => 0);

    const paintClouds = (dt) => {
      const stageH = stage.offsetHeight;
      cloudRefs.current.forEach((node, index) => {
        if (!node) return;
        const speed = CLOUDS[index].speed;
        const cloudH = node.offsetHeight || 1;
        cloudTravel[index] += speed * dt;
        const leaveAfter = node.offsetTop + cloudH;
        if (cloudTravel[index] > leaveAfter) {
          cloudTravel[index] -= stageH + cloudH;
        }
        node.style.transform = `translateY(${-cloudTravel[index]}px)`;
      });
    };

    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!reducedRef.current) paintClouds(dt);
      raf = requestAnimationFrame(tick);
    };

    const startLoop = () => {
      if (running) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    const stopLoop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    if (reduced.matches) {
      gsap.set(el, { y: 0 });
      cloudRefs.current.forEach((node) => {
        if (node) node.style.transform = "translateY(0px)";
      });
    } else {
      gsap.set(el, { y: -stage.offsetHeight * 0.85 });
    }

    const parkAbove = () => {
      stopBob();
      tweenRef.current?.kill();
      window.clearTimeout(pokeHoldRef.current);
      stopIdleTalkRef.current();
      hideCaptionNowRef.current();
      busyRef.current = false;
      setStretch(false);
      setPaused(true);
      if (!reducedRef.current) {
        gsap.set(el, { y: -stage.offsetHeight * 0.85 });
      }
    };

    const enterFall = () => {
      startLoop();
      setPaused(false);
      if (reducedRef.current) {
        startIdleTalkRef.current();
        return;
      }
      dropIn();
    };

    const trigger = ScrollTrigger.create({
      trigger: stage,
      start: "top 88%",
      end: "bottom top",
      onEnter: enterFall,
      onEnterBack: enterFall,
      onLeave: () => {
        stopLoop();
        parkAbove();
      },
      onLeaveBack: () => {
        stopLoop();
        parkAbove();
      },
    });

    const onMotionChange = () => {
      reducedRef.current = reduced.matches;
      setReducedMotion(reduced.matches);
      stopBob();
      tweenRef.current?.kill();
      window.clearTimeout(pokeHoldRef.current);
      stopIdleTalkRef.current();
      hideCaptionNowRef.current();
      busyRef.current = false;
      setStretch(false);
      if (reduced.matches) {
        gsap.set(el, { y: 0 });
        cloudRefs.current.forEach((node) => {
          if (node) node.style.transform = "translateY(0px)";
        });
        return;
      }
      gsap.set(el, { y: -stage.offsetHeight * 0.85 });
    };

    reduced.addEventListener("change", onMotionChange);

    return () => {
      reduced.removeEventListener("change", onMotionChange);
      stopLoop();
      stopBob();
      tweenRef.current?.kill();
      captionTweenRef.current?.kill();
      window.clearTimeout(idleTimerRef.current);
      window.clearTimeout(idleResumeRef.current);
      window.clearTimeout(pokeHoldRef.current);
      trigger.kill();
    };
  }, [dropIn, setStretch, startBob, stopBob]);

  return (
    <div ref={stageRef} className="footer-fall">
      {CLOUDS.map((cloud, index) => (
        <img
          key={cloud.id}
          ref={(node) => {
            cloudRefs.current[index] = node;
          }}
          src={CLOUD_SRC}
          alt=""
          draggable="false"
          className={cloud.className}
        />
      ))}
      <div className="footer-faller-slot">
        <button
          ref={fallerRef}
          type="button"
          className="footer-faller"
          aria-label="Falling figure. Click to drop through the footer."
          onClick={onPoke}
        >
          <div ref={bobTargetRef} className="footer-faller-bob">
            <FooterFigure
              paused={paused}
              reducedMotion={reducedMotion}
              stretchInputRef={stretchInputRef}
            />
          </div>
          <span className="footer-faller-caption-anchor">
            <span
              ref={captionRef}
              className={`footer-faller-caption${caption ? " is-visible" : ""}`}
              aria-live="polite"
              aria-atomic="true"
            >
              {caption}
            </span>
          </span>
        </button>
      </div>
    </div>
  );
};

export default FooterFall;
