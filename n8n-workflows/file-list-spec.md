# File List Workflow Specification

## Overview
This workflow retrieves a filtered list of files for a user from the database, with support for various filtering options.

## Workflow Details

**Name:** File List
**Webhook Path:** `/webhook/file-list`
**Method:** POST
**Content-Type:** application/json

## Input Schema

```typescript
{
  userId: string,              // User ID requesting the file list (required)
  loanId?: string,             // Filter by specific loan
  searchTerm?: string,         // Search in filename
  dateFrom?: string,           // ISO date string (inclusive)
  dateTo?: string,             // ISO date string (inclusive)
  fileType?: string,           // Filter by content type (e.g., "application/pdf")
  tags?: string[],             // Filter by tags
  personalFilesOnly?: boolean, // Show only files not associated with any loan
  page?: number,               // Page number for pagination (default: 1)
  pageSize?: number,           // Items per page (default: 50, max: 100)
  sortBy?: string,             // Sort field (default: "uploadedAt")
  sortOrder?: string           // "asc" or "desc" (default: "desc")
}
```

## Output Schema

```typescript
{
  success: boolean,
  files: Array<{
    fileId: string,
    userId: string,
    filename: string,
    blobIdentifier: string,
    blobUrl: string,
    fileSize: number,
    contentType: string,
    uploadedAt: string,
    loanIds: string[],           // Array of associated loan IDs
    loanNames?: string[]         // Array of associated loan names (optional)
  }>,
  pagination: {
    page: number,
    pageSize: number,
    totalItems: number,
    totalPages: number,
    hasNextPage: boolean,
    hasPreviousPage: boolean
  },
  filters: object                // Echo back applied filters
}
```

## Workflow Nodes

### 1. Webhook Trigger
**Node Type:** Webhook
**Configuration:**
- HTTP Method: POST
- Path: `/webhook/file-list`
- Response Mode: "When Last Node Finishes"

### 2. Extract and Validate Input
**Node Type:** Function
**Name:** Parse Filters
**Code:**
```javascript
const userId = $input.item.json.userId;
const loanId = $input.item.json.loanId || null;
const searchTerm = $input.item.json.searchTerm || null;
const dateFrom = $input.item.json.dateFrom || null;
const dateTo = $input.item.json.dateTo || null;
const fileType = $input.item.json.fileType || null;
const tags = $input.item.json.tags || [];
const personalFilesOnly = $input.item.json.personalFilesOnly || false;
const page = parseInt($input.item.json.page) || 1;
const pageSize = Math.min(parseInt($input.item.json.pageSize) || 50, 100);
const sortBy = $input.item.json.sortBy || 'uploadedAt';
const sortOrder = ($input.item.json.sortOrder || 'desc').toUpperCase();

// Validate required fields
if (!userId) {
  throw new Error('userId is required');
}

// Validate sort order
if (sortOrder !== 'ASC' && sortOrder !== 'DESC') {
  throw new Error('sortOrder must be "asc" or "desc"');
}

// Validate sort field
const validSortFields = ['uploadedAt', 'filename', 'fileSize', 'contentType'];
if (!validSortFields.includes(sortBy)) {
  throw new Error(`sortBy must be one of: ${validSortFields.join(', ')}`);
}

// Calculate pagination
const offset = (page - 1) * pageSize;

return {
  userId,
  loanId,
  searchTerm,
  dateFrom,
  dateTo,
  fileType,
  tags,
  personalFilesOnly,
  page,
  pageSize,
  offset,
  sortBy,
  sortOrder
};
```

### 3. Build Dynamic SQL Query
**Node Type:** Function
**Name:** Build SQL Query
**Code:**
```javascript
const params = $json;

// Base query
let query = `
  SELECT
    f.FileId,
    f.UserId,
    f.Filename,
    f.BlobIdentifier,
    f.BlobUrl,
    f.FileSize,
    f.ContentType,
    f.UploadedAt
  FROM Files f
  WHERE f.UserId = '${params.userId}'
    AND f.IsDeleted = 0
`;

// Add loan filter
if (params.loanId) {
  query += `
    AND EXISTS (
      SELECT 1 FROM FileLoanAssociations fla
      WHERE fla.FileId = f.FileId
        AND fla.LoanId = '${params.loanId}'
    )
  `;
}

// Personal files only (no loan associations)
if (params.personalFilesOnly) {
  query += `
    AND NOT EXISTS (
      SELECT 1 FROM FileLoanAssociations fla
      WHERE fla.FileId = f.FileId
    )
  `;
}

// Search term (filename)
if (params.searchTerm) {
  const escapedSearch = params.searchTerm.replace(/'/g, "''");
  query += `
    AND f.Filename LIKE '%${escapedSearch}%'
  `;
}

// Date range filter
if (params.dateFrom) {
  query += `
    AND f.UploadedAt >= '${params.dateFrom}'
  `;
}

if (params.dateTo) {
  query += `
    AND f.UploadedAt <= '${params.dateTo}'
  `;
}

// File type filter
if (params.fileType) {
  query += `
    AND f.ContentType = '${params.fileType}'
  `;
}

// Add sorting
query += `
  ORDER BY f.${params.sortBy} ${params.sortOrder}
