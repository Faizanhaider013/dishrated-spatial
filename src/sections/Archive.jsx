import { useRef, useState, useEffect } from "react";
import SmartImage from "../components/SmartImage.jsx";
import Tilt from "../components/Tilt.jsx";
import { MEALS, img } from "../data/content.js";
import "./Archive.css";

export default function Archive() {
  const trackRef = useRef(null);
  const [progress, setProgress] = useState(0);

  // progress bar
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const onScroll = () => {
      const max = el.scrollWidth - el.clientWidth;
      setProgress(max > 0 ? el.scrollLeft / max : 0);
    };
    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // click-drag to scroll (desktop)
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let down = false, startX = 0, startLeft = 0, moved = false;
    const onDown = (e) => {
      if (e.pointerType === "touch") return;
      down = true; moved = false;
      startX = e.clientX; startLeft = el.scrollLeft;
      el.setPointerCapture?.(e.pointerId);
      el.classList.add("is-dragging");
    };
    const onMove = (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      el.scrollLeft = startLeft - dx;
    };
    const onUp = () => { down = false; el.classList.remove("is-dragging"); };
    const onClick = (e) => { if (moved) { e.preventDefault(); } };
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    el.addEventListener("click", onClick, true);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("click", onClick, true);
    };
  }, []);

  return (
    <section className="archive section-y" id="archive">
      <div className="shell archive__head">
        <div>
          <span className="eyebrow">The vault</span>
          <h2 className="archive__title display">
            Every plate<br />worth <em>keeping.</em>
          </h2>
        </div>
        <div className="archive__intro">
          <p>
            Not a feed. Not reviews. A private collection of the meals you actually
            want to remember — scored, annotated, and ready to order again.
          </p>
          <button
            className="archive__museum"
            type="button"
            onClick={() => window.dispatchEvent(new Event("open-museum"))}
            data-cursor="enter"
          >
            <span className="archive__museum-ic" aria-hidden="true">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M5 21V10l7-5 7 5v11M9 21v-6h6v6" /></svg>
            </span>
            Enter the 3D museum
            <svg className="arrow" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </button>
        </div>
      </div>

      <div className="archive__track" ref={trackRef} data-cursor="drag" role="list" aria-label="Saved meals">
        <div className="archive__pad" aria-hidden="true" />
        {MEALS.map((m, i) => (
          <article className="spec" key={m.id} role="listitem">
            <Tilt className="spec__fig">
              <SmartImage src={img(m.photo, 760)} alt={`${m.name} at ${m.place}, ${m.city}`} tint={m.tint} />
              <span className="spec__no meta">Nº {String(i + 1).padStart(2, "0")}</span>
              <span className="spec__score">
                <b className="dial">{m.taste}</b>
                <small className="meta">taste</small>
              </span>
              {m.again && <span className="spec__again meta">↺ Order again</span>}
            </Tilt>
            <div className="spec__body">
              <div className="spec__meta meta">
                <span>{m.place} · {m.city}</span>
                <span>{m.date}</span>
              </div>
              <h3 className="spec__name">{m.name}</h3>
              <p className="spec__best">
                <span className="meta">Best bite</span>
                “{m.best}”
              </p>
              <div className="spec__scores">
                <Bar label="Health" v={m.health} />
                <Bar label="Cost" v={m.cost} />
              </div>
            </div>
          </article>
        ))}
        <div className="archive__pad" aria-hidden="true" />
      </div>

      <div className="shell archive__rail" aria-hidden="true">
        <span className="archive__rail-fill" style={{ transform: `scaleX(${progress})` }} />
      </div>
    </section>
  );
}

function Bar({ label, v }) {
  return (
    <div className="bar">
      <span className="bar__l meta">{label}</span>
      <span className="bar__t"><span style={{ width: `${v}%` }} /></span>
      <span className="bar__v dial">{v}</span>
    </div>
  );
}
