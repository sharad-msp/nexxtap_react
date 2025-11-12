import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, MapPin, Phone, Mail, Calendar, Clock, Building2, FileText, User, Timer } from 'lucide-react';
import { Button } from '@/components/Button';
import { Card, CardContent } from '@/components/Card';
import { useStoreStore } from '@/store/storeStore';
import { formatDate } from '@/utils/formatDate';
import { useToast } from '@/components/Toast';
import { usePageTitle } from '@/hooks/usePageTitle';
import type { Store } from '@/types/store.types';
import { ViewDetailsSkeleton } from '@/components/Skeleton/ViewDetails';  
const StoreView: React.FC = () => {
  const { showToast } = useToast();

  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getStoreDetails } = useStoreStore();
  const [store, setStore] = useState<Store | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  usePageTitle({ title: 'View Store' });

  useEffect(() => {
    const fetchStoreData = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const storeData = await getStoreDetails(parseInt(id));
        if (storeData) {
          setStore(storeData);
        } else {
          showToast('error', 'Store not found');
          navigate('/stores');
        }
      } catch (error) {
        showToast('error', 'Failed to load store data');
        navigate('/stores');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStoreData();
  }, [id, getStoreDetails, navigate]);

  if (isLoading) {
    return (
      <ViewDetailsSkeleton />
    );
  }

  if (!store) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Store not found</p>
        <Button onClick={() => navigate('/stores')} className="mt-4">
          Back to Stores
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate('/stores')}
          className="text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={() => navigate(`/stores/edit/${store.id}`)}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </div>

      {/* Title & Status */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{store.name}</h1>
          <p className="text-sm text-gray-500">Store Details</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            store.status
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {store.status_text}
        </span>
      </div>

      {/* Basic Information */}
      <Card>
        <CardContent padding="sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Basic Information</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Address</p>
                <p className="text-gray-900">{store.address}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Building2 className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">City</p>
                <p className="text-gray-900">{store.city}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Building2 className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">State</p>
                <p className="text-gray-900">{store.state}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Building2 className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Business Type</p>
                <p className="text-gray-900">{store.business_type}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardContent padding="sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Contact Information</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-start gap-2">
              <Phone className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="text-gray-900">{store.phone}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Mail className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-gray-900">{store.email}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Store Hours & Preparation Time */}
      <Card>
        <CardContent padding="sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Operating Details</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Store Hours</p>
                <p className="text-gray-900">{store.store_hours_from} - {store.store_hours_to}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Timer className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Preparation Time</p>
                <p className="text-gray-900">{store.min_preparation_time} - {store.max_preparation_time} min</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tax & Regulatory */}
      <Card>
        <CardContent padding="sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Tax & Regulatory</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Tax Registration Number</p>
                <p className="text-gray-900">{store.tax_registration_number || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Regulatory Info</p>
                <p className="text-gray-900">{store.regulatory_info || 'N/A'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin Information */}
      {store.admin && (
        <Card>
          <CardContent padding="sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Store Administrator</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-start gap-2">
                <User className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Admin Name</p>
                  <p className="text-gray-900">{store.admin.name}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Mail className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Admin Email</p>
                  <p className="text-gray-900">{store.admin.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Auto Logout</p>
                  <p className="text-gray-900">
                    {store.admin.auto_logout_enabled ? 'Enabled' : 'Disabled'}
                    {store.admin.auto_logout_enabled && store.admin.auto_logout_duration && (
                      <span className="text-xs text-gray-500 ml-1">
                        ({store.admin.auto_logout_duration} {store.admin.auto_logout_type})
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Admin Status</p>
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      store.admin.status
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {store.admin.status_text}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timestamps */}
      <Card>
        <CardContent padding="sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Timestamps</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Created</p>
                <p className="text-gray-900">{formatDate(store.created_at)}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Last Updated</p>
                <p className="text-gray-900">{formatDate(store.updated_at)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StoreView;
