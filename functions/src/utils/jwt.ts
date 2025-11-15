/**
 * JWT Utilities for Firebase Cloud Functions
 * Handles JWT token creation, verification, and decoding
 */

import * as jwt from 'jsonwebtoken';
import { logger } from 'firebase-functions';

// JWT configuration from environment variables
const JWT_SECRET = process.env.JWT_SECRET || '';
const JWT_ISSUER = 'mybox-app';
const JWT_AUDIENCE = 'mybox-users';

// Token expiration times
const MAGIC_LINK_EXPIRY = '15m'; // 15 minutes
const SESSION_TOKEN_EXPIRY = '7d'; // 7 days
// const VERIFICATION_CODE_EXPIRY = '10m'; // 10 minutes // TODO: Use if needed for verification

/**
 * Payload for Magic Link JWT
 */
export interface MagicLinkPayload {
  sessionId: string;
  email: string;
  userId: string;
  loanIds?: string[];
  type: 'magic_link';
}

/**
 * Payload for Session JWT
 */
export interface SessionTokenPayload {
  sessionId: string;
  userId: string;
  email: string;
  role: string;
  loanIds?: string; // JSON string of loan IDs array
  type: 'session';
}

/**
 * Decoded JWT with standard claims
 */
export interface DecodedToken<T = any> {
  payload: T;
  iat: number;
  exp: number;
  iss: string;
  aud: string;
}

/**
 * Generate a Magic Link JWT
 * Used for email verification links
 */
export function generateMagicLinkToken(payload: Omit<MagicLinkPayload, 'type'>): string {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set');
  }

  const tokenPayload: MagicLinkPayload = {
    ...payload,
    type: 'magic_link',
  };

  try {
    return jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: MAGIC_LINK_EXPIRY,
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });
  } catch (error) {
    logger.error('Error generating magic link token:', error);
    throw new Error('Failed to generate magic link token');
  }
}

/**
 * Generate a Session JWT
 * Used for authenticated API requests
 */
export function generateSessionToken(
  payload: Omit<SessionTokenPayload, 'type'>
): string {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set');
  }

  const tokenPayload: SessionTokenPayload = {
    ...payload,
    type: 'session',
  };

  try {
    return jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: SESSION_TOKEN_EXPIRY,
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });
  } catch (error) {
    logger.error('Error generating session token:', error);
    throw new Error('Failed to generate session token');
  }
}

/**
 * Verify and decode a JWT token
 * Returns the decoded payload if valid
 */
export function verifyToken<T = any>(token: string): DecodedToken<T> {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    }) as any;

    return {
      payload: decoded as T,
      iat: decoded.iat,
      exp: decoded.exp,
      iss: decoded.iss,
      aud: decoded.aud,
    };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      logger.warn('Token expired:', error.message);
      throw new Error('Token has expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      logger.warn('Invalid token:', error.message);
      throw new Error('Invalid token');
    } else {
      logger.error('Token verification error:', error);
      throw new Error('Token verification failed');
    }
  }
}

/**
 * Decode a JWT token without verification
 * WARNING: Only use for non-security-critical operations
 */
export function decodeToken<T = any>(token: string): T | null {
  try {
    const decoded = jwt.decode(token);
    return decoded as T;
  } catch (error) {
    logger.error('Token decode error:', error);
    return null;
  }
}

/**
 * Verify a Magic Link token
 */
export function verifyMagicLinkToken(token: string): DecodedToken<MagicLinkPayload> {
  const decoded = verifyToken<MagicLinkPayload>(token);

  if (decoded.payload.type !== 'magic_link') {
    throw new Error('Invalid token type: expected magic_link');
  }

  return decoded;
}

/**
 * Verify a Session token
 */
export function verifySessionToken(token: string): DecodedToken<SessionTokenPayload> {
  const decoded = verifyToken<SessionTokenPayload>(token);

  if (decoded.payload.type !== 'session') {
    throw new Error('Invalid token type: expected session');
  }

  return decoded;
}

/**
 * Extract JWT from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | undefined): string {
  if (!authHeader) {
    throw new Error('Authorization header is missing');
  }

  if (!authHeader.startsWith('Bearer ')) {
    throw new Error('Invalid authorization header format');
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  if (!token) {
    throw new Error('Token is empty');
  }

  return token;
}

/**
 * Check if a token is expired
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = decodeToken<any>(token);
    if (!decoded || !decoded.exp) {
      return true;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
}

/**
 * Get token expiration time in seconds
 */
export function getTokenExpiry(token: string): number | null {
  try {
    const decoded = decodeToken<any>(token);
    return decoded?.exp || null;
  } catch (error) {
    return null;
  }
}

/**
 * Get time until token expiration in milliseconds
 */
export function getTimeUntilExpiry(token: string): number | null {
  try {
    const expiry = getTokenExpiry(token);
    if (!expiry) return null;

    const currentTime = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = (expiry - currentTime) * 1000;

    return timeUntilExpiry > 0 ? timeUntilExpiry : 0;
  } catch (error) {
    return null;
  }
}

/**
 * Refresh a session token (create a new one with updated expiry)
 */
export function refreshSessionToken(
  oldToken: string
): string {
  try {
    const decoded = verifySessionToken(oldToken);

    // Create a new token with the same payload but fresh expiry
    return generateSessionToken({
      sessionId: decoded.payload.sessionId,
      userId: decoded.payload.userId,
      email: decoded.payload.email,
      role: decoded.payload.role,
      loanIds: decoded.payload.loanIds,
    });
  } catch (error) {
    logger.error('Error refreshing token:', error);
    throw new Error('Failed to refresh token');
  }
}
