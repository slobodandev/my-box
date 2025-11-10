# CLAUDE.md - AI Agent Instructions
## Loan File Management System

**Project Type:** React + Vite + TypeScript Web Application
**Purpose:** File management system for loan-related documents with Azure cloud integration

---

## Overview

This document provides comprehensive instructions for AI agents (Claude Code, Cursor, GitHub Copilot, etc.) working on this project. It outlines the project structure, conventions, patterns, and guidelines to maintain consistency and quality.

---

## Project Context

This is a lightweight web application that allows users to:
- Manage files related to specific loans
- Upload and store personal files (loan-related or general)
- Associate files with one or multiple loans
- Download and organize documents efficiently

**Key Technologies:**
- **Frontend:** React 18+, Vite, TypeScript, Tailwind CSS
- **Icons:** Material Symbols Outlined (Google Icons)
- **Font:** Inter (Google Fonts)
- **Storage:** Azure Blob Storage
- **Database:** Azure SQL Database
- **Workflows:** n8n automation
- **Future:** Windows desktop sync

**UI Design Reference:**
- **Mockup Screenshot:** `ui-design/screen.png`
- **HTML Reference:** `ui-design/code.html`

---

## UI Design System

### Design Principles
This project follows the design mockup provided in `ui-design/`. All components must match the visual design and interaction patterns shown in the mockup.

### Color Palette
```typescript
const colors = {
  primary: '#135bec',           // Primary blue for buttons, links, active states
  backgroundLight: '#f6f6f8',   // Light mode background
  backgroundDark: '#101622',    // Dark mode background

  // File type icons
  pdf: '#ef4444',               // Red for PDF files
  document: '#3b82f6',          // Blue for documents
  image: '#22c55e',             // Green for images

  // Loan badges
  loanBadgeBlue: '#3b82f6',     // Blue badge background
  loanBadgePurple: '#a855f7',   // Purple badge background
  personalBadge: '#6b7280',     // Gray for personal files
};
```

### Typography
- **Font Family:** Inter (from Google Fonts)
- **Font Weights:** 400 (normal), 500 (medium), 700 (bold), 900 (black)
- **Sizes:**
  - Heading (h1): `text-3xl` (30px), bold
  - Subheading: `text-base` (16px), normal
  - Body: `text-sm` (14px), normal/medium
  - Small: `text-xs` (12px), normal/medium

### Layout Structure
```
┌─────────────────────────────────────────────────────────┐
│  Left Sidebar (256px)  │  Main Content Area (flex-1)   │
│  - Logo                │  - Header with Welcome        │
│  - Navigation          │  - Search/Filter Bar          │
│  - Loans List          │  - File Table                 │
│  - New Loan Button     │  - Pagination                 │
└─────────────────────────────────────────────────────────┘
```

### Component Specifications

#### Buttons
```tsx
// Primary Button
<button className="flex min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] shadow-sm hover:bg-primary/90">
  <span className="material-symbols-outlined text-base">upload_file</span>
  <span>Upload File</span>
</button>

// Secondary Button (Filter)
<button className="flex h-12 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-gray-100 dark:bg-gray-700 px-4 border border-gray-200 dark:border-gray-600">
  <span className="material-symbols-outlined text-gray-600 dark:text-gray-300 text-base">filter_list</span>
  <p className="text-gray-700 dark:text-gray-200 text-sm font-medium">Filter by Loan</p>
</button>
```

#### Navigation Items
```tsx
// Active state
<a className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 dark:bg-primary/20 text-primary">
  <span className="material-symbols-outlined text-base">folder</span>
  <p className="text-sm font-medium">All Files</p>
</a>

// Inactive state
<a className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10">
  <span className="material-symbols-outlined text-base">person</span>
  <p className="text-sm font-medium">Personal Files</p>
</a>
```

#### Badges (Loan Association)
```tsx
// Loan badge (blue)
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
  Loan #12345
</span>

// Personal file badge (gray)
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
  Personal File
</span>
```

#### Table Structure
```tsx
<div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50">
  <table className="w-full">
    <thead>
      <tr className="bg-gray-50 dark:bg-gray-900/50">
        <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-300 text-xs font-medium uppercase tracking-wider">
          File Name
        </th>
        {/* More columns */}
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
      <tr className="hover:bg-gray-50 dark:hover:bg-white/5">
        <td className="h-[72px] px-4 py-2 text-gray-800 dark:text-gray-200 text-sm font-medium">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-red-500">picture_as_pdf</span>
            <span>Mortgage_Agreement_Final.pdf</span>
          </div>
        </td>
        {/* More cells */}
      </tr>
    </tbody>
  </table>
</div>
```

