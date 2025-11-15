# N8N to Firebase Migration Plan
## Complete Authentication & File Management Revamp

**Date:** 2025-01-14
**Status:** Planning → Implementation
**Goal:** Remove n8n dependency entirely, implement Firebase Email Link Auth, modernize file operations

---

## 📋 Executive Summary

This migration eliminates the n8n workflow dependency and replaces it with a fully Firebase-based solution featuring:

1. **Firebase Email Link Authentication** - Passwordless, secure authentication
2. **Third-Party Integration API** - Allows external systems to generate auth links via API
3. **Native Firebase Storage** - Direct file operations without n8n intermediary
4. **Session Management** - Persistent sessions with Firebase Data Connect
5. **Loan Context** - File uploads tied to specific loans via auth session

---

## 🔍 Current N8N Workflows Analysis

### 1. Auth: Generate Magic Link (`auth-generate-magic-link.json`)
**Purpose:** Generate custom magic link tokens for user authentication

**What it does:**
- Accepts: `userId`, `email`, `loanIds[]`, `expirationHours`, `createdBy`
- Validates user exists and has access to specified loans
- Generates sessionId (UUID) and magicToken (32-byte random)
- Hashes email with SHA-256
- Inserts record into `AuthSessions` table
- Returns magic link URL with token

**Migration Strategy:** ✅ **Replace with Firebase Email Link Auth + Cloud Function**

---

### 2. File Upload (`file-upload-production.json`)
**Purpose:** Handle file uploads to Azure Blob Storage

**What it does:**
- Accepts: multipart/form-data with file, `userId`, `loanIds[]`, `tags[]`
- Generates unique blob name and fileId
- Uploads file to Azure Blob Storage container `loan-files`
- Inserts metadata into `Files` table
- Associates file with loans via `FileLoanAssociations` table
- Returns file metadata

**Migration Strategy:** ✅ **Replace with Cloud Function using Firebase Storage**

---

### 3. File Download (`file-download-production.json`)
**Purpose:** Download files from Azure Blob Storage with authorization

**What it does:**
- Accepts: `fileId`, `userId`
- Queries `Files` table for metadata
- Checks if user owns the file
- Downloads from Azure Blob Storage
- Returns binary file stream

**Migration Strategy:** ✅ **Replace with Cloud Function using Firebase Storage signed URLs**

---

### 4. File List (`file-list-production.json`)
**Purpose:** List files with filtering, pagination, and sorting

**What it does:**
- Accepts: `userId`, `loanId?`, `searchTerm?`, `personalOnly?`, `page`, `pageSize`, `sortBy`, `sortOrder`
- Builds dynamic SQL query with WHERE conditions
- Joins with `FileLoanAssociations` to get loan relationships
- Returns paginated file list with metadata

**Migration Strategy:** ✅ **Replace with Cloud Function using Data Connect queries**

---

### 5. File Delete (`file-delete-production.json`)
**Purpose:** Soft delete files

**What it does:**
- Accepts: `fileId`, `userId`
- Validates file exists and user owns it
- Soft deletes (sets `IsDeleted = 1`, `DeletedAt = NOW()`)
- Optionally deletes from blob storage

**Migration Strategy:** ✅ **Replace with Cloud Function using Data Connect mutation**

---

### 6. Get Loans (`get-loans-production.json`)
**Purpose:** Get list of loans for a user

**Migration Strategy:** ⏭️ **Skip for now** (per user request)

---

## 🎯 New Architecture

### Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    Third-Party System (LOS)                     │
│                  (Loan Origination System)                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ POST /generateAuthLink
                             │ Headers: Authorization: Bearer <API_KEY>
                             │ Body: { email, borrowerContactId, loanNumber }
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              Cloud Function: generateAuthLink                    │
│  1. Validate API Key / JWT token                                │
│  2. Create/Find User in Data Connect by email                   │
│  3. Generate Firebase Email Link Auth                           │
│  4. Create AuthSession record with loan context                 │
│  5. Send email via Firebase Auth                                │
│  6. Return session metadata                                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ Email sent to borrower
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Borrower Email Inbox                         │
│  "Click here to upload documents for Loan #12345"               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ Click link
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              Frontend: https://my-box-53040.web.app             │
│  1. Detect email link auth parameter                            │
│  2. Call Firebase Auth signInWithEmailLink()                    │
│  3. Get Firebase Auth User                                      │
│  4. Query AuthSession by email hash                             │
│  5. Validate timestamp (expiration check)                       │
│  6. Load loan context (loanIds)                                 │
│  7. Start authenticated session                                 │
│  8. Show file upload interface                                  │
└─────────────────────────────────────────────────────────────────┘
                             │
                             │ Upload files
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              Cloud Function: processUpload                       │
│  1. Validate session token                                      │
│  2. Upload to Firebase Storage                                  │
│  3. Create file record in Data Connect                          │
│  4. Associate with loans from session                           │
│  5. Return file metadata                                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Security Model

