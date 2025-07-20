import React, { Suspense, lazy } from 'react';
import { ClerkProvider } from '@clerk/clerk-react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useDarkMode from 'use-dark-mode';

// PWA and service worker
import { registerSW } from './utils/pwa';

// Layout components
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import LoadingSpinner from './components/UI/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';

// Eager load critical pages
import Home from './pages/Home';
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';
import NotFound from './pages/NotFound';

// Lazy load non-critical pages for better performance
const Dashboard = lazy(() => import('./pages/Dashboard'));
const RecipeSearch = lazy(() => import('./pages/RecipeSearch'));
const RecipeDetail = lazy(() => import('./pages/RecipeDetail'));
const SavedRecipes = lazy(() => import('./pages/SavedRecipes'));
const GroceryList = lazy(() => import('./pages/GroceryList'));
const GroceryLists = lazy(() => import('./pages/GroceryLists'));
const Pantry = lazy(() => import('./pages/Pantry'));

// Initialize Clerk with error handling
const clerkPubKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  console.error('Missing Clerk Publishable Key');
  throw new Error('Missing Clerk Publishable Key - Please check your environment variables');
}

// Register service worker for PWA in production
if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
  registerSW();
}

// Loading component for suspense
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <LoadingSpinner size="large" text="Loading..." />
  </div>
);

function App() {
  const darkMode = useDarkMode(false);

  React.useEffect(() => {
    // Apply dark mode class to document
    if (darkMode.value) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode.value]);

  return (
    <ErrorBoundary>
      <ClerkProvider 
        publishableKey={clerkPubKey}
        afterSignOutUrl="/"
      >
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <Toaster
              position="top-right"
              toastOptions={{
                className: 'dark:bg-gray-800 dark:text-white',
                duration: 4000,
                style: {
                  background: darkMode.value ? '#1f2937' : '#ffffff',
                  color: darkMode.value ? '#ffffff' : '#000000',
                },
              }}
            />
            
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="sign-in" element={<SignIn />} />
                  <Route path="sign-up" element={<SignUp />} />
                  
                  {/* Protected routes with lazy loading */}
                  <Route path="dashboard" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="search" element={
                    <ProtectedRoute>
                      <RecipeSearch />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="recipe/:id" element={
                    <ProtectedRoute>
                      <RecipeDetail />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="saved-recipes" element={
                    <ProtectedRoute>
                      <SavedRecipes />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="grocery-lists" element={
                    <ProtectedRoute>
                      <GroceryLists />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="grocery-list/:id" element={
                    <ProtectedRoute>
                      <GroceryList />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="pantry" element={
                    <ProtectedRoute>
                      <Pantry />
                    </ProtectedRoute>
                  } />
                  
                  {/* Catch all route */}
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </Suspense>
          </div>
        </Router>
      </ClerkProvider>
    </ErrorBoundary>
  );
}

export default App;
