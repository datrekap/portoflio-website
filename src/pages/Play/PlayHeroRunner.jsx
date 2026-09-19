import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Alignment,
  Fit,
  Layout,
  useRive,
  useStateMachineInput,
} from "@rive-app/react-canvas";
import { gsap } from "gsap";
import CaseStudyButton from "../../components/CaseStudyButton/CaseStudyButton";
import {
  PLAY_CRASH_LINES,
  PLAY_MILESTONES,
  PLAY_TEASE_LINES,
} from "../../data/playHeroLines";

const DEBUG_HITBOXES = false;
const RIVE_SRC = "/play/dk-character.riv";
const RIVE_ARTBOARD = "Artboard 1";
const RIVE_STATE_MACHINE = "Play";
const RIVE_RUNNING_INPUT = "isRunning";
const RIVE_JUMPING_INPUT = "isJumping";
const RIVE_FALLING_INPUT = "isFalling";
const RIVE_POSE_IDLE = { running: false, jumping: false, falling: false };
const RIVE_POSE_RUN = { running: true, jumping: false, falling: false };
const RIVE_POSE_JUMP = { running: true, jumping: true, falling: false };
const RIVE_POSE_DEAD = { running: true, jumping: false, falling: true };
const RIVE_LAYOUT = new Layout({
  fit: Fit.Contain,
  alignment: Alignment.BottomCenter,
});
const TRASHCAN_SRC = "/play/trashcan.svg";
const TRASHCAN_ASPECT = 91 / 103;
const HI_KEY = "play-hero-hi";

const GRAVITY = 2600;
const JUMP_VELOCITY = 1200;
const JUMP_CUT = 0.55;
const COYOTE_TIME = 0.1;
const BUFFER_TIME = 0.1;
const SPEED_START = 280;
const SPEED_OLD_MAX = 740;
const SCORE_RATE = 10;
const DIFFICULTY_SCORE = 420;
const SCORE_MID = 1000;
const SCORE_LATE = 3000;
const RATE_CURRENT = (SPEED_OLD_MAX - SPEED_START) / DIFFICULTY_SCORE;
const RATE_EARLY = RATE_CURRENT * 0.78;
const RATE_LATE = RATE_CURRENT * 1.55;
const PARALLAX = 0.28;
const IDLE_DRIFT = 18;
const HIT_STOP = 0.085;
const CAN_OVERLAP = 0.32;
const GROUND_TILE = 1521.08;
const IS_DEV = import.meta.env.DEV;
const HANG_TIME = (2 * JUMP_VELOCITY) / GRAVITY;
const IDLE_DWELL_MS = 3600;
const IDLE_GAP_MS = 2600;
const IDLE_RESUME_MS = 400;
const RUN_DWELL_MS = 2000;

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

function difficulty(score) {
  return Math.min(1, Math.max(0, score) / DIFFICULTY_SCORE);
}

