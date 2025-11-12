import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Eye, EyeOff, Copy, Info } from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardContent,
  Button,
  Input,
  useToast,
  Form,
  FormInput,
  FormSelect,
  FormTextarea
} from '@/components';
import { printTemplateApi } from '@/api/printTemplateApi';
import { PRINT_TEMPLATE_TYPES, PRINT_TEMPLATE_TYPE_LABELS } from '@/types/printTemplate.types';
import { usePageTitle } from '@/hooks/usePageTitle';
import type { PrintTemplate, PrintTemplateCreate, PrintTemplateUpdate } from '@/types/printTemplate.types';
import { EditPageSkeleton } from '@/components/Skeleton/EditDetails';

const PrintTemplateForm: React.FC = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  
  usePageTitle({ title: isEdit ? 'Edit Print Template' : 'Add Print Template' });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<PrintTemplateCreate | PrintTemplateUpdate>({
    name: '',
    slug: '',
    content: '',
    type: PRINT_TEMPLATE_TYPES.POS,
    description: '',
    is_active: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load template data for editing
  useEffect(() => {
    if (isEdit && id) {
      loadTemplate(parseInt(id));
    }
  }, [isEdit, id]);

  // Load template variables
  useEffect(() => {
    loadTemplateVariables();
  }, []);

  const loadTemplate = async (templateId: number) => {
    setLoading(true);
    try {
      const response = await printTemplateApi.getById(templateId);
      if (response.status === 1) {
        setFormData(response.data);
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

  const loadTemplateVariables = async () => {
    try {
      const response = await printTemplateApi.getTemplateVariables();
      if (response.status === 1) {
        setTemplateVariables(response.data);
      }
    } catch (error) {
      console.error('Error loading template variables:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSubmit = async (values: any, setFormErrors: (errors: Record<string, string>) => void) => {
    setSaving(true);
    setErrors({});

    // Update local formData with form values
    const submitData = {
      ...values,
      type: parseInt(values.type) || PRINT_TEMPLATE_TYPES.POS,
      is_active: formData.is_active // Keep the checkbox state
    };

    try {
      if (isEdit && id) {
        const response = await printTemplateApi.update(parseInt(id), submitData);
        if (response.status === 1) {
          showToast('success', 'Print template updated successfully');
          navigate('/print-templates');
        } else {
          throw new Error(response.message);
        }
      } else {
        const response = await printTemplateApi.create(submitData as PrintTemplateCreate);
        if (response.status === 1) {
          showToast('success', 'Print template created successfully');
          navigate('/print-templates');
        } else {
          throw new Error(response.message);
        }
      }
    } catch (error: any) {
      console.error('Error saving template:', error);
      
      if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors);
        setErrors(error.response.data.errors);
      } else {
        showToast('error', error.response?.data?.message || 'Failed to save template');
      }
    } finally {
      setSaving(false);
    }
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('content') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const before = text.substring(0, start);
      const after = text.substring(end, text.length);
      const newText = before + `{{${variable}}}` + after;
      
      // Update both formData and form values
      setFormData(prev => ({
        ...prev,
        content: newText
      }));
      
      // Set cursor position after the inserted variable
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length + 4, start + variable.length + 4);
      }, 0);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('success', 'Copied to clipboard');
  };

  if (loading) {
    return (
      <EditPageSkeleton />
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
              {isEdit ? 'Edit Print Template' : 'Add Print Template'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEdit ? 'Update template settings and content' : 'Create a new print template for POS or KDS'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
            leftIcon={showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            size="sm"
          >
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Template Details</h2>
            </CardHeader>
            <CardContent>
              <Form 
                onSubmit={handleSubmit} 
                initialValues={formData}
                loading={saving}
                submitText={isEdit ? 'Update Template' : 'Create Template'}
                cancelText="Cancel"
                showCancel={true}
                onCancel={() => navigate('/print-templates')}
              >
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                      name="name"
                      label="Template Name"
                      placeholder="Enter template name"
                      required
                    />
                    
                    <FormInput
                      name="slug"
                      label="Slug"
                      placeholder="template-slug"
                      helperText="Leave empty to auto-generate from name"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormSelect
                      name="type"
                      label="Template Type"
                      options={[
                        { value: PRINT_TEMPLATE_TYPES.POS.toString(), label: 'POS' },
                        { value: PRINT_TEMPLATE_TYPES.KDS.toString(), label: 'KDS' }
                      ]}
                      required
                    />
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="is_active"
                        checked={formData.is_active || false}
                        onChange={(e) => handleInputChange('is_active', e.target.checked)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                        Active Template
                      </label>
                    </div>
                  </div>

                  <FormTextarea
                    name="description"
                    label="Description"
                    placeholder="Enter template description"
                    rows={3}
                  />

                  {/* Template Content */}
                  <FormTextarea
                    name="content"
                    label="Template Content"
                    placeholder="Enter template content with variables like {{order_no}}, {{customer_name}}, etc."
                    rows={12}
                    className="font-mono text-sm"
                    required
                    helperText="Use variables like {{order_no}}, {{customer_name}}, etc. in your template content."
                  />

                </div>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Template Variables Sidebar */}
        <div className="space-y-6">
          {/* Available Variables */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Available Variables</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {Object.entries(templateVariables).map(([key, description]) => (
                  <div
                    key={key}
                    className="p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => insertVariable(key)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <code className="text-sm font-mono text-indigo-600">{`{{${key}}}`}</code>
                        <p className="text-xs text-gray-600 mt-1">{description}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(`{{${key}}}`);
                        }}
                        leftIcon={<Copy className="w-3 h-3" />}
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          {showPreview && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Content Preview</h3>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="text-sm font-mono whitespace-pre-wrap text-gray-800">
                    {String(formData.content || 'No content to preview')}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Help */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Info className="w-5 h-5" />
                Template Help
              </h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-600">
                <div>
                  <strong>POS Templates:</strong> Used for customer receipts and order printing.
                </div>
                <div>
                  <strong>KDS Templates:</strong> Used for kitchen display system printing.
                </div>
                <div>
                  <strong>Variables:</strong> Click on any variable to insert it into your template content.
                </div>
                <div>
                  <strong>Slug:</strong> Used to identify templates in API calls. Must be unique.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PrintTemplateForm;
