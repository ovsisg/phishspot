import { useState, useRef, useCallback, useEffect } from 'react';

export function useTimer(onTimeout: () => void) {
  const [timeLeft, setTimeLeft] = useState(30);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(false);

  const startTimer = useCallback((duration: number) => {
    setTimeLeft(duration);
    startTimeRef.current = Date.now();
    
    if (timerRef.current) clearInterval(timerRef.current);
    
    timerRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (timerRef.current) window.clearInterval(timerRef.current);
          setTimeout(() => onTimeout(), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [onTimeout]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const getTimeSpent = useCallback(() => {
    return Math.round((Date.now() - startTimeRef.current) / 1000);
  }, []);

  const getTimerColor = useCallback(() => {
    if (timeLeft > 10) return 'timer-green';
    if (timeLeft > 5) return 'timer-orange';
    return 'timer-red';
  }, [timeLeft]);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);

  return {
    timeLeft,
    startTimer,
    stopTimer,
    getTimeSpent,
    getTimerColor,
    isPlayingRef,
  };
}
