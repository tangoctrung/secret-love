"use client";

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
  const sunsetLightPosition: [number, number, number] = [42, 34, -24];

  return (
    <>
      <color attach="background" args={["#9a704d"]} />
      <fog attach="fog" args={["#76533f", 24, 78]} />
      <ambientLight color="#f2c99b" intensity={0.86} />
      <hemisphereLight args={["#d8a66c", "#30242a", 1.45]} />
      <directionalLight
        color="#e9a566"
        intensity={2.3}
        position={sunsetLightPosition}
      />
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
      <MazeWalls maze={maze} />
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
