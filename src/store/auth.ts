import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  role: string;
  emailVerifiedAt?: string | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  deviceId: string | null;
  setAuth: (user: User, token: string, refreshToken?: string, deviceId?: string) => void;
  setTokens: (token: string, refreshToken?: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      deviceId: null,
      setAuth: (user, token, refreshToken, deviceId) => {
        localStorage.setItem('access_token', token);
        if (refreshToken) localStorage.setItem('refresh_token', refreshToken);
        if (deviceId) localStorage.setItem('device_id', deviceId);
        set({
          user,
          token,
          refreshToken: refreshToken ?? get().refreshToken,
          deviceId: deviceId ?? get().deviceId,
        });
      },
      setTokens: (token, refreshToken) => {
        localStorage.setItem('access_token', token);
        if (refreshToken) localStorage.setItem('refresh_token', refreshToken);
        set({ token, refreshToken: refreshToken ?? get().refreshToken });
      },
      logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('device_id');
        set({ user: null, token: null, refreshToken: null, deviceId: null });
      },
      isAuthenticated: () => !!get().token,
    }),
    {
      name: 'motorya-auth',
      partialize: (s) => ({ user: s.user, token: s.token, refreshToken: s.refreshToken, deviceId: s.deviceId }),
    }
  )
);
