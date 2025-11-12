import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, ChevronDown, ChevronRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/Button';
import { Card, CardContent, CardHeader } from '@/components/Card';
import { Form, FormInput, FormTextarea, FormFileUpload } from '@/components/Form';
import { CategorySelect } from '@/components/CategorySelect';
import { DragDropList } from '@/components/DragDropList';
import { useToast } from '@/components';
import { usePageTitle } from '@/hooks/usePageTitle';
import Swal from 'sweetalert2';
import { productApi, taxApi } from '@/api';
import type { ProductCategoryAttribute, ProductOptionValue } from '@/types/product.types';
import type { SimpleTax } from '@/types';

export const ProductAdd = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [categoryAttributes, setCategoryAttributes] = useState<ProductCategoryAttribute[]>([]);
    const [storeTaxes, setStoreTaxes] = useState<SimpleTax[]>([]);
    const [loading, setLoading] = useState(false);
    const [taxesLoading, setTaxesLoading] = useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');

    const [optionValues, setOptionValues] = useState<ProductOptionValue[]>([]);
    const [selectedTaxes, setSelectedTaxes] = useState<number[]>([]);
    const [displayOrderErrors, setDisplayOrderErrors] = useState<Record<string, string>>({});
    const [expandedAttributes, setExpandedAttributes] = useState<Set<number>>(new Set());
    
    usePageTitle({ title: 'Add Product' });

    useEffect(() => {
        fetchStoreTaxes();
    }, []);

    const handleCategoryChange = (categoryId: string) => {
        setSelectedCategoryId(categoryId);
        if (categoryId) {
            fetchCategoryAttributes(parseInt(categoryId));
        } else {
            setCategoryAttributes([]);
            setOptionValues([]);
        }
    };

    const fetchStoreTaxes = async () => {
        setTaxesLoading(true);
        try {
            const response = await taxApi.getAvailableTaxes();
            if (response.status === 1) {
                setStoreTaxes(response.data);
            } else {
                Swal.fire('Error', response.message, 'error');
            }
        } catch (error) {
            console.error('Error fetching store taxes:', error);
            showToast('error', 'Failed to fetch store taxes');
        } finally {
            setTaxesLoading(false);
        }
    };

    const fetchCategoryAttributes = async (categoryId: number) => {
        try {
            const attributes = await productApi.getCategoryAttributes(categoryId);
            setCategoryAttributes(attributes);
            
            // Automatically populate all preset options
            const autoOptions: ProductOptionValue[] = [];
            const expandedIds = new Set<number>();
            
            attributes.forEach((attribute) => {
                if (attribute.preset_options && attribute.preset_options.length > 0) {
                    // Auto-expand attributes that have presets
                    expandedIds.add(attribute.id);
                    
                    // Add all preset options automatically
                    attribute.preset_options.forEach((preset, index) => {
                        autoOptions.push({
                            category_attribute_id: attribute.id,
                            value: preset.value,
                            price_modifier: preset.price_modifier,
                            display_order: index
                        });
                    });
                }
            });
            
            setOptionValues(autoOptions);
            setExpandedAttributes(expandedIds);
        } catch (error) {
            console.error('Error fetching category attributes:', error);
            setCategoryAttributes([]);
            setOptionValues([]);
            setExpandedAttributes(new Set());
        }
    };

    const toggleAttributeExpand = (attributeId: number) => {
        setExpandedAttributes(prev => {
            const newSet = new Set(prev);
            if (newSet.has(attributeId)) {
                newSet.delete(attributeId);
            } else {
                newSet.add(attributeId);
            }
            return newSet;
        });
    };

    const addOptionValue = (attributeId: number) => {
        const newOption: ProductOptionValue = {
            category_attribute_id: attributeId,
            value: '',
            price_modifier: 0,
            display_order: 0 // Start with 0 so input appears empty
        };
        setOptionValues([...optionValues, newOption]);
    };

    const updateOptionValue = (index: number, field: keyof ProductOptionValue, value: any) => {
        const updatedOptions = [...optionValues];
        updatedOptions[index] = { ...updatedOptions[index], [field]: value };
        setOptionValues(updatedOptions);
        
        // Clear display order errors when user makes changes
        if (field === 'display_order') {
            setDisplayOrderErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[`${index}`];
                return newErrors;
            });
        }
    };

    const validateDisplayOrder = (index: number, value: number, attributeId: number) => {
        // No validation needed - drag and drop handles ordering
        // Clear any existing errors
        setDisplayOrderErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[`${index}`];
            return newErrors;
        });
        
        return true;
    };

    const removeOptionValue = (index: number) => {
        const updatedOptions = optionValues.filter((_, i) => i !== index);
        setOptionValues(updatedOptions);
    };

    const handleReorderOptions = (attributeId: number, reorderedOptions: ProductOptionValue[]) => {
        // Update the option values for this specific attribute
        const otherAttributeOptions = optionValues.filter(opt => opt.category_attribute_id !== attributeId);
        setOptionValues([...otherAttributeOptions, ...reorderedOptions]);
    };

    const handleTaxChange = (taxId: number, checked: boolean) => {
        if (checked) {
            setSelectedTaxes([...selectedTaxes, taxId]);
        } else {
            setSelectedTaxes(selectedTaxes.filter(id => id !== taxId));
        }
    };

    const handleSubmit = async (values: any, setErrors: (errors: Record<string, string>) => void) => {
        setLoading(true);

        try {
            // Validate option values before submission
            const validationErrors: Record<string, string> = {};
        
            // If category has attributes but no options added
            categoryAttributes.forEach(attr => {
                const optionsForAttr = optionValues.filter(opt => opt.category_attribute_id === attr.id);
                if (optionsForAttr.length === 0) {
                    validationErrors[`attribute_${attr.id}`] = `Please add at least 1 option for "${attr.name}".`;
                }
            });
        
            if (Object.keys(validationErrors).length > 0) {
                setErrors(validationErrors);
                showToast('error', Object.values(validationErrors)[0]);
                setLoading(false);
                return;
            }


            // Prepare option values with proper display order validation
            const validatedOptionValues = optionValues
                .filter(opt => opt.value.trim() !== '')
                .map(opt => ({
                    ...opt,
                    display_order: opt.display_order > 0 ? opt.display_order : 1
                }));

            const payload = {
                ...values,
                base_price: parseFloat(values.base_price),
                category_id: parseInt(selectedCategoryId),
                tax_ids: selectedTaxes, // Send as array of tax IDs
                option_values: validatedOptionValues
            };

            // Only include image if it's actually a file
            if (values.image && values.image instanceof File) {
                payload.image = values.image;
                console.log('📸 Including image file in payload');
            } else {
                delete payload.image;
                console.log('📸 No image file, removing image from payload');
            }

            const response = await productApi.create(payload);
            if (response.status == true) {
                showToast('success', response.data.message);
                navigate('/products');
            } else {
                showToast('error', response.error);
            }   
            setLoading(false);
        } catch (error: any) {
            console.error('Error creating product:', error);
            
            // Handle API error response format
            if (error.response?.data) {
                const errorData = error.response.data;
                
                // Check if it's a validation error with specific field errors
                if (errorData.errors && typeof errorData.errors === 'object') {
                    // Convert array errors to single string
                    const formattedErrors: Record<string, string> = {};
                    Object.keys(errorData.errors).forEach(key => {
                        const errorArray = errorData.errors[key];
                        if (Array.isArray(errorArray) && errorArray.length > 0) {
                            formattedErrors[key] = errorArray[0];
                        } else if (typeof errorArray === 'string') {
                            formattedErrors[key] = errorArray;
                        }
                    });
                    
                    // Set form errors
                    if (Object.keys(formattedErrors).length > 0) {
                        setErrors(formattedErrors);
                        return;
                    }
                }
                
                // Show specific error message from backend
                const errorMessage = errorData.data || errorData.message || 'Failed to create product';
                showToast('error', errorMessage);
            } else {
                showToast('error', error.message || 'Failed to create product');
            }
        } finally {
            setLoading(false);
        }
    };




    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                <Button
                    variant="outline"
                    onClick={() => navigate('/products')}
                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                    className="flex items-center space-x-2"
                >
                    Back to Products
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Add Product</h1>
                    <p className="text-gray-600">Create a new product with category-based attributes</p>
                </div>
                </div>
            </div>
                <Form
                    onSubmit={handleSubmit}
                    submitText="Create Product"
                    cancelText="Cancel"
                    onCancel={() => navigate('/products')}
                    showCancel
                    loading={loading}
                    disabled={
                        categoryAttributes.length > 0 &&
                        categoryAttributes.some(attr => optionValues.filter(opt => opt.category_attribute_id === attr.id).length === 0)
                    }
                >
                {/* Basic Information */}
                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-semibold">Basic Information</h3>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormInput
                                name="name"
                                label="Product Name"
                                required
                            />

                            <CategorySelect
                                name="category_id"
                                label="Category"
                                placeholder="Select Category"
                                required
                                value={selectedCategoryId}
                                onChange={handleCategoryChange}
                            />

                            <FormInput
                                name="base_price"
                                label="Base Price"
                                type="number"
                                step="0.01"
                                required
                            />
                        </div>

                        <FormTextarea
                            name="description"
                            label="Description"
                            rows={3}
                        />

                        <FormFileUpload
                            name="image"
                            label="Product Image"
                            helperText="Upload a product image (PNG, JPG, JPEG, WEBP up to 5MB)"
                            accept="image/*"
                            maxSize={5}
                        />
                    </CardContent>
                </Card>

                {/* Store Taxes */}
                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-semibold">Store Taxes</h3>
                        <p className="text-sm text-gray-600">
                            Select applicable taxes for this product
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {taxesLoading ? (
                            <div className="text-center py-4">Loading taxes...</div>
                        ) : storeTaxes.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {storeTaxes.map((tax) => (
                                    <label key={tax.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                                        <input
                                            type="checkbox"
                                            checked={selectedTaxes.includes(tax.id)}
                                            onChange={(e) => handleTaxChange(tax.id, e.target.checked)}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-900">{tax.name}</div>
                                            <div className="text-sm text-gray-500">
                                                {tax.rate}% {tax.is_excluded === 1 ? '(Excluded)' : '(Included)'}
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-4 text-gray-500">
                                No taxes configured for this store
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Category Attributes and Options */}
                {categoryAttributes.length > 0 && (
                    <Card>
                        <CardHeader>
                            <h3 className="text-lg font-semibold">Product Variants and Add-ons</h3>
                            <p className="text-sm text-gray-600">
                                Configure variants and add-ons based on the selected category attributes
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {categoryAttributes.map((attribute) => {
                                const isExpanded = expandedAttributes.has(attribute.id);
                                const attributeOptions = optionValues.filter(opt => opt.category_attribute_id === attribute.id);
                                
                                return (
                                    <div key={attribute.id} className="border border-gray-200 rounded-lg overflow-hidden">
                                        {/* Accordion Header */}
                                        <div 
                                            className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                                            onClick={() => toggleAttributeExpand(attribute.id)}
                                        >
                                            <div className="flex items-center space-x-3">
                                                {isExpanded ? (
                                                    <ChevronDown className="w-5 h-5 text-gray-600" />
                                                ) : (
                                                    <ChevronRight className="w-5 h-5 text-gray-600" />
                                                )}
                                                <div>
                                                    <h4 className="font-medium text-gray-900">{attribute.name}</h4>
                                                    <p className="text-sm text-gray-600">
                                                        {attribute.allow_multiple ? 'Multiple selection' : 'Single selection'} • {attributeOptions.length} option(s)
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    addOptionValue(attribute.id);
                                                }}
                                                leftIcon={<Plus className="h-4 w-4" />}
                                            >
                                                Add Custom
                                            </Button>
                                        </div>

                                        {/* Accordion Content */}
                                        {isExpanded && (
                                            <div className="p-4 bg-white">
                                                <DragDropList
                                        items={optionValues
                                            .filter(opt => opt.category_attribute_id === attribute.id)
                                            .sort((a, b) => a.display_order - b.display_order)
                                        }
                                        onReorder={(reorderedOptions) => handleReorderOptions(attribute.id, reorderedOptions)}
                                        renderItem={(option, index, isDragging) => {
                                            const globalIndex = optionValues.findIndex(opt => 
                                                opt.category_attribute_id === attribute.id && 
                                                opt.value === option.value
                                            );
                                            return (
                                                <div className={`p-3 bg-gray-50 rounded-lg ${isDragging ? 'opacity-50' : ''}`}>
                                                    <div className="flex items-center space-x-3">
                                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                    Option Name
                                                                </label>
                                                                <input
                                                                    value={option.value}
                                                                    onChange={(e) => updateOptionValue(globalIndex, 'value', e.target.value)}
                                                                    placeholder="e.g., Regular, Medium, Large"
                                                                    className="w-full p-2 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-indigo-500"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                    Price Modifier
                                                                </label>
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    value={option.price_modifier}
                                                                    onChange={(e) => updateOptionValue(globalIndex, 'price_modifier', parseFloat(e.target.value) || 0)}
                                                                    placeholder="0.00"
                                                                    className="w-full p-2 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-indigo-500"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <Button
                                                                type="button"
                                                                variant="danger"
                                                                size="sm"
                                                                onClick={() => removeOptionValue(globalIndex)}
                                                                leftIcon={<Trash2 className="h-4 w-4" />}
                                                            >
                                                                Remove
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        }}
                                        className="space-y-2"
                                        itemClassName="cursor-move"
                                    />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                )}
            </Form>
        </div>
    );
};
