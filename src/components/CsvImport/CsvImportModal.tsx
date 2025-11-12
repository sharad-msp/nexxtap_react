import React, { useState, useCallback } from 'react';
import { 
  Upload, 
  Download, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  RefreshCw
} from 'lucide-react';
import { Modal, Button, Card, CardContent } from '@/components';
import { csvImportApi, ImportResponse } from '@/api/csvImportApi';
import { useToast } from '@/components/Toast';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  importType: 'category' | 'product';
  title: string;
  onRefresh?: () => void;
}

const CsvImportModal: React.FC<CsvImportModalProps> = ({
  isOpen,
  onClose,
  importType,
  title,
  onRefresh
}) => {
  const { showToast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResponse | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
        setImportResult(null);
      } else {
        showToast('error', 'Please select a valid CSV file');
      }
    }
  }, [showToast]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      if (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile);
        setImportResult(null);
      } else {
        showToast('error', 'Please select a valid CSV file');
      }
    }
  }, [showToast]);

  const downloadTemplate = useCallback(async () => {
    setIsDownloading(true);
    try {
      const response = importType === 'category' 
        ? await csvImportApi.downloadCategoryTemplate()
        : await csvImportApi.downloadProductTemplate();

      if (response.status === 1) {
        // Create and download CSV file
        const blob = new Blob([response.data.csv_content], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${importType}_template.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        showToast('success', 'Template downloaded successfully');
      }
    } catch (error) {
      console.error('Error downloading template:', error);
      showToast('error', 'Failed to download template');
    } finally {
      setIsDownloading(false);
    }
  }, [importType, showToast]);

  const handleImport = useCallback(async () => {
    if (!file) {
      showToast('error', 'Please select a file to import');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setIsCompleted(false);
    setImportResult(null);

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) return prev; // Stop at 90% until actual completion
        return prev + Math.random() * 10;
      });
    }, 200);

    try {
      const response = importType === 'category'
        ? await csvImportApi.importCategories(file)
        : await csvImportApi.importProducts(file);

      clearInterval(progressInterval);
      setUploadProgress(100);
      setImportResult(response.data);
      setIsCompleted(true);
      
      // Check Laravel response status (1 = success, 0 = error)
      if (response.status === 1) {
        showToast('success', response.message);
        // Don't auto-close - let user close manually
      } else {
        showToast('error', response.message || 'Import failed');
      }
    } catch (error) {
      clearInterval(progressInterval);
      console.error('Error importing CSV:', error);
      showToast('error', 'Failed to import CSV file');
      setIsCompleted(true);
    } finally {
      setIsUploading(false);
    }
  }, [file, importType, showToast]);

  const handleClose = useCallback(() => {
    // If there was a successful import, refresh the parent list
    if (importResult && importResult.success_count > 0 && onRefresh) {
      onRefresh();
    }
    
    setFile(null);
    setImportResult(null);
    setUploadProgress(0);
    setIsCompleted(false);
    setIsUploading(false);
    onClose();
  }, [onClose, importResult, onRefresh]);

  const handleImportAnother = useCallback(() => {
    // Clear all states for a fresh start
    setFile(null);
    setImportResult(null);
    setUploadProgress(0);
    setIsCompleted(false);
    setIsUploading(false);
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Import ${title} from CSV`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Template Download Section */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Download Template</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Download the CSV template to see the required format and sample data
                </p>
              </div>
              <Button
                onClick={downloadTemplate}
                disabled={isDownloading}
                leftIcon={isDownloading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                variant="outline"
              >
                {isDownloading ? 'Downloading...' : 'Download Template'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* File Upload Section */}
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Upload CSV File</h3>
            
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-indigo-500 bg-indigo-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {file ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <FileText className="h-12 w-12 text-green-500" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                  <Button
                    onClick={() => setFile(null)}
                    variant="outline"
                    size="sm"
                  >
                    Remove File
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <Upload className="h-12 w-12 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-900">
                      Drop your CSV file here, or click to browse
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Only CSV files are supported
                    </p>
                  </div>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                    id="csv-file-input"
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => document.getElementById('csv-file-input')?.click()}
                  >
                    Browse Files
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Import Results Section */}
        {importResult && (
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Import Results</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold text-green-600">{importResult.success_count || 0}</p>
                  <p className="text-sm text-green-600">Successful</p>
                </div>
                
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <XCircle className="h-6 w-6 text-red-500" />
                  </div>
                  <p className="text-2xl font-bold text-red-600">{importResult.error_count || 0}</p>
                  <p className="text-sm text-red-600">Errors</p>
                </div>
              </div>

              {importResult.errors && importResult.errors.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Errors Found:</h4>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {importResult.errors.map((error: string, index: number) => (
                      <div key={index} className="flex items-start space-x-2 text-sm">
                        <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <span className="text-red-600">{error}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Progress Bar */}
        {(isUploading || isCompleted) && (
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Import Progress</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>
                    {isCompleted 
                      ? 'Processing completed!' 
                      : `Uploading and processing ${importType}s...`
                    }
                  </span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ease-out ${
                      isCompleted ? 'bg-green-600' : 'bg-indigo-600'
                    }`}
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                {isCompleted && (
                  <div className="text-center text-sm text-green-600 font-medium">
                    ✅ {importType === 'category' ? 'Categories' : 'Products'} import completed! Review results below.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
          {file && !isCompleted && (
            <Button
              onClick={handleImport}
              disabled={isUploading}
              leftIcon={isUploading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            >
              {isUploading ? 'Importing...' : 'Import CSV'}
            </Button>
          )}
          {isCompleted && (
            <Button
              onClick={handleImportAnother}
              variant="outline"
              leftIcon={<Upload className="h-4 w-4" />}
            >
              Import Another File
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default CsvImportModal;
