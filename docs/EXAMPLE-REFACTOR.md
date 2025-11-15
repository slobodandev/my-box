# Example: Refactoring with useCloudFunction

This document shows how to refactor existing components to use the `useCloudFunction` hook system.

## Before: SignIn.tsx (Old Pattern)

```typescript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CloudFunctionUrls, getCloudFunctionHeaders } from '@/config/cloudFunctions';

export const SignIn: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(CloudFunctionUrls.generateAuthLink(), {
        method: 'POST',
        headers: getCloudFunctionHeaders(),
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          loanNumber: 'LOAN-TEST-001',
          borrowerContactId: 'CONTACT-TEST-001',
          expirationHours: 48,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to generate auth link');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to generate auth link');
      }

      console.log('Auth link generated successfully:', data);
      navigate('/auth/email-sent', { state: { email } });
    } catch (err: any) {
      console.error('Error generating auth link:', err);
      setError(err.message || 'Failed to send sign-in link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={isLoading}
      />
      
      {error && <div className="error">{error}</div>}
      
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Sending...' : 'Send Sign-In Link'}
      </button>
    </form>
  );
};
```

## After: SignIn.tsx (Using useGenerateAuthLink)

```typescript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGenerateAuthLink } from '@/hooks/useAuth';

export const SignIn: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loanNumber, setLoanNumber] = useState('LOAN-TEST-001');
  const [borrowerContactId, setBorrowerContactId] = useState('CONTACT-TEST-001');
  const navigate = useNavigate();

  // 🎉 All state management handled by the hook!
  const { execute, loading, error, isSuccess } = useGenerateAuthLink({
    onSuccess: (data) => {
      console.log('Auth link generated successfully:', data);
      navigate('/auth/email-sent', { state: { email } });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      return; // Validation handled elsewhere or in the form
    }

    // ✨ Simple, clean execution
    await execute({
      email: email.toLowerCase().trim(),
      loanNumber,
      borrowerContactId,
      expirationHours: 48,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
        required
      />
      
      {/* Error handling is automatic */}
      {error && <div className="error">{error.message}</div>}
      
      {/* Loading state is automatic */}
      <button type="submit" disabled={loading}>
        {loading ? 'Sending...' : 'Send Sign-In Link'}
      </button>

      {/* Success state is available */}
      {isSuccess && <div className="success">Link sent! Check your email.</div>}
    </form>
  );
};
```

**Benefits:**
- ✅ Removed 20+ lines of boilerplate code
- ✅ Automatic state management (loading, error, success)
- ✅ Type-safe API calls
- ✅ Clean separation of concerns
- ✅ Easier to test
- ✅ Success callback for navigation
- ✅ No manual fetch/response handling

---

## Before: FileList.tsx (Old Pattern)

