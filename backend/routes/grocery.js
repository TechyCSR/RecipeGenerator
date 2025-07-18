const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');
const GroceryList = require('../models/GroceryList');
const PantryItem = require('../models/PantryItem');
const SavedRecipe = require('../models/SavedRecipe');
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

// Helper function to categorize ingredients
const categorizeIngredient = (ingredient) => {
  const name = ingredient.toLowerCase();
  
  // Produce
  if (name.includes('tomato') || name.includes('onion') || name.includes('garlic') || 
      name.includes('lettuce') || name.includes('spinach') || name.includes('carrot') ||
      name.includes('bell pepper') || name.includes('cucumber') || name.includes('potato') ||
      name.includes('fruit') || name.includes('apple') || name.includes('banana') ||
      name.includes('lemon') || name.includes('lime') || name.includes('orange')) {
    return 'produce';
  }
  
  // Dairy
  if (name.includes('milk') || name.includes('cheese') || name.includes('butter') ||
      name.includes('cream') || name.includes('yogurt') || name.includes('sour cream')) {
    return 'dairy';
  }
  
  // Meat
  if (name.includes('chicken') || name.includes('beef') || name.includes('pork') ||
      name.includes('turkey') || name.includes('ham') || name.includes('bacon') ||
      name.includes('sausage') || name.includes('ground')) {
    return 'meat';
  }
  
  // Seafood
  if (name.includes('fish') || name.includes('salmon') || name.includes('tuna') ||
      name.includes('shrimp') || name.includes('crab') || name.includes('lobster')) {
    return 'seafood';
  }
  
  // Bakery
  if (name.includes('bread') || name.includes('roll') || name.includes('bagel') ||
      name.includes('croissant') || name.includes('muffin') || name.includes('cake')) {
    return 'bakery';
  }
  
  // Pantry
  if (name.includes('rice') || name.includes('pasta') || name.includes('flour') ||
      name.includes('sugar') || name.includes('salt') || name.includes('oil') ||
      name.includes('vinegar') || name.includes('can') || name.includes('jar') ||
      name.includes('box') || name.includes('beans') || name.includes('lentils')) {
    return 'pantry';
  }
  
  // Frozen
  if (name.includes('frozen') || name.includes('ice cream')) {
    return 'frozen';
  }
  
  // Beverages
  if (name.includes('water') || name.includes('juice') || name.includes('soda') ||
      name.includes('wine') || name.includes('beer') || name.includes('coffee') ||
      name.includes('tea')) {
    return 'beverages';
  }
  
  // Condiments
  if (name.includes('sauce') || name.includes('dressing') || name.includes('mayo') ||
      name.includes('mustard') || name.includes('ketchup') || name.includes('relish')) {
    return 'condiments';
  }
  
  // Spices
  if (name.includes('pepper') || name.includes('paprika') || name.includes('cumin') ||
      name.includes('oregano') || name.includes('basil') || name.includes('thyme') ||
      name.includes('rosemary') || name.includes('sage') || name.includes('spice')) {
    return 'spices';
  }
  
  return 'other';
};

// @route   GET /api/grocery
// @desc    Get user's grocery lists
// @access  Private
router.get('/', [
  requireAuth,
  checkAuth,
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('completed').optional().isBoolean().withMessage('Completed must be boolean'),
  handleValidationErrors
], async (req, res) => {
  try {
    const userId = req.userId;
    const {
      page = 1,
      limit = 10,
      completed
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build query
    const query = { userId };
    if (completed !== undefined) {
      query.isCompleted = completed === 'true';
    }

    const groceryLists = await GroceryList.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const totalLists = await GroceryList.countDocuments(query);

    res.json({
      success: true,
      data: groceryLists,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalLists,
        pages: Math.ceil(totalLists / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get grocery lists error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get grocery lists'
    });
  }
});

// @route   POST /api/grocery
// @desc    Create a new grocery list
// @access  Private
router.post('/', [
  requireAuth,
  checkAuth,
  body('name').notEmpty().trim().withMessage('Name is required'),
  body('description').optional().isString().isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
  body('items').optional().isArray().withMessage('Items must be an array'),
  body('dueDate').optional().isISO8601().withMessage('Due date must be valid'),
  handleValidationErrors
], async (req, res) => {
  try {
    const userId = req.userId;
    const { name, description, items, dueDate } = req.body;

    const groceryList = new GroceryList({
      userId,
      name,
      description: description || '',
      items: items || [],
      dueDate: dueDate ? new Date(dueDate) : null
    });

    await groceryList.save();

    res.status(201).json({
      success: true,
      message: 'Grocery list created',
      data: groceryList
    });
  } catch (error) {
    console.error('Create grocery list error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create grocery list'
    });
  }
});

// @route   GET /api/grocery/:id
// @desc    Get specific grocery list
// @access  Private
router.get('/:id', [
  requireAuth,
  checkAuth
], async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const groceryList = await GroceryList.findOne({ _id: id, userId });

    if (!groceryList) {
      return res.status(404).json({
        error: 'Grocery List Not Found',
        message: 'Grocery list not found'
      });
    }

    res.json({
      success: true,
      data: groceryList
    });
  } catch (error) {
    console.error('Get grocery list error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get grocery list'
    });
  }
});

