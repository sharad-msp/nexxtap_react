import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { categoryApi } from '@/api/categoryApi';
import { Card, CardContent, CardHeader } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { SelectField } from '@/components/SelectField';
import { usePermissions } from '@/hooks/usePermissions';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useToast } from '@/components/Toast';
import { ArrowLeft, Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import type { UpdateCategoryRequest, Category, CategoryAttribute, CategoryAttributeOption } from '@/types/category.types';
import { EditPageSkeleton } from '@/components/Skeleton/EditDetails';
import { StandardDropdown } from '@/components';
import { Attribute } from '@/types/attribute.types';
import { attributeApi } from '@/api/attributeApi';

const CategoryEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { canUpdateCategories } = usePermissions();
  const { showToast } = useToast();
  
  usePageTitle({ title: 'Edit Category' });

  const [category, setCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<UpdateCategoryRequest>({
    name: '',
    status: true
  });

  const [attributes, setAttributes] = useState<CategoryAttribute[]>([]);
  const [deletedAttributeIds, setDeletedAttributeIds] = useState<number[]>([]);
  const [deletedOptionIds, setDeletedOptionIds] = useState<number[]>([]);
  const [expandedAttributes, setExpandedAttributes] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [presetAttributes, setPresetAttributes] = useState<Attribute[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');

  // Check permissions
  if (!canUpdateCategories()) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Access Denied</h3>
          <p className="text-gray-500">You don't have permission to update categories.</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (id) {
      fetchCategory();
      fetchPresets();
    }
  }, [id]);
  const fetchPresets = async () => {
    try {
      const res = await attributeApi.getActiveWithOptions();
      const items = (res as any).data || res;
      setPresetAttributes(Array.isArray(items) ? items : (items?.data || []));
    } catch (e) {
      // Fail silently; presets are optional
      setPresetAttributes([]);
    }
  };
  const fetchCategory = async () => {
    try {
      const response = await categoryApi.getDetails(parseInt(id!));
      if (response.status === 1 && response.data) {
        const categoryData = response.data;
        setCategory(categoryData);
        setFormData({
          name: categoryData.name,
          status: categoryData.status
        });
        
        // Load attributes with their options, expanding those with options
        const attrs = categoryData.category_attributes || [];
        setAttributes(attrs);
        
        // Auto-expand attributes that have options
        const expanded = new Set<number>();
        attrs.forEach(attr => {
          if (attr.id && attr.options && attr.options.length > 0) {
            expanded.add(attr.id);
          }
        });
        setExpandedAttributes(expanded);
      }
    } catch (error: any) {
      console.error('Error fetching category:', error);
      const errorMessage = error.response?.data?.message || 'Failed to fetch category details';
      showToast('error', errorMessage);
      navigate('/categories');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (field: keyof UpdateCategoryRequest, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addAttribute = () => {
    const tempId = Date.now();
    const newAttribute: CategoryAttribute = {
      id: tempId,
      name: '',
      allow_multiple: false,
      status: 1,
      options: []
    };
    setAttributes(prev => [...prev, newAttribute]);
    setExpandedAttributes(prev => new Set([...prev, tempId]));
  };

  const updateAttribute = (index: number, field: keyof CategoryAttribute, value: string | boolean | number) => {
    setAttributes(prev => prev.map((attr, i) => 
      i === index ? { ...attr, [field]: value } : attr
    ));
  };

  const removeAttribute = (index: number) => {
    const attr = attributes[index];
    
    // If it has a real ID (not a temp ID), mark for deletion
    if (attr.id && attr.id < Date.now() - 1000000) {
      setDeletedAttributeIds(prev => [...prev, attr.id!]);
      
      // Also mark all its options for deletion
      if (attr.options) {
        const optionIds = attr.options.filter(opt => opt.id).map(opt => opt.id!);
        setDeletedOptionIds(prev => [...prev, ...optionIds]);
      }
    }
    
    setAttributes(prev => prev.filter((_, i) => i !== index));
    
    if (attr.id) {
      setExpandedAttributes(prev => {
        const newSet = new Set(prev);
        newSet.delete(attr.id!);
        return newSet;
      });
    }
  };

  const toggleAttributeExpand = (attrId: number) => {
    setExpandedAttributes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(attrId)) {
        newSet.delete(attrId);
      } else {
        newSet.add(attrId);
      }
      return newSet;
    });
  };

  const addOption = (attributeIndex: number) => {
    const newOption: CategoryAttributeOption = {
      value: '',
      price_modifier: 0,
      display_order: attributes[attributeIndex].options?.length || 0,
      status: 1
    };
    
    setAttributes(prev => prev.map((attr, i) => {
      if (i === attributeIndex) {
        return {
          ...attr,
          options: [...(attr.options || []), newOption]
        };
      }
      return attr;
    }));
  };

  const updateOption = (
    attributeIndex: number, 
    optionIndex: number, 
    field: keyof CategoryAttributeOption, 
    value: string | number | boolean
  ) => {
    setAttributes(prev => prev.map((attr, attrIdx) => {
      if (attrIdx === attributeIndex) {
        const updatedOptions = [...(attr.options || [])];
        updatedOptions[optionIndex] = {
          ...updatedOptions[optionIndex],
          [field]: value
        };
        return { ...attr, options: updatedOptions };
      }
      return attr;
    }));
  };

  const removeOption = (attributeIndex: number, optionIndex: number) => {
    const option = attributes[attributeIndex].options?.[optionIndex];
    
    // If it has an ID, mark for deletion
    if (option?.id) {
      setDeletedOptionIds(prev => [...prev, option.id!]);
    }
    
    setAttributes(prev => prev.map((attr, attrIdx) => {
      if (attrIdx === attributeIndex) {
        return {
          ...attr,
          options: attr.options?.filter((_, optIdx) => optIdx !== optionIndex)
        };
      }
      return attr;
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name?.trim()) {
      showToast('error', 'Category name is required');
      return;
    }

    // Validate attributes have names
    const invalidAttribute = attributes.find(attr => attr.name.trim() === '');
    if (invalidAttribute) {
      showToast('error', 'All attributes must have a name');
      return;
    }

    // Validate options have values
    for (const attr of attributes) {
      if (attr.options && attr.options.length > 0) {
        const invalidOption = attr.options.find(opt => opt.value.trim() === '');
        if (invalidOption) {
          showToast('error', `All options in "${attr.name}" must have a value`);
          return;
        }
      }
    }

    setLoading(true);
    try {
      const categoryData: UpdateCategoryRequest = {
        ...formData,
        attributes: attributes.filter(attr => attr.name.trim()).map(attr => {
          const isNew = !attr.id || attr.id > Date.now() - 1000000;
          
          return {
            ...(isNew ? {} : { id: attr.id }), // Include ID only for existing attributes
            name: attr.name,
            allow_multiple: attr.allow_multiple,
            status: attr.status ?? 1,
            attribute_options: (attr.options || []).filter(opt => opt.value.trim()).map((opt, idx) => {
              const isNewOption = !opt.id;
              
              return {
                ...(isNewOption ? {} : { id: opt.id }), // Include ID only for existing options
                value: opt.value,
                price_modifier: opt.price_modifier,
                display_order: idx,
                status: opt.status ? 1 : 0
              };
            })
          };
        }),
        deleted_ids: deletedAttributeIds,
        deleted_option_ids: deletedOptionIds
      };

      await categoryApi.update(parseInt(id!), categoryData);
      showToast('success', 'Category updated successfully');
      navigate('/categories');
    } catch (error: any) {
      console.error('Error updating category:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update category';
      showToast('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <EditPageSkeleton />
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
            <h1 className="text-2xl font-bold text-gray-900">Edit Category</h1>
            <p className="text-gray-600">Update category information, variants, and options</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Category Information</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name *
                </label>
                <Input
                  value={formData.name || ''}
                  onChange={(value) => handleInputChange('name', value)}
                  placeholder="Enter category name"
                  required
                />
              </div>
              
              <div>
                <SelectField
                  label="Status"
                  value={formData.status ? '1' : '0'}
                  onChange={(value) => handleInputChange('status', value === '1')}
                  options={[
                    { value: '1', label: 'Active' },
                    { value: '0', label: 'Inactive' }
                  ]}
                />
              </div>
            </div>

            {/* Attributes Section */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Variants & Add-ons</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Manage variants (Size, Color) or add-ons (Extras, Toppings) with preset options and prices
                  </p>
                </div>
                {presetAttributes.length > 0 && (
                    <div className="w-56">
                      <StandardDropdown
                        value={selectedPresetId}
                        onChange={(val) => {
                          setSelectedPresetId('');
                          const preset = presetAttributes.find(a => String(a.id) === val);
                          if (preset) {
                            const tempId = Date.now();
                            const newAttribute: CategoryAttribute = {
                              id: tempId,
                              name: preset.name,
                              allow_multiple: !!preset.allow_multiple,
                              status: 1,
                              options: (preset.options || []).map((opt, idx) => ({
                                value: opt.value,
                                price_modifier: opt.price_modifier || 0,
                                display_order: opt.display_order ?? idx,
                                status: opt.status ? 1 : 0
                              }))
                            } as unknown as CategoryAttribute;
                            setAttributes(prev => [...prev, newAttribute]);
                            setExpandedAttributes(prev => new Set([...prev, tempId]));
                          }
                        }}
                        options={[{ value: '', label: 'Add from presets...' }, ...presetAttributes.map(a => ({ value: String(a.id), label: a.name }))]}
                        placeholder="Add from presets..."
                        size="md"
                      />
                    </div>
                  )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addAttribute}
                  className="flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Variant/Add-on</span>
                </Button>
              </div>

              {attributes.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <p className="text-gray-600 font-medium">No variants or add-ons yet</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Click "Add Variant/Add-on" to create options like sizes or toppings
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {attributes.map((attribute, attrIndex) => {
                    const isExpanded = attribute.id ? expandedAttributes.has(attribute.id) : false;
                    
                    return (
                      <div key={attribute.id || attrIndex} className="border rounded-lg overflow-hidden">
                        {/* Attribute Header */}
                        <div className="bg-gray-50 p-4">
                          <div className="flex items-center space-x-4">
                            <button
                              type="button"
                              onClick={() => attribute.id && toggleAttributeExpand(attribute.id)}
                              className="flex-shrink-0"
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-5 h-5 text-gray-600" />
                              ) : (
                                <ChevronRight className="w-5 h-5 text-gray-600" />
                              )}
                            </button>
                            
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                              <div>
                                <Input
                                  value={attribute.name}
                                  onChange={(value) => updateAttribute(attrIndex, 'name', value)}
                                  placeholder="e.g., Size, Toppings"
                                  required
                                />
                              </div>
                              
                              <div className="flex items-center space-x-4">
                                <label className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={attribute.allow_multiple}
                                    onChange={(e) => updateAttribute(attrIndex, 'allow_multiple', e.target.checked)}
                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                  />
                                  <span className="ml-2 text-sm text-gray-700">Is add-ons?</span>
                                </label>
                              </div>

                              <div className="flex items-center space-x-4">
                                <label className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={!!attribute.status}
                                    onChange={(e) => updateAttribute(attrIndex, 'status', e.target.checked ? 1 : 0)}
                                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                  />
                                  <span className="ml-2 text-sm text-gray-700">Active</span>
                                </label>
                              </div>

                              <div className="flex items-center justify-end space-x-2">
                                <span className="text-sm text-gray-500">
                                  {attribute.options?.length || 0} option(s)
                                </span>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeAttribute(attrIndex)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Options Section */}
                        {isExpanded && (
                          <div className="p-4 space-y-4">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-700">
                                Preset Options (e.g., Small, Medium, Large)
                              </p>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => addOption(attrIndex)}
                                className="flex items-center space-x-1"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Add Option</span>
                              </Button>
                            </div>

                            {(!attribute.options || attribute.options.length === 0) ? (
                              <div className="text-center py-6 bg-gray-50 rounded border border-dashed border-gray-300">
                                <p className="text-sm text-gray-500">No options added yet</p>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {attribute.options.map((option, optIndex) => (
                                  <div key={optIndex} className="grid grid-cols-12 gap-3 items-start p-3 bg-white border rounded">
                                    <div className="col-span-12 md:col-span-5">
                                      <label className="block text-xs font-medium text-gray-600 mb-1">Value *</label>
                                      <Input
                                        value={option.value}
                                        onChange={(value) => updateOption(attrIndex, optIndex, 'value', value)}
                                        placeholder="e.g., Small"
                                        required
                                      />
                                    </div>
                                    
                                    <div className="col-span-6 md:col-span-3">
                                      <label className="block text-xs font-medium text-gray-600 mb-1">Price +/-</label>
                                      <Input
                                        type="number"
                                        step="0.01"
                                        value={option.price_modifier.toString()}
                                        onChange={(value) => updateOption(attrIndex, optIndex, 'price_modifier', parseFloat(value) || 0)}
                                        placeholder="0.00"
                                      />
                                    </div>

                                    <div className="col-span-6 md:col-span-3 flex items-end">
                                      <label className="flex items-center h-10">
                                        <input
                                          type="checkbox"
                                          checked={!!option.status}
                                          onChange={(e) => updateOption(attrIndex, optIndex, 'status', e.target.checked ? 1 : 0)}
                                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="ml-2 text-xs text-gray-700">Active</span>
                                      </label>
                                    </div>

                                    <div className="col-span-12 md:col-span-1 flex items-end justify-end">
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => removeOption(attrIndex, optIndex)}
                                        className="text-red-600 hover:text-red-700 h-10"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Deletion Info */}
            {(deletedAttributeIds.length > 0 || deletedOptionIds.length > 0) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Pending Deletions:</strong>
                  {deletedAttributeIds.length > 0 && ` ${deletedAttributeIds.length} attribute(s)`}
                  {deletedAttributeIds.length > 0 && deletedOptionIds.length > 0 && ' and'}
                  {deletedOptionIds.length > 0 && ` ${deletedOptionIds.length} option(s)`}
                  {' '}will be removed when you save.
                </p>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/categories')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={loading}
              >
                Update Category
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoryEdit;
