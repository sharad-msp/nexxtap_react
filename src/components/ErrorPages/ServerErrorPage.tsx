import React, { useState, useEffect } from 'react';
import { useServerConnectivity } from '@/hooks/useNetworkStatus';
import { useErrorStore } from '@/store/errorStore';
import { Button } from '@/components/Button';
import { config } from '@/config';

interface ServerErrorPageProps {
  error?: {
    status?: number;
    message?: string;
    endpoint?: string;
  };
  onRetry?: () => void;
  onGoBack?: () => void;
  showRetryButton?: boolean;
  showBackButton?: boolean;
}

export const ServerErrorPage: React.FC<ServerErrorPageProps> = ({
  error,
  onRetry,
  onGoBack,
  showRetryButton = true,
  showBackButton = true,
}) => {
  const { isServerReachable, checkServerConnectivity } = useServerConnectivity();
  const { isServerDown } = useErrorStore();
  const [isRetrying, setIsRetrying] = useState(false);
  const [isCheckingServer, setIsCheckingServer] = useState(false);

  const handleRetry = async () => {
    if (isRetrying) return;
    
    setIsRetrying(true);
    
    try {
      // Check server connectivity first
      setIsCheckingServer(true);
      const serverReachable = await checkServerConnectivity(config.api.baseURL);
      setIsCheckingServer(false);
      
      if (serverReachable && onRetry) {
        onRetry();
      }
    } catch (err) {
      console.error('Error checking server connectivity:', err);
    } finally {
      setIsRetrying(false);
      setIsCheckingServer(false);
    }
  };

  const handleGoBack = () => {
    if (onGoBack) {
      onGoBack();
    } else {
      window.history.back();
    }
  };

  const getErrorIcon = () => {
    const status = error?.status;
    
    if (status === 404) {
      return (
        <div className="w-24 h-24 mx-auto mb-6 bg-indigo-100 rounded-full flex items-center justify-center">
          <svg className="w-12 h-12 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
      );
    }

    if (status === 403) {
      return (
        <div className="w-24 h-24 mx-auto mb-6 bg-orange-100 rounded-full flex items-center justify-center">
          <svg className="w-12 h-12 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 0h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
      );
    }

    return (
      <div className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
        <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
    );
  };

  const getErrorTitle = () => {
    const status = error?.status;
    
    switch (status) {
      case 404:
        return 'Page Not Found';
      case 403:
        return 'Access Denied';
      case 401:
        return 'Authentication Required';
      case 500:
      case 502:
      case 503:
      case 504:
        return 'Server Error';
      default:
        return isServerDown ? 'Server Unavailable' : 'Something Went Wrong';
    }
  };

  const getErrorMessage = () => {
    const status = error?.status;
    
    if (error?.message) {
      return error.message;
    }
    
    switch (status) {
      case 404:
        return "The page you're looking for doesn't exist or has been moved.";
      case 403:
        return "You don't have permission to access this resource.";
      case 401:
        return "Please log in to access this resource.";
      case 500:
        return "Internal server error. Our team has been notified.";
      case 502:
        return "Bad gateway. The server is temporarily unavailable.";
      case 503:
        return "Service unavailable. The server is temporarily overloaded.";
      case 504:
        return "Gateway timeout. The server took too long to respond.";
      default:
        return isServerDown 
          ? "Our servers are currently unavailable. Please try again later."
          : "An unexpected error occurred. Please try again.";
    }
  };

  const getErrorCode = () => {
    if (error?.status) {
      return `Error ${error.status}`;
    }
    return 'Error';
  };

  const shouldShowRetry = () => {
    const status = error?.status;
    // Don't show retry for client errors (4xx) except 408 (timeout)
    if (status && status >= 400 && status < 500 && status !== 408) {
      return false;
    }
    return showRetryButton;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            {getErrorIcon()}
            
            <div className="mb-2">
              <span className="inline-block px-3 py-1 text-xs font-medium text-gray-500 bg-gray-100 rounded-full">
                {getErrorCode()}
              </span>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {getErrorTitle()}
            </h2>
            
            <p className="text-gray-600 mb-6">
              {getErrorMessage()}
            </p>

            {error?.endpoint && (
              <div className="bg-gray-50 border border-gray-200 rounded-md p-3 mb-6">
                <p className="text-xs text-gray-500">
                  <span className="font-medium">Endpoint:</span> {error.endpoint}
                </p>
              </div>
            )}

            {isServerDown && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Server Status
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>Our servers are currently experiencing issues. We're working to resolve this as quickly as possible.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {shouldShowRetry() && (
                <Button
                  onClick={handleRetry}
                  disabled={isRetrying || isCheckingServer}
                  className="w-full"
                  variant="primary"
                >
                  {isRetrying || isCheckingServer ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {isCheckingServer ? 'Checking Server...' : 'Retrying...'}
                    </>
                  ) : (
                    'Try Again'
                  )}
                </Button>
              )}

              {showBackButton && (
                <Button
                  onClick={handleGoBack}
                  variant="secondary"
                  className="w-full"
                >
                  Go Back
                </Button>
              )}

              <Button
                onClick={() => window.location.href = '/'}
                variant="outline"
                className="w-full"
              >
                Go to Dashboard
              </Button>
            </div>

            <div className="mt-6 text-xs text-gray-500">
              <p>Server Status: {isServerReachable ? 'Reachable' : 'Unreachable'}</p>
              <p>Timestamp: {new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
