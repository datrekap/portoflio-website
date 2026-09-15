import React, { useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useLenisScroll } from "../../hooks/useLenisScroll";
import useInfiniteDragLoop from "../../hooks/useInfiniteDragLoop";
import Footer from "../../components/Footer/Footer";
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
  TROJAN_CORE_FLOWS,
  TROJAN_CS,
  TROJAN_DANCE_RATINGS,
  TROJAN_DANCE_VIDS,
  TROJAN_DESIGN_ASPECTS,
  TROJAN_FEATURES,
  TROJAN_GAME_RATINGS,
  TROJAN_HERO_POSTER,
  TROJAN_HERO_VIDEO,
  TROJAN_INFLUENCE_PROJECTS,
  TROJAN_LIVE_URL,
  TROJAN_PROJECT_ID,
  TROJAN_QUOTES,
  TROJAN_RESEARCH_EXAMPLES,
} from "../../data/trojanStepCaseStudyContent";
import { blurOnClick } from "../../utils/blurOnClick";
import "../../components/CaseStudy/CaseStudy.css";
import "./TrojanStepCaseStudy.css";
import "../Home/Home.css";

const APPEAR_STAGGER = 0.1;

const DanceJourney = React.memo(function DanceJourney() {
  const scrollerRef = useRef(null);
  const trackRef = useRef(null);

  useInfiniteDragLoop(scrollerRef, trackRef, { driftSpeed: 28 });

  return (
    <div className="ts-dance-journey">
      <div ref={scrollerRef} className="ts-dance-journey__scroller">
        <div ref={trackRef} className="ts-dance-journey__track">
          {TROJAN_DANCE_VIDS.map((src, index) => (
            <CaseStudyInlineVideo
              key={src}
              id={`dance-${index + 1}`}
              src={src}
              className="ts-dance-journey__vid"
              aria-label={`Dance journey clip ${index + 1}`}
            />
          ))}
        </div>
      </div>
      <p className="cs-caption">Drag to view my dance journey!</p>
    </div>
  );
});

function ProblemHoverImage({ src, hoverSrc, alt, hoverAlign = "right" }) {
  return (
    <div
      className={`ts-problem-hover ts-problem-hover--${hoverAlign}`}
      tabIndex={0}
    >
      <img src={src} alt={alt} loading="lazy" decoding="async" />
      <img className="ts-problem-hover__art" src={hoverSrc} alt="" />
    </div>
  );
}

function PeopleRating({ filled, total = 20 }) {
  return (
    <div className="ts-people-rating" aria-hidden="true">
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          className={`ts-person${index < filled ? " is-filled" : ""}`}
        />
      ))}
    </div>
  );
}

function RatingRow({ statement, filled }) {
  return (
    <div className="ts-rating-row">
      <p className="ts-rating-row__statement">{statement}</p>
      <div className="ts-rating-row__viz">
        <PeopleRating filled={filled} />
        <p className="ts-rating-row__score">
          <span>{filled}/20</span>
          <small>Agree</small>
        </p>
      </div>
    </div>
  );
}

