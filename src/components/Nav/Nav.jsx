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
  const menuOpenRef = useRef(false);
  const menuClosingRef = useRef(false);

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
    menuOpenRef.current = false;
    menuClosingRef.current = false;
    document.body.classList.remove("mobile-menu-open");
    lenis?.start();
    const menu = mobileMenuRef.current;
    if (menu) {
      gsap.killTweensOf(menu);
      gsap.set(menu, { visibility: "hidden", opacity: 0, y: "-8%" });
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
      gsap.set(menu, { visibility: "hidden", opacity: 0, y: "-8%" });
    }
  }, []);

  useEffect(() => {
    const hamburger = hamburgerRef.current;
    if (!hamburger) return undefined;
    const lines = hamburger.querySelectorAll(".hamburger-line");
    if (lines.length) gsap.set(lines, { clearProps: "transform,rotation,y" });
    return undefined;
  }, []);

  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (windowWidth <= 768 || !isMobileMenuOpen) return;
    setIsMobileMenuOpen(false);
    menuOpenRef.current = false;
    menuClosingRef.current = false;
    lenis?.start();
    document.body.classList.remove("mobile-menu-open");
    const menu = mobileMenuRef.current;
    if (menu) {
      gsap.killTweensOf(menu);
      gsap.set(menu, { visibility: "hidden", opacity: 0, y: "-8%" });
    }
  }, [windowWidth, isMobileMenuOpen, lenis]);

  // On desktop: always show nav items and keep hamburger hidden (no scroll collapse).
  // On small screens, CSS handles collapse via .desktop-only / .mobile-only.
  useEffect(() => {
    const isDesktop = windowWidth > 768;
    const hamburger = hamburgerRef.current;

    if (!isDesktop) {
      if (hamburger) {
        gsap.set(hamburger, { clearProps: "opacity,transform,scale" });
        hamburger.style.pointerEvents = "auto";
      }
      return;
    }

    const navItems = navItemsRef.current?.children;

    if (!navItems || navItems.length === 0 || !hamburger) return;

    gsap.set(navItems, { x: 0, opacity: 1 });
    Array.from(navItems).forEach((item) => {
      item.style.pointerEvents = "auto";
    });
    gsap.set(hamburger, { opacity: 0, scale: 0.8, display: "flex" });
    hamburger.style.pointerEvents = "none";
  }, [isMobileMenuOpen, location.pathname, lenis, windowWidth]);

  const handleResumeClick = (e) => {
    e.preventDefault();
    window.open(RESUME_URL, "_blank", "noopener,noreferrer");
  };

  useEffect(() => {
    return () => {
      const menu = mobileMenuRef.current;
      if (menu) gsap.killTweensOf(menu);
      document.body.classList.remove("mobile-menu-open");
      lenis?.start();
    };
  }, [lenis]);

  const prefersReducedMotion = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const openMobileMenu = () => {
    const menu = mobileMenuRef.current;
    if (!menu) return;

    menuClosingRef.current = false;
    menuOpenRef.current = true;
    setIsMobileMenuOpen(true);
    document.body.classList.add("mobile-menu-open");
    lenis?.stop();
    gsap.killTweensOf(menu);
    gsap.set(menu, { visibility: "visible" });

    const hamburger = hamburgerRef.current;
    if (hamburger) {
      gsap.set(hamburger, { opacity: 1, scale: 1, zIndex: 1100 });
      hamburger.style.pointerEvents = "auto";
    }

    if (prefersReducedMotion()) {
      gsap.set(menu, { y: "0%", opacity: 1 });
      return;
    }

    gsap.to(menu, {
      y: "0%",
      opacity: 1,
      duration: 0.72,
      ease: "power3.out",
      overwrite: true,
    });
  };

  const closeMobileMenu = (afterClose) => {
    const menu = mobileMenuRef.current;

    const finish = () => {
      menuClosingRef.current = false;
      menuOpenRef.current = false;
      if (menu) {
        gsap.set(menu, { visibility: "hidden", y: "-8%", opacity: 0 });
      }
      setIsMobileMenuOpen(false);
      document.body.classList.remove("mobile-menu-open");
      lenis?.start();
      afterClose?.();
    };

    if (!menuOpenRef.current && !isMobileMenuOpen) {
      afterClose?.();
      return;
    }

    if (menuClosingRef.current && !afterClose) return;

    menuClosingRef.current = true;
    if (!menu || prefersReducedMotion()) {
      finish();
      return;
    }

    gsap.killTweensOf(menu);
    gsap.to(menu, {
      y: "-8%",
      opacity: 0,
      duration: 0.56,
      ease: "power3.in",
      overwrite: true,
      onComplete: finish,
    });
  };

  const toggleMobileMenu = () => {
    if (menuClosingRef.current) {
      openMobileMenu();
      return;
    }
    if (menuOpenRef.current || isMobileMenuOpen) {
      closeMobileMenu();
      return;
    }
    openMobileMenu();
  };

  const closeThenGo = (href) => {
    closeMobileMenu(() => {
      if (href === "/") {
        if (isHomePath(location.pathname)) {
          window.history.pushState(null, "", location.pathname);
          scrollToTop({ duration: 1.2 });
          return;
        }
        navigate("/");
        setTimeout(() => scrollToTop({ duration: 1.2 }), 100);
        return;
      }
      if (href !== location.pathname) navigate(href);
    });
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
                      e.preventDefault();
                      closeThenGo("/");
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
                      closeMobileMenu();
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
                      closeMobileMenu();
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
                  onClick={(e) => {
                    e.preventDefault();
                    closeThenGo(item.href);
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
