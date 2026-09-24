"use client";

import { Billboard, Line, OrbitControls, Stars } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

type CelestialInfo = {
  name: string;
  subtitle: string;
  description: string;
  accent: string;
  facts: string[];
};

type Planet = CelestialInfo & {
  radius: number;
  distance: number;
  orbitSpeed: number;
  selfSpeed: number;
  color: string;
  detailColor: string;
  atmosphere: string;
  surface: number;
  inclination: number;
};

const PLANET_MOTION_SPEED = 0.5;

const sunInfo: CelestialInfo = {
  name: "Mặt Trời",
  subtitle: "Ngôi sao trung tâm",
  description:
    "Nguồn năng lượng của cả hệ, một quả cầu plasma khổng lồ đang liên tục phát sáng và tỏa nhiệt.",
  accent: "#ffb347",
  facts: [
    "Chiếm khoảng 99,86% khối lượng Hệ Mặt Trời",
    "Ánh sáng mất khoảng 8 phút 20 giây để tới Trái Đất",
  ],
};

const planets: Planet[] = [
  {
    name: "Sao Thủy",
    subtitle: "Hành tinh nhanh nhất",
    description: "Nhỏ, gần Mặt Trời nhất và hoàn thành một vòng quỹ đạo cực nhanh.",
    radius: 0.2,
    distance: 2.2,
    orbitSpeed: 0.62,
    selfSpeed: 1.8,
    color: "#9b8b77",
    accent: "#e1c5a5",
    detailColor: "#51483f",
    atmosphere: "#d7c5ad",
    surface: 0,
    inclination: 0.02,
    facts: ["Quỹ đạo: 88 ngày Trái Đất", "Bề mặt đầy hố va chạm"],
  },
  {
    name: "Sao Kim",
    subtitle: "Viên ngọc nóng rực",
    description: "Một thế giới phủ mây dày với khí quyển giữ nhiệt rất mạnh.",
    radius: 0.5,
    distance: 3.1,
    orbitSpeed: 0.5,
    selfSpeed: 1.2,
    color: "#d7a55f",
    accent: "#ffe0a3",
    detailColor: "#8c552b",
    atmosphere: "#ffc56e",
    surface: 1,
    inclination: 0.06,
    facts: ["Nóng hơn cả Sao Thủy", "Tự quay ngược chiều đa số hành tinh"],
  },
  {
    name: "Trái Đất",
    subtitle: "Chấm xanh thân quen",
    description: "Nơi có đại dương, khí quyển cân bằng và sự sống mà ta biết.",
    radius: 0.53,
    distance: 4.05,
    orbitSpeed: 0.42,
    selfSpeed: 1.6,
    color: "#2f7dd8",
    accent: "#7ee7b7",
    detailColor: "#174b2c",
    atmosphere: "#69cfff",
    surface: 2,
    inclination: 0,
    facts: ["Có một vệ tinh tự nhiên", "Khoảng 71% bề mặt là nước"],
  },
  {
    name: "Sao Hỏa",
    subtitle: "Hành tinh đỏ",
    description: "Sa mạc lạnh với bụi oxit sắt, núi lửa lớn và dấu vết nước cổ xưa.",
    radius: 0.28,
    distance: 5,
    orbitSpeed: 0.34,
    selfSpeed: 1.45,
    color: "#c75037",
    accent: "#ff9a78",
    detailColor: "#6e251d",
    atmosphere: "#e76d48",
    surface: 3,
    inclination: 0.045,
    facts: ["Có Olympus Mons khổng lồ", "Hai vệ tinh: Phobos và Deimos"],
  },
  {
    name: "Sao Mộc",
    subtitle: "Người khổng lồ khí",
    description: "Hành tinh lớn nhất hệ, nổi bật với các dải mây và Vết Đỏ Lớn.",
    radius: 0.95,
    distance: 6.55,
    orbitSpeed: 0.22,
    selfSpeed: 2.15,
    color: "#d9a066",
    accent: "#f6d2a4",
    detailColor: "#8f492f",
    atmosphere: "#f3bd7a",
    surface: 4,
    inclination: 0.025,
    facts: ["Lớn nhất Hệ Mặt Trời", "Có hàng chục vệ tinh đã biết"],
  },
  {
    name: "Sao Thổ",
    subtitle: "Vành đai lộng lẫy",
    description: "Một hành tinh khí nhẹ với hệ vành đai băng đá dễ nhận ra nhất.",
    radius: 0.84,
    distance: 8.25,
    orbitSpeed: 0.18,
    selfSpeed: 1.95,
    color: "#d6bf83",
    accent: "#fff0b8",
    detailColor: "#8d714c",
    atmosphere: "#ffe0a0",
    surface: 5,
    inclination: 0.055,
    facts: ["Vành đai chủ yếu là băng", "Mật độ trung bình thấp hơn nước"],
  },
  {
    name: "Sao Thiên Vương",
    subtitle: "Gã nghiêng mình",
    description: "Hành tinh băng khổng lồ quay gần như nằm ngang so với quỹ đạo.",
    radius: 0.43,
    distance: 9.8,
    orbitSpeed: 0.13,
    selfSpeed: 1.55,
    color: "#72d2db",
    accent: "#bcfbff",
    detailColor: "#397e8c",
    atmosphere: "#78f2ff",
    surface: 6,
    inclination: 0.13,
    facts: ["Trục quay nghiêng khoảng 98 độ", "Có sắc xanh từ methane"],
  },
  {
    name: "Sao Hải Vương",
    subtitle: "Cơn gió xanh thẳm",
    description: "Thế giới băng xa xôi, lạnh giá, nổi tiếng với những luồng gió dữ dội.",
    radius: 0.4,
    distance: 11.1,
    orbitSpeed: 0.1,
    selfSpeed: 1.7,
    color: "#375bd8",
    accent: "#8fb2ff",
    detailColor: "#172c83",
    atmosphere: "#4f83ff",
    surface: 7,
    inclination: 0.08,
    facts: ["Xa Mặt Trời nhất trong 8 hành tinh chính", "Gió có thể rất mạnh"],
  },
  {
    name: "Diêm Vương",
    subtitle: "Kẻ du hành tí hon",
    description: "Một hành tinh lùn ở rìa ngoài, có quỹ đạo lệch và bề mặt băng giá.",
    radius: 0.28,
    distance: 12.35,
    orbitSpeed: 0.075,
    selfSpeed: 1.05,
    color: "#b99c82",
    accent: "#f1d7bf",
    detailColor: "#655347",
    atmosphere: "#d9c2ad",
    surface: 8,
    inclination: 0.28,
    facts: ["Được xếp là hành tinh lùn", "Có vệ tinh lớn Charon"],
  },
];

