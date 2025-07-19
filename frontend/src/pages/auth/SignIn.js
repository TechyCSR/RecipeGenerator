import React from 'react';
import { SignIn as ClerkSignIn } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import Footer from '../../components/Layout/Footer';

const SignIn = () => {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <div className="flex justify-center">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-2xl">🍽️</span>
              </div>
            </div>
            <h2 className="mt-6 text-center text-3xl font-bold text-gray-900 dark:text-white">
              Welcome back to RecipeGenius
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              Sign in to access your recipes, pantry, and more
            </p>
          </div>
          
          <div className="flex justify-center">
            <ClerkSignIn
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "shadow-lg border-0 dark:bg-gray-800",
                  headerTitle: "text-gray-900 dark:text-white",
                  headerSubtitle: "text-gray-600 dark:text-gray-400",
                  socialButtonsBlockButton: "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700",
                  formButtonPrimary: "bg-primary-600 hover:bg-primary-700 text-white",
                  formFieldInput: "border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white",
                  formFieldLabel: "text-gray-700 dark:text-gray-300",
                  footerActionLink: "text-primary-600 hover:text-primary-700 dark:text-primary-400",
                  dividerLine: "bg-gray-300 dark:bg-gray-600",
                  dividerText: "text-gray-500 dark:text-gray-400"
                }
              }}
              redirectUrl="/dashboard"
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SignIn;
