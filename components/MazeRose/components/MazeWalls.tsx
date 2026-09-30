"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { WALL_HEIGHT } from "../data";
import { toWorld } from "../maze";
import type { MazeMatrix, RockTransform } from "../types";

export function MazeWalls({ maze, texture }: { maze: MazeMatrix; texture: THREE.Texture }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const rocks = useMemo<RockTransform[]>(
    () =>
      maze.flatMap((row, rowIndex) =>
        row.flatMap((cell, columnIndex) => {
          if (cell === 0) return [];

          const center = toWorld({ row: rowIndex, column: columnIndex });
          const seed = rowIndex * 97 + columnIndex * 53;
          const random = (offset: number) => {
            const value = Math.sin((seed + offset) * 12.9898) * 43758.5453;
            return value - Math.floor(value);
          };
          const angle = random(1) * Math.PI;
          const axisX = Math.cos(angle);
          const axisZ = Math.sin(angle);
          const palette = ["#24150e", "#342017", "#432a1c", "#513322"];

          return [
            {
              color: palette[Math.floor(random(2) * palette.length)],
              position: new THREE.Vector3(
                center.x + axisX * 0.38,
                0.56,
                center.z + axisZ * 0.38,
              ),
              rotation: new THREE.Euler(
                random(3) * 0.32,
                random(4) * Math.PI,
                random(5) * 0.24,
              ),
              scale: new THREE.Vector3(
                1.05 + random(6) * 0.16,
                0.72 + random(7) * 0.13,
                0.94 + random(8) * 0.17,
              ),
            },
            {
              color: palette[Math.floor(random(9) * palette.length)],
              position: new THREE.Vector3(
                center.x - axisX * 0.38,
                0.58,
                center.z - axisZ * 0.38,
              ),
              rotation: new THREE.Euler(
                random(10) * 0.3,
                random(11) * Math.PI,
                random(12) * 0.22,
              ),
              scale: new THREE.Vector3(
                0.98 + random(13) * 0.18,
                0.7 + random(14) * 0.14,
                1 + random(15) * 0.14,
              ),
            },
            {
              color: palette[Math.floor(random(16) * palette.length)],
              position: new THREE.Vector3(
                center.x + axisZ * 0.24,
                1.38,
                center.z - axisX * 0.24,
              ),
              rotation: new THREE.Euler(
                random(17) * 0.38,
                random(18) * Math.PI,
                random(19) * 0.28,
              ),
              scale: new THREE.Vector3(
                0.85 + random(20) * 0.14,
                0.66 + random(21) * 0.12,
                0.8 + random(22) * 0.16,
              ),
            },
            {
              color: palette[Math.floor(random(23) * palette.length)],
              position: new THREE.Vector3(
                center.x - axisZ * 0.2,
                1.48,
                center.z + axisX * 0.2,
              ),
              rotation: new THREE.Euler(
                random(24) * 0.35,
                random(25) * Math.PI,
                random(26) * 0.3,
              ),
              scale: new THREE.Vector3(
                0.76 + random(27) * 0.14,
                0.62 + random(28) * 0.12,
                0.78 + random(29) * 0.13,
              ),
            },
            {
              color: palette[Math.floor(random(30) * palette.length)],
              position: new THREE.Vector3(
                center.x + (random(31) - 0.5) * 0.18,
                WALL_HEIGHT - 0.72,
                center.z + (random(32) - 0.5) * 0.18,
              ),
              rotation: new THREE.Euler(
                random(33) * 0.4,
                random(34) * Math.PI,
                random(35) * 0.32,
              ),
              scale: new THREE.Vector3(
                0.58 + random(36) * 0.13,
                0.53 + random(37) * 0.1,
                0.57 + random(38) * 0.13,
              ),
            },
          ];
        }),
      ),
    [maze],
  );

  useLayoutEffect(() => {
    if (!meshRef.current) return;

    const matrix = new THREE.Matrix4();
    const quaternion = new THREE.Quaternion();
    rocks.forEach((rock, index) => {
      quaternion.setFromEuler(rock.rotation);
      matrix.compose(rock.position, quaternion, rock.scale);
      meshRef.current?.setMatrixAt(index, matrix);
      meshRef.current?.setColorAt(index, new THREE.Color(rock.color));
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    meshRef.current.computeBoundingSphere();
  }, [rocks]);

  return (
    <instancedMesh
      args={[undefined, undefined, rocks.length]}
      castShadow
      ref={meshRef}
      receiveShadow
    >
      <icosahedronGeometry args={[0.92, 2]} />
      <meshStandardMaterial
        bumpMap={texture}
        bumpScale={0.38}
        displacementBias={-0.08}
        displacementMap={texture}
        displacementScale={0.17}
        map={texture}
        metalness={0.03}
        roughness={1}
        vertexColors
      />
    </instancedMesh>
  );
}
