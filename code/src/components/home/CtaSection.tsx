import { Link } from "react-router-dom";

export const CtaSection = () => (
  <section className="cta-section" id="cta">
    <div>
      <span className="section-heading__eyebrow">Ready to launch</span>
      <h2>Start with a creator account or explore as a visitor.</h2>
      <p>
        The system is structured so you can add feeds, media, payments, chat, and moderation
        later without rewriting the auth and profile core.
      </p>
    </div>

    <div className="cta-section__actions">
      <Link className="solid-button solid-button--large" to="/signup">
        Create Account
      </Link>
      <Link className="ghost-button ghost-button--large" to="/login">
        Sign In
      </Link>
    </div>
  </section>
);
