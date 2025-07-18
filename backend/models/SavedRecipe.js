const mongoose = require('mongoose');

const savedRecipeSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  recipeId: {
    type: Number,
    required: true
  },
  recipeData: {
    type: Object,
    required: true
  },
  userRating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  tags: [{
    type: String,
    trim: true
  }],
  notes: {
    type: String,
    maxlength: 1000
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  lastCooked: {
    type: Date,
    default: null
  },
  timesCooked: {
    type: Number,
    default: 0
  },
  dateSaved: {
    type: Date,
    default: Date.now
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

// Compound index for user-recipe uniqueness
savedRecipeSchema.index({ userId: 1, recipeId: 1 }, { unique: true });

// Index for better query performance
savedRecipeSchema.index({ userId: 1, isFavorite: 1 });
savedRecipeSchema.index({ userId: 1, tags: 1 });

module.exports = mongoose.model('SavedRecipe', savedRecipeSchema);
