const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  spoonacularId: {
    type: Number,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  imageType: {
    type: String,
    default: 'jpg'
  },
  usedIngredientCount: {
    type: Number,
    default: 0
  },
  missedIngredientCount: {
    type: Number,
    default: 0
  },
  missedIngredients: [{
    id: Number,
    amount: Number,
    unit: String,
    unitLong: String,
    unitShort: String,
    aisle: String,
    name: String,
    original: String,
    originalString: String,
    originalName: String,
    metaInformation: [String],
    meta: [String],
    image: String
  }],
  usedIngredients: [{
    id: Number,
    amount: Number,
    unit: String,
    unitLong: String,
    unitShort: String,
    aisle: String,
    name: String,
    original: String,
    originalString: String,
    originalName: String,
    metaInformation: [String],
    meta: [String],
    image: String
  }],
  unusedIngredients: [{
    id: Number,
    amount: Number,
    unit: String,
    unitLong: String,
    unitShort: String,
    aisle: String,
    name: String,
    original: String,
    originalString: String,
    originalName: String,
    metaInformation: [String],
    meta: [String],
    image: String
  }],
  likes: {
    type: Number,
    default: 0
  },
  // Additional recipe details
  readyInMinutes: {
    type: Number,
    default: 0
  },
  servings: {
    type: Number,
    default: 1
  },
  sourceUrl: String,
  spoonacularSourceUrl: String,
  aggregateLikes: Number,
  healthScore: Number,
  spoonacularScore: Number,
  pricePerServing: Number,
  analyzedInstructions: [{
    name: String,
    steps: [{
      number: Number,
      step: String,
      ingredients: [{
        id: Number,
        name: String,
        localizedName: String,
        image: String
      }],
      equipment: [{
        id: Number,
        name: String,
        localizedName: String,
        image: String
      }],
      length: {
        number: Number,
        unit: String
      }
    }]
  }],
  cuisines: [String],
  dishTypes: [String],
  diets: [String],
  occasions: [String],
  instructions: String,
  analyzedInstructions: Array,
  originalId: Number,
  summary: String,
  nutrition: {
    nutrients: [{
      name: String,
      amount: Number,
      unit: String,
      percentOfDailyNeeds: Number
    }],
    properties: [{
      name: String,
      amount: Number,
      unit: String
    }],
    flavonoids: [{
      name: String,
      amount: Number,
      unit: String
    }],
    ingredients: [{
      id: Number,
      name: String,
      amount: Number,
      unit: String,
      nutrients: [{
        name: String,
        amount: Number,
        unit: String,
        percentOfDailyNeeds: Number
      }]
    }],
    caloricBreakdown: {
      percentProtein: Number,
      percentFat: Number,
      percentCarbs: Number
    },
    weightPerServing: {
      amount: Number,
      unit: String
    }
  },
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for better search performance
recipeSchema.index({ title: 'text', 'cuisines': 1, 'dishTypes': 1 });
recipeSchema.index({ spoonacularId: 1 });

module.exports = mongoose.model('Recipe', recipeSchema);
