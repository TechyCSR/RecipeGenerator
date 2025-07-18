import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { 
  MagnifyingGlassIcon,
  BookmarkIcon,
  ShoppingCartIcon,
  ArchiveBoxIcon,
  SparklesIcon,
  CameraIcon,
  MicrophoneIcon,
  ClockIcon,
  HeartIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { recipeApi } from '../services/api';
import RecipeCard from '../components/Recipe/RecipeCard';
import IngredientInput from '../components/Recipe/IngredientInput';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const Home = () => {
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();
  
  const [featuredRecipes, setFeaturedRecipes] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    loadFeaturedRecipes();
  }, []);

  const loadFeaturedRecipes = async () => {
    try {
      setIsLoading(true);
      const response = await recipeApi.getRandom({ number: 6 });
      setFeaturedRecipes(response.data || []);
    } catch (error) {
      console.error('Error loading featured recipes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleIngredientSearch = async () => {
    if (ingredients.length === 0) return;
    
    try {
      setSearchLoading(true);
      const ingredientNames = ingredients.map(ing => ing.name).join(',');
      navigate(`/search?ingredients=${encodeURIComponent(ingredientNames)}`);
    } catch (error) {
      console.error('Error searching recipes:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const features = [
    {
      name: 'Smart Recipe Search',
      description: 'Find recipes based on ingredients you have',
      icon: MagnifyingGlassIcon,
      color: 'bg-primary-500',
      href: '/search'
    },
    {
      name: 'Personal Cookbook',
      description: 'Save and organize your favorite recipes',
      icon: BookmarkIcon,
      color: 'bg-secondary-500',
      href: '/saved-recipes'
    },
    {
      name: 'Smart Grocery Lists',
      description: 'Generate shopping lists from your recipes',
      icon: ShoppingCartIcon,
      color: 'bg-accent-500',
      href: '/grocery-lists'
    },
    {
      name: 'Virtual Pantry',
      description: 'Track your ingredients and reduce waste',
      icon: ArchiveBoxIcon,
      color: 'bg-green-500',
      href: '/pantry'
    },
    {
      name: 'Voice Input',
      description: 'Add ingredients using voice commands',
      icon: MicrophoneIcon,
      color: 'bg-purple-500',
      href: '/search'
    },
    {
      name: 'Image Recognition',
      description: 'Scan ingredients from photos',
      icon: CameraIcon,
      color: 'bg-pink-500',
      href: '/search'
    }
  ];

  const stats = [
    { name: 'Recipes Available', value: '10,000+', icon: BookmarkIcon },
    { name: 'Active Users', value: '5,000+', icon: HeartIcon },
    { name: 'Avg. Rating', value: '4.8/5', icon: StarIcon },
    { name: 'Time Saved', value: '2hrs/week', icon: ClockIcon }
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Smart Recipe Generator &{' '}
            <span className="bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
              Grocery Planner
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Transform your cooking experience with AI-powered recipe suggestions, 
            smart grocery lists, and intelligent pantry management.
          </p>

          {!isSignedIn ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/sign-up" className="btn-primary btn-lg">
                Get Started Free
              </Link>
              <Link to="/sign-in" className="btn-secondary btn-lg">
                Sign In
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Ingredient Search */}
              <div className="max-w-2xl mx-auto">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  What ingredients do you have?
                </h2>
                <IngredientInput
                  ingredients={ingredients}
                  onChange={setIngredients}
                  placeholder="Add ingredients..."
                  className="mb-4"
                />
                <button
                  onClick={handleIngredientSearch}
                  disabled={ingredients.length === 0 || searchLoading}
                  className="btn-primary btn-lg w-full sm:w-auto"
                >
                  {searchLoading ? (
                    <LoadingSpinner className="h-5 w-5 mr-2" />
                  ) : (
                    <SparklesIcon className="h-5 w-5 mr-2" />
                  )}
                  Find Recipes
                </button>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-4 justify-center">
                <Link to="/dashboard" className="btn-secondary">
                  <HomeIcon className="h-5 w-5 mr-2" />
                  Dashboard
                </Link>
                <Link to="/search" className="btn-secondary">
                  <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
                  Browse Recipes
                </Link>
                <Link to="/pantry" className="btn-secondary">
                  <ArchiveBoxIcon className="h-5 w-5 mr-2" />
                  Manage Pantry
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Powerful Features
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Everything you need to make cooking easier and more enjoyable
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.name} className="card p-6 hover:shadow-lg transition-shadow">
                  <div className={`${feature.color} rounded-lg p-3 w-fit mb-4`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {feature.description}
                  </p>
                  {isSignedIn && (
                    <Link
                      to={feature.href}
                      className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
                    >
                      Learn more →
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-100 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.name} className="text-center">
                  <div className="flex justify-center mb-4">
                    <Icon className="h-8 w-8 text-primary-500" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-600 dark:text-gray-300">
                    {stat.name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Recipes */}
      {featuredRecipes.length > 0 && (
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Featured Recipes
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Discover popular recipes loved by our community
              </p>
            </div>

            {isLoading ? (
              <div className="flex justify-center">
                <LoadingSpinner className="h-12 w-12" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredRecipes.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
            )}

            {!isLoading && (
              <div className="text-center mt-8">
                <Link to="/search" className="btn-primary">
                  Browse All Recipes
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* CTA Section */}
      {!isSignedIn && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary-500 to-secondary-500">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to transform your cooking?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of home cooks who are already saving time and reducing food waste
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/sign-up" className="btn bg-white text-primary-600 hover:bg-gray-100 btn-lg">
                Start Free Trial
              </Link>
              <Link to="/sign-in" className="btn border-white text-white hover:bg-white hover:text-primary-600 btn-lg">
                Sign In
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
