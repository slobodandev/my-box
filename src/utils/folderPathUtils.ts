/**
 * Utility functions for parsing folder paths and extracting upload context
 */

export interface UploadContext {
  userId?: string;
  loanId?: string;
  borrowerName?: string;
  loanNumber?: string;
}

/**
 * Parse a folder path and extract upload context (userId, loanId, etc.)
 * Uses the metadata stored by FileFolderManager
 *
 * Path examples:
 * - "/Personal Files" → current user, no loan
 * - "/Borrowers/Jane Smith/Personal Files" → borrower Jane Smith, no loan
 * - "/Borrowers/Jane Smith/Loan 736282" → borrower Jane Smith, loan 736282
 */
export function parseUploadContext(folderPath: string, currentUserId: string): UploadContext {
  // Get metadata from window (set by FileFolderManager)
  const metadata = (window as any).__folderPathMetadata || {};

  // Direct path lookup
  if (metadata[folderPath]) {
    return {
      userId: metadata[folderPath].userId || currentUserId,
      loanId: metadata[folderPath].loanId,
    };
  }

  // Extract from path if no exact match (for nested paths)
  // Try parent paths
  const segments = folderPath.split('/').filter(Boolean);

  // Build parent paths and check
  for (let i = segments.length; i > 0; i--) {
    const parentPath = '/' + segments.slice(0, i).join('/');
    if (metadata[parentPath]) {
      return {
        userId: metadata[parentPath].userId || currentUserId,
        loanId: metadata[parentPath].loanId,
      };
    }
  }

  // Default to current user if no match found
  return {
    userId: currentUserId,
  };
}

/**
 * Get a human-readable description of where files will be uploaded
 */
export function getUploadLocationDescription(context: UploadContext, currentUserName?: string): string {
  if (!context.userId) {
    return 'Upload your files';
  }

  // Check if uploading to own files
  if (context.borrowerName) {
    if (context.loanNumber) {
      return `Upload files for ${context.borrowerName} - Loan #${context.loanNumber}`;
    } else {
      return `Upload files for ${context.borrowerName}`;
    }
  } else {
    if (context.loanNumber) {
      return `Upload files for Loan #${context.loanNumber}`;
    } else {
      return currentUserName ? `Upload files for ${currentUserName}` : 'Upload your files';
    }
  }
}
