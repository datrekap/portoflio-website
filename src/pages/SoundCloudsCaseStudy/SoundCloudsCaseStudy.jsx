import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenisScroll } from "../../hooks/useLenisScroll";
import useTransitionGate from "../../hooks/useTransitionGate";
import { scheduleScrollTriggerRefresh } from "../../utils/scrollTriggerRefresh";
import PageShell from "../../components/PageShell/PageShell";
import Appear from "../../components/Appear/Appear";
import CaseStudyLayout from "../../components/CaseStudyLayout/CaseStudyLayout";
import CaseStudyButton from "../../components/CaseStudyButton/CaseStudyButton";
import CaseStudyHeroVideo from "../../components/CaseStudy/CaseStudyHeroVideo";
import CountUpStat from "../../components/CaseStudy/CountUpStat";
import {
  CaseStudyInlineVideo,
  CaseStudyMediaProvider,
  CaseStudyVolumeVideo,
} from "../../components/CaseStudy/CaseStudyMedia";
import {
  SC_ACCENT,
  SC_CROWD_QUOTES,
  SC_CS,
  SC_GALLERY,
  SC_HERO_POSTER,
  SC_HERO_VIDEO,
  SC_HOW_STEPS,
  SC_META,
  SC_PROJECT_ID,
  SC_PUBLICATIONS,
  SC_STATS,
  SC_VIDEO_URL,
} from "../../data/soundcloudsCaseStudyContent";
import { blurOnClick } from "../../utils/blurOnClick";
import "../../components/CaseStudy/CaseStudy.css";
import "../../components/Publications/HomePublications.css";
import "./SoundCloudsCaseStudy.css";
import "../Home/Home.css";

gsap.registerPlugin(ScrollTrigger);

const APPEAR_STAGGER = 0.1;

function OverviewScene() {
  const frameRef = useRef(null);
  const leftBalloonRef = useRef(null);
  const rightBalloonRef = useRef(null);
  const runWhenSettled = useTransitionGate();

  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }

    let ctx;
    const cancel = runWhenSettled(() => {
      ctx = gsap.context(() => {
        const drift = [
          [leftBalloonRef.current, 6, -18],
          [rightBalloonRef.current, 14, -32],
        ];
        drift.forEach(([el, from, to]) => {
          gsap.fromTo(
            el,
            { yPercent: from },
            {
              yPercent: to,
              ease: "none",
              scrollTrigger: {
                trigger: frame,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.6,
              },
            },
          );
        });
      }, frame);
      scheduleScrollTriggerRefresh();
    });

    return () => {
      cancel();
      ctx?.revert();
    };
  }, [runWhenSettled]);

  return (
    <figure className="sc-overview-scene" ref={frameRef}>
      <div className="sc-scene__frame">
        <img
          className="sc-scene__sky"
          src={`${SC_CS}/overview/sky.webp`}
          alt=""
        />
        <img
          className="sc-scene__bg"
          src={`${SC_CS}/overview/bg.webp`}
          alt=""
        />
        <div
          ref={leftBalloonRef}
          className="sc-scene__balloon sc-scene__balloon--left"
        >
          <img src={`${SC_CS}/overview/balloon-2.webp`} alt="" />
        </div>
        <div
          ref={rightBalloonRef}
          className="sc-scene__balloon sc-scene__balloon--right"
        >
          <img src={`${SC_CS}/overview/balloon-1.webp`} alt="" />
        </div>
      </div>
      <figcaption className="visually-hidden">
        Pink and green inflatables floating in the sky above the exhibition
      </figcaption>
    </figure>
  );
}

