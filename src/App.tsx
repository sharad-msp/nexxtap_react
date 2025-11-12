import React from 'react';
import { AppRoutes } from '@/routes/AppRoutes';
import { ToastProvider } from '@/components';
import { ErrorBoundary, AsyncErrorBoundary } from '@/components/ErrorBoundary';
import { ErrorHandler } from '@/components/ErrorHandler';
function App() {
  return (
    <ErrorBoundary>
      <AsyncErrorBoundary>
        <ToastProvider>
          <ErrorHandler>
            <AppRoutes />
          </ErrorHandler>
        </ToastProvider>
      </AsyncErrorBoundary>
    </ErrorBoundary>
  );
}

export default App;
