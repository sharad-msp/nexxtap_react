import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Package, Tag, DollarSign, FileText, Settings } from 'lucide-react';
import { Button } from '@/components/Button';
import { Card, CardContent, CardHeader } from '@/components/Card';
import { productApi } from '@/api';
import { formatDate } from '@/utils/formatDate';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useToast } from '@/components/Toast';
import type { Product, ProductDetailsResponse } from '@/types/product.types';
import { ViewDetailsSkeleton } from '@/components/Skeleton/ViewDetails';


export const ProductView = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { showToast } = useToast();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    
    usePageTitle({ title: 'View Product' });

    useEffect(() => {
        if (id) {
            fetchProduct(parseInt(id));
        }
    }, [id]);

    const fetchProduct = async (productId: number) => {
        setLoading(true);
        try {
            const response = await productApi.getById(productId);
            // Extract the actual product data from the response
            if (response.status === 1 && response.data) {
                setProduct(response.data);
            } else {
                throw new Error(response.message || 'Failed to fetch product');
            }
        } catch (error) {
            console.error('Error fetching product:', error);
            showToast('error', 'Failed to fetch product details');
            navigate('/products');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <ViewDetailsSkeleton />
        );
    }

    if (!product) {
        return (
            <div className="text-center py-12">
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
                        leftIcon={<ArrowLeft className="h-4 w-4" />}
                    >
                        Back
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                        <p className="text-gray-600">Product Details</p>
                    </div>
                </div>
                <Button
                    onClick={() => navigate(`/products/edit/${product.id}`)}
                    leftIcon={<Edit className="h-4 w-4" />}
                >
                    Edit Product
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Product Information */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center space-x-2">
                                <Package className="h-5 w-5 text-indigo-600" />
                                <h2 className="text-xl font-semibold">Basic Information</h2>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Product Name</label>
                                    <p className="mt-1 text-sm text-gray-900">{product.name}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Category</label>
                                    <p className="mt-1 text-sm text-gray-900">{product.category?.name || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Base Price</label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        ${product.base_price ? parseFloat(product.base_price.toString()).toFixed(2) : '0.00'}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Status</label>
                                    <span className={`mt-1 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                        product.status
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {product.status ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                            {product.description && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Description</label>
                                    <p className="mt-1 text-sm text-gray-900">{product.description}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Tax Information */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center space-x-2">
                                <Tag className="h-5 w-5 text-indigo-600" />
                                <h2 className="text-xl font-semibold">Tax & Pricing</h2>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* Base Price */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Base Price</label>
                                    <p className="mt-1 text-lg font-semibold text-gray-900">
                                        ${Number(product.base_price || 0).toFixed(2)}
                                    </p>
                                </div>

                                {/* Selected Taxes */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Applied Taxes</label>
                                    {product.taxes && product.taxes.length > 0 ? (
                                        <div className="space-y-2">
                                            {product.taxes.map((tax) => (
                                                <div key={tax.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                                            <Tag className="h-4 w-4 text-indigo-600" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">{tax.name}</p>
                                                            <p className="text-sm text-gray-500">{tax.tax_type_text}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-semibold text-gray-900">{tax.formatted_rate}</p>
                                                        <p className="text-xs text-gray-500">
                                                            {tax.is_excluded ? 'Excluded' : 'Included'}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-center">
                                            <Tag className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                            <p className="text-gray-500 text-sm">No taxes applied to this product</p>
                                        </div>
                                    )}
                                </div>

                                {/* Tax Summary */}
                                {product.taxes && product.taxes.length > 0 && (
                                    <div className="pt-4 border-t border-gray-200">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-gray-700">Total Tax Rate:</span>
                                            <span className="text-sm font-semibold text-gray-900">
                                                {Number(product.taxes.reduce((total, tax) => total + (Number(tax.rate) || 0), 0)).toFixed(2)}%
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Product Options */}
                    {product.product_option_values && product.product_option_values.length > 0 && (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center space-x-2">
                                    <Settings className="h-5 w-5 text-indigo-600" />
                                    <h2 className="text-xl font-semibold">Product Options</h2>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {product.product_option_values.map((option, index) => (
                                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-medium text-gray-900">{option.value}</h4>
                                                    <p className="text-sm text-gray-600">
                                                        Attribute ID: {option.category_attribute_id}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        Display Order: {option.display_order}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg font-semibold text-gray-900">
                                                        ${(() => {
                                                            const priceModifier = option.price_modifier;
                                                            if (typeof priceModifier === 'number') {
                                                                return priceModifier.toFixed(2);
                                                            } else if (typeof priceModifier === 'string') {
                                                                const parsed = parseFloat(priceModifier);
                                                                return isNaN(parsed) ? '0.00' : parsed.toFixed(2);
                                                            } else {
                                                                return '0.00';
                                                            }
                                                        })()}
                                                    </p>
                                                    <p className="text-sm text-gray-600">Price Modifier</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Product Image */}
                    {product.image_url && (
                        <Card>
                            <CardHeader>
                                <h3 className="text-lg font-semibold">Product Image</h3>
                            </CardHeader>
                            <CardContent>
                                <img
                                    src={product.image_url}
                                    alt={product.name}
                                    className="w-full h-64 object-cover rounded-lg"
                                />
                            </CardContent>
                        </Card>
                    )}

                    {/* Product Statistics */}
                    <Card>
                        <CardHeader>
                            <h3 className="text-lg font-semibold">Product Statistics</h3>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Total Options</span>
                                <span className="text-sm font-medium text-gray-900">
                                    {product.product_option_values?.length || 0}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Created</span>
                                <span className="text-sm font-medium text-gray-900">
                                    {formatDate(product.created_at)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Last Updated</span>
                                <span className="text-sm font-medium text-gray-900">
                                    {formatDate(product.updated_at)}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <h3 className="text-lg font-semibold">Quick Actions</h3>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button
                                onClick={() => navigate(`/products/edit/${product.id}`)}
                                className="w-full"
                                leftIcon={<Edit className="h-4 w-4" />}
                            >
                                Edit Product
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => navigate('/products')}
                                className="w-full"
                                leftIcon={<ArrowLeft className="h-4 w-4" />}
                            >
                                Back to Products
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};
