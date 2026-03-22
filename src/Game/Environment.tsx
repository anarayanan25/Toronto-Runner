import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Color, Mesh } from 'three';
import { useGame } from './GameContext';

const ROAD_LENGTH = 100;
const ROAD_WIDTH = 10;
const SIDEWALK_WIDTH = 4;
const CURB_HEIGHT = 0.22;
const NUM_SEGMENTS = 3;

// Deterministic random — no shimmer on re-render
function sr(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

interface WinData { fx: number; fy: number; lit: boolean }
interface BuildingData {
  x: number; z: number; w: number; h: number; d: number;
  isGlass: boolean; hue: number; windows: WinData[];
}

function makeBuildings(side: number, seg: number): BuildingData[] {
  const baseX = side * (ROAD_WIDTH / 2 + SIDEWALK_WIDTH + 7);
  return Array.from({ length: 4 }, (_, i) => {
    const s = seg * 200 + i * 17 + side * 1000;
    const w = 8 + sr(s) * 10;
    const h = 18 + sr(s + 1) * 55;
    const d = 8 + sr(s + 2) * 10;
    const isGlass = sr(s + 3) > 0.55;
    const hue = sr(s + 4);
    const z = (i - 1.5) * 24 + sr(s + 5) * 6 - ROAD_LENGTH / 2;

    const floors = Math.min(Math.floor(h / 5), 6);
    const wCount = Math.min(Math.floor(w / 2.5), 4);
    const windows: WinData[] = [];
    for (let f = 0; f < floors; f++) {
      for (let ww = 0; ww < wCount; ww++) {
        if (sr(s + f * 31 + ww * 7) > 0.3) {
          windows.push({
            fx: (ww - wCount / 2 + 0.5) * 2.2,
            fy: f * 5 - h / 2 + 2.5,
            lit: sr(s + f * 13 + ww + 99) > 0.35,
          });
        }
      }
    }
    return { x: baseX, z, w, h, d, isGlass, hue, windows };
  });
}

const RoadSegment: React.FC<{ segIdx: number }> = ({ segIdx }) => {
  const buildings = useMemo(
    () => [...makeBuildings(-1, segIdx), ...makeBuildings(1, segIdx)],
    [segIdx]
  );

  return (
    <>
      {/* Asphalt */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[ROAD_WIDTH, ROAD_LENGTH]} />
        <meshStandardMaterial color="#252525" roughness={0.92} metalness={0.08} />
      </mesh>

      {/* Yellow edge lines */}
      {([-ROAD_WIDTH / 2 + 0.18, ROAD_WIDTH / 2 - 0.18] as number[]).map((lx, li) => (
        <mesh key={li} position={[lx, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.14, ROAD_LENGTH]} />
          <meshStandardMaterial color="#e8c840" roughness={0.7} />
        </mesh>
      ))}

      {/* Dashed white lane markings */}
      {([-ROAD_WIDTH / 6, ROAD_WIDTH / 6] as number[]).map((lx, li) =>
        Array.from({ length: 14 }, (_, k) => (
          <mesh key={`${li}-${k}`} position={[lx, 0.012, k * 7 - ROAD_LENGTH / 2 + 3]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.14, 4.5]} />
            <meshStandardMaterial color="#ddd" roughness={0.7} />
          </mesh>
        ))
      )}

      {/* Raised curbs */}
      {([-1, 1] as number[]).map((side) => (
        <mesh key={side} position={[side * (ROAD_WIDTH / 2 + 0.15), CURB_HEIGHT / 2, 0]}>
          <boxGeometry args={[0.3, CURB_HEIGHT, ROAD_LENGTH]} />
          <meshStandardMaterial color="#555" roughness={0.95} />
        </mesh>
      ))}

      {/* Sidewalks */}
      {([-1, 1] as number[]).map((side) => (
        <mesh key={side} position={[side * (ROAD_WIDTH / 2 + SIDEWALK_WIDTH / 2 + 0.3), CURB_HEIGHT, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[SIDEWALK_WIDTH, ROAD_LENGTH]} />
          <meshStandardMaterial color="#8a8a8a" roughness={0.97} />
        </mesh>
      ))}

      {/* Streetlights */}
      {([5, 25, 45, 65, 85] as number[]).map((lz) =>
        ([-1, 1] as number[]).map((side) => {
          const px = side * (ROAD_WIDTH / 2 + 0.5);
          const pz = lz - ROAD_LENGTH / 2;
          return (
            <group key={`${lz}-${side}`} position={[px, 0, pz]}>
              {/* Pole */}
              <mesh position={[0, 4, 0]}>
                <cylinderGeometry args={[0.07, 0.12, 8, 7]} />
                <meshStandardMaterial color="#6a6a6a" metalness={0.75} roughness={0.3} />
              </mesh>
              {/* Arm */}
              <mesh position={[side * -0.9, 7.9, 0]} rotation={[0, 0, side * -Math.PI / 11]}>
                <boxGeometry args={[1.8, 0.08, 0.08]} />
                <meshStandardMaterial color="#6a6a6a" metalness={0.75} roughness={0.3} />
              </mesh>
              {/* Lamp housing */}
              <mesh position={[side * -1.8, 7.8, 0]}>
                <boxGeometry args={[0.55, 0.22, 0.38]} />
                <meshStandardMaterial color="#1a1a1a" roughness={0.6} />
              </mesh>
              {/* Lamp glow */}
              <mesh position={[side * -1.8, 7.68, 0]}>
                <planeGeometry args={[0.42, 0.28]} />
                <meshStandardMaterial color="#ffe566" emissive="#ffe566" emissiveIntensity={4} />
              </mesh>
            </group>
          );
        })
      )}

      {/* Buildings */}
      {buildings.map((b, bi) => {
        const facingZ = b.x < 0 ? 1 : -1;
        return (
          <group key={bi} position={[b.x, 0, b.z]}>
            {/* Main body */}
            <mesh position={[0, b.h / 2, 0]} castShadow receiveShadow>
              <boxGeometry args={[b.w, b.h, b.d]} />
              <meshStandardMaterial
                color={b.isGlass
                  ? new Color().setHSL(0.57 + b.hue * 0.05, 0.35, 0.3)
                  : new Color().setHSL(b.hue * 0.12, 0.1, 0.3 + b.hue * 0.1)}
                roughness={b.isGlass ? 0.06 : 0.88}
                metalness={b.isGlass ? 0.72 : 0.04}
              />
            </mesh>
            {/* Rooftop ledge */}
            <mesh position={[0, b.h + 0.32, 0]}>
              <boxGeometry args={[b.w + 0.5, 0.64, b.d + 0.5]} />
              <meshStandardMaterial color="#444" roughness={0.9} />
            </mesh>
            {/* Rooftop AC unit */}
            <mesh position={[sr(bi * 3) * b.w * 0.3 - b.w * 0.15, b.h + 0.9, sr(bi * 5) * b.d * 0.3 - b.d * 0.15]}>
              <boxGeometry args={[1.2, 0.8, 1.8]} />
              <meshStandardMaterial color="#555" roughness={0.9} />
            </mesh>
            {/* Windows on road-facing face */}
            {b.windows.map((w, wi) => (
              <mesh key={wi} position={[w.fx, w.fy, facingZ * (b.d / 2 + 0.02)]}>
                <planeGeometry args={[1.0, 1.6]} />
                <meshStandardMaterial
                  color={w.lit ? '#fffbe6' : '#1a2233'}
                  emissive={w.lit ? '#ffcc44' : '#000000'}
                  emissiveIntensity={w.lit ? 0.7 : 0}
                />
              </mesh>
            ))}
          </group>
        );
      })}
    </>
  );
};

export const Road: React.FC = () => {
  const { speed, isGameOver, isPaused } = useGame();
  const groupRef = useRef<Group>(null);
  const [segments, setSegments] = useState([0, ROAD_LENGTH, ROAD_LENGTH * 2]);

  useFrame((_, delta) => {
    if (!groupRef.current || isGameOver || isPaused) return;
    setSegments((prev) =>
      prev.map((pos) => {
        let next = pos - speed * 50 * delta;
        if (next < -ROAD_LENGTH) next += ROAD_LENGTH * NUM_SEGMENTS;
        return next;
      })
    );
  });

  return (
    <group ref={groupRef}>
      {/* Wide ground plane so there's no void */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, ROAD_LENGTH]}>
        <planeGeometry args={[300, ROAD_LENGTH * 4]} />
        <meshStandardMaterial color="#1a1a1a" roughness={1} />
      </mesh>
      {segments.map((pos, i) => (
        <group key={i} position={[0, 0, pos]}>
          <RoadSegment segIdx={i} />
        </group>
      ))}
    </group>
  );
};

