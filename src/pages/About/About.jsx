import { useEffect, useRef, useState } from "react";
import Appear from "../../components/Appear/Appear";
import PageShell from "../../components/PageShell/PageShell";
import AboutHeroWindows from "./AboutHeroWindows";
import AboutQuote from "./AboutQuote";
import useInfiniteDragLoop from "../../hooks/useInfiniteDragLoop";
import {
  ABOUT_EXPERIENCE,
  ABOUT_HOVER_ART,
  ABOUT_PHOTO_COLUMNS,
  ABOUT_STRIP_DRIFT,
} from "../../data/aboutContent";
import "./About.css";

function calloutPhaseClass(phase) {
  if (phase === "in") return " is-callout-in";
  if (phase === "out") return " is-callout-out";
  return "";
}

const AboutPhoto = ({ photo }) => {
  const isVideo = photo.src.endsWith(".mp4");

  return (
    <div
      className={`about-photo${photo.rotate ? " about-photo--rotated" : ""}`}
    >
      {isVideo ? (
        <video
          data-src={photo.src}
          poster={photo.poster}
          muted
          loop
          playsInline
          preload="none"
          controls={false}
          disablePictureInPicture
          aria-label={photo.alt}
          style={{ objectPosition: photo.objectPosition }}
          onLoadedMetadata={(event) => {
            event.currentTarget.muted = true;
          }}
        />
      ) : (
        <img
          src={photo.src}
          alt={photo.alt}
          loading="lazy"
          decoding="async"
          style={{ objectPosition: photo.objectPosition }}
          draggable="false"
        />
      )}
    </div>
  );
};

const PhotoColumn = ({ column }) => (
  <div className={`about-photos-col about-photos-col--${column.type}`}>
    {column.type === "portrait" ? (
      <AboutPhoto photo={column.photo} />
    ) : (
      column.photos.map((photo) => (
        <AboutPhoto key={photo.src} photo={photo} />
      ))
    )}
  </div>
);

function AboutPhotoStrip() {
  const scrollerRef = useRef(null);
  const trackRef = useRef(null);

  useInfiniteDragLoop(scrollerRef, trackRef, {
    driftSpeed: ABOUT_STRIP_DRIFT,
  });

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return undefined;

    const videos = () => [...root.querySelectorAll("video")];

    const ensureSources = () => {
      videos().forEach((video) => {
        const pending = video.dataset.src;
        if (pending && video.getAttribute("src") !== pending) {
          video.src = pending;
        }
      });
    };

    const setPlaying = (shouldPlay) => {
      if (shouldPlay) ensureSources();
      videos().forEach((video) => {
        if (shouldPlay) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        setPlaying(entry.isIntersecting);
      },
      { threshold: 0.08, rootMargin: "240px 0px" },
    );
    observer.observe(root);

    return () => observer.disconnect();
  }, []);

  return (
    <div className="about-photos">
      <div ref={scrollerRef} className="about-photos-scroller">
        <div ref={trackRef} className="about-photos-track">
          {ABOUT_PHOTO_COLUMNS.map((column) => (
            <PhotoColumn key={column.id} column={column} />
          ))}
        </div>
      </div>
    </div>
  );
}

const About = () => {
  const [littleThingsCallout, setLittleThingsCallout] = useState(null);
  const heroCopyRef = useRef(null);

  return (
    <PageShell className="about-page">
      <section className="about-hero" aria-label="Introduction">
        <div className="about-wide about-hero-layout">
          <div ref={heroCopyRef} className="about-hero-copy">
            <Appear as="h1" className="about-hero-title" triggerOnMount>
              ABOUT ME
            </Appear>
            <Appear
              as="div"
              className="about-bio"
              delay={0.08}
              start="top 92%"
              triggerOnMount
            >
              <p>
                My creative path began as an undergraduate exploring animation,
                video, and digital arts, which laid the foundation for my career
                as a creative specialist. Along the way, I became fascinated not
                only by how people connect with my work, but also by{" "}
                <strong>how they interact</strong> with it.
              </p>
              <p>
                This curiosity and wonder inspired me to shift from creating
                static media to designing dynamic, interactive experiences that
                actively engage individuals. I discovered a natural intersection
                between my skills and passions in the field of{" "}
                <strong>interactive design and technology.</strong>
              </p>
              <p>
                I became especially interested in crafting experiences that invite
                people to play, explore, and collaboratively address complex
                problems. Recently graduated from Georgia Tech,{" "}
                <strong>
                  I hope to use design and technology as a medium to express
                  emotion making tools not only functional, but also accessible,
                  intuitive, and genuinely human.
                </strong>
              </p>
            </Appear>
          </div>
          <AboutHeroWindows copyRef={heroCopyRef} />
        </div>
      </section>
      <AboutQuote />

      <section
        className="about-experience"
        aria-labelledby="about-experience-title"
      >
        <div className="about-wide">
          <Appear as="h2" id="about-experience-title" className="about-section-title">
            PROFESSIONAL EXPERIENCE
          </Appear>
          <ul className="about-experience-list">
            {ABOUT_EXPERIENCE.map((item, index) => (
              <Appear
                as="li"
                key={item.id}
                className="about-experience-item"
                delay={index * 0.06}
              >
                <div className="about-experience-copy">
                  <a
                    href={item.href}
                    className="about-experience-entry"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <p className="about-experience-company">{item.company}</p>
                    <h3 className="about-experience-role">{item.title}</h3>
                  </a>
                </div>
                <p className="about-experience-dates">{item.dates}</p>
              </Appear>
            ))}
          </ul>
        </div>
      </section>

      <section
        className="about-little-things"
        aria-labelledby="about-little-things-title"
      >
        <div className="about-narrow">
          <Appear
            as="h2"
            id="about-little-things-title"
            className="about-section-title"
          >
            ENJOYING THE LITTLE THINGS
          </Appear>
          <Appear as="p" className="about-little-things-copy" delay={0.08}>
            When I am not designing or researching, I like to watch movies, play
            basketball, explore new food spots, appreciate art, and definitely
            dance! I also have a soft spot for photography and{" "}
            <span
              className={`about-hover-phrase${calloutPhaseClass(littleThingsCallout)}`}
              tabIndex={0}
              onMouseEnter={() => setLittleThingsCallout("in")}
              onMouseLeave={() =>
                setLittleThingsCallout((current) =>
                  current === "in" ? "out" : current,
                )
              }
              onFocus={() => setLittleThingsCallout("in")}
              onBlur={() =>
                setLittleThingsCallout((current) =>
                  current === "in" ? "out" : current,
                )
              }
            >
              <strong>filming almost everywhere I go.</strong>
              <img
                className="about-hover-phrase__art"
                src={ABOUT_HOVER_ART.littleThings}
                alt=""
              />
            </span>
          </Appear>
        </div>

        <Appear>
          <AboutPhotoStrip />
        </Appear>
      </section>

      <Appear as="p" className="about-thanks">
        THANKS FOR VISITING!
      </Appear>
    </PageShell>
  );
};

export default About;
