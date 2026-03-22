import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sky, Environment, ContactShadows, PerspectiveCamera, OrbitControls } from '@react-three/drei';
import { Player } from './Player';
import { Road, TorontoSkyline } from './Environment';
import { GameManager } from './GameManager';
import { useGame } from './GameContext';
import { MathUtils } from 'three';

const CameraController: React.FC = () => {
  const { lane } = useGame();
  
  useFrame((state) => {
    const targetX = (lane - 1) * 3 * 0.5; // Slight camera shift
    state.camera.position.x = MathUtils.lerp(state.camera.position.x, targetX, 0.05);
    state.camera.lookAt(0, 1.5, -10);
  });

  return null;
};

export const GameScene: React.FC = () => {
  return (
    <div className="w-full h-full bg-zinc-900 relative overflow-hidden">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 5, 10]} fov={60} />
        <CameraController />
        
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 20, 10]}
          intensity={1.5}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        
        <Sky sunPosition={[100, 20, 100]} />
        <Environment preset="city" />

        <Suspense fallback={null}>
          <Player />
          <Road />
          <TorontoSkyline />
          <GameManager />
        </Suspense>

        <ContactShadows
          position={[0, 0, 0]}
          opacity={0.4}
          scale={20}
          blur={2}
          far={4.5}
        />
      </Canvas>
    </div>
  );
};
