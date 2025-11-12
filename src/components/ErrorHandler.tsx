import React, { useEffect, useState } from 'react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useErrorStore, classifyError } from '@/store/errorStore';
import { useToast } from '@/components/Toast';
import { OfflinePage } from '@/components/ErrorPages/OfflinePage';
import { ServerErrorPage } from '@/components/ErrorPages/ServerErrorPage';

interface ErrorHandlerProps {
  children: React.ReactNode;
}

export const ErrorHandler: React.FC<ErrorHandlerProps> = ({ children }) => {
  const { isOnline } = useNetworkStatus();
  const { 
    addError, 
    setOfflineStatus, 
    setServerStatus, 
    updateLastServerCheck,
    isOffline,
    isServerDown 
  } = useErrorStore();
  const { showToast } = useToast();
  
  const [showOfflinePage, setShowOfflinePage] = useState(false);
  const [showServerErrorPage, setShowServerErrorPage] = useState(false);
  const [serverError, setServerError] = useState<any>(null);

  // Handle network status changes
  useEffect(() => {
    setOfflineStatus(!isOnline);
    
    if (!isOnline) {
      setShowOfflinePage(true);
      showToast('warning', 'You are now offline');
    } else {
      setShowOfflinePage(false);
      if (isOffline) {
        showToast('success', 'Connection restored');
      }
    }
  }, [isOnline, isOffline, setOfflineStatus, showToast]);

  // Listen to API events
  useEffect(() => {
    const handleApiError = (event: CustomEvent) => {
      const { error, status, endpoint } = event.detail;
      
      // Classify and add error to store
      const errorClassification = classifyError(error);
      const errorId = addError({
        ...errorClassification,
        status,
        endpoint,
      });

      // Handle specific error types
      if (error.type === 'network' && !isOnline) {
        setShowOfflinePage(true);
      } else if (error.type === 'server' && status >= 500) {
        setServerError({ status, message: error.message, endpoint });
        setShowServerErrorPage(true);
        setServerStatus(true);
      }
    };

    const handleApiSuccess = (event: CustomEvent) => {
      // Reset server status on successful API call
      if (isServerDown) {
        setServerStatus(false);
        setShowServerErrorPage(false);
        setServerError(null);
        showToast('success', 'Server connection restored');
      }
      updateLastServerCheck();
    };

    const handleNetworkOffline = () => {
      setShowOfflinePage(true);
      setOfflineStatus(true);
    };

    const handleNetworkOnline = () => {
      setShowOfflinePage(false);
      setOfflineStatus(false);
    };

    const handleServerUnreachable = () => {
      setServerStatus(true);
      setShowServerErrorPage(true);
      setServerError({
        status: 0,
        message: 'Server is unreachable',
        endpoint: 'Unknown',
      });
    };

    const handleServerError = (event: CustomEvent) => {
      const { status, endpoint } = event.detail;
      setServerStatus(true);
      setShowServerErrorPage(true);
      setServerError({
        status,
        message: `Server error (${status})`,
        endpoint,
      });
    };

    const handleAuthUnauthorized = () => {
      showToast('error', 'Session expired. Please log in again.');
    };

    // Add event listeners
    window.addEventListener('api:error', handleApiError as EventListener);
    window.addEventListener('api:success', handleApiSuccess as EventListener);
    window.addEventListener('network:offline', handleNetworkOffline);
    window.addEventListener('network:online', handleNetworkOnline);
    window.addEventListener('server:unreachable', handleServerUnreachable);
    window.addEventListener('server:error', handleServerError as EventListener);
    window.addEventListener('auth:unauthorized', handleAuthUnauthorized);

    return () => {
      window.removeEventListener('api:error', handleApiError as EventListener);
      window.removeEventListener('api:success', handleApiSuccess as EventListener);
      window.removeEventListener('network:offline', handleNetworkOffline);
      window.removeEventListener('network:online', handleNetworkOnline);
      window.removeEventListener('server:unreachable', handleServerUnreachable);
      window.removeEventListener('server:error', handleServerError as EventListener);
      window.removeEventListener('auth:unauthorized', handleAuthUnauthorized);
    };
  }, [
    addError,
    setOfflineStatus,
    setServerStatus,
    updateLastServerCheck,
    isOnline,
    isServerDown,
    showToast,
  ]);

  // Handle retry functionality
  const handleRetryFromOffline = () => {
    if (isOnline) {
      setShowOfflinePage(false);
      window.location.reload();
    }
  };

  const handleRetryFromServerError = () => {
    setShowServerErrorPage(false);
    setServerError(null);
    setServerStatus(false);
    window.location.reload();
  };

  // Show appropriate error page
  if (showOfflinePage && !isOnline) {
    return (
      <OfflinePage
        onRetry={handleRetryFromOffline}
        showRetryButton={true}
      />
    );
  }

  if (showServerErrorPage && serverError) {
    return (
      <ServerErrorPage
        error={serverError}
        onRetry={handleRetryFromServerError}
        showRetryButton={true}
        showBackButton={false}
      />
    );
  }

  return <>{children}</>;
};
