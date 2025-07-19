import React, { useState } from 'react';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

const SavedRecipes = () => {
  const [savedRecipes] = useState([
    { 
      id: 1, 
      title: 'Spaghetti Carbonara', 
      image: 'https://img.spoonacular.com/recipes/511728-312x231.jpg', 
      readyInMinutes: 20,
      summary: 'A classic Italian pasta dish with eggs, cheese, and pancetta.'
    },
    { 
      id: 2, 
      title: 'Chicken Teriyaki Bowl', 
      image: 'https://img.spoonacular.com/recipes/715543-312x231.jpg', 
      readyInMinutes: 25,
      summary: 'Delicious grilled chicken with teriyaki sauce over rice.'
    },
    { 
      id: 3, 
      title: 'Chocolate Chip Cookies', 
      image: 'https://img.spoonacular.com/recipes/157344-312x231.jpg', 
      readyInMinutes: 15,
      summary: 'Classic homemade chocolate chip cookies that are crispy on the outside and chewy on the inside.'
    },
    { 
      id: 4, 
      title: 'Caesar Salad', 
      image: 'https://img.spoonacular.com/recipes/715415-312x231.jpg', 
      readyInMinutes: 10,
      summary: 'Fresh romaine lettuce with parmesan cheese and creamy caesar dressing.'
    },
  ]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Saved Recipes
        </h1>
        
        {savedRecipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {savedRecipes.map((recipe) => (
              <div key={recipe.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="relative">
                  <img
                    src={recipe.image}
                    alt={recipe.title}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1495147466023-ac5c588e2e94?w=312&h=231&fit=crop';
                    }}
                  />
                  <button className="absolute top-2 right-2 p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
                    <HeartSolidIcon className="h-5 w-5 text-red-500" />
                  </button>
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
                    {recipe.readyInMinutes} min
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 line-clamp-2">
                    {recipe.title}
                  </h3>
                  {recipe.summary && (
                    <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-3">
                      {recipe.summary}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-green-600 dark:text-green-400 text-sm font-medium">
                      ⏱️ {recipe.readyInMinutes} minutes
                    </span>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm transition-colors duration-200">
                      View Recipe
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <HeartIcon className="h-24 w-24 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No saved recipes yet
            </p>
            <p className="text-gray-400 dark:text-gray-500">
              Start saving your favorite recipes!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedRecipes;
