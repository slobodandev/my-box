export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  displayName: string
  role: UserRole
  createdAt: Date
  lastLoginAt?: Date
}

export enum UserRole {
  BORROWER = 'borrower',
  LOAN_OFFICER = 'loan_officer',
  ADMIN = 'admin',
}

export interface AuthContext {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}
