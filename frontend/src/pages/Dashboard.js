import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { 
  MagnifyingGlassIcon, 
  BookmarkIcon, 
  ShoppingBagIcon, 
  CubeIcon,
  ChartBarIcon,
  ClockIcon,
  FireIcon,
  StarIcon,
  ArrowRightIcon,
  UserCircleIcon,
  BellIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';
import { 
  BookmarkIcon as BookmarkSolidIcon,
  ShoppingBagIcon as ShoppingBagSolidIcon,
  CubeIcon as CubeSolidIcon,
  ChartBarIcon as ChartBarSolidIcon
} from '@heroicons/react/24/solid';
import { recipeApi } from '../services/api';
import { useRecipeStore } from '../store';
import { usePantryStore } from '../store';
import { useGroceryStore } from '../store';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';
import useDarkMode from 'use-dark-mode';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const darkMode = useDarkMode(false);
  
  // Store state
  const { savedRecipes, isLoading, setIsLoading, setError } = useRecipeStore();
  const { pantryItems } = usePantryStore();
  const { groceryLists } = useGroceryStore();
  
  // Local state
  const [randomRecipes, setRandomRecipes] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalSavedRecipes: 0,
    totalPantryItems: 0,
    totalGroceryLists: 0,
    recentActivity: 0
  });
  const [featuredRecipes, setFeaturedRecipes] = useState([]);

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Update stats when store data changes
  useEffect(() => {
    setDashboardStats({
      totalSavedRecipes: savedRecipes.length,
      totalPantryItems: pantryItems.length,
      totalGroceryLists: groceryLists.length,
      recentActivity: calculateRecentActivity()
    });
  }, [savedRecipes, pantryItems, groceryLists]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load featured recipes
      const randomRecipesResponse = await recipeApi.getRandom({
        number: 6,
        includeNutrition: true,
        includeTags: true
      });
      
      if (randomRecipesResponse.success) {
        setFeaturedRecipes(randomRecipesResponse.recipes || []);
      }
      
      // Load trending recipes
      const trendingResponse = await recipeApi.searchComplex('popular', {
        sort: 'popularity',
        number: 3,
        addRecipeInformation: true,
        fillIngredients: true
      });
      
      if (trendingResponse.success) {
        setRandomRecipes(trendingResponse.results || []);
      }
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError(error.message);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateRecentActivity = () => {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    let recentCount = 0;
    
    // Count recent saved recipes
    savedRecipes.forEach(recipe => {
      if (recipe.savedAt && new Date(recipe.savedAt) > weekAgo) {
        recentCount++;
      }
    });
    
    // Count recent pantry items
    pantryItems.forEach(item => {
      if (item.addedAt && new Date(item.addedAt) > weekAgo) {
        recentCount++;
      }
    });
    
    // Count recent grocery lists
    groceryLists.forEach(list => {
      if (list.createdAt && new Date(list.createdAt) > weekAgo) {
        recentCount++;
      }
    });
    
    return recentCount;
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'search':
        navigate('/search');
        break;
      case 'saved':
        navigate('/saved-recipes');
        break;
      case 'pantry':
        navigate('/pantry');
        break;
      case 'grocery':
        navigate('/grocery-lists');
        break;
      case 'analytics':
        navigate('/analytics');
        break;
      default:
        break;
    }
  };

  const handleRecipeClick = (recipe) => {
    navigate(`/recipe/${recipe.id}`);
  };

  const StatCard = ({ title, value, icon: Icon, solidIcon: SolidIcon, color, action }) => (
    <div 
      className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 cursor-pointer group"
      onClick={() => handleQuickAction(action)}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color} group-hover:scale-105 transition-transform duration-200`}>
          <SolidIcon className="h-6 w-6 text-white" />
        </div>
        <ArrowRightIcon className="h-5 w-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
      </div>
    </div>
  );

  const RecipeCard = ({ recipe }) => (
    <div 
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer group"
      onClick={() => handleRecipeClick(recipe)}
    >
      <div className="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-gray-700">
        <img
          src={recipe.image || `https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=225&fit=crop&crop=faces`}
          alt={recipe.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
          onError={(e) => {
            e.target.src = `https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=225&fit=crop&crop=faces`;
          }}
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {recipe.title}
        </h3>
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <ClockIcon className="h-4 w-4 mr-1" />
              <span>{recipe.readyInMinutes || 30} min</span>
            </div>
            <div className="flex items-center">
              <UserCircleIcon className="h-4 w-4 mr-1" />
              <span>{recipe.servings || 4} servings</span>
            </div>
          </div>
          <div className="flex items-center">
            <StarIcon className="h-4 w-4 mr-1 text-yellow-500" />
            <span>{recipe.spoonacularScore ? Math.round(recipe.spoonacularScore / 10) : 4.5}/10</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome back, {user?.firstName || 'Chef'}! 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Ready to create something delicious today?
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => darkMode.toggle()}
              className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {darkMode.value ? (
                <SunIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <MoonIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              )}
            </button>
            <button className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <BellIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Saved Recipes"
            value={dashboardStats.totalSavedRecipes}
            icon={BookmarkIcon}
            solidIcon={BookmarkSolidIcon}
            color="bg-blue-500"
            action="saved"
          />
          <StatCard
            title="Pantry Items"
            value={dashboardStats.totalPantryItems}
            icon={CubeIcon}
            solidIcon={CubeSolidIcon}
            color="bg-green-500"
            action="pantry"
          />
          <StatCard
            title="Grocery Lists"
            value={dashboardStats.totalGroceryLists}
            icon={ShoppingBagIcon}
            solidIcon={ShoppingBagSolidIcon}
            color="bg-purple-500"
            action="grocery"
          />
          <StatCard
            title="Recent Activity"
            value={dashboardStats.recentActivity}
            icon={ChartBarIcon}
            solidIcon={ChartBarSolidIcon}
            color="bg-orange-500"
            action="analytics"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => handleQuickAction('search')}
              className="flex flex-col items-center p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
            >
              <MagnifyingGlassIcon className="h-8 w-8 text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Find Recipes</span>
            </button>
            <button
              onClick={() => handleQuickAction('pantry')}
              className="flex flex-col items-center p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
            >
              <CubeIcon className="h-8 w-8 text-green-500 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Manage Pantry</span>
            </button>
            <button
              onClick={() => handleQuickAction('grocery')}
              className="flex flex-col items-center p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
            >
              <ShoppingBagIcon className="h-8 w-8 text-purple-500 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Grocery Lists</span>
            </button>
            <button
              onClick={() => handleQuickAction('analytics')}
              className="flex flex-col items-center p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
            >
              <ChartBarIcon className="h-8 w-8 text-orange-500 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">View Analytics</span>
            </button>
          </div>
        </div>

        {/* Featured Recipes */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              🔥 Trending Recipes
            </h2>
            <button
              onClick={() => navigate('/search')}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm flex items-center"
            >
              View All
              <ArrowRightIcon className="h-4 w-4 ml-1" />
            </button>
          </div>
          
          {randomRecipes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {randomRecipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FireIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                No trending recipes available at the moment
              </p>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        {dashboardStats.recentActivity > 0 && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Recent Activity
            </h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <BookmarkIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    You've been active this week!
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {dashboardStats.recentActivity} new items added
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
