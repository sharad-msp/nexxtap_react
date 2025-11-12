import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import type { Tax } from '@/types';
import { EditPageSkeleton } from '@/components/Skeleton/EditDetails';

const TaxEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();
  const { canUpdateSettings } = usePermissions();
  
  usePageTitle({ title: 'Edit Tax' });
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [tax, setTax] = useState<Tax | null>(null);

  useEffect(() => {
    if (id) {
      fetchTax(parseInt(id));
    }
  }, [id]);

  const fetchTax = async (taxId: number) => {
    setInitialLoading(true);
    try {
      const response = await taxApi.getById(taxId);
      
      if (response.status === 1) {
        setTax(response.data);
      } else {
        showToast('error', response.message);
        navigate('/taxes');
      }
    } catch (error) {
      console.error('Error fetching tax:', error);
      showToast('error', 'Failed to fetch tax details. Please check if the backend server is running.');
      navigate('/taxes');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (values: any, setErrors: (errors: Record<string, string>) => void) => {
    if (!id) return;

    setLoading(true);
    try {
      const response = await taxApi.update(parseInt(id), {
        name: values.name,
        rate: parseFloat(values.rate),
        status: parseInt(values.status),
        is_excluded: parseInt(values.is_excluded)
      });
      
      if (response.status === 1) {
        showToast('success', 'Tax updated successfully');
        navigate('/taxes');
      } else {
        showToast('error', response.message);
      }
    } catch (error: any) {
      console.error('Error updating tax:', error);
      
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
        showToast('error', errorData.message || 'Failed to update tax');
      } else {
        showToast('error', error.message || 'Failed to update tax');
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
    { value: '1', label: 'Excluded (Tax not included in price)' },
    { value: '2', label: 'Included (Tax included in price)' },
  ];

  if (!canUpdateSettings()) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-500">You don't have permission to edit taxes.</p>
        </div>
      </div>
    );
  }

  if (initialLoading) {
    return (
      <EditPageSkeleton />
    );
  }

  if (!tax) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Tax not found</p>
        <Button onClick={() => navigate('/taxes')} className="mt-4">
          Back to Taxes
        </Button>
      </div>
    );
  }

  if (!tax) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tax Not Found</h3>
          <p className="text-gray-500 mb-4">The tax you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/taxes')}>
            Back to Taxes
          </Button>
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
              Edit Tax
            </h1>
            <p className="text-gray-600 mt-1">Update tax information for "{tax.name}"</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium text-gray-900">Tax Information</h2>
          <p className="text-sm text-gray-600">
            Update the tax details below. All fields marked with * are required.
          </p>
        </CardHeader>

        <CardContent>
          <Form
            onSubmit={handleSubmit}
            loading={loading}
            submitText="Update Tax"
            showCancel={true}
            onCancel={() => navigate('/taxes')}
            initialValues={{
              name: tax.name,
              rate: tax.rate.toString(),
              status: tax.status ? '1' : '0',
              is_excluded: tax.is_excluded.toString(),
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

export default TaxEdit;
