import { useEffect, useRef, useState } from "react";

/**
 * Cursor — a custom two-part cursor (a precise dot + a lagging ring).
 * The ring grows and can show a label when hovering elements that carry
 * data-cursor / [data-cursor-grow]. Only active on fine-pointer devices;
 * falls back to the native cursor on touch and for reduced-motion users.
 */
export default function Cursor() {
  const dot = useRef(null);
  const ring = useRef(null);
  const [label, setLabel] = useState("");
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;

    setEnabled(true);
    document.body.classList.add("has-cursor");

    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;
    let raf;

    const move = (e) => {
      mx = e.clientX; my = e.clientY;
      if (dot.current) dot.current.style.transform = `translate(${mx}px, ${my}px)`;
    };
    const loop = () => {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      if (ring.current) ring.current.style.transform = `translate(${rx}px, ${ry}px)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const over = (e) => {
      const t = e.target.closest("[data-cursor], a, button");
      if (!t) { ring.current?.removeAttribute("data-grow"); setLabel(""); return; }
      ring.current?.setAttribute("data-grow", "");
      setLabel(t.getAttribute("data-cursor") || "");
    };
    const down = () => ring.current?.setAttribute("data-press", "");
    const up = () => ring.current?.removeAttribute("data-press");

    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mouseover", over, { passive: true });
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);

    return () => {
      cancelAnimationFrame(raf);
      document.body.classList.remove("has-cursor");
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
    };
  }, []);

  if (!enabled) return null;
  return (
    <>
      <div className="cursor-dot" ref={dot} aria-hidden="true" />
      <div className="cursor-ring" ref={ring} aria-hidden="true">
        <span className="cursor-label">{label}</span>
      </div>
    </>
  );
}
