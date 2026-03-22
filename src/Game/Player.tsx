import React, { useRef, useEffect, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import { Group, MathUtils } from 'three';
import { useGame } from './GameContext';
import { playFootstepSound } from './sounds';

const LANE_WIDTH = 3;
const LANES = [-1, 0, 1];
const MODEL_SCALE = 1.0;
const MODEL_Y_OFFSET = 0;
const JUMP_HEIGHT = 4.5;
const JUMP_DURATION = 0.7; // seconds

useGLTF.preload('/halfling.glb');

const PlayerModel: React.FC = () => {
  const { speed, isGameOver, isPaused, lane, isJumping, setJumping, isInvincible } = useGame();
  const groupRef = useRef<Group>(null);
  const targetX = useRef(0);
  const lastFootstep = useRef(0);
  const jumpStartTime = useRef<number | null>(null);

  const { scene, animations } = useGLTF('/halfling.glb');
  const { actions, names } = useAnimations(animations, groupRef);

  useEffect(() => {
    if (names.length === 0) return;
    const animName =
      names.find((n) => /run/i.test(n)) ||
      names.find((n) => /walk/i.test(n)) ||
      names[0];
    if (!animName || !actions[animName]) return;
    if (isGameOver) {
      actions[animName].fadeOut(0.3);
    } else {
      actions[animName].reset().fadeIn(0.3).play();
    }
    return () => { actions[animName]?.stop(); };
  }, [actions, names, isGameOver]);

  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.getElapsedTime();

    // Invincibility flash
    groupRef.current.visible = !isInvincible || Math.sin(time * 18) > 0;

    if (isGameOver || isPaused) return;

    // Smooth lane transition
    targetX.current = LANES[lane] * LANE_WIDTH;
    groupRef.current.position.x = MathUtils.lerp(
      groupRef.current.position.x, targetX.current, 0.15
    );

    // Tilt when changing lanes
    const tilt = (targetX.current - groupRef.current.position.x) * 0.1;
    groupRef.current.rotation.z = MathUtils.lerp(groupRef.current.rotation.z, tilt, 0.1);

    // Jump arc
    if (isJumping) {
      if (jumpStartTime.current === null) jumpStartTime.current = time;
      const elapsed = time - jumpStartTime.current;
      const progress = Math.min(elapsed / JUMP_DURATION, 1);
      groupRef.current.position.y = MODEL_Y_OFFSET + JUMP_HEIGHT * Math.sin(progress * Math.PI);
      if (progress >= 1) {
        jumpStartTime.current = null;
        setJumping(false);
      }
    } else {
      jumpStartTime.current = null;
      if (names.length === 0) {
        groupRef.current.position.y = MODEL_Y_OFFSET + Math.sin(time * 15 * speed) * 0.08;
      } else {
        groupRef.current.position.y = MODEL_Y_OFFSET;
      }
    }

    // Footstep sounds
    if (!isJumping) {
      const footstepInterval = 0.35 / speed;
      if (time - lastFootstep.current > footstepInterval) {
        playFootstepSound();
        lastFootstep.current = time;
      }
    }
  });

  return (
    <group ref={groupRef} position={[0, MODEL_Y_OFFSET, 0]}>
      <primitive object={scene} scale={[MODEL_SCALE, MODEL_SCALE, MODEL_SCALE]} rotation={[0, Math.PI, 0]} />
    </group>
  );
};

export const Player: React.FC = () => {
  const { isGameOver, isPaused, lane, setLane, triggerJump } = useGame();

  // Keyboard controls
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isGameOver || isPaused) return;
      if (e.key === 'ArrowLeft' || e.key === 'a') setLane(Math.max(0, lane - 1));
      else if (e.key === 'ArrowRight' || e.key === 'd') setLane(Math.min(2, lane + 1));
      else if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w') {
        e.preventDefault();
        triggerJump();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isGameOver, isPaused, lane, setLane, triggerJump]);

  // Touch/swipe controls
  useEffect(() => {
    let startX = 0;
    let startY = 0;
    const onStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };
    const onEnd = (e: TouchEvent) => {
      if (isGameOver || isPaused) return;
      const dx = e.changedTouches[0].clientX - startX;
      const dy = startY - e.changedTouches[0].clientY; // positive = swipe up
      if (dy > 50) {
        triggerJump();
      } else if (dx > 50) {
        setLane(Math.min(2, lane + 1));
      } else if (dx < -50) {
        setLane(Math.max(0, lane - 1));
      }
    };
    window.addEventListener('touchstart', onStart);
    window.addEventListener('touchend', onEnd);
    return () => {
      window.removeEventListener('touchstart', onStart);
      window.removeEventListener('touchend', onEnd);
    };
  }, [isGameOver, isPaused, lane, setLane, triggerJump]);

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
