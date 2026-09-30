"use client";

import { Canvas } from "@react-three/fiber";
import { useCallback, useState } from "react";
import { FullMap } from "./components/FullMap";
import { GardenScreen } from "./components/GardenScreen";
import { MazeScene } from "./components/MazeScene";
import { SuccessModal } from "./components/SuccessModal";
import { ENTRANCE } from "./data";
import { createGameState, toWorld } from "./maze";
import type { GameState } from "./types";

function MazeRose() {
  const [game, setGame] = useState<GameState>(() => createGameState());
  const [won, setWon] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);
  const [showGarden, setShowGarden] = useState(false);
  const restart = useCallback(() => {
    setWon(false);
    setMapVisible(false);
    setShowGarden(false);
    setGame(createGameState());
  }, []);
  const enterGarden = useCallback(() => {
    if (document.pointerLockElement) document.exitPointerLock();
    setWon(false);
    setShowGarden(true);
  }, []);
  const toggleMap = useCallback(() => setMapVisible((visible) => !visible), []);

  if (showGarden) return <GardenScreen onRestart={restart} />;

  return (
    <main className="relative h-screen overflow-hidden bg-[#090604] text-white">
      <Canvas
        camera={{ fov: 72, position: toWorld(ENTRANCE) }}
        dpr={[1, 1.5]}
        gl={{ antialias: true }}
        shadows
      >
        <MazeScene
          goal={game.goal}
          mapVisible={mapVisible}
          maze={game.maze}
          onExit={() => setWon(true)}
          onToggleMap={toggleMap}
          temples={game.temples}
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

      {mapVisible ? (
        <FullMap
          goal={game.goal}
          maze={game.maze}
          onClose={toggleMap}
          temples={game.temples}
        />
      ) : null}

      {won ? <SuccessModal onEnterGarden={enterGarden} /> : null}
    </main>
  );
}

export default MazeRose;
