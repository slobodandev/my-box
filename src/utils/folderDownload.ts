/**
 * Folder Download Utility
 * Handles downloading folders as ZIP files using streamsaver and conflux
 * Maintains folder structure and supports progress tracking
 */

import { Writer } from '@transcend-io/conflux';
import streamSaver from 'streamsaver';
import { ref, getBlob } from 'firebase/storage';
import { storage } from '@/config/firebase';

/**
 * File information for download
 */
export interface DownloadFileInfo {
  name: string;
  path: string; // Relative path within the folder (e.g., "subfolder/file.pdf")
  storagePath: string; // Firebase storage path
  size: number;
}

/**
 * Options for folder download
 */
export interface FolderDownloadOptions {
  onProgress?: (progress: FolderDownloadProgress) => void;
  onFileStart?: (fileName: string) => void;
  onFileComplete?: (fileName: string) => void;
  onError?: (error: Error, fileName?: string) => void;
  onComplete?: () => void;
  abortController?: AbortController;
}

/**
 * Progress information for folder download
 */
export interface FolderDownloadProgress {
  totalFiles: number;
  completedFiles: number;
  currentFile: string;
  totalBytes: number;
  loadedBytes: number;
  percentage: number;
}

/**
 * Collects all files from a folder structure (FileManagerFile[])
 * Returns files with their relative paths maintained
 */
export function collectFilesFromFolder(
  files: any[], // FileManagerFile[]
  folderPath: string
): DownloadFileInfo[] {
  const result: DownloadFileInfo[] = [];

  // Find all files that are within the specified folder path
  for (const file of files) {
    // Skip directories
    if (file.isDirectory) continue;

    // Check if this file is within the folder
    if (file.path && file.path.startsWith(folderPath + '/')) {
      // Calculate relative path within the folder
      const relativePath = file.path.substring(folderPath.length + 1);

      if (file.storagePath) {
        result.push({
          name: file.name,
          path: relativePath,
          storagePath: file.storagePath,
          size: file.size || 0,
        });
      }
    }
  }

  return result;
}

/**
 * Calculate total size of all files
 */
export function calculateTotalSize(files: DownloadFileInfo[]): number {
  return files.reduce((total, file) => total + (file.size || 0), 0);
}

/**
 * Handle duplicate file names by appending numbers
 */
function handleDuplicateNames(files: DownloadFileInfo[]): DownloadFileInfo[] {
  const nameCount: Record<string, number> = {};
  const result: DownloadFileInfo[] = [];

  for (const file of files) {
    let finalPath = file.path;

    if (nameCount[file.path] !== undefined) {
      // File with same path already exists, add number suffix
      const lastDotIndex = file.path.lastIndexOf('.');
      if (lastDotIndex > 0) {
        const baseName = file.path.substring(0, lastDotIndex);
        const extension = file.path.substring(lastDotIndex);
        finalPath = `${baseName} (${nameCount[file.path] + 1})${extension}`;
      } else {
        finalPath = `${file.path} (${nameCount[file.path] + 1})`;
      }
      nameCount[file.path]++;
    } else {
      nameCount[file.path] = 0;
    }

    result.push({
      ...file,
      path: finalPath,
    });
  }

  return result;
}

/**
 * Download a folder as a ZIP file
 * Uses streaming to handle large folders efficiently
 *
 * @param files - Array of files to include in the ZIP
 * @param folderName - Name for the ZIP file (without .zip extension)
 * @param options - Download options (callbacks for progress, errors, etc.)
 */
