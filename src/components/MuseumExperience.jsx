import {
  Suspense, useCallback, useEffect, useMemo, useRef, useState,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Environment, Lightformer, ContactShadows, AdaptiveDpr, AdaptiveEvents,
  PerspectiveCamera, useTexture, useProgress,
} from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, SMAA } from "@react-three/postprocessing";
import { AnimatePresence, motion } from "framer-motion";
import gsap from "gsap";
import * as THREE from "three";
import { MEALS } from "../data/content.js";
import "./Museum.css";

/* ===========================================================================
   DISHRATED — THE MUSEUM
   A futuristic culinary museum: every saved meal is a collectible ceramic
   plate, presented under warm gallery light. Built on the same R3F / Drei /
   postprocessing language as the hero (PlateScene), with the real MEALS data.
   =========================================================================== */

const tex = (id, s = 640) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${s}&h=${s}&q=80`;
const photoBig = (id, w = 1100) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=82`;

// ceramic plate cross-section (radius, height) revolved into a dish — matches PlateScene
const PROFILE = [
  [0.0, 0.05], [0.45, 0.02], [0.8, 0.02], [0.95, 0.12], [1.05, 0.16],
  [1.12, 0.12], [1.1, 0.06], [0.95, 0.0], [0.55, -0.05], [0.5, -0.1],
  [0.4, -0.08], [0.0, -0.04],
].map(([x, y]) => new THREE.Vector2(x, y));

const damp = THREE.MathUtils.damp;

function webglOK() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch (e) { return false; }
}

// ── taste → band label (reuses product language) ──────────────────────────
const band = (t) =>
  t >= 90 ? "Unforgettable" : t >= 75 ? "Memorable" : t >= 50 ? "Pleasant" : "Forgettable";

// parse "14.10" (dd.mm) into a sortable number — no year, best-effort recency
const dateKey = (d) => {
  const [dd, mm] = String(d).split(".").map((n) => parseInt(n, 10) || 0);
  return mm * 31 + dd;
};

const SORTS = [
  { key: "taste", label: "Taste", get: (m) => m.taste, dir: -1 },
  { key: "health", label: "Health", get: (m) => m.health, dir: -1 },
  { key: "cost", label: "Cost", get: (m) => m.cost, dir: -1 },
  { key: "recent", label: "Recent", get: (m) => dateKey(m.date), dir: -1 },
];

// ===========================================================================
// LAYOUT — a museum "table": plates on the ground plane in a centered grid.
// ===========================================================================
function useLayout(meals, vw, vh) {
  return useMemo(() => {
    const n = meals.length;
    const portrait = vh > vw;
    let cols;
    if (n <= 1) cols = 1;
    else if (portrait || vw < 760) cols = Math.min(n, 2);
    else cols = n <= 4 ? Math.min(n, 2) : n <= 9 ? 3 : 4;
    const rows = Math.ceil(n / cols);
    const gapX = 3.35;
    const gapZ = 3.5;

    const pos = meals.map((_, i) => {
      const r = Math.floor(i / cols);
      const c = i % cols;
      const colsInRow = r === rows - 1 ? n - cols * (rows - 1) : cols;
      const x = (c - (colsInRow - 1) / 2) * gapX;
      const z = (r - (rows - 1) / 2) * gapZ;
      return [x, 0, z];
    });

    const width = (cols - 1) * gapX;
    const depth = (rows - 1) * gapZ;
    const span = Math.max(width, depth * 1.2);
    const camY = THREE.MathUtils.clamp(span * 0.3 + 3.4, 3.8, 9);
    const camZ = width * 0.42 + depth * 0.55 + (portrait ? 8.5 : 6.6);
    return { pos, cols, rows, width, depth, camY, camZ };
  }, [meals, vw, vh]);
}