function CrowdNotes() {
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    if (!openId) return undefined;
    const close = (event) => {
      if (event.key === "Escape") setOpenId(null);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [openId]);

  return (
    <figure className="sc-wide sc-crowd">
      <StudyImage
        src="interactions/crowd.webp"
        alt="Visitors gathered around colorful inflatables in the Sound Clouds warehouse"
        width={1800}
        height={1198}
      />
      {SC_CROWD_QUOTES.map((note) => {
        const open = openId === note.id;
        return (
          <div
            key={note.id}
            className={`sc-crowd__note sc-crowd__note--${note.id}${open ? " is-open" : ""}`}
            style={{ left: note.x, top: note.y }}
          >
            <button
              type="button"
              className="sc-crowd__hit"
              aria-expanded={open}
              aria-controls={`sc-quote-${note.id}`}
              onClick={() => setOpenId(open ? null : note.id)}
            >
              <span className="visually-hidden">Visitor note</span>
            </button>
            <p id={`sc-quote-${note.id}`} className="sc-crowd__quote" hidden={!open}>
              “{note.quote}”
            </p>
          </div>
        );
      })}
    </figure>
  );
}

function MetaValue({ value, exhibitions = false }) {
  if (!exhibitions) {
    return <span className="sc-meta-value">{value}</span>;
  }

  return (
    <span className="sc-meta-value">
      {value.split("\n").map((line) => (
        <span key={line} className="sc-meta-line">
          {line}
        </span>
      ))}
    </span>
  );
}

function GalleryMedia({ item }) {
  if (item.src.endsWith(".mp4")) {
    return (
      <CaseStudyInlineVideo
        id={item.src}
        src={`${SC_CS}/${item.src}`}
        poster={item.poster ? `${SC_CS}/${item.poster}` : undefined}
        aria-label={item.alt}
      />
    );
  }

  return <StudyImage src={item.src} alt={item.alt} />;
}

function StudyImage({ src, alt, className = "", width, height }) {
  const [ready, setReady] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const img = ref.current;
    if (img?.complete && img.naturalWidth > 0) setReady(true);
  }, [src]);

  return (
    <img
      ref={ref}
      src={`${SC_CS}/${src}`}
      alt={alt}
      className={`${className} sc-still${ready ? " is-ready" : ""}`.trim()}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      onLoad={() => setReady(true)}
    />
  );
}

const SC_CYCLE = [
  { text: "Move" },
  { text: "→", arrow: true },
  { text: "sense" },
  { text: "→", arrow: true },
  { text: "map" },
  { text: "→", arrow: true },
  { text: "respond" },
  { text: "→", arrow: true },
];

function CycleLine() {
  return (
    <p className="sc-cycle" aria-label="Move, sense, map, respond, move again.">
      {SC_CYCLE.map((part, index) => (
        <Appear
          key={`${part.text}-${index}`}
          as="span"
          delay={index * 0.12}
          className={part.arrow ? "sc-cycle__mark" : "sc-cycle__word"}
        >
          {part.text}
        </Appear>
      ))}
      <span className="sc-cycle__phrase">
        <Appear as="span" delay={0.96} className="sc-cycle__word">
          move
        </Appear>
        <Appear as="span" delay={1.08} className="sc-cycle__word">
          again
        </Appear>
      </span>
    </p>
  );
}

