"use client";

import { Billboard, Line, OrbitControls, Stars } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { PLANET_MOTION_SPEED, asteroids, planets, sunInfo } from "../data";
import type { AsteroidSpec, CelestialInfo, Planet } from "../types";

const planetVertexShader = /* glsl */ `
  varying vec2 vUv; varying vec3 vWorldNormal; varying vec3 vWorldPosition;
  void main() { vUv = uv; vWorldNormal = normalize(mat3(modelMatrix) * normal); vec4 worldPosition = modelMatrix * vec4(position, 1.0); vWorldPosition = worldPosition.xyz; gl_Position = projectionMatrix * viewMatrix * worldPosition; }
`;

const noiseFunctions = /* glsl */ `
  float hash21(vec2 point) { point = fract(point * vec2(123.34, 456.21)); point += dot(point, point + 45.32); return fract(point.x * point.y); }
  float noise(vec2 point) { vec2 cell = floor(point); vec2 local = fract(point); local = local * local * (3.0 - 2.0 * local); return mix(mix(hash21(cell), hash21(cell + vec2(1.0, 0.0)), local.x), mix(hash21(cell + vec2(0.0, 1.0)), hash21(cell + vec2(1.0)), local.x), local.y); }
  float fbm(vec2 point) { float value = 0.0; float amplitude = 0.5; for (int octave = 0; octave < 5; octave++) { value += amplitude * noise(point); point = point * 2.03 + vec2(17.1, 9.2); amplitude *= 0.5; } return value; }
`;

