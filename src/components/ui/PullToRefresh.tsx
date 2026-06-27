'use client';
import { useEffect, useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';

const THRESHOLD = 70;
const MAX_PULL = 100;

export function PullToRefresh({ onRefresh }: { onRefresh: () => Promise<unknown> | unknown }) {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef<number | null>(null);
  const pullRef = useRef(0);
  const refreshingRef = useRef(false);

  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      if (window.scrollY > 0 || refreshingRef.current) { startY.current = null; return; }
      startY.current = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (startY.current === null) return;
      const dy = e.touches[0].clientY - startY.current;
      if (dy <= 0 || window.scrollY > 0) { startY.current = null; pullRef.current = 0; setPull(0); return; }
      const next = Math.min(dy * 0.5, MAX_PULL);
      pullRef.current = next;
      setPull(next);
    };
    const onTouchEnd = () => {
      if (startY.current === null) return;
      startY.current = null;
      if (pullRef.current >= THRESHOLD) {
        refreshingRef.current = true;
        setRefreshing(true);
        Promise.resolve(onRefresh()).finally(() => {
          refreshingRef.current = false;
          setRefreshing(false);
          pullRef.current = 0;
          setPull(0);
        });
      } else {
        pullRef.current = 0;
        setPull(0);
      }
    };
    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchmove', onTouchMove, { passive: true });
    document.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, [onRefresh]);

  const height = refreshing ? 50 : pull;
  const ready = pull >= THRESHOLD;

  return (
    <div
      style={{
        height, display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', transition: refreshing ? 'height .2s ease' : 'none',
      }}
      aria-hidden="true"
    >
      {(pull > 4 || refreshing) && (
        <RefreshCw
          size={20}
          style={{
            color: ready || refreshing ? 'var(--accent)' : 'var(--ink-3)',
            transform: refreshing ? undefined : `rotate(${pull * 3}deg)`,
            animation: refreshing ? 'm-spin .8s linear infinite' : 'none',
          }}
        />
      )}
    </div>
  );
}
