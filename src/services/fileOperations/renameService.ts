/**
 * Rename Service
 * Handles file renaming operations with duplicate validation
 */

import { getUserFiles } from '@/services/fileService';
import { renameFile as renameFileMutation } from '../../../dataconnect/src/__generated/dataconnect';

/**
 * Rename a file
 *
 * @param fileId - The ID of the file to rename
 * @param newName - The new filename
 * @param userId - The user ID (for duplicate checking)
 * @param loanId - Optional loan ID (for duplicate checking within loan)
 * @returns Promise that resolves when rename is complete
 */
export async function renameFile(
  fileId: string,
  newName: string,
  userId: string,
  loanId?: string
): Promise<void> {
  try {
    // Validate new name
    if (!newName || newName.trim() === '') {
      throw new Error('Filename cannot be empty');
    }

    // Check for duplicate filenames in the same context
    const existingFiles = await getUserFiles(userId, false);
    const duplicateInSameLocation = existingFiles.some(
      file =>
        file.id !== fileId && // Not the same file
        file.originalFilename.toLowerCase() === newName.trim().toLowerCase() &&
        file.loanId === loanId // Same loan context (or both null for personal files)
    );

    if (duplicateInSameLocation) {
      throw new Error('A file with this name already exists in this location');
    }

    // Execute rename mutation
    await renameFileMutation({
      id: fileId,
      newFilename: newName.trim(),
    });

    console.log('File renamed successfully to:', newName);
  } catch (error) {
    console.error('Error renaming file:', error);
    throw new Error(`Failed to rename file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validate filename for allowed characters and length
 *
 * @param filename - The filename to validate
 * @returns Object with isValid flag and error message if invalid
 */
export function validateFilename(filename: string): { isValid: boolean; error?: string } {
  // Check if empty
  if (!filename || filename.trim() === '') {
    return { isValid: false, error: 'Filename cannot be empty' };
  }

  // Check length (max 255 characters)
  if (filename.length > 255) {
    return { isValid: false, error: 'Filename is too long (max 255 characters)' };
  }

  // Check for invalid characters (Windows + Unix)
  const invalidChars = /[<>:"/\\|?*\x00-\x1F]/;
  if (invalidChars.test(filename)) {
    return { isValid: false, error: 'Filename contains invalid characters' };
  }

  // Check for reserved names (Windows)
  const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\.|$)/i;
  if (reservedNames.test(filename)) {
    return { isValid: false, error: 'Filename uses a reserved name' };
  }

  return { isValid: true };
}

/**
 * Suggest a unique filename by appending a number
 *
 * @param baseName - The base filename
 * @param existingFiles - Array of existing filenames
 * @returns A unique filename
 */
export function suggestUniqueFilename(baseName: string, existingFiles: string[]): string {
  const nameParts = baseName.match(/^(.+?)(\.[^.]+)?$/);
  if (!nameParts) return baseName;

  const [, name, ext = ''] = nameParts;
  let counter = 1;
  let suggestedName = baseName;

  while (existingFiles.includes(suggestedName)) {
    suggestedName = `${name} (${counter})${ext}`;
    counter++;
  }

  return suggestedName;
}