// @route   PUT /api/grocery/:id
// @desc    Update grocery list
// @access  Private
router.put('/:id', [
  requireAuth,
  checkAuth,
  body('name').optional().notEmpty().trim().withMessage('Name cannot be empty'),
  body('description').optional().isString().isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
  body('items').optional().isArray().withMessage('Items must be an array'),
  body('dueDate').optional().isISO8601().withMessage('Due date must be valid'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const updateData = { ...req.body };

    if (updateData.dueDate) {
      updateData.dueDate = new Date(updateData.dueDate);
    }

    updateData.updatedAt = Date.now();

    const groceryList = await GroceryList.findOneAndUpdate(
      { _id: id, userId },
      updateData,
      { new: true }
    );

    if (!groceryList) {
      return res.status(404).json({
        error: 'Grocery List Not Found',
        message: 'Grocery list not found'
      });
    }

    res.json({
      success: true,
      message: 'Grocery list updated',
      data: groceryList
    });
  } catch (error) {
    console.error('Update grocery list error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update grocery list'
    });
  }
});

// @route   DELETE /api/grocery/:id
// @desc    Delete grocery list
// @access  Private
router.delete('/:id', [
  requireAuth,
  checkAuth
], async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const deletedList = await GroceryList.findOneAndDelete({ _id: id, userId });

    if (!deletedList) {
      return res.status(404).json({
        error: 'Grocery List Not Found',
        message: 'Grocery list not found'
      });
    }

    res.json({
      success: true,
      message: 'Grocery list deleted'
    });
  } catch (error) {
    console.error('Delete grocery list error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete grocery list'
    });
  }
});