export async function downloadFolderAsZip(
  files: DownloadFileInfo[],
  folderName: string,
  options: FolderDownloadOptions = {}
): Promise<void> {
  const {
    onProgress,
    onFileStart,
    onFileComplete,
    onError,
    onComplete,
    abortController,
  } = options;

  if (files.length === 0) {
    throw new Error('No files to download');
  }

  // Handle duplicate file names
  const uniqueFiles = handleDuplicateNames(files);

  const totalFiles = uniqueFiles.length;
  const totalBytes = calculateTotalSize(uniqueFiles);
  let completedFiles = 0;
  let loadedBytes = 0;

  const abortSignal = abortController?.signal;

  // Create an iterator for the files
  const fileIterator = uniqueFiles.values();

  // Create a readable stream that produces file entries for the ZIP
  const myReadable = new ReadableStream({
    async pull(controller) {
      // Check if download was aborted
      if (abortSignal?.aborted) {
        controller.close();
        return;
      }

      const { done, value: fileInfo } = fileIterator.next();

      if (done) {
        controller.close();
        return;
      }

      try {
        onFileStart?.(fileInfo.name);

        // Get blob from Firebase Storage using SDK (handles CORS properly)
        const storageRef = ref(storage, fileInfo.storagePath);
        const blob = await getBlob(storageRef);

        // Convert blob to stream for ZIP processing
        const blobStream = blob.stream();
        const reader = blobStream.getReader();

        // Enqueue the file entry for the ZIP writer
        controller.enqueue({
          name: fileInfo.path,
          stream: () =>
            new ReadableStream({
              async start(innerController) {
                try {
                  while (true) {
                    const { done, value } = await reader.read();

                    if (done) {
                      completedFiles++;
                      onFileComplete?.(fileInfo.name);
                      innerController.close();
                      return;
                    }

                    loadedBytes += value.byteLength;

                    // Report progress
                    onProgress?.({
                      totalFiles,
                      completedFiles,
                      currentFile: fileInfo.name,
                      totalBytes,
                      loadedBytes,
                      percentage: totalBytes > 0
                        ? Math.round((loadedBytes / totalBytes) * 100)
                        : Math.round((completedFiles / totalFiles) * 100),
                    });

                    innerController.enqueue(value);
                  }
                } catch (err) {
                  innerController.error(err);
                }
              },
            }),
        });
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        onError?.(error, fileInfo.name);

        // Continue to next file instead of failing completely
        // Enqueue an empty file to maintain structure
        controller.enqueue({
          name: fileInfo.path,
          stream: () =>
            new ReadableStream({
              start(innerController) {
                completedFiles++;
                innerController.close();
              },
            }),
        });
      }
    },
  });

  // Sanitize folder name for use as filename
  const sanitizedFolderName = folderName.replace(/[/\\?%*:|"<>]/g, '-');

  try {
    // Pipe through the ZIP writer and to the file download stream
    await myReadable
      .pipeThrough(new Writer(), { signal: abortSignal })
      .pipeTo(
        streamSaver.createWriteStream(`${sanitizedFolderName}.zip`, {
          size: totalBytes > 0 ? totalBytes : undefined,
        }),
        { signal: abortSignal }
      );

    onComplete?.();
  } catch (err) {
    if (abortSignal?.aborted) {
      console.log('Download was aborted');
    } else {
      const error = err instanceof Error ? err : new Error(String(err));
      onError?.(error);
      throw error;
    }
  }
}

/**
 * Download multiple selected files as a ZIP
 * Similar to folder download but for arbitrary file selection
 */
export async function downloadFilesAsZip(
  files: DownloadFileInfo[],
  zipName: string = 'download',
  options: FolderDownloadOptions = {}
): Promise<void> {
  // For flat file downloads, use just the filename (no path)
  const flatFiles = files.map((file) => ({
    ...file,
    path: file.name, // Use just the filename for flat structure
  }));

  return downloadFolderAsZip(flatFiles, zipName, options);
}

/**
 * Check if a folder has downloadable files
 */
export function hasDownloadableFiles(
  files: any[], // FileManagerFile[]
  folderPath: string
): boolean {
  for (const file of files) {
    if (file.isDirectory) continue;
    if (file.path && file.path.startsWith(folderPath + '/') && file.storagePath) {
      return true;
    }
  }
  return false;
}

/**
 * Get folder statistics (file count and total size)
 */
export function getFolderStats(
  files: any[], // FileManagerFile[]
  folderPath: string
): { fileCount: number; totalSize: number } {
  let fileCount = 0;
  let totalSize = 0;

  for (const file of files) {
    if (file.isDirectory) continue;
    if (file.path && file.path.startsWith(folderPath + '/') && file.storagePath) {
      fileCount++;
      totalSize += file.size || 0;
    }
  }

  return { fileCount, totalSize };
}
