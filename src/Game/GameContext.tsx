import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface GameState {
  score: number;
  timer: number;
  speed: number;
  level: number;
  lane: number; // 0, 1, 2
  isGameOver: boolean;
  isPaused: boolean;
}

interface GameContextType extends GameState {
  addScore: (amount: number) => void;
  resetGame: () => void;
  setGameOver: (value: boolean) => void;
  setPaused: (value: boolean) => void;
  setLane: (lane: number) => void;
}

const INITIAL_SPEED = 0.5;
const SPEED_INCREMENT = 0.2;
const MAX_TIME_PER_LEVEL = 60; // 1 minute

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [level, setLevel] = useState(1);
  const [lane, setLane] = useState(1);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const resetGame = useCallback(() => {
    setScore(0);
    setTimer(0);
    setSpeed(INITIAL_SPEED);
    setLevel(1);
    setLane(1);
    setIsGameOver(false);
    setIsPaused(false);
  }, []);

  const addScore = useCallback((amount: number) => {
    setScore((prev) => prev + amount);
  }, []);

  useEffect(() => {
    if (isGameOver || isPaused) return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        const nextTime = prev + 1;
        
        // Every 20 seconds, increase speed (up to 1 min)
        if (nextTime <= 60 && nextTime % 20 === 0) {
          setSpeed((s) => s + SPEED_INCREMENT);
        }

        // After 1 minute, next level
        if (nextTime >= MAX_TIME_PER_LEVEL) {
          setLevel((l) => l + 1);
          setSpeed(INITIAL_SPEED + (level * 0.1)); // Base speed for new level
          return 0; // Reset timer for next level
        }

        return nextTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isGameOver, isPaused, level]);

  return (
    <GameContext.Provider
      value={{
        score,
        timer,
        speed,
        level,
        lane,
        isGameOver,
        isPaused,
        addScore,
        resetGame,
        setGameOver: setIsGameOver,
        setPaused: setIsPaused,
        setLane,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
