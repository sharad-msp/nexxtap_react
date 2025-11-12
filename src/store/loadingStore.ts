import { create } from 'zustand';
import { loadingManager } from '@/lib/axios';

interface LoadingState {
  isLoading: boolean;
  loadingText: string;
  loadingCount: number;
}

interface LoadingActions {
  showLoading: (text?: string) => void;
  hideLoading: () => void;
  setLoadingText: (text: string) => void;
  resetLoading: () => void;
}

type LoadingStore = LoadingState & LoadingActions;

export const useLoadingStore = create<LoadingStore>((set, get) => ({
  isLoading: false,
  loadingText: 'Loading...',
  loadingCount: 0,

  showLoading: (text = 'Loading...') => {
    const { loadingCount } = get();
    set({
      isLoading: true,
      loadingText: text,
      loadingCount: loadingCount + 1,
    });
  },

  hideLoading: () => {
    const { loadingCount } = get();
    const newCount = Math.max(0, loadingCount - 1);

    set({
      isLoading: newCount > 0,
      loadingCount: newCount,
    });
  },

  setLoadingText: (text: string) => {
    set({ loadingText: text });
  },

  resetLoading: () => {
    set({
      isLoading: false,
      loadingText: 'Loading...',
      loadingCount: 0,
    });
  },
}));

// Listen to loading events from the loading manager
if (typeof window !== 'undefined') {
  window.addEventListener('loading:show', (event: any) => {
    const { showLoading } = useLoadingStore.getState();
    showLoading(event.detail?.text || 'Loading...');
  });

  window.addEventListener('loading:hide', () => {
    const { hideLoading } = useLoadingStore.getState();
    hideLoading();
  });
}

// Hook for automatic loading state management
export const useAutoLoading = () => {
  const { isLoading, loadingText, loadingCount } = useLoadingStore();
  
  return {
    isLoading,
    loadingText,
    loadingCount,
  };
};
