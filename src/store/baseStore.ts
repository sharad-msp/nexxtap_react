import { create } from 'zustand';

export interface BaseStoreState {
  isLoading: boolean;
  isInitialized: boolean;
  lastFetchTime: number;
  error: string | null;
}

export interface BaseStoreActions {
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setInitialized: (initialized: boolean) => void;
  setLastFetchTime: (time: number) => void;
  reset: () => void;
}

export const createBaseStore = <T>(
  initialState: T
) => {
  const baseState: BaseStoreState = {
    isLoading: false,
    isInitialized: false,
    lastFetchTime: 0,
    error: null,
  };

  return create<T & BaseStoreState & BaseStoreActions>((set, get) => ({
    ...initialState,
    ...baseState,

    setLoading: (loading: boolean) => set({ isLoading: loading }),
    setError: (error: string | null) => set({ error }),
    setInitialized: (initialized: boolean) => set({ isInitialized: initialized }),
    setLastFetchTime: (time: number) => set({ lastFetchTime: time }),
    reset: () => set({ ...baseState, ...initialState }),
  }));
};

// Helper function to prevent multiple API calls
export const withApiCallProtection = <T extends any[], R>(
  apiFunction: (...args: T) => Promise<R>,
  store: { getState: () => { isLoading: boolean; setLoading: (loading: boolean) => void } }
) => {
  return async (...args: T): Promise<R> => {
    const state = store.getState();
    
    if (state.isLoading) {
      throw new Error('API call already in progress');
    }

    state.setLoading(true);
    try {
      const result = await apiFunction(...args);
      return result;
    } finally {
      state.setLoading(false);
    }
  };
};

// Helper function to cache API calls
export const withCache = <T extends any[], R>(
  apiFunction: (...args: T) => Promise<R>,
  cacheKey: string,
  cacheTime: number = 5 * 60 * 1000 // 5 minutes default
) => {
  const cache = new Map<string, { data: R; timestamp: number }>();

  return async (...args: T): Promise<R> => {
    const key = `${cacheKey}:${JSON.stringify(args)}`;
    const cached = cache.get(key);

    if (cached && Date.now() - cached.timestamp < cacheTime) {
      return cached.data;
    }

    const result = await apiFunction(...args);
    cache.set(key, { data: result, timestamp: Date.now() });
    return result;
  };
};