#### Search Bar
```tsx
<label className="flex flex-col min-w-40 h-12 w-full">
  <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
    <div className="text-gray-500 dark:text-gray-400 flex border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 items-center justify-center pl-4 rounded-l-lg border-r-0">
      <span className="material-symbols-outlined">search</span>
    </div>
    <input
      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 h-full placeholder:text-gray-500 dark:placeholder-gray-400 px-4 border-l-0 text-sm font-normal"
      placeholder="Search by file name or keyword..."
    />
  </div>
</label>
```

#### File Type Icons
```tsx
// Icon mapping by file extension
const getFileIcon = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase();

  const iconMap = {
    pdf: { icon: 'picture_as_pdf', color: 'text-red-500' },
    doc: { icon: 'description', color: 'text-blue-500' },
    docx: { icon: 'description', color: 'text-blue-500' },
    jpg: { icon: 'image', color: 'text-green-500' },
    jpeg: { icon: 'image', color: 'text-green-500' },
    png: { icon: 'image', color: 'text-green-500' },
    xls: { icon: 'table_chart', color: 'text-green-500' },
    xlsx: { icon: 'table_chart', color: 'text-green-500' },
  };

  return iconMap[ext] || { icon: 'insert_drive_file', color: 'text-gray-500' };
};

// Usage
<span className={`material-symbols-outlined ${icon.color}`}>{icon.icon}</span>
```

### Spacing and Sizing
- **Container Padding:** `p-8` (32px)
- **Card Padding:** `p-4` (16px)
- **Gap Between Items:** `gap-4` (16px) or `gap-6` (24px)
- **Table Row Height:** `h-[72px]`
- **Button Height:** `h-10` (40px) or `h-12` (48px)
- **Border Radius:**
  - Buttons: `rounded-lg` (0.5rem)
  - Cards: `rounded-xl` (0.75rem)
  - Badges: `rounded-full`

### Dark Mode Support
All components must support dark mode using Tailwind's `dark:` variant:
```tsx
// Example
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
  {/* Content */}
</div>
```

### Icons
Use Material Symbols Outlined from Google:
```html
<!-- In index.html -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet"/>
```

Common icons used:
- `folder` - All Files
- `person` - Personal Files
- `account_balance` - Loans
- `upload_file` - Upload button
- `search` - Search bar
- `filter_list` - Filter button
- `picture_as_pdf` - PDF files
- `description` - Document files
- `image` - Image files
- `more_horiz` - Actions menu
- `expand_more` - Dropdown arrows
- `chevron_left`, `chevron_right` - Pagination

---

## Project Structure

```
my-box/
├── .claude/                  # Claude Code configuration
├── .idea/                    # IDE settings (ignored)
├── src/
│   ├── components/          # React components
│   │   ├── common/         # Reusable UI components
│   │   ├── files/          # File management components
│   │   ├── loans/          # Loan-related components
│   │   └── layout/         # Layout components
│   ├── services/           # API and service layer
│   │   ├── n8n/           # n8n workflow integrations
│   │   ├── azure/         # Azure SQL queries
│   │   └── api/           # API client utilities
│   ├── hooks/             # Custom React hooks
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   ├── contexts/          # React contexts
│   ├── config/            # Configuration files
│   ├── pages/             # Page components
│   ├── styles/            # Global styles
│   ├── App.tsx            # Main app component
│   └── main.tsx           # Entry point
├── public/                # Static assets
├── n8n-workflows/         # n8n workflow JSON exports
├── docs/                  # Additional documentation
├── PDR.md                 # Product Requirements Document
├── PLANNING.md            # Project plan
├── TASKS.md               # Task list
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript config
├── vite.config.ts         # Vite configuration
└── README.md              # Project readme

```

---

## Development Guidelines

### 1. Code Style and Conventions

#### TypeScript
- **Always use TypeScript** - no `.js` or `.jsx` files
- Define interfaces for all data structures
- Use `type` for unions and simple types, `interface` for objects
- Enable strict mode in `tsconfig.json`
- Avoid `any` type; use `unknown` if type is truly unknown
- Use proper type guards for type narrowing

```typescript
// Good
interface User {
  id: string;
  name: string;
  email: string;
}

type FileStatus = 'pending' | 'uploaded' | 'failed';

// Bad
const user: any = getData();
```

