# Cloud Function Hooks Guide

Comprehensive guide for using the `useCloudFunction` hook system for making API requests.

## Overview

The `useCloudFunction` hook provides a clean, type-safe way to interact with Cloud Functions. It handles:

- ✅ **State management** - data, loading, error states
- ✅ **Type safety** - Full TypeScript support with generics
- ✅ **Auto-execution** - Optional automatic execution on mount
- ✅ **Refetching** - Easy data refresh
- ✅ **Callbacks** - Success/error handlers
- ✅ **Mutations** - Optimistic updates support

## Architecture

```
useCloudFunction (base hook)
├── useCloudFunctionMutation (for POST/PUT/DELETE)
├── useCloudFunctionQuery (for GET requests)
└── Specialized hooks
    ├── useAuth.ts - Authentication operations
    └── useFiles.ts - File management operations
```

## Basic Usage

### Import the Hook

```typescript
import { useCloudFunction } from '@/hooks/useCloudFunction';
import { CloudFunction } from '@/config/cloudFunctions';
```

### Simple Example

```typescript
function MyComponent() {
  const { data, loading, error, execute } = useCloudFunction<ResponseType, RequestType>(
    CloudFunction.GENERATE_AUTH_LINK,
    {
      onSuccess: (data) => console.log('Success!', data),
      onError: (error) => console.error('Error:', error),
    }
  );

  const handleSubmit = async () => {
    await execute({ email: 'user@example.com' });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <button onClick={handleSubmit}>Generate Link</button>
      {data && <div>Success: {data.message}</div>}
    </div>
  );
}
```

## Hook Options

### All Available Options

```typescript
interface UseCloudFunctionOptions<TRequest = any> {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  requiresAuth?: boolean;        // Include Authorization header
  autoExecute?: boolean;         // Execute on mount
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  initialData?: any;             // Initial data value
  enabled?: boolean;             // Enable/disable the hook
}
```

### Common Option Patterns

#### Pattern 1: Manual Trigger (Mutations)

```typescript
const { execute, loading } = useCloudFunction(
  CloudFunction.DELETE_FILE,
  {
    method: 'POST',
    requiresAuth: true,
    onSuccess: () => {
      toast.success('Deleted!');
      refetchFiles();
    },
  }
);

// Trigger manually
await execute({ fileId: '123' });
```

#### Pattern 2: Auto-Execute (Queries)

```typescript
const { data, loading, refetch } = useCloudFunction(
  CloudFunction.LIST_FILES,
  {
    method: 'GET',
    requiresAuth: true,
    autoExecute: true, // Runs on mount
  }
);

// Refetch when needed
await refetch();
```

#### Pattern 3: Conditional Execution

```typescript
const { execute, loading } = useCloudFunction(
  CloudFunction.LIST_FILES,
  {
    enabled: !!userId, // Only enable when userId exists
    autoExecute: true,
  }
);
```

## Return Values

### State Properties

```typescript
const {
  data,       // Response data (TData | null)
  loading,    // Request in progress (boolean)
  error,      // Error object (Error | null)
  isSuccess,  // Request succeeded (boolean)
  isError,    // Request failed (boolean)
  isIdle,     // No request made yet (boolean)
  execute,    // Function to trigger request
  refetch,    // Re-run last request
  reset,      // Reset to initial state
  mutate,     // Manually update data
} = useCloudFunction(...);
```

### Methods

#### `execute(payload?, config?)`

Trigger the Cloud Function request.

```typescript
// Simple execution
await execute({ email: 'user@example.com' });

// With custom axios config
await execute(
  { email: 'user@example.com' },
  { timeout: 5000, headers: { 'X-Custom': 'value' } }
);
```

#### `refetch()`

Re-run the last request with the same payload.

```typescript
const { refetch } = useCloudFunction(...);

// Later...
await refetch(); // Uses last payload
```

#### `reset()`

Reset hook to initial state.

```typescript
const { reset } = useCloudFunction(...);

reset(); // Clears data, error, loading states
```

#### `mutate(newData)`

Manually update data (optimistic updates).

```typescript
const { data, mutate } = useCloudFunction(...);

// Optimistically update before API call
mutate({ ...data, status: 'updated' });
```

## Specialized Hooks

### Authentication Hooks

Located in `src/hooks/useAuth.ts`:

#### useGenerateAuthLink

```typescript
import { useGenerateAuthLink } from '@/hooks/useAuth';

function SignInPage() {
  const { execute, loading, error, data } = useGenerateAuthLink({
    onSuccess: (data) => {
      console.log('Auth link sent!', data.sessionId);
      navigate('/email-sent');
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleSubmit = async (email: string) => {
    await execute({
      email,
      loanNumber: 'LOAN-123',
      borrowerContactId: 'CONTACT-456',
    });
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(email); }}>
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <button disabled={loading}>
        {loading ? 'Sending...' : 'Send Link'}
      </button>
      {error && <p>{error.message}</p>}
    </form>
  );
}
```

