# File Delete Workflow Specification

## Overview
This workflow handles soft-deletion of files from the database. Files are marked as deleted but not physically removed from Azure Blob Storage, allowing for potential recovery.

## Workflow Details

**Name:** File Delete
**Webhook Path:** `/webhook/file-delete`
**Method:** POST or DELETE
**Content-Type:** application/json

## Input Schema

```typescript
{
  fileId: string,           // File ID to delete
  userId: string,           // User ID requesting deletion (for authorization)
  hardDelete?: boolean      // If true, also delete from Blob Storage (default: false)
}
```

## Output Schema

```typescript
{
  success: boolean,
  message: string,
  fileId: string,
  deletedAt: string,
  hardDelete: boolean,
  error?: string
}
```

## Workflow Nodes

### 1. Webhook Trigger
**Node Type:** Webhook
**Configuration:**
- HTTP Method: POST, DELETE
- Path: `/webhook/file-delete`
- Response Mode: "When Last Node Finishes"

### 2. Extract and Validate Input
**Node Type:** Function
**Name:** Extract Request Data
**Code:**
```javascript
const fileId = $input.item.json.fileId;
const userId = $input.item.json.userId;
const hardDelete = $input.item.json.hardDelete || false;

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
  hardDelete,
  requestedAt: new Date().toISOString()
};
```

### 3. Query File Metadata
**Node Type:** Microsoft SQL
**Name:** Get File Info
**Operation:** Execute Query

**Query:**
```sql
SELECT
  f.FileId,
  f.UserId,
  f.Filename,
  f.BlobIdentifier,
  f.BlobUrl,
  f.IsDeleted
FROM Files f
WHERE f.FileId = '{{ $json.fileId }}';
```

### 4. Check if File Exists
**Node Type:** IF
**Name:** File Exists?
**Condition:** `{{ $json.FileId !== undefined && $json.FileId !== null }}`

**False Branch → Error: File Not Found**

### 5. Check if Already Deleted (True Branch)
**Node Type:** IF
**Name:** Already Deleted?
**Condition:** `{{ $json.IsDeleted === true || $json.IsDeleted === 1 }}`

**True Branch → Return "Already Deleted" message**
**False Branch → Continue with deletion**

### 6. Validate User Access (False Branch of Already Deleted)
**Node Type:** IF
**Name:** User Owns File?
**Condition:** `{{ $json.UserId === $('Extract Request Data').item.json.userId }}`

**False Branch → Error: Unauthorized**

### 7. Soft Delete File (True Branch of User Owns File)
**Node Type:** Microsoft SQL
**Name:** Soft Delete File
**Operation:** Execute Query

**Query:**
```sql
UPDATE Files
SET
  IsDeleted = 1,
  DeletedAt = GETUTCDATE()
WHERE FileId = '{{ $('Extract Request Data').item.json.fileId }}';

SELECT
  FileId,
  UserId,
  Filename,
  BlobIdentifier,
  IsDeleted,
  DeletedAt
FROM Files
WHERE FileId = '{{ $('Extract Request Data').item.json.fileId }}';
```

### 8. Log Deletion Activity
**Node Type:** Microsoft SQL
**Name:** Log Deletion
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
  'DELETE',
  'FILE',
  '{{ $json.FileId }}',
  GETUTCDATE(),
  '{{ JSON.stringify({ filename: $json.Filename, hardDelete: $('Extract Request Data').item.json.hardDelete }) }}'
);
```

### 9. Check Hard Delete Option
**Node Type:** IF
**Name:** Hard Delete Requested?
**Condition:** `{{ $('Extract Request Data').item.json.hardDelete === true }}`

**True Branch → Delete from Blob Storage**
**False Branch → Skip to response**

### 10. Delete from Azure Blob Storage (True Branch)
**Node Type:** HTTP Request
**Name:** Delete from Blob Storage
**Configuration:**
- Method: DELETE
- URL: `{{ $json.BlobUrl }}`
- Authentication: Azure Blob Storage credentials
- Headers:
  - x-ms-version: 2020-04-08
  - x-ms-delete-snapshots: include (optional, deletes snapshots too)

**Alternative: Use Azure Blob Storage Node if available**
- Operation: Delete
- Container Name: `loan-files`
- Blob Name: `{{ $json.BlobIdentifier }}`

### 11. Format Success Response
**Node Type:** Function
**Name:** Format Success Response
**Code:**
```javascript
const hardDelete = $('Extract Request Data').first().json.hardDelete;

