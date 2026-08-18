import { Link } from "react-router-dom";
import { EBOOK } from "../data/catalog.js";

export default function Header() {
  return (
    <header className="hero">
      <div className="hero-inner">
        <p className="eyebrow-light">{EBOOK.kicker}</p>
        <Link to="/page/1" className="brand-title">
          {EBOOK.title}
        </Link>
        <p className="tagline">{EBOOK.subtitle}</p>
      </div>
    </header>
  );
}
