const axios = require('axios');

class SpoonacularAPI {
  constructor() {
    this.baseURL = 'https://api.spoonacular.com';
    this.apiKey = process.env.SPOONACULAR_API_KEY;
    
    if (!this.apiKey) {
      console.warn('⚠️  Spoonacular API key not found in environment variables');
    }
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      params: {
        apiKey: this.apiKey
      }
    });
  }

  // Search recipes by ingredients
  async searchRecipesByIngredients(ingredients, options = {}) {
    try {
      const params = {
        ingredients: Array.isArray(ingredients) ? ingredients.join(',') : ingredients,
        number: options.number || 12,
        ranking: options.ranking || 1, // 1 = maximize used ingredients, 2 = minimize missing ingredients
        ignorePantry: options.ignorePantry || false,
        ...options
      };

      const response = await this.client.get('/recipes/findByIngredients', { params });
      return response.data;
    } catch (error) {
      console.error('Error searching recipes by ingredients:', error.message);
      throw new Error('Failed to search recipes by ingredients');
    }
  }

  // Get recipe information by ID
  async getRecipeInformation(recipeId, options = {}) {
    try {
      const params = {
        includeNutrition: options.includeNutrition || true,
        addWinePairing: options.addWinePairing || false,
        addTasteData: options.addTasteData || false,
        ...options
      };

      const response = await this.client.get(`/recipes/${recipeId}/information`, { params });
      return response.data;
    } catch (error) {
      console.error('Error getting recipe information:', error.message);
      throw new Error('Failed to get recipe information');
    }
  }

  // Get multiple recipe information
  async getBulkRecipeInformation(recipeIds, options = {}) {
    try {
      const params = {
        ids: Array.isArray(recipeIds) ? recipeIds.join(',') : recipeIds,
        includeNutrition: options.includeNutrition || false,
        ...options
      };

      const response = await this.client.get('/recipes/informationBulk', { params });
      return response.data;
    } catch (error) {
      console.error('Error getting bulk recipe information:', error.message);
      throw new Error('Failed to get bulk recipe information');
    }
  }

  // Search recipes with complex query
  async searchRecipes(query, options = {}) {
    try {
      const params = {
        query,
        number: options.number || 12,
        offset: options.offset || 0,
        diet: options.diet,
        excludeIngredients: options.excludeIngredients,
        intolerances: options.intolerances,
        cuisine: options.cuisine,
        type: options.type,
        maxReadyTime: options.maxReadyTime,
        minCalories: options.minCalories,
        maxCalories: options.maxCalories,
        minCarbs: options.minCarbs,
        maxCarbs: options.maxCarbs,
        minProtein: options.minProtein,
        maxProtein: options.maxProtein,
        minFat: options.minFat,
        maxFat: options.maxFat,
        sort: options.sort || 'popularity',
        sortDirection: options.sortDirection || 'desc',
        addRecipeInformation: options.addRecipeInformation || true,
        fillIngredients: options.fillIngredients || false,
        ...options
      };

      // Remove undefined values
      Object.keys(params).forEach(key => {
        if (params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await this.client.get('/recipes/complexSearch', { params });
      return response.data;
    } catch (error) {
      console.error('Error searching recipes:', error.message);
      throw new Error('Failed to search recipes');
    }
  }

  // Get random recipes
  async getRandomRecipes(options = {}) {
    try {
      const params = {
        number: options.number || 1,
        limitLicense: options.limitLicense || false,
        tags: options.tags,
        ...options
      };

      const response = await this.client.get('/recipes/random', { params });
      return response.data;
    } catch (error) {
      console.error('Error getting random recipes:', error.message);
      throw new Error('Failed to get random recipes');
    }
  }

  // Get recipe nutrition
  async getRecipeNutrition(recipeId) {
    try {
      const response = await this.client.get(`/recipes/${recipeId}/nutritionWidget.json`);
      return response.data;
    } catch (error) {
      console.error('Error getting recipe nutrition:', error.message);
      throw new Error('Failed to get recipe nutrition');
    }
  }

  // Get similar recipes
  async getSimilarRecipes(recipeId, options = {}) {
    try {
      const params = {
        number: options.number || 3,
        limitLicense: options.limitLicense || false,
        ...options
      };

      const response = await this.client.get(`/recipes/${recipeId}/similar`, { params });
      return response.data;
    } catch (error) {
      console.error('Error getting similar recipes:', error.message);
      throw new Error('Failed to get similar recipes');
    }
  }

  // Autocomplete ingredient search
  async autocompleteIngredient(query, options = {}) {
    try {
      const params = {
        query,
        number: options.number || 10,
        metaInformation: options.metaInformation || false,
        intolerances: options.intolerances,
        ...options
      };

      const response = await this.client.get('/food/ingredients/autocomplete', { params });
      return response.data;
    } catch (error) {
      console.error('Error autocompleting ingredient:', error.message);
      throw new Error('Failed to autocomplete ingredient');
    }
  }

  // Get ingredient information
  async getIngredientInformation(ingredientId, options = {}) {
    try {
      const params = {
        amount: options.amount || 1,
        unit: options.unit || 'piece',
        ...options
      };

      const response = await this.client.get(`/food/ingredients/${ingredientId}/information`, { params });
      return response.data;
    } catch (error) {
      console.error('Error getting ingredient information:', error.message);
      throw new Error('Failed to get ingredient information');
    }
  }

  // Generate meal plan
  async generateMealPlan(options = {}) {
    try {
      const params = {
        timeFrame: options.timeFrame || 'week',
        targetCalories: options.targetCalories || 2000,
        diet: options.diet,
        exclude: options.exclude,
        ...options
      };

      const response = await this.client.get('/mealplanner/generate', { params });
      return response.data;
    } catch (error) {
      console.error('Error generating meal plan:', error.message);
      throw new Error('Failed to generate meal plan');
    }
  }

  // Search grocery products
  async searchGroceryProducts(query, options = {}) {
    try {
      const params = {
        query,
        number: options.number || 10,
        offset: options.offset || 0,
        ...options
      };

      const response = await this.client.get('/food/products/search', { params });
      return response.data;
    } catch (error) {
      console.error('Error searching grocery products:', error.message);
      throw new Error('Failed to search grocery products');
    }
  }

  // Get product information
  async getProductInformation(productId) {
    try {
      const response = await this.client.get(`/food/products/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting product information:', error.message);
      throw new Error('Failed to get product information');
    }
  }

  // Parse ingredients from text
  async parseIngredients(ingredientList, options = {}) {
    try {
      const params = {
        language: options.language || 'en',
        includeNutrition: options.includeNutrition || false,
        ...options
      };

      const response = await this.client.post('/recipes/parseIngredients', {
        ingredientList: ingredientList,
        servings: options.servings || 1
      }, { params });
      
      return response.data;
    } catch (error) {
      console.error('Error parsing ingredients:', error.message);
      throw new Error('Failed to parse ingredients');
    }
  }

  // Check API usage/quota
  async checkApiUsage() {
    try {
      const response = await this.client.get('/recipes/complexSearch', {
        params: { number: 1 }
      });
      
      return {
        quotaUsed: response.headers['x-api-quota-used'],
        quotaLeft: response.headers['x-api-quota-left'],
        dailyQuotaLeft: response.headers['x-api-quota-request']
      };
    } catch (error) {
      console.error('Error checking API usage:', error.message);
      throw new Error('Failed to check API usage');
    }
  }
}

module.exports = new SpoonacularAPI();
