import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import SmartImage from "../components/SmartImage.jsx";
import { STEPS, img } from "../data/content.js";
import "./Ritual.css";

export default function Ritual() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.65", "end 0.85"] });
  const thread = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section className="rit section-y" id="ritual" ref={ref}>
      <div className="shell">
        <div className="rit__head">
          <div>
            <span className="eyebrow">The ritual</span>
            <h2 className="rit__title display">
              How a meal becomes<br />a <em>memory.</em>
            </h2>
          </div>
          <p className="rit__copy">
            No streaks. No followers. No algorithm deciding what you felt. Four
            quiet beats you do for yourself, one dish at a time.
          </p>
        </div>

        <ol className="rit__reel">
          <motion.span className="rit__thread" style={{ scaleX: thread }} aria-hidden="true" />
          {STEPS.map((s, i) => (
            <motion.li
              className="rit__frame"
              key={s.n}
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -12% 0px" }}
              transition={{ duration: 0.7, delay: i * 0.08, ease: [0.22, 0.61, 0.36, 1] }}
            >
              <div className="rit__shot">
                <SmartImage src={img(s.shot, 480)} alt="" tint={s.tint} />
                <span className="rit__time meta">{s.time}</span>
                <span className="rit__corner rit__corner--tl" />
                <span className="rit__corner rit__corner--br" />
              </div>
              <div className="rit__text">
                <span className="rit__n meta">{s.n} <span className="rit__rec" /></span>
                <h3 className="rit__frame-title">{s.title}</h3>
                <p className="rit__frame-body">{s.body}</p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
