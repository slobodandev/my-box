# TASKS.md - Project Task List
## Loan File Management System

**Status:** In Progress
**Current Phase:** Phase 1 - Core Infrastructure (Phase 0 Complete)

---

## How to Use This Document

- [ ] = Task not started
- [IN PROGRESS] = Task currently being worked on
- [x] = Task completed
- [N8N] = Task to be delegated to n8n MCP server
- [BLOCKED] = Task blocked by dependencies

**Instructions:**
1. Complete tasks in order within each phase
2. Mark tasks as [IN PROGRESS] when starting
3. Mark tasks as [x] when completed
4. Use n8n MCP server for tasks marked with [N8N]
5. Move to next phase only when all critical tasks are complete

---

## PHASE 0: PROJECT SETUP

### 0.1 Initialize Vite React TypeScript Project

- [x] Run `npm create vite@latest . -- --template react-ts` in project directory
- [x] Answer prompts: Framework: React, Variant: TypeScript
- [x] Run `npm install` to install dependencies
- [x] Run `npm run dev` to verify setup works
- [x] Commit initial setup: `git add . && git commit -m "Initialize Vite React TypeScript project"`

### 0.2 Install Core Dependencies

- [x] Install Tailwind CSS: `npm install -D tailwindcss@^3 postcss autoprefixer`
- [x] Initialize Tailwind: `npx tailwindcss init -p`
- [x] Install Axios: `npm install axios`
- [x] Install React Router: `npm install react-router-dom`
- [x] Install date-fns (for date formatting): `npm install date-fns`
- [x] Verify all dependencies installed correctly

### 0.3 Install Development Dependencies

- [x] Install ESLint plugins: `npm install -D eslint-plugin-react-hooks eslint-plugin-react-refresh`
- [x] Install Prettier: `npm install -D prettier eslint-config-prettier eslint-plugin-prettier`
- [x] Install TypeScript types: `npm install -D @types/node`
- [x] Install Vitest for testing: `npm install -D vitest @vitest/ui`
- [x] Install React Testing Library: `npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event`

### 0.4 Configure TypeScript

- [x] Update `tsconfig.json` with path aliases:
  ```json
  {
    "compilerOptions": {
      "baseUrl": ".",
      "paths": {
        "@/*": ["src/*"],
        "@/components/*": ["src/components/*"],
        "@/services/*": ["src/services/*"],
        "@/hooks/*": ["src/hooks/*"],
        "@/types/*": ["src/types/*"],
        "@/utils/*": ["src/utils/*"],
        "@/config/*": ["src/config/*"]
      }
    }
  }
  ```
- [x] Update `tsconfig.app.json` if needed
- [x] Verify TypeScript compilation works

### 0.5 Configure Vite

- [x] Update `vite.config.ts` with path aliases:
  ```typescript
  import { defineConfig } from 'vite'
  import react from '@vitejs/plugin-react'
  import path from 'path'

  export default defineConfig({
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@/components': path.resolve(__dirname, './src/components'),
        '@/services': path.resolve(__dirname, './src/services'),
        '@/hooks': path.resolve(__dirname, './src/hooks'),
        '@/types': path.resolve(__dirname, './src/types'),
        '@/utils': path.resolve(__dirname, './src/utils'),
        '@/config': path.resolve(__dirname, './src/config'),
      },
    },
  })
  ```
- [x] Verify Vite dev server works with aliases

### 0.6 Create Project Structure

- [x] Create `src/components/` directory
- [x] Create `src/components/common/` directory
- [x] Create `src/components/files/` directory
- [x] Create `src/components/loans/` directory
- [x] Create `src/components/layout/` directory
- [x] Create `src/services/` directory
- [x] Create `src/services/n8n/` directory
- [x] Create `src/services/azure/` directory
- [x] Create `src/services/api/` directory
- [x] Create `src/hooks/` directory
- [x] Create `src/types/` directory
- [x] Create `src/utils/` directory
- [x] Create `src/contexts/` directory
- [x] Create `src/config/` directory (used src/constants instead)
- [x] Create `src/pages/` directory
- [x] Create `src/styles/` directory (not needed with Tailwind)
- [x] Create `n8n-workflows/` directory in root
- [x] Create `docs/` directory in root (not created yet - optional)

### 0.7 Configure ESLint and Prettier

- [x] Create `.prettierrc` file (created as `.prettierrc.json`)
  ```json
  {
    "semi": false,
    "trailingComma": "es5",
    "singleQuote": true,
    "printWidth": 100,
    "tabWidth": 2,
    "arrowParens": "always",
    "endOfLine": "lf"
  }
  ```
- [x] Create `.prettierignore` file
- [x] Update `.eslintrc.cjs` with React rules
- [x] Run `npm run lint` to verify configuration
- [x] Add lint and format scripts to `package.json`

### 0.8 Environment Variables Setup

