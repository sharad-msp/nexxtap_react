import React, { useState } from 'react';
import { 
  Upload, 
  Download, 
  FileText, 
  BarChart3,
  History,
  Settings
} from 'lucide-react';
import { Card, CardContent, Button, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components';
import { CsvImportModal, ImportHistory } from '@/components/CsvImport';
import { csvImportApi } from '@/api/csvImportApi';
import { useToast } from '@/components/Toast';

const CsvImportPage: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [showCategoryImport, setShowCategoryImport] = useState(false);
  const [showProductImport, setShowProductImport] = useState(false);
  const [importStats, setImportStats] = useState({
    totalImports: 0,
    successfulImports: 0,
    failedImports: 0,
    totalCategories: 0,
    totalProducts: 0
  });

  const handleImportSuccess = (type: 'category' | 'product') => {
    if (type === 'category') {
      setShowCategoryImport(false);
    } else {
      setShowProductImport(false);
    }
    showToast('success', `${type === 'category' ? 'Categories' : 'Products'} imported successfully`);
    // Refresh stats and history
    // In a real app, you might want to fetch updated stats here
  };

  const downloadTemplate = async (type: 'category' | 'product') => {
    try {
      const response = type === 'category' 
        ? await csvImportApi.downloadCategoryTemplate()
        : await csvImportApi.downloadProductTemplate();

      if (response.success) {
        // Create and download CSV file
        const blob = new Blob([response.data.csv_content], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}_template.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        showToast('success', 'Template downloaded successfully');
      }
    } catch (error) {
      console.error('Error downloading template:', error);
      showToast('error', 'Failed to download template');
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">CSV Import Management</h1>
          <p className="text-gray-600 mt-2">
            Import categories and products in bulk using CSV files
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={() => setShowCategoryImport(true)}
            leftIcon={<Upload className="h-4 w-4" />}
            variant="outline"
          >
            Import Categories
          </Button>
          <Button
            onClick={() => setShowProductImport(true)}
            leftIcon={<Upload className="h-4 w-4" />}
            variant="outline"
          >
            Import Products
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Download className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Category Template</h3>
            <p className="text-sm text-gray-600 mb-4">
              Download the CSV template for importing categories
            </p>
            <Button
              onClick={() => downloadTemplate('category')}
              variant="outline"
              size="sm"
              className="w-full"
            >
              Download Template
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Download className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Product Template</h3>
            <p className="text-sm text-gray-600 mb-4">
              Download the CSV template for importing products
            </p>
            <Button
              onClick={() => downloadTemplate('product')}
              variant="outline"
              size="sm"
              className="w-full"
            >
              Download Template
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Import Guidelines</h3>
            <p className="text-sm text-gray-600 mb-4">
              Learn how to format your CSV files correctly
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setActiveTab('guidelines')}
            >
              View Guidelines
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Settings className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Import Settings</h3>
            <p className="text-sm text-gray-600 mb-4">
              Configure import options and preferences
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setActiveTab('settings')}
            >
              Configure
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">Import History</TabsTrigger>
          <TabsTrigger value="guidelines">Guidelines</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Import Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-indigo-50 rounded-lg">
                  <div className="text-2xl font-bold text-indigo-600">{importStats.totalImports}</div>
                  <div className="text-sm text-indigo-600">Total Imports</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{importStats.successfulImports}</div>
                  <div className="text-sm text-green-600">Successful</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{importStats.failedImports}</div>
                  <div className="text-sm text-red-600">Failed</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ImportHistory importType="category" title="Recent Category Imports" />
            <ImportHistory importType="product" title="Recent Product Imports" />
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <ImportHistory importType="all" title="All Import History" />
        </TabsContent>

        <TabsContent value="guidelines" className="space-y-6">
          {/* Important Warning */}
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-orange-600 font-bold text-sm">!</span>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-orange-800 mb-2">Important Import Order</h3>
                  <p className="text-orange-700 text-sm">
                    <strong>Always import categories first, then products.</strong> Products require existing categories 
                    to be imported successfully. If you try to import products before categories exist, the import will fail.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">CSV Import Guidelines</h2>
              
              <div className="space-y-6">
                                 <div>
                   <h3 className="text-lg font-medium text-gray-900 mb-2">Category Import Format</h3>
                   <div className="bg-gray-50 p-4 rounded-lg">
                     <p className="text-sm text-gray-600 mb-2">Required columns:</p>
                     <ul className="text-sm text-gray-600 space-y-1">
                       <li><strong>name</strong> - Category name (required, unique per store)</li>
                     </ul>
                   </div>
                 </div>

                                 <div>
                   <h3 className="text-lg font-medium text-gray-900 mb-2">Product Import Format</h3>
                   <div className="bg-gray-50 p-4 rounded-lg">
                     <p className="text-sm text-gray-600 mb-2">Required columns:</p>
                     <ul className="text-sm text-gray-600 space-y-1">
                       <li><strong>name</strong> - Product name (required, unique per category)</li>
                       <li><strong>category_name</strong> - Existing category name (required, will be converted to ID)</li>
                       <li><strong>base_price</strong> - Product base price (required, numeric)</li>
                       <li><strong>description</strong> - Product description (optional)</li>
                     </ul>
                     <p className="text-sm text-gray-500 mt-2">
                       <strong>Note:</strong> Slug will be auto-generated from the product name
                     </p>
                   </div>
                 </div>

                                 <div>
                   <h3 className="text-lg font-medium text-gray-900 mb-2">Best Practices</h3>
                   <ul className="text-sm text-gray-600 space-y-2">
                     <li>• Always download and use the provided templates</li>
                     <li>• Import categories first, then products</li>
                     <li>• Use exact category names (case-sensitive)</li>
                     <li>• Use consistent formatting for prices (e.g., 4.99, not $4.99)</li>
                     <li>• Test with a small file first</li>
                     <li>• Keep backup of your data before large imports</li>
                   </ul>
                 </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Import Settings</h2>
              <p className="text-gray-600">Import configuration options will be available here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* CSV Import Modals */}
      <CsvImportModal
        isOpen={showCategoryImport}
        onClose={() => setShowCategoryImport(false)}
        onSuccess={() => handleImportSuccess('category')}
        importType="category"
        title="Categories"
      />

      <CsvImportModal
        isOpen={showProductImport}
        onClose={() => setShowProductImport(false)}
        onSuccess={() => handleImportSuccess('product')}
        importType="product"
        title="Products"
      />
    </div>
  );
};

export default CsvImportPage;
