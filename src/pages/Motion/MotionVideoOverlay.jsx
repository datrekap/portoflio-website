import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLenis } from "@studio-freight/react-lenis";
import { motionEmbedSrc, motionVideoSrc } from "../../data/motionWork";

const SLIDE_MS = 520;

export default function MotionVideoOverlay({
  project,
  projects,
  onNavigate,
  onClose,
}) {
  const lenis = useLenis();
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const closingRef = useRef(false);

  const projectIndex = useMemo(
    () => projects.findIndex((entry) => entry.id === project.id),
    [projects, project.id],
  );

  const goToOffset = useCallback(
    (offset) => {
      if (projectIndex < 0 || !projects.length) return;
      const nextIndex =
        (projectIndex + offset + projects.length) % projects.length;
      onNavigate(projects[nextIndex]);
    },
    [onNavigate, projectIndex, projects],
  );

  const goPrev = useCallback(() => goToOffset(-1), [goToOffset]);
  const goNext = useCallback(() => goToOffset(1), [goToOffset]);

  const requestClose = useCallback(() => {
    if (closingRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onClose();
      return;
    }
    closingRef.current = true;
    setOpen(false);
    window.setTimeout(onClose, SLIDE_MS);
  }, [onClose]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    lenis?.stop();
    closeRef.current?.focus();
    const frame = requestAnimationFrame(() => setOpen(true));

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        requestClose();
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrev();
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        goNext();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = [
        ...dialogRef.current.querySelectorAll(
          'button:not([disabled]), video, iframe, a[href], [tabindex]:not([tabindex="-1"])',
        ),
        ...document.querySelectorAll(
          ".motion-overlay__nav:not([disabled])",
        ),
      ];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const dialog = dialogRef.current;
    const stopScrollBleed = (event) => event.stopPropagation();
    dialog?.addEventListener("wheel", stopScrollBleed, { capture: true });
    dialog?.addEventListener("touchmove", stopScrollBleed, { capture: true });

    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      lenis?.start();
      document.removeEventListener("keydown", onKeyDown);
      dialog?.removeEventListener("wheel", stopScrollBleed, { capture: true });
      dialog?.removeEventListener("touchmove", stopScrollBleed, {
        capture: true,
      });
    };
  }, [goNext, goPrev, lenis, requestClose]);

  const useYouTube = Boolean(project.youtubeId);
  const localSrc = project.file ? motionVideoSrc(project.file) : null;
  const prevProject =
    projectIndex >= 0
      ? projects[(projectIndex - 1 + projects.length) % projects.length]
      : null;
  const nextProject =
    projectIndex >= 0
      ? projects[(projectIndex + 1) % projects.length]
      : null;

  const overlay = (
    <div
      className={`motion-overlay${open ? " is-open" : ""}`}
      onClick={requestClose}
      role="presentation"
    >
      <div
        className="motion-overlay__shell"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="motion-overlay__nav motion-overlay__nav--prev"
          aria-label={
            prevProject ? `Previous: ${prevProject.title}` : "Previous video"
          }
          onClick={goPrev}
        >
          <img src="/work/icons/arrow.svg" alt="" aria-hidden="true" />
        </button>

        <div
          ref={dialogRef}
          className="motion-overlay__dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <div className="motion-overlay__close-bar">
            <button
              ref={closeRef}
              type="button"
              className="motion-overlay__close"
              aria-label={`Close ${project.title}`}
              onClick={requestClose}
            >
              <img src="/play/cross.svg" alt="" aria-hidden="true" />
            </button>
          </div>
          <div className="motion-overlay__body">
            <h2 id={titleId} className="motion-overlay__title">
              {project.title}
            </h2>
            {project.tags?.length || project.kind ? (
              <div className="motion-overlay__meta">
                {project.tags?.length ? (
                  <p className="motion-overlay__role">
                    {project.tags.join(" · ")}
                  </p>
                ) : (
                  <span className="motion-overlay__meta-spacer" aria-hidden="true" />
                )}
                {project.kind ? (
                  <span className="motion-overlay__kind">{project.kind}</span>
                ) : null}
              </div>
            ) : null}
            <div className="motion-overlay__frame">
              {useYouTube ? (
                <iframe
                  key={project.id}
                  src={motionEmbedSrc(project.youtubeId)}
                  title={project.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="eager"
                />
              ) : localSrc ? (
                <video
                  key={project.id}
                  src={localSrc}
                  controls
                  autoPlay
                  playsInline
                  preload="auto"
                />
              ) : null}
            </div>
          </div>
        </div>

        <button
          type="button"
          className="motion-overlay__nav motion-overlay__nav--next"
          aria-label={nextProject ? `Next: ${nextProject.title}` : "Next video"}
          onClick={goNext}
        >
          <img src="/work/icons/arrow.svg" alt="" aria-hidden="true" />
        </button>
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
}
