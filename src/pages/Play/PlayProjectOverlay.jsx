import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useLenis } from "@studio-freight/react-lenis";
import CaseStudyButton from "../../components/CaseStudyButton/CaseStudyButton";
import PlayExhibitionBadge from "./PlayExhibitionBadge";

const SLIDE_MS = 520;

function OverlayMedia({ src, poster, alt, className = "" }) {
  if (src?.endsWith(".mp4")) {
    return (
      <video
        className={className}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        autoPlay
        aria-label={alt}
      />
    );
  }

  return <img className={className} src={poster || src} alt={alt} />;
}

function PlayProjectOverlay({ overlay, onClose }) {
  const lenis = useLenis();
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const closingRef = useRef(false);

  const requestClose = useCallback(() => {
    if (closingRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onClose();
      return;
    }
    closingRef.current = true;
    setOpen(false);
    window.setTimeout(() => {
      onClose();
    }, SLIDE_MS);
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

      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusable = [
        ...dialogRef.current.querySelectorAll(
          'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
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
  }, [lenis, onClose, requestClose]);

  const keepNativeScroll = (event) => {
    event.stopPropagation();
  };

  const gallery = (overlay.gallery || []).map((item, index) => {
    const media = typeof item === "string" ? { src: item } : item;
    return {
      src: media.src,
      poster: media.poster,
      alt: media.alt || "",
      key: media.src || `gallery-${index}`,
    };
  });

  return (
    <div
      className={`play-overlay${open ? " is-open" : ""}`}
      onClick={requestClose}
      role="presentation"
    >
      <div
        ref={dialogRef}
        className="play-overlay-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
        onWheel={keepNativeScroll}
        onTouchMove={keepNativeScroll}
      >
        <div className="play-overlay-close-bar">
          <button
            ref={closeRef}
            type="button"
            className="play-overlay-close"
            aria-label="Close project"
            onClick={requestClose}
          >
            <img src="/play/cross.svg" alt="" aria-hidden="true" />
          </button>
        </div>

        <div className="play-overlay-hero">
          <OverlayMedia
            className="play-overlay-hero-media"
            src={overlay.hero.src}
            poster={overlay.hero.poster}
            alt={overlay.hero.alt}
          />
          {overlay.heroTitle ? (
            <p className="play-overlay-hero-title">{overlay.heroTitle}</p>
          ) : null}
          <PlayExhibitionBadge>{overlay.badge}</PlayExhibitionBadge>
        </div>

        <div className="play-overlay-body">
          <h2 id={titleId} className="play-overlay-title">
            {overlay.title}
          </h2>
          <p className="play-overlay-tagline">{overlay.tagline}</p>

          <div className="play-overlay-meta">
            <p className="play-overlay-built">
              <strong>Built with</strong>
              <span>{overlay.builtWith}</span>
            </p>
            {overlay.viewHref ? (
              <CaseStudyButton
                href={overlay.viewHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Project
              </CaseStudyButton>
            ) : (
              <CaseStudyButton type="button">View Project</CaseStudyButton>
            )}
          </div>

          {gallery.length > 0 ? (
            <div className="play-overlay-gallery">
              {gallery.slice(0, 2).map((item) => (
                <div key={item.key} className="play-overlay-thumb">
                  <OverlayMedia
                    src={item.src}
                    poster={item.poster}
                    alt={item.alt}
                  />
                </div>
              ))}
            </div>
          ) : null}

          <p className="play-overlay-copy">{overlay.description}</p>

          {gallery.length > 2 ? (
            <div className="play-overlay-gallery">
              {gallery.slice(2).map((item) => (
                <div key={item.key} className="play-overlay-thumb">
                  <OverlayMedia
                    src={item.src}
                    poster={item.poster}
                    alt={item.alt}
                  />
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default PlayProjectOverlay;
