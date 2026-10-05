import React, { useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useLenisScroll } from "../../hooks/useLenisScroll";
import PageShell from "../../components/PageShell/PageShell";
import Appear from "../../components/Appear/Appear";
import CaseStudyLayout from "../../components/CaseStudyLayout/CaseStudyLayout";
import CaseStudyButton from "../../components/CaseStudyButton/CaseStudyButton";
import CaseStudyHeroVideo from "../../components/CaseStudy/CaseStudyHeroVideo";
import CountUpStat from "../../components/CaseStudy/CountUpStat";
import {
  CaseStudyInlineVideo,
  CaseStudyMediaProvider,
} from "../../components/CaseStudy/CaseStudyMedia";
import {
  PW_COMPANY_URL,
  PW_CS,
  PW_FLAG_SYSTEM,
  PW_HERO_POSTER,
  PW_HERO_VIDEO,
  PW_PRIORITIES,
  PW_PROJECT_ID,
  PW_SOLUTION_BLOCKS,
  PW_SOLUTION_STATS,
} from "../../data/propertyworksCaseStudyContent";
import { blurOnClick } from "../../utils/blurOnClick";
import "../../components/CaseStudy/CaseStudy.css";
import "./PropertyworksCaseStudy.css";
import "../Home/Home.css";

const APPEAR_STAGGER = 0.1;

function CountUpStatsRow({ stats }) {
  return (
    <div className="pw-metrics">
      {stats.map((stat, index) => (
        <Appear key={stat.label} delay={index * APPEAR_STAGGER}>
          <CountUpStat
            {...stat}
            delay={index * APPEAR_STAGGER}
            className="pw-stat"
            valueClassName="pw-stat__value"
            labelClassName="pw-stat__label"
            prefixClassName="pw-stat__prefix"
            suffixClassName="pw-stat__suffix"
          />
        </Appear>
      ))}
    </div>
  );
}

