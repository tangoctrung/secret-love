export function GardenFlower({
  color,
  position,
}: {
  color: string;
  position: [number, number, number];
}) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.025, 0.035, 0.7, 7]} />
        <meshStandardMaterial color="#287d43" roughness={0.9} />
      </mesh>
      {Array.from({ length: 5 }, (_, index) => {
        const angle = (index / 5) * Math.PI * 2;
        return (
          <mesh
            castShadow
            key={index}
            position={[Math.cos(angle) * 0.14, 0.76, Math.sin(angle) * 0.14]}
            scale={[1.25, 0.6, 1]}
          >
            <sphereGeometry args={[0.13, 10, 8]} />
            <meshStandardMaterial color={color} roughness={0.72} />
          </mesh>
        );
      })}
      <mesh castShadow position={[0, 0.77, 0]}>
        <sphereGeometry args={[0.09, 10, 8]} />
        <meshStandardMaterial color="#5b351f" roughness={0.8} />
      </mesh>
    </group>
  );
}
