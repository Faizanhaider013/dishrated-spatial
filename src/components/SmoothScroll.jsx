import { useEffect } from "react";
import Lenis from "lenis";

/**
 * SmoothScroll — buttery inertia scrolling via Lenis.
 * Disabled entirely when the user prefers reduced motion, so the page
 * falls back to native scrolling.
 */
export default function SmoothScroll() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6,
    });

    let id;
    const raf = (time) => {
      lenis.raf(time);
      id = requestAnimationFrame(raf);
    };
    id = requestAnimationFrame(raf);

    // intercept in-page anchor links so they ease smoothly
    const onClick = (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const href = a.getAttribute("href");
      if (href === "#" || href.length < 2) return;
      const el = document.querySelector(href);
      if (el) {
        e.preventDefault();
        lenis.scrollTo(el, { offset: -70 });
      }
    };
    document.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(id);
      document.removeEventListener("click", onClick);
      lenis.destroy();
    };
  }, []);

  return null;
}
