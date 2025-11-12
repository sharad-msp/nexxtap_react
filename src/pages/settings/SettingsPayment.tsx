import React from 'react';
import { Card, CardHeader, CardContent } from '@/components';

const SettingsPayment: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Payment Settings</h1>
        <p className="text-gray-600 mt-1">Configure payment methods and settings</p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Payment Configuration</h2>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-gray-500">Payment settings functionality coming soon...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPayment;
