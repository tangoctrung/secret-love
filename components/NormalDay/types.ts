export type CelestialInfo = {
  name: string;
  subtitle: string;
  description: string;
  accent: string;
  facts: string[];
};

export type Planet = CelestialInfo & {
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

export type AsteroidSpec = {
  name: string;
  start: [number, number, number];
  end: [number, number, number];
  size: number;
  duration: number;
  offset: number;
  seed: number;
  color: string;
};
