import { Link } from "react-router-dom";
import logo from "../../public/logo/logo.png";

export const Footer = () => (
  <footer className="site-footer">
    <div>
      <Link className="site-footer__brand" to="/">
        <img alt="ArtBlock" className="site-footer__brand-image" src={logo} />
      </Link>
      <p>Mobile-first creator engagement with a minimal, production-ready baseline.</p>
    </div>
    <div className="site-footer__meta">
      <a href="#about">About</a>
      <a href="#features">Features</a>
      <a href="#cta">Join</a>
    </div>
  </footer>
);