// @route   POST /api/grocery/generate
// @desc    Generate grocery list from recipes
// @access  Private
router.post('/generate', [
  requireAuth,
  checkAuth,
  body('recipeIds').isArray().withMessage('Recipe IDs must be an array'),
  body('servings').optional().isObject().withMessage('Servings must be an object'),
  body('name').optional().isString().trim().withMessage('Name must be a string'),
  body('excludePantryItems').optional().isBoolean().withMessage('ExcludePantryItems must be boolean'),
  handleValidationErrors
], async (req, res) => {
  try {
    const userId = req.userId;
    const { recipeIds, servings, name, excludePantryItems } = req.body;

    if (recipeIds.length === 0) {
      return res.status(400).json({
        error: 'No Recipes Selected',
        message: 'Please select at least one recipe'
      });
    }

    // Get recipe details
    const recipes = await Promise.all(
      recipeIds.map(async (id) => {
        try {
          const recipe = await spoonacularAPI.getRecipeInformation(id);
          return recipe;
        } catch (error) {
          console.error(`Error fetching recipe ${id}:`, error);
          return null;
        }
      })
    );

    const validRecipes = recipes.filter(recipe => recipe !== null);

    if (validRecipes.length === 0) {
      return res.status(400).json({
        error: 'No Valid Recipes',
        message: 'Could not fetch recipe information'
      });
    }

    // Collect all ingredients
    const allIngredients = [];
    const sourceRecipes = [];

    validRecipes.forEach(recipe => {
      const recipeServings = servings && servings[recipe.id] ? servings[recipe.id] : recipe.servings || 1;
      const servingMultiplier = recipeServings / (recipe.servings || 1);

      sourceRecipes.push({
        recipeId: recipe.id,
        recipeName: recipe.title,
        servings: recipeServings
      });

      if (recipe.extendedIngredients) {
        recipe.extendedIngredients.forEach(ingredient => {
          allIngredients.push({
            name: ingredient.name,
            amount: ingredient.amount * servingMultiplier,
            unit: ingredient.unit || 'piece',
            aisle: ingredient.aisle || 'Other',
            category: categorizeIngredient(ingredient.name),
            spoonacularId: ingredient.id,
            recipeId: recipe.id
          });
        });
      }
    });

    // Combine similar ingredients
    const combinedIngredients = {};
    allIngredients.forEach(ingredient => {
      const key = `${ingredient.name}_${ingredient.unit}`;
      if (combinedIngredients[key]) {
        combinedIngredients[key].quantity += ingredient.amount;
      } else {
        combinedIngredients[key] = {
          name: ingredient.name,
          quantity: ingredient.amount,
          unit: ingredient.unit,
          category: ingredient.category,
          aisle: ingredient.aisle,
          spoonacularId: ingredient.spoonacularId,
          recipeId: ingredient.recipeId,
          isCompleted: false
        };
      }
    });

    let groceryItems = Object.values(combinedIngredients);

    // Remove pantry items if requested
    if (excludePantryItems) {
      const pantryItems = await PantryItem.find({ userId, quantity: { $gt: 0 } })
        .select('name quantity')
        .lean();

      const pantryMap = {};
      pantryItems.forEach(item => {
        pantryMap[item.name] = item.quantity;
      });

      groceryItems = groceryItems.filter(item => {
        const pantryQuantity = pantryMap[item.name] || 0;
        if (pantryQuantity >= item.quantity) {
          return false; // Don't include in grocery list
        } else if (pantryQuantity > 0) {
          item.quantity -= pantryQuantity; // Reduce needed quantity
        }
        return true;
      });
    }

    // Create grocery list
    const groceryList = new GroceryList({
      userId,
      name: name || `Grocery List - ${new Date().toLocaleDateString()}`,
      description: `Generated from ${validRecipes.length} recipe(s)`,
      items: groceryItems,
      sourceRecipes
    });

    await groceryList.save();

    res.status(201).json({
      success: true,
      message: 'Grocery list generated',
      data: groceryList
    });
  } catch (error) {
    console.error('Generate grocery list error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to generate grocery list'
    });
  }
});

// @route   PUT /api/grocery/:id/items/:itemId
// @desc    Update grocery list item
// @access  Private
router.put('/:id/items/:itemId', [
  requireAuth,
  checkAuth,
  body('isCompleted').optional().isBoolean().withMessage('isCompleted must be boolean'),
  body('quantity').optional().isFloat({ min: 0 }).withMessage('Quantity must be non-negative'),
  body('notes').optional().isString().isLength({ max: 200 }).withMessage('Notes must be less than 200 characters'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { id, itemId } = req.params;
    const userId = req.userId;
    const updateData = req.body;

    const groceryList = await GroceryList.findOne({ _id: id, userId });

    if (!groceryList) {
      return res.status(404).json({
        error: 'Grocery List Not Found',
        message: 'Grocery list not found'
      });
    }

    const item = groceryList.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        error: 'Item Not Found',
        message: 'Grocery list item not found'
      });
    }

    // Update item properties
    Object.keys(updateData).forEach(key => {
      item[key] = updateData[key];
    });

    groceryList.updatedAt = Date.now();
    await groceryList.save();

    res.json({
      success: true,
      message: 'Grocery list item updated',
      data: item
    });
  } catch (error) {
    console.error('Update grocery list item error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update grocery list item'
    });
  }
});

