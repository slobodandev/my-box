# File Download Workflow Specification

## Overview
This workflow retrieves files from Azure Blob Storage and streams them back to the React frontend.

## Workflow Details

**Name:** File Download
**Webhook Path:** `/webhook/file-download`
**Method:** POST
**Content-Type:** application/json

## Input Schema

```typescript
{
  fileId: string,     // File ID to download
  userId: string      // User ID requesting the download (for authorization)
}
```

## Output

Binary file stream with appropriate headers

## Workflow Nodes

### 1. Webhook Trigger
**Node Type:** Webhook
**Configuration:**
- HTTP Method: POST
- Path: `/webhook/file-download`
- Response Mode: "When Last Node Finishes"

### 2. Extract and Validate Input
**Node Type:** Function
**Name:** Extract Request Data
**Code:**
```javascript
const fileId = $input.item.json.fileId;
const userId = $input.item.json.userId;

// Validate required fields
if (!fileId) {
  throw new Error('fileId is required');
}

if (!userId) {
  throw new Error('userId is required');
}

return {
  fileId,
  userId,
  requestedAt: new Date().toISOString()
};
```

### 3. Query File Metadata
**Node Type:** Microsoft SQL
**Name:** Get File Metadata
**Operation:** Execute Query

**Query:**
```sql
SELECT
  f.FileId,
  f.UserId,
  f.Filename,
  f.BlobIdentifier,
  f.BlobUrl,
  f.FileSize,
  f.ContentType,
  f.UploadedAt,
  f.IsDeleted
FROM Files f
WHERE f.FileId = '{{ $json.fileId }}'
  AND f.IsDeleted = 0;
```

### 4. Check if File Exists
**Node Type:** IF
**Name:** File Exists?
**Condition:** `{{ $json.FileId !== undefined && $json.FileId !== null }}`

**False Branch → Error: File Not Found**

### 5. Validate User Access (True Branch)
**Node Type:** IF
**Name:** User Has Access?
**Condition:** `{{ $json.UserId === $('Extract Request Data').item.json.userId }}`

**Note:** This is a basic authorization check. In production, you might want to check if:
- User owns the file, OR
- File is associated with a loan the user has access to

**False Branch → Error: Unauthorized**

### 6. Download from Azure Blob Storage (True Branch)
**Node Type:** HTTP Request
**Name:** Download from Blob Storage
**Configuration:**
- Method: GET
- URL: `{{ $json.BlobUrl }}`
- Authentication: Custom (Azure Blob Storage SAS token or account key)
- Response Format: File
- Binary Property: data

**Alternative: Use Azure Blob Storage Node if available**
- Operation: Download
- Container Name: `loan-files`
- Blob Name: `{{ $json.BlobIdentifier }}`

### 7. Set Response Headers
**Node Type:** Function
**Name:** Prepare File Response
**Code:**
```javascript
const filename = $json.Filename;
const contentType = $json.ContentType || 'application/octet-stream';
const fileSize = $json.FileSize;

// Get binary data from previous node
const binaryData = $input.item.binary.data;

return {
  binaryData,
  filename,
  contentType,
  fileSize,
  headers: {
    'Content-Type': contentType,
    'Content-Disposition': `attachment; filename="${filename}"`,
    'Content-Length': fileSize,
    'Cache-Control': 'no-cache'
  }
};
```

### 8. Log Download Activity (Optional)
**Node Type:** Microsoft SQL
**Name:** Log Download
**Operation:** Execute Query

**Query:**
```sql
INSERT INTO AuditLogs (
  LogId,
  UserId,
  Action,
  ResourceType,
  ResourceId,
  Timestamp,
  Details
)
VALUES (
  NEWID(),
  '{{ $('Extract Request Data').item.json.userId }}',
  'DOWNLOAD',
  'FILE',
  '{{ $json.FileId }}',
  GETUTCDATE(),
  '{{ JSON.stringify({ filename: $json.Filename, fileSize: $json.FileSize }) }}'
);
```

### 9. Respond with File
**Node Type:** Respond to Webhook
**Configuration:**
- Response Code: 200
- Binary Property: data
- Response Headers:
  - Content-Type: `{{ $json.contentType }}`
  - Content-Disposition: `{{ $json.headers['Content-Disposition'] }}`
  - Content-Length: `{{ $json.fileSize }}`

### 10. Error Handler - File Not Found
**Node Type:** Function
**Name:** File Not Found Error
**Code:**
```javascript
return {
  success: false,
  error: 'File not found',
  message: 'The requested file does not exist or has been deleted',
  fileId: $('Extract Request Data').item.json.fileId,
  timestamp: new Date().toISOString()
};
```

### 11. Error Handler - Unauthorized
**Node Type:** Function
**Name:** Unauthorized Error
**Code:**
```javascript
return {
  success: false,
  error: 'Unauthorized',
  message: 'You do not have permission to access this file',
  fileId: $('Extract Request Data').item.json.fileId,
  userId: $('Extract Request Data').item.json.userId,
  timestamp: new Date().toISOString()
};
```

