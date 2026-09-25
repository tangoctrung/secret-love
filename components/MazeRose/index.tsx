"use client";

import { Stars } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const ROWS = 15;
const COLUMNS = 20;
const CELL_SIZE = 2.1;
const WALL_HEIGHT = 3.1;
const PLAYER_RADIUS = 0.3;
const ENTRANCE = { row: 1, column: 0 };
const EXIT = { row: ROWS - 2, column: COLUMNS - 1 };

type MazeMatrix = number[][];
type Position = { row: number; column: number };
type RockTransform = {
  color: string;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: THREE.Vector3;
};

const CARVE_DIRECTIONS = [
  { row: -2, column: 0 },
  { row: 0, column: 2 },
  { row: 2, column: 0 },
  { row: 0, column: -2 },
] as const;

function createMazeMatrix(): MazeMatrix {
  const matrix = Array.from({ length: ROWS }, () => Array<number>(COLUMNS).fill(1));
  const stack: Position[] = [{ row: 1, column: 1 }];
  matrix[1][1] = 0;

  while (stack.length) {
    const current = stack[stack.length - 1];
    const options = CARVE_DIRECTIONS.filter(({ row, column }) => {
      const nextRow = current.row + row;
      const nextColumn = current.column + column;
      return (
        nextRow > 0 &&
        nextRow < ROWS - 1 &&
        nextColumn > 0 &&
        nextColumn < COLUMNS - 1 &&
        matrix[nextRow][nextColumn] === 1
      );
    });

    if (!options.length) {
      stack.pop();
      continue;
    }

    const direction = options[Math.floor(Math.random() * options.length)];
    const next = {
      row: current.row + direction.row,
      column: current.column + direction.column,
    };
    matrix[current.row + direction.row / 2][current.column + direction.column / 2] = 0;
    matrix[next.row][next.column] = 0;
    stack.push(next);
  }

  matrix[ENTRANCE.row][ENTRANCE.column] = 0;
  matrix[EXIT.row][EXIT.column - 1] = 0;
  matrix[EXIT.row][EXIT.column] = 0;
  return matrix;
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
  return row >= 0 && row < ROWS && column >= 0 && column < COLUMNS
    ? { row, column }
    : null;
}

