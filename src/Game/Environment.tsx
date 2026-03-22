import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Mesh, Vector3, MathUtils, Color } from 'three';
import { useGame } from './GameContext';

const ROAD_LENGTH = 100;
const ROAD_WIDTH = 10;
const SIDEWALK_WIDTH = 4;
const NUM_SEGMENTS = 3;

export const Road: React.FC = () => {
  const { speed, isGameOver, isPaused } = useGame();
  const groupRef = useRef<Group>(null);
  const [segments, setSegments] = useState([0, ROAD_LENGTH, ROAD_LENGTH * 2]);

  useFrame((state, delta) => {
    if (!groupRef.current || isGameOver || isPaused) return;

    // Move road segments towards the player
    setSegments((prev) =>
      prev.map((pos) => {
        let nextPos = pos - speed * 50 * delta;
        if (nextPos < -ROAD_LENGTH) {
          nextPos += ROAD_LENGTH * NUM_SEGMENTS;
        }
        return nextPos;
      })
    );
  });

  return (
    <group ref={groupRef}>
      {segments.map((pos, i) => (
        <group key={i} position={[0, 0, pos]}>
          {/* Main Road */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[ROAD_WIDTH, ROAD_LENGTH]} />
            <meshStandardMaterial color="#333" />
          </mesh>
          
          {/* Lane Markings */}
          <mesh position={[-ROAD_WIDTH / 6, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.2, ROAD_LENGTH]} />
            <meshStandardMaterial color="white" />
          </mesh>
          <mesh position={[ROAD_WIDTH / 6, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.2, ROAD_LENGTH]} />
            <meshStandardMaterial color="white" />
          </mesh>

          {/* Sidewalks */}
          <mesh position={[-(ROAD_WIDTH + SIDEWALK_WIDTH) / 2, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[SIDEWALK_WIDTH, ROAD_LENGTH]} />
            <meshStandardMaterial color="#888" />
          </mesh>
          <mesh position={[(ROAD_WIDTH + SIDEWALK_WIDTH) / 2, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[SIDEWALK_WIDTH, ROAD_LENGTH]} />
            <meshStandardMaterial color="#888" />
          </mesh>

          {/* Simple Buildings on Sidewalks */}
          {[-1, 1].map((side) => (
            <group key={side} position={[side * (ROAD_WIDTH + SIDEWALK_WIDTH + 5) / 2, 5, 0]}>
              {[...Array(5)].map((_, j) => (
                <mesh key={j} position={[0, 0, (j - 2) * 20]}>
                  <boxGeometry args={[10, 20, 15]} />
                  <meshStandardMaterial color={new Color().setHSL(Math.random(), 0.2, 0.4)} />
                </mesh>
              ))}
            </group>
          ))}
        </group>
      ))}
    </group>
  );
};

export const TorontoSkyline: React.FC = () => {
  return (
    <group position={[0, 0, -200]}>
      {/* CN Tower (simplified) */}
      <group position={[20, 0, 0]}>
        {/* Main Shaft */}
        <mesh position={[0, 40, 0]}>
          <cylinderGeometry args={[1, 3, 80, 8]} />
          <meshStandardMaterial color="#aaa" />
        </mesh>
        {/* Pod */}
        <mesh position={[0, 60, 0]}>
          <cylinderGeometry args={[6, 6, 4, 16]} />
          <meshStandardMaterial color="#888" />
        </mesh>
        {/* Antenna */}
        <mesh position={[0, 85, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 30, 8]} />
          <meshStandardMaterial color="#555" />
        </mesh>
      </group>

      {/* Other Buildings */}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 100, 0, 0]}>
          {[...Array(10)].map((_, i) => (
            <mesh key={i} position={[Math.random() * 50, Math.random() * 20 + 20, Math.random() * 50]}>
              <boxGeometry args={[10 + Math.random() * 10, 40 + Math.random() * 60, 10 + Math.random() * 10]} />
              <meshStandardMaterial color="#444" />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
};
