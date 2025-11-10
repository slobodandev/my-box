import axios from 'axios'
import type {
  File,
  FileListParams,
  FileListResponse,
  N8nWebhookResponse,
} from '@/types'

/**
 * n8n File Service - Handles all file-related operations via n8n webhooks
 */
class FileService {
  private getWebhookUrl(endpoint: string): string {
    const baseUrl = import.meta.env.VITE_N8N_BASE_URL
    return `${baseUrl}/webhook/${endpoint}`
  }

  /**
   * Get list of files with filters and pagination
   */
  async getFiles(params: FileListParams): Promise<FileListResponse> {
    try {
      const url = this.getWebhookUrl('file-list')
      const response = await axios.post<N8nWebhookResponse<FileListResponse>>(url, params)

      if (response.data.success && response.data.data) {
        return response.data.data
      }

      throw new Error(response.data.error || 'Failed to fetch files')
    } catch (error) {
      console.error('Error fetching files:', error)
      throw error
    }
  }

  /**
   * Upload a file with optional loan associations
   */
  async uploadFile(
    file: globalThis.File,
    userId: string,
    loanIds?: string[],
    tags?: string[]
  ): Promise<File> {
    try {
      const url = this.getWebhookUrl('file-upload')
      const formData = new FormData()
      formData.append('file', file)
      formData.append('userId', userId)

      if (loanIds && loanIds.length > 0) {
        formData.append('loanIds', JSON.stringify(loanIds))
      }

      if (tags && tags.length > 0) {
        formData.append('tags', JSON.stringify(tags))
      }

      const response = await axios.post<N8nWebhookResponse<File>>(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.data.success && response.data.data) {
        return response.data.data
      }

      throw new Error(response.data.error || 'Failed to upload file')
    } catch (error) {
      console.error('Error uploading file:', error)
      throw error
    }
  }

  /**
   * Download a file by ID
   */
  async downloadFile(fileId: string, userId: string): Promise<Blob> {
    try {
      const url = this.getWebhookUrl('file-download')
      const response = await axios.post(
        url,
        { fileId, userId },
        {
          responseType: 'blob',
        }
      )

      return response.data
    } catch (error) {
      console.error('Error downloading file:', error)
      throw error
    }
  }

  /**
   * Delete a file by ID (soft delete)
   */
  async deleteFile(fileId: string, userId: string): Promise<void> {
    try {
      const url = this.getWebhookUrl('file-delete')
      const response = await axios.post<N8nWebhookResponse<void>>(url, {
        fileId,
        userId,
      })

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to delete file')
      }
    } catch (error) {
      console.error('Error deleting file:', error)
      throw error
    }
  }

  /**
   * Get file by ID
   */
  async getFileById(fileId: string, userId: string): Promise<File> {
    try {
      // Use the file-list endpoint with fileId filter
      const response = await this.getFiles({
        userId,
        page: 1,
        pageSize: 1,
        searchTerm: fileId, // Temporary solution - should be enhanced in n8n workflow
      })

      if (response.files.length > 0) {
        return response.files[0]
      }

      throw new Error('File not found')
    } catch (error) {
      console.error('Error fetching file:', error)
      throw error
    }
  }
}

export const fileService = new FileService()