`;

// Add pagination
query += `
  OFFSET ${params.offset} ROWS
  FETCH NEXT ${params.pageSize} ROWS ONLY;
`;

// Count query for pagination
let countQuery = `
  SELECT COUNT(*) as TotalCount
  FROM Files f
  WHERE f.UserId = '${params.userId}'
    AND f.IsDeleted = 0
`;

// Apply same filters to count query
if (params.loanId) {
  countQuery += `
    AND EXISTS (
      SELECT 1 FROM FileLoanAssociations fla
      WHERE fla.FileId = f.FileId
        AND fla.LoanId = '${params.loanId}'
    )
  `;
}

if (params.personalFilesOnly) {
  countQuery += `
    AND NOT EXISTS (
      SELECT 1 FROM FileLoanAssociations fla
      WHERE fla.FileId = f.FileId
    )
  `;
}

if (params.searchTerm) {
  const escapedSearch = params.searchTerm.replace(/'/g, "''");
  countQuery += `
    AND f.Filename LIKE '%${escapedSearch}%'
  `;
}

if (params.dateFrom) {
  countQuery += `
    AND f.UploadedAt >= '${params.dateFrom}'
  `;
}

if (params.dateTo) {
  countQuery += `
    AND f.UploadedAt <= '${params.dateTo}'
  `;
}

if (params.fileType) {
  countQuery += `
    AND f.ContentType = '${params.fileType}'
  `;
}

return {
  ...params,
  query,
  countQuery
};
```

### 4. Execute Count Query
**Node Type:** Microsoft SQL
**Name:** Get Total Count
**Operation:** Execute Query

**Query:**
```sql
{{ $json.countQuery }}
```

### 5. Execute Files Query
**Node Type:** Microsoft SQL
**Name:** Get Files
**Operation:** Execute Query

**Query:**
```sql
{{ $json.query }}
```

### 6. Get Loan Associations
**Node Type:** Microsoft SQL
**Name:** Get Loan Associations
**Operation:** Execute Query

**Query:**
```sql
SELECT
  fla.FileId,
  fla.LoanId,
  l.LoanNumber,
  l.BorrowerName
FROM FileLoanAssociations fla
LEFT JOIN Loans l ON fla.LoanId = l.LoanId
WHERE fla.FileId IN (
  SELECT FileId FROM ({{ $('Build SQL Query').item.json.query }}) AS SubQuery
);
```

### 7. Combine Files with Loan Data
**Node Type:** Function
**Name:** Format Response
**Code:**
```javascript
// Get files from "Get Files" node
const files = $('Get Files').all();

// Get loan associations from "Get Loan Associations" node
const loanAssociations = $('Get Loan Associations').all();

// Get count from "Get Total Count" node
const totalCount = $('Get Total Count').first().json.TotalCount;

// Get pagination params
const params = $('Build SQL Query').first().json;

// Create a map of fileId to loan associations
const loanMap = {};
loanAssociations.forEach(assoc => {
  const fileId = assoc.json.FileId;
  if (!loanMap[fileId]) {
    loanMap[fileId] = {
      loanIds: [],
      loanNames: []
    };
  }
  loanMap[fileId].loanIds.push(assoc.json.LoanId);
  loanMap[fileId].loanNames.push(
    `${assoc.json.LoanNumber} - ${assoc.json.BorrowerName}`
  );
});

// Format files with loan data
const formattedFiles = files.map(file => {
  const fileId = file.json.FileId;
  const loans = loanMap[fileId] || { loanIds: [], loanNames: [] };

  return {
    fileId: file.json.FileId,
    userId: file.json.UserId,
    filename: file.json.Filename,
    blobIdentifier: file.json.BlobIdentifier,
    blobUrl: file.json.BlobUrl,
    fileSize: file.json.FileSize,
    contentType: file.json.ContentType,
    uploadedAt: file.json.UploadedAt,
    loanIds: loans.loanIds,
    loanNames: loans.loanNames
  };
});

// Calculate pagination info
const totalPages = Math.ceil(totalCount / params.pageSize);
const hasNextPage = params.page < totalPages;
const hasPreviousPage = params.page > 1;

return {
  success: true,
  files: formattedFiles,
  pagination: {
    page: params.page,
    pageSize: params.pageSize,
    totalItems: totalCount,
    totalPages: totalPages,
    hasNextPage: hasNextPage,
    hasPreviousPage: hasPreviousPage
  },
  filters: {
    userId: params.userId,
    loanId: params.loanId,
    searchTerm: params.searchTerm,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
    fileType: params.fileType,
    personalFilesOnly: params.personalFilesOnly
  }
};
```

### 8. Respond with File List
**Node Type:** Respond to Webhook
**Configuration:**
- Response Code: 200
- Response Body: `{{ $json }}`

### 9. Error Handler
**Node Type:** Function
**Name:** Handle Error
**Code:**
```javascript
const error = $input.item.error;

return {
  success: false,
  files: [],
  error: error.message || 'An error occurred while fetching files',
  details: error.description || '',
  timestamp: new Date().toISOString()
};
```