#### useValidateSession

```typescript
import { useValidateSession } from '@/hooks/useAuth';

function App() {
  const { execute, data, loading } = useValidateSession({
    onSuccess: (data) => {
      if (data.valid) {
        setUser(data.user);
      }
    },
  });

  useEffect(() => {
    const token = localStorage.getItem('session_token');
    if (token) {
      execute();
    }
  }, []);

  if (loading) return <div>Validating session...</div>;
  return <div>Welcome {data?.user?.email}</div>;
}
```

### File Operation Hooks

Located in `src/hooks/useFiles.ts`:

#### useListFiles

```typescript
import { useListFiles } from '@/hooks/useFiles';

function FileList() {
  const { data, loading, error, refetch, execute } = useListFiles(
    { page: 1, pageSize: 10 }, // Initial payload
    {
      autoExecute: true, // Fetch on mount
      onError: (error) => toast.error(error.message),
    }
  );

  const handleSearch = async (searchTerm: string) => {
    await execute({ searchTerm, page: 1 });
  };

  if (loading) return <div>Loading files...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <input onChange={(e) => handleSearch(e.target.value)} />
      <button onClick={refetch}>Refresh</button>
      {data?.files.map(file => (
        <div key={file.id}>{file.originalFilename}</div>
      ))}
    </div>
  );
}
```

#### useDeleteFile

```typescript
import { useDeleteFile } from '@/hooks/useFiles';

function FileActions({ fileId, onDelete }: Props) {
  const { execute, loading } = useDeleteFile({
    onSuccess: () => {
      toast.success('File deleted');
      onDelete(); // Callback to parent
    },
  });

  return (
    <button
      onClick={() => execute({ fileId })}
      disabled={loading}
    >
      {loading ? 'Deleting...' : 'Delete'}
    </button>
  );
}
```

#### useProcessUpload

```typescript
import { useProcessUpload } from '@/hooks/useFiles';

function FileUploader() {
  const { execute, loading, data } = useProcessUpload({
    onSuccess: (data) => {
      console.log('Uploaded:', data.fileId);
      refetchFiles();
    },
  });

  const handleUpload = async (file: File) => {
    // First upload to Firebase Storage
    const storagePath = await uploadToStorage(file);
    
    // Then process with Cloud Function
    await execute({
      userId: currentUser.id,
      storagePath,
      originalFilename: file.name,
      tags: ['document'],
    });
  };

  return (
    <div>
      <input
        type="file"
        onChange={(e) => handleUpload(e.target.files[0])}
        disabled={loading}
      />
      {loading && <div>Processing upload...</div>}
      {data && <div>Success! File ID: {data.fileId}</div>}
    </div>
  );
}
```

## Advanced Patterns

### Pattern 1: Sequential Requests

```typescript
function MultiStepProcess() {
  const step1 = useCloudFunction(CloudFunction.GENERATE_AUTH_LINK);
  const step2 = useCloudFunction(CloudFunction.VERIFY_CODE);

  const handleProcess = async () => {
    const result1 = await step1.execute({ email: 'user@example.com' });
    const result2 = await step2.execute({ sessionId: result1.sessionId, code: '123456' });
    console.log('Complete!', result2);
  };

  return <button onClick={handleProcess}>Start Process</button>;
}
```

### Pattern 2: Dependent Queries

```typescript
function UserDashboard({ userId }: Props) {
  const { data: userData } = useCloudFunction(
    CloudFunction.GET_USER,
    { autoExecute: true, enabled: !!userId }
  );

  const { data: filesData } = useListFiles(
    { userId },
    { autoExecute: true, enabled: !!userData } // Wait for user data
  );

  return <div>...</div>;
}
```

### Pattern 3: Polling

```typescript
function LiveStatus() {
  const { data, refetch } = useCloudFunction(
    CloudFunction.GET_STATUS,
    { autoExecute: true }
  );

  useEffect(() => {
    const interval = setInterval(() => {
      refetch(); // Poll every 5 seconds
    }, 5000);

    return () => clearInterval(interval);
  }, [refetch]);

  return <div>Status: {data?.status}</div>;
}
```

### Pattern 4: Optimistic Updates

```typescript
function LikeButton({ postId }: Props) {
  const { data, mutate, execute } = useCloudFunction(
    CloudFunction.LIKE_POST
  );

  const handleLike = async () => {
    // Optimistic update
    mutate({ likes: (data?.likes || 0) + 1 });

    try {
      // Actual API call
      await execute({ postId });
    } catch (error) {
      // Rollback on error
      mutate({ likes: (data?.likes || 0) - 1 });
    }
  };

  return <button onClick={handleLike}>Likes: {data?.likes || 0}</button>;
}
```

