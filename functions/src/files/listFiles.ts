/**
 * List Files Cloud Function
 * Get files for authenticated user with filtering, pagination, and sorting
 */

import { onRequest } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions/v2';
import { executeGraphql } from '../dataconnect';
import { requireValidSession } from '../auth/validateSession';

/**
 * Request body interface
 */
interface ListFilesRequest {
  loanId?: string;
  searchTerm?: string;
  personalOnly?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: 'filename' | 'size' | 'uploadedAt';
  sortOrder?: 'asc' | 'desc';
}

/**
 * File metadata interface
 */
interface FileMetadata {
  id: string;
  originalFilename: string;
  storagePath: string;
  fileSize: number;
  mimeType: string;
  fileExtension: string;
  uploadedAt: string;
  tags?: string;
  description?: string;
  downloadUrl?: string;
  loanIds: string[];
}

/**
 * Response interface
 */
interface ListFilesResponse {
  success: boolean;
  files: FileMetadata[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  message?: string;
}

/**
 * List Files Cloud Function
 *
 * POST /listFiles
 * Headers: Authorization: Bearer <session-token>
 * Body: { loanId?, searchTerm?, personalOnly?, page?, pageSize?, sortBy?, sortOrder? }
 */
export const listFiles = onRequest(
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
      const body = request.body as ListFilesRequest;
      const {
        loanId,
        searchTerm,
        personalOnly = false,
        page = 1,
        pageSize = 20,
        sortBy = 'uploadedAt',
        sortOrder = 'desc',
      } = body;

      // Get loanIds from session
      const sessionLoanIds: string[] = session.loanIds ? JSON.parse(session.loanIds) : [];
      logger.info({ message: 'Session loan IDs', loanIds: sessionLoanIds });

      // Calculate offset for pagination
      const offset = (page - 1) * pageSize;

      // Build GraphQL query
      let query = `
        query ListUserFiles(
          $userId: UUID!
          $limit: Int
          $offset: Int
        ) {
          files(
            where: {
              userId: { eq: $userId }
              isDeleted: { eq: false }
            }
            limit: $limit
            offset: $offset
            orderBy: { ${sortBy === 'filename' ? 'originalFilename' : sortBy === 'size' ? 'fileSize' : 'uploadedAt'}: ${sortOrder.toUpperCase()} }
          ) {
            id
            originalFilename
            storagePath
            fileSize
            mimeType
            fileExtension
            uploadedAt
            tags
            description
            downloadUrl
          }
        }
      `;

      const variables: any = {
        userId: session.userId,
        limit: pageSize,
        offset,
      };

      // Execute query
      const result = await executeGraphql({
        
        query,
        variables,
      });

      logger.info('Query result:', result);

      if (result.errors) {
        throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
      }

      const files = result.data?.files || [];

      // Get file-loan associations
      const filesWithLoans: FileMetadata[] = await Promise.all(
        files.map(async (file: any) => {
          const associationsQuery = `
            query GetFileAssociations($fileId: UUID!) {
              fileLoanAssociations(where: { fileId: { eq: $fileId } }) {
                loanId
              }
            }
          `;

          const assocResult = await executeGraphql({
            
            query: associationsQuery,
            variables: { fileId: file.id },
          });

          const loanIds = assocResult.data?.fileLoanAssociations?.map((a: any) => a.loanId) || [];

          return {
            ...file,
            loanIds,
          };
        })
      );

      // Apply filters
      let filteredFiles = filesWithLoans;

      // Filter by loan ID (either specific loan or session loans)
      if (loanId) {
        filteredFiles = filteredFiles.filter((file) => file.loanIds.includes(loanId));
      } else if (sessionLoanIds.length > 0 && !personalOnly) {
        // Show files associated with session loans
        filteredFiles = filteredFiles.filter((file) =>
          file.loanIds.some((id) => sessionLoanIds.includes(id))
        );
      }

      // Filter personal files only
      if (personalOnly) {
        filteredFiles = filteredFiles.filter((file) => file.loanIds.length === 0);
      }

      // Search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filteredFiles = filteredFiles.filter(
          (file) =>
            file.originalFilename.toLowerCase().includes(term) ||
            file.description?.toLowerCase().includes(term) ||
            file.tags?.toLowerCase().includes(term)
        );
      }

      const total = filteredFiles.length;
      const totalPages = Math.ceil(total / pageSize);

      // Apply pagination to filtered results
      const paginatedFiles = filteredFiles.slice(offset, offset + pageSize);

      const responseData: ListFilesResponse = {
        success: true,
        files: paginatedFiles,
        total,
        page,
        pageSize,
        totalPages,
      };

      response.status(200).json(responseData);
    } catch (error: any) {
      logger.error('Error listing files:', error);

      if (error.code === 'unauthenticated') {
        response.status(401).json({
          success: false,
          message: error.message,
        });
        return;
      }

      response.status(500).json({
        success: false,
        message: 'Failed to list files',
        error: error.message,
      });
    }
  }
);
