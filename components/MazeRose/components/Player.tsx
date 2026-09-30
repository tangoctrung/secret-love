"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { ENTRANCE, PLAYER_RADIUS } from "../data";
import { isSamePosition, toCell, toWorld } from "../maze";
import type { MazeMatrix, Position } from "../types";

type PlayerProps = {
  goal: Position;
  maze: MazeMatrix;
  mapVisible: boolean;
  onExit: () => void;
  onToggleMap: () => void;
};

export function Player({ goal, maze, mapVisible, onExit, onToggleMap }: PlayerProps) {
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
        onToggleMap();
        return;
      }
      if (
        [
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
          "KeyW",
          "KeyA",
          "KeyS",
          "KeyD",
        ].includes(event.code)
      ) {
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
    if (currentCell && isSamePosition(currentCell, goal) && !exitedRef.current) {
      exitedRef.current = true;
      onExit();
    }
  });

  return null;
}
