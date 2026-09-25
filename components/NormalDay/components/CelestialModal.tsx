"use client";

import { useRouter } from "next/navigation";
import type { CSSProperties } from "react";
import type { CelestialInfo } from "../types";

type CelestialModalProps = {
  celestial: CelestialInfo | null;
  onClose: () => void;
};

export function CelestialModal({ celestial, onClose }: CelestialModalProps) {
  const router = useRouter();

  if (!celestial) {
    return null;
  }

  function handleChallenge() {
    router.push("/mazerose");
  }

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-black/55 px-4 py-6 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <section
        aria-modal="true"
        className="w-full max-w-md rounded-lg border border-white/15 bg-[#090d18]/95 p-6 text-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-white/45">{celestial.subtitle}</p>
            <h2 className="mt-2 text-3xl font-semibold">{celestial.name}</h2>
          </div>
          <button
            aria-label="Đóng modal"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/15 text-2xl leading-none text-white/70 transition hover:border-white/40 hover:text-white"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>

        <div className="mt-5 h-1.5 rounded-full" style={{ backgroundColor: celestial.accent }} />
        <p className="mt-5 text-base leading-7 text-white/78">{celestial.description}</p>

        <div className="mt-6 grid gap-3">
          {celestial.facts.map((fact) => (
            <div key={fact} className="rounded-md border border-white/10 bg-white/4 px-4 py-3 text-sm text-white/76">
              {fact}
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-center">
          <button
            aria-label={`Thử thách với ${celestial.name}`}
            className="challenge-button grid min-h-12 min-w-36 shrink-0 cursor-pointer place-items-center rounded-md border px-6 py-3 font-semibold leading-none"
            onClick={handleChallenge}
            style={{ "--challenge-accent": celestial.accent } as CSSProperties}
            type="button"
          >
            <span className="relative z-10">Thử thách</span>
          </button>
        </div>
      </section>
    </div>
  );
}
