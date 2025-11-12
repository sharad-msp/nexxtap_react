import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Copy, Printer, Monitor, Eye, EyeOff } from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardContent,
  Button,
  Badge,
  useToast,
  Modal
} from '@/components';
import { printTemplateApi } from '@/api/printTemplateApi';
import { PRINT_TEMPLATE_TYPE_LABELS } from '@/types/printTemplate.types';
import { getStatusBadgeVariant } from '@/utils/statusColors';
import { formatDate } from '@/utils/formatDate';
import { usePageTitle } from '@/hooks/usePageTitle';
import type { PrintTemplate } from '@/types/printTemplate.types';
import { ViewDetailsSkeleton } from '@/components/Skeleton/ViewDetails';

const PrintTemplateView: React.FC = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  usePageTitle({ title: 'Print Template Details' });
  
  const [loading, setLoading] = useState(true);
  const [template, setTemplate] = useState<PrintTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showRawContent, setShowRawContent] = useState(false);

  useEffect(() => {
    if (id) {
      loadTemplate(parseInt(id));
    }
  }, [id]);

  const loadTemplate = async (templateId: number) => {
    setLoading(true);
    try {
      const response = await printTemplateApi.getById(templateId);
      if (response.status === 1) {
        setTemplate(response.data);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Error loading template:', error);
      showToast('error', 'Failed to load template');
      navigate('/print-templates');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('success', 'Copied to clipboard');
  };

  const handleStatusToggle = async () => {
    if (!template) return;

    try {
      const response = await printTemplateApi.updateStatus(template.id, !template.is_active);
      if (response.status === 1) {
        showToast('success', 'Template status updated successfully');
        setTemplate(response.data);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Error updating template status:', error);
      showToast('error', 'Failed to update template status');
    }
  };

  if (loading) {
    return (
      <ViewDetailsSkeleton />
    );
  }

  if (!template) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Template Not Found</h2>
        <p className="text-gray-600 mb-4">The requested template could not be found.</p>
        <Button onClick={() => navigate('/print-templates')}>
          Back to Templates
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => navigate('/print-templates')}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            size="sm"
          >
            Back
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {template.name || 'Unnamed Template'}
            </h1>
            <p className="text-gray-600 mt-1">Print template details and content</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowRawContent(!showRawContent)}
            leftIcon={showRawContent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            size="sm"
          >
            {showRawContent ? 'Hide Raw' : 'Show Raw'}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
            leftIcon={<Eye className="w-4 h-4" />}
            size="sm"
          >
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </Button>
          <Button
            onClick={() => navigate(`/print-templates/edit/${template.id}`)}
            leftIcon={<Edit className="w-4 h-4" />}
            size="sm"
          >
            Edit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Template Information</h2>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <p className="text-sm text-gray-900">{template.name || 'Unnamed Template'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                  <div className="flex items-center gap-2">
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">{template.slug}</code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(template.slug)}
                      leftIcon={<Copy className="w-3 h-3" />}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <div className="flex items-center gap-2">
                    {template.type === 1 ? (
                      <Printer className="w-4 h-4 text-indigo-600" />
                    ) : (
                      <Monitor className="w-4 h-4 text-green-600" />
                    )}
                    <span className="text-sm text-gray-900">
                      {PRINT_TEMPLATE_TYPE_LABELS[template.type as keyof typeof PRINT_TEMPLATE_TYPE_LABELS]}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={getStatusBadgeVariant(template.is_active)}
                      dot
                      size="sm"
                    >
                      {template.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleStatusToggle}
                    >
                      {template.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                  <p className="text-sm text-gray-900">{formatDate(template.created_at)}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
                  <p className="text-sm text-gray-900">{formatDate(template.updated_at)}</p>
                </div>
              </div>
              
              {template.description && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <p className="text-sm text-gray-900">{template.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Template Content */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Template Content</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(template.content)}
                  leftIcon={<Copy className="w-4 h-4" />}
                >
                  Copy Content
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showRawContent ? (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="text-sm font-mono whitespace-pre-wrap text-gray-800 overflow-x-auto">
                    {template.content}
                  </pre>
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="text-sm font-mono whitespace-pre-wrap text-gray-800">
                    {template.content}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button
                  onClick={() => navigate(`/print-templates/edit/${template.id}`)}
                  leftIcon={<Edit className="w-4 h-4" />}
                  className="w-full"
                >
                  Edit Template
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(template.content)}
                  leftIcon={<Copy className="w-4 h-4" />}
                  className="w-full"
                >
                  Copy Content
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleStatusToggle}
                  className="w-full"
                >
                  {template.is_active ? 'Deactivate Template' : 'Activate Template'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Template Info */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Template Info</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Content Length:</span>
                  <span className="font-medium">{template.content.length} characters</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Lines:</span>
                  <span className="font-medium">{template.content.split('\n').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Variables:</span>
                  <span className="font-medium">
                    {(template.content.match(/\{\{[^}]+\}\}/g) || []).length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* API Usage */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">API Usage</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Get Template by Slug:</label>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded block">
                    GET /admin/print-template/slug/{template.slug}
                  </code>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">With Variables:</label>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded block">
                    POST /admin/print-template/slug/{template.slug}
                    <br />
                    Body: {`{"variables": {"order_no": "123"}}`}
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PrintTemplateView;
