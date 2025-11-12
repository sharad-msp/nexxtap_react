import React, { useState, useEffect, useCallback } from 'react';
import { 
  History, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  RotateCcw,
  RefreshCw,
  FileText
} from 'lucide-react';
import { Card, CardContent, Button, Table } from '@/components';
import { csvImportApi, ImportHistoryItem } from '@/api/csvImportApi';
import { formatDateTime } from '@/utils/formatDate';
import { useToast } from '@/components/Toast';

interface ImportHistoryProps {
  importType?: 'category' | 'product' | 'all';
  title?: string;
  className?: string;
}

const ImportHistory: React.FC<ImportHistoryProps> = ({ 
  importType = 'all', 
  title = 'Import History',
  className = ''
}) => {
  const { showToast } = useToast();
  const [history, setHistory] = useState<ImportHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchHistory = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      let response;
      if (importType === 'category') {
        response = await csvImportApi.getCategoryImportHistory({ page, per_page: 10 });
      } else if (importType === 'product') {
        response = await csvImportApi.getProductImportHistory({ page, per_page: 10 });
      } else {
        response = await csvImportApi.getAllImportHistory({ page, per_page: 10 });
      }
      
      setHistory(response.data);
      setTotalPages(response.meta.last_page);
    } catch (error) {
      console.error('Error fetching import history:', error);
      showToast('error', 'Failed to fetch import history');
    } finally {
      setLoading(false);
    }
  }, [importType, showToast]);

  useEffect(() => {
    fetchHistory(currentPage);
  }, [fetchHistory, currentPage]);

  const handleRollback = useCallback(async (importId: number) => {
    try {
      const response = await csvImportApi.rollbackImport(importId);
      if (response.success) {
        showToast('success', 'Import rolled back successfully');
        fetchHistory(currentPage);
      } else {
        showToast('error', response.message || 'Failed to rollback import');
      }
    } catch (error) {
      console.error('Error rolling back import:', error);
      showToast('error', 'Failed to rollback import');
    }
  }, [fetchHistory, currentPage, showToast]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'processing':
        return <RefreshCw className="h-4 w-4 text-indigo-500 animate-spin" />;
      case 'rolled_back':
        return <RotateCcw className="h-4 w-4 text-orange-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-indigo-100 text-indigo-800';
      case 'rolled_back':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Using centralized formatDateTime from utils

  const columns = [
    {
      key: 'file_name',
      header: 'File',
      render: (item: ImportHistoryItem) => (
        <div className="flex items-center space-x-2">
          <FileText className="h-4 w-4 text-gray-500" />
          <div>
            <div className="font-medium text-gray-900">{item.file_name}</div>
            <div className="text-sm text-gray-500">{formatFileSize(item.file_size)}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'import_type',
      header: 'Type',
      render: (item: ImportHistoryItem) => (
        <span className="capitalize text-sm font-medium text-gray-700">
          {item.import_type}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: ImportHistoryItem) => (
        <div className="flex items-center space-x-2">
          {getStatusIcon(item.status)}
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
            {item.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>
      ),
    },
    {
      key: 'results',
      header: 'Results',
      render: (item: ImportHistoryItem) => (
        <div className="text-sm">
          <div className="flex items-center space-x-4">
            <span className="text-green-600">{item.success_count || 0} successful</span>
            {item.error_count > 0 && (
              <span className="text-red-600">{item.error_count} errors</span>
            )}
          </div>
          {item.total_rows && (
            <div className="text-gray-500 mt-1">
              Total: {item.total_rows} rows
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'dates',
      header: 'Timeline',
      render: (item: ImportHistoryItem) => (
        <div className="text-sm text-gray-600">
          <div>Started: {formatDateTime(item.started_at)}</div>
          {item.completed_at && (
            <div>Completed: {formatDateTime(item.completed_at)}</div>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: ImportHistoryItem) => (
        <div className="flex space-x-2">
          {item.status === 'completed' && (
            <Button
              onClick={() => handleRollback(item.id)}
              variant="outline"
              size="sm"
              leftIcon={<RotateCcw className="h-3 w-3" />}
            >
              Rollback
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <History className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          </div>
          <Button
            onClick={() => fetchHistory(currentPage)}
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className="h-4 w-4" />}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>

        <Table
          data={history}
          columns={columns}
          loading={loading}
          pagination={{
            currentPage,
            totalPages,
            onPageChange: handlePageChange,
          }}
          keyField="id"
          emptyMessage="No import history found"
        />
      </CardContent>
    </Card>
  );
};

export default ImportHistory;
