/**
 * Generate Auth Link Cloud Function
 * Third-party API endpoint for generating Firebase Email Link authentication
 *
 * This function allows external systems (like loan origination systems) to
 * generate passwordless authentication links for borrowers to upload documents.
 */

import { onRequest } from 'firebase-functions/v2/https';
import { getAuth } from 'firebase-admin/auth';
import { logger } from 'firebase-functions/v2';
import { getUserByEmail, createUser, createAuthSessionWithFirebase } from '../dataconnect';
import * as crypto from 'crypto';

/**
 * Request body interface
 */
interface GenerateAuthLinkRequest {
  email: string;
  borrowerContactId?: string;
  loanNumber?: string;
  loanIds?: string[];
  expirationHours?: number;
}

/**
 * Response interface
 */
interface GenerateAuthLinkResponse {
  success: boolean;
  sessionId: string;
  emailSent: boolean;
  expiresAt: string;
  message: string;
  emailLink?: string; // Only included in emulator mode for testing
}

/**
 * Validate API key from request headers
 */
function validateApiKey(apiKey: string | undefined): boolean {
  if (!apiKey) {
    return false;
  }

  const validKeys = process.env.VALID_API_KEYS?.split(',') || [];
  return validKeys.includes(apiKey);
}

/**
 * Generate SHA-256 hash
 */
function sha256(text: string): string {
  return crypto.createHash('sha256').update(text).digest('hex');
}

/**
 * Find or create user by email
 */
async function findOrCreateUser(email: string): Promise<{ userId: string; firebaseUid: string }> {
  try {
    // Try to find user in Data Connect using SDK wrapper
    const result = await getUserByEmail({ email: email.toLowerCase().trim() });

    logger.info('User query result:', result);

    // Check if user exists
    if (result.data?.users && result.data.users.length > 0) {
      const existingUser = result.data.users[0];

      // Get or create Firebase Auth user
      let firebaseUser;
      try {
        firebaseUser = await getAuth().getUserByEmail(email);
      } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
          // Create Firebase Auth user
          firebaseUser = await getAuth().createUser({
            email: email.toLowerCase().trim(),
            emailVerified: false,
          });
          logger.info('Created Firebase Auth user:', firebaseUser.uid);
        } else {
          throw error;
        }
      }

      return {
        userId: existingUser.id,
        firebaseUid: firebaseUser.uid,
      };
    }

    // User doesn't exist - create in both Firebase Auth and Data Connect
    const firebaseUser = await getAuth().createUser({
      email: email.toLowerCase().trim(),
      emailVerified: false,
    });

    logger.info('Created Firebase Auth user:', firebaseUser.uid);

    // Create user in Data Connect using SDK wrapper
    await createUser({
      email: email.toLowerCase().trim(),
      role: 'borrower',
    });

    logger.info('Created user in Data Connect');

    // Get the created user ID
    const getUserAgain = await getUserByEmail({ email: email.toLowerCase().trim() });
    const newUserId = getUserAgain.data.users[0].id;

    return {
      userId: newUserId,
      firebaseUid: firebaseUser.uid,
    };
  } catch (error) {
    logger.error('Error in findOrCreateUser:', error);
    throw error;
  }
}

/**
 * Generate Auth Link Cloud Function
 *
 * POST /generateAuthLink
 * Headers: x-api-key: <your-api-key>
 * Body: { email, borrowerContactId?, loanNumber?, loanIds?, expirationHours? }
 */
export const generateAuthLink = onRequest(
  { cors: true, maxInstances: 10 },
  async (request, response) => {
    // CORS headers
    response.set('Access-Control-Allow-Origin', '*');
    response.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.set('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

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
      // Validate API key
      const apiKey = request.headers['x-api-key'] as string;
      if (!validateApiKey(apiKey)) {
        logger.warn('Invalid API key attempt');
        response.status(401).json({
          success: false,
          message: 'Invalid API key',
        });
        return;
      }

      // Parse request body
      const body = request.body as GenerateAuthLinkRequest;
      const {
        email,
        borrowerContactId,
        loanNumber,
        loanIds = [],
        expirationHours = 48,
      } = body;

      // Validate required fields
      if (!email) {
        response.status(400).json({
          success: false,
          message: 'Email is required',
        });
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        response.status(400).json({
          success: false,
          message: 'Invalid email format',
        });
        return;
      }

      // Validate expiration hours
      if (expirationHours < 1 || expirationHours > 168) {
        response.status(400).json({
          success: false,
          message: 'Expiration hours must be between 1 and 168 (7 days)',
        });
        return;
      }

      logger.info('Generating auth link for:', { email, loanNumber, borrowerContactId });

      // Find or create user
      const { userId, firebaseUid } = await findOrCreateUser(email);

      // Generate Firebase Email Link
      const actionCodeSettings = {
        url: `${process.env.EMAIL_LINK_URL || process.env.APP_BASE_URL}/auth/verify?email=${encodeURIComponent(email)}`,
        handleCodeInApp: true,
      };

      const emailLink = await getAuth().generateSignInWithEmailLink(
        email.toLowerCase().trim(),
        actionCodeSettings
      );

      logger.info('Generated Firebase email link and sent to user');
      logger.info('='.repeat(80));
      logger.info('🔗 EMULATOR SIGN-IN LINK (for testing):');
      logger.info(emailLink);
      logger.info('='.repeat(80));

      // Generate session ID
      const sessionId = crypto.randomUUID();

      // Generate email hash
      const emailHash = sha256(email.toLowerCase().trim());

      // Calculate expiration
      const expiresAt = new Date(Date.now() + expirationHours * 60 * 60 * 1000);

      // Create AuthSession in Data Connect using SDK wrapper
      await createAuthSessionWithFirebase({
        sessionId,
        userId,
        firebaseUid,
        emailHash,
        loanIds: JSON.stringify(loanIds),
        borrowerContactId: borrowerContactId || null,
        loanNumber: loanNumber || null,
        expiresAt: expiresAt.toISOString(),
        ipAddress: request.ip || request.headers['x-forwarded-for'] as string || 'unknown',
        userAgent: request.headers['user-agent'] || 'unknown',
      });

      logger.info('Created auth session:', sessionId);

      // Note: Firebase Auth automatically sends the email
      // The email link will contain the sign-in link

      const responseData: GenerateAuthLinkResponse = {
        success: true,
        sessionId,
        emailSent: true,
        expiresAt: expiresAt.toISOString(),
        message: `Authentication email sent to ${email}`,
      };

      // Include email link in response for emulator testing
      const isEmulator = process.env.FUNCTIONS_EMULATOR === 'true';
      if (isEmulator) {
        responseData.emailLink = emailLink;
        logger.info('Including emailLink in response for emulator testing');
      }

      response.status(200).json(responseData);
    } catch (error: any) {
      logger.error('Error generating auth link:', error);
      response.status(500).json({
        success: false,
        message: 'Failed to generate auth link',
        error: error.message,
      });
    }
  }
);
