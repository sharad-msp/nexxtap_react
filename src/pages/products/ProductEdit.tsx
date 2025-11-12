import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/Button';
import { Card, CardContent, CardHeader } from '@/components/Card';
import { Form, FormInput, FormSelect, FormTextarea, FormFileUpload } from '@/components/Form';
import { CategorySelect } from '@/components/CategorySelect';
import { DragDropList } from '@/components/DragDropList';
import { useToast } from '@/components';
import { usePageTitle } from '@/hooks/usePageTitle';
import Swal from 'sweetalert2';
import { productApi, taxApi } from '@/api';
import type { Product, ProductCategoryAttribute, AttributeOptionValues } from '@/types/product.types';
import type { SimpleTax } from '@/types';
import { EditPageSkeleton } from '@/components/Skeleton/EditDetails';

export const ProductEdit = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { showToast } = useToast();
    const [product, setProduct] = useState<Product | null>(null);
    const [categoryAttributes, setCategoryAttributes] = useState<ProductCategoryAttribute[]>([]);
    const [storeTaxes, setStoreTaxes] = useState<SimpleTax[]>([]);
    const [loading, setLoading] = useState(false);
    const [productLoading, setProductLoading] = useState(true);
    const [taxesLoading, setTaxesLoading] = useState(false);

    const [attributeOptionValues, setAttributeOptionValues] = useState<AttributeOptionValues[]>([]);
    const [selectedTaxes, setSelectedTaxes] = useState<number[]>([]);
    const [deletedOptionIds, setDeletedOptionIds] = useState<number[]>([]);
    const [expandedAttributes, setExpandedAttributes] = useState<Set<number>>(new Set());
    
    usePageTitle({ title: 'Edit Product' });

    useEffect(() => {
        if (id) {
            fetchProduct(parseInt(id));
            fetchStoreTaxes();
        }
    }, [id]);

    const fetchProduct = async (productId: number) => {
        setProductLoading(true);
        try {
            const response = await productApi.getById(productId);
            const productData = (response as any).data || response;
            
            setProduct(productData);
            
            // Set selected taxes
            if (productData.selected_tax_ids && productData.selected_tax_ids.length > 0) {
                setSelectedTaxes(productData.selected_tax_ids);
            } else if (productData.taxes && Array.isArray(productData.taxes)) {
                setSelectedTaxes(productData.taxes.map((tax: any) => tax.id));
            } else {
                setSelectedTaxes([]);
            }

            // Process options from API response
            if (productData.options && Array.isArray(productData.options)) {
                // Map API response to AttributeOptionValues format
                const mappedOptions = productData.options.map((attr: any) => ({
                    id: attr.id,
                    name: attr.name,
                    allow_multiple: attr.allow_multiple,
                    values: (attr.values || []).map((val: any) => ({
                        id: val.id,
                        value: val.value,
                        price_modifier: parseFloat(val.price_modifier) || 0,
                        display_order: val.display_order || 0
                    }))
                }));
                
                setAttributeOptionValues(mappedOptions);
                
                // Auto-expand attributes that have values
                const expandedIds = new Set<number>();
                mappedOptions.forEach((attr: AttributeOptionValues) => {
                    if (attr.values && attr.values.length > 0) {
                        expandedIds.add(attr.id);
                    }
                });
                setExpandedAttributes(expandedIds);
            }

            // Fetch category attributes for reference
            if (productData.category_id) {
                await fetchCategoryAttributes(productData.category_id);
            }
        } catch (error) {
            console.error('Error fetching product:', error);
            showToast('error', 'Failed to fetch product details');
            navigate('/products');
        } finally {
            setProductLoading(false);
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
        } catch (error) {
            console.error('Error fetching category attributes:', error);
            setCategoryAttributes([]);
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
        setAttributeOptionValues(prev => 
            prev.map(attr => {
                if (attr.id === attributeId) {
                    const currentValues = attr.values || [];
                    const maxDisplayOrder = currentValues.length > 0 
                        ? Math.max(...currentValues.map(v => v.display_order))
                        : 0;
                    
                    return {
                        ...attr,
                        values: [
                            ...currentValues,
                            {
                                id: 0, // Temporary ID for new options
                                value: '',
                                price_modifier: 0,
                                display_order: maxDisplayOrder + 1
                            }
                        ]
                    };
                }
                return attr;
            })
        );
        
        // Auto-expand the attribute when adding a new option
        setExpandedAttributes(prev => new Set(prev).add(attributeId));
    };
    
    const removeOptionValue = (attributeId: number, index: number) => {
        setAttributeOptionValues(prev => 
            prev.map(attr => {
                if (attr.id === attributeId && attr.values) {
                    const optionToRemove = attr.values[index];
                    
                    // Track deletion if it has a real ID
                    if (optionToRemove.id && optionToRemove.id > 0) {
                        setDeletedOptionIds(prevDeleted => [...prevDeleted, optionToRemove.id]);
                    }
                    
                    // Remove the option
                    return {
                        ...attr,
                        values: attr.values.filter((_, i) => i !== index)
                    };
                }
                return attr;
            })
        );
    };
    
    const updateOptionValue = (attributeId: number, index: number, field: string, value: any) => {
        setAttributeOptionValues(prev =>
            prev.map(attr => {
                if (attr.id === attributeId && attr.values) {
                    return {
                        ...attr,
                        values: attr.values.map((opt, i) => 
                            i === index ? { ...opt, [field]: value } : opt
                        )
                    };
                }
                return attr;
            })
        );
    };
    
    const handleReorderOptions = (attributeId: number, reordered: any[]) => {
        setAttributeOptionValues(prev =>
            prev.map(attr => {
                if (attr.id === attributeId) {
                    // Update display_order based on new position
                    const reorderedWithOrder = reordered.map((item, index) => ({
                        ...item,
                        display_order: index + 1
                    }));
                    return { ...attr, values: reorderedWithOrder };
                }
                return attr;
            })
        );
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
            // Prepare option values from attributeOptionValues
            const optionValues = attributeOptionValues.flatMap(attr => 
                (attr.values || [])
                    .filter(opt => opt.value.trim() !== '')
                    .map(opt => ({
                        id: opt.id > 0 ? opt.id : undefined, // Only include ID if it's a real ID
                        category_attribute_id: attr.id,
                        value: opt.value,
                        price_modifier: parseFloat(opt.price_modifier.toString()) || 0,
                        display_order: opt.display_order
                    }))
            );

            // Prepare payload
            const payload = {
                ...values,
                base_price: parseFloat(values.base_price),
                category_id: product?.category_id, // Keep original category
                tax_ids: selectedTaxes,
                option_values: optionValues,
                deleted_ids: deletedOptionIds.length > 0 ? deletedOptionIds : undefined
            };

            // Remove status from payload as it's handled separately
            delete payload.status;
            
            // Only include image if it's actually a file
            if (values.image && values.image instanceof File) {
                payload.image = values.image;
            } else {
                delete payload.image;
            }

            // Update product details
            const response = await productApi.update(parseInt(id!), payload);
            
            // Update status separately if it has changed
            const newStatus = values.status === 'true';
            if (product && product.status !== newStatus) {
                await productApi.updateStatus(parseInt(id!), newStatus);
            }
            
            if (response.status == true) {
                showToast('success', response.message);
                navigate('/products');
            } else {
                showToast('error', response.message);
            }
        } catch (error: any) {
            console.error('Error updating product:', error);
            
            // Handle API error response
            if (error.response?.data) {
                const errorData = error.response.data;
                
                if (errorData.errors && typeof errorData.errors === 'object') {
                    const formattedErrors: Record<string, string> = {};
                    Object.keys(errorData.errors).forEach(key => {
                        const errorArray = errorData.errors[key];
                        if (Array.isArray(errorArray) && errorArray.length > 0) {
                            formattedErrors[key] = errorArray[0];
                        } else if (typeof errorArray === 'string') {
                            formattedErrors[key] = errorArray;
                        }
                    });
                    
                    if (Object.keys(formattedErrors).length > 0) {
                        setErrors(formattedErrors);
                        return;
                    }
                }
                
                const errorMessage = errorData.data || errorData.message || 'Failed to update product';
                showToast('error', errorMessage);
            } else {
                showToast('error', error.message || 'Failed to update product');
            }
        } finally {
            setLoading(false);
        }
    };

    if (productLoading) {
        return <EditPageSkeleton />;
    }

    if (!product) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-600">Product not found</p>
                <Button onClick={() => navigate('/products')} className="mt-4">
                    Back to Products
                </Button>
            </div>
        );
    }

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
                        <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
                        <p className="text-gray-600">Update product information and settings</p>
                    </div>
                </div>
            </div>

            <Form
                key={product.id}
                onSubmit={handleSubmit}
                submitText="Update Product"
                cancelText="Cancel"
                onCancel={() => navigate('/products')}
                showCancel
                loading={loading}
                initialValues={{
                    name: product.name || '',
                    category_id: product.category_id?.toString() || '',
                    base_price: product.base_price || 0,
                    description: product.description || '',
                    status: product.status ? 'true' : 'false',
                    ...(product.image && { image: product.image })
                }}
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
                                value={product.category_id?.toString()}
                                disabled={true}
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormSelect
                                name="status"
                                label="Product Status"
                                options={[
                                    { value: 'true', label: 'Active' },
                                    { value: 'false', label: 'Inactive' }
                                ]}
                                required
                            />
                        </div>

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
                {attributeOptionValues.length > 0 && (
                    <Card>
                        <CardHeader>
                            <h3 className="text-lg font-semibold">Product Variants and Add-ons</h3>
                            <p className="text-sm text-gray-600">
                                Configure variants and add-ons based on the selected category attributes
                            </p>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            {attributeOptionValues.map((attribute) => {
                                const isExpanded = expandedAttributes.has(attribute.id);
                                const sortedOptions = (attribute.values || []).sort((a, b) => a.display_order - b.display_order);

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
                                                        {attribute.allow_multiple ? 'Multiple selection' : 'Single selection'} • {sortedOptions.length} option(s)
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
                                                Add Option
                                            </Button>
                                        </div>

                                        {/* Accordion Content */}
                                        {isExpanded && (
                                            <div className="p-4 bg-white">
                                                {sortedOptions.length > 0 ? (
                                                    <DragDropList
                                                        items={sortedOptions}
                                                        onReorder={(reordered) => handleReorderOptions(attribute.id, reordered)}
                                                        renderItem={(option, index, isDragging) => (
                                                            <div key={option.id || index} className={`p-3 bg-gray-50 rounded-lg ${isDragging ? 'opacity-50' : ''}`}>
                                                                <div className="flex items-center space-x-3">
                                                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                        <div>
                                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                                                            <input
                                                                                value={option.value}
                                                                                onChange={(e) => updateOptionValue(attribute.id, index, 'value', e.target.value)}
                                                                                placeholder="e.g., Regular, Medium, Large"
                                                                                className="w-full p-2 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-indigo-500"
                                                                            />
                                                                        </div>

                                                                        <div>
                                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Price Modifier</label>
                                                                            <input
                                                                                type="number"
                                                                                step="0.01"
                                                                                value={option.price_modifier}
                                                                                onChange={(e) =>
                                                                                    updateOptionValue(attribute.id, index, 'price_modifier', parseFloat(e.target.value) || 0)
                                                                                }
                                                                                placeholder="0.00"
                                                                                className="w-full p-2 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-indigo-500"
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                    <Button
                                                                        type="button"
                                                                        variant="danger"
                                                                        size="sm"
                                                                        onClick={() => removeOptionValue(attribute.id, index)}
                                                                        leftIcon={<Trash2 className="h-4 w-4" />}
                                                                    >
                                                                        Remove
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        )}
                                                        className="space-y-2"
                                                        itemClassName="cursor-move"
                                                    />
                                                ) : (
                                                    <div className="text-center py-8 text-gray-500">
                                                        No options added yet. Click "Add Option" to create one.
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                )}

                {/* Deletion Info */}
                {deletedOptionIds.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-sm text-yellow-800">
                            <strong>Pending Deletions:</strong> {deletedOptionIds.length} option(s) will be removed when you save.
                        </p>
                    </div>
                )}
            </Form>
        </div>
    );
};