function createRockTexture() {
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
    const crater = context.createRadialGradient(x - radius * 0.3, y - radius * 0.3, 1, x, y, radius);
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

function MazeWalls({ maze, texture }: { maze: MazeMatrix; texture: THREE.Texture }) {
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
              position: new THREE.Vector3(center.x + axisX * 0.38, 0.56, center.z + axisZ * 0.38),
              rotation: new THREE.Euler(random(3) * 0.32, random(4) * Math.PI, random(5) * 0.24),
              scale: new THREE.Vector3(1.05 + random(6) * 0.16, 0.72 + random(7) * 0.13, 0.94 + random(8) * 0.17),
            },
            {
              color: palette[Math.floor(random(9) * palette.length)],
              position: new THREE.Vector3(center.x - axisX * 0.38, 0.58, center.z - axisZ * 0.38),
              rotation: new THREE.Euler(random(10) * 0.3, random(11) * Math.PI, random(12) * 0.22),
              scale: new THREE.Vector3(0.98 + random(13) * 0.18, 0.7 + random(14) * 0.14, 1 + random(15) * 0.14),
            },
            {
              color: palette[Math.floor(random(16) * palette.length)],
              position: new THREE.Vector3(center.x + axisZ * 0.24, 1.38, center.z - axisX * 0.24),
              rotation: new THREE.Euler(random(17) * 0.38, random(18) * Math.PI, random(19) * 0.28),
              scale: new THREE.Vector3(0.85 + random(20) * 0.14, 0.66 + random(21) * 0.12, 0.8 + random(22) * 0.16),
            },
            {
              color: palette[Math.floor(random(23) * palette.length)],
              position: new THREE.Vector3(center.x - axisZ * 0.2, 1.48, center.z + axisX * 0.2),
              rotation: new THREE.Euler(random(24) * 0.35, random(25) * Math.PI, random(26) * 0.3),
              scale: new THREE.Vector3(0.76 + random(27) * 0.14, 0.62 + random(28) * 0.12, 0.78 + random(29) * 0.13),
            },
            {
              color: palette[Math.floor(random(30) * palette.length)],
              position: new THREE.Vector3(center.x + (random(31) - 0.5) * 0.18, WALL_HEIGHT - 0.72, center.z + (random(32) - 0.5) * 0.18),
              rotation: new THREE.Euler(random(33) * 0.4, random(34) * Math.PI, random(35) * 0.32),
              scale: new THREE.Vector3(0.58 + random(36) * 0.13, 0.53 + random(37) * 0.1, 0.57 + random(38) * 0.13),
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

function Player({
  maze,
  mapVisible,
  onExit,
  onToggleMap,
}: {
  maze: MazeMatrix;
  mapVisible: boolean;
  onExit: () => void;
  onToggleMap: () => void;
}) {
  const { camera, gl } = useThree();
  const keysRef = useRef<Set<string>>(new Set());
  const yawRef = useRef(-Math.PI / 2);
  const pitchRef = useRef(0);
  const positionRef = useRef(toWorld(ENTRANCE));
  const exitedRef = useRef(false);

  useEffect(() => {
    positionRef.current.copy(toWorld(ENTRANCE));
    yawRef.current = -Math.PI / 2;
    pitchRef.current = 0;
    exitedRef.current = false;
    camera.position.copy(positionRef.current);
    camera.rotation.set(0, yawRef.current, 0, "YXZ");
  }, [camera, maze]);

  useEffect(() => {
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
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "KeyW", "KeyA", "KeyS", "KeyD"].includes(event.code)) {
        event.preventDefault();
      }
      keysRef.current.add(event.code);
    };
    const keyUp = (event: KeyboardEvent) => keysRef.current.delete(event.code);
    const mouseMove = (event: MouseEvent) => {
      if (document.pointerLockElement !== gl.domElement) return;
      yawRef.current -= event.movementX * 0.0022;
      pitchRef.current = THREE.MathUtils.clamp(
        pitchRef.current - event.movementY * 0.0022,
        -1.18,
        1.18,
      );
    };

    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);
    document.addEventListener("mousemove", mouseMove);
    gl.domElement.addEventListener("click", requestPointerLock);
    return () => {
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
      document.removeEventListener("mousemove", mouseMove);
      gl.domElement.removeEventListener("click", requestPointerLock);
    };
  }, [gl, onToggleMap]);

  useFrame((_, delta) => {
    if (mapVisible) return;

    const keys = keysRef.current;
    const forward =
      Number(keys.has("ArrowUp") || keys.has("KeyW")) -
      Number(keys.has("ArrowDown") || keys.has("KeyS"));
    const side =
      Number(keys.has("ArrowRight") || keys.has("KeyD")) -
      Number(keys.has("ArrowLeft") || keys.has("KeyA"));
    const speed = 3.25 * Math.min(delta, 0.04);
    const moveX =
      (-Math.sin(yawRef.current) * forward + Math.cos(yawRef.current) * side) * speed;
    const moveZ =
      (-Math.cos(yawRef.current) * forward - Math.sin(yawRef.current) * side) * speed;
    const position = positionRef.current;

    const collides = (x: number, z: number) => {
      const offsets = [
        [0, 0],
        [PLAYER_RADIUS, 0],
        [-PLAYER_RADIUS, 0],
        [0, PLAYER_RADIUS],
        [0, -PLAYER_RADIUS],
      ];
      return offsets.some(([offsetX, offsetZ]) => {
        const cell = toCell(x + offsetX, z + offsetZ);
        return !cell || maze[cell.row][cell.column] === 1;
      });
    };

    if (!collides(position.x + moveX, position.z)) position.x += moveX;
    if (!collides(position.x, position.z + moveZ)) position.z += moveZ;

    camera.position.copy(position);
    camera.rotation.set(pitchRef.current, yawRef.current, 0, "YXZ");
    const currentCell = toCell(position.x, position.z);
    if (
      currentCell?.row === EXIT.row &&
      currentCell.column === EXIT.column &&
      !exitedRef.current
    ) {
      exitedRef.current = true;
      onExit();
    }
  });

  return null;
}

function FullMap({ maze, onClose }: { maze: MazeMatrix; onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const cell = 36;
    canvas.width = COLUMNS * cell;
    canvas.height = ROWS * cell;
    maze.forEach((row, rowIndex) =>
      row.forEach((value, columnIndex) => {
        context.fillStyle = value === 1 ? "#382419" : "#a6afb4";
        context.fillRect(columnIndex * cell, rowIndex * cell, cell, cell);
        if (value === 1) {
          context.fillStyle = "rgba(12, 8, 6, 0.36)";
          context.beginPath();
          context.arc(
            columnIndex * cell + cell * 0.45,
            rowIndex * cell + cell * 0.48,
            cell * 0.18,
            0,
            Math.PI * 2,
          );
          context.fill();
        }
      }),
    );
    context.fillStyle = "#ffbd78";
    context.fillRect(ENTRANCE.column * cell + 8, ENTRANCE.row * cell + 8, cell - 16, cell - 16);
    context.fillStyle = "#69ead4";
    context.fillRect(EXIT.column * cell + 8, EXIT.row * cell + 8, cell - 16, cell - 16);
  }, [maze]);

  return (
    <div className="absolute inset-0 z-30 grid place-items-center bg-[#02050a]/80 p-5 backdrop-blur-sm">
      <section className="w-full max-w-4xl rounded-lg border border-amber-100/25 bg-[#130e0b] p-4 shadow-2xl sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-amber-100/55">
              Bản đồ ma trận
            </p>
            <h2 className="mt-1 text-xl font-semibold">Mê cung 15 x 20</h2>
          </div>
          <button
            className="rounded-md border border-white/20 px-4 py-2 text-sm transition hover:border-amber-100/60"
            onClick={onClose}
            type="button"
          >
            Đóng
          </button>
        </div>
        <canvas
          aria-label="Bản đồ ma trận mê cung"
          className="aspect-[4/3] w-full rounded border border-white/12 bg-[#100b08]"
          ref={canvasRef}
        />
        <p className="mt-3 text-center text-sm text-white/58">
          Đen nâu là tường, xám là đường đi. Nhấn F để đóng bản đồ.
        </p>
      </section>
    </div>
  );
}

