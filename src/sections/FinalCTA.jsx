import { motion } from "framer-motion";
import SmartImage from "../components/SmartImage.jsx";
import MagneticButton from "../components/MagneticButton.jsx";
import { BRAND, img } from "../data/content.js";
import "./FinalCTA.css";

export default function FinalCTA() {
  return (
    <section className="fc">
      <div className="fc__bg" aria-hidden="true">
        <SmartImage src={img("1476224203421-9ac39bcb3327", 1600)} alt="" tint="#2a150c" />
        <div className="fc__scrim" />
      </div>
      <div className="shell fc__in">
        <motion.span
          className="eyebrow no-rule"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {BRAND.tagline}
        </motion.span>
        <motion.h2
          className="fc__head display"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.22, 0.61, 0.36, 1] }}
        >
          Your next favourite meal<br />starts with <em>remembering</em><br />the last one.
        </motion.h2>
        <motion.div
          className="fc__cta"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.12 }}
        >
          <MagneticButton as="a" className="btn btn-amber fc__btn" href={BRAND.appUrl} target="_blank" rel="noreferrer" data-cursor="let's go" strength={0.4}>
            Open Dishrated <Arrow />
          </MagneticButton>
          <span className="fc__sub meta">Free · In your browser · Nothing to download</span>
        </motion.div>
      </div>
    </section>
  );
}

const Arrow = () => (
  <svg className="arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
