import axios from 'axios';
import { config } from '@/config';

// Request deduplication cache
const pendingRequests = new Map<string, Promise<any>>();

// Generate a unique key for each request
const generateRequestKey = (method: string, url: string, data?: any, params?: any): string => {
  const key = `${method.toUpperCase()}:${url}`;
  const dataStr = data ? JSON.stringify(data) : '';
  const paramsStr = params ? JSON.stringify(params) : '';
  return `${key}:${dataStr}:${paramsStr}`;
};

const api = axios.create({
  baseURL: config.api.baseURL,
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor with deduplication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add timestamp for debugging
    config.metadata = { startTime: new Date() };
    
    return config;
  },
  (error) => {
    // Dispatch error event
    window.dispatchEvent(new CustomEvent('api:error', { 
      detail: { error, type: 'request' } 
    }));
    return Promise.reject(error);
  }
);

// Response interceptor with comprehensive error handling
api.interceptors.response.use(
  (response) => {
    // Calculate request duration
    const duration = response.config.metadata?.startTime 
      ? new Date().getTime() - response.config.metadata.startTime.getTime()
      : 0;
    
    // Dispatch success event
    window.dispatchEvent(new CustomEvent('api:success', { 
      detail: { 
        response, 
        duration,
        endpoint: response.config.url 
      } 
    }));
    
    return response;
  },
  (error) => {
    // Calculate request duration if available
    const duration = error.config?.metadata?.startTime 
      ? new Date().getTime() - error.config.metadata.startTime.getTime()
      : 0;

    // Enhanced error handling
    const errorDetails = {
      type: 'response',
      status: error.response?.status,
      statusText: error.response?.statusText,
      endpoint: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      duration,
      timestamp: new Date().toISOString(),
    };

    // Handle different types of errors
    if (!navigator.onLine) {
      // Network offline
      window.dispatchEvent(new CustomEvent('network:offline'));
      window.dispatchEvent(new CustomEvent('api:error', { 
        detail: { 
          ...errorDetails,
          error: { 
            ...error, 
            message: 'No internet connection',
            type: 'network'
          } 
        } 
      }));
    } else if (error.code === 'ECONNABORTED') {
      // Request timeout
      window.dispatchEvent(new CustomEvent('api:error', { 
        detail: { 
          ...errorDetails,
          error: { 
            ...error, 
            message: 'Request timeout',
            type: 'timeout'
          } 
        } 
      }));
    } else if (error.code === 'ERR_NETWORK') {
      // Network error (server unreachable)
      window.dispatchEvent(new CustomEvent('server:unreachable'));
      window.dispatchEvent(new CustomEvent('api:error', { 
        detail: { 
          ...errorDetails,
          error: { 
            ...error, 
            message: 'Server unreachable',
            type: 'network'
          } 
        } 
      }));
    } else if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      
      if (status === 401) {
        // Unauthorized - clear token and redirect
        localStorage.removeItem('auth_token');
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        window.location.href = '/login';
      } else if (status >= 500) {
        // Server error
        window.dispatchEvent(new CustomEvent('server:error', { 
          detail: { status, endpoint: error.config?.url } 
        }));
      }
      
      window.dispatchEvent(new CustomEvent('api:error', { 
        detail: { 
          ...errorDetails,
          error: { 
            ...error, 
            type: 'server'
          } 
        } 
      }));
    } else {
      // Unknown error
      window.dispatchEvent(new CustomEvent('api:error', { 
        detail: { 
          ...errorDetails,
          error: { 
            ...error, 
            type: 'unknown'
          } 
        } 
      }));
    }

    return Promise.reject(error);
  }
);

// Simple loading state management to avoid circular dependencies
let loadingCount = 0;
let loadingText = 'Loading...';

// Loading state management
export const loadingManager = {
  show: (text = 'Loading...') => {
    loadingCount++;
    loadingText = text;
    // Dispatch custom event for loading state
    window.dispatchEvent(new CustomEvent('loading:show', { detail: { text } }));
  },
  
  hide: () => {
    loadingCount = Math.max(0, loadingCount - 1);
    if (loadingCount === 0) {
      window.dispatchEvent(new CustomEvent('loading:hide'));
    }
  },
  
  getState: () => ({
    isLoading: loadingCount > 0,
    loadingText,
    loadingCount,
  }),
};

// Enhanced deduplication with better key generation for GET requests
const generateGetRequestKey = (url: string, params?: any): string => {
  // For GET requests, include query parameters in the key but exclude timestamp-like params
  const cleanParams = params ? { ...params } : {};
  
  // Remove common cache-busting parameters
  delete cleanParams._t;
  delete cleanParams.timestamp;
  delete cleanParams.cache_buster;
  
  const paramsStr = Object.keys(cleanParams).length > 0 ? JSON.stringify(cleanParams) : '';
  return `GET:${url}:${paramsStr}`;
};

// Create a wrapper for API calls with automatic loading and enhanced deduplication
export const apiWithLoading = {
  get: async (url: string, config?: any) => {
    const requestKey = generateGetRequestKey(url, config?.params);
    
    // Check if there's already a pending request for the exact same GET request
    if (pendingRequests.has(requestKey)) {
      return pendingRequests.get(requestKey);
    }

    const requestPromise = (async () => {
      try {
        loadingManager.show('Loading data...');
        const response = await api.get(url, config);
        return response;
      } finally {
        loadingManager.hide();
        // Keep GET requests in cache for a short time to prevent immediate duplicates
        setTimeout(() => {
          pendingRequests.delete(requestKey);
        }, 100);
      }
    })();

    pendingRequests.set(requestKey, requestPromise);
    return requestPromise;
  },

  post: async (url: string, data?: any, config?: any) => {
    // For POST requests, don't deduplicate as aggressively since they might have side effects
    const requestKey = generateRequestKey('POST', url, data, config?.params);
    
    const requestPromise = (async () => {
      try {
        loadingManager.show('Processing request...');
        const response = await api.post(url, data, config);
        return response;
      } finally {
        loadingManager.hide();
        pendingRequests.delete(requestKey);
      }
    })();

    pendingRequests.set(requestKey, requestPromise);
    return requestPromise;
  },

  put: async (url: string, data?: any, config?: any) => {
    const requestKey = generateRequestKey('PUT', url, data, config?.params);
    
    const requestPromise = (async () => {
      try {
        loadingManager.show('Updating data...');
        const response = await api.put(url, data, config);
        return response;
      } finally {
        loadingManager.hide();
        pendingRequests.delete(requestKey);
      }
    })();

    pendingRequests.set(requestKey, requestPromise);
    return requestPromise;
  },

  delete: async (url: string, config?: any) => {
    const requestKey = generateRequestKey('DELETE', url, undefined, config?.params);
    
    const requestPromise = (async () => {
      try {
        loadingManager.show('Deleting data...');
        const response = await api.delete(url, config);
        return response;
      } finally {
        loadingManager.hide();
        pendingRequests.delete(requestKey);
      }
    })();

    pendingRequests.set(requestKey, requestPromise);
    return requestPromise;
  },

  patch: async (url: string, data?: any, config?: any) => {
    const requestKey = generateRequestKey('PATCH', url, data, config?.params);
    
    const requestPromise = (async () => {
      try {
        loadingManager.show('Updating data...');
        const response = await api.patch(url, data, config);
        return response;
      } finally {
        loadingManager.hide();
        pendingRequests.delete(requestKey);
      }
    })();

    pendingRequests.set(requestKey, requestPromise);
    return requestPromise;
  },
};

// Export apiClient for compatibility
export const apiClient = api;

export default api;
