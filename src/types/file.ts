export interface File {
  id: string
  filename: string
  originalFilename: string
  size: number
  mimeType: string
  blobUrl: string
  uploadedAt: Date
  uploadedBy: string
  loanIds: string[]
  tags?: string[]
  metadata?: Record<string, unknown>
}

export interface FileUploadRequest {
  file: globalThis.File
  loanIds?: string[]
  tags?: string[]
  metadata?: Record<string, unknown>
}

export interface FileListParams {
  userId: string
  loanId?: string
  searchTerm?: string
  personalOnly?: boolean
  page?: number
  pageSize?: number
  sortBy?: 'filename' | 'uploadedAt' | 'size'
  sortOrder?: 'asc' | 'desc'
}

export interface FileListResponse {
  files: File[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export type FileType = 'pdf' | 'doc' | 'docx' | 'xls' | 'xlsx' | 'jpg' | 'jpeg' | 'png' | 'other'

export interface FileIcon {
  icon: string
  color: string
}
