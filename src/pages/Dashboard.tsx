import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  DollarSign,
  CreditCard,
  Banknote,
  ShoppingCart,
  Package,
  Monitor,
  ChevronDown,
  MoreVertical,
  RefreshCw,
  Eye,
  ArrowRight,
  Store as StoreIcon,
  ArrowUpRight,
  ArrowDownRight,
  Store
} from 'lucide-react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { statsApi } from '@/api/statsApi';
import { storeApi } from '@/api/storeApi';
import { useAuthStore } from '@/store/authStore';
import { usePermissions } from '@/hooks';
import { Card, CardContent, CardHeader,FullPageLoader } from '@/components';
import { StoreDashboardSkeleton } from '@/components/Skeleton/StoreDashboard';
import LocalDateTime from '@/components/LocalDateTime';

type TimeFilter = '1H' | '1D' | '1W' | '1M' | '6M' | '12M';


interface StatCardProps {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
  growth?: number;
  color: string;
  bgColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, growth, color, bgColor }) => (
  <Card hover className="transition-all duration-200">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value.toLocaleString()}</p>
          <div className="flex items-center mt-2">
            {growth !== undefined && (
              <div className={`flex items-center text-sm ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {growth >= 0 ? (
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 mr-1" />
                )}
                {Math.abs(growth)}%
              </div>
            )}
            <span className="text-sm text-gray-500 ml-2">{subtitle}</span>
          </div>
        </div>
        <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center`}>
          <div className={color}>{icon}</div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const { isSystemAdmin, isStoreAdmin, hasPermission } = usePermissions();
  const getPageTitle = () => {
    if (isSystemAdmin()) {
      return 'System Administration';
    } else if (isStoreAdmin()) {
      return 'Store Management';
    }
    return 'Dashboard';
  };
  usePageTitle({ title: getPageTitle() });
  const { user } = useAuthStore();
  
  const [activeFilter, setActiveFilter] = useState<TimeFilter>('1D');
  const [readsFilter, setReadsFilter] = useState<TimeFilter>('1D');
  const [salesFilter, setSalesFilter] = useState<TimeFilter>('1D');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [systemAdminDashboardData, setSystemAdminDashboardData] = useState<any>(null);
  const [storeName, setStoreName] = useState<string>('');
  const [chartData, setChartData] = useState<any>({
    reads: [],
    salesProduct: [],
    salesDevice: []
  });
  const [salesChartData, setSalesChartData] = useState<any[]>([]);

  // Fetch store name
  const fetchStoreName = useCallback(async () => {
    try {
      if (user?.store_id) {
        const response = await storeApi.getById(user.store_id);
        if (response.status === 1 && response.data) {
          setStoreName(response.data.name || '');
        }
      }
    } catch (error) {
      console.error('Error fetching store name:', error);
    }
  }, [user?.store_id]);

  // Load chart data independently
  const loadReadsChart = useCallback(async (filter: TimeFilter) => {
    try {
      const response = await statsApi.getChartData('total_read_chart', filter);
      setChartData((prev: any) => ({
        ...prev,
        reads: response.data?.data?.data || []
      }));
    } catch (error) {
      console.error('Error loading reads chart:', error);
    }
  }, []);

  const loadSalesChart = useCallback(async (filter: TimeFilter) => {
    try {
      const response = await statsApi.getChartData('sales_amount_chart', filter);
      setSalesChartData(response.data?.data?.data || []);
    } catch (error) {
      console.error('Error loading sales chart:', error);
    }
  }, []);

  // Load dashboard data
  const loadDashboardData = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      if(isSystemAdmin()) {
        const [SystemAdminDashboardResponse] = await Promise.all([
          statsApi.getDashboardStats()
        ]);
        if (SystemAdminDashboardResponse.status === 1) {
          setSystemAdminDashboardData(SystemAdminDashboardResponse.data);
        }
      } else {        
        const [dashResponse] = await Promise.all([
          statsApi.getStoreDashboard(activeFilter)
        ]);
        if (dashResponse.status === 1) {
          setDashboardData(dashResponse.data);
        }
        const [readsResponse, salesResponse, productResponse, deviceResponse] = await Promise.all([
          statsApi.getChartData('total_read_chart', activeFilter=='1W' ? '5D' : activeFilter),
          statsApi.getChartData('sales_amount_chart', activeFilter=='1W' ? '5D' : activeFilter),
          statsApi.getChartData('sales_product', activeFilter),
          statsApi.getChartData('sales_device', activeFilter)
        ]);
        setChartData({
          reads: readsResponse.data?.data?.data || [],
          salesProduct: productResponse.data?.data || [],
          salesDevice: deviceResponse.data?.data || []
        });
        setSalesChartData(salesResponse.data?.data?.data || []);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeFilter, readsFilter, salesFilter]);

  useEffect(() => {
    fetchStoreName();
  }, [fetchStoreName]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleRefresh = () => {
    loadDashboardData(false);
  };

  const handleFilterChange = (filter: TimeFilter) => {
    setActiveFilter(filter);
  };

  const getStatusBadge = (status: string | number) => {
    const normalizedStatus = String(status).toLowerCase();
    // Map numeric and string statuses to badge styles matching OrderList
    if (normalizedStatus === 'completed' || normalizedStatus === 'delivered' || normalizedStatus === '2') {
      return 'bg-emerald-100 text-emerald-700';
    } else if (normalizedStatus === 'in progress' || normalizedStatus === '1') {
      return 'bg-blue-100 text-blue-700';
    } else if (normalizedStatus === 'pending' || normalizedStatus === '0') {
      return 'bg-amber-100 text-amber-700';
    } else if (normalizedStatus === 'cancelled' || normalizedStatus === 'canceled' || normalizedStatus === '3' || normalizedStatus === '-1') {
      return 'bg-red-100 text-red-700';
    }
    return 'bg-gray-100 text-gray-700';
  };

  const getStatusLabel = (status: string | number) => {
    const normalizedStatus = String(status).toLowerCase();
    // Map numeric and string statuses to labels matching OrderList
    if (normalizedStatus === '0') return 'Pending';
    if (normalizedStatus === '1') return 'In Progress';
    if (normalizedStatus === '2') return 'Completed';
    if (normalizedStatus === '3' || normalizedStatus === '-1') return 'Cancelled';
    if (normalizedStatus === 'completed' || normalizedStatus === 'delivered') return 'Completed';
    if (normalizedStatus === 'pending') return 'Pending';
    if (normalizedStatus === 'in progress') return 'In Progress';
    if (normalizedStatus === 'cancelled' || normalizedStatus === 'canceled') return 'Cancelled';
    return String(status);
  };

  const getPaymentStatusBadge = (paymentStatus?: string) => {
    if (!paymentStatus) return 'bg-gray-100 text-gray-700';
    const normalized = paymentStatus.toLowerCase();
    if (normalized === 'paid') return 'bg-emerald-100 text-emerald-700';
    if (normalized === 'partially_paid' || normalized === 'partially paid') return 'bg-amber-100 text-amber-700';
    if (normalized === 'saved') return 'bg-gray-100 text-gray-700';
    return 'bg-gray-100 text-gray-700';
  };

  const getPaymentStatusLabel = (paymentStatus?: string) => {
    if (!paymentStatus) return 'Unknown';
    const normalized = paymentStatus.toLowerCase();
    if (normalized === 'paid') return 'Paid';
    if (normalized === 'partially_paid' || normalized === 'partially paid') return 'Partially Paid';
    if (normalized === 'saved') return 'Saved';
    return paymentStatus;
  };
  if (loading) {
    const SkeletonCard = () => (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 animate-pulse">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="h-3 bg-gray-200 rounded w-20 mb-3"></div>
            <div className="h-8 bg-gray-300 rounded w-24 mb-2"></div>
            <div className="h-2 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );

    const SkeletonChart = () => (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 animate-pulse">
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
            <div className="h-8 bg-gray-300 rounded w-20"></div>
          </div>
          <div className="h-3 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="flex gap-2 mb-4">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="h-7 bg-gray-200 rounded w-12"></div>
          ))}
        </div>
        <div className="h-48 bg-gray-100 rounded"></div>
      </div>
    );
     // System Admin Skeleton Components
    const SystemAdminSkeleton = () => (
      <>
        {/* Total Stores Card Skeleton */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 mb-6 animate-pulse">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="h-3 bg-gray-200 rounded w-24 mb-3"></div>
              <div className="h-10 bg-gray-300 rounded w-16 mb-2"></div>
              <div className="h-3 bg-green-100 rounded w-20"></div>
            </div>
            <div className="w-10 h-10 bg-indigo-100 rounded-lg"></div>
          </div>
        </div>

        {/* Quick Actions Card Skeleton */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 animate-pulse">
          <div className="h-5 bg-gray-300 rounded w-32 mb-6"></div>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
    if(isSystemAdmin()) {
      return (
        <>
          <div className="min-h-screen bg-gray-50 p-6">
            <SystemAdminSkeleton />
          </div>
        </>
      );
    } else {
      return (
        <StoreDashboardSkeleton />
      );
    }
  }
  // if (!dashboardData) {
  // return (
  //     <div className="flex items-center justify-center h-screen">
  //       <p className="text-gray-600">No data available</p>
  //     </div>
  //   );
  // }

  const metrics = dashboardData?.metrics;
  const recentOrders = dashboardData?.recent_orders || [];
  const systemDashboardMetrics = systemAdminDashboardData;
  const maxProductValue = chartData.salesProduct.length > 0 
    ? Math.max(...chartData.salesProduct.map((p: any) => parseFloat(p.value))) 
    : 1;
  const maxDeviceValue = chartData.salesDevice.length > 0 
    ? Math.max(...chartData.salesDevice.map((d: any) => parseFloat(d.value))) 
    : 1;

  const topMetrics = [
    {
      title: 'Settled',
      value: metrics?.settled?.value || 0,
      subtitle: metrics?.settled?.subtitle || 'N/A',
      growth: metrics?.settled?.growth || null,
      color: 'text-white',
      bgColor: '',
      customBg: '#0000FF',
      icon: <DollarSign className="w-6 h-6" />
    },
    {
      title: 'Total sales',
      value: metrics?.total_sales?.value || 0 || 'N/A',
      subtitle: metrics?.total_sales?.subtitle || 'N/A',
      growth: metrics?.total_sales?.growth || null,
      color: 'text-gray-800',
      bgColor: 'bg-white',
      icon: <TrendingUp className="w-6 h-6 text-emerald-600" />
    },
    {
      title: 'Total Transactions',
      value: metrics?.transactions?.value || 0 || 'N/A',
      subtitle: metrics?.transactions?.subtitle || 'N/A',
      growth: metrics?.transactions?.growth || null,
      color: 'text-gray-800',
      bgColor: 'bg-white',
      icon: <ShoppingCart className="w-6 h-6 text-blue-600" />
    },
    {
      title: 'Average Order',
      value: metrics?.average_order?.value || 0 || 'N/A',
      subtitle: metrics?.average_order?.subtitle || 'N/A',
      growth: metrics?.average_order?.growth || null,
      color: 'text-gray-800',
      bgColor: 'bg-white',
      icon: <Package className="w-6 h-6 text-purple-600" />
    }
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-6">
         {/* System Admin Stats */}
         {isSystemAdmin() && (
          <>
            <StatCard
              title="Total Stores"
              value={systemDashboardMetrics?.stores?.total || 0}
              subtitle={systemDashboardMetrics?.stores?.subtitle || 'N/A'}
              icon={<Store className="h-6 w-6" />}
              growth={systemDashboardMetrics?.stores?.growth || null}
              color="text-indigo-600"
              bgColor="bg-indigo-100"
            />

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* System Admin Quick Actions */}
                  {isSystemAdmin() && (
                    <button 
                      onClick={() => navigate('/stores')}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <Store className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Manage Stores</p>
                          <p className="text-sm text-gray-500">View all stores</p>
                        </div>
                      </div>
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
        {isStoreAdmin() && (
          <>
          {/* Header with Store Name, Filter and Refresh */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
            <div>
              {storeName && (
                <div className="flex items-center gap-2 mb-1">
                  <StoreIcon className="w-5 h-5 text-indigo-600" />
                  <span className="text-lg font-semibold text-indigo-700">{storeName}</span>
                </div>
              )}
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            </div>
            
            <div className="flex items-center gap-3 flex-wrap">
              {/* Time Filter Pills */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                {(['1H', '1D', '1W', '1M', '6M', '12M'] as TimeFilter[]).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => handleFilterChange(filter)}
                    disabled={refreshing}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                      activeFilter === filter
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                    } ${refreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              {/* Refresh Button */}
                <button 
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>

          {/* Top Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {topMetrics.map((metric, index) => (
              <div
                key={index}
                className={`${metric.bgColor} rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-200 ${
                  index === 0 ? 'relative overflow-hidden' : 'border border-gray-200'
                }`}
                style={(metric as any).customBg ? { background: (metric as any).customBg } : undefined}
              >
                {/* {index === 0 && (
                  <button className="absolute top-4 right-4 p-1 hover:bg-black/20 rounded transition-colors">
                    <MoreVertical className="w-4 h-4 text-white" />
                  </button>
                )} */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className={`text-sm font-medium ${metric.color} ${index === 0 ? 'opacity-90' : 'text-gray-600'}`}>
                      {metric.title}
                    </h3>
                    <p className={`text-3xl font-bold mt-2 ${metric.color}`}>
                      {metric.value}
                    </p>
                  </div>
                  {index !== 0 && (
                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
                      {metric.icon}
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <p className={`text-xs ${index === 0 ? 'text-blue-100' : 'text-gray-500'}`}>
                    {metric.subtitle}
                  </p>
                  {metric.growth !== null && metric.growth !== undefined && (
                    <span className={`text-xs font-medium ${index === 0 ? 'text-white/90' : 'text-emerald-600'}`}>
                      {metric.growth > 0 ? '+' : ''}{metric.growth}%
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Additional Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Net Sales</h3>
                <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{metrics?.net_sales?.value || 0 || 'N/A'}</p>
              <p className="text-xs text-gray-500 mt-1">{metrics?.net_sales?.subtitle || 'N/A'}</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Refunds</h3>
                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-red-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{metrics?.refunds?.value || 0 || 'N/A'}</p>
              <p className="text-xs text-gray-500 mt-1">{metrics?.refunds?.subtitle || 'N/A'}</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Card Sales</h3>
                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-indigo-600" />
                    </div>
                  </div>
              <p className="text-2xl font-bold text-gray-900">{metrics.card_sales.value}</p>
              <p className="text-xs text-gray-500 mt-1">{metrics.card_sales.subtitle}</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Cash Sales</h3>
                <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                  <Banknote className="w-5 h-5 text-amber-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{metrics.cash_sales.value}</p>
              <p className="text-xs text-gray-500 mt-1">{metrics.cash_sales.subtitle}</p>
            </div>
          </div>

          {/* Charts Section - New Design */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Total Reads Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-gray-600">Total Reads</h3>
                  {/* <ChevronDown className="w-4 h-4 text-gray-400" /> */}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  {/* <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded font-medium">LIVE</span> */}
                </div>
              </div>

              {/* Value Display */}
              <div className="mb-6">
                <p className="text-4xl font-bold text-gray-900">
                  {chartData?.reads?.reduce((sum: number, item: any) => sum + item.orders, 0).toLocaleString()}
                </p>
              </div>

              {/* Bar Chart */}
              <div className="relative mb-6" style={{ marginTop: '40px' }}>
                <div className="h-40 flex items-end justify-between gap-1">
                  {chartData?.reads?.slice(0, 12).map((item: any, index: number) => {
                    const maxValue = Math.max(...chartData.reads.map((d: any) => d.orders), 1);
                    const currentValue = chartData.reads[chartData.reads.length - 1]?.orders || 0;
                    const isLastBar = index === Math.min(chartData.reads.length - 1, 11);
                    
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center gap-2 group relative">
                        <div className="w-full bg-gray-100 rounded-t-md overflow-hidden relative" style={{ height: '160px' }}>
                          <div 
                            className="bg-[#0000FF] rounded-t-md absolute bottom-0 w-full transition-all duration-300 hover:opacity-80"
                            style={{ height: `${(item.orders / maxValue) * 100}%` }}
                          >
                            {isLastBar && (
                              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                                {currentValue}
                              </div>
                            )}
                          </div>
                        </div>
                        {/* Tooltip on hover */}
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-4 left-1/2 transform -translate-x-1/2 bg-black text-white px-1 py-0.5 rounded text-xs whitespace-nowrap pointer-events-none transition-opacity shadow-lg" style={{zIndex: 99999}}>
                          <div className="text-center">
                            <div className="font-semibold text-xs">{item.orders}</div>
                          </div>
                          {/* Arrow pointing down */}
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-1 border-r-1 border-t-1 border-transparent border-t-black"></div>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          <LocalDateTime utcDate={item.time_slot} format={activeFilter === "1H" ? "1H" : (activeFilter === "1D" ? "1D" : 'raw')} />
                        </div>
                      </div>
                    );
                  })}
                  {/* Show dots for more data */}
                  {chartData.reads.length > 12 && (
                    <div className="flex items-center gap-1 px-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Filter Buttons */}
              {/* <div className="flex items-center justify-center gap-2 pt-4 border-t border-gray-100">
                {(['1H', '1D', '5D', '1M', '6M', '12M'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => {
                      setReadsFilter(filter === '5D' ? '1W' : filter);
                      loadReadsChart(filter === '5D' ? '1W' : filter);
                    }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      readsFilter === (filter === '5D' ? '1W' : filter)
                        ? 'bg-[#0000FF] text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div> */}
            </div>

            {/* Total Sales Line Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-gray-600">Total Sales</h3>
                  {/* <ChevronDown className="w-4 h-4 text-gray-400" /> */}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  {/* <span>{dashboardData.date_range.start}</span> */}
                  {/* <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded font-medium">LIVE</span> */}
                </div>
              </div>

              {/* Value Display */}
              <div className="mb-6 flex items-baseline gap-2">
                <p className="text-4xl font-bold text-gray-900">$ {salesChartData.reduce((sum: number, item: any) => sum + parseFloat(item.sales || 0), 0).toLocaleString()}</p>
              </div>

              {/* Line Chart */}
              <div className="relative mb-6">
                <div className="h-40 relative group">
                  <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                    {salesChartData.length > 0 ? (
                      <>
                        {/* Generate path from actual data */}
                        <path
                          d={(() => {
                            if (salesChartData.length === 0) return '';
                            const maxValue = Math.max(...salesChartData.map((d: any) => parseFloat(d.sales || 0)), 1);
                            const points = salesChartData.slice(0, 12).map((item: any, i: number) => {
                              const x = (i / Math.max(salesChartData.slice(0, 12).length - 1, 1)) * 100;
                              const y = 35 - ((parseFloat(item.sales || 0) / maxValue) * 30);
                              return `${x},${y}`;
                            });
                            
                            // Create smooth curve using quadratic bezier curves
                            let path = `M ${points[0]}`;
                            for (let i = 0; i < points.length - 1; i++) {
                              const [x1, y1] = points[i].split(',').map(Number);
                              const [x2, y2] = points[i + 1].split(',').map(Number);
                              const cpx = (x1 + x2) / 2;
                              path += ` Q ${cpx},${y1} ${x2},${y2}`;
                            }
                            return path;
                          })()}
                          fill="none"
                          stroke="#0000FF"
                          strokeWidth="0.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        
                        {/* Interactive data points with hover tooltips */}
                        {salesChartData.slice(0, 12).map((item: any, i: number) => {
                          const maxValue = Math.max(...salesChartData.map((d: any) => parseFloat(d.sales || 0)), 1);
                          const x = (i / Math.max(salesChartData.slice(0, 12).length - 1, 1)) * 100;
                          const y = 35 - ((parseFloat(item.sales || 0) / maxValue) * 30);
                          const salesAmount = parseFloat(item.sales || 0);
                          
                          return (
                            <g key={i}>
                              {/* Invisible larger hit area for better hover experience */}
                              {/* <circle
                                cx={x}
                                cy={y}
                                r="12"
                                fill="transparent"
                                className="cursor-pointer"
                                onMouseEnter={() => {
                                  const tooltip = document.getElementById(`tooltip-${i}`);
                                  if (tooltip) tooltip.style.opacity = '1';
                                }}
                                onMouseLeave={() => {
                                  const tooltip = document.getElementById(`tooltip-${i}`);
                                  if (tooltip) tooltip.style.opacity = '0';
                                }}
                              /> */}
                              
                              {/* Visible data point */}
                              <circle
                                cx={x}
                                cy={y}
                                r="2"
                                fill="#0000FF"
                                className="opacity-100 transition-opacity duration-200 cursor-pointer"
                                onMouseEnter={() => {
                                  const tooltip = document.getElementById(`tooltip-${i}`);
                                  if (tooltip) tooltip.style.opacity = '1';
                                }}
                                onMouseLeave={() => {
                                  const tooltip = document.getElementById(`tooltip-${i}`);
                                  if (tooltip) tooltip.style.opacity = '0';
                                }}
                              />
                            </g>
                          );
                        })}
                      </>
                    ) : (
                      // Fallback smooth curve
                      <path
                        d="M 5,30 Q 15,25 25,20 T 45,15 T 65,18 T 85,22 Q 92,24 95,20"
                        fill="none"
                        stroke="#0000FF"
                        strokeWidth="0.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}
                  </svg>
                  
                  {/* HTML Tooltips positioned absolutely */}
                  {salesChartData.slice(0, 12).map((item: any, i: number) => {
                    const maxValue = Math.max(...salesChartData.map((d: any) => parseFloat(d.sales || 0)), 1);
                    const x = (i / Math.max(salesChartData.slice(0, 12).length - 1, 1)) * 100;
                    const y = 35 - ((parseFloat(item.sales || 0) / maxValue) * 30);
                    const salesAmount = parseFloat(item.sales || 0);
                    
                    // Convert SVG coordinates to percentage for absolute positioning
                    const leftPercent = x;
                    const topPercent = (y / 40) * 100;
                    
                    return (
                      <div
                        key={`tooltip-${i}`}
                        id={`tooltip-${i}`}
                        className="absolute opacity-0 transition-opacity duration-200 pointer-events-none"
                        style={{
                          left: `${leftPercent}%`,
                          top: `${topPercent}%`,
                          transform: 'translate(-50%, -100%)',
                          marginTop: '-12px',
                          zIndex: 9999
                        }}
                      >
                        <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
                          <div className="font-semibold text-xs">${salesAmount.toLocaleString()}</div>
                        </div>
                        {/* Arrow pointing down */}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-3 border-r-3 border-t-3 border-transparent border-t-gray-800"></div>
                      </div>
                    );
                  })}
                  
                  {/* Month/Day labels below chart */}
                  <div className="flex justify-between items-center mt-2 px-2">
                    {salesChartData.slice(0, 12).map((item: any, i: number) => {
                      const x = (i / Math.max(salesChartData.slice(0, 12).length - 1, 1)) * 100;
                      return (
                        <div
                          key={`label-${i}`}
                          className="text-xs text-gray-500 text-center"
                          style={{ width: `${100 / Math.min(salesChartData.slice(0, 12).length, 12)}%` }}
                        >
                          <LocalDateTime utcDate={item.time_slot} format={activeFilter === "1H" ? "1H" : (activeFilter === "1D" ? "1D" : 'raw')} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Filter Buttons */}
              {/* <div className="flex items-center justify-center gap-2 pt-4 border-t border-gray-100">
                {(['1H', '1D', '5D', '1M', '6M', '12M'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => {
                      setSalesFilter(filter === '5D' ? '1W' : filter);
                      loadSalesChart(filter === '5D' ? '1W' : filter);
                    }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      salesFilter === (filter === '5D' ? '1W' : filter)
                        ? 'bg-[#0000FF] text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div> */}
            </div>
          </div>

          {/* Sales by Product & Device */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales by Product */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Sales by Product</h3>
              
              <div className="space-y-4">
                {chartData.salesProduct.slice(0, 5).map((product: any, index: number) => {
                  const colors = ['bg-indigo-600', 'bg-purple-500', 'bg-emerald-500', 'bg-cyan-500', 'bg-amber-400'];
                  return (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`} />
                          <span className="text-sm font-medium text-gray-700">{product.name}</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">${parseFloat(product.value).toFixed(2)}</span>
                        </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`${colors[index % colors.length]} h-full rounded-full transition-all duration-500`}
                          style={{ width: `${(parseFloat(product.value) / maxProductValue) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                {chartData.salesProduct.length === 0 && (
                  <p className="text-center text-gray-500 py-4">No product sales data available</p>
                )}
              </div>
            </div>

            {/* Sales by Device */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Sales by Device</h3>
              
              <div className="space-y-4">
                {chartData.salesDevice.slice(0, 5).map((device: any, index: number) => {
                  const colors = ['bg-indigo-700', 'bg-indigo-600', 'bg-indigo-500', 'bg-indigo-400', 'bg-indigo-300'];
                  return (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Monitor className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-700">{device.name}</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">${parseFloat(device.value).toFixed(2)}</span>
                        </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`${colors[index % colors.length]} h-full rounded-full transition-all duration-500`}
                          style={{ width: `${(parseFloat(device.value) / maxDeviceValue) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                {chartData.salesDevice.length === 0 && (
                  <p className="text-center text-gray-500 py-4">No device sales data available</p>
                )}
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
                <p className="text-sm text-gray-500 mt-1">Latest transactions from all devices</p>
              </div>
                    <button 
                      onClick={() => navigate('/orders')}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </button>
                        </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentOrders.map((order: any, index: number) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => order.order_id && navigate(`/orders/view/${order.order_id}`)}
                          className="text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
                        >
                          {order.id}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{order.customer}</div>
                          {order.customer_email && (
                            <div className="text-sm text-gray-500">{order.customer_email}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{order.amount}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getPaymentStatusBadge(order.payment_status)}`}>
                          {getPaymentStatusLabel(order.payment_status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">{order.time}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => order.order_id && navigate(`/orders/view/${order.order_id}`)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                          title="View Order Details"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="hidden sm:inline">View</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {recentOrders.length === 0 && (
                <div className="text-center py-12">
                  <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-lg font-medium">No recent orders</p>
                  <p className="text-gray-400 text-sm mt-1">Orders will appear here once they are created</p>
                      </div>
              )}
            </div>

            {recentOrders.length > 0 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Showing <span className="font-medium">{recentOrders.length}</span> recent orders
                  </p>
                  <button
                    onClick={() => navigate('/orders')}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                  >
                    View All Orders
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
          </>
        )}
      </div>
    </div>
  );
}
