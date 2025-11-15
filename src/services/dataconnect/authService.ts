/**
 * Authentication Service
 * Handles authentication-related operations with Data Connect
 */

import axios from 'axios';

// Get Firebase Cloud Functions URL from environment
const FUNCTIONS_URL = import.meta.env.VITE_FIREBASE_FUNCTIONS_URL || 'http://localhost:5001/my-box/us-central1';

/**
 * Request magic link for email verification
 */
export interface RequestMagicLinkRequest {
  email: string;
  loanIds?: string[];
  redirectUrl?: string;
}

export interface RequestMagicLinkResponse {
  success: boolean;
  sessionId: string;
  message: string;
}

/**
 * Verify magic link token
 */
export interface VerifyMagicLinkRequest {
  token: string;
}

export interface VerifyMagicLinkResponse {
  success: boolean;
  sessionId: string;
  requiresVerificationCode: boolean;
  message: string;
}

/**
 * Send verification code
 */
export interface SendVerificationCodeRequest {
  sessionId: string;
  email: string;
}

export interface SendVerificationCodeResponse {
  success: boolean;
  sessionId: string;
  message: string;
}

/**
 * Verify code
 */
export interface VerifyCodeRequest {
  sessionId: string;
  code: string;
}

export interface VerifyCodeResponse {
  success: boolean;
  sessionToken: string;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: string;
  };
  message: string;
}

/**
 * Validate session
 */
export interface ValidateSessionRequest {
  token: string;
}

export interface ValidateSessionResponse {
  valid: boolean;
  user?: {
    id: string;
    email: string;
    role: string;
    sessionId: string;
    loanIds?: string[];
  };
  message: string;
}

/**
 * Request a magic link (via n8n webhook)
 * This triggers the n8n workflow to send an email
 */
export const requestMagicLink = async (
  request: RequestMagicLinkRequest
): Promise<RequestMagicLinkResponse> => {
  const n8nWebhookUrl = import.meta.env.VITE_N8N_MAGIC_LINK_WEBHOOK;

  if (!n8nWebhookUrl) {
    throw new Error('N8N_MAGIC_LINK_WEBHOOK environment variable is not set');
  }

  try {
    const response = await axios.post(n8nWebhookUrl, request);
    return response.data;
  } catch (error: any) {
    console.error('Error requesting magic link:', error);
    throw new Error(error.response?.data?.message || 'Failed to request magic link');
  }
};

/**
 * Verify a magic link token
 * This verifies the JWT and initiates the verification code flow
 */
export const verifyMagicLink = async (
  request: VerifyMagicLinkRequest
): Promise<VerifyMagicLinkResponse> => {
  try {
    const response = await axios.post(`${FUNCTIONS_URL}/verifyMagicLink`, request);
    return response.data;
  } catch (error: any) {
    console.error('Error verifying magic link:', error);
    throw new Error(error.response?.data?.message || 'Failed to verify magic link');
  }
};

/**
 * Send verification code to user's email
 */
export const sendVerificationCode = async (
  request: SendVerificationCodeRequest
): Promise<SendVerificationCodeResponse> => {
  try {
    const response = await axios.post(`${FUNCTIONS_URL}/sendVerificationCode`, request);
    return response.data;
  } catch (error: any) {
    console.error('Error sending verification code:', error);
    throw new Error(error.response?.data?.message || 'Failed to send verification code');
  }
};

/**
 * Verify the 6-digit code and get session token
 */
export const verifyCode = async (
  request: VerifyCodeRequest
): Promise<VerifyCodeResponse> => {
  try {
    const response = await axios.post(`${FUNCTIONS_URL}/verifyCode`, request);
    return response.data;
  } catch (error: any) {
    console.error('Error verifying code:', error);
    throw new Error(error.response?.data?.message || 'Failed to verify code');
  }
};

/**
 * Validate a session token
 */
export const validateSession = async (
  token: string
): Promise<ValidateSessionResponse> => {
  try {
    const response = await axios.post(
      `${FUNCTIONS_URL}/validateSession`,
      { token },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error validating session:', error);
    throw new Error(error.response?.data?.message || 'Failed to validate session');
  }
};

/**
 * Logout (client-side only for now)
 * In a full implementation, this would invalidate the session on the backend
 */
export const logout = async (_token: string): Promise<void> => {
  // TODO: Call backend to revoke session
  // For now, just clear local storage (handled in AuthContext)
  console.log('Logout called');
};

export default {
  requestMagicLink,
  verifyMagicLink,
  sendVerificationCode,
  verifyCode,
  validateSession,
  logout,
};
