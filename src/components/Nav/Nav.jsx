import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { useLenis } from "@studio-freight/react-lenis";
import { useLenisScroll } from "../../hooks/useLenisScroll";
import { LANDING_NAV_DELAY, LANDING_NAV_DURATION } from "../../constants/navTiming";
import {
  isHomePath,
  isGoogleCreativePath,
  isDefaultHomePath,
} from "../../constants/homeRoutes";
import "./Nav.css";
import DarkDKLogo from "../../assets/img/DarkDKLogo.png";
import LightDKLogo from "../../assets/img/LightDKLogo.png";

const Nav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const lenis = useLenis();
  const { scrollToTop } = useLenisScroll();
  const circleRefs = useRef([]);
  const tlRefs = useRef([]);
  const activeTweenRefs = useRef([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 1024,
  );
  const hamburgerRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const navItemsRef = useRef(null);
  const navRef = useRef(null);

  const RESUME_URL =
    "https://drive.google.com/file/d/1t8BBP__xqK7TDSD1hLv0WFaMLLgeufTK/view?usp=sharing";

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
    <>
      <span className="pill-label">{item.label}</span>
      <span className="pill-label-hover" aria-hidden="true">
        {item.label}
      </span>
    </>
  );

  // Nav fade-in: same timing on all non–case-study pages; case studies show nav immediately
  const CASE_STUDY_PATHS = [
    "/public-future-arts-lab",
    "/sitehub-2",
    "/parkwise",
    "/trojanstep",
  ];
  const NAV_FADE_DELAY = isDefaultHomePath(location.pathname)
    ? LANDING_NAV_DELAY
    : 0.5;

  useEffect(() => {
    if (!navRef.current) return;

    const path = location.pathname;
    const isListingPage = path === "/work" || path === "/play";
    const isCaseStudyPage = CASE_STUDY_PATHS.includes(path);

    // Set initial state - position above viewport
    gsap.set(navRef.current, {
      y: -100,
      opacity: 0,
    });

    // Work / Play: let the page component control the navbar animation
    if (isListingPage) {
      return;
    }

    // Case study pages: show nav immediately (no fade-in)
    if (isCaseStudyPage) {
      gsap.set(navRef.current, { y: 0, opacity: 1 });
      return;
    }

    // All other pages (home, not-found): unified fade-in timing
    const navTl = gsap.timeline({
      defaults: { ease: "power2.out" },
    });

    navTl.to(navRef.current, {
      y: 0,
      opacity: 1,
      duration: LANDING_NAV_DURATION,
      ease: "power2.out",
      delay: NAV_FADE_DELAY,
    });

    return () => {
      navTl.kill();
    };
  }, [location.pathname]);

  useEffect(() => {
    const layout = () => {
      const isDesktop = window.innerWidth > 768;

      circleRefs.current.forEach((circle, index) => {
        if (!circle?.parentElement) return;

        const pill = circle.parentElement;
        const rect = pill.getBoundingClientRect();
        const { width: w, height: h } = rect;
        const R = ((w * w) / 4 + h * h) / (2 * h);
        const D = Math.ceil(2 * R) + 2;
        const delta =
          Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
        const originY = D - delta;
        // On desktop the pills are flat text (no visible pill background),
        // so the hover circle is only relevant on mobile.
        const shouldAnimateCircle = !isDesktop;

        if (shouldAnimateCircle) {
          circle.style.width = `${D}px`;
          circle.style.height = `${D}px`;
          circle.style.bottom = `-${delta}px`;

          gsap.set(circle, {
            xPercent: -50,
            scale: 0,
            transformOrigin: `50% ${originY}px`,
          });
        } else {
          gsap.set(circle, {
            opacity: 0,
            scale: 0,
            display: "none",
          });
        }

        const label = pill.querySelector(".pill-label");
        const white = pill.querySelector(".pill-label-hover");

        if (label) gsap.set(label, { y: 0 });
        if (white) gsap.set(white, { y: h + 12, opacity: 0 });

        tlRefs.current[index]?.kill();
        const tl = gsap.timeline({ paused: true });

        if (shouldAnimateCircle) {
          tl.to(
            circle,
            {
              scale: 1.2,
              xPercent: -50,
              duration: 2,
              ease: "power1.easeOut",
              overwrite: "auto",
            },
            0,
          );
        }

        if (label) {
          tl.to(
            label,
            {
              y: -(h + 8),
              duration: 2,
              ease: "power1.easeOut",
              overwrite: "auto",
            },
            0,
          );
        }

        if (white) {
          gsap.set(white, { y: Math.ceil(h + 100), opacity: 0 });
          tl.to(
            white,
            {
              y: 0,
              opacity: 1,
              duration: 2,
              ease: "power1.easeOut",
              overwrite: "auto",
            },
            0,
          );
        }

        tlRefs.current[index] = tl;
      });
    };

    layout();

    const onResize = () => layout();
    window.addEventListener("resize", onResize);

    if (document.fonts?.ready) {
      document.fonts.ready.then(layout).catch(() => {});
    }

    const menu = mobileMenuRef.current;
    if (menu) {
      gsap.set(menu, { visibility: "hidden", opacity: 0, y: "-100%" });
    }

    return () => window.removeEventListener("resize", onResize);
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

  const handleEnter = (i) => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(tl.duration(), {
      duration: 0.3,
      ease: "power3.easeOut",
      overwrite: "auto",
    });
  };

  const handleLeave = (i) => {
    if (isGoogleCreativePath(location.pathname)) return;
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(0, {
      duration: 0.2,
      ease: "power3.easeOut",
      overwrite: "auto",
    });
  };

  const handleResumeClick = (e) => {
    e.preventDefault();
    window.open(RESUME_URL, "_blank", "noopener,noreferrer");
  };

  useEffect(() => {
    return () => {
      if (isMobileMenuOpen) {
        if (lenis) {
          lenis.start();
        } else {
          document.body.classList.remove("mobile-menu-open");
        }
      }
    };
  }, [isMobileMenuOpen, lenis]);

  const toggleMobileMenu = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);

    const hamburger = hamburgerRef.current;
    const menu = mobileMenuRef.current;

    if (newState) {
      if (lenis) {
        lenis.stop();
      } else {
        document.body.classList.add("mobile-menu-open");
      }
    } else {
      if (lenis) {
        lenis.start();
      } else {
        document.body.classList.remove("mobile-menu-open");
      }
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
      onMouseEnter: () => handleEnter(i),
      onMouseLeave: () => handleLeave(i),
    };

    const pillInner = (
      <>
        <span
          className="hover-circle"
          aria-hidden="true"
          ref={(el) => {
            circleRefs.current[i] = el;
          }}
        />
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
      className="site-nav top-0 z-[100] relative"
      style={{
        opacity: 0,
        transform: "translateY(-100px)",
      }}
    >
      <div className="page-content-shell">
        <div className="flex items-center py-5 z-[1000] relative min-h-[32px]">
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
            aria-label="Toggle menu"
            ref={hamburgerRef}
          >
            <span className="hamburger-line" />
            <span className="hamburger-line" />
          </button>
        </div>
      </div>
      <div className="mobile-menu-popover" ref={mobileMenuRef}>
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
