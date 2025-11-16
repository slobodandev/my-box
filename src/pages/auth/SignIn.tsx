/**
 * Test Simulator Page
 * Simulates a third-party service calling the generateAuthLink API
 * This page allows testing the complete auth flow by mimicking an external system
 */

import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CloudFunctionUrls, getCloudFunctionHeaders } from '@/config/cloudFunctions';

export const SignIn: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loanNumber, setLoanNumber] = useState('LOAN-TEST-001');
  const [borrowerContactId, setBorrowerContactId] = useState('CONTACT-TEST-001');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Pre-fill email from query params if present
  React.useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      // Call generateAuthLink Cloud Function (simulating third-party service)
      const response = await fetch(CloudFunctionUrls.generateAuthLink(), {
        method: 'POST',
        headers: getCloudFunctionHeaders(),
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          loanNumber,
          borrowerContactId,
          expirationHours: 48,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to generate auth link: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to generate auth link');
      }

      console.log('Auth link generated successfully:', data);

      // If running in emulator, auto-open the email link in a new tab
      if (data.emailLink) {
        console.log('Opening email link in new tab:', data.emailLink);
        window.open(data.emailLink, '_blank');
      }

      navigate('/auth/email-sent', { state: { email } });
    } catch (err: any) {
      console.error('Error generating auth link:', err);
      setError(err.message || 'Failed to send sign-in link. Please try again.');
    } finally {
      setIsLoading(false);
    }
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

        {/* Test Simulator Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Sign In
            </h2>
            <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-xs font-medium rounded">
              TEST MODE
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Enter your email to receive a sign-in link
          </p>

          <form onSubmit={handleSubmit}>
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  disabled={isLoading}
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 h-full placeholder:text-gray-500 dark:placeholder-gray-400 px-4 border-l-0 text-sm font-normal disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                />
              </div>
            </div>

            {/* Advanced Options Toggle */}
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="mb-4 text-sm text-primary hover:text-primary/80 flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-base">
                {showAdvanced ? 'expand_less' : 'expand_more'}
              </span>
              Advanced Options (Loan Context)
            </button>

            {/* Advanced Fields */}
            {showAdvanced && (
              <div className="space-y-4 mb-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <div>
                  <label
                    htmlFor="loanNumber"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Loan Number
                  </label>
                  <input
                    id="loanNumber"
                    type="text"
                    value={loanNumber}
                    onChange={(e) => setLoanNumber(e.target.value)}
                    placeholder="LOAN-TEST-001"
                    disabled={isLoading}
                    className="w-full px-4 h-10 rounded-lg text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-0 focus:ring-2 focus:ring-primary/50 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label
                    htmlFor="borrowerContactId"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Borrower Contact ID
                  </label>
                  <input
                    id="borrowerContactId"
                    type="text"
                    value={borrowerContactId}
                    onChange={(e) => setBorrowerContactId(e.target.value)}
                    placeholder="CONTACT-TEST-001"
                    disabled={isLoading}
                    className="w-full px-4 h-10 rounded-lg text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-0 focus:ring-2 focus:ring-primary/50 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">error</span>
                  {error}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-12 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] shadow-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">send</span>
                  <span>Send Sign-In Link</span>
                </>
              )}
            </button>
          </form>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-600 dark:text-blue-400 flex items-start gap-2">
              <span className="material-symbols-outlined text-base mt-0.5">info</span>
              <span>
                We'll send you a secure link to your email. Click the link to sign in without a password.
              </span>
            </p>
          </div>

          {/* Test Mode Notice */}
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-xs text-yellow-700 dark:text-yellow-300 flex items-start gap-2">
              <span className="material-symbols-outlined text-sm mt-0.5">science</span>
              <span>
                <strong>Test Mode:</strong> This form simulates a third-party system (like a Loan Origination System) calling the generateAuthLink API endpoint. In production, external systems would trigger this flow programmatically.
              </span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Secure passwordless authentication powered by Firebase
        </p>
      </div>
    </div>
  );
};

export default SignIn;
