import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProductList from '@/pages/products/ProductList';
import { ProductAdd } from '@/pages/products/ProductAdd';
import { ProductEdit } from '@/pages/products/ProductEdit';
import { ProductView } from '@/pages/products/ProductView';

export const ProductRoutes = () => {
  return (
    <Routes>
      <Route index element={<ProductList />} />
      <Route path="add" element={<ProductAdd />} />
      <Route path="edit/:id" element={<ProductEdit />} />
      <Route path="view/:id" element={<ProductView />} />
    </Routes>
  );
};
