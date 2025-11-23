/**
 * Move and Copy Service
 * Handles file move and copy operations between users/loans
 */

import { moveFile as moveFileMutation, copyFile as copyFileMutation } from '../../../dataconnect/src/__generated/dataconnect';
import { getFileMetadata } from '@/services/fileService';

/**
 * Move a file to a different user or loan
 * Updates the userId and loanId in the database
 *
 * @param fileId - The ID of the file to move
 * @param targetUserId - The target user ID
 * @param targetLoanId - Optional target loan ID (null for personal files)
 * @returns Promise that resolves when move is complete
 */
export async function moveFile(
  fileId: string,
  targetUserId: string,
  targetLoanId?: string | null
): Promise<void> {
  try {
    // Execute move mutation - updates userId and loanId
    await moveFileMutation({
      id: fileId,
      targetUserId,
      targetLoanId: targetLoanId || null,
    });

    console.log('File moved successfully:', fileId, 'to:', { targetUserId, targetLoanId });
  } catch (error) {
    console.error('Error moving file:', error);
    throw new Error(`Failed to move file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Copy a file to a different user or loan
 * Creates a new database record with the same storage path
 *
 * @param fileId - The ID of the file to copy
 * @param targetUserId - The target user ID
 * @param targetLoanId - Optional target loan ID (null for personal files)
 * @returns Promise that resolves with the new file ID
 */
export async function copyFile(
  fileId: string,
  targetUserId: string,
  targetLoanId?: string | null
): Promise<string> {
  try {
    // Get original file metadata
    const originalFile = await getFileMetadata(fileId);
    if (!originalFile) {
      throw new Error('Original file not found');
    }

    // Create a copy - new database record with same storage path
    const result = await copyFileMutation({
      userId: targetUserId,
      loanId: targetLoanId || null,
      originalFilename: originalFile.originalFilename,
      storagePath: originalFile.storagePath,
      fileSize: originalFile.fileSize,
      mimeType: originalFile.mimeType || null,
      fileExtension: originalFile.fileExtension,
      downloadUrl: originalFile.downloadUrl || null,
      tags: originalFile.tags || null,
      description: originalFile.description || null,
    });

    console.log('File copied successfully:', fileId, 'to:', { targetUserId, targetLoanId });

    // Return the new file ID from the insert
    return (result.data as any).file_insert.id;
  } catch (error) {
    console.error('Error copying file:', error);
    throw new Error(`Failed to copy file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Bulk move multiple files
 *
 * @param fileIds - Array of file IDs to move
 * @param targetUserId - The target user ID
 * @param targetLoanId - Optional target loan ID
 * @returns Promise that resolves when all files are moved
 */
export async function bulkMoveFiles(
  fileIds: string[],
  targetUserId: string,
  targetLoanId?: string | null
): Promise<void> {
  try {
    // Move files in parallel
    await Promise.all(
      fileIds.map(fileId => moveFile(fileId, targetUserId, targetLoanId))
    );

    console.log(`Successfully moved ${fileIds.length} files`);
  } catch (error) {
    console.error('Error in bulk move:', error);
    throw new Error(`Bulk move failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Bulk copy multiple files
 *
 * @param fileIds - Array of file IDs to copy
 * @param targetUserId - The target user ID
 * @param targetLoanId - Optional target loan ID
 * @returns Promise that resolves with array of new file IDs
 */
export async function bulkCopyFiles(
  fileIds: string[],
  targetUserId: string,
  targetLoanId?: string | null
): Promise<string[]> {
  try {
    // Copy files in parallel
    const newFileIds = await Promise.all(
      fileIds.map(fileId => copyFile(fileId, targetUserId, targetLoanId))
    );

    console.log(`Successfully copied ${fileIds.length} files`);
    return newFileIds;
  } catch (error) {
    console.error('Error in bulk copy:', error);
    throw new Error(`Bulk copy failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
