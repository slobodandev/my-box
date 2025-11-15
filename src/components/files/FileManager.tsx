/**
 * FileManager Component
 * Integrates @cubone/react-file-manager with Firebase Storage
 */

import React, { useState, useEffect } from 'react';
import { FileManager as CuboneFileManager, FileManagerFile, FileManagerFolder } from '@cubone/react-file-manager';
import '@cubone/react-file-manager/dist/style.css';
import {
  uploadFile,
  getFileDownloadURL,
  deleteFile,
  listFiles,
  formatFileSize,
  getFileIcon,
} from '../../utils/storage';
import { getMetadata } from 'firebase/storage';
import type { StorageReference } from 'firebase/storage';

interface FileManagerProps {
  userId: string;
  loanId?: string;
  onFileSelect?: (file: FileManagerFile) => void;
  onFileUpload?: (fileId: string, storagePath: string) => void;
  maxFileSize?: number; // in bytes
  allowedFileTypes?: string[];
}

/**
 * MyBox File Manager Component
 *
 * Features:
 * - Upload files with drag & drop or file picker
 * - List files from Firebase Storage
 * - Download files with signed URLs
 * - Delete files
 * - Preview images and PDFs
 * - Sort and filter files
 * - File icons by type
 * - Upload progress tracking
 */
export const FileManager: React.FC<FileManagerProps> = ({
  userId,
  loanId,
  onFileSelect,
  onFileUpload,
  maxFileSize = 100 * 1024 * 1024, // 100MB default
  allowedFileTypes,
}) => {
  const [files, setFiles] = useState<FileManagerFile[]>([]);
  const [folders] = useState<FileManagerFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Load files on mount
  useEffect(() => {
    loadFiles();
  }, [userId, loanId]);

  /**
   * Load files from Firebase Storage
   */
  const loadFiles = async () => {
    try {
      setLoading(true);

      // Determine path based on whether we're viewing loan files or personal files
      const path = loanId
        ? `users/${userId}/loans/${loanId}`
        : `users/${userId}/personal`;

      const storageRefs = await listFiles(path);

      // Convert StorageReference[] to FileManagerFile[]
      const fileList: FileManagerFile[] = await Promise.all(
        storageRefs.map(async (ref: StorageReference) => {
          const metadata = await getMetadata(ref);
          const downloadUrl = await getFileDownloadURL(ref.fullPath);

          return {
            id: ref.name.split('.')[0], // Extract file ID from filename
            name: metadata.customMetadata?.originalFilename || ref.name,
            size: metadata.size,
            type: metadata.contentType || 'application/octet-stream',
            modifiedAt: new Date(metadata.updated),
            createdAt: new Date(metadata.timeCreated),
            url: downloadUrl,
            path: ref.fullPath,
            icon: getFileIcon(ref.name),
            // @ts-ignore - extend the type with our custom fields
            storagePath: ref.fullPath,
            userId: metadata.customMetadata?.userId,
            fileId: metadata.customMetadata?.fileId,
          };
        })
      );

      setFiles(fileList);
    } catch (error) {
      console.error('Error loading files:', error);
      // TODO: Show error notification
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle file upload
   */
  const handleUpload = async (file: File): Promise<void> => {
    try {
      setUploading(true);
      setUploadProgress(0);

      // Validate file size
      if (file.size > maxFileSize) {
        throw new Error(`File size exceeds ${formatFileSize(maxFileSize)}`);
      }

      // Validate file type if specified
      if (allowedFileTypes && allowedFileTypes.length > 0) {
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        if (!fileExtension || !allowedFileTypes.includes(`.${fileExtension}`)) {
          throw new Error(`File type .${fileExtension} is not allowed`);
        }
      }

      // Generate unique file ID
      const fileId = crypto.randomUUID();

      // Upload to Firebase Storage
      const storagePath = await uploadFile({
        userId,
        loanId,
        fileId,
        file,
        metadata: {
          originalFilename: file.name,
        },
        onProgress: (progress) => {
          setUploadProgress(progress.percentage);
        },
      });

      console.log('File uploaded successfully:', storagePath);

      // Call onFileUpload callback
      if (onFileUpload) {
        onFileUpload(fileId, storagePath);
      }

      // Reload files to show the new file
      await loadFiles();

      // TODO: Show success notification
    } catch (error: any) {
      console.error('Error uploading file:', error);
      // TODO: Show error notification
      throw error;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  /**
   * Handle file download
   */
  const handleDownload = async (file: FileManagerFile) => {
    try {
      // @ts-ignore - we added storagePath in loadFiles
      const storagePath = file.storagePath as string;
      const downloadUrl = await getFileDownloadURL(storagePath);

      // Trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log('File downloaded:', file.name);
    } catch (error) {
      console.error('Error downloading file:', error);
      // TODO: Show error notification
    }
  };

  /**
   * Handle file delete
   */
  const handleDelete = async (fileId: string) => {
    try {
      const file = files.find((f) => f.id === fileId);
      if (!file) {
        throw new Error('File not found');
      }

      // @ts-ignore - we added storagePath in loadFiles
      const storagePath = file.storagePath as string;

      // Confirm deletion
      if (!window.confirm(`Are you sure you want to delete "${file.name}"?`)) {
        return;
      }

      await deleteFile(storagePath);

      console.log('File deleted:', file.name);

      // Reload files
      await loadFiles();

      // TODO: Show success notification
    } catch (error) {
      console.error('Error deleting file:', error);
      // TODO: Show error notification
    }
  };

  /**
   * Handle file selection
   */
  const handleSelect = (file: FileManagerFile) => {
    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  return (
    <div className="file-manager-container">
      <CuboneFileManager
        files={files}
        folders={folders}
        loading={loading}
        onUpload={handleUpload}
        onDownload={handleDownload}
        onDelete={handleDelete}
        onSelect={handleSelect}
        onRefresh={loadFiles}
        uploadProgress={uploadProgress}
        uploading={uploading}
        // Customization options
        showFolders={false} // We don't use folders in this implementation
        showBreadcrumbs={true}
        showSearch={true}
        showSort={true}
        showGrid={true}
        showList={true}
        defaultView="list"
        // Styling
        theme="light" // or 'dark' based on your app theme
        primaryColor="#135bec"
        // Localization
        locale="en"
        // Upload settings
        multiple={true}
        maxFileSize={maxFileSize}
        acceptedFileTypes={allowedFileTypes}
      />

      {/* Custom styling */}
      <style>{`
        .file-manager-container {
          width: 100%;
          height: 600px;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          overflow: hidden;
        }

        /* Dark mode support */
        .dark .file-manager-container {
          border-color: #374151;
        }
      `}</style>
    </div>
  );
};

export default FileManager;
