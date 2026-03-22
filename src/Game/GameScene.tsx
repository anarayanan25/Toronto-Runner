import React, { Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sky, Environment, ContactShadows, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { Player } from './Player';
import { Road, TorontoSkyline } from './Environment';
import { GameManager } from './GameManager';
import { useGame } from './GameContext';
import { MathUtils } from 'three';

const CameraController: React.FC = () => {
  const { lane } = useGame();
  useFrame((state) => {
    const targetX = (lane - 1) * 3 * 0.5;
    state.camera.position.x = MathUtils.lerp(state.camera.position.x, targetX, 0.05);
    state.camera.lookAt(0, 1.5, -10);
  });
  return null;
};

export const GameScene: React.FC = () => {
  return (
    <div className="w-full h-full bg-zinc-900 relative overflow-hidden">
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
          antialias: true,
        }}
      >
        <PerspectiveCamera makeDefault position={[0, 5, 10]} fov={60} />
        <CameraController />

        {/* Atmosphere fog — city haze */}
        <fog attach="fog" args={['#1a1e2e', 60, 220]} />

        {/* Ambient — cool blue fill */}
        <ambientLight intensity={0.35} color="#b0c8e8" />

        {/* Main sun — warm directional */}
        <directionalLight
          position={[15, 30, 10]}
          intensity={1.4}
          color="#ffe8c0"
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-near={1}
          shadow-camera-far={200}
          shadow-camera-left={-40}
          shadow-camera-right={40}
          shadow-camera-top={40}
          shadow-camera-bottom={-40}
        />

        {/* Cool fill from opposite side */}
        <directionalLight position={[-10, 10, -10]} intensity={0.25} color="#8ab0d0" />

        {/* Sky */}
        <Sky sunPosition={[100, 18, 80]} turbidity={8} rayleigh={1.2} />
        <Environment preset="city" />

        <Suspense fallback={null}>
          <Player />
          <Road />
          <TorontoSkyline />
          <GameManager />
        </Suspense>

        <ContactShadows
          position={[0, 0.01, 0]}
          opacity={0.55}
          scale={25}
          blur={2.5}
          far={5}
        />
      </Canvas>
    </div>
  );
};
