import { useCallback, useEffect, useRef, useState } from 'react';

export interface Player {
  index: number;
  isPlaying: boolean;
  speed: number;
  total: number;
  next: () => void;
  prev: () => void;
  toggle: () => void;
  reset: () => void;
  goEnd: () => void;
  seek: (i: number) => void;
  setSpeed: (s: number) => void;
}

const SPEED_INTERVAL: Record<number, number> = {
  0.5: 1500,
  1: 900,
  1.5: 600,
  2: 380,
};

export function usePlayer(total: number): Player {
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const timer = useRef<number | null>(null);

  const clear = () => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  };

  // reset on total change (new algorithm / input)
  useEffect(() => {
    clear();
    setIndex(0);
    setIsPlaying(false);
  }, [total]);

  useEffect(() => {
    if (!isPlaying) {
      clear();
      return;
    }
    if (index >= total - 1) {
      setIsPlaying(false);
      return;
    }
    const ms = SPEED_INTERVAL[speed] ?? 900;
    timer.current = window.setTimeout(() => {
      setIndex((i) => Math.min(i + 1, total - 1));
    }, ms);
    return clear;
  }, [isPlaying, index, speed, total]);

  const next = useCallback(() => {
    setIsPlaying(false);
    setIndex((i) => Math.min(i + 1, total - 1));
  }, [total]);

  const prev = useCallback(() => {
    setIsPlaying(false);
    setIndex((i) => Math.max(i - 1, 0));
  }, []);

  const toggle = useCallback(() => {
    setIsPlaying((p) => {
      if (!p && index >= total - 1) {
        setIndex(0);
        return true;
      }
      return !p;
    });
  }, [index, total]);

  const reset = useCallback(() => {
    setIsPlaying(false);
    setIndex(0);
  }, []);

  const goEnd = useCallback(() => {
    setIsPlaying(false);
    setIndex(total - 1);
  }, [total]);

  const seek = useCallback(
    (i: number) => {
      setIsPlaying(false);
      setIndex(Math.max(0, Math.min(i, total - 1)));
    },
    [total],
  );

  return { index, isPlaying, speed, total, next, prev, toggle, reset, goEnd, seek, setSpeed };
}
