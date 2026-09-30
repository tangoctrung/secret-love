import * as THREE from "three";
import {
  CARVE_DIRECTIONS,
  CELL_SIZE,
  COLUMNS,
  ENTRANCE,
  GOAL_OPTIONS,
  LOOP_RATIO,
  ROWS,
  TEMPLE_TYPES,
} from "./data";
import type { GameState, MazeMatrix, Position } from "./types";

function shuffle<T>(items: T[]) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function createMazeMatrix(goal: Position): MazeMatrix {
  const maze = Array.from({ length: ROWS }, () => Array<number>(COLUMNS).fill(1));
  const firstCell = { row: 2, column: 2 };
  const stack = [firstCell];
  maze[firstCell.row][firstCell.column] = 0;

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const nextDirection = shuffle([...CARVE_DIRECTIONS]).find(({ row, column }) => {
      const nextRow = current.row + row;
      const nextColumn = current.column + column;
      return (
        nextRow >= 2 &&
        nextRow <= ROWS - 2 &&
        nextColumn >= 2 &&
        nextColumn <= COLUMNS - 2 &&
        maze[nextRow][nextColumn] === 1
      );
    });

    if (!nextDirection) {
      stack.pop();
      continue;
    }

    const next = {
      row: current.row + nextDirection.row,
      column: current.column + nextDirection.column,
    };
    maze[current.row + nextDirection.row / 2][current.column + nextDirection.column / 2] = 0;
    maze[next.row][next.column] = 0;
    stack.push(next);
  }

  const closedConnections: Position[] = [];
  for (let row = 2; row <= ROWS - 2; row += 2) {
    for (let column = 2; column <= COLUMNS - 2; column += 2) {
      if (column + 2 <= COLUMNS - 2 && maze[row][column + 1] === 1) {
        closedConnections.push({ row, column: column + 1 });
      }
      if (row + 2 <= ROWS - 2 && maze[row + 1][column] === 1) {
        closedConnections.push({ row: row + 1, column });
      }
    }
  }

  shuffle(closedConnections)
    .slice(0, Math.ceil(closedConnections.length * LOOP_RATIO))
    .forEach(({ row, column }) => {
      maze[row][column] = 0;
    });

  maze[ENTRANCE.row][ENTRANCE.column] = 0;
  maze[1][2] = 0;
  maze[goal.row][goal.column] = 0;
  return maze;
}

export function isSamePosition(first: Position, second: Position) {
  return first.row === second.row && first.column === second.column;
}

function getPathDistances(maze: MazeMatrix, start: Position) {
  const distances = Array.from({ length: ROWS }, () => Array<number>(COLUMNS).fill(-1));
  const queue: Position[] = [start];
  let queueIndex = 0;
  distances[start.row][start.column] = 0;

  while (queueIndex < queue.length) {
    const current = queue[queueIndex];
    queueIndex += 1;

    for (const direction of [
      { row: -1, column: 0 },
      { row: 0, column: 1 },
      { row: 1, column: 0 },
      { row: 0, column: -1 },
    ]) {
      const row = current.row + direction.row;
      const column = current.column + direction.column;
      if (
        row >= 0 &&
        row < ROWS &&
        column >= 0 &&
        column < COLUMNS &&
        maze[row][column] === 0 &&
        distances[row][column] === -1
      ) {
        distances[row][column] = distances[current.row][current.column] + 1;
        queue.push({ row, column });
      }
    }
  }

  return distances;
}