// ===========================================================================
// A single collectible plate
// ===========================================================================
function Plate({ meal, target, hovered, selected, detail, reduced, onHover, onSelect, movedRef, index }) {
  const texture = useTexture(tex(meal.photo), (t) => {
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
  });
  const grp = useRef(null);
  const ceramic = useRef(null);
  const photo = useRef(null);
  const started = useRef(false);
  const phase = useMemo(() => index * 1.37, [index]);

  useFrame((state, dt) => {
    const g = grp.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const [tx, , tz] = target;

    // entrance: rise from below on first frames
    if (!started.current) {
      g.position.set(tx, -4, tz);
      started.current = true;
    }

    const bob = reduced ? 0 : Math.sin(t * 0.7 + phase) * 0.07;
    const lift = hovered ? 0.5 : selected ? 0.35 : 0;
    const recede = detail && !selected;

    g.position.x = damp(g.position.x, tx, 5, dt);
    g.position.z = damp(g.position.z, tz, 5, dt);
    g.position.y = damp(g.position.y, lift + bob, 6, dt);

    // scale — hovered pops, selected is the showcase, others shrink in detail
    const s = selected ? 1.18 : hovered ? 1.14 : recede ? 0.7 : 1;
    const cs = damp(g.scale.x, s, 7, dt);
    g.scale.setScalar(cs);

    // orientation — well tilts toward the elevated camera; selected slowly turns
    const spin = selected && !reduced ? t * 0.3 : 0;
    const sway = reduced ? 0 : Math.sin(t * 0.5 + phase) * 0.12;
    g.rotation.x = damp(g.rotation.x, -0.16 - (hovered ? 0.06 : 0), 6, dt);
    g.rotation.y = selected ? spin : damp(g.rotation.y, sway, 4, dt);

    // material response
    const targetOpacity = recede ? 0.12 : 1;
    const glow = selected ? 0.26 : hovered ? 0.16 : 0;
    const ring = selected ? 0.18 : hovered ? 0.12 : 0.02;
    if (photo.current) {
      photo.current.opacity = damp(photo.current.opacity, targetOpacity, 7, dt);
      photo.current.transparent = photo.current.opacity < 0.99;
      photo.current.emissiveIntensity = damp(photo.current.emissiveIntensity, glow, 6, dt);
    }
    if (ceramic.current) {
      ceramic.current.opacity = damp(ceramic.current.opacity, targetOpacity, 7, dt);
      ceramic.current.transparent = ceramic.current.opacity < 0.99;
      ceramic.current.emissiveIntensity = damp(ceramic.current.emissiveIntensity, ring, 6, dt);
    }
  });

  const over = (e) => { e.stopPropagation(); onHover(meal); document.body.style.cursor = "pointer"; };
  const out = (e) => { e.stopPropagation(); onHover(null); document.body.style.cursor = ""; };
  const click = (e) => {
    e.stopPropagation();
    if (movedRef.current) return; // was a drag, not a tap
    onSelect(meal);
  };

  return (
    <group ref={grp} onPointerOver={over} onPointerOut={out} onClick={click}>
      {/* ceramic dish */}
      <mesh castShadow receiveShadow>
        <latheGeometry args={[PROFILE, 96]} />
        <meshPhysicalMaterial
          ref={ceramic}
          color="#efe7d6" roughness={0.32} metalness={0}
          clearcoat={0.6} clearcoatRoughness={0.35}
          envMapIntensity={1.1} side={THREE.DoubleSide}
          emissive="#e9a23c" emissiveIntensity={0.02}
        />
      </mesh>
      {/* the food — real photography sitting in the well */}
      <mesh position={[0, 0.045, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.76, 64]} />
        <meshStandardMaterial
          ref={photo}
          map={texture} roughness={0.78} metalness={0}
          emissive="#e9a23c" emissiveMap={texture} emissiveIntensity={0}
          toneMapped
        />
      </mesh>
    </group>
  );
}

// ===========================================================================
// The arrangement + turntable drag yaw
// ===========================================================================
function Gallery({ meals, layout, hovered, selectedId, detail, reduced, onHover, onSelect, movedRef, yawRef }) {
  const group = useRef(null);
  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    // in detail, settle the turntable back to square so camera framing is exact
    const target = detail ? 0 : yawRef.current;
    g.rotation.y = damp(g.rotation.y, target, 5, dt);
  });
  return (
    <group ref={group}>
      {meals.map((m, i) => (
        <Plate
          key={m.id}
          index={i}
          meal={m}
          target={layout.pos[i]}
          hovered={hovered?.id === m.id}
          selected={selectedId === m.id}
          detail={detail}
          reduced={reduced}
          onHover={onHover}
          onSelect={onSelect}
          movedRef={movedRef}
        />
      ))}
    </group>
  );
}

