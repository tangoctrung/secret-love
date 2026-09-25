"use client";

import { Stars } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const ROWS = 15;
const COLUMNS = 20;
const CELL_SIZE = 2.1;
const WALL_HEIGHT = 2.8;
const WALL_THICKNESS = 0.42;
const PLAYER_RADIUS = 0.28;

const DIRECTIONS = [
  { row: -1, column: 0, wall: 0, opposite: 2 },
  { row: 0, column: 1, wall: 1, opposite: 3 },
  { row: 1, column: 0, wall: 2, opposite: 0 },
  { row: 0, column: -1, wall: 3, opposite: 1 },
] as const;

type Cell = { walls: [boolean, boolean, boolean, boolean] };
type Position = { row: number; column: number };
type Wall = { x: number; z: number; width: number; depth: number };

function createMaze() {
  const cells: Cell[][] = Array.from({ length: ROWS }, () =>
    Array.from({ length: COLUMNS }, () => ({ walls: [true, true, true, true] })),
  );
  const visited = Array.from({ length: ROWS }, () => Array(COLUMNS).fill(false));
  const stack: Position[] = [{ row: 0, column: 0 }];
  visited[0][0] = true;

  while (stack.length) {
    const current = stack[stack.length - 1];
    const options = DIRECTIONS.filter(({ row, column }) => {
      const nextRow = current.row + row;
      const nextColumn = current.column + column;
      return nextRow >= 0 && nextRow < ROWS && nextColumn >= 0 && nextColumn < COLUMNS && !visited[nextRow][nextColumn];
    });
    if (!options.length) { stack.pop(); continue; }
    const direction = options[Math.floor(Math.random() * options.length)];
    const next = { row: current.row + direction.row, column: current.column + direction.column };
    cells[current.row][current.column].walls[direction.wall] = false;
    cells[next.row][next.column].walls[direction.opposite] = false;
    visited[next.row][next.column] = true;
    stack.push(next);
  }

  cells[0][0].walls[3] = false;
  cells[ROWS - 1][COLUMNS - 1].walls[1] = false;
  return cells;
}

function toWorld(position: Position) {
  return new THREE.Vector3(
    (position.column - (COLUMNS - 1) / 2) * CELL_SIZE,
    1.5,
    (position.row - (ROWS - 1) / 2) * CELL_SIZE,
  );
}

function toCell(x: number, z: number): Position | null {
  const column = Math.floor(x / CELL_SIZE + COLUMNS / 2);
  const row = Math.floor(z / CELL_SIZE + ROWS / 2);
  return row >= 0 && row < ROWS && column >= 0 && column < COLUMNS ? { row, column } : null;
}

function createMeteorTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext("2d");
  if (!context) return new THREE.Texture();
  context.fillStyle = "#515d68";
  context.fillRect(0, 0, 512, 512);
  const grain = context.createImageData(512, 512);
  for (let index = 0; index < grain.data.length; index += 4) {
    const pixel = index / 4;
    const noise = 52 + ((pixel * 37 + Math.floor(pixel / 512) * 71) % 42);
    grain.data[index] = noise;
    grain.data[index + 1] = noise + 5;
    grain.data[index + 2] = noise + 10;
    grain.data[index + 3] = 105;
  }
  context.putImageData(grain, 0, 0);
  for (let index = 0; index < 75; index += 1) {
    const x = (index * 137) % 512;
    const y = (index * 211) % 512;
    const radius = 18 + ((index * 23) % 54);
    context.fillStyle = `rgba(${75 + (index % 4) * 8}, ${82 + (index % 3) * 7}, ${90 + (index % 5) * 5}, 0.22)`;
    context.beginPath();
    context.ellipse(x, y, radius, radius * (0.45 + (index % 4) * 0.12), index * 0.73, 0, Math.PI * 2);
    context.fill();
  }
  for (let index = 0; index < 260; index += 1) {
    const x = (index * 71) % 512;
    const y = (index * 113) % 512;
    const radius = 2 + ((index * 29) % 19);
    const shade = 55 + ((index * 31) % 75);
    const crater = context.createRadialGradient(x - radius * 0.3, y - radius * 0.35, 1, x, y, radius);
    crater.addColorStop(0, `rgb(${shade + 35}, ${shade + 38}, ${shade + 42})`);
    crater.addColorStop(0.38, `rgb(${shade}, ${shade + 3}, ${shade + 7})`);
    crater.addColorStop(1, "rgba(15, 18, 22, 0.85)");
    context.fillStyle = crater;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
  }
  context.lineCap = "round";
  for (let index = 0; index < 38; index += 1) {
    const startX = (index * 83) % 512;
    const startY = (index * 149) % 512;
    context.strokeStyle = "rgba(15, 19, 24, 0.42)";
    context.lineWidth = 1 + (index % 3);
    context.beginPath();
    context.moveTo(startX, startY);
    context.lineTo(startX + 12 + (index % 5) * 7, startY + 8 - (index % 7) * 5);
    context.lineTo(startX + 21 + (index % 4) * 9, startY + 18 + (index % 6) * 4);
    context.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(18, 18);
  return texture;
}

