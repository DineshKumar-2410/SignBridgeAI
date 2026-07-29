import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';

interface Avatar3DProps {
  currentSign: string;
  isPlaying: boolean;
  speed: number;
}

const Finger = ({ position, rotation, length, color, baseRot, midRot, tipRot }: any) => {
  const baseRef = useRef<THREE.Group>(null);
  const midRef = useRef<THREE.Group>(null);
  const tipRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (baseRef.current) baseRef.current.rotation.x = THREE.MathUtils.damp(baseRef.current.rotation.x, baseRot, 4, delta);
    if (midRef.current) midRef.current.rotation.x = THREE.MathUtils.damp(midRef.current.rotation.x, midRot, 4, delta);
    if (tipRef.current) tipRef.current.rotation.x = THREE.MathUtils.damp(tipRef.current.rotation.x, tipRot, 4, delta);
  });

  return (
    <group position={position} rotation={rotation}>
      <group ref={baseRef}>
        <mesh position={[0, length * 0.16, 0]}>
          <cylinderGeometry args={[0.12, 0.12, length * 0.33, 16]} />
          <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
        </mesh>
        <group position={[0, length * 0.33, 0]} ref={midRef}>
          <mesh position={[0, length * 0.16, 0]}>
            <cylinderGeometry args={[0.11, 0.11, length * 0.33, 16]} />
            <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
          </mesh>
          <group position={[0, length * 0.33, 0]} ref={tipRef}>
            <mesh position={[0, length * 0.16, 0]}>
              <cylinderGeometry args={[0.10, 0.10, length * 0.33, 16]} />
              <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
};

const HandModel = ({ currentSign, isPlaying, speed }: { currentSign: string, isPlaying: boolean, speed: number }) => {
  const wristRef = useRef<THREE.Group>(null);

  const poses: Record<string, number[][]> = {
    'A': [
      [0, 0, 0], [1.5, 1.5, 1.5], [1.5, 1.5, 1.5], [1.5, 1.5, 1.5], [1.5, 1.5, 1.5]
    ],
    'B': [
      [0, 1.5, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]
    ],
    'C': [
      [0, 0.5, 0.5], [0.5, 0.5, 0.5], [0.5, 0.5, 0.5], [0.5, 0.5, 0.5], [0.5, 0.5, 0.5]
    ],
    'D': [
      [0, 1.0, 0], [0, 0, 0], [1.5, 1.5, 1.5], [1.5, 1.5, 1.5], [1.5, 1.5, 1.5]
    ],
    'E': [
      [0, 1.5, 0], [1.5, 1.5, 0], [1.5, 1.5, 0], [1.5, 1.5, 0], [1.5, 1.5, 0]
    ],
    'F': [
      [0, 1.0, 0], [1.5, 1.5, 1.5], [0, 0, 0], [0, 0, 0], [0, 0, 0]
    ],
    'G': [
      [0, 0, 0], [0, 0, 0], [1.5, 1.5, 1.5], [1.5, 1.5, 1.5], [1.5, 1.5, 1.5]
    ],
    'I': [
      [0, 1.5, 0], [1.5, 1.5, 1.5], [1.5, 1.5, 1.5], [1.5, 1.5, 1.5], [0, 0, 0]
    ],
    'L': [
      [0, 0, 0], [0, 0, 0], [1.5, 1.5, 1.5], [1.5, 1.5, 1.5], [1.5, 1.5, 1.5]
    ],
    'O': [
      [0, 1.0, 1.0], [1.0, 1.0, 1.0], [1.0, 1.0, 1.0], [1.0, 1.0, 1.0], [1.0, 1.0, 1.0]
    ],
    'S': [
      [0, 1.5, 0], [1.5, 1.5, 1.5], [1.5, 1.5, 1.5], [1.5, 1.5, 1.5], [1.5, 1.5, 1.5]
    ],
    'U': [
      [0, 1.5, 0], [0, 0, 0], [0, 0, 0], [1.5, 1.5, 1.5], [1.5, 1.5, 1.5]
    ],
    'V': [
      [0, 1.5, 0], [0, 0, 0], [0, 0, 0], [1.5, 1.5, 1.5], [1.5, 1.5, 1.5]
    ],
    'W': [
      [0, 1.5, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [1.5, 1.5, 1.5]
    ]
  };

  const defaultPose = [
    [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]
  ];

  const targetPose = isPlaying ? (poses[currentSign] || poses['A']) : defaultPose;

  useFrame((state) => {
    if (wristRef.current) {
      wristRef.current.rotation.y = Math.sin(state.clock.elapsedTime * speed) * 0.1;
      wristRef.current.rotation.x = Math.sin(state.clock.elapsedTime * speed * 0.5) * 0.05;
    }
  });

  return (
    <group ref={wristRef} position={[0, -1, 0]}>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[1.6, 1.4, 0.4]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.4} />
      </mesh>
      
      <Finger position={[-0.9, 0.3, 0]} rotation={[0, 0, 0.8]} length={1.0} color="#f8fafc" 
        baseRot={targetPose[0][0]} midRot={targetPose[0][1]} tipRot={targetPose[0][2]} />
        
      <Finger position={[-0.6, 1.2, 0]} rotation={[0, 0, 0.05]} length={1.3} color="#f8fafc" 
        baseRot={targetPose[1][0]} midRot={targetPose[1][1]} tipRot={targetPose[1][2]} />
        
      <Finger position={[0, 1.2, 0]} rotation={[0, 0, 0]} length={1.4} color="#f8fafc" 
        baseRot={targetPose[2][0]} midRot={targetPose[2][1]} tipRot={targetPose[2][2]} />
        
      <Finger position={[0.6, 1.2, 0]} rotation={[0, 0, -0.05]} length={1.3} color="#f8fafc" 
        baseRot={targetPose[3][0]} midRot={targetPose[3][1]} tipRot={targetPose[3][2]} />
        
      <Finger position={[1.1, 1.0, 0]} rotation={[0, 0, -0.15]} length={1.1} color="#f8fafc" 
        baseRot={targetPose[4][0]} midRot={targetPose[4][1]} tipRot={targetPose[4][2]} />
    </group>
  );
};

export const Avatar3D: React.FC<Avatar3DProps> = ({ currentSign, isPlaying, speed }) => {
  return (
    <div className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950 shadow-inner border border-slate-800">
      <Canvas camera={{ position: [0, 1.5, 5], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
        <Environment preset="city" />
        <HandModel currentSign={currentSign} isPlaying={isPlaying} speed={speed} />
        <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 2 + 0.2} minPolarAngle={Math.PI / 2 - 0.2} />
      </Canvas>
      <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700 text-xs font-semibold text-indigo-300 flex items-center space-x-2">
        <span className={`w-2.5 h-2.5 rounded-full ${isPlaying ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
        <span>Signing Letter: {currentSign}</span>
      </div>
    </div>
  );
};