type AsteroidSpec = {
  name: string;
  start: [number, number, number];
  end: [number, number, number];
  size: number;
  duration: number;
  offset: number;
  seed: number;
  color: string;
};

const asteroids: AsteroidSpec[] = [
  { name: "Astra-1", start: [-18, 6, 5], end: [18, -2, -8], size: 0.24, duration: 34, offset: 0, seed: 1.3, color: "#70665d" },
  { name: "Astra-2", start: [16, 9, -10], end: [-17, 1, 4], size: 0.16, duration: 41, offset: 12, seed: 2.8, color: "#918376" },
  { name: "Astra-3", start: [-13, -5, -3], end: [15, 4, -12], size: 0.3, duration: 38, offset: 23, seed: 4.1, color: "#5f5955" },
  { name: "Astra-4", start: [11, -8, 2], end: [-15, 6, -16], size: 0.2, duration: 46, offset: 31, seed: 5.7, color: "#817267" },
  { name: "Astra-5", start: [-17, 11, -18], end: [17, -4, 0], size: 0.13, duration: 36, offset: 8, seed: 7.2, color: "#9a8b7d" },
];

const planetVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;

  void main() {
    vUv = uv;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const noiseFunctions = /* glsl */ `
  float hash21(vec2 point) {
    point = fract(point * vec2(123.34, 456.21));
    point += dot(point, point + 45.32);
    return fract(point.x * point.y);
  }

  float noise(vec2 point) {
    vec2 cell = floor(point);
    vec2 local = fract(point);
    local = local * local * (3.0 - 2.0 * local);
    return mix(
      mix(hash21(cell), hash21(cell + vec2(1.0, 0.0)), local.x),
      mix(hash21(cell + vec2(0.0, 1.0)), hash21(cell + vec2(1.0)), local.x),
      local.y
    );
  }

  float fbm(vec2 point) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int octave = 0; octave < 5; octave++) {
      value += amplitude * noise(point);
      point = point * 2.03 + vec2(17.1, 9.2);
      amplitude *= 0.5;
    }
    return value;
  }
`;

const planetFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uSurface;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;

  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;

  ${noiseFunctions}

  void main() {
    vec2 uv = vUv;
    float largeNoise = fbm(vec2(uv.x * 5.0, uv.y * 3.5));
    float fineNoise = fbm(vec2(uv.x * 18.0, uv.y * 12.0));
    vec3 surfaceColor = mix(uColorA, uColorB, smoothstep(0.3, 0.76, largeNoise));

    if (uSurface < 0.5) {
      vec2 craterCell = fract(uv * vec2(18.0, 10.0)) - 0.5;
      float craterSeed = hash21(floor(uv * vec2(18.0, 10.0)));
      float crater = 1.0 - smoothstep(0.08, 0.2 + craterSeed * 0.12, length(craterCell));
      surfaceColor = mix(surfaceColor, uColorC, crater * step(0.66, craterSeed) * 0.68);
      surfaceColor *= 0.78 + fineNoise * 0.34;
    } else if (uSurface < 1.5) {
      float swirl = sin(uv.y * 54.0 + largeNoise * 9.0 + uTime * 0.08) * 0.5 + 0.5;
      surfaceColor = mix(uColorC, uColorB, smoothstep(0.18, 0.88, swirl));
      surfaceColor = mix(surfaceColor, uColorA, fineNoise * 0.32);
    } else if (uSurface < 2.5) {
      float continents = fbm(vec2(uv.x * 6.5, uv.y * 4.0) + vec2(fineNoise * 0.45));
      float coast = smoothstep(0.49, 0.57, continents);
      surfaceColor = mix(uColorA, uColorC, coast);
      surfaceColor = mix(surfaceColor, uColorB, smoothstep(0.68, 0.82, continents) * 0.72);
      float ice = smoothstep(0.76, 0.94, abs(uv.y - 0.5) * 2.0);
      surfaceColor = mix(surfaceColor, vec3(0.88, 0.96, 1.0), ice);
      float cloudNoise = fbm(vec2(uv.x * 9.0 + uTime * 0.025, uv.y * 5.5));
      float clouds = smoothstep(0.62, 0.76, cloudNoise + fineNoise * 0.16);
      surfaceColor = mix(surfaceColor, vec3(0.94, 0.98, 1.0), clouds * 0.5);
    } else if (uSurface < 3.5) {
      surfaceColor = mix(uColorA, uColorC, smoothstep(0.5, 0.78, largeNoise));
      float dusty = sin(uv.y * 32.0 + fineNoise * 5.0) * 0.5 + 0.5;
      surfaceColor = mix(surfaceColor, uColorB, dusty * 0.2);
      float ice = smoothstep(0.84, 0.98, abs(uv.y - 0.5) * 2.0);
      surfaceColor = mix(surfaceColor, vec3(0.93, 0.85, 0.77), ice);
    } else if (uSurface < 4.5) {
      float bands = sin(uv.y * 82.0 + largeNoise * 8.0) * 0.5 + 0.5;
      surfaceColor = mix(uColorA, uColorB, smoothstep(0.24, 0.82, bands));
      surfaceColor = mix(surfaceColor, uColorC, fineNoise * 0.3);
      vec2 spotUv = vec2((uv.x - 0.72) * 2.2, uv.y - 0.43);
      float greatSpot = 1.0 - smoothstep(0.055, 0.115, length(spotUv));
      surfaceColor = mix(surfaceColor, vec3(0.68, 0.16, 0.08), greatSpot * 0.82);
    } else if (uSurface < 5.5) {
      float bands = sin(uv.y * 96.0 + largeNoise * 3.0) * 0.5 + 0.5;
      surfaceColor = mix(uColorA, uColorB, bands * 0.52);
      surfaceColor = mix(surfaceColor, uColorC, fineNoise * 0.16);
    } else if (uSurface < 6.5) {
      float bands = sin(uv.y * 48.0 + uv.x * 5.0 + largeNoise * 3.0) * 0.5 + 0.5;
      surfaceColor = mix(uColorA, uColorB, bands * 0.22 + fineNoise * 0.12);
    } else if (uSurface < 7.5) {
      float bands = sin(uv.y * 64.0 + largeNoise * 7.0 + uTime * 0.05) * 0.5 + 0.5;
      surfaceColor = mix(uColorA, uColorB, bands * 0.42);
      vec2 stormUv = vec2((uv.x - 0.64) * 2.4, uv.y - 0.56);
      float storm = 1.0 - smoothstep(0.035, 0.09, length(stormUv));
      surfaceColor = mix(surfaceColor, uColorC, storm * 0.7);
    } else {
      float mottled = smoothstep(0.34, 0.74, largeNoise + fineNoise * 0.22);
      surfaceColor = mix(uColorC, uColorA, mottled);
      vec2 heartUv = vec2((uv.x - 0.58) * 1.6, uv.y - 0.48);
      float heart = 1.0 - smoothstep(0.08, 0.19, length(heartUv));
      surfaceColor = mix(surfaceColor, uColorB, heart * 0.48);
    }

    vec3 normal = normalize(vWorldNormal);
    vec3 sunDirection = normalize(-vWorldPosition);
    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
    float diffuse = max(dot(normal, sunDirection), 0.0);
    float twilight = pow(1.0 - max(dot(normal, viewDirection), 0.0), 2.8);
    float lighting = 0.24 + diffuse * 0.92;
    vec3 finalColor = surfaceColor * lighting + uColorB * twilight * 0.18;

    gl_FragColor = vec4(finalColor, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const atmosphereVertexShader = /* glsl */ `
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;

  void main() {
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const atmosphereFragmentShader = /* glsl */ `
  uniform vec3 uGlowColor;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;

  void main() {
    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
    float fresnel = pow(1.0 - abs(dot(normalize(vWorldNormal), viewDirection)), 2.35);
    gl_FragColor = vec4(uGlowColor, fresnel * 0.52);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const sunFragmentShader = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;

  ${noiseFunctions}

  void main() {
    vec2 uv = vUv;
    float time = uTime * 0.055;
    float longitude = uv.x * 6.28318530718;
    vec2 wrappedLongitude = vec2(cos(longitude), sin(longitude));
    vec2 plasmaPointA = wrappedLongitude * 3.4 + vec2(uv.y * 3.2 + time, uv.y * 5.0 - time * 0.45);
    vec2 plasmaPointB = wrappedLongitude * 8.2 + vec2(uv.y * 8.0 - time, uv.y * 12.0 + time * 0.6);
    float plasmaA = fbm(plasmaPointA);
    float plasmaB = fbm(plasmaPointB + vec2(plasmaA * 2.0));
    float filaments = sin(uv.y * 75.0 + plasmaA * 13.0 + uTime * 0.22) * 0.5 + 0.5;
    float hotCells = smoothstep(0.48, 0.88, plasmaA + plasmaB * 0.35);

    vec3 deepOrange = vec3(1.0, 0.16, 0.015);
    vec3 solarOrange = vec3(1.0, 0.47, 0.035);
    vec3 solarYellow = vec3(1.0, 0.92, 0.42);
    vec3 surfaceColor = mix(deepOrange, solarOrange, plasmaA);
    surfaceColor = mix(surfaceColor, solarYellow, hotCells * 0.82 + filaments * 0.18);

    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
    float rim = pow(1.0 - abs(dot(normalize(vWorldNormal), viewDirection)), 2.0);
    surfaceColor += vec3(1.0, 0.38, 0.06) * rim * 0.58;

    gl_FragColor = vec4(surfaceColor, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const planeVertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const galaxyFragmentShader = /* glsl */ `
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
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const sunRaysFragmentShader = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;

  ${noiseFunctions}

  void main() {
    vec2 point = (vUv - 0.5) * 2.0;
    float radius = length(point);
    float angle = atan(point.y, point.x);
    float rayNoise = fbm(vec2(angle * 2.8 + uTime * 0.04, radius * 3.0));
    float fineRays = sin(angle * 32.0 + rayNoise * 6.0 + uTime * 0.18) * 0.5 + 0.5;
    float broadRays = sin(angle * 11.0 - uTime * 0.1) * 0.5 + 0.5;
    fineRays = pow(fineRays, 6.0);
    broadRays = pow(broadRays, 9.0);
    float radialFade = 1.0 - smoothstep(0.1, 1.0, radius);
    float outerFade = 1.0 - smoothstep(0.42, 1.0, radius);
    float halo = exp(-radius * 3.4) * 0.38;
    float alpha = halo + (fineRays * 0.15 + broadRays * 0.12) * outerFade * (0.45 + rayNoise);
    alpha *= smoothstep(0.02, 0.16, radius) * radialFade;
    vec3 color = mix(vec3(1.0, 0.22, 0.015), vec3(1.0, 0.82, 0.26), fineRays + halo);

    gl_FragColor = vec4(color, alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

function OrbitRing({
  radius,
  color,
  inclination,
}: {
  radius: number;
  color: string;
  inclination: number;
}) {
  const points = useMemo(() => {
    const curve = new THREE.EllipseCurve(0, 0, radius, radius, 0, Math.PI * 2);
    return curve.getPoints(256).map((point) => new THREE.Vector3(point.x, 0, point.y));
  }, [radius]);

  return (
    <group rotation={[0, 0, inclination]}>
      <Line
        color={color}
        depthWrite={false}
        lineWidth={5}
        opacity={0.055}
        points={points}
        transparent
      />
      <Line
        color={color}
        depthWrite={false}
        lineWidth={1}
        opacity={0.52}
        points={points}
        transparent
      />
    </group>
  );
}

function Sun({ onSelect }: { onSelect: (celestial: CelestialInfo) => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const coronaRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const raysMaterialRef = useRef<THREE.ShaderMaterial>(null);
  const surfaceUniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  const raysUniforms = useMemo(() => ({ uTime: { value: 0 } }), []);


  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2;
      meshRef.current.rotation.z += delta * 0.035;
    }

    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }

    if (raysMaterialRef.current) {
      raysMaterialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }

    if (coronaRef.current) {
      const pulse = 1.3 + Math.sin(state.clock.elapsedTime * 1.8) * 0.025;
      coronaRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <group>
      <pointLight color="#ffd28a" intensity={90} distance={35} decay={1.75} />
      <Billboard scale={[18.5, 18.5, 10]}>
        <mesh>
          <planeGeometry args={[1, 1]} />
          <shaderMaterial
            ref={raysMaterialRef}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            fragmentShader={sunRaysFragmentShader}
            side={THREE.DoubleSide}
            transparent
            uniforms={raysUniforms}
            vertexShader={planeVertexShader}
          />
        </mesh>
      </Billboard>
      <mesh
        ref={meshRef}
        onClick={(event) => {
          event.stopPropagation();
          document.body.style.cursor = "auto";
          onSelect(sunInfo);
        }}
        onPointerOver={(event) => {
          event.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "auto";
        }}
      >
        <sphereGeometry args={[1.2, 64, 64]} />
        <shaderMaterial
          ref={materialRef}
          fragmentShader={sunFragmentShader}
          toneMapped={false}
          uniforms={surfaceUniforms}
          vertexShader={planetVertexShader}
        />
      </mesh>

      <mesh scale={1.48}>
        <sphereGeometry args={[10.05, 48, 48]} />
        <meshBasicMaterial
          blending={THREE.AdditiveBlending}
          color="#ff8a24"
          depthWrite={false}
          opacity={0.035}
          side={THREE.BackSide}
          transparent
        />
      </mesh>
    </group>
  );
}

function DistantGalaxy({
  position,
  rotation,
  scale,
  coreColor,
  armColor,
  seed,
  style = "band",
}: {
  position: [number, number, number];
  rotation: number;
  scale: [number, number, number];
  coreColor: string;
  armColor: string;
  seed: number;
  style?: "band" | "spiral";
}) {
  const uniforms = useMemo(
    () => ({
      uCoreColor: { value: new THREE.Color(coreColor) },
      uArmColor: { value: new THREE.Color(armColor) },
      uSeed: { value: seed },
      uStyle: { value: style === "spiral" ? 1 : 0 },
    }),
    [armColor, coreColor, seed, style],
  );

  return (
    <Billboard position={position} scale={scale}>
      <mesh rotation={[0, 0, rotation]}>
        <planeGeometry args={[1, 1, 1, 1]} />
        <shaderMaterial
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          fragmentShader={galaxyFragmentShader}
          side={THREE.DoubleSide}
          transparent
          uniforms={uniforms}
          vertexShader={planeVertexShader}
        />
      </mesh>
    </Billboard>
  );
}

function RoughAsteroid({ asteroid }: { asteroid: AsteroidSpec }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const start = useMemo(() => new THREE.Vector3(...asteroid.start), [asteroid.start]);
  const end = useMemo(() => new THREE.Vector3(...asteroid.end), [asteroid.end]);
  const geometry = useMemo(() => {
    const asteroidGeometry = new THREE.IcosahedronGeometry(asteroid.size, 2);
    const positions = asteroidGeometry.attributes.position as THREE.BufferAttribute;
    const vertex = new THREE.Vector3();

    for (let index = 0; index < positions.count; index += 1) {
      vertex.fromBufferAttribute(positions, index);
      const normal = vertex.clone().normalize();
      const roughness =
        1 +
        Math.sin(normal.x * 12.7 + asteroid.seed) * 0.11 +
        Math.sin(normal.y * 17.3 + normal.z * 9.1 + asteroid.seed * 2) * 0.07;
      positions.setXYZ(index, vertex.x * roughness, vertex.y * roughness, vertex.z * roughness);
    }

    positions.needsUpdate = true;
    asteroidGeometry.computeVertexNormals();
    return asteroidGeometry;
  }, [asteroid.seed, asteroid.size]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((state, delta) => {
    if (!meshRef.current) {
      return;
    }

    const progress = ((state.clock.elapsedTime + asteroid.offset) % asteroid.duration) / asteroid.duration;
    meshRef.current.position.lerpVectors(start, end, progress);
    meshRef.current.rotation.x += delta * (0.16 + asteroid.seed * 0.012);
    meshRef.current.rotation.y += delta * (0.21 + asteroid.seed * 0.01);
    meshRef.current.rotation.z += delta * 0.08;
  });

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshStandardMaterial
        color={asteroid.color}
        flatShading
        metalness={0.08}
        roughness={0.96}
      />
    </mesh>
  );
}

function SaturnRing({ radius, accent }: { radius: number; accent: string }) {
  return (
    <group rotation={[Math.PI / 2.5, 0, 0]}>
      <mesh>
        <ringGeometry args={[radius * 1.24, radius * 1.48, 128]} />
        <meshStandardMaterial
          color="#9f8257"
          transparent
          opacity={0.62}
          side={THREE.DoubleSide}
          roughness={0.72}
        />
      </mesh>
      <mesh>
        <ringGeometry args={[radius * 1.52, radius * 1.72, 128]} />
        <meshStandardMaterial
          color={accent}
          transparent
          opacity={0.48}
          side={THREE.DoubleSide}
          roughness={0.68}
        />
      </mesh>
      <mesh>
        <ringGeometry args={[radius * 1.77, radius * 2.02, 128]} />
        <meshStandardMaterial
          color="#bca477"
          transparent
          opacity={0.34}
          side={THREE.DoubleSide}
          roughness={0.75}
        />
      </mesh>
    </group>
  );
}

function PlanetLabel({ name, radius }: { name: string; radius: number }) {
  const texture = useMemo(() => {
    if (typeof document === "undefined") {
      return null;
    }

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      return null;
    }

    canvas.width = 512;
    canvas.height = 128;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.font = "600 46px Arial, sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.shadowColor = "rgba(0, 0, 0, 0.95)";
    context.shadowBlur = 12;
    context.lineWidth = 7;
    context.strokeStyle = "rgba(2, 3, 10, 0.95)";
    context.strokeText(name, canvas.width / 2, canvas.height / 2);
    context.fillStyle = "#f8fbff";
    context.fillText(name, canvas.width / 2, canvas.height / 2);

    const labelTexture = new THREE.CanvasTexture(canvas);
    labelTexture.colorSpace = THREE.SRGBColorSpace;
    labelTexture.needsUpdate = true;
    return labelTexture;
  }, [name]);

  useEffect(() => () => texture?.dispose(), [texture]);

  if (!texture) {
    return null;
  }

  return (
    <sprite position={[0, radius + 0.42, 0]} renderOrder={3} scale={[1.55, 0.39, 1]}>
      <spriteMaterial depthTest={false} map={texture} transparent />
    </sprite>
  );
}

function PlanetBody({
  planet,
  index,
  onSelect,
}: {
  planet: Planet;
  index: number;
  onSelect: (celestial: CelestialInfo) => void;
}) {
  const orbitRef = useRef<THREE.Group>(null);
  const spinRef = useRef<THREE.Group>(null);
  const surfaceMaterialRef = useRef<THREE.ShaderMaterial>(null);
  const startingAngleRef = useRef(0);
  const hasRandomAngleRef = useRef(false);
  const surfaceUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSurface: { value: planet.surface },
      uColorA: { value: new THREE.Color(planet.color) },
      uColorB: { value: new THREE.Color(planet.accent) },
      uColorC: { value: new THREE.Color(planet.detailColor) },
    }),
    [planet],
  );
  const atmosphereUniforms = useMemo(
    () => ({ uGlowColor: { value: new THREE.Color(planet.atmosphere) } }),
    [planet.atmosphere],
  );

  useFrame((state, delta) => {
    if (!hasRandomAngleRef.current) {
      const randomValue = new Uint32Array(1);
      crypto.getRandomValues(randomValue);
      startingAngleRef.current = (randomValue[0] / 0xffffffff) * Math.PI * 2;
      hasRandomAngleRef.current = true;
    }

    if (orbitRef.current) {
      orbitRef.current.rotation.y =
        startingAngleRef.current + state.clock.elapsedTime * planet.orbitSpeed * PLANET_MOTION_SPEED;
    }

    if (spinRef.current) {
      spinRef.current.rotation.y += delta * planet.selfSpeed * PLANET_MOTION_SPEED;
      spinRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.35 + index) * 0.055;
    }

    if (surfaceMaterialRef.current) {
      surfaceMaterialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <group rotation={[0, 0, planet.inclination]}>
      <group ref={orbitRef}>
        <group
          position={[planet.distance, 0, 0]}
          onClick={(event) => {
            event.stopPropagation();
            document.body.style.cursor = "auto";
            onSelect(planet);
          }}
          onPointerOver={(event) => {
            event.stopPropagation();
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            document.body.style.cursor = "auto";
          }}
        >
          <group ref={spinRef}>
            <mesh>
              <sphereGeometry args={[planet.radius, 64, 64]} />
              <shaderMaterial
                ref={surfaceMaterialRef}
                fragmentShader={planetFragmentShader}
                uniforms={surfaceUniforms}
                vertexShader={planetVertexShader}
              />
            </mesh>

            {planet.name === "Sao Thổ" ? (
              <SaturnRing radius={planet.radius} accent={planet.accent} />
            ) : null}
          </group>

          <mesh scale={1.11}>
            <sphereGeometry args={[planet.radius, 48, 48]} />
            <shaderMaterial
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              fragmentShader={atmosphereFragmentShader}
              side={THREE.BackSide}
              transparent
              uniforms={atmosphereUniforms}
              vertexShader={atmosphereVertexShader}
            />
          </mesh>

          <PlanetLabel name={planet.name} radius={planet.radius} />
        </group>
      </group>
    </group>
  );
}

function PlanetSystem({ onSelect }: { onSelect: (celestial: CelestialInfo) => void }) {
  return (
    <>
      <color attach="background" args={["#02030a"]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 8, 6]} intensity={1.4} color="#a9c7ff" />
      <Stars radius={90} depth={45} count={3800} factor={4} saturation={0.35} fade speed={0.55} />

      <DistantGalaxy
        armColor="#557dff"
        coreColor="#fff0d2"
        position={[0, -7, -78]}
        rotation={-0.18}
        scale={[96, 30, 1]}
        seed={1.2}
      />


      <Sun onSelect={onSelect} />

      {asteroids.map((asteroid) => (
        <RoughAsteroid key={asteroid.name} asteroid={asteroid} />
      ))}

      {planets.map((planet) => (
        <OrbitRing
          key={planet.name}
          color={planet.accent}
          inclination={planet.inclination}
          radius={planet.distance}
        />
      ))}

      {planets.map((planet, index) => (
        <PlanetBody key={planet.name} index={index} planet={planet} onSelect={onSelect} />
      ))}

      <OrbitControls
        autoRotate
        autoRotateSpeed={0.35}
        enableDamping
        dampingFactor={0.06}
        maxDistance={24}
        minDistance={7}
        target={[0, 0, 0]}
      />
    </>
  );
}

function CelestialModal({
  celestial,
  onClose,
}: {
  celestial: CelestialInfo | null;
  onClose: () => void;
}) {
  if (!celestial) {
    return null;
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
            onClick={onClose}
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
