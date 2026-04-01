import { Link } from "react-router-dom";

export const HeroSection = () => (
  <section className="hero-section">
    <div className="hero-section__copy">
      <span className="hero-badge">Launch-ready creator platform</span>
      <h1>Build a cleaner connection between visitors and creators.</h1>
      <p>
        ArtBlock gives creators a focused home for identity, access, and audience conversion while
        visitors get a fast, minimal experience designed for mobile first use.
      </p>
      <div className="hero-section__actions">
        <Link className="solid-button solid-button--large" to="/signup">
          Start as Creator
        </Link>
        <Link className="ghost-button ghost-button--large" to="/login">
          Visitor Login
        </Link>
      </div>
    </div>

    <div className="hero-card">
      <div className="hero-card__row">
        <span>Profile Completion</span>
        <strong>92%</strong>
      </div>
      <div className="hero-card__meter">
        <span />
      </div>
      <div className="hero-card__stats">
        <article>
          <span>New Supporters</span>
          <strong>+148</strong>
        </article>
        <article>
          <span>Response Time</span>
          <strong>2.1h</strong>
        </article>
      </div>
      <div className="hero-card__panel">
        <p>Creator mode</p>
        <strong>Audience insights, profile control, and direct conversion paths.</strong>
      </div>
    </div>
  </section>
);
