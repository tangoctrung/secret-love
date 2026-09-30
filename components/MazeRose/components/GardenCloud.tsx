"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

export function GardenCloud({
  position,
  speed,
}: {
  position: [number, number, number];
  speed: number;
}) {
  const cloudRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!cloudRef.current) return;
    cloudRef.current.position.x += delta * speed;
    if (cloudRef.current.position.x > 34) cloudRef.current.position.x = -34;
  });

  return (
    <group position={position} ref={cloudRef}>
      {[
        [-1.25, 0, 0, 1],
        [0, 0.35, 0, 1.35],
        [1.35, 0, 0, 0.95],
        [0.65, -0.2, 0.15, 1.1],
      ].map(([x, y, z, scale], index) => (
        <mesh key={index} position={[x, y, z]} scale={scale}>
          <sphereGeometry args={[1, 16, 12]} />
          <meshStandardMaterial color="#ffffff" roughness={1} />
        </mesh>
      ))}
    </group>
  );
}
