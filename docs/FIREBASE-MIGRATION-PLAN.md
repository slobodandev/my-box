# Firebase Migration Plan - Complete System Overhaul

**Created:** 2025-11-13
**Status:** Ready for Implementation
**Migration Type:** Azure SQL + Azure Blob Storage → Firebase Data Connect + Firebase Storage
**Estimated Timeline:** 5-7 days (40-56 hours)

---

## Table of Contents

1. [Migration Overview](#migration-overview)
2. [Architecture Comparison](#architecture-comparison)
3. [Firebase Services Setup](#firebase-services-setup)
4. [Database Migration](#database-migration)
5. [Storage Migration](#storage-migration)
6. [Authentication Migration](#authentication-migration)
7. [Cloud Functions Implementation](#cloud-functions-implementation)
8. [File Manager Integration](#file-manager-integration)
9. [Frontend Updates](#frontend-updates)
10. [n8n Workflow Updates](#n8n-workflow-updates)
11. [Testing Strategy](#testing-strategy)
12. [Deployment Plan](#deployment-plan)

---

## Migration Overview

### What's Changing

| Component | From | To | Reason |
|-----------|------|----|----|
| **Database** | Azure SQL | Firebase Data Connect (PostgreSQL) | Auto GraphQL API, type safety, Firebase integration |
| **File Storage** | Azure Blob Storage | Firebase Storage | Firebase integration, easier SDK, built-in security rules |
| **Backend API** | n8n Webhooks | Cloud Functions + Data Connect | Type safety, serverless, better Firebase integration |
| **Auth Storage** | Azure SQL | Data Connect | Unified database, GraphQL queries |
| **File Operations** | Custom + n8n | Cloud Functions | Server-side validation, security |
| **File UI** | Custom components | @cubone/react-file-manager | Feature-rich out of the box |

### What's Staying

| Component | Why |
|-----------|-----|
| **n8n Magic Link Generation** | Works well, complex workflow logic |
| **Email Sending** | n8n has good email integrations |
| **React Frontend** | No changes needed to core app structure |
| **JWT Authentication** | Same approach, just different storage |

---

## Architecture Comparison

### OLD Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        React App                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  - Custom file upload                                │  │
│  │  - Custom file list                                  │  │
│  │  - Manual API calls to n8n                          │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────┬─────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
┌───────▼──────┐       ┌───────▼──────────┐
│   n8n API    │       │  Azure Services  │
│  Webhooks    │       │                  │
│              │       │  - SQL Database  │
│  - Upload    │◄──────┤  - Blob Storage  │
│  - Download  │       │                  │
│  - List      │       └──────────────────┘
│  - Delete    │
│  - Auth      │
└──────────────┘

Issues:
❌ Manual type definitions
❌ No type safety between frontend and backend
❌ Complex n8n workflows for simple CRUD
❌ Two separate services (Azure SQL + Blob)
❌ Manual error handling
```

### NEW Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        React App                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  @cubone/react-file-manager                          │  │
│  │  - Auto upload/download                              │  │
│  │  - Folder navigation                                 │  │
│  │  - Search/filter                                     │  │
│  │  - Drag & drop                                       │  │
│  └──────────────────────────────────────────────────────┘  │
└──┬───────────────────┬──────────────────────┬──────────────┘
   │                   │                      │
   │ GraphQL           │ REST                 │ Storage SDK
   │ (type-safe)       │ (Cloud Functions)    │ (Firebase)
   │                   │                      │
┌──▼──────────────┐ ┌──▼────────────────┐ ┌──▼─────────────┐
│  Data Connect   │ │ Cloud Functions   │ │ Firebase       │
│  (PostgreSQL)   │ │                   │ │ Storage        │
│                 │ │ - File upload     │ │                │
│ - Users         │ │ - Auth verify     │ │ - Actual files │
│ - Loans         │ │ - JWT validate    │ │ - Organized by │
│ - Files         │ │ - Send emails     │ │   loan/user    │
│ - AuthSessions  │ │                   │ │                │
└─────────────────┘ └───────────────────┘ └────────────────┘
                            │
                            │ (Magic link only)
                    ┌───────▼──────────┐
                    │      n8n         │
                    │                  │
                    │ - Generate link  │
                    │ - Send email     │
                    │ - Save to Data   │
                    │   Connect        │
                    └──────────────────┘

Benefits:
✅ Auto-generated TypeScript types
✅ Type-safe GraphQL queries
✅ Simplified architecture (one Firebase project)
✅ Built-in security rules
✅ Real-time capabilities (future)
✅ Serverless scaling
```

---

## Firebase Services Setup

### Phase 1.1: Enable Firebase Services

#### 1. Data Connect

```bash
# Install Firebase CLI (already installed)
firebase --version

# Initialize Data Connect
firebase init dataconnect

# Select options:
# ✓ Use existing project: my-box
# ✓ Data Connect location: us-central1
# ✓ Cloud SQL instance: Create new
# ✓ Database name: mybox-db
# ✓ Set up local emulator: Yes
```

**Project Structure Created:**
```
dataconnect/
├── connector/
│   ├── queries.gql         # GraphQL queries
│   ├── mutations.gql       # GraphQL mutations
│   └── connector.yaml      # Connector config
├── schema/
│   └── schema.gql          # Database schema (GraphQL SDL)
└── dataconnect.yaml        # Main config
```

#### 2. Firebase Storage

```bash
# Storage is already initialized
# Verify in firebase.json:
{
  "storage": {
    "rules": "storage.rules"
  }
}
```

#### 3. Cloud Functions

```bash
# Already initialized
# Verify structure:
functions/
├── src/
│   └── index.ts
├── package.json
└── tsconfig.json
```

### Phase 1.2: Install Dependencies

```bash
# Install Data Connect SDK
npm install @firebase/data-connect

# Install Storage SDK (already installed)
# Verify in package.json:
# "firebase": "^10.x.x"

# Install File Manager
npm install @cubone/react-file-manager

# Install additional dependencies
npm install @tanstack/react-query  # For data fetching
npm install jwt-decode              # For JWT parsing
```

### Phase 1.3: Update Firebase Config

**File:** `src/config/firebase.ts`

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { connectDataConnect } from '@firebase/data-connect';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Data Connect connection
export const dataConnect = connectDataConnect(app, {
  connector: 'mybox-connector',
  location: 'us-central1',
  service: 'mybox-db',
});

// Connect to emulators in development
if (import.meta.env.DEV) {
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectStorageEmulator(storage, 'localhost', 9199);
  // Data Connect emulator connects automatically
}

export default app;
```

---

## Database Migration

### Phase 2.1: Convert Azure SQL Schema to Data Connect

Data Connect uses GraphQL SDL (Schema Definition Language) to define the database structure.

**File:** `dataconnect/schema/schema.gql`

```graphql
"""
MyBox Loan File Management System
Data Connect Schema
"""

# ============================================================================
# CORE TABLES
# ============================================================================

"""User accounts (borrowers, loan officers, admins)"""
type User @table {
  id: UUID! @default(expr: "uuidV4()")
  email: String! @col(name: "email", unique: true)
  firstName: String @col(name: "first_name")
  lastName: String @col(name: "last_name")
  role: String! @default(value: "borrower")  # 'admin', 'loan_officer', 'borrower'
  isActive: Boolean! @default(value: true)
  phoneNumber: String @col(name: "phone_number")
  createdAt: Timestamp! @default(expr: "request.time")
  updatedAt: Timestamp! @default(expr: "request.time")
  lastLoginAt: Timestamp @col(name: "last_login_at")

  # Relationships
  loans: [Loan!]! @ref(fields: "id", references: "userId")
  files: [File!]! @ref(fields: "id", references: "userId")
  authSessions: [AuthSession!]! @ref(fields: "id", references: "userId")
}

"""Loan information"""
type Loan @table {
  id: UUID! @default(expr: "uuidV4()")
  userId: UUID! @col(name: "user_id")
  loanNumber: String! @col(name: "loan_number", unique: true)
  borrowerName: String! @col(name: "borrower_name")
  borrowerEmail: String @col(name: "borrower_email")
  loanAmount: Float @col(name: "loan_amount")
  loanType: String @col(name: "loan_type")  # 'Mortgage', 'Personal', etc.
  status: String! @default(value: "active")  # 'active', 'pending', 'closed'
  propertyAddress: String @col(name: "property_address")
  loanOfficerId: UUID @col(name: "loan_officer_id")
  notes: String
  createdAt: Timestamp! @default(expr: "request.time")
  updatedAt: Timestamp! @default(expr: "request.time")
  closedAt: Timestamp @col(name: "closed_at")

  # Relationships
  user: User! @ref(fields: "userId", references: "id")
  loanOfficer: User @ref(fields: "loanOfficerId", references: "id")
  files: [FileLoanAssociation!]! @ref(fields: "id", references: "loanId")
}

"""File metadata (actual files in Firebase Storage)"""
type File @table {
  id: UUID! @default(expr: "uuidV4()")
  userId: UUID! @col(name: "user_id")
  originalFilename: String! @col(name: "original_filename")
  storagePath: String! @col(name: "storage_path", unique: true)  # Firebase Storage path
  fileSize: Int! @col(name: "file_size")  # bytes
  mimeType: String @col(name: "mime_type")
  fileExtension: String @col(name: "file_extension")
  uploadedAt: Timestamp! @default(expr: "request.time")
  updatedAt: Timestamp! @default(expr: "request.time")
  isDeleted: Boolean! @default(value: false)
  deletedAt: Timestamp @col(name: "deleted_at")
  deletedBy: UUID @col(name: "deleted_by")
  tags: [String!]  # JSON array
  description: String
  downloadUrl: String @col(name: "download_url")  # Signed URL (temporary)

  # Relationships
  user: User! @ref(fields: "userId", references: "id")
  loans: [FileLoanAssociation!]! @ref(fields: "id", references: "fileId")
}

"""Many-to-many: Files ↔ Loans"""
type FileLoanAssociation @table(name: "file_loan_associations") {
  id: UUID! @default(expr: "uuidV4()")
  fileId: UUID! @col(name: "file_id")
  loanId: UUID! @col(name: "loan_id")
  associatedAt: Timestamp! @default(expr: "request.time")
  associatedBy: UUID @col(name: "associated_by")  # User who created association

  # Relationships
  file: File! @ref(fields: "fileId", references: "id")
  loan: Loan! @ref(fields: "loanId", references: "id")
}

# ============================================================================
# AUTHENTICATION TABLES
# ============================================================================

"""Authentication sessions (magic link + JWT)"""
type AuthSession @table(name: "auth_sessions") {
  id: UUID! @default(expr: "uuidV4()")
  sessionId: String! @col(name: "session_id", unique: true)  # UUID v4
  userId: UUID! @col(name: "user_id")
  loanIds: [String!]  # JSON array of loan IDs user can access
  emailHash: String! @col(name: "email_hash")  # SHA-256 hash
  magicToken: String @col(name: "magic_token", unique: true)  # For magic link
  sessionToken: String @col(name: "session_token")  # JWT after verification
  tokenType: String! @default(value: "magic_link")  # 'magic_link' or 'session'
  status: String! @default(value: "pending")  # 'pending', 'verified', 'revoked'
  expiresAt: Timestamp! @col(name: "expires_at")
  createdAt: Timestamp! @default(expr: "request.time")
  verifiedAt: Timestamp @col(name: "verified_at")
  lastAccessedAt: Timestamp @col(name: "last_accessed_at")
  revokedAt: Timestamp @col(name: "revoked_at")
  revokedBy: UUID @col(name: "revoked_by")
  revokeReason: String @col(name: "revoke_reason")
  ipAddress: String @col(name: "ip_address")
  userAgent: String @col(name: "user_agent")
  createdBy: UUID @col(name: "created_by")

  # Relationships
  user: User! @ref(fields: "userId", references: "id")
  verificationCodes: [VerificationCode!]! @ref(fields: "sessionId", references: "sessionId")
}

"""Email verification codes (6-digit TOTP)"""
type VerificationCode @table(name: "verification_codes") {
  id: UUID! @default(expr: "uuidV4()")
  sessionId: String! @col(name: "session_id")
  codeHash: String! @col(name: "code_hash")  # SHA-256 of 6-digit code
  expiresAt: Timestamp! @col(name: "expires_at")
  createdAt: Timestamp! @default(expr: "request.time")
  usedAt: Timestamp @col(name: "used_at")
  attemptCount: Int! @default(value: 0)
  maxAttempts: Int! @default(value: 3)
  isUsed: Boolean! @default(value: false)

  # Relationships
  session: AuthSession! @ref(fields: "sessionId", references: "sessionId")
}

"""Audit log for authentication events"""
type AuthAuditLog @table(name: "auth_audit_log") {
  id: UUID! @default(expr: "uuidV4()")
  sessionId: String @col(name: "session_id")
  userId: UUID @col(name: "user_id")
  eventType: String! @col(name: "event_type")  # 'link_generated', 'code_sent', etc.
  success: Boolean!
  errorMessage: String @col(name: "error_message")
  errorCode: String @col(name: "error_code")
  ipAddress: String @col(name: "ip_address")
  userAgent: String @col(name: "user_agent")
  requestPayload: String @col(name: "request_payload")  # JSON
  createdAt: Timestamp! @default(expr: "request.time")
}

"""Rate limiting for authentication attempts"""
type RateLimitTracking @table(name: "rate_limit_tracking") {
  id: UUID! @default(expr: "uuidV4()")
  identifier: String!  # Email or IP address
  actionType: String! @col(name: "action_type")  # 'code_send', 'code_verify'
  attemptCount: Int! @default(value: 1)
  windowStartAt: Timestamp! @default(expr: "request.time")
  blockedUntil: Timestamp @col(name: "blocked_until")
}
```

### Phase 2.2: Create GraphQL Queries

**File:** `dataconnect/connector/queries.gql`

```graphql
# ============================================================================
# USER QUERIES
# ============================================================================

query GetUser($userId: UUID!) @auth(level: USER) {
  user(id: $userId) {
    id
    email
    firstName
    lastName
    role
    isActive
    createdAt
  }
}

query GetUserByEmail($email: String!) @auth(level: USER) {
  users(where: { email: { eq: $email } }) {
    id
    email
    firstName
    lastName
    role
  }
}

# ============================================================================
# LOAN QUERIES
# ============================================================================

query GetUserLoans($userId: UUID!) @auth(level: USER) {
  loans(where: { userId: { eq: $userId } }) {
    id
    loanNumber
    borrowerName
    loanAmount
    loanType
    status
    propertyAddress
    createdAt
    # Get file count for each loan
    files {
      id
    }
  }
}

query GetLoanWithFiles($loanId: UUID!) @auth(level: USER) {
  loan(id: $loanId) {
    id
    loanNumber
    borrowerName
    loanAmount
    status
    user {
      id
      email
      firstName
      lastName
    }
    files {
      file {
        id
        originalFilename
        storagePath
        fileSize
        mimeType
        uploadedAt
        downloadUrl
      }
    }
  }
}

# ============================================================================
# FILE QUERIES
# ============================================================================

query GetUserFiles(
  $userId: UUID!
  $loanId: UUID
  $includeDeleted: Boolean
) @auth(level: USER) {
  files(
    where: {
      userId: { eq: $userId }
      isDeleted: { eq: $includeDeleted }
    }
  ) {
    id
    originalFilename
    storagePath
    fileSize
    mimeType
    fileExtension
    uploadedAt
    tags
    description
    downloadUrl
    # Associated loans
    loans {
      loan {
        id
        loanNumber
      }
    }
  }
}

query GetFilesByLoan($loanId: UUID!) @auth(level: USER) {
  fileLoanAssociations(where: { loanId: { eq: $loanId } }) {
    file {
      id
      originalFilename
      storagePath
      fileSize
      mimeType
      uploadedAt
      downloadUrl
      user {
        email
        firstName
        lastName
      }
    }
  }
}

query GetFileMetadata($fileId: UUID!) @auth(level: USER) {
  file(id: $fileId) {
    id
    originalFilename
    storagePath
    fileSize
    mimeType
    fileExtension
    uploadedAt
    tags
    description
    downloadUrl
    isDeleted
    user {
      id
      email
    }
    loans {
      loan {
        id
        loanNumber
      }
    }
  }
}

# ============================================================================
# AUTHENTICATION QUERIES
# ============================================================================

query GetAuthSession($sessionId: String!) {
  authSessions(where: { sessionId: { eq: $sessionId } }) {
    id
    sessionId
    userId
    loanIds
    emailHash
    status
    expiresAt
    createdAt
    user {
      email
      firstName
      lastName
    }
  }
}

query GetActiveSessionsForUser($userId: UUID!) @auth(level: USER) {
  authSessions(
    where: {
      userId: { eq: $userId }
      status: { eq: "verified" }
    }
  ) {
    sessionId
    expiresAt
    lastAccessedAt
    ipAddress
    createdAt
  }
}

# ============================================================================
# DASHBOARD QUERIES
# ============================================================================

query GetDashboard($userId: UUID!) @auth(level: USER) {
  user(id: $userId) {
    id
    email
    firstName
    lastName
    # Loans with file counts
    loans {
      id
      loanNumber
      borrowerName
      loanAmount
      status
      files {
        id
      }
    }
    # Recent files
    files(
      where: { isDeleted: { eq: false } }
      orderBy: { uploadedAt: DESC }
      limit: 10
    ) {
      id
      originalFilename
      fileSize
      uploadedAt
      loans {
        loan {
          loanNumber
        }
      }
    }
  }
}
```

### Phase 2.3: Create GraphQL Mutations

**File:** `dataconnect/connector/mutations.gql`

```graphql
# ============================================================================
# USER MUTATIONS
# ============================================================================

mutation CreateUser(
  $email: String!
  $firstName: String
  $lastName: String
  $role: String
) @auth(level: USER) {
  user_insert(data: {
    email: $email
    firstName: $firstName
    lastName: $lastName
    role: $role
  }) {
    id
    email
  }
}

mutation UpdateUser(
  $userId: UUID!
  $firstName: String
  $lastName: String
  $phoneNumber: String
) @auth(level: USER) {
  user_update(
    id: $userId
    data: {
      firstName: $firstName
      lastName: $lastName
      phoneNumber: $phoneNumber
    }
  ) {
    id
    email
    firstName
    lastName
  }
}

# ============================================================================
# LOAN MUTATIONS
# ============================================================================

mutation CreateLoan(
  $userId: UUID!
  $loanNumber: String!
  $borrowerName: String!
  $borrowerEmail: String
  $loanAmount: Float
  $loanType: String
  $propertyAddress: String
) @auth(level: USER) {
  loan_insert(data: {
    userId: $userId
    loanNumber: $loanNumber
    borrowerName: $borrowerName
    borrowerEmail: $borrowerEmail
    loanAmount: $loanAmount
    loanType: $loanType
    propertyAddress: $propertyAddress
  }) {
    id
    loanNumber
  }
}

mutation UpdateLoan(
  $loanId: UUID!
  $status: String
  $notes: String
) @auth(level: USER) {
  loan_update(
    id: $loanId
    data: {
      status: $status
      notes: $notes
    }
  ) {
    id
    status
  }
}

# ============================================================================
# FILE MUTATIONS
# ============================================================================

mutation CreateFileMetadata(
  $userId: UUID!
  $originalFilename: String!
  $storagePath: String!
  $fileSize: Int!
  $mimeType: String
  $fileExtension: String
  $tags: [String!]
  $description: String
) @auth(level: USER) {
  file_insert(data: {
    userId: $userId
    originalFilename: $originalFilename
    storagePath: $storagePath
    fileSize: $fileSize
    mimeType: $mimeType
    fileExtension: $fileExtension
    tags: $tags
    description: $description
  }) {
    id
    storagePath
  }
}

mutation AssociateFileWithLoan(
  $fileId: UUID!
  $loanId: UUID!
  $associatedBy: UUID
) @auth(level: USER) {
  fileLoanAssociation_insert(data: {
    fileId: $fileId
    loanId: $loanId
    associatedBy: $associatedBy
  }) {
    id
  }
}

mutation SoftDeleteFile(
  $fileId: UUID!
  $deletedBy: UUID
) @auth(level: USER) {
  file_update(
    id: $fileId
    data: {
      isDeleted: true
      deletedAt: "request.time"
      deletedBy: $deletedBy
    }
  ) {
    id
    isDeleted
  }
}

# ============================================================================
# AUTH MUTATIONS
# ============================================================================

mutation CreateAuthSession(
  $sessionId: String!
  $userId: UUID!
  $loanIds: [String!]
  $emailHash: String!
  $magicToken: String
  $expiresAt: Timestamp!
  $ipAddress: String
  $userAgent: String
  $createdBy: UUID
) {
  authSession_insert(data: {
    sessionId: $sessionId
    userId: $userId
    loanIds: $loanIds
    emailHash: $emailHash
    magicToken: $magicToken
    expiresAt: $expiresAt
    ipAddress: $ipAddress
    userAgent: $userAgent
    createdBy: $createdBy
  }) {
    id
    sessionId
  }
}

mutation UpdateAuthSession(
  $sessionId: String!
  $status: String
  $sessionToken: String
  $verifiedAt: Timestamp
) {
  authSession_update(
    where: { sessionId: { eq: $sessionId } }
    data: {
      status: $status
      sessionToken: $sessionToken
      verifiedAt: $verifiedAt
    }
  ) {
    sessionId
    status
  }
}

mutation CreateVerificationCode(
  $sessionId: String!
  $codeHash: String!
  $expiresAt: Timestamp!
) {
  verificationCode_insert(data: {
    sessionId: $sessionId
    codeHash: $codeHash
    expiresAt: $expiresAt
  }) {
    id
  }
}

mutation LogAuthEvent(
  $sessionId: String
  $userId: UUID
  $eventType: String!
  $success: Boolean!
  $errorMessage: String
  $ipAddress: String
) {
  authAuditLog_insert(data: {
    sessionId: $sessionId
    userId: $userId
    eventType: $eventType
    success: $success
    errorMessage: $errorMessage
    ipAddress: $ipAddress
  }) {
    id
  }
}
```

### Phase 2.4: Deploy Data Connect Schema

```bash
# Build and deploy schema
firebase dataconnect:sql:migrate

# This will:
# 1. Analyze your schema
# 2. Generate SQL migrations
# 3. Apply to PostgreSQL database
# 4. Generate TypeScript SDK

# Test with emulator first
firebase emulators:start --only dataconnect

# Deploy to production
firebase deploy --only dataconnect
```

---

## Storage Migration

### Phase 3.1: Firebase Storage Structure

```
gs://my-box.appspot.com/
├── users/
│   └── {userId}/
│       ├── personal/
│       │   └── {fileId}.{ext}
│       └── loans/
│           └── {loanId}/
│               └── {fileId}.{ext}
├── shared/
│   └── {loanId}/
│       └── {fileId}.{ext}
└── temp/
    └── {uploadId}/
        └── {fileId}.{ext}

Example paths:
users/user-123/personal/file-abc-123.pdf
users/user-123/loans/loan-456/file-def-789.docx
shared/loan-456/file-xyz-999.xlsx
```

### Phase 3.2: Storage Security Rules

**File:** `storage.rules`

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {

    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    function hasValidJWT() {
      // JWT validation happens in Cloud Functions
      // This just checks if user is authenticated
      return request.auth != null && request.auth.token != null;
    }

    function isValidFileSize() {
      return request.resource.size < 100 * 1024 * 1024; // 100MB max
    }

    function isAllowedFileType() {
      return request.resource.contentType.matches('image/.*')
          || request.resource.contentType.matches('application/pdf')
          || request.resource.contentType.matches('application/msword')
          || request.resource.contentType.matches('application/vnd.*')
          || request.resource.contentType.matches('text/.*');
    }

    // User personal files
    match /users/{userId}/personal/{fileId} {
      allow read: if isAuthenticated() && isOwner(userId);
      allow write: if isAuthenticated() && isOwner(userId)
                   && isValidFileSize()
                   && isAllowedFileType();
      allow delete: if isAuthenticated() && isOwner(userId);
    }

    // User loan files
    match /users/{userId}/loans/{loanId}/{fileId} {
      allow read: if isAuthenticated() && isOwner(userId);
      allow write: if isAuthenticated() && isOwner(userId)
                   && isValidFileSize()
                   && isAllowedFileType();
      allow delete: if isAuthenticated() && isOwner(userId);
    }

    // Shared loan files (accessible by all users with access to loan)
    match /shared/{loanId}/{fileId} {
      allow read: if isAuthenticated() && hasValidJWT();
      // Write access controlled by Cloud Functions
      allow write: if false;
      allow delete: if false;
    }

    // Temporary uploads (cleaned up by Cloud Function)
    match /temp/{uploadId}/{fileId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated()
                   && isValidFileSize()
                   && isAllowedFileType();
      allow delete: if isAuthenticated();
    }

    // Default: deny all
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

### Phase 3.3: Storage Helper Utilities

**File:** `src/utils/storage.ts`

```typescript
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../config/firebase';

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  percentage: number;
  state: 'running' | 'paused' | 'success' | 'canceled' | 'error';
}

export interface FileUploadOptions {
  userId: string;
  loanId?: string;
  fileId: string;
  file: File;
  onProgress?: (progress: UploadProgress) => void;
}

/**
 * Upload file to Firebase Storage
 */
export const uploadFile = async (options: FileUploadOptions): Promise<string> => {
  const { userId, loanId, fileId, file, onProgress } = options;

  // Determine storage path
  const path = loanId
    ? `users/${userId}/loans/${loanId}/${fileId}.${getFileExtension(file.name)}`
    : `users/${userId}/personal/${fileId}.${getFileExtension(file.name)}`;

  const storageRef = ref(storage, path);

  // Upload with progress tracking
  const uploadTask = uploadBytesResumable(storageRef, file, {
    contentType: file.type,
  });

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        if (onProgress) {
          onProgress({
            bytesTransferred: snapshot.bytesTransferred,
            totalBytes: snapshot.totalBytes,
            percentage: (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
            state: snapshot.state as any,
          });
        }
      },
      (error) => reject(error),
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(path);
      }
    );
  });
};

/**
 * Get download URL for file
 */
export const getFileDownloadURL = async (storagePath: string): Promise<string> => {
  const storageRef = ref(storage, storagePath);
  return getDownloadURL(storageRef);
};

/**
 * Delete file from storage
 */
export const deleteFile = async (storagePath: string): Promise<void> => {
  const storageRef = ref(storage, storagePath);
  await deleteObject(storageRef);
};

/**
 * Get file extension from filename
 */
export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Get MIME type from filename
 */
export const getMimeType = (filename: string): string => {
  const ext = getFileExtension(filename);
  const mimeTypes: Record<string, string> = {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    txt: 'text/plain',
  };
  return mimeTypes[ext] || 'application/octet-stream';
};
```

---

## Cloud Functions Implementation

### Phase 4.1: Function Structure

```
functions/
├── src/
│   ├── index.ts                    # Main exports
│   ├── auth/
│   │   ├── verifyMagicLink.ts     # Verify JWT from magic link
│   │   ├── sendVerificationCode.ts # Generate & send 6-digit code
│   │   ├── verifyCode.ts          # Verify code & issue session JWT
│   │   └── validateSession.ts     # Validate session JWT
│   ├── files/
│   │   ├── processUpload.ts       # Handle file upload completion
│   │   ├── generateDownloadURL.ts # Generate signed download URL
│   │   └── cleanupDeleted.ts      # Cleanup soft-deleted files
│   ├── utils/
│   │   ├── jwt.ts                 # JWT utilities
│   │   ├── crypto.ts              # SHA-256, code generation
│   │   └── email.ts               # Email sending
│   └── types/
│       └── index.ts               # Shared types
└── package.json
```

### Phase 4.2: Auth Functions

**File:** `functions/src/auth/verifyMagicLink.ts`

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { verifyJWT, JWTPayload } from '../utils/jwt';
import { executeSql } from '@firebase/data-connect';

interface VerifyLinkRequest {
  token: string;
}

interface VerifyLinkResponse {
  success: boolean;
  sessionId: string;
  email: string;
  status: string;
  expiresAt: string;
}

export const verifyMagicLink = functions.https.onCall(
  async (data: VerifyLinkRequest, context): Promise<VerifyLinkResponse> => {
    try {
      // Verify JWT signature and expiration
      const decoded = verifyJWT(data.token) as JWTPayload;

      // Validate token type
      if (decoded.type !== 'magic_link') {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'Invalid token type'
        );
      }

      // Query session from Data Connect
      const session = await executeSql(
        'GetAuthSession',
        { sessionId: decoded.sessionId }
      );

      if (!session || session.length === 0) {
        throw new functions.https.HttpsError(
          'not-found',
          'Session not found'
        );
      }

      const sessionData = session[0];

      // Validate email hash matches
      if (sessionData.emailHash !== decoded.emailHash) {
        throw new functions.https.HttpsError(
          'permission-denied',
          'Invalid token'
        );
      }

      // Check session status
      if (sessionData.status !== 'pending') {
        throw new functions.https.HttpsError(
          'failed-precondition',
          `Session already ${sessionData.status}`
        );
      }

      // Check expiration
      if (new Date(sessionData.expiresAt) < new Date()) {
        throw new functions.https.HttpsError(
          'deadline-exceeded',
          'Session expired'
        );
      }

      // Log successful verification
      await executeSql('LogAuthEvent', {
        sessionId: decoded.sessionId,
        userId: sessionData.userId,
        eventType: 'link_verified',
        success: true,
        ipAddress: context.rawRequest.ip,
      });

      return {
        success: true,
        sessionId: sessionData.sessionId,
        email: sessionData.user.email,
        status: sessionData.status,
        expiresAt: sessionData.expiresAt,
      };
    } catch (error: any) {
      console.error('verifyMagicLink error:', error);
      throw new functions.https.HttpsError(
        'internal',
        error.message || 'Failed to verify magic link'
      );
    }
  }
);
```

**File:** `functions/src/auth/sendVerificationCode.ts`

```typescript
import * as functions from 'firebase-functions';
import { executeSql } from '@firebase/data-connect';
import { generateCode, hashString } from '../utils/crypto';
import { sendEmail } from '../utils/email';

interface SendCodeRequest {
  sessionId: string;
  email: string;
  magicLinkToken: string;
}

export const sendVerificationCode = functions.https.onCall(
  async (data: SendCodeRequest, context) => {
    try {
      // Verify magic link token first
      const decoded = verifyJWT(data.magicLinkToken);

      // Check rate limiting
      const rateLimitCheck = await executeSql('CheckRateLimit', {
        identifier: data.email,
        actionType: 'code_send',
      });

      if (rateLimitCheck.blocked) {
        throw new functions.https.HttpsError(
          'resource-exhausted',
          'Too many attempts. Please try again later.'
        );
      }

      // Generate 6-digit code
      const code = generateCode(); // Returns string like "123456"
      const codeHash = hashString(code);

      // Store in database
      await executeSql('CreateVerificationCode', {
        sessionId: data.sessionId,
        codeHash,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      });

      // Send email
      await sendEmail({
        to: data.email,
        subject: 'Your Verification Code - MyBox',
        html: `
          <h1>Your Verification Code</h1>
          <p>Enter this code to access your loan documents:</p>
          <h2 style="font-size: 32px; letter-spacing: 8px;">${code}</h2>
          <p>This code expires in 10 minutes.</p>
        `,
      });

      // Log event
      await executeSql('LogAuthEvent', {
        sessionId: data.sessionId,
        eventType: 'code_sent',
        success: true,
        ipAddress: context.rawRequest.ip,
      });

      return {
        success: true,
        message: 'Verification code sent to email',
        expiresIn: 600,
      };
    } catch (error: any) {
      console.error('sendVerificationCode error:', error);
      throw new functions.https.HttpsError('internal', error.message);
    }
  }
);
```

### Phase 4.3: File Functions

**File:** `functions/src/files/processUpload.ts`

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { executeSql } from '@firebase/data-connect';

/**
 * Triggered when file is uploaded to Storage
 * Creates file metadata in Data Connect
 */
export const processUpload = functions.storage.object().onFinalize(async (object) => {
  const filePath = object.name; // e.g., "users/user-123/loans/loan-456/file-abc.pdf"
  const fileSize = parseInt(object.size || '0');
  const contentType = object.contentType;

  // Parse path to extract userId, loanId, fileId
  const pathParts = filePath?.split('/');
  if (!pathParts || pathParts.length < 4) {
    console.error('Invalid file path:', filePath);
    return;
  }

  const userId = pathParts[1];
  const fileId = pathParts[pathParts.length - 1].split('.')[0];
  const originalFilename = object.metadata?.originalFilename || pathParts[pathParts.length - 1];

  // Create file metadata in Data Connect
  await executeSql('CreateFileMetadata', {
    userId,
    originalFilename,
    storagePath: filePath,
    fileSize,
    mimeType: contentType,
    fileExtension: pathParts[pathParts.length - 1].split('.').pop(),
  });

  // If loan-specific, create association
  if (pathParts[2] === 'loans') {
    const loanId = pathParts[3];
    await executeSql('AssociateFileWithLoan', {
      fileId,
      loanId,
    });
  }

  console.log(`File metadata created: ${fileId}`);
});

/**
 * Generate signed download URL
 */
export const generateDownloadURL = functions.https.onCall(
  async (data: { fileId: string }, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
    }

    // Get file metadata
    const file = await executeSql('GetFileMetadata', { fileId: data.fileId });

    if (!file || file.length === 0) {
      throw new functions.https.HttpsError('not-found', 'File not found');
    }

    // Check authorization (user owns file or has access to loan)
    // ... authorization logic ...

    // Generate signed URL (valid for 1 hour)
    const bucket = admin.storage().bucket();
    const fileRef = bucket.file(file[0].storagePath);

    const [url] = await fileRef.getSignedUrl({
      action: 'read',
      expires: Date.now() + 60 * 60 * 1000, // 1 hour
    });

    return { url };
  }
);
```

---

## File Manager Integration

### Phase 5.1: Install Dependencies

```bash
npm install @cubone/react-file-manager
npm install @tanstack/react-query  # For data fetching
```

### Phase 5.2: File Manager Configuration

**File:** `src/components/files/FileManager.tsx`

```typescript
import React from 'react';
import { FileManager, FileManagerProps } from '@cubone/react-file-manager';
import '@cubone/react-file-manager/dist/style.css';
import { storage } from '../../config/firebase';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
import { useAuth } from '../../contexts/AuthContext';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createFileMetadata, getUserFiles, deleteFile } from '../../services/dataconnect';

export const MyBoxFileManager: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  const fileManagerConfig: FileManagerProps = {
    // Base path in Firebase Storage
    rootPath: `users/${user.userId}`,

    // File operations
    onUpload: async (file: File, path: string) => {
      const fileId = crypto.randomUUID();
      const storagePath = `${path}/${fileId}.${file.name.split('.').pop()}`;
      const storageRef = ref(storage, storagePath);

      // Upload to Firebase Storage
      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload progress:', progress);
          },
          (error) => reject(error),
          async () => {
            // Create metadata in Data Connect
            await createFileMetadata({
              userId: user.userId,
              originalFilename: file.name,
              storagePath,
              fileSize: file.size,
              mimeType: file.type,
              fileExtension: file.name.split('.').pop() || '',
            });
            resolve({ path: storagePath });
          }
        );
      });
    },

    onDelete: async (path: string) => {
      // Delete from Firebase Storage
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);

      // Soft delete in Data Connect
      const fileId = path.split('/').pop()?.split('.')[0];
      if (fileId) {
        await deleteFile({ fileId });
      }
    },

    onDownload: async (path: string) => {
      const storageRef = ref(storage, path);
      const url = await getDownloadURL(storageRef);
      window.open(url, '_blank');
    },

    onRename: async (oldPath: string, newName: string) => {
      // Firebase Storage doesn't support rename
      // Need to copy and delete
      // ... implementation ...
    },

    // List files
    listFiles: async (path: string) => {
      const storageRef = ref(storage, path);
      const result = await listAll(storageRef);

      return result.items.map((item) => ({
        name: item.name,
        path: item.fullPath,
        type: 'file' as const,
        size: 0, // Need to get metadata
        modifiedAt: new Date(),
      }));
    },

    // Customization
    theme: 'light',
    showToolbar: true,
    showSearch: true,
    allowUpload: true,
    allowDelete: true,
    allowRename: true,
    allowDownload: true,

    // File type icons
    getFileIcon: (filename: string) => {
      const ext = filename.split('.').pop()?.toLowerCase();
      const iconMap: Record<string, string> = {
        pdf: 'picture_as_pdf',
        doc: 'description',
        docx: 'description',
        xls: 'table_chart',
        xlsx: 'table_chart',
        jpg: 'image',
        jpeg: 'image',
        png: 'image',
      };
      return iconMap[ext || ''] || 'insert_drive_file';
    },
  };

  return (
    <div className="file-manager-container" style={{ height: '600px' }}>
      <FileManager {...fileManagerConfig} />
    </div>
  );
};
```

### Phase 5.3: Style Customization

**File:** `src/styles/file-manager.css`

```css
/* Override file manager styles to match MyBox design */
.file-manager-container {
  --primary-color: #135bec;
  --background-light: #f6f6f8;
  --background-dark: #101622;
  --border-color: #e5e7eb;
}

