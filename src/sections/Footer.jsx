import MagneticButton from "../components/MagneticButton.jsx";
import { BRAND, FOOTER } from "../data/content.js";
import "./Footer.css";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="ft">
      <div className="shell">
        <div className="ft__top">
          <div className="ft__lead">
            <p className="ft__tag display">{BRAND.tagline}</p>
            <MagneticButton as="a" className="btn btn-amber ft__cta" href={BRAND.appUrl} target="_blank" rel="noreferrer" data-cursor="open">
              Open the App <Arrow />
            </MagneticButton>
          </div>
          <nav className="ft__cols" aria-label="Footer">
            <div className="ft__col">
              <h4 className="meta">Product</h4>
              {FOOTER.product.map((l) => (
                <a key={l.label} href={l.href} target={l.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">{l.label}</a>
              ))}
            </div>
            <div className="ft__col">
              <h4 className="meta">More</h4>
              {FOOTER.more.map((l) => (<a key={l.label} href={l.href}>{l.label}</a>))}
            </div>
            <div className="ft__col ft__note">
              <h4 className="meta">The idea</h4>
              <p>You remember the restaurant. Dishrated helps you remember the dish — the taste, the detail, the one worth ordering again.</p>
            </div>
          </nav>
        </div>

        <div className="ft__mark" aria-hidden="true">Dishrated<span>.</span></div>

        <div className="ft__bar">
          <span className="meta">© {year} {BRAND.name}. All plates preserved.</span>
          <span className="meta">Made for the forgetful gourmand</span>
        </div>
      </div>
    </footer>
  );
}

const Arrow = () => (
  <svg className="arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
