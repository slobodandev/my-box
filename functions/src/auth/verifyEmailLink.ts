/**
 * Verify Email Link Cloud Function
 * Completes the email link authentication flow
 *
 * This function:
 * 1. Verifies the Firebase ID token from the client
 * 2. Finds the auth session in Data Connect by Firebase UID and email
 * 3. Generates a session JWT token
 * 4. Updates the session status to 'active'
 * 5. Returns the session JWT token to the client
 */

import { onRequest } from 'firebase-functions/v2/https';
import { getAuth } from 'firebase-admin/auth';
import { logger } from 'firebase-functions/v2';
import { generateSessionToken } from '../utils/jwt';
import { getAuthSessionByFirebaseUid, verifyAuthSession, updateUserPasswordStatus, markMagicLinkUsed } from '../dataconnect';

/**
 * Request body interface
 */
interface VerifyEmailLinkRequest {
  idToken: string; // Firebase ID token
}

/**
 * Response interface
 */
interface VerifyEmailLinkResponse {
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
 * Verify Email Link Cloud Function
 *
 * POST /verifyEmailLink
 * Body: { idToken: <firebase-id-token> }
 */
export const verifyEmailLink = onRequest(
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

      const body = request.body as VerifyEmailLinkRequest;
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

      logger.info('Verifying Firebase ID token...');

      // Verify the Firebase ID token
      const decodedToken = await getAuth().verifyIdToken(idToken);
      const { uid: firebaseUid, email } = decodedToken;

      if (!email) {
        throw new Error('Email not found in Firebase token');
      }

      logger.info('Firebase token verified', { firebaseUid, email });

      // Find the auth session in Data Connect
      const sessionResult = await getAuthSessionByFirebaseUid({
        firebaseUid,
        email: email.toLowerCase().trim(),
      });

      if (!sessionResult.data?.authSessions || sessionResult.data.authSessions.length === 0) {
        logger.error('Auth session not found', { firebaseUid, email });
        response.status(404).json({
          success: false,
          message: 'Authentication session not found. Please request a new sign-in link.',
        } as VerifyEmailLinkResponse);
        return;
      }

      // Get the most recent session
      const authSession = sessionResult.data.authSessions[0];

      logger.info('Auth session found', {
        sessionId: authSession.sessionId,
        userId: authSession.userId,
        status: authSession.status,
      });

      // Check if user has password set in Firebase and update database if needed
      try {
        const firebaseUser = await getAuth().getUser(firebaseUid);
        const hasPasswordProvider = firebaseUser.providerData.some(
          (provider) => provider.providerId === 'password'
        );

        // If user has password in Firebase but database shows hasPassword: false, update it
        if (hasPasswordProvider && !(authSession.user as any).hasPassword) {
          logger.info('User has password in Firebase, updating database', { userId: authSession.userId });
          await updateUserPasswordStatus({
            userId: authSession.userId,
            hasPassword: true,
            isTemporary: false,
          });
          logger.info('Database updated with hasPassword: true');
          // Update the local authSession object for the response
          (authSession.user as any).hasPassword = true;
          (authSession.user as any).isTemporary = false;
        }
      } catch (error) {
        logger.warn('Error checking user password status', { error });
        // Continue anyway - this is not critical
      }

      // Check if session is already verified or active
      if (authSession.status === 'active' || authSession.status === 'verified') {
        logger.info('Session already verified, generating new token');
      } else if (authSession.status === 'expired') {
        response.status(401).json({
          success: false,
          message: 'This sign-in link has expired. Please request a new one.',
        } as VerifyEmailLinkResponse);
        return;
      } else if (authSession.status === 'revoked') {
        response.status(401).json({
          success: false,
          message: 'This sign-in link has been revoked. Please request a new one.',
        } as VerifyEmailLinkResponse);
        return;
      }

      // Check if session has expired
      const now = new Date();
      const expiresAt = new Date(authSession.expiresAt);
      if (now > expiresAt) {
        logger.warn('Session expired', { sessionId: authSession.sessionId });
        response.status(401).json({
          success: false,
          message: 'This sign-in link has expired. Please request a new one.',
        } as VerifyEmailLinkResponse);
        return;
      }

      // Parse loanIds if it's a JSON string
      let loanIdsArray: string[] = [];
      if (authSession.loanIds) {
        try {
          loanIdsArray = JSON.parse(authSession.loanIds);
        } catch (error) {
          logger.warn('Failed to parse loanIds', { loanIds: authSession.loanIds });
        }
      }

      // Generate session JWT token
      const sessionToken = generateSessionToken({
        sessionId: authSession.sessionId,
        userId: authSession.userId,
        email: email.toLowerCase().trim(),
        role: authSession.user.role,
        loanIds: loanIdsArray.length > 0 ? JSON.stringify(loanIdsArray) : undefined,
      });

      logger.info('Session token generated');

      // Update session status to active
      await verifyAuthSession({
        id: authSession.id,
        sessionToken,
        verifiedAt: now.toISOString(),
      });

      logger.info('Session marked as active', { sessionId: authSession.sessionId });

      // Mark the magic link as used in the database
      try {
        await markMagicLinkUsed({
          sessionId: authSession.sessionId,
          usedAt: now.toISOString(),
        });
        logger.info('Magic link marked as used');
      } catch (dbError) {
        // Log the error but don't fail the request - the session is still valid
        logger.error('Failed to mark magic link as used:', dbError);
      }

      const responseData: VerifyEmailLinkResponse = {
        success: true,
        message: 'Email link verified successfully',
        sessionToken,
        user: {
          id: authSession.userId,
          email: email.toLowerCase().trim(),
          role: authSession.user.role,
          sessionId: authSession.sessionId,
          loanIds: loanIdsArray,
          hasPassword: (authSession.user as any).hasPassword,
          googleAuthUid: (authSession.user as any).googleAuthUid || undefined,
          isTemporary: (authSession.user as any).isTemporary,
          firstName: authSession.user.firstName || undefined,
          lastName: authSession.user.lastName || undefined,
        },
      };

      response.status(200).json(responseData);
    } catch (error: any) {
      logger.error('Error verifying email link:', error);

      if (error.code === 'auth/id-token-expired') {
        response.status(401).json({
          success: false,
          message: 'This sign-in link has expired. Please request a new one.',
          error: error.message,
        } as VerifyEmailLinkResponse);
        return;
      }

      if (error.code === 'auth/invalid-id-token' || error.code === 'auth/argument-error') {
        response.status(401).json({
          success: false,
          message: 'Invalid sign-in link. Please request a new one.',
          error: error.message,
        } as VerifyEmailLinkResponse);
        return;
      }

      response.status(500).json({
        success: false,
        message: 'Failed to verify email link',
        error: error.message,
      } as VerifyEmailLinkResponse);
    }
  }
);