const CNTower: React.FC = () => {
  const blinkRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (!blinkRef.current) return;
    const t = state.clock.getElapsedTime();
    (blinkRef.current.material as any).emissiveIntensity =
      Math.sin(t * Math.PI * 0.8) > 0.85 ? 4 : 0;
  });

  return (
    <group position={[35, 0, 0]}>
      {/* Concrete base legs */}
      {Array.from({ length: 3 }, (_, i) => {
        const angle = (i / 3) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(angle) * 5, 9, Math.sin(angle) * 5]} castShadow>
            <boxGeometry args={[3.5, 18, 3.5]} />
            <meshStandardMaterial color="#c8c0b0" roughness={0.88} />
          </mesh>
        );
      })}
      {/* Lower shaft */}
      <mesh position={[0, 35, 0]} castShadow>
        <cylinderGeometry args={[3, 8, 70, 14]} />
        <meshStandardMaterial color="#d0c8bc" roughness={0.85} />
      </mesh>
      {/* Upper shaft */}
      <mesh position={[0, 79, 0]}>
        <cylinderGeometry args={[1.4, 3, 28, 12]} />
        <meshStandardMaterial color="#ccc4bc" roughness={0.85} />
      </mesh>
      {/* SkyPod ring */}
      <mesh position={[0, 90, 0]}>
        <cylinderGeometry args={[10, 10, 2.5, 28]} />
        <meshStandardMaterial color="#aaa" roughness={0.5} metalness={0.4} />
      </mesh>
      {/* SkyPod body */}
      <mesh position={[0, 96, 0]}>
        <cylinderGeometry args={[8.5, 10, 10, 28]} />
        <meshStandardMaterial color="#bbb" roughness={0.35} metalness={0.45} />
      </mesh>
      {/* Glass observation band */}
      <mesh position={[0, 96, 0]}>
        <cylinderGeometry args={[8.65, 8.65, 5, 28, 1, true]} />
        <meshStandardMaterial color="#88aacc" transparent opacity={0.35} roughness={0.08} metalness={0.65} side={2} />
      </mesh>
      {/* Upper microwave shaft */}
      <mesh position={[0, 116, 0]}>
        <cylinderGeometry args={[0.9, 1.6, 32, 10]} />
        <meshStandardMaterial color="#ccc4bc" roughness={0.85} />
      </mesh>
      {/* Antenna spire */}
      <mesh position={[0, 142, 0]}>
        <cylinderGeometry args={[0.1, 0.45, 28, 7]} />
        <meshStandardMaterial color="#aaa" metalness={0.85} roughness={0.2} />
      </mesh>
      {/* Blinking red warning light */}
      <mesh ref={blinkRef} position={[0, 156, 0]}>
        <sphereGeometry args={[0.35, 8, 8]} />
        <meshStandardMaterial color="#ff2200" emissive="#ff2200" emissiveIntensity={0} />
      </mesh>
    </group>
  );
};

