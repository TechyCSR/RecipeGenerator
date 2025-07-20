import axios from 'axios';

// Get API URL with fallback
const getApiUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.REACT_APP_API_URL || 'https://apis.recipe.techycsr.me';
  }
  return process.env.REACT_APP_API_URL || 'http://localhost:5000';
};

// Create axios instance with robust configuration
const api = axios.create({
  baseURL: getApiUrl(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  // Enable credentials for cross-origin requests
  withCredentials: false,
});

// Request interceptor to add auth token and handle errors
api.interceptors.request.use(
  async (config) => {
    try {
      // Add Clerk session token if available
      if (window.Clerk?.session) {
        const token = await window.Clerk.session.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (error) {
      console.warn('Failed to get Clerk token:', error);
    }
    
    // Add request timestamp for debugging
    config.metadata = { startTime: new Date() };
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor with enhanced error handling
api.interceptors.response.use(
  (response) => {
    // Log response time in development
    if (process.env.NODE_ENV === 'development' && response.config.metadata) {
      const duration = new Date() - response.config.metadata.startTime;
      console.log(`API Request: ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`);
    }
    return response;
  },
  async (error) => {
    // Enhanced error handling
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Handle unauthorized access
          console.warn('Unauthorized access - redirecting to sign in');
          if (window.location.pathname !== '/sign-in') {
            window.location.href = '/sign-in';
          }
          break;
        case 403:
          console.error('Forbidden access:', data);
          break;
        case 404:
          console.warn('Resource not found:', error.config?.url);
          break;
        case 429:
          console.warn('Rate limit exceeded');
          break;
        case 500:
          console.error('Server error:', data);
          break;
        default:
          console.error('API error:', status, data);
      }
    } else if (error.request) {
      console.error('Network error - no response received:', error.request);
    } else {
      console.error('Request setup error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;

// API endpoints
export const endpoints = {
  // Recipe endpoints
  recipes: {
    search: '/api/recipes/search',
    searchComplex: '/api/recipes/search/complex',
    random: '/api/recipes/random',
    getById: (id) => `/api/recipes/${id}`,
    getSimilar: (id) => `/api/recipes/${id}/similar`,
    save: '/api/recipes/save',
    updateSaved: (id) => `/api/recipes/save/${id}`,
    deleteSaved: (recipeId) => `/api/recipes/save/${recipeId}`,
    getSaved: '/api/recipes/saved',
    markCooked: (id) => `/api/recipes/${id}/cooked`,
  },
  
  // Pantry endpoints
  pantry: {
    getAll: '/api/pantry',
    create: '/api/pantry',
    update: (id) => `/api/pantry/${id}`,
    delete: (id) => `/api/pantry/${id}`,
    bulk: '/api/pantry/bulk',
    consume: '/api/pantry/consume',
    expiring: '/api/pantry/expiring',
    suggestions: '/api/pantry/suggestions',
    autocomplete: '/api/pantry/ingredients/autocomplete',
    categories: '/api/pantry/categories',
  },
  
  // Grocery endpoints
  grocery: {
    getAll: '/api/grocery',
    create: '/api/grocery',
    getById: (id) => `/api/grocery/${id}`,
    update: (id) => `/api/grocery/${id}`,
    delete: (id) => `/api/grocery/${id}`,
    generate: '/api/grocery/generate',
    updateItem: (listId, itemId) => `/api/grocery/${listId}/items/${itemId}`,
    addItem: (listId) => `/api/grocery/${listId}/items`,
    deleteItem: (listId, itemId) => `/api/grocery/${listId}/items/${itemId}`,
    complete: (id) => `/api/grocery/${id}/complete`,
    addToPantry: (id) => `/api/grocery/${id}/add-to-pantry`,
  },
  
  // User endpoints
  user: {
    profile: '/api/user/profile',
    dashboard: '/api/user/dashboard',
    mealPlan: '/api/user/meal-plan',
    recommendations: '/api/user/recommendations',
    analytics: '/api/user/analytics',
    exportData: '/api/user/export-data',
    deleteAccount: '/api/user/account',
  },
  
  // Health check
  health: '/api/health',
};

// Helper function to handle API errors
export const handleApiError = (error) => {
  console.error('API Error:', error);
  
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    return {
      message: data?.message || `Server error: ${status}`,
      status,
      details: data?.details || null,
    };
  } else if (error.request) {
    // Request was made but no response received
    return {
      message: 'Network error. Please check your connection.',
      status: 0,
      details: null,
    };
  } else {
    // Something else happened
    return {
      message: error.message || 'An unexpected error occurred',
      status: 0,
      details: null,
    };
  }
};

// Helper function to create query string
export const createQueryString = (params) => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(v => searchParams.append(key, v));
      } else {
        searchParams.append(key, value);
      }
    }
  });
  
  return searchParams.toString();
};
