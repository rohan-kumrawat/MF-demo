import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User, LoginResponse } from "@/types/auth.types";

export type Role = "admin" | "kiosk" | "agent" | "customer";

interface AuthState {
  role: Role | null;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  diaryIds: string[];
  loanIds: string[];
  isAuthenticated: boolean;
  _hasHydrated: boolean;
  login: (data: LoginResponse) => void;
  setAccessToken: (token: string) => void;
  setRefreshToken: (token: string) => void;
  setHasHydrated: (state: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      role: null,
      user: null,
      accessToken: null,
      refreshToken: null,
      diaryIds: [],
      loanIds: [],
      isAuthenticated: false,
      _hasHydrated: false,
      login: (data) =>
        set({
          role: data.user.role as Role,
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          diaryIds: data.user.diaryIds || [],
          loanIds: data.user.loanIds || [],
          isAuthenticated: true,
        }),
      setAccessToken: (token) => set({ accessToken: token }),
      setRefreshToken: (token) => set({ refreshToken: token }),
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      logout: () => {
        set({
          role: null,
          user: null,
          accessToken: null,
          refreshToken: null,
          diaryIds: [],
          loanIds: [],
          isAuthenticated: false,
        });
        useAuthStore.persist.clearStorage();
      },
    }),
    {
      name: "gk_auth",
      storage: createJSONStorage(() => sessionStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({
        role: state.role,
        user: state.user,
        refreshToken: state.refreshToken,
        accessToken: state.accessToken,
        diaryIds: state.diaryIds,
        loanIds: state.loanIds,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
