import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../providers/AuthProvider";
import logo from "../../public/logo/logo.png";

const marketingAnchorLinks = [
  { label: "About", href: "#about" },
  { label: "Features", href: "#features" }
];

export const Header = () => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isLandingScrolled, setLandingScrolled] = useState(false);
  const { status, profile, signOut, user } = useAuth();
  const location = useLocation();
  const homeTarget = status === "authenticated" ? "/feed" : "/";
  const isAuthed = status === "authenticated";
  const isLanding = !isAuthed && location.pathname === "/";

  useEffect(() => {
    if (!isLanding) {
      setLandingScrolled(false);
      return undefined;
    }

    const handleScroll = () => {
      setLandingScrolled(window.scrollY > 18);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isLanding]);

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  return (
    <header
      className={`site-header${isAuthed ? " site-header--authed" : ""}${
        isLanding ? " site-header--landing" : ""
      }${
        isLanding && isLandingScrolled ? " site-header--landing-scrolled" : ""
      }`}
    >
      <div className="site-header__surface">
        <div className="site-header__left">
          <Link className="brand-mark" to={homeTarget}>
            <img alt="ArtBlock" className="brand-mark__image" src={logo} />
          </Link>
          {!isAuthed && (
            <span className="site-header__badge">Creator Platform</span>
          )}
        </div>

        {/* Mobile: authenticated users get an avatar link; unauthenticated get hamburger */}
        {isAuthed ? (
          <Link
            aria-label="Your profile"
            className="header-avatar-btn"
            to={`/profiles/${user?.id ?? ""}`}
          >
            {profile?.avatar_url ? (
              <img
                alt={profile.full_name}
                className="header-avatar-btn__img"
                src={profile.avatar_url}
              />
            ) : (
              <span className="header-avatar-btn__fallback">{initials}</span>
            )}
          </Link>
        ) : (
          <button
            aria-expanded={isMenuOpen}
            aria-label="Toggle navigation"
            className="menu-toggle"
            onClick={() => setMenuOpen((c) => !c)}
            type="button"
          >
            <span />
            <span />
            <span />
          </button>
        )}

        {/* Desktop nav for authenticated users (always visible via CSS, hidden on mobile) */}
        {isAuthed ? (
          <nav className="site-nav site-nav--desktop-only">
            <NavLink
              className={({ isActive }) =>
                `site-nav__link${isActive ? " site-nav__link--active" : ""}`
              }
              to="/feed"
            >
              Feed
            </NavLink>
            <NavLink
              className={({ isActive }) =>
                `site-nav__link${isActive ? " site-nav__link--active" : ""}`
              }
              to="/notifications"
            >
              Notifications
            </NavLink>
            <NavLink
              className={({ isActive }) =>
                `site-nav__link${isActive ? " site-nav__link--active" : ""}`
              }
              to="/messages"
            >
              Messages
            </NavLink>
            <NavLink
              className={({ isActive }) =>
                `site-nav__link${isActive ? " site-nav__link--active" : ""}`
              }
              to="/dashboard"
            >
              {profile?.role === "creator" ? "Studio" : "Account"}
            </NavLink>
            <div className="site-nav__actions">
              <button
                className="ghost-button"
                onClick={() => void signOut()}
                type="button"
              >
                Logout
              </button>
            </div>
          </nav>
        ) : (
          /* Marketing nav with hamburger dropdown */
          <nav className={`site-nav${isMenuOpen ? " site-nav--open" : ""}`}>
            <NavLink
              className={({ isActive }) =>
                `site-nav__link${isActive ? " site-nav__link--active" : ""}`
              }
              onClick={() => setMenuOpen(false)}
              to="/"
            >
              Home
            </NavLink>
            {marketingAnchorLinks.map((item) => (
              <a
                className="site-nav__link"
                href={item.href}
                key={item.label}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <div className="site-nav__actions">
              <NavLink
                className="ghost-button"
                onClick={() => setMenuOpen(false)}
                to="/login"
              >
                Login
              </NavLink>
              <NavLink
                className="solid-button"
                onClick={() => setMenuOpen(false)}
                to="/signup"
              >
                Get Started
              </NavLink>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};
