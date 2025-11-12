import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Store, User, Lock, Building, MapPin, Phone, Mail, Clock, FileText } from 'lucide-react';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Card, CardContent, CardHeader, useToast} from '@/components';
import { storeApi } from '@/api';
import { validateRequired, validateEmail, validatePhoneNumber } from '@/utils/validators';
import { usePageTitle } from '@/hooks/usePageTitle';
import Swal from 'sweetalert2';


const StoreAdd: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  usePageTitle({ title: 'Add Store' });
  
  const [formData, setFormData] = useState({
    // Store Information
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
    // Admin User Information
    admin_name: '',
    admin_email: '',
    admin_password: '',
    admin_password_confirm: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Store validation
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

    // Admin user validation
    if (!validateRequired(formData.admin_name)) {
      newErrors.admin_name = 'Admin name is required';
    }

    if (!validateRequired(formData.admin_email)) {
      newErrors.admin_email = 'Admin email is required';
    } else if (!validateEmail(formData.admin_email)) {
      newErrors.admin_email = 'Please enter a valid email address';
    }

    if (!validateRequired(formData.admin_password)) {
      newErrors.admin_password = 'Admin password is required';
    } else if (formData.admin_password.length < 6) {
      newErrors.admin_password = 'Password must be at least 6 characters';
    }

    if (!validateRequired(formData.admin_password_confirm)) {
      newErrors.admin_password_confirm = 'Please confirm the password';
    } else if (formData.admin_password !== formData.admin_password_confirm) {
      newErrors.admin_password_confirm = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
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
        min_preparation_time: Number(formData.min_preparation_time),
        max_preparation_time: Number(formData.max_preparation_time),
        status: formData.status,
        admin_name: formData.admin_name,
        admin_email: formData.admin_email,
        admin_password: formData.admin_password
      };

      const response = await storeApi.create(payload);
      
      if (response.status == 1) {
        Swal.fire({
          title: 'Store Created Successfully!',
          text: `Store "${formData.store_name}" has been created with admin user "${formData.admin_name}". The admin user can now login to manage this store.`,
          icon: 'success',
          confirmButtonText: 'Continue'
        });
        navigate('/stores');
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      console.error('Error creating store:', error);
      Swal.fire('Error', error.message || 'Failed to create store', 'error');
    } finally {
      setIsLoading(false);
    }
  };

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
              Add Store
            </h1>
            <p className="text-gray-600 mt-1">Create a new store</p>
          </div>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Store Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Store className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Store Information</h2>
                <p className="text-sm text-gray-600">Basic store details and contact information</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Input
                label="Store Name"
                value={formData.store_name}
                onChange={(value) => handleInputChange('store_name', value)}
                error={errors.store_name}
                required
                placeholder="Enter store name"
                leftIcon={<Store className="w-4 h-4" />}
                variant="filled"
              />

              <Input
                label="Contact Number"
                value={formData.contact_number}
                onChange={(value) => handleInputChange('contact_number', value)}
                error={errors.contact_number}
                required
                placeholder="Enter contact number"
                leftIcon={<Phone className="w-4 h-4" />}
                variant="filled"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Input
                label="Business Type"
                value={formData.business_type}
                onChange={(value) => handleInputChange('business_type', value)}
                error={errors.business_type}
                required
                placeholder="Restaurant, Retail, etc."
                leftIcon={<Building className="w-4 h-4" />}
                variant="filled"
              />

              <Input
                label="Contact Email"
                type="email"
                value={formData.contact_email}
                onChange={(value) => handleInputChange('contact_email', value)}
                error={errors.contact_email}
                required
                placeholder="Enter contact email"
                leftIcon={<Mail className="w-4 h-4" />}
                variant="filled"
              />
            </div>

            <Input
              label="Store Address"
              value={formData.store_address}
              onChange={(value) => handleInputChange('store_address', value)}
              error={errors.store_address}
              required
              placeholder="Enter complete store address"
              leftIcon={<MapPin className="w-4 h-4" />}
              variant="filled"
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Input
                label="City"
                value={formData.city}
                onChange={(value) => handleInputChange('city', value)}
                error={errors.city}
                required
                placeholder="Enter city"
                leftIcon={<MapPin className="w-4 h-4" />}
                variant="filled"
              />

              <Input
                label="State"
                value={formData.state}
                onChange={(value) => handleInputChange('state', value)}
                error={errors.state}
                required
                placeholder="Enter state"
                leftIcon={<MapPin className="w-4 h-4" />}
                variant="filled"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Input
                label="Store Hours From"
                type="time"
                value={formData.store_hours_from}
                onChange={(value) => handleInputChange('store_hours_from', value)}
                error={errors.store_hours_from}
                required
                leftIcon={<Clock className="w-4 h-4" />}
                variant="filled"
              />

              <Input
                label="Store Hours To"
                type="time"
                value={formData.store_hours_to}
                onChange={(value) => handleInputChange('store_hours_to', value)}
                error={errors.store_hours_to}
                required
                leftIcon={<Clock className="w-4 h-4" />}
                variant="filled"
              />

              <Input
                label="Tax Registration Number"
                value={formData.tax_registration_number}
                onChange={(value) => handleInputChange('tax_registration_number', value)}
                error={errors.tax_registration_number}
                placeholder="Optional"
                leftIcon={<FileText className="w-4 h-4" />}
                variant="filled"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Input
                label="Min Preparation Time (minutes)"
                type="number"
                value={formData.min_preparation_time}
                onChange={(value) => handleInputChange('min_preparation_time', value)}
                error={errors.min_preparation_time}
                required
                placeholder="Enter minimum preparation time"
                leftIcon={<Clock className="w-4 h-4" />}
                variant="filled"
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
                leftIcon={<Clock className="w-4 h-4" />}
                variant="filled"
                helperText="Maximum time required to prepare orders"
              />
            </div>

            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                id="status"
                checked={formData.status}
                onChange={(e) => handleInputChange('status', e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="status" className="text-sm font-medium text-gray-700">
                Store is active and ready to accept orders
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Admin User Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Admin User Information</h2>
                <p className="text-sm text-gray-600">
                  This admin user will be automatically created and can login to manage this store
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Input
                label="Admin Name"
                value={formData.admin_name}
                onChange={(value) => handleInputChange('admin_name', value)}
                error={errors.admin_name}
                required
                placeholder="Enter admin name"
                leftIcon={<User className="w-4 h-4" />}
                variant="filled"
              />

              <Input
                label="Admin Email"
                type="email"
                value={formData.admin_email}
                onChange={(value) => handleInputChange('admin_email', value)}
                error={errors.admin_email}
                required
                placeholder="Enter admin email"
                leftIcon={<Mail className="w-4 h-4" />}
                variant="filled"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Input
                label="Admin Password"
                type="password"
                value={formData.admin_password}
                onChange={(value) => handleInputChange('admin_password', value)}
                error={errors.admin_password}
                required
                placeholder="Enter admin password"
                leftIcon={<Lock className="w-4 h-4" />}
                variant="filled"
                helperText="Minimum 6 characters required"
              />

              <Input
                label="Confirm Password"
                type="password"
                value={formData.admin_password_confirm}
                onChange={(value) => handleInputChange('admin_password_confirm', value)}
                error={errors.admin_password_confirm}
                required
                placeholder="Confirm admin password"
                leftIcon={<Lock className="w-4 h-4" />}
                variant="filled"
              />
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/stores')}
            size="lg"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            loading={isLoading}
            leftIcon={<Save className="w-4 h-4" />}
            size="lg"
          >
            Create Store
          </Button>
        </div>
      </form>
    </div>
  );
};

export default StoreAdd;
