# Get Loan List Workflow Specification

## Overview
This workflow retrieves a list of loans that a user has access to, with optional filtering and search capabilities. This is used in the file upload and file association features.

## Workflow Details

**Name:** Get Loan List
**Webhook Path:** `/webhook/get-loans`
**Method:** POST
**Content-Type:** application/json

## Input Schema

```typescript
{
  userId: string,              // User ID requesting loans (required)
  searchTerm?: string,         // Search in loan number or borrower name
  status?: string,             // Filter by loan status
  dateFrom?: string,           // Filter by creation date (ISO format)
  dateTo?: string,             // Filter by creation date (ISO format)
  page?: number,               // Page number for pagination (default: 1)
  pageSize?: number,           // Items per page (default: 50, max: 100)
  sortBy?: string,             // Sort field (default: "createdAt")
  sortOrder?: string,          // "asc" or "desc" (default: "desc")
  includeFileCounts?: boolean  // Include count of associated files (default: false)
}
```

## Output Schema

```typescript
{
  success: boolean,
  loans: Array<{
    loanId: string,
    loanNumber: string,
    borrowerName: string,
    amount: number,
    status: string,
    createdAt: string,
    updatedAt: string,
    fileCount?: number           // If includeFileCounts is true
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
- Path: `/webhook/get-loans`
- Response Mode: "When Last Node Finishes"

### 2. Extract and Validate Input
**Node Type:** Function
**Name:** Parse Request
**Code:**
```javascript
const userId = $input.item.json.userId;
const searchTerm = $input.item.json.searchTerm || null;
const status = $input.item.json.status || null;
const dateFrom = $input.item.json.dateFrom || null;
const dateTo = $input.item.json.dateTo || null;
const page = parseInt($input.item.json.page) || 1;
const pageSize = Math.min(parseInt($input.item.json.pageSize) || 50, 100);
const sortBy = $input.item.json.sortBy || 'createdAt';
const sortOrder = ($input.item.json.sortOrder || 'desc').toUpperCase();
const includeFileCounts = $input.item.json.includeFileCounts || false;

// Validate required fields
if (!userId) {
  throw new Error('userId is required');
}

// Validate sort order
if (sortOrder !== 'ASC' && sortOrder !== 'DESC') {
  throw new Error('sortOrder must be "asc" or "desc"');
}

// Validate sort field
const validSortFields = ['createdAt', 'loanNumber', 'borrowerName', 'amount', 'status'];
if (!validSortFields.includes(sortBy)) {
  throw new Error(`sortBy must be one of: ${validSortFields.join(', ')}`);
}

// Calculate pagination
const offset = (page - 1) * pageSize;

return {
  userId,
  searchTerm,
  status,
  dateFrom,
  dateTo,
  page,
  pageSize,
  offset,
  sortBy,
  sortOrder,
  includeFileCounts
};
```

### 3. Build Dynamic SQL Query
**Node Type:** Function
**Name:** Build SQL Query
**Code:**
```javascript
const params = $json;

// Base query - This assumes there's a UserLoanAccess table
// If all users can see all loans, remove the JOIN
let query = `
  SELECT
    l.LoanId,
    l.LoanNumber,
    l.BorrowerName,
    l.Amount,
    l.Status,
    l.CreatedAt,
    l.UpdatedAt
  FROM Loans l
`;

// If you have user-specific loan access, add this join:
// INNER JOIN UserLoanAccess ula ON l.LoanId = ula.LoanId
// WHERE ula.UserId = '${params.userId}'

// For now, assume all users can see all loans
let whereClause = ' WHERE 1=1 ';

// Add status filter
if (params.status) {
  whereClause += `
    AND l.Status = '${params.status}'
  `;
}

