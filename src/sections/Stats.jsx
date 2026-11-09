import { useEffect, useRef, useState } from "react";
import { STATS } from "../data/content.js";
import "./Stats.css";

function useInView(threshold = 0.3) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) { setSeen(true); return; }
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, seen];
}

function Counter({ value, run }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!run) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setN(value); return; }
    let raf, start;
    const dur = 1600;
    const tick = (t) => {
      if (!start) start = t;
      const p = Math.min((t - start) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setN(Math.round(value * e));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, value]);
  return <>{n.toLocaleString("en-US")}</>;
}

export default function Stats() {
  const [ref, seen] = useInView();
  const [hero, ...rest] = STATS;

  return (
    <section className="st section-y" ref={ref}>
      <div className="shell st__shell">
        <div className="st__head">
          <span className="eyebrow">By the numbers</span>
          <h2 className="st__title display">A year of eating,<br /><em>remembered.</em></h2>
          <p className="st__intro">One person's vault, twelve months in. Yours starts at zero tonight.</p>
        </div>

        <div className="st__body">
          {/* featured */}
          <div className="st__feature">
            <span className="st__fnum">
              <Counter value={hero.v} run={seen} />{hero.suffix}
            </span>
            <span className="st__flabel">{hero.label}</span>
            <span className="st__fsub meta">{hero.sub}</span>
            <span className="st__watermark dial" aria-hidden="true">{hero.v}</span>
          </div>

          {/* list */}
          <ul className="st__list">
            {rest.map((s, i) => (
              <li className="st__row" key={i}>
                <span className="st__rnum dial">
                  <Counter value={s.v} run={seen} />{s.suffix}
                </span>
                <span className="st__rtext">
                  <span className="st__rlabel">{s.label}</span>
                  <span className="st__rsub meta">{s.sub}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
