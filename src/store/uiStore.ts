import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  // Initialize from localStorage or default to true
  sidebarOpen: typeof window !== 'undefined' ? 
    localStorage.getItem('sidebarOpen') !== 'false' : true,
  theme: typeof window !== 'undefined' ? 
    (localStorage.getItem('theme') as 'light' | 'dark') || 'light' : 'light',

  toggleSidebar: () => {
    const newState = !get().sidebarOpen;
    set({ sidebarOpen: newState });
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebarOpen', newState.toString());
    }
  },

  setSidebarOpen: (open: boolean) => {
    set({ sidebarOpen: open });
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebarOpen', open.toString());
    }
  },

  setTheme: (theme: 'light' | 'dark') => {
    set({ theme });
    // Apply theme to document
    if (typeof window !== 'undefined') {
      document.documentElement.classList.toggle('dark', theme === 'dark');
      localStorage.setItem('theme', theme);
    }
  },
}));

