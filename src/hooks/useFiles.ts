import { useState, useEffect, useCallback } from 'react'
import { fileService } from '@/services'
import type { File, FileListParams, FileListResponse } from '@/types'

interface UseFilesOptions {
  userId: string
  loanId?: string
  searchTerm?: string
  personalOnly?: boolean
  page?: number
  pageSize?: number
  autoFetch?: boolean
}

export const useFiles = (options: UseFilesOptions) => {
  const [files, setFiles] = useState<File[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchFiles = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params: FileListParams = {
        userId: options.userId,
        loanId: options.loanId,
        searchTerm: options.searchTerm,
        personalOnly: options.personalOnly,
        page: options.page || 1,
        pageSize: options.pageSize || 10,
      }

      const response: FileListResponse = await fileService.getFiles(params)

      setFiles(response.files)
      setTotal(response.total)
      setTotalPages(response.totalPages)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch files'))
    } finally {
      setLoading(false)
    }
  }, [
    options.userId,
    options.loanId,
    options.searchTerm,
    options.personalOnly,
    options.page,
    options.pageSize,
  ])

  useEffect(() => {
    if (options.autoFetch !== false) {
      fetchFiles()
    }
  }, [fetchFiles, options.autoFetch])

  const refresh = useCallback(() => {
    fetchFiles()
  }, [fetchFiles])

  return {
    files,
    total,
    totalPages,
    loading,
    error,
    refresh,
    fetchFiles,
  }
}
