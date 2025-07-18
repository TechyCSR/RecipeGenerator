const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');
const PantryItem = require('../models/PantryItem');
const { requireAuth, checkAuth } = require('../middleware/auth');
const spoonacularAPI = require('../services/spoonacularAPI');

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

// @route   GET /api/pantry
// @desc    Get user's pantry items
// @access  Private
router.get('/', [
  requireAuth,
  checkAuth,
  query('category').optional().isString().withMessage('Category must be a string'),
  query('expired').optional().isBoolean().withMessage('Expired must be boolean'),
  query('expiringSoon').optional().isBoolean().withMessage('ExpiringSoon must be boolean'),
  query('search').optional().isString().withMessage('Search must be a string'),
  handleValidationErrors
], async (req, res) => {
  try {
    const userId = req.userId;
    const { category, expired, expiringSoon, search } = req.query;

    // Build query
    const query = { userId };
    
    if (category) {
      query.category = category;
    }
    
    if (expired === 'true') {
      query.isExpired = true;
    } else if (expired === 'false') {
      query.isExpired = false;
    }
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    let pantryItems = await PantryItem.find(query)
      .sort({ category: 1, name: 1 })
      .lean();

    // Filter for expiring soon if requested
    if (expiringSoon === 'true') {
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
      
      pantryItems = pantryItems.filter(item => {
        return item.expirationDate && 
               item.expirationDate <= threeDaysFromNow && 
               !item.isExpired;
      });
    }

    // Group items by category
    const groupedItems = pantryItems.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {});

    // Get summary statistics
    const stats = {
      total: pantryItems.length,
      expired: pantryItems.filter(item => item.isExpired).length,
      expiringSoon: pantryItems.filter(item => {
        if (!item.expirationDate || item.isExpired) return false;
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
        return item.expirationDate <= threeDaysFromNow;
      }).length,
      categories: Object.keys(groupedItems).length
    };

    res.json({
      success: true,
      data: {
        items: pantryItems,
        grouped: groupedItems,
        stats
      }
    });
  } catch (error) {
    console.error('Get pantry items error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get pantry items'
    });
  }
});

// @route   POST /api/pantry
// @desc    Add item to pantry
// @access  Private
router.post('/', [
  requireAuth,
  checkAuth,
  body('name').notEmpty().trim().withMessage('Name is required'),
  body('category').isIn([
    'produce', 'dairy', 'meat', 'seafood', 'bakery', 'pantry', 
    'frozen', 'beverages', 'snacks', 'condiments', 'spices', 'other'
  ]).withMessage('Invalid category'),
  body('quantity').optional().isFloat({ min: 0 }).withMessage('Quantity must be non-negative'),
  body('unit').optional().isString().trim().withMessage('Unit must be a string'),
  body('expirationDate').optional().isISO8601().withMessage('Expiration date must be valid'),
  body('purchaseDate').optional().isISO8601().withMessage('Purchase date must be valid'),
  body('notes').optional().isString().isLength({ max: 500 }).withMessage('Notes must be less than 500 characters'),
  handleValidationErrors
], async (req, res) => {
  try {
    const userId = req.userId;
    const {
      name,
      category,
      quantity,
      unit,
      expirationDate,
      purchaseDate,
      notes,
      spoonacularId
    } = req.body;

    // Check if item already exists
    const existingItem = await PantryItem.findOne({ userId, name: name.toLowerCase() });
    
    if (existingItem) {
      // Update quantity if item exists
      existingItem.quantity += quantity || 1;
      existingItem.updatedAt = Date.now();
      await existingItem.save();
      
      return res.json({
        success: true,
        message: 'Item quantity updated',
        data: existingItem
      });
    }

    const pantryItem = new PantryItem({
      userId,
      name: name.toLowerCase(),
      category,
      quantity: quantity || 1,
      unit: unit || 'piece',
      expirationDate: expirationDate ? new Date(expirationDate) : null,
      purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
      notes: notes || '',
      spoonacularId
    });

    await pantryItem.save();

    res.status(201).json({
      success: true,
      message: 'Item added to pantry',
      data: pantryItem
    });
  } catch (error) {
    console.error('Add pantry item error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to add item to pantry'
    });
  }
});

