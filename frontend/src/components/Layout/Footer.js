import React from 'react';
import { HeartIcon } from '@heroicons/react/24/solid';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center">
          <span className="text-gray-600 dark:text-gray-400 text-sm">
            Made with{' '}
            <HeartIcon className="h-4 w-4 text-red-500 inline-block mx-1" />
            {' '}by{' '}
            <a 
              href="https://techycsr.me" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
            >
              @TechyCSR
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