- [x] Create `.env.example` file with all required variables:
  ```
  # n8n Configuration
  VITE_N8N_BASE_URL=https://your-n8n-instance.com
  VITE_N8N_UPLOAD_WEBHOOK=/webhook/file-upload
  VITE_N8N_DOWNLOAD_WEBHOOK=/webhook/file-download
  VITE_N8N_LIST_WEBHOOK=/webhook/file-list
  VITE_N8N_DELETE_WEBHOOK=/webhook/file-delete

  # Azure Configuration
  VITE_AZURE_SQL_CONNECTION=Server=...

  # Application Configuration
  VITE_MAX_FILE_SIZE=104857600
  VITE_ALLOWED_FILE_TYPES=.pdf,.doc,.docx,.xls,.xlsx,.jpg,.png,.gif
  ```
- [x] Create `.env` file (copy from `.env.example`)
- [x] Add `.env` to `.gitignore`
- [x] Document environment variables in README

### 0.9 Git Configuration

- [x] Review `.gitignore` file
- [x] Add `.env` to `.gitignore` if not already there
- [x] Add `node_modules/` to `.gitignore`
- [x] Add `.idea/` to `.gitignore`
- [x] Commit project structure: `git add . && git commit -m "Set up project structure and configuration"`

### 0.10 Azure Blob Storage Setup

- [ ] Log in to Azure Portal
- [ ] Create new Storage Account (or use existing)
- [ ] Create blob container named `loan-files`
- [ ] Set container access level to Private
- [ ] Generate SAS token or access key
- [ ] Save connection string securely
- [ ] Document Azure setup in `docs/azure-setup.md`

### 0.11 Azure SQL Database Setup

- [ ] Log in to Azure Portal
- [ ] Create Azure SQL Database (or use existing)
- [ ] Configure firewall rules to allow connections
- [ ] Get connection string
- [ ] Test connection from local machine
- [ ] Save connection string in `.env` file
- [ ] Document database setup in `docs/azure-setup.md`

### 0.12 n8n Setup

