import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { categoryApi } from '@/api/categoryApi';
import { formatDate } from '@/utils/formatDate';
import { Card, CardContent, CardHeader } from '@/components/Card';
import { Button } from '@/components/Button';
import { usePermissions } from '@/hooks/usePermissions';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useToast } from '@/components/Toast';
import { ArrowLeft, Edit, Trash2, Tag, Calendar, ToggleLeft } from 'lucide-react';
import type { Category } from '@/types/category.types';
import { ViewDetailsSkeleton } from '@/components/Skeleton/ViewDetails';

const CategoryView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { canViewCategories, canUpdateCategories, canDeleteCategories } = usePermissions();
  const { showToast } = useToast();
  
  usePageTitle({ title: 'View Category' });

  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  // Check permissions
  if (!canViewCategories()) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Access Denied</p>
        <Button onClick={() => navigate('/categories')} className="mt-4">
          Back to Categories
        </Button>
      </div>
    );
  }

  useEffect(() => {
    if (id) {
      fetchCategory();
    }
  }, [id]);

  const fetchCategory = async () => {
    try {
      const response = await categoryApi.getById(parseInt(id!));
      if (response.status === 1 && response.data) {
        setCategory(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching category:', error);
      const errorMessage = error.response?.data?.message || 'Failed to fetch category details';
      showToast('error', errorMessage);
      navigate('/categories');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/categories/edit/${id}`);
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete the category "${category?.name}" permanently?`)) {
      try {
        await categoryApi.delete(parseInt(id!));
        showToast('success', 'Category deleted successfully');
        navigate('/categories');
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Failed to delete category';
        showToast('error', errorMessage);
      }
    }
  };

  if (loading) {
    return (
      <ViewDetailsSkeleton />
    );
  }

  if (!category) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Category not found</p>
        <Button onClick={() => navigate('/categories')} className="mt-4">
          Back to Categories
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
            variant="outline"
            onClick={() => navigate('/categories')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{category.name}</h1>
            <p className="text-gray-600">Category details and attributes</p>
          </div>
        </div>
        <div className="flex space-x-3">
          {canUpdateCategories() && (
            <Button
              onClick={handleEdit}
              className="flex items-center space-x-2"
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </Button>
          )}
          {canDeleteCategories() && (
            <Button
              variant="danger"
              onClick={handleDelete}
              className="flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </Button>
          )}
        </div>
      </div>

      {/* Category Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Information */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Category Information</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category Name
                  </label>
                  <div className="flex items-center space-x-2">
                    <Tag className="h-5 w-5 text-gray-400" />
                    <span className="text-lg font-medium text-gray-900">{category.name}</span>
                  </div>
                </div>

                {category.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <p className="text-gray-600">{category.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <div className="flex items-center space-x-2">
                      <ToggleLeft className="h-5 w-5 text-gray-400" />
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        category.status 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {category.status ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Created Date
                    </label>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-600">
                        {formatDate(category.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Attributes */}
        <div>
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Variants & Add-ons</h2>
            </CardHeader>
            <CardContent>
              {category.options && category.options.length > 0 ? (
                <div className="space-y-3">
                  {category.options.map((attribute) => (
                    <div key={attribute.id} className="p-3 border rounded-lg bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{attribute.name}</span>
                        {attribute.allow_multiple && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            Multiple
                          </span>
                        )}
                      </div>
                      {attribute.options && attribute.options.length > 0 && (
                        <div className="mt-2 pl-2 border-l-2 border-indigo-200">
                          <div className="text-xs font-medium text-gray-500 mb-1">Options:</div>
                          <div className="space-y-1">
                            {attribute.options.map((option) => (
                              <div key={option.id} className="flex items-center justify-between text-sm">
                                <span className="text-gray-700">{option.value}</span>
                                <div className="flex items-center space-x-2">
                                  {option.price_modifier !== 0 && (
                                    <span className={`text-xs font-medium ${
                                      option.price_modifier > 0 ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                      {option.price_modifier > 0 ? '+' : ''}{option.price_modifier}
                                    </span>
                                  )}
                                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs ${
                                    option.status ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                  }`}>
                                    {option.status ? '●' : '○'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Tag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p>No variants or add-ons defined</p>
                  <p className="text-sm">This category doesn't have any variants yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Category Statistics</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">
                {category.options?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Variants</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {category.options?.reduce((total, attr) => total + (attr.options?.length || 0), 0) || 0}
              </div>
              <div className="text-sm text-gray-600">Total Options</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {category.status ? 'Active' : 'Inactive'}
              </div>
              <div className="text-sm text-gray-600">Status</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatDate(category.updated_at)}
              </div>
              <div className="text-sm text-gray-600">Last Updated</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoryView;
