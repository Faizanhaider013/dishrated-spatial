import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

const tex = (id) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=620&h=820&q=80`;

function webglOK() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch (e) { return false; }
}

// draw a rounded, cover-fit card (with a faint amber rim that the bloom catches)
function roundedCanvas(image, tint) {
  const w = 512, h = 680, r = 46;
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const g = c.getContext("2d");
  const path = () => {
    if (g.roundRect) { g.beginPath(); g.roundRect(3, 3, w - 6, h - 6, r); }
    else {
      g.beginPath();
      g.moveTo(3 + r, 3); g.arcTo(w - 3, 3, w - 3, h - 3, r);
      g.arcTo(w - 3, h - 3, 3, h - 3, r); g.arcTo(3, h - 3, 3, 3, r);
      g.arcTo(3, 3, w - 3, 3, r); g.closePath();
    }
  };
  g.save(); path(); g.clip();
  g.fillStyle = tint || "#2a1d12"; g.fillRect(0, 0, w, h);
  if (image) {
    const ir = image.width / image.height, cr = w / h;
    let dw, dh, dx, dy;
    if (ir > cr) { dh = h; dw = h * ir; dx = (w - dw) / 2; dy = 0; }
    else { dw = w; dh = w / ir; dx = 0; dy = (h - dh) / 2; }
    g.drawImage(image, dx, dy, dw, dh);
  }
  const grad = g.createLinearGradient(0, h * 0.45, 0, h);
  grad.addColorStop(0, "rgba(10,7,5,0)"); grad.addColorStop(1, "rgba(10,7,5,0.6)");
  g.fillStyle = grad; g.fillRect(0, 0, w, h);
  g.restore();
  path();
  g.lineWidth = 5; g.strokeStyle = "rgba(233,162,60,0.55)"; g.stroke();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export default function DishOrbit({ dishes, onFocus }) {
  const mountRef = useRef(null);
  const [mode, setMode] = useState("3d");
  const focusRef = useRef(onFocus);
  focusRef.current = onFocus;

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!webglOK()) { setMode("fallback"); return; }
    const mount = mountRef.current;
    const W = () => mount.clientWidth, H = () => mount.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0c0a09, 0.072);

    const camera = new THREE.PerspectiveCamera(40, W() / H(), 0.1, 100);
    camera.position.set(0, 0.3, 8.8);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setSize(W(), H());
    renderer.setClearColor(0x0c0a09, 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    // post-processing — bloom gives the amber rims + highlights their glow
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(W(), H()), 0.62, 0.7, 0.8);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
    composer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    composer.setSize(W(), H());

    const group = new THREE.Group();
    scene.add(group);

    const loader = new THREE.ImageLoader();
    loader.setCrossOrigin("anonymous");
    const R = 4.4;
    const count = dishes.length;
    const geo = new THREE.PlaneGeometry(1.75, 2.32, 1, 1);
    const cards = [];

    dishes.forEach((d, i) => {
      const theta = (i / count) * Math.PI * 2;
      const mat = new THREE.MeshBasicMaterial({
        map: roundedCanvas(null, d.tint), transparent: true, alphaTest: 0.02,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(Math.sin(theta) * R, 0, Math.cos(theta) * R);
      mesh.rotation.y = theta;
      mesh.userData = { theta, index: i, scale: 1 };
      group.add(mesh);
      cards.push(mesh);

      loader.load(tex(d.photo), (image) => {
        const old = mat.map;
        mat.map = roundedCanvas(image, d.tint);
        mat.map.anisotropy = renderer.capabilities.getMaxAnisotropy();
        mat.needsUpdate = true;
        old?.dispose?.();
      }, undefined, () => {});
    });

    // interaction
    let rot = 0, vel = 0;
    const auto = reduce ? 0 : 0.0015;
    let dragging = false, lastX = 0, moved = 0, downX = 0;
    let pointerX = 0, pointerY = 0;
    let camX = 0, camY = 0.3;
    let focusTarget = null, focusUntil = 0;
    let frontIndex = -1;

    const ndc = new THREE.Vector2();
    const ray = new THREE.Raycaster();
    const rect = () => mount.getBoundingClientRect();

    const setPointer = (cx, cy) => {
      const r = rect();
      pointerX = ((cx - r.left) / r.width - 0.5) * 2;
      pointerY = ((cy - r.top) / r.height - 0.5) * 2;
      ndc.x = ((cx - r.left) / r.width) * 2 - 1;
      ndc.y = -((cy - r.top) / r.height) * 2 + 1;
    };
    const onDown = (e) => {
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      dragging = true; lastX = cx; downX = cx; moved = 0;
    };
    const onMove = (e) => {
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      const cy = e.touches ? e.touches[0].clientY : e.clientY;
      setPointer(cx, cy);
      if (dragging) { vel += (cx - lastX) * 0.0012; lastX = cx; moved += Math.abs(cx - lastX); focusTarget = null; }
    };
    const onUp = (e) => {
      dragging = false;
      const cx = (e.changedTouches ? e.changedTouches[0].clientX : e.clientX);
      if (Math.abs(cx - downX) < 6) {
        setPointer(cx, (e.changedTouches ? e.changedTouches[0].clientY : e.clientY));
        ray.setFromCamera(ndc, camera);
        const hit = ray.intersectObjects(cards, false)[0];
        if (hit) focusToCard(hit.object.userData.index);
      }
    };
    const focusToCard = (i) => {
      const theta = cards[i].userData.theta;
      let target = -theta;
      // choose nearest equivalent to current rotation
      const twoPi = Math.PI * 2;
      while (target - rot > Math.PI) target -= twoPi;
      while (target - rot < -Math.PI) target += twoPi;
      focusTarget = target; focusUntil = performance.now() + 3600; vel = 0;
    };

    mount.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseup", onUp);
    mount.addEventListener("touchstart", onDown, { passive: true });
    mount.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onUp);

    let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.01 });
    io.observe(mount);

    const clock = new THREE.Clock();
    let raf;
    const norm = (a) => { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; };

    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible) return;
      const t = clock.getElapsedTime();
      const now = performance.now();

      if (focusTarget !== null && now < focusUntil && !dragging) {
        rot += (focusTarget - rot) * 0.08;
      } else {
        rot += vel + (now > focusUntil ? auto : 0);
        vel *= 0.94;
      }
      group.rotation.y = rot;

      // per-card float + focus scaling
      let best = Infinity, bestI = frontIndex;
      cards.forEach((m, i) => {
        const world = norm(m.userData.theta + rot);
        const d = Math.abs(world);
        if (d < best) { best = d; bestI = i; }
        if (!reduce) {
          m.position.y = Math.sin(t * 0.55 + i * 1.3) * 0.14;
          m.rotation.z = Math.sin(t * 0.4 + i) * 0.025;
        }
        const want = 1 + Math.max(0, 1 - d / 0.5) * 0.14; // front card grows
        m.userData.scale += (want - m.userData.scale) * 0.1;
        m.scale.setScalar(m.userData.scale);
      });
      if (bestI !== frontIndex) { frontIndex = bestI; focusRef.current?.(dishes[bestI]); }

      camX += (pointerX * 1.0 - camX) * 0.045;
      camY += (0.3 - pointerY * 0.45 - camY) * 0.045;
      camera.position.x = camX; camera.position.y = camY;
      camera.lookAt(0, 0, 0);

      composer.render();
    };
    tick();

    const onResize = () => {
      camera.aspect = W() / H(); camera.updateProjectionMatrix();
      renderer.setSize(W(), H()); composer.setSize(W(), H());
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf); io.disconnect();
      window.removeEventListener("resize", onResize);
      mount.removeEventListener("mousedown", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      mount.removeEventListener("touchstart", onDown);
      mount.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
      geo.dispose();
      cards.forEach((m) => { m.material.map?.dispose?.(); m.material.dispose(); });
      bloom.dispose?.(); composer.dispose?.();
      renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    };
  }, [dishes]);

  if (mode === "fallback") {
    return (
      <div className="orbit-fallback" aria-hidden="true">
        {dishes.slice(0, 5).map((d) => (
          <img key={d.id} src={tex(d.photo)} alt="" loading="lazy" style={{ "--tint": d.tint }} />
        ))}
      </div>
    );
  }
  return <div className="dish-orbit" ref={mountRef} data-cursor="drag · tap a dish" aria-hidden="true" />;
}
