import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { useFiles } from '@/hooks'
import { getFileIcon, formatFileSize } from '@/utils'
import { MOCK_USER_ID } from '@/constants/app'

interface FileListProps {
  searchTerm: string
  selectedLoan: string | null
  showPersonalOnly: boolean
}

export default function FileList({ searchTerm, selectedLoan, showPersonalOnly }: FileListProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 5

  // Fetch files from API with filters
  const { files, total, totalPages, loading, error, fetchFiles } = useFiles({
    userId: MOCK_USER_ID,
    loanId: selectedLoan || undefined,
    searchTerm: searchTerm || undefined,
    personalOnly: showPersonalOnly,
    page: currentPage,
    pageSize,
    autoFetch: true,
  })

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedLoan, showPersonalOnly])

  // Refetch when page changes
  useEffect(() => {
    fetchFiles()
  }, [currentPage, fetchFiles])

  const startIndex = (currentPage - 1) * pageSize

  return (
    <>
      {/* Table */}
      <div className="mt-4">
        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50">
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-300 text-xs font-medium uppercase tracking-wider">
                  File Name
                </th>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-300 text-xs font-medium uppercase tracking-wider">
                  Size
                </th>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-300 text-xs font-medium uppercase tracking-wider">
                  Date Uploaded
                </th>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-300 text-xs font-medium uppercase tracking-wider">
                  Associated Loans
                </th>
                <th className="px-4 py-3 text-right text-gray-600 dark:text-gray-300 text-xs font-medium uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
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
                files.map((file) => {
                  const fileIcon = getFileIcon(file.filename)
                  return (
                    <tr key={file.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                      <td className="h-[72px] px-4 py-2 text-gray-800 dark:text-gray-200 text-sm font-medium">
                        <div className="flex items-center gap-3">
                          <span className={`material-symbols-outlined ${fileIcon.color}`}>
                            {fileIcon.icon}
                          </span>
                          <span>{file.filename}</span>
                        </div>
                      </td>
                      <td className="h-[72px] px-4 py-2 text-gray-500 dark:text-gray-400 text-sm font-normal">
                        {formatFileSize(file.size)}
                      </td>
                      <td className="h-[72px] px-4 py-2 text-gray-500 dark:text-gray-400 text-sm font-normal">
                        {format(new Date(file.uploadedAt), 'yyyy-MM-dd')}
                      </td>
                      <td className="h-[72px] px-4 py-2 text-sm font-normal">
                        {file.loanIds.length > 0 ? (
                          file.loanIds.map((loanId, idx) => (
                            <span
                              key={loanId}
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                idx % 2 === 0
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200'
                                  : 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200'
                              } mr-1`}
                            >
                              Loan #{loanId}
                            </span>
                          ))
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                            Personal File
                          </span>
                        )}
                      </td>
                      <td className="h-[72px] px-4 py-2 text-right">
                        <button className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-700 dark:hover:text-gray-200">
                          <span className="material-symbols-outlined text-base">more_horiz</span>
                        </button>
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
