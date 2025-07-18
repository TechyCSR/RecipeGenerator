import React from 'react';
import { ClerkProvider } from '@clerk/clerk-react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useDarkMode from 'use-dark-mode';

// Layout components
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import RecipeSearch from './pages/RecipeSearch';
import RecipeDetail from './pages/RecipeDetail';
import SavedRecipes from './pages/SavedRecipes';
import GroceryList from './pages/GroceryList';
import GroceryLists from './pages/GroceryLists';
import Pantry from './pages/Pantry';
import Profile from './pages/Profile';
import Analytics from './pages/Analytics';
import NotFound from './pages/NotFound';

// Auth pages
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';

// PWA and service worker
import { registerSW } from './utils/pwa';

// Initialize Clerk
const clerkPubKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error('Missing Clerk Publishable Key');
}

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  registerSW();
}

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
    <ClerkProvider publishableKey={clerkPubKey}>
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
          
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="/sign-in" element={<SignIn />} />
              <Route path="/sign-up" element={<SignUp />} />
              
              {/* Protected routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/search" element={
                <ProtectedRoute>
                  <RecipeSearch />
                </ProtectedRoute>
              } />
              
              <Route path="/recipe/:id" element={
                <ProtectedRoute>
                  <RecipeDetail />
                </ProtectedRoute>
              } />
              
              <Route path="/saved-recipes" element={
                <ProtectedRoute>
                  <SavedRecipes />
                </ProtectedRoute>
              } />
              
              <Route path="/grocery-lists" element={
                <ProtectedRoute>
                  <GroceryLists />
                </ProtectedRoute>
              } />
              
              <Route path="/grocery-list/:id" element={
                <ProtectedRoute>
                  <GroceryList />
                </ProtectedRoute>
              } />
              
              <Route path="/pantry" element={
                <ProtectedRoute>
                  <Pantry />
                </ProtectedRoute>
              } />
              
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              
              <Route path="/analytics" element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              } />
              
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </ClerkProvider>
  );
}

export default App;
