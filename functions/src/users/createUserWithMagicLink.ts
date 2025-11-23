/**
 * Create User with Magic Link Cloud Function
 * Creates a new user and optionally generates and sends a magic link
 */

import { onRequest } from 'firebase-functions/v2/https';
import { getAuth } from 'firebase-admin/auth';
import { logger } from 'firebase-functions/v2';
import { getUserByEmail, createUser, createAuthSessionWithFirebase, createMagicLink } from '../dataconnect';
import { sendWelcomeEmail } from '../services/emailService';
import * as crypto from 'crypto';

interface CreateUserRequest {
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  role?: string;
  generateMagicLink?: boolean;
  sendEmail?: boolean;
  expirationHours?: number;
}

interface CreateUserResponse {
  success: boolean;
  userId: string;
  message: string;
  magicLink?: string;
  sessionId?: string;
  emailSent?: boolean;
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
 * Create User with Magic Link Cloud Function
 */
export const createUserWithMagicLink = onRequest(
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
      const body = request.body as CreateUserRequest;
      const {
        email,
        firstName,
        lastName,
        phoneNumber,
        role = 'borrower',
        generateMagicLink = false,
        sendEmail = false,
        expirationHours = 48,
      } = body;

      // Validate email
      if (!email) {
        response.status(400).json({
          success: false,
          message: 'Email is required',
        });
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        response.status(400).json({
          success: false,
          message: 'Invalid email format',
        });
        return;
      }

      logger.info('Creating user:', { email, role, generateMagicLink, sendEmail });

      // Check if user already exists
      const existingUser = await getUserByEmail({ email: email.toLowerCase().trim() });
      if (existingUser.data?.users && existingUser.data.users.length > 0) {
        response.status(409).json({
          success: false,
          message: 'User with this email already exists',
        });
        return;
      }

      // Create Firebase Auth user
      const firebaseUser = await getAuth().createUser({
        email: email.toLowerCase().trim(),
        emailVerified: false,
      });

      logger.info('Created Firebase Auth user:', firebaseUser.uid);

      // Create user in Data Connect
      await createUser({
        email: email.toLowerCase().trim(),
        firstName: firstName || null,
        lastName: lastName || null,
        phoneNumber: phoneNumber || null,
        role: role || null,
      });

      logger.info('Created user in Data Connect');

      // Get the created user ID
      const getUserAgain = await getUserByEmail({ email: email.toLowerCase().trim() });
      const userId = getUserAgain.data.users[0].id;

      const responseData: CreateUserResponse = {
        success: true,
        userId,
        message: 'User created successfully',
      };

      // Generate magic link if requested
      if (generateMagicLink) {
        // Generate Firebase Email Link
        const actionCodeSettings = {
          url: `${process.env.EMAIL_LINK_URL || process.env.APP_BASE_URL}/auth/verify?email=${encodeURIComponent(email)}`,
          handleCodeInApp: true,
        };

        const emailLink = await getAuth().generateSignInWithEmailLink(
          email.toLowerCase().trim(),
          actionCodeSettings
        );

        logger.info('Generated Firebase email link');

        // Generate session ID
        const sessionId = crypto.randomUUID();

        // Generate email hash
        const emailHash = sha256(email.toLowerCase().trim());

        // Calculate expiration
        const expiresAt = new Date(Date.now() + expirationHours * 60 * 60 * 1000);

        // Create AuthSession in Data Connect
        await createAuthSessionWithFirebase({
          sessionId,
          userId,
          firebaseUid: firebaseUser.uid,
          emailHash,
          loanIds: null,
          borrowerContactId: null,
          loanNumber: null,
          expiresAt: expiresAt.toISOString(),
          ipAddress: request.ip || request.headers['x-forwarded-for'] as string || 'unknown',
          userAgent: request.headers['user-agent'] || 'unknown',
        });

        logger.info('Created auth session:', sessionId);

        // Persist magic link to database
        try {
          await createMagicLink({
            userId,
            borrowerEmail: email.toLowerCase().trim(),
            sendToEmail: email.toLowerCase().trim(),
            magicLinkUrl: emailLink,
            sessionId,
            expiresAt: expiresAt.toISOString(),
            createdBy: null,
            sentAt: sendEmail ? new Date().toISOString() : null,
          });
          logger.info('Persisted magic link to database');
        } catch (dbError) {
          logger.error('Failed to persist magic link:', dbError);
        }

        // Send welcome email if requested
        if (sendEmail) {
          try {
            await sendWelcomeEmail({
              to: email.toLowerCase().trim(),
              firstName,
              lastName,
              magicLink: emailLink,
              expiresInHours: expirationHours,
            });
            logger.info('Welcome email sent via Resend');
            responseData.emailSent = true;
          } catch (emailError) {
            logger.warn('Failed to send welcome email via Resend:', emailError);
            responseData.emailSent = false;
          }
        }

        responseData.magicLink = emailLink;
        responseData.sessionId = sessionId;
        responseData.message = sendEmail
          ? 'User created and welcome email sent successfully'
          : 'User created and magic link generated successfully';
      }

      response.status(200).json(responseData);
    } catch (error: any) {
      logger.error('Error creating user:', error);
      response.status(500).json({
        success: false,
        message: 'Failed to create user',
        error: error.message,
      });
    }
  }
);
