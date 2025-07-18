import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  HeartIcon, 
  ClockIcon, 
  UsersIcon,
  StarIcon,
  BookmarkIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid, BookmarkIcon as BookmarkIconSolid } from '@heroicons/react/24/solid';
import { recipeApi } from '../../services/api';
import { useRecipeStore } from '../../store';
import toast from 'react-hot-toast';

const RecipeCard = ({ recipe, showSaveButton = true }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { addSavedRecipe, removeSavedRecipe } = useRecipeStore();

  const handleLike = (e) => {
    e.preventDefault();
    setIsLiked(!isLiked);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (isSaving) return;
    
    try {
      setIsSaving(true);
      
      if (recipe.isSaved) {
        await recipeApi.deleteSaved(recipe.id);
        removeSavedRecipe(recipe.id);
        toast.success('Recipe removed from cookbook');
      } else {
        const savedRecipe = await recipeApi.save({
          recipeId: recipe.id,
          recipeData: recipe
        });
        addSavedRecipe(savedRecipe.data);
        toast.success('Recipe saved to cookbook');
      }
      
      // Toggle the saved state
      recipe.isSaved = !recipe.isSaved;
      
    } catch (error) {
      console.error('Error saving recipe:', error);
      toast.error(error.message || 'Failed to save recipe');
    } finally {
      setIsSaving(false);
    }
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

  return (
    <div className="recipe-card group">
      <div className="relative">
        <img
          src={recipe.image}
          alt={recipe.title}
          className="recipe-card-image"
          onError={(e) => {
            e.target.src = '/api/placeholder/400/300';
          }}
        />
        
        {/* Overlay actions */}
        <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleLike}
            className="p-2 rounded-full bg-white/90 hover:bg-white transition-colors"
            title="Like recipe"
          >
            {isLiked ? (
              <HeartIconSolid className="h-5 w-5 text-red-500" />
            ) : (
              <HeartIcon className="h-5 w-5 text-gray-600" />
            )}
          </button>
          
          {showSaveButton && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="p-2 rounded-full bg-white/90 hover:bg-white transition-colors"
              title={recipe.isSaved ? 'Remove from cookbook' : 'Save to cookbook'}
            >
              {isSaving ? (
                <div className="h-5 w-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              ) : recipe.isSaved ? (
                <BookmarkIconSolid className="h-5 w-5 text-primary-500" />
              ) : (
                <BookmarkIcon className="h-5 w-5 text-gray-600" />
              )}
            </button>
          )}
        </div>

        {/* Recipe difficulty/time indicator */}
        {recipe.readyInMinutes && (
          <div className="absolute bottom-2 left-2">
            <span className="bg-black/60 text-white px-2 py-1 rounded-full text-xs flex items-center">
              <ClockIcon className="h-3 w-3 mr-1" />
              {formatTime(recipe.readyInMinutes)}
            </span>
          </div>
        )}
      </div>

      <div className="recipe-card-content">
        <h3 className="recipe-card-title">
          <Link to={`/recipe/${recipe.id}`} className="hover:text-primary-600">
            {recipe.title}
          </Link>
        </h3>

        {/* Recipe meta info */}
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
          <div className="flex items-center space-x-4">
            {recipe.servings && (
              <span className="flex items-center">
                <UsersIcon className="h-4 w-4 mr-1" />
                {recipe.servings}
              </span>
            )}
            
            {recipe.readyInMinutes && (
              <span className="flex items-center">
                <ClockIcon className="h-4 w-4 mr-1" />
                {formatTime(recipe.readyInMinutes)}
              </span>
            )}
          </div>

          {recipe.spoonacularScore && (
            <div className="flex items-center">
              <div className="flex space-x-1">
                {getRatingStars(recipe.spoonacularScore)}
              </div>
              <span className="ml-1 text-xs">
                {Math.round(recipe.spoonacularScore / 20 * 10) / 10}
              </span>
            </div>
          )}
        </div>

        {/* Ingredients preview */}
        {recipe.usedIngredientCount !== undefined && recipe.missedIngredientCount !== undefined && (
          <div className="flex items-center justify-between text-xs mb-3">
            <span className="text-green-600 dark:text-green-400">
              ✓ {recipe.usedIngredientCount} ingredients you have
            </span>
            <span className="text-orange-600 dark:text-orange-400">
              + {recipe.missedIngredientCount} missing
            </span>
          </div>
        )}

        {/* Cuisines/Tags */}
        {recipe.cuisines && recipe.cuisines.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {recipe.cuisines.slice(0, 2).map((cuisine) => (
              <span
                key={cuisine}
                className="badge badge-secondary text-xs"
              >
                {cuisine}
              </span>
            ))}
            {recipe.cuisines.length > 2 && (
              <span className="badge badge-secondary text-xs">
                +{recipe.cuisines.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex space-x-2">
          <Link
            to={`/recipe/${recipe.id}`}
            className="flex-1 btn btn-primary text-center text-sm"
          >
            View Recipe
          </Link>
          
          {recipe.sourceUrl && (
            <a
              href={recipe.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary text-sm"
            >
              Source
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
