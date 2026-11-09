import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Float, Environment, Lightformer, ContactShadows,
  PresentationControls, AdaptiveDpr, useTexture, PerspectiveCamera,
} from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, SMAA } from "@react-three/postprocessing";
import * as THREE from "three";

const tex = (id) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=560&h=560&q=80`;

function webglOK() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch (e) { return false; }
}

// ceramic plate cross-section (radius, height) revolved into a dish
const PROFILE = [
  [0.0, 0.05], [0.45, 0.02], [0.8, 0.02], [0.95, 0.12], [1.05, 0.16],
  [1.12, 0.12], [1.1, 0.06], [0.95, 0.0], [0.55, -0.05], [0.5, -0.1],
  [0.4, -0.08], [0.0, -0.04],
].map(([x, y]) => new THREE.Vector2(x, y));

// loose cinematic composition (not a ring)
const SLOTS = [
  { p: [0, 0, 0], s: 1.15, float: 1.0 },
  { p: [-2.5, 0.7, -1.3], s: 0.8, float: 1.5 },
  { p: [2.5, -0.5, -1.0], s: 0.85, float: 1.2 },
  { p: [-1.7, -1.0, 0.9], s: 0.7, float: 1.8 },
  { p: [1.9, 1.05, 0.3], s: 0.72, float: 1.4 },
  { p: [0.2, -1.5, -2.2], s: 0.9, float: 1.1 },
];

function Plate({ url, active, reduced }) {
  const texture = useTexture(url, (t) => { t.colorSpace = THREE.SRGBColorSpace; });
  const grp = useRef(null);
  const target = useRef(1);
  useFrame((_, dt) => {
    const g = grp.current;
    if (!g) return;
    if (!reduced) g.rotation.y += dt * 0.18;
    target.current = active ? 1.12 : 1;
    const s = THREE.MathUtils.damp(g.scale.x, target.current, 5, dt);
    g.scale.setScalar(s);
  });
  return (
    <group ref={grp}>
      {/* ceramic dish */}
      <mesh castShadow receiveShadow>
        <latheGeometry args={[PROFILE, 96]} />
        <meshPhysicalMaterial
          color="#efe7d6" roughness={0.32} metalness={0}
          clearcoat={0.6} clearcoatRoughness={0.35}
          envMapIntensity={1.1} side={THREE.DoubleSide}
        />
      </mesh>
      {/* the food — real photography, sitting in the well */}
      <mesh position={[0, 0.035, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.76, 64]} />
        <meshStandardMaterial
          map={texture} roughness={0.78} metalness={0}
          emissive={active ? "#e9a23c" : "#000000"}
          emissiveMap={active ? texture : null}
          emissiveIntensity={active ? 0.18 : 0}
          toneMapped
        />
      </mesh>
    </group>
  );
}

function Rig({ dishes, active, reduced }) {
  const group = useRef(null);
  // subtle pointer parallax on the whole arrangement
  useFrame((state, dt) => {
    const g = group.current;
    if (!g || reduced) return;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, state.pointer.x * 0.25, 3, dt);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, -state.pointer.y * 0.12, 3, dt);
  });
  return (
    <group ref={group} position={[0.35, -0.1, 0]}>
      {dishes.slice(0, SLOTS.length).map((d, i) => (
        <Float
          key={d.id}
          speed={reduced ? 0 : SLOTS[i].float}
          rotationIntensity={reduced ? 0 : 0.25}
          floatIntensity={reduced ? 0 : 0.6}
          position={SLOTS[i].p}
        >
          <group scale={SLOTS[i].s} rotation={[0.12, 0, 0]}>
            <Plate url={tex(d.photo)} active={i === active} reduced={reduced} />
          </group>
        </Float>
      ))}
    </group>
  );
}

export default function PlateScene({ dishes, onFocus }) {
  const [ok] = useState(() => webglOK());
  const reduced = typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const focusRef = useRef(onFocus);
  focusRef.current = onFocus;

  // cycle the "plated" dish for the live caption
  useEffect(() => {
    if (!ok) return;
    focusRef.current?.(dishes[0]);
    const n = Math.min(dishes.length, SLOTS.length);
    const id = setInterval(() => {
      const next = (activeRef.current + 1) % n;
      activeRef.current = next;
      setActive(next);
      focusRef.current?.(dishes[next]);
    }, 3200);
    return () => clearInterval(id);
  }, [ok, dishes]);

  if (!ok) {
    return (
      <div className="orbit-fallback" aria-hidden="true">
        {dishes.slice(0, 5).map((d) => (
          <img key={d.id} src={tex(d.photo)} alt="" loading="lazy" style={{ "--tint": d.tint }} />
        ))}
      </div>
    );
  }

  return (
    <div className="plate-scene" data-cursor="drag · the table" aria-hidden="true">
      <Canvas
        shadows
        dpr={[1, 1.75]}
        gl={{ antialias: true, powerPreference: "high-performance", alpha: false }}
        onCreated={({ gl }) => { gl.toneMappingExposure = 1.12; }}
      >
        <color attach="background" args={["#0c0a09"]} />
        <fogExp2 attach="fog" args={["#0c0a09", 0.085]} />
        <PerspectiveCamera makeDefault position={[0, 1.6, 6.4]} fov={34} />

        {/* cinematic lighting */}
        <ambientLight intensity={0.35} />
        <spotLight
          position={[3, 7, 4]} angle={0.5} penumbra={0.8} intensity={120}
          color="#ffd9a0" castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0002}
        />
        <directionalLight position={[-5, 2, -4]} intensity={1.2} color="#9bb0ff" />
        <pointLight position={[0, -2, 3]} intensity={8} color="#ef6a2e" />

        <Suspense fallback={null}>
          <PresentationControls
            global={false}
            snap
            cursor
            speed={1.2}
            polar={[-Math.PI / 8, Math.PI / 8]}
            azimuth={[-Math.PI / 3, Math.PI / 3]}
            config={{ mass: 1, tension: 120, friction: 22 }}
          >
            <Rig dishes={dishes} active={active} reduced={reduced} />
          </PresentationControls>

          <ContactShadows
            position={[0, -2.2, 0]} opacity={0.5} scale={14} blur={3} far={5} color="#000000"
          />

          {/* procedural environment — ceramic reflections, no external HDR */}
          <Environment resolution={256} frames={1}>
            <Lightformer intensity={2.2} position={[0, 3, 2]} scale={[7, 7, 1]} color="#f6c069" />
            <Lightformer intensity={1.1} position={[-4, 1, -3]} scale={[5, 5, 1]} color="#8fa8ff" />
            <Lightformer intensity={0.7} position={[4, -1, 2]} scale={[5, 5, 1]} color="#ef6a2e" />
            <Lightformer intensity={0.4} position={[0, -4, 0]} scale={[8, 8, 1]} color="#2a2018" />
          </Environment>
        </Suspense>

        {!reduced && (
          <EffectComposer multisampling={0} disableNormalPass>
            <Bloom mipmapBlur luminanceThreshold={0.72} luminanceSmoothing={0.3} intensity={0.55} />
            <Vignette eskil={false} offset={0.22} darkness={0.75} />
            <SMAA />
          </EffectComposer>
        )}

        <AdaptiveDpr pixelated />
      </Canvas>
    </div>
  );
}
