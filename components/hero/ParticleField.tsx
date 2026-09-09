"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import * as THREE from "three";

function StarField({ count = 4000 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // distribute on a sphere
      const r = 8 + Math.random() * 18;
      const t = Math.random() * Math.PI * 2;
      const p = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(p) * Math.cos(t);
      arr[i * 3 + 1] = r * Math.sin(p) * Math.sin(t);
      arr[i * 3 + 2] = r * Math.cos(p);
    }
    return arr;
  }, [count]);

  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.02;
    ref.current.rotation.x += delta * 0.005;
    const pointer = state.pointer;
    ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, pointer.x * 0.6, 0.04);
    ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, pointer.y * 0.4, 0.04);
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#a5b4fc"
        size={0.025}
        sizeAttenuation
        depthWrite={false}
        opacity={0.85}
      />
    </Points>
  );
}

function GlowOrb() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s, d) => {
    if (!ref.current) return;
    ref.current.rotation.y += d * 0.1;
    const t = s.clock.elapsedTime;
    const scale = 1 + Math.sin(t * 0.8) * 0.04;
    ref.current.scale.setScalar(scale);
  });
  return (
    <mesh ref={ref} position={[0, 0, -4]}>
      <sphereGeometry args={[1.2, 32, 32]} />
      <meshBasicMaterial color="#6366f1" transparent opacity={0.08} />
    </mesh>
  );
}

/**
 * Fundo 3D do hero. Só monta em telas >= 768px e sem prefers-reduced-motion:
 * abaixo disso o gradiente radial de app/globals.css já cobre o fundo, então
 * não vale gastar GPU de celular com WebGL. Quando o hero sai da viewport o
 * render loop para (frameloop="never") em vez de continuar rodando escondido.
 */
export function ParticleField() {
  const reduced = useReducedMotion();
  const [wide, setWide] = useState(false);
  const [inView, setInView] = useState(true);
  const holderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    const sync = () => setWide(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const el = holderRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [wide, reduced]);

  if (reduced || !wide) return null;

  return (
    <div ref={holderRef} className="absolute inset-0">
      <Canvas
        camera={{ position: [0, 0, 1], fov: 75 }}
        dpr={[1, 1.5]}
        frameloop={inView ? "always" : "never"}
        gl={{ antialias: true, alpha: true }}
        className="absolute inset-0"
      >
        <Suspense fallback={null}>
          <StarField count={1400} />
          <GlowOrb />
        </Suspense>
      </Canvas>
    </div>
  );
}