export default function SoundCloudsCaseStudy() {
  const { scrollToTop } = useLenisScroll();
  const heroMediaRef = useRef(null);

  useLayoutEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    scrollToTop({ immediate: true, force: true });
    return undefined;
  }, [scrollToTop]);

  return (
    <CaseStudyMediaProvider maxPlaying={4}>
      <PageShell as="div" className="cs-case-study sc-case-study">
        <CaseStudyLayout projectId={SC_PROJECT_ID}>
          <section id="sc-overview" className="cs-section cs-section--context">
            <div className="page-content-shell cs-content">
              <Appear asChild>
                <header className="cs-hero-head" data-section-anchor>
                  <h1 className="cs-hero-title">SOUNDCLOUDS</h1>
                  <p className="cs-hero-subtitle">
                    “Jaw-dropping” ambient AI system
                  </p>
                </header>
              </Appear>

              <div
                ref={heroMediaRef}
                className="cs-hero-media-wrap cs-hero-media-wrap--inline sc-hero-media-wrap"
              >
                <CaseStudyHeroVideo
                  projectId={SC_PROJECT_ID}
                  videoSrc={SC_HERO_VIDEO}
                  posterSrc={SC_HERO_POSTER}
                  posterAlt="Visitors gathered under glowing pink and blue inflatables at Sound Clouds"
                  heroMediaRef={heroMediaRef}
                />
              </div>

              <div className="sc-meta">
                {SC_META.map((row) => (
                  <dl key={row[0].label} className="cs-meta-grid">
                    {row.map((item, index) => (
                      <Appear
                        key={item.label}
                        asChild
                        delay={(index + 1) * APPEAR_STAGGER}
                      >
                        <div
                          className={`cs-meta-item${
                            item.exhibitions ? " sc-meta-exhibitions" : ""
                          }`}
                        >
                          <dt>{item.label}</dt>
                          <dd>
                            <MetaValue
                              value={item.value}
                              exhibitions={item.exhibitions}
                            />
                          </dd>
                        </div>
                      </Appear>
                    ))}
                  </dl>
                ))}
              </div>

              <Appear asChild>
                <div className="cs-intro-row">
                  <p className="cs-intro-copy">
                    Exploring ambient AI through an interactive installation
                    that turns individual movement into shared expression
                    through playful visuals and soundscapes.
                  </p>
                  <CaseStudyButton
                    href={SC_VIDEO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Video
                  </CaseStudyButton>
                </div>
              </Appear>

              <div className="sc-block">
                <Appear asChild>
                  <OverviewScene />
                </Appear>
                <Appear asChild delay={0.12}>
                  <p className="cs-body">
                    Public installation experienced by{" "}
                    <strong className="sc-emphasis">200+ visitors</strong>;
                    interview study with{" "}
                    <strong className="sc-emphasis">35 participants</strong>
                  </p>
                </Appear>
                <Appear asChild delay={0.18}>
                  <p className="cs-body">
                    Exhibited at Atlanta’s Goat Farm Arts Center; the
                    installation used large helium-and-air PVC spheres in a
                    renovated industrial space, where their changing location
                    and proximity shaped live music and light.
                  </p>
                </Appear>
              </div>
            </div>
          </section>

          <section id="sc-problem" className="cs-section">
            <div className="page-content-shell cs-content">
              <Appear asChild>
                <p className="cs-label" data-section-anchor>
                  PROBLEM
                </p>
              </Appear>
              <div className="sc-block">
                <Appear asChild>
                  <h2 className="cs-heading-display">
                    What does ambient AI feel like?
                  </h2>
                </Appear>
                <Appear asChild delay={0.06}>
                  <div className="sc-block sc-block--tight">
                    <p className="cs-body">
                      Ambient AI is often designed to work quietly in the
                      background: sensing activity, interpreting context, and
                      adjusting an environment with little direct input. That
                      can make everyday systems smoother, but it can also make
                      the technology difficult to notice, question, or
                      meaningfully engage with.
                    </p>
                    <p className="cs-body">
                      We wanted to explore a different relationship with ambient
                      AI—one that people could encounter with their whole
                      bodies, discover through curiosity, and experience with
                      others.
                    </p>
                    <p className="cs-body sc-emphasis">
                      How might an ambient AI environment move people from
                      passive observation to shared exploration?
                    </p>
                  </div>
                </Appear>
              </div>
            </div>
          </section>

          <section id="sc-solution" className="cs-section">
            <div className="page-content-shell cs-content">
              <Appear asChild>
                <p className="cs-label" data-section-anchor>
                  SOLUTION
                </p>
              </Appear>
              <Appear asChild delay={0.06}>
                <h2 className="sc-instrument">
                  <span className="sc-instrument__kicker">
                    TURN THE BUILDING INTO AN
                  </span>
                  <span className="sc-instrument__mark">INSTRUMENT!</span>
                </h2>
              </Appear>
              <div className="sc-block">
                <Appear asChild>
                  <p className="cs-body">
                    We created Sound Clouds, an immersive environment built
                    around a simple idea where people move giant floating
                    inflatables to shape a shared audiovisual environment.
                  </p>
                </Appear>
                <Appear asChild delay={0.06}>
                  <figure className="sc-figure">
                    <StudyImage
                      src="visitors.webp"
                      alt="A crowd in a brick warehouse moving among large blue, pink, and green inflatables"
                      width={970}
                      height={450}
                    />
                  </figure>
                </Appear>
                <Appear asChild delay={0.12}>
                  <p className="cs-body">
                    Visitors enter a warehouse-sized space with no
                    instructions—only large, nearly weightless spheres, evolving
                    light, and a soundscape that responds to the room.
                  </p>
                </Appear>
              </div>

              <div className="sc-block">
                <Appear asChild>
                  <h2 className="cs-heading-display">How does it work?</h2>
                </Appear>
                <div className="sc-steps">
                  {SC_HOW_STEPS.map((step) => (
                    <Appear key={step.image} asChild>
                      <article
                        className={`sc-step${
                          step.imageSide === "right" ? " sc-step--flip" : ""
                        }`}
                      >
                        <StudyImage
                          src={step.image}
                          alt={step.alt}
                          className="sc-step__media"
                        />
                        <p className="cs-body sc-step__copy">{step.body}</p>
                      </article>
                    </Appear>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section id="sc-interactions" className="cs-section">
            <div className="page-content-shell cs-content">
              <Appear asChild>
                <p className="cs-label" data-section-anchor>
                  INTERACTIONS
                </p>
              </Appear>
              <Appear asChild>
                <div className="sc-gallery" aria-label="Sound Clouds exhibition photos">
                  {SC_GALLERY.map((photo) => (
                    <figure key={photo.src} className={photo.className}>
                      <GalleryMedia item={photo} />
                    </figure>
                  ))}
                </div>
              </Appear>
              <Appear>
                <CrowdNotes />
              </Appear>
            </div>
          </section>

          <section id="sc-design-approach" className="cs-section">
            <div className="page-content-shell cs-content">
              <Appear asChild>
                <p className="cs-label" data-section-anchor>
                  DESIGN APPROACH
                </p>
              </Appear>
              <div className="sc-block">
                <Appear asChild>
                  <h2 className="cs-heading-display">
                    Designing for awe &amp; curiosity
                  </h2>
                </Appear>
                <Appear asChild delay={0.06}>
                  <div className="sc-block sc-block--tight">
                    <p className="cs-body">
                      Instead of teaching visitors a fixed interaction, we used
                      material scale, buoyancy, visual atmosphere, and immediate
                      feedback to encourage exploration.
                    </p>
                    <p className="cs-body">
                      The goal was not for everyone to form the same explanation
                      of the system. The goal was to make the environment feel
                      responsive enough that people would test, observe, adapt,
                      and involve one another.
                    </p>
                  </div>
                </Appear>
                <Appear asChild delay={0.12}>
                  <figure className="sc-figure sc-block sc-block--tight">
                    <StudyImage
                      src="human-scale.webp"
                      alt="Scale drawing comparing a person with inflatables that grow from smaller than the body to several times taller"
                      width={748}
                      height={178}
                    />
                    <figcaption className="cs-body">
                      Human-scale inflatables
                    </figcaption>
                  </figure>
                </Appear>
                <div className="sc-approach-split">
                  <Appear asChild>
                    <figure className="sc-figure cs-media sc-block sc-block--tight">
                      <CaseStudyInlineVideo
                        id="neutral-buoyancy"
                        src={`${SC_CS}/neutral.MP4`}
                        aria-label="A near-neutrally buoyant inflatable drifting as someone moves it"
                      />
                      <figcaption className="cs-body">
                        Near-neutral buoyancy
                      </figcaption>
                    </figure>
                  </Appear>
                  <Appear asChild delay={0.08}>
                    <figure className="sc-figure cs-media sc-block sc-block--tight">
                      <CaseStudyInlineVideo
                        id="no-instructions"
                        src={`${SC_CS}/no-instructions.MP4`}
                        aria-label="Visitors exploring the inflatables without written instructions"
                      />
                      <figcaption className="cs-body">
                        No instruction layer
                      </figcaption>
                    </figure>
                  </Appear>
                </div>
                <Appear asChild>
                  <figure className="sc-figure sc-block sc-block--tight">
                    <StudyImage
                      src="go-pro.webp"
                      alt="Fisheye view from the ceiling GoPro, looking down on the exhibit floor, inflatables, and two people"
                      width={1800}
                      height={1575}
                    />
                    <figcaption className="cs-body">
                      Top-down view of the exhibit space to track the x, y, &amp; z
                      position of the inflatables.
                    </figcaption>
                  </figure>
                </Appear>
                <Appear asChild delay={0.08}>
                  <figure className="sc-figure sc-block sc-block--tight">
                    <StudyImage
                      src="system-overview.webp"
                      alt="Overview of the system: a GoPro sends video over Wi-Fi to a Mac, through a YOLO interface, then out to speakers and LED strips"
                      width={752}
                      height={238}
                    />
                  </figure>
                </Appear>
                <Appear asChild delay={0.24}>
                  <p className="cs-body">
                    A top-down GoPro camera captured live footage of the space
                    and streamed it via Wi-Fi to a central Mac computer. Using a
                    fine-tuned YOLO12n model, the system detected the spheres’
                    location and estimated their height (z-position) based on
                    diameter. This information was then routed through ESP-NOW
                    and OSC to control the LEDs embedded in the spheres. The
                    location of the inflatables generated live music using
                    Max/MSP, pairing visual responsiveness with spatialized
                    audio.
                  </p>
                </Appear>
                <CycleLine />
              </div>
            </div>
          </section>

          <section id="sc-result" className="cs-section">
            <div className="page-content-shell cs-content">
              <Appear asChild>
                <p className="cs-label" data-section-anchor>
                  RESULT
                </p>
              </Appear>
              <div className="sc-block">
                <Appear asChild>
                  <h2 className="cs-heading-display">
                    “Jaw dropping” Sound Clouds
                  </h2>
                </Appear>
                <Appear asChild delay={0.06}>
                  <div className="sc-block sc-block--tight">
                    <p className="cs-body">
                      Sound Clouds was exhibited in a public art space and
                      experienced by more than 200 visitors. To understand how
                      people made sense of the environment, our team conducted
                      post-experience interviews with 35 participants.
                    </p>
                    <p className="cs-body">
                      People did not all explain the system in the same way.
                      Some focused on the technology, others on the sound, the
                      atmosphere, or the physical sensation of moving through
                      the space. But across those interpretations, the
                      installation consistently shifted attention away from
                      simply “figuring it out” and toward being present,
                      experimenting, and playing together.
                    </p>
                  </div>
                </Appear>
                <div className="sc-stats sc-result-gap">
                  {SC_STATS.map((stat, index) => (
                    <Appear key={stat.label} delay={index * APPEAR_STAGGER}>
                      <CountUpStat
                        {...stat}
                        color={SC_ACCENT}
                        delay={index * APPEAR_STAGGER}
                        className="sc-stat"
                        valueClassName="sc-stat__value"
                        labelClassName="sc-stat__label"
                        suffixClassName="sc-stat__suffix"
                      />
                    </Appear>
                  ))}
                </div>
                <div className="sc-result-gap">
                  <Appear asChild>
                    <figure className="sc-figure sc-cloud">
                      <StudyImage
                        src="word-cloud.png"
                        alt="Word cloud of reported emotions, with playful, relaxed, creative, serene, and peaceful the largest"
                        width={2341}
                        height={1146}
                      />
                    </figure>
                  </Appear>
                  <Appear asChild delay={0.06}>
                    <p className="cs-body sc-cloud-caption">
                      Word Cloud of top 10 reported emotions
                    </p>
                  </Appear>
                </div>
                <Appear asChild>
                  <h2 className="cs-heading-display sc-result-gap">Publications</h2>
                </Appear>
                <div className="home-publications-list">
                  {SC_PUBLICATIONS.map((paper) => (
                    <Appear key={paper.url} asChild>
                      <div className="home-publications-item">
                        <a
                          href={paper.url}
                          className="home-publications-entry home-publications-entry--link"
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={blurOnClick}
                        >
                          <h4 className="home-publications-paper-title">{paper.title}</h4>
                          <p className="home-publications-authors">
                            {paper.authorsBefore}
                            <strong className="home-publications-author-highlight">
                              Daksh Kapoor
                            </strong>
                            {paper.authorsAfter}
                          </p>
                        </a>
                      </div>
                    </Appear>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section id="sc-reflection" className="cs-section cs-section--last">
            <div className="page-content-shell cs-content">
              <Appear asChild>
                <p className="cs-label" data-section-anchor>
                  REFLECTION &amp; FUTURE WORK
                </p>
              </Appear>
              <div className="sc-block">
                <Appear asChild>
                  <h2 className="cs-heading-display">
                    What I learned from Sound Clouds
                  </h2>
                </Appear>
                <Appear asChild delay={0.06}>
                  <div className="sc-block sc-block--tight">
                    <p className="cs-body">
                      Sound Clouds explored ambient computing as a shared,
                      embodied experience. We designed a system of four
                      neutrally buoyant inflatable clouds that translated
                      participant movement and proximity into real-time sound
                      and light.
                    </p>
                    <p className="cs-body">
                      Interviews showed that participants developed varied,
                      partial explanations of the system, but this ambiguity
                      frequently supported curiosity rather than disengagement.
                      People used sensory feedback, experimentation, and one
                      another’s actions to make sense of the environment
                      together.
                    </p>
                    <p className="cs-body">
                      The project demonstrates how ambient systems can move
                      beyond individualized automation. By deliberately combining
                      physicality, responsive feedback, and productive
                      ambiguity, designers and engineers can create collective
                      environments that encourage awe, play, and shared
                      meaning-making.
                    </p>
                  </div>
                </Appear>
                <Appear asChild>
                  <h2 className="cs-heading-display sc-whats-next">What’s next?</h2>
                </Appear>
                <Appear asChild delay={0.06}>
                  <p className="cs-body">
                    We are working to develop a new iteration of Sound Clouds
                    featuring sixteen smaller, teardrop-shaped inflatable forms
                    arranged in a 4×4 grid. Inspired by wind chimes, the system
                    uses the forms’ movement and collisions as interaction
                    inputs, translating playful physical exploration into
                    responsive audiovisual behavior.
                  </p>
                </Appear>
                <Appear asChild delay={0.12}>
                  <figure className="sc-figure cs-media sc-future-video">
                    <CaseStudyVolumeVideo
                      id="future-work"
                      src={`${SC_CS}/future-work.mp4`}
                      aria-label="Prototype of the next Sound Clouds installation, with smaller inflatable forms"
                    />
                  </figure>
                </Appear>
              </div>

              <Appear asChild>
                <nav className="cs-case-nav" aria-label="Case study navigation">
                  <Link
                    to="/trojanstep"
                    className="home-see-more-work cs-case-nav__link cs-case-nav__link--previous"
                  >
                    <img
                      src="/work/icons/arrow.svg"
                      alt=""
                      className="home-see-more-work-arrow cs-case-nav__arrow--previous"
                      width={34}
                      height={8}
                    />
                    <span>VIEW PREVIOUS</span>
                  </Link>
                  <Link to="/#work" className="home-see-more-work cs-case-nav__link">
                    <span>VIEW NEXT</span>
                    <img
                      src="/work/icons/arrow.svg"
                      alt=""
                      className="home-see-more-work-arrow"
                      width={34}
                      height={8}
                    />
                  </Link>
                </nav>
              </Appear>
              <div
                className="cs-nav-boundary"
                data-case-study-nav-boundary
                aria-hidden="true"
              />
            </div>
          </section>
        </CaseStudyLayout>
      </PageShell>
    </CaseStudyMediaProvider>
  );
}
