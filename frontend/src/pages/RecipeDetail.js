import React from 'react';
import { useParams } from 'react-router-dom';

const RecipeDetail = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Recipe Details
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <img
                src="/api/placeholder/500/300"
                alt="Recipe"
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                Recipe {id}
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Ingredients
                  </h3>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
                    <li>Sample ingredient 1</li>
                    <li>Sample ingredient 2</li>
                    <li>Sample ingredient 3</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Instructions
                  </h3>
                  <ol className="list-decimal list-inside text-gray-600 dark:text-gray-400 space-y-2">
                    <li>Step 1 of preparation</li>
                    <li>Step 2 of preparation</li>
                    <li>Step 3 of preparation</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;