function MazeWalls({ maze, texture }: { maze: Cell[][]; texture: THREE.Texture }) {
  const walls = useMemo<Wall[]>(() => {
    const result: Wall[] = [];
    const startX = -(COLUMNS * CELL_SIZE) / 2;
    const startZ = -(ROWS * CELL_SIZE) / 2;
    maze.forEach((row, rowIndex) => row.forEach((cell, columnIndex) => {
      const x = startX + columnIndex * CELL_SIZE;
      const z = startZ + rowIndex * CELL_SIZE;
      if (cell.walls[0]) result.push({ x: x + CELL_SIZE / 2, z, width: CELL_SIZE + WALL_THICKNESS, depth: WALL_THICKNESS });
      if (cell.walls[3]) result.push({ x, z: z + CELL_SIZE / 2, width: WALL_THICKNESS, depth: CELL_SIZE + WALL_THICKNESS });
      if (rowIndex === ROWS - 1 && cell.walls[2]) result.push({ x: x + CELL_SIZE / 2, z: z + CELL_SIZE, width: CELL_SIZE + WALL_THICKNESS, depth: WALL_THICKNESS });
      if (columnIndex === COLUMNS - 1 && cell.walls[1]) result.push({ x: x + CELL_SIZE, z: z + CELL_SIZE / 2, width: WALL_THICKNESS, depth: CELL_SIZE + WALL_THICKNESS });
    }));
    return result;
  }, [maze]);

  return <group>{walls.map((wall, index) => <mesh castShadow key={`${wall.x}-${wall.z}-${index}`} position={[wall.x, WALL_HEIGHT / 2, wall.z]} receiveShadow><boxGeometry args={[wall.width, WALL_HEIGHT, wall.depth, 5, 7, 5]} /><meshStandardMaterial bumpMap={texture} bumpScale={0.22} displacementBias={-0.045} displacementMap={texture} displacementScale={0.09} map={texture} roughness={1} metalness={0.08} /></mesh>)}</group>;
}

