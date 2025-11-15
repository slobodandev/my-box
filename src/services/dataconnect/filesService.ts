/**
 * Files Service
 * Handles file-related operations with Cloud Functions and Data Connect
 */

import axios from 'axios';
import { CloudFunctionUrls } from '@/config/cloudFunctions';

/**
 * Process uploaded file
 */
export interface ProcessUploadRequest {
  userId: string;
  storagePath: string;
  originalFilename: string;
  loanIds?: string[];
  tags?: string[];
  description?: string;
}

export interface ProcessUploadResponse {
  success: boolean;
  fileId: string;
  downloadUrl: string;
  message: string;
}

/**
 * Generate download URL
 */
export interface GenerateDownloadURLRequest {
  fileId: string;
  expiryMinutes?: number;
}

export interface GenerateDownloadURLResponse {
  success: boolean;
  downloadUrl: string;
  expiresAt: string;
  message: string;
}

/**
 * File metadata from Data Connect
 */
export interface FileMetadata {
  id: string;
  userId: string;
  originalFilename: string;
  storagePath: string;
  fileSize: number;
  mimeType?: string;
  fileExtension?: string;
  uploadedAt: string;
  updatedAt?: string;
  tags?: string;
  description?: string;
  downloadUrl?: string;
  isDeleted: boolean;
  deletedAt?: string;
  deletedBy?: string;
}

/**
 * Process file upload after Firebase Storage upload completes
 * Creates file metadata record in Data Connect
 */
export const processUpload = async (
  request: ProcessUploadRequest,
  sessionToken: string
): Promise<ProcessUploadResponse> => {
  try {
    const response = await axios.post(
      CloudFunctionUrls.processUpload(),
      request,
      {
        headers: {
          Authorization: `Bearer ${sessionToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error processing upload:', error);
    throw new Error(error.response?.data?.message || 'Failed to process upload');
  }
};

/**
 * Generate a signed download URL for a file
 */
export const generateDownloadURL = async (
  request: GenerateDownloadURLRequest,
  sessionToken: string
): Promise<GenerateDownloadURLResponse> => {
  try {
    const response = await axios.post(
      CloudFunctionUrls.generateDownloadUrl(),
      request,
      {
        headers: {
          Authorization: `Bearer ${sessionToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error generating download URL:', error);
    throw new Error(error.response?.data?.message || 'Failed to generate download URL');
  }
};

/**
 * Batch generate download URLs for multiple files
 */
export const batchGenerateDownloadURLs = async (
  fileIds: string[],
  sessionToken: string
): Promise<Array<{ fileId: string; success: boolean; downloadUrl?: string; error?: string }>> => {
  try {
    const response = await axios.post(
      CloudFunctionUrls.batchGenerateDownloadUrls(),
      { fileIds },
      {
        headers: {
          Authorization: `Bearer ${sessionToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data.results;
  } catch (error: any) {
    console.error('Error batch generating download URLs:', error);
    throw new Error(error.response?.data?.message || 'Failed to batch generate download URLs');
  }
};

/**
 * List files request interface
 */
export interface ListFilesRequest {
  loanId?: string;
  searchTerm?: string;
  personalOnly?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: 'filename' | 'size' | 'uploadedAt';
  sortOrder?: 'asc' | 'desc';
}

/**
 * List files response interface
 */
export interface ListFilesResponse {
  success: boolean;
  files: Array<{
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
  }>;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  message?: string;
}

/**
 * Get user files from Cloud Function
 */
export const getUserFiles = async (
  request: ListFilesRequest,
  sessionToken: string
): Promise<ListFilesResponse> => {
  try {
    const response = await axios.post(
      CloudFunctionUrls.listFiles(),
      request,
      {
        headers: {
          Authorization: `Bearer ${sessionToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error getting user files:', error);
    throw new Error(error.response?.data?.message || 'Failed to get user files');
  }
};

/**
 * Get files associated with a loan
 * TODO: Implement this when Data Connect SDK is integrated
 */
export const getLoanFiles = async (
  _loanId: string,
  _sessionToken: string
): Promise<FileMetadata[]> => {
  // TODO: Call Data Connect query through backend
  console.log('getLoanFiles called - not yet implemented');
  return [];
};

/**
 * Delete file request interface
 */
export interface DeleteFileRequest {
  fileId: string;
}

/**
 * Delete file response interface
 */
export interface DeleteFileResponse {
  success: boolean;
  message: string;
  fileId?: string;
}

/**
 * Soft delete a file
 * Marks file as deleted in Data Connect (doesn't delete from storage immediately)
 */
export const softDeleteFile = async (
  fileId: string,
  sessionToken: string
): Promise<DeleteFileResponse> => {
  try {
    const response = await axios.post(
      CloudFunctionUrls.deleteFile(),
      { fileId },
      {
        headers: {
          Authorization: `Bearer ${sessionToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error deleting file:', error);
    throw new Error(error.response?.data?.message || 'Failed to delete file');
  }
};

/**
 * Update file metadata
 */
export const updateFileMetadata = async (
  _fileId: string,
  _updates: {
    tags?: string;
    description?: string;
  },
  _sessionToken: string
): Promise<void> => {
  // TODO: Call Data Connect mutation through backend
  console.log('updateFileMetadata called - not yet implemented');
};

/**
 * Associate a file with one or more loans
 */
export const associateFileWithLoans = async (
  _fileId: string,
  _loanIds: string[],
  _sessionToken: string
): Promise<void> => {
  // TODO: Call Data Connect mutation through backend
  console.log('associateFileWithLoans called - not yet implemented');
};

/**
 * Remove file association from a loan
 */
export const removeFileFromLoan = async (
  _fileId: string,
  _loanId: string,
  _sessionToken: string
): Promise<void> => {
  // TODO: Call Data Connect mutation through backend
  console.log('removeFileFromLoan called - not yet implemented');
};

export default {
  processUpload,
  generateDownloadURL,
  batchGenerateDownloadURLs,
  getUserFiles,
  getLoanFiles,
  softDeleteFile,
  updateFileMetadata,
  associateFileWithLoans,
  removeFileFromLoan,
};
