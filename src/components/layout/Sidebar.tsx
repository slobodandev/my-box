import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { getAllUsers, User } from '@/services/dataconnect/userService'
import { getUserLoans, Loan } from '@/services/dataconnect/loanService'

export default function Sidebar() {
  const location = useLocation()
  const { user } = useAuth()

  const [borrowers, setBorrowers] = useState<User[]>([])
  const [borrowerLoans, setBorrowerLoans] = useState<{ [userId: string]: Loan[] }>({})
  const [expandedBorrowers, setExpandedBorrowers] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [globalSearchTerm, setGlobalSearchTerm] = useState('')

  const isAdmin = user?.role === 'admin' || user?.role === 'super-admin'

  const isActive = (path: string) => location.pathname === path

  // Extract current borrower from URL
  const searchParams = new URLSearchParams(location.search)
  const currentBorrowerId = searchParams.get('borrower')

  // Fetch borrowers and their loans for admin
  useEffect(() => {
    if (!isAdmin || !user) return

    const fetchBorrowersAndLoans = async () => {
      setLoading(true)
      try {
        const allUsers = await getAllUsers()
        // Filter to only show borrowers (users who aren't admins)
        const borrowerUsers = allUsers.filter(u =>
          u.role === 'borrower' && u.isActive
        )
        setBorrowers(borrowerUsers)

        // Fetch loans for each borrower
        const loansMap: { [userId: string]: Loan[] } = {}
        await Promise.all(
          borrowerUsers.map(async (borrower) => {
            try {
              const loans = await getUserLoans(borrower.id)
              loansMap[borrower.id] = loans
            } catch (err) {
              console.error(`Failed to fetch loans for borrower ${borrower.id}:`, err)
              loansMap[borrower.id] = []
            }
          })
        )
        setBorrowerLoans(loansMap)
      } catch (err) {
        console.error('Error fetching borrowers:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchBorrowersAndLoans()
  }, [isAdmin, user])

  // Fetch current user's loans for borrower role
  const [myLoans, setMyLoans] = useState<Loan[]>([])
  useEffect(() => {
    if (isAdmin || !user) return

    const fetchMyLoans = async () => {
      setLoading(true)
      try {
        const loans = await getUserLoans(user.id)
        setMyLoans(loans)
      } catch (err) {
        console.error('Error fetching my loans:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchMyLoans()
  }, [isAdmin, user])

  const toggleBorrower = (borrowerId: string) => {
    const newExpanded = new Set(expandedBorrowers)
    if (newExpanded.has(borrowerId)) {
      newExpanded.delete(borrowerId)
    } else {
      newExpanded.add(borrowerId)
    }
    setExpandedBorrowers(newExpanded)
  }

  // Filter borrowers based on search term
  const filteredBorrowers = globalSearchTerm
    ? borrowers.filter((borrower) => {
        const borrowerName = borrower.firstName && borrower.lastName
          ? `${borrower.firstName} ${borrower.lastName}`.toLowerCase()
          : borrower.email.toLowerCase()
        const loans = borrowerLoans[borrower.id] || []
        const loanMatch = loans.some(loan => loan.loanNumber.toLowerCase().includes(globalSearchTerm.toLowerCase()))
        return borrowerName.includes(globalSearchTerm.toLowerCase()) || loanMatch
      })
    : borrowers

  // Auto-expand borrowers when their loans match the search
  useEffect(() => {
    if (!globalSearchTerm || !isAdmin) return

    const newExpanded = new Set<string>()

    borrowers.forEach((borrower) => {
      const loans = borrowerLoans[borrower.id] || []
      const hasMatchingLoan = loans.some(loan =>
        loan.loanNumber.toLowerCase().includes(globalSearchTerm.toLowerCase())
      )

      if (hasMatchingLoan) {
        newExpanded.add(borrower.id)
      }
    })

    setExpandedBorrowers(newExpanded)
  }, [globalSearchTerm, borrowers, borrowerLoans, isAdmin])

  // Highlight matching text
  const highlightText = (text: string, search: string) => {
    if (!search) return text

    const parts = text.split(new RegExp(`(${search})`, 'gi'))
    return parts.map((part) =>
      part.toLowerCase() === search.toLowerCase()
        ? `<mark class="bg-yellow-200 dark:bg-yellow-600">${part}</mark>`
        : part
    ).join('')
  }

  return (
    <aside className="flex w-[400px] flex-col border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 shadow-xl">
      <div className="flex-grow p-6 space-y-6 overflow-y-auto">
        {/* Global Loan Search */}
        <div className="px-2">
          <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-wider uppercase mb-3">
            GLOBAL LOAN SEARCH
          </h2>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-base">
              search
            </span>
            <input
              type="text"
              value={globalSearchTerm}
              onChange={(e) => setGlobalSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              placeholder="Search across all loans & files..."
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="px-2">
          <nav className="flex flex-col gap-1">
            {/* All Files */}
            <Link
              to="/"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
                isActive('/') && !location.search
                  ? 'bg-primary/10 dark:bg-primary/20 text-primary'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10'
              }`}
            >
              <span className="material-symbols-outlined text-base">folder</span>
              <p className="text-sm font-medium leading-normal">All Files</p>
            </Link>

            {/* Personal Files - Shows current user's personal files */}
            <Link
              to="/?view=personal"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
                location.search.includes('view=personal') && !location.search.includes('borrower=')
                  ? 'bg-primary/10 dark:bg-primary/20 text-primary'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10'
              }`}
            >
              <span className="material-symbols-outlined text-base">person</span>
              <p className="text-sm font-medium leading-normal">Personal Files</p>
            </Link>
          </nav>
        </div>

        {/* ADMIN VIEW: Borrowers with nested loans */}
        {isAdmin && (
          <div className="px-2">
            <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-wider uppercase mb-3">
              BORROWERS & LOANS
            </h2>
            <nav className="space-y-3">
              {loading ? (
                <p className="text-xs text-gray-400 dark:text-gray-500 px-3 py-2">Loading borrowers...</p>
              ) : filteredBorrowers.length === 0 ? (
                <p className="text-xs text-gray-400 dark:text-gray-500 px-3 py-2">
                  {globalSearchTerm ? 'No matching borrowers or loans' : 'No borrowers yet'}
                </p>
              ) : (
                filteredBorrowers.map((borrower) => {
                  const loans = borrowerLoans[borrower.id] || []
                  const isExpanded = expandedBorrowers.has(borrower.id)
                  const isSelected = currentBorrowerId === borrower.id
                  const borrowerName = borrower.firstName && borrower.lastName
                    ? `${borrower.firstName} ${borrower.lastName}`
                    : borrower.email

                  return (
                    <div
                      key={borrower.id}
                      className={`rounded-lg p-3 shadow-sm transition-colors ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-900/30'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                      }`}
                    >
                      {/* Borrower Header */}
                      <div
                        onClick={() => toggleBorrower(borrower.id)}
                        className="flex justify-between items-center cursor-pointer"
                      >
                        <div>
                          <p
                            className="font-semibold text-base text-gray-900 dark:text-white"
                            dangerouslySetInnerHTML={{
                              __html: highlightText(borrowerName, globalSearchTerm)
                            }}
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {borrower.email}
                          </p>
                        </div>
                        <span className="material-symbols-outlined text-gray-500 dark:text-gray-400">
                          {isExpanded ? 'expand_less' : 'expand_more'}
                        </span>
                      </div>

                      {/* Borrower's Loans and Personal Files */}
                      {isExpanded && (
                        <ul className="mt-3 space-y-2 pl-2">
                          {/* Personal Files */}
                          <li>
                            <Link
                              to={`/?borrower=${borrower.id}&view=personal`}
                              className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm transition-colors ${
                                location.search.includes(`borrower=${borrower.id}`) && location.search.includes('view=personal')
                                  ? 'text-primary bg-primary/5'
                                  : 'text-gray-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-slate-600'
                              }`}
                            >
                              <span className="material-symbols-outlined text-base">folder_open</span>
                              <span>Personal Files (No Loan)</span>
                            </Link>
                          </li>

                          {/* Loans */}
                          {loans.length > 0 && (
                            <>
                              {loans.map((loan) => {
                                const isLoanActive = location.search.includes(`borrower=${borrower.id}`) && location.search.includes(`loan=${loan.id}`)
                                const loanStatus = loan.status || 'active'
                                const statusBadge = loanStatus === 'active'
                                  ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300'
                                  : 'bg-slate-100 dark:bg-slate-500/20 text-slate-600 dark:text-slate-300'

                                return (
                                  <li key={loan.id} className={isLoanActive ? 'bg-primary/10 dark:bg-primary/20 rounded-md shadow-sm' : ''}>
                                    <Link
                                      to={`/?borrower=${borrower.id}&loan=${loan.id}`}
                                      className={`flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                        isLoanActive
                                          ? 'text-primary hover:bg-primary/20 dark:hover:bg-primary/30'
                                          : 'text-gray-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-slate-600'
                                      }`}
                                    >
                                      <div className="flex items-center space-x-3">
                                        <span className="material-symbols-outlined text-base">account_balance</span>
                                        <span
                                          dangerouslySetInnerHTML={{
                                            __html: highlightText(loan.loanNumber, globalSearchTerm)
                                          }}
                                        />
                                      </div>
                                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusBadge}`}>
                                        {loanStatus.charAt(0).toUpperCase() + loanStatus.slice(1)}
                                      </span>
                                    </Link>
                                  </li>
                                )
                              })}
                            </>
                          )}

                          {loans.length === 0 && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 px-3 py-2">No loans yet</p>
                          )}
                        </ul>
                      )}
                    </div>
                  )
                })
              )}
            </nav>
          </div>
        )}

        {/* BORROWER VIEW: Only their loans */}
        {!isAdmin && (
          <div className="px-2">
            <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-wider uppercase mb-3">
              MY LOANS
            </h2>
            <nav className="space-y-2">
              {loading ? (
                <p className="text-xs text-gray-400 dark:text-gray-500 px-3 py-2">Loading loans...</p>
              ) : myLoans.length === 0 ? (
                <p className="text-xs text-gray-400 dark:text-gray-500 px-3 py-2">No loans yet</p>
              ) : (
                myLoans.map((loan) => (
                  <Link
                    key={loan.id}
                    to={`/?loan=${loan.id}`}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium leading-normal ${
                      location.search.includes(`loan=${loan.id}`)
                        ? 'bg-primary/10 dark:bg-primary/20 text-primary'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">account_balance</span>
                    <span className="truncate">{loan.loanNumber}</span>
                  </Link>
                ))
              )}
            </nav>
          </div>
        )}
      </div>

      {/* Bottom Section */}
      <div className="p-6 border-t border-gray-200 dark:border-gray-700">
        {isAdmin && (
          <Link
            to="/admin/users"
            className="w-full bg-primary text-white font-semibold py-3 rounded-lg hover:bg-blue-600 transition-colors text-base flex items-center justify-center"
          >
            <span className="material-symbols-outlined align-middle mr-2">group</span>
            Manage Users
          </Link>
        )}
      </div>
    </aside>
  )
}