// @route   POST /api/grocery/:id/items
// @desc    Add item to grocery list
// @access  Private
router.post('/:id/items', [
  requireAuth,
  checkAuth,
  body('name').notEmpty().trim().withMessage('Name is required'),
  body('quantity').isFloat({ min: 0 }).withMessage('Quantity must be non-negative'),
  body('unit').notEmpty().trim().withMessage('Unit is required'),
  body('category').isIn([
    'produce', 'dairy', 'meat', 'seafood', 'bakery', 'pantry', 
    'frozen', 'beverages', 'snacks', 'condiments', 'spices', 'other'
  ]).withMessage('Invalid category'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { name, quantity, unit, category, aisle, notes, estimatedPrice } = req.body;

    const groceryList = await GroceryList.findOne({ _id: id, userId });

    if (!groceryList) {
      return res.status(404).json({
        error: 'Grocery List Not Found',
        message: 'Grocery list not found'
      });
    }

    const newItem = {
      name,
      quantity,
      unit,
      category,
      aisle: aisle || '',
      notes: notes || '',
      estimatedPrice: estimatedPrice || 0,
      isCompleted: false
    };

    groceryList.items.push(newItem);
    groceryList.updatedAt = Date.now();
    await groceryList.save();

    res.status(201).json({
      success: true,
      message: 'Item added to grocery list',
      data: newItem
    });
  } catch (error) {
    console.error('Add grocery list item error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to add item to grocery list'
    });
  }
});

// @route   DELETE /api/grocery/:id/items/:itemId
// @desc    Remove item from grocery list
// @access  Private
router.delete('/:id/items/:itemId', [
  requireAuth,
  checkAuth
], async (req, res) => {
  try {
    const { id, itemId } = req.params;
    const userId = req.userId;

    const groceryList = await GroceryList.findOne({ _id: id, userId });

    if (!groceryList) {
      return res.status(404).json({
        error: 'Grocery List Not Found',
        message: 'Grocery list not found'
      });
    }

    const item = groceryList.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        error: 'Item Not Found',
        message: 'Grocery list item not found'
      });
    }

    groceryList.items.pull(itemId);
    groceryList.updatedAt = Date.now();
    await groceryList.save();

    res.json({
      success: true,
      message: 'Item removed from grocery list'
    });
  } catch (error) {
    console.error('Remove grocery list item error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to remove item from grocery list'
    });
  }
});

// @route   POST /api/grocery/:id/complete
// @desc    Mark grocery list as completed
// @access  Private
router.post('/:id/complete', [
  requireAuth,
  checkAuth
], async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const groceryList = await GroceryList.findOneAndUpdate(
      { _id: id, userId },
      {
        isCompleted: true,
        completedAt: new Date(),
        updatedAt: Date.now()
      },
      { new: true }
    );

    if (!groceryList) {
      return res.status(404).json({
        error: 'Grocery List Not Found',
        message: 'Grocery list not found'
      });
    }

    res.json({
      success: true,
      message: 'Grocery list marked as completed',
      data: groceryList
    });
  } catch (error) {
    console.error('Complete grocery list error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to complete grocery list'
    });
  }
});

// @route   POST /api/grocery/:id/add-to-pantry
// @desc    Add completed grocery items to pantry
// @access  Private
router.post('/:id/add-to-pantry', [
  requireAuth,
  checkAuth
], async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const groceryList = await GroceryList.findOne({ _id: id, userId });

    if (!groceryList) {
      return res.status(404).json({
        error: 'Grocery List Not Found',
        message: 'Grocery list not found'
      });
    }

    const completedItems = groceryList.items.filter(item => item.isCompleted);

    if (completedItems.length === 0) {
      return res.status(400).json({
        error: 'No Completed Items',
        message: 'No completed items to add to pantry'
      });
    }

    const pantryItems = completedItems.map(item => ({
      userId,
      name: item.name.toLowerCase(),
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      spoonacularId: item.spoonacularId,
      purchaseDate: new Date()
    }));

    const results = await PantryItem.insertMany(pantryItems, { ordered: false });

    res.json({
      success: true,
      message: `${results.length} items added to pantry`,
      data: results
    });
  } catch (error) {
    console.error('Add to pantry error:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const insertedItems = error.insertedDocs || [];
      return res.status(207).json({
        success: true,
        message: `${insertedItems.length} items added to pantry, some duplicates skipped`,
        data: insertedItems
      });
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to add items to pantry'
    });
  }
});

module.exports = router;
