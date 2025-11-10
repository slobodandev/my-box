import { useState, useCallback } from 'react'
import { fileService } from '@/services'

export const useFileOperations = () => {
  const [downloading, setDownloading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const downloadFile = useCallback(async (fileId: string, userId: string, filename: string) => {
    setDownloading(true)
    setError(null)

    try {
      const blob = await fileService.downloadFile(fileId, userId)

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()

      // Cleanup
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to download file')
      setError(error)
      throw error
    } finally {
      setDownloading(false)
    }
  }, [])

  const deleteFile = useCallback(async (fileId: string, userId: string) => {
    setDeleting(true)
    setError(null)

    try {
      await fileService.deleteFile(fileId, userId)
      return true
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete file')
      setError(error)
      throw error
    } finally {
      setDeleting(false)
    }
  }, [])

  return {
    downloadFile,
    deleteFile,
    downloading,
    deleting,
    error,
  }
}