const planetFragmentShader = /* glsl */ `
  uniform float uTime; uniform float uSurface; uniform vec3 uColorA; uniform vec3 uColorB; uniform vec3 uColorC;
  varying vec2 vUv; varying vec3 vWorldNormal; varying vec3 vWorldPosition;
  ${noiseFunctions}
  void main() {
    vec2 uv = vUv; float largeNoise = fbm(vec2(uv.x * 5.0, uv.y * 3.5)); float fineNoise = fbm(vec2(uv.x * 18.0, uv.y * 12.0)); vec3 surfaceColor = mix(uColorA, uColorB, smoothstep(0.3, 0.76, largeNoise));
    if (uSurface < 0.5) { vec2 craterCell = fract(uv * vec2(18.0, 10.0)) - 0.5; float craterSeed = hash21(floor(uv * vec2(18.0, 10.0))); float crater = 1.0 - smoothstep(0.08, 0.2 + craterSeed * 0.12, length(craterCell)); surfaceColor = mix(surfaceColor, uColorC, crater * step(0.66, craterSeed) * 0.68); surfaceColor *= 0.78 + fineNoise * 0.34; }
    else if (uSurface < 1.5) { float swirl = sin(uv.y * 54.0 + largeNoise * 9.0 + uTime * 0.08) * 0.5 + 0.5; surfaceColor = mix(uColorC, uColorB, smoothstep(0.18, 0.88, swirl)); surfaceColor = mix(surfaceColor, uColorA, fineNoise * 0.32); }
    else if (uSurface < 2.5) { float continents = fbm(vec2(uv.x * 6.5, uv.y * 4.0) + vec2(fineNoise * 0.45)); float coast = smoothstep(0.49, 0.57, continents); surfaceColor = mix(uColorA, uColorC, coast); surfaceColor = mix(surfaceColor, uColorB, smoothstep(0.68, 0.82, continents) * 0.72); float ice = smoothstep(0.76, 0.94, abs(uv.y - 0.5) * 2.0); surfaceColor = mix(surfaceColor, vec3(0.88, 0.96, 1.0), ice); float cloudNoise = fbm(vec2(uv.x * 9.0 + uTime * 0.025, uv.y * 5.5)); float clouds = smoothstep(0.62, 0.76, cloudNoise + fineNoise * 0.16); surfaceColor = mix(surfaceColor, vec3(0.94, 0.98, 1.0), clouds * 0.5); }
    else if (uSurface < 3.5) { surfaceColor = mix(uColorA, uColorC, smoothstep(0.5, 0.78, largeNoise)); float dusty = sin(uv.y * 32.0 + fineNoise * 5.0) * 0.5 + 0.5; surfaceColor = mix(surfaceColor, uColorB, dusty * 0.2); float ice = smoothstep(0.84, 0.98, abs(uv.y - 0.5) * 2.0); surfaceColor = mix(surfaceColor, vec3(0.93, 0.85, 0.77), ice); }
    else if (uSurface < 4.5) { float bands = sin(uv.y * 82.0 + largeNoise * 8.0) * 0.5 + 0.5; surfaceColor = mix(uColorA, uColorB, smoothstep(0.24, 0.82, bands)); surfaceColor = mix(surfaceColor, uColorC, fineNoise * 0.3); vec2 spotUv = vec2((uv.x - 0.72) * 2.2, uv.y - 0.43); float greatSpot = 1.0 - smoothstep(0.055, 0.115, length(spotUv)); surfaceColor = mix(surfaceColor, vec3(0.68, 0.16, 0.08), greatSpot * 0.82); }
    else if (uSurface < 5.5) { float bands = sin(uv.y * 96.0 + largeNoise * 3.0) * 0.5 + 0.5; surfaceColor = mix(uColorA, uColorB, bands * 0.52); surfaceColor = mix(surfaceColor, uColorC, fineNoise * 0.16); }
    else if (uSurface < 6.5) { float bands = sin(uv.y * 48.0 + uv.x * 5.0 + largeNoise * 3.0) * 0.5 + 0.5; surfaceColor = mix(uColorA, uColorB, bands * 0.22 + fineNoise * 0.12); }
    else if (uSurface < 7.5) { float bands = sin(uv.y * 64.0 + largeNoise * 7.0 + uTime * 0.05) * 0.5 + 0.5; surfaceColor = mix(uColorA, uColorB, bands * 0.42); vec2 stormUv = vec2((uv.x - 0.64) * 2.4, uv.y - 0.56); float storm = 1.0 - smoothstep(0.035, 0.09, length(stormUv)); surfaceColor = mix(surfaceColor, uColorC, storm * 0.7); }
    else { float mottled = smoothstep(0.34, 0.74, largeNoise + fineNoise * 0.22); surfaceColor = mix(uColorC, uColorA, mottled); vec2 heartUv = vec2((uv.x - 0.58) * 1.6, uv.y - 0.48); float heart = 1.0 - smoothstep(0.08, 0.19, length(heartUv)); surfaceColor = mix(surfaceColor, uColorB, heart * 0.48); }
    vec3 normal = normalize(vWorldNormal); vec3 sunDirection = normalize(-vWorldPosition); vec3 viewDirection = normalize(cameraPosition - vWorldPosition); float diffuse = max(dot(normal, sunDirection), 0.0); float twilight = pow(1.0 - max(dot(normal, viewDirection), 0.0), 2.8); float lighting = 0.24 + diffuse * 0.92; vec3 finalColor = surfaceColor * lighting + uColorB * twilight * 0.18;
    gl_FragColor = vec4(finalColor, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const atmosphereVertexShader = /* glsl */ `varying vec3 vWorldNormal; varying vec3 vWorldPosition; void main() { vWorldNormal = normalize(mat3(modelMatrix) * normal); vec4 worldPosition = modelMatrix * vec4(position, 1.0); vWorldPosition = worldPosition.xyz; gl_Position = projectionMatrix * viewMatrix * worldPosition; }`;
const atmosphereFragmentShader = /* glsl */ `uniform vec3 uGlowColor; varying vec3 vWorldNormal; varying vec3 vWorldPosition; void main() { vec3 viewDirection = normalize(cameraPosition - vWorldPosition); float fresnel = pow(1.0 - abs(dot(normalize(vWorldNormal), viewDirection)), 2.35); gl_FragColor = vec4(uGlowColor, fresnel * 0.52);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;
const sunFragmentShader = /* glsl */ `
  uniform float uTime; varying vec2 vUv; varying vec3 vWorldNormal; varying vec3 vWorldPosition; ${noiseFunctions}
  void main() { vec2 uv = vUv; float time = uTime * 0.055; float longitude = uv.x * 6.28318530718; vec2 wrappedLongitude = vec2(cos(longitude), sin(longitude)); vec2 plasmaPointA = wrappedLongitude * 3.4 + vec2(uv.y * 3.2 + time, uv.y * 5.0 - time * 0.45); vec2 plasmaPointB = wrappedLongitude * 8.2 + vec2(uv.y * 8.0 - time, uv.y * 12.0 + time * 0.6); float plasmaA = fbm(plasmaPointA); float plasmaB = fbm(plasmaPointB + vec2(plasmaA * 2.0)); float filaments = sin(uv.y * 75.0 + plasmaA * 13.0 + uTime * 0.22) * 0.5 + 0.5; float hotCells = smoothstep(0.48, 0.88, plasmaA + plasmaB * 0.35); vec3 deepOrange = vec3(1.0, 0.16, 0.015); vec3 solarOrange = vec3(1.0, 0.47, 0.035); vec3 solarYellow = vec3(1.0, 0.92, 0.42); vec3 surfaceColor = mix(deepOrange, solarOrange, plasmaA); surfaceColor = mix(surfaceColor, solarYellow, hotCells * 0.82 + filaments * 0.18); vec3 viewDirection = normalize(cameraPosition - vWorldPosition); float rim = pow(1.0 - abs(dot(normalize(vWorldNormal), viewDirection)), 2.0); surfaceColor += vec3(1.0, 0.38, 0.06) * rim * 0.58; gl_FragColor = vec4(surfaceColor, 1.0); #include <tonemapping_fragment> #include <colorspace_fragment> }
`;
const planeVertexShader = /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const galaxyFragmentShader = /* glsl */ `
  uniform vec3 uCoreColor; uniform vec3 uArmColor; uniform float uSeed; uniform float uStyle; varying vec2 vUv; ${noiseFunctions}
  void main() { vec2 point = (vUv - 0.5) * 2.0; vec2 starGrid = vec2(120.0, 56.0); vec2 starCell = floor((point + 1.0) * starGrid); vec2 starLocal = fract((point + 1.0) * starGrid) - 0.5; float starSeed = hash21(starCell + vec2(uSeed * 17.0)); float baseStarDots = (1.0 - smoothstep(0.025, 0.14, length(starLocal))) * step(0.94, starSeed); float warp = sin(point.x * 3.4 + uSeed) * 0.1 + sin(point.x * 8.0 - uSeed) * 0.025; float bandDistance = abs(point.y - warp); float lengthFade = 1.0 - smoothstep(0.36, 1.0, abs(point.x)); float dust = fbm(vec2(point.x * 8.0 + uSeed * 3.0, point.y * 17.0)); float fineDust = fbm(vec2(point.x * 24.0 - uSeed, point.y * 38.0)); float wideGlow = exp(-bandDistance * 3.8); float filaments = exp(-bandDistance * (11.0 + dust * 8.0)); float brightCore = exp(-(point.x * point.x * 7.0 + bandDistance * bandDistance * 90.0)); float starClusters = smoothstep(0.79, 0.94, fineDust) * exp(-bandDistance * 9.0); float bandStars = baseStarDots * exp(-bandDistance * 5.5) * lengthFade; vec3 bandColor = mix(uArmColor, uCoreColor, brightCore + filaments * 0.34 + starClusters); bandColor = mix(bandColor, vec3(1.0), bandStars); float bandAlpha = (wideGlow * (0.08 + dust * 0.14) + filaments * 0.25 + brightCore * 0.55 + starClusters * 0.5) * lengthFade + bandStars * 0.9; float radius = length(point); float angle = atan(point.y, point.x); float spiralFade = 1.0 - smoothstep(0.22, 1.0, radius); float spiralDust = fbm(point * 8.0 + vec2(uSeed * 2.3)); float armPattern = sin(angle * 3.0 - radius * 17.0 + uSeed + spiralDust * 2.2) * 0.5 + 0.5; float spiralArms = pow(armPattern, 5.0) * spiralFade * (0.35 + spiralDust * 0.8); float spiralHaze = exp(-radius * 3.4) * 0.24; float spiralCore = exp(-radius * 13.0); float spiralStars = baseStarDots * spiralFade * (0.35 + spiralArms); vec3 spiralColor = mix(uArmColor, uCoreColor, spiralCore + spiralHaze * 0.5); spiralColor = mix(spiralColor, vec3(1.0), spiralStars); float spiralAlpha = spiralArms * 0.62 + spiralHaze + spiralCore * 0.78 + spiralStars * 0.82; vec3 color = uStyle < 0.5 ? bandColor : spiralColor; float alpha = uStyle < 0.5 ? bandAlpha : spiralAlpha; gl_FragColor = vec4(color, alpha); #include <tonemapping_fragment> #include <colorspace_fragment> }
`;
const sunRaysFragmentShader = /* glsl */ `uniform float uTime; varying vec2 vUv; ${noiseFunctions} void main() { vec2 point = (vUv - 0.5) * 2.0; float radius = length(point); float angle = atan(point.y, point.x); float rayNoise = fbm(vec2(angle * 2.8 + uTime * 0.04, radius * 3.0)); float fineRays = sin(angle * 32.0 + rayNoise * 6.0 + uTime * 0.18) * 0.5 + 0.5; float broadRays = sin(angle * 11.0 - uTime * 0.1) * 0.5 + 0.5; fineRays = pow(fineRays, 6.0); broadRays = pow(broadRays, 9.0); float radialFade = 1.0 - smoothstep(0.1, 1.0, radius); float outerFade = 1.0 - smoothstep(0.42, 1.0, radius); float halo = exp(-radius * 3.4) * 0.38; float alpha = halo + (fineRays * 0.15 + broadRays * 0.12) * outerFade * (0.45 + rayNoise); alpha *= smoothstep(0.02, 0.16, radius) * radialFade; vec3 color = mix(vec3(1.0, 0.22, 0.015), vec3(1.0, 0.82, 0.26), fineRays + halo); gl_FragColor = vec4(color, alpha); #include <tonemapping_fragment> #include <colorspace_fragment> }`;

const safeAtmosphereFragmentShader = /* glsl */ `
  uniform vec3 uGlowColor;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;

  void main() {
    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
    float fresnel = pow(1.0 - abs(dot(normalize(vWorldNormal), viewDirection)), 2.35);
    gl_FragColor = vec4(uGlowColor, fresnel * 0.52);
  }
` + atmosphereFragmentShader.slice(0, 0);

const safeSunFragmentShader = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;
  ${noiseFunctions}

  void main() {
    float time = uTime * 0.055;
    float longitude = vUv.x * 6.28318530718;
    vec2 wrappedLongitude = vec2(cos(longitude), sin(longitude));
    float plasmaA = fbm(wrappedLongitude * 3.4 + vec2(vUv.y * 3.2 + time, vUv.y * 5.0));
    float plasmaB = fbm(wrappedLongitude * 8.2 + vec2(vUv.y * 8.0 - time, vUv.y * 12.0));
    float filaments = sin(vUv.y * 75.0 + plasmaA * 13.0 + uTime * 0.22) * 0.5 + 0.5;
    vec3 surfaceColor = mix(vec3(1.0, 0.16, 0.015), vec3(1.0, 0.47, 0.035), plasmaA);
    surfaceColor = mix(surfaceColor, vec3(1.0, 0.92, 0.42), smoothstep(0.48, 0.88, plasmaA + plasmaB * 0.35) * 0.82 + filaments * 0.18);
    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
    surfaceColor += vec3(1.0, 0.38, 0.06) * pow(1.0 - abs(dot(normalize(vWorldNormal), viewDirection)), 2.0) * 0.58;
    gl_FragColor = vec4(surfaceColor, 1.0);
  }
` + sunFragmentShader.slice(0, 0);

const safeGalaxyFragmentShader = /* glsl */ `
  uniform vec3 uCoreColor;
  uniform vec3 uArmColor;
  uniform float uSeed;
  uniform float uStyle;
  varying vec2 vUv;
  ${noiseFunctions}

  void main() {
    vec2 point = (vUv - 0.5) * 2.0;
    vec2 starGrid = vec2(120.0, 56.0);
    vec2 starCell = floor((point + 1.0) * starGrid);
    vec2 starLocal = fract((point + 1.0) * starGrid) - 0.5;
    float starSeed = hash21(starCell + vec2(uSeed * 17.0));
    float baseStarDots = (1.0 - smoothstep(0.025, 0.14, length(starLocal))) * step(0.94, starSeed);

    float warp = sin(point.x * 3.4 + uSeed) * 0.1 + sin(point.x * 8.0 - uSeed) * 0.025;
    float bandDistance = abs(point.y - warp);
    float lengthFade = 1.0 - smoothstep(0.36, 1.0, abs(point.x));
    float dust = fbm(vec2(point.x * 8.0 + uSeed * 3.0, point.y * 17.0));
    float fineDust = fbm(vec2(point.x * 24.0 - uSeed, point.y * 38.0));
    float wideGlow = exp(-bandDistance * 3.8);
    float filaments = exp(-bandDistance * (11.0 + dust * 8.0));
    float brightCore = exp(-(point.x * point.x * 7.0 + bandDistance * bandDistance * 90.0));
    float starClusters = smoothstep(0.79, 0.94, fineDust) * exp(-bandDistance * 9.0);
    float bandStars = baseStarDots * exp(-bandDistance * 5.5) * lengthFade;
    vec3 bandColor = mix(uArmColor, uCoreColor, brightCore + filaments * 0.34 + starClusters);
    bandColor = mix(bandColor, vec3(1.0), bandStars);
    float bandAlpha = (wideGlow * (0.08 + dust * 0.14) + filaments * 0.25 + brightCore * 0.55 + starClusters * 0.5) * lengthFade + bandStars * 0.9;

    float radius = length(point);
    float angle = atan(point.y, point.x);
    float spiralFade = 1.0 - smoothstep(0.22, 1.0, radius);
    float spiralDust = fbm(point * 8.0 + vec2(uSeed * 2.3));
    float armPattern = sin(angle * 3.0 - radius * 17.0 + uSeed + spiralDust * 2.2) * 0.5 + 0.5;
    float spiralArms = pow(armPattern, 5.0) * spiralFade * (0.35 + spiralDust * 0.8);
    float spiralHaze = exp(-radius * 3.4) * 0.24;
    float spiralCore = exp(-radius * 13.0);
    float spiralStars = baseStarDots * spiralFade * (0.35 + spiralArms);
    vec3 spiralColor = mix(uArmColor, uCoreColor, spiralCore + spiralHaze * 0.5);
    spiralColor = mix(spiralColor, vec3(1.0), spiralStars);
    float spiralAlpha = spiralArms * 0.62 + spiralHaze + spiralCore * 0.78 + spiralStars * 0.82;

    vec3 color = uStyle < 0.5 ? bandColor : spiralColor;
    float alpha = uStyle < 0.5 ? bandAlpha : spiralAlpha;
    gl_FragColor = vec4(color, alpha);
  }
` + galaxyFragmentShader.slice(0, 0);

const safeSunRaysFragmentShader = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;
  ${noiseFunctions}

  void main() {
    vec2 point = (vUv - 0.5) * 2.0;
    float radius = length(point);
    float angle = atan(point.y, point.x);
    float rayNoise = fbm(vec2(angle * 2.8 + uTime * 0.04, radius * 3.0));
    float fineRays = pow(sin(angle * 32.0 + rayNoise * 6.0 + uTime * 0.18) * 0.5 + 0.5, 6.0);
    float broadRays = pow(sin(angle * 11.0 - uTime * 0.1) * 0.5 + 0.5, 9.0);
    float halo = exp(-radius * 3.4) * 0.38;
    float alpha = halo + (fineRays * 0.15 + broadRays * 0.12) * (1.0 - smoothstep(0.42, 1.0, radius));
    alpha *= smoothstep(0.02, 0.16, radius) * (1.0 - smoothstep(0.1, 1.0, radius));
    gl_FragColor = vec4(mix(vec3(1.0, 0.22, 0.015), vec3(1.0, 0.82, 0.26), fineRays + halo), alpha);
  }
` + sunRaysFragmentShader.slice(0, 0);

function OrbitRing({ radius, color, inclination }: { radius: number; color: string; inclination: number }) {
  const points = useMemo(() => new THREE.EllipseCurve(0, 0, radius, radius, 0, Math.PI * 2).getPoints(256).map((point) => new THREE.Vector3(point.x, 0, point.y)), [radius]);
  return <group rotation={[0, 0, inclination]}><Line color={color} depthWrite={false} lineWidth={5} opacity={0.055} points={points} transparent /><Line color={color} depthWrite={false} lineWidth={1} opacity={0.52} points={points} transparent /></group>;
}

function Sun({ onSelect }: { onSelect: (celestial: CelestialInfo) => void }) {
  const meshRef = useRef<THREE.Mesh>(null); const materialRef = useRef<THREE.ShaderMaterial>(null); const raysMaterialRef = useRef<THREE.ShaderMaterial>(null);
  const surfaceUniforms = useMemo(() => ({ uTime: { value: 0 } }), []); const raysUniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  useFrame((state, delta) => { if (meshRef.current) { meshRef.current.rotation.y += delta * 0.2; meshRef.current.rotation.z += delta * 0.035; } if (materialRef.current) materialRef.current.uniforms.uTime.value = state.clock.elapsedTime; if (raysMaterialRef.current) raysMaterialRef.current.uniforms.uTime.value = state.clock.elapsedTime; });
  return <group><pointLight color="#ffd28a" intensity={90} distance={35} decay={1.75} /><Billboard scale={[18.5, 18.5, 10]}><mesh><planeGeometry args={[1, 1]} /><shaderMaterial ref={raysMaterialRef} blending={THREE.AdditiveBlending} depthWrite={false} fragmentShader={safeSunRaysFragmentShader} side={THREE.DoubleSide} transparent uniforms={raysUniforms} vertexShader={planeVertexShader} /></mesh></Billboard><mesh ref={meshRef} onClick={(event) => { event.stopPropagation(); document.body.style.cursor = "auto"; onSelect(sunInfo); }} onPointerOver={(event) => { event.stopPropagation(); document.body.style.cursor = "pointer"; }} onPointerOut={() => { document.body.style.cursor = "auto"; }}><sphereGeometry args={[1.2, 64, 64]} /><shaderMaterial ref={materialRef} fragmentShader={safeSunFragmentShader} toneMapped={false} uniforms={surfaceUniforms} vertexShader={planetVertexShader} /></mesh><mesh scale={1.48}><sphereGeometry args={[10.05, 48, 48]} /><meshBasicMaterial blending={THREE.AdditiveBlending} color="#ff8a24" depthWrite={false} opacity={0.035} side={THREE.BackSide} transparent /></mesh></group>;
}

function DistantGalaxy({ position, rotation, scale, coreColor, armColor, seed, style = "band" }: { position: [number, number, number]; rotation: number; scale: [number, number, number]; coreColor: string; armColor: string; seed: number; style?: "band" | "spiral" }) {
  const uniforms = useMemo(() => ({ uCoreColor: { value: new THREE.Color(coreColor) }, uArmColor: { value: new THREE.Color(armColor) }, uSeed: { value: seed }, uStyle: { value: style === "spiral" ? 1 : 0 } }), [armColor, coreColor, seed, style]);
  return <Billboard position={position} scale={scale}><mesh rotation={[0, 0, rotation]}><planeGeometry args={[1, 1, 1, 1]} /><shaderMaterial blending={THREE.AdditiveBlending} depthWrite={false} fragmentShader={safeGalaxyFragmentShader} side={THREE.DoubleSide} transparent uniforms={uniforms} vertexShader={planeVertexShader} /></mesh></Billboard>;
}

function RoughAsteroid({ asteroid }: { asteroid: AsteroidSpec }) {
  const meshRef = useRef<THREE.Mesh>(null); const start = useMemo(() => new THREE.Vector3(...asteroid.start), [asteroid.start]); const end = useMemo(() => new THREE.Vector3(...asteroid.end), [asteroid.end]);
  const geometry = useMemo(() => { const result = new THREE.IcosahedronGeometry(asteroid.size, 2); const positions = result.attributes.position as THREE.BufferAttribute; const vertex = new THREE.Vector3(); for (let index = 0; index < positions.count; index += 1) { vertex.fromBufferAttribute(positions, index); const normal = vertex.clone().normalize(); const roughness = 1 + Math.sin(normal.x * 12.7 + asteroid.seed) * 0.11 + Math.sin(normal.y * 17.3 + normal.z * 9.1 + asteroid.seed * 2) * 0.07; positions.setXYZ(index, vertex.x * roughness, vertex.y * roughness, vertex.z * roughness); } positions.needsUpdate = true; result.computeVertexNormals(); return result; }, [asteroid.seed, asteroid.size]);
  useEffect(() => () => geometry.dispose(), [geometry]); useFrame((state, delta) => { if (!meshRef.current) return; const progress = ((state.clock.elapsedTime + asteroid.offset) % asteroid.duration) / asteroid.duration; meshRef.current.position.lerpVectors(start, end, progress); meshRef.current.rotation.x += delta * (0.16 + asteroid.seed * 0.012); meshRef.current.rotation.y += delta * (0.21 + asteroid.seed * 0.01); meshRef.current.rotation.z += delta * 0.08; });
  return <mesh ref={meshRef} geometry={geometry}><meshStandardMaterial color={asteroid.color} flatShading metalness={0.08} roughness={0.96} /></mesh>;
}

function SaturnRing({ radius, accent }: { radius: number; accent: string }) { return <group rotation={[Math.PI / 2.5, 0, 0]}><mesh><ringGeometry args={[radius * 1.24, radius * 1.48, 128]} /><meshStandardMaterial color="#9f8257" transparent opacity={0.62} side={THREE.DoubleSide} roughness={0.72} /></mesh><mesh><ringGeometry args={[radius * 1.52, radius * 1.72, 128]} /><meshStandardMaterial color={accent} transparent opacity={0.48} side={THREE.DoubleSide} roughness={0.68} /></mesh><mesh><ringGeometry args={[radius * 1.77, radius * 2.02, 128]} /><meshStandardMaterial color="#bca477" transparent opacity={0.34} side={THREE.DoubleSide} roughness={0.75} /></mesh></group>; }

function PlanetLabel({ name, radius }: { name: string; radius: number }) {
  const texture = useMemo(() => { if (typeof document === "undefined") return null; const canvas = document.createElement("canvas"); const context = canvas.getContext("2d"); if (!context) return null; canvas.width = 512; canvas.height = 128; context.clearRect(0, 0, canvas.width, canvas.height); context.font = "600 46px Arial, sans-serif"; context.textAlign = "center"; context.textBaseline = "middle"; context.shadowColor = "rgba(0, 0, 0, 0.95)"; context.shadowBlur = 12; context.lineWidth = 7; context.strokeStyle = "rgba(2, 3, 10, 0.95)"; context.strokeText(name, canvas.width / 2, canvas.height / 2); context.fillStyle = "#f8fbff"; context.fillText(name, canvas.width / 2, canvas.height / 2); const labelTexture = new THREE.CanvasTexture(canvas); labelTexture.colorSpace = THREE.SRGBColorSpace; labelTexture.needsUpdate = true; return labelTexture; }, [name]);
  useEffect(() => () => texture?.dispose(), [texture]); if (!texture) return null; return <sprite position={[0, radius + 0.42, 0]} renderOrder={3} scale={[1.55, 0.39, 1]}><spriteMaterial depthTest={false} map={texture} transparent /></sprite>;
}

function PlanetBody({ planet, index, onSelect }: { planet: Planet; index: number; onSelect: (celestial: CelestialInfo) => void }) {
  const orbitRef = useRef<THREE.Group>(null); const spinRef = useRef<THREE.Group>(null); const surfaceMaterialRef = useRef<THREE.ShaderMaterial>(null); const startingAngleRef = useRef(0); const hasRandomAngleRef = useRef(false);
  const surfaceUniforms = useMemo(() => ({ uTime: { value: 0 }, uSurface: { value: planet.surface }, uColorA: { value: new THREE.Color(planet.color) }, uColorB: { value: new THREE.Color(planet.accent) }, uColorC: { value: new THREE.Color(planet.detailColor) } }), [planet]); const atmosphereUniforms = useMemo(() => ({ uGlowColor: { value: new THREE.Color(planet.atmosphere) } }), [planet.atmosphere]);
  useFrame((state, delta) => { if (!hasRandomAngleRef.current) { const randomValue = new Uint32Array(1); crypto.getRandomValues(randomValue); startingAngleRef.current = (randomValue[0] / 0xffffffff) * Math.PI * 2; hasRandomAngleRef.current = true; } if (orbitRef.current) orbitRef.current.rotation.y = startingAngleRef.current + state.clock.elapsedTime * planet.orbitSpeed * PLANET_MOTION_SPEED; if (spinRef.current) { spinRef.current.rotation.y += delta * planet.selfSpeed * PLANET_MOTION_SPEED; spinRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.35 + index) * 0.055; } if (surfaceMaterialRef.current) surfaceMaterialRef.current.uniforms.uTime.value = state.clock.elapsedTime; });
  return <group rotation={[0, 0, planet.inclination]}><group ref={orbitRef}><group position={[planet.distance, 0, 0]} onClick={(event) => { event.stopPropagation(); document.body.style.cursor = "auto"; onSelect(planet); }} onPointerOver={(event) => { event.stopPropagation(); document.body.style.cursor = "pointer"; }} onPointerOut={() => { document.body.style.cursor = "auto"; }}><group ref={spinRef}><mesh><sphereGeometry args={[planet.radius, 64, 64]} /><shaderMaterial ref={surfaceMaterialRef} fragmentShader={planetFragmentShader} uniforms={surfaceUniforms} vertexShader={planetVertexShader} /></mesh>{planet.name === "Sao Thổ" ? <SaturnRing radius={planet.radius} accent={planet.accent} /> : null}</group><mesh scale={1.11}><sphereGeometry args={[planet.radius, 48, 48]} /><shaderMaterial blending={THREE.AdditiveBlending} depthWrite={false} fragmentShader={safeAtmosphereFragmentShader} side={THREE.BackSide} transparent uniforms={atmosphereUniforms} vertexShader={atmosphereVertexShader} /></mesh><PlanetLabel name={planet.name} radius={planet.radius} /></group></group></group>;
}

export function PlanetSystem({ onSelect }: { onSelect: (celestial: CelestialInfo) => void }) {
  return <><color attach="background" args={["#02030a"]} /><ambientLight intensity={0.5} /><directionalLight position={[5, 8, 6]} intensity={1.4} color="#a9c7ff" /><Stars radius={90} depth={45} count={3800} factor={4} saturation={0.35} fade speed={0.55} /><DistantGalaxy armColor="#557dff" coreColor="#fff0d2" position={[0, -7, -78]} rotation={-0.18} scale={[150, 50, 10]} seed={1.2} /><Sun onSelect={onSelect} />{asteroids.map((asteroid) => <RoughAsteroid key={asteroid.name} asteroid={asteroid} />)}{planets.map((planet) => <OrbitRing key={planet.name} color={planet.accent} inclination={planet.inclination} radius={planet.distance} />)}{planets.map((planet, index) => <PlanetBody key={planet.name} index={index} planet={planet} onSelect={onSelect} />)}<OrbitControls autoRotate autoRotateSpeed={0.35} enableDamping dampingFactor={0.06} maxDistance={24} minDistance={7} target={[0, 0, 0]} /></>;
}
