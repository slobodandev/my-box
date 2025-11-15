/**
 * Firebase Storage Utilities
 * Handles file upload, download, and management for MyBox
 */

import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  getMetadata,
  UploadTaskSnapshot,
  StorageReference,
} from 'firebase/storage';
import { storage } from '../config/firebase';

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  percentage: number;
  state: 'running' | 'paused' | 'success' | 'canceled' | 'error';
}

export interface FileUploadOptions {
  userId: string;
  loanId?: string;
  fileId: string;
  file: File;
  metadata?: Record<string, string>;
  onProgress?: (progress: UploadProgress) => void;
}

export interface FileMetadata {
  name: string;
  size: number;
  contentType: string;
  fullPath: string;
  timeCreated: string;
  updated: string;
}

/**
 * Upload file to Firebase Storage
 * Returns the storage path of the uploaded file
 */
export const uploadFile = async (
  options: FileUploadOptions
): Promise<string> => {
  const { userId, loanId, fileId, file, metadata, onProgress } = options;

  // Determine storage path based on whether file is associated with a loan
  const fileExtension = getFileExtension(file.name);
  const path = loanId
    ? `users/${userId}/loans/${loanId}/${fileId}.${fileExtension}`
    : `users/${userId}/personal/${fileId}.${fileExtension}`;

  const storageRef = ref(storage, path);

  // Prepare metadata
  const uploadMetadata = {
    contentType: file.type,
    customMetadata: {
      userId,
      originalFilename: file.name,
      fileId,
      ...(loanId && { loanId }),
      ...metadata,
    },
  };

  // Create upload task with progress tracking
  const uploadTask = uploadBytesResumable(storageRef, file, uploadMetadata);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot: UploadTaskSnapshot) => {
        if (onProgress) {
          const progress: UploadProgress = {
            bytesTransferred: snapshot.bytesTransferred,
            totalBytes: snapshot.totalBytes,
            percentage: Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            ),
            state: snapshot.state as any,
          };
          onProgress(progress);
        }
      },
      (error) => {
        console.error('Upload error:', error);
        reject(error);
      },
      () => {
        console.log('Upload complete:', path);
        resolve(path);
      }
    );
  });
};

/**
 * Get download URL for a file
 * @param storagePath - Full storage path (e.g., "users/user-123/personal/file-abc.pdf")
 */
export const getFileDownloadURL = async (storagePath: string): Promise<string> => {
  try {
    const storageRef = ref(storage, storagePath);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error('Error getting download URL:', error);
    throw new Error('Failed to get download URL');
  }
};

/**
 * Delete file from storage
 * @param storagePath - Full storage path
 */
export const deleteFile = async (storagePath: string): Promise<void> => {
  try {
    const storageRef = ref(storage, storagePath);
    await deleteObject(storageRef);
    console.log('File deleted:', storagePath);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error('Failed to delete file');
  }
};

/**
 * List all files in a directory
 * @param path - Directory path (e.g., "users/user-123/personal")
 */
export const listFiles = async (path: string): Promise<StorageReference[]> => {
  try {
    const storageRef = ref(storage, path);
    const result = await listAll(storageRef);
    return result.items;
  } catch (error) {
    console.error('Error listing files:', error);
    throw new Error('Failed to list files');
  }
};

/**
 * Get file metadata
 * @param storageRef - Storage reference
 */
export const getFileMetadata = async (
  storageRef: StorageReference
): Promise<FileMetadata> => {
  const metadata = await getMetadata(storageRef);
  return {
    name: metadata.name,
    size: metadata.size,
    contentType: metadata.contentType || 'application/octet-stream',
    fullPath: metadata.fullPath,
    timeCreated: metadata.timeCreated,
    updated: metadata.updated,
  };
};

/**
 * Download file to local system
 * @param storagePath - Full storage path
 * @param filename - Desired filename for download
 */
export const downloadFile = async (
  storagePath: string,
  filename: string
): Promise<void> => {
  try {
    const url = await getFileDownloadURL(storagePath);

    // Create temporary link and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error downloading file:', error);
    throw new Error('Failed to download file');
  }
};

/**
 * Upload multiple files
 * @param files - Array of files to upload
 * @param options - Base upload options (userId, loanId, etc.)
 * @param onProgress - Progress callback for all uploads
 */
