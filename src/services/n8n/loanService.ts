import axios from 'axios'
import type { Loan, LoanListParams, LoanListResponse, N8nWebhookResponse } from '@/types'

/**
 * n8n Loan Service - Handles all loan-related operations via n8n webhooks
 */
class LoanService {
  private getWebhookUrl(endpoint: string): string {
    const baseUrl = import.meta.env.VITE_N8N_BASE_URL
    return `${baseUrl}/webhook/${endpoint}`
  }

  /**
   * Get list of loans for a user
   */
  async getLoans(params: LoanListParams): Promise<LoanListResponse> {
    try {
      const url = this.getWebhookUrl('get-loans')
      const response = await axios.post<N8nWebhookResponse<LoanListResponse>>(url, params)

      if (response.data.success && response.data.data) {
        return response.data.data
      }

      throw new Error(response.data.error || 'Failed to fetch loans')
    } catch (error) {
      console.error('Error fetching loans:', error)
      throw error
    }
  }

  /**
   * Get a single loan by ID
   */
  async getLoanById(loanId: string, userId: string): Promise<Loan> {
    try {
      const response = await this.getLoans({ userId })

      const loan = response.loans.find((l) => l.id === loanId)
      if (loan) {
        return loan
      }

      throw new Error('Loan not found')
    } catch (error) {
      console.error('Error fetching loan:', error)
      throw error
    }
  }

  /**
   * Get loans with file counts
   */
  async getLoansWithFileCounts(userId: string): Promise<LoanListResponse> {
    try {
      return await this.getLoans({
        userId,
        includeFileCount: true,
      })
    } catch (error) {
      console.error('Error fetching loans with file counts:', error)
      throw error
    }
  }
}

export const loanService = new LoanService()
