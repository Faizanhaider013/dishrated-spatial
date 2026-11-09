import { motion } from "framer-motion";

/**
 * Reveal — a reusable scroll-in wrapper. Content animates up from a visible
 * resting state (never left invisible) and only plays once per element.
 * Respects reduced-motion via the app-level MotionConfig.
 */
export default function Reveal({
  children,
  as = "div",
  delay = 0,
  y = 26,
  className = "",
  ...rest
}) {
  const MotionTag = motion[as] || motion.div;
  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 0.61, 0.36, 1] }}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}

/** Words that reveal one after another — for editorial headline stagger. */
export function RevealLines({ lines, className = "" }) {
  return (
    <span className={className} style={{ display: "block" }}>
      {lines.map((line, i) => (
        <span key={i} style={{ display: "block", overflow: "hidden" }}>
          <motion.span
            style={{ display: "block" }}
            initial={{ y: "110%" }}
            whileInView={{ y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.85, delay: i * 0.08, ease: [0.22, 0.61, 0.36, 1] }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