// ===========================================================================
// Curated camera — cinematic fly between gallery framing and a dish close-up
// ===========================================================================
function CameraRig({ layout, focusPos, detail, reduced }) {
  const { camera, pointer } = useThree();
  const goal = useRef(new THREE.Vector3(0, layout.camY, layout.camZ));
  const look = useRef(new THREE.Vector3(0, 0, 0));
  const tmp = useRef(new THREE.Vector3());

  useEffect(() => {
    let gp, lp;
    if (detail && focusPos) {
      gp = [focusPos[0], 1.65, focusPos[2] + 3.35];
      lp = [focusPos[0], 0.1, focusPos[2]];
    } else {
      gp = [0, layout.camY, layout.camZ];
      lp = [0, 0, 0];
    }
    const dur = reduced ? 0 : 1.15;
    gsap.to(goal.current, { x: gp[0], y: gp[1], z: gp[2], duration: dur, ease: "power3.inOut", overwrite: true });
    gsap.to(look.current, { x: lp[0], y: lp[1], z: lp[2], duration: dur, ease: "power3.inOut", overwrite: true });
  }, [detail, focusPos, layout.camY, layout.camZ, reduced]);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    let ox = 0, oy = 0;
    if (!detail && !reduced) {
      ox = pointer.x * 0.9 + Math.sin(t * 0.18) * 0.35; // parallax + slow drift
      oy = -pointer.y * 0.5 + Math.cos(t * 0.15) * 0.2;
    }
    tmp.current.set(goal.current.x + ox, goal.current.y + oy, goal.current.z);
    camera.position.lerp(tmp.current, 1 - Math.exp(-6 * dt));
    camera.lookAt(look.current);
  });
  return null;
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <hemisphereLight intensity={0.5} color="#fbe6c2" groundColor="#3c2d1e" />
      <spotLight
        position={[3, 9, 5]} angle={0.5} penumbra={0.85} intensity={170}
        color="#ffe2b2" castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0002}
      />
      <directionalLight position={[-6, 3, -5]} intensity={1.1} color="#bcc6ff" />
      <pointLight position={[0, -1, 5]} intensity={8} color="#ef8a4e" />
    </>
  );
}

function Loaded({ onReady }) {
  const { active, progress } = useProgress();
  useEffect(() => {
    if (!active && progress >= 100) onReady();
  }, [active, progress, onReady]);
  return null;
}

// ===========================================================================
// The WebGL experience
// ===========================================================================
function Experience3D({ meals, layout, hovered, selectedId, focusPos, detail, reduced, lowPerf, onHover, onSelect, onReady, movedRef, yawRef }) {
  return (
    <Canvas
      shadows={!lowPerf}
      dpr={lowPerf ? [1, 1.3] : [1, 1.9]}
      gl={{ antialias: true, powerPreference: "high-performance", alpha: false }}
      onCreated={({ gl }) => { gl.toneMappingExposure = 1.12; }}
    >
      <color attach="background" args={["#3c2d1e"]} />
      <fogExp2 attach="fog" args={["#3c2d1e", 0.03]} />
      <PerspectiveCamera makeDefault position={[0, layout.camY, layout.camZ]} fov={34} />

      <Lights />

      <Suspense fallback={null}>
        <Gallery
          meals={meals} layout={layout} hovered={hovered} selectedId={selectedId}
          detail={detail} reduced={reduced} onHover={onHover} onSelect={onSelect}
          movedRef={movedRef} yawRef={yawRef}
        />

        {/* museum floor — soft reflective pool of shadow */}
        <ContactShadows position={[0, -0.9, 0]} opacity={0.5} scale={28} blur={3} far={6} color="#1a120a" />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.92, 0]} receiveShadow>
          <planeGeometry args={[60, 60]} />
          <meshStandardMaterial color="#5a4631" roughness={0.55} metalness={0.3} envMapIntensity={0.7} />
        </mesh>

        {/* procedural environment — ceramic reflections, no external HDR (matches PlateScene) */}
        <Environment resolution={256} frames={1}>
          <Lightformer intensity={2.2} position={[0, 4, 3]} scale={[9, 9, 1]} color="#f6c069" />
          <Lightformer intensity={1.1} position={[-5, 1, -3]} scale={[6, 6, 1]} color="#8fa8ff" />
          <Lightformer intensity={0.7} position={[5, -1, 2]} scale={[6, 6, 1]} color="#ef6a2e" />
          <Lightformer intensity={0.4} position={[0, -4, 0]} scale={[10, 10, 1]} color="#2a2018" />
        </Environment>
      </Suspense>

      <CameraRig layout={layout} focusPos={focusPos} detail={detail} reduced={reduced} />
      <Loaded onReady={onReady} />

      {!reduced && !lowPerf && (
        <EffectComposer multisampling={0} disableNormalPass>
          <Bloom mipmapBlur luminanceThreshold={0.8} luminanceSmoothing={0.3} intensity={0.45} />
          <Vignette eskil={false} offset={0.28} darkness={0.5} />
          <SMAA />
        </EffectComposer>
      )}

      <AdaptiveDpr pixelated />
      <AdaptiveEvents />
    </Canvas>
  );
}

