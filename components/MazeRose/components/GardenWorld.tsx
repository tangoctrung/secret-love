"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { FLOWER_COLORS, TREE_POSITIONS } from "../data";
import { GardenCloud } from "./GardenCloud";
import { GardenFlower } from "./GardenFlower";
import { GardenPlayer } from "./GardenPlayer";
import { GardenTree } from "./GardenTree";

export function GardenWorld() {
  const sunsetLightPosition: [number, number, number] = [-26, 25, -38];
  const riverShape = useMemo(() => {
    const shape = new THREE.Shape();
    const center = (x: number) => Math.sin(x * 0.13) * 3.2;
    shape.moveTo(-36, center(-36) - 2.4);
    for (let x = -34; x <= 36; x += 2) shape.lineTo(x, center(x) - 2.4);
    for (let x = 36; x >= -36; x -= 2) shape.lineTo(x, center(x) + 2.4);
    shape.closePath();
    return shape;
  }, []);
  const flowers = useMemo(
    () =>
      Array.from({ length: 32 }, (_, index) => {
        const frontPatch = index < 22;
        const x = -18 + ((index * 7) % 37);
        const z = frontPatch ? 8 + ((index * 5) % 7) : -9 - ((index * 3) % 4);
        return {
          color: FLOWER_COLORS[index % FLOWER_COLORS.length],
          position: [x, 0, z] as [number, number, number],
        };
      }),
    [],
  );

  return (
    <>
      <color attach="background" args={["#c69a68"]} />
      <fog attach="fog" args={["#b38560", 42, 90]} />
      <ambientLight color="#ffe0ba" intensity={1.05} />
      <hemisphereLight args={["#e8b878", "#4c6942", 1.9]} />
      <directionalLight
        castShadow
        color="#e8a461"
        intensity={2.8}
        position={sunsetLightPosition}
      />
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[80, 55]} />
        <meshStandardMaterial color="#70ad58" roughness={1} />
      </mesh>
      <mesh position={[0, 0.035, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <shapeGeometry args={[riverShape, 24]} />
        <meshStandardMaterial
          color="#49aee0"
          metalness={0.08}
          opacity={0.92}
          roughness={0.25}
          transparent
        />
      </mesh>
      {TREE_POSITIONS.map((position, index) => (
        <GardenTree
          key={`${position[0]}-${position[2]}`}
          position={position}
          scale={0.82 + (index % 4) * 0.09}
        />
      ))}
      {flowers.map((flower, index) => (
        <GardenFlower color={flower.color} key={index} position={flower.position} />
      ))}
      <GardenCloud position={[-25, 11, -18]} speed={0.42} />
      <GardenCloud position={[-7, 14, -22]} speed={0.3} />
      <GardenCloud position={[15, 12, -16]} speed={0.38} />
      <GardenPlayer />
    </>
  );
}
