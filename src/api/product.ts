import api, { apiWithLoading } from '@/lib/axios';
import type { Product, CreateProductRequest, UpdateProductRequest, CategoryAttribute } from '@/types/product.types';

export const productApi = {
  // Get all products - using apiWithLoading for better deduplication
  getAll: async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
    status?: string;
    category_id?: number;
  }): Promise<{ data: Product[]; meta: any }> => {
    const response = await apiWithLoading.get('/product', { params });
    return response.data;
  },

  // Get product by ID - using apiWithLoading for better deduplication
  getById: async (id: number): Promise<Product> => {
    const response = await apiWithLoading.get(`/product/${id}`);
    return response.data;
  },

  // Create or update product using unified endpoint
  createOrUpdate: async (data: CreateProductRequest | UpdateProductRequest, isUpdate: boolean = false): Promise<Product> => {
    const formData = new FormData();
    
    // Add is_update flag
    formData.append('is_update', isUpdate ? '1' : '0');
    
    // Add product_id if updating
    if (isUpdate && 'id' in data && data.id) {
      formData.append('product_id', data.id.toString());
    }
    
    // Add basic fields
    formData.append('name', data.name || '');
    formData.append('category_id', data.category_id?.toString() || '');
    formData.append('base_price', data.base_price?.toString() || '0');
    if (data.description) formData.append('description', data.description);
    if (data.status !== undefined) formData.append('status', data.status ? '1' : '0');
    if (data.image) formData.append('image', data.image);
    
    // Add taxes array if provided
    if (data.tax_ids && data.tax_ids.length > 0) {
      data.tax_ids.forEach((taxId, index) => {
        formData.append(`taxes[${index}][tax_id]`, taxId.toString());
      });
    }
    
    // Add option values if provided
    if (data.option_values && data.option_values.length > 0) {
      data.option_values.forEach((option, index) => {
        if (option.id) {
          formData.append(`option_values[${index}][id]`, option.id.toString());
        }
        formData.append(`option_values[${index}][category_attribute_id]`, option.category_attribute_id.toString());
        formData.append(`option_values[${index}][value]`, option.value);
        formData.append(`option_values[${index}][price_modifier]`, option.price_modifier.toString());
        if (option.display_order !== undefined) {
          formData.append(`option_values[${index}][display_order]`, option.display_order.toString());
        }
      });
    }
    
    // Add deleted option IDs if provided (for updates)
    if ('deleted_ids' in data && data.deleted_ids && data.deleted_ids.length > 0) {
      data.deleted_ids.forEach((deletedId, index) => {
        formData.append(`deleted_ids[${index}]`, deletedId.toString());
      });
    }

    const response = await api.post('/product', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Create product (alias for createOrUpdate with isUpdate = false)
  create: async (data: CreateProductRequest): Promise<Product> => {
    return productApi.createOrUpdate(data, false);
  },

  // Update product (alias for createOrUpdate with isUpdate = true)
  update: async (id: number, data: UpdateProductRequest): Promise<Product> => {
    const updateData = { ...data, id };
    return productApi.createOrUpdate(updateData, true);
  },

  // Get category attributes
  getCategoryAttributes: async (categoryId: number): Promise<CategoryAttribute[]> => {
    const response = await api.post('/product/category-attributes', { category_id: categoryId });
    return response.data.data || [];
  },

  // Delete product
  delete: async (id: number): Promise<void> => {
    await api.delete(`/product/${id}`);
  },

  // Update product status
  updateStatus: async (id: number, status: boolean): Promise<void> => {
    await api.post(`/product/update-status`, { id, status: status ? 1 : 0 });
  },
}; 