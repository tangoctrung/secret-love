"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { toWorld } from "../maze";
import type { Temple } from "../types";

export function TempleMarker({ temple }: { temple: Temple }) {
  const lightRef = useRef<THREE.PointLight>(null);
  const position = toWorld(temple.position);

  useFrame((state) => {
    if (!lightRef.current) return;
    lightRef.current.intensity =
      temple.intensity *
      (0.88 + Math.sin(state.clock.elapsedTime * 0.72 + temple.phase) * 0.12);
  });

  return (
    <group position={[position.x, 0, position.z]}>
      <pointLight
        color={temple.glow}
        decay={1.65}
        distance={15}
        intensity={temple.intensity}
        position={[0, 1.9, 0]}
        ref={lightRef}
      />
      <mesh castShadow receiveShadow position={[0, 0.11, 0]}>
        <cylinderGeometry args={[0.52, 0.62, 0.22, 6]} />
        <meshStandardMaterial color="#2a201b" metalness={0.02} roughness={0.9} />
      </mesh>
      <mesh castShadow position={[0, 0.62, 0]}>
        <cylinderGeometry args={[0.34, 0.4, 0.78, 6]} />
        <meshStandardMaterial
          color={temple.color}
          emissive={temple.color}
          emissiveIntensity={0.22}
          metalness={0.05}
          roughness={0.62}
        />
      </mesh>
      <mesh castShadow position={[0, 1.17, 0]} rotation={[0, Math.PI / 6, 0]}>
        <coneGeometry args={[0.55, 0.55, 6]} />
        <meshStandardMaterial
          color={temple.glow}
          emissive={temple.glow}
          emissiveIntensity={0.38}
          metalness={0.04}
          roughness={0.55}
        />
      </mesh>
    </group>
  );
}