export const TorontoSkyline: React.FC = () => {
  const bgBuildings = useMemo(() => {
    const list = [];
    for (const side of [-1, 1]) {
      for (let i = 0; i < 14; i++) {
        const s = i * 11 + (side > 0 ? 2000 : 500);
        list.push({
          x: side * (75 + sr(s) * 50),
          z: sr(s + 1) * 100 - 50,
          w: 10 + sr(s + 2) * 18,
          h: 25 + sr(s + 3) * 90,
          d: 10 + sr(s + 4) * 18,
          isGlass: sr(s + 5) > 0.45,
          hue: sr(s + 6),
        });
      }
    }
    return list;
  }, []);

  return (
    <group position={[0, 0, -160]}>
      <CNTower />
      {bgBuildings.map((b, i) => (
        <mesh key={i} position={[b.x, b.h / 2, b.z]} castShadow>
          <boxGeometry args={[b.w, b.h, b.d]} />
          <meshStandardMaterial
            color={b.isGlass
              ? new Color().setHSL(0.57, 0.3, 0.28)
              : new Color().setHSL(b.hue * 0.18, 0.08, 0.28)}
            roughness={b.isGlass ? 0.08 : 0.88}
            metalness={b.isGlass ? 0.65 : 0.04}
          />
        </mesh>
      ))}
    </group>
  );
};
