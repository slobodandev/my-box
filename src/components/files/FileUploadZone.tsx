/**
 * File Upload Zone Component
 * Modern drag-and-drop file upload interface with loan association
 */

import React, { useState, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { uploadFile as uploadFileToStorage, uploadFileWithFolder } from '@/services/fileService';
import { analyzeZipFile, formatBytes, generateFolderTreeString, zipEntryToFile, type ZipFileEntry } from '@/utils/zipExtractor';
import { modal, type ZipUploadOption } from '@/utils/modal';

interface FileUploadZoneProps {
  userId?: string; // User ID to associate files with (for admin uploading to borrower)
  onUploadComplete?: () => void;
  loanId?: string | null; // Loan ID from sidebar selection
  loanNumber?: string; // Loan number for display
  borrowerName?: string; // Borrower name (for admin view)
}

interface UploadingFile {
  file: File;
  progress: number;
  error?: string;
  downloadUrl?: string;
}

const ACCEPTED_FILE_TYPES = {
  'application/pdf': { ext: '.pdf', icon: 'picture_as_pdf', color: 'text-red-500', label: 'PDF' },
  'application/msword': { ext: '.doc', icon: 'description', color: 'text-blue-500', label: 'DOC' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { ext: '.docx', icon: 'description', color: 'text-blue-500', label: 'DOCX' },
  'application/vnd.ms-excel': { ext: '.xls', icon: 'table_chart', color: 'text-green-600', label: 'XLS' },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { ext: '.xlsx', icon: 'table_chart', color: 'text-green-600', label: 'XLSX' },
  'image/jpeg': { ext: '.jpg', icon: 'image', color: 'text-purple-500', label: 'JPG' },
  'image/png': { ext: '.png', icon: 'image', color: 'text-purple-500', label: 'PNG' },
  'application/zip': { ext: '.zip', icon: 'folder_zip', color: 'text-yellow-600', label: 'ZIP' },
  'application/x-zip-compressed': { ext: '.zip', icon: 'folder_zip', color: 'text-yellow-600', label: 'ZIP' },
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  userId: propUserId,
  onUploadComplete,
  loanId,
  loanNumber,
  borrowerName
}) => {
  const { user } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<Map<string, UploadingFile>>(new Map());
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use provided userId (for admin uploading to borrower) or current user's ID
  const targetUserId = propUserId || user?.id;

  // Generate upload header text based on context
  const getUploadHeaderText = () => {
    if (borrowerName && loanNumber) {
      // Admin uploading to borrower's loan
      return `Upload files for ${borrowerName} - Loan #${loanNumber}`;
    } else if (loanNumber) {
      // User uploading to their own loan
      return `Upload files for Loan #${loanNumber}`;
    } else {
      // Default - personal files
      return 'Upload your files';
    }
  };

  const isZipFile = (file: File): boolean => {
    return file.type === 'application/zip' || file.type === 'application/x-zip-compressed' || file.name.endsWith('.zip');
  };

  const getMimeTypeFromExtension = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();

    const mimeTypes: { [key: string]: string } = {
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'bmp': 'image/bmp',
      'webp': 'image/webp',
    };

    return mimeTypes[ext || ''] || 'application/octet-stream';
  };

  const validateFile = (file: File): string | null => {
    // Skip validation for ZIP files - they'll be extracted
    if (isZipFile(file)) {
      return null;
    }

    if (!Object.keys(ACCEPTED_FILE_TYPES).includes(file.type)) {
      return `File type ${file.type} is not supported`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds 10MB limit`;
    }
    return null;
  };

  const extractAndUploadZip = async (zipFile: File): Promise<void> => {
    const fileId = `${Date.now()}-${zipFile.name}`;

    // Show analyzing message
    setUploadingFiles(prev => {
      const next = new Map(prev);
      next.set(fileId, { file: zipFile, progress: 0 });
      return next;
    });

    try {
      console.log('Analyzing ZIP file:', zipFile.name);

      // Analyze the ZIP file to detect folder structure
      const analysis = await analyzeZipFile(zipFile);

      // Update progress to show analysis complete
      setUploadingFiles(prev => {
        const next = new Map(prev);
        next.set(fileId, { file: zipFile, progress: 25 });
        return next;
      });

      let uploadOption: ZipUploadOption = 'flat';

      // If there's a folder structure, ask the user what to do
      if (analysis.hasfolderStructure && analysis.totalFolders > 0) {
        // Hide the progress indicator while showing modal
        setUploadingFiles(prev => {
          const next = new Map(prev);
          next.delete(fileId);
          return next;
        });

        // Generate folder tree for display
        const folderTree = generateFolderTreeString(analysis.folderTree);

        // Show the modal and wait for user choice
        uploadOption = await modal.zipUploadConfirm({
          zipName: zipFile.name,
          fileCount: analysis.totalFiles,
          folderCount: analysis.totalFolders,
          totalSize: formatBytes(analysis.totalSize),
          folderTree,
        });

        if (uploadOption === 'cancel') {
          console.log('ZIP upload cancelled by user');
          return;
        }

        // Show progress again
        setUploadingFiles(prev => {
          const next = new Map(prev);
          next.set(fileId, { file: zipFile, progress: 30 });
          return next;
        });
      }

      console.log(`Uploading ${analysis.totalFiles} files from ZIP (mode: ${uploadOption})`);

      // Update progress
      setUploadingFiles(prev => {
        const next = new Map(prev);
        next.set(fileId, { file: zipFile, progress: 50 });
        return next;
      });

      // Remove ZIP entry and upload individual files
      setTimeout(() => {
        setUploadingFiles(prev => {
          const next = new Map(prev);
          next.delete(fileId);
          return next;
        });

        // Upload each extracted file
        if (uploadOption === 'preserve') {
          // Upload with folder structure preserved
          analysis.flatFiles.forEach((entry: ZipFileEntry) => {
            uploadFileWithFolderPath(entry);
          });
        } else {
          // Upload flat - just the files without folder structure
          analysis.flatFiles.forEach((entry: ZipFileEntry) => {
            const file = zipEntryToFile(entry);
            uploadFile(file);
          });
        }
      }, 500);

    } catch (error: any) {
      console.error('ZIP extraction error:', error);
      setUploadingFiles(prev => {
        const next = new Map(prev);
        next.set(fileId, { file: zipFile, progress: 0, error: `Failed to extract ZIP: ${error.message}` });
        return next;
      });
    }
  };

  /**
   * Upload a file with its folder path preserved
   */
  const uploadFileWithFolderPath = async (entry: ZipFileEntry): Promise<void> => {
    if (!targetUserId) {
      throw new Error('User not authenticated');
    }

    const file = zipEntryToFile(entry);
    const fileId = `${Date.now()}-${file.name}`;
    const error = validateFile(file);

    if (error) {
      setUploadingFiles(prev => {
        const next = new Map(prev);
        next.set(fileId, { file, progress: 0, error });
        return next;
      });
      return;
    }

    // Initialize upload state
    setUploadingFiles(prev => {
      const next = new Map(prev);
      next.set(fileId, { file, progress: 0 });
      return next;
    });

    try {
      // Upload file with folder path
      const result = await uploadFileWithFolder(
        file,
        targetUserId,
        entry.folderPath, // Pass the folder path from the ZIP
        (progress) => {
          setUploadingFiles(prev => {
            const next = new Map(prev);
            const existing = next.get(fileId);
            if (existing) {
              next.set(fileId, { ...existing, progress });
            }
            return next;
          });
        },
        loanId || undefined
      );

      console.log('File uploaded successfully with folder path:', result);

      // Update state with download URL
      setUploadingFiles(prev => {
        const next = new Map(prev);
        const existing = next.get(fileId);
        if (existing) {
          next.set(fileId, { ...existing, progress: 100, downloadUrl: result.downloadUrl });
        }
        return next;
      });

      // Remove from uploading list after 2 seconds
      setTimeout(() => {
        setUploadingFiles(prev => {
          const next = new Map(prev);
          next.delete(fileId);
          return next;
        });
        if (onUploadComplete) {
          onUploadComplete();
        }
      }, 2000);
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadingFiles(prev => {
        const next = new Map(prev);
        const existing = next.get(fileId);
        if (existing) {
          next.set(fileId, { ...existing, error: error.message });
        }
        return next;
      });
    }
  };

  const uploadFile = async (file: File): Promise<void> => {
    if (!targetUserId) {
      throw new Error('User not authenticated');
    }

    const fileId = `${Date.now()}-${file.name}`;
    const error = validateFile(file);

    if (error) {
      setUploadingFiles(prev => {
        const next = new Map(prev);
        next.set(fileId, { file, progress: 0, error });
        return next;
      });
      return;
    }

    // Initialize upload state
    setUploadingFiles(prev => {
      const next = new Map(prev);
      next.set(fileId, { file, progress: 0 });
      return next;
    });

    try {
      // Upload file with progress tracking and loan association
      const result = await uploadFileToStorage(
        file,
        targetUserId,
        (progress) => {
          setUploadingFiles(prev => {
            const next = new Map(prev);
            const existing = next.get(fileId);
            if (existing) {
              next.set(fileId, { ...existing, progress });
            }
            return next;
          });
        },
        loanId || undefined // Pass loan ID from sidebar selection
      );

      console.log('File uploaded successfully:', result);

      // Update state with download URL
      setUploadingFiles(prev => {
        const next = new Map(prev);
        const existing = next.get(fileId);
        if (existing) {
          next.set(fileId, { ...existing, progress: 100, downloadUrl: result.downloadUrl });
        }
        return next;
      });

      // Remove from uploading list after 2 seconds
      setTimeout(() => {
        setUploadingFiles(prev => {
          const next = new Map(prev);
          next.delete(fileId);
          return next;
        });
        if (onUploadComplete) {
          onUploadComplete();
        }
      }, 2000);
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadingFiles(prev => {
        const next = new Map(prev);
        const existing = next.get(fileId);
        if (existing) {
          next.set(fileId, { ...existing, error: error.message });
        }
        return next;
      });
    }
  };

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      // Check if it's a ZIP file
      if (isZipFile(file)) {
        extractAndUploadZip(file);
      } else {
        uploadFile(file);
      }
    });
  }, [targetUserId]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    handleFiles(files);
  }, [handleFiles]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  }, [handleFiles]);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="w-full space-y-3">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={Object.values(ACCEPTED_FILE_TYPES).map(t => t.ext).join(',')}
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Drop zone */}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative overflow-hidden rounded-xl border-2 border-dashed transition-all cursor-pointer
          ${isDragging
            ? 'border-primary bg-primary/5 scale-[1.01]'
            : 'border-gray-300 dark:border-gray-600 hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-gray-800/50'
          }
        `}
      >
        <div className="px-6 py-6">
          <div className="flex flex-col items-center justify-center text-center">
            {/* Upload icon */}
            <div className={`
              mb-3 rounded-full p-3 transition-colors
              ${isDragging
                ? 'bg-primary/10'
                : 'bg-gray-100 dark:bg-gray-800'
              }
            `}>
              <span className={`
                material-symbols-outlined text-3xl transition-colors
                ${isDragging
                  ? 'text-primary'
                  : 'text-gray-400 dark:text-gray-500'
                }
              `}>
                cloud_upload
              </span>
            </div>

            {/* Main text */}
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
              {isDragging ? 'Drop files here' : getUploadHeaderText()}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 max-w-sm">
              {loanNumber
                ? `Files will be associated with Loan #${loanNumber}`
                : 'Drag and drop your files here, or click to browse'
              }
            </p>

            {/* Accepted file types */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
              {Object.values(ACCEPTED_FILE_TYPES).map((type, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                >
                  <span className={`material-symbols-outlined text-sm ${type.color}`}>
                    {type.icon}
                  </span>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {type.label}
                  </span>
                </div>
              ))}
            </div>

            {/* File size limit */}
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Maximum file size: 10MB
            </p>
          </div>
        </div>
      </div>

      {/* Uploading files progress */}
      {uploadingFiles.size > 0 && (
        <div className="mt-4 space-y-3">
          {Array.from(uploadingFiles.entries()).map(([id, { file, progress, error, downloadUrl }]) => (
            <div
              key={id}
              className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* File icon */}
                  <div className={`
                    flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center
                    ${error ? 'bg-red-100 dark:bg-red-900/20' : 'bg-gray-100 dark:bg-gray-800'}
                  `}>
                    <span className={`
                      material-symbols-outlined text-xl
                      ${error
                        ? 'text-red-600 dark:text-red-400'
                        : ACCEPTED_FILE_TYPES[file.type as keyof typeof ACCEPTED_FILE_TYPES]?.color || 'text-gray-500'
                      }
                    `}>
                      {error ? 'error' : ACCEPTED_FILE_TYPES[file.type as keyof typeof ACCEPTED_FILE_TYPES]?.icon || 'insert_drive_file'}
                    </span>
                  </div>

                  {/* File info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {formatFileSize(file.size)}
                    </p>

                    {/* Progress bar */}
                    {!error && !downloadUrl && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                          <span>Uploading...</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-primary h-full transition-all duration-300 rounded-full"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Error message */}
                    {error && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                        {error}
                      </p>
                    )}

                    {/* Success message */}
                    {downloadUrl && (
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-base">
                          check_circle
                        </span>
                        <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                          Upload complete
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status icon */}
                {downloadUrl && (
                  <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-xl flex-shrink-0">
                    check_circle
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUploadZone;
