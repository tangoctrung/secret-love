import type * as THREE from "three";

export type MazeMatrix = number[][];
export type Position = { row: number; column: number };
export type TempleKind = "purple" | "orange" | "brown" | "red" | "green" | "indigo";

export type Temple = {
  color: string;
  glow: string;
  intensity: number;
  kind: TempleKind;
  mapColor: string;
  phase: number;
  position: Position;
};

export type RockTransform = {
  color: string;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: THREE.Vector3;
};

export type GameState = {
  goal: Position;
  maze: MazeMatrix;
  temples: Temple[];
};