function Player({ maze, onExit, onToggleMap, mapVisible }: { maze: Cell[][]; onExit: () => void; onToggleMap: () => void; mapVisible: boolean }) {
  const { camera, gl } = useThree();
  const keysRef = useRef<Set<string>>(new Set());
  const yawRef = useRef(0);
  const pitchRef = useRef(0);
  const positionRef = useRef(toWorld({ row: 0, column: 0 }));
  const exitedRef = useRef(false);

  useEffect(() => {
    positionRef.current.copy(toWorld({ row: 0, column: 0 }));
    exitedRef.current = false;
    camera.position.copy(positionRef.current);
  }, [camera, maze]);

  useEffect(() => {
    camera.position.copy(positionRef.current);
    const requestPointerLock = () => {
      if (document.pointerLockElement !== gl.domElement) gl.domElement.requestPointerLock();
    };
    const keyDown = (event: KeyboardEvent) => {
      if (event.code === "KeyF") {
        event.preventDefault();
        document.exitPointerLock();
        onToggleMap();
        return;
      }
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "KeyW", "KeyA", "KeyS", "KeyD"].includes(event.code)) event.preventDefault();
      keysRef.current.add(event.code);
    };
    const keyUp = (event: KeyboardEvent) => keysRef.current.delete(event.code);
    const mouseMove = (event: MouseEvent) => {
      if (document.pointerLockElement !== gl.domElement) return;
      yawRef.current -= event.movementX * 0.0022;
      pitchRef.current = THREE.MathUtils.clamp(pitchRef.current - event.movementY * 0.0022, -1.18, 1.18);
    };
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);
    document.addEventListener("mousemove", mouseMove);
    gl.domElement.addEventListener("click", requestPointerLock);
    return () => { window.removeEventListener("keydown", keyDown); window.removeEventListener("keyup", keyUp); document.removeEventListener("mousemove", mouseMove); gl.domElement.removeEventListener("click", requestPointerLock); };
  }, [camera, gl, onToggleMap]);

  useFrame((_, delta) => {
    if (mapVisible) return;
    const keys = keysRef.current;
    const forward = Number(keys.has("ArrowUp") || keys.has("KeyW")) - Number(keys.has("ArrowDown") || keys.has("KeyS"));
    const side = Number(keys.has("ArrowRight") || keys.has("KeyD")) - Number(keys.has("ArrowLeft") || keys.has("KeyA"));
    const speed = 3.25 * Math.min(delta, 0.04);
    const moveX = (-Math.sin(yawRef.current) * forward + Math.cos(yawRef.current) * side) * speed;
    const moveZ = (-Math.cos(yawRef.current) * forward - Math.sin(yawRef.current) * side) * speed;
    const position = positionRef.current;
    const canMoveX = (x: number) => {
      const current = toCell(position.x, position.z);
      const next = toCell(x, position.z);
      if (!current || !next) return false;
      const center = toWorld(current);
      const halfCell = CELL_SIZE / 2;
      const clearance = PLAYER_RADIUS + WALL_THICKNESS / 2 + 0.03;
      if (x > center.x + halfCell - clearance && maze[current.row][current.column].walls[1]) return false;
      if (x < center.x - halfCell + clearance && maze[current.row][current.column].walls[3]) return false;
      if (current.row === next.row && current.column === next.column) return true;
      const direction = DIRECTIONS.find(({ row, column }) => current.row + row === next.row && current.column + column === next.column);
      return Boolean(direction && !maze[current.row][current.column].walls[direction.wall]);
    };
    const canMoveZ = (z: number) => {
      const current = toCell(position.x, position.z);
      const next = toCell(position.x, z);
      if (!current || !next) return false;
      const center = toWorld(current);
      const halfCell = CELL_SIZE / 2;
      const clearance = PLAYER_RADIUS + WALL_THICKNESS / 2 + 0.03;
      if (z > center.z + halfCell - clearance && maze[current.row][current.column].walls[2]) return false;
      if (z < center.z - halfCell + clearance && maze[current.row][current.column].walls[0]) return false;
      if (current.row === next.row && current.column === next.column) return true;
      const direction = DIRECTIONS.find(({ row, column }) => current.row + row === next.row && current.column + column === next.column);
      return Boolean(direction && !maze[current.row][current.column].walls[direction.wall]);
    };
    if (canMoveX(position.x + moveX)) position.x += moveX;
    if (canMoveZ(position.z + moveZ)) position.z += moveZ;
    camera.position.copy(position);
    camera.rotation.set(pitchRef.current, yawRef.current, 0, "YXZ");
    const currentCell = toCell(position.x, position.z);
    if (currentCell?.row === ROWS - 1 && currentCell.column === COLUMNS - 1 && !exitedRef.current) { exitedRef.current = true; onExit(); }
  });

  return null;
}

function FullMap({ maze, onClose }: { maze: Cell[][]; onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const size = 900;
    const padding = 30;
    const cell = Math.min((size - padding * 2) / COLUMNS, (size - padding * 2) / ROWS);
    canvas.width = size;
    canvas.height = size;
    context.fillStyle = "#071019";
    context.fillRect(0, 0, size, size);
    context.fillStyle = "#1d2731";
    context.fillRect(padding, padding, COLUMNS * cell, ROWS * cell);
    context.strokeStyle = "#a7bac9";
    context.lineWidth = 3;
    maze.forEach((row, rowIndex) => row.forEach((cellData, columnIndex) => {
      const x = padding + columnIndex * cell;
      const y = padding + rowIndex * cell;
      context.beginPath();
      if (cellData.walls[0]) { context.moveTo(x, y); context.lineTo(x + cell, y); }
      if (cellData.walls[1]) { context.moveTo(x + cell, y); context.lineTo(x + cell, y + cell); }
      if (cellData.walls[2]) { context.moveTo(x + cell, y + cell); context.lineTo(x, y + cell); }
      if (cellData.walls[3]) { context.moveTo(x, y + cell); context.lineTo(x, y); }
      context.stroke();
    }));
    context.fillStyle = "#ffbc76";
    context.fillRect(padding + cell * 0.27, padding + cell * 0.27, cell * 0.46, cell * 0.46);
    context.fillStyle = "#6debd4";
    context.fillRect(padding + (COLUMNS - 1) * cell + cell * 0.27, padding + (ROWS - 1) * cell + cell * 0.27, cell * 0.46, cell * 0.46);
  }, [maze]);

  return <div className="absolute inset-0 z-30 grid place-items-center bg-[#02050a]/80 p-5 backdrop-blur-sm"><section className="w-full max-w-3xl rounded-lg border border-cyan-100/25 bg-[#09121c] p-4 shadow-2xl sm:p-6"><div className="mb-4 flex items-center justify-between gap-4"><div><p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-100/55">Bản đồ toàn cảnh</p><h2 className="mt-1 text-xl font-semibold">Mê cung 15 x 20</h2></div><button className="rounded-md border border-white/20 px-4 py-2 text-sm transition hover:border-cyan-100/60" onClick={onClose} type="button">Đóng</button></div><canvas aria-label="Bản đồ toàn cảnh mê cung" className="aspect-square w-full rounded border border-white/12 bg-[#071019]" ref={canvasRef} /><p className="mt-3 text-center text-sm text-white/58">Cam là lối vào, xanh là lối ra. Nhấn F để đóng bản đồ.</p></section></div>;
}

