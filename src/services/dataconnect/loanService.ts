/**
 * Loan Service
 * Handles loan-related operations with Data Connect
 */

import {
  getUserLoans as getUserLoansQuery,
  getLoan as getLoanQuery,
  createLoan as createLoanMutation,
  updateLoan as updateLoanMutation,
  deleteLoan as deleteLoanMutation,
} from '../../../dataconnect/src/__generated/dataconnect';

export interface Loan {
  id: string;
  loanNumber: string;
  borrowerName?: string;
  borrowerEmail?: string;
  loanAmount?: number;
  loanType?: string;
  status?: string;
  propertyAddress?: string;
  createdAt?: Date | string;
  closedAt?: Date | string;
}

export interface CreateLoanInput {
  userId: string;
  loanNumber: string;
  borrowerName: string;
  borrowerEmail?: string;
  loanAmount?: number;
  loanType?: string;
  propertyAddress?: string;
  loanOfficerId?: string;
}

export interface UpdateLoanInput {
  id: string;
  loanAmount?: number;
  status?: string;
  notes?: string;
}

/**
 * Get all loans for a user
 * @param userId - User ID (UUID)
 * @returns Array of loans
 */
export async function getUserLoans(userId: string): Promise<Loan[]> {
  try {
    const result = await getUserLoansQuery({
      userId,
    });

    if (!result.data?.loans) {
      return [];
    }

    return result.data.loans.map((loan: any) => ({
      id: loan.id,
      loanNumber: loan.loanNumber,
      borrowerName: loan.borrowerName || undefined,
      borrowerEmail: loan.borrowerEmail || undefined,
      loanAmount: loan.loanAmount || undefined,
      loanType: loan.loanType || undefined,
      status: loan.status || undefined,
      propertyAddress: loan.propertyAddress || undefined,
      createdAt: loan.createdAt,
      closedAt: loan.closedAt || undefined,
    }));
  } catch (error) {
    console.error('Error fetching user loans:', error);
    throw new Error('Failed to fetch loans');
  }
}

/**
 * Get a single loan by ID
 * @param loanId - Loan ID (UUID)
 * @returns Loan object or null if not found
 */
export async function getLoan(loanId: string): Promise<Loan | null> {
  try {
    const result = await getLoanQuery({
      id: loanId,
    });

    if (!result.data?.loan) {
      return null;
    }

    const loan = result.data.loan;
    return {
      id: loan.id,
      loanNumber: loan.loanNumber,
      borrowerName: loan.borrowerName || undefined,
      borrowerEmail: loan.borrowerEmail || undefined,
      loanAmount: loan.loanAmount || undefined,
      loanType: loan.loanType || undefined,
      status: loan.status || undefined,
      propertyAddress: loan.propertyAddress || undefined,
      createdAt: loan.createdAt,
      closedAt: loan.closedAt || undefined,
    };
  } catch (error) {
    console.error('Error fetching loan:', error);
    return null;
  }
}

/**
 * Create a new loan
 * @param input - Loan creation data
 * @returns Created loan ID
 */
export async function createLoan(input: CreateLoanInput): Promise<string> {
  try {
    const result = await createLoanMutation({
      userId: input.userId,
      loanNumber: input.loanNumber,
      borrowerName: input.borrowerName,
      borrowerEmail: input.borrowerEmail || null,
      loanAmount: input.loanAmount || null,
      loanType: input.loanType || null,
      propertyAddress: input.propertyAddress || null,
      loanOfficerId: input.loanOfficerId || null,
    });

    if (!result.data?.loan_insert.id) {
      throw new Error('Failed to create loan');
    }

    return result.data.loan_insert.id;
  } catch (error) {
    console.error('Error creating loan:', error);
    throw new Error('Failed to create loan');
  }
}

/**
 * Update an existing loan
 * @param input - Loan update data
 */
export async function updateLoan(input: UpdateLoanInput): Promise<void> {
  try {
    await updateLoanMutation({
      id: input.id,
      loanAmount: input.loanAmount || null,
      status: input.status || null,
      notes: input.notes || null,
    });
  } catch (error) {
    console.error('Error updating loan:', error);
    throw new Error('Failed to update loan');
  }
}

/**
 * Delete a loan
 * @param loanId - Loan ID to delete
 */
export async function deleteLoan(loanId: string): Promise<void> {
  try {
    await deleteLoanMutation({
      id: loanId,
    });
  } catch (error) {
    console.error('Error deleting loan:', error);
    throw new Error('Failed to delete loan');
  }
}
