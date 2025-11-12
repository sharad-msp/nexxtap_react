import { useState, useEffect } from 'react';

interface NetworkStatus {
  isOnline: boolean;
  isSlowConnection: boolean;
  connectionType: string;
  effectiveType: string;
}

export const useNetworkStatus = () => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    isSlowConnection: false,
    connectionType: 'unknown',
    effectiveType: 'unknown',
  });

  useEffect(() => {
    const updateNetworkStatus = () => {
      const connection = (navigator as any).connection || 
                        (navigator as any).mozConnection || 
                        (navigator as any).webkitConnection;

      const isSlowConnection = connection ? 
        (connection.effectiveType === 'slow-2g' || 
         connection.effectiveType === '2g' ||
         connection.downlink < 1.5) : false;

      setNetworkStatus({
        isOnline: navigator.onLine,
        isSlowConnection,
        connectionType: connection?.type || 'unknown',
        effectiveType: connection?.effectiveType || 'unknown',
      });
    };

    const handleOnline = () => {
      updateNetworkStatus();
      // Dispatch custom event for other components to listen
      window.dispatchEvent(new CustomEvent('network:online'));
    };

    const handleOffline = () => {
      updateNetworkStatus();
      // Dispatch custom event for other components to listen
      window.dispatchEvent(new CustomEvent('network:offline'));
    };

    const handleConnectionChange = () => {
      updateNetworkStatus();
    };

    // Initial status
    updateNetworkStatus();

    // Event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;

    if (connection) {
      connection.addEventListener('change', handleConnectionChange);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if (connection) {
        connection.removeEventListener('change', handleConnectionChange);
      }
    };
  }, []);

  return networkStatus;
};

// Hook for checking server connectivity
export const useServerConnectivity = () => {
  const [isServerReachable, setIsServerReachable] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkServerConnectivity = async (baseURL: string): Promise<boolean> => {
    try {
      // Use a simple HEAD request to check server availability
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(`${baseURL}/health`, {
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-cache',
      });

      clearTimeout(timeoutId);
      const isReachable = response.ok || response.status < 500;
      setIsServerReachable(isReachable);
      setLastChecked(new Date());
      return isReachable;
    } catch (error) {
      setIsServerReachable(false);
      setLastChecked(new Date());
      return false;
    }
  };

  return {
    isServerReachable,
    lastChecked,
    checkServerConnectivity,
  };
};
