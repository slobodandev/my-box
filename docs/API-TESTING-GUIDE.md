# API Testing Guide - Postman Examples

## Overview

This guide provides complete Postman examples for testing the MyBox Cloud Functions, with a primary focus on the `generateAuthLink` endpoint that third-party systems (like Loan Origination Systems) will use to create authentication links for borrowers.

---

## Table of Contents

1. [Setup](#setup)
2. [Authentication](#authentication)
3. [Generate Auth Link (Third-Party)](#1-generate-auth-link-third-party)
4. [Validate Session](#2-validate-session)
5. [Process Upload](#3-process-upload)
6. [List Files](#4-list-files)
7. [Delete File](#5-delete-file)
8. [Generate Download URL](#6-generate-download-url)
9. [Error Scenarios](#error-scenarios)
10. [Postman Collection](#postman-collection)

---

## Setup

### Base URL

**Local (Emulator):**
```
http://127.0.0.1:5001/my-box/us-central1
```

**Production:**
```
https://us-central1-my-box.cloudfunctions.net
```

### Required Environment Variables

Create these in Postman environment:

| Variable | Description | Example |
|----------|-------------|---------|
| `base_url` | Cloud Functions base URL | `https://us-central1-my-box.cloudfunctions.net` |
| `api_key` | API key for third-party access | `los-api-key-12345` |
| `session_token` | JWT session token (after auth) | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `test_email` | Email for testing | `borrower@example.com` |
| `user_id` | User ID (after auth) | `550e8400-e29b-41d4-a716-446655440000` |

---

## Authentication

### API Key Authentication (Third-Party Systems)

Third-party systems authenticate using an API key in the `x-api-key` header.

**Header:**
```
x-api-key: los-api-key-12345
```

### Session Token Authentication (Users)

Users authenticate using a JWT session token in the `Authorization` header.

**Header:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 1. Generate Auth Link (Third-Party)

**This is the main endpoint for third-party systems to generate authentication links for borrowers.**

### Endpoint
```
POST {{base_url}}/generateAuthLink
```

### Headers
```
Content-Type: application/json
x-api-key: {{api_key}}
```

### Request Body - Basic Example

**Minimal payload (personal files only):**
```json
{
  "email": "john.doe@example.com"
}
```

### Request Body - With Loan Context

**Recommended payload with loan information:**
```json
{
  "email": "john.doe@example.com",
  "borrowerContactId": "CONTACT-12345",
  "loanNumber": "LOAN-2024-001",
  "loanIds": [
    "550e8400-e29b-41d4-a716-446655440000",
    "6ba7b810-9dad-11d1-80b4-00c04fd430c8"
  ],
  "expirationHours": 48
}
```

### Request Body - Complete Example

**Full payload with all optional fields:**
```json
{
  "email": "jane.smith@example.com",
  "borrowerContactId": "CONTACT-67890",
  "loanNumber": "LOAN-2024-002",
  "loanIds": [
    "7c9e6679-7425-40de-944b-e07fc1f90ae7"
  ],
  "expirationHours": 72
}
```

### Field Descriptions

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `email` | string | **Yes** | Borrower's email address | `borrower@example.com` |
| `borrowerContactId` | string | No | Your system's borrower contact ID | `CONTACT-12345` |
| `loanNumber` | string | No | Human-readable loan number | `LOAN-2024-001` |
| `loanIds` | string[] | No | Array of loan UUIDs to associate | `["uuid1", "uuid2"]` |
| `expirationHours` | number | No | Hours until link expires (default: 48) | `48` |

### Response - Success

**Status Code:** `200 OK`

```json
{
  "success": true,
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "emailSent": true,
  "expiresAt": "2025-01-16T10:30:00.000Z",
  "message": "Authentication email sent to john.doe@example.com"
}
```

### Response - Error (Invalid API Key)

**Status Code:** `401 Unauthorized`

```json
{
  "success": false,
  "message": "Invalid API key"
}
```

### Response - Error (Missing Email)

**Status Code:** `400 Bad Request`

```json
{
  "success": false,
  "message": "Email is required"
}
```

### Response - Error (Invalid Email)

**Status Code:** `400 Bad Request`

```json
{
  "success": false,
  "message": "Invalid email format"
}
```

### Complete Postman Request

```javascript
// Request
POST https://us-central1-my-box.cloudfunctions.net/generateAuthLink

// Headers
x-api-key: los-api-key-12345
Content-Type: application/json

// Body (raw JSON)
{
  "email": "john.doe@example.com",
  "borrowerContactId": "CONTACT-12345",
  "loanNumber": "LOAN-2024-001",
  "loanIds": [
    "550e8400-e29b-41d4-a716-446655440000"
  ],
  "expirationHours": 48
}
```

### Postman Test Script

Add this to the "Tests" tab in Postman to automatically save the session ID:

```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has success true", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.eql(true);
});

pm.test("Response has sessionId", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.sessionId).to.exist;
    // Save session ID for later use
    pm.environment.set("session_id", jsonData.sessionId);
});

pm.test("Email was sent", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.emailSent).to.eql(true);
});

pm.test("Expiration date is in the future", function () {
    var jsonData = pm.response.json();
    var expiresAt = new Date(jsonData.expiresAt);
    var now = new Date();
    pm.expect(expiresAt.getTime()).to.be.above(now.getTime());
});
```

---

## 2. Validate Session

**Called by frontend after Firebase Email Link authentication to exchange Firebase ID token for session token.**

### Endpoint
```
POST {{base_url}}/validateSession
```

### Headers
```
Content-Type: application/json
Authorization: Bearer {{firebase_id_token}}
```

### Request Body

**Empty body (user info extracted from Firebase token):**
```json
{}
```

### Response - Success

**Status Code:** `200 OK`

```json
{
  "success": true,
  "sessionToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXNzaW9uSWQiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJ1c2VySWQiOiI3YzllNjY3OS03NDI1LTQwZGUtOTQ0Yi1lMDdmYzFmOTBhZTciLCJlbWFpbCI6ImpvaG4uZG9lQGV4YW1wbGUuY29tIiwicm9sZSI6ImJvcnJvd2VyIiwibG9hbklkcyI6WyI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiXSwidHlwZSI6InNlc3Npb24iLCJpYXQiOjE3MDUzMjM2MDAsImV4cCI6MTcwNTQxMDAwMH0.abcdef123456",
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "loanIds": ["550e8400-e29b-41d4-a716-446655440000"],
  "expiresAt": "2025-01-15T10:30:00.000Z",
  "message": "Session validated successfully"
}
```

### Postman Test Script

```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has session token", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.sessionToken).to.exist;
    // Save for use in other requests
    pm.environment.set("session_token", jsonData.sessionToken);
    pm.environment.set("user_id", jsonData.userId);
});
```

---

## 3. Process Upload

**Called by frontend after uploading file to Firebase Storage.**

### Endpoint
```
POST {{base_url}}/processUpload
```

### Headers
```
Content-Type: application/json
Authorization: Bearer {{session_token}}
```

### Request Body

**Basic file processing:**
```json
{
  "userId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "storagePath": "users/7c9e6679-7425-40de-944b-e07fc1f90ae7/loans/550e8400-e29b-41d4-a716-446655440000/abc123.pdf",
  "originalFilename": "Mortgage_Agreement_Final.pdf"
}
```

### Request Body - With Metadata

**With tags and description:**
```json
{
  "userId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "storagePath": "users/7c9e6679-7425-40de-944b-e07fc1f90ae7/personal/def456.pdf",
  "originalFilename": "Tax_Return_2024.pdf",
  "tags": ["tax", "2024", "w2"],
  "description": "2024 Tax Return W2 Form"
}
```

### Response - Success

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "File uploaded and processed successfully",
  "fileId": "abc123-def456-ghi789",
  "downloadUrl": "https://storage.googleapis.com/...",
  "loanIds": ["550e8400-e29b-41d4-a716-446655440000"]
}
```

**Note:** The `loanIds` are automatically populated from the session context!

### Postman Test Script

```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("File was processed successfully", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.eql(true);
    pm.expect(jsonData.fileId).to.exist;
    pm.environment.set("file_id", jsonData.fileId);
});

pm.test("File auto-associated with loans from session", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.loanIds).to.be.an('array');
    pm.expect(jsonData.loanIds.length).to.be.above(0);
});
```

---

## 4. List Files

**Get files for the authenticated user, filtered by session loan context.**

### Endpoint
```
POST {{base_url}}/listFiles
```

### Headers
```
Content-Type: application/json
Authorization: Bearer {{session_token}}
```

### Request Body - Basic

**Minimal request (uses session loan context):**
```json
{
  "page": 1,
  "pageSize": 20
}
```

### Request Body - With Filters

**Search and filter:**
```json
{
  "searchTerm": "mortgage",
  "personalOnly": false,
  "page": 1,
  "pageSize": 20,
  "sortBy": "uploadedAt",
  "sortOrder": "desc"
}
```

### Request Body - Specific Loan

**Files for specific loan:**
```json
{
  "loanId": "550e8400-e29b-41d4-a716-446655440000",
  "page": 1,
  "pageSize": 20
}
```

### Request Body - Personal Files Only

**Only files not associated with any loans:**
```json
{
  "personalOnly": true,
  "page": 1,
  "pageSize": 20
}
```

### Field Descriptions

| Field | Type | Required | Description | Default |
|-------|------|----------|-------------|---------|
| `loanId` | string | No | Filter by specific loan ID | Session loans |
| `searchTerm` | string | No | Search filename, tags, description | - |
| `personalOnly` | boolean | No | Only files without loan associations | `false` |
| `page` | number | No | Page number | `1` |
| `pageSize` | number | No | Results per page | `20` |
| `sortBy` | string | No | Sort field: `filename`, `size`, `uploadedAt` | `uploadedAt` |
| `sortOrder` | string | No | Sort order: `asc`, `desc` | `desc` |

### Response - Success

**Status Code:** `200 OK`

```json
{
  "success": true,
  "files": [
    {
      "id": "abc123-def456-ghi789",
      "originalFilename": "Mortgage_Agreement_Final.pdf",
      "storagePath": "users/7c9e6679-7425-40de-944b-e07fc1f90ae7/loans/550e8400-e29b-41d4-a716-446655440000/abc123.pdf",
      "fileSize": 2458624,
      "mimeType": "application/pdf",
      "fileExtension": "pdf",
      "uploadedAt": "2025-01-14T10:30:00.000Z",
      "tags": "contract,mortgage,final",
      "description": "Final mortgage agreement",
      "downloadUrl": "https://storage.googleapis.com/...",
      "loanIds": ["550e8400-e29b-41d4-a716-446655440000"]
    },
    {
      "id": "xyz789-uvw456-rst123",
      "originalFilename": "Pay_Stub_December.pdf",
      "storagePath": "users/7c9e6679-7425-40de-944b-e07fc1f90ae7/loans/550e8400-e29b-41d4-a716-446655440000/xyz789.pdf",
      "fileSize": 524288,
      "mimeType": "application/pdf",
      "fileExtension": "pdf",
      "uploadedAt": "2025-01-13T15:45:00.000Z",
      "tags": "income,paystub",
      "description": null,
      "downloadUrl": "https://storage.googleapis.com/...",
      "loanIds": ["550e8400-e29b-41d4-a716-446655440000"]
    }
  ],
  "total": 15,
  "page": 1,
  "pageSize": 20,
  "totalPages": 1
}
```

### Postman Test Script

```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has files array", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.files).to.be.an('array');
});

pm.test("Files have required fields", function () {
    var jsonData = pm.response.json();
    if (jsonData.files.length > 0) {
        var file = jsonData.files[0];
        pm.expect(file.id).to.exist;
        pm.expect(file.originalFilename).to.exist;
        pm.expect(file.fileSize).to.be.a('number');
        pm.expect(file.loanIds).to.be.an('array');
    }
});

pm.test("Pagination info is correct", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.total).to.be.a('number');
    pm.expect(jsonData.page).to.be.a('number');
    pm.expect(jsonData.totalPages).to.be.a('number');
});
```

---

## 5. Delete File

**Soft delete a file (marks as deleted, doesn't remove from storage immediately).**

### Endpoint
```
POST {{base_url}}/deleteFile
```

### Headers
```
Content-Type: application/json
Authorization: Bearer {{session_token}}
```

### Request Body

**Simple delete:**
```json
{
  "fileId": "abc123-def456-ghi789"
}
```

### Response - Success

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "File \"Mortgage_Agreement_Final.pdf\" deleted successfully",
  "fileId": "abc123-def456-ghi789"
}
```

### Response - Error (Not Found)

**Status Code:** `404 Not Found`

```json
{
  "success": false,
  "message": "File not found"
}
```

### Response - Error (Already Deleted)

**Status Code:** `400 Bad Request`

```json
{
  "success": false,
  "message": "File already deleted"
}
```

### Response - Error (Not Owner)

**Status Code:** `403 Forbidden`

```json
{
  "success": false,
  "message": "Unauthorized: You do not own this file"
}
```

### Postman Test Script

```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("File deleted successfully", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.eql(true);
    pm.expect(jsonData.fileId).to.exist;
});
```

---

## 6. Generate Download URL

**Generate a time-limited signed URL for downloading a file.**

### Endpoint
```
POST {{base_url}}/generateDownloadURL
```

### Headers
```
Content-Type: application/json
Authorization: Bearer {{session_token}}
```

### Request Body - Default Expiry

**1 hour expiry (default):**
```json
{
  "fileId": "abc123-def456-ghi789"
}
```

### Request Body - Custom Expiry

**Custom expiration:**
```json
{
  "fileId": "abc123-def456-ghi789",
  "expiryMinutes": 120
}
```

### Response - Success

**Status Code:** `200 OK`

```json
{
  "success": true,
  "downloadUrl": "https://storage.googleapis.com/my-box.appspot.com/users/7c9e6679-7425-40de-944b-e07fc1f90ae7/loans/550e8400-e29b-41d4-a716-446655440000/abc123.pdf?GoogleAccessId=...&Expires=1705410000&Signature=...",
  "expiresAt": "2025-01-14T12:30:00.000Z",
  "message": "Download URL generated successfully"
}
```

### Postman Test Script

```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Download URL generated", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.downloadUrl).to.exist;
    pm.expect(jsonData.downloadUrl).to.include('https://');
});
```

---

## Error Scenarios

### 1. Missing API Key

**Request:**
```
POST {{base_url}}/generateAuthLink
```

**Headers:**
```
Content-Type: application/json
```

**Response:** `401 Unauthorized`
```json
{
  "success": false,
  "message": "Invalid API key"
}
```

### 2. Invalid Session Token

**Request:**
```
POST {{base_url}}/listFiles
```

**Headers:**
```
Authorization: Bearer invalid-token-12345
```

**Response:** `401 Unauthorized`
```json
{
  "success": false,
  "message": "Invalid session token"
}
```

### 3. Missing Required Fields

**Request:**
```json
{
  "email": ""
}
```

**Response:** `400 Bad Request`
```json
{
  "success": false,
  "message": "Email is required"
}
```

### 4. Expired Session

**Request:**
```
POST {{base_url}}/listFiles
```

**Response:** `401 Unauthorized`
```json
{
  "success": false,
  "message": "Session has expired"
}
```

---

## Postman Collection

### Import This Collection

Save the following as `MyBox_API.postman_collection.json`:

```json
{
  "info": {
    "name": "MyBox Cloud Functions",
    "description": "API collection for testing MyBox Cloud Functions",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "1. Generate Auth Link (Third-Party)",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "x-api-key",
            "value": "{{api_key}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"{{test_email}}\",\n  \"borrowerContactId\": \"CONTACT-12345\",\n  \"loanNumber\": \"LOAN-2024-001\",\n  \"loanIds\": [\n    \"550e8400-e29b-41d4-a716-446655440000\"\n  ],\n  \"expirationHours\": 48\n}"
        },
        "url": {
          "raw": "{{base_url}}/generateAuthLink",
          "host": ["{{base_url}}"],
          "path": ["generateAuthLink"]
        }
      }
    },
    {
      "name": "2. Validate Session",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "Authorization",
            "value": "Bearer {{firebase_id_token}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{}"
        },
        "url": {
          "raw": "{{base_url}}/validateSession",
          "host": ["{{base_url}}"],
          "path": ["validateSession"]
        }
      }
    },
    {
      "name": "3. List Files",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "Authorization",
            "value": "Bearer {{session_token}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"page\": 1,\n  \"pageSize\": 20,\n  \"sortBy\": \"uploadedAt\",\n  \"sortOrder\": \"desc\"\n}"
        },
        "url": {
          "raw": "{{base_url}}/listFiles",
          "host": ["{{base_url}}"],
          "path": ["listFiles"]
        }
      }
    },
    {
      "name": "4. Process Upload",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "Authorization",
            "value": "Bearer {{session_token}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"userId\": \"{{user_id}}\",\n  \"storagePath\": \"users/{{user_id}}/personal/test-file.pdf\",\n  \"originalFilename\": \"Test_Document.pdf\",\n  \"tags\": [\"test\", \"document\"],\n  \"description\": \"Test file upload\"\n}"
        },
        "url": {
          "raw": "{{base_url}}/processUpload",
          "host": ["{{base_url}}"],
          "path": ["processUpload"]
        }
      }
    },
    {
      "name": "5. Delete File",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "Authorization",
            "value": "Bearer {{session_token}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"fileId\": \"{{file_id}}\"\n}"
        },
        "url": {
          "raw": "{{base_url}}/deleteFile",
          "host": ["{{base_url}}"],
          "path": ["deleteFile"]
        }
      }
    },
    {
      "name": "6. Generate Download URL",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "Authorization",
            "value": "Bearer {{session_token}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"fileId\": \"{{file_id}}\",\n  \"expiryMinutes\": 60\n}"
        },
        "url": {
          "raw": "{{base_url}}/generateDownloadURL",
          "host": ["{{base_url}}"],
          "path": ["generateDownloadURL"]
        }
      }
    }
  ]
}
```

### Import Environment

Save as `MyBox_Environment.postman_environment.json`:

```json
{
  "name": "MyBox - Production",
  "values": [
    {
      "key": "base_url",
      "value": "https://us-central1-my-box.cloudfunctions.net",
      "enabled": true
    },
    {
      "key": "api_key",
      "value": "your-api-key-here",
      "enabled": true
    },
    {
      "key": "test_email",
      "value": "test@example.com",
      "enabled": true
    },
    {
      "key": "session_token",
      "value": "",
      "enabled": true
    },
    {
      "key": "firebase_id_token",
      "value": "",
      "enabled": true
    },
    {
      "key": "user_id",
      "value": "",
      "enabled": true
    },
    {
      "key": "file_id",
      "value": "",
      "enabled": true
    },
    {
      "key": "session_id",
      "value": "",
      "enabled": true
    }
  ]
}
```

---

## Complete End-to-End Test Flow

### Step 1: Third-Party System Generates Auth Link

**Postman Request:**
```
POST https://us-central1-my-box.cloudfunctions.net/generateAuthLink

Headers:
  x-api-key: los-api-key-12345
  Content-Type: application/json

Body:
{
  "email": "john.doe@example.com",
  "borrowerContactId": "CONTACT-12345",
  "loanNumber": "LOAN-2024-001",
  "loanIds": ["550e8400-e29b-41d4-a716-446655440000"],
  "expirationHours": 48
}
```

**Expected Result:**
- ✅ Status 200
- ✅ Email sent to user
- ✅ Session created with loan context

### Step 2: User Clicks Email Link

**Manual Step:**
1. Check email inbox for `john.doe@example.com`
2. Click the Firebase Email Link
3. Browser redirects to `/auth/verify?apiKey=...&oobCode=...`

### Step 3: Frontend Completes Sign-In

**Happens automatically in frontend:**
1. `completeEmailLinkSignIn()` called
2. Firebase signs in user
3. Gets Firebase ID token
4. Calls `validateSession` to exchange for session token

**You can test Step 3 manually with:**
```
POST https://us-central1-my-box.cloudfunctions.net/validateSession

Headers:
  Authorization: Bearer <firebase-id-token-from-browser-console>
  Content-Type: application/json

Body:
{}
```

**Expected Result:**
- ✅ Status 200
- ✅ Session token returned
- ✅ Loan IDs in session match original request

### Step 4: User Uploads File

**Happens in two parts:**

**Part A - Upload to Firebase Storage (Frontend):**
```javascript
// This happens in browser
const storageRef = ref(storage, `users/${userId}/personal/${fileId}.pdf`);
await uploadBytesResumable(storageRef, file);
```

**Part B - Process Upload (Postman Test):**
```
POST https://us-central1-my-box.cloudfunctions.net/processUpload

Headers:
  Authorization: Bearer <session-token-from-step-3>
  Content-Type: application/json

Body:
{
  "userId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "storagePath": "users/7c9e6679-7425-40de-944b-e07fc1f90ae7/personal/abc123.pdf",
  "originalFilename": "Tax_Return_2024.pdf"
}
```

**Expected Result:**
- ✅ Status 200
- ✅ File record created
- ✅ **File auto-associated with loan from session!**
- ✅ Download URL generated

### Step 5: User Lists Files

**Postman Request:**
```
POST https://us-central1-my-box.cloudfunctions.net/listFiles

Headers:
  Authorization: Bearer <session-token-from-step-3>
  Content-Type: application/json

Body:
{
  "page": 1,
  "pageSize": 20
}
```

**Expected Result:**
- ✅ Status 200
- ✅ Only files for user's session loans returned
- ✅ Uploaded file appears in list
- ✅ File shows loan association

### Step 6: User Deletes File

**Postman Request:**
```
POST https://us-central1-my-box.cloudfunctions.net/deleteFile

Headers:
  Authorization: Bearer <session-token-from-step-3>
  Content-Type: application/json

Body:
{
  "fileId": "abc123-def456-ghi789"
}
```

**Expected Result:**
- ✅ Status 200
- ✅ File soft deleted
- ✅ No longer appears in list

---

## Quick Test Checklist

### ✅ Pre-Deployment Tests (Local Emulator)

- [ ] Start Firebase emulators: `firebase emulators:start`
- [ ] Set base_url to `http://127.0.0.1:5001/my-box/us-central1`
- [ ] Test generateAuthLink with valid API key
- [ ] Test generateAuthLink with invalid API key (should fail)
- [ ] Test generateAuthLink with missing email (should fail)
- [ ] Verify email is sent (check emulator logs)
- [ ] Test listFiles with session token
- [ ] Test deleteFile with valid file ID

### ✅ Post-Deployment Tests (Production)

- [ ] Set base_url to production URL
- [ ] Add valid API key to environment
- [ ] Run complete end-to-end flow (Steps 1-6 above)
- [ ] Verify loan auto-association works
- [ ] Test error scenarios
- [ ] Test with multiple loans in session
- [ ] Test personal files (no loans)

---

## Troubleshooting

### Issue: "Invalid API key"

**Solution:**
1. Check API key is in Cloud Functions config
2. Verify `x-api-key` header is included
3. Ensure no spaces in API key value

### Issue: "Session has expired"

**Solution:**
1. Generate new auth link
2. Complete email link sign-in again
3. Get fresh session token

### Issue: "File not found in storage"

**Solution:**
1. Verify file was uploaded to Firebase Storage first
2. Check storage path matches exactly
3. Ensure file upload completed successfully

### Issue: "Files not auto-associating with loans"

**Solution:**
1. Verify session has loanIds
2. Check session token is valid
3. Ensure loanIds were in original generateAuthLink request

---

## Support

For issues or questions:
- Check Firebase Console logs
- Review Cloud Function error logs
- Verify environment variables are set correctly

**Last Updated:** 2025-01-14
