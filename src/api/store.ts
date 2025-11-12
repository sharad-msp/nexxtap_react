import api from '@/lib/axios';

export const fetchStores = (page = 1) => api.get('/stores', { params: { page } });
export const getStoreDetails = (store_id: number) => api.get('/stores/'+store_id);
export const addOrUpdateStore = (payload: any) => api.post('/stores', payload);
export const deleteStore = (store_id: number) => api.post('/stores/remove', { store_id });
export const toggleStoreStatus = (store_id: number, update_status: number) => api.post('/Store/update-status', { store_id, update_status }); 
export const autoStoreLogin = (payload: any) => api.post('/stores-login', payload);