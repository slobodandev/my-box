/**
 * Validate Session Cloud Function
 * Validates JWT session tokens for protected requests
 */

import * as functions from 'firebase-functions';
import { logger } from 'firebase-functions';
import {
  verifySessionToken,
  extractTokenFromHeader,
  SessionTokenPayload,
} from '../utils/jwt';

/**
 * Request body for session validation (optional, token usually in header)
 */
interface ValidateSessionRequest {
  token?: string;
}

/**
 * Response for session validation
 */
interface ValidateSessionResponse {
  valid: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    role: string;
    sessionId: string;
    loanIds?: string; // JSON string of loan IDs array
  };
  error?: string;
}

/**
 * Validate Session Function
 *
 * This function:
 * 1. Extracts JWT from Authorization header or request body
 * 2. Verifies the JWT signature and expiry
 * 3. Checks if the session is still valid in Data Connect
 * 4. Returns user information if valid
 *
 * Usage: Call this from frontend before making protected API calls
 * Or use as middleware to protect other Cloud Functions
 */
export const validateSession = functions.https.onRequest(
  async (req, res) => {
    // CORS headers
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }

    if (req.method !== 'GET' && req.method !== 'POST') {
      res.status(405).json({
        valid: false,
        message: 'Method not allowed',
      });
      return;
    }

    try {
      const body: ValidateSessionRequest = req.body || {};

      // Extract token from body or Authorization header
      let token: string;
      try {
        if (body.token) {
          token = body.token;
        } else {
          token = extractTokenFromHeader(req.headers.authorization);
        }
      } catch (error: any) {
        logger.warn('Token extraction failed:', error.message);
        res.status(401).json({
          valid: false,
          message: 'Missing or invalid token',
          error: error.message,
        } as ValidateSessionResponse);
        return;
      }

      // Verify the session JWT
      let decoded;
      try {
        decoded = verifySessionToken(token);
      } catch (error: any) {
        logger.warn('Session token verification failed:', error.message);
        res.status(401).json({
          valid: false,
          message: 'Invalid or expired session token',
          error: error.message,
        } as ValidateSessionResponse);
        return;
      }

      const payload: SessionTokenPayload = decoded.payload;
      const { sessionId, userId, email, role, loanIds } = payload;

      // TODO: Check if session is still valid in Data Connect
      // const authSession = await dataConnect.query('GetAuthSession', {
      //   sessionId,
      // });

      // Mock session check
      const authSession = {
        sessionId,
        userId,
        status: 'verified',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      // Check if session exists
      if (!authSession) {
        logger.warn('Session not found in database', { sessionId });
        res.status(401).json({
          valid: false,
          message: 'Session not found',
        } as ValidateSessionResponse);
        return;
      }

      // Check if session is verified
      if (authSession.status !== 'verified') {
        logger.warn('Session not verified', { sessionId, status: authSession.status });
        res.status(401).json({
          valid: false,
          message: 'Session is not verified',
        } as ValidateSessionResponse);
        return;
      }

      // Check if session has expired
      const now = new Date();
      const expiresAt = new Date(authSession.expiresAt);
      if (now > expiresAt) {
        logger.warn('Session expired', { sessionId });

        // TODO: Update session status to 'expired'
        // await dataConnect.mutation('UpdateAuthSession', {
        //   id: authSession.id,
        //   status: 'expired',
        // });

        res.status(401).json({
          valid: false,
          message: 'Session has expired',
        } as ValidateSessionResponse);
        return;
      }

      // TODO: Update last accessed time
      // await dataConnect.mutation('UpdateAuthSession', {
      //   id: authSession.id,
      //   lastAccessedAt: new Date().toISOString(),
      // });

      logger.info('Session validated successfully', {
        sessionId,
        userId,
      });

      const response: ValidateSessionResponse = {
        valid: true,
        message: 'Session is valid',
        user: {
          id: userId,
          email,
          role,
          sessionId,
          loanIds,
        },
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error('Error validating session:', error);
      res.status(500).json({
        valid: false,
        message: 'Failed to validate session',
        error: error.message,
      } as ValidateSessionResponse);
    }
  }
);

/**
 * Middleware function to validate session
 * Can be used to protect other Cloud Functions
 */
export async function requireValidSession(
  req: functions.https.Request
): Promise<SessionTokenPayload> {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    const decoded = verifySessionToken(token);
    return decoded.payload;
  } catch (error: any) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Invalid or expired session token'
    );
  }
}
