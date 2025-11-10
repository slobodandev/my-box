# PLANNING.md - Project Plan
## Loan File Management System

**Project Duration:** 4-6 weeks (estimated)
**Team Size:** 1-3 developers
**Status:** Planning Phase

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Development Phases](#development-phases)
3. [Phase Breakdown](#phase-breakdown)
4. [Technical Architecture](#technical-architecture)
5. [Risk Management](#risk-management)
6. [Timeline](#timeline)
7. [Success Criteria](#success-criteria)

---

## Project Overview

### Goals
Build a lightweight, cloud-based file management system that enables users to:
- Upload and manage files related to loans
- Store personal documents with optional loan associations
- Associate files with multiple loans
- Efficiently search, filter, and download files

### Key Deliverables
1. React web application with Ant Design UI
2. Azure Blob Storage integration
3. n8n workflow automation for file operations
4. Azure SQL Database schema and queries
5. Comprehensive documentation
6. Deployment-ready application

---

## Development Phases

### Phase 0: Project Setup (Week 1)
**Duration:** 3-5 days
**Focus:** Foundation and infrastructure

**Objectives:**
- Initialize React + Vite + TypeScript project
- Set up development environment
- Configure Azure resources
- Install and configure dependencies
- Create project structure

### Phase 1: Core Infrastructure (Week 1-2)
**Duration:** 5-7 days
**Focus:** Database, services, and n8n workflows

**Objectives:**
- Design and implement database schema
- Create n8n workflows for file operations
- Set up Azure Blob Storage integration
- Implement API service layer
- Create TypeScript types and interfaces

### Phase 2: File Upload Feature (Week 2-3)
**Duration:** 5-7 days
**Focus:** File upload functionality

**Objectives:**
- Build file upload UI components
- Implement drag-and-drop functionality
- Add file validation and preview
- Connect to n8n upload workflow
- Handle upload progress and errors
- Add multi-loan association UI

### Phase 3: File Management Features (Week 3-4)
**Duration:** 5-7 days
**Focus:** Viewing, downloading, and organizing files

**Objectives:**
- Build file list and grid views
- Implement file filtering and search
- Create download functionality
- Add file metadata editing
- Implement loan association management
- Build personal files section

### Phase 4: User Experience & Polish (Week 4-5)
**Duration:** 5-7 days
**Focus:** UX improvements and refinements

**Objectives:**
- Implement responsive design
- Add loading states and skeletons
- Improve error handling and messaging
- Add user feedback (toasts, notifications)
- Implement keyboard shortcuts
- Add accessibility features

### Phase 5: Testing & Deployment (Week 5-6)
**Duration:** 5-7 days
**Focus:** Quality assurance and deployment

**Objectives:**
- Write and run unit tests
- Perform integration testing
- Conduct user acceptance testing
- Fix bugs and issues
- Deploy to staging environment
- Deploy to production

---

## Phase Breakdown

### Phase 0: Project Setup

#### 0.1 Initialize Project
- [x] Create project directory
- [ ] Run `npm create vite@latest` with React + TypeScript template
- [ ] Install core dependencies (React, TypeScript, Vite)
- [ ] Install Ant Design and icons
- [ ] Install axios for HTTP requests
- [ ] Install development dependencies (ESLint, Prettier)
- [ ] Configure TypeScript (`tsconfig.json`)
- [ ] Configure Vite (`vite.config.ts`)

#### 0.2 Project Structure
- [ ] Create folder structure (components, services, hooks, types, etc.)
- [ ] Set up path aliases in Vite and TypeScript
- [ ] Create barrel exports (`index.ts` files)
- [ ] Add `.env.example` file
- [ ] Configure ESLint and Prettier rules

#### 0.3 Azure Setup
- [ ] Create Azure Blob Storage account
- [ ] Create container for file storage
- [ ] Generate SAS tokens or access keys
- [ ] Create Azure SQL Database
- [ ] Configure firewall rules
- [ ] Set up connection strings

#### 0.4 n8n Setup
- [ ] Install n8n (locally or cloud)
- [ ] Configure n8n instance
- [ ] Install Azure nodes (if needed)
- [ ] Test webhook connectivity
- [ ] Document webhook URLs

#### 0.5 Documentation
- [x] Create PDR.md
- [x] Create CLAUDE.md
- [x] Create PLANNING.md
- [ ] Create TASKS.md
- [ ] Update README.md

---

### Phase 1: Core Infrastructure

#### 1.1 Database Schema Design
**Priority:** High
**Dependencies:** Azure SQL Database

**Tasks:**
- [ ] Design `Users` table schema
- [ ] Design `Loans` table schema
- [ ] Design `Files` table schema
- [ ] Design `FileLoanAssociations` table schema
- [ ] Design `AuditLogs` table schema (optional)
- [ ] Create SQL migration scripts
- [ ] Add sample/seed data for testing
- [ ] Document schema in separate doc

**Schema Preview:**
```sql
-- Users Table
CREATE TABLE Users (
    UserId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Name NVARCHAR(255) NOT NULL,
    Email NVARCHAR(255) UNIQUE NOT NULL,
    Role NVARCHAR(50) NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE()
);

-- Loans Table
CREATE TABLE Loans (
    LoanId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    LoanNumber NVARCHAR(100) UNIQUE NOT NULL,
    BorrowerName NVARCHAR(255) NOT NULL,
    Amount DECIMAL(18, 2) NOT NULL,
    Status NVARCHAR(50) NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE()
);

-- Files Table
CREATE TABLE Files (
    FileId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NOT NULL,
    Filename NVARCHAR(500) NOT NULL,
    BlobIdentifier NVARCHAR(500) NOT NULL,
    BlobUrl NVARCHAR(1000),
    FileSize BIGINT NOT NULL,
    ContentType NVARCHAR(100),
    UploadedAt DATETIME2 DEFAULT GETUTCDATE(),
    IsDeleted BIT DEFAULT 0,
    DeletedAt DATETIME2 NULL,
    FOREIGN KEY (UserId) REFERENCES Users(UserId)
);

-- FileLoanAssociations Table
CREATE TABLE FileLoanAssociations (
    AssociationId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    FileId UNIQUEIDENTIFIER NOT NULL,
    LoanId UNIQUEIDENTIFIER NOT NULL,
    AssociatedAt DATETIME2 DEFAULT GETUTCDATE(),
    FOREIGN KEY (FileId) REFERENCES Files(FileId),
    FOREIGN KEY (LoanId) REFERENCES Loans(LoanId),
    UNIQUE(FileId, LoanId)
);
```

#### 1.2 TypeScript Type Definitions
**Priority:** High
**Dependencies:** Database schema

**Tasks:**
- [ ] Create `types/user.ts` with User interface
- [ ] Create `types/loan.ts` with Loan interface
- [ ] Create `types/file.ts` with File interfaces
- [ ] Create `types/api.ts` with API request/response types
- [ ] Create `types/common.ts` with shared types
- [ ] Export types from barrel file

#### 1.3 n8n Workflow: File Upload
**Priority:** High
**Dependencies:** Azure Blob Storage, Azure SQL DB
**Delegated to:** n8n MCP Server

**Workflow Steps:**
1. Webhook trigger (receives file + metadata)
2. Validate file metadata
3. Upload file to Azure Blob Storage
4. Get blob identifier and URL
5. Insert record into Files table
6. Insert records into FileLoanAssociations table (if loans provided)
7. Return success response with fileId

**Tasks:**
- [ ] Create workflow in n8n
- [ ] Add webhook trigger node
- [ ] Add Azure Blob Storage upload node
- [ ] Add Azure SQL insert nodes
- [ ] Add error handling nodes
- [ ] Test workflow end-to-end
- [ ] Export workflow JSON to `n8n-workflows/file-upload.json`
- [ ] Document webhook URL in `.env.example`

#### 1.4 n8n Workflow: File Download
**Priority:** High
**Dependencies:** Azure Blob Storage, Azure SQL DB
**Delegated to:** n8n MCP Server

**Workflow Steps:**
1. Webhook trigger (receives fileId)
2. Query Files table for blob identifier
3. Validate user has access to file
4. Download file from Azure Blob Storage
5. Stream file back to client
6. Log download in audit logs (optional)

**Tasks:**
- [ ] Create workflow in n8n
- [ ] Add webhook trigger node
- [ ] Add Azure SQL query node
- [ ] Add Azure Blob Storage download node
- [ ] Add streaming response
- [ ] Test workflow end-to-end
- [ ] Export workflow JSON to `n8n-workflows/file-download.json`

#### 1.5 n8n Workflow: File List
**Priority:** High
**Dependencies:** Azure SQL DB
**Delegated to:** n8n MCP Server

**Workflow Steps:**
1. Webhook trigger (receives userId, filters)
2. Build dynamic SQL query with filters
3. Execute query on Azure SQL DB
4. Format results as JSON array
5. Return file list

**Tasks:**
- [ ] Create workflow in n8n
- [ ] Add webhook trigger node
- [ ] Add Azure SQL query node with filters
- [ ] Handle optional loanId filter
- [ ] Add sorting and pagination (if needed)
- [ ] Test workflow with various filters
- [ ] Export workflow JSON to `n8n-workflows/file-list.json`

#### 1.6 n8n Workflow: File Delete
**Priority:** Medium
**Dependencies:** Azure Blob Storage, Azure SQL DB
**Delegated to:** n8n MCP Server

**Workflow Steps:**
1. Webhook trigger (receives fileId, userId)
2. Validate user has access to file
3. Soft delete file in database (set IsDeleted = 1)
4. Optionally delete from Azure Blob Storage
5. Return success response

**Tasks:**
- [ ] Create workflow in n8n
- [ ] Add webhook trigger node
- [ ] Add Azure SQL update node
- [ ] Add Azure Blob Storage delete node (optional)
- [ ] Add authorization check
- [ ] Test workflow end-to-end
- [ ] Export workflow JSON to `n8n-workflows/file-delete.json`

#### 1.7 Service Layer Implementation
**Priority:** High
**Dependencies:** n8n workflows, TypeScript types

**Tasks:**
- [ ] Create `services/api/client.ts` with axios instance
- [ ] Create `services/n8n/fileService.ts` with upload/download/list methods
- [ ] Add request/response interceptors
- [ ] Add error handling and retry logic
- [ ] Add TypeScript types for all methods
- [ ] Write unit tests for services

#### 1.8 Configuration Setup
**Priority:** High
**Dependencies:** None

**Tasks:**
- [ ] Create `config/env.ts` with environment variable exports
- [ ] Add validation for required env variables
- [ ] Create `.env.example` with all variables
- [ ] Document environment setup in README.md

---

### Phase 2: File Upload Feature

#### 2.1 File Upload UI Component
**Priority:** High
**Dependencies:** Ant Design, file service

**Tasks:**
- [ ] Create `components/files/FileUploader.tsx`
- [ ] Integrate Ant Design Upload component
- [ ] Add drag-and-drop functionality
- [ ] Add file validation (size, type)
- [ ] Show file preview (thumbnail for images)
- [ ] Display upload progress bar
- [ ] Handle upload errors with messages
- [ ] Add success feedback

#### 2.2 Loan Association UI
**Priority:** High
**Dependencies:** Loan data from database

**Tasks:**
- [ ] Create `components/files/LoanSelector.tsx`
- [ ] Fetch available loans for user
- [ ] Use Ant Design Select with multi-select
- [ ] Add search/filter for loans
- [ ] Display loan details (number, borrower)
- [ ] Allow optional loan association

#### 2.3 File Metadata Form
**Priority:** Medium
**Dependencies:** File uploader component

**Tasks:**
- [ ] Create `components/files/FileMetadataForm.tsx`
- [ ] Add fields for tags/categories (optional)
- [ ] Add description field (optional)
- [ ] Integrate with upload flow
- [ ] Validate form inputs

#### 2.4 Upload Integration
**Priority:** High
**Dependencies:** All upload components, n8n workflow

**Tasks:**
- [ ] Create custom hook `hooks/useFileUpload.ts`
- [ ] Integrate file service with upload component
- [ ] Handle FormData creation
- [ ] Track upload progress
- [ ] Handle success/error states
- [ ] Update UI after successful upload
- [ ] Add retry mechanism for failed uploads

#### 2.5 Upload Page/Modal
**Priority:** High
**Dependencies:** Upload components

**Tasks:**
- [ ] Create `pages/UploadPage.tsx` or `components/files/UploadModal.tsx`
- [ ] Compose all upload components
- [ ] Add page layout and styling
- [ ] Add navigation/routing
- [ ] Add cancel upload functionality
- [ ] Handle multiple file uploads (batch)

---

### Phase 3: File Management Features

#### 3.1 File List Component
**Priority:** High
**Dependencies:** Ant Design Table, file service

**Tasks:**
- [ ] Create `components/files/FileList.tsx`
- [ ] Use Ant Design Table component
- [ ] Define columns (filename, size, date, loans, actions)
- [ ] Add row actions (download, delete, edit)
- [ ] Implement sorting
- [ ] Implement pagination
- [ ] Add loading states with skeletons
- [ ] Handle empty state

#### 3.2 File Grid View (Optional)
**Priority:** Low
**Dependencies:** File list data

**Tasks:**
- [ ] Create `components/files/FileGrid.tsx`
- [ ] Use Ant Design Card or Grid
- [ ] Show file thumbnails
- [ ] Add view toggle (list/grid)
- [ ] Make responsive

#### 3.3 File Filters
**Priority:** High
**Dependencies:** File list component

**Tasks:**
- [ ] Create `components/files/FileFilters.tsx`
- [ ] Add filter by loan (dropdown)
- [ ] Add filter by date range (date picker)
- [ ] Add filter by file type (checkbox)
- [ ] Add search by filename (input)
- [ ] Apply filters to file list
- [ ] Show active filters as tags
- [ ] Add clear all filters button

#### 3.4 File Download
**Priority:** High
**Dependencies:** n8n download workflow

**Tasks:**
- [ ] Create `hooks/useFileDownload.ts`
- [ ] Integrate with n8n download workflow
- [ ] Handle file streaming
- [ ] Show download progress
- [ ] Save file with correct name
- [ ] Handle download errors
- [ ] Add bulk download (zip multiple files)

#### 3.5 File Details Modal
**Priority:** Medium
**Dependencies:** File metadata

**Tasks:**
- [ ] Create `components/files/FileDetailsModal.tsx`
- [ ] Display all file metadata
- [ ] Show associated loans
- [ ] Show upload history
- [ ] Add edit metadata button
- [ ] Add delete button
- [ ] Show file preview (if image/PDF)

#### 3.6 File Deletion
**Priority:** High
**Dependencies:** n8n delete workflow

**Tasks:**
- [ ] Create delete confirmation modal
- [ ] Integrate with n8n delete workflow
- [ ] Update file list after deletion
- [ ] Handle soft delete vs hard delete
- [ ] Add undo functionality (optional)

#### 3.7 File Association Management
**Priority:** Medium
**Dependencies:** File details, loan selector

**Tasks:**
- [ ] Create `components/files/FileAssociationManager.tsx`
- [ ] Allow adding loans to existing files
- [ ] Allow removing loan associations
- [ ] Update database through service
- [ ] Show visual feedback

#### 3.8 Personal Files Section
**Priority:** Medium
**Dependencies:** File list component

**Tasks:**
- [ ] Create filter for files with no loan associations
- [ ] Add dedicated "My Files" tab/page
- [ ] Allow converting personal files to loan files
- [ ] Show clear distinction in UI

#### 3.9 Loan Details Page
**Priority:** Medium
**Dependencies:** Loan data from database

**Tasks:**
- [ ] Create `pages/LoanDetailsPage.tsx`
- [ ] Display loan information
- [ ] Show all files associated with loan
- [ ] Add quick upload for loan
- [ ] Add breadcrumb navigation

---

### Phase 4: User Experience & Polish

#### 4.1 Layout and Navigation
**Priority:** High
**Dependencies:** Ant Design Layout

**Tasks:**
- [ ] Create `components/layout/AppLayout.tsx`
- [ ] Add top navigation bar
- [ ] Add sidebar menu (if needed)
- [ ] Add breadcrumb navigation
- [ ] Add user profile menu
- [ ] Make layout responsive

#### 4.2 Routing
**Priority:** High
**Dependencies:** React Router

**Tasks:**
- [ ] Install React Router
- [ ] Create `routes/index.tsx`
- [ ] Define routes (home, upload, files, loans, etc.)
- [ ] Add protected routes (auth)
- [ ] Add 404 page
- [ ] Add route transitions

#### 4.3 Loading States
**Priority:** Medium
**Dependencies:** All components

**Tasks:**
- [ ] Add skeleton screens for file list
- [ ] Add spinners for API calls
- [ ] Add progress bars for uploads/downloads
- [ ] Add loading overlays for actions
- [ ] Optimize perceived performance

#### 4.4 Error Handling UI
**Priority:** High
**Dependencies:** All components

**Tasks:**
- [ ] Create `components/common/ErrorBoundary.tsx`
- [ ] Add error pages (404, 500, etc.)
- [ ] Standardize error messages
- [ ] Add retry buttons for failed operations
- [ ] Log errors for debugging

#### 4.5 Notifications and Feedback
**Priority:** Medium
**Dependencies:** Ant Design message/notification

**Tasks:**
- [ ] Use Ant Design message for quick feedback
- [ ] Use Ant Design notification for detailed info
- [ ] Add success messages for all actions
- [ ] Add error messages with actionable info
- [ ] Add warning messages for destructive actions

#### 4.6 Accessibility
**Priority:** Medium
**Dependencies:** All components

**Tasks:**
- [ ] Add ARIA labels to all interactive elements
- [ ] Ensure keyboard navigation works
- [ ] Add focus indicators
- [ ] Test with screen readers
- [ ] Add alt text to images
- [ ] Ensure color contrast meets WCAG standards

#### 4.7 Responsive Design
**Priority:** High
**Dependencies:** All components

**Tasks:**
- [ ] Test on mobile devices
- [ ] Make tables responsive (scroll or cards)
- [ ] Adjust upload UI for mobile
- [ ] Test on tablet devices
- [ ] Add responsive breakpoints

#### 4.8 Performance Optimization
**Priority:** Medium
**Dependencies:** Full application

**Tasks:**
- [ ] Implement code splitting with React.lazy
- [ ] Optimize images and assets
- [ ] Add memoization where needed
- [ ] Optimize re-renders
- [ ] Lazy load components
- [ ] Add service worker (PWA - optional)

#### 4.9 Theme and Styling
**Priority:** Low
**Dependencies:** Ant Design

**Tasks:**
- [ ] Customize Ant Design theme
- [ ] Add company branding (if needed)
- [ ] Create global styles
- [ ] Ensure consistent spacing/sizing
- [ ] Add dark mode (optional)

---

### Phase 5: Testing & Deployment

#### 5.1 Unit Testing
**Priority:** High
**Dependencies:** Vitest or Jest

**Tasks:**
- [ ] Install testing dependencies (Vitest, Testing Library)
- [ ] Write tests for utility functions
- [ ] Write tests for custom hooks
- [ ] Write tests for services
- [ ] Achieve >80% code coverage
- [ ] Set up test running in CI/CD

#### 5.2 Integration Testing
**Priority:** Medium
**Dependencies:** Unit tests

**Tasks:**
- [ ] Test file upload flow end-to-end
- [ ] Test file download flow
- [ ] Test file list with filters
- [ ] Test error scenarios
- [ ] Mock n8n responses

#### 5.3 Component Testing
**Priority:** Medium
**Dependencies:** React Testing Library

**Tasks:**
- [ ] Test FileUploader component
- [ ] Test FileList component
- [ ] Test FileFilters component
- [ ] Test LoanSelector component
- [ ] Test user interactions

#### 5.4 Manual Testing
**Priority:** High
**Dependencies:** Complete application

**Tasks:**
- [ ] Test all features manually
- [ ] Test on different browsers (Chrome, Firefox, Edge, Safari)
- [ ] Test on mobile devices
- [ ] Test edge cases
- [ ] Create test scenarios document

#### 5.5 Bug Fixes
**Priority:** High
**Dependencies:** Testing phase

**Tasks:**
- [ ] Document all found bugs
- [ ] Prioritize bugs by severity
- [ ] Fix critical bugs
- [ ] Fix high priority bugs
- [ ] Fix medium/low priority bugs (time permitting)

#### 5.6 Staging Deployment
**Priority:** High
**Dependencies:** Bug fixes

**Tasks:**
- [ ] Set up staging environment
- [ ] Configure environment variables
- [ ] Deploy application to staging
- [ ] Test in staging environment
- [ ] Fix staging-specific issues

#### 5.7 Production Deployment
**Priority:** High
**Dependencies:** Staging validation

**Tasks:**
- [ ] Set up production environment
- [ ] Configure production environment variables
- [ ] Set up CI/CD pipeline (optional)
- [ ] Deploy to production
- [ ] Verify production deployment
- [ ] Set up monitoring and logging

#### 5.8 Documentation
**Priority:** High
**Dependencies:** Complete application

**Tasks:**
- [ ] Update README.md with setup instructions
- [ ] Document API endpoints (n8n webhooks)
- [ ] Create user guide
- [ ] Document deployment process
- [ ] Create troubleshooting guide

---

## Technical Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                       User Browser                          │
│                                                             │
│  ┌───────────────────────────────────────────────────┐    │
│  │         React Application (Vite)                  │    │
│  │                                                   │    │
│  │  ├─ Components (Ant Design)                      │    │
│  │  ├─ Services (API Layer)                         │    │
│  │  ├─ Hooks (Custom React Hooks)                   │    │
│  │  └─ State Management (Context API)               │    │
│  └───────────────────────────────────────────────────┘    │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ HTTPS
                 │
┌────────────────▼────────────────────────────────────────────┐
│                     n8n Workflows                           │
│                                                             │
│  ├─ File Upload Workflow                                   │
│  ├─ File Download Workflow                                 │
│  ├─ File List Workflow                                     │
│  └─ File Delete Workflow                                   │
└────────┬───────────────────────────┬────────────────────────┘
         │                           │
         │ Azure SDK                 │ SQL Connection
         │                           │
┌────────▼──────────────┐  ┌─────────▼───────────────────────┐
│   Azure Blob Storage  │  │     Azure SQL Database          │
│                       │  │                                 │
│  ├─ File Container    │  │  ├─ Users Table                │
│  └─ SAS Tokens        │  │  ├─ Loans Table                │
└───────────────────────┘  │  ├─ Files Table                │
                           │  └─ FileLoanAssociations Table │
                           └─────────────────────────────────┘
```

### Data Flow

#### Upload Flow
1. User selects file in React app
2. User optionally selects loan associations
3. React app sends file + metadata to n8n webhook
4. n8n uploads file to Azure Blob Storage
5. n8n receives blob identifier
6. n8n inserts file record into Azure SQL DB
7. n8n inserts loan associations (if any)
8. n8n returns fileId to React app
9. React app updates UI with new file

#### Download Flow
1. User clicks download in React app
2. React app sends fileId to n8n webhook
3. n8n queries Azure SQL DB for blob identifier
4. n8n downloads file from Azure Blob Storage
5. n8n streams file back to React app
6. React app triggers browser download

#### List Flow
1. User navigates to files page
2. React app sends userId + filters to n8n webhook
3. n8n queries Azure SQL DB with filters
4. n8n returns array of file metadata
5. React app renders file list with Ant Design Table

---

## Risk Management

### Identified Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Azure service outage | Low | High | Implement retry logic, show clear error messages |
| n8n workflow failure | Medium | High | Add error handling in workflows, log errors, add monitoring |
| Large file upload timeout | Medium | Medium | Implement chunked uploads (future), increase timeout limits |
| Database connection issues | Low | High | Connection pooling, retry logic, fallback error pages |
| Security vulnerabilities | Medium | High | Regular security audits, input validation, follow OWASP guidelines |
| Browser compatibility | Low | Medium | Test on multiple browsers, use polyfills if needed |
| Performance with many files | Medium | Medium | Implement pagination, virtual scrolling, lazy loading |
| Scope creep | High | Medium | Strictly follow PDR, defer non-essential features to Phase 2 |

---

## Timeline

### Gantt Chart (Approximate)

```
Week 1: Project Setup + Core Infrastructure
├─ Day 1-2: Project initialization
├─ Day 3-4: Database schema and n8n workflows
└─ Day 5: Service layer

Week 2: File Upload Feature + Infrastructure Completion
├─ Day 1-2: Complete n8n workflows
├─ Day 3-4: Upload UI components
└─ Day 5: Upload integration

Week 3: File Management Features
├─ Day 1-2: File list and filters
├─ Day 3-4: Download and delete
└─ Day 5: File details and associations

Week 4: More Features + UX Polish
├─ Day 1-2: Personal files, loan details
├─ Day 3-4: Layout, routing, navigation
└─ Day 5: Loading states, error handling

Week 5: UX Polish + Testing
├─ Day 1-2: Notifications, accessibility, responsive design
├─ Day 3-4: Unit and integration tests
└─ Day 5: Manual testing, bug fixes

Week 6: Deployment + Documentation
├─ Day 1-2: Bug fixes
├─ Day 3: Staging deployment
├─ Day 4: Production deployment
└─ Day 5: Final documentation and handoff
```

---

## Success Criteria

### Must-Have (P0)
- [ ] Users can upload files successfully
- [ ] Files are stored in Azure Blob Storage
- [ ] File metadata is stored in Azure SQL DB
- [ ] Users can view list of their files
- [ ] Users can download files
- [ ] Users can associate files with loans
- [ ] Users can view files by loan
- [ ] Application is responsive and works on mobile
- [ ] Basic error handling is in place
- [ ] Application is deployed to production

### Should-Have (P1)
- [ ] Users can filter and search files
- [ ] Users can delete files
- [ ] Users can edit file metadata/associations
- [ ] Upload progress is shown
- [ ] Download progress is shown
- [ ] Personal files section exists
- [ ] Loan details page exists
- [ ] Unit tests cover critical functions
- [ ] Documentation is comprehensive

### Nice-to-Have (P2)
- [ ] File preview (images, PDFs)
- [ ] Bulk file operations
- [ ] Advanced search with multiple filters
- [ ] File versioning
- [ ] Dark mode
- [ ] PWA capabilities
- [ ] Desktop sync (future phase)

---

## Next Steps

1. **Review and approve this plan** with stakeholders
2. **Set up development environment** (Phase 0)
3. **Begin Phase 1** with database schema and n8n workflows
4. **Regular check-ins** (daily standups, weekly reviews)
5. **Adjust timeline** as needed based on actual progress

---

**Last Updated:** 2025-11-10
**Document Owner:** Development Team
**Status:** Ready for Review
