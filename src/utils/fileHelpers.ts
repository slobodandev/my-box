import type { FileType, FileIcon } from '@/types'

/**
 * Format file size in bytes to human-readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

/**
 * Get file extension from filename
 */
export const getFileExtension = (filename: string): string => {
  const parts = filename.split('.')
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ''
}

/**
 * Get file type from filename
 */
export const getFileType = (filename: string): FileType => {
  const ext = getFileExtension(filename)
  const typeMap: Record<string, FileType> = {
    pdf: 'pdf',
    doc: 'doc',
    docx: 'docx',
    xls: 'xls',
    xlsx: 'xlsx',
    jpg: 'jpg',
    jpeg: 'jpeg',
    png: 'png',
  }
  return typeMap[ext] || 'other'
}

/**
 * Get Material Symbols icon and color for file type
 */
export const getFileIcon = (filename: string): FileIcon => {
  const ext = getFileExtension(filename)
  const iconMap: Record<string, FileIcon> = {
    pdf: { icon: 'picture_as_pdf', color: 'text-red-500' },
    doc: { icon: 'description', color: 'text-blue-500' },
    docx: { icon: 'description', color: 'text-blue-500' },
    jpg: { icon: 'image', color: 'text-green-500' },
    jpeg: { icon: 'image', color: 'text-green-500' },
    png: { icon: 'image', color: 'text-green-500' },
    xls: { icon: 'table_chart', color: 'text-green-600' },
    xlsx: { icon: 'table_chart', color: 'text-green-600' },
  }
  return iconMap[ext] || { icon: 'insert_drive_file', color: 'text-gray-500' }
}

/**
 * Validate file type against allowed types
 */
export const isFileTypeAllowed = (filename: string, allowedTypes: string[]): boolean => {
  const ext = getFileExtension(filename)
  return allowedTypes.includes(ext)
}

/**
 * Validate file size against max size
 */
export const isFileSizeValid = (sizeInBytes: number, maxSizeInMB: number): boolean => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024
  return sizeInBytes <= maxSizeInBytes
}

/**
 * Generate a safe filename by removing special characters
 */
export const sanitizeFilename = (filename: string): string => {
  const ext = getFileExtension(filename)
  const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.'))
  const sanitized = nameWithoutExt.replace(/[^a-zA-Z0-9_-]/g, '_')
  return ext ? `${sanitized}.${ext}` : sanitized
}