#### React Components
- Use functional components with hooks
- Prefer named exports over default exports
- Use TypeScript for component props
- Keep components focused and single-responsibility
- Extract complex logic into custom hooks

```typescript
// Good
interface FileListProps {
  userId: string;
  loanId?: string;
  onFileSelect: (fileId: string) => void;
}

export const FileList: React.FC<FileListProps> = ({ userId, loanId, onFileSelect }) => {
  // Component logic
};

// Bad
export default function FileList(props: any) {
  // Component logic
}
```

#### Naming Conventions
- **Components:** PascalCase (e.g., `FileUploader.tsx`)
- **Hooks:** camelCase with `use` prefix (e.g., `useFileUpload.ts`)
- **Utilities:** camelCase (e.g., `formatFileSize.ts`)
- **Types/Interfaces:** PascalCase (e.g., `UserProfile`, `FileMetadata`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `MAX_FILE_SIZE`)
- **Variables/Functions:** camelCase (e.g., `handleUpload`, `fileList`)

### 2. Component Organization

#### File Structure
Each component should have a clear, focused responsibility:

```typescript
// components/files/FileUploader.tsx
import React, { useState } from 'react';
import { Upload, Button, message } from 'antd';
import type { UploadFile } from 'antd';
import { uploadFileToN8N } from '@/services/n8n/fileUpload';
import type { FileUploadRequest } from '@/types/file';

interface FileUploaderProps {
  userId: string;
  loanIds?: string[];
  onUploadComplete: (fileId: string) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  userId,
  loanIds,
  onUploadComplete
}) => {
  // Component implementation
};
```

### 3. State Management

- Use React Context for global state (user info, theme, etc.)
- Use local state (useState) for component-specific state
- Use custom hooks to encapsulate complex state logic
- Consider React Query/TanStack Query for server state (future enhancement)

```typescript
// contexts/UserContext.tsx
interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

// hooks/useUser.ts
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};
```

### 4. API Integration with n8n

All file operations go through n8n workflows:

```typescript
// services/n8n/fileUpload.ts
import axios from 'axios';
import type { FileUploadRequest, FileUploadResponse } from '@/types/file';

const N8N_BASE_URL = import.meta.env.VITE_N8N_BASE_URL;

export const uploadFileToN8N = async (
  file: File,
  request: FileUploadRequest
): Promise<FileUploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('userId', request.userId);
  formData.append('loanIds', JSON.stringify(request.loanIds || []));

  const response = await axios.post(
    `${N8N_BASE_URL}/webhook/file-upload`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  );

  return response.data;
};
```

### 5. Type Definitions

Maintain centralized type definitions:

```typescript
// types/file.ts
export interface FileMetadata {
  fileId: string;
  userId: string;
  filename: string;
  blobIdentifier: string;
  size: number;
  contentType: string;
  uploadedAt: Date;
  loanIds: string[];
  tags?: string[];
}

export interface FileUploadRequest {
  userId: string;
  loanIds?: string[];
  tags?: string[];
}

export interface FileUploadResponse {
  fileId: string;
  blobIdentifier: string;
  success: boolean;
  message?: string;
}

// types/loan.ts
export interface Loan {
  loanId: string;
  borrowerName: string;
  amount: number;
  status: LoanStatus;
  createdAt: Date;
}

export type LoanStatus = 'pending' | 'approved' | 'active' | 'closed';

// types/user.ts
export interface User {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
}

export type UserRole = 'admin' | 'loan_officer' | 'user';
```

### 6. Error Handling

Implement comprehensive error handling:

```typescript
// utils/errorHandler.ts
import { message } from 'antd';

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const handleError = (error: unknown): void => {
  if (error instanceof AppError) {
    message.error(error.message);
    console.error(`[${error.code}]`, error.message);
  } else if (error instanceof Error) {
    message.error('An unexpected error occurred');
    console.error(error);
  } else {
    message.error('An unknown error occurred');
    console.error(error);
  }
};

// Usage
try {
  await uploadFile(file);
} catch (error) {
  handleError(error);
}
```

### 7. Ant Design Usage

Follow Ant Design best practices:

