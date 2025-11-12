import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Percent } from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardContent,
  Button,
  Modal
} from '@/components';
import { LoadingCard } from '@/components/LoadingSpinner';
import { productDiscountApi } from '@/api';
import { formatDateTime } from '@/utils/formatDate';
import { useToast } from '@/components';
import { usePermissions } from '@/hooks/usePermissions';
import { usePageTitle } from '@/hooks/usePageTitle';
import type { ProductDiscount } from '@/types';
import { ViewDetailsSkeleton } from '@/components/Skeleton/ViewDetails';

const ProductDiscountView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();
  const { canViewDiscounts, canUpdateDiscounts } = usePermissions();
  
  usePageTitle({ title: 'View Product Discount' });
  
  const [loading, setLoading] = useState(true);
  const [productDiscount, setProductDiscount] = useState<ProductDiscount | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Helper function to safely format maximum order amount
  const formatMaximumOrderAmount = (amount: any): string => {
    if (!amount) return 'No limit';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount) || typeof numAmount !== 'number') return 'No limit';
    return `$${numAmount.toFixed(2)}`;
  };

  // Helper function to safely format usage limit
  const formatUsageLimit = (limit: any): string => {
    if (!limit) return 'No limit';
    const numLimit = typeof limit === 'string' ? parseInt(limit) : limit;
    if (isNaN(numLimit) || typeof numLimit !== 'number') return 'No limit';
    return `${numLimit} times per day`;
  };

  useEffect(() => {
    if (id) {
      fetchProductDiscount(parseInt(id));
    }
  }, [id]);

  const fetchProductDiscount = async (discountId: number) => {
    setLoading(true);
    try {
      const response = await productDiscountApi.getById(discountId);
      
      if (response.status === 1) {
        setProductDiscount(response.data);
      } else {
        showToast('error', response.message);
        navigate('/product-discounts');
      }
    } catch (error) {
      console.error('Error fetching product discount:', error);
      showToast('error', 'Failed to fetch product discount details. Please check if the backend server is running.');
      navigate('/product-discounts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!productDiscount) return;

    try {
      const response = await productDiscountApi.delete(productDiscount.id);
      if (response.status === 1) {
        showToast('success', 'Product discount deleted successfully');
        navigate('/product-discounts');
      } else {
        showToast('error', response.message);
      }
    } catch (error) {
      console.error('Error deleting product discount:', error);
      showToast('error', 'Failed to delete product discount');
    } finally {
      setShowDeleteModal(false);
    }
  };

  if (!canViewDiscounts()) {
    return (
      <div className="text-center py-8">
        <div className="text-center">
          <Percent className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-500">You don't have permission to view product discount details.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <ViewDetailsSkeleton />
    );
  }

  if (!productDiscount) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Percent className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Product Discount Not Found</h3>
          <p className="text-gray-500">The product discount you're looking for doesn't exist.</p>
          <Button
            onClick={() => navigate('/product-discounts')}
            className="mt-4"
          >
            Back to Product Discounts
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
            onClick={() => navigate('/product-discounts')}
            className="text-gray-600 hover:text-gray-900"
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Back to Product Discounts
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
              <Percent className="w-6 h-6" />
              Product Discount Details
            </h1>
            <p className="text-gray-600 mt-1">View product discount information</p>
          </div>
        </div>
        {canUpdateDiscounts() && (
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/product-discounts/edit/${productDiscount.id}`)}
              leftIcon={<Edit className="h-4 w-4" />}
            >
              Edit
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowDeleteModal(true)}
              leftIcon={<Trash2 className="h-4 w-4" />}
            >
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Product Discount Details */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium text-gray-900">Product Discount Information</h2>
          <p className="text-sm text-gray-600">Complete details about this product discount</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Basic Information</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">Discount Name</label>
                <p className="mt-1 text-sm text-gray-900">{productDiscount.discount_name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">Discount Type</label>
                <p className="mt-1 text-sm text-gray-900">{productDiscount.discount_type_text}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">Discount Value</label>
                <div className="mt-1 flex items-center">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {productDiscount.formatted_discount_value}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">Status</label>
                <div className="mt-1">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      productDiscount.status
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {productDiscount.status ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Additional Information</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">Maximum Order Amount</label>
                <div className="mt-1 flex items-center">
                  {productDiscount.maximum_order_amount ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      {formatMaximumOrderAmount(productDiscount.maximum_order_amount)}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-500">No limit</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">Daily Usage Limit</label>
                <div className="mt-1 flex items-center">
                  {productDiscount.usage_coupon_limit_for_day ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      {formatUsageLimit(productDiscount.usage_coupon_limit_for_day)}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-500">No limit</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">Store ID</label>
                <p className="mt-1 text-sm text-gray-900">{productDiscount.store_id}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">Created At</label>
                <p className="mt-1 text-sm text-gray-900">
                  {formatDateTime(productDiscount.created_at)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">Last Updated</label>
                <p className="mt-1 text-sm text-gray-900">
                  {formatDateTime(productDiscount.updated_at)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Product Discount"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete <strong>{productDiscount.discount_name}</strong>? 
            This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProductDiscountView;
