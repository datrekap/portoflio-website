import Footer from "../Footer/Footer";
import "./PageShell.css";

const PageShell = ({
  as: Tag = "main",
  className = "",
  children,
  ...props
}) => (
  <Tag className={`page-shell${className ? ` ${className}` : ""}`} {...props}>
    <div className="page-shell__sheet">
      {children}
      <div className="page-shell__reveal-sentinel" data-footer-reveal-sentinel="" aria-hidden="true" />
    </div>
    <Footer />
  </Tag>
);

export default PageShell;