// Search term (loan number or borrower name)
if (params.searchTerm) {
  const escapedSearch = params.searchTerm.replace(/'/g, "''");
  whereClause += `
    AND (l.LoanNumber LIKE '%${escapedSearch}%'
         OR l.BorrowerName LIKE '%${escapedSearch}%')
  `;
}

// Date range filter
if (params.dateFrom) {
  whereClause += `
    AND l.CreatedAt >= '${params.dateFrom}'
  `;
}

if (params.dateTo) {
  whereClause += `
    AND l.CreatedAt <= '${params.dateTo}'
  `;
}

query += whereClause;

// Add sorting
query += `
  ORDER BY l.${params.sortBy} ${params.sortOrder}
`;

// Add pagination
query += `
  OFFSET ${params.offset} ROWS
  FETCH NEXT ${params.pageSize} ROWS ONLY;
`;

// Count query for pagination
let countQuery = `
  SELECT COUNT(*) as TotalCount
  FROM Loans l
  ${whereClause}
`;

// File count query (if requested)
let fileCountQuery = '';
if (params.includeFileCounts) {
  fileCountQuery = `
    SELECT
      fla.LoanId,
      COUNT(DISTINCT fla.FileId) as FileCount
    FROM FileLoanAssociations fla
    INNER JOIN Files f ON fla.FileId = f.FileId
    WHERE f.IsDeleted = 0
    GROUP BY fla.LoanId;
  `;
}

return {
  ...params,
  query,
  countQuery,
  fileCountQuery
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

### 5. Execute Loans Query
**Node Type:** Microsoft SQL
**Name:** Get Loans
**Operation:** Execute Query

**Query:**
```sql
{{ $json.query }}
```

### 6. Check if File Counts Needed
**Node Type:** IF
**Name:** Include File Counts?
**Condition:** `{{ $('Build SQL Query').item.json.includeFileCounts === true }}`

### 7. Get File Counts (True Branch)
**Node Type:** Microsoft SQL
**Name:** Get File Counts
**Operation:** Execute Query

**Query:**
```sql
{{ $('Build SQL Query').item.json.fileCountQuery }}
```

### 8. Format Response with File Counts
**Node Type:** Function
**Name:** Format Response with Counts
**Code:**
```javascript
// Get loans
const loans = $('Get Loans').all();

// Get file counts
const fileCounts = $('Get File Counts').all();

// Get total count
const totalCount = $('Get Total Count').first().json.TotalCount;

// Get pagination params
const params = $('Build SQL Query').first().json;

// Create a map of loanId to file count
const fileCountMap = {};
fileCounts.forEach(fc => {
  fileCountMap[fc.json.LoanId] = fc.json.FileCount || 0;
});

// Format loans with file counts
const formattedLoans = loans.map(loan => ({
  loanId: loan.json.LoanId,
  loanNumber: loan.json.LoanNumber,
  borrowerName: loan.json.BorrowerName,
  amount: loan.json.Amount,
  status: loan.json.Status,
  createdAt: loan.json.CreatedAt,
  updatedAt: loan.json.UpdatedAt,
  fileCount: fileCountMap[loan.json.LoanId] || 0
}));

// Calculate pagination info
const totalPages = Math.ceil(totalCount / params.pageSize);
const hasNextPage = params.page < totalPages;
const hasPreviousPage = params.page > 1;

return {
  success: true,
  loans: formattedLoans,
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
    searchTerm: params.searchTerm,
    status: params.status,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo
  }
};
```

### 9. Format Response without File Counts (False Branch)
**Node Type:** Function
**Name:** Format Response Simple
**Code:**
```javascript
// Get loans
const loans = $('Get Loans').all();

// Get total count
const totalCount = $('Get Total Count').first().json.TotalCount;

// Get pagination params
const params = $('Build SQL Query').first().json;

// Format loans
const formattedLoans = loans.map(loan => ({
  loanId: loan.json.LoanId,
  loanNumber: loan.json.LoanNumber,
  borrowerName: loan.json.BorrowerName,
  amount: loan.json.Amount,
  status: loan.json.Status,
  createdAt: loan.json.CreatedAt,
  updatedAt: loan.json.UpdatedAt
}));

// Calculate pagination info
const totalPages = Math.ceil(totalCount / params.pageSize);
const hasNextPage = params.page < totalPages;
const hasPreviousPage = params.page > 1;

return {
  success: true,
  loans: formattedLoans,
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
    searchTerm: params.searchTerm,
    status: params.status,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo
  }
};
```

### 10. Merge Branches
**Node Type:** Merge
**Name:** Combine Results

### 11. Respond with Loan List
**Node Type:** Respond to Webhook
**Configuration:**
- Response Code: 200
- Response Body: `{{ $json }}`

### 12. Error Handler
**Node Type:** Function
**Name:** Handle Error
**Code:**
```javascript
const error = $input.item.error;

return {
  success: false,
  loans: [],
  error: error.message || 'An error occurred while fetching loans',
  details: error.description || '',
  timestamp: new Date().toISOString()
};
```

### 13. Respond Error
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
│ Parse Request    │
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
│Get Total    │    │Get Loans     │
│Count        │    │(Paginated)   │
└──────┬──────┘    └──────┬───────┘
       │                  │
       │                  ▼
       │         ┌────────────────┐
       │         │Include File    │
       │         │Counts?         │
       │         └────┬────────┬──┘
       │              │Yes     │No
       │              ▼        │
       │         ┌──────────┐  │
       │         │Get File  │  │
       │         │Counts    │  │
       │         └────┬─────┘  │
       │              │        │
       │              ▼        ▼
       │         ┌─────────┐ ┌─────────┐
       │         │Format   │ │Format   │
       │         │with     │ │Simple   │
       │         │Counts   │ │Response │
       │         └────┬────┘ └────┬────┘
       │              │           │
       └──────────────┴─────┬─────┘
                            │
                            ▼
                    ┌───────────────┐
                    │Merge Results  │
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
curl -X POST http://48.223.194.241:5678/webhook/get-loans \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123"
  }'
```

### Test with cURL - Filtered List with File Counts

```bash
curl -X POST http://48.223.194.241:5678/webhook/get-loans \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "status": "active",
    "searchTerm": "John",
    "includeFileCounts": true,
    "page": 1,
    "pageSize": 20,
    "sortBy": "borrowerName",
    "sortOrder": "asc"
  }'
