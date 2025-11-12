import React from 'react';
import { Card, CardHeader, CardContent } from '@/components';

const CustomerReport: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Customer Report</h1>
        <p className="text-gray-600 mt-1">Analyze customer behavior and demographics</p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Customer Analytics</h2>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-gray-500">Customer report functionality coming soon...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerReport;
