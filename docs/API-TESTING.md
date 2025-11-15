# API Testing Guide

This document contains sample API calls for testing n8n workflows.

---

## Authentication Workflows

### 1. Generate Magic Link

**Endpoint:** `POST /webhook-test/auth/generate-link`

**Description:** Generates a secure magic link for passwordless authentication and sends it via email.

**Request Body:**
```json
{
  "userId": "user-borrower-001",
  "email": "test@example.com",
  "loanIds": ["loan-001", "loan-002"],
  "expirationHours": 48,
  "createdBy": "admin-user-id"
}
```

**Field Descriptions:**
- `userId` (string, required) - User ID from Users table
- `email` (string, required) - User's email address (will be hashed with SHA-256)
- `loanIds` (array, optional) - Array of loan IDs user can access. Empty array for personal files only
- `expirationHours` (number, optional) - Hours until link expires (default: 48, max: 168)
- `createdBy` (string, optional) - ID of admin who generated the link (default: 'system')

#### Sample cURL Commands:

**Basic Test (Minimal Data):**
```bash
curl -X POST "http://48.223.194.241:5678/webhook-test/auth/generate-link" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-borrower-001",
    "email": "test@example.com"
  }'
```

**Full Test (All Fields):**
```bash
curl -X POST "http://48.223.194.241:5678/webhook-test/auth/generate-link" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-borrower-001",
    "email": "borrower1@example.com",
    "loanIds": ["loan-001", "loan-002"],
    "expirationHours": 48,
    "createdBy": "user-admin-001"
  }'
```

**Multiple Loans:**
```bash
curl -X POST "http://48.223.194.241:5678/webhook-test/auth/generate-link" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-borrower-001",
    "email": "jane.doe@example.com",
    "loanIds": ["loan-001", "loan-002", "loan-003"],
    "expirationHours": 72,
    "createdBy": "user-officer-001"
  }'
```

**Personal Files Only (No Loans):**
```bash
curl -X POST "http://48.223.194.241:5678/webhook-test/auth/generate-link" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-borrower-002",
    "email": "bob.johnson@example.com",
    "loanIds": [],
    "expirationHours": 24,
    "createdBy": "user-admin-001"
  }'
```

**Short Expiration (1 hour):**
```bash
curl -X POST "http://48.223.194.241:5678/webhook-test/auth/generate-link" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-borrower-001",
    "email": "test@example.com",
    "loanIds": ["loan-001"],
    "expirationHours": 1
  }'
```

#### Expected Response (Success):

```json
{
  "success": true,
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "magicLink": "https://your-domain.com/auth?token=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2",
  "recipient": "test@example.com",
  "expiresAt": "2025-11-12T21:47:25.000Z",
  "expirationHours": 48,
  "loanCount": 2,
  "message": "Magic link generated and email sent successfully",
  "createdAt": "2025-11-10T21:47:25.000Z"
}
```

#### Expected Response (Error):

**Missing Required Field:**
```json
{
  "success": false,
  "error": "userId is required",
  "errorCode": "LINK_GENERATION_FAILED",
  "sessionId": null,
  "userId": null,
  "timestamp": "2025-11-10T21:47:25.000Z"
}
```

**Invalid Email Format:**
```json
{
  "success": false,
  "error": "Invalid email format",
  "errorCode": "LINK_GENERATION_FAILED",
  "sessionId": null,
  "userId": "user-borrower-001",
  "timestamp": "2025-11-10T21:47:25.000Z"
}
```

**User Not Found:**
```json
{
  "success": false,
  "error": "User not found",
  "errorCode": "LINK_GENERATION_FAILED",
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "invalid-user",
  "timestamp": "2025-11-10T21:47:25.000Z"
}
```

**User Doesn't Have Access to Loan:**
```json
{
  "success": false,
  "error": "User does not have access to one or more specified loans",
  "errorCode": "LINK_GENERATION_FAILED",
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "user-borrower-001",
  "timestamp": "2025-11-10T21:47:25.000Z"
}
```

---

## Prerequisites for Testing

Before testing the Generate Magic Link workflow, ensure:

1. **Database Tables Exist:**
   - Run `database/schema.sql` first
   - Run `database/auth-schema.sql` second
   - Verify with the verification query

2. **Sample Data Exists:**
   - Uncomment and run sample data sections in both SQL files
   - OR create your own test users and loans

3. **n8n Workflow is Active:**
   - Open workflow in n8n: http://48.223.194.241:5678/workflow/Ksw2XDpDAmXj5UBX
   - Configure Azure SQL credential
   - Toggle "Active" switch to ON

4. **Azure SQL Firewall:**
   - Ensure n8n server IP (48.223.194.241) is whitelisted
   - Ensure "Allow Azure services" is enabled

---

## Testing Workflow

### Step 1: Create Test Data

Run this SQL in Azure Data Studio or Azure Portal Query Editor:

