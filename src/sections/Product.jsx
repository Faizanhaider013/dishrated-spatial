import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import SmartImage from "../components/SmartImage.jsx";
import MagneticButton from "../components/MagneticButton.jsx";
import { BRAND, img } from "../data/content.js";
import "./Product.css";

export default function Product() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const rotX = useTransform(scrollYProgress, [0, 0.5, 1], [16, 1, -6]);
  const y = useTransform(scrollYProgress, [0, 1], [50, -40]);

  return (
    <section className="pr section-y" id="product" ref={ref}>
      <div className="shell">
        <header className="pr__head">
          <span className="eyebrow no-rule">The app, in your browser</span>
          <h2 className="pr__title display">
            Your whole food memory,<br />in <em>one quiet place.</em>
          </h2>
        </header>

        <div className="pr__stage">
          <motion.div className="pr__device" style={{ rotateX: rotX, y }}>
            <div className="win">
              <div className="win__bar">
                <span className="win__dots"><i /><i /><i /></span>
                <span className="win__url meta">dishrated.xyz / vault</span>
              </div>
              <div className="win__body">
                <div className="mock">
                  <aside className="mock__side">
                    <div className="mock__logo">Dishrated<span>.</span></div>
                    <div className="mock__nav meta">
                      <span className="on">All meals</span>
                      <span>Order again</span>
                      <span>By taste</span>
                      <span>By place</span>
                    </div>
                    <div className="mock__stat">
                      <span className="meta">Saved this year</span>
                      <strong className="dial">128</strong>
                    </div>
                  </aside>
                  <div className="mock__main">
                    <div className="mock__photo-wrap">
                      <SmartImage src={img("1623341214825-9f4f963727da", 720)} alt="Spicy miso ramen" tint="#a84a1e" className="mock__photo" />
                      <span className="mock__badge meta">↺ Order again</span>
                    </div>
                    <div className="mock__info">
                      <span className="meta">Menya Nº 8 · Kyoto · 14.10</span>
                      <h4>Spicy Miso Ramen</h4>
                      <div className="mock__pills">
                        <Pill k="Taste" v={96} accent />
                        <Pill k="Health" v={61} />
                        <Pill k="Cost" v={72} />
                      </div>
                      <div className="mock__fields">
                        <Field k="Best bite" v="The slow-rendered pork bone broth." />
                        <Field k="Next time" v="Ask for extra chili. Sit at the counter." />
                        <Field k="Occasion" v="Rainy night, alone, perfect." />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          <p className="pr__disclaimer meta">A representation of the Dishrated vault. Open the live app for the real thing.</p>
        </div>

        <div className="pr__cta">
          <MagneticButton as="a" className="btn btn-amber" href={BRAND.appUrl} target="_blank" rel="noreferrer" data-cursor="open">
            Try it in your browser <Arrow />
          </MagneticButton>
        </div>
      </div>
    </section>
  );
}

function Pill({ k, v, accent }) {
  return (
    <span className={`mock__pill ${accent ? "is-accent" : ""}`}>
      <span className="meta">{k}</span>
      <strong className="dial">{v}</strong>
    </span>
  );
}
function Field({ k, v }) {
  return (
    <div className="mock__field">
      <span className="meta">{k}</span>
      <p>{v}</p>
    </div>
  );
}

const Arrow = () => (
  <svg className="arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
