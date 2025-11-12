import { Navigate, Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Sidebar } from './Sidebar';
import { useSidebarToggle } from '@/hooks/useSidebarToggle';

export function DashboardLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toggleSidebar, sidebarOpen } = useSidebarToggle();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      {/* Main content area */}
      <div className={`flex flex-col min-w-0 transition-all duration-300 ${sidebarOpen ? 'md:ml-72' : 'md:ml-20'}`}>
        {/* Mobile header - only show on mobile */}
        <div className="md:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-center w-full">
              <img 
                src="/logo.png" 
                alt="Nexxtap Logo" 
                className="w-[100px] h-auto rounded object-contain"
              />
            </div>
            <button
              onClick={toggleSidebar}
              className="absolute right-4 p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer"
              aria-label="Toggle sidebar"
              type="button"
              style={{ pointerEvents: 'auto' }}
            >
              <Menu className="h-5 w-5 pointer-events-none" />
            </button>
          </div>
        </div>
        
        {/* Main content */}
        <main className="flex-1 p-3 sm:p-4 lg:p-6 overflow-y-auto h-screen">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
      
      {/* WebSocket Test Component */}
      {/* <SimpleWebSocketTest /> */}
    </div>
  );
}

