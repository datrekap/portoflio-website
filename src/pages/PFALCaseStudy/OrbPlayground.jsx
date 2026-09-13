import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLenis } from "@studio-freight/react-lenis";
import { PFAL_MEDIA_BASE } from "../../data/pfalCaseStudyContent";
import "./OrbPlayground.css";

const ORB_SOURCES = [
  `${PFAL_MEDIA_BASE}/case-study/orb-1.webp`,
  `${PFAL_MEDIA_BASE}/case-study/orb-2.webp`,
  `${PFAL_MEDIA_BASE}/case-study/orb3.webp`,
];

const COPIES_PER_ORB = [3, 3, 3];
const MIN_SCALE = 0.7;
const MAX_SCALE = 1.2;
const BASE_SIZE_RATIO = 0.28;
const COLLISION_RADIUS_RATIO = 0.46;
const IDLE_RANGE = 0.05;
const SPRING = 26;
const DAMPING = 6.2;
const RESTITUTION = 0.68;
const WALL_RESTITUTION = 0.42;
const MAX_DT = 1 / 30;
const MAX_SPEED = 1200;
const COLLISION_ITERS = 5;

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function createOrbConfigs(width, height) {
  const minSide = Math.min(width, height);
  const baseSize = minSide * BASE_SIZE_RATIO;
  const sources = ORB_SOURCES.flatMap((src, index) =>
    Array.from({ length: COPIES_PER_ORB[index] }, () => src),
  );

  const configs = sources.map((src, index) => {
    const scale = rand(MIN_SCALE, MAX_SCALE);
    const size = baseSize * scale;
    const radius = size * COLLISION_RADIUS_RATIO;
    return {
      id: `orb-${index}`,
      src,
      size,
      radius,
      mass: radius * radius,
      scale,
      homeX: 0,
      homeY: 0,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      idleAmpX: minSide * IDLE_RANGE * rand(0.55, 1),
      idleAmpY: minSide * IDLE_RANGE * rand(0.55, 1),
      idleFreqX: rand(0.42, 0.95),
      idleFreqY: rand(0.38, 0.88),
      idlePhaseX: rand(0, Math.PI * 2),
      idlePhaseY: rand(0, Math.PI * 2),
    };
  });

  const cols = 3;
  const rows = Math.ceil(configs.length / cols);
  const cellW = width / cols;
  const cellH = height / rows;
  const order = configs.map((_, index) => index);

  for (let i = order.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }

  order.forEach((orbIndex, slot) => {
    const orb = configs[orbIndex];
    const col = slot % cols;
    const row = Math.floor(slot / cols);
    const margin = orb.radius + minSide * IDLE_RANGE;
    const jitterX = cellW * 0.28;
    const jitterY = cellH * 0.28;
    const x = clamp(
      (col + 0.5) * cellW + rand(-jitterX, jitterX),
      margin,
      width - margin,
    );
    const y = clamp(
      (row + 0.5) * cellH + rand(-jitterY, jitterY),
      margin,
      height - margin,
    );
    orb.homeX = x;
    orb.homeY = y;
    orb.x = x;
    orb.y = y;
  });

  return configs;
}

function clampOrb(orb, width, height) {
  orb.x = clamp(orb.x, orb.radius, width - orb.radius);
  orb.y = clamp(orb.y, orb.radius, height - orb.radius);
}

function clampSpeed(orb) {
  const speed = Math.hypot(orb.vx, orb.vy);
  if (speed <= MAX_SPEED) return;
  const scale = MAX_SPEED / speed;
  orb.vx *= scale;
  orb.vy *= scale;
}

function paintOrb(node, orb) {
  if (!node) return;
  node.style.transform = `translate3d(${orb.x - orb.size / 2}px, ${
    orb.y - orb.size / 2
  }px, 0)`;
  node.style.visibility = "visible";
}

function resolveWalls(orb, width, height, bouncing) {
  const minX = orb.radius;
  const maxX = width - orb.radius;
  const minY = orb.radius;
  const maxY = height - orb.radius;

  if (orb.x < minX) {
    orb.x = minX;
    if (bouncing && orb.vx < 0) orb.vx = -orb.vx * WALL_RESTITUTION;
  } else if (orb.x > maxX) {
    orb.x = maxX;
    if (bouncing && orb.vx > 0) orb.vx = -orb.vx * WALL_RESTITUTION;
  }

  if (orb.y < minY) {
    orb.y = minY;
    if (bouncing && orb.vy < 0) orb.vy = -orb.vy * WALL_RESTITUTION;
  } else if (orb.y > maxY) {
    orb.y = maxY;
    if (bouncing && orb.vy > 0) orb.vy = -orb.vy * WALL_RESTITUTION;
  }
}

