/**
 * Create Password Session Cloud Function
 * Creates a session token for password-based authentication
 *
 * This function:
 * 1. Verifies the Firebase ID token from the client
 * 2. Gets or creates an auth session for the user
 * 3. Generates a session JWT token
 * 4. Returns the session JWT token to the client
 *
 * Unlike verifyEmailLink, this function doesn't check for magic link expiration
 * and is designed for users who signed in with email/password.
 */

import { onRequest } from 'firebase-functions/v2/https';
import { getAuth } from 'firebase-admin/auth';
import { logger } from 'firebase-functions/v2';
import { generateSessionToken } from '../utils/jwt';
import {
  getAuthSessionByFirebaseUid,
  updateUserPasswordStatus,
} from '../dataconnect';

/**
 * Request body interface
 */
interface CreatePasswordSessionRequest {
  idToken: string; // Firebase ID token
}

/**
 * Response interface
 */
interface CreatePasswordSessionResponse {
  success: boolean;
  message: string;
  sessionToken?: string;
  user?: {
    id: string;
    email: string;
    role: string;
    sessionId: string;
    loanIds?: string[];
    hasPassword?: boolean;
    googleAuthUid?: string;
    isTemporary?: boolean;
    firstName?: string;
    lastName?: string;
  };
  error?: string;
}

/**
 * Create Password Session Cloud Function
 *
 * POST /createPasswordSession
 * Body: { idToken: <firebase-id-token> }
 */
export const createPasswordSession = onRequest(
  { cors: true, maxInstances: 10 },
  async (request, response) => {
    // CORS headers
    response.set('Access-Control-Allow-Origin', '*');
    response.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (request.method === 'OPTIONS') {
      response.status(204).send('');
      return;
    }

    if (request.method !== 'POST') {
      response.status(405).json({
        success: false,
        message: 'Method not allowed',
      });
      return;
    }

    try {
      // Extract ID token from body or Authorization header
      let idToken: string;

      const body = request.body as CreatePasswordSessionRequest;
      if (body.idToken) {
        idToken = body.idToken;
      } else if (request.headers.authorization) {
        // Extract from Bearer token
        const authHeader = request.headers.authorization;
        if (authHeader.startsWith('Bearer ')) {
          idToken = authHeader.substring(7);
        } else {
          throw new Error('Invalid Authorization header format');
        }
      } else {
        throw new Error('Missing Firebase ID token');
      }

      logger.info('Verifying Firebase ID token for password session...');

      // Verify the Firebase ID token
      const decodedToken = await getAuth().verifyIdToken(idToken);
      const { uid: firebaseUid, email } = decodedToken;

      if (!email) {
        throw new Error('Email not found in Firebase token');
      }

      logger.info('Firebase token verified', { firebaseUid, email });

      // Check if user has password set in Firebase
      const firebaseUser = await getAuth().getUser(firebaseUid);
      const hasPasswordProvider = firebaseUser.providerData.some(
        (provider) => provider.providerId === 'password'
      );

      if (!hasPasswordProvider) {
        logger.warn('User does not have password provider', { firebaseUid, email });
        response.status(400).json({
          success: false,
          message: 'This endpoint is for password-based authentication. Please use email link authentication.',
        } as CreatePasswordSessionResponse);
        return;
      }

      logger.info('User has password provider, creating/updating session...');

      // Try to find existing auth session
      const sessionResult = await getAuthSessionByFirebaseUid({
        firebaseUid,
        email: email.toLowerCase().trim(),
      });

      let authSession: any;
      let userId: string;
      let role: string;
      let loanIds: string[] = [];

      if (sessionResult.data?.authSessions && sessionResult.data.authSessions.length > 0) {
        // Use existing session
        authSession = sessionResult.data.authSessions[0];
        userId = authSession.userId;
        role = authSession.user.role;

        // Parse loanIds if it's a JSON string
        if (authSession.loanIds) {
          try {
            loanIds = JSON.parse(authSession.loanIds);
          } catch (error) {
            logger.warn('Failed to parse loanIds', { loanIds: authSession.loanIds });
          }
        }

        // Update password status if needed
        if (!(authSession.user as any).hasPassword) {
          logger.info('Updating user password status to true');
          await updateUserPasswordStatus({
            userId,
            hasPassword: true,
            isTemporary: false,
          });
          (authSession.user as any).hasPassword = true;
          (authSession.user as any).isTemporary = false;
        }

        logger.info('Using existing auth session', {
          sessionId: authSession.sessionId,
          userId,
        });
      } else {
        // No existing session - this shouldn't happen for password users
        // They should have been created via magic link first
        logger.error('No auth session found for password user', { firebaseUid, email });
        response.status(404).json({
          success: false,
          message: 'User account not found. Please contact an administrator.',
        } as CreatePasswordSessionResponse);
        return;
      }

      // Generate session JWT token with extended expiry for password users
      const sessionToken = generateSessionToken({
        sessionId: authSession.sessionId,
        userId,
        email: email.toLowerCase().trim(),
        role,
        loanIds: loanIds.length > 0 ? JSON.stringify(loanIds) : undefined,
      });

      logger.info('Session token generated for password auth');

      const responseData: CreatePasswordSessionResponse = {
        success: true,
        message: 'Session created successfully',
        sessionToken,
        user: {
          id: userId,
          email: email.toLowerCase().trim(),
          role,
          sessionId: authSession.sessionId,
          loanIds,
          hasPassword: true,
          googleAuthUid: (authSession.user as any).googleAuthUid || undefined,
          isTemporary: false,
          firstName: authSession.user.firstName || undefined,
          lastName: authSession.user.lastName || undefined,
        },
      };

      response.status(200).json(responseData);
    } catch (error: any) {
      logger.error('Error creating password session:', error);

      if (error.code === 'auth/id-token-expired') {
        response.status(401).json({
          success: false,
          message: 'Session expired. Please sign in again.',
          error: error.message,
        } as CreatePasswordSessionResponse);
        return;
      }

      if (error.code === 'auth/invalid-id-token' || error.code === 'auth/argument-error') {
        response.status(401).json({
          success: false,
          message: 'Invalid authentication token. Please sign in again.',
          error: error.message,
        } as CreatePasswordSessionResponse);
        return;
      }

      response.status(500).json({
        success: false,
        message: 'Failed to create session',
        error: error.message,
      } as CreatePasswordSessionResponse);
    }
  }
);
