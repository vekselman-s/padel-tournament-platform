import { create } from 'zustand';

interface Modal {
  id: string;
  isOpen: boolean;
  data?: any;
}

interface UIState {
  modals: Record<string, Modal>;
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  openModal: (id: string, data?: any) => void;
  closeModal: (id: string) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  modals: {},
  sidebarOpen: true,
  theme: 'light',

  openModal: (id, data) =>
    set((state) => ({
      modals: { ...state.modals, [id]: { id, isOpen: true, data } },
    })),

  closeModal: (id) =>
    set((state) => ({
      modals: { ...state.modals, [id]: { ...state.modals[id], isOpen: false } },
    })),

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
    set({ theme });
  },

  toggleTheme: () =>
    set((state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      if (typeof window !== 'undefined') {
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
      }
      return { theme: newTheme };
    }),
}));
