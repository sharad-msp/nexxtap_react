import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calculator } from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardContent,
  Form,
  FormInput,
  FormSelect,
  Button
} from '@/components';
import { taxApi } from '@/api';
import { useToast } from '@/components';
import { usePermissions } from '@/hooks/usePermissions';
import { usePageTitle } from '@/hooks/usePageTitle';


const TaxAdd: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { canUpdateSettings } = usePermissions();
  const [loading, setLoading] = useState(false);
  
  usePageTitle({ title: 'Add Tax' });

  const handleSubmit = async (values: any, setErrors: (errors: Record<string, string>) => void) => {
    setLoading(true);
    try {
      const response = await taxApi.create({
        name: values.name,
        rate: parseFloat(values.rate),
        status: parseInt(values.status),
        is_excluded: parseInt(values.is_excluded)
      });
      
      if (response.status === 1) {
        showToast('success', 'Tax created successfully');
        navigate('/taxes');
      } else {
        showToast('error', response.message);
      }
    } catch (error: any) {
      console.error('Error creating tax:', error);
      
      // Handle API error response format
      if (error.response?.data) {
        const errorData = error.response.data;
        
        if (errorData.errors && typeof errorData.errors === 'object') {
          // Convert array errors to single string
          const formattedErrors: Record<string, string> = {};
          Object.keys(errorData.errors).forEach(key => {
            const errorArray = errorData.errors[key];
            if (Array.isArray(errorArray) && errorArray.length > 0) {
              formattedErrors[key] = errorArray[0];
            } else if (typeof errorArray === 'string') {
              formattedErrors[key] = errorArray;
            }
          });
          
          // Set form errors
          if (Object.keys(formattedErrors).length > 0) {
            setErrors(formattedErrors);
            return;
          }
        }
        
        // Show general error message
        showToast('error', errorData.message || 'Failed to create tax');
      } else {
        showToast('error', error.message || 'Failed to create tax. Please check if the backend server is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    { value: '1', label: 'Active' },
    { value: '0', label: 'Inactive' },
  ];

  const taxTypeOptions = [
    { value: '0', label: 'Select Tax Type' },
    { value: '1', label: 'Excluded (Tax not included in price)' },
    { value: '2', label: 'Included (Tax included in price)' },
  ];

  if (!canUpdateSettings()) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-500">You don't have permission to create taxes.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/taxes')}
            className="text-gray-600 hover:text-gray-900"
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Back to Taxes
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
              Add New Tax
            </h1>
            <p className="text-gray-600 mt-1">Create a new tax for your store</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium text-gray-900">Tax Information</h2>
          <p className="text-sm text-gray-600">
            Enter the tax details below. All fields marked with * are required.
          </p>
        </CardHeader>

        <CardContent>
          <Form
            onSubmit={handleSubmit}
            loading={loading}
            submitText="Create Tax"
            showCancel={true}
            onCancel={() => navigate('/taxes')}
            initialValues={{
              name: '',
              rate: '',
              status: '1',
              is_excluded: '0',
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                name="name"
                label="Tax Name"
                type="text"
                required
                placeholder="Enter tax name (e.g., VAT, GST, Sales Tax)"
              />

              <FormInput
                name="rate"
                label="Tax Rate (%)"
                type="number"
                step="0.01"
                min="0"
                max="100"
                required
                placeholder="Enter tax rate"
              />

              <FormSelect
                name="is_excluded"
                label="Tax Type"
                options={taxTypeOptions}
                required
              />

              <FormSelect
                name="status"
                label="Status"
                options={statusOptions}
                required
              />
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="bg-indigo-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-indigo-900 mb-2">Tax Type Information</h4>
                <div className="text-sm text-indigo-800 space-y-1">
                  <p><strong>Excluded:</strong> Tax is added to the product price at checkout</p>
                  <p><strong>Included:</strong> Tax is already included in the product price</p>
                </div>
              </div>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaxAdd;
