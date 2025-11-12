import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Percent } from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardContent,
  Form,
  FormInput,
  FormSelect,
  Button
} from '@/components';

import { productDiscountApi } from '@/api';
import { useToast } from '@/components';
import { usePermissions } from '@/hooks/usePermissions';
import { usePageTitle } from '@/hooks/usePageTitle';
import type { ProductDiscount } from '@/types';
import { EditPageSkeleton } from '@/components/Skeleton/EditDetails';

const ProductDiscountEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();
  const { canUpdateSettings } = usePermissions();
  
  usePageTitle({ title: 'Edit Product Discount' });
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [productDiscount, setProductDiscount] = useState<ProductDiscount | null>(null);
  const [discountType, setDiscountType] = useState('percentage');

  useEffect(() => {
    if (id) {
      fetchProductDiscount(parseInt(id));
    }
  }, [id]);

  const fetchProductDiscount = async (discountId: number) => {
    setInitialLoading(true);
    try {
      const response = await productDiscountApi.getById(discountId);
      
      if (response.status === 1) {
        setProductDiscount(response.data);
        setDiscountType(response.data.discount_type);
      } else {
        showToast('error', response.message);
        navigate('/product-discounts');
      }
    } catch (error) {
      console.error('Error fetching product discount:', error);
      showToast('error', 'Failed to fetch product discount details. Please check if the backend server is running.');
      navigate('/product-discounts');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (values: any, setErrors: (errors: Record<string, string>) => void) => {
    if (!id) return;

    setLoading(true);
    try {
      const response = await productDiscountApi.update(parseInt(id), {
        discount_name: values.discount_name,
        discount_type: values.discount_type,
        discount_value: parseFloat(values.discount_value),
        maximum_order_amount: values.maximum_order_amount ? parseFloat(values.maximum_order_amount) : null,
        usage_coupon_limit_for_day: values.usage_coupon_limit_for_day ? parseInt(values.usage_coupon_limit_for_day) : null,
        status: parseInt(values.status) === 1
      });
      
      if (response.status === 1) {
        showToast('success', 'Product discount updated successfully');
        navigate('/product-discounts');
      } else {
        showToast('error', response.message);
      }
    } catch (error: any) {
      console.error('Error updating product discount:', error);
      
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
        showToast('error', errorData.message || 'Failed to update product discount');
      } else {
        showToast('error', error.message || 'Failed to update product discount. Please check if the backend server is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    { value: '1', label: 'Active' },
    { value: '0', label: 'Inactive' },
  ];

  const discountTypeOptions = [
    { value: 'percentage', label: 'Percentage (%)' },
    { value: 'fixed', label: 'Fixed Amount ($)' },
  ];

  if (!canUpdateSettings()) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Percent className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-500">You don't have permission to edit product discounts.</p>
        </div>
      </div>
    );
  }

  if (initialLoading) {
    return (
      <EditPageSkeleton />
    );
  }

  if (!productDiscount) {
    return (
      <div className="text-center py-8">
          <p className="text-gray-600">Product discount not found</p>
        <Button onClick={() => navigate('/product-discounts')} className="mt-4">
          Back to Product Discounts
        </Button>
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
            onClick={() => navigate('/product-discounts')}
            className="text-gray-600 hover:text-gray-900"
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Back to Product Discounts
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
              Edit Product Discount
            </h1>
            <p className="text-gray-600 mt-1">Update the product discount details</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium text-gray-900">Product Discount Information</h2>
          <p className="text-sm text-gray-600">
            Update the discount details below. All fields marked with * are required.
          </p>
        </CardHeader>

        <CardContent>
          <Form
            onSubmit={handleSubmit}
            loading={loading}
            submitText="Update Product Discount"
            showCancel={true}
            onCancel={() => navigate('/product-discounts')}
            initialValues={{
              discount_name: productDiscount.discount_name,
              discount_type: productDiscount.discount_type,
              discount_value: productDiscount.discount_value.toString(),
              maximum_order_amount: productDiscount.maximum_order_amount?.toString() || '',
              usage_coupon_limit_for_day: productDiscount.usage_coupon_limit_for_day?.toString() || '',
              status: productDiscount.status ? '1' : '0',
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                name="discount_name"
                label="Discount Name (Optional)"
                type="text"
                placeholder="Enter discount name (e.g., Summer Sale, Free Shipping)"
              />

              <FormSelect
                name="discount_type"
                label="Discount Type"
                options={discountTypeOptions}
                required
                onChange={(value) => setDiscountType(value)}
              />

              <FormInput
                name="discount_value"
                label="Discount Value"
                type="number"
                step="0.01"
                min="0"
                {...(discountType === 'percentage' ? { max: '100' } : {})}
                required
                placeholder="Enter discount value"
              />

              <FormInput
                name="maximum_order_amount"
                label="Maximum Order Amount (Optional)"
                type="number"
                step="0.01"
                min="0"
                placeholder="Enter maximum order amount"
              />

              <FormInput
                name="usage_coupon_limit_for_day"
                label="Daily Usage Limit (Optional)"
                type="number"
                step="1"
                min="0"
                placeholder="Enter daily usage limit"
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
                <h4 className="text-sm font-medium text-indigo-900 mb-2">Discount Type Information</h4>
                <div className="text-sm text-indigo-800 space-y-1">
                  <p><strong>Percentage:</strong> Discount is calculated as a percentage of the order total</p>
                  <p><strong>Fixed Amount:</strong> Discount is a fixed dollar amount off the order total</p>
                </div>
              </div>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductDiscountEdit;
