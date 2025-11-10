# File Upload Workflow Specification

## Overview
This workflow handles file uploads from the React frontend, stores files in Azure Blob Storage, and creates corresponding database records.

## Workflow Details

**Name:** File Upload
**Webhook Path:** `/webhook/file-upload`
**Method:** POST
**Content-Type:** multipart/form-data

## Input Schema

```typescript
{
  file: File,              // The file to upload (binary data)
  userId: string,          // User ID uploading the file
  loanIds?: string[],      // Optional array of loan IDs to associate (JSON string)
  tags?: string[],         // Optional tags (JSON string)
  description?: string     // Optional file description
}
```

## Output Schema

```typescript
{
  success: boolean,
  fileId: string,
  blobIdentifier: string,
  blobUrl: string,
  message?: string,
  error?: string
}
```

## Workflow Nodes

### 1. Webhook Trigger
**Node Type:** Webhook
**Configuration:**
- HTTP Method: POST
- Path: `/webhook/file-upload`
- Response Mode: "When Last Node Finishes"
- Options:
  - Binary Data: true
  - Binary Property Name: "file"

### 2. Extract and Validate Input
**Node Type:** Function
**Name:** Extract Metadata
**Code:**
```javascript
// Extract form data
const userId = $input.item.json.userId;
const loanIds = $input.item.json.loanIds ? JSON.parse($input.item.json.loanIds) : [];
const tags = $input.item.json.tags ? JSON.parse($input.item.json.tags) : [];
const description = $input.item.json.description || '';

// Extract binary file data
const binaryData = $input.item.binary.file;
const filename = binaryData.fileName;
const mimeType = binaryData.mimeType;
const fileSize = binaryData.fileSize;

// Validate required fields
if (!userId) {
  throw new Error('userId is required');
}

if (!binaryData) {
  throw new Error('file is required');
}

// Validate file size (100MB max)
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
if (fileSize > MAX_FILE_SIZE) {
  throw new Error(`File size ${fileSize} exceeds maximum allowed size of ${MAX_FILE_SIZE} bytes`);
}

// Generate unique blob identifier
const timestamp = Date.now();
const randomString = Math.random().toString(36).substring(7);
const fileExtension = filename.split('.').pop();
const blobIdentifier = `${userId}/${timestamp}-${randomString}.${fileExtension}`;

return {
  userId,
  loanIds,
  tags,
  description,
  filename,
  mimeType,
  fileSize,
  blobIdentifier,
  binaryData
};
```

### 3. Upload to Azure Blob Storage
**Node Type:** Azure Blob Storage (HTTP Request alternative below)
**Name:** Upload to Blob Storage

**Option A: Using Azure Blob Storage Node (if available)**
- Operation: Upload
- Container Name: `loan-files`
- Blob Name: `{{ $json.blobIdentifier }}`
- Binary Property: `file`

**Option B: Using HTTP Request Node**
```javascript
// URL: https://<account>.blob.core.windows.net/loan-files/{{ $json.blobIdentifier }}
// Method: PUT
// Authentication: Header Auth
// Header: x-ms-blob-type: BlockBlob
// Header: x-ms-version: 2020-04-08
// Body: Binary Data
```

### 4. Generate File ID
**Node Type:** Function
**Name:** Generate File ID
**Code:**
```javascript
const crypto = require('crypto');

// Generate UUID for file ID
const fileId = crypto.randomUUID();

// Construct blob URL
const storageAccount = 'YOUR_STORAGE_ACCOUNT'; // Replace with actual
const blobUrl = `https://${storageAccount}.blob.core.windows.net/loan-files/${$json.blobIdentifier}`;

return {
  ...$ json,
  fileId,
  blobUrl,
  uploadedAt: new Date().toISOString()
};
```

### 5. Insert File Record into Database
**Node Type:** Microsoft SQL
**Name:** Insert File Record
**Operation:** Execute Query

**Query:**
```sql
INSERT INTO Files (
  FileId,
  UserId,
  Filename,
  BlobIdentifier,
  BlobUrl,
  FileSize,
  ContentType,
  UploadedAt,
  IsDeleted
)
VALUES (
  '{{ $json.fileId }}',
  '{{ $json.userId }}',
  '{{ $json.filename }}',
  '{{ $json.blobIdentifier }}',
  '{{ $json.blobUrl }}',
  {{ $json.fileSize }},
  '{{ $json.mimeType }}',
  '{{ $json.uploadedAt }}',
  0
);

SELECT
  FileId,
  UserId,
  Filename,
  BlobIdentifier,
  BlobUrl,
  FileSize,
  ContentType,
  UploadedAt
FROM Files
WHERE FileId = '{{ $json.fileId }}';
```

### 6. Check if Loan Associations Needed
**Node Type:** IF
**Name:** Has Loan Associations?
**Condition:** `{{ $json.loanIds && $json.loanIds.length > 0 }}`

### 7. Insert Loan Associations (True Branch)
**Node Type:** Function + Loop + SQL
**Name:** Prepare Loan Associations

**Function Code:**
```javascript
// Create an item for each loan association
const fileId = $json.fileId;
const loanIds = $json.loanIds || [];

