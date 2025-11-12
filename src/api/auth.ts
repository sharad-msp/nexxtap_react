import api from '../lib/axios';

export const login = (email: string, password: string) =>
  api.post('/login', { email, password }); 