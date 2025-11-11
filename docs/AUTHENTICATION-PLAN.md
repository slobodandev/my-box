# Passwordless Authentication System - Implementation Plan

## Overview

This document outlines a secure, passwordless authentication system using magic links and email verification for the loan file management system. Users receive a unique link that allows them to access and manage their loan documents without creating traditional accounts.

---

## Authentication Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│ 1. LINK GENERATION (Internal/Admin)                                 │
│    - Admin creates magic link for borrower                          │
│    - System generates secure token + stores in database             │
│    - Link sent via email: https://app.com/auth?token=ABC123XYZ      │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 2. USER LANDS ON PAGE                                               │
│    - Extract token from URL                                         │
│    - Verify token is valid (not expired, not used)                  │
│    - Show email entry form                                          │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 3. EMAIL VERIFICATION REQUEST                                       │
│    - User enters email address                                      │
│    - System validates: token + email match database record          │
│    - Generate 6-digit verification code                             │
│    - Send code via email                                            │
│    - Store code + timestamp in database                             │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 4. CODE VERIFICATION                                                │
│    - User enters 6-digit code                                       │
│    - System validates: token + email + code + expiration            │
│    - Generate session token (JWT)                                   │
│    - Return session token to client                                 │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 5. AUTHENTICATED REQUESTS                                           │
│    - Client includes session token in Authorization header          │
│    - Each workflow validates session token                          │
│    - Extract userId, loanIds from validated token                   │
│    - Process file operations                                        │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Improvements & Industry Standards

### 1. **Token Standards**

**Use JWT (JSON Web Tokens)** instead of simple hashing:
- Industry standard (RFC 7519)
- Self-contained (includes claims like userId, loanIds, expiration)
- Cryptographically signed
- Stateless validation

**Token Types:**
- **Magic Link Token**: Short-lived (24-48 hours), single-use
- **Session Token**: Medium-lived (7-30 days), renewable
- **Refresh Token**: Long-lived (90 days), for session renewal

### 2. **Security Best Practices**

**Rate Limiting:**
- Max 3 verification attempts per 15 minutes per email
- Max 5 magic link generations per hour per admin
- Exponential backoff after failed attempts

**Token Security:**
- Use cryptographically secure random generators
- Hash sensitive data in database (email, tokens)
- Implement token rotation
- Single-use magic links (mark as used after first verification)

**Email Verification Code:**
- 6-digit numeric code (100,000 - 999,999)
- Valid for 10 minutes only
- New code invalidates previous codes
- Use TOTP (Time-based One-Time Password) algorithm

**Additional Security:**
- HTTPS only (enforce in production)
- CSRF tokens for state-changing operations
- Content Security Policy headers
- Audit logging for all authentication events

### 3. **Database Schema Design**

Instead of single table, use normalized structure:

**AuthSessions Table** (stores magic links and active sessions)
```sql
CREATE TABLE AuthSessions (
    SessionId NVARCHAR(50) PRIMARY KEY,
    UserId NVARCHAR(50) NOT NULL,
    LoanIds NVARCHAR(MAX), -- JSON array of loan IDs
    EmailHash NVARCHAR(64) NOT NULL, -- SHA-256 hash of email
    MagicToken NVARCHAR(255) UNIQUE, -- For magic link
    SessionToken NVARCHAR(500), -- JWT after successful auth
    TokenType NVARCHAR(20), -- 'magic_link' or 'session'
    Status NVARCHAR(20), -- 'pending', 'verified', 'expired', 'revoked'
    ExpiresAt DATETIME2 NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    VerifiedAt DATETIME2,
    LastAccessedAt DATETIME2,
    IpAddress NVARCHAR(45),
    UserAgent NVARCHAR(500),
    FOREIGN KEY (UserId) REFERENCES Users(UserId),
    INDEX IX_AuthSessions_MagicToken (MagicToken),
    INDEX IX_AuthSessions_Status (Status),
    INDEX IX_AuthSessions_ExpiresAt (ExpiresAt)
);
```

