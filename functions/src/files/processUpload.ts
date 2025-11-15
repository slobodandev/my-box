/**
 * Process Upload Cloud Function
 * Handles file upload completion and creates database records with session loan context
 */

import { onRequest } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions/v2';
import { getStorage } from 'firebase-admin/storage';
import { onObjectFinalized } from 'firebase-functions/v2/storage';
import { executeGraphql } from '../dataconnect';
import { requireValidSession } from '../auth/validateSession';

/**
 * Request body for file upload processing
 */
interface ProcessUploadRequest {
  userId: string;
  storagePath: string;
  originalFilename: string;
  tags?: string[];
  description?: string;
}

/**
 * Response for file upload processing
 */
interface ProcessUploadResponse {
  success: boolean;
  message: string;
  fileId?: string;
  downloadUrl?: string;
  loanIds?: string[];
  error?: string;
}

/**
 * Process Upload Function
 *
 * This function:
 * 1. Validates the user's session
 * 2. Verifies the file exists in Firebase Storage
 * 3. Retrieves file metadata (size, content type)
 * 4. Creates a file record in Data Connect
 * 5. Auto-associates file with loans from session context
 * 6. Returns the file ID and download URL
 *
 * Called by frontend after successful file upload to Firebase Storage
 */
export const processUpload = onRequest(
  { cors: true, maxInstances: 10 },
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

      const body: ProcessUploadRequest = req.body;
      const {
        userId,
        storagePath,
        originalFilename,
        tags = [],
        description,
      } = body;

      // Validate input
      if (!userId || !storagePath || !originalFilename) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: userId, storagePath, originalFilename',
        } as ProcessUploadResponse);
        return;
      }

      // Verify user owns this file (userId in session matches request)
      if (session.userId !== userId) {
        logger.warn('User ID mismatch', {
          sessionUserId: session.userId,
          requestUserId: userId,
        });
        res.status(403).json({
          success: false,
          message: 'Unauthorized: User ID mismatch',
        } as ProcessUploadResponse);
        return;
      }

      logger.info('Processing file upload', {
        userId,
        storagePath,
        originalFilename,
      });

      // Get file metadata from Firebase Storage
      const bucket = getStorage().bucket();
      const file = bucket.file(storagePath);

      const [exists] = await file.exists();
      if (!exists) {
        logger.error('File not found in storage', { storagePath });
        res.status(404).json({
          success: false,
          message: 'File not found in storage',
        } as ProcessUploadResponse);
        return;
      }

      const [metadata] = await file.getMetadata();
      const fileSize = parseInt(String(metadata.size || '0'));
      const contentType = metadata.contentType || 'application/octet-stream';

      // Extract file extension
      const fileExtension = originalFilename.includes('.')
        ? originalFilename.split('.').pop()?.toLowerCase()
        : '';

      logger.info('File metadata retrieved', {
        fileSize,
        contentType,
        fileExtension,
      });

      // Create file record in Data Connect
      const createFileMutation = `
        mutation CreateFile(
          $userId: UUID!
          $originalFilename: String!
          $storagePath: String!
          $fileSize: Int!
          $mimeType: String
          $fileExtension: String
          $tags: String
          $description: String
        ) {
          file_insert(data: {
            userId: $userId
            originalFilename: $originalFilename
            storagePath: $storagePath
            fileSize: $fileSize
            mimeType: $mimeType
            fileExtension: $fileExtension
            tags: $tags
            description: $description
          })
        }
      `;

      const createFileResult = await executeGraphql({
        
        query: createFileMutation,
        variables: {
          userId,
          originalFilename,
          storagePath,
          fileSize,
          mimeType: contentType,
          fileExtension: fileExtension || null,
          tags: tags.length > 0 ? tags.join(',') : null,
          description: description || null,
        },
      });

      if (createFileResult.errors) {
        throw new Error(`Failed to create file record: ${JSON.stringify(createFileResult.errors)}`);
      }

      logger.info('File record created in Data Connect');

      // Get the created file ID
      const getFileQuery = `
        query GetUserFiles($userId: UUID!, $storagePath: String!) {
          files(
            where: {
              userId: { eq: $userId }
              storagePath: { eq: $storagePath }
            }
            limit: 1
            orderBy: { uploadedAt: DESC }
          ) {
            id
          }
        }
      `;

      const fileResult = await executeGraphql({
        
        query: getFileQuery,
        variables: { userId, storagePath },
      });

      if (!fileResult.data?.files || fileResult.data.files.length === 0) {
        throw new Error('Failed to retrieve created file ID');
      }

      const fileId = fileResult.data.files[0].id;

      logger.info('File ID retrieved', { fileId });

      // Get loan IDs from session and auto-associate
      const sessionLoanIds: string[] = session.loanIds ? JSON.parse(session.loanIds) : [];

      if (sessionLoanIds.length > 0) {
        logger.info({ message: 'Auto-associating file with session loans', loanIds: sessionLoanIds });

        // Associate file with each loan from session
        for (const loanId of sessionLoanIds) {
          const associateMutation = `
            mutation AssociateFileWithLoan(
              $fileId: UUID!
              $loanId: UUID!
              $associatedBy: UUID
            ) {
              fileLoanAssociation_insert(data: {
                fileId: $fileId
                loanId: $loanId
                associatedBy: $associatedBy
              })
            }
          `;

          await executeGraphql({
            
            query: associateMutation,
            variables: {
              fileId,
              loanId,
              associatedBy: userId,
            },
          });
        }

        logger.info('File associated with loans', {
          fileId,
          loanCount: sessionLoanIds.length,
        });
      }

      // Generate download URL (valid for 1 hour)
      const [downloadUrl] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + 60 * 60 * 1000, // 1 hour
      });

      // Update file record with download URL
      const updateFileMutation = `
        mutation UpdateFile(
          $id: UUID!
          $downloadUrl: String
        ) {
          file_update(
            id: $id
            data: {
              downloadUrl: $downloadUrl
            }
          )
        }
      `;

      await executeGraphql({
        
        query: updateFileMutation,
        variables: {
          id: fileId,
          downloadUrl,
        },
      });

      const response: ProcessUploadResponse = {
        success: true,
        message: 'File uploaded and processed successfully',
        fileId,
        downloadUrl,
        loanIds: sessionLoanIds,
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error('Error processing upload:', error);

      if (error.code === 'unauthenticated') {
        res.status(401).json({
          success: false,
          message: error.message,
        } as ProcessUploadResponse);
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Failed to process upload',
        error: error.message,
      } as ProcessUploadResponse);
    }
  }
);

/**
 * Storage trigger to automatically process uploads
 * Triggered when a file is finalized in Firebase Storage
 */
export const onFileUploaded = onObjectFinalized(
  { region: 'us-east1' },
  async (event) => {
    const object = event.data;
    const filePath = object.name;
    const contentType = object.contentType;
    const size = object.size;

    logger.info('File uploaded to storage', {
      filePath,
      contentType,
      size,
    });

    // Extract user ID from path
    // Expected format: users/{userId}/personal/{fileId}.{ext}
    // or: users/{userId}/loans/{loanId}/{fileId}.{ext}
    const pathParts = filePath?.split('/');
    if (!pathParts || pathParts[0] !== 'users') {
      logger.warn('File uploaded to unexpected path', { filePath });
      return;
    }

    const userId = pathParts[1];

    logger.info('Auto-processing file upload', {
      userId,
      filePath,
    });

    // TODO: Create file record in Data Connect automatically
    // This provides a backup mechanism in case frontend fails to call processUpload

    // Note: We might need additional metadata passed via custom metadata
    // to know originalFilename, loanIds, etc.
  }
);
