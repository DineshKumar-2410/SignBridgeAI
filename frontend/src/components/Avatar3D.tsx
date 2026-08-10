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

const SKIN = '#fbd38d';
const FULL_OPEN: number[][] = [[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0]];

interface FingerDef {
  position: [number, number, number];
  rotation: [number, number, number];
  length: number;
}

// Left hand finger definitions (thumb → pinky)
const LEFT_FINGERS: FingerDef[] = [
  { position: [ 0.9, 0.3, 0], rotation: [0, 0, -0.8],  length: 1.0 }, // Thumb
  { position: [ 0.6, 1.2, 0], rotation: [0, 0, -0.05], length: 1.3 }, // Index
  { position: [ 0.0, 1.2, 0], rotation: [0, 0,  0.0],  length: 1.4 }, // Middle
  { position: [-0.6, 1.2, 0], rotation: [0, 0,  0.05], length: 1.3 }, // Ring
  { position: [-1.1, 1.0, 0], rotation: [0, 0,  0.15], length: 1.1 }, // Pinky
];

// Right hand mirrors the X positions and Z tilts
const RIGHT_FINGERS: FingerDef[] = LEFT_FINGERS.map(f => ({
  position: [-f.position[0], f.position[1], f.position[2]] as [number, number, number],
  rotation: [f.rotation[0], f.rotation[1], -f.rotation[2]] as [number, number, number],
  length: f.length,
}));

