"use client";

import { PerspectiveCamera } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import * as THREE from "three";

export function GardenPlayer() {
  const { gl } = useThree();
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const yawRef = useRef(0);
  const pitchRef = useRef(-0.04);
  const positionRef = useRef(new THREE.Vector3(0, 1.65, 18));
  const [wideView, setWideView] = useState(false);

  useLayoutEffect(() => {
    if (!cameraRef.current) return;
    cameraRef.current.position.copy(positionRef.current);
    cameraRef.current.rotation.set(pitchRef.current, yawRef.current, 0, "YXZ");
  }, []);

  useEffect(() => {
    const requestPointerLock = () => {
      if (document.pointerLockElement !== gl.domElement) gl.domElement.requestPointerLock();
    };
    const keyDown = (event: KeyboardEvent) => {
      if (event.code === "KeyV" && !event.repeat) {
        setWideView((isWide) => !isWide);
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
  }, [gl]);

  useFrame((_, delta) => {
    const camera = cameraRef.current;
    if (!camera) return;
    const keys = keysRef.current;
    const forward =
      Number(keys.has("ArrowUp") || keys.has("KeyW")) -
      Number(keys.has("ArrowDown") || keys.has("KeyS"));
    const side =
      Number(keys.has("ArrowRight") || keys.has("KeyD")) -
      Number(keys.has("ArrowLeft") || keys.has("KeyA"));
    const speed = 4.2 * Math.min(delta, 0.04);
    const position = positionRef.current;
    const nextX =
      position.x +
      (-Math.sin(yawRef.current) * forward + Math.cos(yawRef.current) * side) * speed;
    const nextZ =
      position.z +
      (-Math.cos(yawRef.current) * forward - Math.sin(yawRef.current) * side) * speed;

    position.x = THREE.MathUtils.clamp(nextX, -38, 38);
    position.z = THREE.MathUtils.clamp(nextZ, -25.5, 25.5);
    camera.position.copy(position);
    camera.rotation.set(pitchRef.current, yawRef.current, 0, "YXZ");
  });

  return (
    <PerspectiveCamera
      far={1000}
      fov={wideView ? 88 : 58}
      makeDefault
      near={0.1}
      ref={cameraRef}
    />
  );
}