```

### Expected Success Response

```json
{
  "success": true,
  "loans": [
    {
      "loanId": "loan-456",
      "loanNumber": "L-2024-001",
      "borrowerName": "John Doe",
      "amount": 250000.00,
      "status": "active",
      "createdAt": "2024-01-10T15:30:00.000Z",
      "updatedAt": "2024-01-15T10:20:00.000Z",
      "fileCount": 5
    },
    {
      "loanId": "loan-789",
      "loanNumber": "L-2024-002",
      "borrowerName": "Jane Smith",
      "amount": 180000.00,
      "status": "active",
      "createdAt": "2024-01-12T09:15:00.000Z",
      "updatedAt": "2024-01-18T14:30:00.000Z",
      "fileCount": 3
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 2,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  },
  "filters": {
    "userId": "user-123",
    "searchTerm": "John",
    "status": "active",
    "dateFrom": null,
    "dateTo": null
  }
}
```

### Expected Error Response

```json
{
  "success": false,
  "loans": [],
  "error": "userId is required",
  "details": "",
  "timestamp": "2024-01-10T15:30:00.000Z"
}
```

## Loan Status Values

Common loan status values (adjust based on your system):
- `pending` - Loan application pending approval
- `approved` - Loan approved, not yet active
- `active` - Loan is currently active
- `paid` - Loan fully paid off
- `defaulted` - Loan in default
- `closed` - Loan closed

## Error Handling

The workflow handles the following error scenarios:

1. **Missing userId** - Returns 400 with error message
2. **Invalid pagination params** - Returns 400 with error message
3. **Invalid sort parameters** - Returns 400 with error message
4. **Database query failure** - Returns 500 with error details
5. **SQL injection attempts** - Escapes special characters in search terms

## Security Considerations

1. **SQL Injection** - Escape special characters in user inputs
2. **Authorization** - Implement user-loan access control if needed
3. **Data visibility** - Ensure users only see loans they have access to
4. **Sensitive data** - Consider masking borrower SSN or other sensitive info
5. **Input validation** - Validate all filter parameters

## Performance Considerations

- Use indexed columns for WHERE clauses (Status, CreatedAt, LoanNumber)
- Limit max page size to 100 items
- Consider caching frequently accessed loan lists
- Add database indexes on:
  - Loans.Status
  - Loans.CreatedAt
  - Loans.LoanNumber
  - Loans.BorrowerName
- File count query can be slow with many loans - use sparingly

## Advanced Features

### User-Loan Access Control

If you need to restrict which loans users can see, add a `UserLoanAccess` table:

```sql
CREATE TABLE UserLoanAccess (
    AccessId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NOT NULL,
    LoanId UNIQUEIDENTIFIER NOT NULL,
    AccessLevel NVARCHAR(50) NOT NULL, -- 'read', 'write', 'admin'
    GrantedAt DATETIME2 DEFAULT GETUTCDATE(),
    FOREIGN KEY (UserId) REFERENCES Users(UserId),
    FOREIGN KEY (LoanId) REFERENCES Loans(LoanId),
    UNIQUE(UserId, LoanId)
);
```

Then modify the query to join with this table:

```sql
SELECT l.*
FROM Loans l
INNER JOIN UserLoanAccess ula ON l.LoanId = ula.LoanId
WHERE ula.UserId = @userId
  AND ula.AccessLevel IN ('read', 'write', 'admin')
```

### Loan Officer Assignment

If loans are assigned to specific loan officers:

```sql
-- Add column to Loans table
ALTER TABLE Loans
ADD LoanOfficerId UNIQUEIDENTIFIER NULL,
    FOREIGN KEY (LoanOfficerId) REFERENCES Users(UserId);

-- Filter by loan officer
WHERE l.LoanOfficerId = @userId
```

## Monitoring

Monitor these metrics:
- Average query execution time
- Most common filters used
- Page size distribution
- Error rate by error type
- Slow query alerts (> 1 second)
- Most searched loan numbers/borrowers

## Caching Strategy

For better performance, consider caching:

```javascript
// Cache key: `loans:${userId}:${status}:${searchTerm}`
// TTL: 5 minutes

// Check cache first
const cacheKey = `loans:${userId}:${status}:${searchTerm}`;
const cached = await redis.get(cacheKey);

if (cached) {
  return JSON.parse(cached);
}

// Query database and cache result
const result = await queryDatabase();
await redis.setex(cacheKey, 300, JSON.stringify(result));

return result;
```

## Future Enhancements

1. Add full-text search with Elasticsearch
2. Support advanced filters (amount range, date range presets)
3. Add loan details in response (reduce additional API calls)
4. Support favorite/pinned loans
5. Add recently viewed loans
6. Support bulk operations (assign files to multiple loans)
7. Add loan summary statistics
8. Support custom sorting preferences
9. Add export to CSV/Excel
10. Implement GraphQL API for flexible queries

## Related Workflows

This workflow is typically used with:
- File Upload workflow (to select loan associations)
- File List workflow (to filter files by loan)
- Loan Details workflow (to show loan information)

## Database Schema

Expected Loans table structure:

```sql
CREATE TABLE Loans (
    LoanId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    LoanNumber NVARCHAR(100) UNIQUE NOT NULL,
    BorrowerName NVARCHAR(255) NOT NULL,
    BorrowerEmail NVARCHAR(255),
    Amount DECIMAL(18, 2) NOT NULL,
    Status NVARCHAR(50) NOT NULL,
    LoanOfficerId UNIQUEIDENTIFIER NULL,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE(),
    INDEX IX_Loans_Status (Status),
    INDEX IX_Loans_LoanNumber (LoanNumber),
    INDEX IX_Loans_CreatedAt (CreatedAt)
);
```
