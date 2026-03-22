import React from 'react';
import { useGame } from './GameContext';
import { Timer, Trophy, Play, RotateCcw, Pause } from 'lucide-react';

export const HUD: React.FC = () => {
  const { score, timer, speed, level, isGameOver, isPaused, resetGame, setPaused } = useGame();
  const [showLevelUp, setShowLevelUp] = React.useState(false);

  React.useEffect(() => {
    if (level > 1) {
      setShowLevelUp(true);
      const timer = setTimeout(() => setShowLevelUp(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [level]);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col p-6 font-sans">
      {/* Top Stats */}
      <div className="flex justify-between items-start w-full">
        <div className="bg-black/50 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-white flex flex-col gap-1 shadow-xl">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest opacity-70">
            <Trophy size={14} /> Score
          </div>
          <div className="text-3xl font-bold tabular-nums">{score}</div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="bg-black/50 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-white flex flex-col gap-1 shadow-xl items-end">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest opacity-70">
              <Timer size={14} /> Time
            </div>
            <div className="text-3xl font-bold tabular-nums">{60 - timer}s</div>
          </div>
          <div className="bg-emerald-500/80 backdrop-blur-md px-4 py-2 rounded-full text-white text-xs font-bold uppercase tracking-widest shadow-lg">
            Level {level}
          </div>
        </div>
      </div>

      {/* Level Up Message */}
      {showLevelUp && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center animate-bounce">
          <div className="text-6xl font-black text-white italic uppercase tracking-tighter drop-shadow-2xl">
            Level {level}
          </div>
          <div className="text-emerald-400 font-bold uppercase tracking-[0.5em] text-sm">
            Speed Increased!
          </div>
        </div>
      )}

      {/* Speed Indicator */}
      <div className="mt-auto mb-8 flex flex-col items-center gap-2">
        <div className="w-48 h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-emerald-400 transition-all duration-500"
            style={{ width: `${Math.min(100, (speed / 1.5) * 100)}%` }}
          />
        </div>
        <div className="text-[10px] text-white/50 uppercase tracking-[0.2em] font-bold">
          Speed: {(speed * 100).toFixed(0)}%
        </div>
      </div>

      {/* Overlays */}
      {(isGameOver || isPaused) && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center pointer-events-auto">
          <div className="bg-zinc-900 p-10 rounded-[2.5rem] border border-white/10 shadow-2xl flex flex-col items-center text-center max-w-sm w-full mx-4">
            <h2 className="text-4xl font-black text-white mb-2 uppercase tracking-tight">
              {isGameOver ? 'Game Over' : 'Paused'}
            </h2>
            <p className="text-zinc-400 mb-8 text-sm leading-relaxed">
              {isGameOver 
                ? `You ran through Toronto and collected ${score} coins! Ready for another round?`
                : 'Take a breather. Toronto downtown is waiting for you.'}
            </p>
            
            <div className="flex flex-col gap-3 w-full">
              {isPaused && !isGameOver && (
                <button 
                  onClick={() => setPaused(false)}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
                >
                  <Play size={20} fill="currentColor" /> Resume
                </button>
              )}
              <button 
                onClick={resetGame}
                className="w-full bg-white hover:bg-zinc-200 text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <RotateCcw size={20} /> {isGameOver ? 'Try Again' : 'Restart'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pause Button */}
      {!isGameOver && !isPaused && (
        <button 
          onClick={() => setPaused(true)}
          className="absolute bottom-6 right-6 pointer-events-auto bg-white/10 hover:bg-white/20 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-white transition-all active:scale-90"
        >
          <Pause size={24} fill="currentColor" />
        </button>
      )}
    </div>
  );
};
