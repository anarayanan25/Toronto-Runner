import React, { useRef, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, Color, Group } from 'three';
import { useGame, PowerupType } from './GameContext';
import { playCoinSound, playCrashSound, playPowerupSound, playHitSound } from './sounds';

const LANE_WIDTH = 3;
const LANES = [-1, 0, 1];
const ROAD_WIDTH = 10;
const SPAWN_DISTANCE = 100;
const RECYCLE_DISTANCE = -20;

function sr(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

interface GameObject {
  id: number;
  type: 'car' | 'coin' | 'npc' | 'powerup';
  subtype?: PowerupType;
  position: Vector3;
  lane: number;
  speed?: number;
  color: string;
}

// ─── Coin ─────────────────────────────────────────────────────────────────────
const Coin: React.FC = () => {
  const ref = useRef<Group>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.getElapsedTime() * 3.5;
    ref.current.position.y = Math.sin(state.clock.getElapsedTime() * 2.5) * 0.28;
  });
  return (
    <group ref={ref}>
      <mesh>
        <cylinderGeometry args={[0.44, 0.44, 0.11, 24]} />
        <meshStandardMaterial color="#ffd700" metalness={0.95} roughness={0.05} emissive="#ffaa00" emissiveIntensity={0.55} />
      </mesh>
      <mesh>
        <torusGeometry args={[0.44, 0.07, 8, 24]} />
        <meshStandardMaterial color="#ff9900" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
};

// ─── Car ──────────────────────────────────────────────────────────────────────
const Car: React.FC<{ color: string }> = ({ color }) => (
  <group>
    <mesh position={[0, 0.42, 0]} castShadow>
      <boxGeometry args={[2.0, 0.62, 4.2]} />
      <meshStandardMaterial color={color} roughness={0.38} metalness={0.62} />
    </mesh>
    <mesh position={[0, 1.02, -0.18]} castShadow>
      <boxGeometry args={[1.72, 0.62, 2.3]} />
      <meshStandardMaterial color={color} roughness={0.38} metalness={0.55} />
    </mesh>
    <mesh position={[0, 1.02, 0.98]} rotation={[-0.48, 0, 0]}>
      <planeGeometry args={[1.56, 0.62]} />
      <meshStandardMaterial color="#99ccff" transparent opacity={0.42} roughness={0.04} metalness={0.35} side={2} />
    </mesh>
    <mesh position={[0, 1.02, -1.35]} rotation={[0.48, 0, 0]}>
      <planeGeometry args={[1.56, 0.62]} />
      <meshStandardMaterial color="#99ccff" transparent opacity={0.42} roughness={0.04} metalness={0.35} side={2} />
    </mesh>
    {([-1, 1] as number[]).map((sx) => (
      <mesh key={sx} position={[sx * 0.87, 1.02, -0.18]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[1.9, 0.55]} />
        <meshStandardMaterial color="#99ccff" transparent opacity={0.35} roughness={0.04} metalness={0.35} side={2} />
      </mesh>
    ))}
    <mesh position={[0, 0.28, 2.18]}>
      <boxGeometry args={[1.85, 0.28, 0.12]} />
      <meshStandardMaterial color="#222" roughness={0.7} />
    </mesh>
    <mesh position={[0, 0.28, -2.18]}>
      <boxGeometry args={[1.85, 0.28, 0.12]} />
      <meshStandardMaterial color="#222" roughness={0.7} />
    </mesh>
    {([-0.7, 0.7] as number[]).map((x) => (
      <mesh key={x} position={[x, 0.44, 2.14]}>
        <boxGeometry args={[0.42, 0.22, 0.06]} />
        <meshStandardMaterial color="#fffde8" emissive="#fffde8" emissiveIntensity={3.5} />
      </mesh>
    ))}
    {([-0.7, 0.7] as number[]).map((x) => (
      <mesh key={x} position={[x, 0.44, -2.14]}>
        <boxGeometry args={[0.42, 0.22, 0.06]} />
        <meshStandardMaterial color="#ff1100" emissive="#ff1100" emissiveIntensity={3.5} />
      </mesh>
    ))}
    {([-1, 1] as number[]).map((sx) =>
      ([-1.38, 1.38] as number[]).map((sz) => (
        <group key={`${sx}-${sz}`} position={[sx * 1.06, 0.3, sz]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.3, 0.3, 0.24, 12]} />
            <meshStandardMaterial color="#111" roughness={0.92} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]} position={[sx * 0.13, 0, 0]}>
            <cylinderGeometry args={[0.16, 0.16, 0.05, 8]} />
            <meshStandardMaterial color="#aaa" metalness={0.85} roughness={0.18} />
          </mesh>
        </group>
      ))
    )}
  </group>
);

