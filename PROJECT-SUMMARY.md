# Project Summary - MyBox Loan File Management System

**Last Updated:** 2025-11-10
**Status:** Phase 0 Complete - Core Infrastructure Ready

## Project Overview

MyBox is a modern loan file management system built with React, TypeScript, and Tailwind CSS. It allows users to securely manage documents related to their loans and personal files, with cloud storage via Azure Blob Storage and workflow automation through n8n.

## Technology Stack

- **Frontend Framework:** React 18+ with Vite
- **Language:** TypeScript (strict mode)
- **CSS Framework:** Tailwind CSS v3
- **Routing:** React Router DOM v7
- **Icons:** Material Symbols Outlined (Google Icons)
- **Font:** Inter (Google Fonts)
- **HTTP Client:** Axios
- **Date Formatting:** date-fns
- **Testing:** Vitest + React Testing Library
- **Build Tool:** Vite v7
- **Linting:** ESLint + Prettier

## Backend Services

- **Workflow Automation:** n8n (http://48.223.194.241:5678)
- **Cloud Storage:** Azure Blob Storage (to be configured)
- **Database:** Azure SQL Database (to be configured)

## Completed Work

### Phase 0: Project Setup ✅

#### 1. Documentation Files
- ✅ **PDR.md** - Product Requirements Document with complete architecture
- ✅ **CLAUDE.md** - AI agent instructions with comprehensive UI design system
- ✅ **PLANNING.md** - 6-phase project plan with timeline
- ✅ **TASKS.md** - Detailed task breakdown (190+ tasks)
- ✅ **UI-UPDATE-NOTE.md** - Framework change documentation (Ant Design → Tailwind CSS)

#### 2. n8n Workflows Created
All workflows successfully created in n8n instance:

1. **Get Loan List** (ID: gmO0CEMuhUmFaSm7)
   - Endpoint: `/webhook/get-loans`
   - Retrieves user's loans with optional file counts

2. **File List** (ID: Y8BbJjfqfwhrdVax)
   - Endpoint: `/webhook/file-list`
   - Lists files with filters and pagination

3. **File Upload** (ID: WasCK3iLH2jj4gap)
   - Endpoint: `/webhook/file-upload`
   - Handles file uploads to Azure Blob Storage

4. **File Download** (ID: TSx9CiYMRHegavoH)
   - Endpoint: `/webhook/file-download`
   - Secure file downloads with authorization

5. **File Delete** (ID: nosd7vwHZNrd8Kiz)
   - Endpoint: `/webhook/file-delete`
   - Soft delete functionality

#### 3. Project Configuration
- ✅ **package.json** - All dependencies installed
- ✅ **tsconfig.json** - TypeScript configuration with path aliases
- ✅ **vite.config.ts** - Vite configuration with module resolution
- ✅ **tailwind.config.js** - Custom theme matching UI mockup
- ✅ **postcss.config.js** - PostCSS with Tailwind
- ✅ **.eslintrc.cjs** - ESLint configuration
- ✅ **.prettierrc.json** - Code formatting rules
- ✅ **.env** - Environment variables for development
- ✅ **.env.example** - Template for environment configuration

#### 4. Directory Structure
```
src/
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx
│   │   ├── Sidebar.tsx (with real API integration)
│   │   └── MainContent.tsx
│   ├── files/
│   │   └── FileList.tsx (with real API integration)
│   └── common/
│       ├── SearchBar.tsx
│       └── FilterButton.tsx (with real API integration)
├── pages/
│   ├── HomePage.tsx
│   ├── PersonalFilesPage.tsx
│   └── LoanDetailsPage.tsx
├── services/
│   ├── httpClient.ts
│   └── n8n/
│       ├── fileService.ts
│       └── loanService.ts
├── hooks/
│   ├── useFiles.ts
│   ├── useFileUpload.ts
│   ├── useLoans.ts
│   ├── useFileOperations.ts
│   └── index.ts
├── types/
│   ├── file.ts
│   ├── loan.ts
│   ├── user.ts
│   ├── api.ts
│   └── index.ts
├── utils/
│   ├── fileHelpers.ts
│   ├── dateHelpers.ts
│   ├── classNames.ts
│   ├── validation.ts
│   └── index.ts
├── constants/
│   └── app.ts
├── App.tsx
├── main.tsx
└── index.css
```

#### 5. Type Definitions Created
- **File Types:** Complete file management interfaces
- **Loan Types:** Loan data structures with status enum
- **User Types:** User and authentication types
- **API Types:** Generic API response wrappers
- All types exported from centralized index

#### 6. Utility Functions
- **File Helpers:** formatFileSize, getFileIcon, getFileType, sanitizeFilename
- **Date Helpers:** formatDate, formatDateReadable, formatRelativeTime
- **Class Names:** Conditional class name helpers
- **Validation:** Email, loan number, field validation

#### 7. Service Layer
- **HTTP Client:** Axios-based client with interceptors
- **File Service:** Complete CRUD operations via n8n webhooks
- **Loan Service:** Loan retrieval and management

#### 8. Custom React Hooks
- **useFiles:** Fetch and manage file lists with filters
- **useFileUpload:** Handle file upload with progress tracking
- **useLoans:** Fetch and manage loan data
- **useFileOperations:** Download and delete file operations

#### 9. UI Components (All Match UI Mockup Design)
- **AppLayout:** Main flex container with sidebar + content
- **Sidebar:** 256px sidebar with logo, navigation, expandable loans list (integrated with real API)
- **MainContent:** Routing container for pages
- **HomePage:** Dashboard with search, filters, file table (integrated with real API)
- **FileList:** Complete table with pagination, file icons, loading states (integrated with real API)
- **SearchBar:** Search input with icon prefix
- **FilterButton:** Loan filter dropdown (integrated with real API)

## Design System

### Colors
- **Primary:** #135bec (blue)
- **Background Light:** #f6f6f8
- **Background Dark:** #101622

### Layout
- **Sidebar Width:** 256px
- **Font:** Inter (weights: 400, 500, 700, 900)
- **Icons:** Material Symbols Outlined

### Dark Mode
Full dark mode support using Tailwind's `dark:` variant

## Current Status

### What Works
✅ Development server running at http://localhost:5173/
✅ All components render without errors
✅ React Router navigation functional
✅ Tailwind CSS styling applied correctly
✅ TypeScript compilation successful
✅ Component integration with n8n services complete
✅ Loading and error states implemented
✅ Pagination working with API

### What's Pending
⏳ Azure SQL Database schema creation
⏳ Azure Blob Storage configuration
⏳ Actual file upload functionality
⏳ File download implementation
⏳ File delete functionality
⏳ User authentication system
⏳ Personal Files page implementation
⏳ Loan Details page implementation
⏳ Unit and integration tests
⏳ End-to-end tests

## n8n Webhook URLs

All webhooks are accessible at: `http://48.223.194.241:5678/webhook/{endpoint}`

- `/webhook/get-loans` - Get user's loans
- `/webhook/file-list` - List files with filters
- `/webhook/file-upload` - Upload files
- `/webhook/file-download` - Download files
- `/webhook/file-delete` - Delete files

## Environment Configuration

Create a `.env` file based on `.env.example` with:
- n8n webhook URLs
- Azure Blob Storage credentials (when available)
- Mock user ID for development

## Running the Project

```bash
# Install dependencies (already done)
npm install

# Start development server (currently running)
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint
```

## Next Steps (Phase 1)

1. **Test n8n Workflows**
   - Verify all webhooks are responding correctly
   - Test with sample data
   - Debug any issues

2. **Implement File Upload**
   - Create upload modal/dialog
   - Integrate with useFileUpload hook
   - Add file validation
   - Show upload progress

3. **Complete Remaining Pages**
   - Personal Files page with filtering
   - Loan Details page with file list
   - Add navigation between pages

4. **Add Authentication**
   - Replace MOCK_USER_ID with real auth
   - Implement login/logout
   - Add protected routes

5. **Testing**
   - Write unit tests for utilities and hooks
   - Component tests for all UI components
   - Integration tests for API services

## Notes

- The UI design exactly matches the provided mockup from `ui-design/screen.png`
- All components use Tailwind CSS (framework changed from initially mentioned Ant Design)
- Mock user ID is currently "user-123" (configurable via .env)
- All file operations go through n8n webhooks (no direct Azure calls yet)
- Dark mode fully implemented throughout the application

## File Locations

- **Documentation:** Root directory (PDR.md, CLAUDE.md, etc.)
- **UI Design Reference:** `ui-design/` folder
- **n8n Workflow Specs:** `n8n-workflows/` folder
- **Source Code:** `src/` folder
- **Configuration:** Root directory (.env, tailwind.config.js, etc.)

---

**Project is ready for Phase 1 implementation!** 🎉
