import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { getFileIcon, formatFileSize } from '@/utils'
import { getUserFiles } from '@/services/fileService'
import { deleteFile } from '@/services/fileOperations'
import { getLoan, type Loan } from '@/services/dataconnect/loanService'
import { useAuth } from '@/contexts/AuthContext'
import { ref, getDownloadURL, getBlob } from 'firebase/storage'
import { storage } from '@/config/firebase'

interface FileListProps {
  searchTerm: string
  userId?: string | null
  loanId?: string | null
  showPersonalOnly: boolean
}

export default function FileList({ searchTerm, userId, loanId, showPersonalOnly }: FileListProps) {
  const { user } = useAuth()
  const [currentPage, setCurrentPage] = useState(1)
  const [files, setFiles] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [loanCache, setLoanCache] = useState<Map<string, Loan>>(new Map())
  const pageSize = 5

  // Determine which user's files to fetch
  const targetUserId = userId || user?.id

  // Fetch files from Data Connect
  const fetchFiles = async () => {
    if (!targetUserId) return

    setLoading(true)
    setError(null)

    try {
      const allFiles = await getUserFiles(targetUserId, false)

      // Apply filters
      let filtered = allFiles

      // Filter by search term
      if (searchTerm) {
        filtered = filtered.filter((file: any) =>
          file.originalFilename.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }

      // Filter by loan
      if (loanId) {
        filtered = filtered.filter((file: any) => file.loanId === loanId)
      }

      // Filter personal files only (files without loanId)
      if (showPersonalOnly) {
        filtered = filtered.filter((file: any) => !file.loanId)
      }

      setFiles(filtered)

      // Fetch loan information for files with loanId
      const uniqueLoanIds = [...new Set(filtered.filter((f: any) => f.loanId).map((f: any) => f.loanId))]
      const newLoanCache = new Map(loanCache)

      await Promise.all(
        uniqueLoanIds.map(async (lId: string) => {
          if (!newLoanCache.has(lId)) {
            try {
              const loan = await getLoan(lId)
              if (loan) {
                newLoanCache.set(lId, loan)
              }
            } catch (err) {
              console.error(`Failed to fetch loan ${lId}:`, err)
            }
          }
        })
      )

      setLoanCache(newLoanCache)
    } catch (err: any) {
      console.error('Error fetching files:', err)
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, userId, loanId, showPersonalOnly])

  // Fetch files when user changes or filters change
  useEffect(() => {
    fetchFiles()
  }, [targetUserId, searchTerm, loanId, showPersonalOnly])

  const startIndex = (currentPage - 1) * pageSize
  const paginatedFiles = files.slice(startIndex, startIndex + pageSize)
  const total = files.length
  const totalPages = Math.ceil(total / pageSize)

  const handleDownload = async (file: any) => {
    try {
      if (!file.storagePath) {
        alert('Unable to download file. Storage path not found.')
        return
      }

      // Get blob from Firebase Storage (CORS is now configured)
      const storageRef = ref(storage, file.storagePath)
      const blob = await getBlob(storageRef)

      // Create blob URL and trigger download
      const blobUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = file.originalFilename
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Clean up blob URL
      setTimeout(() => URL.revokeObjectURL(blobUrl), 100)
    } catch (error) {
      console.error('Error downloading file:', error)
      alert('Failed to download file. Please check your permissions.')
    }
  }

  const handlePreview = async (file: any) => {
    try {
      let downloadUrl = file.downloadUrl

      // If no downloadUrl in database, generate it from storagePath
      if (!downloadUrl && file.storagePath) {
        const storageRef = ref(storage, file.storagePath)
        downloadUrl = await getDownloadURL(storageRef)
      }

      if (downloadUrl) {
        window.open(downloadUrl, '_blank')
      } else {
        console.error('No download URL available for file:', file.id)
        alert('Unable to preview file. Please try again later.')
      }
    } catch (error) {
      console.error('Error previewing file:', error)
      alert('Failed to preview file. Please check your permissions.')
    }
  }

  const handleDelete = async (file: any) => {
    // Simple confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to delete "${file.originalFilename}"? This action cannot be undone.`
    )

    if (!confirmed) return

    try {
      await deleteFile(file.id)
      alert('File deleted successfully')
      // Refresh the file list
      fetchFiles()
    } catch (error: any) {
      console.error('Error deleting file:', error)
      alert(error.message || 'Failed to delete file. Please try again.')
    }
  }

  return (
    <>
      {/* Table */}
      <div className="mt-4">
        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="w-1/2 text-left font-semibold text-gray-500 dark:text-gray-400 py-3 px-4 uppercase tracking-wider text-xs">
                  File Name
                </th>
                <th className="text-left font-semibold text-gray-500 dark:text-gray-400 py-3 px-4 uppercase tracking-wider text-xs">
                  Size
                </th>
                <th className="text-left font-semibold text-gray-500 dark:text-gray-400 py-3 px-4 uppercase tracking-wider text-xs">
                  Date
                </th>
                <th className="text-left font-semibold text-gray-500 dark:text-gray-400 py-3 px-4 uppercase tracking-wider text-xs">
                  Associated Loans
                </th>
                <th className="text-left font-semibold text-gray-500 dark:text-gray-400 py-3 px-4 uppercase tracking-wider text-xs">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="h-[72px] px-4 py-2 text-center text-gray-500 dark:text-gray-400">
                    Loading files...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="h-[72px] px-4 py-2 text-center text-red-500">
                    Error loading files: {error.message}
                  </td>
                </tr>
              ) : files.length === 0 ? (
                <tr>
                  <td colSpan={5} className="h-[72px] px-4 py-2 text-center text-gray-500 dark:text-gray-400">
                    No files found
                  </td>
                </tr>
              ) : (
                paginatedFiles.map((file: any) => {
                  const fileIcon = getFileIcon(file.originalFilename)
                  return (
                    <tr key={file.id} className="hover:bg-gray-50 dark:hover:bg-white/5 border-b border-gray-200 dark:border-gray-700 last:border-0">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center ${fileIcon.bgColor} rounded-md`}>
                            <span className={`material-symbols-outlined text-lg ${fileIcon.color}`}>
                              {fileIcon.icon}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {file.originalFilename}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-500 dark:text-gray-400 text-sm">
                        {formatFileSize(file.fileSize)}
                      </td>
                      <td className="py-4 px-4 text-gray-500 dark:text-gray-400 text-sm">
                        {format(new Date(file.uploadedAt), 'MMM dd, yyyy')}
                      </td>
                      <td className="py-4 px-4">
                        {file.loanId ? (
                          <div className="flex items-center space-x-1.5">
                            <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 text-xs font-semibold px-2 py-1 rounded-full">
                              {loanCache.get(file.loanId)?.loanNumber || `#${file.loanId.substring(0, 8)}...`}
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                            Personal File
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handlePreview(file)}
                            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-700 dark:hover:text-gray-200"
                            title="Preview file"
                          >
                            <span className="material-symbols-outlined text-base">visibility</span>
                          </button>
                          <button
                            onClick={() => handleDownload(file)}
                            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-700 dark:hover:text-gray-200"
                            title="Download file"
                          >
                            <span className="material-symbols-outlined text-base">download</span>
                          </button>
                          <button
                            onClick={() => handleDelete(file)}
                            className="p-2 rounded-lg text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300"
                            title="Delete file"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 px-2">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Showing <span className="font-medium">{total > 0 ? startIndex + 1 : 0}</span> to{' '}
          <span className="font-medium">{Math.min(startIndex + pageSize, total)}</span> of{' '}
          <span className="font-medium">{total}</span> results
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center justify-center size-8 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-lg">chevron_left</span>
          </button>

          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`flex items-center justify-center size-8 rounded-lg text-sm ${
                currentPage === page
                  ? 'bg-primary/10 dark:bg-primary/20 text-primary font-bold'
                  : 'hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 font-medium'
              }`}
            >
              {page}
            </button>
          ))}

          {totalPages > 5 && (
            <>
              <span className="text-gray-500 dark:text-gray-400">...</span>
              <button className="flex items-center justify-center size-8 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 font-medium text-sm">
                {totalPages}
              </button>
            </>
          )}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center justify-center size-8 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-lg">chevron_right</span>
          </button>
        </div>
      </div>
    </>
  )
}
