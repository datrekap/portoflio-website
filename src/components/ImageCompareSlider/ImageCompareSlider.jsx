import { useCallback, useRef, useState } from "react";
import "./ImageCompareSlider.css";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export default function ImageCompareSlider({
  beforeSrc,
  afterSrc,
  beforeAlt = "Before",
  afterAlt = "After",
  beforeLabel,
  afterLabel,
  initialPosition = 50,
  className = "",
  mode = "split",
  handleSrc,
}) {
  const isCrossfade = mode === "crossfade";
  const [position, setPosition] = useState(initialPosition);
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef(null);
  const controlsRef = useRef(null);
  const handleRef = useRef(null);
  const draggingRef = useRef(false);

  const setPositionFromClientX = useCallback((clientX) => {
    const source = isCrossfade ? controlsRef.current : containerRef.current;
    if (!source) return;
    const { left, width } = source.getBoundingClientRect();
    if (width <= 0) return;
    setPosition(clamp(((clientX - left) / width) * 100, 0, 100));
  }, [isCrossfade]);

  const handlePointerDown = useCallback(
    (event) => {
      if (event.button != null && event.button !== 0) return;
      if (isCrossfade) event.preventDefault();
      draggingRef.current = true;
      setDragging(true);
      event.currentTarget.setPointerCapture(event.pointerId);
      setPositionFromClientX(event.clientX);
    },
    [isCrossfade, setPositionFromClientX],
  );

  const handlePointerMove = useCallback(
    (event) => {
      if (!draggingRef.current) return;
      setPositionFromClientX(event.clientX);
    },
    [setPositionFromClientX],
  );

  const endDrag = useCallback((event) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setDragging(false);
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      /* already released */
    }
  }, []);

  const handleKeyDown = useCallback((event) => {
    const step = event.shiftKey ? 10 : 2;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setPosition((prev) => clamp(prev - step, 0, 100));
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      setPosition((prev) => clamp(prev + step, 0, 100));
    } else if (event.key === "Home") {
      event.preventDefault();
      setPosition(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setPosition(100);
    }
  }, []);

  const roundedPosition = Math.round(position);
  const fade = position / 100;
  const dragHandlers = {
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: endDrag,
    onPointerCancel: endDrag,
  };

  return (
    <div
      ref={containerRef}
      className={`image-compare${isCrossfade ? " image-compare--crossfade" : ""}${
        className ? ` ${className}` : ""
      }`}
      style={{ "--compare-position": `${position}%` }}
      {...(isCrossfade ? {} : dragHandlers)}
      onKeyDown={handleKeyDown}
      role="slider"
      tabIndex={0}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={roundedPosition}
      aria-label={
        isCrossfade
          ? "Drag to crossfade between images"
          : "Drag to compare before and after"
      }
    >
      {isCrossfade ? (
        <>
          <div className="image-compare__stage">
            <img
              src={beforeSrc}
              alt={beforeAlt}
              className="image-compare__img image-compare__img--before"
              style={{ opacity: 1 - fade }}
              draggable={false}
              loading="lazy"
              decoding="async"
            />
            <img
              src={afterSrc}
              alt={afterAlt}
              className="image-compare__img image-compare__img--after"
              style={{ opacity: fade }}
              draggable={false}
              loading="lazy"
              decoding="async"
            />
          </div>
          <div
            ref={controlsRef}
            className={`image-compare__controls${dragging ? " is-dragging" : ""}`}
            {...dragHandlers}
          >
            <div
              className="image-compare__track"
              aria-hidden="true"
            />
            <div
              ref={handleRef}
              className={`image-compare__handle image-compare__handle--pill${
                dragging ? " is-dragging" : ""
              }`}
            >
              <img
                src={handleSrc}
                alt=""
                className="image-compare__pill"
                draggable={false}
              />
            </div>
          </div>
        </>
      ) : (
        <>
          <img
            src={afterSrc}
            alt={afterAlt}
            className="image-compare__img image-compare__img--after"
            draggable={false}
            loading="lazy"
            decoding="async"
          />
          <div className="image-compare__before" aria-hidden="true">
            <img
              src={beforeSrc}
              alt=""
              className="image-compare__img image-compare__img--before"
              draggable={false}
              loading="lazy"
              decoding="async"
            />
            {beforeLabel ? (
              <span className="image-compare__tag image-compare__tag--before">
                {beforeLabel}
              </span>
            ) : null}
          </div>
          {afterLabel ? (
            <div className="image-compare__after-overlay" aria-hidden="true">
              <span className="image-compare__tag image-compare__tag--after">
                {afterLabel}
              </span>
            </div>
          ) : null}
          <div className="image-compare__divider" aria-hidden="true">
            <span className="image-compare__handle">
              <svg
                className="image-compare__chevrons"
                width="20"
                height="12"
                viewBox="0 0 20 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M7 1L2 6L7 11"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M13 1L18 6L13 11"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>
        </>
      )}
    </div>
  );
}