// ===========================================================================
// Score meter (2D) for the detail panel
// ===========================================================================
function Meter({ label, value, accent }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  const off = c * (1 - value / 100);
  return (
    <div className="m-meter">
      <svg viewBox="0 0 64 64" width="64" height="64" aria-hidden="true">
        <circle cx="32" cy="32" r={r} className="m-meter__track" />
        <motion.circle
          cx="32" cy="32" r={r}
          className="m-meter__fill"
          style={{ stroke: accent }}
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: off }}
          transition={{ duration: 1, ease: [0.22, 0.61, 0.36, 1] }}
        />
      </svg>
      <span className="m-meter__v">{value}</span>
      <span className="m-meter__l meta">{label}</span>
    </div>
  );
}

// ===========================================================================
// Detail panel (2D) — the "placard" for the focused dish
// ===========================================================================
function DetailPanel({ meal, onClose }) {
  const sheet = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 860px)").matches,
    []
  );
  if (!meal) return null;
  const hidden = sheet ? { opacity: 0, y: 80 } : { opacity: 0, x: 60 };
  return (
    <motion.aside
      className="m-detail"
      initial={hidden}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={hidden}
      transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
      aria-label={`${meal.name} details`}
    >
      <button className="m-detail__back" onClick={onClose}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M11 18l-6-6 6-6" /></svg>
        Back to the gallery
      </button>

      <div className="m-detail__fig">
        <img src={photoBig(meal.photo)} alt={`${meal.name} at ${meal.place}, ${meal.city}`} loading="eager" />
        {meal.again && <span className="m-detail__again meta">↺ Order again</span>}
        <span className="m-detail__band meta">{band(meal.taste)}</span>
      </div>

      <div className="m-detail__meta meta">
        <span>{meal.place} · {meal.city}</span>
        <span>{meal.date}</span>
      </div>
      <h2 className="m-detail__name">{meal.name}</h2>

      <div className="m-detail__meters">
        <Meter label="Taste" value={meal.taste} accent="#f6c069" />
        <Meter label="Health" value={meal.health} accent="#9bbf7a" />
        <Meter label="Cost" value={meal.cost} accent="#ef6a2e" />
      </div>

      <dl className="m-detail__notes">
        <div>
          <dt className="meta">Best bite</dt>
          <dd>“{meal.best}”</dd>
        </div>
        <div>
          <dt className="meta">Next time</dt>
          <dd>{meal.next}</dd>
        </div>
        <div>
          <dt className="meta">The occasion</dt>
          <dd className="m-detail__hand">{meal.occasion}</dd>
        </div>
      </dl>
    </motion.aside>
  );
}

