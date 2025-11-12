import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { attributeApi } from '@/api/attributeApi';
import { formatDate } from '@/utils/formatDate';
import { Card, CardContent, CardHeader } from '@/components/Card';
import { Button } from '@/components/Button';
import { usePermissions } from '@/hooks/usePermissions';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useToast } from '@/components/Toast';
import { ArrowLeft, Edit, Trash2, Settings2, ToggleLeft } from 'lucide-react';
import type { Attribute } from '@/types/attribute.types';
import { ViewDetailsSkeleton } from '@/components/Skeleton/ViewDetails';

const AttributeView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { canViewAttributes, canUpdateAttributes, canDeleteAttributes } = usePermissions();
  const { showToast } = useToast();
  
  usePageTitle({ title: 'View Attribute' });

  const [attribute, setAttribute] = useState<Attribute | null>(null);
  const [loading, setLoading] = useState(true);

  if (!canViewAttributes()) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Access Denied</p>
        <Button onClick={() => navigate('/attributes')} className="mt-4">
          Back to Attributes
        </Button>
      </div>
    );
  }

  useEffect(() => {
    if (id) {
      fetchAttribute();
    }
  }, [id]);

  const fetchAttribute = async () => {
    try {
      const response = await attributeApi.getDetails(parseInt(id!));
      if (response.status === 1 && response.data) {
        setAttribute(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching attribute:', error);
      const errorMessage = error.response?.data?.message || 'Failed to fetch attribute details';
      showToast('error', errorMessage);
      navigate('/attributes');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/attributes/edit/${id}`);
  };

  if (loading) {
    return <ViewDetailsSkeleton />;
  }

  if (!attribute) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Attribute not found</p>
        <Button onClick={() => navigate('/attributes')} className="mt-4">
          Back to Attributes
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate('/attributes')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">View Attribute</h1>
            <p className="text-gray-600">Attribute details and options</p>
          </div>
        </div>
        <div className="flex space-x-3">
          {canUpdateAttributes() && (
            <Button onClick={handleEdit} leftIcon={<Edit className="w-4 h-4" />}>
              Edit
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Settings2 className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{attribute.name}</h2>
              <p className="text-sm text-gray-500">Attribute Information</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Name</label>
              <p className="text-gray-900">{attribute.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
              <p className="text-gray-900">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  attribute.status ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {attribute.status ? 'Active' : 'Inactive'}
                </span>
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Allow Multiple</label>
              <p className="text-gray-900">{attribute.allow_multiple ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Created</label>
              <p className="text-gray-900">{formatDate(attribute.created_at)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {attribute.options && attribute.options.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Options</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {attribute.options.map((option, index) => (
                <div key={option.id || index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{option.value}</p>
                    <p className="text-sm text-gray-500">
                      Price modifier: {option.price_modifier >= 0 ? '+' : ''}{option.price_modifier}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    option.status ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {option.status ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AttributeView;

