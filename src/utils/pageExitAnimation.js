import { gsap } from "gsap";

/** The overlay carries the clicked thumbnail, so it must survive the exit. */
const PRESERVED_SELECTOR = ".work-video-transition-layer";

const RING_DURATION = 0.28;
const RING_STAGGER_AMOUNT = 0.12;
const RING_DEPTH_OFFSET = 0.03;
const DEPTH_OFFSET_LIMIT = 2;
const CARD_DURATION = 0.24;
const CARD_OFFSET = 0.04;

/**
 * Elements touched by the last exit, so the chrome that outlives the route
 * change (nav wrapper, back-to-top) can be restored afterwards.
 */
let touchedElements = [];

function isAnimatable(el) {
  if (!(el instanceof HTMLElement)) return false;
  if (el.matches(PRESERVED_SELECTOR)) return false;
  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

/**
 * Group everything around the card into rings by distance: the elements
 * sharing its parent, then those sharing its grandparent, and so on.
 *
 * Deriving the rings from the tree rather than a selector list keeps this
 * working for the work grid, the home page, and anything laid out later.
 */
function collectRings(cardEl) {
  const rings = [];
  let node = cardEl;
  let parent = node.parentElement;

  while (parent && parent !== document.body) {
    const ring = [...parent.children].filter(
      (child) => child !== node && isAnimatable(child),
    );
    if (ring.length) rings.push({ ring, origin: countBefore(ring, cardEl) });
    node = parent;
    parent = node.parentElement;
  }

  return rings;
}

/** Index within the ring where the card sits, so the wave starts beside it. */
function countBefore(ring, cardEl) {
  const before = ring.filter(
    (el) =>
      el.compareDocumentPosition(cardEl) & Node.DOCUMENT_POSITION_FOLLOWING,
  ).length;
  return Math.min(before, ring.length - 1);
}

/**
 * Dissolve the page outward from the clicked card while the overlay holds its
 * thumbnail in place, so leaving for the case study reads as a dissolve rather
 * than a cut. Resolves once nothing owned by the outgoing route is visible.
 */
export function playPageExit(cardEl, onComplete) {
  const rings = collectRings(cardEl);
  const timeline = gsap.timeline({ onComplete });

  touchedElements = [cardEl, ...rings.flatMap((entry) => entry.ring)];

  rings.forEach(({ ring, origin }, depth) => {
    timeline.to(
      ring,
      {
        opacity: 0,
        y: 12,
        scale: 0.99,
        duration: RING_DURATION,
        ease: "power2.inOut",
        stagger: { amount: RING_STAGGER_AMOUNT, from: origin },
      },
      Math.min(depth, DEPTH_OFFSET_LIMIT) * RING_DEPTH_OFFSET,
    );
  });

  // The card's own frame and caption fade without moving, since the overlay is
  // pinned to its thumbnail.
  timeline.to(
    cardEl,
    { opacity: 0, duration: CARD_DURATION, ease: "power2.inOut" },
    CARD_OFFSET,
  );

  return timeline;
}

/**
 * Clear the exit's inline styles from elements that are still mounted. The
 * outgoing route's own nodes are gone by now; this is what stops persistent
 * chrome from being stranded at zero opacity.
 */
export function resetPageExit() {
  const survivors = touchedElements.filter((el) => el?.isConnected);
  touchedElements = [];
  if (!survivors.length) return;
  gsap.set(survivors, { clearProps: "opacity,transform" });
}