```typescript
// components/files/FileList.tsx
import { Table, Tag, Button, Space } from 'antd';
import { DownloadOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { FileMetadata } from '@/types/file';

export const FileList: React.FC<FileListProps> = ({ files, onDownload, onDelete }) => {
  const columns: ColumnsType<FileMetadata> = [
    {
      title: 'Filename',
      dataIndex: 'filename',
      key: 'filename',
      sorter: (a, b) => a.filename.localeCompare(b.filename),
    },
    {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
      render: (size: number) => formatFileSize(size),
    },
    {
      title: 'Uploaded',
      dataIndex: 'uploadedAt',
      key: 'uploadedAt',
      render: (date: Date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Loans',
      dataIndex: 'loanIds',
      key: 'loanIds',
      render: (loanIds: string[]) => (
        <>
          {loanIds.map(id => (
            <Tag key={id} color="blue">{id}</Tag>
          ))}
        </>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<DownloadOutlined />}
            onClick={() => onDownload(record.fileId)}
          />
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => onDelete(record.fileId)}
          />
        </Space>
      ),
    },
  ];

  return <Table columns={columns} dataSource={files} rowKey="fileId" />;
};
```

### 8. Environment Variables

Use Vite's environment variable system:

```typescript
// config/env.ts
export const config = {
  n8n: {
    baseUrl: import.meta.env.VITE_N8N_BASE_URL,
    uploadWebhook: import.meta.env.VITE_N8N_UPLOAD_WEBHOOK,
    downloadWebhook: import.meta.env.VITE_N8N_DOWNLOAD_WEBHOOK,
    listWebhook: import.meta.env.VITE_N8N_LIST_WEBHOOK,
  },
  azure: {
    sqlConnectionString: import.meta.env.VITE_AZURE_SQL_CONNECTION,
  },
  app: {
    maxFileSize: parseInt(import.meta.env.VITE_MAX_FILE_SIZE || '104857600'), // 100MB
    allowedFileTypes: import.meta.env.VITE_ALLOWED_FILE_TYPES?.split(',') || [],
  },
} as const;

// .env.example
VITE_N8N_BASE_URL=https://n8n.example.com
VITE_N8N_UPLOAD_WEBHOOK=/webhook/file-upload
VITE_N8N_DOWNLOAD_WEBHOOK=/webhook/file-download
VITE_N8N_LIST_WEBHOOK=/webhook/file-list
VITE_AZURE_SQL_CONNECTION=Server=...
VITE_MAX_FILE_SIZE=104857600
VITE_ALLOWED_FILE_TYPES=.pdf,.doc,.docx,.xls,.xlsx,.jpg,.png
```

---

## AI Agent Specific Instructions

### When Creating Components

1. **Always check existing components** before creating new ones
2. **Use Ant Design components** - don't reinvent the wheel
3. **Export named functions**, not default exports
4. **Add TypeScript interfaces** for all props
5. **Include JSDoc comments** for complex components
6. **Add error boundaries** for critical components

### When Writing Services/API Calls

1. **All file operations** must go through n8n webhooks
2. **Use axios** for HTTP requests (install if needed)
3. **Add proper error handling** with try/catch
4. **Type all responses** with TypeScript interfaces
5. **Use environment variables** for URLs and secrets
6. **Add request/response logging** in development

### When Working with n8n Workflows

1. **Document the workflow purpose** in comments
2. **Export workflows** as JSON to `n8n-workflows/` directory
3. **Use the n8n MCP server** for workflow creation/modification
4. **Name workflows clearly**: `file-upload.json`, `file-download.json`
5. **Include error handling nodes** in all workflows
6. **Test workflows** before integrating with frontend

### When Handling Files

1. **Validate file size** before upload (max 100MB default)
2. **Check file types** against allowed list
3. **Show upload progress** using Ant Design Progress component
4. **Handle upload errors** gracefully with user feedback
5. **Use blob URLs** for file previews when applicable
6. **Clean up blob URLs** to prevent memory leaks

### When Working with Database

1. **Never hardcode SQL queries** in components
2. **Create service functions** for all database operations
3. **Use parameterized queries** to prevent SQL injection
4. **Handle connection errors** and retry logic
5. **Log all database errors** for debugging

### Testing Considerations

1. **Write unit tests** for utility functions
2. **Write integration tests** for API services
3. **Test error scenarios**, not just happy paths
4. **Mock n8n responses** in tests
5. **Use React Testing Library** for component tests

---

## Common Patterns

### Custom Hook Pattern

