import { motion } from "framer-motion";
import Tilt from "../components/Tilt.jsx";
import "./Bento.css";

const rise = {
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
};

export default function Bento() {
  const C = 2 * Math.PI * 52;
  const taste = 96;

  return (
    <section className="bento-sec section-y" id="features">
      <div className="shell">
        <header className="bento__head">
          <span className="eyebrow">What you keep</span>
          <h2 className="bento__title display">
            A memory, <em>fully furnished.</em>
          </h2>
          <p className="bento__intro lede">
            Not a rating out of five stars. Everything that made the plate worth
            remembering — in one quiet, private place.
          </p>
        </header>

        <div className="bento">
          {/* TASTE — hero tile with gauge */}
          <motion.article className="btile btile--taste" {...rise} transition={{ duration: 0.6 }}>
            <Tilt className="btile__inner" max={6}>
              <div className="btile__top">
                <span className="meta">Taste score</span>
                <span className="btile__range meta">0 — 100</span>
              </div>
              <div className="gaugewrap">
                <svg className="gauge" viewBox="0 0 120 120">
                  <circle className="gauge__track" cx="60" cy="60" r="52" />
                  <circle
                    className="gauge__arc" cx="60" cy="60" r="52"
                    strokeDasharray={C}
                    strokeDashoffset={C - (C * taste) / 100}
                  />
                </svg>
                <span className="gauge__num dial">{taste}</span>
              </div>
              <p className="btile__say">
                Your own scale — honest, personal, <em>never a crowd average.</em>
              </p>
            </Tilt>
          </motion.article>

          {/* HEALTH & COST */}
          <motion.article className="btile btile--bars" {...rise} transition={{ duration: 0.6, delay: 0.05 }}>
            <span className="meta">Context, not guilt</span>
            <h3 className="btile__h">Health &amp; cost</h3>
            <MiniBar label="Health" v={61} />
            <MiniBar label="Cost" v={72} />
            <p className="btile__p">Two quick reads, so you remember the splurge from the staple.</p>
          </motion.article>

          {/* ORDER AGAIN */}
          <motion.article className="btile btile--again" {...rise} transition={{ duration: 0.6, delay: 0.1 }}>
            <span className="again__glyph">↺</span>
            <h3 className="btile__h">Order again</h3>
            <p className="btile__p">One flag for the plates worth a second life.</p>
            <span className="again__count"><b className="dial">42</b> this year</span>
          </motion.article>

          {/* NOTES */}
          <motion.article className="btile btile--notes" {...rise} transition={{ duration: 0.6 }}>
            <span className="meta">In your own words</span>
            <h3 className="btile__h">The notes that bring it back</h3>
            <ul className="notecard">
              <li><span className="meta">Best bite</span>“The slow-rendered pork bone broth.”</li>
              <li><span className="meta">Next time</span>“Extra chili. Sit at the counter.”</li>
              <li><span className="meta">Occasion</span>“Rainy night, alone, perfect.”</li>
            </ul>
          </motion.article>

          {/* PRIVATE VAULT */}
          <motion.article className="btile btile--vault" {...rise} transition={{ duration: 0.6, delay: 0.05 }}>
            <span className="meta">A private vault</span>
            <h3 className="btile__h">Yours alone</h3>
            <div className="vault__search">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
              <span>Search your vault…</span>
              <span className="vault__caret" />
            </div>
            <p className="btile__p">No feed. No followers. No algorithm deciding what you felt.</p>
          </motion.article>

          {/* REVISIT */}
          <motion.article className="btile btile--revisit" {...rise} transition={{ duration: 0.6, delay: 0.1 }}>
            <div className="revisit__txt">
              <span className="meta">Come back hungry</span>
              <h3 className="btile__h">Revisit by taste, place, or moment</h3>
            </div>
            <div className="chips">
              {["Highest taste", "Kyoto", "Order again", "Rainy nights", "Under €20", "Worth the trip"].map((c) => (
                <span className="chip" key={c}>{c}</span>
              ))}
            </div>
          </motion.article>
        </div>
      </div>
    </section>
  );
}

function MiniBar({ label, v }) {
  return (
    <div className="mbar">
      <span className="mbar__l meta">{label}</span>
      <span className="mbar__track">
        <motion.span
          className="mbar__fill"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: v / 100 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.22, 0.61, 0.36, 1] }}
        />
      </span>
      <span className="mbar__v dial">{v}</span>
    </div>
  );
}
