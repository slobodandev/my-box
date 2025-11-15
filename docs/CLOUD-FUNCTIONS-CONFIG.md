# Cloud Functions Configuration Guide

This document explains the centralized Cloud Functions configuration system.

## Overview

All Cloud Functions endpoints are now centrally managed through `src/config/cloudFunctions.ts`. This provides:

- **Type safety** - TypeScript enums for all endpoints
- **Single source of truth** - No more scattered env variables
- **Easy testing** - Switch between local/production with one env variable
- **Consistency** - Standardized headers and error handling

## Usage

### 1. Import the Configuration

```typescript
import { 
  CloudFunction,
  CloudFunctionUrls,
  getCloudFunctionUrl,
  getCloudFunctionHeaders,
  callCloudFunction 
} from '@/config/cloudFunctions';
```

### 2. Get Cloud Function URLs

```typescript
// Get specific endpoint URL
const url = CloudFunctionUrls.generateAuthLink();
// Returns: https://us-central1-my-box-53040.cloudfunctions.net/generateAuthLink

// Or use the enum
const url2 = getCloudFunctionUrl(CloudFunction.LIST_FILES);
// Returns: https://us-central1-my-box-53040.cloudfunctions.net/listFiles
```

### 3. Make API Calls

#### Option A: Using CloudFunctionUrls with fetch

```typescript
// Without authentication
const response = await fetch(CloudFunctionUrls.generateAuthLink(), {
  method: 'POST',
  headers: getCloudFunctionHeaders(),
  body: JSON.stringify({ email: 'user@example.com' }),
});

// With authentication
const response = await fetch(CloudFunctionUrls.listFiles(), {
  method: 'POST',
  headers: getCloudFunctionHeaders(true), // true = include auth token
  body: JSON.stringify({ page: 1, pageSize: 10 }),
});
```

#### Option B: Using the type-safe helper

```typescript
interface ListFilesRequest {
  page: number;
  pageSize: number;
}

interface ListFilesResponse {
  success: boolean;
  files: File[];
  total: number;
}

const response = await callCloudFunction<ListFilesRequest, ListFilesResponse>(
  CloudFunction.LIST_FILES,
  {
    method: 'POST',
    body: { page: 1, pageSize: 10 },
    requiresAuth: true,
  }
);

console.log(response.files); // Type-safe!
```

## Available Endpoints

### Authentication Functions

| Function Name | Enum Value | Description |
|--------------|------------|-------------|
| `generateAuthLink` | `CloudFunction.GENERATE_AUTH_LINK` | Generate authentication link for third-party systems |
| `validateSession` | `CloudFunction.VALIDATE_SESSION` | Validate JWT session token |
| `verifyCode` | `CloudFunction.VERIFY_CODE` | Verify 6-digit verification code |
| `sendVerificationCode` | `CloudFunction.SEND_VERIFICATION_CODE` | Send verification code to email |
| `verifyMagicLink` | `CloudFunction.VERIFY_MAGIC_LINK` | Verify magic link JWT token |

### File Operation Functions

| Function Name | Enum Value | Description |
|--------------|------------|-------------|
| `processUpload` | `CloudFunction.PROCESS_UPLOAD` | Process file upload and create metadata |
| `listFiles` | `CloudFunction.LIST_FILES` | List files with filters and pagination |
| `deleteFile` | `CloudFunction.DELETE_FILE` | Soft delete a file |
| `generateDownloadUrl` | `CloudFunction.GENERATE_DOWNLOAD_URL` | Generate signed download URL |
| `batchGenerateDownloadUrls` | `CloudFunction.BATCH_GENERATE_DOWNLOAD_URLS` | Generate multiple download URLs |

### Cleanup Functions

| Function Name | Enum Value | Description |
|--------------|------------|-------------|
| `cleanupDeletedFiles` | `CloudFunction.CLEANUP_DELETED_FILES` | Remove soft-deleted files from storage |

## Environment Variables

### Required Variables

Set these in your `.env` file:

```bash
# Cloud Functions Base URL
# Production
VITE_CLOUD_FUNCTIONS_BASE_URL=https://us-central1-my-box-53040.cloudfunctions.net

# Local Development (with emulators)
VITE_CLOUD_FUNCTIONS_BASE_URL=http://localhost:5001/my-box-53040/us-central1

# Test API Key (for development)
VITE_TEST_API_KEY=test-api-key-12345
```

### Switching Environments

**Production:**
```bash
VITE_CLOUD_FUNCTIONS_BASE_URL=https://us-central1-my-box-53040.cloudfunctions.net
```

**Local Emulators:**
```bash
VITE_CLOUD_FUNCTIONS_BASE_URL=http://localhost:5001/my-box-53040/us-central1
```

The code automatically uses the correct base URL!

## Headers Management

### Automatic Header Generation

```typescript
// Without auth - includes Content-Type and API key
const headers = getCloudFunctionHeaders();
// Result: {
//   'Content-Type': 'application/json',
//   'x-api-key': 'test-api-key-12345'
// }

// With auth - includes session token
const headers = getCloudFunctionHeaders(true);
// Result: {
//   'Content-Type': 'application/json',
//   'x-api-key': 'test-api-key-12345',
//   'Authorization': 'Bearer <session_token_from_localStorage>'
// }
```

