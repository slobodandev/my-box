/**
 * File Folder Manager Component
 * Provides a folder-based view for admins using @cubone/react-file-manager
 * Organizes files by borrower and loan in a hierarchical structure
 */

import { useState, useEffect, useRef } from 'react';
import { FileManager, type FileManagerFile } from '@cubone/react-file-manager';
import '@cubone/react-file-manager/dist/style.css';
import { useAuth } from '@/contexts/AuthContext';
import { getAllUsers } from '@/services/dataconnect/userService';
import { getUserFiles } from '@/services/fileService';
import { getUserLoans } from '@/services/dataconnect/loanService';
import { deleteFile } from '@/services/fileOperations';
import { getFileDownloadURL } from '@/utils/storage';
import {
  collectFilesFromFolder,
  downloadFolderAsZip,
  getFolderStats,
  type FolderDownloadProgress,
} from '@/utils/folderDownload';
import { modal } from '@/utils/modal';

interface FileFolderManagerProps {
  onRefresh?: () => void;
}

/**
 * Extract folder path from file tags
 * Tags format: "folder:/path/to/folder" or "tag1,folder:/path/to/folder,tag2"
 */
const extractFolderPathFromTags = (tags: string | null | undefined): string | null => {
  if (!tags) return null;

  const tagParts = tags.split(',');
  for (const part of tagParts) {
    const trimmed = part.trim();
    if (trimmed.startsWith('folder:')) {
      return trimmed.substring(7); // Remove "folder:" prefix
    }
  }
  return null;
};

/**
 * Build folder structure from file paths
 * Creates all necessary folder nodes and places files in correct locations
 */
const buildFolderStructureFromFiles = (
  files: any[],
  basePath: string,
  existingFolders: Set<string>
): FileManagerFile[] => {
  const result: FileManagerFile[] = [];
  const foldersToCreate = new Map<string, { path: string; name: string; parentPath: string }>();

  files.forEach(file => {
    const folderPath = extractFolderPathFromTags(file.tags);

    if (folderPath) {
      // File has a folder path - we need to create folders and place file correctly
      const fullFolderPath = `${basePath}/${folderPath}`;

      // Build all folders in the path
      const parts = folderPath.split('/').filter(p => p);
      let currentPath = basePath;

      parts.forEach((part, index) => {
        const parentPath = currentPath;
        currentPath = `${currentPath}/${part}`;

        if (!existingFolders.has(currentPath) && !foldersToCreate.has(currentPath)) {
          foldersToCreate.set(currentPath, {
            path: currentPath,
            name: part,
            parentPath: parentPath,
          });
        }
      });

      // Add file to its folder
      result.push({
        id: file.id || `file-${file.originalFilename}`,
        name: file.originalFilename,
        isDirectory: false,
        type: 'file',
        path: `${fullFolderPath}/${file.originalFilename}`,
        updatedAt: file.uploadedAt?.toString() || new Date().toISOString(),
        size: file.fileSize,
        storagePath: file.storagePath,
      } as FileManagerFile);
    } else {
      // File has no folder path - add directly to base path
      result.push({
        id: file.id || `file-${file.originalFilename}`,
        name: file.originalFilename,
        isDirectory: false,
        type: 'file',
        path: `${basePath}/${file.originalFilename}`,
        updatedAt: file.uploadedAt?.toString() || new Date().toISOString(),
        size: file.fileSize,
        storagePath: file.storagePath,
      } as FileManagerFile);
    }
  });

  // Add created folders to result (sorted by path depth to ensure parents come first)
  const sortedFolders = Array.from(foldersToCreate.values()).sort(
    (a, b) => a.path.split('/').length - b.path.split('/').length
  );

  sortedFolders.forEach(folder => {
    result.unshift({
      id: `folder-${folder.path.replace(/\//g, '-')}`,
      name: folder.name,
      isDirectory: true,
      type: 'folder',
      path: folder.path,
      updatedAt: new Date().toISOString(),
      size: 0,
    } as FileManagerFile);
    existingFolders.add(folder.path);
  });

  return result;
};

