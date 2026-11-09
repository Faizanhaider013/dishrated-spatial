import Reveal from "../components/Reveal.jsx";
import { NOTES } from "../data/content.js";
import "./Details.css";

const TILT = [-2.4, 1.6, -1, 2.3, -1.8, 1.2];

export default function Details() {
  return (
    <section className="dt section-y">
      <div className="shell dt__grid">
        <aside className="dt__intro">
          <span className="eyebrow">Remember the details</span>
          <h2 className="dt__title display">
            The little notes<br />that bring it<br /><em>all back.</em>
          </h2>
          <p className="dt__copy">
            A dish is more than a name. It's the best bite, the fix for next time,
            the occasion. Dishrated keeps those lines exactly as you wrote them —
            scars, scrawl, and all.
          </p>
        </aside>

        <div className="dt__wall">
          {NOTES.map((n, i) => (
            <Reveal
              key={i}
              className="note"
              delay={(i % 3) * 0.08}
              style={{ "--tilt": `${TILT[i % TILT.length]}deg` }}
            >
              <span className="note__pin" aria-hidden="true" />
              <p className="note__text">{n.text}</p>
              <span className="note__meta meta">{n.meta}</span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
