import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FOOTER_SOCIAL_LINKS } from "../../data/footerLinks";
import footerArrow from "../../assets/footer/arrow.svg";
import FooterFall from "./FooterFall";
import "./Footer.css";

gsap.registerPlugin(ScrollTrigger);

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
  const [emailCopied, setEmailCopied] = useState(false);
  const copiedTimeoutRef = useRef(null);

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

    let scrollTrigger = null;
    const timeoutId = window.setTimeout(() => {
      ScrollTrigger.refresh();
      scrollTrigger = ScrollTrigger.create({
        trigger: footer,
        start: "top 85%",
        once: true,
        onEnter: () => {
          gsap.to(items, {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power2.out",
            stagger: APPEAR_STAGGER,
          });
        },
      });
    }, 100);

    return () => {
      window.clearTimeout(timeoutId);
      if (scrollTrigger) scrollTrigger.kill();
    };
  }, []);

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
          <Link to="/" className="footer-logo footer-appear" aria-label="Home">
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
