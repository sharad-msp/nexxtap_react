import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Calculator } from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardContent,
  Button,
  Modal
} from '@/components';
import { LoadingCard } from '@/components/LoadingSpinner';
import { taxApi } from '@/api';
import { formatDateTime } from '@/utils/formatDate';
import { useToast } from '@/components';
import { usePermissions } from '@/hooks/usePermissions';
import { usePageTitle } from '@/hooks/usePageTitle';
import type { Tax } from '@/types';
import { ViewDetailsSkeleton } from '@/components/Skeleton/ViewDetails';

const TaxView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();
  const { canViewTaxes, canUpdateTaxes } = usePermissions();
  
  usePageTitle({ title: 'View Tax' });
  
  const [loading, setLoading] = useState(true);
  const [tax, setTax] = useState<Tax | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTax(parseInt(id));
    }
  }, [id]);

  const fetchTax = async (taxId: number) => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!tax) return;

    try {
      const response = await taxApi.delete(tax.id);
      if (response.status === 1) {
        showToast('success', 'Tax deleted successfully');
        navigate('/taxes');
      } else {
        showToast('error', response.message);
      }
    } catch (error) {
      console.error('Error deleting tax:', error);
      showToast('error', 'Failed to delete tax');
    } finally {
      setShowDeleteModal(false);
    }
  };

  if (!canViewTaxes()) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-500">You don't have permission to view tax details.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <ViewDetailsSkeleton />
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
              <Calculator className="w-6 h-6" />
              Tax Details
            </h1>
            <p className="text-gray-600 mt-1">View tax information for "{tax.name}"</p>
          </div>
        </div>

        {canUpdateTaxes() && (
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => navigate(`/taxes/edit/${tax.id}`)}
              leftIcon={<Edit className="h-4 w-4" />}
            >
              Edit Tax
            </Button>
            <Button
              variant="danger"
              onClick={() => setShowDeleteModal(true)}
              leftIcon={<Trash2 className="h-4 w-4" />}
            >
              Delete Tax
            </Button>
          </div>
        )}
      </div>

      {/* Tax Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Tax Information</h2>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tax Name
                  </label>
                  <p className="text-lg text-gray-900">{tax.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tax Rate
                  </label>
                  <p className="text-lg text-gray-900">{tax.formatted_rate}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tax Type
                  </label>
                  <p className="text-lg text-gray-900">{tax.tax_type_text}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      tax.status
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {tax.status_text}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status & Metadata */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-gray-900">Status</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Status
                  </label>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      tax.status
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {tax.status_text}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Created At
                  </label>
                  <p className="text-sm text-gray-900">
                    {formatDateTime(tax.created_at)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Updated
                  </label>
                  <p className="text-sm text-gray-900">
                    {formatDateTime(tax.updated_at)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tax Type Information */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium text-gray-900">Tax Type Information</h3>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">
              {tax.is_excluded === 1 ? (
                <>
                  <strong>Tax Excluded:</strong> This tax is not included in the product price. 
                  It will be added to the total at checkout.
                </>
              ) : (
                <>
                  <strong>Tax Included:</strong> This tax is already included in the product price. 
                  No additional tax will be added at checkout.
                </>
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Tax"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete the tax "{tax.name}"? This action cannot be undone.
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

export default TaxView;
