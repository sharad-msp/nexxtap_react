import { useState, useEffect } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Package, 
  Tag, 
  Store, 
  Shield,
  LogOut,
  ChevronLeft,
  Percent,
  Calculator,
  ShoppingCart,
  BarChart3,
  Settings,
  ArrowLeft,
  Menu,
  FileText,
  Printer
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSidebarToggle } from '@/hooks/useSidebarToggle';
import { usePermissions } from '@/hooks/usePermissions';
import { useToast } from '@/components/Toast';

// Icon mapping
const iconMap: { [key: string]: any } = {
  Home,
  Users,
  Package,
  Tag,
  Store,
  Shield,
  Percent,
  Calculator,
  ShoppingCart,
  BarChart3,
  Settings,
  FileText,
  Printer,
};

export function Sidebar() {
  const location = useLocation();
  const { logout, switchBackToSuperAdmin } = useAuth();
  const { sidebarOpen, toggleSidebar } = useSidebarToggle();
  const { getAccessibleMenuItems, isSystemAdmin, isStoreAdmin, isStoreAdminWithSuperAdmin, getUserPrimaryRole } = usePermissions();
  const { showToast } = useToast();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [tooltipText, setTooltipText] = useState('');
  const navigate = useNavigate();

  // Get user info from auth store first
  const { user } = useAuth();
  
  // Get accessible menu items based on user role and permissions
  const accessibleMenuItems = getAccessibleMenuItems();
  

  const handleLogout = async () => {
    try {
      await logout(showToast);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleSwitchBackToSuperAdmin = async () => {
    try {
      await switchBackToSuperAdmin(showToast,navigate);
      // navigate('/dashboard');
    } catch (error) {
      console.error('Switch back to superadmin failed:', error);
    }
  };

  // Get user role and info for display
  const userRole = getUserPrimaryRole();
  const roleDisplayName = userRole === 'system_admin' ? 'System Admin' : 
                         userRole === 'store_admin' ? 'Store Admin' : 
                         userRole || 'User';
  
  const userName = user?.name || 'User';
  const userEmail = user?.email || '';

  // Handle mouse enter for tooltips
  const handleMouseEnter = (itemName: string, event: React.MouseEvent) => {
    if (!sidebarOpen) {
      setHoveredItem(itemName);
      setTooltipText(itemName);
      
      // Calculate position relative to viewport
      const rect = event.currentTarget.getBoundingClientRect();
      setTooltipPosition({
        x: rect.right + 8, // 8px to the right of the sidebar
        y: rect.top + rect.height / 2 // Center vertically
      });
    }
  };

  // Handle mouse leave for tooltips
  const handleMouseLeave = () => {
    setHoveredItem(null);
    setTooltipText('');
  };

  // Close sidebar on mobile when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (sidebarOpen && window.innerWidth < 768 && !target.closest('.sidebar-container')) {
        toggleSidebar();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen, toggleSidebar]);

  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`
        sidebar-container fixed inset-y-0 left-0 z-50 bg-gray-900 text-white shadow-xl transform transition-all duration-300 ease-in-out flex flex-col overflow-x-hidden
        ${sidebarOpen ? 'w-72 translate-x-0' : 'w-20 -translate-x-full md:translate-x-0'}
        md:fixed md:z-50
      `}
      style={{ pointerEvents: 'auto' }}>
        {/* Header - only show when expanded */}
        {sidebarOpen && (
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700">
            <div className="flex-row items-center justify-center w-full">
              {/* Logo */}
              <div className="flex-shrink-0">
                <img 
                  src="/logo.png" 
                  alt="Nexxtap Logo" 
                  className="w-[150px] h-auto rounded-lg object-contain"
                />
              </div>
              
              {/* Title and Role */}
              <div>
                <p className="text-xs text-gray-300 mt-1 whitespace-nowrap">
                  {roleDisplayName}
                </p>
              </div>
            </div>
            
            {/* Toggle button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // console.log('Toggle button clicked!');
                toggleSidebar();
              }}
              className="absolute right-4 p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 cursor-pointer"
              title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
              aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
              type="button"
              style={{ pointerEvents: 'auto' }}
            >
              {sidebarOpen ? (
                <ChevronLeft className="h-5 w-5 pointer-events-none" />
              ) : (
                <Menu className="h-5 w-5 pointer-events-none" />
              )}
            </button>
          </div>
        )}

        {/* Toggle button for collapsed state */}
        {!sidebarOpen && (
          <div className="flex items-center justify-center h-16 px-4 border-b border-gray-700">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Toggle button clicked!');
                toggleSidebar();
              }}
              className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 cursor-pointer"
              title="Expand sidebar"
              aria-label="Expand sidebar"
              type="button"
              style={{ pointerEvents: 'auto' }}
            >
              <Menu className="h-5 w-5 pointer-events-none" />
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav className="mt-6 px-3 flex-1 overflow-y-auto overflow-x-hidden sidebar-scrollbar pb-6">
          <div className="space-y-1 pb-4 w-full">
            {accessibleMenuItems.map((item) => {
              const isActive = location.pathname.startsWith(item.href);
              const IconComponent = iconMap[item.icon];
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 group relative w-full
                    ${isActive 
                      ? 'bg-indigo-600 text-white shadow-lg' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }
                  `}
                  title={!sidebarOpen ? item.name : undefined}
                  onMouseEnter={(e) => handleMouseEnter(item.name, e)}
                  onMouseLeave={handleMouseLeave}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {IconComponent && (
                    <IconComponent className={`h-5 w-5 flex-shrink-0 ${
                      isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
                    }`} />
                  )}
                  <span className={`ml-3 transition-all duration-300 truncate ${
                    sidebarOpen ? 'opacity-100' : 'opacity-0'
                  }`}>
                    {item.name}
                  </span>
                  
                </Link>
              );
            })}
          </div>

          {/* User and Role information */}
          {sidebarOpen && (
            <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
              <div className="text-sm text-gray-300">
                <div className="font-medium text-white mb-2">User Information:</div>
                <div className="text-gray-200 mb-1">{userName}</div>
                <div className="text-gray-400 mb-3 text-xs">{userEmail}</div>
                <div className="font-medium text-white mb-1">Current Role:</div>
                <div className="text-gray-200 mb-2">{roleDisplayName}</div>
                {isSystemAdmin() && (
                  <>
                    <div className="text-xs text-indigo-400 bg-indigo-900/30 px-2 py-1 rounded mb-1">
                      Can manage all stores
                    </div>
                    <div className="text-xs text-yellow-400 bg-yellow-900/30 px-2 py-1 rounded">
                      Access: Dashboard & Store Management only
                    </div>
                  </>
                )}
                {isStoreAdmin() && (
                  <div className="text-xs text-green-400 bg-green-900/30 px-2 py-1 rounded">
                    Can manage store operations
                  </div>
                )}
                {isStoreAdminWithSuperAdmin() && user?.original_superadmin_name && (
                  <div className="text-xs text-indigo-400 bg-indigo-900/30 px-2 py-1 rounded mt-2">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                      Switched from: {user.original_superadmin_name}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Switch back to System Admin section - only show if user is store admin with superadmin info */}
          {isStoreAdminWithSuperAdmin() && (
            <div className="mt-6 pt-6 border-t border-gray-700">
              <button
                onClick={handleSwitchBackToSuperAdmin}
                className="flex items-center w-full px-3 py-3 text-sm font-medium text-gray-300 rounded-lg hover:bg-indigo-600 hover:text-white transition-all duration-200 group relative focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                title={!sidebarOpen ? 'Switch back to System Admin' : undefined}
                onMouseEnter={(e) => handleMouseEnter('Switch back to System Admin', e)}
                onMouseLeave={handleMouseLeave}
                aria-label="Switch back to System Admin"
              >
                <ArrowLeft className="h-5 w-5 flex-shrink-0" />
                <span className={`ml-3 transition-all duration-300 truncate ${
                  sidebarOpen ? 'opacity-100' : 'opacity-0'
                }`}>
                  Switch back to System Admin
                </span>
                
                {/* Enhanced tooltip for collapsed state */}
                {!sidebarOpen && (
                  <div className={`
                    absolute left-full ml-2 px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg 
                    transition-all duration-200 pointer-events-none whitespace-nowrap z-[9999] 
                    shadow-lg backdrop-blur-sm
                    ${hoveredItem === 'SwitchBack' ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
                  `}
                  style={{ zIndex: 9999 }}>
                    Switch back to System Admin
                    {/* Tooltip arrow */}
                    <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-0 h-0 border-l-0 border-r-4 border-t-4 border-b-4 border-transparent border-r-indigo-600"></div>
                  </div>
                )}
              </button>
            </div>
          )}

          {/* Logout section */}
          <div className="mt-8 pt-6 border-t border-gray-700">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-3 text-sm font-medium text-gray-300 rounded-lg hover:bg-red-600 hover:text-white transition-all duration-200 group relative focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              title={!sidebarOpen ? 'Logout' : undefined}
              onMouseEnter={(e) => handleMouseEnter('Logout', e)}
              onMouseLeave={handleMouseLeave}
              aria-label="Logout"
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              <span className={`ml-3 transition-all duration-300 truncate ${
                sidebarOpen ? 'opacity-100' : 'opacity-0'
              }`}>
                Logout
              </span>
              
              {/* Enhanced tooltip for collapsed state */}
              {!sidebarOpen && (
                <div className={`
                  absolute left-full ml-2 px-3 py-2 bg-red-600 text-white text-sm rounded-lg 
                  transition-all duration-200 pointer-events-none whitespace-nowrap z-[9999] 
                  shadow-lg backdrop-blur-sm
                  ${hoveredItem === 'Logout' ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
                `}
                style={{ zIndex: 9999 }}>
                  Logout
                  {/* Tooltip arrow */}
                  <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-0 h-0 border-l-0 border-r-4 border-t-4 border-b-4 border-transparent border-r-red-600"></div>
                </div>
              )}
            </button>
          </div>
        </nav>
      </div>

      {/* External Tooltip */}
      {!sidebarOpen && tooltipText && (
        <div 
          className="fixed px-3 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg border border-gray-700 backdrop-blur-sm pointer-events-none whitespace-nowrap z-[99999]"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            transform: 'translateY(-50%)',
            zIndex: 99999
          }}
        >
          {tooltipText}
          {/* Tooltip arrow */}
          <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-0 h-0 border-l-0 border-r-4 border-t-4 border-b-4 border-transparent border-r-gray-800"></div>
        </div>
      )}
    </>
  );
}
