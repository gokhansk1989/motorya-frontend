'use client';
import { useEffect, useRef, useState, useCallback } from 'react';

export function usePullToRefresh(onRefresh: () => void) {
  const [state, setState] = useState<{ pulling: boolean; y: number; refreshing: boolean }>({
    pulling: false, y: 0, refreshing: false,
  });

  const startY = useRef(0);
  const currentY = useRef(0);
  const active = useRef(false);
  const onRefreshRef = useRef(onRefresh);
  useEffect(() => { onRefreshRef.current = onRefresh; }, [onRefresh]);

  useEffect(() => {
    const THRESHOLD = 70;

    const onTouchStart = (e: TouchEvent) => {
      if (window.scrollY > 5) return;
      startY.current = e.touches[0].clientY;
      currentY.current = 0;
      active.current = false;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (window.scrollY > 5) return;
      const dy = e.touches[0].clientY - startY.current;
      if (dy > 8) {
        active.current = true;
        currentY.current = Math.min(dy * 0.5, THRESHOLD + 20);
        setState(s => ({ ...s, pulling: true, y: currentY.current }));
      }
    };

    const onTouchEnd = () => {
      if (!active.current) return;
      if (currentY.current >= THRESHOLD) {
        setState({ pulling: false, y: 0, refreshing: true });
        onRefreshRef.current();
        setTimeout(() => setState(s => ({ ...s, refreshing: false })), 1000);
      } else {
        setState({ pulling: false, y: 0, refreshing: false });
      }
      active.current = false;
      currentY.current = 0;
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  return state;
}
