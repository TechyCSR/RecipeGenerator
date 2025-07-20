module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Mock recipe search functionality
  const { ingredients } = req.query;
  
  const mockRecipes = [
    {
      id: 1,
      title: "Simple Pasta with " + (ingredients || "ingredients"),
      image: "https://spoonacular.com/recipeImages/716429-556x370.jpg",
      usedIngredientCount: 2,
      missedIngredientCount: 1,
      likes: 150,
      usedIngredients: [
        { name: "pasta", amount: "200g" },
        { name: "tomatoes", amount: "3 medium" }
      ],
      missedIngredients: [
        { name: "basil", amount: "1 bunch" }
      ]
    },
    {
      id: 2,
      title: "Quick Stir Fry with " + (ingredients || "vegetables"),
      image: "https://spoonacular.com/recipeImages/715538-556x370.jpg",
      usedIngredientCount: 3,
      missedIngredientCount: 0,
      likes: 89,
      usedIngredients: [
        { name: "vegetables", amount: "mixed" },
        { name: "soy sauce", amount: "2 tbsp" },
        { name: "oil", amount: "1 tbsp" }
      ],
      missedIngredients: []
    }
  ];
  
  res.status(200).json(mockRecipes);
};