### Third-Party API Authentication

**Option 1: API Key (Recommended for simplicity)**
```typescript
// In Cloud Function
const apiKey = request.headers['x-api-key'];
const validKeys = process.env.VALID_API_KEYS?.split(',') || [];

if (!validKeys.includes(apiKey)) {
  throw new Error('Invalid API key');
}
```

**Option 2: JWT Token (More secure, for enterprise)**
```typescript
// Third-party system generates JWT
const jwt = sign(
  {
    systemId: 'los-production',
    iat: Date.now()
  },
  SHARED_SECRET
);

// Cloud Function validates
const decoded = verify(token, SHARED_SECRET);
```

### Session Security

- Firebase Email Link Auth provides secure, short-lived tokens
- Session records in Data Connect have expiration timestamps
- Email hash (SHA-256) prevents email enumeration
- Loan context locked to session (prevents unauthorized access)

---

## 📁 File Operations Architecture

### Upload Flow (Firebase Storage)

```typescript
// Frontend
1. User selects file
2. Upload directly to Firebase Storage:
   Path: users/{userId}/loans/{loanId}/{fileId}.{ext}
3. Call Cloud Function processUpload with metadata
4. Function creates Data Connect record
5. Function associates with loans from session

// Benefits:
- Direct upload (faster, no server processing)
- Resumable uploads (Firebase SDK)
- Progress tracking built-in
- Storage security rules enforce access
```

### Download Flow (Signed URLs)

```typescript
// Cloud Function: generateDownloadURL
1. Validate session token
2. Check user has access to file
3. Generate Firebase Storage signed URL (1 hour expiry)
4. Return URL to frontend
5. Frontend downloads directly from Firebase Storage

// Benefits:
- Offload bandwidth from Cloud Functions
- Secure, time-limited access
- CDN-backed (fast downloads globally)
```

### List Flow (Data Connect)

```typescript
// Cloud Function: listFiles
1. Validate session token
2. Query Data Connect with GraphQL:
   - Filter by userId
   - Filter by loanId (from session)
   - Pagination support
   - Sorting support
3. Return file metadata array

// Benefits:
- PostgreSQL full-text search
- Complex filtering (tags, date ranges)
- Efficient pagination
- Relational queries (join with loans)
```

---

## 🗄️ Database Schema Updates

### Existing Tables (Data Connect)

✅ **Users** - Already exists
✅ **Loans** - Already exists (if needed later)
✅ **Files** - Already exists
✅ **FileLoanAssociations** - Already exists
✅ **AuthSessions** - Already exists

### New Fields Required

**AuthSessions table updates:**
```sql
-- Add Firebase Auth UID
ALTER TABLE AuthSessions
  ADD firebaseUid VARCHAR(128),
  ADD borrowerContactId VARCHAR(128),
  ADD loanNumber VARCHAR(50);

-- Add index for fast lookups
CREATE INDEX idx_firebase_uid ON AuthSessions(firebaseUid);
CREATE INDEX idx_email_hash ON AuthSessions(emailHash);
```

**New Table: ApiKeys (for third-party access)**
```sql
CREATE TABLE ApiKeys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  keyHash VARCHAR(256) NOT NULL UNIQUE,
  systemName VARCHAR(100) NOT NULL,
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT NOW(),
  expiresAt TIMESTAMP,
  lastUsedAt TIMESTAMP,
  usageCount INT DEFAULT 0
);
```

---

## 🚀 Implementation Plan

### Phase 1: Foundation (Authentication)
**Estimated Time:** 4-6 hours

1. ✅ Create `generateAuthLink` Cloud Function
   - Accept API key authentication
   - Accept POST body: `{ email, borrowerContactId, loanNumber, loanIds? }`
   - Generate Firebase Email Link
   - Create User if not exists
   - Create AuthSession with loan context
   - Send email via Firebase Auth
   - Return session metadata

2. ✅ Update AuthSession schema
   - Add firebaseUid field
   - Add borrowerContactId field
   - Add loanNumber field
   - Deploy Data Connect schema changes

3. ✅ Create API Key management
   - Store API keys in environment variables (for now)
   - Later: Admin UI to manage keys in database

