import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import "./Manifesto.css";

const LINE =
  "You remember the restaurant. The night, the table, who you were with. But the dish — the one you swore you would order again — is already gone.";
const WORDS = LINE.split(" ");
const EMBER = new Set(["dish", "order", "again"]); // words that glow amber

function Word({ word, range, progress, hot }) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  const color = useTransform(progress, range, hot ? ["#776c5e", "#e9a23c"] : ["#776c5e", "#ece3d3"]);
  return (
    <motion.span className="mf__word" style={{ opacity, color }}>
      {word}{" "}
    </motion.span>
  );
}

export default function Manifesto() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.9", "end 0.45"] });

  return (
    <section className="mf section-y" ref={ref}>
      <div className="shell">
        <span className="eyebrow">The problem</span>
        <p className="mf__para display">
          {WORDS.map((w, i) => {
            const start = i / WORDS.length;
            const end = Math.min(1, start + 1.4 / WORDS.length);
            const clean = w.replace(/[^a-z]/gi, "").toLowerCase();
            return <Word key={i} word={w} range={[start, end]} progress={scrollYProgress} hot={EMBER.has(clean)} />;
          })}
        </p>
      </div>
    </section>
  );
}
