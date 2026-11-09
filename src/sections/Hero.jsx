import { Suspense, lazy, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import MagneticButton from "../components/MagneticButton.jsx";
import { MEALS, BRAND } from "../data/content.js";
import "./Hero.css";

// 3D is heavy — load the R3F scene as its own chunk after the hero paints.
const PlateScene = lazy(() => import("../components/PlateScene.jsx"));

const LINES = [
  ["Some", "meals"],
  ["deserve", "a"],
  ["second", "life."],
];

export default function Hero() {
  const [focus, setFocus] = useState(MEALS[0]);
  return (
    <section className="hero" id="top">
      <div className="hero__canvas">
        <Suspense fallback={null}>
          <PlateScene dishes={MEALS} onFocus={setFocus} />
        </Suspense>
      </div>
      <div className="hero__veil" aria-hidden="true" />

      <AnimatePresence mode="wait">
        <motion.div
          className="hero__focus"
          key={focus.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          aria-hidden="true"
        >
          <span className="hero__focus-score dial">{focus.taste}</span>
          <span className="hero__focus-text">
            <span className="hero__focus-name">{focus.name}</span>
            <span className="hero__focus-meta meta">{focus.place} · {focus.city}</span>
          </span>
          {focus.again && <span className="hero__focus-flag meta">↺</span>}
        </motion.div>
      </AnimatePresence>

      <div className="shell hero__content">
        <motion.span
          className="eyebrow"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          A personal food journal
        </motion.span>

        <h1 className="hero__head display">
          {LINES.map((words, r) => (
            <span className="line-mask" key={r}>
              <motion.span
                className="hero__line"
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{ duration: 1, delay: 0.3 + r * 0.12, ease: [0.22, 0.61, 0.36, 1] }}
              >
                {r === 2 ? (
                  <>
                    second <em>life.</em>
                  </>
                ) : (
                  words.join(" ")
                )}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.p
          className="hero__lede"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.7 }}
        >
          Remember what you loved. Record what you tasted. Never forget the dish
          worth ordering again.
        </motion.p>

        <motion.div
          className="hero__cta"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <MagneticButton as="a" className="btn btn-amber" href={BRAND.appUrl} target="_blank" rel="noreferrer" data-cursor="let's go">
            Start your vault <Arrow />
          </MagneticButton>
          <a className="btn btn-ghost" href="#archive">Wander the vault</a>
        </motion.div>
      </div>

      <motion.div
        className="hero__drag meta"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.1 }}
      >
        <span className="hero__drag-dot" /> Drag the memories
      </motion.div>

      <div className="hero__cue meta">
        <span>Scroll</span>
        <span className="hero__cue-line" />
      </div>
    </section>
  );
}

const Arrow = () => (
  <svg className="arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
