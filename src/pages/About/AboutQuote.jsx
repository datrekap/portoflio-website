import { useEffect, useRef, useState } from "react";
import useRiseUpOnScroll from "../../hooks/useRiseUpOnScroll";
import {
  Alignment,
  Fit,
  Layout,
  useRive,
  useStateMachineInput,
} from "@rive-app/react-canvas";
import Appear from "../../components/Appear/Appear";
import CaseStudyButton from "../../components/CaseStudyButton/CaseStudyButton";
import { ABOUT_QUOTES } from "../../data/aboutContent";

const RIVE_SRC = "/play/dk-character.riv";
const RIVE_ARTBOARD = "Artboard 1";
const RIVE_STATE_MACHINE = "About";
const DANCE_INPUTS = ["Dance1", "Dance2", "Dance3"];
const RIVE_LAYOUT = new Layout({
  fit: Fit.Contain,
  alignment: Alignment.BottomCenter,
});

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function fireRiveTrigger(input) {
  if (typeof input?.fire === "function") input.fire();
}

function AboutQuoteWalker({ danceIndex }) {
  const rootRef = useRef(null);
  useRiseUpOnScroll(rootRef, { start: "top bottom", duration: 0.85, y: 40 });
  const reducedMotion = prefersReducedMotion();
  const { rive, RiveComponent, setContainerRef } = useRive(
    {
      src: RIVE_SRC,
      artboard: RIVE_ARTBOARD,
      stateMachines: RIVE_STATE_MACHINE,
      autoplay: !reducedMotion,
      layout: RIVE_LAYOUT,
      shouldDisableRiveListeners: true,
    },
    { shouldResizeCanvasToContainer: true },
  );
  const dance1 = useStateMachineInput(rive, RIVE_STATE_MACHINE, DANCE_INPUTS[0]);
  const dance2 = useStateMachineInput(rive, RIVE_STATE_MACHINE, DANCE_INPUTS[1]);
  const dance3 = useStateMachineInput(rive, RIVE_STATE_MACHINE, DANCE_INPUTS[2]);
  const dances = [dance1, dance2, dance3];

  useEffect(() => {
    if (!rive) return undefined;
    if (reducedMotion) rive.pause();
    else rive.play();
    return undefined;
  }, [rive, reducedMotion]);

  useEffect(() => {
    if (reducedMotion) return;
    fireRiveTrigger(dances[danceIndex % DANCE_INPUTS.length]);
  }, [danceIndex, dance1, dance2, dance3, reducedMotion]);

  return (
    <div ref={rootRef} className="about-quote-walker" aria-hidden="true">
      <div ref={setContainerRef} className="about-quote-walker__canvas">
        <RiveComponent />
      </div>
    </div>
  );
}

export default function AboutQuote() {
  const [index, setIndex] = useState(0);
  const [danceIndex, setDanceIndex] = useState(0);
  const quote = ABOUT_QUOTES[index];

  const onAnother = () => {
    setDanceIndex((current) => (current + 1) % DANCE_INPUTS.length);
    setIndex((current) => (current + 1) % ABOUT_QUOTES.length);
  };

  return (
    <section className="about-quote" aria-label="Quote">
      <div className="about-quote-stage">
        <div className="about-wide about-quote-layout">
          <AboutQuoteWalker danceIndex={danceIndex} />
          <Appear as="blockquote" className="about-quote-copy" delay={0.08}>
            <p className="about-quote-text">&ldquo;{quote.text}&rdquo;</p>
            <footer className="about-quote-cite">-- {quote.cite}</footer>
          </Appear>
        </div>
        <div className="about-quote-ground" aria-hidden="true" />
      </div>
      <Appear className="about-quote-next" delay={0.16}>
        <CaseStudyButton type="button" onClick={onAnother}>
          Another One
        </CaseStudyButton>
      </Appear>
    </section>
  );
}
