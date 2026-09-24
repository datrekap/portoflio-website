import React, { useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useLenisScroll } from "../../hooks/useLenisScroll";
import PageShell from "../../components/PageShell/PageShell";
import Appear from "../../components/Appear/Appear";
import CaseStudyLayout from "../../components/CaseStudyLayout/CaseStudyLayout";
import CaseStudyButton from "../../components/CaseStudyButton/CaseStudyButton";
import CaseStudyHeroVideo from "../../components/CaseStudy/CaseStudyHeroVideo";
import {
  CaseStudyInlineVideo,
  CaseStudyMediaProvider,
} from "../../components/CaseStudy/CaseStudyMedia";
import {
  PKW_CORE_FLOWS,
  PKW_CS,
  PKW_HERO_POSTER,
  PKW_HERO_VIDEO,
  PKW_NOTIFICATION_VIDEOS,
  PKW_PROBLEM_CARDS,
  PKW_PROJECT_ID,
  PKW_PROMO_URL,
  PKW_RESEARCH_QUESTIONS,
} from "../../data/parkwiseCaseStudyContent";
import "../../components/CaseStudy/CaseStudy.css";
import "./ParkwiseCaseStudy.css";
import "../Home/Home.css";

const APPEAR_STAGGER = 0.1;

function ParkWiseName() {
  return <em className="pkw-name">ParkWise</em>;
}

function CaseImage({ src, alt, className = "", width, height }) {
  return (
    <img
      src={`${PKW_CS}/${src}`}
      alt={alt}
      className={className}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
    />
  );
}

function videoPoster(file) {
  return `${PKW_CS}/${file.replace(/\.mp4$/i, "-poster.webp")}`;
}

