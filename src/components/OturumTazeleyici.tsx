'use client';

import { useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

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
  const token = useAuthStore(s => s.token);
  const setUser = useAuthStore(s => s.setUser);

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