```sql
-- Create test users
INSERT INTO Users (UserId, Email, FirstName, LastName, Role, IsActive)
VALUES
    ('user-admin-001', 'admin@mybox.com', 'Admin', 'User', 'admin', 1),
    ('user-borrower-001', 'test@example.com', 'Test', 'User', 'borrower', 1),
    ('user-borrower-002', 'bob.johnson@example.com', 'Bob', 'Johnson', 'borrower', 1);

-- Create test loans
INSERT INTO Loans (LoanId, UserId, LoanNumber, BorrowerName, BorrowerEmail, LoanAmount, LoanType, Status)
VALUES
    ('loan-001', 'user-borrower-001', 'LN-2025-001', 'Test User', 'test@example.com', 350000.00, 'Mortgage', 'active'),
    ('loan-002', 'user-borrower-001', 'LN-2025-002', 'Test User', 'test@example.com', 50000.00, 'Personal', 'pending'),
    ('loan-003', 'user-borrower-002', 'LN-2025-003', 'Bob Johnson', 'bob.johnson@example.com', 450000.00, 'Mortgage', 'active');

-- Verify data
SELECT * FROM Users;
SELECT * FROM Loans;
```

### Step 2: Test API Call

Use one of the curl commands above. Example:

```bash
curl -X POST "http://48.223.194.241:5678/webhook-test/auth/generate-link" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-borrower-001",
    "email": "test@example.com",
    "loanIds": ["loan-001", "loan-002"],
    "expirationHours": 48
  }'
```

### Step 3: Verify Database Records

Check that session was created:

```sql
-- Check AuthSessions
SELECT
    SessionId,
    UserId,
    LoanIds,
    Status,
    ExpiresAt,
    CreatedAt,
    MagicToken
FROM AuthSessions
ORDER BY CreatedAt DESC;

-- Check Audit Log
SELECT
    EventType,
    UserId,
    Success,
    ErrorMessage,
    CreatedAt
FROM AuthAuditLog
ORDER BY CreatedAt DESC;

-- Check active sessions
SELECT * FROM vw_ActiveSessions;
```

### Step 4: Test Error Scenarios

**Test Invalid User:**
```bash
curl -X POST "http://48.223.194.241:5678/webhook-test/auth/generate-link" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "invalid-user-id",
    "email": "test@example.com"
  }'
```

**Test Invalid Email:**
```bash
curl -X POST "http://48.223.194.241:5678/webhook-test/auth/generate-link" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-borrower-001",
    "email": "not-an-email"
  }'
```

**Test Missing Required Field:**
```bash
curl -X POST "http://48.223.194.241:5678/webhook-test/auth/generate-link" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

**Test Invalid Loan Access:**
```bash
curl -X POST "http://48.223.194.241:5678/webhook-test/auth/generate-link" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-borrower-001",
    "email": "test@example.com",
    "loanIds": ["loan-003"]
  }'
```
(loan-003 belongs to user-borrower-002, not user-borrower-001)

---

## Debugging Tips

### Check n8n Execution History

1. Go to http://48.223.194.241:5678/executions
2. Find your workflow execution
3. Click to see detailed execution flow
4. Check each node for errors

### Check n8n Logs

If workflow fails silently:
1. Open workflow editor
2. Click on failed node
3. Check error message in node output

### Common Issues

**Issue: "Connection refused"**
- Solution: Workflow is not active. Toggle Active switch in n8n

**Issue: "Webhook not found"**
- Solution: Check webhook path matches exactly (case-sensitive)

**Issue: "SQL error: Invalid object name 'Users'"**
- Solution: Run `database/schema.sql` first, then `auth-schema.sql`

**Issue: "User not found"**
- Solution: Insert test users using SQL above

**Issue: "Loan not found or user doesn't have access"**
- Solution: Verify UserId in Loans table matches your test user

---

## Using Postman

If you prefer Postman over curl:

1. **Create New Request:**
   - Method: POST
   - URL: `http://48.223.194.241:5678/webhook-test/auth/generate-link`

2. **Set Headers:**
   - `Content-Type`: `application/json`

3. **Set Body (raw JSON):**
   ```json
   {
     "userId": "user-borrower-001",
     "email": "test@example.com",
     "loanIds": ["loan-001", "loan-002"],
     "expirationHours": 48
   }
   ```

4. **Send Request**

5. **Save to Collection** for reuse

---

## Next Workflows to Test

Once Generate Magic Link is working:

1. **Verify Magic Link** - Validates the magic token
2. **Send Verification Code** - Sends 6-digit email verification
3. **Verify Code and Issue Token** - Validates code and returns JWT
4. **Validate Session Token** - Validates JWT for API requests
5. **Revoke Session** - Invalidates a session

---

**Last Updated:** 2025-11-10
**Status:** Generate Magic Link workflow ready for testing
