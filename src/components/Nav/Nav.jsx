import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { useLenis } from "@studio-freight/react-lenis";
import { useLenisScroll } from "../../hooks/useLenisScroll";
import {
  NAV_REVEAL_DELAY_MS,
  NAV_REVEAL_DURATION,
  NAV_REVEAL_TIMEOUT_MS,
  onNavReveal,
} from "../../constants/navTiming";
import {
  isHomePath,
  isGoogleCreativePath,
} from "../../constants/homeRoutes";
import "./Nav.css";
import DarkDKLogo from "../../assets/img/DarkDKLogo.png";
import LightDKLogo from "../../assets/img/LightDKLogo.png";

const Nav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const lenis = useLenis();
  const { scrollToTop } = useLenisScroll();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [navRevealed, setNavRevealed] = useState(false);
  const [windowWidth, setWindowWidth] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 1024,
  );
  const hamburgerRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const navItemsRef = useRef(null);
  const navRef = useRef(null);

  const RESUME_URL =
    "https://drive.google.com/file/d/1dxbGxh4xrmuKMV1uSPrl-MKsIY3JT1mn/view?usp=drive_link";

  const navItems = [
    { label: "work", href: "/work", isLink: true },
    { label: "play", href: "/play", isLink: true },
    { label: "about", href: "/about", isLink: true },
    { label: "resume", href: RESUME_URL, isLink: false },
  ];

  const mobileNavItems = [
    navItems[0],
    navItems[1],
    { label: "dk", href: "/", isLink: true, isLogo: true },
    navItems[2],
    navItems[3],
  ];

  const handleLogoClick = (e) => {
    if (isHomePath(location.pathname)) {
      e.preventDefault();
      window.history.pushState(null, "", location.pathname);
      scrollToTop({ duration: 1.2 });
    } else {
      navigate("/");
      setTimeout(() => scrollToTop({ duration: 1.2 }), 100);
    }
  };

  const isNavItemActive = (item) => {
    const path = location.pathname;
    if (isGoogleCreativePath(path)) return false;
    if (item.label === "about") return path === "/about";
    if (item.label === "work") return path === "/work";
    if (item.label === "play") return path === "/play";
    return false;
  };

  const renderPillLabel = (item) => (
    <span className="pill-label" data-label={item.label}>
      {item.label}
    </span>
  );

  // The nav is the last thing to appear: pages with an intro timeline call
  // revealNav() when they finish, everything else reveals it shortly after mount.
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return undefined;

    const path = location.pathname;
    const runsIntroTimeline =
      isHomePath(path) || path === "/work" || path === "/play";

    let tween = null;
    let revealed = false;

    gsap.killTweensOf(nav);
    nav.classList.remove("is-revealed");
    setNavRevealed(false);
    gsap.set(nav, {
      y: -110,
      opacity: 0,
      pointerEvents: "none",
    });
    setIsMobileMenuOpen(false);
    document.body.classList.remove("mobile-menu-open");
    lenis?.start();
    const menu = mobileMenuRef.current;
    if (menu) {
      gsap.set(menu, { visibility: "hidden", opacity: 0, y: "-100%" });
    }

    const reveal = () => {
      if (revealed) return;
      revealed = true;
      tween = gsap.to(nav, {
        y: 0,
        opacity: 1,
        duration: NAV_REVEAL_DURATION,
        ease: "power2.out",
        overwrite: "auto",
        onStart() {
          nav.style.pointerEvents = "auto";
        },
        onComplete() {
          nav.classList.add("is-revealed");
          nav.style.transform = "none";
          setNavRevealed(true);
        },
      });
    };

    const stopListening = onNavReveal(reveal);
    const fallback = window.setTimeout(
      reveal,
      runsIntroTimeline ? NAV_REVEAL_TIMEOUT_MS : NAV_REVEAL_DELAY_MS,
    );

    return () => {
      stopListening();
      window.clearTimeout(fallback);
      tween?.kill();
    };
  }, [location.pathname, lenis]);

  useEffect(() => {
    const menu = mobileMenuRef.current;
    if (menu) {
      gsap.set(menu, { visibility: "hidden", opacity: 0, y: "-100%" });
    }
  }, []);

  // Effect to sync hamburger lines with menu state
  useEffect(() => {
    const hamburger = hamburgerRef.current;
    if (!hamburger) return;

    const lines = hamburger.querySelectorAll(".hamburger-line");
    if (lines.length >= 2) {
      if (isMobileMenuOpen) {
        gsap.set(lines[0], { rotation: 45, y: 3 });
        gsap.set(lines[1], { rotation: -45, y: -3 });
      } else {
        gsap.set(lines[0], { rotation: 0, y: 0 });
        gsap.set(lines[1], { rotation: 0, y: 0 });
      }
    }
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (windowWidth <= 768 || !isMobileMenuOpen) return;
    setIsMobileMenuOpen(false);
    lenis?.start();
    document.body.classList.remove("mobile-menu-open");
    const menu = mobileMenuRef.current;
    if (menu) {
      gsap.set(menu, { visibility: "hidden", opacity: 0, y: "-100%" });
    }
  }, [windowWidth, isMobileMenuOpen, lenis]);

  // On desktop: always show nav items and keep hamburger hidden (no scroll collapse).
  // On small screens, CSS handles collapse via .desktop-only / .mobile-only.
  useEffect(() => {
    const isDesktop = windowWidth > 768;
    if (!isDesktop) return;

    const navItems = navItemsRef.current?.children;
    const hamburger = hamburgerRef.current;

    if (!navItems || navItems.length === 0 || !hamburger) return;

    gsap.set(navItems, { x: 0, opacity: 1 });
    Array.from(navItems).forEach((item) => {
      item.style.pointerEvents = "auto";
    });
    gsap.set(hamburger, { opacity: 0, scale: 0.8, display: "flex" });
    hamburger.style.pointerEvents = "none";

    const lines = hamburger.querySelectorAll(".hamburger-line");
    if (lines.length >= 2 && !isMobileMenuOpen) {
      gsap.set(lines[0], { rotation: 0, y: 0 });
      gsap.set(lines[1], { rotation: 0, y: 0 });
    }
  }, [isMobileMenuOpen, location.pathname, lenis, windowWidth]);

  const handleResumeClick = (e) => {
    e.preventDefault();
    window.open(RESUME_URL, "_blank", "noopener,noreferrer");
  };

  useEffect(() => {
    return () => {
      document.body.classList.remove("mobile-menu-open");
      lenis?.start();
    };
  }, [lenis]);

  const toggleMobileMenu = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);

    const hamburger = hamburgerRef.current;
    const menu = mobileMenuRef.current;

    if (newState) {
      document.body.classList.add("mobile-menu-open");
      lenis?.stop();
    } else {
      document.body.classList.remove("mobile-menu-open");
      lenis?.start();
    }

    if (hamburger) {
      if (newState) {
        gsap.set(hamburger, { opacity: 1, scale: 1, zIndex: 1000 });
        hamburger.style.pointerEvents = "auto";
      }

      const lines = hamburger.querySelectorAll(".hamburger-line");
      if (newState) {
        gsap.to(lines[0], {
          rotation: 45,
          y: 3,
          duration: 0.3,
          ease: "power3.easeOut",
        });
        gsap.to(lines[1], {
          rotation: -45,
          y: -3,
          duration: 0.3,
          ease: "power3.easeOut",
        });
      } else {
        gsap.to(lines[0], {
          rotation: 0,
          y: 0,
          duration: 0.3,
          ease: "power3.easeOut",
        });
        gsap.to(lines[1], {
          rotation: 0,
          y: 0,
          duration: 0.3,
          ease: "power3.easeOut",
        });
      }
    }

    if (menu) {
      if (newState) {
        gsap.set(menu, { visibility: "visible", opacity: 1 });
        gsap.fromTo(
          menu,
          { y: "-100%" },
          {
            y: "0%",
            duration: 0.9,
            ease: "power3.easeOut",
          },
        );
      } else {
        gsap.to(menu, {
          y: "-100%",
          duration: 0.7,
          ease: "power3.easeOut",
          onComplete: () => {
            gsap.set(menu, { visibility: "hidden" });
          },
        });
      }
    }
  };

  const renderNavItem = (item, i) => {
    const pillProps = {
      className: `pill${isNavItemActive(item) ? " pill-active" : ""}`,
    };

    const pillInner = (
      <>
        <span className="pill-active-dot" aria-hidden="true" />
        <span className="label-stack">{renderPillLabel(item)}</span>
      </>
    );

    if (item.label === "resume") {
      return (
        <li key={`item-${i}`}>
          <a
            href={RESUME_URL}
            target="_blank"
            rel="noopener noreferrer"
            {...pillProps}
            onClick={handleResumeClick}
          >
            {pillInner}
          </a>
        </li>
      );
    }

    if (!item.isLink) {
      return (
        <li key={`item-${i}`}>
          <button type="button" {...pillProps}>
            {pillInner}
          </button>
        </li>
      );
    }

    return (
      <li key={item.href || `item-${i}`}>
        <Link to={item.href} {...pillProps}>
          {pillInner}
        </Link>
      </li>
    );
  };

  return (
    <nav
      ref={navRef}
      className={`site-nav top-0 z-[100] relative${
        navRevealed ? " is-revealed" : ""
      }${isMobileMenuOpen ? " is-menu-open" : ""}`}
    >
      <div className="page-content-shell">
        <div className="nav-bar-row flex items-center py-5 z-[1001] relative min-h-[32px]">
          {/* Mobile: compact logo on the left, hamburger on the right */}
          <Link
            to="/"
            onClick={handleLogoClick}
            className="logo-link mobile-only"
            aria-label="Home"
          >
            <img
              src={isMobileMenuOpen ? LightDKLogo : DarkDKLogo}
              alt="DK logo"
              className="logo-image"
            />
          </Link>

          {/* Desktop: single row with the logo centered among the links */}
          <ul className="pill-list desktop-only" ref={navItemsRef}>
            {renderNavItem(navItems[0], 0)}
            {renderNavItem(navItems[1], 1)}
            <li className="logo-item">
              <Link
                to="/"
                onClick={handleLogoClick}
                className="logo-link"
                aria-label="Home"
              >
                <img
                  src={isMobileMenuOpen ? LightDKLogo : DarkDKLogo}
                  alt="DK logo"
                  className="logo-image"
                />
              </Link>
            </li>
            {renderNavItem(navItems[2], 2)}
            {renderNavItem(navItems[3], 3)}
          </ul>

          <button
            className={`mobile-menu-button ${
              isMobileMenuOpen ? "menu-open" : ""
            }`}
            onClick={toggleMobileMenu}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-site-menu"
            ref={hamburgerRef}
          >
            <span className="hamburger-line" />
            <span className="hamburger-line" />
          </button>
        </div>
      </div>
      <div
        id="mobile-site-menu"
        className="mobile-menu-popover"
        ref={mobileMenuRef}
      >
        <ul className="mobile-menu-list">
          {mobileNavItems.map((item, i) => {
            if (item.isLogo) {
              return (
                <li key="mobile-dk">
                  <Link
                    to="/"
                    className="mobile-menu-link mobile-menu-logo"
                    aria-label="Home"
                    onClick={(e) => {
                      handleLogoClick(e);
                      setIsMobileMenuOpen(false);
                      toggleMobileMenu();
                    }}
                  >
                    <img src={LightDKLogo} alt="DK logo" className="logo-image" />
                  </Link>
                </li>
              );
            }

            if (item.label === "resume") {
              return (
                <li key={`mobile-item-${i}`}>
                  <a
                    href={RESUME_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mobile-menu-link"
                    onClick={(e) => {
                      handleResumeClick(e);
                      setIsMobileMenuOpen(false);
                      toggleMobileMenu();
                    }}
                  >
                    {item.label}
                  </a>
                </li>
              );
            }

            if (!item.isLink) {
              return (
                <li key={`mobile-item-${i}`}>
                  <button
                    type="button"
                    className="mobile-menu-link"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      toggleMobileMenu();
                    }}
                  >
                    {item.label}
                  </button>
                </li>
              );
            }

            return (
              <li key={item.href || `mobile-item-${i}`}>
                <Link
                  to={item.href}
                  className={`mobile-menu-link${isNavItemActive(item) ? " mobile-menu-link-active" : ""}`}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    toggleMobileMenu();
                  }}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};

export default Nav;
