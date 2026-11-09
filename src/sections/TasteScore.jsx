import { useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TASTE_BANDS } from "../data/content.js";
import "./TasteScore.css";

function bandFor(score) {
  let b = TASTE_BANDS[0];
  for (const t of TASTE_BANDS) if (score >= t.min) b = t;
  return b;
}

export default function TasteScore() {
  const [score, setScore] = useState(72);
  const band = useMemo(() => bandFor(score), [score]);

  const R = 128;
  const C = 2 * Math.PI * R;
  const dash = C * (score / 100);
  const glow = 0.25 + (score / 100) * 0.75;

  return (
    <section className="ts section-y" id="taste" style={{ "--glow": glow }}>
      <div className="ts__ember" aria-hidden="true" />
      <div className="shell ts__grid">
        <div className="ts__intro">
          <span className="eyebrow">The taste score</span>
          <h2 className="ts__title display">
            One number for<br />how good it <em>really</em> was.
          </h2>
          <p className="ts__copy">
            Forget stars and crowd averages. Dishrated is a single, honest 0–100 —
            your palate, your scale. The full app weighs it against health and cost.
            Drag it. Feel the memory change.
          </p>
          <p className="ts__note meta">Interactive demo — nothing is saved.</p>
        </div>

        <div className="ts__instrument">
          <div className="ts__dial" data-cursor="drag">
            <svg viewBox="0 0 300 300" aria-hidden="true">
              <circle cx="150" cy="150" r={R} className="ts__track" />
              <circle
                cx="150" cy="150" r={R}
                className="ts__fill"
                style={{ strokeDasharray: `${dash} ${C}` }}
              />
            </svg>
            <div className="ts__readout">
              <span className="ts__num dial">{score}</span>
              <span className="ts__den meta">out of 100</span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={band.label}
              className="ts__feedback"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
            >
              <span className="ts__band">{band.label}</span>
              <span className="ts__caption">{band.caption}</span>
            </motion.div>
          </AnimatePresence>

          <div className="ts__slider">
            <input
              id="taste-range"
              type="range"
              min="0" max="100"
              value={score}
              aria-label="Taste score"
              onChange={(e) => setScore(Number(e.target.value))}
              style={{ "--pct": `${score}%` }}
            />
            <div className="ts__ticks meta">
              <span>0</span><span>25</span><span>50</span><span>75</span><span>100</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
