/**
 * File Service
 * Handles all file-related operations via Firebase Cloud Functions
 * Replaces n8n webhook-based implementation
 */

import { ref, uploadBytesResumable } from 'firebase/storage';
import { storage } from '@/config/firebase';
import type {
  File,
  FileListParams,
  FileListResponse,
} from '@/types';
import {
  processUpload,
  getUserFiles,
  softDeleteFile,
  type ListFilesRequest,
  type ProcessUploadRequest,
} from './dataconnect/filesService';

/**
 * File Service - Cloud Functions implementation
 */
class FileService {
  /**
   * Get list of files with filters and pagination
   */
  async getFiles(params: FileListParams): Promise<FileListResponse> {
    try {
      // Get session token from auth context
      const sessionToken = localStorage.getItem('mybox_session_token');
      if (!sessionToken) {
        throw new Error('Not authenticated');
      }

      const request: ListFilesRequest = {
        loanId: params.loanId,
        searchTerm: params.searchTerm,
        personalOnly: params.personalOnly,
        page: params.page,
        pageSize: params.pageSize,
      };

      const response = await getUserFiles(request, sessionToken);

      // Transform response to match FileListResponse interface
      return {
        files: response.files.map((file) => ({
          id: file.id,
          filename: file.originalFilename,
          originalFilename: file.originalFilename,
          size: file.fileSize,
          mimeType: file.mimeType || 'application/octet-stream',
          blobUrl: file.storagePath,
          uploadedAt: new Date(file.uploadedAt),
          uploadedBy: params.userId,
          loanIds: file.loanIds,
          tags: file.tags ? file.tags.split(',') : [],
        })),
        total: response.total,
        page: response.page,
        pageSize: response.pageSize,
        totalPages: response.totalPages,
      };
    } catch (error) {
      console.error('Error fetching files:', error);
      throw error;
    }
  }

  /**
   * Upload a file with optional loan associations
   * Uses Firebase Storage for upload, then calls processUpload Cloud Function
   */
  async uploadFile(
    file: globalThis.File,
    userId: string,
    loanIds?: string[],
    tags?: string[]
  ): Promise<File> {
    try {
      // Get session token
      const sessionToken = localStorage.getItem('mybox_session_token');
      if (!sessionToken) {
        throw new Error('Not authenticated');
      }

      // Generate unique file ID
      const fileId = crypto.randomUUID();
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';

      // Determine storage path based on loan association
      const storagePath = loanIds && loanIds.length > 0
        ? `users/${userId}/loans/${loanIds[0]}/${fileId}.${fileExtension}`
        : `users/${userId}/personal/${fileId}.${fileExtension}`;

      // Upload to Firebase Storage
      const storageRef = ref(storage, storagePath);
      const uploadTask = uploadBytesResumable(storageRef, file, {
        customMetadata: {
          userId,
          fileId,
          originalFilename: file.name,
        },
      });

      // Wait for upload to complete
      await new Promise<void>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`Upload progress: ${progress}%`);
          },
          (error) => {
            console.error('Upload error:', error);
            reject(error);
          },
          () => {
            resolve();
          }
        );
      });

      // Call processUpload Cloud Function
      const processRequest: ProcessUploadRequest = {
        userId,
        storagePath,
        originalFilename: file.name,
        tags,
      };

      const result = await processUpload(processRequest, sessionToken);

      // Return file metadata
      return {
        id: result.fileId,
        filename: file.name,
        originalFilename: file.name,
        size: file.size,
        mimeType: file.type,
        blobUrl: storagePath,
        uploadedAt: new Date(),
        uploadedBy: userId,
        loanIds: loanIds || [],
        tags: tags || [],
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  /**
   * Download a file by ID
   * Gets the file from Firebase Storage and returns it as a blob
   */
  async downloadFile(fileId: string, userId: string): Promise<Blob> {
    try {
      // First get the file metadata to get the storage path
      const files = await this.getFiles({
        userId,
        page: 1,
        pageSize: 100, // Get enough files to find the one we want
      });

      const file = files.files.find((f) => f.id === fileId);
      if (!file || !file.blobUrl) {
        throw new Error('File not found or storage path not available');
      }

      // Get download URL from Firebase Storage
      const { getDownloadURL } = await import('firebase/storage');
      const storageRef = ref(storage, file.blobUrl);
      const downloadUrl = await getDownloadURL(storageRef);

      // Fetch the file as a blob
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      return await response.blob();
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  }

  /**
   * Delete a file by ID (soft delete)
   */
  async deleteFile(fileId: string, _userId: string): Promise<void> {
    try {
      const sessionToken = localStorage.getItem('mybox_session_token');
      if (!sessionToken) {
        throw new Error('Not authenticated');
      }

      await softDeleteFile(fileId, sessionToken);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  /**
   * Get file by ID
   */
  async getFileById(fileId: string, userId: string): Promise<File> {
    try {
      const response = await this.getFiles({
        userId,
        page: 1,
        pageSize: 100,
      });

      const file = response.files.find((f) => f.id === fileId);
      if (!file) {
        throw new Error('File not found');
      }

      return file;
    } catch (error) {
      console.error('Error fetching file:', error);
      throw error;
    }
  }
}

export const fileService = new FileService();
