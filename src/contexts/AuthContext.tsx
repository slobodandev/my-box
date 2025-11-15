/**
 * Authentication Context
 * Manages user authentication state with Firebase Email Link Auth and JWT tokens
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import {
  isSignInWithEmailLink,
  signInWithEmailLink,
  sendSignInLinkToEmail,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import { auth } from '@/config/firebase';
import { CloudFunctionUrls } from '@/config/cloudFunctions';

/**
 * User interface
 */
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  loanIds?: string[];
  firebaseUid?: string;
  borrowerContactId?: string;
  loanNumber?: string;
}

/**
 * JWT token payload interface
 */
interface JWTPayload {
  sessionId: string;
  userId: string;
  email: string;
  role: string;
  loanIds?: string[];
  type: 'session';
  exp: number;
  iat: number;
}

/**
 * Authentication state
 */
interface AuthState {
  user: User | null;
  sessionToken: string | null;
  sessionId: string | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

/**
 * Authentication context value
 */
interface AuthContextValue extends AuthState {
  login: (sessionToken: string) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  isTokenExpired: () => boolean;
  // Firebase Email Link Auth methods
  sendEmailLink: (email: string) => Promise<void>;
  completeEmailLinkSignIn: (email: string, emailLink: string) => Promise<void>;
  isEmailLinkValid: (emailLink?: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_STORAGE_KEY = 'mybox_session_token';
const USER_STORAGE_KEY = 'mybox_user';
const EMAIL_FOR_SIGN_IN = 'mybox_email_for_sign_in';

/**
 * Authentication Provider Component
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    sessionToken: null,
    sessionId: null,
    firebaseUser: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        console.log('Firebase user signed in:', firebaseUser.uid);
        setState((prev) => ({ ...prev, firebaseUser }));

        // Exchange Firebase ID token for session token
        await exchangeFirebaseTokenForSession(firebaseUser);
      } else {
        console.log('Firebase user signed out');
        setState((prev) => ({ ...prev, firebaseUser: null }));
      }
    });

    return () => unsubscribe();
  }, []);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  /**
   * Initialize authentication state from stored token
   */
  const initializeAuth = async () => {
    try {
      const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);

      if (!storedToken || !storedUser) {
        setState((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      // Decode and validate token
      const payload = jwtDecode<JWTPayload>(storedToken);

      // Check if token is expired
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp < now) {
        console.warn('Stored token is expired');
        logout();
        return;
      }

      // Parse stored user
      const user: User = JSON.parse(storedUser);

      setState({
        user,
        sessionToken: storedToken,
        sessionId: payload.sessionId,
        firebaseUser: null,
        isAuthenticated: true,
        isLoading: false,
      });

      console.log('Auth initialized from stored token', {
        userId: user.id,
        sessionId: payload.sessionId,
      });
    } catch (error) {
      console.error('Error initializing auth:', error);
      logout();
    }
  };

  /**
   * Login with session token
   * @param sessionToken - JWT session token from backend
   */
  const login = (sessionToken: string) => {
    try {
      // Decode token to extract user info
      const payload = jwtDecode<JWTPayload>(sessionToken);

      // Validate token type
      if (payload.type !== 'session') {
        throw new Error('Invalid token type');
      }

      // Check if token is expired
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp < now) {
        throw new Error('Token is expired');
      }

      // Create user object
      const user: User = {
        id: payload.userId,
        email: payload.email,
        role: payload.role,
        loanIds: payload.loanIds,
      };

      // Store token and user in localStorage
      localStorage.setItem(TOKEN_STORAGE_KEY, sessionToken);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));

      // Update state
      setState({
        user,
        sessionToken,
        sessionId: payload.sessionId,
        firebaseUser: null,
        isAuthenticated: true,
        isLoading: false,
      });

      console.log('User logged in', {
        userId: user.id,
        sessionId: payload.sessionId,
      });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  /**
   * Logout and clear authentication state
   */
  const logout = async () => {
    try {
      // Sign out from Firebase
      await signOut(auth);

      // Clear localStorage
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(EMAIL_FOR_SIGN_IN);

      // Clear state
      setState({
        user: null,
        sessionToken: null,
        sessionId: null,
        firebaseUser: null,
        isAuthenticated: false,
        isLoading: false,
      });

      console.log('User logged out');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  /**
   * Refresh user data from backend
   */
  const refreshUser = async () => {
    if (!state.sessionToken || !state.user) {
      throw new Error('Not authenticated');
    }

    try {
      // TODO: Call backend to get updated user info
      // For now, we'll just decode the token again
      const payload = jwtDecode<JWTPayload>(state.sessionToken);

      const updatedUser: User = {
        id: payload.userId,
        email: payload.email,
        role: payload.role,
        loanIds: payload.loanIds,
      };

      setState((prev) => ({
        ...prev,
        user: updatedUser,
      }));

      // Update localStorage
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));

      console.log('User refreshed', { userId: updatedUser.id });
    } catch (error) {
      console.error('Error refreshing user:', error);
      logout();
    }
  };

  /**
   * Update user information
   * @param updates - Partial user updates
   */
  const updateUser = (updates: Partial<User>) => {
    if (!state.user) {
      throw new Error('Not authenticated');
    }

    const updatedUser = {
      ...state.user,
      ...updates,
    };

    setState((prev) => ({
      ...prev,
      user: updatedUser,
    }));

    // Update localStorage
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));