return {
  success: true,
  message: hardDelete
    ? 'File permanently deleted from database and storage'
    : 'File deleted from database (soft delete)',
  fileId: $json.FileId,
  filename: $json.Filename,
  deletedAt: $json.DeletedAt,
  hardDelete: hardDelete
};
```

### 12. Format Already Deleted Response
**Node Type:** Function
**Name:** Already Deleted Response
**Code:**
```javascript
return {
  success: true,
  message: 'File was already deleted',
  fileId: $json.FileId,
  filename: $json.Filename,
  deletedAt: $json.DeletedAt || 'Unknown',
  hardDelete: false
};
```

### 13. Error Handler - File Not Found
**Node Type:** Function
**Name:** File Not Found Error
**Code:**
```javascript
return {
  success: false,
  error: 'File not found',
  message: 'The requested file does not exist',
  fileId: $('Extract Request Data').item.json.fileId,
  timestamp: new Date().toISOString()
};
```

### 14. Error Handler - Unauthorized
**Node Type:** Function
**Name:** Unauthorized Error
**Code:**
```javascript
return {
  success: false,
  error: 'Unauthorized',
  message: 'You do not have permission to delete this file',
  fileId: $('Extract Request Data').item.json.fileId,
  userId: $('Extract Request Data').item.json.userId,
  timestamp: new Date().toISOString()
};
```

### 15. Error Handler - General Error
**Node Type:** Function
**Name:** Handle Error
**Code:**
```javascript
const error = $input.item.error;

return {
  success: false,
  error: error.message || 'An error occurred during file deletion',
  details: error.description || '',
  timestamp: new Date().toISOString()
};
```

### 16. Respond Success
**Node Type:** Respond to Webhook
**Response Code:** 200
**Response Body:** `{{ $json }}`

### 17. Respond File Not Found
**Node Type:** Respond to Webhook
**Response Code:** 404
**Response Body:** `{{ $json }}`

### 18. Respond Unauthorized
**Node Type:** Respond to Webhook
**Response Code:** 403
**Response Body:** `{{ $json }}`

### 19. Respond General Error
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
│ Get File Info    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ File Exists?     │
└────┬──────────┬──┘
     │Yes       │No
     ▼          │         ┌────────────────┐
┌─────────────┐ └────────►│File Not Found  │
│Already      │           │Error (404)     │
│Deleted?     │           └────────────────┘
└─┬────────┬──┘
  │Yes     │No
  ▼        │            ┌────────────────┐
┌──────┐   └───────────►│User Owns File? │
│Return│                └─┬──────────┬───┘
│Already                 │Yes       │No
│Deleted│                ▼          │
│(200) │          ┌────────────┐    │
└──────┘          │Soft Delete │    │
                  │File (SQL)  │    │
                  └──────┬─────┘    │
                         │          │
                         ▼          │
                  ┌────────────┐    │
                  │Log         │    │
                  │Deletion    │    │
                  └──────┬─────┘    │
                         │          │
                         ▼          ▼
                  ┌────────────┐ ┌────────────┐
                  │Hard Delete?│ │Unauthorized│
                  └─┬────────┬─┘ │Error (403) │
                    │Yes     │No └────────────┘
                    ▼        │
             ┌─────────────┐ │
             │Delete from  │ │
             │Blob Storage │ │
             └──────┬──────┘ │
                    │        │
                    └────┬───┘
                         │
                         ▼
                  ┌────────────┐
                  │Format      │
                  │Response    │
                  └──────┬─────┘
                         │
                         ▼
                  ┌────────────┐
                  │Respond     │
                  │Success(200)│
                  └────────────┘

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

### Test with cURL - Soft Delete

```bash
curl -X POST http://48.223.194.241:5678/webhook/file-delete \
  -H "Content-Type: application/json" \
  -d '{
    "fileId": "a1b2c3d4-e5f6-4789-0abc-def123456789",
    "userId": "user-123",
    "hardDelete": false
  }'
```

### Test with cURL - Hard Delete

```bash
curl -X DELETE http://48.223.194.241:5678/webhook/file-delete \
  -H "Content-Type: application/json" \
  -d '{
    "fileId": "a1b2c3d4-e5f6-4789-0abc-def123456789",
    "userId": "user-123",
    "hardDelete": true
  }'
