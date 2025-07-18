import React, { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const RecipeSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    try {
      // TODO: Implement actual API call
      setTimeout(() => {
        setRecipes([
          { id: 1, title: 'Sample Recipe 1', image: '/api/placeholder/300/200', readyInMinutes: 30 },
          { id: 2, title: 'Sample Recipe 2', image: '/api/placeholder/300/200', readyInMinutes: 45 },
        ]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Search error:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Recipe Search
        </h1>
        
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative max-w-md mx-auto">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for recipes..."
              className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <button
              type="submit"
              disabled={isLoading}
              className="absolute right-2 top-1.5 px-4 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {recipes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <div key={recipe.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  className="w-full h-48 object-cover"
                />
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
        )}

        {recipes.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              Search for recipes to get started!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeSearch;
