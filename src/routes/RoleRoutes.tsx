import React from 'react';
import { Routes, Route } from 'react-router-dom';
import RoleList from '@/pages/roles/RoleList';
import RoleAdd from '@/pages/roles/RoleAdd';
import RoleEdit from '@/pages/roles/RoleEdit';
import RoleView from '@/pages/roles/RoleView';

const RoleRoutes: React.FC = () => {
  return (
    <Routes>
      <Route index element={<RoleList />} />
      <Route path="add" element={<RoleAdd />} />
      <Route path="edit/:id" element={<RoleEdit />} />
      <Route path="view/:id" element={<RoleView />} />
    </Routes>
  );
};

export default RoleRoutes;
