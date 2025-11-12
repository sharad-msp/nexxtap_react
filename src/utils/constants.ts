// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  PRODUCTS: {
    LIST: '/products',
    DETAILS: '/products/:id',
    CREATE: '/products',
    UPDATE: '/products/:id',
    DELETE: '/products/:id',
  },
  CATEGORIES: {
    LIST: '/categories',
    DETAILS: '/categories/:id',
    CREATE: '/categories',
    UPDATE: '/categories/:id',
    DELETE: '/categories/:id',
  },
  USERS: {
    LIST: '/users',
    DETAILS: '/users/:id',
    CREATE: '/users',
    UPDATE: '/users/:id',
    DELETE: '/users/:id',
  },
} as const;

// Application Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  PRODUCTS: {
    LIST: '/products',
    ADD: '/products/add',
    EDIT: '/products/edit/:id',
    VIEW: '/products/view/:id',
  },
  CATEGORIES: {
    LIST: '/categories',
    ADD: '/categories/add',
    EDIT: '/categories/edit/:id',
    VIEW: '/categories/view/:id',
  },
  USERS: {
    LIST: '/users',
    ADD: '/users/add',
    EDIT: '/users/edit/:id',
    VIEW: '/users/view/:id',
  },
} as const;

// Status Constants
export const STATUS = {
  ACTIVE: '1',
  INACTIVE: '0',
} as const;

// Pagination Constants
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

// Form Validation Constants
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
} as const;

// UI Constants
export const UI = {
  TOAST_DURATION: 3000,
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 200,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PASSWORD: 'Password must be at least 8 characters long',
  NETWORK_ERROR: 'Network error. Please try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  NOT_FOUND: 'The requested resource was not found',
  SERVER_ERROR: 'Server error. Please try again later.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  CREATED: 'Item created successfully',
  UPDATED: 'Item updated successfully',
  DELETED: 'Item deleted successfully',
  SAVED: 'Changes saved successfully',
} as const;
