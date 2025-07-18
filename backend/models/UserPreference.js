const mongoose = require('mongoose');

const userPreferenceSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  // Dietary preferences
  dietaryRestrictions: [{
    type: String,
    enum: [
      'vegetarian',
      'vegan',
      'gluten-free',
      'dairy-free',
      'keto',
      'paleo',
      'low-carb',
      'low-fat',
      'low-sodium',
      'nut-free',
      'soy-free',
      'egg-free',
      'pescatarian',
      'whole30',
      'mediterranean'
    ]
  }],
  allergies: [{
    type: String,
    trim: true
  }],
  
  // Cuisine preferences
  preferredCuisines: [{
    type: String,
    trim: true
  }],
  dislikedCuisines: [{
    type: String,
    trim: true
  }],
  
  // Cooking preferences
  maxCookingTime: {
    type: Number,
    default: 60, // minutes
    min: 5,
    max: 480
  },
  skillLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  
  // Nutritional goals
  dailyCalorieGoal: {
    type: Number,
    min: 1000,
    max: 5000,
    default: 2000
  },
  proteinGoal: {
    type: Number,
    min: 0,
    max: 500,
    default: 50 // grams
  },
  carbGoal: {
    type: Number,
    min: 0,
    max: 1000,
    default: 250 // grams
  },
  fatGoal: {
    type: Number,
    min: 0,
    max: 300,
    default: 65 // grams
  },
  
  // Meal planning
  mealsPerDay: {
    type: Number,
    default: 3,
    min: 1,
    max: 6
  },
  servingsPerMeal: {
    type: Number,
    default: 1,
    min: 1,
    max: 10
  },
  
  // App preferences
  theme: {
    type: String,
    enum: ['light', 'dark', 'system'],
    default: 'system'
  },
  language: {
    type: String,
    default: 'en'
  },
  units: {
    type: String,
    enum: ['metric', 'imperial'],
    default: 'metric'
  },
  
  // Notification preferences
  notifications: {
    recipeRecommendations: {
      type: Boolean,
      default: true
    },
    mealPlanReminders: {
      type: Boolean,
      default: true
    },
    expirationWarnings: {
      type: Boolean,
      default: true
    },
    groceryReminders: {
      type: Boolean,
      default: true
    }
  },
  
  // Shopping preferences
  preferredStores: [{
    name: String,
    location: String,
    priority: {
      type: Number,
      min: 1,
      max: 10,
      default: 5
    }
  }],
  budgetPerWeek: {
    type: Number,
    min: 0,
    default: 100
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

// Update timestamp on save
userPreferenceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('UserPreference', userPreferenceSchema);
