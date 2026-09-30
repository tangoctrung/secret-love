import type { Position, Temple } from "./types";

export const ROWS = 30;
export const COLUMNS = 30;
export const CELL_SIZE = 2.1;
export const WALL_HEIGHT = 3.1;
export const PLAYER_RADIUS = 0.3;
export const ENTRANCE = { row: 1, column: 1 };
export const LOOP_RATIO = 0.35;

export const CARVE_DIRECTIONS = [
  { row: -2, column: 0 },
  { row: 0, column: 2 },
  { row: 2, column: 0 },
  { row: 0, column: -2 },
] as const;

export const GOAL_OPTIONS: Position[] = [
  { row: 26, column: 18 },
  { row: 28, column: 26 },
];

export const TEMPLE_TYPES: Omit<Temple, "position">[] = [
  {
    color: "#8b4dff",
    glow: "#b56cff",
    intensity: 36,
    kind: "purple",
    mapColor: "#b56cff",
    phase: 0.2,
  },
  {
    color: "#e77624",
    glow: "#ff9f43",
    intensity: 38,
    kind: "orange",
    mapColor: "#ff9f43",
    phase: 1.1,
  },
  {
    color: "#74462d",
    glow: "#a96f45",
    intensity: 36,
    kind: "brown",
    mapColor: "#a96f45",
    phase: 2,
  },
  {
    color: "#d81f32",
    glow: "#ff4d5a",
    intensity: 38,
    kind: "red",
    mapColor: "#ff4d5a",
    phase: 2.9,
  },
  {
    color: "#39b966",
    glow: "#55d982",
    intensity: 38,
    kind: "green",
    mapColor: "#55d982",
    phase: 3.8,
  },
  {
    color: "#3f4fc7",
    glow: "#5968e8",
    intensity: 38,
    kind: "indigo",
    mapColor: "#5968e8",
    phase: 4.7,
  },
];

export const TREE_POSITIONS: [number, number, number][] = [
  [-24, 0, -11],
  [-19, 0, -15],
  [-13, 0, -10],
  [-7, 0, -14],
  [2, 0, -13],
  [9, 0, -10],
  [16, 0, -14],
  [23, 0, -9],
  [-25, 0, 9],
  [24, 0, 10],
];

export const FLOWER_COLORS = ["#ff5d8f", "#ffd84d", "#a66cff", "#ff7657", "#f6f0ff"];