// ─── NPC ──────────────────────────────────────────────────────────────────────
const Npc: React.FC<{ seed: number }> = ({ seed }) => {
  const shirtColor = new Color().setHSL(sr(seed) * 1.0, 0.6, 0.5).getStyle();
  const pantsColor = sr(seed + 1) > 0.5 ? '#223344' : '#1a1a1a';
  return (
    <group>
      {([-0.14, 0.14] as number[]).map((x) => (
        <mesh key={x} position={[x, 0.42, 0]} castShadow>
          <boxGeometry args={[0.19, 0.72, 0.22]} />
          <meshStandardMaterial color={pantsColor} roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0, 1.14, 0]} castShadow>
        <boxGeometry args={[0.52, 0.76, 0.3]} />
        <meshStandardMaterial color={shirtColor} roughness={0.8} />
      </mesh>
      {([-0.36, 0.36] as number[]).map((x) => (
        <mesh key={x} position={[x, 1.05, 0]} castShadow>
          <boxGeometry args={[0.18, 0.6, 0.22]} />
          <meshStandardMaterial color={shirtColor} roughness={0.8} />
        </mesh>
      ))}
      <mesh position={[0, 1.78, 0]} castShadow>
        <sphereGeometry args={[0.22, 10, 10]} />
        <meshStandardMaterial color="#f5c99b" roughness={0.8} />
      </mesh>
    </group>
  );
};

// ─── Power-up orb ─────────────────────────────────────────────────────────────
const POWERUP_COLORS: Record<PowerupType, string> = {
  speedBoost: '#00ff88',
  shield: '#4488ff',
  magnet: '#ff44ff',
};

const PowerupOrb: React.FC<{ subtype: PowerupType }> = ({ subtype }) => {
  const ref = useRef<Group>(null);
  const color = POWERUP_COLORS[subtype];
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.getElapsedTime() * 2.2;
    ref.current.position.y = Math.sin(state.clock.getElapsedTime() * 1.8) * 0.35;
  });
  return (
    <group ref={ref}>
      <mesh>
        <octahedronGeometry args={[0.55, 0]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} metalness={0.4} roughness={0.1} />
      </mesh>
      {/* Orbiting ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.82, 0.05, 8, 24]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.5} />
      </mesh>
    </group>
  );
};

// ─── GameManager ──────────────────────────────────────────────────────────────
export const GameManager: React.FC = () => {
  const {
    speed, isGameOver, isPaused,
    addScore, loseLife, activatePowerup,
    lane: playerLane, isJumping, activePowerup,
  } = useGame();

  const [objects, setObjects] = useState<GameObject[]>([]);
  const nextId = useRef(0);
  const lastSpawnTime = useRef(0);

  const spawnObject = useCallback(() => {
    const rand = Math.random();
    let type: GameObject['type'] = 'coin';
    let subtype: PowerupType | undefined;
    let lane = Math.floor(Math.random() * 3);
    let x = LANES[lane] * LANE_WIDTH;

    if (rand < 0.28) {
      type = 'car';
    } else if (rand < 0.38) {
      type = 'npc';
      const side = Math.random() > 0.5 ? 1 : -1;
      x = side * (ROAD_WIDTH / 2 + 2.5);
      lane = -1;
    } else if (rand < 0.46) {
      type = 'powerup';
      const types: PowerupType[] = ['speedBoost', 'shield', 'magnet'];
      subtype = types[Math.floor(Math.random() * 3)];
    }

    const id = nextId.current++;
    const color = new Color().setHSL(sr(id * 7) * 1, 0.55, 0.45).getStyle();

    setObjects((prev) => [
      ...prev,
      {
        id, type, subtype,
        position: new Vector3(x, type === 'car' ? 0 : 1.5, SPAWN_DISTANCE),
        lane,
        speed: type === 'car' ? sr(id * 3) * 0.2 + 0.08 : type === 'npc' ? 0.04 : 0,
        color,
      },
    ]);
  }, []);

  useFrame((state, delta) => {
    if (isGameOver || isPaused) return;

    setObjects((prev) => {
      const next = prev
        .map((obj) => {
          obj.position.z -= (speed * 50 + (obj.speed || 0) * 50) * delta;
          return obj;
        })
        .filter((obj) => obj.position.z > RECYCLE_DISTANCE);

      const playerX = LANES[playerLane] * LANE_WIDTH;

      // Magnet widens coin collection radius
      const coinRadius = activePowerup === 'magnet' ? 5.0 : 1.5;

      next.forEach((obj) => {
        if (obj.position.z > 2.5 || obj.position.z < -2.5) return;
        const dx = Math.abs(obj.position.x - playerX);

        if (obj.type === 'coin' && dx < coinRadius) {
          playCoinSound();
          addScore(10);
          obj.position.z = -100;
        } else if (obj.type === 'car' && dx < 1.2 && !isJumping) {
          playCrashSound();
          playHitSound();
          loseLife();
          obj.position.z = -100; // remove car after hit
        } else if (obj.type === 'powerup' && dx < 1.8) {
          playPowerupSound();
          activatePowerup(obj.subtype!);
          obj.position.z = -100;
        }
      });

      return next;
    });

    if (state.clock.getElapsedTime() - lastSpawnTime.current > 1.0 / speed) {
      spawnObject();
      lastSpawnTime.current = state.clock.getElapsedTime();
    }
  });

  return (
    <group>
      {objects.map((obj) => (
        <group key={obj.id} position={[obj.position.x, obj.position.y, obj.position.z]}>
          {obj.type === 'coin' ? <Coin />
          : obj.type === 'car' ? <Car color={obj.color} />
          : obj.type === 'powerup' ? <PowerupOrb subtype={obj.subtype!} />
          : <Npc seed={obj.id} />}
        </group>
      ))}
    </group>
  );
};
