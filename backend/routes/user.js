const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const UserPreference = require('../models/UserPreference');
const SavedRecipe = require('../models/SavedRecipe');
const PantryItem = require('../models/PantryItem');
const GroceryList = require('../models/GroceryList');
const spoonacularAPI = require('../services/spoonacularAPI');
const { requireAuth, checkAuth } = require('../middleware/auth');

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation Error',
      details: errors.array()
    });
  }
  next();
};

// @route   GET /api/user/profile
// @desc    Get user profile and preferences
// @access  Private
router.get('/profile', [
  requireAuth,
  checkAuth
], async (req, res) => {
  try {
    const userId = req.userId;
    
    let userPreferences = await UserPreference.findOne({ userId });
    
    if (!userPreferences) {
      // Create default preferences if none exist
      userPreferences = new UserPreference({ userId });
      await userPreferences.save();
    }

    res.json({
      success: true,
      data: userPreferences
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get user profile'
    });
  }
});

// @route   PUT /api/user/profile
// @desc    Update user profile and preferences
// @access  Private
router.put('/profile', [
  requireAuth,
  checkAuth,
  body('dietaryRestrictions').optional().isArray().withMessage('Dietary restrictions must be an array'),
  body('allergies').optional().isArray().withMessage('Allergies must be an array'),
  body('preferredCuisines').optional().isArray().withMessage('Preferred cuisines must be an array'),
  body('dislikedCuisines').optional().isArray().withMessage('Disliked cuisines must be an array'),
  body('maxCookingTime').optional().isInt({ min: 5, max: 480 }).withMessage('Max cooking time must be between 5 and 480 minutes'),
  body('skillLevel').optional().isIn(['beginner', 'intermediate', 'advanced']).withMessage('Invalid skill level'),
  body('dailyCalorieGoal').optional().isInt({ min: 1000, max: 5000 }).withMessage('Daily calorie goal must be between 1000 and 5000'),
  body('proteinGoal').optional().isFloat({ min: 0, max: 500 }).withMessage('Protein goal must be between 0 and 500g'),
  body('carbGoal').optional().isFloat({ min: 0, max: 1000 }).withMessage('Carb goal must be between 0 and 1000g'),
  body('fatGoal').optional().isFloat({ min: 0, max: 300 }).withMessage('Fat goal must be between 0 and 300g'),
  body('mealsPerDay').optional().isInt({ min: 1, max: 6 }).withMessage('Meals per day must be between 1 and 6'),
  body('servingsPerMeal').optional().isInt({ min: 1, max: 10 }).withMessage('Servings per meal must be between 1 and 10'),
  body('theme').optional().isIn(['light', 'dark', 'system']).withMessage('Invalid theme'),
  body('units').optional().isIn(['metric', 'imperial']).withMessage('Invalid units'),
  body('budgetPerWeek').optional().isFloat({ min: 0 }).withMessage('Budget per week must be non-negative'),
  handleValidationErrors
], async (req, res) => {
  try {
    const userId = req.userId;
    const updateData = { ...req.body };
    updateData.updatedAt = Date.now();

    const userPreferences = await UserPreference.findOneAndUpdate(
      { userId },
      updateData,
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: userPreferences
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update user profile'
    });
  }
});

// @route   GET /api/user/dashboard
// @desc    Get user dashboard data
// @access  Private
router.get('/dashboard', [
  requireAuth,
  checkAuth
], async (req, res) => {
  try {
    const userId = req.userId;

    // Get dashboard statistics
    const [
      savedRecipesCount,
      pantryItemsCount,
      groceryListsCount,
      recentRecipes,
      expiringItems,
      userPreferences
    ] = await Promise.all([
      SavedRecipe.countDocuments({ userId }),
      PantryItem.countDocuments({ userId }),
      GroceryList.countDocuments({ userId }),
      SavedRecipe.find({ userId })
        .sort({ dateSaved: -1 })
        .limit(5)
        .lean(),
      PantryItem.find({
        userId,
        expirationDate: {
          $exists: true,
          $ne: null,
          $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        },
        isExpired: false
      })
        .sort({ expirationDate: 1 })
        .limit(5)
        .lean(),
      UserPreference.findOne({ userId }).lean()
    ]);

    // Get cooking stats
    const cookingStats = await SavedRecipe.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalTimesCooked: { $sum: '$timesCooked' },
          averageRating: { $avg: '$userRating' },
          favoriteRecipes: { $sum: { $cond: ['$isFavorite', 1, 0] } }
        }
      }
    ]);

    // Get pantry stats
    const pantryStats = await PantryItem.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          savedRecipes: savedRecipesCount,
          pantryItems: pantryItemsCount,
          groceryLists: groceryListsCount,
          totalTimesCooked: cookingStats[0]?.totalTimesCooked || 0,
          averageRating: cookingStats[0]?.averageRating || 0,
          favoriteRecipes: cookingStats[0]?.favoriteRecipes || 0
        },
        recentRecipes,
        expiringItems,
        pantryByCategory: pantryStats.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        preferences: userPreferences
      }
    });
  } catch (error) {
    console.error('Get dashboard data error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get dashboard data'
    });
  }
});

