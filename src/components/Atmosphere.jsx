import { useEffect, useRef } from "react";

/**
 * Atmosphere — a fixed ambient layer of slow-drifting ember light that reacts
 * faintly to scroll, so the dark ground feels alive beneath every section.
 * Pure CSS animation; the scroll hook only nudges a hue variable.
 */
export default function Atmosphere() {
  const ref = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const p = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight || 1);
        ref.current?.style.setProperty("--p", p.toFixed(3));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, []);

  return (
    <div className="atmos" ref={ref} aria-hidden="true">
      <span className="atmos__orb atmos__orb--a" />
      <span className="atmos__orb atmos__orb--b" />
      <span className="atmos__orb atmos__orb--c" />
      <span className="atmos__grid" />
      <span className="atmos__vignette" />
    </div>
  );
}
