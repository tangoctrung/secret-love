"use client";

import { Canvas } from "@react-three/fiber";
import { GardenWorld } from "./GardenWorld";

export function GardenScreen({ onRestart }: { onRestart: () => void }) {
  return (
    <main className="relative h-screen overflow-hidden bg-[#87cdf2] text-white">
      <Canvas
        camera={{ fov: 58, position: [0, 1.65, 18] }}
        dpr={[1, 1.5]}
        gl={{ antialias: true }}
        shadows
      >
        <GardenWorld />
      </Canvas>
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-6 sm:p-9">
        <div className="max-w-xl text-shadow-lg">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/80">
            Phía sau mê cung
          </p>
          <h1 className="mt-2 text-3xl font-semibold sm:text-5xl">Khu vườn bí mật</h1>
          <p className="mt-3 text-sm text-white/88 sm:text-base">
            Dòng sông, vườn hoa và bầu trời đang chờ ở phía bên kia.
          </p>
        </div>
        <button
          className="pointer-events-auto w-fit rounded-md border border-white/70 bg-[#235a3d]/75 px-5 py-2.5 text-sm font-semibold shadow-lg backdrop-blur transition hover:bg-[#19472f]"
          onClick={onRestart}
          type="button"
        >
          Trở lại mê cung
        </button>
      </div>
    </main>
  );
}
