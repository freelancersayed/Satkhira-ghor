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
            if (data && data.user) {
              set({ user: data.user, isLoading: false });
              return data.user;
            } else {
              set({ user: null, isLoading: false });
              return null;
            }
          } else if (res.status === 401 || res.status === 403) {
            set({ user: null, isLoading: false });
            return null;
          } else {
            // If server error or transient 500, preserve existing user from storage
            set({ isLoading: false });
            return get().user;
          }
        } catch (error) {
          // On network failure or offline, preserve persisted user session
          set({ isLoading: false });
          return get().user;
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
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isLoading = false;
        }
      },
    }
  )
);
