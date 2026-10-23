/**
 * Ilan taslagi — istemci tarafi.
 *
 * Taslak SUNUCUDA tutuluyor, localStorage'da degil. Uc neden:
 *
 * 1. Taslak kullaniciya ait olmali. localStorage cihaza ait: aynı
 *    tarayiciyi paylasan iki hesap birbirinin taslagini gorurdu.
 * 2. Fotograflar zaten sunucuda; adreslerini cihazda tutmak ikisini
 *    ayri yerlere boler.
 * 3. Telefonda baslayip bilgisayarda devam etmek calisiyor.
 *
 * Taslakta T.C. kimlik numarasi, parola ve oturum jetonu YOK - sunucu
 * alanlari beyaz listeye gore suzuyor.
 */
import { api } from './api';

export interface Taslak {
  payload: Record<string, string>;
  imageUrls: string[];
  /** Adres -> kadraj eslemesi (bkz. lib/gorselOran.ts). */
  imageCrops?: Record<string, { x: number; y: number; w: number; h: number }>;
  step: number;
  updatedAt: string;
}

export async function taslagiGetir(): Promise<Taslak | null> {
  try {
    const r = await api.get('/listings/taslak');
    return r.data ?? null;
  } catch {
    // Taslak okunamazsa form normal acilsin; bu bir hata ekrani
    // gosterecek kadar onemli degil.
    return null;
  }
}

export async function taslagiKaydet(t: {
  payload: Record<string, unknown>;
  imageUrls: string[];
  /** Adres -> kadraj eslemesi (bkz. lib/gorselOran.ts). */
  imageCrops?: Record<string, { x: number; y: number; w: number; h: number }>;
  step: number;
}): Promise<void> {
  try {
    await api.put('/listings/taslak', t);
  } catch {
    // Sessizce vazgec: taslak kaydetmek kullanicinin istedigi bir islem
    // degil, arka planda oluyor. Basarisiz olursa formu bolmemeli.
  }
}

export async function taslagiSil(): Promise<void> {
  try {
    await api.delete('/listings/taslak');
  } catch {
    // Ilan zaten gonderildi; taslagin kalmasi en fazla bir sonraki
    // acilista "devam et" teklifi gostermeye yol acar.
  }
}

/** Taslakta gercekten bir sey var mi? Bos taslak icin teklif gosterme. */
export function taslakDoluMu(t: Taslak | null): boolean {
  if (!t) return false;
  const p = t.payload ?? {};
  return (
    t.imageUrls?.length > 0 ||
    Object.values(p).some((v) => typeof v === 'string' && v.trim().length > 0)
  );
}

/** "3 saat önce" gibi kisa bir ifade. */
export function taslakZamani(iso: string): string {
  const fark = Date.now() - new Date(iso).getTime();
  const dk = Math.round(fark / 60000);
  if (dk < 1) return 'az önce';
  if (dk < 60) return `${dk} dakika önce`;
  const sa = Math.round(dk / 60);
  if (sa < 24) return `${sa} saat önce`;
  const gun = Math.round(sa / 24);
  return `${gun} gün önce`;
}
