import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLenis } from "@studio-freight/react-lenis";
import { ABOUT_HERO_SLOTS, ABOUT_HERO_THEMES } from "../../data/aboutContent";

const CAFE_SRC = "/about-intro/photo-cafe.webp";
const WINDOW_BORDER = 1;
const WINDOW_BAR = 28;

let windowSerial = 0;

function nextId() {
  windowSerial += 1;
  return `about-window-${windowSerial}`;
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function clampToBox(x, y, boxW, boxH, winW, winH) {
  return {
    x: Math.min(Math.max(0, x), Math.max(0, boxW - winW)),
    y: Math.min(Math.max(0, y), Math.max(0, boxH - winH)),
  };
}

function rectsOverlap(a, b) {
  return !(
    a.right <= b.left ||
    a.left >= b.right ||
    a.bottom <= b.top ||
    a.top >= b.bottom
  );
}

/** Clip the photo so it cannot enter the text frame — image stops at the edge. */
function photoMaskExcludeText(winX, winY, winW, imageH, text) {
  if (!text || !winW || !imageH) {
    return { shiftX: 0, shiftY: 0, clip: "inset(0)" };
  }
  const holeX = winX + WINDOW_BORDER;
  const holeY = winY + WINDOW_BORDER + WINDOW_BAR;
  const holeW = Math.max(0, winW - WINDOW_BORDER * 2);
  const holeH = imageH;
  const photo = {
    left: holeX,
    top: holeY,
    right: holeX + holeW,
    bottom: holeY + holeH,
  };
  const mask = {
    left: text.x,
    top: text.y,
    right: text.x + text.w,
    bottom: text.y + text.h,
  };
  if (!rectsOverlap(photo, mask)) {
    return { shiftX: 0, shiftY: 0, clip: "inset(0)" };
  }

  // Fully covered by text → hide photo entirely.
  if (
    photo.left >= mask.left &&
    photo.right <= mask.right &&
    photo.top >= mask.top &&
    photo.bottom <= mask.bottom
  ) {
    return { shiftX: 0, shiftY: 0, clip: "inset(100%)" };
  }

  // Exclude the text rectangle from the photo viewport (local px).
  const x0 = Math.max(0, Math.min(holeW, mask.left - holeX));
  const y0 = Math.max(0, Math.min(holeH, mask.top - holeY));
  const x1 = Math.max(0, Math.min(holeW, mask.right - holeX));
  const y1 = Math.max(0, Math.min(holeH, mask.bottom - holeY));

  if (x0 >= x1 || y0 >= y1) {
    return { shiftX: 0, shiftY: 0, clip: "inset(0)" };
  }

  // evenodd: outer photo rect, then hole for the text overlap
  const clip = `polygon(evenodd, 0px 0px, ${holeW}px 0px, ${holeW}px ${holeH}px, 0px ${holeH}px, 0px 0px, ${x0}px ${y0}px, ${x0}px ${y1}px, ${x1}px ${y1}px, ${x1}px ${y0}px, ${x0}px ${y0}px)`;
  return { shiftX: 0, shiftY: 0, clip };
}

function sharedWidth(aspect, heroW, heroH) {
  let width = Math.round(heroW * 0.2);
  const maxW = heroW * 0.26;
  const maxH = heroH * 0.42;
  if (width > maxW) width = maxW;
  if (aspect > 0 && width / aspect > maxH) width = maxH * aspect;
  return Math.max(132, Math.round(width));
}

function sessionTilt() {
  const magnitude = 2.5 + Math.random() * 4.5;
  return (Math.random() < 0.5 ? -1 : 1) * magnitude;
}

function slotOriginX(heroW, winW, side, centerOffset) {
  const center = heroW / 2;
  const winCenter = center + side * centerOffset * heroW;
  return winCenter - winW / 2;
}

function createWindow(theme, photo, placement, phase, enterDelay = 0) {
  const tilt = sessionTilt();
  return {
    id: nextId(),
    themeId: theme.id,
    title: theme.title,
    photo,
    x: 0,
    y: 0,
    xRatio: 0,
    yRatio: placement.yRatio,
    side: placement.side,
    centerOffset: placement.centerOffset ?? 0.32,
    restTilt: tilt,
    parallax: placement.parallax ?? 0.12,
    anchored: false,
    userMoved: false,
    z: placement.z,
    phase,
    gesture: "rest",
    tilt,
    imageShiftX: 0,
    imageShiftY: 0,
    enterDelay,
  };
}

function windowBox(width, aspect) {
  const imageH = Math.round(width / aspect);
  return {
    w: width,
    h: WINDOW_BAR + WINDOW_BORDER * 2 + imageH,
  };
}

export default function AboutHeroWindows({ copyRef }) {
  const stageRef = useRef(null);
  const nodeRefs = useRef({});
  const dragRef = useRef(null);
  const sessionRef = useRef(null);
  const reducedRef = useRef(prefersReducedMotion());
  const heroViewTopRef = useRef(0);
  const [heroSize, setHeroSize] = useState({ w: 0, h: 0 });
  const [copyBox, setCopyBox] = useState(null);
  const [heroEl, setHeroEl] = useState(null);
  const [cafeAspect, setCafeAspect] = useState(null);
  const [windowWidth, setWindowWidth] = useState(null);
  const [heroViewTop, setHeroViewTop] = useState(0);
  const lenis = useLenis();

  if (sessionRef.current === null) {
    sessionRef.current = Object.fromEntries(
      ABOUT_HERO_THEMES.map((theme) => [theme.id, { cursor: 0 }]),
    );
  }

  const [windows, setWindows] = useState(() =>
    ABOUT_HERO_THEMES.map((theme, index) =>
      createWindow(
        theme,
        theme.photos[0],
        { ...ABOUT_HERO_SLOTS[index], z: index + 1 },
        reducedRef.current ? "idle" : "in",
        index * 0.08,
      ),
    ),
  );

  const measureCopy = useCallback(() => {
    const hero = heroEl;
    const copy = copyRef?.current;
    if (!hero || !copy) {
      setCopyBox(null);
      return;
    }
    const heroRect = hero.getBoundingClientRect();
    const copyRect = copy.getBoundingClientRect();
    setCopyBox({
      x: copyRect.left - heroRect.left,
      y: copyRect.top - heroRect.top,
      w: copyRect.width,
      h: copyRect.height,
    });
  }, [copyRef, heroEl]);

  const placeAll = useCallback(
    (list) => {
      const hero = heroEl;
      if (!hero || !windowWidth || !cafeAspect) return list;
      if (hero.clientWidth < 8 || hero.clientHeight < 8) return list;
      const box = windowBox(windowWidth, cafeAspect);
      let changed = false;
      const next = list.map((win) => {
        const originX = win.userMoved
          ? win.xRatio * hero.clientWidth
          : slotOriginX(hero.clientWidth, box.w, win.side, win.centerOffset);
        const originY = win.yRatio * hero.clientHeight;
        const pos = clampToBox(
          originX,
          originY,
          hero.clientWidth,
          hero.clientHeight,
          box.w,
          box.h,
        );
        const xRatio = hero.clientWidth ? pos.x / hero.clientWidth : win.xRatio;
        const yRatio = hero.clientHeight ? pos.y / hero.clientHeight : win.yRatio;
        if (
          win.anchored &&
          Math.abs(pos.x - win.x) < 0.5 &&
          Math.abs(pos.y - win.y) < 0.5
        ) {
          return win;
        }
        changed = true;
        return { ...win, ...pos, xRatio, yRatio, anchored: true };
      });
      return changed ? next : list;
    },
    [cafeAspect, heroEl, windowWidth],
  );

  useEffect(() => {
    const img = new Image();
    img.src = CAFE_SRC;
    const apply = () => {
      if (!img.naturalWidth || !img.naturalHeight) return;
      setCafeAspect(img.naturalWidth / img.naturalHeight);
    };
    if (img.complete) apply();
    else img.onload = apply;
    ABOUT_HERO_THEMES.forEach((theme) => {
      theme.photos.forEach((photo) => {
        const preload = new Image();
        preload.src = photo.src;
      });
    });
  }, []);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    const hero = stage?.closest(".about-hero") ?? null;
    setHeroEl(hero);
  }, [heroSize]);

  useLayoutEffect(() => {
    if (!heroEl || !cafeAspect) return;
    const width = sharedWidth(cafeAspect, heroEl.clientWidth, heroEl.clientHeight);
    setWindowWidth((current) => (current === width ? current : width));
  }, [cafeAspect, heroEl, heroSize]);

  useLayoutEffect(() => {
    setWindows((current) => placeAll(current));
    measureCopy();
  }, [windowWidth, heroSize, heroEl, placeAll, measureCopy]);

  useEffect(() => {
    const hero = heroEl;
    const copy = copyRef?.current;
    if (!hero) return undefined;
    const observer = new ResizeObserver(() => {
      setHeroSize({ w: hero.clientWidth, h: hero.clientHeight });
      measureCopy();
    });
    observer.observe(hero);
    if (copy) observer.observe(copy);
    return () => observer.disconnect();
  }, [copyRef, heroEl, measureCopy]);

  useEffect(() => {
    if (!heroEl) return undefined;
    let frame = 0;
    const update = () => {
      frame = 0;
      const top = heroEl.getBoundingClientRect().top;
      if (Math.abs(top - heroViewTopRef.current) < 0.25) return;
      heroViewTopRef.current = top;
      setHeroViewTop(top);
    };
    const requestUpdate = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    lenis?.on("scroll", requestUpdate);
    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      lenis?.off("scroll", requestUpdate);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [heroEl, lenis]);

  const takeNext = useCallback((themeId) => {
    const theme = ABOUT_HERO_THEMES.find((item) => item.id === themeId);
    const session = sessionRef.current[themeId];
    session.cursor = (session.cursor + 1) % theme.photos.length;
    return theme.photos[session.cursor];
  }, []);

  const closeWindow = useCallback(
    (id) => {
      if (reducedRef.current) {
        setWindows((current) => {
          const closed = current.find((win) => win.id === id);
          const photo = takeNext(closed.themeId);
          const top = Math.max(...current.map((win) => win.z)) + 1;
          return current.map((win) =>
            win.id === id
              ? {
                  ...win,
                  photo,
                  phase: "idle",
                  gesture: "rest",
                  tilt: win.restTilt,
                  z: top,
                }
              : win,
          );
        });
        return;
      }
      setWindows((current) =>
        current.map((win) => (win.id === id ? { ...win, phase: "out" } : win)),
      );
    },
    [takeNext],
  );

  const onAnimationEnd = useCallback(
    (id, event) => {
      if (event.target !== event.currentTarget) return;
      const name = event.animationName || "";
      if (name.includes("pop-out")) {
        setWindows((current) => {
          const closed = current.find((win) => win.id === id);
          const photo = takeNext(closed.themeId);
          const top = Math.max(...current.map((win) => win.z)) + 1;
          return current.map((win) =>
            win.id === id
              ? {
                  ...win,
                  photo,
                  phase: "in",
                  gesture: "rest",
                  tilt: win.restTilt,
                  enterDelay: 0,
                  z: top,
                }
              : win,
          );
        });
        return;
      }
      if (name.includes("pop-in")) {
        setWindows((current) =>
          current.map((win) =>
            win.id === id ? { ...win, phase: "idle", tilt: win.restTilt } : win,
          ),
        );
        return;
      }
      if (name.includes("pickup")) {
        setWindows((current) =>
          current.map((win) =>
            win.id === id
              ? { ...win, gesture: dragRef.current?.id === id ? "hold" : "drop" }
              : win,
          ),
        );
        return;
      }
      if (name.includes("drop")) {
        setWindows((current) =>
          current.map((win) =>
            win.id === id
              ? { ...win, gesture: "rest", tilt: win.restTilt }
              : win,
          ),
        );
      }
    },
    [takeNext],
  );

  const onPointerDown = useCallback((event, id) => {
    if (event.button !== 0) return;
    const node = nodeRefs.current[id];
    if (!node) return;
    const box = node.getBoundingClientRect();
    dragRef.current = {
      id,
      dx: event.clientX - box.left,
      dy: event.clientY - box.top,
      lastX: event.clientX,
      lastY: event.clientY,
      tilt: 0,
      imgX: 0,
      imgY: 0,
    };
    node.setPointerCapture(event.pointerId);
    setWindows((current) => {
      const top = Math.max(...current.map((win) => win.z)) + 1;
      return current.map((win) =>
        win.id === id
          ? {
              ...win,
              z: top,
              phase: "idle",
              tilt: win.restTilt,
              imageShiftX: 0,
              imageShiftY: 0,
              gesture: reducedRef.current ? "rest" : "pickup",
            }
          : win,
      );
    });
  }, []);

  const onPointerMove = useCallback((event) => {
    const drag = dragRef.current;
    if (!drag) return;
    const node = nodeRefs.current[drag.id];
    if (!node || !heroEl) return;
    const vx = event.clientX - drag.lastX;
    const vy = event.clientY - drag.lastY;
    drag.lastX = event.clientX;
    drag.lastY = event.clientY;
    drag.tilt =
      drag.tilt * 0.62 + Math.max(-6, Math.min(6, vx * 0.35)) * 0.38;
    drag.imgX = Math.max(-16, Math.min(16, drag.imgX * 0.72 + vx * 0.55));
    drag.imgY = Math.max(-12, Math.min(12, drag.imgY * 0.72 + vy * 0.45));
    const heroRect = heroEl.getBoundingClientRect();
    const visual = clampToBox(
      event.clientX - heroRect.left - drag.dx,
      event.clientY - heroRect.top - drag.dy,
      heroEl.clientWidth,
      heroEl.clientHeight,
      node.offsetWidth,
      node.offsetHeight,
    );
    setWindows((current) =>
      current.map((win) => {
        if (win.id !== drag.id) return win;
        const parallaxY = reducedRef.current
          ? 0
          : heroViewTopRef.current * win.parallax;
        const next = {
          x: visual.x,
          y: visual.y - parallaxY,
        };
        return {
          ...win,
          ...next,
          anchored: true,
          userMoved: true,
          tilt: win.restTilt + drag.tilt,
          imageShiftX: drag.imgX,
          imageShiftY: drag.imgY,
          xRatio: heroEl.clientWidth ? next.x / heroEl.clientWidth : win.xRatio,
          yRatio: heroEl.clientHeight
            ? next.y / heroEl.clientHeight
            : win.yRatio,
        };
      }),
    );
  }, [heroEl]);

  const onPointerUp = useCallback(() => {
    const drag = dragRef.current;
    dragRef.current = null;
    if (!drag || reducedRef.current) {
      if (drag) {
        setWindows((current) =>
          current.map((win) =>
            win.id === drag.id
              ? {
                  ...win,
                  tilt: win.restTilt,
                  imageShiftX: 0,
                  imageShiftY: 0,
                }
              : win,
          ),
        );
      }
      return;
    }
    setWindows((current) =>
      current.map((win) => {
        if (win.id !== drag.id) return win;
        return {
          ...win,
          gesture: win.gesture === "pickup" ? "rest" : "drop",
          tilt: win.restTilt,
          imageShiftX: 0,
          imageShiftY: 0,
        };
      }),
    );
  }, []);

  const imageHeight =
    windowWidth && cafeAspect ? Math.round(windowWidth / cafeAspect) : null;

  return (
    <div ref={stageRef} className="about-hero-stage" aria-hidden="false">
      {heroEl && windowWidth && windows.every((win) => win.anchored)
        ? createPortal(
            windows.map((win) => {
              const parallaxY = reducedRef.current
                ? 0
                : heroViewTop * win.parallax;
              const drawY = win.y + parallaxY;
              const mask = photoMaskExcludeText(
                win.x,
                drawY,
                windowWidth || 0,
                imageHeight || 0,
                copyBox,
              );
              return (
                <article
                  key={win.id}
                  ref={(node) => {
                    nodeRefs.current[win.id] = node;
                  }}
                  className={`about-hero-window${
                    win.phase === "in" ? " is-in" : ""
                  }${win.phase === "out" ? " is-out" : ""}${
                    win.gesture === "pickup" ? " is-pickup" : ""
                  }${win.gesture === "hold" ? " is-hold" : ""}${
                    win.gesture === "drop" ? " is-drop" : ""
                  }${
                    win.phase === "idle" && win.gesture === "rest"
                      ? " is-floating"
                      : ""
                  }`}
                  style={{
                    left: `${win.x}px`,
                    top: `${drawY}px`,
                    width: `${windowWidth}px`,
                    zIndex: 40 + win.z,
                    animationDelay:
                      win.phase === "in"
                        ? `${win.enterDelay}s`
                        : win.phase === "idle" && win.gesture === "rest"
                          ? `${(win.z % 4) * 0.35}s`
                          : undefined,
                  }}
                  onPointerDown={(event) => {
                    if (win.phase === "out") return;
                    onPointerDown(event, win.id);
                  }}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  onPointerCancel={onPointerUp}
                  onAnimationEnd={(event) => onAnimationEnd(win.id, event)}
                >
                  <div
                    className="about-hero-window__sheet"
                    style={{ transform: `rotate(${win.tilt}deg)` }}
                  >
                    <header className="about-hero-window__bar">
                      <span className="about-hero-window__name">{win.title}</span>
                      <button
                        type="button"
                        className="about-hero-window__close"
                        aria-label={`Close ${win.photo.alt}`}
                        disabled={win.phase === "out"}
                        onPointerDown={(event) => event.stopPropagation()}
                        onClick={() => closeWindow(win.id)}
                      >
                        <svg viewBox="0 0 12 12" aria-hidden="true">
                          <path d="M2.2 2.2 L9.8 9.8 M9.8 2.2 L2.2 9.8" />
                        </svg>
                      </button>
                    </header>
                    <div
                      className="about-hero-window__viewport"
                      style={{
                        height: imageHeight ? `${imageHeight}px` : undefined,
                        clipPath: mask.clip,
                      }}
                    >
                      <img
                        src={win.photo.src}
                        alt={win.photo.alt}
                        draggable="false"
                        decoding="sync"
                        style={{
                          objectPosition: win.photo.objectPosition,
                          transform: `translate(${win.imageShiftX}px, ${win.imageShiftY}px)`,
                        }}
                      />
                    </div>
                  </div>
                </article>
              );
            }),
            heroEl,
          )
        : null}
    </div>
  );
}
