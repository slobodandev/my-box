import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useLoans } from '@/hooks'
import { MOCK_USER_ID } from '@/constants/app'

export default function Sidebar() {
  const location = useLocation()
  const [loansExpanded, setLoansExpanded] = useState(true)

  const isActive = (path: string) => location.pathname === path

  // Fetch loans from API
  const { loans, loading } = useLoans({
    userId: MOCK_USER_ID,
    includeFileCount: true,
  })

  return (
    <aside className="flex w-64 flex-col border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-background-dark">
      <div className="flex h-full flex-col justify-between p-4">
        {/* Top Section */}
        <div className="flex flex-col gap-4">
          {/* Logo and Title */}
          <div className="flex items-center gap-3 px-3">
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
              style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuA7aPJrBew2iOdSLCQ2_HC5R6yZrc9TQ85tnUauoC5KxIRVx9mXgPpIMkqSJR7UkTHcyHBvcl8AZ1csDr8hGKApybqlGu1FYjU-N8E90cNzcD7Jjq8qMFMt_KoyiKgYYR5XmwRzBaikGtObS5eXhJdOxwC-9dpmW-y52CTfaEWMsLSyWvd2Il60aK0m6l5TqUTJy5Sj1j7gK2gXaGKy2_RVC_uVf2CXRl741ofsvBPlRSZcXuLVrC16MVEIUcrKjup5lK-wxZtYa5T5")' }}
            />
            <div className="flex flex-col">
              <h1 className="text-gray-900 dark:text-white text-base font-bold leading-normal">LoanPro</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-normal leading-normal">File Management</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-1 mt-4">
            {/* All Files */}
            <Link
              to="/"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
                isActive('/')
                  ? 'bg-primary/10 dark:bg-primary/20 text-primary'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10'
              }`}
            >
              <span className="material-symbols-outlined text-base">folder</span>
              <p className="text-sm font-medium leading-normal">All Files</p>
            </Link>

            {/* Personal Files */}
            <Link
              to="/personal"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
                isActive('/personal')
                  ? 'bg-primary/10 dark:bg-primary/20 text-primary'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10'
              }`}
            >
              <span className="material-symbols-outlined text-base">person</span>
              <p className="text-sm font-medium leading-normal">Personal Files</p>
            </Link>

            {/* Loans Dropdown */}
            <div>
              <button
                onClick={() => setLoansExpanded(!loansExpanded)}
                className="flex w-full items-center justify-between gap-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-base">account_balance</span>
                  <p className="text-sm font-medium leading-normal">Loans</p>
                </div>
                <span
                  className={`material-symbols-outlined text-base transition-transform ${
                    loansExpanded ? 'rotate-180' : ''
                  }`}
                >
                  expand_more
                </span>
              </button>

              {/* Loan List */}
              {loansExpanded && (
                <div className="flex flex-col pl-9 mt-1 space-y-1">
                  {loading ? (
                    <p className="text-xs text-gray-400 dark:text-gray-500">Loading...</p>
                  ) : loans.length === 0 ? (
                    <p className="text-xs text-gray-400 dark:text-gray-500">No loans yet</p>
                  ) : (
                    loans.map((loan) => (
                      <Link
                        key={loan.id}
                        to={`/loan/${loan.id}`}
                        className={`text-sm font-normal leading-normal ${
                          location.pathname === `/loan/${loan.id}`
                            ? 'text-primary'
                            : 'text-gray-500 dark:text-gray-400 hover:text-primary'
                        }`}
                      >
                        {loan.loanNumber}
                        {loan.fileCount !== undefined && loan.fileCount > 0 && (
                          <span className="ml-1 text-xs">({loan.fileCount})</span>
                        )}
                      </Link>
                    ))
                  )}
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Bottom Button */}
        <button className="flex min-w-[84px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] shadow-sm hover:bg-primary/90">
          <span className="truncate">New Loan</span>
        </button>
      </div>
    </aside>
  )
}
