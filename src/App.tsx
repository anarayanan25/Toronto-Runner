import React from 'react';
import { GameProvider } from './Game/GameContext';
import { GameScene } from './Game/GameScene';
import { HUD } from './Game/HUD';

export default function App() {
  return (
    <GameProvider>
      <div className="w-screen h-screen bg-black overflow-hidden select-none touch-none">
        <GameScene />
        <HUD />
        
        {/* Controls hint */}
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 text-white/30 text-[10px] uppercase tracking-[0.3em] font-bold animate-pulse pointer-events-none whitespace-nowrap">
          ← → Move &nbsp;·&nbsp; ↑ / Space Jump
        </div>
      </div>
    </GameProvider>
  );
}
