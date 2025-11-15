/**
 * Verify Magic Link Cloud Function
 * Handles magic link verification and initiates 2FA verification code flow
 */

import * as functions from 'firebase-functions';
import { logger } from 'firebase-functions';
import {
  verifyMagicLinkToken,
  extractTokenFromHeader,
} from '../utils/jwt';
import {
  generateVerificationCode,
  // hashVerificationCode, // TODO: Use for hashing verification codes
  // hashEmail, // TODO: Use for email validation
} from '../utils/crypto';

/**
 * Request body for magic link verification
 */
interface VerifyMagicLinkRequest {
  token?: string; // Can be in body or Authorization header
}

/**
 * Response for magic link verification
 */
interface VerifyMagicLinkResponse {
  success: boolean;
  sessionId: string;
  requiresVerificationCode: boolean;
  message: string;
  error?: string;
}

/**
 * Verify Magic Link Function
 *
 * This function:
 * 1. Verifies the magic link JWT token
 * 2. Checks if the auth session exists and is valid
 * 3. Generates a 6-digit verification code
 * 4. Stores the verification code in Data Connect
 * 5. Returns sessionId for the next step (code verification)
 *
 * The verification code should be sent to the user via n8n workflow
 * (triggered by this function or by the frontend)
 */
export const verifyMagicLink = functions.https.onRequest(
  async (req, res) => {
    // CORS headers
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }

    if (req.method !== 'POST') {
      res.status(405).json({
        success: false,
        message: 'Method not allowed',
      });
      return;
    }

    try {
      const body: VerifyMagicLinkRequest = req.body;

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
          success: false,
          message: 'Missing or invalid token',
          error: error.message,
        } as VerifyMagicLinkResponse);
        return;
      }

      // Verify the magic link JWT
      let decoded;
      try {
        decoded = verifyMagicLinkToken(token);
      } catch (error: any) {
        logger.warn('Magic link verification failed:', error.message);
        res.status(401).json({
          success: false,
          message: 'Invalid or expired magic link',
          error: error.message,
        } as VerifyMagicLinkResponse);
        return;
      }

      const { sessionId, email, userId } = decoded.payload;

      logger.info('Magic link verified successfully', {
        sessionId,
        email: email.substring(0, 3) + '***', // Partial email for privacy
        userId,
      });

      // TODO: Verify auth session exists in Data Connect
      // For now, we'll assume it exists since n8n created it

      // Generate 6-digit verification code
      const verificationCode = generateVerificationCode(6);
      // const codeHash = hashVerificationCode(verificationCode); // TODO: Store in Data Connect

      // Calculate expiry (10 minutes from now)
      // const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // TODO: Use for expiry

      // TODO: Store verification code in Data Connect
      // This would use the CreateVerificationCode mutation
      // Example:
      // await dataConnect.mutation('CreateVerificationCode', {
      //   sessionId,
      //   codeHash,
      //   expiresAt,
      // });

      logger.info('Verification code generated', {
        sessionId,
        codeLength: verificationCode.length,
      });

      // In development, log the code (NEVER in production!)
      if (process.env.NODE_ENV === 'development') {
        logger.info(`🔐 Verification code: ${verificationCode}`);
      }

      // TODO: Trigger n8n workflow to send verification code email
      // This can be done via HTTP request to n8n webhook
      // For now, the frontend will call n8n directly with sessionId

      const response: VerifyMagicLinkResponse = {
        success: true,
        sessionId,
        requiresVerificationCode: true,
        message: 'Magic link verified. Please enter the verification code sent to your email.',
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error('Unexpected error in verifyMagicLink:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      } as VerifyMagicLinkResponse);
    }
  }
);
