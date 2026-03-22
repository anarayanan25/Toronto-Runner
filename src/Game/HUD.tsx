import React from 'react';
import { useGame, PowerupType } from './GameContext';
import { Timer, Trophy, Play, RotateCcw, Pause, Heart, Zap, Shield, Magnet } from 'lucide-react';

const POWERUP_DURATION = 10;

const POWERUP_META: Record<PowerupType, { label: string; color: string; Icon: React.FC<{ size?: number }> }> = {
  speedBoost: { label: 'Speed Boost', color: '#00ff88', Icon: ({ size }) => <Zap size={size} /> },
  shield:     { label: 'Shield',      color: '#4488ff', Icon: ({ size }) => <Shield size={size} /> },
  magnet:     { label: 'Coin Magnet', color: '#ff44ff', Icon: ({ size }) => <Magnet size={size} /> },
};

const Lives: React.FC<{ lives: number }> = ({ lives }) => (
  <div className="flex gap-1.5 mt-1">
    {Array.from({ length: 3 }, (_, i) => (
      <Heart
        key={i}
        size={18}
        className={i < lives ? 'text-red-400' : 'text-white/20'}
        fill={i < lives ? 'currentColor' : 'none'}
      />
    ))}
  </div>
);

const PowerupBar: React.FC<{ type: PowerupType; timeLeft: number }> = ({ type, timeLeft }) => {
  const { label, color, Icon } = POWERUP_META[type];
  const pct = (timeLeft / POWERUP_DURATION) * 100;
  return (
    <div
      className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl border flex items-center gap-3 shadow-xl"
      style={{ borderColor: color + '55' }}
    >
      <span style={{ color }}><Icon size={18} /></span>
      <div className="flex flex-col gap-1 min-w-[90px]">
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color }}>
          {label}
        </span>
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${pct}%`, background: color }}
          />
        </div>
      </div>
      <span className="text-white/70 text-sm font-bold tabular-nums">{timeLeft}s</span>
    </div>
  );
};

export const HUD: React.FC = () => {
  const {
    score, highScore, timer, speed, level, lives,
    isGameOver, isPaused, activePowerup, powerupTimeLeft,
    resetGame, setPaused,
  } = useGame();

  const [showLevelUp, setShowLevelUp] = React.useState(false);
  const prevLevel = React.useRef(1);
  const isNewRecord = isGameOver && score > 0 && score >= highScore;

  React.useEffect(() => {
    if (level > prevLevel.current) {
      prevLevel.current = level;
      setShowLevelUp(true);
      const t = setTimeout(() => setShowLevelUp(false), 2500);
      return () => clearTimeout(t);
    }
  }, [level]);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col p-5 font-sans">

      {/* ── Top row ── */}
      <div className="flex justify-between items-start w-full gap-3">

        {/* Score + Lives */}
        <div className="bg-black/55 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 text-white flex flex-col gap-0.5 shadow-xl">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest opacity-60">
            <Trophy size={12} /> Score
          </div>
          <div className="text-3xl font-black tabular-nums leading-none">{score}</div>
          <Lives lives={lives} />
        </div>

        {/* High score */}
        <div className="bg-black/55 backdrop-blur-md px-4 py-3 rounded-2xl border border-yellow-400/20 text-white flex flex-col gap-0.5 shadow-xl items-center">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-yellow-400/70">
            <Trophy size={11} /> Best
          </div>
          <div className="text-lg font-bold tabular-nums text-yellow-300">{highScore}</div>
        </div>

        {/* Timer + Level */}
        <div className="flex flex-col items-end gap-2">
          <div className="bg-black/55 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 text-white flex flex-col gap-0.5 shadow-xl items-end">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest opacity-60">
              <Timer size={12} /> Time
            </div>
            <div className="text-3xl font-black tabular-nums leading-none">{60 - timer}s</div>
          </div>
          <div className="bg-emerald-500/80 backdrop-blur-md px-4 py-1.5 rounded-full text-white text-[11px] font-bold uppercase tracking-widest shadow-lg">
            Level {level}
          </div>
        </div>
      </div>

      {/* ── Active power-up ── */}
      {activePowerup && (
        <div className="mt-4 flex justify-center">
          <PowerupBar type={activePowerup} timeLeft={powerupTimeLeft} />
        </div>
      )}

      {/* ── Level-up flash ── */}
      {showLevelUp && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none animate-bounce">
          <div className="text-6xl font-black text-white italic uppercase tracking-tighter drop-shadow-2xl">
            Level {level}
          </div>
          <div className="text-emerald-400 font-bold uppercase tracking-[0.5em] text-sm mt-1">
            Speed Increased!
          </div>
        </div>
      )}

      {/* ── Speed bar ── */}
      <div className="mt-auto mb-8 flex flex-col items-center gap-2">
        <div className="w-48 h-1.5 bg-white/15 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-400 transition-all duration-500"
            style={{ width: `${Math.min(100, (speed / 1.5) * 100)}%` }}
          />
        </div>
        <div className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold">
          Speed {(speed * 100).toFixed(0)}%
        </div>
      </div>

      {/* ── Game Over / Paused overlay ── */}
      {(isGameOver || isPaused) && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center pointer-events-auto">
          <div className="bg-zinc-900 p-10 rounded-[2.5rem] border border-white/10 shadow-2xl flex flex-col items-center text-center max-w-sm w-full mx-4">

            <h2 className="text-4xl font-black text-white mb-1 uppercase tracking-tight">
              {isGameOver ? 'Game Over' : 'Paused'}
            </h2>

            {isGameOver && (
              <div className="flex flex-col items-center gap-1 mb-6 mt-3">
                <div className="text-5xl font-black tabular-nums text-white">{score}</div>
                {isNewRecord ? (
                  <div className="text-yellow-400 font-bold uppercase tracking-widest text-sm animate-pulse">
                    🏆 New Record!
                  </div>
                ) : (
                  <div className="text-zinc-500 text-sm">
                    Best: <span className="text-yellow-300 font-bold">{highScore}</span>
                  </div>
                )}
              </div>
            )}

            {!isGameOver && (
              <p className="text-zinc-400 mb-8 text-sm leading-relaxed mt-2">
                Take a breather. Toronto is waiting.
              </p>
            )}

            <div className="flex flex-col gap-3 w-full mt-2">
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
                <RotateCcw size={20} /> {isGameOver ? 'Play Again' : 'Restart'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Pause button ── */}
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
