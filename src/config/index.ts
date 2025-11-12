

export const config = {
  api: {
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/admin',
    timeout: 10000,
  },
  app: {
    name: 'NexxPos Admin Portal',
    version: '1.0.0',
  },
  auth: {
    tokenKey: 'auth_token',
    refreshTokenKey: 'refreshToken',
  },
} as const;