// ===========================================================================
// 2D fallback gallery (no WebGL) — same data, same detail panel
// ===========================================================================
function FallbackGallery({ meals, onSelect }) {
  return (
    <div className="m-fallback" role="list" aria-label="Saved meals">
      {meals.map((m, i) => (
        <button className="m-fallback__card" key={m.id} role="listitem" onClick={() => onSelect(m)} style={{ "--tint": m.tint }}>
          <span className="m-fallback__img">
            <img src={tex(m.photo, 520)} alt={`${m.name} at ${m.place}`} loading="lazy" />
          </span>
          <span className="m-fallback__no meta">Nº {String(i + 1).padStart(2, "0")}</span>
          <span className="m-fallback__score"><b>{m.taste}</b><small className="meta">taste</small></span>
          <span className="m-fallback__name">{m.name}</span>
          <span className="m-fallback__place meta">{m.place} · {m.city}</span>
        </button>
      ))}
    </div>
  );
}

// ===========================================================================
// The full experience (mounted only while open)
// ===========================================================================
export default function MuseumExperience({ onClose }) {
  const reduced = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );
  const [ok] = useState(() => webglOK());
  const [lowPerf] = useState(
    () => typeof window !== "undefined" &&
      (window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 760)
  );

  const [vp, setVp] = useState(() => ({
    w: typeof window !== "undefined" ? window.innerWidth : 1200,
    h: typeof window !== "undefined" ? window.innerHeight : 800,
  }));
  useEffect(() => {
    const onR = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onR);
    return () => window.removeEventListener("resize", onR);
  }, []);

  // ── controls ──────────────────────────────────────────────────────────
  const [query, setQuery] = useState("");
  const [city, setCity] = useState(null);
  const [sort, setSort] = useState("taste");
  const [againOnly, setAgainOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const cities = useMemo(() => [...new Set(MEALS.map((m) => m.city))], []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = MEALS.filter((m) => {
      if (city && m.city !== city) return false;
      if (againOnly && !m.again) return false;
      if (!q) return true;
      return [m.name, m.place, m.city, m.best, m.next, m.occasion]
        .join(" ").toLowerCase().includes(q);
    });
    const s = SORTS.find((x) => x.key === sort) || SORTS[0];
    list = [...list].sort((a, b) => (s.get(a) - s.get(b)) * s.dir);
    return list;
  }, [query, city, sort, againOnly]);

  const layout = useLayout(filtered, vp.w, vp.h);

  // ── selection / hover ─────────────────────────────────────────────────
  const [selectedId, setSelectedId] = useState(null);
  const [focusPos, setFocusPos] = useState(null);
  const [hovered, setHovered] = useState(null);

  // if the selected meal leaves the filtered set, drop back to the gallery
  useEffect(() => {
    if (selectedId && !filtered.some((m) => m.id === selectedId)) {
      setSelectedId(null);
      setFocusPos(null);
    }
  }, [filtered, selectedId]);

  const onSelect = useCallback((meal) => {
    const i = filtered.findIndex((m) => m.id === meal.id);
    if (i < 0) return;
    setFocusPos(layout.pos[i]);
    setSelectedId(meal.id);
    setHovered(null);
    document.body.style.cursor = "";
  }, [filtered, layout]);

  const closeDetail = useCallback(() => {
    setSelectedId(null);
    setFocusPos(null);
  }, []);

  const selectedMeal = useMemo(
    () => filtered.find((m) => m.id === selectedId) || null,
    [filtered, selectedId]
  );
  const detail = !!selectedMeal;

  const [ready, setReady] = useState(!ok); // fallback needs no WebGL load
  const onReady = useCallback(() => setReady(true), []);

  // ── turntable drag (desktop + touch) ────────────────────────────────────
  const yawRef = useRef(0);
  const movedRef = useRef(false);
  const drag = useRef({ active: false, startX: 0, startYaw: 0 });

  const onPointerDown = (e) => {
    if (e.target.closest(".m-hud")) return; // don't drag from the controls
    drag.current = { active: true, startX: e.clientX, startYaw: yawRef.current };
    movedRef.current = false;
  };
  const onPointerMove = (e) => {
    if (!drag.current.active || detail) return;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 5) movedRef.current = true;
    yawRef.current = THREE.MathUtils.clamp(drag.current.startYaw + dx * 0.0032, -0.5, 0.5);
  };
  const endDrag = () => { drag.current.active = false; };

  // ── keyboard: Esc backs out of detail, then closes the museum ──────────
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (selectedId) closeDetail();
      else onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, closeDetail, onClose]);

  const readout = hovered || selectedMeal;
  const empty = filtered.length === 0;

  const reset = () => { setQuery(""); setCity(null); setAgainOnly(false); setSort("taste"); };

  return (
    <motion.div
      className="museum"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      role="dialog"
      aria-modal="true"
      aria-label="The Dishrated Museum"
    >
      {/* stage */}
      <div
        className="museum__stage"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onPointerCancel={endDrag}
      >
        {ok ? (
          !empty && (
            <Experience3D
              meals={filtered} layout={layout} hovered={hovered} selectedId={selectedId}
              focusPos={focusPos} detail={detail} reduced={reduced} lowPerf={lowPerf}
              onHover={setHovered} onSelect={onSelect} onReady={onReady}
              movedRef={movedRef} yawRef={yawRef}
            />
          )
        ) : (
          !empty && <FallbackGallery meals={filtered} onSelect={onSelect} />
        )}
      </div>

      <div className="museum__veil" aria-hidden="true" />

      {/* ── loading ── */}
      <AnimatePresence>
        {ok && !ready && !empty && (
          <motion.div className="museum__loader" exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
            <span className="museum__loader-ring" />
            <span className="meta">Lighting the gallery…</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HUD ── */}
      <div className="m-hud">
        {/* top bar */}
        <div className="m-top">
          <div className="m-top__brand">
            <span className="eyebrow no-rule">The Museum</span>
            <span className="m-top__count meta">
              {filtered.length} {filtered.length === 1 ? "plate" : "plates"} on view
            </span>
          </div>
          <button className="m-close" onClick={onClose} aria-label="Close the museum">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
            <span>Close</span>
          </button>
        </div>

        {/* controls */}
        <div className={`m-controls ${filtersOpen ? "is-open" : ""}`}>
          <div className="m-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
            <input
              type="search"
              placeholder="Search a dish, place, or note…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search meals"
            />
          </div>

          <button
            className="m-filtertoggle"
            onClick={() => setFiltersOpen((v) => !v)}
            aria-expanded={filtersOpen}
          >
            Filters
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16M7 12h10M10 18h4" /></svg>
          </button>

          <div className="m-controls__drawer">
            {/* sort */}
            <div className="m-seg" role="group" aria-label="Sort by">
              {SORTS.map((s) => (
                <button
                  key={s.key}
                  className={sort === s.key ? "is-on" : ""}
                  onClick={() => setSort(s.key)}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* order-again */}
            <button
              className={`m-toggle ${againOnly ? "is-on" : ""}`}
              onClick={() => setAgainOnly((v) => !v)}
              aria-pressed={againOnly}
            >
              ↺ Order again
            </button>

            {/* city chips */}
            <div className="m-chips" role="group" aria-label="Filter by place">
              <button className={city === null ? "is-on" : ""} onClick={() => setCity(null)}>All</button>
              {cities.map((c) => (
                <button key={c} className={city === c ? "is-on" : ""} onClick={() => setCity(city === c ? null : c)}>{c}</button>
              ))}
            </div>
          </div>
        </div>

        {/* bottom readout */}
        <AnimatePresence mode="wait">
          {readout && !detail && (
            <motion.div
              className="m-readout"
              key={readout.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <span className="m-readout__score">{readout.taste}</span>
              <span className="m-readout__text">
                <span className="m-readout__name">{readout.name}</span>
                <span className="meta">{readout.place} · {readout.city}</span>
              </span>
              {readout.again && <span className="m-readout__flag meta">↺</span>}
            </motion.div>
          )}
        </AnimatePresence>

        {!detail && !empty && (
          <div className="m-hint meta" aria-hidden="true">
            {lowPerf ? "Tap a plate to inspect" : "Drag to wander · Click a plate to inspect"}
          </div>
        )}
      </div>

      {/* ── empty state ── */}
      <AnimatePresence>
        {empty && (
          <motion.div className="m-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <span className="eyebrow no-rule">Nothing on these shelves</span>
            <p className="m-empty__head display">No plate matches<br />that search.</p>
            <button className="btn btn-amber" onClick={reset}>Clear the filters</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── detail placard ── */}
      <AnimatePresence>
        {detail && <DetailPanel key={selectedMeal.id} meal={selectedMeal} onClose={closeDetail} />}
      </AnimatePresence>
    </motion.div>
  );
}