export default function TrojanStepCaseStudy() {
  const { scrollToTop } = useLenisScroll();
  const heroMediaRef = useRef(null);
  const [activeFlow, setActiveFlow] = useState(0);
  const [activeAspect, setActiveAspect] = useState(0);
  const activeDesign = TROJAN_DESIGN_ASPECTS[activeAspect];
  const activeCoreFlow = TROJAN_CORE_FLOWS[activeFlow];

  useLayoutEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    scrollToTop({ immediate: true, force: true });
    return undefined;
  }, [scrollToTop]);

  return (
    <CaseStudyMediaProvider maxPlaying={6}>
      <div className="cs-case-study ts-case-study">
        <div
          ref={heroMediaRef}
          className="cs-hero-media-wrap cs-hero-media-wrap--page-top"
        >
          <CaseStudyHeroVideo
            projectId={TROJAN_PROJECT_ID}
            videoSrc={TROJAN_HERO_VIDEO}
            posterSrc={TROJAN_HERO_POSTER}
            posterAlt="TrojanStep interactive dance game"
            heroMediaRef={heroMediaRef}
          />
        </div>

        <CaseStudyLayout projectId={TROJAN_PROJECT_ID}>
          <section
            id="trojan-overview"
            className="cs-section cs-section--context"
          >
            <div className="page-content-shell cs-content">
              <Appear asChild>
                <header className="cs-hero-head" data-section-anchor>
                  <p className="cs-hero-kicker">
                    Georgia Tech DM Masters Project
                  </p>
                  <h1 className="cs-hero-title">TROJANSTEP</h1>
                  <p className="cs-hero-subtitle">
                    An Interactive Game to Redefine Movement and Expression
                  </p>
                </header>
              </Appear>

              <dl className="cs-meta-grid">
                <Appear asChild delay={APPEAR_STAGGER}>
                  <div className="cs-meta-item">
                    <dt>ROLE</dt>
                    <dd>Design Engineer</dd>
                  </div>
                </Appear>
                <Appear asChild delay={APPEAR_STAGGER * 2}>
                  <div className="cs-meta-item">
                    <dt>DURATION</dt>
                    <dd>December 2025 - May 2026</dd>
                  </div>
                </Appear>
                <Appear asChild delay={APPEAR_STAGGER * 3}>
                  <div className="cs-meta-item">
                    <dt>TOOLS</dt>
                    <dd>TouchDesigner, Figma Python, Cursor</dd>
                  </div>
                </Appear>
              </dl>

              <Appear asChild>
                <div className="cs-intro-row">
                  <p className="cs-intro-copy">
                    A &ldquo;stealth dance game&rdquo; that invites participants
                    to use their bodies to complete playful movement challenges,
                    overcoming movement anxiety and self-consciousness.
                  </p>
                  <CaseStudyButton
                    href={TROJAN_LIVE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Presentation
                  </CaseStudyButton>
                </div>
              </Appear>

              <Appear asChild>
                <figure className="cs-media ts-fill-media ts-overview-media">
                  <CaseStudyInlineVideo
                    id="overview-1"
                    src={`${TROJAN_CS}/overview-1.mp4`}
                    eager
                    aria-label="TrojanStep gameplay overview"
                  />
                </figure>
              </Appear>
            </div>
          </section>

          <section id="trojan-inspiration" className="cs-section">
            <div className="page-content-shell cs-content">
              <Appear asChild>
                <p className="cs-label" data-section-anchor>
                  INSPIRATION
                </p>
              </Appear>
              <Appear asChild delay={0.06}>
                <h2 className="cs-heading-display">DANCE, TO ME</h2>
              </Appear>
              <Appear asChild delay={0.12}>
                <p className="cs-body">
                  I was never professionally trained in dance, but it has always
                  found its way into my life. From joining dance organizations
                  to founding one myself, I&apos;ve continually looked for ways
                  to stay connected to movement. Dance has become one of the
                  ways I naturally express, explore, and understand myself.
                </p>
              </Appear>
              <Appear asChild>
                <DanceJourney />
              </Appear>
              <div className="ts-split">
                <Appear>
                  <h3 className="cs-heading-md cs-heading-md--bold">
                    Thesis Short Film
                  </h3>
                  <p className="cs-body ts-block-gap">
                    As part of of my undergraduate thesis, I created a short
                    film called &ldquo;Catharsis&rdquo;.
                  </p>
                  <p className="cs-body">
                    I wanted to explore &ldquo;dance&rdquo; as a form of
                    expression accessible to everyone, and not just a
                    performance for the trained or confident.
                  </p>
                </Appear>
                <Appear asChild delay={APPEAR_STAGGER}>
                  <figure className="cs-media ts-fill-media ts-catharsis-media">
                    <CaseStudyInlineVideo
                      id="catharsis"
                      src={`${TROJAN_CS}/catharsis.mp4`}
                      aria-label="Still from the short film Catharsis"
                    />
                  </figure>
                </Appear>
              </div>
              <Appear asChild>
                <h3 className="cs-heading-md cs-heading-md--bold">
                  The ideas that shaped mine
                </h3>
              </Appear>
              <Appear asChild delay={0.08}>
                <p className="cs-body ts-influence-copy">
                  Various creators before me have made works that invite body
                  movements using interactive technologies. These projects were
                  a big part of my inspiration and helped me establish a strong
                  foundation for my vision.
                </p>
              </Appear>
              <div className="ts-influence-grid">
                {TROJAN_INFLUENCE_PROJECTS.map((project, index) => (
                  <Appear
                    key={project.name}
                    asChild
                    delay={index * APPEAR_STAGGER}
                  >
                    <figure className="ts-influence-card">
                      <CaseStudyInlineVideo
                        id={`influence-${project.name.toLowerCase()}`}
                        src={project.src}
                        aria-label={project.name}
                      />
                      <figcaption>{project.name}</figcaption>
                    </figure>
                  </Appear>
                ))}
              </div>
            </div>
          </section>

          <section id="trojan-problem" className="cs-section">
            <div className="page-content-shell cs-content">
              <Appear asChild>
                <p className="cs-label" data-section-anchor>
                  PROBLEM
                </p>
              </Appear>
              <Appear asChild delay={0.06}>
                <h2 className="cs-heading-display">WHAT HOLDS US BACK?</h2>
              </Appear>
              <Appear asChild delay={0.12}>
                <p className="cs-body">
                  There is a gap between wanting to dance and feeling
                  comfortable enough to do so. Shyness and chorophobia (fear of
                  dancing) can turn an activity meant for expression into a
                  source of anxiety. This became an opportunity to explore how
                  interactive technologies might help lower that barrier and
                  create a more approachable relationship with dance.
                </p>
              </Appear>
              <div className="ts-research-list">
                {TROJAN_RESEARCH_EXAMPLES.map((example, index) => (
                  <Appear
                    key={example.alt}
                    asChild
                    delay={index * 0.04}
                  >
                    <article
                      className={`ts-research-row${
                        example.imageFirst ? "" : " ts-research-row--flip"
                      }`}
                    >
                      <ProblemHoverImage
                        src={example.src}
                        hoverSrc={example.hoverSrc}
                        alt={example.alt}
                        hoverAlign={example.imageFirst ? "right" : "left"}
                      />
                      <p className="cs-body">{example.text}</p>
                    </article>
                  </Appear>
                ))}
              </div>
              <Appear asChild>
                <h3 className="cs-heading-md">Research Questions</h3>
              </Appear>
              <Appear asChild delay={0.06}>
                <p className="cs-heading-md cs-heading-md--bold">
                  How can framing dance as a visual, goal oriented task reduce
                  levels of self-reported dance anxiety in a public setting?
                </p>
              </Appear>
              <Appear asChild delay={0.12}>
                <p className="cs-heading-md cs-heading-md--bold">
                  How can expressive movement occur as an outcome of strictly
                  functional goals in an interactive experience?
                </p>
              </Appear>
            </div>
          </section>

          <section id="trojan-design-process" className="cs-section">
            <div className="page-content-shell cs-content">
              <Appear asChild>
                <p className="cs-label" data-section-anchor>
                  DESIGN PROCESS
                </p>
              </Appear>
              <Appear asChild delay={0.06}>
                <h2 className="cs-heading-display">
                  Late Nights, Good Food, and Music ;)
                </h2>
              </Appear>
              <div className="ts-aspects">
                {TROJAN_DESIGN_ASPECTS.map((aspect, index) => (
                  <Appear key={aspect.label} delay={index * APPEAR_STAGGER}>
                    <button
                      type="button"
                      className={`ts-aspect${index === activeAspect ? " is-active" : ""}`}
                      onClick={() => setActiveAspect(index)}
                    >
                      {aspect.label}
                    </button>
                  </Appear>
                ))}
              </div>
              <div
                className={
                  activeDesign.layout === "grid"
                    ? "ts-skeleton-grid"
                    : "ts-skeleton-pair"
                }
              >
                {activeDesign.videos.map((src, index) => (
                  <CaseStudyInlineVideo
                    key={`${activeDesign.label}-${src}`}
                    id={`design-${activeAspect}-${index}`}
                    src={src}
                    aria-label={`${activeDesign.label} clip ${index + 1}`}
                  />
                ))}
              </div>
              <p className="cs-caption ts-caption-left">{activeDesign.caption}</p>
              <Appear asChild>
                <figure className="cs-media ts-making-loop">
                  <img
                    src={`${TROJAN_CS}/making-loop.png`}
                    alt="Design by making loop: ideation, code logic, design visuals, test mechanics, iterate phases"
                    loading="lazy"
                    decoding="async"
                  />
                  <figcaption className="cs-caption ts-caption-left">
                    Design by Making Loop
                  </figcaption>
                </figure>
              </Appear>
            </div>
          </section>

          <section id="trojan-artifact" className="cs-section">
            <div className="page-content-shell cs-content">
              <Appear asChild>
                <p className="cs-label" data-section-anchor>
                  THE ARTIFACT
                </p>
              </Appear>
              <Appear asChild delay={0.06}>
                <h2 className="cs-heading-display">
                  from movement to gameplay
                </h2>
              </Appear>
              <Appear asChild delay={0.12}>
                <p className="cs-body">
                  <em>TrojanStep</em> is an interactive game that invites users
                  to move their bodies to progress through a series of stages.
                  Through carefully designed visuals, music, and interactions,
                  the game encourages users to experiment with creative and
                  expansive movements in a playful, low-pressure environment.
                </p>
              </Appear>
              <Appear asChild>
                <p className="cs-body">
                  As users progress, these movements gradually come together
                  into a dance choreography. By the end of the experience, users
                  have completed a dance without the pressure or
                  self-consciousness that can often accompany dancing,
                  ultimately turning the act of dancing into something playful,
                  natural, and enjoyable.
                </p>
              </Appear>
              <Appear asChild>
                <figure className="cs-media ts-fill-media ts-artifact-media">
                  <CaseStudyVolumeVideo
                    id="artifact-1"
                    src={`${TROJAN_CS}/artifact-1.mp4`}
                    aria-label="TrojanStep intro screen with rules to play the game"
                  />
                  <figcaption className="cs-caption">
                    Gameplay screens
                  </figcaption>
                </figure>
              </Appear>
              <Appear asChild>
                <h3 className="cs-heading-md cs-heading-md--bold">
                  Core Flows
                </h3>
              </Appear>
              <div className="ts-core-flow">
                <figure className="cs-media ts-fill-media ts-core-flow-media">
                  <CaseStudyInlineVideo
                    key={activeCoreFlow.src}
                    id={`core-flow-${activeFlow}`}
                    src={activeCoreFlow.src}
                    aria-label={activeCoreFlow.label}
                  />
                  <figcaption className="cs-caption ts-caption-left">
                    {activeCoreFlow.caption}
                  </figcaption>
                </figure>
                <ul className="ts-flow-steps">
                  {TROJAN_CORE_FLOWS.map((step, index) => (
                    <li key={step.label}>
                      <button
                        type="button"
                        className={`ts-flow-step${
                          activeFlow === index ? " is-active" : ""
                        }`}
                        onClick={() => setActiveFlow(index)}
                      >
                        {step.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <Appear asChild>
                <h3 className="cs-heading-md cs-heading-md--bold">
                  What sets <em>TrojanStep</em> apart?
                </h3>
              </Appear>
              <div className="ts-feature-grid">
                {TROJAN_FEATURES.map((feature, index) => (
                  <Appear
                    key={feature.text}
                    asChild
                    delay={index * APPEAR_STAGGER}
                  >
                    <article className="ts-feature-card" tabIndex={0}>
                      <div className="ts-feature-card__shell">
                        <div className="ts-feature-card__frame">
                          <CaseStudyInlineVideo
                            id={`feature-${index + 1}`}
                            src={feature.src}
                            aria-label={feature.text}
                          />
                        </div>
                        <div className="ts-feature-card__caption">
                          <p>{feature.text}</p>
                        </div>
                      </div>
                      <div className="ts-feature-card__sizer" aria-hidden="true">
                        <p>{feature.text}</p>
                      </div>
                    </article>
                  </Appear>
                ))}
              </div>
            </div>
          </section>

          <section id="trojan-evaluation" className="cs-section">
            <div className="page-content-shell cs-content">
              <Appear asChild>
                <p className="cs-label" data-section-anchor>
                  EVALUATION
                </p>
              </Appear>
              <Appear asChild delay={0.06}>
                <h2 className="cs-heading-display">
                  “This game made me, a born introvert, comfortable with dancing
                  in an open space.”
                </h2>
              </Appear>
              <div className="ts-eval-photos">
                {["eval-1", "eval-2", "eval-3"].map((name, index) => (
                  <Appear key={name} delay={index * APPEAR_STAGGER}>
                    <CaseStudyInlineVideo
                      id={name}
                      src={`${TROJAN_CS}/evaluation/${name}.mp4`}
                      className="ts-eval-photos__video"
                      aria-label={`Demo Day participant interacting with TrojanStep ${index + 1}`}
                    />
                  </Appear>
                ))}
              </div>
              <Appear asChild>
                <p className="cs-body">
                  I exhibited the game on DEMO DAY for the Georgia Tech DM
                  program&apos;s annual student project showcase. During the
                  showcase, I asked participants to interact with the game in
                  its entirety and then asked them to fill out a survey
                  regarding their experience.
                </p>
              </Appear>
              <Appear asChild>
                <p className="cs-body">
                  The survey had likert-style questions and short answer
                  questions describing their experience with TrojanStep.
                </p>
              </Appear>
              <div className="ts-metrics">
                <Appear>
                  <CountUpStat
                    number={30}
                    suffix="+"
                    label="Participants"
                    color="#3b17dc"
                    className="pfal-stat"
                    valueClassName="pfal-stat__value ts-metric-value"
                    labelClassName="pfal-stat__label ts-metric-label"
                    prefixClassName="pfal-stat__prefix"
                    suffixClassName="pfal-stat__suffix"
                  />
                </Appear>
                <Appear delay={APPEAR_STAGGER}>
                  <CountUpStat
                    number={20}
                    label="Survey Responses"
                    color="#3b17dc"
                    delay={APPEAR_STAGGER}
                    className="pfal-stat"
                    valueClassName="pfal-stat__value ts-metric-value"
                    labelClassName="pfal-stat__label ts-metric-label"
                    prefixClassName="pfal-stat__prefix"
                    suffixClassName="pfal-stat__suffix"
                  />
                </Appear>
              </div>
              <Appear asChild>
                <h3 className="cs-heading-md cs-heading-md--bold">
                  Result Highlights
                </h3>
              </Appear>
              <Appear asChild>
                <p className="ts-rating-group-label ts-eval-group-gap">
                  Participant experience with Dancing
                </p>
              </Appear>
              {TROJAN_DANCE_RATINGS.map((row, index) => (
                <Appear key={row.statement} delay={index * 0.04}>
                  <RatingRow {...row} />
                </Appear>
              ))}
              <Appear asChild>
                <p className="ts-rating-group-label ts-eval-category-gap">
                  Participant experience with <em>TrojanStep</em>
                </p>
              </Appear>
              {TROJAN_GAME_RATINGS.map((row, index) => (
                <Appear key={row.statement} delay={index * 0.04}>
                  <RatingRow {...row} />
                </Appear>
              ))}
              <div className="ts-wordmaps-labels">
                <p>(Fig.1) Word map of Feelings in relation to Dancing</p>
                <p>(Fig.2) Word map of Feelings in relation to TrojanStep</p>
              </div>
              <Appear asChild>
                <figure className="cs-media">
                  <img
                    src={`${TROJAN_CS}/wordmaps.png`}
                    alt="Word maps comparing feelings about dancing and TrojanStep"
                    loading="lazy"
                    decoding="async"
                  />
                </figure>
              </Appear>
              <div className="ts-wordmaps-summary">
                <p className="cs-body">
                  Fig.1 has a more mixed emotional range, including some
                  negative emotions like &ldquo;scared,&rdquo;
                  &ldquo;confused,&rdquo; &ldquo;anxious,&rdquo; and
                  &ldquo;embarrassed.&rdquo;
                </p>
                <p className="cs-body">
                  Fig.2 leans more positive overall, with &ldquo;playful&rdquo;
                  (8x), &ldquo;energetic&rdquo; (6x), and
                  &ldquo;stimulating&rdquo; (5x) dominating.
                </p>
              </div>
              <Appear asChild>
                <h3 className="cs-heading-md cs-heading-md--bold">
                  Notable User Quotes
                </h3>
              </Appear>
              <div className="ts-quotes">
                {TROJAN_QUOTES.map((quote, index) => (
                  <Appear key={quote} delay={index * 0.04}>
                    <blockquote className="ts-quote">
                      <img
                        src={`${TROJAN_CS}/quote-mark.svg`}
                        alt=""
                        className="ts-quote__mark"
                      />
                      <p>{quote}</p>
                    </blockquote>
                  </Appear>
                ))}
              </div>
              <Appear asChild>
                <figure className="cs-media ts-fill-media ts-eval4-media">
                  <CaseStudyVolumeVideo
                    id="eval-4"
                    src={`${TROJAN_CS}/evaluation/eval-4.mp4`}
                    aria-label="End-of-game reveal of the player's completed dance"
                  />
                  <figcaption className="cs-caption ts-caption-left">
                    At the end, the game reveals how the user&apos;s movements
                    came together to create a dance.
                  </figcaption>
                </figure>
              </Appear>
            </div>
          </section>

          <section id="trojan-highlights" className="cs-section">
            <div className="page-content-shell cs-content">
              <Appear asChild>
                <p className="cs-label" data-section-anchor>
                  HIGHLIGHTS
                </p>
              </Appear>
              <Appear asChild delay={0.06}>
                <h2 className="cs-heading-display">
                  EMMA DARNELL STUDENT SUMMER CAMP, 2026
                </h2>
              </Appear>
              <Appear asChild delay={0.12}>
                <p className="cs-body ts-highlight-copy">
                  Students got their wiggles out with <em>TrojanStep.</em>{" "}
                  Installed as part of a ARTS+TECH workshop at the Emma Darnell
                  Aviation Museum.
                </p>
              </Appear>
              <Appear asChild>
                <div className="ts-highlights-grid">
                  <CaseStudyInlineVideo
                    id="ed-1"
                    src={`${TROJAN_CS}/emma-darnell/ed-1.mp4`}
                    className="ts-highlights-grid__ed1"
                    aria-label="Emma Darnell camp clip of students playing TrojanStep"
                  />
                  <CaseStudyInlineVideo
                    id="ed-2"
                    src={`${TROJAN_CS}/emma-darnell/ed-2.mp4`}
                    className="ts-highlights-grid__ed2"
                    aria-label="Emma Darnell camp landscape clip of TrojanStep"
                  />
                  <img
                    src={`${TROJAN_CS}/emma-darnell/ed-3.jpg`}
                    alt="Students interacting with TrojanStep at Emma Darnell camp"
                    className="ts-highlights-grid__ed3"
                    loading="lazy"
                    decoding="async"
                  />
                  <CaseStudyInlineVideo
                    id="ed-4"
                    src={`${TROJAN_CS}/emma-darnell/ed-4.mp4`}
                    className="ts-highlights-grid__ed4"
                    aria-label="Emma Darnell camp clip of the TrojanStep installation"
                  />
                </div>
              </Appear>
            </div>
          </section>

          <section id="trojan-future-work" className="cs-section">
            <div className="page-content-shell cs-content">
              <Appear asChild>
                <p className="cs-label" data-section-anchor>
                  FUTURE WORK
                </p>
              </Appear>
              <Appear asChild delay={0.06}>
                <h3 className="cs-heading-md cs-heading-md--bold">
                  Downloadable Desktop App
                </h3>
              </Appear>
              <Appear asChild delay={0.12}>
                <p className="cs-body ts-highlight-copy ts-block-gap">
                  After receiving all the user feedback, I hope to adjust the
                  interaction and the phase designs such that I can develop{" "}
                  <em>TrojanStep</em> into a downloadable desktop app. This can
                  allow other to use the app without requiring any hardware.
                </p>
              </Appear>
              <Appear asChild>
                <h3 className="cs-heading-md cs-heading-md--bold ts-future-next">
                  In-Depth Research
                </h3>
              </Appear>
              <Appear asChild delay={0.06}>
                <p className="cs-body ts-highlight-copy ts-block-gap">
                  My ongoing research explores how interventions such as{" "}
                  <em>TrojanStep</em> can reduce anxiety around movement.
                  Through user interviews, I am investigating participants&apos;
                  emotional responses, behaviors, and experiences while
                  engaging with the installation.
                </p>
              </Appear>
            </div>
          </section>

          <section
            id="trojan-shoutouts"
            className="cs-section cs-section--last"
          >
            <div className="page-content-shell cs-content">
              <Appear asChild>
                <h3 className="cs-heading-lg ts-shoutout-heading" data-section-anchor>
                  a very very special s/o to my advisor and professor{" "}
                  <span className="ts-hover-phrase">
                    <a
                      href="https://sites.google.com/view/magerko/home"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ts-hover-phrase__link"
                      onClick={blurOnClick}
                    >
                      @Dr. Brian Magerko
                    </a>
                    <img
                      className="ts-hover-phrase__art"
                      src={`${TROJAN_CS}/hover-effect-1.svg`}
                      alt=""
                    />
                  </span>
                </h3>
              </Appear>
              <div className="ts-collab-grid">
                {["SO1", "SO2", "SO3"].map((name, index) => (
                  <Appear key={name} asChild delay={index * APPEAR_STAGGER}>
                    <img
                      src={`${TROJAN_CS}/${name}.webp`}
                      alt="Collaboration photos from the TrojanStep project"
                      className="ts-collab-photo"
                      loading="lazy"
                      decoding="async"
                    />
                  </Appear>
                ))}
              </div>
              <Appear asChild>
                <nav className="cs-case-nav" aria-label="Case study navigation">
                  <Link
                    to="/parkwise"
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
                  <Link to="/work" className="home-see-more-work cs-case-nav__link">
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
        <Footer />
      </div>
    </CaseStudyMediaProvider>
  );
}
