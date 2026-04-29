import { create } from 'zustand';

type Theme = 'dark' | 'light';

interface UIState {
  theme: Theme;
  sidebarOpen: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  theme: (localStorage.getItem('theme') as Theme) || 'dark',
  sidebarOpen: true,

  toggleTheme: () =>
    set((state) => {
      const next = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', next);
      return { theme: next };
    }),

  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    set({ theme });
  },

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
