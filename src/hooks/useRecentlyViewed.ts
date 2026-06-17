'use client';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'motorya_recently_viewed';
const MAX_ITEMS = 12;

function readIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeIds(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    /* localStorage unavailable (private mode, quota) — skip silently */
  }
}

export function trackListingView(listingId: string) {
  if (typeof window === 'undefined') return;
  const ids = readIds().filter((id) => id !== listingId);
  ids.unshift(listingId);
  writeIds(ids.slice(0, MAX_ITEMS));
}

export function useRecentlyViewedIds(excludeId?: string) {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    setIds(readIds().filter((id) => id !== excludeId));
  }, [excludeId]);

  return ids;
}