**VerificationCodes Table** (stores email verification codes)
```sql
CREATE TABLE VerificationCodes (
    CodeId INT IDENTITY(1,1) PRIMARY KEY,
    SessionId NVARCHAR(50) NOT NULL,
    CodeHash NVARCHAR(64) NOT NULL, -- SHA-256 hash of code
    ExpiresAt DATETIME2 NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UsedAt DATETIME2,
    AttemptCount INT DEFAULT 0,
    MaxAttempts INT DEFAULT 3,
    FOREIGN KEY (SessionId) REFERENCES AuthSessions(SessionId),
    INDEX IX_VerificationCodes_SessionId (SessionId),
    INDEX IX_VerificationCodes_ExpiresAt (ExpiresAt)
);
```

**AuthAuditLog Table** (security audit trail)
```sql
CREATE TABLE AuthAuditLog (
    LogId INT IDENTITY(1,1) PRIMARY KEY,
    SessionId NVARCHAR(50),
    EventType NVARCHAR(50) NOT NULL, -- 'link_generated', 'email_sent', 'code_verified', 'token_issued', 'token_validated', 'invalid_attempt'
    Success BIT NOT NULL,
    ErrorMessage NVARCHAR(MAX),
    IpAddress NVARCHAR(45),
    UserAgent NVARCHAR(500),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    INDEX IX_AuthAuditLog_SessionId (SessionId),
    INDEX IX_AuthAuditLog_EventType (EventType),
    INDEX IX_AuthAuditLog_CreatedAt (CreatedAt)
);
```

### 4. **Email Security**