```

### Expected Success Response (Soft Delete)

**Status:** 200 OK
**Body:**
```json
{
  "success": true,
  "message": "File deleted from database (soft delete)",
  "fileId": "a1b2c3d4-e5f6-4789-0abc-def123456789",
  "filename": "loan-contract.pdf",
  "deletedAt": "2024-01-10T15:30:00.000Z",
  "hardDelete": false
}
```

### Expected Success Response (Hard Delete)

**Status:** 200 OK
**Body:**
```json
{
  "success": true,
  "message": "File permanently deleted from database and storage",
  "fileId": "a1b2c3d4-e5f6-4789-0abc-def123456789",
  "filename": "loan-contract.pdf",
  "deletedAt": "2024-01-10T15:30:00.000Z",
  "hardDelete": true
}
```

### Expected Response (Already Deleted)

**Status:** 200 OK
**Body:**
```json
{
  "success": true,
  "message": "File was already deleted",
  "fileId": "a1b2c3d4-e5f6-4789-0abc-def123456789",
  "filename": "loan-contract.pdf",
  "deletedAt": "2024-01-09T10:00:00.000Z",
  "hardDelete": false
}
```

### Expected Error Response (File Not Found)

**Status:** 404 Not Found
**Body:**
```json
{
  "success": false,
  "error": "File not found",
  "message": "The requested file does not exist",
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
  "message": "You do not have permission to delete this file",
  "fileId": "a1b2c3d4-e5f6-4789-0abc-def123456789",
  "userId": "wrong-user",
  "timestamp": "2024-01-10T15:30:00.000Z"
}
```

## Error Handling

The workflow handles the following error scenarios:

1. **Missing required fields** - Returns 400 with error message
2. **File not found** - Returns 404 with clear message
3. **Unauthorized access** - Returns 403 when user doesn't own the file
4. **Already deleted** - Returns 200 with informative message
5. **Azure Blob Storage delete failure** - Logs error but continues (file already soft-deleted in DB)
6. **Database update failure** - Returns 500 with error details

## Security Considerations

1. **Authorization** - Verify user owns the file before deletion
2. **Audit logging** - Log all deletion attempts for compliance
3. **Soft delete default** - Prevent accidental permanent data loss
4. **Hard delete restrictions** - Consider requiring admin privileges for hard deletes
5. **Cascade deletion** - Handle or prevent deletion of files associated with active loans

## Recovery Considerations

For soft-deleted files, you may want to add a recovery workflow:

### Recovery Workflow (Optional)
```sql
-- Restore soft-deleted file
UPDATE Files
SET
  IsDeleted = 0,
  DeletedAt = NULL
WHERE FileId = @fileId
  AND IsDeleted = 1;
```

Consider adding:
- Time limit for recovery (e.g., 30 days)
- Automatic permanent deletion after recovery period
- Admin-only recovery permissions

## Performance Considerations

- Soft deletes are fast (single UPDATE query)
- Hard deletes may take longer due to Azure Blob Storage API call
- Add index on IsDeleted column for filtered queries
- Consider background job for permanent deletion of old soft-deleted files

## Cascade Deletion

When deleting a file, consider what happens to:

1. **Loan associations** - Keep them for audit trail or delete them?
2. **Audit logs** - Always keep audit logs
3. **Thumbnails/previews** - Delete them with the file
4. **Metadata/tags** - Delete them with the file

**Recommended approach:**
```sql
-- Delete loan associations when soft-deleting file
DELETE FROM FileLoanAssociations
WHERE FileId = @fileId;

-- Or keep them for audit trail with a flag
UPDATE FileLoanAssociations
SET IsActive = 0, RemovedAt = GETUTCDATE()
WHERE FileId = @fileId;
```

## Batch Deletion

For deleting multiple files at once, create a separate workflow or extend this one:

```javascript
// Accept array of fileIds
const fileIds = $input.item.json.fileIds || [];

// Process each file
const results = fileIds.map(fileId => {
  // Call delete logic for each file
});

return results;
```

## Monitoring

Monitor these metrics:
- Deletion success rate
- Soft delete vs hard delete ratio
- Unauthorized deletion attempts
- Average deletion duration
- Azure Blob Storage delete failures
- Recovery rate (if recovery feature added)

## Future Enhancements

1. Add "Restore from trash" functionality
2. Implement automatic permanent deletion after retention period
3. Add batch deletion support
4. Require confirmation for hard deletes
5. Add file versioning (instead of deletion)
6. Implement recycle bin/trash folder
7. Add admin override for deletion restrictions
8. Support scheduled deletion
9. Add deletion quotas or rate limiting

## Compliance Considerations

For regulated industries (finance, healthcare):
- Implement mandatory retention periods
- Prevent deletion of files associated with active loans
- Require approval workflow for deletions
- Maintain complete audit trail
- Comply with data retention regulations (e.g., GDPR, SOX)
- Implement secure permanent deletion (overwrite data)
