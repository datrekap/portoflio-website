import React, { useEffect, useRef, useState } from "react";
import { WORK_CATEGORIES } from "../../data/workProjects";
import "./WorkCategoryFilter.css";

const WorkCategoryFilter = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const selected =
    WORK_CATEGORIES.find((category) => category.id === value) ??
    WORK_CATEGORIES[0];

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="work-category-filter filter-pills-container"
    >
      <button
        type="button"
        className="work-category-filter__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="work-category-filter__label-group">
          <img
            src="/work/icons/filter-grid.svg"
            alt=""
            className="work-category-filter__icon"
            width={13}
            height={12}
          />
          <span className="work-category-filter__label">Category</span>
          <img
            src="/work/icons/filter-slash.svg"
            alt=""
            className="work-category-filter__slash"
            width={7}
            height={12}
          />
          <span className="work-category-filter__value">{selected.label}</span>
        </span>
        <img
          src="/work/icons/filter-chevron.svg"
          alt=""
          className={`work-category-filter__chevron${open ? " is-open" : ""}`}
          width={12}
          height={6}
        />
      </button>

      {open ? (
        <ul className="work-category-filter__menu" role="listbox">
          {WORK_CATEGORIES.map((category) => (
            <li key={category.id} role="option" aria-selected={value === category.id}>
              <button
                type="button"
                className={`work-category-filter__option${
                  value === category.id ? " is-active" : ""
                }`}
                onClick={() => {
                  onChange(category.id);
                  setOpen(false);
                }}
              >
                {category.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
};

export default WorkCategoryFilter;
