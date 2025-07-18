import React from 'react';
import { SignUp as ClerkSignUp } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';

const SignUp = () => {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-2xl">🍽️</span>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900 dark:text-white">
            Join RecipeGenius
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Create your account to start your smart cooking journey
          </p>
        </div>
        
        <div className="flex justify-center">
          <ClerkSignUp
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
  );
};

export default SignUp;
