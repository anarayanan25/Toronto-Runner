import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { playJumpSound } from './sounds';

export type PowerupType = 'speedBoost' | 'shield' | 'magnet';

const INITIAL_SPEED = 0.5;
const SPEED_INCREMENT = 0.2;
const MAX_TIME_PER_LEVEL = 60;
const INITIAL_LIVES = 3;
const POWERUP_DURATION = 10; // seconds
const INVINCIBILITY_MS = 2000;

interface GameContextType {
  score: number;
  highScore: number;
  timer: number;
  speed: number;
  level: number;
  lane: number;
  lives: number;
  isGameOver: boolean;
  isPaused: boolean;
  isJumping: boolean;
  isInvincible: boolean;
  activePowerup: PowerupType | null;
  powerupTimeLeft: number;
  addScore: (amount: number) => void;
  resetGame: () => void;
  setGameOver: (v: boolean) => void;
  setPaused: (v: boolean) => void;
  setLane: (lane: number) => void;
  triggerJump: () => void;
  setJumping: (v: boolean) => void;
  loseLife: () => void;
  activatePowerup: (type: PowerupType) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() =>
    parseInt(localStorage.getItem('toronto-runner-hs') || '0', 10)
  );
  const [timer, setTimer] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [level, setLevel] = useState(1);
  const [lane, setLane] = useState(1);
  const [lives, setLives] = useState(INITIAL_LIVES);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isJumping, setJumping] = useState(false);
  const [isInvincible, setIsInvincible] = useState(false);
  const [activePowerup, setActivePowerup] = useState<PowerupType | null>(null);
  const [powerupTimeLeft, setPowerupTimeLeft] = useState(0);

  // Refs for stable callbacks (avoid stale closures)
  const isInvincibleRef = useRef(false);
  const activePowerupRef = useRef<PowerupType | null>(null);
  const baseSpeedRef = useRef(INITIAL_SPEED);
  const scoreRef = useRef(0);

  const resetGame = useCallback(() => {
    setScore(0);
    scoreRef.current = 0;
    setTimer(0);
    const base = INITIAL_SPEED;
    setSpeed(base);
    baseSpeedRef.current = base;
    setLevel(1);
    setLane(1);
    setLives(INITIAL_LIVES);
    setIsGameOver(false);
    setIsPaused(false);
    setJumping(false);
    setIsInvincible(false);
    isInvincibleRef.current = false;
    setActivePowerup(null);
    activePowerupRef.current = null;
    setPowerupTimeLeft(0);
  }, []);

  const addScore = useCallback((amount: number) => {
    setScore((prev) => {
      scoreRef.current = prev + amount;
      return prev + amount;
    });
  }, []);

  const triggerJump = useCallback(() => {
    setJumping((cur) => {
      if (!cur) {
        playJumpSound();
        return true;
      }
      return cur;
    });
  }, []);

  const loseLife = useCallback(() => {
    if (isInvincibleRef.current) return;
    // Shield absorbs the hit
    if (activePowerupRef.current === 'shield') {
      activePowerupRef.current = null;
      setActivePowerup(null);
      setPowerupTimeLeft(0);
      isInvincibleRef.current = true;
      setIsInvincible(true);
      setTimeout(() => {
        isInvincibleRef.current = false;
        setIsInvincible(false);
      }, INVINCIBILITY_MS);
      return;
    }
    setLives((prev) => {
      const next = Math.max(0, prev - 1);
      if (next === 0) {
        setIsGameOver(true);
      } else {
        isInvincibleRef.current = true;
        setIsInvincible(true);
        setTimeout(() => {
          isInvincibleRef.current = false;
          setIsInvincible(false);
        }, INVINCIBILITY_MS);
      }
      return next;
    });
  }, []);

  const activatePowerup = useCallback((type: PowerupType) => {
    // Cancel existing speed boost before applying new powerup
    if (activePowerupRef.current === 'speedBoost') {
      setSpeed(baseSpeedRef.current);
    }
    activePowerupRef.current = type;
    setActivePowerup(type);
    setPowerupTimeLeft(POWERUP_DURATION);
    if (type === 'speedBoost') {
      setSpeed(baseSpeedRef.current * 1.6);
    }
  }, []);

  // Power-up countdown
  useEffect(() => {
    if (!activePowerup || isPaused || isGameOver) return;
    const id = setInterval(() => {
      setPowerupTimeLeft((prev) => {
        if (prev <= 1) {
          if (activePowerupRef.current === 'speedBoost') {
            setSpeed(baseSpeedRef.current);
          }
          activePowerupRef.current = null;
          setActivePowerup(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [activePowerup, isPaused, isGameOver]);

  // Save high score when game ends
  useEffect(() => {
    if (!isGameOver) return;
    const newHigh = Math.max(highScore, scoreRef.current);
    if (newHigh > highScore) {
      setHighScore(newHigh);
      localStorage.setItem('toronto-runner-hs', String(newHigh));
    }
  }, [isGameOver]); // eslint-disable-line

  // Game timer + speed / level progression
  useEffect(() => {
    if (isGameOver || isPaused) return;
    const id = setInterval(() => {
      setTimer((prev) => {
        const next = prev + 1;
        if (next <= 60 && next % 20 === 0) {
          const newBase = baseSpeedRef.current + SPEED_INCREMENT;
          baseSpeedRef.current = newBase;
          if (activePowerupRef.current !== 'speedBoost') setSpeed(newBase);
        }
        if (next >= MAX_TIME_PER_LEVEL) {
          setLevel((l) => {
            const newBase = INITIAL_SPEED + (l + 1) * 0.1;
            baseSpeedRef.current = newBase;
            if (activePowerupRef.current !== 'speedBoost') setSpeed(newBase);
            return l + 1;
          });
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isGameOver, isPaused]);

  return (
    <GameContext.Provider value={{
      score, highScore, timer, speed, level, lane, lives,
      isGameOver, isPaused, isJumping, isInvincible,
      activePowerup, powerupTimeLeft,
      addScore, resetGame,
      setGameOver: setIsGameOver,
      setPaused: setIsPaused,
      setLane, triggerJump, setJumping, loseLife, activatePowerup,
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within a GameProvider');
  return ctx;
};
