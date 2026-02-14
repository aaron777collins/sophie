import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface MatrixUserState {
  userId: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  isAuthenticated: boolean;
  setUser: (userData: Partial<MatrixUserState>) => void;
  clearUser: () => void;
}

export const useMatrixUserStore = create<MatrixUserState>()(
  persist(
    (set) => ({
      userId: null,
      displayName: null,
      avatarUrl: null,
      isAuthenticated: false,

      setUser: (userData: Partial<MatrixUserState>) => set((state) => ({
        ...state,
        ...userData,
        isAuthenticated: !!userData.userId
      })),

      clearUser: () => set({
        userId: null,
        displayName: null,
        avatarUrl: null,
        isAuthenticated: false
      })
    }),
    {
      name: 'haos-matrix-user',
      version: 1,
    }
  )
);

export function getMatrixUser() {
  const state = useMatrixUserStore.getState();
  return {
    userId: state.userId,
    displayName: state.displayName,
    avatarUrl: state.avatarUrl,
    isAuthenticated: state.isAuthenticated
  };
}