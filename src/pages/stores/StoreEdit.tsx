import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Store } from 'lucide-react';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Card, CardContent, CardHeader, useToast} from '@/components';
import { storeApi } from '@/api';
import { validateRequired, validateEmail, validatePhoneNumber } from '@/utils/validators';
import Swal from 'sweetalert2';
import { usePageTitle } from '@/hooks/usePageTitle';
import { EditPageSkeleton } from '@/components/Skeleton/EditDetails';

const StoreEdit: React.FC = () => {
  const { showToast } = useToast();

  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [formData, setFormData] = useState({
    store_name: '',
    store_address: '',
    city: '',
    state: '',
    contact_number: '',
    contact_email: '',
    business_type: '',
    store_hours_from: '',
    store_hours_to: '',
    tax_registration_number: '',
    min_preparation_time: '',
    max_preparation_time: '',
    status: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  usePageTitle({ title: 'Edit Store' });

  useEffect(() => {
    const fetchStoreData = async () => {
      if (!id) return;

      try {
        setIsLoadingData(true);
        const response = await storeApi.getById(parseInt(id));
        
        if (response.status == 1) {
          const store = response.data;
          setFormData({
            store_name: store.name || '',
            store_address: store.address || '',
            city: store.city || '',
            state: store.state || '',
            contact_number: store.phone || '',
            contact_email: store.email || '',
            business_type: store.business_type || '',
            store_hours_from: store.store_hours_from || '',
            store_hours_to: store.store_hours_to || '',
            tax_registration_number: store.tax_registration_number || '',
            min_preparation_time: store.min_preparation_time?.toString() || '',
            max_preparation_time: store.max_preparation_time?.toString() || '',
            status: store.status,
          });
        } else {
          throw new Error(response.message);
        }
      } catch (error: any) {
        console.error('Error fetching store:', error);
        Swal.fire('Error', error.message || 'Failed to load store data', 'error');
        navigate('/stores');
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchStoreData();
  }, [id, navigate]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!validateRequired(formData.store_name)) {
      newErrors.store_name = 'Store name is required';
    }

    if (!validateRequired(formData.store_address)) {
      newErrors.store_address = 'Store address is required';
    }

    if (!validateRequired(formData.city)) {
      newErrors.city = 'City is required';
    }

    if (!validateRequired(formData.state)) {
      newErrors.state = 'State is required';
    }

    if (!validateRequired(formData.contact_number)) {
      newErrors.contact_number = 'Contact number is required';
    } else if (!validatePhoneNumber(formData.contact_number)) {
      newErrors.contact_number = 'Please enter a valid phone number';
    }

    if (!validateRequired(formData.contact_email)) {
      newErrors.contact_email = 'Contact email is required';
    } else if (!validateEmail(formData.contact_email)) {
      newErrors.contact_email = 'Please enter a valid email address';
    }

    if (!validateRequired(formData.business_type)) {
      newErrors.business_type = 'Business type is required';
    }

    if (!validateRequired(formData.store_hours_from)) {
      newErrors.store_hours_from = 'Store hours from is required';
    }

    if (!validateRequired(formData.store_hours_to)) {
      newErrors.store_hours_to = 'Store hours to is required';
    }

    if (!validateRequired(formData.min_preparation_time)) {
      newErrors.min_preparation_time = 'Minimum preparation time is required';
    } else if (isNaN(Number(formData.min_preparation_time)) || Number(formData.min_preparation_time) < 1) {
      newErrors.min_preparation_time = 'Minimum preparation time must be a positive number';
    }

    if (!validateRequired(formData.max_preparation_time)) {
      newErrors.max_preparation_time = 'Maximum preparation time is required';
    } else if (isNaN(Number(formData.max_preparation_time)) || Number(formData.max_preparation_time) < 1) {
      newErrors.max_preparation_time = 'Maximum preparation time must be a positive number';
    } else if (Number(formData.max_preparation_time) < Number(formData.min_preparation_time)) {
      newErrors.max_preparation_time = 'Maximum preparation time must be greater than or equal to minimum preparation time';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !id) {
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        store_name: formData.store_name,
        store_address: formData.store_address,
        city: formData.city,
        state: formData.state,
        contact_number: formData.contact_number,
        contact_email: formData.contact_email,
        business_type: formData.business_type,
        store_hours_from: formData.store_hours_from,
        store_hours_to: formData.store_hours_to,
        tax_registration_number: formData.tax_registration_number || '',
        min_preparation_time: formData.min_preparation_time ? Number(formData.min_preparation_time) : undefined,
        max_preparation_time: formData.max_preparation_time ? Number(formData.max_preparation_time) : undefined,
        status: formData.status,
      };

      const response = await storeApi.update(parseInt(id), payload);
      
      if (response.status == 1) {
        showToast('success', 'Store updated successfully');
        navigate('/stores');
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      console.error('Error updating store:', error);
      Swal.fire('Error', error.message || 'Failed to update store', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <EditPageSkeleton />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/stores')}
            className="text-gray-600 hover:text-gray-900"
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Back to Stores
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
              Edit Store
            </h1>
            <p className="text-gray-600 mt-1">Update the store details</p>
          </div>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Store className="w-5 h-5 text-indigo-500" />
              <h2 className="text-lg font-semibold">Store Information</h2>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Store Name"
                value={formData.store_name}
                onChange={(value) => handleInputChange('store_name', value)}
                error={errors.store_name}
                required
                placeholder="Enter store name"
              />

              <Input
                label="Business Type"
                value={formData.business_type}
                onChange={(value) => handleInputChange('business_type', value)}
                error={errors.business_type}
                required
                placeholder="e.g., Restaurant, Retail, etc."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Contact Number"
                value={formData.contact_number}
                onChange={(value) => handleInputChange('contact_number', value)}
                error={errors.contact_number}
                required
                placeholder="Enter contact number"
              />

              <Input
                label="Contact Email"
                type="email"
                value={formData.contact_email}
                onChange={(value) => handleInputChange('contact_email', value)}
                error={errors.contact_email}
                required
                placeholder="Enter contact email"
              />
            </div>

            <Input
              label="Store Address"
              value={formData.store_address}
              onChange={(value) => handleInputChange('store_address', value)}
              error={errors.store_address}
              required
              placeholder="Enter complete store address"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="City"
                value={formData.city}
                onChange={(value) => handleInputChange('city', value)}
                error={errors.city}
                required
                placeholder="Enter city"
              />

              <Input
                label="State"
                value={formData.state}
                onChange={(value) => handleInputChange('state', value)}
                error={errors.state}
                required
                placeholder="Enter state"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input
                label="Store Hours From"
                type="time"
                value={formData.store_hours_from}
                onChange={(value) => handleInputChange('store_hours_from', value)}
                error={errors.store_hours_from}
                required
              />

              <Input
                label="Store Hours To"
                type="time"
                value={formData.store_hours_to}
                onChange={(value) => handleInputChange('store_hours_to', value)}
                error={errors.store_hours_to}
                required
              />

              <Input
                label="Tax Registration Number"
                value={formData.tax_registration_number}
                onChange={(value) => handleInputChange('tax_registration_number', value)}
                error={errors.tax_registration_number}
                placeholder="Optional"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Min Preparation Time (minutes)"
                type="number"
                value={formData.min_preparation_time}
                onChange={(value) => handleInputChange('min_preparation_time', value)}
                error={errors.min_preparation_time}
                required
                placeholder="Enter minimum preparation time"
                helperText="Minimum time required to prepare orders"
              />

              <Input
                label="Max Preparation Time (minutes)"
                type="number"
                value={formData.max_preparation_time}
                onChange={(value) => handleInputChange('max_preparation_time', value)}
                error={errors.max_preparation_time}
                required
                placeholder="Enter maximum preparation time"
                helperText="Maximum time required to prepare orders"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="status"
                checked={formData.status}
                onChange={(e) => handleInputChange('status', e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="status" className="text-sm font-medium text-gray-700">
                Store is active
              </label>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-3 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/stores')}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={isLoading}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Update Store
          </Button>
        </div>
      </form>
    </div>
  );
};

export default StoreEdit;
