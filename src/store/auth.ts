import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { tokeniYaz, tokeniSil, tokeniAl } from '@/lib/oturum';

interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  role: string;
  emailVerifiedAt?: string | null;
}

/**
 * Oturum durumu.
 *
 * ── TOKEN ARTIK BURADA DEĞİL ──────────────────────────────────────
 *
 * Önceden `token`, `refreshToken` ve `deviceId` hem bu durumda hem de
 * zustand persist'in `motorya-auth` anahtarıyla `localStorage`'da
 * duruyordu. Aynı origin'de çalışan bir XSS bunları okuyabilirdi.
 *
 * Artık:
 *  - Yenileme tokenı sunucuda `HttpOnly` çerezde (JS okuyamaz).
 *  - Erişim tokenı yalnızca bellekte (`lib/oturum.ts`).
 *  - Bu durumda yalnızca KULLANICI nesnesi kalıcı. O bir kimlik
 *    bilgisi değil: adı, avatarı, rolü. Kalıcı olması, sayfa açılışında
 *    arayüzün boş kullanıcıyla çizilip sonra zıplamasını önlüyor.
 *
 * Kalıcı kullanıcı nesnesi YETKİ VERMEZ. Her korumalı istek sunucuda
 * tokenla doğrulanıyor; buradaki `role` yalnızca menü çizmek için.
 */
interface AuthState {
  user: User | null;
  setAuth: (user: User, token: string) => void;
  setUser: (user: User) => void;
  setTokens: (token: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      // Kullanici adi degisimi gibi kismi guncellemelerde oturumu bozmadan
      // yalnizca kullanici bilgisini tazelemek icin.
      setUser: (user) => set({ user }),
      setAuth: (user, token) => {
        tokeniYaz(token);
        set({ user });
      },
      setTokens: (token) => {
        tokeniYaz(token);
      },
      logout: () => {
        tokeniSil();
        set({ user: null });
      },
      /**
       * Oturum var mı?
       *
       * Bellekteki token YA DA kalıcı kullanıcı. İkincisi şart: sayfa
       * yenilenince token bellekten silinir ama çerez durduğu için
       * oturum sürüyordur. Yalnızca tokena bakmak, her yenilemede
       * kullanıcıyı çıkmış göstermek olurdu.
       */
      isAuthenticated: () => !!tokeniAl() || !!get().user,
    }),
    {
      name: 'motorya-auth',
      // Token alanları BİLEREK yok: diske hiçbir kimlik bilgisi yazılmıyor.
      partialize: (s) => ({ user: s.user }),
    }
  )
);
