/**
 * Email Sent Confirmation Page
 * Displays confirmation after sign-in link is sent
 */

import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const EmailSent: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  useEffect(() => {
    // Redirect to sign-in if no email in state
    if (!email) {
      navigate('/auth/signin', { replace: true });
    }
  }, [email, navigate]);

  const handleResend = () => {
    navigate('/auth/signin', { state: { email } });
  };

  if (!email) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2">
            MyBox
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Loan File Management System
          </p>
        </div>

        {/* Success Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          {/* Success Icon */}
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-4xl">
                mark_email_read
              </span>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
            Check Your Email
          </h2>

          <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
            We've sent a sign-in link to
          </p>

          {/* Email Display */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-center text-gray-900 dark:text-white font-medium break-all">
              {email}
            </p>
          </div>

          {/* Instructions */}
          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-primary text-xs font-bold">1</span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Open your email inbox
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-primary text-xs font-bold">2</span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Click the sign-in link in the email
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-primary text-xs font-bold">3</span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                You'll be automatically signed in
              </p>
            </div>
          </div>

          {/* Resend Button */}
          <button
            onClick={handleResend}
            className="w-full flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
          >
            <span className="material-symbols-outlined text-base">refresh</span>
            <span>Resend Email</span>
          </button>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-600 dark:text-blue-400 flex items-start gap-2">
              <span className="material-symbols-outlined text-base mt-0.5">info</span>
              <span>
                The sign-in link will expire in 48 hours. If you don't see the email, check your spam folder.
              </span>
            </p>
          </div>
        </div>

        {/* Back to Sign In */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/auth/signin')}
            className="text-sm text-primary hover:underline"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailSent;