### Pattern 5: Parallel Requests

```typescript
function Dashboard() {
  const files = useListFiles({}, { autoExecute: true });
  const stats = useCloudFunction(CloudFunction.GET_STATS, { autoExecute: true });
  const user = useCloudFunction(CloudFunction.GET_USER, { autoExecute: true });

  const loading = files.loading || stats.loading || user.loading;

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div>
      <h1>Welcome {user.data?.name}</h1>
      <div>Total Files: {stats.data?.fileCount}</div>
      <FileList files={files.data?.files} />
    </div>
  );
}
```

## Error Handling

### Global Error Handler

```typescript
const { execute, error, isError } = useCloudFunction(
  CloudFunction.DELETE_FILE,
  {
    onError: (error) => {
      // Global error handling
      if (error.message.includes('Unauthorized')) {
        logout();
        navigate('/login');
      } else {
        toast.error(error.message);
      }
    },
  }
);
```

### Try-Catch Pattern

```typescript
const { execute } = useCloudFunction(CloudFunction.UPLOAD_FILE);

const handleUpload = async (file: File) => {
  try {
    await execute({ file });
    toast.success('Uploaded!');
  } catch (error) {
    if (error.message.includes('size')) {
      toast.error('File too large');
    } else {
      toast.error('Upload failed');
    }
  }
};
```

### Conditional Error Display

```typescript
const { error, isError, data } = useCloudFunction(...);

return (
  <div>
    {isError && <Alert severity="error">{error.message}</Alert>}
    {data && <SuccessMessage data={data} />}
  </div>
);
```

## Testing

### Mock the Hook

```typescript
// In tests
jest.mock('@/hooks/useCloudFunction', () => ({
  useCloudFunction: jest.fn(() => ({
    data: { success: true },
    loading: false,
    error: null,
    execute: jest.fn(),
  })),
}));
```

### Test Component Behavior

```typescript
test('calls execute on button click', async () => {
  const execute = jest.fn();
  (useCloudFunction as jest.Mock).mockReturnValue({
    execute,
    loading: false,
  });

  render(<MyComponent />);
  fireEvent.click(screen.getByText('Submit'));

  expect(execute).toHaveBeenCalledWith({ email: 'test@example.com' });
});
```

## Best Practices

### 1. Use Specialized Hooks

✅ **Do:**
```typescript
import { useGenerateAuthLink } from '@/hooks/useAuth';
const { execute } = useGenerateAuthLink();
```

❌ **Don't:**
```typescript
const { execute } = useCloudFunction(CloudFunction.GENERATE_AUTH_LINK);
```

### 2. Handle Loading States

✅ **Do:**
```typescript
<button disabled={loading}>
  {loading ? 'Processing...' : 'Submit'}
</button>
```

❌ **Don't:**
```typescript
<button>Submit</button> // No loading feedback
```

### 3. Always Handle Errors

✅ **Do:**
```typescript
const { error } = useCloudFunction(..., {
  onError: (error) => toast.error(error.message)
});
```

❌ **Don't:**
```typescript
const { error } = useCloudFunction(...); // No error handling
```

### 4. Clean Up on Unmount

```typescript
useEffect(() => {
  return () => {
    reset(); // Clean up state on unmount
  };
}, [reset]);
```

## Migration Guide

### Before (Direct API Calls)

```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
const [data, setData] = useState(null);

const handleSubmit = async () => {
  setLoading(true);
  setError(null);
  try {
    const response = await fetch(url, { method: 'POST', body: JSON.stringify(payload) });
    const data = await response.json();
    setData(data);
  } catch (err) {
    setError(err);
  } finally {
    setLoading(false);
  }
};
```

### After (useCloudFunction)

```typescript
const { execute, loading, error, data } = useCloudFunction(
  CloudFunction.MY_FUNCTION
);

const handleSubmit = async () => {
  await execute(payload);
};
```

## Performance Tips

1. **Use `enabled` to prevent unnecessary requests**
   ```typescript
   const { data } = useCloudFunction(..., { enabled: !!userId });
   ```

2. **Debounce search inputs**
   ```typescript
   const debouncedSearch = useMemo(() => debounce(execute, 300), [execute]);
   ```

3. **Use `initialData` to avoid loading states**
   ```typescript
   const { data } = useCloudFunction(..., { initialData: cachedData });
   ```

---

For more information, see:
- [Cloud Functions Config Guide](./CLOUD-FUNCTIONS-CONFIG.md)
- [API Testing Guide](./API-TESTING-GUIDE.md)
- [End-to-End Testing](./END-TO-END-TESTING.md)