```typescript
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CloudFunctionUrls } from '@/config/cloudFunctions';

export const FileList: React.FC = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(1);

  const fetchFiles = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const sessionToken = localStorage.getItem('mybox_session_token');
      const response = await axios.post(
        CloudFunctionUrls.listFiles(),
        { page, pageSize: 10 },
        {
          headers: {
            Authorization: `Bearer ${sessionToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      setFiles(response.data.files);
    } catch (err: any) {
      setError(err);
      console.error('Error fetching files:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [page]);

  const handleSearch = async (searchTerm: string) => {
    setLoading(true);
    try {
      const sessionToken = localStorage.getItem('mybox_session_token');
      const response = await axios.post(
        CloudFunctionUrls.listFiles(),
        { searchTerm, page: 1 },
        {
          headers: {
            Authorization: `Bearer ${sessionToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setFiles(response.data.files);
      setPage(1);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <input onChange={(e) => handleSearch(e.target.value)} />
      {files.map(file => (
        <div key={file.id}>{file.originalFilename}</div>
      ))}
    </div>
  );
};
```

## After: FileList.tsx (Using useListFiles)

```typescript
import React, { useState } from 'react';
import { useListFiles } from '@/hooks/useFiles';

export const FileList: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  // 🎉 Auto-fetches on mount, auto-refetches when page changes
  const { data, loading, error, execute, refetch } = useListFiles(
    { page, pageSize: 10 },
    {
      autoExecute: true,
      onError: (error) => {
        console.error('Error fetching files:', error);
        toast.error(error.message);
      },
    }
  );

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    // ✨ Simple execution with new parameters
    await execute({ searchTerm: term, page: 1, pageSize: 10 });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    execute({ searchTerm, page: newPage, pageSize: 10 });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <input
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
      />
      <button onClick={refetch}>Refresh</button>

      {data?.files.map(file => (
        <div key={file.id}>{file.originalFilename}</div>
      ))}

      <Pagination
        current={page}
        total={data?.total}
        onChange={handlePageChange}
      />
    </div>
  );
};
```

**Benefits:**
- ✅ Removed 40+ lines of boilerplate
- ✅ Auto-fetching on mount
- ✅ No manual useEffect needed
- ✅ Built-in refetch capability
- ✅ Automatic auth header management
- ✅ Clean error handling
- ✅ Type-safe data access

---

## Before: FileUpload.tsx (Old Pattern)

```typescript
import React, { useState } from 'react';
import { ref, uploadBytesResumable } from 'firebase/storage';
import { storage } from '@/config/firebase';
import axios from 'axios';

export const FileUpload: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Upload to Firebase Storage
      const fileId = crypto.randomUUID();
      const storagePath = `users/${userId}/files/${fileId}`;
      const storageRef = ref(storage, storagePath);
      const uploadTask = uploadBytesResumable(storageRef, file);

      await new Promise<void>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
          },
          reject,
          resolve
        );
      });

      // Process upload via Cloud Function
      const sessionToken = localStorage.getItem('mybox_session_token');
      const response = await axios.post(
        CloudFunctionUrls.processUpload(),
        {
          userId,
          storagePath,
          originalFilename: file.name,
          tags: ['document'],
        },
        {
          headers: {
            Authorization: `Bearer ${sessionToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('File uploaded:', response.data.fileId);
      onUploadComplete(response.data.fileId);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        onChange={(e) => handleUpload(e.target.files[0])}
        disabled={uploading}
      />
      {uploading && <div>Progress: {uploadProgress}%</div>}
      {error && <div>{error}</div>}
    </div>
  );
};
```

## After: FileUpload.tsx (Using useProcessUpload)

```typescript
import React, { useState } from 'react';
import { ref, uploadBytesResumable } from 'firebase/storage';
import { storage } from '@/config/firebase';
import { useProcessUpload } from '@/hooks/useFiles';

export const FileUpload: React.FC = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // 🎉 Hook handles the Cloud Function call
  const { execute, loading, error, data } = useProcessUpload({
    onSuccess: (data) => {
      console.log('File uploaded:', data.fileId);
      toast.success('File uploaded successfully!');
      onUploadComplete(data.fileId);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleUpload = async (file: File) => {
    setUploadProgress(0);

    try {
      // Upload to Firebase Storage (unchanged)
      const fileId = crypto.randomUUID();
      const storagePath = `users/${userId}/files/${fileId}`;
      const storageRef = ref(storage, storagePath);
      const uploadTask = uploadBytesResumable(storageRef, file);

      await new Promise<void>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
          },
          reject,
          resolve
        );
      });

      // ✨ Process upload with Cloud Function - clean and simple
      await execute({
        userId,
        storagePath,
        originalFilename: file.name,
        tags: ['document'],
      });
    } catch (err: any) {
      // Error already handled by hook's onError
      console.error('Upload error:', err);
    }
  };

  return (
    <div>
      <input
        type="file"
        onChange={(e) => handleUpload(e.target.files[0])}
        disabled={loading}
      />
      
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div>Uploading to storage: {uploadProgress}%</div>
      )}
      
      {loading && <div>Processing upload...</div>}
      
      {error && <div className="error">{error.message}</div>}
      
      {data && <div className="success">File ID: {data.fileId}</div>}
    </div>
  );
};
```

**Benefits:**
- ✅ Cleaner separation between storage upload and Cloud Function call
- ✅ Automatic error handling with callbacks
- ✅ Success callbacks for UI updates
- ✅ No manual state management for the API call
- ✅ Built-in loading and error states
- ✅ Type-safe execution

---

## Migration Checklist

When refactoring to use hooks:

- [ ] Identify the Cloud Function being called
- [ ] Replace manual fetch/axios with specialized hook
- [ ] Remove manual state declarations (loading, error, data)
- [ ] Move success logic to `onSuccess` callback
- [ ] Move error handling to `onError` callback
- [ ] Remove try/catch blocks (handled by hook)
- [ ] Replace manual URL concatenation with CloudFunctionUrls
- [ ] Remove manual header management
- [ ] Update TypeScript types to use hook generics
- [ ] Test the refactored component

---

## Common Patterns Comparison

### Pattern: Data Fetching on Mount

**Before:**
```typescript
useEffect(() => {
  fetchData();
}, []);
```

**After:**
```typescript
const { data } = useCloudFunction(..., { autoExecute: true });
```

### Pattern: Manual Refetch

**Before:**
```typescript
const fetchData = async () => { /* ... */ };
<button onClick={fetchData}>Refresh</button>
```

**After:**
```typescript
const { refetch } = useCloudFunction(...);
<button onClick={refetch}>Refresh</button>
```

### Pattern: Form Submission

**Before:**
```typescript
const handleSubmit = async () => {
  setLoading(true);
  try {
    await fetch(...);
    onSuccess();
  } catch (err) {
    setError(err);
  } finally {
    setLoading(false);
  }
};
```

**After:**
```typescript
const { execute } = useCloudFunction(..., {
  onSuccess: () => onSuccess()
});
const handleSubmit = () => execute(payload);
```

---

See [HOOKS-GUIDE.md](./HOOKS-GUIDE.md) for complete documentation.