### 10. Respond Error
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
│ Parse Filters    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Build SQL Query  │
└────────┬─────────┘
         │
         ├──────────────────┐
         │                  │
         ▼                  ▼
┌─────────────┐    ┌──────────────┐
│Get Total    │    │Get Files     │
│Count        │    │(Paginated)   │
└──────┬──────┘    └──────┬───────┘
       │                  │
       │                  ▼
       │           ┌──────────────┐
       │           │Get Loan      │
       │           │Associations  │
       │           └──────┬───────┘
       │                  │
       └────────┬─────────┘
                │
                ▼
        ┌───────────────┐
        │Format Response│
        └───────┬───────┘
                │
                ▼
        ┌───────────────┐
        │Respond Success│
        └───────────────┘

[Error Path]
Any Node Error
        │
        ▼
┌───────────────┐
│Handle Error   │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│Respond 500    │
└───────────────┘
```

## Testing

### Test with cURL - Basic List

```bash
curl -X POST http://48.223.194.241:5678/webhook/file-list \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123"
  }'
```

### Test with cURL - Filtered List

```bash
curl -X POST http://48.223.194.241:5678/webhook/file-list \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "loanId": "loan-456",
    "searchTerm": "contract",
    "dateFrom": "2024-01-01T00:00:00Z",
    "dateTo": "2024-12-31T23:59:59Z",
    "fileType": "application/pdf",
    "page": 1,
    "pageSize": 20,
    "sortBy": "uploadedAt",
    "sortOrder": "desc"
  }'
```

### Test with cURL - Personal Files Only

```bash
curl -X POST http://48.223.194.241:5678/webhook/file-list \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "personalFilesOnly": true,
    "page": 1,
    "pageSize": 50
  }'
```

### Expected Success Response

```json
{
  "success": true,
  "files": [
    {
      "fileId": "a1b2c3d4-e5f6-4789-0abc-def123456789",
      "userId": "user-123",
      "filename": "loan-contract.pdf",
      "blobIdentifier": "user-123/1699564321-abc123.pdf",
      "blobUrl": "https://myaccount.blob.core.windows.net/loan-files/user-123/1699564321-abc123.pdf",
      "fileSize": 102400,
      "contentType": "application/pdf",
      "uploadedAt": "2024-01-10T15:30:00.000Z",
      "loanIds": ["loan-456", "loan-789"],
      "loanNames": ["L-2024-001 - John Doe", "L-2024-002 - Jane Smith"]
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 50,
    "totalItems": 1,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  },
  "filters": {
    "userId": "user-123",
    "loanId": "loan-456",
    "searchTerm": "contract",
    "dateFrom": "2024-01-01T00:00:00Z",
    "dateTo": "2024-12-31T23:59:59Z",
    "fileType": "application/pdf",
    "personalFilesOnly": false
  }
}
```

### Expected Error Response

```json
{
  "success": false,
  "files": [],
  "error": "userId is required",
  "details": "",
  "timestamp": "2024-01-10T15:30:00.000Z"
}
```

## Error Handling

The workflow handles the following error scenarios:

1. **Missing userId** - Returns 400 with error message
2. **Invalid pagination params** - Returns 400 with error message
3. **Invalid sort parameters** - Returns 400 with error message
4. **Database query failure** - Returns 500 with error details
5. **SQL injection attempts** - Escapes special characters in search terms

## Security Considerations

1. **SQL Injection** - Escape special characters in user inputs
2. **Authorization** - Only return files owned by the requesting user
3. **Deleted files** - Exclude soft-deleted files from results
4. **Large result sets** - Limit max page size to prevent memory issues
5. **Input validation** - Validate all filter parameters

## Performance Considerations

- Use indexed columns for WHERE clauses (UserId, LoanId, UploadedAt)
- Limit max page size to 100 items
- Consider caching frequently accessed file lists
- Use SQL Server query plans to optimize complex queries
- Add database indexes on:
  - Files.UserId
  - Files.IsDeleted
  - Files.UploadedAt
  - FileLoanAssociations.FileId
  - FileLoanAssociations.LoanId

## Advanced Filtering

For more advanced filtering, you can extend the workflow to support:

1. **Full-text search** - Use SQL Server full-text search for better search performance
2. **Tag filtering** - Add tags table and filter by tags
3. **File size ranges** - Filter by file size min/max
4. **Multiple file types** - Support array of file types
5. **Loan status filter** - Filter files by loan status (active, closed, etc.)

## Monitoring

Monitor these metrics:
- Average query execution time
- Most common filters used
- Page size distribution
- Error rate by error type
- Slow query alerts (> 2 seconds)

## Future Enhancements

1. Add caching layer (Redis) for frequently accessed lists
2. Support advanced search with Elasticsearch
3. Add file metadata extraction and indexing
4. Support saved filters/views
5. Add export to CSV/Excel
6. Implement virtual scrolling for large result sets
7. Add real-time updates using WebSockets
