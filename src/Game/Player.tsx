import React, { useRef, useState, useEffect, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { Group, Mesh, Vector3, MathUtils } from 'three';
import { useGame } from './GameContext';

const LANE_WIDTH = 3;
const LANES = [-1, 0, 1]; // Left, Middle, Right

const PlayerModel: React.FC = () => {
  const { speed, isGameOver, isPaused, lane } = useGame();
  const groupRef = useRef<Group>(null);
  const targetX = useRef(0);

  // Use Picsum images as fallback since local files are missing
  const textures = useTexture({
    front: 'https://picsum.photos/seed/runner-front/256/256',
    rear: 'https://picsum.photos/seed/runner-back/256/256',
  });

  useFrame((state) => {
    if (!groupRef.current || isGameOver || isPaused) return;

    // Smooth lane transition
    targetX.current = LANES[lane] * LANE_WIDTH;
    groupRef.current.position.x = MathUtils.lerp(
      groupRef.current.position.x,
      targetX.current,
      0.15
    );

    // Running animation (bobbing)
    const time = state.clock.getElapsedTime();
    const bob = Math.sin(time * 15 * speed) * 0.1;
    groupRef.current.position.y = 1.5 + bob;

    // Slight tilt when moving
    const tilt = (groupRef.current.position.x - targetX.current) * -0.1;
    groupRef.current.rotation.z = MathUtils.lerp(groupRef.current.rotation.z, tilt, 0.1);
  });

  return (
    <group ref={groupRef} position={[0, 1.5, 0]}>
      {/* Front Plane */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[1.5, 3]} />
        <meshBasicMaterial map={textures.front} transparent alphaTest={0.5} />
      </mesh>
      {/* Rear Plane (rotated 180 degrees) */}
      <mesh position={[0, 0, -0.01]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[1.5, 3]} />
        <meshBasicMaterial map={textures.rear} transparent alphaTest={0.5} />
      </mesh>
    </group>
  );
};

export const Player: React.FC = () => {
  const { isGameOver, isPaused, lane, setLane } = useGame();

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isGameOver || isPaused) return;
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        setLane(Math.max(0, lane - 1));
      } else if (e.key === 'ArrowRight' || e.key === 'd') {
        setLane(Math.min(2, lane + 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGameOver, isPaused, lane, setLane]);

  // Handle touch/swipe for mobile
  useEffect(() => {
    let touchStartX = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
    };
    const handleTouchEnd = (e: TouchEvent) => {
      if (isGameOver || isPaused) return;
      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchEndX - touchStartX;
      if (diff > 50) {
        setLane(Math.min(2, lane + 1));
      } else if (diff < -50) {
        setLane(Math.max(0, lane - 1));
      }
    };
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isGameOver, isPaused, lane, setLane]);

  return (
    <Suspense fallback={
      <mesh position={[LANES[lane] * LANE_WIDTH, 1.5, 0]}>
        <boxGeometry args={[1, 3, 0.5]} />
        <meshStandardMaterial color="#555" />
      </mesh>
    }>
      <PlayerModel />
    </Suspense>
  );
};
