import React from "react";
import "./PFALBanner.css";

const TIMELINE_YEARS = ["2021", "2022", "2023", "2024", "2025", "2026"];

export default function PFALBanner() {
  return (
    <section className="pfal-banner" aria-hidden="true">
      <div className="pfal-banner__background" />
      <img
        src="/work/FBF/case-study/birds-left.webp"
        alt=""
        className="pfal-banner__birds pfal-banner__birds--left"
      />
      <img
        src="/work/FBF/case-study/birds-right.webp"
        alt=""
        className="pfal-banner__birds pfal-banner__birds--right"
      />
      <div className="pfal-banner__sun-wrap">
        <img
          src="/work/FBF/case-study/banner-sun.svg"
          alt=""
          className="pfal-banner__sun"
        />
      </div>
      <div className="pfal-banner__timeline">
        <div className="pfal-banner__years">
          {TIMELINE_YEARS.map((year) => (
            <span key={year} className="pfal-banner__year">
              {year}
            </span>
          ))}
        </div>
        <div className="pfal-banner__dots" aria-hidden="true">
          {Array.from({ length: 32 }).map((_, index) => (
            <span key={index} className="pfal-banner__dot" />
          ))}
        </div>
      </div>
    </section>
  );
}
