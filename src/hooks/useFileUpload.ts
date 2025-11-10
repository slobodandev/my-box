import { useState, useCallback } from 'react'
import { fileService } from '@/services'
import type { File } from '@/types'

interface UploadProgress {
  percent: number
  status: 'idle' | 'uploading' | 'success' | 'error'
}

export const useFileUpload = () => {
  const [progress, setProgress] = useState<UploadProgress>({
    percent: 0,
    status: 'idle',
  })
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [error, setError] = useState<Error | null>(null)

  const uploadFile = useCallback(
    async (file: globalThis.File, userId: string, loanIds?: string[], tags?: string[]) => {
      setProgress({ percent: 0, status: 'uploading' })
      setError(null)
      setUploadedFile(null)

      try {
        // Simulate progress (in real implementation, you'd track actual upload progress)
        setProgress({ percent: 50, status: 'uploading' })

        const result = await fileService.uploadFile(file, userId, loanIds, tags)

        setProgress({ percent: 100, status: 'success' })
        setUploadedFile(result)

        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to upload file')
        setError(error)
        setProgress({ percent: 0, status: 'error' })
        throw error
      }
    },
    []
  )

  const reset = useCallback(() => {
    setProgress({ percent: 0, status: 'idle' })
    setUploadedFile(null)
    setError(null)
  }, [])

  return {
    uploadFile,
    progress,
    uploadedFile,
    error,
    isUploading: progress.status === 'uploading',
    isSuccess: progress.status === 'success',
    isError: progress.status === 'error',
    reset,
  }
}
