import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { usePermissions } from '@/hooks/usePermissions';

// Import report pages
import ReportDashboard from '@/pages/reports/ReportDashboard';
import SalesReport from '@/pages/reports/SalesReport';
import ProductReport from '@/pages/reports/ProductReport';
import CustomerReport from '@/pages/reports/CustomerReport';

export const ReportRoutes: React.FC = () => {
  const { canViewReports, canExportReports } = usePermissions();

  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute
            canAccess={canViewReports()}
            fallbackPath="/dashboard"
          >
            <ReportDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales"
        element={
          <ProtectedRoute
            canAccess={canViewReports()}
            fallbackPath="/reports"
          >
            <SalesReport />
          </ProtectedRoute>
        }
      />
      <Route
        path="/products"
        element={
          <ProtectedRoute
            canAccess={canViewReports()}
            fallbackPath="/reports"
          >
            <ProductReport />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customers"
        element={
          <ProtectedRoute
            canAccess={canViewReports()}
            fallbackPath="/reports"
          >
            <CustomerReport />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};
