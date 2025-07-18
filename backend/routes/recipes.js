const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');
const Recipe = require('../models/Recipe');
const SavedRecipe = require('../models/SavedRecipe');
const spoonacularAPI = require('../services/spoonacularAPI');
const { requireAuth, checkAuth, extractUserId, optionalAuth } = require('../middleware/auth');

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

// @route   GET /api/recipes/search
// @desc    Search recipes by ingredients
// @access  Public
router.get('/search', [
  requireAuth,
  optionalAuth,
  query('ingredients').notEmpty().withMessage('Ingredients are required'),
  query('number').optional().isInt({ min: 1, max: 100 }).withMessage('Number must be between 1 and 100'),
  query('ranking').optional().isInt({ min: 1, max: 2 }).withMessage('Ranking must be 1 or 2'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { ingredients, number, ranking, ignorePantry } = req.query;
    
    const recipes = await spoonacularAPI.searchRecipesByIngredients(ingredients, {
      number: parseInt(number) || 12,
      ranking: parseInt(ranking) || 1,
      ignorePantry: ignorePantry === 'true'
    });

    // If user is authenticated, check which recipes are saved
    if (req.userId) {
      const savedRecipeIds = await SavedRecipe.find({ userId: req.userId })
        .select('recipeId')
        .lean();
      
      const savedIds = new Set(savedRecipeIds.map(sr => sr.recipeId));
      
      recipes.forEach(recipe => {
        recipe.isSaved = savedIds.has(recipe.id);
      });
    }

    res.json({
      success: true,
      data: recipes,
      count: recipes.length
    });
  } catch (error) {
    console.error('Search recipes error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to search recipes'
    });
  }
});

// @route   GET /api/recipes/search/complex
// @desc    Complex recipe search with filters
// @access  Public
router.get('/search/complex', [
  requireAuth,
  optionalAuth,
  query('query').optional().isString().withMessage('Query must be a string'),
  query('number').optional().isInt({ min: 1, max: 100 }).withMessage('Number must be between 1 and 100'),
  query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be non-negative'),
  handleValidationErrors
], async (req, res) => {
  try {
    const {
      query,
      number,
      offset,
      diet,
      excludeIngredients,
      intolerances,
      cuisine,
      type,
      maxReadyTime,
      minCalories,
      maxCalories,
      minCarbs,
      maxCarbs,
      minProtein,
      maxProtein,
      minFat,
      maxFat,
      sort,
      sortDirection
    } = req.query;

    const searchOptions = {
      number: parseInt(number) || 12,
      offset: parseInt(offset) || 0,
      diet,
      excludeIngredients,
      intolerances,
      cuisine,
      type,
      maxReadyTime: maxReadyTime ? parseInt(maxReadyTime) : undefined,
      minCalories: minCalories ? parseInt(minCalories) : undefined,
      maxCalories: maxCalories ? parseInt(maxCalories) : undefined,
      minCarbs: minCarbs ? parseInt(minCarbs) : undefined,
      maxCarbs: maxCarbs ? parseInt(maxCarbs) : undefined,
      minProtein: minProtein ? parseInt(minProtein) : undefined,
      maxProtein: maxProtein ? parseInt(maxProtein) : undefined,
      minFat: minFat ? parseInt(minFat) : undefined,
      maxFat: maxFat ? parseInt(maxFat) : undefined,
      sort: sort || 'popularity',
      sortDirection: sortDirection || 'desc'
    };

    const result = await spoonacularAPI.searchRecipes(query || '', searchOptions);

    // If user is authenticated, check which recipes are saved
    if (req.userId && result.results) {
      const savedRecipeIds = await SavedRecipe.find({ userId: req.userId })
        .select('recipeId')
        .lean();
      
      const savedIds = new Set(savedRecipeIds.map(sr => sr.recipeId));
      
      result.results.forEach(recipe => {
        recipe.isSaved = savedIds.has(recipe.id);
      });
    }

    res.json({
      success: true,
      data: result.results || [],
      totalResults: result.totalResults || 0,
      count: result.results ? result.results.length : 0,
      offset: result.offset || 0
    });
  } catch (error) {
    console.error('Complex search error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to search recipes'
    });
  }
});

