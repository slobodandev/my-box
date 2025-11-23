/**
 * File Folder Manager Component
 * Provides a folder-based view for admins using @cubone/react-file-manager
 * Organizes files by borrower and loan in a hierarchical structure
 */

import { useState, useEffect } from 'react';
import { FileManager, type FileManagerFile } from '@cubone/react-file-manager';
import '@cubone/react-file-manager/dist/style.css';
import { useAuth } from '@/contexts/AuthContext';
import { getAllUsers } from '@/services/dataconnect/userService';
import { getUserFiles } from '@/services/fileService';
import { getUserLoans } from '@/services/dataconnect/loanService';
import { deleteFile, downloadFile } from '@/services/fileOperations';

interface FileFolderManagerProps {
  onRefresh?: () => void;
}

export const FileFolderManager: React.FC<FileFolderManagerProps> = () => {
  const { user } = useAuth();
  const [fileStructure, setFileStructure] = useState<FileManagerFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

      // Personal Files folder - flat structure with all current user's files
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

      // Fetch current user's files
      const myFiles = await getUserFiles(user.id, false);

      // Add all current user's files (both personal and loan files) to Personal Files folder
      myFiles.forEach(file => {
        structure.push({
          id: file.id || `personal-file-${file.originalFilename}`,
          name: file.originalFilename,
          isDirectory: false,
          type: 'file',
          path: `${personalFilesPath}/${file.originalFilename}`,
          updatedAt: file.uploadedAt?.toString() || new Date().toISOString(),
          size: file.fileSize,
        } as FileManagerFile);
      });

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

        // Fetch borrower's loans and files
        const [loans, files] = await Promise.all([
          getUserLoans(borrower.id),
          getUserFiles(borrower.id, false),
        ]);

        // Personal Files folder
        const personalFilesPath = `${borrowerPath}/Personal Files`;
        structure.push({
          id: `personal-${borrower.id}`,
          name: 'Personal Files',
          isDirectory: true,
          type: 'folder',
          path: personalFilesPath,
          updatedAt: borrower.createdAt?.toString() || new Date().toISOString(),
          size: 0,
        } as FileManagerFile);

        // Add personal files (files without loanId)
        const personalFiles = files.filter(f => !f.loanId);
        personalFiles.forEach(file => {
          structure.push({
            id: file.id || `personal-file-${file.originalFilename}`,
            name: file.originalFilename,
            isDirectory: false,
            type: 'file',
            path: `${personalFilesPath}/${file.originalFilename}`,
            updatedAt: file.uploadedAt?.toString() || new Date().toISOString(),
            size: file.fileSize,
          } as FileManagerFile);
        });

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

          // Add path metadata for this loan
          pathMetadata[loanPath] = {
            userId: borrower.id,
            loanId: loan.id
          };

          // Add loan files
          const loanFiles = files.filter(f => f.loanId === loan.id);
          loanFiles.forEach(file => {
            structure.push({
              id: file.id || `loan-file-${file.originalFilename}`,
              name: file.originalFilename,
              isDirectory: false,
              type: 'file',
              path: `${loanPath}/${file.originalFilename}`,
              updatedAt: file.uploadedAt?.toString() || new Date().toISOString(),
              size: file.fileSize,
            } as FileManagerFile);
          });
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
      alert('File not found');
      return;
    }

    if (file.isDirectory) {
      alert('Cannot delete folders. Please delete files individually.');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${file.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await deleteFile(fileId);
      alert('File deleted successfully');
      loadFileStructure(); // Refresh the structure
    } catch (error: any) {
      console.error('Error deleting file:', error);
      alert(error.message || 'Failed to delete file. Please try again.');
    }
  };

  const handleDownload = async (file: FileManagerFile) => {
    if (file.isDirectory) {
      alert('Cannot download folders. Please download files individually.');
      return;
    }

    try {
      await downloadFile(file.id);
    } catch (error: any) {
      console.error('Error downloading file:', error);
      alert(error.message || 'Failed to download file. Please try again.');
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
    <div className="w-full h-full">
      <FileManager
        files={fileStructure}
        onDelete={handleDelete}
        onDownload={handleDownload}
      />
    </div>
  );
};

export default FileFolderManager;
