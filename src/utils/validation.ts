/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate loan number format (adjust pattern as needed)
 */
export const isValidLoanNumber = (loanNumber: string): boolean => {
  // Example: Loan number should be alphanumeric, 5-20 characters
  const loanRegex = /^[a-zA-Z0-9]{5,20}$/
  return loanRegex.test(loanNumber)
}

/**
 * Validate required field
 */
export const isRequired = (value: string | null | undefined): boolean => {
  return value !== null && value !== undefined && value.trim() !== ''
}

/**
 * Validate minimum length
 */
export const minLength = (value: string, min: number): boolean => {
  return value.length >= min
}

/**
 * Validate maximum length
 */
export const maxLength = (value: string, max: number): boolean => {
  return value.length <= max
}

/**
 * Validate number range
 */
export const isInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max
}
