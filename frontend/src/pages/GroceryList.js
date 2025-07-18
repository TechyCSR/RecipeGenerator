import React from 'react';
import { useParams } from 'react-router-dom';

const GroceryList = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Grocery List {id}
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Shopping List
          </h2>
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-3 text-gray-700 dark:text-gray-300">
                Sample grocery item 1
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-3 text-gray-700 dark:text-gray-300">
                Sample grocery item 2
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-3 text-gray-700 dark:text-gray-300">
                Sample grocery item 3
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroceryList;
