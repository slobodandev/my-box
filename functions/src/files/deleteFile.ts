/**
 * Delete File Cloud Function
 * Soft delete files from the system
 */

import { onRequest } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions/v2';
import { executeGraphql } from '../dataconnect';
import { requireValidSession } from '../auth/validateSession';

/**
 * Request body interface
 */
interface DeleteFileRequest {
  fileId: string;
}

/**
 * Response interface
 */
interface DeleteFileResponse {
  success: boolean;
  message: string;
  fileId?: string;
}

/**
 * Delete File Cloud Function
 *
 * POST /deleteFile
 * Headers: Authorization: Bearer <session-token>
 * Body: { fileId }
 */
export const deleteFile = onRequest(
  { cors: true, maxInstances: 10 },
  async (request, response) => {
    // CORS headers
    response.set('Access-Control-Allow-Origin', '*');
    response.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

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
      // Validate session
      const session = await requireValidSession(request);
      logger.info('Session validated', { userId: session.userId });

      // Parse request body
      const body = request.body as DeleteFileRequest;
      const { fileId } = body;

      // Validate input
      if (!fileId) {
        response.status(400).json({
          success: false,
          message: 'fileId is required',
        });
        return;
      }

      logger.info('Deleting file', { fileId, userId: session.userId });

      // Get file to verify ownership
      const getFileQuery = `
        query GetFile($id: UUID!) {
          file(id: $id) {
            id
            userId
            originalFilename
            storagePath
            isDeleted
          }
        }
      `;

      const fileResult = await executeGraphql({
        
        query: getFileQuery,
        variables: { id: fileId },
      });

      if (!fileResult.data?.file) {
        logger.warn('File not found', { fileId });
        response.status(404).json({
          success: false,
          message: 'File not found',
        });
        return;
      }

      const file = fileResult.data.file;

      // Check if already deleted
      if (file.isDeleted) {
        response.status(400).json({
          success: false,
          message: 'File already deleted',
        });
        return;
      }

      // Verify ownership
      if (file.userId !== session.userId) {
        logger.warn('Unauthorized delete attempt', {
          fileId,
          fileUserId: file.userId,
          sessionUserId: session.userId,
        });
        response.status(403).json({
          success: false,
          message: 'Unauthorized: You do not own this file',
        });
        return;
      }

      // Soft delete the file
      const softDeleteMutation = `
        mutation SoftDeleteFile(
          $id: UUID!
          $deletedBy: UUID
          $deletedAt: Timestamp!
        ) {
          file_update(
            id: $id
            data: {
              isDeleted: true
              deletedAt: $deletedAt
              deletedBy: $deletedBy
            }
          )
        }
      `;

      await executeGraphql({
        
        query: softDeleteMutation,
        variables: {
          id: fileId,
          deletedBy: session.userId,
          deletedAt: new Date().toISOString(),
        },
      });

      logger.info('File soft deleted successfully', { fileId, filename: file.originalFilename });

      // Note: The actual file in Firebase Storage is not deleted immediately
      // It will be cleaned up by the scheduled cleanup function after a grace period

      const responseData: DeleteFileResponse = {
        success: true,
        message: `File "${file.originalFilename}" deleted successfully`,
        fileId,
      };

      response.status(200).json(responseData);
    } catch (error: any) {
      logger.error('Error deleting file:', error);

      if (error.code === 'unauthenticated') {
        response.status(401).json({
          success: false,
          message: error.message,
        });
        return;
      }

      response.status(500).json({
        success: false,
        message: 'Failed to delete file',
        error: error.message,
      });
    }
  }
);
