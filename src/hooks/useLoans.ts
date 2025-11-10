import { useState, useEffect, useCallback } from 'react'
import { loanService } from '@/services'
import type { Loan, LoanListParams } from '@/types'

interface UseLoansOptions {
  userId: string
  includeFileCount?: boolean
  autoFetch?: boolean
}

export const useLoans = (options: UseLoansOptions) => {
  const [loans, setLoans] = useState<Loan[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchLoans = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params: LoanListParams = {
        userId: options.userId,
        includeFileCount: options.includeFileCount,
      }

      const response = await loanService.getLoans(params)

      setLoans(response.loans)
      setTotal(response.total)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch loans'))
    } finally {
      setLoading(false)
    }
  }, [options.userId, options.includeFileCount])

  useEffect(() => {
    if (options.autoFetch !== false) {
      fetchLoans()
    }
  }, [fetchLoans, options.autoFetch])

  const refresh = useCallback(() => {
    fetchLoans()
  }, [fetchLoans])

  const getLoanById = useCallback(
    (loanId: string) => {
      return loans.find((loan) => loan.id === loanId)
    },
    [loans]
  )

  return {
    loans,
    total,
    loading,
    error,
    refresh,
    fetchLoans,
    getLoanById,
  }
}
