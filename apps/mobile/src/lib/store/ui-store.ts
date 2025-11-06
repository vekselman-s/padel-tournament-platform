import { create } from 'zustand';

interface UIState {
  isRefreshing: boolean;
  setRefreshing: (refreshing: boolean) => void;

  toast: {
    visible: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  };
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  hideToast: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isRefreshing: false,
  setRefreshing: (refreshing) => set({ isRefreshing: refreshing }),

  toast: {
    visible: false,
    message: '',
    type: 'info',
  },
  showToast: (message, type = 'info') => {
    set({ toast: { visible: true, message, type } });
    setTimeout(() => {
      set({ toast: { visible: false, message: '', type: 'info' } });
    }, 3000);
  },
  hideToast: () => set({ toast: { visible: false, message: '', type: 'info' } }),
}));
