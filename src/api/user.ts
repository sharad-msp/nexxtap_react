import api from '../lib/axios';
import { User, UserRole } from '../store/useUserStore';

export const fetchUsers = (page = 1) => api.post('/user/list', { page });
export const fetchUserRoles = () => api.post('/user/role-list');
export const getUserDetails = (id: number) => api.post('/user/details', { user_id: id });
export const addOrUpdateUser = (payload: any) => api.post('/user/add-update', payload);
export const deleteUser = (id: number) => api.post('/user/remove', { user_id: id });
export const toggleUserStatus = (user_id: number, update_status: number) => api.post('/user/update-status', { user_id, update_status }); 