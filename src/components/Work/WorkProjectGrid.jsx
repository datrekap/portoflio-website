import React, { useMemo, useState } from "react";
import { workProjects } from "../../data/workProjects";
// import WorkCategoryFilter from "./WorkCategoryFilter";
import WorkProjectCard from "./WorkProjectCard";
import "./WorkProjectGrid.css";

const WorkProjectGrid = ({ containerRef }) => {
  const [category, setCategory] = useState("all");

  const filteredProjects = useMemo(() => {
    if (category === "all") return workProjects;
    return workProjects.filter((project) => project.category === category);
  }, [category]);

  return (
    <div ref={containerRef} className="work-project-grid-wrap">
      {/* <WorkCategoryFilter value={category} onChange={setCategory} /> */}
      <div className="work-project-grid" aria-label="Work projects">
        {filteredProjects.map((project) => (
          <WorkProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
};

export default WorkProjectGrid;