### 12. Error Handler - General Error
**Node Type:** Function
**Name:** Handle Error
**Code:**
```javascript
const error = $input.item.error;

return {
  success: false,
  error: error.message || 'An error occurred during file download',
  details: error.description || '',
  timestamp: new Date().toISOString()
};
```

### 13. Respond Error (404)
**Node Type:** Respond to Webhook
**Response Code:** 404
**Response Body:** `{{ $json }}`

### 14. Respond Error (403)
**Node Type:** Respond to Webhook
**Response Code:** 403
**Response Body:** `{{ $json }}`

### 15. Respond Error (500)
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
│ Extract Request  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Get File         │
│ Metadata (SQL)   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ File Exists?     │
└────┬──────────┬──┘
     │ Yes      │ No
     ▼          │
┌────────────┐  │        ┌────────────────┐
│User Access?│  └───────►│File Not Found  │
└─┬────────┬─┘           │Error (404)     │
  │Yes     │No           └────────────────┘
  ▼        │
┌──────┐   │             ┌────────────────┐
│      │   └────────────►│Unauthorized    │
│Download                │Error (403)     │
│from Blob│              └────────────────┘
│Storage  │
└─────┬───┘
      │
      ▼
┌──────────────┐
│Prepare File  │
│Response      │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│Log Download  │
│(Optional)    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│Respond with  │
│File (200)    │
└──────────────┘

[Error Path]
Any Node Error
      │
      ▼
┌─────────────┐
│Handle Error │
└──────┬──────┘
       │
       ▼
┌──────────────┐
│Respond 500   │
└──────────────┘
```

## Testing

### Test with cURL

```bash
# Download file and save to disk
curl -X POST http://48.223.194.241:5678/webhook/file-download \
  -H "Content-Type: application/json" \
  -d '{
    "fileId": "a1b2c3d4-e5f6-4789-0abc-def123456789",
    "userId": "user-123"
  }' \
  --output downloaded-file.pdf

# Check response headers only
curl -I -X POST http://48.223.194.241:5678/webhook/file-download \
  -H "Content-Type: application/json" \
  -d '{
    "fileId": "a1b2c3d4-e5f6-4789-0abc-def123456789",
    "userId": "user-123"
  }'
```

### Expected Success Response

**Status:** 200 OK
**Headers:**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="test.pdf"
Content-Length: 102400
Cache-Control: no-cache
```
**Body:** Binary file data

### Expected Error Response (File Not Found)

**Status:** 404 Not Found
**Body:**
```json
{
  "success": false,
  "error": "File not found",
  "message": "The requested file does not exist or has been deleted",
  "fileId": "invalid-file-id",
  "timestamp": "2024-01-10T15:30:00.000Z"
}
```

### Expected Error Response (Unauthorized)

**Status:** 403 Forbidden
**Body:**
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "You do not have permission to access this file",
  "fileId": "a1b2c3d4-e5f6-4789-0abc-def123456789",
  "userId": "wrong-user",
  "timestamp": "2024-01-10T15:30:00.000Z"
}
```

## Error Handling

The workflow handles the following error scenarios:

1. **Missing required fields** - Returns 400 with error message
2. **File not found** - Returns 404 with clear message
3. **Unauthorized access** - Returns 403 with clear message
4. **Azure Blob Storage download failure** - Returns 500 with error details
5. **Database query failure** - Returns 500 with error details

## Security Considerations

1. **Authorization** - Verify user has access to the file
2. **Deleted files** - Check `IsDeleted` flag to prevent downloading deleted files
3. **Access logging** - Log all download attempts for audit trail
4. **Rate limiting** - Consider adding rate limiting for downloads
5. **SAS tokens** - Use time-limited SAS tokens for Azure Blob Storage access

## Performance Considerations

- Use streaming for large files to reduce memory usage
- Set appropriate cache headers
- Consider implementing CDN for frequently downloaded files
- Add download limits per user per day (if needed)
- Monitor Azure Blob Storage bandwidth usage

## Advanced Authorization Logic

For more complex access control, replace the "User Has Access?" node with:

```javascript
const fileUserId = $json.UserId;
const requestUserId = $('Extract Request Data').item.json.userId;

// Check if user owns the file
if (fileUserId === requestUserId) {
  return true;
}

// Check if file is associated with loans user has access to
// This requires an additional SQL query
const fileId = $json.FileId;

// Query to check loan access (pseudo-code)
// SELECT COUNT(*) FROM FileLoanAssociations fla
// JOIN UserLoanAccess ula ON fla.LoanId = ula.LoanId
// WHERE fla.FileId = ? AND ula.UserId = ?

// If count > 0, user has access
// Otherwise, deny access

return false;
```

## Monitoring

Monitor these metrics:
- Download success rate
- Average download duration by file size
- 404 error rate (might indicate broken links)
- 403 error rate (might indicate authorization issues)
- Azure Blob Storage connection issues
- Download bandwidth usage

## Future Enhancements

1. Add download expiration (time-limited URLs)
2. Support range requests for partial downloads
3. Generate thumbnails for images
4. Support ZIP download of multiple files
5. Add watermarking for sensitive documents
6. Implement streaming for very large files
7. Add download quotas per user
