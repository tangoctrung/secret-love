"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { CELL_SIZE, WALL_HEIGHT } from "../data";
import { toWorld } from "../maze";
import type { MazeMatrix, WallTransform } from "../types";

const LEAF_COLORS = ["#17472c", "#1d5934", "#24683c", "#2d7845", "#356f42"];
const ROSE_COLORS = ["#9f1239", "#be123c", "#dc264d", "#e54867", "#f05b78"];

function setInstances(
  mesh: THREE.InstancedMesh | null,
  transforms: WallTransform[],
  matrix: THREE.Matrix4,
  quaternion: THREE.Quaternion,
) {
  if (!mesh) return;

  transforms.forEach((transform, index) => {
    quaternion.setFromEuler(transform.rotation);
    matrix.compose(transform.position, quaternion, transform.scale);
    mesh.setMatrixAt(index, matrix);
    mesh.setColorAt(index, new THREE.Color(transform.color));
  });
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  mesh.computeBoundingSphere();
}

export function MazeWalls({ maze }: { maze: MazeMatrix }) {
  const hedgeRef = useRef<THREE.InstancedMesh>(null);
  const foliageRef = useRef<THREE.InstancedMesh>(null);
  const petalsRef = useRef<THREE.InstancedMesh>(null);
  const budsRef = useRef<THREE.InstancedMesh>(null);
  const transforms = useMemo(() => {
    const hedges: WallTransform[] = [];
    const foliage: WallTransform[] = [];
    const petals: WallTransform[] = [];
    const buds: WallTransform[] = [];

    maze.forEach((row, rowIndex) =>
      row.forEach((cell, columnIndex) => {
        if (cell === 0) return;

        const center = toWorld({ row: rowIndex, column: columnIndex });
        const seed = rowIndex * 97 + columnIndex * 53;
        const random = (offset: number) => {
          const value = Math.sin((seed + offset) * 12.9898) * 43758.5453;
          return value - Math.floor(value);
        };

        hedges.push({
          color: LEAF_COLORS[Math.floor(random(1) * LEAF_COLORS.length)],
          position: new THREE.Vector3(center.x, WALL_HEIGHT * 0.48, center.z),
          rotation: new THREE.Euler(0, 0, 0),
          scale: new THREE.Vector3(CELL_SIZE * 0.82, WALL_HEIGHT * 0.9, CELL_SIZE * 0.82),
        });

        [-0.66, 0, 0.66].forEach((x, column) => {
          [0.42, 1.15, 1.88, 2.61].forEach((y, row) => {
            const index = row * 3 + column;
            const scale = 0.82 + random(10 + index) * 0.18;
            foliage.push({
              color: LEAF_COLORS[Math.floor(random(30 + index) * LEAF_COLORS.length)],
              position: new THREE.Vector3(
                center.x + x + (random(50 + index) - 0.5) * 0.14,
                y + (random(70 + index) - 0.5) * 0.13,
                center.z + (random(90 + index) - 0.5) * 0.72,
              ),
              rotation: new THREE.Euler(
                random(110 + index) * 0.28,
                random(130 + index) * Math.PI,
                random(150 + index) * 0.24,
              ),
              scale: new THREE.Vector3(scale * 1.12, scale, scale * 1.08),
            });
          });
        });

        const faces = [
          { normalX: 0, normalZ: -1, tangentX: 1, tangentZ: 0 },
          { normalX: 1, normalZ: 0, tangentX: 0, tangentZ: 1 },
          { normalX: 0, normalZ: 1, tangentX: 1, tangentZ: 0 },
          { normalX: -1, normalZ: 0, tangentX: 0, tangentZ: 1 },
        ];
        faces.forEach((face, faceIndex) => {
          for (let roseIndex = 0; roseIndex < 2; roseIndex += 1) {
            const offset = 180 + faceIndex * 30 + roseIndex * 9;
            const tangent =
              (roseIndex === 0 ? -0.38 : 0.38) + (random(offset) - 0.5) * 0.2;
            const height = 0.62 + roseIndex * 1.32 + random(offset + 1) * 0.38;
            const faceDistance = CELL_SIZE * 0.5;
            const position = new THREE.Vector3(
              center.x + face.normalX * faceDistance + face.tangentX * tangent,
              height,
              center.z + face.normalZ * faceDistance + face.tangentZ * tangent,
            );
            const scale = 0.82 + random(offset + 2) * 0.38;
            const colorIndex = Math.floor(random(offset + 3) * ROSE_COLORS.length);
            const normal = new THREE.Vector3(face.normalX, 0, face.normalZ);
            const facing = new THREE.Quaternion().setFromUnitVectors(
              new THREE.Vector3(0, 0, 1),
              normal,
            );

            for (let petalIndex = 0; petalIndex < 5; petalIndex += 1) {
              const angle = (petalIndex / 5) * Math.PI * 2 + random(offset + 4) * 0.3;
              const roll = new THREE.Quaternion().setFromAxisAngle(normal, angle);
              const rotation = new THREE.Euler().setFromQuaternion(roll.multiply(facing));
              const radialOffset = 0.1 * scale;
              petals.push({
                color: ROSE_COLORS[(colorIndex + (petalIndex % 2)) % ROSE_COLORS.length],
                position: new THREE.Vector3(
                  position.x +
                    face.tangentX * Math.cos(angle) * radialOffset +
                    face.normalX * 0.035,
                  position.y + Math.sin(angle) * radialOffset,
                  position.z +
                    face.tangentZ * Math.cos(angle) * radialOffset +
                    face.normalZ * 0.035,
                ),
                rotation,
                scale: new THREE.Vector3(scale * 1.12, scale * 0.78, scale),
              });
            }
            buds.push({
              color: "#72142d",
              position: new THREE.Vector3(
                position.x + face.normalX * 0.07,
                position.y,
                position.z + face.normalZ * 0.07,
              ),
              rotation: new THREE.Euler(0, 0, 0),
              scale: new THREE.Vector3(scale * 0.72, scale * 0.72, scale * 0.56),
            });
          }
        });
      }),
    );

    return { buds, foliage, hedges, petals };
  }, [maze]);

  useLayoutEffect(() => {
    const matrix = new THREE.Matrix4();
    const quaternion = new THREE.Quaternion();
    setInstances(hedgeRef.current, transforms.hedges, matrix, quaternion);
    setInstances(foliageRef.current, transforms.foliage, matrix, quaternion);
    setInstances(petalsRef.current, transforms.petals, matrix, quaternion);
    setInstances(budsRef.current, transforms.buds, matrix, quaternion);
  }, [transforms]);

  return (
    <group>
      <instancedMesh
        args={[undefined, undefined, transforms.hedges.length]}
        castShadow
        receiveShadow
        ref={hedgeRef}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          emissive="#082812"
          emissiveIntensity={1.1}
          roughness={0.94}
          vertexColors
        />
      </instancedMesh>
      <instancedMesh
        args={[undefined, undefined, transforms.foliage.length]}
        castShadow
        receiveShadow
        ref={foliageRef}
      >
        <icosahedronGeometry args={[0.57, 1]} />
        <meshStandardMaterial
          emissive="#0b3519"
          emissiveIntensity={1.15}
          roughness={0.92}
          vertexColors
        />
      </instancedMesh>
      <instancedMesh
        args={[undefined, undefined, transforms.petals.length]}
        castShadow
        ref={petalsRef}
      >
        <circleGeometry args={[0.15, 10]} />
        <meshStandardMaterial
          color="#f13b67"
          emissive="#a60032"
          emissiveIntensity={2.2}
          roughness={0.68}
          side={THREE.DoubleSide}
        />
      </instancedMesh>
      <instancedMesh
        args={[undefined, undefined, transforms.buds.length]}
        castShadow
        ref={budsRef}
      >
        <sphereGeometry args={[0.11, 10, 8]} />
        <meshStandardMaterial
          color="#ffd166"
          emissive="#8f3b14"
          emissiveIntensity={1.4}
          roughness={0.72}
        />
      </instancedMesh>
    </group>
  );
}
