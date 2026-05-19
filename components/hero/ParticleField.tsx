"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
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

export function ParticleField() {
  return (
    <Canvas
      camera={{ position: [0, 0, 1], fov: 75 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      className="absolute inset-0"
    >
      <Suspense fallback={null}>
        <StarField count={3500} />
        <GlowOrb />
      </Suspense>
    </Canvas>
  );
}
