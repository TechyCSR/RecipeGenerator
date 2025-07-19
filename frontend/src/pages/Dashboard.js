import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { 
  MagnifyingGlassIcon, 
  BookmarkIcon, 
  ShoppingBagIcon, 
  CubeIcon,
  ClockIcon,
  ArrowRightIcon,
  PlusIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { 
  BookmarkIcon as BookmarkSolidIcon,
  ShoppingBagIcon as ShoppingBagSolidIcon,
  CubeIcon as CubeSolidIcon
} from '@heroicons/react/24/solid';
import { useRecipeStore } from '../store';
import { usePantryStore } from '../store';
import { useGroceryStore } from '../store';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  
  // Store state
  const { savedRecipes } = useRecipeStore();
  const { pantryItems } = usePantryStore();
  const { groceryLists } = useGroceryStore();

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
      default:
        break;
    }
  };

  const StatCard = ({ title, value, icon: Icon, solidIcon: SolidIcon, color, action }) => (
    <div 
      className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 cursor-pointer group"
      onClick={() => handleQuickAction(action)}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color} group-hover:scale-110 transition-transform duration-300`}>
          <SolidIcon className="h-6 w-6 text-white" />
        </div>
        <ArrowRightIcon className="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300" />
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
      </div>
    </div>
  );

  const QuickActionCard = ({ title, description, icon: Icon, color, action, bgColor }) => (
    <div 
      className={`${bgColor} p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 cursor-pointer group`}
      onClick={() => handleQuickAction(action)}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <ArrowRightIcon className="h-5 w-5 text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 group-hover:translate-x-1 transition-all duration-300" />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {user?.firstName || 'Chef'}! 👋
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Ready to create something delicious today?
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Saved Recipes"
            value={savedRecipes.length}
            icon={BookmarkIcon}
            solidIcon={BookmarkSolidIcon}
            color="bg-gradient-to-br from-blue-500 to-blue-600"
            action="saved"
          />
          <StatCard
            title="Pantry Items"
            value={pantryItems.length}
            icon={CubeIcon}
            solidIcon={CubeSolidIcon}
            color="bg-gradient-to-br from-green-500 to-green-600"
            action="pantry"
          />
          <StatCard
            title="Grocery Lists"
            value={groceryLists.length}
            icon={ShoppingBagIcon}
            solidIcon={ShoppingBagSolidIcon}
            color="bg-gradient-to-br from-purple-500 to-purple-600"
            action="grocery"
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <QuickActionCard
              title="Find Recipes"
              description="Search for delicious recipes by ingredients or cuisine"
              icon={MagnifyingGlassIcon}
              color="bg-gradient-to-br from-orange-500 to-red-500"
              bgColor="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20"
              action="search"
            />
            <QuickActionCard
              title="Manage Pantry"
              description="Keep track of ingredients you have at home"
              icon={CubeIcon}
              color="bg-gradient-to-br from-green-500 to-emerald-500"
              bgColor="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20"
              action="pantry"
            />
            <QuickActionCard
              title="Grocery Lists"
              description="Create and manage your shopping lists"
              icon={ShoppingBagIcon}
              color="bg-gradient-to-br from-purple-500 to-violet-500"
              bgColor="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20"
              action="grocery"
            />
            <QuickActionCard
              title="Saved Recipes"
              description="Access your favorite saved recipes"
              icon={BookmarkIcon}
              color="bg-gradient-to-br from-blue-500 to-indigo-500"
              bgColor="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20"
              action="saved"
            />
          </div>
        </div>

        {/* Welcome Message for New Users */}
        {savedRecipes.length === 0 && pantryItems.length === 0 && groceryLists.length === 0 && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white mb-8">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-4">
                  <SparklesIcon className="h-8 w-8 mr-3" />
                  <h3 className="text-2xl font-bold">Get Started with RecipeGenius!</h3>
                </div>
                <p className="text-lg opacity-90 mb-6">
                  Welcome to your smart cooking companion. Start by searching for recipes, 
                  adding ingredients to your pantry, or creating your first grocery list.
                </p>
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => handleQuickAction('search')}
                    className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 flex items-center"
                  >
                    <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
                    Search Recipes
                  </button>
                  <button
                    onClick={() => handleQuickAction('pantry')}
                    className="bg-white/20 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/30 transition-colors duration-200 flex items-center backdrop-blur-sm"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add to Pantry
                  </button>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="w-32 h-32 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <SparklesIcon className="h-16 w-16 text-white/80" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity (if user has data) */}
        {(savedRecipes.length > 0 || pantryItems.length > 0 || groceryLists.length > 0) && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Your Kitchen Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {savedRecipes.length > 0 && (
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <BookmarkSolidIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    You have {savedRecipes.length} saved recipe{savedRecipes.length !== 1 ? 's' : ''}
                  </p>
                </div>
              )}
              {pantryItems.length > 0 && (
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <CubeSolidIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {pantryItems.length} item{pantryItems.length !== 1 ? 's' : ''} in your pantry
                  </p>
                </div>
              )}
              {groceryLists.length > 0 && (
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <ShoppingBagSolidIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {groceryLists.length} grocery list{groceryLists.length !== 1 ? 's' : ''} ready
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
