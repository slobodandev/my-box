export interface Loan {
  id: string
  loanNumber: string
  borrowerName: string
  borrowerEmail?: string
  loanAmount?: number
  loanType?: string
  status: LoanStatus
  createdAt: Date
  updatedAt: Date
  fileCount?: number
}

export enum LoanStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface LoanListParams {
  userId: string
  status?: LoanStatus
  includeFileCount?: boolean
}

export interface LoanListResponse {
  loans: Loan[]
  total: number
}

export interface CreateLoanRequest {
  loanNumber: string
  borrowerName: string
  borrowerEmail?: string
  loanAmount?: number
  loanType?: string
}
