/**
 * Delete Service
 * Handles file deletion operations with soft delete support
 */

import { getStorage, ref, deleteObject } from 'firebase/storage';
import { softDeleteFile as softDeleteFileMutation, restoreFile as restoreFileMutation } from '../../../dataconnect/src/__generated/dataconnect';

/**
 * Soft delete a file by marking it as deleted in the database
 * The actual storage blob is preserved for potential recovery
 *
 * @param fileId - The ID of the file to delete
 * @returns Promise that resolves when deletion is complete
 */
export async function deleteFile(fileId: string): Promise<void> {
  try {
    // Soft delete - mark as deleted in database, preserve blob
    await softDeleteFileMutation({
      id: fileId,
      deletedBy: null, // TODO: Pass current user ID when available
      deletedAt: new Date().toISOString(),
    });

    console.log('File soft-deleted successfully:', fileId);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Permanently delete a file from both database and storage
 * This is irreversible and should be used with caution
 *
 * @param fileId - The ID of the file to permanently delete
 * @param storagePath - The path to the file in Firebase Storage
 * @returns Promise that resolves when permanent deletion is complete
 */
export async function permanentlyDeleteFile(fileId: string, storagePath: string): Promise<void> {
  try {
    const storage = getStorage();
    const fileRef = ref(storage, storagePath);

    // Delete from storage
    await deleteObject(fileRef);

    // Delete from database
    // TODO: Implement DataConnect mutation
    // await hardDeleteFile({ fileId });

    console.log('Permanently deleted file:', fileId);
  } catch (error) {
    console.error('Error permanently deleting file:', error);
    throw new Error(`Failed to permanently delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Bulk delete multiple files
 *
 * @param fileIds - Array of file IDs to delete
 * @returns Promise that resolves when all files are deleted
 */
export async function bulkDeleteFiles(fileIds: string[]): Promise<void> {
  try {
    // Delete files in parallel
    await Promise.all(fileIds.map(fileId => deleteFile(fileId)));

    console.log(`Successfully deleted ${fileIds.length} files`);
  } catch (error) {
    console.error('Error in bulk delete:', error);
    throw new Error(`Bulk delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Restore a soft-deleted file
 *
 * @param fileId - The ID of the file to restore
 * @returns Promise that resolves when file is restored
 */
export async function restoreFile(fileId: string): Promise<void> {
  try {
    // Restore file by clearing deleted flags
    await restoreFileMutation({
      id: fileId,
    });

    console.log('File restored successfully:', fileId);
  } catch (error) {
    console.error('Error restoring file:', error);
    throw new Error(`Failed to restore file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