/* File manager toolbar */
.file-manager-toolbar {
  background-color: var(--background-light);
  border-bottom: 1px solid var(--border-color);
  padding: 16px;
}

/* File items */
.file-manager-item {
  padding: 12px;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.file-manager-item:hover {
  background-color: rgba(19, 91, 236, 0.05);
}

.file-manager-item.selected {
  background-color: rgba(19, 91, 236, 0.1);
}

/* Buttons */
.file-manager-button {
  background-color: var(--primary-color);
  color: white;
  border-radius: 8px;
  padding: 8px 16px;
  font-weight: 600;
}

/* Dark mode */
[data-theme="dark"] .file-manager-container {
  --background-light: var(--background-dark);
  --border-color: #374151;
}
```

---

## n8n Workflow Updates

### Phase 6: Simplified n8n Workflow

**Name:** `Auth: Generate Magic Link (Data Connect)`

**Purpose:** Generate magic link and save to Data Connect

**Workflow:**

```
1. Webhook (POST /webhook/auth/generate-link)
   ↓
2. Function: Validate Input
   ↓
3. Function: Generate Session ID & Email Hash
   ↓
4. HTTP Request: Data Connect Mutation
   - Endpoint: Data Connect GraphQL API
   - Query: CreateAuthSession mutation
   ↓
5. JWT Node: Sign Magic Link JWT
   - Payload: { type, sessionId, emailHash, exp }
   ↓
6. Function: Build Email
   ↓
7. Email Node: Send Magic Link Email
   ↓
8. Respond: Return success
```

**Key Changes:**
- Replace Azure SQL nodes with HTTP Request to Data Connect GraphQL API
- Keep JWT signing
- Keep email sending
- Simpler workflow (fewer nodes)

---

## Implementation Timeline

### Week 1: Foundation (Days 1-3)

**Day 1: Setup (8 hours)**
- ✅ Initialize Data Connect
- ✅ Set up Firebase Storage
- ✅ Configure emulators
- ✅ Install dependencies

**Day 2: Database Migration (8 hours)**
- ✅ Convert schema to Data Connect
- ✅ Create GraphQL queries
- ✅ Create GraphQL mutations
- ✅ Deploy and test

**Day 3: Storage Setup (8 hours)**
- ✅ Configure storage rules
- ✅ Create storage utilities
- ✅ Test upload/download
- ✅ Implement cleanup

### Week 2: Implementation (Days 4-7)

**Day 4: Cloud Functions (10 hours)**
- ✅ Auth functions (verify, code, validate)
- ✅ File processing functions
- ✅ Test with emulators

**Day 5: File Manager (8 hours)**
- ✅ Install @cubone/react-file-manager
- ✅ Configure with Firebase
- ✅ Customize styling
- ✅ Test all operations

**Day 6: Frontend Integration (10 hours)**
- ✅ Update API calls to Data Connect
- ✅ Integrate file manager
- ✅ Update auth flow
- ✅ Test end-to-end

**Day 7: n8n & Testing (12 hours)**
- ✅ Update n8n workflows
- ✅ Integration testing
- ✅ Performance testing
- ✅ Documentation

**Total: 64 hours (7-8 days)**

---

## Testing Strategy

### Unit Tests
```typescript
// functions/src/__tests__/auth.test.ts
describe('Auth Functions', () => {
  it('verifies valid magic link', async () => {
    // Test implementation
  });

  it('rejects expired magic link', async () => {
    // Test implementation
  });
});
```

### Integration Tests
```typescript
// src/__tests__/integration/file-upload.test.ts
describe('File Upload Flow', () => {
  it('uploads file to Storage and creates metadata in Data Connect', async () => {
    // Test implementation
  });
});
```

### End-to-End Tests
```typescript
// e2e/auth-flow.spec.ts
test('complete authentication flow', async ({ page }) => {
  // 1. Generate magic link
  // 2. Click link
  // 3. Enter verification code
  // 4. Verify session created
});
```

---

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Emulators working
- [ ] Security rules reviewed
- [ ] Environment variables set
- [ ] Data migrated from Azure

### Deployment Steps
```bash
# 1. Deploy Data Connect
firebase deploy --only dataconnect

# 2. Deploy Storage rules
firebase deploy --only storage

# 3. Deploy Cloud Functions
firebase deploy --only functions

# 4. Deploy Frontend
npm run build
firebase deploy --only hosting

# 5. Update n8n workflows
# Update endpoints to use Data Connect GraphQL API
```

### Post-Deployment
- [ ] Verify all endpoints working
- [ ] Test file upload/download
- [ ] Test authentication flow
- [ ] Monitor error logs
- [ ] Check performance metrics

---

## Migration Checklist

### Azure → Firebase

- [ ] **Database**
  - [ ] Export data from Azure SQL
  - [ ] Import data to Data Connect
  - [ ] Verify all relationships
  - [ ] Test queries

- [ ] **Storage**
  - [ ] List all files in Azure Blob
  - [ ] Download files
  - [ ] Upload to Firebase Storage
  - [ ] Update file paths in database
  - [ ] Verify downloads work

- [ ] **API Endpoints**
  - [ ] Identify all n8n webhooks
  - [ ] Create equivalent Cloud Functions or Data Connect queries
  - [ ] Update frontend to use new endpoints
  - [ ] Test all operations

- [ ] **Authentication**
  - [ ] Migrate auth sessions
  - [ ] Test magic link flow
  - [ ] Test code verification
  - [ ] Test session validation

---

## Rollback Plan

If migration fails:

```
1. Keep Azure services running during migration
2. Use feature flags to switch between old/new
3. Can rollback by switching feature flag
4. Gradual migration: Users → Files → Auth
```

---

## Cost Comparison

| Service | Azure | Firebase | Savings |
|---------|-------|----------|---------|
| Database | $5/month (Basic) | ~$0.26/GB | Similar |
| Storage | ~$0.0184/GB | ~$0.026/GB | Similar |
| API Calls | n8n (self-hosted) | $0.40/million | Depends |
| **Total Est.** | ~$5-10/month | ~$5-15/month | Similar |

**Benefits of Firebase:**
- Integrated ecosystem
- Type safety
- Auto-scaling
- Better developer experience
- Real-time capabilities (future)

---

## Next Steps

1. **Review this plan** - Confirm approach
2. **Start with emulators** - Test locally first
3. **Incremental migration** - One service at a time
4. **Keep Azure running** - Until fully migrated
5. **Monitor closely** - Watch for errors

---

**Ready to begin implementation?**

Let me know if you want to:
1. Start with Data Connect schema setup
2. Adjust any part of the plan
3. Get more details on specific sections
