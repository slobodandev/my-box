/**
 * Download Service
 * Handles file download operations with signed URL generation
 */

import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { getFileMetadata } from '@/services/fileService';

/**
 * Download a file by generating a signed URL and triggering browser download
 *
 * @param fileId - The ID of the file to download
 * @returns Promise that resolves when download is initiated
 */
export async function downloadFile(fileId: string): Promise<void> {
  try {
    // Get file metadata to retrieve storage path
    const fileMetadata = await getFileMetadata(fileId);

    if (!fileMetadata) {
      throw new Error('File not found');
    }

    // Generate signed download URL from Firebase Storage
    const storage = getStorage();
    const fileRef = ref(storage, fileMetadata.storagePath);
    const downloadUrl = await getDownloadURL(fileRef);

    // Trigger browser download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileMetadata.originalFilename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log('Download initiated for:', fileMetadata.originalFilename);
  } catch (error) {
    console.error('Error downloading file:', error);
    throw new Error(`Failed to download file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get a temporary signed URL for file preview
 *
 * @param fileId - The ID of the file
 * @returns Promise that resolves with the signed URL
 */
export async function getFilePreviewUrl(fileId: string): Promise<string> {
  try {
    // Get file metadata
    const fileMetadata = await getFileMetadata(fileId);

    if (!fileMetadata) {
      throw new Error('File not found');
    }

    // Generate signed URL (valid for 1 hour)
    const storage = getStorage();
    const fileRef = ref(storage, fileMetadata.storagePath);
    const previewUrl = await getDownloadURL(fileRef);

    return previewUrl;
  } catch (error) {
    console.error('Error getting preview URL:', error);
    throw new Error(`Failed to get preview URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Bulk download multiple files as a ZIP archive
 *
 * @param fileIds - Array of file IDs to download
 * @returns Promise that resolves when ZIP download is initiated
 */
export async function bulkDownloadFiles(fileIds: string[]): Promise<void> {
  try {
    // TODO: Implement server-side ZIP generation
    // For now, download files individually
    for (const fileId of fileIds) {
      await downloadFile(fileId);
      // Add small delay to avoid browser blocking multiple downloads
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`Downloaded ${fileIds.length} files`);

    // Future implementation:
    // const response = await fetch('/api/bulk-download', {
    //   method: 'POST',
    //   body: JSON.stringify({ fileIds }),
    // });
    // const blob = await response.blob();
    // // Trigger ZIP download
  } catch (error) {
    console.error('Error in bulk download:', error);
    throw new Error(`Bulk download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
