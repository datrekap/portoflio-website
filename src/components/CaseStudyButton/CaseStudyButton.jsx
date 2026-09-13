import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./CaseStudyButton.css";

const GRID_MAX_OFFSET = 10;
const GRID_LERP = 0.14;

function useFinePointerHover() {
  const [canHover, setCanHover] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setCanHover(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return canHover;
}

/**
 * Case-study button: text-only by default. On hover/focus the outline,
 * grid, and shadow draw in around the label. Grid lines follow the cursor.
 *
 * Use `href` for external links or `to` for in-app routes.
 */
export default function CaseStudyButton({
  href,
  to,
  children,
  className = "",
  target,
  rel,
  type = "button",
  ...props
}) {
  const rootRef = useRef(null);
  const rafRef = useRef(null);
  const targetOffsetRef = useRef({ x: 0, y: 0 });
  const currentOffsetRef = useRef({ x: 0, y: 0 });
  const isHoveredRef = useRef(false);
  const [gridOffset, setGridOffset] = useState({ x: 0, y: 0 });
  const canHover = useFinePointerHover();

  const stopGridAnimation = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const tickGrid = useCallback(() => {
    const current = currentOffsetRef.current;
    const target = targetOffsetRef.current;

    current.x += (target.x - current.x) * GRID_LERP;
    current.y += (target.y - current.y) * GRID_LERP;
    setGridOffset({ x: current.x, y: current.y });

    const settling =
      Math.abs(target.x - current.x) > 0.05 ||
      Math.abs(target.y - current.y) > 0.05 ||
      isHoveredRef.current;

    if (settling) {
      rafRef.current = requestAnimationFrame(tickGrid);
    } else {
      rafRef.current = null;
    }
  }, []);

  const startGridAnimation = useCallback(() => {
    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(tickGrid);
    }
  }, [tickGrid]);

  const handleMouseMove = useCallback(
    (event) => {
      if (!canHover || !rootRef.current) return;
      const rect = rootRef.current.getBoundingClientRect();
      const xRatio = (event.clientX - rect.left) / rect.width - 0.5;
      const yRatio = (event.clientY - rect.top) / rect.height - 0.5;
      targetOffsetRef.current = {
        x: xRatio * GRID_MAX_OFFSET * 2,
        y: yRatio * GRID_MAX_OFFSET * 2,
      };
      startGridAnimation();
    },
    [canHover, startGridAnimation],
  );

  const handleMouseEnter = useCallback(() => {
    if (!canHover) return;
    isHoveredRef.current = true;
  }, [canHover]);

  const handleMouseLeave = useCallback(() => {
    if (!canHover) return;
    isHoveredRef.current = false;
    targetOffsetRef.current = { x: 0, y: 0 };
    startGridAnimation();
  }, [canHover, startGridAnimation]);

  useEffect(() => stopGridAnimation, [stopGridAnimation]);

  const classNames = `case-study-button${className ? ` ${className}` : ""}`;
  const inner = (
    <>
      <span className="case-study-button__chrome" aria-hidden="true">
        <span className="case-study-button__stroke">
          <span className="case-study-button__edge case-study-button__edge--left" />
          <span className="case-study-button__edge case-study-button__edge--right" />
          <span className="case-study-button__edge case-study-button__edge--top-left" />
          <span className="case-study-button__edge case-study-button__edge--top-right" />
          <span className="case-study-button__edge case-study-button__edge--bottom-left" />
          <span className="case-study-button__edge case-study-button__edge--bottom-right" />
        </span>
        <span className="case-study-button__grid-clip">
          <span
            className="case-study-button__grid"
            style={{
              transform: `translate3d(${gridOffset.x}px, ${gridOffset.y}px, 0)`,
            }}
          >
            <span className="case-study-button__grid-v" />
            <span className="case-study-button__grid-h" />
          </span>
        </span>
      </span>
      <span className="case-study-button__label">{children}</span>
    </>
  );

  const sharedProps = {
    ref: rootRef,
    className: classNames,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onMouseMove: handleMouseMove,
    ...props,
  };

  if (to) {
    return (
      <Link to={to} {...sharedProps}>
        {inner}
      </Link>
    );
  }

  if (href) {
    return (
      <a
        href={href}
        target={target}
        rel={rel ?? (target === "_blank" ? "noopener noreferrer" : undefined)}
        {...sharedProps}
      >
        {inner}
      </a>
    );
  }

  return (
    <button type={type} {...sharedProps}>
      {inner}
    </button>
  );
}
