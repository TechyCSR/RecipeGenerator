import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ClockIcon, 
  UsersIcon, 
  StarIcon,
  BookmarkIcon,
  ArrowLeftIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkIconSolid, HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { recipeApi } from '../services/api';
import { useRecipeStore } from '../store';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { addSavedRecipe, removeSavedRecipe } = useRecipeStore();

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await recipeApi.getById(id, { includeNutrition: true });
        setRecipe(response.data);
      } catch (error) {
        console.error('Error fetching recipe:', error);
        setError('Failed to load recipe details');
        toast.error('Failed to load recipe details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRecipe();
    }
  }, [id]);

  const handleSave = async () => {
    if (!recipe || isSaving) return;
    
    try {
      setIsSaving(true);
      
      if (recipe.isSaved) {
        await recipeApi.deleteSaved(recipe.id);
        removeSavedRecipe(recipe.id);
        setRecipe(prev => ({ ...prev, isSaved: false }));
        toast.success('Recipe removed from cookbook');
      } else {
        const savedRecipe = await recipeApi.save({
          recipeId: recipe.id,
          recipeData: recipe
        });
        addSavedRecipe(savedRecipe.data);
        setRecipe(prev => ({ ...prev, isSaved: true }));
        toast.success('Recipe saved to cookbook');
      }
    } catch (error) {
      console.error('Error saving recipe:', error);
      toast.error(error.message || 'Failed to save recipe');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const formatTime = (minutes) => {
    if (!minutes) return 'N/A';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating / 20); // Convert to 5-star scale
    const hasHalfStar = (rating % 20) >= 10;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<StarIcon key={i} className="h-4 w-4 text-yellow-400 fill-current" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<StarIcon key={i} className="h-4 w-4 text-yellow-400 fill-current opacity-50" />);
      } else {
        stars.push(<StarIcon key={i} className="h-4 w-4 text-gray-300" />);
      }
    }
    
    return stars;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
            {error || 'Recipe not found'}
          </p>
          <button 
            onClick={() => navigate(-1)}
            className="btn btn-primary"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={handleLike}
              className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow"
            >
              {isLiked ? (
                <HeartIconSolid className="h-6 w-6 text-red-500" />
              ) : (
                <HeartIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              )}
            </button>
            
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow"
            >
              {isSaving ? (
                <div className="h-6 w-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              ) : recipe.isSaved ? (
                <BookmarkIconSolid className="h-6 w-6 text-primary-500" />
              ) : (
                <BookmarkIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              )}
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Recipe Image */}
            <div className="relative">
              <img
                src={recipe.image}
                alt={recipe.title}
                className="w-full h-64 lg:h-96 object-cover"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1495147466023-ac5c588e2e94?w=500&h=300&fit=crop';
                }}
              />
              
              {/* Recipe Meta Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                <div className="flex items-center space-x-6 text-white">
                  {recipe.readyInMinutes && (
                    <div className="flex items-center">
                      <ClockIcon className="h-5 w-5 mr-2" />
                      <span>{formatTime(recipe.readyInMinutes)}</span>
                    </div>
                  )}
                  
                  {recipe.servings && (
                    <div className="flex items-center">
                      <UsersIcon className="h-5 w-5 mr-2" />
                      <span>{recipe.servings} servings</span>
                    </div>
                  )}
                  
                  {recipe.spoonacularScore && (
                    <div className="flex items-center">
                      <div className="flex space-x-1 mr-2">
                        {getRatingStars(recipe.spoonacularScore)}
                      </div>
                      <span>{Math.round(recipe.spoonacularScore / 20 * 10) / 10}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Recipe Info */}
            <div className="p-6 lg:p-8">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {recipe.title}
              </h1>
              
              {/* Summary */}
              {recipe.summary && (
                <div 
                  className="text-gray-600 dark:text-gray-300 mb-6 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: recipe.summary }}
                />
              )}
              
              {/* Cuisines and Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {recipe.cuisines?.map((cuisine) => (
                  <span key={cuisine} className="badge badge-primary">
                    {cuisine}
                  </span>
                ))}
                {recipe.dishTypes?.slice(0, 3).map((type) => (
                  <span key={type} className="badge badge-secondary">
                    {type}
                  </span>
                ))}
                {recipe.diets?.slice(0, 2).map((diet) => (
                  <span key={diet} className="badge badge-accent">
                    {diet}
                  </span>
                ))}
              </div>
              
              {/* Source Link */}
              {recipe.sourceUrl && (
                <a
                  href={recipe.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary mb-6"
                >
                  View Original Recipe
                </a>
              )}
            </div>
          </div>

          {/* Ingredients and Instructions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-8 border-t border-gray-200 dark:border-gray-700">
            {/* Ingredients */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Ingredients
              </h2>
              
              {recipe.extendedIngredients && recipe.extendedIngredients.length > 0 ? (
                <ul className="space-y-2">
                  {recipe.extendedIngredients.map((ingredient, index) => (
                    <li key={index} className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span className="text-gray-700 dark:text-gray-300">
                        {ingredient.original}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  No ingredients available
                </p>
              )}
            </div>

            {/* Instructions */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Instructions
              </h2>
              
              {recipe.analyzedInstructions && recipe.analyzedInstructions.length > 0 ? (
                <ol className="space-y-4">
                  {recipe.analyzedInstructions[0].steps.map((step, index) => (
                    <li key={index} className="flex items-start">
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-primary-500 text-white text-sm font-medium rounded-full mr-4 flex-shrink-0 mt-0.5">
                        {step.number}
                      </span>
                      <p className="text-gray-700 dark:text-gray-300">
                        {step.step}
                      </p>
                    </li>
                  ))}
                </ol>
              ) : recipe.instructions ? (
                <div 
                  className="text-gray-700 dark:text-gray-300 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: recipe.instructions }}
                />
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  No instructions available
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;