4. ✅ Update frontend auth flow
   - Detect email link parameters
   - Call `signInWithEmailLink()`
   - Query AuthSession by Firebase UID
   - Validate expiration
   - Load loan context
   - Store session in React Context

---

### Phase 2: File Upload
**Estimated Time:** 3-4 hours

1. ✅ Update `processUpload` Cloud Function
   - Remove n8n webhook dependency
   - Accept authenticated requests only
   - Get session from token
   - Extract loanIds from session
   - Create file record in Data Connect
   - Auto-associate with session loans
   - Return file metadata

2. ✅ Update `onFileUploaded` storage trigger
   - Auto-process uploads from Storage
   - Extract metadata from custom metadata
   - Create backup file records

3. ✅ Update frontend upload component
   - Use Firebase Storage SDK directly
   - Show upload progress
   - Call processUpload after upload
   - Handle errors gracefully

---

### Phase 3: File Download & List
**Estimated Time:** 2-3 hours

1. ✅ Update `generateDownloadURL` Cloud Function
   - Validate session token
   - Check file access (user owns file OR file in session loans)
   - Generate signed URL (1 hour expiry)
   - Log download in audit table

2. ✅ Create `listFiles` Cloud Function
   - Accept session token
   - Filter by userId OR loanIds from session
   - Support pagination, sorting, filtering
   - Use Data Connect GraphQL queries
   - Return paginated results

3. ✅ Update frontend file list component
   - Call listFiles with session token
   - Display files with metadata
   - Show loan associations
   - Implement download buttons

---

### Phase 4: File Delete & Cleanup
**Estimated Time:** 2 hours

1. ✅ Create `deleteFile` Cloud Function
   - Validate session token
   - Check ownership
   - Soft delete in Data Connect
   - Optionally delete from Storage (after grace period)
   - Return success

2. ✅ Enable scheduled cleanup functions
   - Enable Cloud Scheduler API
   - Uncomment cleanup functions
   - Redeploy functions
   - Monitor cleanup logs

---

### Phase 5: Testing & Migration
**Estimated Time:** 3-4 hours

1. ✅ Integration testing
   - Test third-party API call
   - Test email link auth flow
   - Test file upload/download/delete
   - Test session expiration
   - Test loan context enforcement

2. ✅ Frontend updates
   - Remove all n8n webhook references
   - Update environment variables
   - Update API service files
   - Test all user flows

3. ✅ Documentation
   - API documentation for third-party systems
   - User guide for borrowers
   - Admin guide for loan officers

4. ⏭️ Decommission n8n (optional)
   - Archive workflows for reference
   - Remove n8n environment variables
   - Update deployment scripts

---

## 📝 Data Connect Queries & Mutations Needed

### New Queries

```graphql
# Get AuthSession by Firebase UID
query GetAuthSessionByFirebaseUid($firebaseUid: String!) {
  authSession(where: { firebaseUid: { eq: $firebaseUid } }) {
    id
    sessionId
    userId
    loanIds
    emailHash
    expiresAt
    verifiedAt
    status
    borrowerContactId
    loanNumber
  }
}

# Get AuthSession by email hash
query GetAuthSessionByEmailHash($emailHash: String!) {
  authSession(where: { emailHash: { eq: $emailHash } }) {
    id
    sessionId
    userId
    loanIds
    expiresAt
    status
  }
}

# List files for user with loan filter
query ListUserFiles(
  $userId: UUID!
  $loanIds: [UUID!]
  $limit: Int
  $offset: Int
) {
  file(
    where: {
      userId: { eq: $userId }
      isDeleted: { eq: false }
    }
    limit: $limit
    offset: $offset
    orderBy: { uploadedAt: DESC }
  ) {
    id
    originalFilename
    storagePath
    fileSize
    mimeType
    uploadedAt
    fileLoanAssociations {
      loanId
    }
  }
}
```

### New Mutations

```graphql
# Create AuthSession with Firebase UID
mutation CreateAuthSessionWithFirebase(
  $sessionId: String!
  $userId: UUID!
  $firebaseUid: String!
  $emailHash: String!
  $loanIds: String
  $borrowerContactId: String
  $loanNumber: String
  $expiresAt: Timestamp!
) {
  authSession_insert(data: {
    sessionId: $sessionId
    userId: $userId
    firebaseUid: $firebaseUid
    emailHash: $emailHash
    loanIds: $loanIds
    borrowerContactId: $borrowerContactId
    loanNumber: $loanNumber
    status: "active"
    expiresAt: $expiresAt
  })
}

# Update AuthSession with verification
mutation VerifyAuthSession(
  $id: UUID!
  $verifiedAt: Timestamp!
  $status: String!
) {
  authSession_update(
    id: $id
    data: {
      status: $status
      verifiedAt: $verifiedAt
      lastAccessedAt: $verifiedAt
    }
  )
}
```

