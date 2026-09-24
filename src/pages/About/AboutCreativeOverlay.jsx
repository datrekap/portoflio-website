import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useLenis } from "@studio-freight/react-lenis";
import Appear from "../../components/Appear/Appear";
import {
  ABOUT_CREATIVE_INTRO,
  ABOUT_CREATIVE_VIDEOS,
} from "../../data/aboutCreativeWork";
import "./AboutCreativeOverlay.css";

const SLIDE_MS = 520;

function youtubeIdFromEmbed(src) {
  const match = src.match(/embed\/([^?&/]+)/);
  return match?.[1] ?? "";
}

function youtubePoster(id, quality) {
  return `https://i.ytimg.com/vi/${id}/${quality}.jpg`;
}

function CreativeClip({ video, eager }) {
  const [ready, setReady] = useState(false);
  const videoId = youtubeIdFromEmbed(video.embedSrc);
  const [posterSrc, setPosterSrc] = useState(
    videoId ? youtubePoster(videoId, "maxresdefault") : "",
  );

  return (
    <>
      <div
        className={`about-creative-overlay__frame${ready ? " is-ready" : ""}`}
      >
        {posterSrc ? (
          <img
            className="about-creative-overlay__poster"
            src={posterSrc}
            alt=""
            aria-hidden="true"
            onLoad={(event) => {
              if (event.currentTarget.naturalWidth <= 120 && videoId) {
                setPosterSrc(youtubePoster(videoId, "hqdefault"));
              }
            }}
          />
        ) : null}
        <iframe
          src={video.embedSrc}
          title={video.title}
          loading={eager ? "eager" : "lazy"}
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          onLoad={() => setReady(true)}
        />
      </div>
      <h3 className="about-creative-overlay__clip-title">{video.title}</h3>
      <p className="about-creative-overlay__caption">{video.caption}</p>
    </>
  );
}

function AboutCreativeOverlay({ onClose }) {
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
  }, [lenis, requestClose]);

  const keepNativeScroll = (event) => {
    event.stopPropagation();
  };

  return (
    <div
      className={`about-creative-overlay${open ? " is-open" : ""}`}
      onClick={requestClose}
      role="presentation"
    >
      <div
        ref={dialogRef}
        className="about-creative-overlay__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
        onWheel={keepNativeScroll}
        onTouchMove={keepNativeScroll}
      >
        <div className="about-creative-overlay__close-bar">
          <button
            ref={closeRef}
            type="button"
            className="about-creative-overlay__close"
            aria-label="Close video work"
            onClick={requestClose}
          >
            <img src="/play/cross.svg" alt="" aria-hidden="true" />
          </button>
        </div>

        <div className="about-creative-overlay__body">
          <Appear
            as="h2"
            id={titleId}
            className="about-creative-overlay__title"
            triggerOnMount
            duration={0.7}
          >
            {ABOUT_CREATIVE_INTRO.title}
          </Appear>
          {ABOUT_CREATIVE_INTRO.paragraphs.map((paragraph, index) => (
            <Appear
              as="p"
              key={paragraph}
              className="about-creative-overlay__intro"
              triggerOnMount
              delay={0.08 + index * 0.08}
              duration={0.7}
            >
              {paragraph}
            </Appear>
          ))}

          <ul className="about-creative-overlay__grid">
            {ABOUT_CREATIVE_VIDEOS.map((video, index) => (
              <Appear
                as="li"
                key={video.id}
                className="about-creative-overlay__item"
                triggerOnMount
                delay={0.22 + index * 0.1}
                duration={0.75}
              >
                <CreativeClip video={video} eager={index < 2} />
              </Appear>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AboutCreativeOverlay;
