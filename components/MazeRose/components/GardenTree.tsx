export function GardenTree({
  position,
  scale,
}: {
  position: [number, number, number];
  scale: number;
}) {
  return (
    <group position={position} scale={scale}>
      <mesh castShadow position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.28, 0.42, 3, 9]} />
        <meshStandardMaterial color="#795033" roughness={0.95} />
      </mesh>
      <mesh castShadow position={[0, 3.6, 0]}>
        <sphereGeometry args={[1.35, 18, 14]} />
        <meshStandardMaterial color="#2f8e52" roughness={0.88} />
      </mesh>
      <mesh castShadow position={[-0.72, 3.15, 0.12]}>
        <sphereGeometry args={[0.92, 16, 12]} />
        <meshStandardMaterial color="#43a862" roughness={0.9} />
      </mesh>
      <mesh castShadow position={[0.68, 3.2, -0.08]}>
        <sphereGeometry args={[1, 16, 12]} />
        <meshStandardMaterial color="#3b9d5c" roughness={0.9} />
      </mesh>
    </group>
  );
}
