"use client";

import { useEffect, useRef } from "react";
import { COLUMNS, ENTRANCE, ROWS } from "../data";
import type { MazeMatrix, Position, Temple } from "../types";

type FullMapProps = {
  goal: Position;
  maze: MazeMatrix;
  onClose: () => void;
  temples: Temple[];
};

export function FullMap({ goal, maze, onClose, temples }: FullMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const cell = 18;
    canvas.width = COLUMNS * cell;
    canvas.height = ROWS * cell;
    maze.forEach((row, rowIndex) =>
      row.forEach((value, columnIndex) => {
        context.fillStyle = value === 1 ? "#245c36" : "#a6afb4";
        context.fillRect(columnIndex * cell, rowIndex * cell, cell, cell);
        if (value === 1) {
          context.fillStyle = "rgba(7, 30, 16, 0.42)";
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
    context.fillRect(
      ENTRANCE.column * cell + 4,
      ENTRANCE.row * cell + 4,
      cell - 8,
      cell - 8,
    );
    context.fillStyle = "#69ead4";
    context.fillRect(goal.column * cell + 4, goal.row * cell + 4, cell - 8, cell - 8);
    temples.forEach((temple) => {
      const centerX = temple.position.column * cell + cell / 2;
      const centerY = temple.position.row * cell + cell / 2;
      context.fillStyle = temple.mapColor;
      context.beginPath();
      context.moveTo(centerX, centerY - cell * 0.32);
      context.lineTo(centerX + cell * 0.32, centerY);
      context.lineTo(centerX, centerY + cell * 0.32);
      context.lineTo(centerX - cell * 0.32, centerY);
      context.closePath();
      context.fill();
      context.strokeStyle = "rgba(255,255,255,0.8)";
      context.lineWidth = 1.5;
      context.stroke();
    });
  }, [goal, maze, temples]);

  return (
    <div className="absolute inset-0 z-30 grid cursor-none place-items-center bg-[#02050a]/80 p-5 backdrop-blur-sm [&_*]:cursor-none">
      <section className="w-full max-w-4xl rounded-lg border border-amber-100/25 bg-[#130e0b] p-4 shadow-2xl sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-amber-100/55">
              Bản đồ ma trận
            </p>
            <h2 className="mt-1 text-xl font-semibold">Mê cung 30 x 30</h2>
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
          className="mx-auto aspect-square w-full max-w-[70vh] rounded border border-white/12 bg-[#100b08]"
          ref={canvasRef}
        />
        <p className="mt-3 text-center text-sm text-white/58">
          Cam là điểm xuất hiện, xanh ngọc là đích, sáu hình thoi màu là đèn định vị.
        </p>
      </section>
    </div>
  );
}
