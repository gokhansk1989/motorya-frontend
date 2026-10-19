'use client';
import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';

/**
 * Cikis islemi — oturumu VE kullaniciya ozel onbellegi birlikte temizler.
 *
 * `logout()` tek basina yetmiyordu: React Query onbelleginde eski
 * kullanicinin favorileri, bildirimleri, mesajlari ve teklifleri
 * duruyordu. Iki somut sonucu vardi:
 *
 *  1. Cikis yapip baska bir hesapla girildiginde, yeni veri gelene kadar
 *     ONCEKI kullanicinin verisi ekranda kaliyordu.
 *  2. Cikis anindaki ucus halindeki istekler (bildirim yoklamasi,
 *     /users/me tazelemesi) yetkisiz tamamlanip 401 doneriyordu; bu da
 *     "oturum sona erdi" yonlendirmesini tetikleyebiliyordu.
 *
 * `cancelQueries` once cagriliyor: devam eden istekler iptal edilsin,
 * `clear` sonrasinda geri gelip onbellegi yeniden doldurmasinlar.
 */
export function useCikis() {
  const qc = useQueryClient();
  const logout = useAuthStore((s) => s.logout);

  return useCallback(async () => {
    await qc.cancelQueries();
    logout();
    qc.clear();
  }, [qc, logout]);
}