function MazeScene({ maze, onExit, onToggleMap, mapVisible }: { maze: Cell[][]; onExit: () => void; onToggleMap: () => void; mapVisible: boolean }) {
  const meteorTexture = useMemo(() => createMeteorTexture(), []);
  useEffect(() => () => meteorTexture.dispose(), [meteorTexture]);
  const size = Math.max(ROWS, COLUMNS) * CELL_SIZE * 1.4;
  const entrance = toWorld({ row: 0, column: 0 });
  const exit = toWorld({ row: ROWS - 1, column: COLUMNS - 1 });
  return <><color attach="background" args={["#07101a"]} /><fog attach="fog" args={["#07101a", 18, 82]} /><ambientLight intensity={0.82} color="#c6e5fa" /><hemisphereLight args={["#a9d8f5", "#202936", 1.65]} /><directionalLight color="#d9efff" intensity={1.3} position={[8, 14, 5]} /><pointLight color="#ffca91" intensity={48} distance={21} position={[entrance.x, 2, entrance.z]} /><pointLight color="#8effe6" intensity={56} distance={20} position={[exit.x, 2, exit.z]} /><Stars radius={120} depth={55} count={2600} factor={3} saturation={0.25} fade speed={0.4} /><mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[size, size, 128, 128]} /><meshStandardMaterial bumpMap={meteorTexture} bumpScale={0.2} displacementBias={-0.045} displacementMap={meteorTexture} displacementScale={0.09} map={meteorTexture} roughness={1} metalness={0.03} /></mesh><MazeWalls maze={maze} texture={meteorTexture} /><mesh position={[entrance.x, 0.06, entrance.z]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.48, 32]} /><meshBasicMaterial color="#ffbf79" /></mesh><mesh position={[exit.x, 0.06, exit.z]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.48, 32]} /><meshBasicMaterial color="#6ce8d4" /></mesh><Player mapVisible={mapVisible} maze={maze} onExit={onExit} onToggleMap={onToggleMap} /></>;
}

function MazeRose() {
  const [maze, setMaze] = useState<Cell[][]>(() => createMaze());
  const [won, setWon] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);
  const restart = useCallback(() => { setWon(false); setMapVisible(false); setMaze(createMaze()); }, []);
  const toggleMap = useCallback(() => setMapVisible((visible) => !visible), []);

  return <main className="relative h-screen overflow-hidden bg-[#07101a] text-white"><Canvas camera={{ fov: 72, position: toWorld({ row: 0, column: 0 }) }} dpr={[1, 1.5]} gl={{ antialias: true }} shadows><MazeScene mapVisible={mapVisible} maze={maze} onExit={() => setWon(true)} onToggleMap={toggleMap} /></Canvas><div className="pointer-events-none absolute inset-0 z-10"><header className="flex items-start justify-between px-5 py-5 sm:px-8"><div><p className="text-xs font-medium uppercase tracking-[0.24em] text-cyan-100/65">Mê cung thiên thạch</p><h1 className="mt-2 text-xl font-semibold sm:text-3xl">Tìm lối ra</h1></div><button className="pointer-events-auto rounded-md border border-white/18 bg-black/35 px-4 py-2 text-sm font-medium backdrop-blur transition hover:border-cyan-100/60 hover:bg-cyan-100/10" onClick={restart} type="button">Tạo lại</button></header><div className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/80 shadow-[0_0_12px_rgba(170,229,255,0.9)]" /><p className="absolute bottom-5 left-1/2 w-full -translate-x-1/2 px-5 text-center text-sm text-white/72 sm:bottom-7">Click để xoay camera. Dùng W/A/S/D hoặc phím mũi tên để di chuyển. Nhấn F xem bản đồ.</p></div>{mapVisible ? <FullMap maze={maze} onClose={toggleMap} /> : null}{won ? <div className="absolute inset-0 z-20 grid place-items-center bg-[#02050a]/65 px-5 backdrop-blur-sm"><section className="w-full max-w-sm rounded-lg border border-cyan-100/25 bg-[#0b1420]/95 p-7 text-center shadow-2xl"><p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-100/65">Tín hiệu đã được khôi phục</p><h2 className="mt-3 text-2xl font-semibold">Bạn đã tìm thấy lối ra</h2><button className="mt-6 rounded-md bg-cyan-100 px-5 py-2.5 font-semibold text-[#06111a] transition hover:bg-white" onClick={restart} type="button">Chơi lại</button></section></div> : null}</main>;
}

export default MazeRose;
