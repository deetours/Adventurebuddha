import { useRef } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import * as THREE from 'three';

// Extend THREE to ensure all geometries are available
extend(THREE);

interface FloatingObjectProps {
  position: [number, number, number];
  color: string;
  speed: number;
  component: 'sphere' | 'box' | 'octahedron';
}

function FloatingObject({ position, color, speed, component }: FloatingObjectProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed) * 0.5;
      meshRef.current.rotation.x = state.clock.elapsedTime * speed * 0.3;
      meshRef.current.rotation.y = state.clock.elapsedTime * speed * 0.2;
    }
  });

  const renderComponent = () => {
    switch (component) {
      case 'sphere':
        return (
          <mesh ref={meshRef} position={position}>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshStandardMaterial color={color} transparent opacity={0.3} />
          </mesh>
        );
      case 'box':
        return (
          <mesh ref={meshRef} position={position}>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial color={color} transparent opacity={0.3} />
          </mesh>
        );
      case 'octahedron':
        return (
          <mesh ref={meshRef} position={position}>
            <octahedronGeometry args={[0.5, 0]} />
            <meshStandardMaterial color={color} transparent opacity={0.3} />
          </mesh>
        );
      default:
        return (
          <mesh ref={meshRef} position={position}>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshStandardMaterial color={color} transparent opacity={0.3} />
          </mesh>
        );
    }
  };

  return renderComponent();
}

interface WebGLFloatingObjectsProps {
  className?: string;
}

function WebGLFloatingObjects({ className }: WebGLFloatingObjectsProps) {
  const objects: FloatingObjectProps[] = [
    { position: [-2, 1, 0], color: '#FF6A00', speed: 0.8, component: 'sphere' },
    { position: [2, -1, -1], color: '#FF964C', speed: 1.2, component: 'octahedron' },
    { position: [0, 2, -2], color: '#FF6A00', speed: 1.0, component: 'box' },
  ];

  return (
    <div className={`absolute inset-0 ${className}`} style={{ zIndex: -1 }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        {objects.map((obj, index) => (
          <FloatingObject key={index} {...obj} />
        ))}
      </Canvas>
    </div>
  );
}

export default WebGLFloatingObjects;