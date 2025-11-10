import { useState } from 'react'
import { useLoans } from '@/hooks'
import { MOCK_USER_ID } from '@/constants/app'

interface FilterButtonProps {
  selectedLoan: string | null
  onSelectLoan: (loanId: string | null) => void
}

export default function FilterButton({ selectedLoan, onSelectLoan }: FilterButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Fetch loans from API
  const { loans } = useLoans({ userId: MOCK_USER_ID })

  const handleSelect = (loanId: string | null) => {
    onSelectLoan(loanId)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-12 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-gray-100 dark:bg-gray-700 px-4 border border-gray-200 dark:border-gray-600"
      >
        <span className="material-symbols-outlined text-gray-600 dark:text-gray-300 text-base">
          filter_list
        </span>
        <p className="text-gray-700 dark:text-gray-200 text-sm font-medium leading-normal">
          {selectedLoan
            ? loans.find((l) => l.id === selectedLoan)?.loanNumber || `Loan #${selectedLoan}`
            : 'Filter by Loan'}
        </p>
        <span className="material-symbols-outlined text-gray-600 dark:text-gray-300 text-base">
          expand_more
        </span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
            <div className="py-1">
              <button
                onClick={() => handleSelect(null)}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                All Loans
              </button>
              {loans.map((loan) => (
                <button
                  key={loan.id}
                  onClick={() => handleSelect(loan.id)}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {loan.loanNumber} - {loan.borrowerName}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
