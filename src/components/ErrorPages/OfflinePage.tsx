import React, { useState, useEffect } from 'react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { Button } from '@/components/Button';

interface OfflinePageProps {
  onRetry?: () => void;
  showRetryButton?: boolean;
}

export const OfflinePage: React.FC<OfflinePageProps> = ({ 
  onRetry, 
  showRetryButton = true 
}) => {
  const { isOnline, isSlowConnection, effectiveType } = useNetworkStatus();
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    if (isRetrying) return;
    
    setIsRetrying(true);
    
    // Wait a moment to check network status
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (isOnline && onRetry) {
      onRetry();
    }
    
    setIsRetrying(false);
  };

  const getConnectionMessage = () => {
    if (!isOnline) {
      return "You're currently offline. Please check your internet connection.";
    }
    
    if (isSlowConnection) {
      return `You have a slow connection (${effectiveType}). Some features may not work properly.`;
    }
    
    return "Connection restored! You can now use the application.";
  };

  const getConnectionIcon = () => {
    if (!isOnline) {
      return (
        <div className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-12.728 12.728m0-12.728l12.728 12.728M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" />
          </svg>
        </div>
      );
    }

    if (isSlowConnection) {
      return (
        <div className="w-24 h-24 mx-auto mb-6 bg-yellow-100 rounded-full flex items-center justify-center">
          <svg className="w-12 h-12 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
      );
    }

    return (
      <div className="w-24 h-24 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
        <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            {getConnectionIcon()}
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {!isOnline ? 'No Internet Connection' : 
               isSlowConnection ? 'Slow Connection' : 'Connection Restored'}
            </h2>
            
            <p className="text-gray-600 mb-6">
              {getConnectionMessage()}
            </p>

            {!isOnline && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-md p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-indigo-800">
                      Troubleshooting Tips
                    </h3>
                    <div className="mt-2 text-sm text-indigo-700">
                      <ul className="list-disc list-inside space-y-1">
                        <li>Check your WiFi or mobile data connection</li>
                        <li>Try moving to a location with better signal</li>
                        <li>Restart your router or modem</li>
                        <li>Contact your internet service provider if the issue persists</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {showRetryButton && (
              <div className="space-y-3">
                <Button
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className="w-full"
                  variant="primary"
                >
                  {isRetrying ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Checking Connection...
                    </>
                  ) : (
                    'Try Again'
                  )}
                </Button>

                <Button
                  onClick={() => window.location.reload()}
                  variant="secondary"
                  className="w-full"
                >
                  Refresh Page
                </Button>
              </div>
            )}

            <div className="mt-6 text-xs text-gray-500">
              <p>Connection Status: {isOnline ? 'Online' : 'Offline'}</p>
              {effectiveType !== 'unknown' && (
                <p>Network Type: {effectiveType}</p>
              )}
              <p>Last checked: {new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
