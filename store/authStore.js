import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,

      setUser: (user) => set({ user, isLoading: false }),

      checkAuth: async () => {
        try {
          const res = await fetch('/api/auth/me');
          if (res.ok) {
            const data = await res.json();
            set({ user: data.user, isLoading: false });
            return data.user;
          } else {
            set({ user: null, isLoading: false });
            return null;
          }
        } catch (error) {
          set({ user: null, isLoading: false });
          return null;
        }
      },

      logout: async () => {
        try {
          await fetch('/api/auth/logout', { method: 'POST' });
        } catch (e) {
          console.error('Logout error:', e);
        } finally {
          set({ user: null, isLoading: false });
        }
      },
    }),
    {
      name: 'satkhira-ghor-auth-storage',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') {
          return window.localStorage;
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      partialize: (state) => ({ user: state.user }),
    }
  )
);
