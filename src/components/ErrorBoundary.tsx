import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ServerErrorPage } from '@/components/ErrorPages/ServerErrorPage';
import { OfflinePage } from '@/components/ErrorPages/OfflinePage';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isNetworkError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isNetworkError: false,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Check if it's a network-related error
    const isNetworkError = 
      error.message.includes('Network Error') ||
      error.message.includes('fetch') ||
      error.message.includes('ERR_NETWORK') ||
      error.message.includes('ERR_INTERNET_DISCONNECTED') ||
      !navigator.onLine;

    return {
      hasError: true,
      error,
      errorInfo: null,
      isNetworkError,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // In production, you might want to send this to an error reporting service
    // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      isNetworkError: false,
    });
  };

  render() {
    if (this.state.hasError) {
      // If a custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Show appropriate error page based on error type
      if (this.state.isNetworkError || !navigator.onLine) {
        return (
          <OfflinePage
            onRetry={this.handleRetry}
            showRetryButton={true}
          />
        );
      }

      // For other errors, show server error page
      return (
        <ServerErrorPage
          error={{
            message: this.state.error?.message || 'An unexpected error occurred',
          }}
          onRetry={this.handleRetry}
          showRetryButton={true}
          showBackButton={false}
        />
      );
    }

    return this.props.children;
  }
}

// Higher-order component for wrapping components with error boundary
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

// Hook-based error boundary for functional components
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return {
    captureError,
    resetError,
    hasError: !!error,
  };
};

// Component for handling async errors in functional components
interface AsyncErrorBoundaryProps {
  children: ReactNode;
  onError?: (error: Error) => void;
  fallback?: (error: Error, retry: () => void) => ReactNode;
}

export const AsyncErrorBoundary: React.FC<AsyncErrorBoundaryProps> = ({
  children,
  onError,
  fallback,
}) => {
  const [asyncError, setAsyncError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setAsyncError(null);
  }, []);

  React.useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
      setAsyncError(error);
      
      if (onError) {
        onError(error);
      }
      
      // Prevent the default browser behavior
      event.preventDefault();
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [onError]);

  if (asyncError) {
    if (fallback) {
      return <>{fallback(asyncError, resetError)}</>;
    }

    // Check if it's a network error
    const isNetworkError = 
      asyncError.message.includes('Network Error') ||
      asyncError.message.includes('fetch') ||
      asyncError.message.includes('ERR_NETWORK') ||
      !navigator.onLine;

    if (isNetworkError) {
      return (
        <OfflinePage
          onRetry={resetError}
          showRetryButton={true}
        />
      );
    }

    return (
      <ServerErrorPage
        error={{
          message: asyncError.message || 'An unexpected error occurred',
        }}
        onRetry={resetError}
        showRetryButton={true}
        showBackButton={false}
      />
    );
  }

  return <>{children}</>;
};