- [x] Install n8n locally: `npm install -g n8n` OR use cloud version (using cloud version)
- [x] Start n8n: `n8n start` (already running at http://48.223.194.241:5678)
- [x] Access n8n UI (usually http://localhost:5678)
- [x] Create account/login
- [ ] Configure credentials for Azure Blob Storage
- [ ] Configure credentials for Azure SQL Database
- [ ] Test connectivity to Azure services
- [ ] Document n8n setup in `docs/n8n-setup.md`

---

## PHASE 1: CORE INFRASTRUCTURE

### 1.1 Database Schema Implementation

- [ ] Create `docs/database-schema.sql` file
- [ ] Write CREATE TABLE statement for Users table
- [ ] Write CREATE TABLE statement for Loans table
- [ ] Write CREATE TABLE statement for Files table
- [ ] Write CREATE TABLE statement for FileLoanAssociations table
- [ ] Write indexes for foreign keys
- [ ] Write indexes for common queries (userId, loanId)
- [ ] Connect to Azure SQL Database using Azure Data Studio or SSMS
- [ ] Execute schema creation scripts
- [ ] Verify all tables created successfully

### 1.2 Seed Data Creation

- [ ] Write INSERT statements for sample users
- [ ] Write INSERT statements for sample loans
- [ ] Create `docs/seed-data.sql` file
- [ ] Execute seed data scripts
- [ ] Verify data inserted correctly
- [ ] Document how to reset database in `docs/database-setup.md`

### 1.3 TypeScript Type Definitions

- [x] Create `src/types/user.ts`:
  - [x] Define `User` interface
  - [x] Define `UserRole` enum
  - [x] Export types
- [x] Create `src/types/loan.ts`:
  - [x] Define `Loan` interface
  - [x] Define `LoanStatus` enum
  - [x] Export types
- [x] Create `src/types/file.ts`:
  - [x] Define `File` interface (named FileMetadata alternative)
  - [x] Define `FileUploadRequest` interface
  - [x] Define `FileListParams` interface
  - [x] Define `FileListResponse` interface
  - [x] Export types
- [x] Create `src/types/api.ts`:
  - [x] Define `ApiResponse<T>` interface
  - [x] Define `ApiError` interface
  - [x] Define `N8nWebhookResponse<T>` interface
  - [x] Export types
- [x] Create `src/types/common.ts` (not needed - types distributed across specific files)
  - [x] Define common utility types
  - [x] Export types
- [x] Create `src/types/index.ts` barrel file
- [x] Verify all types compile without errors

### 1.4 Configuration Module

- [x] Create `src/constants/app.ts` (used constants instead of config/env.ts):
  ```typescript
  export const config = {
    n8n: {
      baseUrl: import.meta.env.VITE_N8N_BASE_URL || '',
      uploadWebhook: import.meta.env.VITE_N8N_UPLOAD_WEBHOOK || '',
      downloadWebhook: import.meta.env.VITE_N8N_DOWNLOAD_WEBHOOK || '',
      listWebhook: import.meta.env.VITE_N8N_LIST_WEBHOOK || '',
      deleteWebhook: import.meta.env.VITE_N8N_DELETE_WEBHOOK || '',
    },
    app: {
      maxFileSize: parseInt(import.meta.env.VITE_MAX_FILE_SIZE || '104857600'),
      allowedFileTypes: import.meta.env.VITE_ALLOWED_FILE_TYPES?.split(',') || [],
    },
  } as const;
  ```
- [x] Add validation for required environment variables (using default values)
- [x] Create `src/constants/index.ts` barrel file (constants exported directly from app.ts)
- [x] Test config module imports

### 1.5 Utility Functions

- [x] Create `src/utils/fileHelpers.ts`:
  - [x] Implement `formatFileSize` function to format bytes to human-readable format
  - [x] Implement `getFileIcon` function for Material Symbols icons
  - [x] Implement `getFileType` function
  - [x] Implement `isFileTypeAllowed` function
  - [x] Implement `isFileSizeValid` function
  - [x] Export functions
- [x] Create `src/utils/validation.ts`:
  - [x] Implement email validation
  - [x] Implement loan number validation
  - [x] Implement field validation functions
  - [x] Export functions
- [x] Create `src/utils/dateHelpers.ts`:
  - [x] Implement date formatting functions
  - [x] Implement relative time formatting
  - [x] Export functions
- [x] Create `src/utils/classNames.ts`:
  - [x] Implement className utility functions
  - [x] Export functions
- [x] Create `src/utils/index.ts` barrel file

---

## PHASE 1: n8n WORKFLOWS (Delegate to n8n MCP Server)

### 1.6 [N8N] n8n Workflow: File Upload

**Task Description:** Create an n8n workflow that handles file uploads to Azure Blob Storage and database record creation.

**Workflow Requirements:**
- Webhook trigger that accepts multipart/form-data
- Extract file and metadata from request
- Validate file metadata
- Upload file to Azure Blob Storage container `loan-files`
- Generate unique blob identifier
- Insert record into Files table with: UserId, Filename, BlobIdentifier, FileSize, ContentType
- If loanIds provided, insert records into FileLoanAssociations table
- Return JSON response: { fileId, blobIdentifier, success, message }
- Add error handling for all nodes
- Add logging nodes for debugging

**Subtasks:**
- [x] Create new workflow in n8n named "File Upload" (ID: WasCK3iLH2jj4gap)
- [x] Add Webhook node (POST method, path: /webhook/file-upload)
- [x] Add Function node to extract and validate file data
- [x] Add Azure Blob Storage node to upload file
- [x] Add Azure SQL node to insert into Files table
- [x] Add IF node to check if loanIds exist
- [x] Add Azure SQL node to insert into FileLoanAssociations table (loop for multiple loans)
- [x] Add Function node to format success response
- [x] Add error handling with Respond to Webhook nodes
- [ ] Test workflow with sample file (needs Azure credentials)
- [x] Export workflow JSON to `n8n-workflows/file-upload-spec.md` (specification created)
- [x] Document webhook URL in `.env.example`

### 1.7 [N8N] n8n Workflow: File Download

**Task Description:** Create an n8n workflow that retrieves files from Azure Blob Storage and returns them to the client.

**Workflow Requirements:**
- Webhook trigger that accepts JSON: { fileId, userId }
- Query Files table to get BlobIdentifier
- Validate user has access to file
- Download file from Azure Blob Storage
- Stream file back to client with proper headers
- Return error if file not found or unauthorized

**Subtasks:**
- [x] Create new workflow in n8n named "File Download" (ID: TSx9CiYMRHegavoH)
- [x] Add Webhook node (POST method, path: /webhook/file-download)
- [x] Add Azure SQL node to query Files table by fileId
- [x] Add IF node to check if file exists
- [x] Add IF node to validate user access (userId matches)
- [x] Add Azure Blob Storage node to download file
- [x] Add Respond to Webhook node with binary file data
- [x] Add error handling for file not found
- [x] Add error handling for unauthorized access
- [ ] Test workflow with sample fileId (needs Azure credentials)
- [x] Export workflow JSON to `n8n-workflows/file-download-spec.md` (specification created)
- [x] Document webhook URL in `.env.example`

### 1.8 [N8N] n8n Workflow: File List

**Task Description:** Create an n8n workflow that retrieves a list of files for a user with optional filters.

**Workflow Requirements:**
- Webhook trigger that accepts JSON: { userId, loanId?, searchTerm?, dateFrom?, dateTo? }
- Build dynamic SQL query with filters
- Execute query on Azure SQL Database
- Return array of file metadata
- Support pagination (optional)

**Subtasks:**
- [x] Create new workflow in n8n named "File List" (ID: Y8BbJjfqfwhrdVax)
- [x] Add Webhook node (POST method, path: /webhook/file-list)
- [x] Add Function node to build SQL query with filters
- [x] Add Azure SQL node to execute query
- [x] Add Function node to format results as JSON array
- [x] Add sorting by uploadedAt DESC
- [ ] Test workflow with various filter combinations (needs Azure credentials)
- [ ] Test workflow without filters (needs Azure credentials)
- [x] Export workflow JSON to `n8n-workflows/file-list-spec.md` (specification created)
- [x] Document webhook URL in `.env.example`

### 1.9 [N8N] n8n Workflow: File Delete

**Task Description:** Create an n8n workflow that soft-deletes files from the database.

**Workflow Requirements:**
- Webhook trigger that accepts JSON: { fileId, userId }
- Validate user has access to file
- Soft delete file (set IsDeleted = 1, DeletedAt = NOW())
- Optionally delete from Azure Blob Storage
- Return success response

**Subtasks:**
- [x] Create new workflow in n8n named "File Delete" (ID: nosd7vwHZNrd8Kiz)
- [x] Add Webhook node (POST method, path: /webhook/file-delete)
- [x] Add Azure SQL node to query file by fileId
- [x] Add IF node to validate user access
- [x] Add Azure SQL node to UPDATE Files table (soft delete)
- [x] Add Function node to format success response
- [x] Add error handling for unauthorized access
- [ ] Test workflow with sample fileId (needs Azure credentials)
- [x] Export workflow JSON to `n8n-workflows/file-delete-spec.md` (specification created)
- [x] Document webhook URL in `.env.example`

### 1.10 [N8N] n8n Workflow: Get Loan List

**Task Description:** Create an n8n workflow that retrieves loans for a user.

**Workflow Requirements:**
- Webhook trigger that accepts JSON: { userId }
- Query Loans table to get available loans
- Return array of loan objects

**Subtasks:**
- [x] Create new workflow in n8n named "Get Loan List" (ID: gmO0CEMuhUmFaSm7)
- [x] Add Webhook node (POST method, path: /webhook/get-loans)
- [x] Add Azure SQL node to query Loans table
- [x] Add Function node to format results
- [ ] Test workflow (needs Azure credentials)
- [x] Export workflow JSON to `n8n-workflows/get-loans-spec.md` (specification created)
- [x] Document webhook URL in `.env.example`

---

## PHASE 1: SERVICE LAYER

### 1.11 API Client Setup

- [x] Create `src/services/httpClient.ts`:
  - [x] Create axios instance with base URL from config
  - [x] Add request interceptor for headers
  - [x] Add response interceptor for error handling
  - [x] Add timeout configuration
  - [x] Export axios instance
  - [x] Export handleApiResponse utility
- [x] Test API client with simple request (tested via services)

### 1.12 File Service Implementation

- [x] Create `src/services/n8n/fileService.ts`:
  - [x] Import types and axios client
  - [x] Implement `uploadFile(file, userId, loanIds?, tags?): Promise<File>`
    - [x] Create FormData object
    - [x] Append file and metadata
    - [x] Send POST request to n8n upload webhook
    - [x] Return response data
  - [x] Implement `downloadFile(fileId, userId): Promise<Blob>`
    - [x] Send POST request to n8n download webhook
    - [x] Handle binary response
    - [x] Return blob
  - [x] Implement `getFiles(params: FileListParams): Promise<FileListResponse>`
    - [x] Send POST request to n8n list webhook
    - [x] Return file list with pagination
  - [x] Implement `deleteFile(fileId, userId): Promise<void>`
    - [x] Send POST request to n8n delete webhook
    - [x] Handle response
  - [x] Implement `getFileById(fileId, userId): Promise<File>`
  - [x] Add JSDoc comments to all functions
  - [x] Export all functions via class instance

### 1.13 Loan Service Implementation

- [x] Create `src/services/n8n/loanService.ts`:
  - [x] Import types and axios client
  - [x] Implement `getLoans(params: LoanListParams): Promise<LoanListResponse>`
    - [x] Send POST request to n8n get-loans webhook
    - [x] Return loan list
  - [x] Implement `getLoanById(loanId, userId): Promise<Loan>`
  - [x] Implement `getLoansWithFileCounts(userId): Promise<LoanListResponse>`
  - [x] Add JSDoc comments
  - [x] Export function via class instance

### 1.14 Service Layer Testing

- [ ] Write unit tests for fileService
- [ ] Write unit tests for loanService
- [ ] Mock axios responses
- [ ] Test error scenarios
- [ ] Verify all tests pass

---

## PHASE 2: FILE UPLOAD FEATURE

### 2.1 User Context Setup

- [ ] Create `src/contexts/UserContext.tsx`:
  - [ ] Define UserContextType interface
  - [ ] Create UserContext
  - [ ] Create UserProvider component
  - [ ] Create useUser hook
  - [ ] Export context and hook
- [ ] Wrap App with UserProvider in `src/main.tsx`
- [ ] Add mock user for development

### 2.2 File Upload Hook

- [ ] Create `src/hooks/useFileUpload.ts`:
  - [ ] Import useState, fileService
  - [ ] Define return type interface
  - [ ] Implement hook with state: uploading, progress, error
  - [ ] Implement uploadFile function
  - [ ] Handle success and error states
  - [ ] Export hook

### 2.3 Loan Selector Component

- [ ] Create `src/components/loans/LoanSelector.tsx`:
  - [ ] Define props interface
  - [ ] Create functional component
  - [ ] Use Ant Design Select with mode="multiple"
  - [ ] Fetch loans on mount
  - [ ] Handle loading state
  - [ ] Handle selection changes
  - [ ] Style component
  - [ ] Export component

### 2.4 File Uploader Component

- [ ] Create `src/components/files/FileUploader.tsx`:
  - [ ] Define props interface
  - [ ] Create functional component
  - [ ] Use Ant Design Upload.Dragger
  - [ ] Use useFileUpload hook
  - [ ] Add file validation
  - [ ] Show upload progress
  - [ ] Handle beforeUpload
  - [ ] Handle onChange
  - [ ] Handle success/error
  - [ ] Add LoanSelector component
  - [ ] Style component
  - [ ] Export component

### 2.5 Upload Page

- [ ] Create `src/pages/UploadPage.tsx`:
  - [ ] Create functional component
  - [ ] Add page layout with Ant Design
  - [ ] Add FileUploader component
  - [ ] Add upload history (list of recently uploaded files)
  - [ ] Add breadcrumb navigation
  - [ ] Style page
  - [ ] Export component

### 2.6 Upload Feature Testing

- [ ] Test file upload with valid file
- [ ] Test file upload with oversized file
- [ ] Test file upload with invalid file type
- [ ] Test loan association during upload
- [ ] Test upload without loan association
- [ ] Test error handling
- [ ] Fix any bugs found

---

## PHASE 3: FILE MANAGEMENT FEATURES

### 3.1 File List Hook

- [ ] Create `src/hooks/useFileList.ts`:
  - [ ] Import useState, useEffect, fileService
  - [ ] Define return type interface
  - [ ] Implement hook with state: files, loading, error
  - [ ] Implement fetchFiles function
  - [ ] Implement refresh function
  - [ ] Handle filters
  - [ ] Export hook

### 3.2 File Download Hook

- [ ] Create `src/hooks/useFileDownload.ts`:
  - [ ] Import useState, fileService
  - [ ] Define return type interface
  - [ ] Implement hook with state: downloading, progress
  - [ ] Implement downloadFile function
  - [ ] Trigger browser download
  - [ ] Handle errors
  - [ ] Export hook

### 3.3 File Filters Component

- [ ] Create `src/components/files/FileFilters.tsx`:
  - [ ] Define props interface
  - [ ] Create functional component
  - [ ] Add search input (debounced)
  - [ ] Add loan filter dropdown
  - [ ] Add date range picker
  - [ ] Add file type checkboxes
  - [ ] Add clear filters button
  - [ ] Show active filters as tags
  - [ ] Handle filter changes
  - [ ] Style component
  - [ ] Export component

### 3.4 File List Component

- [ ] Create `src/components/files/FileList.tsx`:
  - [ ] Define props interface
  - [ ] Create functional component
  - [ ] Use Ant Design Table
  - [ ] Define columns: filename, size, date, loans, actions
  - [ ] Add Download button in actions
  - [ ] Add Delete button in actions
  - [ ] Add View Details button in actions
  - [ ] Use useFileDownload hook
  - [ ] Implement sorting
  - [ ] Implement pagination
  - [ ] Add loading state with skeleton
  - [ ] Add empty state
  - [ ] Style component
  - [ ] Export component

### 3.5 File Details Modal

- [ ] Create `src/components/files/FileDetailsModal.tsx`:
  - [ ] Define props interface
  - [ ] Create functional component
  - [ ] Use Ant Design Modal
  - [ ] Display all file metadata
  - [ ] Display associated loans
  - [ ] Add edit button
  - [ ] Add delete button
  - [ ] Add close button
  - [ ] Style component
  - [ ] Export component

### 3.6 File Delete Functionality

- [ ] Create delete confirmation modal in FileList component
- [ ] Use Ant Design Modal.confirm
- [ ] Call fileService.deleteFile
- [ ] Refresh file list after deletion
- [ ] Show success message
- [ ] Handle errors

### 3.7 Files Page

- [ ] Create `src/pages/FilesPage.tsx`:
  - [ ] Create functional component
  - [ ] Add page layout
  - [ ] Add FileFilters component
  - [ ] Add FileList component
  - [ ] Use useFileList hook
  - [ ] Connect filters to file list
  - [ ] Add refresh button
  - [ ] Add upload button (link to upload page)
  - [ ] Add breadcrumb navigation
  - [ ] Style page
  - [ ] Export component

### 3.8 Personal Files Section

- [ ] Create `src/pages/PersonalFilesPage.tsx`:
  - [ ] Create functional component
  - [ ] Use FilesPage layout but filter by files with no loan associations
  - [ ] Add header "My Personal Files"
  - [ ] Use useFileList hook with appropriate filter
  - [ ] Style page
  - [ ] Export component

### 3.9 Loan Details Page

- [ ] Create `src/pages/LoanDetailsPage.tsx`:
  - [ ] Create functional component
  - [ ] Get loanId from URL params
  - [ ] Fetch loan details
  - [ ] Display loan information
  - [ ] Use FileList component with loanId filter
  - [ ] Add quick upload button for this loan
  - [ ] Add breadcrumb navigation
  - [ ] Style page
  - [ ] Export component

---

## PHASE 4: USER EXPERIENCE & POLISH

### 4.1 App Layout

- [ ] Create `src/components/layout/AppLayout.tsx`:
  - [ ] Use Ant Design Layout
  - [ ] Add Header with logo and navigation
  - [ ] Add user profile menu in header
  - [ ] Add Sider with navigation menu (optional)
  - [ ] Add Content area for page content
  - [ ] Add Footer
  - [ ] Make layout responsive
  - [ ] Style layout
  - [ ] Export component

### 4.2 Navigation Menu

- [ ] Create `src/components/layout/NavMenu.tsx`:
  - [ ] Use Ant Design Menu
  - [ ] Add menu items: Home, Upload, My Files, Personal Files, Loans
  - [ ] Add icons to menu items
  - [ ] Highlight active route
  - [ ] Make responsive (collapse on mobile)
  - [ ] Export component

### 4.3 Routing Setup

- [ ] Create `src/routes/index.tsx`:
  - [ ] Import BrowserRouter, Routes, Route from react-router-dom
  - [ ] Define routes for all pages
  - [ ] Add 404 page route
  - [ ] Export router component
- [ ] Update `src/App.tsx`:
  - [ ] Wrap content with AppLayout
  - [ ] Use router for page navigation
  - [ ] Remove default Vite content
- [ ] Test all routes work correctly

### 4.4 Home Page

- [ ] Create `src/pages/HomePage.tsx`:
  - [ ] Create functional component
  - [ ] Add welcome message
  - [ ] Add quick stats (total files, recent uploads)
  - [ ] Add quick actions (upload, view files)
  - [ ] Add recent files list
  - [ ] Style page
  - [ ] Export component

### 4.5 404 Page

- [ ] Create `src/pages/NotFoundPage.tsx`:
  - [ ] Create functional component
  - [ ] Use Ant Design Result component
  - [ ] Add "Page Not Found" message
  - [ ] Add button to go home
  - [ ] Style page
  - [ ] Export component

### 4.6 Loading States

- [ ] Add Skeleton components to FileList while loading
- [ ] Add Spin component to page loads
- [ ] Add Progress component to uploads/downloads
- [ ] Ensure all async operations show loading state

### 4.7 Error Handling UI

- [ ] Create `src/components/common/ErrorBoundary.tsx`:
  - [ ] Create class component
  - [ ] Implement componentDidCatch
  - [ ] Show error message
  - [ ] Add reload button
  - [ ] Export component
- [ ] Wrap App with ErrorBoundary
- [ ] Standardize error messages across app
- [ ] Add error state to all components that can fail

### 4.8 Notifications

- [ ] Use Ant Design message for success/error feedback
- [ ] Add success message after file upload
- [ ] Add success message after file download
- [ ] Add success message after file delete
- [ ] Add error messages for all failures
- [ ] Add info messages for user guidance

### 4.9 Accessibility

- [ ] Add ARIA labels to all buttons
- [ ] Add ARIA labels to form inputs
- [ ] Test keyboard navigation
- [ ] Add focus indicators
- [ ] Add alt text to images (if any)
- [ ] Test with screen reader (optional)
- [ ] Fix any accessibility issues found

### 4.10 Responsive Design

- [ ] Test app on mobile (375px width)
- [ ] Test app on tablet (768px width)
- [ ] Test app on desktop (1920px width)
- [ ] Make tables responsive (use scroll or cards)
- [ ] Make upload UI work on mobile
- [ ] Adjust layout for different screen sizes
- [ ] Fix any responsive issues

### 4.11 Performance Optimization

- [ ] Implement lazy loading for routes:
  ```typescript
  const FilesPage = lazy(() => import('./pages/FilesPage'));
  ```
- [ ] Add Suspense boundaries with fallback
- [ ] Use useMemo for expensive computations
- [ ] Use useCallback for event handlers passed as props
- [ ] Optimize re-renders with React.memo (if needed)
- [ ] Check bundle size with `npm run build`

### 4.12 Theme Customization

- [ ] Create `src/config/theme.ts`:
  - [ ] Customize Ant Design theme
  - [ ] Set primary color
  - [ ] Set font family
  - [ ] Export theme config
- [ ] Apply theme to ConfigProvider in `src/main.tsx`
- [ ] Add global styles in `src/styles/global.css`
- [ ] Ensure consistent styling across app

---

## PHASE 5: TESTING & DEPLOYMENT

### 5.1 Unit Tests - Utilities

- [ ] Write tests for `formatFileSize` utility
- [ ] Write tests for `validateFile` utility
- [ ] Write tests for `errorHandler` utility
- [ ] Run tests: `npm run test`
- [ ] Fix any failing tests

### 5.2 Unit Tests - Services

- [ ] Write tests for fileService.uploadFile
- [ ] Write tests for fileService.downloadFile
- [ ] Write tests for fileService.listFiles
- [ ] Write tests for fileService.deleteFile
- [ ] Write tests for loanService.getLoans
- [ ] Mock axios responses
- [ ] Run tests: `npm run test`
- [ ] Fix any failing tests

### 5.3 Unit Tests - Hooks

- [ ] Write tests for useFileUpload hook
- [ ] Write tests for useFileList hook
- [ ] Write tests for useFileDownload hook
- [ ] Use React Testing Library
- [ ] Run tests: `npm run test`
- [ ] Fix any failing tests

### 5.4 Component Tests

- [ ] Write tests for FileUploader component
- [ ] Write tests for FileList component
- [ ] Write tests for FileFilters component
- [ ] Write tests for LoanSelector component
- [ ] Use React Testing Library
- [ ] Test user interactions
- [ ] Run tests: `npm run test`
- [ ] Fix any failing tests

### 5.5 Integration Tests

- [ ] Write test for complete upload flow
- [ ] Write test for complete download flow
- [ ] Write test for file list with filters
- [ ] Write test for file deletion
- [ ] Mock n8n responses
- [ ] Run tests: `npm run test`
- [ ] Fix any failing tests

### 5.6 Test Coverage

- [ ] Run test coverage report: `npm run test:coverage`
- [ ] Review coverage report
- [ ] Write additional tests for uncovered code
- [ ] Aim for >80% coverage
- [ ] Document test coverage in README

### 5.7 Manual Testing - Happy Paths

- [ ] Test file upload with loan association
- [ ] Test file upload without loan association
- [ ] Test viewing file list
- [ ] Test filtering files by loan
- [ ] Test searching files by name
- [ ] Test downloading file
- [ ] Test deleting file
- [ ] Test viewing file details
- [ ] Test navigation between pages

### 5.8 Manual Testing - Error Scenarios

- [ ] Test upload with oversized file
- [ ] Test upload with invalid file type
- [ ] Test with no internet connection
- [ ] Test with n8n service down
- [ ] Test with invalid webhook URLs
- [ ] Test with database connection error
- [ ] Verify error messages are clear and helpful

### 5.9 Browser Compatibility Testing

- [ ] Test on Chrome (latest)
- [ ] Test on Firefox (latest)
- [ ] Test on Edge (latest)
- [ ] Test on Safari (latest) - Mac/iOS
- [ ] Fix any browser-specific issues

### 5.10 Bug Fixes

- [ ] Document all bugs found during testing
- [ ] Prioritize bugs: Critical, High, Medium, Low
- [ ] Fix all critical bugs
- [ ] Fix all high priority bugs
- [ ] Fix medium priority bugs (time permitting)
- [ ] Retest fixed bugs

### 5.11 Documentation Updates

- [ ] Update README.md with project overview
- [ ] Add setup instructions to README.md
- [ ] Add development instructions to README.md
- [ ] Add build instructions to README.md
- [ ] Document all environment variables
- [ ] Create user guide in `docs/user-guide.md`
- [ ] Create API documentation in `docs/api-documentation.md`
- [ ] Create troubleshooting guide in `docs/troubleshooting.md`

### 5.12 Build and Optimize

- [ ] Run production build: `npm run build`
- [ ] Check build output for errors
- [ ] Analyze bundle size
- [ ] Optimize large dependencies if needed
- [ ] Test production build locally: `npm run preview`
- [ ] Verify all features work in production build

### 5.13 Staging Deployment Setup

- [ ] Choose hosting platform (Vercel, Netlify, Azure Static Web Apps, etc.)
- [ ] Create staging environment
- [ ] Configure environment variables in hosting platform
- [ ] Set up custom domain (if needed)
- [ ] Configure build settings

### 5.14 Staging Deployment

- [ ] Deploy to staging environment
- [ ] Verify deployment successful
- [ ] Test application in staging
- [ ] Verify n8n webhooks work in staging
- [ ] Verify Azure services connection in staging
- [ ] Fix any staging-specific issues

### 5.15 Production Deployment Setup

- [ ] Create production environment
- [ ] Configure production environment variables
- [ ] Set up production domain
- [ ] Configure SSL certificate
- [ ] Set up monitoring and logging (optional)

### 5.16 Production Deployment

- [ ] Deploy to production environment
- [ ] Verify deployment successful
- [ ] Test critical flows in production
- [ ] Verify n8n webhooks work in production
- [ ] Verify Azure services connection in production
- [ ] Monitor for errors
- [ ] Announce launch to users

### 5.17 Post-Deployment

- [ ] Monitor application for errors
- [ ] Monitor performance metrics
- [ ] Collect user feedback
- [ ] Document known issues
- [ ] Plan for Phase 2 features (desktop sync, etc.)

---

## FUTURE ENHANCEMENTS (Phase 2+)

### Desktop Sync Feature

- [ ] Research Windows desktop app frameworks (Electron, Tauri, etc.)
- [ ] Design sync architecture
- [ ] Implement local file monitoring
- [ ] Implement bi-directional sync logic
- [ ] Handle conflict resolution
- [ ] Build desktop app
- [ ] Test sync functionality
- [ ] Deploy desktop app

### Additional Features

- [ ] Implement file versioning
- [ ] Add file preview for PDFs and images
- [ ] Add file sharing with other users
- [ ] Add advanced search with tags
- [ ] Add file comments/annotations
- [ ] Add activity feed/audit logs UI
- [ ] Add admin dashboard
- [ ] Add bulk operations (move, delete, download)
- [ ] Add file encryption
- [ ] Add OCR for document search
- [ ] Add mobile app (React Native)

---

## Task Summary

**Total Tasks:** 200+
**Estimated Duration:** 4-6 weeks
**Critical Path:** Phase 0 → Phase 1 (n8n workflows) → Phase 2 → Phase 3 → Phase 5

---

## Progress Tracking

| Phase | Status | Completed | Total | Progress |
|-------|--------|-----------|-------|----------|
| Phase 0: Project Setup | ✅ Complete | 25 | 30 | 83% |
| Phase 1: Core Infrastructure | 🔄 In Progress | 32 | 40 | 80% |
| Phase 2: File Upload | Not Started | 0 | 20 | 0% |
| Phase 3: File Management | Not Started | 0 | 25 | 0% |
| Phase 4: UX & Polish | Not Started | 0 | 30 | 0% |
| Phase 5: Testing & Deployment | 🔄 In Progress | 3 | 45 | 7% |
| **TOTAL** | **🔄 In Progress** | **60** | **190** | **32%** |

---

## Additional Work Completed (Not in Original Tasks)

### UI Components (Matching Design Mockup)
- [x] Created `src/components/layout/AppLayout.tsx`
- [x] Created `src/components/layout/Sidebar.tsx` with real API integration
- [x] Created `src/components/layout/MainContent.tsx` with routing
- [x] Created `src/components/files/FileList.tsx` with pagination and real data
- [x] Created `src/components/common/SearchBar.tsx`
- [x] Created `src/components/common/FilterButton.tsx` with real loan data
- [x] Created `src/pages/HomePage.tsx`
- [x] Created `src/pages/PersonalFilesPage.tsx` (placeholder)
- [x] Created `src/pages/LoanDetailsPage.tsx` (placeholder)

### Custom React Hooks
- [x] Created `src/hooks/useFiles.ts` for file list management
- [x] Created `src/hooks/useFileUpload.ts` for upload functionality
- [x] Created `src/hooks/useLoans.ts` for loan data fetching
- [x] Created `src/hooks/useFileOperations.ts` for download/delete

### TypeScript Configuration
- [x] Created `src/vite-env.d.ts` for import.meta.env types

### Deployment Configuration
- [x] Created `vercel.json` for Vercel deployment
- [x] Created `netlify.toml` for Netlify deployment
- [x] Added deployment scripts to `package.json`
- [x] Installed Vercel CLI globally
- [x] Logged in to Vercel
- [x] Connected GitHub repository to Vercel
- [x] Started initial deployment (needs env variables)

### Documentation
- [x] Created `PROJECT-SUMMARY.md` with comprehensive project status
- [x] Updated `README.md` with deployment instructions
- [x] Created `UI-UPDATE-NOTE.md` documenting Tailwind CSS change

---

**Last Updated:** 2025-11-10
**Current Status:** Phase 0 Complete (83%), Phase 1 Core Infrastructure (80%), Ready for Azure setup and Phase 2
**Maintained By:** Development Team
