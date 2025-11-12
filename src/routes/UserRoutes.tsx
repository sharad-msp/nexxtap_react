import React from 'react';
import { Routes, Route } from 'react-router-dom';
import UserList from '@/pages/users/UserList';
import UserAdd from '@/pages/users/UserAdd';
import UserEdit from '@/pages/users/UserEdit';
import UserView from '@/pages/users/UserView';

const UserRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<UserList />} />
      <Route path="/add" element={<UserAdd />} />
      <Route path="/edit/:id" element={<UserEdit />} />
      <Route path="/view/:id" element={<UserView />} />
    </Routes>
  );
};

export default UserRoutes;