function MysticLight({
  color,
  intensity,
  phase,
  position,
}: {
  color: string;
  intensity: number;
  phase: number;
  position: THREE.Vector3;
}) {
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (!lightRef.current) return;
    lightRef.current.intensity =
      intensity * (0.88 + Math.sin(state.clock.elapsedTime * 0.72 + phase) * 0.12);
  });

  return (
    <pointLight
      color={color}
      decay={1.65}
      distance={15}
      intensity={intensity}
      position={[position.x, 1.9, position.z]}
      ref={lightRef}
    />
  );
}

function MazeScene({
  maze,
  mapVisible,
  onExit,
  onToggleMap,
}: {
  maze: MazeMatrix;
  mapVisible: boolean;
  onExit: () => void;
  onToggleMap: () => void;
}) {
  const rockTexture = useMemo(() => createRockTexture(), []);
  useEffect(() => () => rockTexture.dispose(), [rockTexture]);
  const width = COLUMNS * CELL_SIZE;
  const depth = ROWS * CELL_SIZE;
  const entrance = toWorld(ENTRANCE);
  const exit = toWorld(EXIT);
  const zoneLights = [
    { color: "#ff754f", intensity: 34, phase: 0.2, position: toWorld({ row: 3, column: 4 }) },
    { color: "#668cff", intensity: 36, phase: 1.4, position: toWorld({ row: 3, column: 15 }) },
    { color: "#c36cff", intensity: 32, phase: 2.7, position: toWorld({ row: 8, column: 9 }) },
    { color: "#ffca69", intensity: 35, phase: 4.1, position: toWorld({ row: 12, column: 4 }) },
    { color: "#5fffd4", intensity: 38, phase: 5.3, position: toWorld({ row: 11, column: 16 }) },
  ];

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
        distance={18}
        intensity={52}
        position={[exit.x, 2, exit.z]}
      />
      {zoneLights.map((light) => (
        <MysticLight
          color={light.color}
          intensity={light.intensity}
          key={light.color}
          phase={light.phase}
          position={light.position}
        />
      ))}
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
      <mesh position={[exit.x, 0.07, exit.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.42, 32]} />
        <meshBasicMaterial color="#6ce8d4" />
      </mesh>
      <Player
        mapVisible={mapVisible}
        maze={maze}
        onExit={onExit}
        onToggleMap={onToggleMap}
      />
    </>
  );
}

function MazeRose() {
  const [maze, setMaze] = useState<MazeMatrix>(() => createMazeMatrix());
  const [won, setWon] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);
  const restart = useCallback(() => {
    setWon(false);
    setMapVisible(false);
    setMaze(createMazeMatrix());
  }, []);
  const toggleMap = useCallback(() => setMapVisible((visible) => !visible), []);

  return (
    <main className="relative h-screen overflow-hidden bg-[#090604] text-white">
      <Canvas
        camera={{ fov: 72, position: toWorld(ENTRANCE) }}
        dpr={[1, 1.5]}
        gl={{ antialias: true }}
        shadows
      >
        <MazeScene
          mapVisible={mapVisible}
          maze={maze}
          onExit={() => setWon(true)}
          onToggleMap={toggleMap}
        />
      </Canvas>

      <div className="pointer-events-none absolute inset-0 z-10">
        <header className="flex items-start justify-between px-5 py-5 sm:px-8">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-amber-100/65">
              Mê cung hoa hồng
            </p>
            <h1 className="mt-2 text-xl font-semibold sm:text-3xl">
              Tìm lối ra và sẽ nhìn thấy 1 bí mật
            </h1>
          </div>
          <button
            className="pointer-events-auto rounded-md border border-white/18 bg-black/35 px-4 py-2 text-sm font-medium backdrop-blur transition hover:border-amber-100/60 hover:bg-amber-100/10"
            onClick={restart}
            type="button"
          >
            Tạo lại
          </button>
        </header>
        <div className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/80 shadow-[0_0_12px_rgba(255,190,125,0.9)]" />
      </div>

      {mapVisible ? <FullMap maze={maze} onClose={toggleMap} /> : null}

      {won ? (
        <div className="absolute inset-0 z-20 grid place-items-center bg-[#080503]/70 px-5 backdrop-blur-sm">
          <section className="w-full max-w-sm rounded-lg border border-amber-100/25 bg-[#1a100b]/95 p-7 text-center shadow-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-amber-100/65">
              Đã rời khỏi mê cung
            </p>
            <h2 className="mt-3 text-2xl font-semibold">Bạn đã tìm thấy lối ra</h2>
            <button
              className="mt-6 rounded-md bg-amber-100 px-5 py-2.5 font-semibold text-[#160d08] transition hover:bg-white"
              onClick={restart}
              type="button"
            >
              Chơi lại
            </button>
          </section>
        </div>
      ) : null}
    </main>
  );
}

export default MazeRose;