export const uploadMultipleFiles = async (
  files: File[],
  options: Omit<FileUploadOptions, 'file' | 'fileId'>,
  onProgress?: (fileIndex: number, progress: UploadProgress) => void
): Promise<string[]> => {
  const uploadPromises = files.map((file, index) => {
    const fileId = crypto.randomUUID();
    return uploadFile({
      ...options,
      file,
      fileId,
      onProgress: onProgress
        ? (progress) => onProgress(index, progress)
        : undefined,
    });
  });

  return Promise.all(uploadPromises);
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get file extension from filename
 */
export const getFileExtension = (filename: string): string => {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
};

/**
 * Get MIME type from filename
 */
export const getMimeType = (filename: string): string => {
  const ext = getFileExtension(filename);
  const mimeTypes: Record<string, string> = {
    // Documents
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',

    // Images
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    bmp: 'image/bmp',
    webp: 'image/webp',
    svg: 'image/svg+xml',

    // Text
    txt: 'text/plain',
    csv: 'text/csv',
    html: 'text/html',
    htm: 'text/html',
    xml: 'text/xml',
    json: 'application/json',

    // Archives
    zip: 'application/zip',
    rar: 'application/x-rar-compressed',
    '7z': 'application/x-7z-compressed',
    tar: 'application/x-tar',
    gz: 'application/gzip',
  };

  return mimeTypes[ext] || 'application/octet-stream';
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Validate file size (max 100MB)
 */
export const isValidFileSize = (file: File): boolean => {
  const maxSize = 100 * 1024 * 1024; // 100MB
  return file.size <= maxSize;
};

/**
 * Validate file type
 */
export const isValidFileType = (file: File): boolean => {
  const allowedTypes = [
    'image/',
    'application/pdf',
    'application/msword',
    'application/vnd.',
    'text/',
    'application/zip',
  ];

  return allowedTypes.some((type) => file.type.startsWith(type));
};

/**
 * Get file icon class based on extension
 */
export const getFileIcon = (filename: string): string => {
  const ext = getFileExtension(filename);

  const iconMap: Record<string, string> = {
    // Documents
    pdf: 'picture_as_pdf',
    doc: 'description',
    docx: 'description',
    xls: 'table_chart',
    xlsx: 'table_chart',
    ppt: 'slideshow',
    pptx: 'slideshow',

    // Images
    jpg: 'image',
    jpeg: 'image',
    png: 'image',
    gif: 'image',
    bmp: 'image',
    webp: 'image',
    svg: 'image',

    // Text
    txt: 'description',
    csv: 'table_chart',
    html: 'code',
    xml: 'code',
    json: 'code',

    // Archives
    zip: 'folder_zip',
    rar: 'folder_zip',
    '7z': 'folder_zip',
  };

  return iconMap[ext] || 'insert_drive_file';
};

/**
 * Get file type color for UI
 */
export const getFileTypeColor = (filename: string): string => {
  const ext = getFileExtension(filename);

  if (['pdf'].includes(ext)) return 'text-red-500';
  if (['doc', 'docx', 'txt'].includes(ext)) return 'text-blue-500';
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'text-green-500';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'text-purple-500';
  if (['zip', 'rar', '7z'].includes(ext)) return 'text-yellow-500';

  return 'text-gray-500';
};

/**
 * Build storage path for user file
 */
export const buildStoragePath = (
  userId: string,
  fileId: string,
  filename: string,
  loanId?: string
): string => {
  const ext = getFileExtension(filename);
  if (loanId) {
    return `users/${userId}/loans/${loanId}/${fileId}.${ext}`;
  }
  return `users/${userId}/personal/${fileId}.${ext}`;
};

/**
 * Parse storage path to extract components
 */
export const parseStoragePath = (path: string): {
  userId?: string;
  loanId?: string;
  fileId?: string;
  type?: 'personal' | 'loan' | 'shared' | 'temp';
} => {
  const parts = path.split('/');

  if (parts[0] === 'users' && parts[2] === 'personal') {
    return {
      userId: parts[1],
      type: 'personal',
      fileId: parts[3]?.split('.')[0],
    };
  }

  if (parts[0] === 'users' && parts[2] === 'loans') {
    return {
      userId: parts[1],
      loanId: parts[3],
      type: 'loan',
      fileId: parts[4]?.split('.')[0],
    };
  }

  if (parts[0] === 'shared') {
    return {
      loanId: parts[1],
      type: 'shared',
      fileId: parts[2]?.split('.')[0],
    };
  }

  if (parts[0] === 'temp') {
    return {
      type: 'temp',
      fileId: parts[2]?.split('.')[0],
    };
  }

  return {};
};
