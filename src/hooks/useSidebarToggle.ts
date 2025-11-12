import { useUIStore } from '@/store/uiStore';

export function useSidebarToggle() {
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = useUIStore();

  return {
    sidebarOpen,
    toggleSidebar,
    setSidebarOpen,
  };
}

