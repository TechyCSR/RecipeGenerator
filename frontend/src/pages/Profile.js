import React from 'react';
import { UserIcon, CogIcon } from '@heroicons/react/24/outline';

const Profile = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Profile
        </h1>
        
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center mb-6">
              <UserIcon className="h-16 w-16 text-gray-400 mr-4" />
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  User Name
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  user@example.com
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Statistics
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Recipes Saved:</span>
                    <span className="font-medium text-gray-800 dark:text-white">12</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Pantry Items:</span>
                    <span className="font-medium text-gray-800 dark:text-white">24</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Grocery Lists:</span>
                    <span className="font-medium text-gray-800 dark:text-white">5</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Preferences
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-3 text-gray-700 dark:text-gray-300">
                      Email notifications
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-3 text-gray-700 dark:text-gray-300">
                      Dark mode
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-3 text-gray-700 dark:text-gray-300">
                      Weekly meal suggestions
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center">
              <CogIcon className="h-5 w-5 mr-2" />
              Account Settings
            </h3>
            <div className="space-y-4">
              <button className="w-full text-left px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-800 dark:text-white">
                Change Password
              </button>
              <button className="w-full text-left px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-800 dark:text-white">
                Dietary Preferences
              </button>
              <button className="w-full text-left px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-800 dark:text-white">
                Privacy Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