// @route   GET /api/recipes/random
// @desc    Get random recipes
// @access  Public
router.get('/random', [
  requireAuth,
  optionalAuth,
  query('number').optional().isInt({ min: 1, max: 100 }).withMessage('Number must be between 1 and 100'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { number, tags } = req.query;
    
    const result = await spoonacularAPI.getRandomRecipes({
      number: parseInt(number) || 6,
      tags
    });

    // If user is authenticated, check which recipes are saved
    if (req.userId && result.recipes) {
      const savedRecipeIds = await SavedRecipe.find({ userId: req.userId })
        .select('recipeId')
        .lean();
      
      const savedIds = new Set(savedRecipeIds.map(sr => sr.recipeId));
      
      result.recipes.forEach(recipe => {
        recipe.isSaved = savedIds.has(recipe.id);
      });
    }

    res.json({
      success: true,
      data: result.recipes || [],
      count: result.recipes ? result.recipes.length : 0
    });
  } catch (error) {
    console.error('Random recipes error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get random recipes'
    });
  }
});

// @route   GET /api/recipes/:id
// @desc    Get recipe details by ID
// @access  Public
router.get('/:id', [
  requireAuth,
  optionalAuth,
  query('includeNutrition').optional().isBoolean().withMessage('includeNutrition must be boolean'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { id } = req.params;
    const { includeNutrition } = req.query;
    
    const recipe = await spoonacularAPI.getRecipeInformation(id, {
      includeNutrition: includeNutrition === 'true'
    });

    // If user is authenticated, check if recipe is saved
    if (req.userId) {
      const savedRecipe = await SavedRecipe.findOne({ 
        userId: req.userId, 
        recipeId: parseInt(id) 
      }).lean();
      
      recipe.isSaved = !!savedRecipe;
      recipe.userRating = savedRecipe ? savedRecipe.userRating : null;
      recipe.userTags = savedRecipe ? savedRecipe.tags : [];
      recipe.userNotes = savedRecipe ? savedRecipe.notes : '';
    }

    res.json({
      success: true,
      data: recipe
    });
  } catch (error) {
    console.error('Get recipe error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get recipe details'
    });
  }
});

// @route   GET /api/recipes/:id/similar
// @desc    Get similar recipes
// @access  Public
router.get('/:id/similar', [
  requireAuth,
  optionalAuth,
  query('number').optional().isInt({ min: 1, max: 10 }).withMessage('Number must be between 1 and 10'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { id } = req.params;
    const { number } = req.query;
    
    const recipes = await spoonacularAPI.getSimilarRecipes(id, {
      number: parseInt(number) || 3
    });

    // If user is authenticated, check which recipes are saved
    if (req.userId) {
      const savedRecipeIds = await SavedRecipe.find({ userId: req.userId })
        .select('recipeId')
        .lean();
      
      const savedIds = new Set(savedRecipeIds.map(sr => sr.recipeId));
      
      recipes.forEach(recipe => {
        recipe.isSaved = savedIds.has(recipe.id);
      });
    }

    res.json({
      success: true,
      data: recipes,
      count: recipes.length
    });
  } catch (error) {
    console.error('Similar recipes error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get similar recipes'
    });
  }
});

// @route   POST /api/recipes/save
// @desc    Save a recipe to user's cookbook
// @access  Private
router.post('/save', [
  requireAuth,
  checkAuth,
  body('recipeId').isInt().withMessage('Recipe ID must be a number'),
  body('recipeData').isObject().withMessage('Recipe data must be an object'),
  body('userRating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('notes').optional().isString().isLength({ max: 1000 }).withMessage('Notes must be less than 1000 characters'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { recipeId, recipeData, userRating, tags, notes } = req.body;
    const userId = req.userId;

    // Check if recipe is already saved
    const existingRecipe = await SavedRecipe.findOne({ userId, recipeId });
    
    if (existingRecipe) {
      return res.status(400).json({
        error: 'Recipe Already Saved',
        message: 'This recipe is already in your cookbook'
      });
    }

    const savedRecipe = new SavedRecipe({
      userId,
      recipeId,
      recipeData,
      userRating,
      tags: tags || [],
      notes: notes || ''
    });

    await savedRecipe.save();

    res.status(201).json({
      success: true,
      message: 'Recipe saved successfully',
      data: savedRecipe
    });
  } catch (error) {
    console.error('Save recipe error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to save recipe'
    });
  }
});

