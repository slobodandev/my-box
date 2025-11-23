import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { getUser } from '@/services/dataconnect/userService'
import { getLoan } from '@/services/dataconnect/loanService'

interface NavbarProps {
  viewMode?: 'list' | 'folder';
  onViewModeChange?: (mode: 'list' | 'folder') => void;
}

export default function Navbar({ viewMode = 'list', onViewModeChange }: NavbarProps) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const isAdmin = user?.role === 'admin' || user?.role === 'super-admin'

  const [borrowerInfo, setBorrowerInfo] = useState<{ firstName?: string; lastName?: string; email?: string } | null>(null)
  const [loanInfo, setLoanInfo] = useState<{ loanNumber: string; borrowerName?: string } | null>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Extract context from URL
  const searchParams = new URLSearchParams(location.search)
  const borrowerId = searchParams.get('borrower')
  const loanId = searchParams.get('loan')
  const view = searchParams.get('view')
  const isPersonalView = view === 'personal'

  // Fetch borrower info
  useEffect(() => {
    async function fetchBorrowerInfo() {
      if (!borrowerId) {
        setBorrowerInfo(null)
        return
      }

      try {
        const borrower = await getUser(borrowerId)
        if (borrower) {
          setBorrowerInfo({
            firstName: borrower.firstName,
            lastName: borrower.lastName,
            email: borrower.email,
          })
        }
      } catch (error) {
        console.error('Error fetching borrower info:', error)
        setBorrowerInfo(null)
      }
    }

    fetchBorrowerInfo()
  }, [borrowerId])

  // Fetch loan info
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

  // Build breadcrumbs and title
  const borrowerName = borrowerInfo?.firstName && borrowerInfo?.lastName
    ? `${borrowerInfo.firstName} ${borrowerInfo.lastName}`
    : borrowerInfo?.email

  const pageTitle = loanId && loanInfo
    ? `Loan ${loanInfo.loanNumber} Files`
    : isPersonalView && borrowerName
    ? `${borrowerName}'s Personal Files`
    : isPersonalView
    ? 'Personal Files'
    : 'All Files'

  const pageSubtitle = loanId && loanInfo
    ? `Associated with ${borrowerName || loanInfo.borrowerName || 'borrower'}`
    : null

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserMenu])

  const handleLogout = async () => {
    await logout()
    window.location.href = '/auth/signin'
  }

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="p-6 flex justify-between items-center">
        {/* Left - Logo, Title, and Breadcrumbs */}
        <div className="flex items-center gap-6">
          {/* LoanPro Logo and Name */}
          <div className="flex items-center space-x-3 border-r border-gray-200 dark:border-gray-700 pr-6">
            <div className="bg-primary w-10 h-10 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl font-bold">LP</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">LoanPro</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">COMMAND HUB</p>
            </div>
          </div>

          {/* Breadcrumbs and Page Title */}
          <div>
            {/* Breadcrumbs */}
            {(borrowerId || loanId) && (
              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-2 mb-1">
                <span>Files</span>
                {borrowerName && (
                  <>
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                    <span>{borrowerName}</span>
                  </>
                )}
                {loanId && loanInfo && (
                  <>
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                    <span className="text-gray-900 dark:text-white font-medium">Loan {loanInfo.loanNumber}</span>
                  </>
                )}
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {pageTitle}
            </h1>

            {/* Subtitle */}
            {pageSubtitle && (
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                {pageSubtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right - System Status and User */}
        <div className="flex items-center space-x-4">
          {/* View Toggle (Admin Only) */}
          {isAdmin && onViewModeChange && (
            <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <button
                onClick={() => onViewModeChange('list')}
                className={`
                  flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-l-lg transition-colors
                  ${viewMode === 'list'
                    ? 'bg-primary text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }
                `}
              >
                <span className="material-symbols-outlined text-base">list</span>
                List
              </button>
              <button
                onClick={() => onViewModeChange('folder')}
                className={`
                  flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-r-lg transition-colors border-l border-gray-200 dark:border-gray-700
                  ${viewMode === 'folder'
                    ? 'bg-primary text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }
                `}
              >
                <span className="material-symbols-outlined text-base">folder</span>
                Folder
              </button>
            </div>
          )}

          {/* System Status */}
          <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span className="text-sm text-gray-500 dark:text-gray-400">System Operational</span>
          </div>

          {/* User Avatar & Menu */}
          {user && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-primary transition-all cursor-pointer"
              >
                <span className="text-gray-600 dark:text-gray-300 font-semibold text-sm">
                  {user.firstName?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                </span>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {user.firstName && user.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : user.firstName || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {user.email}
                    </p>
                    {user.role && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 mt-2">
                        {user.role === 'super-admin' ? 'Super Admin' : user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    )}
                  </div>

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <span className="material-symbols-outlined text-base">logout</span>
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
