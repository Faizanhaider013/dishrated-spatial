import "./Marquee.css";

/**
 * Marquee — an infinite kinetic ticker. Duplicated track for a seamless loop;
 * pauses on hover. `items` render between star glyphs.
 */
export default function Marquee({ items, speed = 40, reverse = false }) {
  const row = (
    <div className="marquee__row" aria-hidden="true">
      {items.map((t, i) => (
        <span className="marquee__item" key={i}>
          <span className="marquee__star">✦</span>
          {t}
        </span>
      ))}
    </div>
  );
  return (
    <div className="marquee" role="presentation">
      <div
        className={`marquee__track ${reverse ? "is-rev" : ""}`}
        style={{ "--dur": `${speed}s` }}
      >
        {row}
        {row}
      </div>
      <div className="marquee__fade marquee__fade--l" />
      <div className="marquee__fade marquee__fade--r" />
    </div>
  );
}