**Email Content Best Practices:**
- Clear sender identification
- Explain what the link/code is for
- Show expiration time
- Include security notice (don't share link/code)
- Provide support contact

**Email Service:**
- Use dedicated email service (SendGrid, AWS SES, Mailgun)
- Configure SPF, DKIM, DMARC records
- Use templates for consistency
- Track email delivery status

### 5. **Frontend Security**

**Token Storage:**
- Store session token in `httpOnly` cookie (preferred) OR
- Store in memory + localStorage as fallback
- Never store in plain localStorage alone

**Token Refresh:**
- Implement automatic token refresh before expiration
- Use refresh token rotation
- Silent refresh in background

**CSRF Protection:**
- Include CSRF token in forms
- Validate on backend for state-changing operations

---

## Implementation Tasks

### Phase 1: Database Schema (Priority: HIGH)

#### Task 1.1: Create Database Tables
- [ ] Create `AuthSessions` table
- [ ] Create `VerificationCodes` table
- [ ] Create `AuthAuditLog` table
- [ ] Add indexes for performance
- [ ] Add foreign key constraints
- [ ] Update `Users` table with email hash index

**Estimated Time:** 2 hours

---

### Phase 2: n8n Authentication Workflows (Priority: HIGH)

#### Task 2.1: Generate Magic Link Workflow
**Workflow Name:** `Generate Magic Link`
**Webhook:** `POST /webhook/auth/generate-link`

**Input:**
```json
{
  "userId": "user-123",
  "email": "borrower@example.com",
  "loanIds": ["loan-1", "loan-2"],
  "expirationHours": 48,
  "createdBy": "admin-user-id"
}
```

**Steps:**
1. Validate input (userId, email, loanIds exist)
2. Generate cryptographically secure magic token (32 bytes, hex)
3. Hash email with SHA-256
4. Create AuthSession record:
   - SessionId: UUID
   - MagicToken: generated token
   - EmailHash: hashed email
   - Status: 'pending'
   - ExpiresAt: now + expirationHours
5. Log event to AuthAuditLog
6. Send email with magic link
7. Return success response with sessionId

**Output:**
```json
{
  "success": true,
  "sessionId": "session-abc-123",
  "magicLink": "https://app.com/auth?token=64chartoken",
  "expiresAt": "2025-11-13T12:00:00Z"
}
```

**Estimated Time:** 4 hours

---

#### Task 2.2: Verify Magic Link Workflow
**Workflow Name:** `Verify Magic Link`
**Webhook:** `POST /webhook/auth/verify-link`

**Input:**
```json
{
  "token": "64charmagictoken"
}
```

**Steps:**
1. Look up AuthSession by MagicToken
2. Validate:
   - Token exists
   - Status is 'pending'
   - Not expired (ExpiresAt > now)
   - Not already used
3. Log event to AuthAuditLog
4. Return session info (don't include sensitive data)

**Output:**
```json
{
  "success": true,
  "sessionId": "session-abc-123",
  "requiresEmail": true,
  "expiresAt": "2025-11-13T12:00:00Z"
}
```

**Estimated Time:** 3 hours

---

#### Task 2.3: Send Verification Code Workflow
**Workflow Name:** `Send Verification Code`
**Webhook:** `POST /webhook/auth/send-code`

**Input:**
```json
{
  "sessionId": "session-abc-123",
  "email": "borrower@example.com"
}
```

**Steps:**
1. Look up AuthSession by sessionId
2. Validate:
   - Session exists and status is 'pending'
   - Not expired
   - Email hash matches stored hash
3. Check rate limit (max 3 codes per 15 minutes)
4. Generate 6-digit code (use crypto.randomInt(100000, 999999))
5. Hash code with SHA-256
6. Create/Update VerificationCode record:
   - SessionId: from input
   - CodeHash: hashed code
   - ExpiresAt: now + 10 minutes
   - AttemptCount: 0
7. Send email with verification code
8. Log event to AuthAuditLog
9. Return success (don't expose code)

**Output:**
```json
{
  "success": true,
  "message": "Verification code sent to your email",
  "expiresIn": 600,
  "attemptsRemaining": 3
}
```

**Estimated Time:** 4 hours

---

#### Task 2.4: Verify Code and Issue Session Token Workflow
**Workflow Name:** `Verify Code and Issue Token`
**Webhook:** `POST /webhook/auth/verify-code`

**Input:**
```json
{
  "sessionId": "session-abc-123",
  "email": "borrower@example.com",
  "code": "123456"
}
```

**Steps:**
1. Look up AuthSession by sessionId
2. Validate:
   - Session exists and status is 'pending'
   - Email hash matches
   - Not expired
3. Look up VerificationCode for session
4. Validate code:
   - Code exists and not used
   - Not expired (< 10 minutes old)
   - Attempts < MaxAttempts
   - Code hash matches
5. If code invalid:
   - Increment AttemptCount
   - If AttemptCount >= MaxAttempts, mark session as expired
   - Log failed attempt
   - Return error
6. If code valid:
   - Generate JWT session token with claims:
     ```json
     {
       "sub": "user-123",
       "sessionId": "session-abc-123",
       "loanIds": ["loan-1", "loan-2"],
       "email": "borrower@example.com",
       "iat": 1699564321,
       "exp": 1702156321,
       "type": "session"
     }
     ```
   - Update AuthSession:
     - SessionToken: JWT
     - Status: 'verified'
     - VerifiedAt: now
     - Mark MagicToken as used
   - Mark VerificationCode as used
   - Log success event
   - Return session token

**Output:**
```json
{
  "success": true,
  "sessionToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": "2025-12-10T12:00:00Z",
  "user": {
    "userId": "user-123",
    "email": "borrower@example.com",
    "loanIds": ["loan-1", "loan-2"]
  }
}
```

**Estimated Time:** 5 hours

---

#### Task 2.5: Validate Session Token Workflow (Middleware)
**Workflow Name:** `Validate Session Token`
**Webhook:** `POST /webhook/auth/validate-token`

**Input:**
```json
{
  "sessionToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Steps:**
1. Verify JWT signature
2. Check expiration
3. Extract claims (userId, sessionId, loanIds)
4. Look up AuthSession by sessionId
5. Validate:
   - Session exists
   - Status is 'verified'
   - Not revoked
   - SessionToken matches
6. Update LastAccessedAt
7. Log validation event
8. Return validated user info

**Output:**
```json
{
  "valid": true,
  "userId": "user-123",
  "loanIds": ["loan-1", "loan-2"],
  "email": "borrower@example.com",
  "sessionId": "session-abc-123"
}
```

**Estimated Time:** 3 hours

---

#### Task 2.6: Revoke Session Workflow
**Workflow Name:** `Revoke Session`
**Webhook:** `POST /webhook/auth/revoke-session`

**Input:**
```json
{
  "sessionId": "session-abc-123"
}
```

**Steps:**
1. Look up AuthSession
2. Update Status to 'revoked'
3. Log revocation event
4. Return success

**Estimated Time:** 2 hours

---

### Phase 3: Update Existing Workflows with Authentication (Priority: HIGH)

#### Task 3.1: Add Authentication Middleware to All Workflows

Update each file workflow to validate session token:

**File Upload, Download, List, Delete workflows:**

Add validation node at the beginning:
1. Extract Authorization header (Bearer token)
2. Call `Validate Session Token` workflow
3. If invalid, return 401 Unauthorized
4. If valid, extract userId and loanIds
5. Use validated userId for file operations
6. Validate file operations are within allowed loanIds

**Changes needed:**
- [ ] Update File Upload workflow
- [ ] Update File Download workflow
- [ ] Update File List workflow
- [ ] Update File Delete workflow

**Estimated Time:** 4 hours

---

### Phase 4: Frontend Implementation (Priority: HIGH)

#### Task 4.1: Create Authentication Pages

**Landing Page (`/auth`):**
- Extract token from URL query parameter
- Call `/webhook/auth/verify-link`
- If valid, show email entry form
- If invalid/expired, show error message

**Email Verification Form:**
- Input: email address
- On submit, call `/webhook/auth/send-code`
- Show "Check your email" message
- Show code entry form

**Code Verification Form:**
- Input: 6-digit code
- On submit, call `/webhook/auth/verify-code`
- On success:
  - Store session token (httpOnly cookie or localStorage)
  - Redirect to file management page
- On error:
  - Show error message
  - Show remaining attempts

**Estimated Time:** 8 hours

---

#### Task 4.2: Implement Session Management

**Token Storage:**
- Store session token securely
- Implement automatic token refresh
- Handle token expiration gracefully

**API Client Updates:**
- Add Authorization header to all requests
- Handle 401 responses (redirect to auth)
- Implement retry logic

**Estimated Time:** 4 hours

---

### Phase 5: Email Templates (Priority: MEDIUM)

#### Task 5.1: Create Email Templates

**Magic Link Email:**
```html
Subject: Access Your Loan Documents

Hi,

You've been invited to access and manage your loan documents.

Click the link below to get started:
[Access My Documents]

This link will expire in 48 hours.

If you didn't request this, please ignore this email.

Questions? Contact support@example.com
```

**Verification Code Email:**
```html
Subject: Your Verification Code

Hi,

Your verification code is:

123456

This code will expire in 10 minutes.

Don't share this code with anyone.

Questions? Contact support@example.com
```

**Estimated Time:** 2 hours

---

### Phase 6: Admin Interface (Priority: MEDIUM)

#### Task 6.1: Create Link Generation UI

**Features:**
- Form to generate magic links
- Inputs: user email, loan IDs, expiration time
- Display generated link
- Copy to clipboard button
- Email sending option
- Link history/management

**Estimated Time:** 6 hours

---

### Phase 7: Security Enhancements (Priority: MEDIUM)

#### Task 7.1: Implement Rate Limiting

- [ ] Add rate limiting for code sending (3 per 15 min)
- [ ] Add rate limiting for code verification (5 per hour)
- [ ] Add rate limiting for link generation
- [ ] Implement exponential backoff

**Estimated Time:** 4 hours

---

#### Task 7.2: Add Monitoring and Alerts

- [ ] Alert on suspicious activity (many failed attempts)
- [ ] Monitor authentication success/failure rates
- [ ] Track average session duration
- [ ] Alert on unusual IP addresses

**Estimated Time:** 3 hours

---

### Phase 8: Testing (Priority: HIGH)

#### Task 8.1: End-to-End Testing

**Test Scenarios:**
- [ ] Happy path: Generate link → verify email → enter code → access files
- [ ] Expired magic link
- [ ] Wrong email address
- [ ] Wrong verification code (3 attempts)
- [ ] Expired verification code
- [ ] Reuse of magic link
- [ ] Invalid session token
- [ ] Expired session token
- [ ] Unauthorized file access (wrong loan)
- [ ] Concurrent sessions

**Estimated Time:** 8 hours

---

#### Task 8.2: Security Testing

- [ ] SQL injection attempts
- [ ] XSS attacks
- [ ] CSRF attacks
- [ ] Brute force code attempts
- [ ] Token manipulation
- [ ] Replay attacks

**Estimated Time:** 4 hours

---

## Security Checklist

### Authentication
- [ ] Magic links are single-use
- [ ] Magic links expire after 48 hours
- [ ] Verification codes expire after 10 minutes
- [ ] Maximum 3 code verification attempts
- [ ] Rate limiting on all auth endpoints
- [ ] All tokens are cryptographically secure random
- [ ] Session tokens use JWT with strong secret
- [ ] Session tokens expire (30 days default)

### Data Protection
- [ ] Emails are hashed in database (SHA-256)
- [ ] Verification codes are hashed in database
- [ ] Session tokens are validated on every request
- [ ] Sensitive data never logged
- [ ] HTTPS enforced in production
- [ ] Secure headers configured (CSP, HSTS, etc.)

### Database
- [ ] All queries use parameterized statements
- [ ] Indexes on frequently queried columns
- [ ] Foreign key constraints enabled
- [ ] Audit logging for all auth events
- [ ] Regular cleanup of expired records

### Email
- [ ] SPF, DKIM, DMARC configured
- [ ] Email templates reviewed for phishing prevention
- [ ] Sender email clearly identified
- [ ] Email delivery tracked

### Monitoring
- [ ] Failed authentication attempts logged
- [ ] Successful authentications logged
- [ ] Suspicious activity alerts configured
- [ ] Session metrics tracked

---

## API Documentation

### Authentication Endpoints

#### 1. Generate Magic Link
```http
POST /webhook/auth/generate-link
Content-Type: application/json
Authorization: Bearer {admin-token}

{
  "userId": "user-123",
  "email": "borrower@example.com",
  "loanIds": ["loan-1", "loan-2"],
  "expirationHours": 48
}
```

#### 2. Verify Magic Link
```http
POST /webhook/auth/verify-link
Content-Type: application/json

{
  "token": "64charmagictoken"
}
```

#### 3. Send Verification Code
```http
POST /webhook/auth/send-code
Content-Type: application/json

{
  "sessionId": "session-abc-123",
  "email": "borrower@example.com"
}
```

#### 4. Verify Code
```http
POST /webhook/auth/verify-code
Content-Type: application/json

{
  "sessionId": "session-abc-123",
  "email": "borrower@example.com",
  "code": "123456"
}
```

#### 5. Validate Token
```http
POST /webhook/auth/validate-token
Content-Type: application/json

{
  "sessionToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Authenticated File Operations

All file endpoints now require Authorization header:

```http
POST /webhook/file-upload
Authorization: Bearer {session-token}
Content-Type: multipart/form-data

userId={from-token}
loanIds={validated-against-token}
file={binary-data}
```

---

## Timeline Estimate

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| Phase 1: Database Schema | 1 | 2 hours |
| Phase 2: n8n Workflows | 6 | 23 hours |
| Phase 3: Update Existing Workflows | 1 | 4 hours |
| Phase 4: Frontend | 2 | 12 hours |
| Phase 5: Email Templates | 1 | 2 hours |
| Phase 6: Admin Interface | 1 | 6 hours |
| Phase 7: Security | 2 | 7 hours |
| Phase 8: Testing | 2 | 12 hours |
| **TOTAL** | **16 tasks** | **~68 hours (~2 weeks)** |

---

## References & Standards

### Industry Standards
- **JWT (RFC 7519):** https://tools.ietf.org/html/rfc7519
- **OAuth 2.0 (RFC 6749):** https://tools.ietf.org/html/rfc6749
- **TOTP (RFC 6238):** https://tools.ietf.org/html/rfc6238
- **OWASP Authentication Cheat Sheet:** https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html

### Similar Implementations
- **Slack Magic Links:** Email-based passwordless authentication
- **Medium:** Email link + session cookie
- **Notion:** Magic link with workspace access
- **Auth0 Passwordless:** Industry-standard implementation

### Security Resources
- **OWASP Top 10:** https://owasp.org/www-project-top-ten/
- **CWE Top 25:** https://cwe.mitre.org/top25/
- **NIST Digital Identity Guidelines:** https://pages.nist.gov/800-63-3/

---

## Next Steps

1. **Review this plan** with the team
2. **Prioritize tasks** based on business needs
3. **Set up development environment** (local n8n, test database, email service)
4. **Create database schema** (Phase 1)
5. **Start implementing n8n workflows** (Phase 2)
6. **Iterate and test** throughout development

---

**Document Version:** 1.0
**Last Updated:** 2025-11-11
**Status:** Planning Phase
**Next Review:** After Phase 1 completion
