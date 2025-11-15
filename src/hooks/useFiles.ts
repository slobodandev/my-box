/**
 * File Operation Hooks
 * Specialized hooks for file management operations
 */

import { useCloudFunctionMutation, useCloudFunctionQuery } from './useCloudFunction';
import { CloudFunction } from '@/config/cloudFunctions';

/**
 * List Files Types
 */
export interface ListFilesRequest {
  loanId?: string;
  searchTerm?: string;
  personalOnly?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: 'filename' | 'size' | 'uploadedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface FileItem {
  id: string;
  originalFilename: string;
  storagePath: string;
  fileSize: number;
  mimeType: string;
  fileExtension: string;
  uploadedAt: string;
  tags?: string;
  description?: string;
  downloadUrl?: string;
  loanIds: string[];
}

export interface ListFilesResponse {
  success: boolean;
  files: FileItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  message?: string;
}

/**
 * Delete File Types
 */
export interface DeleteFileRequest {
  fileId: string;
}

export interface DeleteFileResponse {
  success: boolean;
  message: string;
  fileId?: string;
}

/**
 * Process Upload Types
 */
export interface ProcessUploadRequest {
  userId: string;
  storagePath: string;
  originalFilename: string;
  loanIds?: string[];
  tags?: string[];
  description?: string;
}

export interface ProcessUploadResponse {
  success: boolean;
  fileId: string;
  downloadUrl: string;
  message: string;
}

/**
 * Hook to list files
 * Auto-executes by default, can be disabled with enabled: false
 * 
 * @example
 * // Auto-fetch on mount
 * const { data, loading, error, refetch } = useListFiles({
 *   page: 1,
 *   pageSize: 10
 * });
 * 
 * @example
 * // Manual fetch
 * const { execute, data, loading } = useListFiles(
 *   { page: 1 },
 *   { autoExecute: false }
 * );
 * await execute({ page: 1, searchTerm: 'contract' });
 */
export function useListFiles(
  _initialPayload?: ListFilesRequest,
  options?: {
    autoExecute?: boolean;
    enabled?: boolean;
    onSuccess?: (data: ListFilesResponse) => void;
    onError?: (error: Error) => void;
  }
) {
  const { autoExecute = true, ...restOptions } = options || {};

  return useCloudFunctionQuery<ListFilesResponse, ListFilesRequest>(
    CloudFunction.LIST_FILES,
    {
      autoExecute,
      requiresAuth: true,
      ...restOptions,
    }
  );
}

/**
 * Hook to delete a file (soft delete)
 * 
 * @example
 * const { execute, loading, error } = useDeleteFile({
 *   onSuccess: () => {
 *     toast.success('File deleted');
 *     refetchFiles();
 *   },
 * });
 * 
 * await execute({ fileId: 'file-123' });
 */
export function useDeleteFile(options?: {
  onSuccess?: (data: DeleteFileResponse) => void;
  onError?: (error: Error) => void;
}) {
  return useCloudFunctionMutation<DeleteFileResponse, DeleteFileRequest>(
    CloudFunction.DELETE_FILE,
    {
      requiresAuth: true,
      ...options,
    }
  );
}

/**
 * Hook to process file upload
 * 
 * @example
 * const { execute, loading, error, data } = useProcessUpload({
 *   onSuccess: (data) => {
 *     console.log('File uploaded:', data.fileId);
 *   },
 * });
 * 
 * await execute({
 *   userId: 'user-123',
 *   storagePath: 'path/to/file.pdf',
 *   originalFilename: 'document.pdf',
 *   tags: ['contract', 'signed'],
 * });
 */
export function useProcessUpload(options?: {
  onSuccess?: (data: ProcessUploadResponse) => void;
  onError?: (error: Error) => void;
}) {
  return useCloudFunctionMutation<ProcessUploadResponse, ProcessUploadRequest>(
    CloudFunction.PROCESS_UPLOAD,
    {
      requiresAuth: true,
      ...options,
    }
  );
}

/**
 * Hook to generate download URL
 * 
 * @example
 * const { execute, data, loading } = useGenerateDownloadUrl();
 * const result = await execute({ fileId: 'file-123', expiryMinutes: 60 });
 * window.open(result.downloadUrl);
 */
export function useGenerateDownloadUrl(options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}) {
  return useCloudFunctionMutation(
    CloudFunction.GENERATE_DOWNLOAD_URL,
    {
      requiresAuth: true,
      ...options,
    }
  );
}
