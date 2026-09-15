import React, { useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useLenisScroll } from "../../hooks/useLenisScroll";
import Footer from "../../components/Footer/Footer";
import Appear from "../../components/Appear/Appear";
import CaseStudyLayout from "../../components/CaseStudyLayout/CaseStudyLayout";
import CaseStudyButton from "../../components/CaseStudyButton/CaseStudyButton";
import CaseStudyHeroVideo from "../../components/CaseStudy/CaseStudyHeroVideo";
import CountUpStat from "../../components/CaseStudy/CountUpStat";
import ImageCompareSlider from "../../components/ImageCompareSlider/ImageCompareSlider";
import {
  PFAL_COMPARISON_CARDS,
  PFAL_DISCOVERY_STATS,
  PFAL_HERO_POSTER,
  PFAL_HERO_VIDEO,
  PFAL_LIVE_URL,
  PFAL_MEDIA_BASE,
  PFAL_OVERVIEW_VIDEO,
  PFAL_PROJECT_ID,
  PFAL_REFLECTION_LINKS,
} from "../../data/pfalCaseStudyContent";
import {
  PFALInlineVideo,
  PFALVolumeVideo,
  PfalMediaProvider,
} from "./PfalVideo";
import OrbPlayground from "./OrbPlayground";
import { blurOnClick } from "../../utils/blurOnClick";
import "../../components/CaseStudy/CaseStudy.css";
import "./PFALCaseStudy.css";
import "../Home/Home.css";

const APPEAR_STAGGER = 0.1;

