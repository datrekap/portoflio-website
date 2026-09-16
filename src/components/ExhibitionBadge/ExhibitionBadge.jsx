function ExhibitionBadge({ children, className = "" }) {
  if (!children) return null;

  return (
    <span
      className={`exhibition-badge${className ? ` ${className}` : ""}`}
    >
      <img
        src="/work/icons/badge-star.svg"
        alt=""
        className="exhibition-badge-icon"
        width={20}
        height={19}
      />
      {children}
    </span>
  );
}

export default ExhibitionBadge;
