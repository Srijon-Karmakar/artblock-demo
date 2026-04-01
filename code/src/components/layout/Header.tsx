import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  fetchUnreadMessageCount,
  fetchUnreadNotificationsCount
} from "../../lib/profile";
import { getSupabaseClient } from "../../lib/supabase";
import { useAuth } from "../../providers/AuthProvider";
import logo from "../../public/logo/logo.png";

const marketingNavLinks = [{ label: "Home", to: "/" }];

const marketingAnchorLinks = [
  { label: "About", href: "#about" },
  { label: "Features", href: "#features" }
];

export const Header = () => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const { status, profile, signOut, user } = useAuth();
  const homeTarget = status === "authenticated" ? "/feed" : "/";

  useEffect(() => {
    const supabase = getSupabaseClient();

    if (!supabase || !user?.id || status !== "authenticated") {
      setUnreadMessageCount(0);
      return;
    }

    const refreshUnreadCount = async () => {
      const [messageResult, notificationResult] = await Promise.all([
        fetchUnreadMessageCount(user.id),
        fetchUnreadNotificationsCount(user.id)
      ]);

      if (!messageResult.error) {
        setUnreadMessageCount(messageResult.data);
      }

      if (!notificationResult.error) {
        setUnreadNotificationCount(notificationResult.data);
      }
    };

    void refreshUnreadCount();

    const channel = supabase
      .channel(`header-unread-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "direct_thread_members",
          filter: `user_id=eq.${user.id}`
        },
        () => {
          void refreshUnreadCount();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `recipient_id=eq.${user.id}`
        },
        () => {
          void refreshUnreadCount();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [status, user?.id]);

  return (
    <header className="site-header">
      <div className="site-header__surface">
        <div className="site-header__left">
          <Link className="brand-mark" to={homeTarget}>
            <img alt="ArtBlock" className="brand-mark__image" src={logo} />
          </Link>

          {status === "authenticated" ? (
            <span className="site-header__badge">
              {profile?.role === "creator" ? "Creator Mode" : "Visitor Mode"}
            </span>
          ) : (
            <span className="site-header__badge">Global Nav</span>
          )}
        </div>

        <button
          className="menu-toggle"
          aria-expanded={isMenuOpen}
          aria-label="Toggle navigation"
          onClick={() => setMenuOpen((current) => !current)}
          type="button"
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`site-nav ${isMenuOpen ? "site-nav--open" : ""}`}>
          {status === "authenticated" ? (
            <>
              <NavLink
                className={({ isActive }) =>
                  `site-nav__link ${isActive ? "site-nav__link--active" : ""}`
                }
                onClick={() => setMenuOpen(false)}
                to="/feed"
              >
                Feed
              </NavLink>
              <NavLink
                className={({ isActive }) =>
                  `site-nav__link ${isActive ? "site-nav__link--active" : ""}`
                }
                onClick={() => setMenuOpen(false)}
                to="/notifications"
              >
                Notifications
                {unreadNotificationCount > 0 ? (
                  <span className="site-nav__badge">
                    {unreadNotificationCount > 99 ? "99+" : unreadNotificationCount}
                  </span>
                ) : null}
              </NavLink>
              <NavLink
                className={({ isActive }) =>
                  `site-nav__link ${isActive ? "site-nav__link--active" : ""}`
                }
                onClick={() => setMenuOpen(false)}
                to="/messages"
              >
                Messages
                {unreadMessageCount > 0 ? (
                  <span className="site-nav__badge">
                    {unreadMessageCount > 99 ? "99+" : unreadMessageCount}
                  </span>
                ) : null}
              </NavLink>
              <NavLink
                className={({ isActive }) =>
                  `site-nav__link ${isActive ? "site-nav__link--active" : ""}`
                }
                onClick={() => setMenuOpen(false)}
                to="/dashboard"
              >
                {profile?.role === "creator" ? "Studio" : "Account"}
              </NavLink>
              <NavLink
                className={({ isActive }) =>
                  `site-nav__link ${isActive ? "site-nav__link--active" : ""}`
                }
                onClick={() => setMenuOpen(false)}
                to="/"
              >
                Landing
              </NavLink>

              <div className="site-nav__actions">
                <button
                  className="solid-button"
                  onClick={() => {
                    setMenuOpen(false);
                    void signOut();
                  }}
                  type="button"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              {marketingNavLinks.map((item) => (
                <NavLink
                  className={({ isActive }) =>
                    `site-nav__link ${isActive ? "site-nav__link--active" : ""}`
                  }
                  key={item.label}
                  onClick={() => setMenuOpen(false)}
                  to={item.to}
                >
                  {item.label}
                </NavLink>
              ))}

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
                <NavLink className="ghost-button" onClick={() => setMenuOpen(false)} to="/login">
                  Login
                </NavLink>
                <NavLink className="solid-button" onClick={() => setMenuOpen(false)} to="/signup">
                  Get Started
                </NavLink>
              </div>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};