// @route   PUT /api/pantry/:id
// @desc    Update pantry item
// @access  Private
router.put('/:id', [
  requireAuth,
  checkAuth,
  body('name').optional().notEmpty().trim().withMessage('Name cannot be empty'),
  body('category').optional().isIn([
    'produce', 'dairy', 'meat', 'seafood', 'bakery', 'pantry', 
    'frozen', 'beverages', 'snacks', 'condiments', 'spices', 'other'
  ]).withMessage('Invalid category'),
  body('quantity').optional().isFloat({ min: 0 }).withMessage('Quantity must be non-negative'),
  body('unit').optional().isString().trim().withMessage('Unit must be a string'),
  body('expirationDate').optional().isISO8601().withMessage('Expiration date must be valid'),
  body('purchaseDate').optional().isISO8601().withMessage('Purchase date must be valid'),
  body('notes').optional().isString().isLength({ max: 500 }).withMessage('Notes must be less than 500 characters'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const updateData = { ...req.body };

    if (updateData.name) {
      updateData.name = updateData.name.toLowerCase();
    }

    if (updateData.expirationDate) {
      updateData.expirationDate = new Date(updateData.expirationDate);
    }

    if (updateData.purchaseDate) {
      updateData.purchaseDate = new Date(updateData.purchaseDate);
    }

    updateData.updatedAt = Date.now();

    const pantryItem = await PantryItem.findOneAndUpdate(
      { _id: id, userId },
      updateData,
      { new: true }
    );

    if (!pantryItem) {
      return res.status(404).json({
        error: 'Item Not Found',
        message: 'Pantry item not found'
      });
    }

    res.json({
      success: true,
      message: 'Pantry item updated',
      data: pantryItem
    });
  } catch (error) {
    console.error('Update pantry item error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update pantry item'
    });
  }
});

// @route   DELETE /api/pantry/:id
// @desc    Remove item from pantry
// @access  Private
router.delete('/:id', [
  requireAuth,
  checkAuth
], async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const deletedItem = await PantryItem.findOneAndDelete({ _id: id, userId });

    if (!deletedItem) {
      return res.status(404).json({
        error: 'Item Not Found',
        message: 'Pantry item not found'
      });
    }

    res.json({
      success: true,
      message: 'Item removed from pantry'
    });
  } catch (error) {
    console.error('Delete pantry item error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to remove item from pantry'
    });
  }
});

// @route   POST /api/pantry/bulk
// @desc    Add multiple items to pantry
// @access  Private
router.post('/bulk', [
  requireAuth,
  checkAuth,
  body('items').isArray().withMessage('Items must be an array'),
  body('items.*.name').notEmpty().trim().withMessage('Each item must have a name'),
  body('items.*.category').isIn([
    'produce', 'dairy', 'meat', 'seafood', 'bakery', 'pantry', 
    'frozen', 'beverages', 'snacks', 'condiments', 'spices', 'other'
  ]).withMessage('Invalid category'),
  handleValidationErrors
], async (req, res) => {
  try {
    const userId = req.userId;
    const { items } = req.body;

    const pantryItems = items.map(item => ({
      userId,
      name: item.name.toLowerCase(),
      category: item.category,
      quantity: item.quantity || 1,
      unit: item.unit || 'piece',
      expirationDate: item.expirationDate ? new Date(item.expirationDate) : null,
      purchaseDate: item.purchaseDate ? new Date(item.purchaseDate) : new Date(),
      notes: item.notes || '',
      spoonacularId: item.spoonacularId
    }));

    const result = await PantryItem.insertMany(pantryItems, { ordered: false });

    res.status(201).json({
      success: true,
      message: `${result.length} items added to pantry`,
      data: result
    });
  } catch (error) {
    console.error('Bulk add pantry items error:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const insertedItems = error.insertedDocs || [];
      return res.status(207).json({
        success: true,
        message: `${insertedItems.length} items added, some duplicates skipped`,
        data: insertedItems
      });
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to add items to pantry'
    });
  }
});

// @route   POST /api/pantry/consume
// @desc    Consume/use pantry items (from cooking)
// @access  Private
router.post('/consume', [
  requireAuth,
  checkAuth,
  body('items').isArray().withMessage('Items must be an array'),
  body('items.*.name').notEmpty().withMessage('Item name is required'),
  body('items.*.quantity').isFloat({ min: 0 }).withMessage('Quantity must be non-negative'),
  handleValidationErrors
], async (req, res) => {
  try {
    const userId = req.userId;
    const { items } = req.body;

    const results = [];

    for (const item of items) {
      const pantryItem = await PantryItem.findOne({
        userId,
        name: item.name.toLowerCase()
      });

      if (pantryItem) {
        const newQuantity = Math.max(0, pantryItem.quantity - item.quantity);
        
        if (newQuantity === 0) {
          await PantryItem.findByIdAndDelete(pantryItem._id);
          results.push({
            name: item.name,
            action: 'removed',
            message: 'Item consumed completely and removed from pantry'
          });
        } else {
          pantryItem.quantity = newQuantity;
          pantryItem.updatedAt = Date.now();
          await pantryItem.save();
          results.push({
            name: item.name,
            action: 'updated',
            remainingQuantity: newQuantity,
            message: `Quantity updated to ${newQuantity}`
          });
        }
      } else {
        results.push({
          name: item.name,
          action: 'not_found',
          message: 'Item not found in pantry'
        });
      }
    }

    res.json({
      success: true,
      message: 'Pantry items consumed',
      data: results
    });
  } catch (error) {
    console.error('Consume pantry items error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to consume pantry items'
    });
  }
});

