import React, { useState } from 'react';
import { PlusIcon, ArchiveBoxIcon } from '@heroicons/react/24/outline';

const Pantry = () => {
  const [pantryItems] = useState([
    { id: 1, name: 'Flour', quantity: '2 lbs', category: 'Baking', expiry: '2024-06-01' },
    { id: 2, name: 'Olive Oil', quantity: '1 bottle', category: 'Cooking', expiry: '2024-12-01' },
    { id: 3, name: 'Rice', quantity: '5 lbs', category: 'Grains', expiry: '2025-01-01' },
  ]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Pantry
          </h1>
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <PlusIcon className="h-5 w-5" />
            Add Item
          </button>
        </div>
        
        {pantryItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pantryItems.map((item) => (
              <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center mb-4">
                  <ArchiveBoxIcon className="h-8 w-8 text-green-500 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    {item.name}
                  </h3>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Quantity:</span> {item.quantity}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Category:</span> {item.category}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Expires:</span> {item.expiry}
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button className="text-blue-500 hover:text-blue-600 font-medium mr-4">
                    Edit
                  </button>
                  <button className="text-red-500 hover:text-red-600 font-medium">
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <ArchiveBoxIcon className="h-24 w-24 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              Your pantry is empty
            </p>
            <p className="text-gray-400 dark:text-gray-500">
              Add items to track your ingredients!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pantry;