### Custom Headers

```typescript
const customHeaders = {
  ...getCloudFunctionHeaders(true),
  'X-Custom-Header': 'custom-value',
};
```

## Migration from Old Pattern

### Before (Scattered Configuration)

```typescript
// Different files had different patterns
const CLOUD_FUNCTIONS_BASE_URL = import.meta.env.VITE_CLOUD_FUNCTIONS_BASE_URL;
const CF_GENERATE_AUTH_LINK = import.meta.env.VITE_CF_GENERATE_AUTH_LINK;
const TEST_API_KEY = import.meta.env.VITE_TEST_API_KEY;

const url = `${CLOUD_FUNCTIONS_BASE_URL}${CF_GENERATE_AUTH_LINK}`;
const headers = {
  'Content-Type': 'application/json',
  'x-api-key': TEST_API_KEY,
};
```

### After (Centralized Configuration)

```typescript
import { CloudFunctionUrls, getCloudFunctionHeaders } from '@/config/cloudFunctions';

const url = CloudFunctionUrls.generateAuthLink();
const headers = getCloudFunctionHeaders();
```

## Error Handling

The `callCloudFunction` helper includes built-in error handling:

```typescript
try {
  const response = await callCloudFunction(
    CloudFunction.LIST_FILES,
    { body: { page: 1 }, requiresAuth: true }
  );
  console.log(response);
} catch (error) {
  // Error is already formatted with meaningful message
  console.error(error.message);
  // Possible messages:
  // - "Cloud Function request failed: Unauthorized"
  // - "Failed to list files"
  // - "VITE_CLOUD_FUNCTIONS_BASE_URL is not defined in environment variables"
}
```

## Type Safety

All endpoints are fully typed:

```typescript
// Enum provides autocomplete
const endpoint: CloudFunction = CloudFunction.LIST_FILES; // ✅

// Typos are caught at compile time
const bad: CloudFunction = CloudFunction.LIST_FILE; // ❌ TypeScript error

// URLs are generated with type safety
const url = getCloudFunctionUrl(CloudFunction.LIST_FILES); // ✅
const badUrl = getCloudFunctionUrl('listFiles'); // ❌ TypeScript error
```

## Testing

### Testing with Emulators

1. Start Firebase emulators:
   ```bash
   firebase emulators:start
   ```

2. Update `.env`:
   ```bash
   VITE_CLOUD_FUNCTIONS_BASE_URL=http://localhost:5001/my-box-53040/us-central1
   ```

3. All endpoints automatically use local emulators!

### Testing in Production

1. Update `.env`:
   ```bash
   VITE_CLOUD_FUNCTIONS_BASE_URL=https://us-central1-my-box-53040.cloudfunctions.net
   ```

2. Use production API key:
   ```bash
   VITE_TEST_API_KEY=your-production-api-key
   ```

## Best Practices

### 1. Always use CloudFunctionUrls

❌ **Don't:**
```typescript
const url = 'https://us-central1-my-box-53040.cloudfunctions.net/listFiles';
```

✅ **Do:**
```typescript
const url = CloudFunctionUrls.listFiles();
```

### 2. Use getCloudFunctionHeaders

❌ **Don't:**
```typescript
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('mybox_session_token')}`,
};
```

✅ **Do:**
```typescript
const headers = getCloudFunctionHeaders(true);
```

### 3. Prefer callCloudFunction for new code

❌ **Don't:**
```typescript
const response = await fetch(url, { method: 'POST', headers, body });
const data = await response.json();
if (!response.ok) throw new Error(data.message);
```

✅ **Do:**
```typescript
const data = await callCloudFunction(CloudFunction.LIST_FILES, {
  body: { page: 1 },
  requiresAuth: true,
});
```

## Files Updated

The following files now use the centralized configuration:

- ✅ `src/pages/auth/SignIn.tsx`
- ✅ `src/contexts/AuthContext.tsx`
- ✅ `src/services/dataconnect/filesService.ts`
- ✅ `src/services/dataconnect/authService.ts`

## Adding New Endpoints

To add a new Cloud Function endpoint:

1. **Add to enum:**
   ```typescript
   export enum CloudFunction {
     // ... existing
     MY_NEW_FUNCTION = 'myNewFunction',
   }
   ```

2. **Add to CloudFunctionUrls:**
   ```typescript
   export const CloudFunctionUrls = {
     // ... existing
     myNewFunction: () => getCloudFunctionUrl(CloudFunction.MY_NEW_FUNCTION),
   } as const;
   ```

3. **Use it:**
   ```typescript
   const response = await callCloudFunction(
     CloudFunction.MY_NEW_FUNCTION,
     { body: { ... }, requiresAuth: true }
   );
   ```

That's it! No need to add new environment variables.

---

For more information, see:
- [API Testing Guide](./API-TESTING-GUIDE.md)
- [End-to-End Testing Guide](./END-TO-END-TESTING.md)
- [Firebase Emulator Management](./EMULATOR-MANAGEMENT.md)
