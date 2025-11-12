import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  FileText,
  Printer,
  Monitor
} from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardContent,
  Table,
  Button,
  Modal,
  Badge,
  Input,
  FullPageLoader, 
  useToast,
  StandardDropdown
} from '@/components';
import { printTemplateApi } from '@/api/printTemplateApi';
import { PRINT_TEMPLATE_TYPES, PRINT_TEMPLATE_TYPE_LABELS } from '@/types/printTemplate.types';
import { getStatusBadgeVariant } from '@/utils/statusColors';
import { formatDate } from '@/utils/formatDate';
import { usePageTitle } from '@/hooks/usePageTitle';
import type { PrintTemplate, PrintTemplateFilters } from '@/types/printTemplate.types';

const PrintTemplateList: React.FC = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  usePageTitle({ title: 'Print Templates Management' });
  
  const [templates, setTemplates] = useState<PrintTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<PrintTemplate | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isInitialized, setIsInitialized] = useState(false);

  // Fetch templates with filters
  const fetchTemplates = useCallback(async (page = 1, search = '', type = 'all', status = 'all') => {
    if (loading) return;
    
    setLoading(true);
    try {
      const params: PrintTemplateFilters = {
        page,
        per_page: 10,
        search
      };
      
      if (type !== 'all') {
        params.type = parseInt(type);
      }
      
      if (status !== 'all') {
        params.status = status === '1';
      }

      const response = await printTemplateApi.getAll(params);
      
      if (response.status === 1) {
        setTemplates(response.data);
        setTotalPages(response.meta?.last_page || 1);
        setTotalItems(response.meta?.total || 0);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Error fetching print templates:', error);
      showToast('error', 'Failed to fetch print templates');
    } finally {
      setLoading(false);
    }
  }, [loading, showToast]);

  // Initialize data
  useEffect(() => {
    if (!isInitialized) {
      fetchTemplates(currentPage, searchQuery, filterType, filterStatus);
      setIsInitialized(true);
    }
  }, [isInitialized, fetchTemplates, currentPage, searchQuery, filterType, filterStatus]);

  // Handle filter changes
  useEffect(() => {
    if (isInitialized) {
      fetchTemplates(currentPage, searchQuery, filterType, filterStatus);
    }
  }, [filterType, filterStatus]);

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    fetchTemplates(1, query, filterType, filterStatus);
  }, [fetchTemplates, filterType, filterStatus]);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    fetchTemplates(page, searchQuery, filterType, filterStatus);
  }, [fetchTemplates, searchQuery, filterType, filterStatus]);

  // Handle type filter change
  const handleTypeFilterChange = useCallback((type: string) => {
    setFilterType(type);
    setCurrentPage(1);
    fetchTemplates(1, searchQuery, type, filterStatus);
  }, [fetchTemplates, searchQuery, filterStatus]);

  // Handle status filter change
  const handleStatusFilterChange = useCallback((status: string) => {
    setFilterStatus(status);
    setCurrentPage(1);
    fetchTemplates(1, searchQuery, filterType, status);
  }, [fetchTemplates, searchQuery, filterType]);

  // Handle template actions
  const handleViewTemplate = useCallback((template: PrintTemplate) => {
    navigate(`/print-templates/view/${template.id}`);
  }, [navigate]);

  const handleEditTemplate = useCallback((template: PrintTemplate) => {
    navigate(`/print-templates/edit/${template.id}`);
  }, [navigate]);

  const handleDeleteTemplate = useCallback((template: PrintTemplate) => {
    setTemplateToDelete(template);
    setShowDeleteModal(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!templateToDelete) return;

    try {
      const response = await printTemplateApi.delete(templateToDelete.id);
      
      if (response.status === 1) {
        showToast('success', 'Print template deleted successfully');
        setShowDeleteModal(false);
        setTemplateToDelete(null);
        fetchTemplates(currentPage, searchQuery, filterType, filterStatus);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Error deleting print template:', error);
      showToast('error', 'Failed to delete print template');
    }
  }, [templateToDelete, fetchTemplates, currentPage, searchQuery, filterType, filterStatus, showToast]);

  const handleStatusToggle = useCallback(async (template: PrintTemplate) => {
    try {
      const response = await printTemplateApi.updateStatus(template.id, !template.is_active);
      
      if (response.status === 1) {
        showToast('success', 'Print template status updated successfully');
        fetchTemplates(currentPage, searchQuery, filterType, filterStatus);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Error updating print template status:', error);
      showToast('error', 'Failed to update print template status');
    }
  }, [fetchTemplates, currentPage, searchQuery, filterType, filterStatus, showToast]);

  const handleRefresh = useCallback(() => {
    fetchTemplates(currentPage, searchQuery, filterType, filterStatus);
  }, [fetchTemplates, currentPage, searchQuery, filterType, filterStatus]);

  const getTypeIcon = (type: number) => {
    return type === PRINT_TEMPLATE_TYPES.POS ? <Printer className="w-4 h-4" /> : <Monitor className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Print Templates Management</h1>
          <p className="text-gray-600 mt-1">Manage printer templates for POS and KDS systems</p>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-3">
          <Button 
            variant="outline"
            onClick={handleRefresh}
            disabled={loading}
            leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
            size="sm"
            className="h-10"
          >
            Refresh
          </Button>
          <Button 
            onClick={() => navigate('/print-templates/add')}
            className="flex items-center gap-2"
            leftIcon={<Plus className="w-4 h-4" />}
            size="sm"
          >
            <span className="hidden sm:inline">Add Template</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 lg:max-w-md">
              <Input
                placeholder="Search templates by name, slug, or description..."
                value={searchQuery}
                onChange={handleSearch}
                leftIcon={<Search className="w-4 h-4" />}
                variant="filled"
              />
            </div>
            <div className="flex gap-2 sm:gap-3 lg:w-48">
              <StandardDropdown
                value={filterType}
                onChange={handleTypeFilterChange}
                options={[
                  { value: 'all', label: 'All Types' },
                  { value: PRINT_TEMPLATE_TYPES.POS.toString(), label: 'POS' },
                  { value: PRINT_TEMPLATE_TYPES.KDS.toString(), label: 'KDS' }
                ]}
                placeholder="Filter by type"
                size="md"
                className="w-full"
              />
            </div>
            <div className="flex gap-2 sm:gap-3 lg:w-48">
              <StandardDropdown
                value={filterStatus}
                onChange={handleStatusFilterChange}
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: '1', label: 'Active' },
                  { value: '0', label: 'Inactive' }
                ]}
                placeholder="Filter by status"
                size="md"
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Print Templates ({totalItems})</h2>
          </div>
        </CardHeader>
        <CardContent>
          <Table
            loading={loading}
            data={templates}
            columns={[
              {
                key: 'sr_no',
                header: 'Sr No',
                width: '8%',
                align: 'center' as const,
                render: (template) => (
                  <div className="text-sm font-medium text-gray-600">
                    {templates.indexOf(template) + 1 + ((currentPage - 1) * 10)}
                  </div>
                )
              },
              {
                key: 'template',
                header: 'Template',
                width: '30%',
                render: (template) => (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-gray-900 truncate text-sm">{template.name || 'Unnamed Template'}</div>
                      <div className="text-sm text-gray-500 truncate">{template.slug}</div>
                    </div>
                  </div>
                )
              },
              {
                key: 'type',
                header: 'Type',
                width: '12%',
                render: (template) => (
                  <div className="flex items-center gap-2 text-sm">
                    {getTypeIcon(template.type)}
                    <span className="text-gray-900">{PRINT_TEMPLATE_TYPE_LABELS[template.type as keyof typeof PRINT_TEMPLATE_TYPE_LABELS]}</span>
                  </div>
                )
              },
              {
                key: 'content_preview',
                header: 'Content Preview',
                width: '25%',
                hideOnMobile: true,
                render: (template) => (
                  <div className="text-sm text-gray-600 truncate max-w-xs">
                    {template.content.substring(0, 100)}...
                  </div>
                )
              },
              {
                key: 'actions',
                header: 'Actions',
                width: '25%',
                render: (template) => (
                  <div className="flex items-center gap-1 overflow-x-auto">
                    <Button
                      onClick={() => handleViewTemplate(template)}
                      variant="outline"
                      size="sm"
                      leftIcon={<Eye className="h-4 w-4" />}
                      className="whitespace-nowrap"
                      title="View Template"
                    >
                      <span className="hidden sm:inline">View</span>
                    </Button>
                    <Button
                      onClick={() => handleEditTemplate(template)}
                      variant="outline"
                      size="sm"
                      leftIcon={<Edit className="h-4 w-4" />}
                      className="whitespace-nowrap"
                      title="Edit Template"
                    >
                      <span className="hidden sm:inline">Edit</span>
                    </Button>
                    <Button
                      onClick={() => handleStatusToggle(template)}
                      variant="outline"
                      size="sm"
                      leftIcon={template.is_active ? 
                        <ToggleRight className="h-4 w-4" /> : 
                        <ToggleLeft className="h-4 w-4" />
                      }
                      className="hidden sm:flex whitespace-nowrap"
                      title={template.is_active ? 'Deactivate Template' : 'Activate Template'}
                    >
                      {template.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      onClick={() => handleDeleteTemplate(template)}
                      variant="outline"
                      size="sm"
                      leftIcon={<Trash2 className="h-4 w-4" />}
                      className="whitespace-nowrap"
                      title="Delete Template"
                    >
                      <span className="hidden sm:inline">Delete</span>
                    </Button>
                  </div>
                )
              },
              {
                key: 'status',
                header: 'Status',
                width: '8%',
                align: 'center' as const,
                render: (template) => (
                  <Badge
                    variant={getStatusBadgeVariant(template.is_active)}
                    dot
                    size="sm"
                  >
                    {template.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                )
              },
              {
                key: 'created_at',
                header: 'Created',
                width: '12%',
                hideOnMobile: true,
                render: (template) => (
                  <div className="text-sm text-gray-600">
                    {formatDate(template.created_at)}
                  </div>
                )
              }
            ]}
            keyField="id"
            emptyMessage="No print templates found"
            striped={true}
            hover={true}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
              <div className="text-sm text-gray-600">
                Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalItems)} of {totalItems} templates
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="px-3 py-2 text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Delete"
      >
        <div className="p-6">
          <p className="text-gray-600 mb-4">
            Are you sure you want to delete the template "{templateToDelete?.name || 'Unnamed Template'}"? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Full Page Loader */}
      <FullPageLoader isLoading={loading && !isInitialized} text="Loading print templates..." />
    </div>
  );
};

export default PrintTemplateList;