// @route   PUT /api/recipes/save/:id
// @desc    Update saved recipe
// @access  Private
router.put('/save/:id', [
  requireAuth,
  checkAuth,
  body('userRating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('notes').optional().isString().isLength({ max: 1000 }).withMessage('Notes must be less than 1000 characters'),
  body('isFavorite').optional().isBoolean().withMessage('isFavorite must be boolean'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { id } = req.params;
    const { userRating, tags, notes, isFavorite } = req.body;
    const userId = req.userId;

    const updateData = {};
    if (userRating !== undefined) updateData.userRating = userRating;
    if (tags !== undefined) updateData.tags = tags;
    if (notes !== undefined) updateData.notes = notes;
    if (isFavorite !== undefined) updateData.isFavorite = isFavorite;
    updateData.updatedAt = Date.now();

    const savedRecipe = await SavedRecipe.findOneAndUpdate(
      { _id: id, userId },
      updateData,
      { new: true }
    );

    if (!savedRecipe) {
      return res.status(404).json({
        error: 'Recipe Not Found',
        message: 'Saved recipe not found'
      });
    }

    res.json({
      success: true,
      message: 'Recipe updated successfully',
      data: savedRecipe
    });
  } catch (error) {
    console.error('Update saved recipe error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update saved recipe'
    });
  }
});

// @route   DELETE /api/recipes/save/:recipeId
// @desc    Remove recipe from user's cookbook
// @access  Private
router.delete('/save/:recipeId', [
  requireAuth,
  checkAuth
], async (req, res) => {
  try {
    const { recipeId } = req.params;
    const userId = req.userId;

    const deletedRecipe = await SavedRecipe.findOneAndDelete({
      userId,
      recipeId: parseInt(recipeId)
    });

    if (!deletedRecipe) {
      return res.status(404).json({
        error: 'Recipe Not Found',
        message: 'Saved recipe not found'
      });
    }

    res.json({
      success: true,
      message: 'Recipe removed from cookbook'
    });
  } catch (error) {
    console.error('Delete saved recipe error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to remove recipe from cookbook'
    });
  }
});

// @route   GET /api/recipes/saved
// @desc    Get user's saved recipes
// @access  Private
router.get('/saved', [
  requireAuth,
  checkAuth,
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sortBy').optional().isIn(['dateSaved', 'userRating', 'title']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
  query('tags').optional().isString().withMessage('Tags must be a string'),
  query('isFavorite').optional().isBoolean().withMessage('isFavorite must be boolean'),
  handleValidationErrors
], async (req, res) => {
  try {
    const userId = req.userId;
    const {
      page = 1,
      limit = 12,
      sortBy = 'dateSaved',
      sortOrder = 'desc',
      tags,
      isFavorite
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build query
    const query = { userId };
    if (tags) {
      query.tags = { $in: tags.split(',') };
    }
    if (isFavorite !== undefined) {
      query.isFavorite = isFavorite === 'true';
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const savedRecipes = await SavedRecipe.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const totalRecipes = await SavedRecipe.countDocuments(query);

    res.json({
      success: true,
      data: savedRecipes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalRecipes,
        pages: Math.ceil(totalRecipes / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get saved recipes error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get saved recipes'
    });
  }
});

// @route   POST /api/recipes/:id/cooked
// @desc    Mark recipe as cooked
// @access  Private
router.post('/:id/cooked', [
  requireAuth,
  checkAuth
], async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const savedRecipe = await SavedRecipe.findOneAndUpdate(
      { userId, recipeId: parseInt(id) },
      {
        $inc: { timesCooked: 1 },
        lastCooked: new Date(),
        updatedAt: Date.now()
      },
      { new: true }
    );

    if (!savedRecipe) {
      return res.status(404).json({
        error: 'Recipe Not Found',
        message: 'Recipe not found in your cookbook'
      });
    }

    res.json({
      success: true,
      message: 'Recipe marked as cooked',
      data: {
        timesCooked: savedRecipe.timesCooked,
        lastCooked: savedRecipe.lastCooked
      }
    });
  } catch (error) {
    console.error('Mark recipe as cooked error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to mark recipe as cooked'
    });
  }
});

module.exports = router;
