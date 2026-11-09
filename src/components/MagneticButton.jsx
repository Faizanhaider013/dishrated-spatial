import { useRef } from "react";

/**
 * MagneticButton — the element drifts toward the pointer, then springs back.
 * Renders as an <a> or <button>. No-ops for coarse pointers / reduced motion.
 */
export default function MagneticButton({ as = "a", strength = 0.35, className = "", children, ...rest }) {
  const ref = useRef(null);
  const Tag = as;

  const onMove = (e) => {
    const el = ref.current;
    if (!el || window.matchMedia("(pointer: coarse)").matches) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width / 2)) * strength;
    const y = (e.clientY - (r.top + r.height / 2)) * strength;
    el.style.transform = `translate(${x}px, ${y}px)`;
  };
  const reset = () => {
    if (ref.current) ref.current.style.transform = "translate(0,0)";
  };

  return (
    <Tag ref={ref} className={className} onMouseMove={onMove} onMouseLeave={reset} {...rest}>
      {children}
    </Tag>
  );
}
