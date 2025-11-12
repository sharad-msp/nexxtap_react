import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { TaxList, TaxAdd, TaxEdit, TaxView } from '@/pages';

export const TaxRoutes: React.FC = () => {
  return (
    <Routes>
      <Route index element={<TaxList />} />
      <Route path="add" element={<TaxAdd />} />
      <Route path="edit/:id" element={<TaxEdit />} />
      <Route path="view/:id" element={<TaxView />} />
    </Routes>
  );
};