    console.log('User updated', { userId: updatedUser.id });
  };

  /**
   * Check if the current token is expired
   * @returns true if token is expired or missing
   */
  const isTokenExpired = (): boolean => {
    if (!state.sessionToken) {
      return true;
    }

    try {
      const payload = jwtDecode<JWTPayload>(state.sessionToken);
      const now = Math.floor(Date.now() / 1000);
      return payload.exp < now;
    } catch (error) {
      return true;
    }
  };

  /**
   * Exchange Firebase ID token for backend session token
   * Called after Firebase Email Link authentication completes
   */
  const exchangeFirebaseTokenForSession = async (firebaseUser: FirebaseUser) => {
    try {
      // Get Firebase ID token
      const idToken = await firebaseUser.getIdToken();

      console.log('Exchanging Firebase token for session token...');

      // Call validateSession Cloud Function
      const response = await fetch(CloudFunctionUrls.validateSession(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Session validation failed: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success || !data.sessionToken) {
        throw new Error(data.message || 'Failed to get session token');
      }

      // Login with the session token
      login(data.sessionToken);

      console.log('Session token obtained and user logged in');
    } catch (error) {
      console.error('Error exchanging Firebase token:', error);
      throw error;
    }
  };

  /**
   * Send sign-in link to email
   * For testing purposes - normally this is done by third-party system
   * @param email - User's email address
   */
  const sendEmailLink = async (email: string): Promise<void> => {
    try {
      const actionCodeSettings = {
        url: `${window.location.origin}/auth/verify`,
        handleCodeInApp: true,
      };

      await sendSignInLinkToEmail(auth, email, actionCodeSettings);

      // Store email in localStorage for verification
      window.localStorage.setItem(EMAIL_FOR_SIGN_IN, email);

      console.log('Sign-in link sent to:', email);
    } catch (error) {
      console.error('Error sending sign-in link:', error);
      throw error;
    }
  };

  /**
   * Complete email link sign-in
   * Called when user clicks the email link
   * @param email - User's email address
   * @param emailLink - The full URL from the email link
   */
  const completeEmailLinkSignIn = async (email: string, emailLink?: string): Promise<void> => {
    try {
      const linkToVerify = emailLink || window.location.href;

      if (!isSignInWithEmailLink(auth, linkToVerify)) {
        throw new Error('Invalid sign-in link');
      }

      console.log('Completing email link sign-in for:', email);

      // Sign in with email link
      const result = await signInWithEmailLink(auth, email, linkToVerify);

      console.log('Email link sign-in successful:', result.user.uid);

      // Clear email from storage
      window.localStorage.removeItem(EMAIL_FOR_SIGN_IN);

      // Firebase auth state listener will handle the rest
    } catch (error) {
      console.error('Error completing email link sign-in:', error);
      throw error;
    }
  };

  /**
   * Check if current URL is a valid sign-in link
   * @param emailLink - Optional email link to check, defaults to current URL
   * @returns true if the link is a valid sign-in link
   */
  const isEmailLinkValid = (emailLink?: string): boolean => {
    const linkToCheck = emailLink || window.location.href;
    return isSignInWithEmailLink(auth, linkToCheck);
  };

  const contextValue: AuthContextValue = {
    ...state,
    login,
    logout,
    refreshUser,
    updateUser,
    isTokenExpired,
    sendEmailLink,
    completeEmailLinkSignIn,
    isEmailLinkValid,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to use authentication context
 * @throws Error if used outside AuthProvider
 */
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * Higher-order component to protect routes
 * Redirects to login if not authenticated
 */
export const RequireAuth: React.FC<{
  children: ReactNode;
  fallback?: ReactNode;
}> = ({ children, fallback }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
};

export default AuthContext;
