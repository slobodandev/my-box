/**
 * Crypto Utilities for Firebase Cloud Functions
 * Handles hashing, random generation, and cryptographic operations
 */

import * as crypto from 'crypto';
import { logger } from 'firebase-functions';

/**
 * Hash a string using SHA-256
 * Used for hashing emails and sensitive data
 */
export function hashSHA256(input: string): string {
  try {
    return crypto
      .createHash('sha256')
      .update(input)
      .digest('hex');
  } catch (error) {
    logger.error('Error hashing with SHA-256:', error);
    throw new Error('Failed to hash data');
  }
}

/**
 * Hash an email address
 * Used for storing email hashes in the database
 */
export function hashEmail(email: string): string {
  const normalizedEmail = email.toLowerCase().trim();
  return hashSHA256(normalizedEmail);
}

/**
 * Generate a cryptographically secure random string
 * @param length - Length of the string (default: 32)
 * @returns Hexadecimal string
 */
export function generateRandomString(length: number = 32): string {
  try {
    const bytes = crypto.randomBytes(Math.ceil(length / 2));
    return bytes.toString('hex').slice(0, length);
  } catch (error) {
    logger.error('Error generating random string:', error);
    throw new Error('Failed to generate random string');
  }
}

/**
 * Generate a UUID v4
 */
export function generateUUID(): string {
  try {
    return crypto.randomUUID();
  } catch (error) {
    logger.error('Error generating UUID:', error);
    throw new Error('Failed to generate UUID');
  }
}

/**
 * Generate a numeric verification code
 * @param length - Number of digits (default: 6)
 * @returns String of digits
 */
export function generateVerificationCode(length: number = 6): string {
  try {
    const max = Math.pow(10, length) - 1;
    const min = Math.pow(10, length - 1);
    const code = Math.floor(min + crypto.randomInt(max - min + 1));
    return code.toString().padStart(length, '0');
  } catch (error) {
    logger.error('Error generating verification code:', error);
    throw new Error('Failed to generate verification code');
  }
}

/**
 * Hash a verification code
 * Used for storing verification codes securely
 */
export function hashVerificationCode(code: string): string {
  return hashSHA256(code);
}

/**
 * Verify a verification code against a hash
 */
export function verifyVerificationCode(code: string, hash: string): boolean {
  try {
    const codeHash = hashVerificationCode(code);
    return timingSafeEqual(codeHash, hash);
  } catch (error) {
    logger.error('Error verifying verification code:', error);
    return false;
  }
}

/**
 * Timing-safe string comparison
 * Prevents timing attacks
 */
export function timingSafeEqual(a: string, b: string): boolean {
  try {
    if (a.length !== b.length) {
      return false;
    }

    const bufferA = Buffer.from(a);
    const bufferB = Buffer.from(b);

    return crypto.timingSafeEqual(bufferA, bufferB);
  } catch (error) {
    // If buffers are different lengths, timingSafeEqual throws
    return false;
  }
}

/**
 * Generate a session ID
 * Format: sess_<random_string>
 */
export function generateSessionId(): string {
  return `sess_${generateRandomString(32)}`;
}

/**
 * Generate a magic token
 * Format: mag_<random_string>
 */
export function generateMagicToken(): string {
  return `mag_${generateRandomString(48)}`;
}

/**
 * Generate a session token identifier
 * Format: tok_<random_string>
 */
export function generateSessionToken(): string {
  return `tok_${generateRandomString(64)}`;
}

/**
 * Sanitize email for storage
 * Lowercase and trim whitespace
 */
export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Mask an email for display
 * Example: john.doe@example.com -> j***@example.com
 */
export function maskEmail(email: string): string {
  const [localPart, domain] = email.split('@');
  if (!domain) return email;

  const maskedLocal = localPart.charAt(0) + '***';
  return `${maskedLocal}@${domain}`;
}

/**
 * Generate a secure random token for API keys or secrets
 * @param length - Length in bytes (default: 32 = 256 bits)
 * @returns Base64url encoded string
 */
export function generateSecureToken(length: number = 32): string {
  try {
    const bytes = crypto.randomBytes(length);
    return bytes
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  } catch (error) {
    logger.error('Error generating secure token:', error);
    throw new Error('Failed to generate secure token');
  }
}

/**
 * Hash a password using PBKDF2
 * NOTE: For user passwords, consider using Firebase Auth instead
 * This is for internal service passwords or API keys
 */
export function hashPassword(password: string, salt?: string): {
  hash: string;
  salt: string;
} {
  try {
    const useSalt = salt || crypto.randomBytes(16).toString('hex');
    const hash = crypto
      .pbkdf2Sync(password, useSalt, 100000, 64, 'sha512')
      .toString('hex');

    return {
      hash,
      salt: useSalt,
    };
  } catch (error) {
    logger.error('Error hashing password:', error);
    throw new Error('Failed to hash password');
  }
}

/**
 * Verify a password against a hash
 */
export function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const { hash: computedHash } = hashPassword(password, salt);
    return timingSafeEqual(computedHash, hash);
  } catch (error) {
    logger.error('Error verifying password:', error);
    return false;
  }
}

/**
 * Create a fingerprint from request metadata
 * Used for tracking sessions and detecting suspicious activity
 */
export function createFingerprint(
  ipAddress: string,
  userAgent: string
): string {
  const data = `${ipAddress}|${userAgent}`;
  return hashSHA256(data);
}

/**
 * Generate a rate limit key
 * Used for rate limiting tracking
 */
export function generateRateLimitKey(
  identifier: string,
  actionType: string
): string {
  return `rl:${actionType}:${identifier}`;
}

/**
 * Encrypt data using AES-256-GCM
 * @param data - Data to encrypt
 * @param key - Encryption key (32 bytes for AES-256)
 * @returns Encrypted data with IV and auth tag
 */
export function encrypt(data: string, key: string): {
  encrypted: string;
  iv: string;
  authTag: string;
} {
  try {
    // Ensure key is 32 bytes for AES-256
    const keyBuffer = crypto.createHash('sha256').update(key).digest();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', keyBuffer, iv);

    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
    };
  } catch (error) {
    logger.error('Error encrypting data:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt data using AES-256-GCM
 * @param encrypted - Encrypted data object from encrypt()
 * @param key - Decryption key (same as encryption key)
 * @returns Decrypted data
 */
export function decrypt(
  encrypted: { encrypted: string; iv: string; authTag: string },
  key: string
): string {
  try {
    const keyBuffer = crypto.createHash('sha256').update(key).digest();
    const iv = Buffer.from(encrypted.iv, 'hex');
    const authTag = Buffer.from(encrypted.authTag, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-gcm', keyBuffer, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    logger.error('Error decrypting data:', error);
    throw new Error('Failed to decrypt data');
  }
}
