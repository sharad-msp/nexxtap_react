import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { attributeApi } from '@/api/attributeApi';
import { Card, CardContent, CardHeader } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { SelectField } from '@/components/SelectField';
import { usePermissions } from '@/hooks/usePermissions';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useToast } from '@/components/Toast';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import type { UpdateAttributeRequest, Attribute, AttributeOption } from '@/types/attribute.types';
import { EditPageSkeleton } from '@/components/Skeleton/EditDetails';

const AttributeEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { canUpdateAttributes } = usePermissions();
  const { showToast } = useToast();
  
  usePageTitle({ title: 'Edit Attribute' });

  const [attribute, setAttribute] = useState<Attribute | null>(null);
  const [formData, setFormData] = useState<UpdateAttributeRequest>({
    name: '',
    status: true,
    allow_multiple: false,
    display_order: 0
  });

  const [options, setOptions] = useState<AttributeOption[]>([]);
  const [deletedOptionIds, setDeletedOptionIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  if (!canUpdateAttributes()) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Access Denied</h3>
          <p className="text-gray-500">You don't have permission to update attributes.</p>
        </div>
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
        const attrData = response.data;
        setAttribute(attrData);
        setFormData({
          name: attrData.name,
          status: attrData.status,
          allow_multiple: attrData.allow_multiple,
          display_order: attrData.display_order || 0
        });
        setOptions(attrData.options || []);
      }
    } catch (error: any) {
      console.error('Error fetching attribute:', error);
      const errorMessage = error.response?.data?.message || 'Failed to fetch attribute details';
      showToast('error', errorMessage);
      navigate('/attributes');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (field: keyof UpdateAttributeRequest, value: string | boolean | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addOption = () => {
    const newOption: AttributeOption = {
      value: '',
      price_modifier: 0,
      display_order: options.length,
      status: 1
    };
    setOptions(prev => [...prev, newOption]);
  };

  const updateOption = (index: number, field: keyof AttributeOption, value: string | number | boolean) => {
    setOptions(prev => prev.map((opt, i) => {
      if (i === index) {
        return { ...opt, [field]: value };
      }
      return opt;
    }));
  };

  const removeOption = (index: number) => {
    const option = options[index];
    if (option.id) {
      setDeletedOptionIds(prev => [...prev, option.id!]);
    }
    setOptions(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name?.trim()) {
      showToast('error', 'Attribute name is required');
      return;
    }

    const invalidOption = options.find(opt => opt.value.trim() === '');
    if (invalidOption) {
      showToast('error', 'All options must have a value');
      return;
    }

    setLoading(true);
    try {
      const attributeData: UpdateAttributeRequest = {
        name: formData.name,
        status: formData.status,
        allow_multiple: formData.allow_multiple,
        display_order: formData.display_order,
        options: options.filter(opt => opt.value.trim()).map((opt, idx) => ({
          id: opt.id,
          value: opt.value,
          price_modifier: opt.price_modifier || 0,
          display_order: idx,
          status: opt.status ? 1 : 0
        })),
        deleted_option_ids: deletedOptionIds
      };

      await attributeApi.update(parseInt(id!), attributeData);
      showToast('success', 'Attribute updated successfully');
      navigate('/attributes');
    } catch (error: any) {
      console.error('Error updating attribute:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update attribute';
      showToast('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <EditPageSkeleton />;
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
            <h1 className="text-2xl font-bold text-gray-900">Edit Attribute</h1>
            <p className="text-gray-600">Update attribute information and options</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Attribute Information</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attribute Name *
                </label>
                <Input
                  value={formData.name || ''}
                  onChange={(value) => handleInputChange('name', value)}
                  placeholder="e.g., Size, Color"
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

              <div className="flex items-center space-x-4 pt-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.allow_multiple || false}
                    onChange={(e) => handleInputChange('allow_multiple', e.target.checked)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Allow Multiple</span>
                </label>
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Options</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Manage preset options
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addOption}
                  className="flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Option</span>
                </Button>
              </div>

              {options.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <p className="text-gray-600 font-medium">No options yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {options.map((option, optIndex) => (
                    <div key={option.id || optIndex} className="grid grid-cols-12 gap-3 items-start p-3 bg-white border rounded">
                      <div className="col-span-12 md:col-span-5">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Value *</label>
                        <Input
                          value={option.value}
                          onChange={(value) => updateOption(optIndex, 'value', value)}
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
                          onChange={(value) => updateOption(optIndex, 'price_modifier', parseFloat(value) || 0)}
                          placeholder="0.00"
                        />
                      </div>

                      <div className="col-span-6 md:col-span-3 flex items-end">
                        <label className="flex items-center h-10">
                          <input
                            type="checkbox"
                            checked={!!option.status}
                            onChange={(e) => updateOption(optIndex, 'status', e.target.checked ? 1 : 0)}
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
                          onClick={() => removeOption(optIndex)}
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

            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/attributes')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={loading}
              >
                Update Attribute
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttributeEdit;