export default function ParkwiseCaseStudy() {
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
      <PageShell as="div" className="cs-case-study pkw-case-study">
        <CaseStudyLayout projectId={PKW_PROJECT_ID}>
          <section
            id="pkw-overview"
            className="cs-section cs-section--context"
          >
            <div className="page-content-shell cs-content">
              <Appear asChild>
                <header className="cs-hero-head" data-section-anchor>
                  <p className="cs-hero-kicker">
                    Google UX Design &amp; Research Certification
                  </p>
                  <h1 className="cs-hero-title">PARKWISE</h1>
                  <p className="cs-hero-subtitle">
                    Community-led app to find parking on college campuses.
                  </p>
                </header>
              </Appear>

              <div
                ref={heroMediaRef}
                className="cs-hero-media-wrap cs-hero-media-wrap--inline pkw-hero-media-wrap"
              >
                <CaseStudyHeroVideo
                  projectId={PKW_PROJECT_ID}
                  videoSrc={PKW_HERO_VIDEO}
                  posterSrc={PKW_HERO_POSTER}
                  posterAlt="ParkWise campus parking app on a phone"
                  heroMediaRef={heroMediaRef}
                />
              </div>

              <dl className="cs-meta-grid">
                <Appear asChild delay={APPEAR_STAGGER}>
                  <div className="cs-meta-item">
                    <dt>ROLE</dt>
                    <dd>Product Designer</dd>
                  </div>
                </Appear>
                <Appear asChild delay={APPEAR_STAGGER * 2}>
                  <div className="cs-meta-item">
                    <dt>DURATION</dt>
                    <dd>10 Weeks (November 2025 - January 2026)</dd>
                  </div>
                </Appear>
                <Appear asChild delay={APPEAR_STAGGER * 3}>
                  <div className="cs-meta-item">
                    <dt>TOOLS</dt>
                    <dd>Figma, After Effects, Cursor</dd>
                  </div>
                </Appear>
              </dl>

              <Appear asChild>
                <div className="cs-intro-row">
                  <p className="cs-intro-copy">
                    Reimagining the campus parking experience with a student-led
                    app for finding available spots in real time.
                  </p>
                  <CaseStudyButton
                    href={PKW_PROMO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Promo
                  </CaseStudyButton>
                </div>
              </Appear>

              <Appear asChild>
                <h2 className="cs-heading-display pkw-overview-heading">
                  Class started and still can&apos;t find parking?
                </h2>
              </Appear>
              <Appear asChild delay={0.06}>
                <figure className="pkw-overview-phone">
                  <CaseImage
                    src="overview-1.webp"
                    alt="ParkWise Dynamic Island prompt asking if the student is leaving Athletic Lot"
                    width={443}
                    height={840}
                  />
                </figure>
              </Appear>
            </div>
          </section>

          <section id="pkw-problem" className="cs-section">
            <div className="page-content-shell cs-content">
              <Appear asChild>
                <p className="cs-label" data-section-anchor>
                  PROBLEM
                </p>
              </Appear>
              <Appear asChild delay={0.06}>
                <h2 className="cs-heading-md cs-heading-md--bold">
                  On a busy campus, parking uncertainty can cost students
                  valuable time.
                </h2>
              </Appear>
              <Appear asChild delay={0.12}>
                <p className="cs-body">
                  Every day, thousands of students lose 10–15 minutes to a
                  &ldquo;hidden commute,&rdquo; circling packed garages in a
                  high-stakes search for parking. Students have no way of
                  knowing which lots are full until they arrive. This lack of
                  visibility leads to missed classes, increased carbon
                  emissions, and avoidable morning stress.
                </p>
              </Appear>

              <div className="pkw-problem-cards">
                {PKW_PROBLEM_CARDS.map((card, index) => (
                  <Appear key={card.title} asChild delay={index * APPEAR_STAGGER}>
                    <article className="pkw-problem-card">
                      <div className="pkw-problem-icon">
                        <img
                          src={`${PKW_CS}/${card.icon}`}
                          alt=""
                          width={80}
                          height={80}
                        />
                      </div>
                      <div className="pkw-problem-card__copy">
                        <h3 className="cs-heading-md cs-heading-md--bold">
                          {card.title}
                        </h3>
                        <p className="cs-body">{card.body}</p>
                      </div>
                    </article>
                  </Appear>
                ))}
              </div>
            </div>
          </section>

          <section id="pkw-solution" className="cs-section">
            <div className="page-content-shell cs-content">
              <Appear asChild>
                <p className="cs-label" data-section-anchor>
                  SOLUTION
                </p>
              </Appear>

              <Appear asChild>
                <figure className="pkw-solution-hero">
                  <CaseImage
                    src="solution.webp"
                    alt="ParkWise, a community-driven campus parking solution"
                    width={1920}
                    height={1384}
                  />
                </figure>
              </Appear>

              <Appear asChild delay={0.06}>
                <p className="cs-body pkw-solution-intro">
                  <ParkWiseName /> replaces parking guesswork with a real-time,
                  community-sourced map that shows lot availability before you
                  arrive. It relies on quick-tap updates from students to keep
                  data fresh, eliminating the need for a blind search. This
                  collaborative system reduces the &ldquo;hidden
                  commute,&rdquo; ensuring everyone gets to class on time and
                  stress-free.
                </p>
              </Appear>

              <Appear asChild>
                <h2 className="cs-heading-md cs-heading-md--bold pkw-core-flows-title">
                  Core Flows
                </h2>
              </Appear>

              {PKW_CORE_FLOWS.map((flow, flowIndex) => (
                <div key={flow.title} className="pkw-flow-card">
                  <Appear asChild delay={flowIndex * 0.04}>
                    <h3 className="cs-heading-md cs-heading-md--bold">
                      {flow.title}
                    </h3>
                  </Appear>
                  {flow.video ? (
                    <CaseStudyInlineVideo
                      id={`flow-${flow.video}`}
                      src={`${PKW_CS}/${flow.video}`}
                      poster={videoPoster(flow.video)}
                      className="pkw-flow-video"
                      aria-label={flow.videoLabel}
                      playbackRate={flow.playbackRate}
                      eager
                    />
                  ) : null}
                  <Appear asChild delay={flowIndex * 0.04}>
                    <div className="pkw-phone-row">
                      {flow.screens.map((screen) => (
                        <figure key={screen.src} className="pkw-phone">
                          <p className="pkw-phone__label">{screen.label}</p>
                          <div
                            className={`pkw-phone__frame${
                              screen.crop
                                ? ` pkw-phone__frame--${screen.crop}`
                                : ""
                            }`}
                          >
                            <CaseImage
                              src={screen.src}
                              alt={screen.alt}
                              className="pkw-phone__img"
                            />
                          </div>
                        </figure>
                      ))}
                    </div>
                  </Appear>
                </div>
              ))}

              <div className="pkw-flow-card pkw-flow-card--copy">
                <Appear asChild>
                  <h3 className="cs-heading-md cs-heading-md--bold">
                    Notifications &amp; Smart Alerts
                  </h3>
                </Appear>
                <Appear asChild>
                  <p className="cs-body">
                    The app detects when a user enters a designated lot and
                    pushes an actionable notification. This eliminates the need
                    to manually search for the lot in-app, reducing
                    &ldquo;time-to-park&rdquo; to a single tap.
                  </p>
                </Appear>
                <CaseStudyInlineVideo
                  id={PKW_NOTIFICATION_VIDEOS[0].id}
                  src={`${PKW_CS}/${PKW_NOTIFICATION_VIDEOS[0].src}`}
                  poster={videoPoster(PKW_NOTIFICATION_VIDEOS[0].src)}
                  className="pkw-flow-video"
                  aria-label={PKW_NOTIFICATION_VIDEOS[0].label}
                  eager
                />
                <Appear asChild>
                  <p className="cs-body">
                    I prioritized &lsquo;Speed-to-Action&rsquo; to accommodate
                    students who are often rushing or juggling bags, ensuring
                    the community engine stays fueled with real-time data (even
                    when the user is on the lock screen).
                  </p>
                </Appear>
                <CaseStudyInlineVideo
                  id={PKW_NOTIFICATION_VIDEOS[1].id}
                  src={`${PKW_CS}/${PKW_NOTIFICATION_VIDEOS[1].src}`}
                  poster={videoPoster(PKW_NOTIFICATION_VIDEOS[1].src)}
                  className="pkw-flow-video"
                  aria-label={PKW_NOTIFICATION_VIDEOS[1].label}
                  eager
                />
                <CaseStudyInlineVideo
                  id={PKW_NOTIFICATION_VIDEOS[2].id}
                  src={`${PKW_CS}/${PKW_NOTIFICATION_VIDEOS[2].src}`}
                  poster={videoPoster(PKW_NOTIFICATION_VIDEOS[2].src)}
                  className="pkw-flow-video"
                  aria-label={PKW_NOTIFICATION_VIDEOS[2].label}
                  eager
                />
              </div>
            </div>
          </section>

          <section id="pkw-research" className="cs-section">
            <div className="page-content-shell cs-content">
              <Appear asChild>
                <p className="cs-label" data-section-anchor>
                  RESEARCH
                </p>
              </Appear>
              <Appear asChild delay={0.06}>
                <h2 className="cs-heading-md cs-heading-md--bold">
                  I surveyed 12 college-going students who drive to their
                  respective campus frequently to understand what students find
                  frustrating about parking lots in college.
                </h2>
              </Appear>

              {PKW_RESEARCH_QUESTIONS.map((block) => (
                <div key={block.question} className="pkw-research-block">
                  <Appear asChild>
                    <h3 className="cs-heading-md cs-heading-md--bold">
                      {block.question}
                    </h3>
                  </Appear>
                  <div
                    className={`pkw-research-board pkw-research-board--${block.items.length}`}
                  >
                    {block.items.map((item, index) => (
                      <Appear
                        key={item.src}
                        asChild
                        delay={index * APPEAR_STAGGER}
                      >
                        <figure className="pkw-research-item">
                          <p className="pkw-research-item__label">
                            {item.label}
                          </p>
                          <CaseImage
                            src={item.src}
                            alt={item.alt}
                            className="pkw-research-item__img"
                            width={1398}
                            height={1398}
                          />
                        </figure>
                      </Appear>
                    ))}
                  </div>
                </div>
              ))}

              <Appear asChild>
                <h2 className="cs-heading-display pkw-insight-title">
                  Students are looking for the &ldquo;surest&rdquo; spot
                </h2>
              </Appear>
              <Appear asChild delay={0.06}>
                <p className="cs-body">
                  Parking uncertainty creates stress and can disrupt academic
                  success, but hardware-based solutions are costly and slow to
                  implement.
                </p>
              </Appear>
              <Appear asChild delay={0.12}>
                <p className="cs-body pkw-insight-follow">
                  A software-led approach can bypass infrastructure constraints
                  by turning the student community into a real-time source of
                  parking data.
                </p>
              </Appear>

              <Appear asChild>
                <figure className="pkw-diagram">
                  <CaseImage
                    src="value-loop.webp"
                    alt="Infinity loop showing how parking and leaving updates keep lot data current"
                    width={1920}
                    height={1080}
                  />
                  <figcaption className="cs-body pkw-diagram__caption">
                    How a single tap from a student creates an immediate,
                    low-cost navigation signal for the next.
                  </figcaption>
                </figure>
              </Appear>
            </div>
          </section>

          <section id="pkw-design-approach" className="cs-section">
            <div className="page-content-shell cs-content">
              <Appear asChild>
                <p className="cs-label" data-section-anchor>
                  DESIGN APPROACH
                </p>
              </Appear>
              <Appear asChild delay={0.06}>
                <h2 className="cs-heading-md cs-heading-md--bold">
                  Low Friction Approach
                </h2>
              </Appear>
              <figure className="pkw-approach-media">
                <CaseStudyInlineVideo
                  id="low-friction"
                  src={`${PKW_CS}/low-friction.mp4`}
                  poster={videoPoster("low-friction.mp4")}
                  className="pkw-approach-video"
                  aria-label="ParkWise zero-UI loop for parking and leaving"
                  eager
                />
              </figure>
              <Appear asChild delay={0.06}>
                <p className="cs-body pkw-approach-copy">
                  Driving safely comes first; parking decisions and app
                  interaction come second. <ParkWiseName /> follows a Zero-UI
                  approach, using automation and glanceable information to
                  support students without pulling attention from the road.
                  Rather than demanding active use, it enables participation
                  through students&apos; everyday movement.
                </p>
              </Appear>

              <Appear asChild>
                <h2 className="cs-heading-md cs-heading-md--bold pkw-block-gap">
                  Quick Glance Design
                </h2>
              </Appear>
              <Appear asChild>
                <figure className="pkw-approach-media">
                  <CaseImage
                    src="quick-glance.webp"
                    alt="ParkWise screens showing glanceable lot status, directions, and one-tap park or leave actions"
                    width={1920}
                    height={1080}
                  />
                </figure>
              </Appear>
              <Appear asChild delay={0.06}>
                <p className="cs-body pkw-approach-copy">
                  While driving, students need clear direction.{" "}
                  <ParkWiseName /> uses bold colors and simple icons to
                  highlight the most likely available spots at a glance. Smart
                  notifications let students mark when they park or leave with
                  one tap, keeping community data current for the next driver.
                </p>
              </Appear>
            </div>
          </section>

          <section id="pkw-reflection" className="cs-section cs-section--last">
            <div className="page-content-shell cs-content">
              <Appear asChild>
                <p className="cs-label" data-section-anchor>
                  REFLECTION
                </p>
              </Appear>
              <Appear asChild delay={0.06}>
                <h2 className="cs-heading-md cs-heading-md--bold">
                  Owning the End-to-End Vision
                </h2>
              </Appear>
              <Appear asChild delay={0.12}>
                <p className="cs-body">
                  Completing <ParkWiseName /> from the first sticky note to the
                  final high-fidelity prototype was a major personal milestone.
                  Although it began as a Google UX Design Certificate project, I
                  approached it as a startup pitch and not simply an assignment.
                  I took on the roles of researcher, strategist, and designer,
                  making sure each design decision moved beyond rubric
                  requirements to address a meaningful, high-stakes challenge
                  for my peers.
                </p>
              </Appear>

              <Appear asChild>
                <h2 className="cs-heading-md cs-heading-md--bold pkw-block-gap">
                  Designing for Real-World Scenarios
                </h2>
              </Appear>
              <Appear asChild delay={0.06}>
                <p className="cs-body">
                  I quickly realized that a visually polished app is ineffective
                  if it distracts students while driving. My biggest lesson was
                  designing for high-stress moments: could a student understand
                  the interface in a one-second glance while entering a crowded
                  lot? That question pushed me to remove unnecessary elements
                  and prioritize safety, clarity, and cognitive ease over
                  trend-driven UI.
                </p>
              </Appear>

              <Appear asChild>
                <nav className="cs-case-nav" aria-label="Case study navigation">
                  <Link
                    to="/sitehub-2"
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
                  <Link
                    to="/trojanstep"
                    className="home-see-more-work cs-case-nav__link"
                  >
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
