import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import FileList from '@/components/files/FileList'
import SearchBar from '@/components/common/SearchBar'
import FileUploadZone from '@/components/files/FileUploadZone'
import FileFolderManager from '@/components/files/FileFolderManager'
import { useAuth } from '@/contexts/AuthContext'
import { getLoan } from '@/services/dataconnect/loanService'
import { getUser } from '@/services/dataconnect/userService'
import { parseUploadContext } from '@/utils/folderPathUtils'

interface HomePageProps {
  viewMode: 'list' | 'folder';
}

export default function HomePage({ viewMode }: HomePageProps) {
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [loanInfo, setLoanInfo] = useState<{ loanNumber: string; borrowerName?: string } | null>(null)
  const [borrowerInfo, setBorrowerInfo] = useState<{ firstName?: string; lastName?: string } | null>(null)

  // TODO: Track folder navigation when library supports callbacks
  // For now, defaults to '/Personal Files' (uploads to current user's personal files)
  const currentFolderPath = '/Personal Files';

  // Extract filter parameters from URL
  const borrowerId = searchParams.get('borrower')
  const loanId = searchParams.get('loan')
  const view = searchParams.get('view') // 'personal' or null

  const isAdmin = user?.role === 'admin' || user?.role === 'super-admin'

  // Determine what to show based on URL params
  const showPersonalFiles = view === 'personal'

  // Determine which user's files to show
  const targetUserId = borrowerId || user?.id || ''

  // Determine if upload widget should be shown
  const showUploadWidget =
    // Show for own files (all scenarios)
    (!borrowerId || borrowerId === user?.id) ||
    // Show for admins viewing borrower's loan files
    (isAdmin && borrowerId && borrowerId !== user?.id && loanId && !showPersonalFiles) ||
    // Show for admins viewing borrower's personal files
    (isAdmin && borrowerId && borrowerId !== user?.id && showPersonalFiles)

  // Fetch loan info when loanId changes
  useEffect(() => {
    async function fetchLoanInfo() {
      if (!loanId) {
        setLoanInfo(null)
        return
      }

      try {
        const loan = await getLoan(loanId)
        if (loan) {
          setLoanInfo({
            loanNumber: loan.loanNumber,
            borrowerName: loan.borrowerName,
          })
        }
      } catch (error) {
        console.error('Error fetching loan info:', error)
        setLoanInfo(null)
      }
    }

    fetchLoanInfo()
  }, [loanId])

  // Fetch borrower info when borrowerId changes (for admin view)
  useEffect(() => {
    async function fetchBorrowerInfo() {
      if (!borrowerId || borrowerId === user?.id) {
        setBorrowerInfo(null)
        return
      }

      try {
        const borrower = await getUser(borrowerId)
        if (borrower) {
          setBorrowerInfo({
            firstName: borrower.firstName,
            lastName: borrower.lastName,
          })
        }
      } catch (error) {
        console.error('Error fetching borrower info:', error)
        setBorrowerInfo(null)
      }
    }

    fetchBorrowerInfo()
  }, [borrowerId, user?.id])

  // Determine upload context based on view mode
  const uploadContext = viewMode === 'folder'
    ? parseUploadContext(currentFolderPath, user?.id || '')
    : {
        userId: targetUserId,
        loanId: loanId || undefined,
      };

  // Extract borrower name and loan number from folder path for display (folder view only)
  const folderViewContext = viewMode === 'folder' ? (() => {
    // Extract borrower/loan info from path
    const match = currentFolderPath.match(/\/Borrowers\/([^/]+)(?:\/Loan ([^/]+))?/);
    if (match) {
      const [, borrowerName, loanNumberStr] = match;
      // Extract just the number from "Loan 123456"
      const loanNumber = loanNumberStr?.replace('Loan ', '');
      return { borrowerName, loanNumber };
    }
    return {};
  })() : {};

  // Determine if upload should be shown (always in folder view, conditionally in list view)
  const showUpload = viewMode === 'folder' || showUploadWidget;

  return (
    <div className="flex flex-col h-full">
      {/* Upload Widget - Always at top, full width */}
      {showUpload && (
        <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 px-8 pt-6 pb-6">
          <FileUploadZone
            userId={uploadContext.userId}
            loanId={uploadContext.loanId}
            loanNumber={viewMode === 'folder' ? folderViewContext.loanNumber : loanInfo?.loanNumber}
            borrowerName={
              viewMode === 'folder'
                ? folderViewContext.borrowerName
                : (borrowerId && borrowerId !== user?.id
                    ? borrowerInfo?.firstName && borrowerInfo?.lastName
                      ? `${borrowerInfo.firstName} ${borrowerInfo.lastName}`
                      : loanInfo?.borrowerName
                    : undefined)
            }
            onUploadComplete={() => {
              setRefreshKey((prev) => prev + 1)
            }}
          />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        {viewMode === 'list' ? (
          /* List View */
          <div className="p-8">
            <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
              {/* Search Bar */}
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <SearchBar value={searchTerm} onChange={setSearchTerm} />
              </div>

              {/* File List */}
              <FileList
                key={refreshKey}
                searchTerm={searchTerm}
                userId={targetUserId}
                loanId={loanId}
                showPersonalOnly={showPersonalFiles}
              />
            </div>
          </div>
        ) : (
          /* Folder View - Full width */
          <div className="w-full h-full">
            <FileFolderManager
              onRefresh={() => {
                setRefreshKey((prev) => prev + 1)
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
