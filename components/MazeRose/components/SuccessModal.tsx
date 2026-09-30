"use client";

export function SuccessModal({ onEnterGarden }: { onEnterGarden: () => void }) {
  return (
    <div className="absolute inset-0 z-20 grid place-items-center bg-[#080503]/70 px-5 backdrop-blur-sm">
      <section className="w-full max-w-sm rounded-lg border border-amber-100/25 bg-[#1a100b]/95 p-7 text-center shadow-2xl">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-amber-100/65">
          Đã rời khỏi mê cung
        </p>
        <h2 className="mt-3 text-2xl font-semibold">Bạn đã tìm thấy lối ra</h2>
        <p className="mt-3 text-sm leading-6 text-white/68">
          Một khu vườn đang mở ra phía sau mê cung.
        </p>
        <button
          className="mt-6 rounded-md bg-amber-100 px-5 py-2.5 font-semibold text-[#160d08] transition hover:bg-white"
          onClick={onEnterGarden}
          type="button"
        >
          Bước vào khu vườn
        </button>
      </section>
    </div>
  );
}