export default function PFALCaseStudy() {
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
    <PfalMediaProvider maxPlaying={6}>
    <div className="pfal-case-study">
      <div ref={heroMediaRef} className="cs-hero-media-wrap cs-hero-media-wrap--page-top pfal-hero-media-wrap pfal-hero-media-wrap--page-top">
        <CaseStudyHeroVideo
          projectId={PFAL_PROJECT_ID}
          videoSrc={PFAL_HERO_VIDEO}
          posterSrc={PFAL_HERO_POSTER}
          posterAlt="Fulton County solar data visualization interface"
          heroMediaRef={heroMediaRef}
        />
      </div>

      <CaseStudyLayout projectId={PFAL_PROJECT_ID}>
        <section id="pfal-context" className="pfal-section pfal-section--context">
          <div className="page-content-shell pfal-content">
            <Appear asChild>
              <header className="pfal-hero-head" data-section-anchor>
                <h1 className="pfal-hero-title">SOLAR DATA</h1>
                <p className="pfal-hero-subtitle">Visualization for Fulton County</p>
              </header>
            </Appear>

            <dl className="pfal-meta-grid">
              <Appear asChild delay={APPEAR_STAGGER}>
                <div className="pfal-meta-item">
                  <dt>ROLE</dt>
                  <dd>Design Engineer</dd>
                </div>
              </Appear>
              <Appear asChild delay={APPEAR_STAGGER * 2}>
                <div className="pfal-meta-item">
                  <dt>DURATION</dt>
                  <dd>8 Weeks (June 2026 - August 2026)</dd>
                </div>
              </Appear>
              <Appear asChild delay={APPEAR_STAGGER * 3}>
                <div className="pfal-meta-item">
                  <dt>TOOLS</dt>
                  <dd>Figma, Three.js, Cursor</dd>
                </div>
              </Appear>
            </dl>

            <Appear asChild>
              <div className="pfal-intro-row">
                <p className="pfal-intro-copy">
                  Visualizing the growth of solar energy across Fulton County through
                  an interactive installation and web experience. In collaboration with{" "}
                  <span className="pfal-hover-phrase">
                    <a
                      href="https://publicartfutureslab.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pfal-hover-phrase__link"
                      onClick={blurOnClick}
                    >
                      Public Art Futures Lab.
                    </a>
                    <img
                      className="pfal-hover-phrase__art"
                      src={`${PFAL_MEDIA_BASE}/case-study/hover-effect-1.svg`}
                      alt=""
                    />
                  </span>
                </p>
                <CaseStudyButton
                  href={PFAL_LIVE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Live
                </CaseStudyButton>
              </div>
            </Appear>

            <Appear asChild>
              <figure className="pfal-media pfal-media--overview">
                <PFALVolumeVideo
                  id="hero-video"
                  src={PFAL_OVERVIEW_VIDEO}
                  eager
                  aria-label="Fulton County solar data visualization demo interface"
                />
              </figure>
            </Appear>
          </div>
        </section>

        <section id="pfal-problem" className="pfal-section">
          <div className="page-content-shell pfal-content">
            <Appear asChild>
              <p className="pfal-label" data-section-anchor>PROBLEM</p>
            </Appear>
            <Appear asChild delay={0.06}>
              <div className="pfal-problem-head">
                <h2 className="pfal-heading-md">
                  Informing county residents about specific county efforts can be challenging.
                </h2>
              </div>
            </Appear>
            <Appear asChild delay={0.12}>
              <p className="pfal-body">
                Since 2021, Fulton County has partnered with Cherry Street Energy to
                install solar panels on 42 County-owned buildings, expected to save
                taxpayers $2 million in utility costs over the project&apos;s 20-year
                term. They were able to collect data but they were struggling to inform
                the county residents and stakeholders such as the commissioners of this
                effort.
              </p>
            </Appear>
            <div className="pfal-two-col">
              <Appear>
                <p className="pfal-heading-md pfal-heading-md--bold">PROBLEM#1</p>
                <p className="pfal-body">
                  Solar performance data was scattered across incompatible formats.
                  Residents had no simple way to see how well solar was actually
                  working.
                </p>
              </Appear>
              <Appear delay={APPEAR_STAGGER}>
                <p className="pfal-heading-md pfal-heading-md--bold">PROBLEM#2</p>
                <p className="pfal-body">
                  The county residents remained unaware of the efforts of Fulton County
                  in using solar energy.
                </p>
              </Appear>
            </div>
            <Appear asChild>
              <figure className="pfal-media pfal-media--wide">
                <img
                  src={`${PFAL_MEDIA_BASE}/case-study/problem-solar.webp`}
                  alt="Solar panels installed on a county building"
                  loading="lazy"
                  decoding="async"
                />
              </figure>
            </Appear>
          </div>
        </section>

        <section id="pfal-discovery" className="pfal-section">
          <div className="page-content-shell pfal-content">
            <Appear asChild>
              <p className="pfal-label" data-section-anchor>DISCOVERY</p>
            </Appear>
            <Appear asChild delay={0.06}>
              <h2 className="pfal-heading-md pfal-heading-md--bold">
                How do we inform thousands of people of county&apos;s solar efforts?
              </h2>
            </Appear>
            <Appear asChild>
              <div className="pfal-public-art-headline">
                <p className="pfal-public-art-headline__lead">TURN DATA INTO</p>
                <p className="pfal-public-art-headline__main">
                  <span className="pfal-accent-orange">PUBLIC</span>{" "}
                  <span className="pfal-accent-blue">ART ;)</span>
                </p>
              </div>
            </Appear>
            <Appear asChild delay={0.08}>
              <div className="pfal-foot-traffic">
                <p className="pfal-body">
                  We set out to visualize the building performance data into a piece of
                  public art that could be exhibited in a space with{" "}
                  <span className="pfal-hover-phrase" tabIndex={0}>
                    a lot of foot traffic
                    <img
                      className="pfal-hover-phrase__art"
                      src={`${PFAL_MEDIA_BASE}/case-study/hover-effect-2.svg`}
                      alt=""
                    />
                  </span>
                  .
                </p>
              </div>
            </Appear>
            <div className="pfal-gallery-block">
              <div className="pfal-gallery-grid">
                {[1, 2, 3, 4].map((index) => (
                  <Appear key={index} asChild delay={(index - 1) * APPEAR_STAGGER}>
                    <img
                      src={`${PFAL_MEDIA_BASE}/case-study/discovery-${index}.webp`}
                      alt={`Fulton County Government Center interior ${index}`}
                      loading="lazy"
                      decoding="async"
                    />
                  </Appear>
                ))}
              </div>
              <Appear asChild>
                <p className="pfal-gallery-caption">
                  We chose the{" "}
                  <span className="pfal-hover-phrase">
                    <a
                      href="https://www.fultoncountyga.gov/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pfal-hover-phrase__link"
                      onClick={blurOnClick}
                    >
                      Fulton County Government Center
                    </a>
                    <img
                      className="pfal-hover-phrase__art"
                      src={`${PFAL_MEDIA_BASE}/case-study/hover-effect-1.svg`}
                      alt=""
                    />
                  </span>
                </p>
              </Appear>
            </div>
            <div className="pfal-stats-block">
              <Appear asChild>
                <h3 className="pfal-heading-md pfal-heading-md--bold">
                  Data to Visualize
                </h3>
              </Appear>
              <Appear asChild>
                <div className="pfal-stats-row">
                  {PFAL_DISCOVERY_STATS.map((stat, index) => (
                    <CountUpStat
                      key={stat.label}
                      {...stat}
                      delay={index * APPEAR_STAGGER}
                      className="pfal-stat"
                      valueClassName="pfal-stat__value"
                      labelClassName="pfal-stat__label"
                      prefixClassName="pfal-stat__prefix"
                      suffixClassName="pfal-stat__suffix"
                    />
                  ))}
                </div>
              </Appear>
            </div>
          </div>
        </section>

        <section id="pfal-design-approach" className="pfal-section">
          <div className="page-content-shell pfal-content">
            <Appear asChild>
              <p className="pfal-label" data-section-anchor>DESIGN APPROACH</p>
            </Appear>
            <Appear asChild>
              <figure className="pfal-media pfal-media--wide pfal-moodboard">
                <div className="pfal-moodboard__frame">
                  <img
                    src={`${PFAL_MEDIA_BASE}/case-study/design-moodboard.webp`}
                    alt="Design moodboard exploring public art and solar visualization"
                    className="pfal-moodboard__base"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="pfal-moodboard__overlay" aria-hidden="true">
                    <img
                      src={`${PFAL_MEDIA_BASE}/case-study/design-moodboard-hover.webp`}
                      alt=""
                      className="pfal-moodboard__hover"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                </div>
              </figure>
            </Appear>
            <Appear asChild>
              <div className="pfal-copy-block pfal-copy-block--early">
                <h3 className="pfal-heading-md pfal-heading-md--bold">
                  Early Iterations
                </h3>
                <p className="pfal-body">
                  Wanted to represent all fulton county government buildings with solar
                  panels while resonating with residents that this is a fulton county
                  project and belongs so close to home.
                </p>
              </div>
            </Appear>
            <Appear asChild>
              <figure className="pfal-media pfal-media--wide">
                <img
                  src={`${PFAL_MEDIA_BASE}/case-study/early-iterations-grid.webp`}
                  alt="Grid of early solar data visualization iterations"
                  loading="lazy"
                  decoding="async"
                />
              </figure>
            </Appear>
            <div className="pfal-split">
              <Appear asChild>
                <div className="pfal-split__visual">
                  <ImageCompareSlider
                    className="pfal-compare"
                    mode="crossfade"
                    handleSrc={`${PFAL_MEDIA_BASE}/case-study/drag.svg`}
                    beforeSrc={`${PFAL_MEDIA_BASE}/case-study/county-map.webp`}
                    afterSrc={`${PFAL_MEDIA_BASE}/case-study/county-map-1.webp`}
                    beforeAlt="Fulton county map with building locations"
                    afterAlt="Mapped Fulton County buildings as data points"
                    initialPosition={0}
                  />
                  <p className="pfal-slider-caption">Slide to change image</p>
                </div>
              </Appear>
              <Appear asChild delay={APPEAR_STAGGER}>
                <div className="pfal-split__text">
                  <h3 className="pfal-heading-md pfal-heading-md--bold">The County Map</h3>
                  <p className="pfal-body">
                    We used the Fulton county map and the exact geo location of the
                    buildings to map out our visualization. The location of each building
                    became a data point that formed the major shape of the entire
                    visualization.
                  </p>
                  <p className="pfal-body">
                    We wanted the residents of the county to resonate with our project
                    and make it feel as close to home as possible.
                  </p>
                </div>
              </Appear>
            </div>
            <div className="pfal-split pfal-split--reverse">
              <Appear asChild>
                <div className="pfal-split__text">
                  <h3 className="pfal-heading-md pfal-heading-md--bold">The UI</h3>
                  <p className="pfal-body">
                    The interface layers county-wide metrics, a timeline, and playful orb
                    interactions so visitors can explore solar impact at multiple scales.
                  </p>
                </div>
              </Appear>
              <Appear asChild delay={APPEAR_STAGGER}>
                <div className="pfal-split__visual">
                  <ImageCompareSlider
                    className="pfal-compare pfal-compare--ui"
                    mode="crossfade"
                    handleSrc={`${PFAL_MEDIA_BASE}/case-study/drag.svg`}
                    beforeSrc={`${PFAL_MEDIA_BASE}/case-study/county-map-1.webp`}
                    afterSrc={`${PFAL_MEDIA_BASE}/case-study/ui-1.webp`}
                    beforeAlt="Mapped Fulton County buildings as data points"
                    afterAlt="Final UI with energy orbs"
                    initialPosition={0}
                  />
                  <p className="pfal-slider-caption">Slide to view UI</p>
                </div>
              </Appear>
            </div>
          </div>
        </section>

        <section id="pfal-solution" className="pfal-section">
          <div className="page-content-shell pfal-content">
            <Appear asChild>
              <p className="pfal-label" data-section-anchor>SOLUTION</p>
            </Appear>
            <Appear asChild delay={0.06}>
              <div className="pfal-copy-block">
                <h3 className="pfal-heading-md pfal-heading-md--bold">Final Design</h3>
                <p className="pfal-body">
                  Final design became a triptych that represented all data points in
                  one single window. We used color theory to separate different realms
                  of data. We added a timeline at the bottom to show how fulton county
                  had grown from 2020 up until 2026 and so forth.
                </p>
              </div>
            </Appear>
            <Appear asChild>
              <figure className="pfal-media pfal-media--wide">
                <PFALVolumeVideo
                  id="final-project-video"
                  src={`${PFAL_MEDIA_BASE}/case-study/final-project-video.mp4`}
                  aria-label="Final triptych solar data visualization"
                />
                <figcaption className="pfal-media-caption">
                  Triptych Data visualization
                </figcaption>
              </figure>
            </Appear>
            <figure className="pfal-media pfal-video-pair">
              <Appear asChild>
                <div className="pfal-video-pair__item">
                  <PFALInlineVideo
                    id="final-video-2a"
                    src={`${PFAL_MEDIA_BASE}/case-study/final-video-2a.mp4`}
                    aria-label="Comparison metrics"
                  />
                  <p className="pfal-media-caption">Comparison Metrics</p>
                </div>
              </Appear>
              <Appear asChild delay={APPEAR_STAGGER}>
                <div className="pfal-video-pair__item">
                  <PFALInlineVideo
                    id="final-video-2b"
                    src={`${PFAL_MEDIA_BASE}/case-study/final-video-2b.mp4`}
                    aria-label="Individual building info"
                  />
                  <p className="pfal-media-caption">Individual building info</p>
                </div>
              </Appear>
            </figure>
            <div className="pfal-split pfal-split--play">
              <Appear asChild>
                <div className="pfal-split__text">
                  <h3 className="pfal-heading-md pfal-heading-md--bold">
                    Design for Play and Learning
                  </h3>
                  <p className="pfal-body">
                    One of my personal goals was to make this interaction playful. We
                    framed this project not as an educative informative installation,
                    rather a playful experience through which you can learn something
                    about the county.
                  </p>
                </div>
              </Appear>
              <Appear asChild delay={APPEAR_STAGGER}>
                <div className="pfal-split__visual pfal-play-visual">
                  <OrbPlayground />
                  <p className="pfal-caption-center pfal-play-visual__caption">
                    Drag the orbs to explore
                  </p>
                </div>
              </Appear>
            </div>
            <Appear asChild>
              <figure className="pfal-media pfal-media--wide">
                <PFALVolumeVideo
                  id="play-video"
                  src={`${PFAL_MEDIA_BASE}/case-study/play-video.mp4`}
                  aria-label="Interactive orb visualization"
                />
              </figure>
            </Appear>
            <Appear asChild>
              <div className="pfal-copy-block pfal-copy-block--look-ahead">
                <h3 className="pfal-heading-md pfal-heading-md--bold">
                  &ldquo;Look Ahead&rdquo; - Build Your Own Solar Future
                </h3>
                <p className="pfal-body">
                  The users also have an option to add on to the existing visualization by
                  &ldquo;speculating&rdquo; how the future of their neighborhood could
                  improve by using renewable energy. They can place a solar-equipped
                  building on the map and see its estimated impact on the surrounding
                  area.
                </p>
              </div>
            </Appear>
            <Appear asChild>
              <figure className="pfal-media pfal-media--wide">
                <PFALVolumeVideo
                  id="look-ahead-1"
                  src={`${PFAL_MEDIA_BASE}/case-study/look-ahead-1.mp4`}
                  aria-label="Look Ahead feature for building your own solar future"
                />
                <figcaption className="pfal-media-caption">
                  Choose a building type
                </figcaption>
              </figure>
            </Appear>
            <figure className="pfal-media pfal-video-pair">
              <Appear asChild>
                <div className="pfal-video-pair__item">
                  <PFALInlineVideo
                    id="look-ahead-2a"
                    src={`${PFAL_MEDIA_BASE}/case-study/look-ahead-2a.mp4`}
                    aria-label="Look Ahead building placement interaction"
                  />
                  <p className="pfal-media-caption">Add a personalized sticker</p>
                </div>
              </Appear>
              <Appear asChild delay={APPEAR_STAGGER}>
                <div className="pfal-video-pair__item">
                  <PFALInlineVideo
                    id="look-ahead-2b"
                    src={`${PFAL_MEDIA_BASE}/case-study/look-ahead-2b.mp4`}
                    aria-label="Look Ahead solar impact preview"
                  />
                  <p className="pfal-media-caption">Drag and Drop the building</p>
                </div>
              </Appear>
            </figure>
            <Appear asChild>
              <figure className="pfal-media pfal-media--wide">
                <PFALVolumeVideo
                  id="look-ahead-3"
                  src={`${PFAL_MEDIA_BASE}/case-study/look-ahead-3.mp4`}
                  aria-label="Look Ahead full speculative solar future"
                />
                <figcaption className="pfal-media-caption">
                  Explore your individual impact for the future of solar
                </figcaption>
              </figure>
            </Appear>
          </div>
        </section>

        <section id="pfal-exhibition" className="pfal-section">
          <div className="page-content-shell pfal-content">
            <Appear asChild>
              <p className="pfal-label" data-section-anchor>FINAL EXHIBITION</p>
            </Appear>
            <Appear asChild>
              <div className="pfal-exhibition-grid">
                <img
                  src={`${PFAL_MEDIA_BASE}/case-study/exhibition-1.webp`}
                  alt="Exhibition photo of the interactive solar visualization"
                  className="pfal-exhibition-grid__photo1"
                  loading="lazy"
                  decoding="async"
                />
                <img
                  src={`${PFAL_MEDIA_BASE}/case-study/exhibition-4.webp`}
                  alt="Visitors looking at the Fulton Brighter Futures installation"
                  className="pfal-exhibition-grid__photo4"
                  loading="lazy"
                  decoding="async"
                />
                <PFALInlineVideo
                  id="fe1"
                  src={`${PFAL_MEDIA_BASE}/case-study/FE1.mp4`}
                  className="pfal-exhibition-grid__fe1"
                  aria-label="Exhibition clip of a visitor using the installation"
                />
                <PFALInlineVideo
                  id="fe2"
                  src={`${PFAL_MEDIA_BASE}/case-study/FE2.mp4`}
                  className="pfal-exhibition-grid__fe2"
                  aria-label="Exhibition clip of the main visualization screen"
                />
                <img
                  src={`${PFAL_MEDIA_BASE}/case-study/exhibition-3.webp`}
                  alt="Visitor pointing at solar data on the installation"
                  className="pfal-exhibition-grid__photo3"
                  loading="lazy"
                  decoding="async"
                />
                <PFALInlineVideo
                  id="fe3"
                  src={`${PFAL_MEDIA_BASE}/case-study/FE3.mp4`}
                  className="pfal-exhibition-grid__fe3"
                  aria-label="Exhibition clip of someone observing the screen"
                />
                <PFALInlineVideo
                  id="fe4"
                  src={`${PFAL_MEDIA_BASE}/case-study/FE4.mp4`}
                  className="pfal-exhibition-grid__fe4"
                  aria-label="Exhibition clip of visitors interacting with the screen"
                />
                <img
                  src={`${PFAL_MEDIA_BASE}/case-study/FE5.webp`}
                  alt="Wide view of the gallery installation"
                  className="pfal-exhibition-grid__fe5"
                  loading="lazy"
                  decoding="async"
                />
                <PFALInlineVideo
                  id="fe6"
                  src={`${PFAL_MEDIA_BASE}/case-study/FE6.mp4`}
                  className="pfal-exhibition-grid__photo2"
                  aria-label="Exhibition clip of visitors interacting with glowing orbs"
                />
              </div>
            </Appear>
          </div>
        </section>

        <section id="pfal-reflection" className="pfal-section">
          <div className="page-content-shell pfal-content">
            <Appear asChild>
              <p className="pfal-label" data-section-anchor>REFLECTION</p>
            </Appear>
            <Appear asChild delay={0.06}>
              <h3 className="pfal-heading-lg">
                Play and Curiosity can Spark Learning
              </h3>
            </Appear>
            <Appear asChild delay={0.12}>
              <p className="pfal-body">
                Once installed, we realized how important the &ldquo;play&rdquo; aspect
                was to the viewers. The first interaction was them always interacting
                with the screen and then learning about the project. That initial
                curiosity drove them to explore the entire installation. The
                &ldquo;bouncy&rdquo; interaction mechanism became the driving force for
                the installation inviting viewers to initially play with it and learn
                something about their county in the process.
              </p>
            </Appear>
            <Appear asChild>
              <div className="pfal-button-row">
                {PFAL_REFLECTION_LINKS.map((link) => (
                  <CaseStudyButton
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {link.label}
                  </CaseStudyButton>
                ))}
              </div>
            </Appear>
          </div>
        </section>

        <section
          id="pfal-next-steps"
          className="pfal-section"
        >
          <div className="page-content-shell pfal-content">
            <Appear asChild>
              <p className="pfal-label" data-section-anchor>NEXT STEPS</p>
            </Appear>
            <Appear asChild delay={0.06}>
              <h3 className="pfal-heading-lg">
                Expand the installation beyond the government center
              </h3>
            </Appear>
            <Appear asChild delay={0.12}>
              <p className="pfal-body">
                With more time, I would love to bring this experience to additional
                county libraries and community centers so residents across Fulton County
                can encounter the data in their own neighborhoods. I would also refine
                the speculative &ldquo;Look Ahead&rdquo; tool with richer building types
                and clearer impact feedback for first-time visitors.
              </p>
            </Appear>
          </div>
        </section>

        <section
          id="pfal-shoutouts"
          className="pfal-section pfal-section--last"
        >
          <div className="page-content-shell pfal-content">
            <Appear asChild>
              <h3 className="pfal-heading-lg pfal-heading-lg--regular" data-section-anchor>
                Special S/O to my friend{" "}
                <span className="pfal-hover-phrase">
                  <a
                    href="https://thaisalvarenga.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pfal-hover-phrase__link"
                    onClick={blurOnClick}
                  >
                    Thais
                  </a>
                  <img
                    className="pfal-hover-phrase__art"
                    src={`${PFAL_MEDIA_BASE}/case-study/hover-effect-1.svg`}
                    alt=""
                  />
                </span>
              </h3>
            </Appear>
            <div className="pfal-collab-grid">
              {["SO1", "SO2", "SO3"].map((name, index) => (
                <Appear key={name} asChild delay={index * APPEAR_STAGGER}>
                  <img
                    src={`${PFAL_MEDIA_BASE}/case-study/${name}.webp`}
                    alt="Design engineers collaborating on the Fulton County solar project"
                    className="pfal-collab-photo"
                    loading="lazy"
                    decoding="async"
                  />
                </Appear>
              ))}
            </div>
            <Appear asChild>
              <p className="pfal-caption-center">
                Me and Thais collaborated together as Design Engineers to bring this
                project to fruition.
              </p>
            </Appear>
            <Appear asChild>
              <nav className="pfal-case-nav" aria-label="Case study navigation">
                <Link
                  to="/work"
                  className="home-see-more-work pfal-case-nav__link pfal-case-nav__link--previous"
                >
                  <img
                    src="/work/icons/arrow.svg"
                    alt=""
                    className="home-see-more-work-arrow pfal-case-nav__arrow--previous"
                    width={34}
                    height={8}
                  />
                  <span>VIEW PREVIOUS</span>
                </Link>
                <Link
                  to="/sitehub-2"
                  className="home-see-more-work pfal-case-nav__link"
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
              className="pfal-nav-boundary"
              data-case-study-nav-boundary
              aria-hidden="true"
            />
          </div>
        </section>
      </CaseStudyLayout>

      <Footer />
    </div>
    </PfalMediaProvider>
  );
}