// Plain render helper (not a React component — no hooks inside)
function renderFinger(
  def: FingerDef,
  bRef: React.MutableRefObject<THREE.Group | null>,
  mRef: React.MutableRefObject<THREE.Group | null>,
  tRef: React.MutableRefObject<THREE.Group | null>,
): React.ReactNode {
  const L = def.length;
  return (
    <group position={def.position} rotation={def.rotation}>
      {/* Base joint — knuckle pivot */}
      <group ref={bRef}>
        <mesh position={[0, L * 0.16, 0]}>
          <cylinderGeometry args={[0.12, 0.12, L * 0.33, 12]} />
          <meshStandardMaterial color={SKIN} roughness={0.3} metalness={0.1} />
        </mesh>

        {/* Mid joint — PIP pivot */}
        <group position={[0, L * 0.33, 0]} ref={mRef}>
          <mesh position={[0, L * 0.16, 0]}>
            <cylinderGeometry args={[0.11, 0.11, L * 0.33, 12]} />
            <meshStandardMaterial color={SKIN} roughness={0.3} metalness={0.1} />
          </mesh>

          {/* Tip joint — DIP pivot */}
          <group position={[0, L * 0.33, 0]} ref={tRef}>
            <mesh position={[0, L * 0.16, 0]}>
              <cylinderGeometry args={[0.10, 0.10, L * 0.33, 12]} />
              <meshStandardMaterial color={SKIN} roughness={0.3} metalness={0.1} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}

// ---------------------------------------------------------
// Scene — ALL animation driven from ONE useFrame
// ---------------------------------------------------------
const HandsScene: React.FC<Avatar3DProps> = ({ currentSign, isPlaying, speed }) => {

  // ── Wrists ──
  const lWrist = useRef<THREE.Group>(null);
  const rWrist = useRef<THREE.Group>(null);

  // ── Left hand joint refs (finger × joint) ──
  const l0b = useRef<THREE.Group>(null), l0m = useRef<THREE.Group>(null), l0t = useRef<THREE.Group>(null);
  const l1b = useRef<THREE.Group>(null), l1m = useRef<THREE.Group>(null), l1t = useRef<THREE.Group>(null);
  const l2b = useRef<THREE.Group>(null), l2m = useRef<THREE.Group>(null), l2t = useRef<THREE.Group>(null);
  const l3b = useRef<THREE.Group>(null), l3m = useRef<THREE.Group>(null), l3t = useRef<THREE.Group>(null);
  const l4b = useRef<THREE.Group>(null), l4m = useRef<THREE.Group>(null), l4t = useRef<THREE.Group>(null);

  // ── Right hand joint refs ──
  const r0b = useRef<THREE.Group>(null), r0m = useRef<THREE.Group>(null), r0t = useRef<THREE.Group>(null);
  const r1b = useRef<THREE.Group>(null), r1m = useRef<THREE.Group>(null), r1t = useRef<THREE.Group>(null);
  const r2b = useRef<THREE.Group>(null), r2m = useRef<THREE.Group>(null), r2t = useRef<THREE.Group>(null);
  const r3b = useRef<THREE.Group>(null), r3m = useRef<THREE.Group>(null), r3t = useRef<THREE.Group>(null);
  const r4b = useRef<THREE.Group>(null), r4m = useRef<THREE.Group>(null), r4t = useRef<THREE.Group>(null);

  // Grouped for iteration in useFrame
  const leftJoints  = [[l0b,l0m,l0t],[l1b,l1m,l1t],[l2b,l2m,l2t],[l3b,l3m,l3t],[l4b,l4m,l4t]];
  const rightJoints = [[r0b,r0m,r0t],[r1b,r1m,r1t],[r2b,r2m,r2t],[r3b,r3m,r3t],[r4b,r4m,r4t]];

  // Track sign changes for punch-in animation
  const prevSign       = useRef<string>('');
  const signChangeTime = useRef<number>(0);

  // ── Single unified useFrame — no ordering issues ──
  useFrame((state, delta) => {
    // Resolve target pose for this frame
    const letter = (currentSign ?? '').toUpperCase();
    const entry  = isPlaying && letter && letter !== ' ' ? ISL_ALPHABET_MAP[letter] : null;
    const leftPose  = entry?.leftPose  ?? FULL_OPEN;
    const rightPose = entry?.rightPose ?? FULL_OPEN;

    // Animate joints for one hand
    const animHand = (
      joints: typeof leftJoints,
      pose: number[][],
    ) => {
      joints.forEach(([bRef, mRef, tRef], fi) => {
        const [b, m, t] = pose[fi] ?? [0, 0, 0];
        if (bRef.current) bRef.current.rotation.x = THREE.MathUtils.damp(bRef.current.rotation.x, b, 8, delta);
        if (mRef.current) mRef.current.rotation.x = THREE.MathUtils.damp(mRef.current.rotation.x, m, 8, delta);
        if (tRef.current) tRef.current.rotation.x = THREE.MathUtils.damp(tRef.current.rotation.x, t, 8, delta);
      });
    };

    animHand(leftJoints,  leftPose);
    animHand(rightJoints, rightPose);

    // ── Wrist animation — always running, visible motion ──
    const tt       = state.clock.elapsedTime;
    const ts       = tt * speed;
    const baseRotY = 0.6;

    // Detect sign change → trigger a brief "present" lift
    const currentLetter = (currentSign ?? '').toUpperCase();
    if (currentLetter !== prevSign.current) {
      prevSign.current = currentLetter;
      signChangeTime.current = tt;
    }
    const timeSinceChange = tt - signChangeTime.current;
    // Smooth punch-in: sharp rise then decay over ~0.6 s
    const punchFactor = Math.max(0, Math.exp(-timeSinceChange * 6) * 0.35);

    // Continuous idle waves
    const breathY  =  Math.sin(ts * 0.9)  * 0.18;   // up/down ±0.18 units
    const breathY2 =  Math.cos(ts * 0.9)  * 0.18;   // opposite phase for right hand
    const swayX    =  Math.sin(ts * 0.55) * 0.12;   // gentle side sway ±0.12 units
    const tiltX    =  Math.sin(ts * 1.3)  * 0.18;   // forward/back tilt ±~10°
    const rollZ    =  Math.cos(ts * 1.0)  * 0.12;   // wrist roll ±~7°
    const yawExtra =  Math.sin(ts * 0.7)  * 0.08;   // extra yaw wobble

    if (lWrist.current) {
      lWrist.current.position.y = -0.5 + breathY + punchFactor;
      lWrist.current.position.x = -1.5 + swayX;
      lWrist.current.rotation.set(
        tiltX,
        baseRotY + yawExtra,
        rollZ,
      );
    }
    if (rWrist.current) {
      rWrist.current.position.y = -0.5 + breathY2 + punchFactor;
      rWrist.current.position.x =  1.5 - swayX;
      rWrist.current.rotation.set(
        -tiltX,
        -baseRotY - yawExtra,
        -rollZ,
      );
    }
  });


  return (
    <group>
      {/* ── Left hand ── */}
      <group ref={lWrist} position={[-1.5, -0.5, 0]}>
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[1.6, 1.4, 0.4]} />
          <meshStandardMaterial color={SKIN} roughness={0.4} />
        </mesh>
        {renderFinger(LEFT_FINGERS[0], l0b, l0m, l0t)}
        {renderFinger(LEFT_FINGERS[1], l1b, l1m, l1t)}
        {renderFinger(LEFT_FINGERS[2], l2b, l2m, l2t)}
        {renderFinger(LEFT_FINGERS[3], l3b, l3m, l3t)}
        {renderFinger(LEFT_FINGERS[4], l4b, l4m, l4t)}
      </group>

      {/* ── Right hand ── */}
      <group ref={rWrist} position={[1.5, -0.5, 0]}>
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[1.6, 1.4, 0.4]} />
          <meshStandardMaterial color={SKIN} roughness={0.4} />
        </mesh>
        {renderFinger(RIGHT_FINGERS[0], r0b, r0m, r0t)}
        {renderFinger(RIGHT_FINGERS[1], r1b, r1m, r1t)}
        {renderFinger(RIGHT_FINGERS[2], r2b, r2m, r2t)}
        {renderFinger(RIGHT_FINGERS[3], r3b, r3m, r3t)}
        {renderFinger(RIGHT_FINGERS[4], r4b, r4m, r4t)}
      </group>
    </group>
  );
};

// ---------------------------------------------------------
// Canvas wrapper
// ---------------------------------------------------------
export const Avatar3D: React.FC<Avatar3DProps> = ({ currentSign, isPlaying, speed }) => {
  return (
    <div className="relative w-full aspect-video md:aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950 shadow-inner border border-slate-800 flex items-center justify-center">
      <Canvas camera={{ position: [0, 1.5, 5], fov: 60 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
        <Environment preset="city" />

        <HandsScene currentSign={currentSign} isPlaying={isPlaying} speed={speed} />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          maxPolarAngle={Math.PI / 2 + 0.2}
          minPolarAngle={Math.PI / 2 - 0.2}
        />
      </Canvas>

      <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700 text-xs font-semibold text-indigo-300 flex items-center space-x-2">
        <span className={`w-2.5 h-2.5 rounded-full ${isPlaying ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
        <span>Signing: {currentSign || 'IDLE'}</span>
      </div>
    </div>
  );
};
