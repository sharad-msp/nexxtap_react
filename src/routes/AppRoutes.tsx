import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import { ProductRoutes } from '@/routes/ProductRoutes';
import { CategoryRoutes } from '@/routes/CategoryRoutes';
import { AttributeRoutes } from '@/routes/AttributeRoutes';
import { TaxRoutes } from '@/routes/TaxRoutes';
import { ProductDiscountRoutes } from '@/routes/ProductDiscountRoutes';
import StoreRoutes from '@/routes/StoreRoutes';
import UserRoutes from '@/routes/UserRoutes';
import RoleRoutes from '@/routes/RoleRoutes';

import { OrderRoutes } from '@/routes/OrderRoutes';
import { ReportRoutes } from '@/routes/ReportRoutes';
import { SettingsRoutes } from '@/routes/SettingsRoutes';
import PrintTemplateRoutes from '@/routes/PrintTemplateRoutes';
import { useAuth } from '@/hooks/useAuth';
import {
  ProtectedRoute,
  StoreManagementRoute,
  UserManagementRoute,
  ProductManagementRoute,
  CategoryManagementRoute,
  RoleManagementRoute,
  SystemAdminOnlyRoute,
} from '@/components';
import PrinterList from '@/pages/printers/PrinterList';
import PrinterView from '@/pages/printers/PrinterView';

export const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        {/* Store Management - System Admin Only */}
        <Route path="stores/*" element={
          <StoreManagementRoute>
            <StoreRoutes />
          </StoreManagementRoute>
        } />
        
        {/* User Management - Available to users with user permissions */}
        <Route path="users/*" element={
          <UserManagementRoute>
            <UserRoutes />
          </UserManagementRoute>
        } />
        
        {/* Role Management - Available to users with role permissions */}
        <Route path="roles/*" element={
          <RoleManagementRoute>
            <RoleRoutes />
          </RoleManagementRoute>
        } />
        
        {/* Product Management - Store Admin Only (System Admin redirected to dashboard) */}
        <Route path="products/*" element={
          <SystemAdminOnlyRoute>
            <ProductManagementRoute>
              <ProductRoutes />
            </ProductManagementRoute>
          </SystemAdminOnlyRoute>
        } />
        
        {/* Category Management - Available to users with category permissions */}
        <Route path="categories/*" element={
          <CategoryManagementRoute>
            <CategoryRoutes />
          </CategoryManagementRoute>
        } />
        
        {/* Attribute Management - Available to users with attribute permissions */}
        <Route path="attributes/*" element={
          <ProtectedRoute requiredPermissions={['attribute_view', 'attribute_list']}>
            <AttributeRoutes />
          </ProtectedRoute>
        } />
        
        {/* Tax Management - Store Admin Only (System Admin redirected to dashboard) */}
        <Route path="taxes/*" element={
          <SystemAdminOnlyRoute>
            <ProtectedRoute requiredPermissions={['tax_view', 'tax_list']}>
              <TaxRoutes />
            </ProtectedRoute>
          </SystemAdminOnlyRoute>
        } />
        
        {/* Product Discount Management - Store Admin Only (System Admin redirected to dashboard) */}
        <Route path="product-discounts/*" element={
          <SystemAdminOnlyRoute>
            <ProtectedRoute requiredPermissions={['discount_view', 'discount_list']}>
              <ProductDiscountRoutes />
            </ProtectedRoute>
          </SystemAdminOnlyRoute>
        } />
        
        {/* Order Management - Available to both System Admin and Store Admin */}
        <Route path="orders/*" element={
          <ProtectedRoute requiredPermissions={['order_view', 'order_list']}>
            <OrderRoutes />
          </ProtectedRoute>
        } />
        
        
        {/* Reports - System Admin Only */}
        <Route path="reports/*" element={
          <ProtectedRoute requiredPermissions={['report_view']}>
            <ReportRoutes />
          </ProtectedRoute>
        } />
        
        {/* Settings - System Admin Only */}
        <Route path="settings/*" element={
          <ProtectedRoute requiredPermissions={['settings_view']}>
            <SettingsRoutes />
          </ProtectedRoute>
        } />
        
        {/* Print Templates - System Admin Only */}
        <Route path="print-templates/*" element={
          <ProtectedRoute requiredPermissions={['managePrintTemplates']}>
            <PrintTemplateRoutes />
          </ProtectedRoute>
        } />
        
        {/* Printer Management - Store Admin Only */}
        <Route path="printers" element={
            <ProtectedRoute requiredPermissions={['settings_view']}>
              <PrinterList />
            </ProtectedRoute>
        } />
        <Route path="printers/view/:id" element={
            <ProtectedRoute requiredPermissions={['settings_view']}>
              <PrinterView />
            </ProtectedRoute>
        } />
        
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
};
