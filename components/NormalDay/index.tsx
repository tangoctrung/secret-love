"use client";

import { Canvas } from "@react-three/fiber";
import { useState } from "react";
import { CelestialModal } from "./components/CelestialModal";
import { PlanetSystem } from "./components/PlanetSystem";
import type { CelestialInfo } from "./types";

function NormalDay() {
  const [selectedCelestial, setSelectedCelestial] = useState<CelestialInfo | null>(null);

  return (
    <main className="relative h-screen min-h-140 overflow-hidden bg-[#02030a] text-white">
      <div className="absolute inset-0 h-full w-full">
        <Canvas
          camera={{ position: [0, 8, 16], fov: 54 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: false }}
          style={{ height: "100vh", width: "100vw" }}
        >
          <PlanetSystem onSelect={setSelectedCelestial} />
        </Canvas>
      </div>

      <div className="pointer-events-none absolute left-0 top-0 z-10 w-full px-5 py-5 sm:px-8">
        <div className="max-w-xl">
          <h1 className="mt-3 text-xl font-semibold sm:text-3xl">Hệ mặt trời</h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-white/68 sm:text-base">
            Chọn một hành tinh bất kì để thực hiện thử thách.
          </p>
        </div>
      </div>

      <CelestialModal celestial={selectedCelestial} onClose={() => setSelectedCelestial(null)} />
    </main>
  );
}

export default NormalDay;
