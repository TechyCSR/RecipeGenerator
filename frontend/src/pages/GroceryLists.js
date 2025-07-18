import React, { useState } from 'react';
import { PlusIcon, ListBulletIcon } from '@heroicons/react/24/outline';

const GroceryLists = () => {
  const [groceryLists] = useState([
    { id: 1, name: 'Weekly Shopping', items: 5, created: '2024-01-15' },
    { id: 2, name: 'Party Supplies', items: 12, created: '2024-01-10' },
  ]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Grocery Lists
          </h1>
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <PlusIcon className="h-5 w-5" />
            New List
          </button>
        </div>
        
        {groceryLists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groceryLists.map((list) => (
              <div key={list.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center mb-4">
                  <ListBulletIcon className="h-8 w-8 text-blue-500 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    {list.name}
                  </h3>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-600 dark:text-gray-300">
                    {list.items} items
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Created: {list.created}
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button className="text-blue-500 hover:text-blue-600 font-medium">
                    View List
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <ListBulletIcon className="h-24 w-24 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No grocery lists yet
            </p>
            <p className="text-gray-400 dark:text-gray-500">
              Create your first grocery list!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroceryLists;
