import React, { useState, useRef } from 'react';
import { XMarkIcon, MicrophoneIcon, CameraIcon } from '@heroicons/react/24/outline';

const IngredientInput = ({ 
  ingredients = [], 
  onChange, 
  placeholder = "Add ingredients...", 
  className = "",
  enableVoice = true,
  enableCamera = true 
}) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef(null);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Here you would typically call an API to get suggestions
    // For now, we'll use a simple mock
    if (value.length > 1) {
      const mockSuggestions = [
        'tomato', 'onion', 'garlic', 'chicken', 'beef', 'rice', 'pasta',
        'cheese', 'milk', 'bread', 'eggs', 'butter', 'oil', 'salt', 'pepper'
      ].filter(item => 
        item.toLowerCase().includes(value.toLowerCase()) &&
        !ingredients.some(ing => ing.name.toLowerCase() === item.toLowerCase())
      );
      setSuggestions(mockSuggestions.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      addIngredient(inputValue.trim());
    }
  };

  const addIngredient = (name) => {
    if (name && !ingredients.some(ing => ing.name.toLowerCase() === name.toLowerCase())) {
      const newIngredient = {
        id: Date.now(),
        name: name.toLowerCase(),
        displayName: name
      };
      onChange([...ingredients, newIngredient]);
      setInputValue('');
      setSuggestions([]);
    }
  };

  const removeIngredient = (id) => {
    onChange(ingredients.filter(ing => ing.id !== id));
  };

  const handleSuggestionClick = (suggestion) => {
    addIngredient(suggestion);
    inputRef.current?.focus();
  };

  const startVoiceInput = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        setIsListening(true);
      };
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const words = transcript.split(' ');
        words.forEach(word => {
          if (word.trim()) {
            addIngredient(word.trim());
          }
        });
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
      
      recognition.start();
    } else {
      alert('Speech recognition not supported in this browser');
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Here you would typically use OCR to extract ingredients
      // For now, we'll just show a placeholder
      console.log('Image uploaded:', file);
      // You can integrate Tesseract.js here for OCR
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Input container */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="input pr-20"
        />
        
        {/* Action buttons */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
          {enableVoice && (
            <button
              type="button"
              onClick={startVoiceInput}
              disabled={isListening}
              className={`p-2 rounded-md transition-colors ${
                isListening 
                  ? 'bg-red-100 text-red-600 animate-pulse' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
              title="Voice input"
            >
              <MicrophoneIcon className="h-4 w-4" />
            </button>
          )}
          
          {enableCamera && (
            <label className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer transition-colors">
              <CameraIcon className="h-4 w-4" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      {/* Suggestions dropdown */}
      {suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg mt-1">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-md last:rounded-b-md"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Selected ingredients */}
      {ingredients.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {ingredients.map((ingredient) => (
            <span
              key={ingredient.id}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
            >
              {ingredient.displayName}
              <button
                onClick={() => removeIngredient(ingredient.id)}
                className="ml-2 text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default IngredientInput;
