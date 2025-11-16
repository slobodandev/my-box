/**
 * Authentication Hooks
 * Specialized hooks for authentication operations
 */

import { useCloudFunctionMutation } from './useCloudFunction';
import { CloudFunction } from '@/config/cloudFunctions';

/**
 * Generate Auth Link Request/Response Types
 */
export interface GenerateAuthLinkRequest {
  email: string;
  loanNumber?: string;
  borrowerContactId?: string;
  expirationHours?: number;
}

export interface GenerateAuthLinkResponse {
  success: boolean;
  message: string;
  sessionId: string;
  emailSent: boolean;
  expiresAt: string;
  emailLink?: string; // Only included in emulator mode for testing
}

/**
 * Validate Session Request/Response Types
 */
export interface ValidateSessionResponse {
  valid: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    role: string;
    sessionId: string;
    loanIds?: string;
  };
}

/**
 * Hook to generate authentication link
 * 
 * @example
 * const { execute, loading, error, data } = useGenerateAuthLink({
 *   onSuccess: (data) => console.log('Auth link generated:', data),
 *   onError: (error) => console.error('Failed:', error),
 * });
 * 
 * await execute({
 *   email: 'user@example.com',
 *   loanNumber: 'LOAN-123',
 * });
 */
export function useGenerateAuthLink(options?: {
  onSuccess?: (data: GenerateAuthLinkResponse) => void;
  onError?: (error: Error) => void;
}) {
  return useCloudFunctionMutation<GenerateAuthLinkResponse, GenerateAuthLinkRequest>(
    CloudFunction.GENERATE_AUTH_LINK,
    {
      requiresAuth: false,
      ...options,
    }
  );
}

/**
 * Hook to validate session
 * 
 * @example
 * const { execute, data, loading } = useValidateSession();
 * const sessionData = await execute();
 */
export function useValidateSession(options?: {
  onSuccess?: (data: ValidateSessionResponse) => void;
  onError?: (error: Error) => void;
}) {
  return useCloudFunctionMutation<ValidateSessionResponse>(
    CloudFunction.VALIDATE_SESSION,
    {
      method: 'GET',
      requiresAuth: true,
      ...options,
    }
  );
}