// @route   GET /api/pantry/expiring
// @desc    Get items expiring soon
// @access  Private
router.get('/expiring', [
  requireAuth,
  checkAuth,
  query('days').optional().isInt({ min: 1, max: 30 }).withMessage('Days must be between 1 and 30'),
  handleValidationErrors
], async (req, res) => {
  try {
    const userId = req.userId;
    const days = parseInt(req.query.days) || 7;

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);

    const expiringItems = await PantryItem.find({
      userId,
      expirationDate: {
        $exists: true,
        $ne: null,
        $lte: targetDate
      },
      isExpired: false
    }).sort({ expirationDate: 1 });

    res.json({
      success: true,
      data: expiringItems,
      count: expiringItems.length,
      daysAhead: days
    });
  } catch (error) {
    console.error('Get expiring items error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get expiring items'
    });
  }
});

// @route   GET /api/pantry/suggestions
// @desc    Get recipe suggestions based on pantry items
// @access  Private
router.get('/suggestions', [
  requireAuth,
  checkAuth,
  query('number').optional().isInt({ min: 1, max: 50 }).withMessage('Number must be between 1 and 50'),
  handleValidationErrors
], async (req, res) => {
  try {
    const userId = req.userId;
    const number = parseInt(req.query.number) || 12;

    // Get all pantry items
    const pantryItems = await PantryItem.find({ userId, quantity: { $gt: 0 } })
      .select('name')
      .lean();

    if (pantryItems.length === 0) {
      return res.json({
        success: true,
        data: [],
        message: 'No items in pantry'
      });
    }

    // Extract ingredient names
    const ingredients = pantryItems.map(item => item.name).join(',');

    // Get recipe suggestions
    const recipes = await spoonacularAPI.searchRecipesByIngredients(ingredients, {
      number,
      ranking: 1
    });

    res.json({
      success: true,
      data: recipes,
      count: recipes.length,
      pantryItemsUsed: pantryItems.length
    });
  } catch (error) {
    console.error('Get pantry suggestions error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get recipe suggestions'
    });
  }
});

// @route   POST /api/pantry/ingredients/autocomplete
// @desc    Autocomplete ingredient search
// @access  Private
router.post('/ingredients/autocomplete', [
  requireAuth,
  checkAuth,
  body('query').notEmpty().withMessage('Query is required'),
  body('number').optional().isInt({ min: 1, max: 20 }).withMessage('Number must be between 1 and 20'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { query, number } = req.body;

    const suggestions = await spoonacularAPI.autocompleteIngredient(query, {
      number: number || 10
    });

    res.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    console.error('Autocomplete ingredients error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to autocomplete ingredients'
    });
  }
});

// @route   GET /api/pantry/categories
// @desc    Get available categories
// @access  Private
router.get('/categories', [
  requireAuth,
  checkAuth
], async (req, res) => {
  try {
    const categories = [
      { value: 'produce', label: 'Produce', icon: '🥕' },
      { value: 'dairy', label: 'Dairy', icon: '🥛' },
      { value: 'meat', label: 'Meat', icon: '🥩' },
      { value: 'seafood', label: 'Seafood', icon: '🐟' },
      { value: 'bakery', label: 'Bakery', icon: '🍞' },
      { value: 'pantry', label: 'Pantry', icon: '🥫' },
      { value: 'frozen', label: 'Frozen', icon: '🧊' },
      { value: 'beverages', label: 'Beverages', icon: '🥤' },
      { value: 'snacks', label: 'Snacks', icon: '🍪' },
      { value: 'condiments', label: 'Condiments', icon: '🧂' },
      { value: 'spices', label: 'Spices', icon: '🌶️' },
      { value: 'other', label: 'Other', icon: '📦' }
    ];

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get categories'
    });
  }
});

module.exports = router;
