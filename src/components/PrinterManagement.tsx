import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { Table } from '@/components/Table';
import { Badge } from '@/components/Badge';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { printerApi, type Printer, type CreatePrinterRequest } from '@/api/printerApi';
import { useToast } from '@/components/Toast';

interface PrinterManagementProps {
  storeId?: number;
  isStoreAdmin?: boolean;
}

const PrinterManagement: React.FC<PrinterManagementProps> = ({ 
  storeId, 
  isStoreAdmin = false 
}) => {
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPrinter, setEditingPrinter] = useState<Printer | null>(null);
  const [formData, setFormData] = useState<CreatePrinterRequest>({
    name: '',
    model_id: '',
    full_details: {},
    is_default: false
  });
  const { showToast } = useToast();

  useEffect(() => {
    fetchPrinters();
  }, [storeId]);

  const fetchPrinters = async () => {
    setLoading(true);
    try {
      const response = isStoreAdmin && storeId 
        ? await printerApi.getStorePrinters(storeId)
        : await printerApi.getAll();
      
      if (response.status === 1) {
        setPrinters(response.data || []);
      } else {
        showToast('Failed to fetch printers', 'error');
      }
    } catch (error) {
      console.error('Failed to fetch printers:', error);
      showToast('Failed to fetch printers', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPrinter = async () => {
    try {
      const response = await printerApi.create(formData);
      if (response.status === 1) {
        showToast('Printer added successfully', 'success');
        setShowAddModal(false);
        setFormData({ name: '', model_id: '', full_details: {}, is_default: false });
        fetchPrinters();
      } else {
        showToast(response.message || 'Failed to add printer', 'error');
      }
    } catch (error) {
      console.error('Failed to add printer:', error);
      showToast('Failed to add printer', 'error');
    }
  };

  const handleUpdatePrinter = async () => {
    if (!editingPrinter) return;

    try {
      const response = await printerApi.update(editingPrinter.id, formData);
      if (response.status === 1) {
        showToast('Printer updated successfully', 'success');
        setEditingPrinter(null);
        setFormData({ name: '', model_id: '', full_details: {}, is_default: false });
        fetchPrinters();
      } else {
        showToast(response.message || 'Failed to update printer', 'error');
      }
    } catch (error) {
      console.error('Failed to update printer:', error);
      showToast('Failed to update printer', 'error');
    }
  };

  const handleSetDefault = async (printer: Printer) => {
    try {
      const response = await printerApi.setDefault(printer.id);
      if (response.status === 1) {
        showToast('Printer set as default successfully', 'success');
        fetchPrinters();
      } else {
        showToast(response.message || 'Failed to set default printer', 'error');
      }
    } catch (error) {
      console.error('Failed to set default printer:', error);
      showToast('Failed to set default printer', 'error');
    }
  };

  const handleDeletePrinter = async (printer: Printer) => {
    if (!confirm(`Are you sure you want to delete "${printer.name}"?`)) return;

    try {
      const response = await printerApi.delete(printer.id);
      if (response.status === 1) {
        showToast('Printer deleted successfully', 'success');
        fetchPrinters();
      } else {
        showToast(response.message || 'Failed to delete printer', 'error');
      }
    } catch (error) {
      console.error('Failed to delete printer:', error);
      showToast('Failed to delete printer', 'error');
    }
  };

  const handleToggleStatus = async (printer: Printer) => {
    if (!isStoreAdmin || !storeId) return;

    try {
      const response = await printerApi.updateStatus(storeId, printer.id, !printer.status);
      if (response.status === 1) {
        showToast('Printer status updated successfully', 'success');
        fetchPrinters();
      } else {
        showToast(response.message || 'Failed to update printer status', 'error');
      }
    } catch (error) {
      console.error('Failed to update printer status:', error);
      showToast('Failed to update printer status', 'error');
    }
  };

  const openEditModal = (printer: Printer) => {
    setEditingPrinter(printer);
    setFormData({
      name: printer.name,
      model_id: printer.model_id || '',
      full_details: printer.full_details || {},
      is_default: printer.is_default
    });
  };

  const closeModals = () => {
    setShowAddModal(false);
    setEditingPrinter(null);
    setFormData({ name: '', model_id: '', full_details: {}, is_default: false });
  };

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (printer: Printer) => (
        <div className="flex items-center space-x-2">
          <span className="font-medium">{printer.name}</span>
          {printer.is_default && (
            <Badge variant="success" size="sm">Default</Badge>
          )}
        </div>
      )
    },
    {
      key: 'model_id',
      label: 'Model ID',
      render: (printer: Printer) => printer.model_id || '-'
    },
    {
      key: 'status',
      label: 'Status',
      render: (printer: Printer) => (
        <Badge variant={printer.status ? 'success' : 'danger'}>
          {printer.status ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (printer: Printer) => (
        <div className="flex space-x-2">
          {!isStoreAdmin && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => openEditModal(printer)}
              >
                Edit
              </Button>
              {!printer.is_default && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSetDefault(printer)}
                >
                  Set Default
                </Button>
              )}
              <Button
                size="sm"
                variant="danger"
                onClick={() => handleDeletePrinter(printer)}
              >
                Delete
              </Button>
            </>
          )}
          {isStoreAdmin && (
            <Button
              size="sm"
              variant={printer.status ? 'danger' : 'success'}
              onClick={() => handleToggleStatus(printer)}
            >
              {printer.status ? 'Disable' : 'Enable'}
            </Button>
          )}
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Printer Management</h3>
        {!isStoreAdmin && (
          <Button onClick={() => setShowAddModal(true)}>
            Add Printer
          </Button>
        )}
      </div>

      <Card>
        <CardContent>
          {printers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No printers found. {!isStoreAdmin && 'Add a printer to get started.'}
            </div>
          ) : (
            <Table
              data={printers}
              columns={columns}
              emptyMessage="No printers available"
            />
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Printer Modal */}
      <Modal
        isOpen={showAddModal || !!editingPrinter}
        onClose={closeModals}
        title={editingPrinter ? 'Edit Printer' : 'Add Printer'}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Printer Name *
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter printer name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Model ID
            </label>
            <Input
              value={formData.model_id}
              onChange={(e) => setFormData({ ...formData, model_id: e.target.value })}
              placeholder="Enter model ID (optional)"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_default"
              checked={formData.is_default}
              onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is_default" className="ml-2 block text-sm text-gray-700">
              Set as default printer
            </label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={closeModals}>
              Cancel
            </Button>
            <Button
              onClick={editingPrinter ? handleUpdatePrinter : handleAddPrinter}
              disabled={!formData.name.trim()}
            >
              {editingPrinter ? 'Update' : 'Add'} Printer
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PrinterManagement;
