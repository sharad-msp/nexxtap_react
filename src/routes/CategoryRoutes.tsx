import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CategoryList from '@/pages/categories/CategoryList';
import CategoryAdd from '@/pages/categories/CategoryAdd';
import CategoryEdit from '@/pages/categories/CategoryEdit';
import CategoryView from '@/pages/categories/CategoryView';

export const CategoryRoutes = () => {
  return (
    <Routes>
      <Route index element={<CategoryList />} />
      <Route path="add" element={<CategoryAdd />} />
      <Route path="edit/:id" element={<CategoryEdit />} />
      <Route path="view/:id" element={<CategoryView />} />
    </Routes>
  );
};
