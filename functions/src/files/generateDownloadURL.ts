/**
 * Generate Download URL Cloud Function
 * Creates signed download URLs for files in Firebase Storage
 */

import * as functions from 'firebase-functions';
import { logger } from 'firebase-functions';
import { getStorage } from 'firebase-admin/storage';
import { requireValidSession } from '../auth/validateSession';

/**
 * Request body for download URL generation
 */
interface GenerateDownloadURLRequest {
  fileId: string;
  expiryMinutes?: number; // Optional, default: 60 minutes
}

/**
 * Response for download URL generation
 */
interface GenerateDownloadURLResponse {
  success: boolean;
  message: string;
  downloadUrl?: string;
  expiresAt?: string;
  error?: string;
}

/**
 * Generate Download URL Function
 *
 * This function:
 * 1. Validates the user's session
 * 2. Retrieves file metadata from Data Connect
 * 3. Verifies user has access to the file
 * 4. Generates a signed download URL
 * 5. Returns the URL with expiry time
 *
 * Access control:
 * - Users can only download their own files
 * - Users can download files associated with their loans
 * - Admins can download any file
 */
export const generateDownloadURL = functions.https.onRequest(
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
      // Validate session
      const session = await requireValidSession(req);
      logger.info('Session validated', { userId: session.userId });

      const body: GenerateDownloadURLRequest = req.body;
      const { fileId, expiryMinutes = 60 } = body;

      // Validate input
      if (!fileId) {
        res.status(400).json({
          success: false,
          message: 'Missing required field: fileId',
        } as GenerateDownloadURLResponse);
        return;
      }

      // Validate expiry (max 24 hours)
      const maxExpiryMinutes = 24 * 60;
      const actualExpiryMinutes = Math.min(expiryMinutes, maxExpiryMinutes);

      logger.info('Generating download URL', {
        fileId,
        userId: session.userId,
        expiryMinutes: actualExpiryMinutes,
      });

      // TODO: Get file metadata from Data Connect
      // const file = await dataConnect.query('GetFile', { id: fileId });

      // Mock file data for development
      const file = {
        id: fileId,
        userId: session.userId,
        storagePath: `users/${session.userId}/personal/test.pdf`,
        originalFilename: 'test.pdf',
        isDeleted: false,
      };

      // Check if file exists
      if (!file) {
        logger.warn('File not found', { fileId });
        res.status(404).json({
          success: false,
          message: 'File not found',
        } as GenerateDownloadURLResponse);
        return;
      }

      // Check if file is deleted
      if (file.isDeleted) {
        logger.warn('File is deleted', { fileId });
        res.status(410).json({
          success: false,
          message: 'File has been deleted',
        } as GenerateDownloadURLResponse);
        return;
      }

      // Check access permissions
      const isOwner = file.userId === session.userId;
      const isAdmin = session.role === 'admin' || session.role === 'loan_officer';

      // TODO: Check if file is associated with user's loans
      // const associations = await dataConnect.query('GetFileAssociations', {
      //   fileId,
      // });
      // const hasLoanAccess = session.loanIds?.some(loanId =>
      //   associations.some(assoc => assoc.loanId === loanId)
      // );

      const hasLoanAccess = false; // Mock for now

      if (!isOwner && !isAdmin && !hasLoanAccess) {
        logger.warn('Access denied to file', {
          fileId,
          userId: session.userId,
        });
        res.status(403).json({
          success: false,
          message: 'Access denied: You do not have permission to download this file',
        } as GenerateDownloadURLResponse);
        return;
      }

      // Generate signed download URL
      const bucket = getStorage().bucket();
      const storageFile = bucket.file(file.storagePath);

      // Check if file exists in storage
      const [exists] = await storageFile.exists();
      if (!exists) {
        logger.error('File not found in storage', {
          fileId,
          storagePath: file.storagePath,
        });
        res.status(404).json({
          success: false,
          message: 'File not found in storage',
        } as GenerateDownloadURLResponse);
        return;
      }

      const expiresAt = new Date(Date.now() + actualExpiryMinutes * 60 * 1000);

      const [downloadUrl] = await storageFile.getSignedUrl({
        action: 'read',
        expires: expiresAt,
        responseDisposition: `attachment; filename="${file.originalFilename}"`,
      });

      logger.info('Download URL generated', {
        fileId,
        userId: session.userId,
        expiresAt: expiresAt.toISOString(),
      });

      // TODO: Update file's last accessed time
      // await dataConnect.mutation('UpdateFile', {
      //   id: fileId,
      //   downloadUrl, // Optionally cache the URL
      // });

      // TODO: Log download event in audit log (optional)
      // await dataConnect.mutation('LogAuthEvent', {
      //   userId: session.userId,
      //   eventType: 'file_download',
      //   success: true,
      //   requestPayload: JSON.stringify({ fileId }),
      // });

      const response: GenerateDownloadURLResponse = {
        success: true,
        message: 'Download URL generated successfully',
        downloadUrl,
        expiresAt: expiresAt.toISOString(),
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error('Error generating download URL:', error);

      if (error.code === 'unauthenticated') {
        res.status(401).json({
          success: false,
          message: error.message,
        } as GenerateDownloadURLResponse);
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Failed to generate download URL',
        error: error.message,
      } as GenerateDownloadURLResponse);
    }
  }
);

/**
 * Batch Generate Download URLs
 * Generate download URLs for multiple files at once
 */
export const batchGenerateDownloadURLs = functions.https.onRequest(
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
      // Validate session
      const session = await requireValidSession(req);

      const { fileIds } = req.body;
      // const expiryMinutes = req.body.expiryMinutes || 60; // TODO: Use for batch expiry

      if (!fileIds || !Array.isArray(fileIds)) {
        res.status(400).json({
          success: false,
          message: 'Missing or invalid field: fileIds (must be array)',
        });
        return;
      }

      // Limit batch size
      if (fileIds.length > 50) {
        res.status(400).json({
          success: false,
          message: 'Batch size too large (max 50 files)',
        });
        return;
      }

      logger.info('Generating batch download URLs', {
        userId: session.userId,
        fileCount: fileIds.length,
      });

      const results = await Promise.allSettled(
        fileIds.map(async (fileId: string) => {
          // TODO: Implement individual download URL generation
          // This is a simplified version
          return {
            fileId,
            success: true,
            downloadUrl: `https://example.com/download/${fileId}`,
          };
        })
      );

      const response = {
        success: true,
        message: `Generated ${results.length} download URLs`,
        results: results.map((result, index) => {
          if (result.status === 'fulfilled') {
            return result.value;
          } else {
            return {
              fileId: fileIds[index],
              success: false,
              error: result.reason.message,
            };
          }
        }),
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error('Error in batch download URL generation:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate download URLs',
        error: error.message,
      });
    }
  }
);