// @route   POST /api/user/meal-plan
// @desc    Generate meal plan based on preferences
// @access  Private
router.post('/meal-plan', [
  requireAuth,
  checkAuth,
  body('timeFrame').optional().isIn(['day', 'week']).withMessage('Time frame must be day or week'),
  body('targetCalories').optional().isInt({ min: 1000, max: 5000 }).withMessage('Target calories must be between 1000 and 5000'),
  body('excludeIngredients').optional().isString().withMessage('Exclude ingredients must be a string'),
  handleValidationErrors
], async (req, res) => {
  try {
    const userId = req.userId;
    const { timeFrame, targetCalories, excludeIngredients } = req.body;

    // Get user preferences
    const userPreferences = await UserPreference.findOne({ userId });
    
    const mealPlanOptions = {
      timeFrame: timeFrame || 'week',
      targetCalories: targetCalories || userPreferences?.dailyCalorieGoal || 2000,
      diet: userPreferences?.dietaryRestrictions?.[0] || undefined,
      exclude: excludeIngredients || userPreferences?.allergies?.join(',') || undefined
    };

    const mealPlan = await spoonacularAPI.generateMealPlan(mealPlanOptions);

    res.json({
      success: true,
      data: mealPlan
    });
  } catch (error) {
    console.error('Generate meal plan error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to generate meal plan'
    });
  }
});

// @route   GET /api/user/recommendations
// @desc    Get personalized recipe recommendations
// @access  Private
router.get('/recommendations', [
  requireAuth,
  checkAuth
], async (req, res) => {
  try {
    const userId = req.userId;
    const { number = 12 } = req.query;

    // Get user preferences
    const userPreferences = await UserPreference.findOne({ userId });
    
    // Get user's saved recipes to find patterns
    const savedRecipes = await SavedRecipe.find({ userId })
      .sort({ userRating: -1, dateSaved: -1 })
      .limit(20)
      .lean();

    // Get pantry items for suggestions
    const pantryItems = await PantryItem.find({ userId, quantity: { $gt: 0 } })
      .select('name')
      .limit(10)
      .lean();

    let recommendations = [];

    // Strategy 1: Based on pantry items
    if (pantryItems.length > 0) {
      const ingredients = pantryItems.map(item => item.name).slice(0, 5).join(',');
      
      try {
        const pantryRecipes = await spoonacularAPI.searchRecipesByIngredients(ingredients, {
          number: Math.ceil(number / 3),
          ranking: 1
        });
        recommendations = [...recommendations, ...pantryRecipes];
      } catch (error) {
        console.error('Error getting pantry-based recommendations:', error);
      }
    }

    // Strategy 2: Based on user preferences
    if (userPreferences) {
      const searchOptions = {
        number: Math.ceil(number / 3),
        diet: userPreferences.dietaryRestrictions?.[0],
        cuisine: userPreferences.preferredCuisines?.[0],
        maxReadyTime: userPreferences.maxCookingTime,
        maxCalories: userPreferences.dailyCalorieGoal / userPreferences.mealsPerDay,
        excludeIngredients: userPreferences.allergies?.join(','),
        sort: 'popularity'
      };

      try {
        const preferenceBasedRecipes = await spoonacularAPI.searchRecipes('', searchOptions);
        recommendations = [...recommendations, ...(preferenceBasedRecipes.results || [])];
      } catch (error) {
        console.error('Error getting preference-based recommendations:', error);
      }
    }

    // Strategy 3: Random popular recipes if we need more
    if (recommendations.length < number) {
      try {
        const randomRecipes = await spoonacularAPI.getRandomRecipes({
          number: number - recommendations.length,
          tags: userPreferences?.preferredCuisines?.join(',')
        });
        recommendations = [...recommendations, ...(randomRecipes.recipes || [])];
      } catch (error) {
        console.error('Error getting random recommendations:', error);
      }
    }

    // Remove duplicates
    const uniqueRecipes = recommendations.filter((recipe, index, self) => 
      index === self.findIndex(r => r.id === recipe.id)
    );

    // Check which recipes are already saved
    const savedRecipeIds = new Set(savedRecipes.map(sr => sr.recipeId));
    uniqueRecipes.forEach(recipe => {
      recipe.isSaved = savedRecipeIds.has(recipe.id);
    });

    res.json({
      success: true,
      data: uniqueRecipes.slice(0, number),
      count: uniqueRecipes.length,
      strategies: {
        pantryBased: pantryItems.length > 0,
        preferenceBased: !!userPreferences,
        randomFallback: recommendations.length < number
      }
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get recommendations'
    });
  }
});

