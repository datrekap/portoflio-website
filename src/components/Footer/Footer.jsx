import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLenisScroll } from "../../hooks/useLenisScroll";
import useTransitionGate from "../../hooks/useTransitionGate";
import { isHomePath } from "../../constants/homeRoutes";
import { gsap } from "gsap";
import { FOOTER_SOCIAL_LINKS } from "../../data/footerLinks";
import footerArrow from "../../assets/footer/arrow.svg";
import FooterFall from "./FooterFall";
import "./Footer.css";

const APPEAR_STAGGER = 0.1;
const EMAIL_COPIED_MS = 2000;

function emailFromMailto(href) {
  return href.replace(/^mailto:/i, "").split("?")[0];
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

const Footer = () => {
  const footerRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { scrollToTop } = useLenisScroll();
  const runWhenSettled = useTransitionGate();
  const [emailCopied, setEmailCopied] = useState(false);
  const copiedTimeoutRef = useRef(null);

  const handleLogoClick = (event) => {
    event.preventDefault();
    if (isHomePath(location.pathname)) {
      scrollToTop({ duration: 1.2 });
      return;
    }
    navigate("/");
    window.setTimeout(() => scrollToTop({ duration: 1.2 }), 100);
  };

  useEffect(
    () => () => {
      if (copiedTimeoutRef.current) {
        window.clearTimeout(copiedTimeoutRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return undefined;

    const items = footer.querySelectorAll(".footer-appear");
    if (!items.length) return undefined;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(items, { opacity: 1, y: 0 });
      return undefined;
    }

    gsap.set(items, { opacity: 0, y: 30 });

    let observer = null;
    let hasAppeared = false;

    // IntersectionObserver survives Lenis spy-nav jumps and ScrollTrigger.refresh()
    // races that previously consumed or skipped the footer's once:true trigger.
    const cancelGate = runWhenSettled(() => {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry?.isIntersecting || hasAppeared) return;
          hasAppeared = true;
          observer?.disconnect();
          observer = null;
          gsap.to(items, {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power2.out",
            stagger: APPEAR_STAGGER,
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -10% 0px" },
      );
      observer.observe(footer);
    });

    return () => {
      cancelGate();
      observer?.disconnect();
    };
  }, [runWhenSettled]);

  const handleCopyEmail = async (href) => {
    try {
      await copyText(emailFromMailto(href));
    } catch {
      return;
    }

    setEmailCopied(true);
    if (copiedTimeoutRef.current) {
      window.clearTimeout(copiedTimeoutRef.current);
    }
    copiedTimeoutRef.current = window.setTimeout(() => {
      setEmailCopied(false);
      copiedTimeoutRef.current = null;
    }, EMAIL_COPIED_MS);
  };

  return (
    <footer ref={footerRef} id="contact" className="footer">
      <FooterFall />
      <div className="footer-container page-content-shell">
        <div className="footer-bar">
          <h2 className="footer-heading footer-appear">
            <span className="footer-heading-lead">Design with</span>
            <span className="footer-heading-accent">MEANING</span>
          </h2>

          <div className="footer-top-right">
            <Link
              to="/"
              className="footer-logo footer-appear"
              aria-label="Home"
              onClick={handleLogoClick}
            >
              DK
            </Link>
            <ul className="footer-socials footer-appear" aria-label="Social links">
              {FOOTER_SOCIAL_LINKS.map(({ label, href, external, copy }) => (
                <li key={label}>
                  {copy ? (
                    <button
                      type="button"
                      className="footer-social-link"
                      onClick={() => handleCopyEmail(href)}
                      aria-label={
                        emailCopied
                          ? "Email copied to clipboard"
                          : "Copy email address"
                      }
                      aria-live="polite"
                    >
                      <span>{emailCopied ? "Email copied!" : label}</span>
                      {!emailCopied && (
                        <span className="footer-social-arrow" aria-hidden="true">
                          <img src={footerArrow} alt="" width={13} height={12} />
                        </span>
                      )}
                    </button>
                  ) : (
                    <a
                      href={href}
                      className="footer-social-link"
                      {...(external
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                      aria-label={
                        external ? `${label} (opens in a new tab)` : label
                      }
                    >
                      <span>{label}</span>
                      <span className="footer-social-arrow" aria-hidden="true">
                        <img src={footerArrow} alt="" width={13} height={12} />
                      </span>
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="footer-copyright footer-appear">© 2026 Daksh Kapoor</p>
      </div>
    </footer>
  );
};

export default Footer;