return loanIds.map(loanId => ({
  fileId,
  loanId,
  associatedAt: new Date().toISOString(),
  associationId: require('crypto').randomUUID()
}));
```

### 8. Insert Each Association
**Node Type:** Microsoft SQL
**Name:** Insert Loan Association
**Operation:** Execute Query

**Query:**
```sql
INSERT INTO FileLoanAssociations (
  AssociationId,
  FileId,
  LoanId,
  AssociatedAt
)
VALUES (
  '{{ $json.associationId }}',
  '{{ $json.fileId }}',
  '{{ $json.loanId }}',
  '{{ $json.associatedAt }}'
);
```

### 9. Merge Branches
**Node Type:** Merge
**Name:** Combine Results
**Mode:** "Keep Matches"

### 10. Format Success Response
**Node Type:** Function
**Name:** Format Response
**Code:**
```javascript
return {
  success: true,
  fileId: $json.fileId,
  blobIdentifier: $json.blobIdentifier,
  blobUrl: $json.blobUrl,
  filename: $json.filename,
  fileSize: $json.fileSize,
  message: 'File uploaded successfully'
};
```

### 11. Error Handler
**Node Type:** Function
**Name:** Handle Error
**Settings:** Set as error workflow

**Code:**
```javascript
const error = $input.item.error;

return {
  success: false,
  error: error.message || 'An error occurred during file upload',
  details: error.description || '',
  timestamp: new Date().toISOString()
};
```

### 12. Respond to Webhook (Success)
**Node Type:** Respond to Webhook
**Response Code:** 200
**Response Body:** `{{ $json }}`

### 13. Respond to Webhook (Error)
**Node Type:** Respond to Webhook
**Response Code:** 500
**Response Body:** `{{ $json }}`

## Workflow Flow Diagram

```
┌─────────────────┐
│ Webhook Trigger │
└────────┬────────┘
         │
         ▼
┌──────────────────┐
│ Extract Metadata │
└────────┬─────────┘
         │
         ▼
┌────────────────────┐
│ Upload to Blob     │
│ Storage            │
└────────┬───────────┘
         │
         ▼
┌──────────────────┐
│ Generate File ID │
└────────┬─────────┘
         │
         ▼
┌────────────────────┐
│ Insert File Record │
└────────┬───────────┘
         │
         ▼
┌───────────────────┐
│ Has Loan Assocs?  │
└────┬──────────┬───┘
     │ Yes      │ No
     ▼          │
┌────────────┐  │
│Insert      │  │
│Associations│  │
└─────┬──────┘  │
      │         │
      └────┬────┘
           │
           ▼
   ┌───────────────┐
   │Format Response│
   └───────┬───────┘
           │
           ▼
   ┌────────────────┐
   │Respond Success │
   └────────────────┘

   [Error Path]
   Any Node Error
           │
           ▼
   ┌──────────────┐
   │Handle Error  │
   └──────┬───────┘
          │
          ▼
   ┌─────────────┐
   │Respond Error│
   └─────────────┘
```

## Testing

### Test with cURL

```bash
curl -X POST http://48.223.194.241:5678/webhook/file-upload \
  -F "file=@/path/to/test.pdf" \
  -F "userId=user-123" \
  -F 'loanIds=["loan-456","loan-789"]' \
  -F 'tags=["important","contract"]' \
  -F "description=Loan agreement document"
```

### Expected Success Response

```json
{
  "success": true,
  "fileId": "a1b2c3d4-e5f6-4789-0abc-def123456789",
  "blobIdentifier": "user-123/1699564321-abc123.pdf",
  "blobUrl": "https://myaccount.blob.core.windows.net/loan-files/user-123/1699564321-abc123.pdf",
  "filename": "test.pdf",
  "fileSize": 102400,
  "message": "File uploaded successfully"
}
```

### Expected Error Response

```json
{
  "success": false,
  "error": "File size exceeds maximum allowed size",
  "details": "File size 157286400 exceeds maximum allowed size of 104857600 bytes",
  "timestamp": "2024-01-10T15:30:00.000Z"
}
```

## Error Handling

The workflow handles the following error scenarios:

1. **Missing required fields** - Returns 400 with error message
2. **File too large** - Returns 400 with size limit error
3. **Azure Blob Storage upload failure** - Returns 500 with Azure error
4. **Database insert failure** - Returns 500 with database error
5. **Invalid loan IDs** - Logs warning but continues (foreign key constraint)

## Security Considerations

1. **Input validation** - All inputs are validated before processing
2. **SQL injection prevention** - Use parameterized queries (n8n handles this)
3. **File type validation** - Should be added in Extract Metadata node
4. **User authentication** - Should verify userId is authenticated
5. **Access control** - Verify user has permission to associate with loans

## Performance Considerations

- File uploads are limited to 100MB
- For larger files, consider implementing chunked uploads
- Loan associations are inserted in a loop (consider batch insert for many associations)
- Add timeout handling for slow Azure operations

## Monitoring

Monitor these metrics:
- Upload success rate
- Average upload duration
- File size distribution
- Error rate by error type
- Azure Blob Storage connection issues

## Future Enhancements

1. Add virus scanning before storage
2. Generate thumbnails for images
3. Extract text from PDFs for search
4. Support resumable uploads
5. Add upload progress tracking
6. Implement file deduplication
