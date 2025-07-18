import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Recipe store
export const useRecipeStore = create((set, get) => ({
  // State
  recipes: [],
  searchResults: [],
  savedRecipes: [],
  currentRecipe: null,
  searchQuery: '',
  searchFilters: {
    diet: '',
    cuisine: '',
    maxReadyTime: '',
    minCalories: '',
    maxCalories: '',
    excludeIngredients: '',
    sort: 'popularity',
  },
  isLoading: false,
  error: null,
  
  // Actions
  setRecipes: (recipes) => set({ recipes }),
  setSearchResults: (results) => set({ searchResults: results }),
  setSavedRecipes: (recipes) => set({ savedRecipes: recipes }),
  setCurrentRecipe: (recipe) => set({ currentRecipe: recipe }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSearchFilters: (filters) => set((state) => ({ 
    searchFilters: { ...state.searchFilters, ...filters }
  })),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  
  // Add recipe to saved recipes
  addSavedRecipe: (recipe) => set((state) => ({
    savedRecipes: [...state.savedRecipes, recipe]
  })),
  
  // Remove recipe from saved recipes
  removeSavedRecipe: (recipeId) => set((state) => ({
    savedRecipes: state.savedRecipes.filter(recipe => recipe.recipeId !== recipeId)
  })),
  
  // Update saved recipe
  updateSavedRecipe: (recipeId, updates) => set((state) => ({
    savedRecipes: state.savedRecipes.map(recipe => 
      recipe.recipeId === recipeId ? { ...recipe, ...updates } : recipe
    )
  })),
  
  // Clear all data
  clearAll: () => set({
    recipes: [],
    searchResults: [],
    savedRecipes: [],
    currentRecipe: null,
    searchQuery: '',
    searchFilters: {
      diet: '',
      cuisine: '',
      maxReadyTime: '',
      minCalories: '',
      maxCalories: '',
      excludeIngredients: '',
      sort: 'popularity',
    },
    isLoading: false,
    error: null,
  }),
}));

// Pantry store
export const usePantryStore = create((set, get) => ({
  // State
  pantryItems: [],
  categories: [],
  isLoading: false,
  error: null,
  
  // Actions
  setPantryItems: (items) => set({ pantryItems: items }),
  setCategories: (categories) => set({ categories }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  
  // Add pantry item
  addPantryItem: (item) => set((state) => ({
    pantryItems: [...state.pantryItems, item]
  })),
  
  // Update pantry item
  updatePantryItem: (itemId, updates) => set((state) => ({
    pantryItems: state.pantryItems.map(item => 
      item._id === itemId ? { ...item, ...updates } : item
    )
  })),
  
  // Remove pantry item
  removePantryItem: (itemId) => set((state) => ({
    pantryItems: state.pantryItems.filter(item => item._id !== itemId)
  })),
  
  // Get items by category
  getItemsByCategory: (category) => {
    const { pantryItems } = get();
    return pantryItems.filter(item => item.category === category);
  },
  
  // Get expiring items
  getExpiringItems: (days = 7) => {
    const { pantryItems } = get();
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);
    
    return pantryItems.filter(item => {
      return item.expirationDate && 
             new Date(item.expirationDate) <= targetDate && 
             !item.isExpired;
    });
  },
  
  // Clear all data
  clearAll: () => set({
    pantryItems: [],
    categories: [],
    isLoading: false,
    error: null,
  }),
}));

// Grocery store
export const useGroceryStore = create((set, get) => ({
  // State
  groceryLists: [],
  currentGroceryList: null,
  isLoading: false,
  error: null,
  
  // Actions
  setGroceryLists: (lists) => set({ groceryLists: lists }),
  setCurrentGroceryList: (list) => set({ currentGroceryList: list }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  
  // Add grocery list
  addGroceryList: (list) => set((state) => ({
    groceryLists: [...state.groceryLists, list]
  })),
  
  // Update grocery list
  updateGroceryList: (listId, updates) => set((state) => ({
    groceryLists: state.groceryLists.map(list => 
      list._id === listId ? { ...list, ...updates } : list
    ),
    currentGroceryList: state.currentGroceryList?._id === listId 
      ? { ...state.currentGroceryList, ...updates } 
      : state.currentGroceryList
  })),
  
  // Remove grocery list
  removeGroceryList: (listId) => set((state) => ({
    groceryLists: state.groceryLists.filter(list => list._id !== listId)
  })),
  
  // Update grocery list item
  updateGroceryItem: (listId, itemId, updates) => set((state) => {
    const updatedLists = state.groceryLists.map(list => {
      if (list._id === listId) {
        return {
          ...list,
          items: list.items.map(item =>
            item._id === itemId ? { ...item, ...updates } : item
          )
        };
      }
      return list;
    });
    
    const updatedCurrentList = state.currentGroceryList?._id === listId
      ? {
          ...state.currentGroceryList,
          items: state.currentGroceryList.items.map(item =>
            item._id === itemId ? { ...item, ...updates } : item
          )
        }
      : state.currentGroceryList;
    
    return {
      groceryLists: updatedLists,
      currentGroceryList: updatedCurrentList
    };
  }),
  
  // Clear all data
  clearAll: () => set({
    groceryLists: [],
    currentGroceryList: null,
    isLoading: false,
    error: null,
  }),
}));

// User store with persistence
export const useUserStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      preferences: null,
      theme: 'system',
      language: 'en',
      isLoading: false,
      error: null,
      
      // Actions
      setUser: (user) => set({ user }),
      setPreferences: (preferences) => set({ preferences }),
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setIsLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      
      // Update preferences
      updatePreferences: (updates) => set((state) => ({
        preferences: { ...state.preferences, ...updates }
      })),
      
      // Clear user data
      clearUser: () => set({
        user: null,
        preferences: null,
        isLoading: false,
        error: null,
      }),
      
      // Clear all data
      clearAll: () => set({
        user: null,
        preferences: null,
        theme: 'system',
        language: 'en',
        isLoading: false,
        error: null,
      }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
        preferences: state.preferences,
      }),
    }
  )
);

// UI store
export const useUIStore = create((set, get) => ({
  // State
  sidebarOpen: false,
  modalOpen: false,
  modalContent: null,
  notifications: [],
  isOffline: false,
  
  // Actions
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  
  setModalOpen: (open) => set({ modalOpen: open }),
  setModalContent: (content) => set({ modalContent: content }),
  openModal: (content) => set({ modalOpen: true, modalContent: content }),
  closeModal: () => set({ modalOpen: false, modalContent: null }),
  
  // Notifications
  addNotification: (notification) => set((state) => ({
    notifications: [...state.notifications, { ...notification, id: Date.now() }]
  })),
  
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),
  
  clearNotifications: () => set({ notifications: [] }),
  
  setIsOffline: (offline) => set({ isOffline: offline }),
  
  // Clear all data
  clearAll: () => set({
    sidebarOpen: false,
    modalOpen: false,
    modalContent: null,
    notifications: [],
    isOffline: false,
  }),
}));

// Combined store actions
export const useAppStore = () => {
  const clearAllStores = () => {
    useRecipeStore.getState().clearAll();
    usePantryStore.getState().clearAll();
    useGroceryStore.getState().clearAll();
    useUserStore.getState().clearAll();
    useUIStore.getState().clearAll();
  };
  
  return {
    clearAllStores,
  };
};