export const FileFolderManager: React.FC<FileFolderManagerProps> = () => {
  const { user } = useAuth();
  const [fileStructure, setFileStructure] = useState<FileManagerFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Folder download state
  const [folderDownloadProgress, setFolderDownloadProgress] = useState<FolderDownloadProgress | null>(null);
  const [isDownloadingFolder, setIsDownloadingFolder] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load file structure
  useEffect(() => {
    loadFileStructure();
  }, []);

  // Note: The @cubone/react-file-manager library doesn't expose folder navigation callbacks
  // in the current version we're using. The onFolderChange callback would be implemented
  // when/if the library adds this support. For now, we're using the path metadata approach
  // stored in window.__folderPathMetadata

  const loadFileStructure = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Fetch all data
      const users = await getAllUsers();
      const borrowers = users.filter(u => u.role === 'borrower' && u.isActive);

      const structure: FileManagerFile[] = [];

      // Initialize path metadata for upload context
      const pathMetadata: { [path: string]: { userId?: string; loanId?: string } } = {};

      // Track existing folders to avoid duplicates
      const existingFolders = new Set<string>();

      // Personal Files folder - with support for nested folders from ZIP uploads
      const personalFilesPath = '/Personal Files';
      structure.push({
        id: 'personal-files-root',
        name: 'Personal Files',
        isDirectory: true,
        type: 'folder',
        path: personalFilesPath,
        updatedAt: new Date().toISOString(),
        size: 0,
      } as FileManagerFile);
      existingFolders.add(personalFilesPath);

      // Fetch current user's files
      const myFiles = await getUserFiles(user.id, false);

      // Build folder structure from files (handles ZIP folder paths)
      const personalFileStructure = buildFolderStructureFromFiles(myFiles, personalFilesPath, existingFolders);
      structure.push(...personalFileStructure);

      // Add path metadata for personal files
      pathMetadata['/'] = { userId: user.id };
      pathMetadata['/Personal Files'] = { userId: user.id };

      // Borrowers root folder
      structure.push({
        id: 'borrowers-root',
        name: 'Borrowers',
        isDirectory: true,
        type: 'folder',
        path: '/Borrowers',
        updatedAt: new Date().toISOString(),
        size: 0,
      } as FileManagerFile);
      existingFolders.add('/Borrowers');

      // Create structure for each borrower
      for (const borrower of borrowers) {
        const borrowerName = borrower.firstName && borrower.lastName
          ? `${borrower.firstName} ${borrower.lastName}`
          : borrower.email;

        const borrowerPath = `/Borrowers/${borrowerName}`;

        // Add borrower folder
        structure.push({
          id: `borrower-${borrower.id}`,
          name: borrowerName,
          isDirectory: true,
          type: 'folder',
          path: borrowerPath,
          updatedAt: borrower.createdAt?.toString() || new Date().toISOString(),
          size: 0,
        } as FileManagerFile);
        existingFolders.add(borrowerPath);

        // Fetch borrower's loans and files
        const [loans, files] = await Promise.all([
          getUserLoans(borrower.id),
          getUserFiles(borrower.id, false),
        ]);

        // Personal Files folder
        const borrowerPersonalFilesPath = `${borrowerPath}/Personal Files`;
        structure.push({
          id: `personal-${borrower.id}`,
          name: 'Personal Files',
          isDirectory: true,
          type: 'folder',
          path: borrowerPersonalFilesPath,
          updatedAt: borrower.createdAt?.toString() || new Date().toISOString(),
          size: 0,
        } as FileManagerFile);
        existingFolders.add(borrowerPersonalFilesPath);

        // Add personal files (files without loanId) - with folder structure support
        const personalFiles = files.filter(f => !f.loanId);
        const borrowerPersonalFileStructure = buildFolderStructureFromFiles(personalFiles, borrowerPersonalFilesPath, existingFolders);
        structure.push(...borrowerPersonalFileStructure);

        // Add path metadata for this borrower
        pathMetadata[borrowerPath] = { userId: borrower.id };
        pathMetadata[`${borrowerPath}/Personal Files`] = { userId: borrower.id };

        // Add loan folders
        loans.forEach(loan => {
          const loanPath = `${borrowerPath}/Loan ${loan.loanNumber}`;

          structure.push({
            id: `loan-${loan.id}`,
            name: `Loan ${loan.loanNumber}`,
            isDirectory: true,
            type: 'folder',
            path: loanPath,
            updatedAt: loan.createdAt?.toString() || new Date().toISOString(),
            size: 0,
          } as FileManagerFile);
          existingFolders.add(loanPath);

          // Add path metadata for this loan
          pathMetadata[loanPath] = {
            userId: borrower.id,
            loanId: loan.id
          };

          // Add loan files - with folder structure support
          const loanFiles = files.filter(f => f.loanId === loan.id);
          const loanFileStructure = buildFolderStructureFromFiles(loanFiles, loanPath, existingFolders);
          structure.push(...loanFileStructure);
        });
      }

      setFileStructure(structure);

      // Store path metadata in window for access by upload handler
      (window as any).__folderPathMetadata = pathMetadata;
    } catch (err: any) {
      console.error('Error loading file structure:', err);
      setError(err.message || 'Failed to load file structure');
    } finally {
      setLoading(false);
    }
  };

  // Event handlers - match library's actual type signatures
  const handleDelete = async (fileId: string) => {
    // Find the file in the structure
    const file = fileStructure.find(f => f.id === fileId);

    if (!file) {
      modal.error('File not found');
      return;
    }

    if (file.isDirectory) {
      modal.warning('Cannot delete folders. Please delete files individually.');
      return;
    }

    const confirmed = await modal.deleteConfirm(file.name);

    if (!confirmed) return;

    try {
      await deleteFile(fileId);
      modal.success('File deleted successfully');
      loadFileStructure(); // Refresh the structure
    } catch (error: any) {
      console.error('Error deleting file:', error);
      modal.error(error.message || 'Failed to delete file. Please try again.');
    }
  };

  // Handle folder download as ZIP
  const handleFolderDownload = async (folder: FileManagerFile) => {
    if (isDownloadingFolder) {
      modal.warning('A folder download is already in progress.');
      return;
    }

    const folderPath = folder.path;
    if (!folderPath) {
      modal.error('Folder path not found.');
      return;
    }

    // Get folder stats first
    const stats = getFolderStats(fileStructure, folderPath);

    if (stats.fileCount === 0) {
      modal.info('This folder is empty or contains no downloadable files.');
      return;
    }

    // Confirm download for large folders
    const sizeMB = (stats.totalSize / (1024 * 1024)).toFixed(2);
    const confirmed = await modal.downloadConfirm({
      folderName: folder.name,
      fileCount: stats.fileCount,
      totalSizeMB: sizeMB,
    });

    if (!confirmed) return;

    try {
      setIsDownloadingFolder(true);
      abortControllerRef.current = new AbortController();

      // Collect all files from the folder
      const filesToDownload = collectFilesFromFolder(fileStructure, folderPath);

      console.log(`Starting folder download: ${folder.name} (${filesToDownload.length} files)`);

      await downloadFolderAsZip(filesToDownload, folder.name, {
        onProgress: (progress) => {
          setFolderDownloadProgress(progress);
          console.log(`Download progress: ${progress.percentage}% (${progress.completedFiles}/${progress.totalFiles} files)`);
        },
        onFileStart: (fileName) => {
          console.log(`Downloading: ${fileName}`);
        },
        onFileComplete: (fileName) => {
          console.log(`Completed: ${fileName}`);
        },
        onError: (error, fileName) => {
          console.error(`Error downloading ${fileName || 'file'}:`, error);
        },
        onComplete: () => {
          console.log(`Folder download complete: ${folder.name}`);
          modal.success(`Folder "${folder.name}" downloaded successfully!`);
        },
        abortController: abortControllerRef.current,
      });
    } catch (error: any) {
      if (abortControllerRef.current?.signal.aborted) {
        console.log('Folder download was cancelled.');
      } else {
        console.error('Error downloading folder:', error);
        modal.error(error.message || 'Failed to download folder. Please try again.');
      }
    } finally {
      setIsDownloadingFolder(false);
      setFolderDownloadProgress(null);
      abortControllerRef.current = null;
    }
  };

  // Cancel folder download
  const cancelFolderDownload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsDownloadingFolder(false);
      setFolderDownloadProgress(null);
      modal.info('Folder download cancelled.');
    }
  };

  const handleDownload = async (fileOrFiles: FileManagerFile | FileManagerFile[]) => {
    // Handle case where library passes an array of files
    const file = Array.isArray(fileOrFiles) ? fileOrFiles[0] : fileOrFiles;

    if (!file) {
      modal.warning('No file selected for download.');
      return;
    }

    // Handle folder download
    if (file.isDirectory) {
      await handleFolderDownload(file);
      return;
    }

    try {
      // @ts-ignore - storagePath is added to FileManagerFile
      const storagePath = file.storagePath as string;

      if (!storagePath) {
        throw new Error('File storage path not found');
      }

      const downloadUrl = await getFileDownloadURL(storagePath);

      // Trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log('File downloaded:', file.name);
    } catch (error: any) {
      console.error('Error downloading file:', error);
      modal.error(error.message || 'Failed to download file. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading file structure...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center max-w-md">
          <span className="material-symbols-outlined text-6xl text-red-500 mb-4">error</span>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Error Loading Files
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={loadFileStructure}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <FileManager
        files={fileStructure}
        onDelete={handleDelete}
        onDownload={handleDownload}
      />

      {/* Folder Download Progress Overlay */}
      {isDownloadingFolder && folderDownloadProgress && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-primary text-3xl animate-pulse">
                folder_zip
              </span>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Downloading Folder
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Creating ZIP file...
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-1">
                <span>Progress</span>
                <span>{folderDownloadProgress.percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-primary h-3 rounded-full transition-all duration-300"
                  style={{ width: `${folderDownloadProgress.percentage}%` }}
                />
              </div>
            </div>

            {/* File progress */}
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              <p>
                Files: {folderDownloadProgress.completedFiles} / {folderDownloadProgress.totalFiles}
              </p>
              <p className="truncate" title={folderDownloadProgress.currentFile}>
                Current: {folderDownloadProgress.currentFile}
              </p>
              <p>
                Size: {(folderDownloadProgress.loadedBytes / (1024 * 1024)).toFixed(2)} MB
                {folderDownloadProgress.totalBytes > 0 &&
                  ` / ${(folderDownloadProgress.totalBytes / (1024 * 1024)).toFixed(2)} MB`
                }
              </p>
            </div>

            {/* Cancel button */}
            <button
              onClick={cancelFolderDownload}
              className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
            >
              Cancel Download
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileFolderManager;
