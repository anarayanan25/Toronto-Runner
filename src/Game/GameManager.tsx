import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Mesh, Vector3, MathUtils, Color, Box3 } from 'three';
import { useGame } from './GameContext';

const LANE_WIDTH = 3;
const LANES = [-1, 0, 1];
const SPAWN_DISTANCE = 100;
const RECYCLE_DISTANCE = -20;

interface GameObject {
  id: number;
  type: 'car' | 'coin' | 'npc';
  position: Vector3;
  lane: number;
  speed?: number;
}

export const GameManager: React.FC = () => {
  const { speed, isGameOver, isPaused, addScore, setGameOver, lane: playerLane } = useGame();
  const [objects, setObjects] = useState<GameObject[]>([]);
  const nextId = useRef(0);
  const lastSpawnTime = useRef(0);

  const spawnObject = useCallback(() => {
    const rand = Math.random();
    let type: 'car' | 'coin' | 'npc' = 'coin';
    let lane = Math.floor(Math.random() * 3);
    let x = LANES[lane] * LANE_WIDTH;
    let z = SPAWN_DISTANCE;

    if (rand < 0.3) {
      type = 'car';
    } else if (rand < 0.4) {
      type = 'npc';
      // NPCs spawn on sidewalks
      const side = Math.random() > 0.5 ? 1 : -1;
      x = side * (10 / 2 + 2); // Road width / 2 + offset
    }

    setObjects((prev) => [
      ...prev,
      {
        id: nextId.current++,
        type,
        position: new Vector3(x, type === 'car' ? 0.5 : 1.5, z),
        lane: type === 'npc' ? -1 : lane,
        speed: type === 'car' ? (Math.random() * 0.2 + 0.1) : (type === 'npc' ? 0.05 : 0),
      },
    ]);
  }, []);

  useFrame((state, delta) => {
    if (isGameOver || isPaused) return;

    // Move objects towards the player
    setObjects((prev) => {
      const nextObjects = prev
        .map((obj) => {
          const moveSpeed = speed * 50 * delta + (obj.speed || 0) * 50 * delta;
          obj.position.z -= moveSpeed;
          return obj;
        })
        .filter((obj) => obj.position.z > RECYCLE_DISTANCE);

      // Collision Detection
      nextObjects.forEach((obj) => {
        // Only check objects close to the player (z around 0)
        if (Math.abs(obj.position.z) < 1) {
          if (obj.type === 'coin' && obj.lane === playerLane) {
            addScore(10);
            obj.position.z = -100; // "Collect" it
          } else if (obj.type === 'car' && obj.lane === playerLane) {
            setGameOver(true);
          }
        }
      });

      return nextObjects;
    });

    // Spawn new objects
    if (state.clock.getElapsedTime() - lastSpawnTime.current > 1.0 / speed) {
      spawnObject();
      lastSpawnTime.current = state.clock.getElapsedTime();
    }
  });

  return (
    <group>
      {objects.map((obj) => (
        <group key={obj.id} position={[obj.position.x, obj.position.y, obj.position.z]}>
          {obj.type === 'coin' ? (
            <mesh rotation={[0, Date.now() * 0.005, 0]}>
              <cylinderGeometry args={[0.5, 0.5, 0.1, 16]} />
              <meshStandardMaterial color="gold" metalness={0.8} roughness={0.2} />
            </mesh>
          ) : obj.type === 'car' ? (
            <mesh position={[0, 0.5, 0]}>
              <boxGeometry args={[2, 1.5, 4]} />
              <meshStandardMaterial color={new Color().setHSL(obj.id * 0.1 % 1, 0.5, 0.5)} />
              {/* Simple wheels */}
              {[-1, 1].map((x) => [-1, 1].map((z) => (
                <mesh key={`${x}-${z}`} position={[x * 0.8, -0.6, z * 1.5]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.4, 0.4, 0.2, 8]} />
                  <meshStandardMaterial color="black" />
                </mesh>
              )))}
            </mesh>
          ) : obj.type === 'npc' ? (
            <mesh position={[0, 0, 0]}>
              <capsuleGeometry args={[0.4, 1, 4, 8]} />
              <meshStandardMaterial color="#555" />
            </mesh>
          ) : null}
        </group>
      ))}
    </group>
  );
};

// I'll need to integrate collision detection into the GameManager or Player.
// Let's add it to the GameManager by passing the player's lane.
