'use client';

import { useState, useEffect, useRef } from 'react';

interface UseCountUpOptions {
  end: number;
  start?: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  enabled?: boolean;
}

export function useCountUp({
  end,
  start = 0,
  duration = 2000,
  suffix = '',
  prefix = '',
  decimals = 0,
  enabled = true,
}: UseCountUpOptions) {
  const [count, setCount] = useState(start);
  const [isComplete, setIsComplete] = useState(false);
  const frameRef = useRef<number>(undefined);
  const startTimeRef = useRef<number>(undefined);

  useEffect(() => {
    if (!enabled) {
      setCount(start);
      setIsComplete(false);
      return;
    }

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic for smooth deceleration at the end
      const easeOut = 1 - Math.pow(1 - progress, 3);

      const currentValue = start + (end - start) * easeOut;
      setCount(currentValue);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setCount(end);
        setIsComplete(true);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [enabled, end, start, duration]);

  const displayValue = `${prefix}${count.toFixed(decimals)}${suffix}`;

  return { count, displayValue, isComplete };
}
