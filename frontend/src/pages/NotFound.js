import React from 'react';
import { Link } from 'react-router-dom';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import Footer from '../components/Layout/Footer';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-24 w-24 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            404
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Page not found
          </p>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            The page you're looking for doesn't exist.
          </p>
          <Link 
            to="/"
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium inline-block transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default NotFound;
