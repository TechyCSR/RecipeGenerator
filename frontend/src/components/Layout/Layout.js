import React from 'react';
import { Outlet } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import Header from './Header';
import Sidebar from './Sidebar';
import { useUIStore } from '../../store';

const Layout = () => {
  const { isSignedIn } = useUser();
  const { sidebarOpen } = useUIStore();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="flex">
        {isSignedIn && (
          <>
            {/* Sidebar */}
            <Sidebar />
            
            {/* Overlay for mobile */}
            {sidebarOpen && (
              <div 
                className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
                onClick={() => useUIStore.getState().setSidebarOpen(false)}
              />
            )}
          </>
        )}
        
        {/* Main content */}
        <main className={`
          flex-1 transition-all duration-300 ease-in-out
          ${isSignedIn ? 'lg:ml-64' : ''}
        `}>
          <div className="container mx-auto px-4 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
