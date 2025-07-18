const mongoose = require('mongoose');

const pantryItemSchema = new mongoose.Schema({
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
    ],
    default: 'other'
  },
  quantity: {
    type: Number,
    default: 1,
    min: 0
  },
  unit: {
    type: String,
    trim: true,
    default: 'piece'
  },
  expirationDate: {
    type: Date,
    default: null
  },
  purchaseDate: {
    type: Date,
    default: Date.now
  },
  isExpired: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    maxlength: 500
  },
  image: {
    type: String,
    default: null
  },
  spoonacularId: {
    type: Number,
    default: null
  },
  nutritionData: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
    fiber: Number,
    sugar: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for user-item uniqueness
pantryItemSchema.index({ userId: 1, name: 1 });

// Index for better query performance
pantryItemSchema.index({ userId: 1, category: 1 });
pantryItemSchema.index({ userId: 1, expirationDate: 1 });

// Virtual for checking if item is expiring soon (within 3 days)
pantryItemSchema.virtual('isExpiringSoon').get(function() {
  if (!this.expirationDate) return false;
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
  return this.expirationDate <= threeDaysFromNow;
});

// Update isExpired based on expiration date
pantryItemSchema.pre('save', function(next) {
  if (this.expirationDate) {
    this.isExpired = this.expirationDate < new Date();
  }
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('PantryItem', pantryItemSchema);
