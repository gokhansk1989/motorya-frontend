'use client';

import { useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { performRefresh } from '@/lib/api';
import { tokeniAl, yenilemeyiPaylas, eskiDepoyuTemizle } from '@/lib/oturum';

/**
 * Oturumdaki kullanici bilgisini acilista sunucudan tazeler.
 *
 * Neden gerekli: kullanici nesnesi localStorage'da kalici tutuluyor ve
 * yalnizca girISTE yaziliyordu. Yani giristen sonra degisen hicbir sey
 * (e-posta dogrulandi, rol degisti, kullanici adi secildi) oturuma
 * yansimiyor, kullanici cikip girene kadar eski anlik goruntu yasiyordu.
 *
 * Bu somut bir hataya yol acti: PATCH /users/me bir donem yalnizca
 * duzenlenebilir alanlari donuyordu ve istemci bunu kullanici nesnesinin
 * YERINE koyuyordu; emailVerifiedAt siliniyor ve profilini kaydeden
 * herkese "e-postaniz dogrulanmamis" uyarisi cikiyordu. Ucun donusu
 * duzeltildi ama tarayicilarda kalmis bozuk nesneleri ancak boyle bir
 * tazeleme iyilestirir.
 *
 * Gelen veri mevcudun UZERINE birlestiriliyor: /users/me'nin dondurmedigi
 * bir alan (orn. deviceId ile gelen bilgiler) silinmesin.
 *
 * Hata sessiz: jeton suresi dolmussa api katmani zaten yenileme/cikis
 * akisini isletiyor, burada ikinci bir hata mesaji gostermek anlamsiz.
 */
export function OturumTazeleyici() {
  // Token artik bellekte ve kalici degil; oturum varligi kullanici
  // nesnesinden okunuyor.
  const token = useAuthStore(s => s.user);
  const setUser = useAuthStore(s => s.setUser);

  /**
   * ONYUKLEME: erisim tokenini cerezden geri kazan.
   *
   * Erisim tokeni artik yalnizca bellekte; sayfa yenilenince gidiyor.
   * Ama yenileme tokeni `HttpOnly` cerezde duruyor, yani oturum
   * SURUYOR. Acilista bir kez `/auth/refresh` cagirip bellege yeni bir
   * erisim tokeni koyuyoruz.
   *
   * Ayrica eski surumden kalmis `localStorage` token kopyalari
   * siliniyor: birakilsalardi duzeltmenin amaci bosa cikardi.
   *
   * Kalici kullanici nesnesi yoksa cagirmiyoruz: hic giris yapmamis
   * ziyaretci icin her sayfa aciliista bir istek atmak gereksiz.
   */
  useEffect(() => {
    eskiDepoyuTemizle();
    if (!useAuthStore.getState().user) return;
    if (tokeniAl()) return;
    void yenilemeyiPaylas(performRefresh).then((yeni) => {
      // Yenileme basarisizsa oturum gercekten bitmis: kalici kullanici
      // nesnesini de dusurelim ki arayuz girmis gibi davranmasin.
      if (!yeni) useAuthStore.getState().logout();
    });
  }, []);

  useEffect(() => {
    if (!token) return;
    let iptal = false;
    api.get('/users/me')
      .then(res => {
        if (iptal || !res.data) return;
        const mevcut = useAuthStore.getState().user;
        setUser({ ...(mevcut ?? {}), ...res.data });
      })
      .catch(() => {});
    return () => { iptal = true; };
  }, [token, setUser]);

  return null;
}
