const mongoose = require('mongoose');

const groceryListSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    maxlength: 500
  },
  items: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 0
    },
    unit: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      enum: [
        'produce',
        'dairy',
        'meat',
        'seafood',
        'bakery',
        'pantry',
        'frozen',
        'beverages',
        'snacks',
        'condiments',
        'spices',
        'other'
      ]
    },
    aisle: {
      type: String,
      trim: true
    },
    isCompleted: {
      type: Boolean,
      default: false
    },
    estimatedPrice: {
      type: Number,
      min: 0
    },
    notes: {
      type: String,
      maxlength: 200
    },
    spoonacularId: {
      type: Number,
      default: null
    },
    recipeId: {
      type: Number,
      default: null
    }
  }],
  totalEstimatedPrice: {
    type: Number,
    default: 0
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date,
    default: null
  },
  dueDate: {
    type: Date,
    default: null
  },
  tags: [{
    type: String,
    trim: true
  }],
  sourceRecipes: [{
    recipeId: Number,
    recipeName: String,
    servings: Number
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for better query performance
groceryListSchema.index({ userId: 1, createdAt: -1 });
groceryListSchema.index({ userId: 1, isCompleted: 1 });

// Virtual for completion percentage
groceryListSchema.virtual('completionPercentage').get(function() {
  if (this.items.length === 0) return 0;
  const completedItems = this.items.filter(item => item.isCompleted).length;
  return Math.round((completedItems / this.items.length) * 100);
});

// Update grocery list completion status
groceryListSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Update list completion status
  if (this.items.length > 0) {
    const allCompleted = this.items.every(item => item.isCompleted);
    this.isCompleted = allCompleted;
    
    if (allCompleted && !this.completedAt) {
      this.completedAt = new Date();
    } else if (!allCompleted && this.completedAt) {
      this.completedAt = null;
    }
  }
  
  // Calculate total estimated price
  this.totalEstimatedPrice = this.items.reduce((total, item) => {
    return total + (item.estimatedPrice || 0);
  }, 0);
  
  next();
});

module.exports = mongoose.model('GroceryList', groceryListSchema);
