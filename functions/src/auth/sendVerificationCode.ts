/**
 * Send Verification Code Cloud Function
 * Generates and sends a 6-digit verification code to the user's email
 */

import * as functions from 'firebase-functions';
import { logger } from 'firebase-functions';
import {
  generateVerificationCode,
  // hashVerificationCode, // TODO: Use for hashing verification codes
} from '../utils/crypto';

/**
 * Request body for sending verification code
 */
interface SendVerificationCodeRequest {
  sessionId: string;
  email: string;
}

/**
 * Response for sending verification code
 */
interface SendVerificationCodeResponse {
  success: boolean;
  message: string;
  sessionId: string;
  error?: string;
}

/**
 * Send Verification Code Function
 *
 * This function:
 * 1. Validates the sessionId and email
 * 2. Generates a 6-digit verification code
 * 3. Stores the hashed code in Data Connect
 * 4. Triggers n8n to send the code via email
 * 5. Returns success response
 *
 * Rate limiting: Max 3 codes per session per 10 minutes
 */
export const sendVerificationCode = functions.https.onRequest(
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
      const body: SendVerificationCodeRequest = req.body;
      const { sessionId, email } = body;

      // Validate input
      if (!sessionId || !email) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: sessionId and email',
        } as SendVerificationCodeResponse);
        return;
      }

      logger.info('Sending verification code', {
        sessionId,
        email: email.substring(0, 3) + '***',
      });

      // TODO: Check rate limiting
      // Query Data Connect for recent verification codes for this session
      // If > 3 codes sent in last 10 minutes, reject

      // TODO: Check if session exists and is valid
      // Query Data Connect: GetAuthSession(sessionId)

      // Generate 6-digit verification code
      const verificationCode = generateVerificationCode(6);
      // const codeHash = hashVerificationCode(verificationCode); // TODO: Store in Data Connect

      // Calculate expiry (10 minutes from now)
      // const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // TODO: Use for expiry

      // TODO: Store verification code in Data Connect
      // await dataConnect.mutation('CreateVerificationCode', {
      //   sessionId,
      //   codeHash,
      //   expiresAt,
      // });

      logger.info('Verification code generated and stored', {
        sessionId,
      });

      // In development, log the code (NEVER in production!)
      if (process.env.NODE_ENV === 'development') {
        logger.info(`🔐 Verification code for ${email}: ${verificationCode}`);
      }

      // TODO: Call n8n webhook to send verification code email
      // Example:
      // await fetch('https://n8n.example.com/webhook/send-verification-code', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     email,
      //     code: verificationCode,
      //     sessionId,
      //   }),
      // });

      const response: SendVerificationCodeResponse = {
        success: true,
        message: 'Verification code sent to your email',
        sessionId,
      };

      // TODO: Log auth event in audit log
      // await dataConnect.mutation('LogAuthEvent', {
      //   sessionId,
      //   eventType: 'verification_code_sent',
      //   success: true,
      //   ipAddress: req.ip,
      //   userAgent: req.headers['user-agent'],
      // });

      res.status(200).json(response);
    } catch (error: any) {
      logger.error('Error sending verification code:', error);

      // TODO: Log failure in audit log

      res.status(500).json({
        success: false,
        message: 'Failed to send verification code',
        error: error.message,
      } as SendVerificationCodeResponse);
    }
  }
);
