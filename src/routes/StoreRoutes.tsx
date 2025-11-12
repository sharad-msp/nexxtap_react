import React from 'react';
import { Routes, Route } from 'react-router-dom';
import StoreList from '@/pages/stores/StoreList';
import StoreAdd from '@/pages/stores/StoreAdd';
import StoreEdit from '@/pages/stores/StoreEdit';
import StoreView from '@/pages/stores/StoreView';

const StoreRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<StoreList />} />
      <Route path="/add" element={<StoreAdd />} />
      <Route path="/edit/:id" element={<StoreEdit />} />
      <Route path="/view/:id" element={<StoreView />} />
    </Routes>
  );
};

export default StoreRoutes;
