import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { ISL_ALPHABET_MAP } from '../data/islAlphabet';

interface Avatar3DProps {
  currentSign: string;
  isPlaying: boolean;
  speed: number;
}

// Full-open reference pose
const FULL_OPEN: number[][] = [[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0]];

// ---------------------------------------------------------
// 1. SINGLE FINGER — reads live target from a ref
// ---------------------------------------------------------
interface FingerProps {
  position: [number, number, number];
  rotation: [number, number, number];
  length: number;
  color: string;
  /** Index into the hand pose array: 0=Thumb,1=Index,2=Middle,3=Ring,4=Pinky */
  fingerIndex: number;
  /** Ref to the parent hand's current pose array [5 fingers][3 joints] */
  poseRef: React.MutableRefObject<number[][]>;
}

const Finger: React.FC<FingerProps> = ({ position, rotation, length, color, fingerIndex, poseRef }) => {
  const baseRef = useRef<THREE.Group>(null);
  const midRef  = useRef<THREE.Group>(null);
  const tipRef  = useRef<THREE.Group>(null);

  useFrame((_state, delta) => {
    const pose = poseRef.current[fingerIndex] ?? [0, 0, 0];
    const [b, m, t] = pose;
    if (baseRef.current) baseRef.current.rotation.x = THREE.MathUtils.damp(baseRef.current.rotation.x, b, 6, delta);
    if (midRef.current)  midRef.current.rotation.x  = THREE.MathUtils.damp(midRef.current.rotation.x,  m, 6, delta);
    if (tipRef.current)  tipRef.current.rotation.x  = THREE.MathUtils.damp(tipRef.current.rotation.x,  t, 6, delta);
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
// 2. HAND — owns a poseRef so fingers always read latest
// ---------------------------------------------------------
interface HandProps {
  position: [number, number, number];
  isLeft: boolean;
  poseRef: React.MutableRefObject<number[][]>;
  wristRef: React.MutableRefObject<THREE.Group | null>;
}

const Hand: React.FC<HandProps> = ({ position, isLeft, poseRef, wristRef }) => {
  const color = '#fbd38d';
  const s = isLeft ? 1 : -1; // mirror X offsets for left vs right

  return (
    <group ref={wristRef} position={position}>
      {/* Palm */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[1.6, 1.4, 0.4]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>

      {/* Thumb */}
      <Finger position={[s * 0.9, 0.3, 0]} rotation={[0, 0, s * -0.8]} length={1.0} color={color} fingerIndex={0} poseRef={poseRef} />
      {/* Index */}
      <Finger position={[s * 0.6, 1.2, 0]} rotation={[0, 0, s * -0.05]} length={1.3} color={color} fingerIndex={1} poseRef={poseRef} />
      {/* Middle */}
      <Finger position={[0, 1.2, 0]} rotation={[0, 0, 0]} length={1.4} color={color} fingerIndex={2} poseRef={poseRef} />
      {/* Ring */}
      <Finger position={[s * -0.6, 1.2, 0]} rotation={[0, 0, s * 0.05]} length={1.3} color={color} fingerIndex={3} poseRef={poseRef} />
      {/* Pinky */}
      <Finger position={[s * -1.1, 1.0, 0]} rotation={[0, 0, s * 0.15]} length={1.1} color={color} fingerIndex={4} poseRef={poseRef} />
    </group>
  );
};

// ---------------------------------------------------------
// 3. DUAL HAND MODEL — updates poseRefs every frame
// ---------------------------------------------------------
const DualHandModel = ({ currentSign, isPlaying, speed }: { currentSign: string; isPlaying: boolean; speed: number }) => {
  const leftWristRef  = useRef<THREE.Group>(null);
  const rightWristRef = useRef<THREE.Group>(null);

  // These refs hold the LIVE target poses — readable by Finger's useFrame
  const leftPoseRef  = useRef<number[][]>(FULL_OPEN);
  const rightPoseRef = useRef<number[][]>(FULL_OPEN);

  useFrame((state) => {
    // --- Update pose refs based on current sign ---
    const letter = (currentSign ?? '').toUpperCase();
    const entry = letter && letter !== ' ' ? ISL_ALPHABET_MAP[letter] : null;

    if (isPlaying && entry) {
      leftPoseRef.current  = entry.leftPose ?? FULL_OPEN;
      rightPoseRef.current = entry.rightPose;
    } else {
      leftPoseRef.current  = FULL_OPEN;
      rightPoseRef.current = FULL_OPEN;
    }

    // --- Animate wrist positions & rotations ---
    const t = state.clock.elapsedTime * speed;
    const baseRotY = 0.6;

    if (leftWristRef.current && rightWristRef.current) {
      leftWristRef.current.position.y  = -0.5 + Math.sin(t * 0.5) * 0.05;
      rightWristRef.current.position.y = -0.5 + Math.cos(t * 0.5) * 0.05;

      if (isPlaying && currentSign !== ' ') {
        leftWristRef.current.rotation.set(Math.sin(t * 4) * 0.08, baseRotY, Math.cos(t * 4) * 0.04);
        rightWristRef.current.rotation.set(Math.sin(t * 4) * 0.08, -baseRotY, Math.cos(t * 4) * 0.04);
      } else {
        leftWristRef.current.rotation.set(0, baseRotY, 0);
        rightWristRef.current.rotation.set(0, -baseRotY, 0);
      }
    }
  });

  return (
    <group>
      <Hand position={[-1.5, -0.5, 0]} isLeft={true}  poseRef={leftPoseRef}  wristRef={leftWristRef} />
      <Hand position={[ 1.5, -0.5, 0]} isLeft={false} poseRef={rightPoseRef} wristRef={rightWristRef} />
    </group>
  );
};

// ---------------------------------------------------------
// 4. CANVAS WRAPPER
// ---------------------------------------------------------
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
        <span>Signing: {currentSign || 'IDLE'}</span>
      </div>
    </div>
  );
};
