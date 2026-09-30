"use client";

import { Stars } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import { CELL_SIZE, COLUMNS, ENTRANCE, ROWS } from "../data";
import { createRockTexture, toWorld } from "../maze";
import type { MazeMatrix, Position, Temple } from "../types";
import { MazeWalls } from "./MazeWalls";
import { Player } from "./Player";
import { TempleMarker } from "./TempleMarker";

type MazeSceneProps = {
  goal: Position;
  maze: MazeMatrix;
  mapVisible: boolean;
  onExit: () => void;
  onToggleMap: () => void;
  temples: Temple[];
};

export function MazeScene({
  goal,
  maze,
  mapVisible,
  onExit,
  onToggleMap,
  temples,
}: MazeSceneProps) {
  const rockTexture = useMemo(() => createRockTexture(), []);
  useEffect(() => () => rockTexture.dispose(), [rockTexture]);
  const width = COLUMNS * CELL_SIZE;
  const depth = ROWS * CELL_SIZE;
  const entrance = toWorld(ENTRANCE);
  const goalWorld = toWorld(goal);

  return (
    <>
      <color attach="background" args={["#0b0708"]} />
      <fog attach="fog" args={["#130d13", 14, 62]} />
      <ambientLight color="#ffe1c4" intensity={0.9} />
      <hemisphereLight args={["#e8b98e", "#17101a", 1.75]} />
      <directionalLight color="#ffd4aa" intensity={1.65} position={[7, 14, 5]} />
      <pointLight
        color="#ffb168"
        distance={18}
        intensity={45}
        position={[entrance.x, 2, entrance.z]}
      />
      <pointLight
        color="#7ff0d9"
        distance={15}
        intensity={42}
        position={[goalWorld.x, 2, goalWorld.z]}
      />
      <Stars count={2200} depth={50} factor={3} fade radius={100} speed={0.35} />
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, depth, 120, 90]} />
        <meshStandardMaterial
          bumpMap={rockTexture}
          bumpScale={0.22}
          color="#5a4638"
          displacementBias={-0.04}
          displacementMap={rockTexture}
          displacementScale={0.08}
          map={rockTexture}
          roughness={1}
        />
      </mesh>
      <MazeWalls maze={maze} texture={rockTexture} />
      <mesh position={[entrance.x, 0.07, entrance.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.42, 32]} />
        <meshBasicMaterial color="#ffb86f" />
      </mesh>
      <mesh position={[goalWorld.x, 0.07, goalWorld.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.42, 32]} />
        <meshBasicMaterial color="#6ce8d4" />
      </mesh>
      {temples.map((temple) => (
        <TempleMarker
          key={`${temple.kind}-${temple.position.row}-${temple.position.column}`}
          temple={temple}
        />
      ))}
      <Player
        goal={goal}
        mapVisible={mapVisible}
        maze={maze}
        onExit={onExit}
        onToggleMap={onToggleMap}
      />
    </>
  );
}
