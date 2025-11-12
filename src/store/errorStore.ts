import { create } from 'zustand';

export interface ApiError {
  id: string;
  type: 'network' | 'server' | 'timeout' | 'unknown';
  status?: number;
  message: string;
  endpoint?: string;
  timestamp: Date;
  retryCount: number;
  maxRetries: number;
  canRetry: boolean;
}

interface ErrorState {
  errors: ApiError[];
  isOffline: boolean;
  isServerDown: boolean;
  lastServerCheck: Date | null;
  retryQueue: string[]; // Array of error IDs to retry
}

interface ErrorActions {
  addError: (error: Omit<ApiError, 'id' | 'timestamp' | 'retryCount'>) => string;
  removeError: (id: string) => void;
  clearErrors: () => void;
  setOfflineStatus: (isOffline: boolean) => void;
  setServerStatus: (isServerDown: boolean) => void;
  updateLastServerCheck: () => void;
  incrementRetryCount: (id: string) => void;
  addToRetryQueue: (id: string) => void;
  removeFromRetryQueue: (id: string) => void;
  clearRetryQueue: () => void;
  getErrorById: (id: string) => ApiError | undefined;
  getRetryableErrors: () => ApiError[];
}

type ErrorStore = ErrorState & ErrorActions;

export const useErrorStore = create<ErrorStore>((set, get) => ({
  errors: [],
  isOffline: false,
  isServerDown: false,
  lastServerCheck: null,
  retryQueue: [],

  addError: (errorData) => {
    const id = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const error: ApiError = {
      ...errorData,
      id,
      timestamp: new Date(),
      retryCount: 0,
    };

    set((state) => ({
      errors: [...state.errors, error],
    }));

    return id;
  },

  removeError: (id) => {
    set((state) => ({
      errors: state.errors.filter(error => error.id !== id),
      retryQueue: state.retryQueue.filter(queueId => queueId !== id),
    }));
  },

  clearErrors: () => {
    set({
      errors: [],
      retryQueue: [],
    });
  },

  setOfflineStatus: (isOffline) => {
    set({ isOffline });
  },

  setServerStatus: (isServerDown) => {
    set({ isServerDown });
  },

  updateLastServerCheck: () => {
    set({ lastServerCheck: new Date() });
  },

  incrementRetryCount: (id) => {
    set((state) => ({
      errors: state.errors.map(error =>
        error.id === id
          ? { ...error, retryCount: error.retryCount + 1 }
          : error
      ),
    }));
  },

  addToRetryQueue: (id) => {
    set((state) => ({
      retryQueue: state.retryQueue.includes(id) 
        ? state.retryQueue 
        : [...state.retryQueue, id],
    }));
  },

  removeFromRetryQueue: (id) => {
    set((state) => ({
      retryQueue: state.retryQueue.filter(queueId => queueId !== id),
    }));
  },

  clearRetryQueue: () => {
    set({ retryQueue: [] });
  },

  getErrorById: (id) => {
    return get().errors.find(error => error.id === id);
  },

  getRetryableErrors: () => {
    return get().errors.filter(error => 
      error.canRetry && error.retryCount < error.maxRetries
    );
  },
}));

// Error classification helper
export const classifyError = (error: any): Omit<ApiError, 'id' | 'timestamp' | 'retryCount'> => {
  // Network/connectivity errors
  if (!navigator.onLine) {
    return {
      type: 'network',
      message: 'No internet connection. Please check your network and try again.',
      canRetry: true,
      maxRetries: 3,
    };
  }

  // Axios error handling
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return {
      type: 'timeout',
      message: 'Request timed out. Please try again.',
      canRetry: true,
      maxRetries: 3,
    };
  }

  if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
    return {
      type: 'network',
      message: 'Network error. Please check your connection and try again.',
      canRetry: true,
      maxRetries: 3,
    };
  }

  // Server errors
  if (error.response) {
    const status = error.response.status;
    const endpoint = error.config?.url;

    if (status >= 500) {
      return {
        type: 'server',
        status,
        message: 'Server error. Our team has been notified. Please try again later.',
        endpoint,
        canRetry: true,
        maxRetries: 2,
      };
    }

    if (status === 404) {
      return {
        type: 'server',
        status,
        message: 'The requested resource was not found.',
        endpoint,
        canRetry: false,
        maxRetries: 0,
      };
    }

    if (status === 403) {
      return {
        type: 'server',
        status,
        message: 'You do not have permission to access this resource.',
        endpoint,
        canRetry: false,
        maxRetries: 0,
      };
    }

    if (status === 401) {
      return {
        type: 'server',
        status,
        message: 'Authentication required. Please log in again.',
        endpoint,
        canRetry: false,
        maxRetries: 0,
      };
    }

    return {
      type: 'server',
      status,
      message: error.response.data?.message || 'An error occurred. Please try again.',
      endpoint,
      canRetry: status >= 500,
      maxRetries: status >= 500 ? 2 : 0,
    };
  }

  // Unknown errors
  return {
    type: 'unknown',
    message: error.message || 'An unexpected error occurred. Please try again.',
    canRetry: true,
    maxRetries: 1,
  };
};
