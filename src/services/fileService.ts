/**
 * File Service
 * Handles file operations with Data Connect and Firebase Storage
 */

import { getDataConnect, connectDataConnectEmulator, mutationRef, executeMutation, queryRef, executeQuery } from '@firebase/data-connect';
import { app, storage } from '@/config/firebase';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { getFile as getFileQuery } from '../../dataconnect/src/__generated/dataconnect';

// Data Connect configuration
const connectorConfig = {
  connector: 'mybox-connector',
  service: 'mybox-dataconnect',
  location: 'us-central1',
};

const dataConnect = getDataConnect(app, connectorConfig);

// Connect to emulator if enabled
const useEmulators = import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true';
if (useEmulators) {
  try {
    connectDataConnectEmulator(dataConnect, '127.0.0.1', 9399);
    console.log('✅ FileService connected to Data Connect emulator');
  } catch (error) {
    console.warn('⚠️ FileService Data Connect emulator connection failed:', error);
  }
}

export interface FileMetadata {
  id?: string;
  userId: string;
  loanId?: string; // Optional loan association
  originalFilename: string;
  storagePath: string;
  fileSize: number;
  mimeType: string;
  fileExtension: string;
  downloadUrl?: string;
  tags?: string;
  description?: string;
}

export interface UploadResult {
  fileId: string;
  downloadUrl: string;
  storagePath: string;
}

/**
 * Create file metadata in Data Connect
 */
export async function createFileMetadata(metadata: FileMetadata): Promise<{ fileId: string }> {
  try {
    const variables = {
      userId: metadata.userId,
      loanId: metadata.loanId || null, // Optional loan association
      originalFilename: metadata.originalFilename,
      storagePath: metadata.storagePath,
      fileSize: metadata.fileSize,
      mimeType: metadata.mimeType || 'application/octet-stream',
      fileExtension: metadata.fileExtension,
      downloadUrl: metadata.downloadUrl || null,
      tags: metadata.tags || null,
      description: metadata.description || null,
    };

    const ref = mutationRef(dataConnect, 'CreateFile', variables);
    const result = await executeMutation(ref);

    console.log('File metadata created:', result);

    // Extract file ID from result
    // The mutation returns the inserted file data
    const fileId = (result.data as any)?.file_insert?.id || '';

    return { fileId };
  } catch (error) {
    console.error('Error creating file metadata:', error);
    throw error;
  }
}

/**
 * Update file download URL
 */
export async function updateFileDownloadUrl(fileId: string, downloadUrl: string): Promise<void> {
  try {
    const variables = {
      id: fileId,
      downloadUrl,
      tags: null,
      description: null,
    };

    const ref = mutationRef(dataConnect, 'UpdateFile', variables);
    await executeMutation(ref);

    console.log('File download URL updated:', fileId);
  } catch (error) {
    console.error('Error updating file download URL:', error);
    throw error;
  }
}

/**
 * Get user files
 */
export async function getUserFiles(userId: string, includeDeleted: boolean = false): Promise<any[]> {
  try {
    const variables = {
      userId,
      includeDeleted,
    };

    const ref = queryRef(dataConnect, 'GetUserFiles', variables);
    const result = await executeQuery(ref);

    return (result.data as any)?.files || [];
  } catch (error) {
    console.error('Error getting user files:', error);
    throw error;
  }
}

/**
 * Get file metadata by ID
 */
export async function getFileMetadata(fileId: string): Promise<FileMetadata | null> {
  try {
    const result = await getFileQuery({ id: fileId });

    if (!result.data.file) {
      return null;
    }

    const file = result.data.file;

    // Map the query result to FileMetadata interface
    return {
      id: file.id,
      userId: file.userId,
      loanId: file.loanId || undefined,
      originalFilename: file.originalFilename,
      storagePath: file.storagePath,
      fileSize: file.fileSize,
      mimeType: file.mimeType || 'application/octet-stream',
      fileExtension: file.fileExtension || '',
      downloadUrl: file.downloadUrl || undefined,
      tags: file.tags || undefined,
      description: file.description || undefined,
    };
  } catch (error) {
    console.error('Error getting file metadata:', error);
    return null;
  }
}

/**
 * Upload file to Firebase Storage and save metadata
 */
export async function uploadFile(
  file: File,
  userId: string,
  onProgress?: (progress: number) => void,
  loanId?: string // Optional loan association
): Promise<UploadResult> {
  try {
    // Create storage path
    const timestamp = Date.now();
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `users/${userId}/files/${timestamp}_${sanitizedFilename}`;
    const storageRef = ref(storage, storagePath);

    // Get file extension
    const fileExtension = file.name.split('.').pop() || '';

    // Upload file
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) {
            onProgress(progress);
          }
        },
        (error) => {
          console.error('Upload error:', error);
          reject(error);
        },
        async () => {
          try {
            // Get download URL
            console.log(uploadTask.snapshot.ref);
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            console.log('Download URL:', downloadUrl);
            // Create file metadata in Data Connect
            const { fileId } = await createFileMetadata({
              userId,
              loanId, // Pass loan ID if provided
              originalFilename: file.name,
              storagePath,
              fileSize: file.size,
              mimeType: file.type,
              fileExtension,
              downloadUrl,
            });

            resolve({
              fileId,
              downloadUrl,
              storagePath,
            });
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

/**
 * Delete file from storage and mark as deleted in database
 */
export async function deleteFile(fileId: string, storagePath: string): Promise<void> {
  try {
    // Delete from storage
    const storageRef = ref(storage, storagePath);
    await deleteObject(storageRef);

    // Mark as deleted in database
    const variables = {
      id: fileId,
      deletedBy: null, // TODO: Pass current user ID
      deletedAt: new Date().toISOString(),
    };

    const mutationReference = mutationRef(dataConnect, 'SoftDeleteFile', variables);
    await executeMutation(mutationReference);

    console.log('File deleted:', fileId);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}

export const fileService = {
  uploadFile,
  getUserFiles,
  getFileMetadata,
  createFileMetadata,
  updateFileDownloadUrl,
  deleteFile,
};

export default fileService;
