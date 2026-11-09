import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import MagneticButton from "../components/MagneticButton.jsx";
import { BRAND } from "../data/content.js";
import "./Nav.css";

// Buildwick-style header: logo · centered nav (with one featured gradient pill
// + one dropdown item) · gradient CTA.
const APP_DROP = [
  { label: "See the vault", href: "#product" },
  { label: "Open in browser", href: BRAND.appUrl, ext: true },
  { label: "iPhone beta", href: "#" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <header className={`nav ${scrolled ? "nav--solid" : ""}`}>
      <div className="shell nav__in">
        {/* logo */}
        <a href="#top" className="nav__brand" aria-label="Dishrated home">
          <span className="nav__mark" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2 15 9l7 .6-5.3 4.6L18.2 21 12 17l-6.2 4 1.5-6.8L2 9.6 9 9z" fill="currentColor"/></svg>
          </span>
          <span className="nav__word">Dishrated<span className="dot">.</span></span>
        </a>

        {/* centered nav */}
        <nav className="nav__center" aria-label="Primary">
          <a href="#top">Home</a>
          <a href="#archive">The Vault</a>
          <button type="button" className="nav__museum" onClick={() => window.dispatchEvent(new Event("open-museum"))}>Museum</button>
          {/* featured gradient pill */}
          <a href="#taste" className="nav__featured">
            <span className="nav__featured-ic" aria-hidden="true">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a9 9 0 1 0 9 9"/><path d="M12 12l5-3"/><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/></svg>
            </span>
            Taste 0–100
          </a>
          <a href="#ritual">The Ritual</a>
          {/* dropdown item */}
          <div className="nav__drop-wrap">
            <a href="#product" className="nav__drop-trigger">
              The App
              <svg className="nav__chev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </a>
            <div className="nav__drop">
              {APP_DROP.map((d) => (
                <a key={d.label} href={d.href} target={d.ext ? "_blank" : undefined} rel={d.ext ? "noreferrer" : undefined}>
                  {d.label}
                  {d.ext && <ExtArrow />}
                </a>
              ))}
            </div>
          </div>
        </nav>

        {/* right actions */}
        <div className="nav__actions">
          <MagneticButton as="a" className="nav__cta" href={BRAND.appUrl} target="_blank" rel="noreferrer" strength={0.35} data-cursor="open">
            Get Started <Arrow />
          </MagneticButton>
          <button className="nav__burger" onClick={() => setOpen((v) => !v)} aria-label="Menu" aria-expanded={open}>
            <span data-open={open} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="nav__sheet"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: [0.22, 0.61, 0.36, 1] }}
          >
            <a href="#top" onClick={() => setOpen(false)}>Home</a>
            <a href="#archive" onClick={() => setOpen(false)}>The Vault</a>
            <button type="button" className="nav__sheet-museum" onClick={() => { setOpen(false); window.dispatchEvent(new Event("open-museum")); }}>The Museum</button>
            <a href="#taste" className="nav__sheet-feat" onClick={() => setOpen(false)}>Taste 0–100</a>
            <a href="#ritual" onClick={() => setOpen(false)}>The Ritual</a>
            <a href="#product" onClick={() => setOpen(false)}>The App</a>
            <a className="nav__cta nav__sheet-cta" href={BRAND.appUrl} target="_blank" rel="noreferrer" onClick={() => setOpen(false)}>
              Get Started <Arrow />
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

const Arrow = () => (
  <svg className="arrow" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
const ExtArrow = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}><path d="M7 17 17 7M9 7h8v8" /></svg>
);