function speedForScore(score) {
  const s = Math.max(0, score);
  if (s <= SCORE_MID) {
    return SPEED_START + s * RATE_EARLY;
  }
  if (s <= SCORE_LATE) {
    return SPEED_START + SCORE_MID * RATE_EARLY + (s - SCORE_MID) * RATE_CURRENT;
  }
  return (
    SPEED_START +
    SCORE_MID * RATE_EARLY +
    (SCORE_LATE - SCORE_MID) * RATE_CURRENT +
    (s - SCORE_LATE) * RATE_LATE
  );
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function randRange(min, max) {
  return min + Math.random() * (max - min);
}

function pickGapMul(progress, lastTight) {
  if (lastTight) {
    return { mul: randRange(1.25, 2.15), tight: false };
  }
  const squeezeChance = progress < 0.22 ? 0 : 0.08 + progress * 0.3;
  const restChance = 0.34 - progress * 0.12;
  const roll = Math.random();
  if (roll < squeezeChance) {
    return { mul: randRange(0.55, 0.86), tight: true };
  }
  if (roll < squeezeChance + restChance) {
    return { mul: randRange(1.55, 2.6), tight: false };
  }
  return {
    mul: randRange(lerp(1.2, 0.82, progress), lerp(1.9, 1.48, progress)),
    tight: false,
  };
}

function overlaps(a, b) {
  return !(
    a.x + a.w < b.x ||
    b.x + b.w < a.x ||
    a.y + a.h < b.y ||
    b.y + b.h < a.y
  );
}

function formatScore(value) {
  return String(Math.floor(Math.max(0, value))).padStart(5, "0");
}

function PlayFigure({ isRunning, isJumping, isFalling, paused, reducedMotion }) {
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

  const runningInput = useStateMachineInput(
    rive,
    RIVE_STATE_MACHINE,
    RIVE_RUNNING_INPUT,
    isRunning,
  );
  const jumpingInput = useStateMachineInput(
    rive,
    RIVE_STATE_MACHINE,
    RIVE_JUMPING_INPUT,
    isJumping,
  );
  const fallingInput = useStateMachineInput(
    rive,
    RIVE_STATE_MACHINE,
    RIVE_FALLING_INPUT,
    isFalling,
  );

  useEffect(() => {
    if (runningInput) runningInput.value = isRunning;
  }, [runningInput, isRunning]);

  useEffect(() => {
    if (jumpingInput) jumpingInput.value = isJumping;
  }, [jumpingInput, isJumping]);

  useEffect(() => {
    if (fallingInput) fallingInput.value = isFalling;
  }, [fallingInput, isFalling]);

  useEffect(() => {
    if (!rive) return;
    if (paused || reducedMotion) {
      rive.pause();
      return;
    }
    rive.play();
  }, [rive, paused, reducedMotion]);

  return (
    <div ref={setContainerRef} className="play-hero-rive-wrap">
      <RiveComponent className="play-hero-rive" aria-hidden="true" />
    </div>
  );
}

function readHi() {
  try {
    const n = Number(window.localStorage.getItem(HI_KEY));
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

function writeHi(value) {
  try {
    window.localStorage.setItem(HI_KEY, String(Math.floor(value)));
  } catch {
    /* ignore quota / private mode */
  }
}

let audioCtx = null;
let masterGain = null;

/** Waveforms differ a lot in perceived loudness; keep output even. */
const WAVE_LOUDNESS = {
  sine: 1,
  triangle: 0.9,
  square: 0.55,
  sawtooth: 0.5,
};

function getAudio(reduced) {
  if (reduced || typeof window === "undefined") return null;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) {
    audioCtx = new Ctx();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.22;
    masterGain.connect(audioCtx.destination);
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function playTone({
  reduced,
  freq,
  dur = 0.09,
  type = "square",
  gain = 0.35,
  slide,
}) {
  const ctx = getAudio(reduced);
  if (!ctx || !masterGain) return;
  const t0 = ctx.currentTime;
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  const level = gain * (WAVE_LOUDNESS[type] ?? 0.7);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slide) {
    osc.frequency.exponentialRampToValueAtTime(
      Math.max(1, slide),
      t0 + Math.max(0.02, dur),
    );
  }
  // Attack + release so peaks stay consistent across tones.
  amp.gain.setValueAtTime(0.0001, t0);
  amp.gain.exponentialRampToValueAtTime(Math.max(0.0001, level), t0 + 0.012);
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(amp).connect(masterGain);
  osc.start(t0);
  osc.stop(t0 + dur + 0.03);
}

function PlayHeroRunner({ paused = false }) {
  const stageRef = useRef(null);
  const runnerRef = useRef(null);
  const scoreRef = useRef(null);
  const scoreWrapRef = useRef(null);
  const hiRefEl = useRef(null);
  const pageRef = useRef(null);
  const inViewRef = useRef(true);
  const pausedRef = useRef(paused);
  const reducedRef = useRef(false);
  const hiddenRef = useRef(false);
  const stateRef = useRef("ready");
  const yRef = useRef(0);
  const vyRef = useRef(0);
  const scoreValueRef = useRef(0);
  const hiValueRef = useRef(0);
  const runHiRef = useRef(0);
  const hiBeatRef = useRef(false);
  const speedRef = useRef(SPEED_START);
  const spawnInRef = useRef(1.15);
  const lastTightRef = useRef(false);
  const obstaclesRef = useRef([]);
  const rafRef = useRef(0);
  const lastTsRef = useRef(0);
  const coyoteRef = useRef(COYOTE_TIME);
  const bufferRef = useRef(0);
  const airJumpUsedRef = useRef(false);
  const jumpHeldRef = useRef(false);
  const jumpCutRef = useRef(false);
  const hitStopRef = useRef(0);
  const bgXRef = useRef(0);
  const groundXRef = useRef(0);
  const landTimerRef = useRef(0);
  const shakeTimerRef = useRef(0);
  const metricsRef = useRef({
    stageW: 800,
    stageH: 320,
    runnerW: 160,
    runnerH: 160,
    runnerLeft: 0,
    canW: 64,
    canH: 72,
  });
  const [status, setStatus] = useState("ready");
  const [isMobile, setIsMobile] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 767px)").matches,
  );
  const [hiHost, setHiHost] = useState(null);
  const [rivePose, setRivePose] = useState(RIVE_POSE_IDLE);
  const rivePoseRef = useRef(RIVE_POSE_IDLE);
  const retryPoseTimerRef = useRef(0);
  const [inView, setInView] = useState(true);
  const [pageHidden, setPageHidden] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useLayoutEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const sync = () => {
      const mobile = media.matches;
      setIsMobile(mobile);
      setHiHost(
        mobile ? document.getElementById("play-hero-hi-slot") : null,
      );
    };
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  const captionRef = useRef(null);
  const captionTweenRef = useRef(null);
  const captionTextRef = useRef(null);
  const lastLineRef = useRef(null);
  const idleTimerRef = useRef(0);
  const idleResumeRef = useRef(0);
  const idleActiveRef = useRef(false);
  const crashShownRef = useRef(false);
  const milestonesFiredRef = useRef(new Set());
  const decksRef = useRef(null);
  const presentLineRef = useRef(() => {});
  const showLineRef = useRef(() => {});
  const stopIdleTalkRef = useRef(() => {});
  const hideCaptionNowRef = useRef(() => {});
  const [caption, setCaption] = useState(null);
  if (decksRef.current === null) {
    decksRef.current = {
      tease: shuffle(PLAY_TEASE_LINES),
      crash: shuffle(PLAY_CRASH_LINES),
    };
  }

  pausedRef.current = paused;

  const frozen = useCallback(
    () =>
      reducedRef.current ||
      pausedRef.current ||
      hiddenRef.current ||
      !inViewRef.current,
    [],
  );

  const acceptsInput = useCallback(
    () =>
      !reducedRef.current &&
      !pausedRef.current &&
      !hiddenRef.current &&
      inViewRef.current,
    [],
  );

  const clearIdleTimers = useCallback(() => {
    window.clearTimeout(idleTimerRef.current);
    window.clearTimeout(idleResumeRef.current);
  }, []);

  const nextPoolLine = useCallback(() => {
    return takeFromDeck(
      decksRef.current.tease,
      PLAY_TEASE_LINES,
      lastLineRef.current,
    );
  }, []);

  const nextCrashLine = useCallback(() => {
    return takeFromDeck(
      decksRef.current.crash,
      PLAY_CRASH_LINES,
      lastLineRef.current,
    );
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
      gsap.set(el, { opacity: 0, scale: 0.4, y: 28 });
      finish();
      return;
    }
    captionTweenRef.current = gsap.to(el, {
      scale: 0.45,
      y: 28,
      opacity: 0,
      duration: 0.16,
      ease: "back.in(3)",
      onComplete: finish,
    });
  }, []);

  const hideCaptionNow = useCallback(() => {
    captionTweenRef.current?.kill();
    captionTextRef.current = null;
    setCaption(null);
    const el = captionRef.current;
    if (el) gsap.set(el, { opacity: 0, scale: 0.4, y: 28 });
  }, []);

  const presentLine = useCallback(
    (line, sticky = false) => {
      if (!sticky && stateRef.current === "dead") return;
      lastLineRef.current = line;
      captionTextRef.current = line;
      setCaption(line);
      if (sticky || stateRef.current === "dead") {
        return;
      }
      window.clearTimeout(idleTimerRef.current);
      if (stateRef.current === "running") {
        idleTimerRef.current = window.setTimeout(() => {
          if (stateRef.current === "dead") return;
          hideCaption();
        }, RUN_DWELL_MS);
        return;
      }
      if (!idleActiveRef.current) return;
      idleTimerRef.current = window.setTimeout(() => {
        if (!idleActiveRef.current || stateRef.current === "dead") return;
        const next = nextPoolLine();
        hideCaption(() => {
          idleResumeRef.current = window.setTimeout(() => {
            if (!idleActiveRef.current || stateRef.current === "dead") return;
            presentLineRef.current(next);
          }, IDLE_GAP_MS);
        });
      }, IDLE_DWELL_MS);
    },
    [hideCaption, nextPoolLine],
  );
  presentLineRef.current = presentLine;

  const showLine = useCallback(
    (line, sticky = false) => {
      const present = () => presentLine(line, sticky);
      if (captionTextRef.current) {
        hideCaption(present);
        return;
      }
      present();
    },
    [hideCaption, presentLine],
  );
  showLineRef.current = showLine;

  const stopIdleTalk = useCallback(() => {
    idleActiveRef.current = false;
    clearIdleTimers();
  }, [clearIdleTimers]);
  stopIdleTalkRef.current = stopIdleTalk;
  hideCaptionNowRef.current = hideCaptionNow;

  const startIdleTalk = useCallback(() => {
    if (stateRef.current === "dead" || stateRef.current === "running") return;
    idleActiveRef.current = true;
    clearIdleTimers();
    idleResumeRef.current = window.setTimeout(() => {
      if (!idleActiveRef.current || stateRef.current !== "ready") return;
      showLine(nextPoolLine());
    }, IDLE_RESUME_MS);
  }, [clearIdleTimers, nextPoolLine, showLine]);

  useLayoutEffect(() => {
    const el = captionRef.current;
    if (!caption || !el) return undefined;
    captionTweenRef.current?.kill();
    if (prefersReducedMotion()) {
      gsap.set(el, { opacity: 1, scale: 1, y: 0 });
      return undefined;
    }
    captionTweenRef.current = gsap.fromTo(
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

  const paintHud = useCallback(() => {
    const score = scoreValueRef.current;
    if (scoreRef.current) {
      scoreRef.current.textContent = formatScore(score);
    }
    if (!hiRefEl.current) return;
    const live = stateRef.current === "running" && score > runHiRef.current;
    hiRefEl.current.textContent = formatScore(
      live ? score : hiValueRef.current,
    );
    hiRefEl.current.classList.toggle("is-live-record", live);
  }, []);

  const paintBg = useCallback(() => {
    const hero = pageRef.current;
    if (!hero) return;
    hero.style.setProperty("--play-bg-x", `${-bgXRef.current}px`);
    hero.style.setProperty(
      "--play-ground-x",
      `${-wrapMod(groundXRef.current, GROUND_TILE)}px`,
    );
  }, []);

  const clearObstacles = useCallback(() => {
    obstaclesRef.current.forEach((item) => item.el.remove());
    obstaclesRef.current = [];
  }, []);

  const setRunnerY = useCallback((y) => {
    yRef.current = y;
    if (runnerRef.current) {
      runnerRef.current.style.setProperty("--runner-y", `${-y}px`);
    }
  }, []);

  const syncRivePose = useCallback((next) => {
    const cur = rivePoseRef.current;
    if (
      cur.running === next.running &&
      cur.jumping === next.jumping &&
      cur.falling === next.falling
    ) {
      return;
    }
    rivePoseRef.current = next;
    setRivePose(next);
  }, []);

  const measure = useCallback(() => {
    const stage = stageRef.current;
    const runner = runnerRef.current;
    if (!stage) return;
    const stageH = stage.clientHeight || 320;
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    const canH = mobile
      ? Math.round(Math.min(58, Math.max(40, stageH * 0.12)))
      : Math.round(Math.min(90, Math.max(54, stageH * 0.17)));
    const canW = Math.round(canH * TRASHCAN_ASPECT);
    // Measure the absolutely positioned slot (not the relative runner),
    // otherwise offsetLeft is ~0 after the intro wrapper and hitboxes drift.
    const slot = runner?.closest(".play-hero-runner-slot") || runner;
    const stageRect = stage.getBoundingClientRect();
    const bodyRect = (slot || runner)?.getBoundingClientRect();
    metricsRef.current = {
      stageW: stage.clientWidth || 800,
      stageH,
      runnerW: bodyRect?.width || runner?.offsetWidth || 160,
      runnerH: bodyRect?.height || runner?.offsetHeight || 160,
      runnerLeft: bodyRect ? bodyRect.left - stageRect.left : 0,
      canW,
      canH,
    };
  }, []);

  const playJump = useCallback(() => {
    playTone({
      reduced: reducedRef.current,
      freq: 540,
      dur: 0.08,
      type: "square",
      gain: 0.34,
      slide: 720,
    });
  }, []);

  const playHit = useCallback(() => {
    playTone({
      reduced: reducedRef.current,
      freq: 160,
      dur: 0.16,
      type: "sawtooth",
      gain: 0.34,
      slide: 70,
    });
  }, []);

  const playHi = useCallback(() => {
    playTone({
      reduced: reducedRef.current,
      freq: 660,
      dur: 0.1,
      type: "square",
      gain: 0.34,
    });
    window.setTimeout(() => {
      playTone({
        reduced: reducedRef.current,
        freq: 880,
        dur: 0.12,
        type: "square",
        gain: 0.34,
      });
    }, 90);
  }, []);

  const resetHi = useCallback(() => {
    hiValueRef.current = 0;
    runHiRef.current = 0;
    writeHi(0);
    scoreWrapRef.current?.classList.remove("is-record");
    hiRefEl.current?.classList.remove("is-live-record");
    paintHud();
  }, [paintHud]);

  const resetRun = useCallback(() => {
    window.clearTimeout(retryPoseTimerRef.current);
    clearObstacles();
    setRunnerY(0);
    vyRef.current = 0;
    scoreValueRef.current = 0;
    speedRef.current = SPEED_START;
    spawnInRef.current = randRange(1.45, 2.4);
    lastTightRef.current = false;
    coyoteRef.current = COYOTE_TIME;
    bufferRef.current = 0;
    airJumpUsedRef.current = false;
    jumpCutRef.current = false;
    hitStopRef.current = 0;
    hiBeatRef.current = false;
    runHiRef.current = hiValueRef.current;
    landTimerRef.current = 0;
    shakeTimerRef.current = 0;
    milestonesFiredRef.current = new Set();
    runnerRef.current?.classList.add("is-running");
    runnerRef.current?.classList.remove("is-hit", "is-landing", "is-airborne");
    stageRef.current?.classList.remove("is-shaking");
    scoreWrapRef.current?.classList.remove("is-record");
    hiRefEl.current?.classList.remove("is-live-record");
    paintHud();
    stopIdleTalk();
    hideCaption();
    stateRef.current = "running";
    syncRivePose(RIVE_POSE_RUN);
    setStatus("running");
  }, [clearObstacles, hideCaption, paintHud, setRunnerY, stopIdleTalk, syncRivePose]);

  const returnToReady = useCallback(() => {
    window.clearTimeout(retryPoseTimerRef.current);
    clearObstacles();
    setRunnerY(0);
    vyRef.current = 0;
    scoreValueRef.current = 0;
    speedRef.current = SPEED_START;
    spawnInRef.current = randRange(1.45, 2.4);
    lastTightRef.current = false;
    coyoteRef.current = COYOTE_TIME;
    bufferRef.current = 0;
    airJumpUsedRef.current = false;
    jumpCutRef.current = false;
    jumpHeldRef.current = false;
    hitStopRef.current = 0;
    hiBeatRef.current = false;
    landTimerRef.current = 0;
    shakeTimerRef.current = 0;
    runnerRef.current?.classList.remove(
      "is-running",
      "is-hit",
      "is-landing",
      "is-airborne",
    );
    stageRef.current?.classList.remove("is-shaking");
    scoreWrapRef.current?.classList.remove("is-record");
    hiRefEl.current?.classList.remove("is-live-record");
    paintHud();
    crashShownRef.current = false;
    stateRef.current = "ready";
    syncRivePose(RIVE_POSE_IDLE);
    setStatus("ready");
  }, [clearObstacles, paintHud, setRunnerY, syncRivePose]);

  useEffect(() => {
    if (!inView || paused || pageHidden) {
      stopIdleTalk();
      if (status !== "dead") hideCaptionNow();
      return undefined;
    }
    if (status === "dead") {
      stopIdleTalk();
      if (!crashShownRef.current) {
        crashShownRef.current = true;
        showLine(nextCrashLine(), true);
      }
      return undefined;
    }
    if (status === "running") {
      stopIdleTalk();
      return undefined;
    }
    crashShownRef.current = false;
    startIdleTalk();
    return () => {
      stopIdleTalk();
    };
  }, [
    hideCaptionNow,
    inView,
    nextCrashLine,
    pageHidden,
    paused,
    showLine,
    startIdleTalk,
    status,
    stopIdleTalk,
  ]);

  useLayoutEffect(() => {
    const el = runnerRef.current;
    if (!el) return;
    if (status === "running") {
      el.classList.add("is-running");
      if (yRef.current > 0.5 || vyRef.current > 0) {
        el.classList.add("is-airborne");
      }
      return;
    }
    el.classList.remove("is-running");
    if (status !== "dead") {
      el.classList.remove("is-airborne", "is-hit", "is-landing");
    }
  }, [status]);

  useEffect(() => {
    window.resetPlayHi = resetHi;
    return () => {
      if (window.resetPlayHi === resetHi) {
        delete window.resetPlayHi;
      }
    };
  }, [resetHi]);

  const endRun = useCallback(() => {
    if (stateRef.current !== "running") return;
    if (hitStopRef.current > 0) return;
    hitStopRef.current = HIT_STOP;
    playHit();
    const score = scoreValueRef.current;
    if (score > hiValueRef.current) {
      hiValueRef.current = score;
      writeHi(score);
      paintHud();
    }
    runnerRef.current?.classList.add("is-hit");
    stageRef.current?.classList.add("is-shaking");
    shakeTimerRef.current = 0.24;
    vyRef.current = 0;
    window.clearTimeout(retryPoseTimerRef.current);
    syncRivePose(RIVE_POSE_DEAD);
  }, [playHit, paintHud, syncRivePose]);

  const applyJump = useCallback(() => {
    const grounded = yRef.current <= 0.5;
    const coyoteOk = coyoteRef.current > 0 && !airJumpUsedRef.current;
    if (!grounded && !coyoteOk) {
      bufferRef.current = BUFFER_TIME;
      return false;
    }
    vyRef.current = JUMP_VELOCITY;
    airJumpUsedRef.current = true;
    coyoteRef.current = 0;
    bufferRef.current = 0;
    jumpCutRef.current = false;
    runnerRef.current?.classList.add("is-airborne");
    playJump();
    return true;
  }, [playJump]);

  const cutJump = useCallback(() => {
    if (jumpCutRef.current) return;
    if (stateRef.current !== "running") return;
    if (vyRef.current > 0) {
      vyRef.current *= JUMP_CUT;
      jumpCutRef.current = true;
    }
  }, []);

  const jump = useCallback(() => {
    if (!acceptsInput()) return;
    if (hitStopRef.current > 0) return;

    if (stateRef.current === "dead") {
      returnToReady();
      return;
    }

    if (stateRef.current === "ready") {
      resetRun();
      return;
    }

    if (stateRef.current === "running") {
      applyJump();
    }
  }, [acceptsInput, applyJump, resetRun, returnToReady]);

  const clusterCount = useCallback((progress, jumpDist, canW, step) => {
    const widthOf = (n) => canW + step * Math.max(0, n - 1);
    const fair = (n) => widthOf(n) < jumpDist * 0.62;
    const maxN = fair(3) ? 3 : fair(2) ? 2 : 1;
    const roll = Math.random();
    if (progress < 0.2) return 1;
    if (maxN >= 3 && progress > 0.32 && roll < 0.06 + progress * 0.2) return 3;
    if (maxN >= 2 && roll < 0.14 + progress * 0.4) return 2;
    return 1;
  }, []);

  const spawnCluster = useCallback(
    (stageWidth, progress, speed) => {
      const { canW, canH } = metricsRef.current;
      const step = canW * (1 - CAN_OVERLAP);
      const jumpDist = speed * HANG_TIME;
      const count = clusterCount(progress, jumpDist, canW, step);
      const startX = stageWidth + randRange(18, 72);
      const stage = stageRef.current;
      if (!stage) return 0;

      for (let i = 0; i < count; i += 1) {
        const el = document.createElement("div");
        el.className = "play-hero-can";
        el.style.width = `${canW}px`;
        el.style.height = `${canH}px`;
        el.setAttribute("aria-hidden", "true");
        const img = document.createElement("img");
        img.src = TRASHCAN_SRC;
        img.alt = "";
        img.width = 91;
        img.height = 103;
        img.draggable = false;
        el.appendChild(img);
        const x = startX + i * step;
        el.style.transform = `translateX(${x}px)`;
        stage.appendChild(el);
        obstaclesRef.current.push({ el, x, w: canW, h: canH });
      }

      return canW + step * Math.max(0, count - 1);
    },
    [clusterCount],
  );

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;

    pageRef.current = stage.closest(".play-hero");
    hiValueRef.current = readHi();
    paintHud();
    measure();
    paintBg();

    const viewMedia = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncFlags = () => {
      const reduced = viewMedia.matches;
      reducedRef.current = reduced;
      setReducedMotion(reduced);
      if (reduced) {
        clearObstacles();
        setRunnerY(0);
        vyRef.current = 0;
        stateRef.current = "ready";
        syncRivePose(RIVE_POSE_IDLE);
        setStatus("ready");
        runnerRef.current?.classList.remove(
          "is-running",
          "is-hit",
          "is-landing",
          "is-airborne",
        );
        jumpHeldRef.current = false;
        window.clearTimeout(retryPoseTimerRef.current);
      }
    };
    syncFlags();
    viewMedia.addEventListener("change", syncFlags);

    const onVisibility = () => {
      hiddenRef.current = document.hidden;
      setPageHidden(document.hidden);
      lastTsRef.current = 0;
    };
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);

    const hero = stage.closest(".play-hero") || stage;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible =
          entry.isIntersecting && entry.intersectionRatio > 0.5;
        inViewRef.current = visible;
        setInView(visible);
      },
      { threshold: [0, 0.5, 0.65, 1] },
    );
    observer.observe(hero);

    const resize = new ResizeObserver(() => {
      measure();
    });
    resize.observe(stage);
    if (runnerRef.current) resize.observe(runnerRef.current);

    const tick = (ts) => {
      rafRef.current = requestAnimationFrame(tick);
      const dt = Math.min(0.032, (ts - (lastTsRef.current || ts)) / 1000);
      lastTsRef.current = ts;

      if (shakeTimerRef.current > 0) {
        shakeTimerRef.current -= dt;
        if (shakeTimerRef.current <= 0) {
          stage.classList.remove("is-shaking");
        }
      }

      if (landTimerRef.current > 0) {
        landTimerRef.current -= dt;
        if (landTimerRef.current <= 0) {
          runnerRef.current?.classList.remove("is-landing");
        }
      }

      if (frozen()) {
        return;
      }

      if (reducedRef.current) return;

      if (stateRef.current === "ready" || stateRef.current === "dead") {
        if (stateRef.current === "ready") {
          bgXRef.current += IDLE_DRIFT * dt;
          groundXRef.current = wrapMod(
            groundXRef.current + IDLE_DRIFT * dt,
            GROUND_TILE,
          );
          paintBg();
        }
        return;
      }

      if (hitStopRef.current > 0) {
        hitStopRef.current -= dt;
        if (hitStopRef.current <= 0) {
          hitStopRef.current = 0;
          stateRef.current = "dead";
          setStatus("dead");
          runnerRef.current?.classList.remove("is-running", "is-airborne");
          paintHud();
        }
        return;
      }

      if (stateRef.current !== "running") return;

      const { stageW, runnerW, runnerH, runnerLeft } = metricsRef.current;

      coyoteRef.current = Math.max(0, coyoteRef.current - dt);
      bufferRef.current = Math.max(0, bufferRef.current - dt);

      if (!jumpHeldRef.current) cutJump();

      vyRef.current -= GRAVITY * dt;
      let nextY = yRef.current + vyRef.current * dt;
      const wasAir = yRef.current > 0.5 || airJumpUsedRef.current;

      if (nextY <= 0) {
        nextY = 0;
        vyRef.current = 0;
        airJumpUsedRef.current = false;
        coyoteRef.current = COYOTE_TIME;
        if (wasAir) {
          runnerRef.current?.classList.add("is-landing");
          landTimerRef.current = 0.16;
          if (bufferRef.current > 0) applyJump();
        }
      }

      setRunnerY(nextY);

      const progress = difficulty(scoreValueRef.current);
      speedRef.current = speedForScore(scoreValueRef.current);
      scoreValueRef.current += SCORE_RATE * dt * (speedRef.current / SPEED_START);

      const scoreNow = scoreValueRef.current;
      for (const { at, line } of PLAY_MILESTONES) {
        if (scoreNow >= at && !milestonesFiredRef.current.has(at)) {
          milestonesFiredRef.current.add(at);
          showLineRef.current(line);
          break;
        }
      }

      if (
        runHiRef.current > 0 &&
        scoreValueRef.current > runHiRef.current &&
        !hiBeatRef.current
      ) {
        hiBeatRef.current = true;
        playHi();
        scoreWrapRef.current?.classList.add("is-record");
      }
      paintHud();

      bgXRef.current += speedRef.current * PARALLAX * dt;
      groundXRef.current = wrapMod(
        groundXRef.current + speedRef.current * dt,
        GROUND_TILE,
      );
      paintBg();

      spawnInRef.current -= dt;
      if (spawnInRef.current <= 0) {
        const clusterW = spawnCluster(stageW, progress, speedRef.current);
        const hangFactor = lerp(1.7, 0.72, progress);
        const { mul, tight } = pickGapMul(progress, lastTightRef.current);
        lastTightRef.current = tight;
        const airGap =
          speedRef.current * HANG_TIME * hangFactor * mul +
          randRange(8, 64) +
          lerp(140, 0, progress);
        spawnInRef.current = (clusterW + airGap) / speedRef.current;
      }

      const grounded = nextY <= 0.5;
      runnerRef.current?.classList.toggle("is-airborne", !grounded);
      if (nextY > 0.5 || vyRef.current > 0) {
        syncRivePose(RIVE_POSE_JUMP);
      } else {
        syncRivePose(RIVE_POSE_RUN);
      }

      const hitbox = {
        x: runnerLeft + runnerW * 0.32,
        y: nextY + 4,
        w: runnerW * 0.3,
        h: runnerH * 0.6,
      };

      const kept = [];
      for (const item of obstaclesRef.current) {
        item.x -= speedRef.current * dt;
        item.el.style.transform = `translateX(${item.x}px)`;
        if (item.x + item.w < -48) {
          item.el.remove();
          continue;
        }
        kept.push(item);
        // Cans are aspect-matched + object-fit:contain/bottom, so use nearly
        // the full element box — only a small horizontal inset for the lid lip.
        const canBox = {
          x: item.x + item.w * 0.08,
          y: 0,
          w: item.w * 0.84,
          h: item.h * 0.92,
        };
        if (overlaps(hitbox, canBox)) {
          endRun();
        }
      }
      obstaclesRef.current = kept;

      if (DEBUG_HITBOXES) {
        let debug = stage.querySelector(".play-hero-debug");
        if (!debug) {
          debug = document.createElement("div");
          debug.className = "play-hero-debug";
          stage.appendChild(debug);
        }
        debug.style.cssText = `position:absolute;left:${hitbox.x}px;bottom:calc(var(--play-ground) + ${hitbox.y}px);width:${hitbox.w}px;height:${hitbox.h}px;border:1px solid #ff5500;pointer-events:none;z-index:5;`;
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    const onKeyDown = (event) => {
      if (event.code !== "Space" && event.key !== " ") return;
      if (!acceptsInput()) return;
      const tag = event.target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || event.target?.isContentEditable) {
        return;
      }
      event.preventDefault();
      if (event.repeat) {
        jumpHeldRef.current = true;
        return;
      }
      jumpHeldRef.current = true;
      jump();
    };

    const onKeyUp = (event) => {
      if (event.code !== "Space" && event.key !== " ") return;
      jumpHeldRef.current = false;
      cutJump();
    };

    const onPointerUp = () => {
      if (!jumpHeldRef.current) return;
      jumpHeldRef.current = false;
      cutJump();
    };

    window.addEventListener("keydown", onKeyDown, { capture: true });
    window.addEventListener("keyup", onKeyUp, { capture: true });
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);

    return () => {
      cancelAnimationFrame(rafRef.current);
      viewMedia.removeEventListener("change", syncFlags);
      document.removeEventListener("visibilitychange", onVisibility);
      observer.disconnect();
      resize.disconnect();
      window.removeEventListener("keydown", onKeyDown, { capture: true });
      window.removeEventListener("keyup", onKeyUp, { capture: true });
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      window.clearTimeout(retryPoseTimerRef.current);
      window.clearTimeout(idleTimerRef.current);
      window.clearTimeout(idleResumeRef.current);
      captionTweenRef.current?.kill();
      clearObstacles();
      pageRef.current?.style.removeProperty("--play-bg-x");
      pageRef.current?.style.removeProperty("--play-ground-x");
    };
  }, [
    acceptsInput,
    applyJump,
    clearObstacles,
    cutJump,
    endRun,
    frozen,
    jump,
    measure,
    paintBg,
    paintHud,
    playHi,
    setRunnerY,
    spawnCluster,
    syncRivePose,
  ]);

  const onPointerDown = (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (window.matchMedia("(max-width: 767px)").matches) return;
    jumpHeldRef.current = true;
    jump();
  };

  const onFigurePointerDown = (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    // Mobile uses the start button / apron jump pad instead.
    if (window.matchMedia("(max-width: 767px)").matches) return;
    event.preventDefault();
    event.stopPropagation();
    jumpHeldRef.current = true;
    jump();
  };

  const onJumpPadPointerDown = (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    jumpHeldRef.current = true;
    jump();
  };

  const hiBlock = (
      <div
        className={`play-hero-hi${IS_DEV ? " is-resettable" : ""}`}
        title={IS_DEV ? "Click to reset high score" : undefined}
        onPointerDown={
          IS_DEV
            ? (event) => {
                event.stopPropagation();
              }
            : undefined
        }
        onClick={IS_DEV ? resetHi : undefined}
      >
        <span className="play-hero-hi-label">HIGH</span>
        <span ref={hiRefEl} className="play-hero-hi-value">
          00000
        </span>
      </div>
  );

  const startLabel =
    status === "dead"
      ? "Try again"
      : isMobile
        ? "Tap to start"
        : "Press Space or Tap to Start";

  return (
    <div
      ref={stageRef}
      className={`play-hero-stage is-${status}`}
      tabIndex={0}
      aria-label={
        status === "dead"
          ? isMobile
            ? "Game over. Tap Try again to play."
            : "Game over. Press Space or tap to try again."
          : status === "running"
            ? isMobile
              ? "Endless runner. Tap the ground area to jump."
              : "Endless runner. Press Space or tap to jump."
            : isMobile
              ? "Endless runner. Tap to start."
              : "Endless runner. Press Space or Tap to Start."
      }
      onPointerDown={onPointerDown}
    >
      <div className="play-hero-skyline" aria-hidden="true" />
      <div className="play-hero-floor" aria-hidden="true">
        <div className="play-hero-apron" />
        <div className="play-hero-ground" />
      </div>
      {isMobile && status === "running" ? (
        <button
          type="button"
          className="play-hero-jump-pad"
          aria-label="Tap here to jump"
          onPointerDown={onJumpPadPointerDown}
        >
          Tap here to jump.
        </button>
      ) : null}
      <div className="play-hero-runner-slot">
      <div
        ref={runnerRef}
        className="play-hero-runner"
      >
        <PlayFigure
          isRunning={rivePose.running}
          isJumping={rivePose.jumping}
          isFalling={rivePose.falling}
          paused={paused || pageHidden || !inView}
          reducedMotion={reducedMotion}
        />
        <button
          type="button"
          className="play-hero-figure-hit"
          aria-label={
            status === "dead"
              ? "Tap the figure to try again"
              : status === "running"
                ? "Tap the figure to jump"
                : "Tap the figure to start"
          }
          onPointerDown={onFigurePointerDown}
        />
        <span className="play-hero-caption-anchor">
          <span
            ref={captionRef}
            className={`play-hero-caption${caption ? " is-visible" : ""}`}
            aria-live="polite"
            aria-atomic="true"
          >
            {caption}
          </span>
        </span>
      </div>
      </div>
      {hiHost ? createPortal(hiBlock, hiHost) : hiBlock}
      <p ref={scoreWrapRef} className="play-hero-score" aria-hidden="true">
        <span ref={scoreRef}>00000</span>
      </p>
      {status !== "running" ? (
        <div
          className="play-hero-start"
          onPointerDown={(event) => event.stopPropagation()}
        >
          <CaseStudyButton type="button" onClick={() => jump()}>
            {startLabel}
          </CaseStudyButton>
        </div>
      ) : null}
    </div>
  );
}

export default PlayHeroRunner;
