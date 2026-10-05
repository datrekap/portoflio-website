import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import Appear from "../../components/Appear/Appear";
import PageShell from "../../components/PageShell/PageShell";
import { MOTION_INTRO, MOTION_PROJECTS } from "../../data/motionWork";
import MotionProjectCard from "./MotionProjectCard";
import MotionVideoOverlay from "./MotionVideoOverlay";
import "./Motion.css";

export { MOTION_PATH } from "../../data/motionWork";

const Motion = () => {
  const [activeProject, setActiveProject] = useState(null);

  const onOpen = useCallback((project) => {
    document
      .querySelectorAll(".motion-work-card video")
      .forEach((video) => video.pause());
    setActiveProject(project);
  }, []);

  const onClose = useCallback(() => {
    setActiveProject(null);
    window.requestAnimationFrame(() => {
      document
        .querySelectorAll(".motion-work-card video")
        .forEach((video) => {
          video.play().catch(() => {});
        });
    });
  }, []);

  return (
    <PageShell className="motion-page">
      <header className="motion-hero">
        <div className="page-content-shell">
          <Appear as="div" triggerOnMount>
            <h1 className="motion-title">{MOTION_INTRO.title}</h1>
            <p className="motion-intro">{MOTION_INTRO.body}</p>
          </Appear>
        </div>
      </header>

      <section className="motion-gallery-section" aria-label="Selected films">
        <div className="page-content-shell">
          <ul className="motion-gallery">
            {MOTION_PROJECTS.map((project) => (
              <li key={project.id}>
                <MotionProjectCard
                  project={project}
                  onOpen={onOpen}
                  paused={Boolean(activeProject)}
                />
              </li>
            ))}
          </ul>
          <div className="motion-page__product-cta">
            <Link to="/work" className="motion-see-product-work">
              <span>SEE PRODUCT WORK</span>
              <img
                src="/work/icons/arrow.svg"
                alt=""
                className="motion-see-product-work-arrow"
                width={34}
                height={8}
              />
            </Link>
          </div>
        </div>
      </section>

      {activeProject ? (
        <MotionVideoOverlay
          project={activeProject}
          projects={MOTION_PROJECTS}
          onNavigate={setActiveProject}
          onClose={onClose}
        />
      ) : null}
    </PageShell>
  );
};

export default Motion;
