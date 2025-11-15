/**
 * Firebase Cloud Functions for MyBox
 * Loan file management system
 */

import { setGlobalOptions } from 'firebase-functions';
import { initializeApp } from 'firebase-admin/app';

// Initialize Firebase Admin
initializeApp();

// Set global options for cost control
// Maximum 10 concurrent instances per function
setGlobalOptions({ maxInstances: 10 });

// ============================================================================
// AUTH FUNCTIONS
// ============================================================================

export {
  generateAuthLink,
} from './auth/generateAuthLink';

export {
  verifyMagicLink,
} from './auth/verifyMagicLink';

export {
  sendVerificationCode,
} from './auth/sendVerificationCode';

export {
  verifyCode,
} from './auth/verifyCode';

export {
  validateSession,
} from './auth/validateSession';

// ============================================================================
// FILE FUNCTIONS
// ============================================================================

export {
  processUpload,
  onFileUploaded,
} from './files/processUpload';

export {
  generateDownloadURL,
  batchGenerateDownloadURLs,
} from './files/generateDownloadURL';

export {
  listFiles,
} from './files/listFiles';

export {
  deleteFile,
} from './files/deleteFile';

// NOTE: Scheduled functions require Cloud Scheduler API to be enabled
// Uncomment after enabling Cloud Scheduler in Google Cloud Console:
// https://console.cloud.google.com/apis/library/cloudscheduler.googleapis.com
//
// export {
//   cleanupDeletedFiles,
//   cleanupExpiredSessions,
//   cleanupExpiredVerificationCodes,
//   triggerCleanupDeletedFiles,
// } from './files/cleanupDeleted';

// ============================================================================
// HEALTH CHECK
// ============================================================================

import { onRequest } from 'firebase-functions/https';
import * as logger from 'firebase-functions/logger';

export const healthCheck = onRequest((request, response) => {
  logger.info('Health check called');
  response.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'mybox-cloud-functions',
    version: '1.0.0',
  });
});