```typescript
// hooks/useFileUpload.ts
import { useState } from 'react';
import { uploadFileToN8N } from '@/services/n8n/fileUpload';
import type { FileUploadRequest } from '@/types/file';

interface UseFileUploadReturn {
  uploading: boolean;
  progress: number;
  uploadFile: (file: File, request: FileUploadRequest) => Promise<void>;
  error: Error | null;
}

export const useFileUpload = (): UseFileUploadReturn => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  const uploadFile = async (file: File, request: FileUploadRequest) => {
    try {
      setUploading(true);
      setError(null);
      // Upload logic with progress tracking
      await uploadFileToN8N(file, request);
      setProgress(100);
    } catch (err) {
      setError(err as Error);
    } finally {
      setUploading(false);
    }
  };

  return { uploading, progress, uploadFile, error };
};
```

### Service Layer Pattern

```typescript
// services/n8n/fileService.ts
class FileService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async uploadFile(file: File, request: FileUploadRequest): Promise<FileUploadResponse> {
    // Implementation
  }

  async downloadFile(fileId: string): Promise<Blob> {
    // Implementation
  }

  async listFiles(userId: string, filters?: FileFilters): Promise<FileMetadata[]> {
    // Implementation
  }

  async deleteFile(fileId: string): Promise<void> {
    // Implementation
  }
}

export const fileService = new FileService(config.n8n.baseUrl);
```

---

## Security Considerations

1. **Authentication:** Implement proper user authentication (Azure AD recommended)
2. **Authorization:** Verify user has access to files/loans before operations
3. **Input Validation:** Validate all user inputs before processing
4. **XSS Prevention:** Sanitize user-generated content
5. **CORS:** Configure proper CORS headers for n8n webhooks
6. **Secrets:** Never commit secrets; use environment variables
7. **HTTPS:** All production traffic must use HTTPS
8. **File Validation:** Validate file types and scan for malware (future)

---

## Performance Optimization

1. **Lazy Loading:** Use React.lazy() for route-based code splitting
2. **Memoization:** Use useMemo and useCallback for expensive computations
3. **Virtual Scrolling:** Use Ant Design's virtual list for large file lists
4. **Debouncing:** Debounce search inputs
5. **Caching:** Cache file lists and loan data appropriately
6. **Image Optimization:** Compress images before upload

---

## Deployment Checklist

Before deploying, ensure:

- [ ] All environment variables are set
- [ ] TypeScript compiles without errors (`npm run build`)
- [ ] All tests pass (`npm run test`)
- [ ] ESLint has no errors (`npm run lint`)
- [ ] n8n workflows are deployed and tested
- [ ] Azure Blob Storage is configured
- [ ] Azure SQL Database is accessible
- [ ] Error logging is configured
- [ ] Performance monitoring is in place

---

## Troubleshooting

### Common Issues

**Issue:** File upload fails with CORS error
**Solution:** Configure CORS in n8n webhook settings

**Issue:** Database connection timeout
**Solution:** Check Azure SQL firewall rules and connection string

**Issue:** Files don't download
**Solution:** Verify blob identifier exists and Azure Blob Storage permissions

**Issue:** TypeScript errors in build
**Solution:** Run `npm run type-check` and fix type errors

---

## Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Ant Design Documentation](https://ant.design)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [n8n Documentation](https://docs.n8n.io)
- [Azure Blob Storage SDK](https://docs.microsoft.com/en-us/azure/storage/blobs/)

---

## MCP Server Integration

### n8n MCP Server

This project uses the n8n MCP server for workflow management. When working with n8n workflows:

1. **Use MCP server tools** instead of manual JSON editing
2. **Document workflow endpoints** in this file
3. **Test workflows** through MCP server before frontend integration

### Workflow Endpoints

```
POST /webhook/file-upload
- Purpose: Upload file to Azure Blob Storage and create DB record
- Input: multipart/form-data with file and metadata
- Output: { fileId, blobIdentifier, success }

POST /webhook/file-download
- Purpose: Download file from Azure Blob Storage
- Input: { fileId }
- Output: Binary file stream

POST /webhook/file-list
- Purpose: Get list of files for user
- Input: { userId, loanId?, filters? }
- Output: Array of FileMetadata

DELETE /webhook/file-delete
- Purpose: Delete file from storage and DB
- Input: { fileId, userId }
- Output: { success, message }
```

---

## Questions or Clarifications

If you encounter ambiguous requirements:

1. Check PDR.md for detailed requirements
2. Check TASKS.md for task-specific instructions
3. Ask the user for clarification
4. Document assumptions in code comments

---

**Last Updated:** 2025-11-10
**Maintained By:** Development Team
