import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alignment,
  Fit,
  Layout,
  useRive,
  useStateMachineInput,
} from "@rive-app/react-canvas";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

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

const CLOUDS = [
  { id: "small", className: "footer-cloud footer-cloud--small", speed: 180 },
  { id: "medium", className: "footer-cloud footer-cloud--medium", speed: 300 },
  { id: "large", className: "footer-cloud footer-cloud--large", speed: 520 },
];

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
  const cloudRefs = useRef([]);
  const tweenRef = useRef(null);
  const bobRef = useRef(null);
  const busyRef = useRef(false);
  const reducedRef = useRef(false);
  const stretchInputRef = useRef(null);
  const [paused, setPaused] = useState(true);
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
  }, []);

  const startBob = useCallback(() => {
    const el = fallerRef.current;
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
        },
      },
    );
  }, [setStretch, startBob, stopBob]);

  const onPoke = useCallback(() => {
    if (busyRef.current || reducedRef.current) return;
    const el = fallerRef.current;
    const stage = stageRef.current;
    if (!el || !stage) return;
    stopBob();
    busyRef.current = true;
    setStretch(true);
    const h = stage.offsetHeight;
    tweenRef.current?.kill();
    tweenRef.current = gsap.to(el, {
      y: h * 0.9,
      duration: 0.8,
      ease: "back.in(2.2)",
      onComplete: () => {
        gsap.set(el, { y: -h * 0.85 });
        dropIn();
      },
    });
  }, [dropIn, setStretch, stopBob]);

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
      if (reducedRef.current) return;
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
          <FooterFigure
            paused={paused}
            reducedMotion={reducedMotion}
            stretchInputRef={stretchInputRef}
          />
        </button>
      </div>
    </div>
  );
};

export default FooterFall;
