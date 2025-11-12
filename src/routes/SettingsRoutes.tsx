import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { usePermissions } from '@/hooks/usePermissions';

// Import settings pages
import SettingsGeneral from '@/pages/settings/SettingsGeneral';
import SettingsStore from '@/pages/settings/SettingsStore';
import SettingsPayment from '@/pages/settings/SettingsPayment';
import SettingsNotification from '@/pages/settings/SettingsNotification';

export const SettingsRoutes: React.FC = () => {
  const { canViewSettings, canUpdateSettings } = usePermissions();

  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute
            canAccess={canViewSettings()}
            fallbackPath="/dashboard"
          >
            <SettingsGeneral />
          </ProtectedRoute>
        }
      />
      <Route
        path="/store"
        element={
          <ProtectedRoute
            canAccess={canViewSettings()}
            fallbackPath="/settings"
          >
            <SettingsStore />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payment"
        element={
          <ProtectedRoute
            canAccess={canViewSettings()}
            fallbackPath="/settings"
          >
            <SettingsPayment />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute
            canAccess={canViewSettings()}
            fallbackPath="/settings"
          >
            <SettingsNotification />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};
