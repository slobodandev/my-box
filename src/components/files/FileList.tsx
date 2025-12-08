import { useState, useEffect, useRef } from 'react'
import { format } from 'date-fns'
import { getFileIcon, formatFileSize } from '@/utils'
import { getUserFiles } from '@/services/fileService'
import { deleteFile } from '@/services/fileOperations'
import { getLoan, type Loan } from '@/services/dataconnect/loanService'
import { getDocumentMaster } from '@/services/dataconnect/documentMasterService'
import { useAuth } from '@/contexts/AuthContext'
import { ref, getDownloadURL, getBlob } from 'firebase/storage'
import { storage } from '@/config/firebase'
import {
  downloadFilesAsZip,
  type DownloadFileInfo,
  type FolderDownloadProgress,
} from '@/utils/folderDownload'
import { modal } from '@/utils/modal'
import {
  applyNamingConvention,
  buildNamingConventionContext,
} from '@/utils/namingConvention'

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

  // Multi-select state for bulk download
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
  const [isDownloadingBulk, setIsDownloadingBulk] = useState(false)
  const [bulkDownloadProgress, setBulkDownloadProgress] = useState<FolderDownloadProgress | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

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
        modal.warning('Unable to download file. Storage path not found.')
        return
      }

      // Determine final filename (with naming convention if applicable)
      let downloadFilename = file.originalFilename

      if (file.documentMasterId) {
        try {
          const docMaster = await getDocumentMaster(file.documentMasterId)

          if (docMaster?.namingConvention) {
            // Build context for naming convention
            let loanData = undefined
            if (file.loanId) {
              const loan = loanCache.get(file.loanId) || await getLoan(file.loanId)
              if (loan) {
                loanData = { id: loan.id, loanNumber: loan.loanNumber }
              }
            }

            const context = buildNamingConventionContext({
              loan: loanData,
              user: user ? {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
              } : undefined,
              uploadedAt: file.uploadedAt,
            })

            // Apply naming convention
            const result = applyNamingConvention({
              pattern: docMaster.namingConvention,
              context,
              originalFilename: file.originalFilename,
              isVersioningEnabled: docMaster.isVersioningEnabled,
            })

            if (result.success && result.renamedFilename !== file.originalFilename) {
              downloadFilename = result.renamedFilename
            }
          }
        } catch (ncError) {
          // If naming convention fails, continue with original filename
          console.error('Error applying naming convention:', ncError)
        }
      }

      // Get blob from Firebase Storage (CORS is now configured)
      const storageRef = ref(storage, file.storagePath)
      const blob = await getBlob(storageRef)

      // Create blob URL and trigger download
      const blobUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = downloadFilename
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Clean up blob URL
      setTimeout(() => URL.revokeObjectURL(blobUrl), 100)
    } catch (error) {
      console.error('Error downloading file:', error)
      modal.error('Failed to download file. Please check your permissions.')
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
        modal.warning('Unable to preview file. Please try again later.')
      }
    } catch (error) {
      console.error('Error previewing file:', error)
      modal.error('Failed to preview file. Please check your permissions.')
    }
  }

  const handleDelete = async (file: any) => {
    const confirmed = await modal.deleteConfirm(file.originalFilename)

    if (!confirmed) return

    try {
      await deleteFile(file.id)
      modal.success('File deleted successfully')
      // Refresh the file list
      fetchFiles()
    } catch (error: any) {
      console.error('Error deleting file:', error)
      modal.error(error.message || 'Failed to delete file. Please try again.')
    }
  }

  // Toggle file selection
  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(fileId)) {
        newSet.delete(fileId)
      } else {
        newSet.add(fileId)
      }
      return newSet
    })
  }

  // Select all files on current page
  const selectAllOnPage = () => {
    const allSelected = paginatedFiles.every((f: any) => selectedFiles.has(f.id))
    if (allSelected) {
      // Deselect all on page
      setSelectedFiles((prev) => {
        const newSet = new Set(prev)
        paginatedFiles.forEach((f: any) => newSet.delete(f.id))
        return newSet
      })
    } else {
      // Select all on page
      setSelectedFiles((prev) => {
        const newSet = new Set(prev)
        paginatedFiles.forEach((f: any) => newSet.add(f.id))
        return newSet
      })
    }
  }

  // Clear all selections
  const clearSelection = () => {
    setSelectedFiles(new Set())
  }

  // Download selected files as ZIP
  const handleBulkDownload = async () => {
    if (selectedFiles.size === 0) {
      modal.warning('Please select files to download.')
      return
    }

    if (isDownloadingBulk) {
      modal.warning('A bulk download is already in progress.')
      return
    }

    // Get selected file objects
    const selectedFileObjects = files.filter((f: any) => selectedFiles.has(f.id))

    // Confirm download
    const totalSize = selectedFileObjects.reduce((sum: number, f: any) => sum + (f.fileSize || 0), 0)
    const sizeMB = (totalSize / (1024 * 1024)).toFixed(2)
    const confirmed = await modal.downloadConfirm({
      folderName: `${selectedFiles.size} Selected Files`,
      fileCount: selectedFiles.size,
      totalSizeMB: sizeMB,
    })

    if (!confirmed) return

    try {
      setIsDownloadingBulk(true)
      abortControllerRef.current = new AbortController()

      // Convert to DownloadFileInfo format
      const filesToDownload: DownloadFileInfo[] = selectedFileObjects.map((f: any) => ({
        name: f.originalFilename,
        path: f.originalFilename,
        storagePath: f.storagePath,
        size: f.fileSize || 0,
      }))

      console.log(`Starting bulk download: ${filesToDownload.length} files`)

      await downloadFilesAsZip(filesToDownload, 'selected-files', {
        onProgress: (progress) => {
          setBulkDownloadProgress(progress)
          console.log(`Download progress: ${progress.percentage}% (${progress.completedFiles}/${progress.totalFiles} files)`)
        },
        onFileStart: (fileName) => {
          console.log(`Downloading: ${fileName}`)
        },
        onFileComplete: (fileName) => {
          console.log(`Completed: ${fileName}`)
        },
        onError: (error, fileName) => {
          console.error(`Error downloading ${fileName || 'file'}:`, error)
        },
        onComplete: () => {
          console.log('Bulk download complete')
          modal.success(`${selectedFiles.size} files downloaded successfully!`)
          clearSelection()
        },
        abortController: abortControllerRef.current,
      })
    } catch (error: any) {
      if (abortControllerRef.current?.signal.aborted) {
        console.log('Bulk download was cancelled.')
      } else {
        console.error('Error downloading files:', error)
        modal.error(error.message || 'Failed to download files. Please try again.')
      }
    } finally {
      setIsDownloadingBulk(false)
      setBulkDownloadProgress(null)
      abortControllerRef.current = null
    }
  }

  // Cancel bulk download
  const cancelBulkDownload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setIsDownloadingBulk(false)
      setBulkDownloadProgress(null)
      modal.info('Download cancelled.')
    }
  }

  return (
    <>
      {/* Bulk Actions Toolbar */}
      {selectedFiles.size > 0 && (
        <div className="mb-4 flex items-center justify-between bg-primary/10 dark:bg-primary/20 rounded-lg px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {selectedFiles.size} file{selectedFiles.size > 1 ? 's' : ''} selected
            </span>
            <button
              onClick={clearSelection}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Clear selection
            </button>
          </div>
          <button
            onClick={handleBulkDownload}
            disabled={isDownloadingBulk}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-base">folder_zip</span>
            Download as ZIP
          </button>
        </div>
      )}

      {/* Table */}
      <div className="mt-4">
        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="w-10 py-3 px-4">
                  <input
                    type="checkbox"
                    checked={paginatedFiles.length > 0 && paginatedFiles.every((f: any) => selectedFiles.has(f.id))}
                    onChange={selectAllOnPage}
                    className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary dark:focus:ring-primary dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                    title="Select all on page"
                  />
                </th>
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
                  <td colSpan={6} className="h-[72px] px-4 py-2 text-center text-gray-500 dark:text-gray-400">
                    Loading files...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="h-[72px] px-4 py-2 text-center text-red-500">
                    Error loading files: {error.message}
                  </td>
                </tr>
              ) : files.length === 0 ? (
                <tr>
                  <td colSpan={6} className="h-[72px] px-4 py-2 text-center text-gray-500 dark:text-gray-400">
                    No files found
                  </td>
                </tr>
              ) : (
                paginatedFiles.map((file: any) => {
                  const fileIcon = getFileIcon(file.originalFilename)
                  const isSelected = selectedFiles.has(file.id)
                  return (
                    <tr key={file.id} className={`hover:bg-gray-50 dark:hover:bg-white/5 border-b border-gray-200 dark:border-gray-700 last:border-0 ${isSelected ? 'bg-primary/5 dark:bg-primary/10' : ''}`}>
                      <td className="py-4 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleFileSelection(file.id)}
                          className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary dark:focus:ring-primary dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                        />
                      </td>
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

      {/* Bulk Download Progress Overlay */}
      {isDownloadingBulk && bulkDownloadProgress && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-primary text-3xl animate-pulse">
                folder_zip
              </span>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Downloading Files
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Creating ZIP file...
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-1">
                <span>Progress</span>
                <span>{bulkDownloadProgress.percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-primary h-3 rounded-full transition-all duration-300"
                  style={{ width: `${bulkDownloadProgress.percentage}%` }}
                />
              </div>
            </div>

            {/* File progress */}
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              <p>
                Files: {bulkDownloadProgress.completedFiles} / {bulkDownloadProgress.totalFiles}
              </p>
              <p className="truncate" title={bulkDownloadProgress.currentFile}>
                Current: {bulkDownloadProgress.currentFile}
              </p>
              <p>
                Size: {(bulkDownloadProgress.loadedBytes / (1024 * 1024)).toFixed(2)} MB
                {bulkDownloadProgress.totalBytes > 0 &&
                  ` / ${(bulkDownloadProgress.totalBytes / (1024 * 1024)).toFixed(2)} MB`
                }
              </p>
            </div>

            {/* Cancel button */}
            <button
              onClick={cancelBulkDownload}
              className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
            >
              Cancel Download
            </button>
          </div>
        </div>
      )}
    </>
  )
}
