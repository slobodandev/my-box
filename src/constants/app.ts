// Mock user ID for development (will be replaced with real auth)
export const MOCK_USER_ID = import.meta.env.VITE_MOCK_USER_ID || 'user-123'
export const MOCK_USER_NAME = import.meta.env.VITE_MOCK_USER_NAME || 'Olivia'

// File upload settings
export const MAX_FILE_SIZE_MB = 50
export const ALLOWED_FILE_TYPES = [
  'pdf',
  'doc',
  'docx',
  'xls',
  'xlsx',
  'jpg',
  'jpeg',
  'png',
]

// Pagination settings
export const DEFAULT_PAGE_SIZE = 5
export const PAGE_SIZE_OPTIONS = [5, 10, 20, 50]

// App metadata
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'MyBox'
export const APP_ENV = import.meta.env.VITE_APP_ENV || 'development'