---

## 🔧 Environment Variables

### Cloud Functions (.env)

```bash
# Existing
JWT_SECRET=...
APP_BASE_URL=https://my-box-53040.web.app
NODE_ENV=production
DATACONNECT_URL=...

# New
# API Keys for third-party systems (comma-separated)
VALID_API_KEYS=key_los_production_abc123,key_los_staging_xyz789

# Firebase Email Link Auth
EMAIL_LINK_URL=https://my-box-53040.web.app/auth/signin
EMAIL_LINK_EXPIRATION_HOURS=48

# Email sender (optional, for custom emails)
EMAIL_FROM_NAME=MyBox Loan Portal
EMAIL_FROM_ADDRESS=noreply@my-box-53040.firebaseapp.com
```

### Frontend (.env)

```bash
# Existing Firebase config
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...

# New: Cloud Functions URLs
VITE_GENERATE_AUTH_LINK_URL=https://generateauthlink-svgsdztqna-uc.a.run.app
VITE_LIST_FILES_URL=https://listfiles-svgsdztqna-uc.a.run.app
VITE_DELETE_FILE_URL=https://deletefile-svgsdztqna-uc.a.run.app

# Remove: N8N webhooks (no longer needed)
# VITE_N8N_BASE_URL=...
# VITE_N8N_FILE_UPLOAD_WEBHOOK=...
# etc.
```

---

## ✅ Success Criteria

### Functional Requirements

- [x] Third-party system can generate auth links via API
- [ ] Borrowers receive email with auth link
- [ ] Borrowers can sign in with email link (passwordless)
- [ ] Session loads loan context from auth record
- [ ] Files upload directly to Firebase Storage
- [ ] Files auto-associate with loans from session
- [ ] Users can download files with signed URLs
- [ ] Users can view file lists with pagination
- [ ] Users can delete files (soft delete)
- [ ] Returning users can access previous files
- [ ] Sessions expire after configured time

### Non-Functional Requirements

- [ ] All n8n webhooks removed from codebase
- [ ] All file operations use Firebase Storage
- [ ] All database queries use Data Connect
- [ ] API response time < 500ms
- [ ] File upload progress tracking works
- [ ] Error handling provides clear messages
- [ ] Security: API keys required for external access
- [ ] Security: Session tokens validated on every request
- [ ] Security: File access restricted by ownership or loan association

---

## 🎓 Learning Resources

- [Firebase Email Link Auth](https://firebase.google.com/docs/auth/web/email-link-auth)
- [Firebase Storage Security Rules](https://firebase.google.com/docs/storage/security)
- [Firebase Data Connect GraphQL](https://firebase.google.com/docs/data-connect)
- [Cloud Functions Authentication](https://firebase.google.com/docs/functions/auth-events)

---

## 📊 Migration Timeline

| Phase | Tasks | Estimated Time | Status |
|-------|-------|----------------|--------|
| Phase 1 | Authentication foundation | 4-6 hours | 🔵 Ready to start |
| Phase 2 | File upload | 3-4 hours | ⚪ Pending |
| Phase 3 | File download & list | 2-3 hours | ⚪ Pending |
| Phase 4 | File delete & cleanup | 2 hours | ⚪ Pending |
| Phase 5 | Testing & migration | 3-4 hours | ⚪ Pending |
| **Total** | | **14-19 hours** | |

---

## 🚨 Risks & Mitigation

### Risk: Email delivery issues
**Mitigation:** Use Firebase Auth email service (reliable, manages deliverability)

### Risk: Session hijacking
**Mitigation:** Short expiration times, email hash validation, IP tracking

### Risk: File storage costs
**Mitigation:** Implement lifecycle policies, monitor usage, cleanup old files

### Risk: API key leakage
**Mitigation:** Rotate keys regularly, monitor usage, implement rate limiting

---

## 📚 Next Steps

1. Review and approve this plan
2. Update Data Connect schema
3. Create generateAuthLink Cloud Function
4. Implement frontend auth flow
5. Update file operation functions
6. Test end-to-end flow
7. Deploy to production
8. Decommission n8n

---

**Last Updated:** 2025-01-14
**Document Owner:** Development Team
