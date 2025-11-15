# JWT-Based Authentication Implementation Plan

**Created:** 2025-11-11
**Status:** Ready for Implementation
**Version:** 2.0 (JWT-based)

---

## Table of Contents

1. [Overview](#overview)
2. [JWT Architecture](#jwt-architecture)
3. [Authentication Flow](#authentication-flow)
4. [JWT Token Types](#jwt-token-types)
5. [Workflow Specifications](#workflow-specifications)
6. [Frontend Implementation](#frontend-implementation)
7. [Security Considerations](#security-considerations)
8. [Implementation Timeline](#implementation-timeline)

---

## Overview

This document outlines a complete JWT-based passwordless authentication system using n8n's built-in JWT node. The system uses two types of JWTs:

1. **Magic Link JWT** - Short-lived, single-use token for initial authentication
2. **Session JWT** - Long-lived token for API access after email verification

### Key Improvements Over Previous Design

- Uses n8n's built-in JWT node (no custom crypto code)
- JWT embedded in magic link URL for stateless verification
- Two-tier JWT system (magic link → session token)
- Frontend-first design with React integration
- Proper JWT signature verification at every step

---

## JWT Architecture

### JWT Secret Configuration

**Environment Variable:** `JWT_SECRET`
**Recommended:** 64+ character random string
**Generation:**
```bash
openssl rand -base64 64
```

**Storage:**
- n8n environment variable
- Never commit to git
- Rotate periodically (requires re-authentication of all users)

### JWT Libraries

n8n uses `jsonwebtoken` npm package internally. The JWT node supports:
- **HS256** (HMAC SHA-256) - Recommended for this use case
- **RS256** (RSA SHA-256) - For asymmetric key scenarios

We'll use **HS256** with a shared secret.

---

## Authentication Flow

### Complete User Journey

```
┌─────────────────────────────────────────────────────────────┐
│  1. Admin generates magic link for user                     │
│     POST /webhook/auth/generate-link                        │
│     → Creates DB session                                    │
│     → Generates Magic Link JWT                              │
│     → Sends email with link                                 │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  2. User clicks magic link                                  │
│     https://app.com/auth?token={MAGIC_LINK_JWT}            │
│     → Frontend extracts JWT from URL                        │
│     → Calls POST /webhook/auth/verify-link                 │
│     → Backend verifies JWT signature                        │
│     → Returns: sessionId, email, status                     │
│     → Frontend shows email verification form                │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  3. User enters email and clicks "Send Code"                │
│     POST /webhook/auth/send-code                            │
│     → Verifies Magic Link JWT                               │
│     → Generates 6-digit code                                │
│     → Stores hashed code in DB                              │
│     → Sends email with code                                 │
│     → Returns success                                       │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  4. User enters 6-digit code and submits                    │
│     POST /webhook/auth/verify-code                          │
│     → Verifies Magic Link JWT                               │
│     → Verifies code hash                                    │
│     → Checks expiration (<10 min)                           │
│     → Marks magic link as used                              │
│     → Generates SESSION JWT                                 │
│     → Returns Session JWT                                   │
│     → Frontend stores in localStorage                       │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  5. User makes API requests                                 │
│     All file operations: Authorization: Bearer {SESSION_JWT}│
│     → POST /webhook/auth/validate-token                     │
│     → Verifies Session JWT signature                        │
│     → Checks session in DB                                  │
│     → Returns user claims (userId, loanIds)                 │
│     → File operation proceeds with authorization            │
└─────────────────────────────────────────────────────────────┘
```

---

## JWT Token Types

### 1. Magic Link JWT

**Purpose:** Embedded in email link, allows user to initiate verification

**Payload:**
```json
{
  "type": "magic_link",
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "emailHash": "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
  "iat": 1699564800,
  "exp": 1699651200
}
```

**Expiration:** 48 hours (configurable)
**Single-use:** Yes (marked as used after code verification)
**Signature:** HS256 with JWT_SECRET

**Security Notes:**
- Email hash prevents URL tampering (can't change email without invalidating signature)
- Short expiration limits attack window
- Verified against DB session on every use

### 2. Session JWT

**Purpose:** Long-lived token for API access after successful authentication

**Payload:**
```json
{
  "type": "session",
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "user-borrower-001",
  "email": "user@example.com",
  "loanIds": ["loan-001", "loan-002"],
  "iat": 1699564800,
  "exp": 1702243200
}
```

**Expiration:** 30 days (configurable)
**Renewable:** Yes (can issue new token before expiration)
**Signature:** HS256 with JWT_SECRET

**Security Notes:**
- Contains full user context for authorization
- Validated against DB session on critical operations
- Can be revoked by deleting DB session

---

## Workflow Specifications

### Workflow 1: Generate Magic Link

**Name:** `Auth: Generate Magic Link (JWT)`
**Webhook:** `POST /webhook/auth/generate-link`

#### Input:
```json
{
  "userId": "user-borrower-001",
  "email": "borrower@example.com",
  "loanIds": ["loan-001", "loan-002"],
  "expirationHours": 48,
  "createdBy": "admin-user-id"
}
```

#### Workflow Steps:

1. **Validate Input** (Function node)
   - Check required fields
   - Validate email format
   - Validate expirationHours (1-168)

2. **Generate Session ID** (Function node)
   - Generate UUID v4
   - Hash email with SHA-256
   - Calculate expiration timestamp

3. **Validate User and Loans** (SQL node)
   - Verify user exists
   - Verify user has access to specified loans

4. **Insert Auth Session** (SQL node)
   ```sql
   INSERT INTO AuthSessions (
     SessionId, UserId, LoanIds, EmailHash,
     TokenType, Status, ExpiresAt, CreatedAt, CreatedBy
   ) VALUES (
     @sessionId, @userId, @loanIds, @emailHash,
     'magic_link', 'pending', @expiresAt, @createdAt, @createdBy
   );
   ```

5. **Create Magic Link JWT** (JWT node - SIGN mode)
   - **Algorithm:** HS256
   - **Secret:** `{{$env.JWT_SECRET}}`
   - **Payload:**
     ```json
     {
       "type": "magic_link",
       "sessionId": "{{$json.sessionId}}",
       "emailHash": "{{$json.emailHash}}",
       "exp": "{{$json.expirationTimestamp}}"
     }
     ```

6. **Build Email Content** (Function node)
   - Create magic link: `https://your-domain.com/auth?token={{JWT}}`
   - Format HTML email

7. **Send Email** (Email node or SendGrid)
   - To: user email
   - Subject: "Access Your Loan Documents"
   - HTML body with magic link

8. **Log to Audit Trail** (SQL node)
   - Event: 'link_generated'
   - Success: true

9. **Return Response**
   ```json
   {
     "success": true,
     "sessionId": "uuid",
     "magicLink": "https://app.com/auth?token=eyJhbG...",
     "expiresAt": "2025-11-13T12:00:00Z"
   }
   ```

---

### Workflow 2: Verify Magic Link

**Name:** `Auth: Verify Magic Link (JWT)`
**Webhook:** `POST /webhook/auth/verify-link`

#### Input:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Workflow Steps:

1. **Verify JWT** (JWT node - VERIFY mode)
   - **Algorithm:** HS256
   - **Secret:** `{{$env.JWT_SECRET}}`
   - **Input:** `{{$json.token}}`
   - Throws error if invalid/expired

2. **Extract JWT Claims** (Function node)
   - Extract: type, sessionId, emailHash
   - Validate type === 'magic_link'

3. **Query Session from DB** (SQL node)
   ```sql
   SELECT
     SessionId, UserId, EmailHash, Status, ExpiresAt,
     (SELECT Email FROM Users WHERE UserId = a.UserId) AS Email
   FROM AuthSessions a
   WHERE SessionId = @sessionId
   AND TokenType = 'magic_link';
   ```

4. **Validate Session** (Function node)
   - Check session exists
   - Check emailHash matches JWT
   - Check status is 'pending' (not used)
   - Check ExpiresAt > now

5. **Log to Audit Trail** (SQL node)
   - Event: 'link_verified'
   - Success: true/false

6. **Return Response**
   ```json
   {
     "success": true,
     "sessionId": "uuid",
     "email": "user@example.com",
     "status": "pending",
     "expiresAt": "2025-11-13T12:00:00Z"
   }
   ```

---

### Workflow 3: Send Verification Code

**Name:** `Auth: Send Verification Code (JWT)`
**Webhook:** `POST /webhook/auth/send-code`

#### Input:
```json
{
  "sessionId": "uuid",
  "email": "user@example.com",
  "magicLinkToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Workflow Steps:

1. **Verify Magic Link JWT** (JWT node - VERIFY mode)
   - Validates token is still valid

2. **Extract JWT Claims** (Function node)
   - Extract sessionId, emailHash

3. **Validate Input** (Function node)
   - Check sessionId matches JWT
   - Hash submitted email and verify matches JWT emailHash

4. **Check Rate Limiting** (SQL node)
   ```sql
   SELECT COUNT(*) AS AttemptCount
   FROM VerificationCodes
   WHERE SessionId = @sessionId
   AND CreatedAt > DATEADD(MINUTE, -15, GETDATE());
   ```
   - Max 3 codes per 15 minutes

5. **Generate 6-Digit Code** (Function node)
   ```javascript
   const code = Math.floor(100000 + Math.random() * 900000).toString();
   const codeHash = sha256(code); // Use our pure JS SHA-256
   ```

6. **Insert Verification Code** (SQL node)
   ```sql
   INSERT INTO VerificationCodes (
     SessionId, CodeHash, ExpiresAt, CreatedAt
   ) VALUES (
     @sessionId,
     @codeHash,
     DATEADD(MINUTE, 10, GETDATE()),
     GETDATE()
   );
   ```

7. **Send Email with Code** (Email node)
   - To: user email
   - Subject: "Your Verification Code"
   - Body: "Your code is: {6-digit-code}"

8. **Log to Audit Trail** (SQL node)
   - Event: 'code_sent'

9. **Return Response**
   ```json
   {
     "success": true,
     "message": "Verification code sent to email",
     "expiresIn": 600
   }
   ```

---

### Workflow 4: Verify Code and Issue Session JWT

**Name:** `Auth: Verify Code and Issue Session JWT`
**Webhook:** `POST /webhook/auth/verify-code`

#### Input:
```json
{
  "sessionId": "uuid",
  "email": "user@example.com",
  "code": "123456",
  "magicLinkToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Workflow Steps:

1. **Verify Magic Link JWT** (JWT node - VERIFY mode)

2. **Hash Submitted Code** (Function node)
   ```javascript
   const codeHash = sha256($json.code);
   ```

3. **Verify Code** (SQL node)
   ```sql
   SELECT
     CodeId, SessionId, ExpiresAt, IsUsed, AttemptCount, MaxAttempts
   FROM VerificationCodes
   WHERE SessionId = @sessionId
   AND CodeHash = @codeHash
   ORDER BY CreatedAt DESC;
   ```

4. **Validate Code** (Function node)
   - Check code exists
   - Check not expired
   - Check not already used
   - Check attempts < max attempts

5. **Update Attempt Count** (SQL node)
   ```sql
   UPDATE VerificationCodes
   SET AttemptCount = AttemptCount + 1
   WHERE CodeId = @codeId;
   ```

6. **Get Session Details** (SQL node)
   ```sql
   SELECT
     a.SessionId, a.UserId, a.LoanIds, a.EmailHash,
     u.Email
   FROM AuthSessions a
   INNER JOIN Users u ON a.UserId = u.UserId
   WHERE a.SessionId = @sessionId;
   ```

7. **Mark Code as Used** (SQL node)
   ```sql
   UPDATE VerificationCodes
   SET IsUsed = 1, UsedAt = GETDATE()
   WHERE CodeId = @codeId;
   ```

8. **Update Session Status** (SQL node)
   ```sql
   UPDATE AuthSessions
   SET
     Status = 'verified',
     VerifiedAt = GETDATE()
   WHERE SessionId = @sessionId;
   ```

9. **Create Session JWT** (JWT node - SIGN mode)
   - **Algorithm:** HS256
   - **Secret:** `{{$env.JWT_SECRET}}`
   - **Payload:**
     ```json
     {
       "type": "session",
       "sessionId": "{{$json.sessionId}}",
       "userId": "{{$json.userId}}",
       "email": "{{$json.email}}",
       "loanIds": {{$json.loanIds}},
       "exp": "{{30 days from now}}"
     }
     ```

10. **Store Session JWT in DB** (SQL node)
    ```sql
    UPDATE AuthSessions
    SET SessionToken = @jwt
    WHERE SessionId = @sessionId;
    ```

11. **Log to Audit Trail** (SQL node)
    - Event: 'token_issued'

12. **Return Response**
    ```json
    {
      "success": true,
      "sessionToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "userId": "user-borrower-001",
      "email": "user@example.com",
      "loanIds": ["loan-001", "loan-002"],
      "expiresAt": "2025-12-11T12:00:00Z"
    }
    ```

---

### Workflow 5: Validate Session JWT

**Name:** `Auth: Validate Session JWT`
**Webhook:** `POST /webhook/auth/validate-token`

#### Input:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

OR via header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Workflow Steps:

1. **Extract Token** (Function node)
   - From body or Authorization header

2. **Verify JWT** (JWT node - VERIFY mode)
   - **Algorithm:** HS256
   - **Secret:** `{{$env.JWT_SECRET}}`
   - Throws error if invalid/expired

3. **Extract JWT Claims** (Function node)
   - Extract: type, sessionId, userId, email, loanIds

4. **Validate Session in DB** (SQL node)
   ```sql
   SELECT
     SessionId, UserId, Status, ExpiresAt, LastAccessedAt
   FROM AuthSessions
   WHERE SessionId = @sessionId
   AND Status = 'verified';
   ```

5. **Validate Session** (Function node)
   - Check session exists
   - Check status is 'verified'
   - Check not revoked

6. **Update Last Accessed** (SQL node)
   ```sql
   UPDATE AuthSessions
   SET LastAccessedAt = GETDATE()
   WHERE SessionId = @sessionId;
   ```

7. **Return Response**
   ```json
   {
     "valid": true,
     "userId": "user-borrower-001",
     "email": "user@example.com",
     "loanIds": ["loan-001", "loan-002"],
     "sessionId": "uuid"
   }
   ```

---

### Workflow 6: Revoke Session

**Name:** `Auth: Revoke Session`
**Webhook:** `POST /webhook/auth/revoke-session`

#### Input:
```json
{
  "sessionId": "uuid",
  "revokedBy": "admin-user-id",
  "reason": "User logout"
}
```

#### Workflow Steps:

1. **Update Session** (SQL node)
   ```sql
   UPDATE AuthSessions
   SET
     Status = 'revoked',
     RevokedAt = GETDATE(),
     RevokedBy = @revokedBy,
     RevokeReason = @reason
   WHERE SessionId = @sessionId;
   ```

2. **Log to Audit Trail** (SQL node)
   - Event: 'session_revoked'

3. **Return Response**
   ```json
   {
     "success": true,
     "message": "Session revoked successfully"
   }
   ```

---

## Frontend Implementation

### React App Structure

```
src/
├── contexts/
│   └── AuthContext.tsx          # Auth state management
├── hooks/
│   ├── useAuth.ts              # Auth hook
│   └── useJWT.ts               # JWT utilities
├── services/
│   └── authService.ts          # API calls
├── components/
│   ├── auth/
│   │   ├── MagicLinkHandler.tsx    # /auth route handler
│   │   ├── EmailVerification.tsx   # Email input form
│   │   └── CodeVerification.tsx    # Code input form
│   └── ProtectedRoute.tsx      # Auth guard
└── utils/
    └── jwt.ts                  # JWT decode utilities
```

### 1. JWT Utilities (`src/utils/jwt.ts`)

```typescript
import jwtDecode from 'jwt-decode';

export interface MagicLinkJWT {
  type: 'magic_link';
  sessionId: string;
  emailHash: string;
  exp: number;
  iat: number;
}

export interface SessionJWT {
  type: 'session';
  sessionId: string;
  userId: string;
  email: string;
  loanIds: string[];
  exp: number;
  iat: number;
}

export const decodeJWT = <T = any>(token: string): T => {
  try {
    return jwtDecode<T>(token);
  } catch (error) {
    throw new Error('Invalid JWT token');
  }
};

export const isJWTExpired = (token: string): boolean => {
  try {
    const decoded = decodeJWT<{ exp: number }>(token);
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

export const getJWTExpiration = (token: string): Date | null => {
  try {
    const decoded = decodeJWT<{ exp: number }>(token);
    return new Date(decoded.exp * 1000);
  } catch {
    return null;
  }
};
```

### 2. Auth Service (`src/services/authService.ts`)

```typescript
import axios from 'axios';
import type { MagicLinkJWT, SessionJWT } from '../utils/jwt';

const N8N_BASE_URL = import.meta.env.VITE_N8N_BASE_URL;

export interface VerifyLinkResponse {
  success: boolean;
  sessionId: string;
  email: string;
  status: string;
  expiresAt: string;
}

export interface SendCodeResponse {
  success: boolean;
  message: string;
  expiresIn: number;
}

export interface VerifyCodeResponse {
  success: boolean;
  sessionToken: string;
  userId: string;
  email: string;
  loanIds: string[];
  expiresAt: string;
}

export interface ValidateTokenResponse {
  valid: boolean;
  userId: string;
  email: string;
  loanIds: string[];
  sessionId: string;
}

export const authService = {
  verifyMagicLink: async (token: string): Promise<VerifyLinkResponse> => {
    const response = await axios.post(
      `${N8N_BASE_URL}/webhook/auth/verify-link`,
      { token }
    );
    return response.data;
  },

  sendVerificationCode: async (
    sessionId: string,
    email: string,
    magicLinkToken: string
  ): Promise<SendCodeResponse> => {
    const response = await axios.post(
      `${N8N_BASE_URL}/webhook/auth/send-code`,
      { sessionId, email, magicLinkToken }
    );
    return response.data;
  },

  verifyCode: async (
    sessionId: string,
    email: string,
    code: string,
    magicLinkToken: string
  ): Promise<VerifyCodeResponse> => {
    const response = await axios.post(
      `${N8N_BASE_URL}/webhook/auth/verify-code`,
      { sessionId, email, code, magicLinkToken }
    );
    return response.data;
  },

  validateToken: async (token: string): Promise<ValidateTokenResponse> => {
    const response = await axios.post(
      `${N8N_BASE_URL}/webhook/auth/validate-token`,
      { token }
    );
    return response.data;
  },

  revokeSession: async (sessionId: string): Promise<void> => {
    await axios.post(`${N8N_BASE_URL}/webhook/auth/revoke-session`, {
      sessionId,
      revokedBy: 'user',
      reason: 'User logout',
    });
  },
};
```

### 3. Auth Context (`src/contexts/AuthContext.tsx`)

```typescript
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { SessionJWT, decodeJWT, isJWTExpired } from '../utils/jwt';

interface AuthContextType {
  sessionToken: string | null;
  user: SessionJWT | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [user, setUser] = useState<SessionJWT | null>(null);

  useEffect(() => {
    // Load token from localStorage on mount
    const token = localStorage.getItem('sessionToken');
    if (token && !isJWTExpired(token)) {
      setSessionToken(token);
      setUser(decodeJWT<SessionJWT>(token));
    } else {
      localStorage.removeItem('sessionToken');
    }
  }, []);

  const login = (token: string) => {
    localStorage.setItem('sessionToken', token);
    setSessionToken(token);
    setUser(decodeJWT<SessionJWT>(token));
  };

  const logout = () => {
    localStorage.removeItem('sessionToken');
    setSessionToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        sessionToken,
        user,
        isAuthenticated: !!sessionToken && !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
```

### 4. Magic Link Handler (`src/components/auth/MagicLinkHandler.tsx`)

```typescript
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { decodeJWT, MagicLinkJWT } from '../../utils/jwt';
import { EmailVerification } from './EmailVerification';
import { CodeVerification } from './CodeVerification';

type AuthStep = 'verifying' | 'email' | 'code' | 'error' | 'success';

export const MagicLinkHandler: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [step, setStep] = useState<AuthStep>('verifying');
  const [magicLinkToken, setMagicLinkToken] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setError('No token provided');
      setStep('error');
      return;
    }

    verifyMagicLink(token);
  }, [searchParams]);

  const verifyMagicLink = async (token: string) => {
    try {
      // Decode JWT to show user info immediately
      const decoded = decodeJWT<MagicLinkJWT>(token);

      // Verify with backend
      const response = await authService.verifyMagicLink(token);

      setMagicLinkToken(token);
      setSessionId(response.sessionId);
      setEmail(response.email);
      setStep('email');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid or expired magic link');
      setStep('error');
    }
  };

  const handleEmailSubmit = async (submittedEmail: string) => {
    try {
      await authService.sendVerificationCode(sessionId, submittedEmail, magicLinkToken);
      setEmail(submittedEmail);
      setStep('code');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send verification code');
    }
  };

  const handleCodeSubmit = async (code: string) => {
    try {
      const response = await authService.verifyCode(
        sessionId,
        email,
        code,
        magicLinkToken
      );

      // Store session token in context and localStorage
      const authContext = useAuth();
      authContext.login(response.sessionToken);

      setStep('success');
      setTimeout(() => navigate('/'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid verification code');
    }
  };

  if (step === 'verifying') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying magic link...</p>
        </div>
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-xl font-bold text-red-800 mb-2">Authentication Error</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (step === 'email') {
    return <EmailVerification email={email} onSubmit={handleEmailSubmit} />;
  }

  if (step === 'code') {
    return (
      <CodeVerification
        email={email}
        onSubmit={handleCodeSubmit}
        onResend={() => handleEmailSubmit(email)}
      />
    );
  }

  if (step === 'success') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 max-w-md text-center">
          <div className="text-green-600 text-5xl mb-4">✓</div>
          <h2 className="text-xl font-bold text-green-800 mb-2">Authentication Successful</h2>
          <p className="text-green-600">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return null;
};
```

### 5. Protected Route Component

```typescript
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/auth-required" replace />;
  }

  return <>{children}</>;
};
```

### 6. API Client with JWT

```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_N8N_BASE_URL,
});

// Add JWT to all requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('sessionToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('sessionToken');
      window.location.href = '/auth-required';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

---

## Security Considerations

### 1. JWT Secret Management

- **NEVER** commit JWT_SECRET to git
- Use strong, random 64+ character secret
- Rotate periodically (requires user re-authentication)
- Store in n8n environment variables

### 2. Token Expiration

- **Magic Link JWT:** 48 hours (short-lived)
- **Session JWT:** 30 days (configurable)
- Always verify expiration on backend
- Frontend should check expiration and refresh if needed

### 3. Rate Limiting

- Max 3 verification code requests per 15 minutes
- Max 3 code verification attempts per code
- Exponential backoff on failed attempts

### 4. Email Hash Validation

- Hash email in Magic Link JWT to prevent tampering
- Verify hash matches on all operations
- Use SHA-256 for hashing

### 5. HTTPS Only

- All authentication endpoints MUST use HTTPS in production
- Never send JWTs over HTTP

### 6. XSS Protection

- Store session JWT in localStorage (not in cookies to avoid CSRF)
- Sanitize all user inputs
- Use Content Security Policy headers

### 7. Database Session Validation

- Always verify JWT against DB session
- Check session status is 'verified'
- Update LastAccessedAt for monitoring

### 8. Audit Logging

- Log all authentication events
- Track failed attempts
- Monitor suspicious patterns

---

## Implementation Timeline

### Phase 1: Setup (2 hours)
- [ ] Generate JWT_SECRET
- [ ] Configure n8n environment variable
- [ ] Install jwt-decode in frontend

### Phase 2: Update Generate Magic Link Workflow (3 hours)
- [ ] Replace custom crypto with JWT node
- [ ] Update to sign Magic Link JWT
- [ ] Test workflow

### Phase 3: Create Verify Magic Link Workflow (2 hours)
- [ ] Create workflow with JWT verification
- [ ] Test with valid/invalid tokens

### Phase 4: Create Send Verification Code Workflow (3 hours)
- [ ] Implement code generation
- [ ] Add rate limiting
- [ ] Configure email sending

### Phase 5: Create Verify Code Workflow (4 hours)
- [ ] Implement code verification
- [ ] Sign Session JWT
- [ ] Update session in DB

### Phase 6: Create Validate Session Workflow (2 hours)
- [ ] Verify Session JWT
- [ ] Check DB session
- [ ] Return user claims

### Phase 7: Frontend Implementation (8 hours)
- [ ] Set up AuthContext
- [ ] Create MagicLinkHandler component
- [ ] Create email/code verification forms
- [ ] Add ProtectedRoute
- [ ] Configure API client with JWT

### Phase 8: Integration and Testing (6 hours)
- [ ] End-to-end testing
- [ ] Error scenario testing
- [ ] Security testing
- [ ] Performance testing

**Total Estimated Time:** 30 hours (~4 days)

---

## Testing Checklist

### Happy Path
- [ ] Admin generates magic link
- [ ] User receives email
- [ ] User clicks magic link
- [ ] JWT is verified successfully
- [ ] User enters email
- [ ] Verification code is sent
- [ ] User enters correct code
- [ ] Session JWT is issued
- [ ] User can access protected routes

### Error Scenarios
- [ ] Expired magic link JWT
- [ ] Invalid JWT signature
- [ ] Tampered JWT payload
- [ ] Wrong email entered
- [ ] Expired verification code
- [ ] Wrong verification code (3 attempts)
- [ ] Rate limit exceeded
- [ ] Revoked session

### Security Tests
- [ ] JWT signature verification
- [ ] Token expiration enforcement
- [ ] Email hash validation
- [ ] Rate limiting enforcement
- [ ] SQL injection prevention
- [ ] XSS prevention

---

## Migration from Current System

If you have existing magic link sessions:

1. Keep old workflows temporarily
2. Add version field to distinguish old vs new
3. Support both flows during transition
4. Migrate existing sessions to JWT
5. Deprecate old workflows after 48 hours

---

## Environment Variables

```bash
# n8n Environment Variables
JWT_SECRET=your-strong-64-char-random-secret-here
JWT_EXPIRATION_MAGIC_LINK=48h
JWT_EXPIRATION_SESSION=30d

# Frontend Environment Variables
VITE_N8N_BASE_URL=http://48.223.194.241:5678
VITE_APP_DOMAIN=https://your-domain.com
```

---

## Appendix

### JWT Example Tokens

**Magic Link JWT (decoded):**
```json
{
  "type": "magic_link",
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "emailHash": "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
  "iat": 1699564800,
  "exp": 1699651200
}
```

**Session JWT (decoded):**
```json
{
  "type": "session",
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "user-borrower-001",
  "email": "borrower@example.com",
  "loanIds": ["loan-001", "loan-002"],
  "iat": 1699564800,
  "exp": 1702243200
}
```

### SQL Schema Updates

No changes needed to existing auth-schema.sql!

---

**Status:** Ready for Implementation
**Next Steps:** Generate JWT_SECRET and begin Phase 1
