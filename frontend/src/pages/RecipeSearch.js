import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import { recipeApi } from '../services/api';
import RecipeCard from '../components/Recipe/RecipeCard';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const RecipeSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [ingredients, setIngredients] = useState(searchParams.get('ingredients') || '');
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchType, setSearchType] = useState('complex'); // 'complex' or 'ingredients'
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    cuisine: '',
    diet: '',
    maxReadyTime: '',
    maxCalories: '',
    sort: 'popularity'
  });

  useEffect(() => {
    // Perform search if there are initial parameters
    const initialQuery = searchParams.get('q');
    const initialIngredients = searchParams.get('ingredients');
    
    if (initialQuery || initialIngredients) {
      if (initialIngredients) {
        setSearchType('ingredients');
        setIngredients(initialIngredients);
        handleSearch(null, 'ingredients', initialIngredients);
      } else if (initialQuery) {
        setSearchType('complex');
        setSearchTerm(initialQuery);
        handleSearch(null, 'complex', initialQuery);
      }
    }
  }, []);

  const handleSearch = async (e, type = searchType, query = null) => {
    if (e) e.preventDefault();
    
    const searchQuery = query || (type === 'ingredients' ? ingredients : searchTerm);
    if (!searchQuery.trim()) {
      toast.error('Please enter a search term or ingredients');
      return;
    }

    setIsLoading(true);
    try {
      let response;
      
      if (type === 'ingredients') {
        response = await recipeApi.searchByIngredients(searchQuery, {
          number: 12,
          ranking: 1,
          ...filters
        });
      } else {
        response = await recipeApi.searchComplex(searchQuery, {
          number: 12,
          offset: 0,
          ...filters
        });
      }
      
      setRecipes(response.data || []);
      setTotalResults(response.totalResults || response.count || 0);
      setCurrentPage(1);
      
      // Update URL parameters
      const params = new URLSearchParams();
      if (type === 'ingredients') {
        params.set('ingredients', searchQuery);
      } else {
        params.set('q', searchQuery);
      }
      setSearchParams(params);
      
    } catch (error) {
      console.error('Search error:', error);
      toast.error(error.message || 'Failed to search recipes');
      setRecipes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      cuisine: '',
      diet: '',
      maxReadyTime: '',
      maxCalories: '',
      sort: 'popularity'
    });
  };

  const switchSearchType = (type) => {
    setSearchType(type);
    setRecipes([]);
    setTotalResults(0);
    if (type === 'ingredients') {
      setSearchTerm('');
    } else {
      setIngredients('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Recipe Search
          </h1>
          
          {/* Search Type Toggle */}
          <div className="flex items-center space-x-4 mb-6">
            <button
              onClick={() => switchSearchType('complex')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                searchType === 'complex'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
              }`}
            >
              Search by Name
            </button>
            <button
              onClick={() => switchSearchType('ingredients')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                searchType === 'ingredients'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
              }`}
            >
              Search by Ingredients
            </button>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchType === 'ingredients' ? ingredients : searchTerm}
                  onChange={(e) => searchType === 'ingredients' ? setIngredients(e.target.value) : setSearchTerm(e.target.value)}
                  placeholder={searchType === 'ingredients' ? "Enter ingredients (e.g., chicken, tomato, onion)" : "Search for recipes..."}
                  className="w-full px-4 py-3 pl-12 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                />
                <MagnifyingGlassIcon className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
              </div>
              
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center"
              >
                <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
                Filters
              </button>
              
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <LoadingSpinner className="h-5 w-5" />
                ) : (
                  'Search'
                )}
              </button>
            </div>
          </form>

          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                >
                  Clear All
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cuisine</label>
                  <select
                    value={filters.cuisine}
                    onChange={(e) => handleFilterChange('cuisine', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Any Cuisine</option>
                    <option value="italian">Italian</option>
                    <option value="mexican">Mexican</option>
                    <option value="asian">Asian</option>
                    <option value="american">American</option>
                    <option value="indian">Indian</option>
                    <option value="mediterranean">Mediterranean</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Diet</label>
                  <select
                    value={filters.diet}
                    onChange={(e) => handleFilterChange('diet', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Any Diet</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="vegan">Vegan</option>
                    <option value="gluten free">Gluten Free</option>
                    <option value="ketogenic">Keto</option>
                    <option value="paleo">Paleo</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Max Cook Time</label>
                  <select
                    value={filters.maxReadyTime}
                    onChange={(e) => handleFilterChange('maxReadyTime', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Any Time</option>
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="120">2 hours</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sort By</label>
                  <select
                    value={filters.sort}
                    onChange={(e) => handleFilterChange('sort', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="popularity">Popularity</option>
                    <option value="healthiness">Healthiness</option>
                    <option value="price">Price</option>
                    <option value="time">Cook Time</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Search Results */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner className="h-12 w-12" />
          </div>
        ) : recipes.length > 0 ? (
          <>
            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-400">
                Found {totalResults} recipe{totalResults !== 1 ? 's' : ''} 
                {searchType === 'ingredients' ? ' using your ingredients' : ''}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <MagnifyingGlassIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {searchTerm || ingredients ? 'No recipes found' : 'Search for recipes to get started!'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm || ingredients 
                ? 'Try adjusting your search terms or filters' 
                : searchType === 'ingredients' 
                  ? 'Enter ingredients you have available'
                  : 'Enter a recipe name or keyword'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeSearch;
