import React, { useState } from 'react';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

const SavedRecipes = () => {
  const [savedRecipes] = useState([
    { id: 1, title: 'Saved Recipe 1', image: '/api/placeholder/300/200', readyInMinutes: 30 },
    { id: 2, title: 'Saved Recipe 2', image: '/api/placeholder/300/200', readyInMinutes: 45 },
  ]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Saved Recipes
        </h1>
        
        {savedRecipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedRecipes.map((recipe) => (
              <div key={recipe.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <div className="relative">
                  <img
                    src={recipe.image}
                    alt={recipe.title}
                    className="w-full h-48 object-cover"
                  />
                  <button className="absolute top-2 right-2 p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700">
                    <HeartSolidIcon className="h-5 w-5 text-red-500" />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                    {recipe.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Ready in {recipe.readyInMinutes} minutes
                  </p>
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
