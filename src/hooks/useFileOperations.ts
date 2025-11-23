import { useState, useCallback } from 'react'
import { fileService } from '@/services'

export const useFileOperations = () => {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const deleteFile = useCallback(async (fileId: string, storagePath: string) => {
    setDeleting(true)
    setError(null)

    try {
      await fileService.deleteFile(fileId, storagePath)
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
    deleteFile,
    deleting,
    error,
  }
}
