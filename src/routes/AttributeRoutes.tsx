import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AttributeList from '@/pages/attributes/AttributeList';
import AttributeAdd from '@/pages/attributes/AttributeAdd';
import AttributeEdit from '@/pages/attributes/AttributeEdit';
import AttributeView from '@/pages/attributes/AttributeView';

export const AttributeRoutes = () => {
  return (
    <Routes>
      <Route index element={<AttributeList />} />
      <Route path="add" element={<AttributeAdd />} />
      <Route path="edit/:id" element={<AttributeEdit />} />
      <Route path="view/:id" element={<AttributeView />} />
    </Routes>
  );
};