function resolvePair(a, b, draggedId) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const minDist = a.radius + b.radius;
  const distSq = dx * dx + dy * dy;
  if (distSq >= minDist * minDist) return;
  if (distSq === 0) {
    b.x += 0.25;
    return;
  }

  const dist = Math.sqrt(distSq);
  const nx = dx / dist;
  const ny = dy / dist;
  const overlap = minDist - dist;
  const aDragged = a.id === draggedId;
  const bDragged = b.id === draggedId;

  if (aDragged && !bDragged) {
    b.x += nx * overlap;
    b.y += ny * overlap;
  } else if (bDragged && !aDragged) {
    a.x -= nx * overlap;
    a.y -= ny * overlap;
  } else if (!aDragged && !bDragged) {
    const total = a.mass + b.mass;
    const aShare = b.mass / total;
    const bShare = a.mass / total;
    a.x -= nx * overlap * aShare;
    a.y -= ny * overlap * aShare;
    b.x += nx * overlap * bShare;
    b.y += ny * overlap * bShare;
  }

  const relVx = a.vx - b.vx;
  const relVy = a.vy - b.vy;
  const velAlongNormal = relVx * nx + relVy * ny;
  if (velAlongNormal <= 0) return;

  if (aDragged && !bDragged) {
    const j = (1 + RESTITUTION) * velAlongNormal;
    b.vx += j * nx;
    b.vy += j * ny;
    return;
  }

  if (bDragged && !aDragged) {
    const j = (1 + RESTITUTION) * velAlongNormal;
    a.vx -= j * nx;
    a.vy -= j * ny;
    return;
  }

  const invMass = 1 / a.mass + 1 / b.mass;
  const impulse = (-(1 + RESTITUTION) * velAlongNormal) / invMass;
  a.vx += (impulse / a.mass) * nx;
  a.vy += (impulse / a.mass) * ny;
  b.vx -= (impulse / b.mass) * nx;
  b.vy -= (impulse / b.mass) * ny;
}

