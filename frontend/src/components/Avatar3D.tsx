import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';

interface Avatar3DProps {
  currentSign: string;
  isPlaying: boolean;
  speed: number;
}

// ---------------------------------------------------------
// 1. PROCEDURAL FINGER COMPONENT
// ---------------------------------------------------------
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

// ---------------------------------------------------------
// 2. PROCEDURAL DUAL HAND MODEL
// ---------------------------------------------------------
const DualHandModel = ({ currentSign, isPlaying, speed }: { currentSign: string, isPlaying: boolean, speed: number }) => {
  const leftWristRef = useRef<THREE.Group>(null);
  const rightWristRef = useRef<THREE.Group>(null);

  // Define procedural folding poses for alphabet
  // Each pose: [Thumb, Index, Middle, Ring, Pinky] -> [base, mid, tip]
  const fullOpen = [[0,0,0], [0,0,0], [0,0,0], [0,0,0], [0,0,0]];
  
  const letterPoses: Record<string, number[][]> = {
    'A': [[0, 0, 0], [1.5, 1.5, 1.5], [1.5, 1.5, 1.5], [1.5, 1.5, 1.5], [1.5, 1.5, 1.5]],
    'B': [[0, 1.5, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
    'C': [[0, 0.5, 0.5], [0.5, 0.5, 0.5], [0.5, 0.5, 0.5], [0.5, 0.5, 0.5], [0.5, 0.5, 0.5]],
    'D': [[0, 1.0, 0], [0, 0, 0], [1.5, 1.5, 1.5], [1.5, 1.5, 1.5], [1.5, 1.5, 1.5]],
    'E': [[0, 1.5, 0], [1.5, 1.5, 0], [1.5, 1.5, 0], [1.5, 1.5, 0], [1.5, 1.5, 0]],
    'F': [[0, 1.0, 0], [1.5, 1.5, 1.5], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
    'G': [[0, 0, 0], [0, 0, 0], [1.5, 1.5, 1.5], [1.5, 1.5, 1.5], [1.5, 1.5, 1.5]],
    'H': [[0, 1.5, 0], [0, 0, 0], [0, 0, 0], [1.5, 1.5, 1.5], [1.5, 1.5, 1.5]],
    'I': [[0, 1.5, 0], [1.5, 1.5, 1.5], [1.5, 1.5, 1.5], [1.5, 1.5, 1.5], [0, 0, 0]],
    'L': [[0, 0, 0], [0, 0, 0], [1.5, 1.5, 1.5], [1.5, 1.5, 1.5], [1.5, 1.5, 1.5]],
    'M': [[0, 1.5, 0], [1.5, 1.5, 1.5], [1.5, 1.5, 1.5], [1.5, 1.5, 1.5], [1.5, 1.5, 1.5]], // simplified
    'N': [[0, 1.5, 0], [1.5, 1.5, 1.5], [1.5, 1.5, 1.5], [1.5, 1.5, 1.5], [1.5, 1.5, 1.5]], // simplified
    'O': [[0, 1.0, 1.0], [1.0, 1.0, 1.0], [1.0, 1.0, 1.0], [1.0, 1.0, 1.0], [1.0, 1.0, 1.0]],
    'P': [[0, 1.0, 0], [0, 0, 0], [0.5, 0.5, 0.5], [1.5, 1.5, 1.5], [1.5, 1.5, 1.5]],
    'S': [[0, 1.5, 0], [1.5, 1.5, 1.5], [1.5, 1.5, 1.5], [1.5, 1.5, 1.5], [1.5, 1.5, 1.5]],
    'T': [[0, 1.5, 0], [1.5, 1.5, 1.5], [1.5, 1.5, 1.5], [1.5, 1.5, 1.5], [1.5, 1.5, 1.5]], // simplified
    'U': [[0, 1.5, 0], [0, 0, 0], [0, 0, 0], [1.5, 1.5, 1.5], [1.5, 1.5, 1.5]],
    'V': [[0, 1.5, 0], [0, 0, 0], [0, 0, 0], [1.5, 1.5, 1.5], [1.5, 1.5, 1.5]],
    'W': [[0, 1.5, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [1.5, 1.5, 1.5]],
    'Y': [[0, 0, 0], [1.5, 1.5, 1.5], [1.5, 1.5, 1.5], [1.5, 1.5, 1.5], [0, 0, 0]],
    ' ': fullOpen
  };

  const defaultPose = { left: fullOpen, right: fullOpen };
  
  // Create a dual hand target pose based on the single letter
  const getTargetPose = () => {
    if (!isPlaying) return defaultPose;
    const letter = currentSign?.toUpperCase() || ' ';
    const pose = letterPoses[letter] || fullOpen;
    // Apply finger spelling to the right hand
    return { left: fullOpen, right: pose };
  };

  const targetPose = getTargetPose();

  // Animate hands based on letter
  useFrame((state) => {
    if (leftWristRef.current && rightWristRef.current) {
      const t = state.clock.elapsedTime * speed;
      
      // Base idle breathing
      leftWristRef.current.position.y = -0.5 + Math.sin(t * 0.5) * 0.05;
      rightWristRef.current.position.y = -0.5 + Math.cos(t * 0.5) * 0.05;

      if (isPlaying && currentSign !== ' ') {
        // slight wrist movement while spelling
        rightWristRef.current.rotation.x = Math.sin(t * 4) * 0.1;
        rightWristRef.current.rotation.z = Math.cos(t * 4) * 0.05;
        
        // J and Z have motion, but we'll stick to static for now
      } else {
        leftWristRef.current.rotation.set(0, 0, 0);
        rightWristRef.current.rotation.set(0, 0, 0);
      }
    }
  });

  const renderHand = (wristRef: any, position: [number, number, number], pose: number[][], isLeft: boolean) => (
    <group ref={wristRef} position={position}>
      {/* Palm */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[1.6, 1.4, 0.4]} />
        <meshStandardMaterial color="#fbd38d" roughness={0.4} />
      </mesh>
      
      {/* Thumb */}
      <Finger position={[isLeft ? 0.9 : -0.9, 0.3, 0]} rotation={[0, 0, isLeft ? -0.8 : 0.8]} length={1.0} color="#fbd38d" 
        baseRot={pose[0][0]} midRot={pose[0][1]} tipRot={pose[0][2]} />
        
      {/* Index */}
      <Finger position={[isLeft ? 0.6 : -0.6, 1.2, 0]} rotation={[0, 0, isLeft ? -0.05 : 0.05]} length={1.3} color="#fbd38d" 
        baseRot={pose[1][0]} midRot={pose[1][1]} tipRot={pose[1][2]} />
        
      {/* Middle */}
      <Finger position={[0, 1.2, 0]} rotation={[0, 0, 0]} length={1.4} color="#fbd38d" 
        baseRot={pose[2][0]} midRot={pose[2][1]} tipRot={pose[2][2]} />
        
      {/* Ring */}
      <Finger position={[isLeft ? -0.6 : 0.6, 1.2, 0]} rotation={[0, 0, isLeft ? 0.05 : -0.05]} length={1.3} color="#fbd38d" 
        baseRot={pose[3][0]} midRot={pose[3][1]} tipRot={pose[3][2]} />
        
      {/* Pinky */}
      <Finger position={[isLeft ? -1.1 : 1.1, 1.0, 0]} rotation={[0, 0, isLeft ? 0.15 : -0.15]} length={1.1} color="#fbd38d" 
        baseRot={pose[4][0]} midRot={pose[4][1]} tipRot={pose[4][2]} />
    </group>
  );

  return (
    <group>
      {renderHand(leftWristRef, [-1.5, -0.5, 0], targetPose.left, true)}
      {renderHand(rightWristRef, [1.5, -0.5, 0], targetPose.right, false)}
    </group>
  );
};

export const Avatar3D: React.FC<Avatar3DProps> = ({ currentSign, isPlaying, speed }) => {
  return (
    <div className="relative w-full aspect-video md:aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950 shadow-inner border border-slate-800 flex items-center justify-center">
      <Canvas camera={{ position: [0, 1.5, 5], fov: 60 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
        <Environment preset="city" />
        
        <DualHandModel currentSign={currentSign} isPlaying={isPlaying} speed={speed} />
        
        <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 2 + 0.2} minPolarAngle={Math.PI / 2 - 0.2} />
      </Canvas>
      <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700 text-xs font-semibold text-indigo-300 flex items-center space-x-2">
        <span className={`w-2.5 h-2.5 rounded-full ${isPlaying ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
        <span>Playing Sequence: {currentSign || 'IDLE'}</span>
      </div>
    </div>
  );
};
