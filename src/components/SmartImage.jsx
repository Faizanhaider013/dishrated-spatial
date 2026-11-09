import { useState } from "react";

/**
 * SmartImage — lazy, art-directed image with a graceful tinted fallback.
 * If the source fails, we keep a tasteful plate-colored block instead of a
 * broken-image icon, so the composition never collapses.
 */
export default function SmartImage({ src, alt, tint = "#8a5a34", className = "", style, sizes }) {
  const [state, setState] = useState("load"); // load | ok | fail

  return (
    <div
      className={`smart-img ${className}`}
      style={{ "--tint": tint, ...style }}
      data-state={state}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        sizes={sizes}
        onLoad={() => setState("ok")}
        onError={() => setState("fail")}
      />
      {state !== "ok" && (
        <span className="smart-img__glyph" aria-hidden="true">
          {state === "fail" ? alt?.[0] ?? "·" : ""}
        </span>
      )}
    </div>
  );
}