export default function OrbPlayground() {
  const lenis = useLenis();
  const stageRef = useRef(null);
  const orbsRef = useRef([]);
  const nodeRefs = useRef(new Map());
  const sizeRef = useRef({ width: 0, height: 0 });
  const dragRef = useRef(null);
  const pointerRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef(0);
  const lastTimeRef = useRef(0);
  const visibleRef = useRef(true);
  const reducedMotionRef = useRef(false);
  const [orbs, setOrbs] = useState([]);
  const [draggingId, setDraggingId] = useState(null);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      reducedMotionRef.current = media.matches;
    };
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;

    const syncLayout = (width, height) => {
      if (width < 8 || height < 8) return;

      const prev = sizeRef.current;
      sizeRef.current = { width, height };

      if (!orbsRef.current.length) {
        const configs = createOrbConfigs(width, height);
        orbsRef.current = configs;
        setOrbs(
          configs.map((orb) => ({
            id: orb.id,
            src: orb.src,
            size: orb.size,
          })),
        );
        return;
      }

      if (!prev.width || !prev.height) return;

      const sx = width / prev.width;
      const sy = height / prev.height;
      if (Math.abs(sx - 1) < 0.001 && Math.abs(sy - 1) < 0.001) return;
      const s = Math.min(width, height) / Math.min(prev.width, prev.height);

      orbsRef.current.forEach((orb) => {
        orb.x *= sx;
        orb.y *= sy;
        orb.homeX *= sx;
        orb.homeY *= sy;
        orb.vx *= sx;
        orb.vy *= sy;
        orb.size *= s;
        orb.radius *= s;
        orb.mass = orb.radius * orb.radius;
        orb.idleAmpX *= s;
        orb.idleAmpY *= s;
        clampOrb(orb, width, height);
      });

      setOrbs((current) =>
        current.map((orb) => {
          const live = orbsRef.current.find((item) => item.id === orb.id);
          return live ? { ...orb, size: live.size } : orb;
        }),
      );
    };

    const measure = () => {
      syncLayout(stage.clientWidth, stage.clientHeight);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting;
      },
      { rootMargin: "80px 0px", threshold: 0.01 },
    );
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const tick = (time) => {
      const { width, height } = sizeRef.current;
      const liveOrbs = orbsRef.current;
      const dragging = dragRef.current;

      if (
        width &&
        height &&
        liveOrbs.length &&
        (visibleRef.current || dragging)
      ) {
        const dt = lastTimeRef.current
          ? Math.min((time - lastTimeRef.current) / 1000, MAX_DT)
          : 1 / 60;
        lastTimeRef.current = time;
        const t = time / 1000;
        const reduced = reducedMotionRef.current;

        if (dragging) {
          const orb = liveOrbs.find((item) => item.id === dragging.id);
          if (orb) {
            const nextX = pointerRef.current.x + dragging.offsetX;
            const nextY = pointerRef.current.y + dragging.offsetY;
            const clampedX = clamp(nextX, orb.radius, width - orb.radius);
            const clampedY = clamp(nextY, orb.radius, height - orb.radius);
            orb.vx = (clampedX - orb.x) / Math.max(dt, 1 / 120);
            orb.vy = (clampedY - orb.y) / Math.max(dt, 1 / 120);
            orb.x = clampedX;
            orb.y = clampedY;
          }
        }

        liveOrbs.forEach((orb) => {
          if (dragging && orb.id === dragging.id) return;

          const idleX = reduced
            ? 0
            : orb.idleAmpX * Math.sin(t * orb.idleFreqX + orb.idlePhaseX);
          const idleY = reduced
            ? 0
            : orb.idleAmpY * Math.cos(t * orb.idleFreqY + orb.idlePhaseY);
          const targetX = clamp(
            orb.homeX + idleX,
            orb.radius,
            width - orb.radius,
          );
          const targetY = clamp(
            orb.homeY + idleY,
            orb.radius,
            height - orb.radius,
          );

          orb.vx += ((targetX - orb.x) * SPRING - orb.vx * DAMPING) * dt;
          orb.vy += ((targetY - orb.y) * SPRING - orb.vy * DAMPING) * dt;
          orb.x += orb.vx * dt;
          orb.y += orb.vy * dt;
        });

        const draggedId = dragging?.id ?? null;
        for (let iter = 0; iter < COLLISION_ITERS; iter += 1) {
          for (let i = 0; i < liveOrbs.length; i += 1) {
            for (let j = i + 1; j < liveOrbs.length; j += 1) {
              resolvePair(liveOrbs[i], liveOrbs[j], draggedId);
            }
          }

          liveOrbs.forEach((orb) => {
            resolveWalls(
              orb,
              width,
              height,
              !(dragging && orb.id === dragging.id),
            );
          });
        }

        liveOrbs.forEach((orb) => {
          if (!(dragging && orb.id === dragging.id)) clampSpeed(orb);
          paintOrb(nodeRefs.current.get(orb.id), orb);
        });
      } else {
        lastTimeRef.current = time;
      }

      rafRef.current = window.requestAnimationFrame(tick);
    };

    rafRef.current = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
    const endDrag = () => {
      if (!dragRef.current) return;
      dragRef.current = null;
      setDraggingId(null);
      lenis?.start();
    };

    const onPointerMove = (event) => {
      const stage = stageRef.current;
      if (!stage || !dragRef.current) return;
      if (event.pointerId !== dragRef.current.pointerId) return;

      const rect = stage.getBoundingClientRect();
      pointerRef.current = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    };

    const onPointerUp = (event) => {
      if (!dragRef.current) return;
      if (event.pointerId !== dragRef.current.pointerId) return;
      endDrag();
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      if (dragRef.current) {
        dragRef.current = null;
        lenis?.start();
      }
    };
  }, [lenis]);

  const handlePointerDown = (event, id) => {
    if (event.button !== 0) return;

    const stage = stageRef.current;
    const orb = orbsRef.current.find((item) => item.id === id);
    if (!stage || !orb) return;

    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);

    const rect = stage.getBoundingClientRect();
    const pointerX = event.clientX - rect.left;
    const pointerY = event.clientY - rect.top;
    pointerRef.current = { x: pointerX, y: pointerY };
    dragRef.current = {
      id,
      pointerId: event.pointerId,
      offsetX: orb.x - pointerX,
      offsetY: orb.y - pointerY,
    };
    orb.vx = 0;
    orb.vy = 0;
    setDraggingId(id);
    lenis?.stop();
  };

  return (
    <div
      ref={stageRef}
      className={`pfal-orb-playground${draggingId ? " is-dragging" : ""}`}
      aria-label="Interactive energy orbs. Drag an orb to play."
    >
      {orbs.map((orb) => (
        <div
          key={orb.id}
          ref={(node) => {
            if (node) {
              nodeRefs.current.set(orb.id, node);
              const live = orbsRef.current.find((item) => item.id === orb.id);
              if (live) paintOrb(node, live);
            } else {
              nodeRefs.current.delete(orb.id);
            }
          }}
          className={`pfal-orb-playground__orb${
            draggingId === orb.id ? " is-dragging" : ""
          }`}
          style={{
            width: orb.size,
            height: orb.size,
            zIndex: draggingId === orb.id ? 4 : 1,
          }}
          onPointerDown={(event) => handlePointerDown(event, orb.id)}
          onDragStart={(event) => event.preventDefault()}
          onContextMenu={(event) => event.preventDefault()}
        >
          <img src={orb.src} alt="" draggable={false} />
        </div>
      ))}
    </div>
  );
}
