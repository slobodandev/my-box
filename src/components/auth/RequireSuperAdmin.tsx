/**
 * RequireSuperAdmin Component
 * Higher-order component that protects super-admin-only routes
 * Redirects non-super-admin users to home page
 */

import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface RequireSuperAdminProps {
  children: ReactNode;
}

export const RequireSuperAdmin: React.FC<RequireSuperAdminProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/signin" replace />;
  }

  // Check if user has super-admin role
  if (user?.role !== 'super-admin') {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md mx-auto p-8">
          <span className="material-symbols-outlined text-6xl text-red-500 mb-4">admin_panel_settings</span>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Super Admin Access Required
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            This page is only accessible to super administrators.
          </p>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
