import React from 'react';
import { Card, CardHeader, CardContent } from '@/components';
import PrinterManagement from '@/components/PrinterManagement';
import { useAuth } from '@/hooks/useAuth';

const SettingsStore: React.FC = () => {
  const { user } = useAuth();
  const isStoreAdmin = user?.is_store_admin || false;
  const storeId = user?.store_id;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Store Settings</h1>
        <p className="text-gray-600 mt-1">Configure store-specific settings</p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Printer Management</h2>
          <p className="text-sm text-gray-600 mt-1">
            {isStoreAdmin 
              ? 'View and manage printer status. Add and configure printers from POS.' 
              : 'Add and manage printers for your store. Set default printers for easy selection.'
            }
          </p>
        </CardHeader>
        <CardContent>
          <PrinterManagement 
            storeId={storeId} 
            isStoreAdmin={isStoreAdmin} 
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsStore;
