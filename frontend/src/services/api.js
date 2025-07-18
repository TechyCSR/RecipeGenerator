import api, { endpoints, handleApiError, createQueryString } from '../utils/api';

// Recipe API services
export const recipeApi = {
  // Search recipes by ingredients
  searchByIngredients: async (ingredients, options = {}) => {
    try {
      const params = {
        ingredients: Array.isArray(ingredients) ? ingredients.join(',') : ingredients,
        ...options,
      };
      
      const response = await api.get(`${endpoints.recipes.search}?${createQueryString(params)}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Complex recipe search
  searchComplex: async (query, filters = {}) => {
    try {
      const params = {
        query,
        ...filters,
      };
      
      const response = await api.get(`${endpoints.recipes.searchComplex}?${createQueryString(params)}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Get random recipes
  getRandom: async (options = {}) => {
    try {
      const response = await api.get(`${endpoints.recipes.random}?${createQueryString(options)}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Get recipe by ID
  getById: async (id, options = {}) => {
    try {
      const response = await api.get(`${endpoints.recipes.getById(id)}?${createQueryString(options)}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Get similar recipes
  getSimilar: async (id, options = {}) => {
    try {
      const response = await api.get(`${endpoints.recipes.getSimilar(id)}?${createQueryString(options)}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Save recipe
  save: async (recipeData) => {
    try {
      const response = await api.post(endpoints.recipes.save, recipeData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Update saved recipe
  updateSaved: async (id, updates) => {
    try {
      const response = await api.put(endpoints.recipes.updateSaved(id), updates);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Delete saved recipe
  deleteSaved: async (recipeId) => {
    try {
      const response = await api.delete(endpoints.recipes.deleteSaved(recipeId));
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Get saved recipes
  getSaved: async (options = {}) => {
    try {
      const response = await api.get(`${endpoints.recipes.getSaved}?${createQueryString(options)}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Mark recipe as cooked
  markCooked: async (id) => {
    try {
      const response = await api.post(endpoints.recipes.markCooked(id));
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

// Pantry API services
export const pantryApi = {
  // Get all pantry items
  getAll: async (filters = {}) => {
    try {
      const response = await api.get(`${endpoints.pantry.getAll}?${createQueryString(filters)}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Create pantry item
  create: async (itemData) => {
    try {
      const response = await api.post(endpoints.pantry.create, itemData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Update pantry item
  update: async (id, updates) => {
    try {
      const response = await api.put(endpoints.pantry.update(id), updates);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Delete pantry item
  delete: async (id) => {
    try {
      const response = await api.delete(endpoints.pantry.delete(id));
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Bulk add items
  bulkAdd: async (items) => {
    try {
      const response = await api.post(endpoints.pantry.bulk, { items });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Consume items
  consume: async (items) => {
    try {
      const response = await api.post(endpoints.pantry.consume, { items });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Get expiring items
  getExpiring: async (days = 7) => {
    try {
      const response = await api.get(`${endpoints.pantry.expiring}?days=${days}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Get recipe suggestions based on pantry
  getSuggestions: async (options = {}) => {
    try {
      const response = await api.get(`${endpoints.pantry.suggestions}?${createQueryString(options)}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Autocomplete ingredients
  autocomplete: async (query, options = {}) => {
    try {
      const response = await api.post(endpoints.pantry.autocomplete, { query, ...options });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Get categories
  getCategories: async () => {
    try {
      const response = await api.get(endpoints.pantry.categories);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

// Grocery API services
export const groceryApi = {
  // Get all grocery lists
  getAll: async (options = {}) => {
    try {
      const response = await api.get(`${endpoints.grocery.getAll}?${createQueryString(options)}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Create grocery list
  create: async (listData) => {
    try {
      const response = await api.post(endpoints.grocery.create, listData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Get grocery list by ID
  getById: async (id) => {
    try {
      const response = await api.get(endpoints.grocery.getById(id));
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Update grocery list
  update: async (id, updates) => {
    try {
      const response = await api.put(endpoints.grocery.update(id), updates);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Delete grocery list
  delete: async (id) => {
    try {
      const response = await api.delete(endpoints.grocery.delete(id));
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Generate grocery list from recipes
  generate: async (recipeIds, options = {}) => {
    try {
      const response = await api.post(endpoints.grocery.generate, {
        recipeIds,
        ...options,
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Update grocery list item
  updateItem: async (listId, itemId, updates) => {
    try {
      const response = await api.put(endpoints.grocery.updateItem(listId, itemId), updates);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Add item to grocery list
  addItem: async (listId, itemData) => {
    try {
      const response = await api.post(endpoints.grocery.addItem(listId), itemData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Delete item from grocery list
  deleteItem: async (listId, itemId) => {
    try {
      const response = await api.delete(endpoints.grocery.deleteItem(listId, itemId));
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Mark grocery list as complete
  complete: async (id) => {
    try {
      const response = await api.post(endpoints.grocery.complete(id));
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Add completed items to pantry
  addToPantry: async (id) => {
    try {
      const response = await api.post(endpoints.grocery.addToPantry(id));
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

// User API services
export const userApi = {
  // Get user profile
  getProfile: async () => {
    try {
      const response = await api.get(endpoints.user.profile);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Update user profile
  updateProfile: async (updates) => {
    try {
      const response = await api.put(endpoints.user.profile, updates);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Get dashboard data
  getDashboard: async () => {
    try {
      const response = await api.get(endpoints.user.dashboard);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Generate meal plan
  generateMealPlan: async (options = {}) => {
    try {
      const response = await api.post(endpoints.user.mealPlan, options);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Get recommendations
  getRecommendations: async (options = {}) => {
    try {
      const response = await api.get(`${endpoints.user.recommendations}?${createQueryString(options)}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Get analytics
  getAnalytics: async () => {
    try {
      const response = await api.get(endpoints.user.analytics);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Export user data
  exportData: async () => {
    try {
      const response = await api.post(endpoints.user.exportData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Delete account
  deleteAccount: async () => {
    try {
      const response = await api.delete(endpoints.user.deleteAccount);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

// Health check
export const healthApi = {
  check: async () => {
    try {
      const response = await api.get(endpoints.health);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