// @route   GET /api/user/analytics
// @desc    Get user cooking analytics
// @access  Private
router.get('/analytics', [
  requireAuth,
  checkAuth
], async (req, res) => {
  try {
    const userId = req.userId;

    // Get cooking trends over time
    const cookingTrends = await SavedRecipe.aggregate([
      { $match: { userId, timesCooked: { $gt: 0 } } },
      {
        $group: {
          _id: {
            year: { $year: '$lastCooked' },
            month: { $month: '$lastCooked' }
          },
          totalCooked: { $sum: '$timesCooked' },
          uniqueRecipes: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    // Get favorite cuisines
    const cuisineStats = await SavedRecipe.aggregate([
      { $match: { userId } },
      { $unwind: '$recipeData.cuisines' },
      {
        $group: {
          _id: '$recipeData.cuisines',
          count: { $sum: 1 },
          averageRating: { $avg: '$userRating' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get nutrition trends
    const nutritionTrends = await SavedRecipe.aggregate([
      { $match: { userId, timesCooked: { $gt: 0 } } },
      {
        $group: {
          _id: null,
          avgCalories: { $avg: '$recipeData.nutrition.nutrients.0.amount' },
          avgProtein: { $avg: '$recipeData.nutrition.nutrients.1.amount' },
          avgCarbs: { $avg: '$recipeData.nutrition.nutrients.2.amount' },
          avgFat: { $avg: '$recipeData.nutrition.nutrients.3.amount' }
        }
      }
    ]);

    // Get recipe difficulty distribution
    const difficultyStats = await SavedRecipe.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $lte: ['$recipeData.readyInMinutes', 30] }, then: 'Quick (≤30 min)' },
                { case: { $lte: ['$recipeData.readyInMinutes', 60] }, then: 'Medium (30-60 min)' },
                { case: { $gt: ['$recipeData.readyInMinutes', 60] }, then: 'Long (>60 min)' }
              ],
              default: 'Unknown'
            }
          },
          count: { $sum: 1 }
        }
      }
    ]);

    // Get top rated recipes
    const topRatedRecipes = await SavedRecipe.find({ userId, userRating: { $gte: 4 } })
      .sort({ userRating: -1, timesCooked: -1 })
      .limit(5)
      .select('recipeData.title userRating timesCooked')
      .lean();

    res.json({
      success: true,
      data: {
        cookingTrends,
        cuisineStats,
        nutritionTrends: nutritionTrends[0] || {},
        difficultyStats,
        topRatedRecipes
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get analytics'
    });
  }
});

// @route   DELETE /api/user/account
// @desc    Delete user account and all associated data
// @access  Private
router.delete('/account', [
  requireAuth,
  checkAuth
], async (req, res) => {
  try {
    const userId = req.userId;

    // Delete all user data
    await Promise.all([
      SavedRecipe.deleteMany({ userId }),
      PantryItem.deleteMany({ userId }),
      GroceryList.deleteMany({ userId }),
      UserPreference.deleteOne({ userId })
    ]);

    res.json({
      success: true,
      message: 'Account and all associated data deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete account'
    });
  }
});

// @route   POST /api/user/export-data
// @desc    Export user data
// @access  Private
router.post('/export-data', [
  requireAuth,
  checkAuth
], async (req, res) => {
  try {
    const userId = req.userId;

    // Get all user data
    const [
      savedRecipes,
      pantryItems,
      groceryLists,
      userPreferences
    ] = await Promise.all([
      SavedRecipe.find({ userId }).lean(),
      PantryItem.find({ userId }).lean(),
      GroceryList.find({ userId }).lean(),
      UserPreference.findOne({ userId }).lean()
    ]);

    const exportData = {
      exportDate: new Date().toISOString(),
      userId,
      savedRecipes,
      pantryItems,
      groceryLists,
      userPreferences
    };

    res.json({
      success: true,
      data: exportData
    });
  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to export data'
    });
  }
});

module.exports = router;
