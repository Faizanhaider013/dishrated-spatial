import { useRef } from "react";

/**
 * Tilt — a subtle interactive 3D tilt toward the pointer, with a soft glare.
 * No-ops on coarse pointers and for reduced-motion users.
 */
export default function Tilt({ max = 9, className = "", children, ...rest }) {
  const ref = useRef(null);

  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(pointer: coarse)").matches ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateX(${-py * max}deg) rotateY(${px * max}deg)`;
    el.style.setProperty("--gx", `${(px + 0.5) * 100}%`);
    el.style.setProperty("--gy", `${(py + 0.5) * 100}%`);
  };
  const reset = () => {
    const el = ref.current;
    if (el) el.style.transform = "perspective(900px) rotateX(0) rotateY(0)";
  };

  return (
    <div ref={ref} className={`tilt ${className}`} onMouseMove={onMove} onMouseLeave={reset} {...rest}>
      {children}
      <span className="tilt__glare" aria-hidden="true" />
    </div>
  );
}
