/**
 * Email Link Verification Page
 * Handles the email link verification and completes sign-in
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const EMAIL_FOR_SIGN_IN = 'mybox_email_for_sign_in';

export const Verify: React.FC = () => {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [error, setError] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [needsEmail, setNeedsEmail] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { completeEmailLinkSignIn, isEmailLinkValid, isAuthenticated } = useAuth();

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated) {
      navigate('/', { replace: true });
      return;
    }

    // Check if the current URL is a valid email link
    if (!isEmailLinkValid()) {
      setStatus('error');
      setError('Invalid or expired sign-in link');
      return;
    }

    // Try to get email from localStorage or URL params
    let email = window.localStorage.getItem(EMAIL_FOR_SIGN_IN);

    if (!email) {
      // Try to get email from URL params
      email = searchParams.get('email') || '';
    }

    if (email) {
      // Automatically verify
      verifyEmailLink(email);
    } else {
      // Need user to enter email
      setNeedsEmail(true);
      setStatus('error');
    }
  }, [isEmailLinkValid, isAuthenticated, navigate, searchParams]);

  const verifyEmailLink = async (email: string) => {
    try {
      setStatus('verifying');
      setError(null);

      console.log('Verifying email link for:', email);

      await completeEmailLinkSignIn(email, window.location.href);

      setStatus('success');

      // Redirect to home after a brief delay
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 1500);
    } catch (err: any) {
      console.error('Error verifying email link:', err);
      setStatus('error');

      if (err.code === 'auth/invalid-email') {
        setError('Invalid email address. Please enter the email you used to sign in.');
        setNeedsEmail(true);
      } else if (err.code === 'auth/invalid-action-code') {
        setError('This sign-in link has expired or has already been used. Please request a new one.');
      } else {
        setError(err.message || 'Failed to verify sign-in link');
        setNeedsEmail(true);
      }
    }
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!emailInput) {
      setError('Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput)) {
      setError('Please enter a valid email address');
      return;
    }

    verifyEmailLink(emailInput);
  };

  const renderContent = () => {
    if (status === 'verifying') {
      return (
        <>
          {/* Loading Icon */}
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
            Verifying Sign-In Link
          </h2>

          <p className="text-gray-600 dark:text-gray-400 text-center">
            Please wait while we verify your authentication...
          </p>
        </>
      );
    }

    if (status === 'success') {
      return (
        <>
          {/* Success Icon */}
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-4xl">
                check_circle
              </span>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
            Sign-In Successful!
          </h2>

          <p className="text-gray-600 dark:text-gray-400 text-center">
            Redirecting you to the app...
          </p>
        </>
      );
    }

    // Error state
    return (
      <>
        {/* Error Icon */}
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-4xl">
              error
            </span>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
          {needsEmail ? 'Confirm Your Email' : 'Verification Failed'}
        </h2>

        <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
          {needsEmail
            ? 'Please enter the email address you used to request the sign-in link.'
            : error || 'An error occurred while verifying your sign-in link.'}
        </p>

        {needsEmail && (
          <form onSubmit={handleEmailSubmit} className="mb-6">
            {/* Email Input */}
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Email Address
              </label>
              <div className="flex w-full flex-1 items-stretch rounded-lg h-12">
                <div className="text-gray-500 dark:text-gray-400 flex border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 items-center justify-center pl-4 rounded-l-lg border-r-0">
                  <span className="material-symbols-outlined text-base">mail</span>
                </div>
                <input
                  id="email"
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="your.email@example.com"
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 h-full placeholder:text-gray-500 dark:placeholder-gray-400 px-4 border-l-0 text-sm font-normal"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full flex min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-12 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] shadow-sm hover:bg-primary/90 transition-all"
            >
              <span className="material-symbols-outlined text-base">login</span>
              <span>Verify & Sign In</span>
            </button>
          </form>
        )}

        {/* Error Message */}
        {error && !needsEmail && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400 flex items-start gap-2">
              <span className="material-symbols-outlined text-base mt-0.5">error</span>
              <span>{error}</span>
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/auth/signin')}
            className="w-full flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-all"
          >
            <span className="material-symbols-outlined text-base">refresh</span>
            <span>Request New Sign-In Link</span>
          </button>

          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
          >
            <span className="material-symbols-outlined text-base">home</span>
            <span>Go to Home</span>
          </button>
        </div>
      </>
    );
  };

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

        {/* Content Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Verify;
