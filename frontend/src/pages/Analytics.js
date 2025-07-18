import React from 'react';
import { ChartBarIcon, ArrowTrendingUpIcon, ClockIcon } from '@heroicons/react/24/outline';

const Analytics = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Analytics
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <ChartBarIcon className="h-8 w-8 text-blue-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Recipe Views
              </h3>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              142
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total recipe views this month
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <ArrowTrendingUpIcon className="h-8 w-8 text-green-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Cooking Frequency
              </h3>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              5.2
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Recipes cooked per week
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <ClockIcon className="h-8 w-8 text-purple-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Avg Cook Time
              </h3>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              35
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Minutes per recipe
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Popular Cuisines
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Italian</span>
                <div className="flex items-center">
                  <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">75%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Mexican</span>
                <div className="flex items-center">
                  <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">60%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Asian</span>
                <div className="flex items-center">
                  <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">45%</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Meal Planning Insights
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  You save an average of $45 per week by meal planning!
                </p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-green-800 dark:text-green-200">
                  Your pantry utilization rate is 85% - great job!
                </p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-sm text-purple-800 dark:text-purple-200">
                  Most active cooking day: Sunday
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
