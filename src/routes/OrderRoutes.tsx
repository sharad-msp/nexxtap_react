import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Import order pages
import OrderList from '@/pages/orders/OrderList';
import OrderView from '@/pages/orders/OrderView';

export const OrderRoutes: React.FC = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute
            requiredPermissions={['order_list']}
            fallbackPath="/dashboard"
          >
            <OrderList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/view/:id"
        element={
          <ProtectedRoute
            requiredPermissions={['order_view']}
            fallbackPath="/orders"
          >
            <OrderView />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};