function FlagSystem() {
  return (
    <div className="pw-flag-system">
      {PW_FLAG_SYSTEM.map((column) => (
        <div key={column.id} className="pw-flag-col">
          <p className="pw-flag-col__label">{column.label}</p>
          {PW_PRIORITIES.map((priority) => (
            <div key={`${column.id}-${priority.key}`} className="pw-flag-row">
              <img
                src={`${PW_CS}/${column.icon}-${priority.key}.webp`}
                alt=""
                width={50}
                height={50}
              />
              <span>{priority.label}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function PropertyworksCaseStudy() {
  const { scrollToTop, scrollToSection } = useLenisScroll();
  const heroMediaRef = useRef(null);

  useLayoutEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    scrollToTop({ immediate: true, force: true });
    return undefined;
  }, [scrollToTop]);

  const handleViewSolution = () => {
    const el = document.getElementById("pw-solution");
    if (!el) return;
    scrollToSection(el, { duration: 1.2, force: true });
  };

  return (
    <CaseStudyMediaProvider maxPlaying={4}>
      <PageShell as="div" className="cs-case-study pw-case-study">
        <CaseStudyLayout projectId={PW_PROJECT_ID}>
          <section
            id="pw-overview"
            className="cs-section cs-section--context"
          >
            <div className="page-content-shell cs-content">
              <Appear asChild>
                <header className="cs-hero-head" data-section-anchor>
                  <h1 className="cs-hero-title">SITEHUB 2.0</h1>
                  <p className="cs-hero-subtitle">
                    Designing a more seamless SaaS experience
                  </p>
                </header>
              </Appear>

              <div
                ref={heroMediaRef}
                className="cs-hero-media-wrap cs-hero-media-wrap--inline pw-hero-media-wrap"
              >
                <CaseStudyHeroVideo
                  projectId={PW_PROJECT_ID}
                  videoSrc={PW_HERO_VIDEO}
                  posterSrc={PW_HERO_POSTER}
                  posterAlt="SiteHub 2.0 product interface on multiple devices"
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
                    <dd>12 Weeks (May 2025 - August 2025)</dd>
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
                    Redefining the user experience of a lease management SaaS
                    platform by introducing a universal flagging system and
                    reducing onboarding friction.
                  </p>
                  <CaseStudyButton onClick={handleViewSolution}>
                    View Solution
                  </CaseStudyButton>
                </div>
              </Appear>

              <Appear asChild>
                <h2 className="cs-heading-display">SITEHUB 2.0</h2>
              </Appear>
              <Appear asChild delay={0.06}>
                <p className="cs-body pw-overview-copy">
                  SiteHub is a B2B SaaS lease management platform (managed by{" "}
                  <span className="pw-hover-phrase">
                    <a
                      href={PW_COMPANY_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pw-hover-phrase__link"
                      onClick={blurOnClick}
                    >
                      PropertyWorks
                    </a>
                    <img
                      className="pw-hover-phrase__art"
                      src={`${PW_CS}/hover-1.svg`}
                      alt=""
                    />
                  </span>
                  ) used by multiple clients to manage complex commercial real
                  estate portfolios. It helps property owners and businesses
                  efficiently manage leases across multiple commercial
                  properties, centralizing lease information and streamlining
                  ongoing lease administration.
                </p>
              </Appear>
            </div>
          </section>

          <section id="pw-problem" className="cs-section">
            <div className="page-content-shell cs-content">
              <Appear asChild>
                <p className="cs-label" data-section-anchor>
                  PROBLEM
                </p>
              </Appear>
              <Appear asChild delay={0.06}>
                <h2 className="cs-heading-md cs-heading-md--bold">
                  Teams relied on email and spreadsheets to flag, assign, and
                  track important items
                </h2>
              </Appear>

              <div className="pw-gap-grid">
                <Appear asChild>
                  <div>
                    <h3 className="cs-heading-display">WORKFLOW GAP</h3>
                    <p className="cs-body">
                      Sitehub 1.0 relied on manual processes and external tools
                      to track tasks, slowing down operations.
                    </p>
                  </div>
                </Appear>
                <Appear asChild delay={APPEAR_STAGGER}>
                  <div>
                    <h3 className="cs-heading-display">ACCOUNTABILITY GAP</h3>
                    <p className="cs-body">
                      Teams often struggled with accountability, as
                      responsibilities were not clearly tracked within the
                      platform.
                    </p>
                  </div>
                </Appear>
              </div>

              <Appear asChild>
                <figure className="pw-problem-media">
                  <img
                    src={`${PW_CS}/problem-1.webp`}
                    alt="Workflow and accountability gaps in SiteHub 1.0"
                    loading="lazy"
                    decoding="async"
                  />
                </figure>
              </Appear>
            </div>
          </section>

          <section id="pw-solution" className="cs-section">
            <div className="page-content-shell pw-metrics-shell">
              <Appear asChild>
                <p className="cs-label" data-section-anchor>
                  SOLUTION
                </p>
              </Appear>

              <CountUpStatsRow stats={PW_SOLUTION_STATS} />
            </div>

            <div className="page-content-shell cs-content">
              {PW_SOLUTION_BLOCKS.map((block, index) => (
                <div
                  key={block.title}
                  className={`pw-solution-block${
                    index === 0 ? " pw-solution-block--first" : ""
                  }`}
                >
                  <Appear asChild>
                    <h2 className={block.titleClass}>{block.title}</h2>
                  </Appear>
                  {block.body ? (
                    <Appear asChild delay={0.06}>
                      <p className="cs-body">{block.body}</p>
                    </Appear>
                  ) : null}
                  <Appear asChild>
                    <figure
                      className={`pw-solution-media${
                        block.framed ? " pw-solution-media--framed" : ""
                      }${block.type === "image" ? " pw-solution-media--log" : ""}`}
                    >
                      {block.type === "video" ? (
                        <CaseStudyInlineVideo
                          id={`solution-${index + 1}`}
                          src={block.src}
                          className="pw-solution-video"
                          aria-label={block.alt}
                        />
                      ) : (
                        <img src={block.src} alt={block.alt} />
                      )}
                    </figure>
                  </Appear>
                </div>
              ))}
            </div>
          </section>

          <section id="pw-research" className="cs-section">
            <div className="page-content-shell cs-content">
              <Appear asChild>
                <p className="cs-label" data-section-anchor>
                  RESEARCH
                </p>
              </Appear>
              <Appear asChild delay={0.06}>
                <h2 className="cs-heading-display">WHY DO DELAYS HAPPEN?</h2>
              </Appear>
              <Appear asChild delay={0.12}>
                <p className="cs-body">
                  Before designing a solution, I needed to understand how teams
                  were actually managing accountability and tasks in their
                  day-to-day workflows. I conducted internal interviews with
                  SiteHub employees and executives who worked directly with
                  clients, as well as with clients themselves.
                </p>
              </Appear>

              <div className="pw-research-block pw-research-block--first">
                <Appear asChild>
                  <h3 className="cs-heading-md cs-heading-md--bold">
                    No clear ownership
                  </h3>
                </Appear>
                <Appear asChild delay={0.06}>
                  <p className="cs-body">
                    Every team relied on email and word of mouth to communicate
                    and resolve issues. Interviewees didn&apos;t trust this
                    system since action items got buried in email threads,
                    leading to delays and miscommunication. Because no one owned
                    a task within the platform itself, resolution took 48+ hours
                    on average.
                  </p>
                </Appear>
                <Appear asChild>
                  <figure className="pw-flow-media">
                    <img
                      src={`${PW_CS}/workflow-gap-flow.webp`}
                      alt="Workflow showing issues getting buried in email instead of being owned in SiteHub"
                      loading="lazy"
                      decoding="async"
                    />
                  </figure>
                </Appear>
              </div>

              <div className="pw-research-block">
                <Appear asChild>
                  <h3 className="cs-heading-md cs-heading-md--bold">
                    Manual onboarding
                  </h3>
                </Appear>
                <Appear asChild delay={0.06}>
                  <p className="cs-body">
                    New clients were onboarded manually by internal staff.
                    Getting a client from signed contract to active user
                    involved two separate frictions: creating access to the
                    platform itself, and gathering the property and company
                    documents needed to set up their account, which could take
                    hours to coordinate.
                  </p>
                </Appear>
                <Appear asChild>
                  <figure className="pw-flow-media">
                    <img
                      src={`${PW_CS}/onboarding-flow.webp`}
                      alt="Manual onboarding flow from signed contract to active SiteHub user"
                      loading="lazy"
                      decoding="async"
                    />
                  </figure>
                </Appear>
              </div>
            </div>
          </section>

          <section id="pw-design-approach" className="cs-section">
            <div className="page-content-shell cs-content">
              <Appear asChild>
                <p className="cs-label" data-section-anchor>
                  DESIGN APPROACH
                </p>
              </Appear>
              <Appear asChild delay={0.06}>
                <h2 className="cs-heading-display">THREE-PART FLAGGING SYSTEM</h2>
              </Appear>
              <Appear asChild delay={0.12}>
                <p className="cs-body">
                  Based on my research and interviews, I designed a three-part
                  flagging system to give teams a way to mark priorities and
                  assign responsibility directly within SiteHub — without
                  relying on email or spreadsheets.
                </p>
              </Appear>

              <Appear asChild>
                <FlagSystem />
              </Appear>

              <div className="pw-approach-block pw-approach-block--first">
                <Appear asChild>
                  <h3 className="cs-heading-md cs-heading-md--bold">
                    Closing the ownership gap
                  </h3>
                </Appear>
                <Appear asChild delay={0.06}>
                  <p className="cs-body">
                    Every issue now moves through a clear, track-able path
                    (flagged, prioritized, and assigned to an owner), replacing
                    the guesswork that used to cause 48+ hour delays.
                  </p>
                </Appear>
                <Appear asChild>
                  <figure className="pw-flow-media">
                    <img
                      src={`${PW_CS}/ownership-flow.webp`}
                      alt="Flag, prioritize, and assign path that closes the ownership gap"
                      loading="lazy"
                      decoding="async"
                    />
                  </figure>
                </Appear>
              </div>

              <div className="pw-approach-block">
                <Appear asChild>
                  <h3 className="cs-heading-md cs-heading-md--bold">
                    Fitting into the platform
                  </h3>
                </Appear>
                <div className="pw-fit-row">
                  <Appear asChild delay={0.06}>
                    <p className="cs-body">
                      Rather than introducing a completely new interaction
                      model, I designed the flagging system to work within
                      SiteHub&apos;s existing visual language and navigation
                      patterns. Flags, tasks, and notes needed to feel like a
                      natural extension of the platform, and not a separate tool
                      bolted on top.
                    </p>
                  </Appear>
                  <Appear asChild delay={0.12}>
                    <figure className="pw-fit-media">
                      <CaseStudyInlineVideo
                        id="action-item"
                        src={`${PW_CS}/action-item.mp4`}
                        className="pw-fit-video"
                        aria-label="Flagging actions fitting into SiteHub's existing interface"
                      />
                    </figure>
                  </Appear>
                </div>
              </div>

              <div className="pw-approach-block">
                <Appear asChild>
                  <h3 className="cs-heading-md cs-heading-md--bold">
                    Closing the onboarding gap
                  </h3>
                </Appear>
                <Appear asChild delay={0.06}>
                  <p className="cs-body">
                    While document collection remained a manual process outside
                    this project&apos;s scope, I focused on removing friction
                    from the first step: getting a new user into the platform. I
                    redesigned the account creation flow to be self-serve,
                    rather than something requiring an internal employee to walk
                    them through.
                  </p>
                </Appear>
                <Appear asChild>
                  <figure className="pw-flow-media pw-onboarding-gap-media">
                    <img
                      src={`${PW_CS}/onboarding-gap-flow.webp`}
                      alt="Self-serve account creation replacing manual employee-led onboarding"
                      loading="lazy"
                      decoding="async"
                    />
                  </figure>
                </Appear>
              </div>
            </div>
          </section>

          <section id="pw-reflection" className="cs-section cs-section--last">
            <div className="page-content-shell cs-content">
              <Appear asChild>
                <p className="cs-label" data-section-anchor>
                  REFLECTION
                </p>
              </Appear>
              <Appear asChild delay={0.06}>
                <h2 className="cs-heading-md cs-heading-md--bold">
                  Growing into the lead role
                </h2>
              </Appear>
              <Appear asChild delay={0.12}>
                <p className="cs-body">
                  This internship marked my first experience as the only product
                  designer on an industry project, tackling real challenges
                  faced by users of a B2B SaaS platform. I redesigned key user
                  flows within SiteHub and worked closely with the development
                  team to bring those solutions to life.
                </p>
              </Appear>

              <Appear asChild>
                <h2 className="cs-heading-md cs-heading-md--bold pw-block-gap">
                  Working closer with dev tools
                </h2>
              </Appear>
              <Appear asChild delay={0.06}>
                <p className="cs-body">
                  Working closely with engineers pushed me to think beyond
                  static designs and consider how my decisions would actually be
                  implemented. Using tools like Cursor and Figma Make alongside
                  the development team helped bridge the gap between design
                  intent and code, making handoff faster and reducing
                  back-and-forth during implementation.
                </p>
              </Appear>

              <Appear asChild>
                <nav className="cs-case-nav" aria-label="Case study navigation">
                  <Link
                    to="/public-future-arts-lab"
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
                    to="/parkwise"
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
