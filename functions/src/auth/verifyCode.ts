/**
 * Verify Code Cloud Function
 * Verifies the 6-digit verification code and creates a session token
 */

import * as functions from 'firebase-functions';
import { logger } from 'firebase-functions';
import {
  generateSessionToken,
  SessionTokenPayload,
} from '../utils/jwt';
import {
  // hashVerificationCode, // TODO: Use for code hashing
  verifyVerificationCode,
  // generateSessionToken as generateSessionTokenString, // TODO: Use for session token identifier
} from '../utils/crypto';

/**
 * Request body for code verification
 */
interface VerifyCodeRequest {
  sessionId: string;
  code: string;
}

/**
 * Response for code verification
 */
interface VerifyCodeResponse {
  success: boolean;
  message: string;
  sessionToken?: string; // JWT for authenticated requests
  user?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: string;
  };
  error?: string;
}

/**
 * Verify Code Function
 *
 * This function:
 * 1. Validates the sessionId and code
 * 2. Retrieves the stored code hash from Data Connect
 * 3. Verifies the code matches the hash
 * 4. Checks code hasn't expired or been used
 * 5. Generates a session JWT token
 * 6. Updates auth session to 'verified' status
 * 7. Returns the session token to the frontend
 *
 * Rate limiting: Max 5 attempts per session
 */
export const verifyCode = functions.https.onRequest(
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
      const body: VerifyCodeRequest = req.body;
      const { sessionId, code } = body;

      // Validate input
      if (!sessionId || !code) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: sessionId and code',
        } as VerifyCodeResponse);
        return;
      }

      // Validate code format (6 digits)
      if (!/^\d{6}$/.test(code)) {
        res.status(400).json({
          success: false,
          message: 'Invalid code format. Code must be 6 digits.',
        } as VerifyCodeResponse);
        return;
      }

      logger.info('Verifying code', { sessionId });

      // TODO: Get verification code from Data Connect
      // const verificationCodeRecord = await dataConnect.query('GetVerificationCode', {
      //   sessionId,
      // });

      // Mock data for development
      const verificationCodeRecord = {
        id: 'mock-id',
        codeHash: 'mock-hash', // This should be the actual hash from DB
        expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        attemptCount: 0,
        maxAttempts: 5,
        isUsed: false,
      };

      // Check if code exists
      if (!verificationCodeRecord) {
        logger.warn('Verification code not found', { sessionId });
        res.status(404).json({
          success: false,
          message: 'Invalid session or verification code expired',
        } as VerifyCodeResponse);
        return;
      }

      // Check if code has been used
      if (verificationCodeRecord.isUsed) {
        logger.warn('Verification code already used', { sessionId });
        res.status(400).json({
          success: false,
          message: 'Verification code has already been used',
        } as VerifyCodeResponse);
        return;
      }

      // Check if code has expired
      const now = new Date();
      const expiresAt = new Date(verificationCodeRecord.expiresAt);
      if (now > expiresAt) {
        logger.warn('Verification code expired', { sessionId });
        res.status(400).json({
          success: false,
          message: 'Verification code has expired. Please request a new one.',
        } as VerifyCodeResponse);
        return;
      }

      // Check attempt count
      if (verificationCodeRecord.attemptCount >= verificationCodeRecord.maxAttempts) {
        logger.warn('Too many verification attempts', { sessionId });
        res.status(429).json({
          success: false,
          message: 'Too many failed attempts. Please request a new verification code.',
        } as VerifyCodeResponse);
        return;
      }

      // Verify the code
      const isValidCode = verifyVerificationCode(
        code,
        verificationCodeRecord.codeHash
      );

      if (!isValidCode) {
        // Increment attempt count
        // TODO: Update attempt count in Data Connect
        // await dataConnect.mutation('UpdateVerificationCodeAttempts', {
        //   id: verificationCodeRecord.id,
        //   attemptCount: verificationCodeRecord.attemptCount + 1,
        // });

        logger.warn('Invalid verification code', { sessionId });

        // TODO: Log failed attempt in audit log

        res.status(401).json({
          success: false,
          message: 'Invalid verification code. Please try again.',
        } as VerifyCodeResponse);
        return;
      }

      // Code is valid! Mark as used
      // TODO: Mark verification code as used in Data Connect
      // await dataConnect.mutation('MarkVerificationCodeUsed', {
      //   id: verificationCodeRecord.id,
      // });

      // TODO: Get auth session and user info from Data Connect
      // const authSession = await dataConnect.query('GetAuthSession', {
      //   sessionId,
      // });
      // const user = await dataConnect.query('GetUser', {
      //   id: authSession.userId,
      // });

      // Mock user data for development
      const user = {
        id: 'mock-user-id',
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'borrower',
      };

      // Generate session JWT token
      const sessionTokenPayload: Omit<SessionTokenPayload, 'type'> = {
        sessionId,
        userId: user.id,
        email: user.email,
        role: user.role,
        // loanIds can be added if needed
      };

      const sessionToken = generateSessionToken(sessionTokenPayload);

      // TODO: Update auth session status to 'verified' in Data Connect
      // await dataConnect.mutation('UpdateAuthSession', {
      //   id: authSession.id,
      //   status: 'verified',
      //   sessionToken: generateSessionTokenString(), // Store identifier, not JWT
      //   verifiedAt: new Date().toISOString(),
      //   lastAccessedAt: new Date().toISOString(),
      // });

      logger.info('Code verified successfully', {
        sessionId,
        userId: user.id,
      });

      // TODO: Log successful verification in audit log
      // await dataConnect.mutation('LogAuthEvent', {
      //   sessionId,
      //   userId: user.id,
      //   eventType: 'code_verified',
      //   success: true,
      //   ipAddress: req.ip,
      //   userAgent: req.headers['user-agent'],
      // });

      const response: VerifyCodeResponse = {
        success: true,
        message: 'Verification successful',
        sessionToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error('Error verifying code:', error);

      // TODO: Log error in audit log

      res.status(500).json({
        success: false,
        message: 'Failed to verify code',
        error: error.message,
      } as VerifyCodeResponse);
    }
  }
);
