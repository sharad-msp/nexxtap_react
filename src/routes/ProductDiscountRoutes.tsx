import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProductDiscountList, ProductDiscountAdd, ProductDiscountEdit, ProductDiscountView } from '@/pages';

export const ProductDiscountRoutes: React.FC = () => {
  return (
    <Routes>
      <Route index element={<ProductDiscountList />} />
      <Route path="add" element={<ProductDiscountAdd />} />
      <Route path="edit/:id" element={<ProductDiscountEdit />} />
      <Route path="view/:id" element={<ProductDiscountView />} />
    </Routes>
  );
};