function createTemplePositions(maze: MazeMatrix, goal: Position, cells: Position[]) {
  const distancesFromGoal = getPathDistances(maze, goal);
  const goalAnchor = {
    row: Math.min(goal.row, ROWS - 2),
    column: Math.min(goal.column, COLUMNS - 2),
  };
  const selected: Position[] = [];

  for (let index = 0; index < TEMPLE_TYPES.length; index += 1) {
    const sectorRow = Math.floor(index / 3);
    const sectorColumn = index % 3;
    const rowStart = 1 + Math.floor((sectorRow * (ROWS - 2)) / 2);
    const rowEnd = Math.floor(((sectorRow + 1) * (ROWS - 2)) / 2);
    const columnStart = 1 + Math.floor((sectorColumn * (COLUMNS - 2)) / 3);
    const columnEnd = Math.floor(((sectorColumn + 1) * (COLUMNS - 2)) / 3);
    const sectorCells = shuffle(
      cells.filter(
        (position) =>
          position.row >= rowStart &&
          position.row <= rowEnd &&
          position.column >= columnStart &&
          position.column <= columnEnd &&
          !isSamePosition(position, goal),
      ),
    );
    const goalIsInSector =
      goalAnchor.row >= rowStart &&
      goalAnchor.row <= rowEnd &&
      goalAnchor.column >= columnStart &&
      goalAnchor.column <= columnEnd;
    const cellsNearGoal = goalIsInSector
      ? sectorCells.filter(({ row, column }) => {
          const distance = distancesFromGoal[row][column];
          return distance >= 3 && distance <= 8;
        })
      : [];
    const candidates = cellsNearGoal.length > 0 ? cellsNearGoal : sectorCells;
    const position =
      candidates.find((candidate) =>
        selected.every(
          (light) =>
            Math.abs(light.row - candidate.row) +
              Math.abs(light.column - candidate.column) >=
            5,
        ),
      ) ?? candidates[0];

    selected.push(position);
  }

  return selected;
}

export function createGameState(): GameState {
  const goal = GOAL_OPTIONS[Math.floor(Math.random() * GOAL_OPTIONS.length)];
  const maze = createMazeMatrix(goal);
  const pathCells = maze.flatMap((row, rowIndex) =>
    row.flatMap((cell, columnIndex) => {
      const position = { row: rowIndex, column: columnIndex };
      return cell === 0 && !isSamePosition(position, ENTRANCE) ? [position] : [];
    }),
  );
  const templePositions = createTemplePositions(maze, goal, pathCells);
  const temples = TEMPLE_TYPES.map((temple, index) => ({
    ...temple,
    position: templePositions[index],
  }));

  return { goal, maze, temples };
}

export function toWorld(position: Position) {
  return new THREE.Vector3(
    (position.column - (COLUMNS - 1) / 2) * CELL_SIZE,
    1.5,
    (position.row - (ROWS - 1) / 2) * CELL_SIZE,
  );
}

export function toCell(x: number, z: number): Position | null {
  const column = Math.floor(x / CELL_SIZE + COLUMNS / 2);
  const row = Math.floor(z / CELL_SIZE + ROWS / 2);
  return row >= 0 && row < ROWS && column >= 0 && column < COLUMNS
    ? { row, column }
    : null;
}

export function createRockTexture() {
  if (typeof document === "undefined") return new THREE.Texture();

  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext("2d");
  if (!context) return new THREE.Texture();

  context.fillStyle = "#493326";
  context.fillRect(0, 0, 512, 512);

  const grain = context.createImageData(512, 512);
  for (let index = 0; index < grain.data.length; index += 4) {
    const pixel = index / 4;
    const noise = 42 + ((pixel * 37 + Math.floor(pixel / 512) * 71) % 54);
    grain.data[index] = noise + 14;
    grain.data[index + 1] = noise;
    grain.data[index + 2] = Math.max(24, noise - 15);
    grain.data[index + 3] = 120;
  }
  context.putImageData(grain, 0, 0);

  for (let index = 0; index < 210; index += 1) {
    const x = (index * 71) % 512;
    const y = (index * 113) % 512;
    const radius = 3 + ((index * 29) % 22);
    const crater = context.createRadialGradient(
      x - radius * 0.3,
      y - radius * 0.3,
      1,
      x,
      y,
      radius,
    );
    crater.addColorStop(0, "rgba(132, 91, 61, 0.65)");
    crater.addColorStop(0.42, "rgba(68, 43, 29, 0.8)");
    crater.addColorStop(1, "rgba(12, 9, 8, 0.92)");
    context.fillStyle = crater;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
  }

  context.lineCap = "round";
  for (let index = 0; index < 45; index += 1) {
    const x = (index * 97) % 512;
    const y = (index * 157) % 512;
    context.strokeStyle = "rgba(8, 6, 5, 0.66)";
    context.lineWidth = 1 + (index % 3);
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x + 18 + (index % 5) * 5, y - 9 + (index % 4) * 7);
    context.lineTo(x + 31 + (index % 3) * 8, y + 10 + (index % 6) * 4);
    context.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  return texture;
}
