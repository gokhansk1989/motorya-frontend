import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Sitedeki tek fiyat bicimi: "15.000 ₺".
 *
 * Onceden style:'currency' kullaniliyordu ve tr-TR bunu "₺15.000" diye
 * simge onde uretiyordu; cagiran yerlerin cogu sonuna bir ₺ daha
 * ekledigi icin ekranda "₺15.000 ₺" gorunuyordu. Simgeyi burada, sayinin
 * ardina koyuyoruz; cagiran taraf ayrica ₺ eklemiyor.
 */
export function formatPrice(amount: number | string) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return '—';
  return `${new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(n)} ₺`;
}

export function timeAgo(date: string | Date) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Az önce';
  if (m < 60) return `${m} dk önce`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} sa önce`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} gün önce`;
  return new Date(date).toLocaleDateString('tr-TR');
}
