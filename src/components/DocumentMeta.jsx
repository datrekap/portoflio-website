import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const DEFAULT_TITLE = "Daksh Kapoor | Designer Engineer & Researcher";
const DEFAULT_DESCRIPTION =
  "Portfolio of Daksh Kapoor, a designer engineer and researcher. Selected work, case studies, experiments, and writing.";
const OG_IMAGE_PATH = "/og-image.png";

const PAGE_META = {
  "/": {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  "/google-creative": {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  "/work": {
    title: "Work | Daksh Kapoor",
    description:
      "Selected product design, engineering, research, and motion projects by Daksh Kapoor.",
  },
  "/play": {
    title: "Play | Daksh Kapoor",
    description:
      "Experiments, installations, and motion studies by Daksh Kapoor.",
  },
  "/about": {
    title: "About | Daksh Kapoor",
    description:
      "Bio, photos, and experience for Daksh Kapoor, a designer engineer and researcher.",
  },
  "/about/creative": {
    title: "Creative work | Daksh Kapoor",
    description:
      "Video, motion graphics, and cinematography by Daksh Kapoor from before product design.",
  },
  "/public-future-arts-lab": {
    title: "FultonBrighterFutures | Daksh Kapoor",
    description:
      "Case study: visualizing solar energy across Fulton County through an interactive installation and web experience.",
  },
  "/sitehub-2": {
    title: "SiteHub 2.0 | Daksh Kapoor",
    description:
      "Case study: redesigning SiteHub with a universal flagging system and simpler onboarding.",
  },
  "/parkwise": {
    title: "ParkWise | Daksh Kapoor",
    description:
      "Case study: a community-driven campus parking app designed to simplify finding and leaving lots.",
  },
  "/trojanstep": {
    title: "TrojanStep | Daksh Kapoor",
    description:
      "Case study: gamifying dance to lower anxiety around body expression and movement.",
  },
};

function setMeta(attr, key, value) {
  let element = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attr, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", value);
}

function DocumentMeta() {
  const { pathname } = useLocation();

  useEffect(() => {
    const meta = PAGE_META[pathname] ?? {
      title: "404 | Daksh Kapoor",
      description:
        "This page does not exist. You might have hit a typo or an old link.",
    };
    const image = `${window.location.origin}${OG_IMAGE_PATH}`;
    const url = `${window.location.origin}${pathname}`;

    document.title = meta.title;
    setMeta("name", "description", meta.description);
    setMeta("property", "og:title", meta.title);
    setMeta("property", "og:description", meta.description);
    setMeta("property", "og:url", url);
    setMeta("property", "og:image", image);
    setMeta("name", "twitter:title", meta.title);
    setMeta("name", "twitter:description", meta.description);
    setMeta("name", "twitter:image", image);
  }, [pathname]);

  return null;
}

export default DocumentMeta;
