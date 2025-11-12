import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Printer as PrinterIcon,
  Power,
  PowerOff,
  Settings,
  Calendar,
  Clock,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardContent,
  Button,
  Modal
} from '@/components';
import { printerApi } from '@/api';
import { formatDateTime } from '@/utils/formatDate';
import { getStatusColor, getStatusText } from '@/utils/statusColors';
import type { Printer } from '@/types/printer.types';
import { usePermissions } from '@/hooks/usePermissions';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useToast } from '@/components/Toast';
import { ViewDetailsSkeleton } from '@/components/Skeleton/ViewDetails';

const PrinterView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { 
    canUpdatePrinters
  } = usePermissions();
  
  usePageTitle({ title: 'Printer Details' });
  
  const [printer, setPrinter] = useState<Printer | null>(null);
  const [loading, setLoading] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch printer details
  const fetchPrinterDetails = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const response = await printerApi.getStorePrinterDetails(parseInt(id));
      if (response.status === 1) {
        setPrinter(response.data);
      } else {
        showToast('error', 'Failed to fetch printer details');
        navigate('/printers');
      }
    } catch (error) {
      console.error('Error fetching printer details:', error);
      showToast('error', 'Failed to fetch printer details');
      navigate('/printers');
    } finally {
      setLoading(false);
    }
  }, [id, showToast, navigate]);

  useEffect(() => {
    fetchPrinterDetails();
  }, [fetchPrinterDetails]);

  // Handle status update
  const handleUpdateStatus = useCallback(() => {
    if (!printer) return;
    setNewStatus(!printer.status);
    setShowStatusModal(true);
  }, [printer]);

  // Handle delete printer
  const handleDeletePrinter = useCallback(() => {
    setShowDeleteModal(true);
  }, []);

  const confirmStatusUpdate = useCallback(async () => {
    if (!printer) return;

    try {
      const response = await printerApi.updateStatus(printer.id, newStatus);
      if (response.status === 1) {
        showToast('success', `Printer ${newStatus ? 'enabled' : 'disabled'} successfully`);
        setShowStatusModal(false);
        fetchPrinterDetails(); // Refresh data
      } else {
        showToast('error', response.message || 'Failed to update printer status');
      }
    } catch (error) {
      showToast('error', 'Failed to update printer status');
    }
  }, [printer, newStatus, fetchPrinterDetails, showToast]);

  const confirmDeletePrinter = useCallback(async () => {
    if (!printer) return;

    try {
      const response = await printerApi.delete(printer.id);
      if (response.status === 1) {
        showToast('success', 'Printer deleted successfully');
        navigate('/printers'); // Navigate back to printer list
      } else {
        showToast('error', response.message || 'Failed to delete printer');
      }
    } catch (error) {
      showToast('error', 'Failed to delete printer');
    }
  }, [printer, navigate, showToast]);

  if (loading) {
    return (
      <ViewDetailsSkeleton />
    );
  }

  if (!printer) {
    return (
      <div className="text-center py-12">
        <PrinterIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Printer not found</h3>
        <p className="text-gray-600 mb-4">The printer you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/printers')} leftIcon={<ArrowLeft className="h-4 w-4" />}>
          Back to Printers
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => navigate('/printers')}
            variant="outline"
            size="sm"
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{printer.name}</h1>
            <p className="text-gray-600">Printer Details</p>
          </div>
        </div>
        <div className="flex space-x-3">
          {canUpdatePrinters() && (
            <Button
              onClick={handleUpdateStatus}
              variant="outline"
              leftIcon={printer.status ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
            >
              {printer.status ? 'Disable' : 'Enable'}
            </Button>
          )}
          {canUpdatePrinters() && (
            <Button
              onClick={handleDeletePrinter}
              variant="outline"
              leftIcon={<Trash2 className="h-4 w-4" />}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Delete
            </Button>
          )}
          <Button
            onClick={fetchPrinterDetails}
            variant="outline"
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Printer Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <PrinterIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                  <p className="text-sm text-gray-600">Printer details and configuration</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Printer Name</label>
                  <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{printer.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model ID</label>
                  <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                    {printer.model_id || 'Not specified'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(printer.status)}`}
                    >
                      {getStatusText(printer.status)}
                    </span>
                    {printer.is_default && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Default
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Store ID</label>
                  <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{printer.store_id}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Full Details */}
          {printer.full_details && (
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Settings className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Full Details</h3>
                    <p className="text-sm text-gray-600">Complete printer configuration</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="text-xs text-gray-700 bg-gray-50 p-4 rounded-md overflow-auto">
                  {JSON.stringify(printer.full_details, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Timestamps */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Timestamps</h3>
                  <p className="text-sm text-gray-600">Creation and update times</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                <div className="flex items-center space-x-2 text-sm text-gray-900">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span>{formatDateTime(printer.created_at)}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
                <div className="flex items-center space-x-2 text-sm text-gray-900">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span>{formatDateTime(printer.updated_at)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => navigate('/printers')}
                variant="outline"
                className="w-full"
                leftIcon={<ArrowLeft className="h-4 w-4" />}
              >
                Back to Printers
              </Button>
              {canUpdatePrinters() && (
                <Button
                  onClick={handleUpdateStatus}
                  variant={printer.status ? "danger" : "primary"}
                  className="w-full"
                  leftIcon={printer.status ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                >
                  {printer.status ? 'Disable Printer' : 'Enable Printer'}
                </Button>
              )}
              {canUpdatePrinters() && (
                <Button
                  onClick={handleDeletePrinter}
                  variant="danger"
                  className="w-full"
                  leftIcon={<Trash2 className="h-4 w-4" />}
                >
                  Delete Printer
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Status Update Confirmation Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title={`${newStatus ? 'Enable' : 'Disable'} Printer`}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to {newStatus ? 'enable' : 'disable'} <strong>{printer.name}</strong>?
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowStatusModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant={newStatus ? "primary" : "danger"}
              onClick={confirmStatusUpdate}
            >
              {newStatus ? 'Enable' : 'Disable'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Printer"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Trash2 className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-gray-600">
                Are you sure you want to delete <strong>{printer?.name}</strong>?
              </p>
              <p className="text-sm text-red-600 mt-1">
                This action cannot be undone.
              </p>
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmDeletePrinter}
            >
              Delete Printer
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PrinterView;
