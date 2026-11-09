import { Suspense, lazy, useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";

/* ===========================================================================
   DISHRATED — THE MUSEUM (entry point)
   A tiny, always-mounted listener. The heavy R3F / Drei / postprocessing
   experience is its own lazy chunk — fetched only when the museum is opened,
   so it never weighs down first paint. Open from anywhere with:
     window.dispatchEvent(new Event("open-museum"))
   =========================================================================== */

const MuseumExperience = lazy(() => import("./MuseumExperience.jsx"));

export default function Museum() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("open-museum", onOpen);
    return () => window.removeEventListener("open-museum", onOpen);
  }, []);

  // lock the page behind the overlay
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <Suspense fallback={null}>
          <MuseumExperience key="museum" onClose={() => setOpen(false)} />
        </Suspense>
      )}
    </AnimatePresence>
  );
}
