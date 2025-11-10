# n8n Workflows Implementation Guide

## Overview

This guide provides step-by-step instructions for implementing the 5 n8n workflows for the My Box file management system.

## Prerequisites

✅ n8n instance running at: `http://48.223.194.241:5678`
✅ n8n MCP server configured in `.mcp.json`
✅ Azure Blob Storage account and credentials
✅ Azure SQL Database and credentials

---

## Workflow Implementation Order

Implement workflows in this order to minimize dependencies:

1. **Get Loan List** (no dependencies)
2. **File Upload** (depends on database setup)
3. **File List** (depends on database setup)
4. **File Download** (depends on File Upload)
5. **File Delete** (depends on File Upload)

---

## Step 1: Configure Azure Credentials in n8n

### 1.1 Azure Blob Storage Credential

1. Go to n8n UI → Settings → Credentials
2. Click "New Credential"
3. Select "Azure Blob Storage"
4. Configure:
   - **Credential Name:** `Azure Blob Storage - My Box`
   - **Account Name:** Your Azure Storage account name
   - **Account Key:** Your Azure Storage account key
5. Test and save

### 1.2 Azure SQL Database Credential

1. Go to n8n UI → Settings → Credentials
2. Click "New Credential"
3. Select "Microsoft SQL" or "MSSQL"
4. Configure:
   - **Credential Name:** `Azure SQL - My Box`
   - **Server:** Your Azure SQL server address
   - **Database:** Your database name
   - **User:** Database username
   - **Password:** Database password
   - **Port:** 1433
   - **Encrypt:** Yes
5. Test and save

---

## Step 2: Database Setup

Before implementing workflows, ensure your database schema is ready:

### 2.1 Run Schema Creation Scripts

Execute the SQL scripts to create tables:

```sql
-- See docs/database-schema.sql for complete schema
-- Or use the schema from PDR.md

-- Users table
CREATE TABLE Users (
    UserId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Name NVARCHAR(255) NOT NULL,
    Email NVARCHAR(255) UNIQUE NOT NULL,
    Role NVARCHAR(50) NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE()
);

-- Loans table
CREATE TABLE Loans (
    LoanId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    LoanNumber NVARCHAR(100) UNIQUE NOT NULL,
    BorrowerName NVARCHAR(255) NOT NULL,
    Amount DECIMAL(18, 2) NOT NULL,
    Status NVARCHAR(50) NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE()
);

-- Files table
CREATE TABLE Files (
    FileId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NOT NULL,
    Filename NVARCHAR(500) NOT NULL,
    BlobIdentifier NVARCHAR(500) NOT NULL,
    BlobUrl NVARCHAR(1000),
    FileSize BIGINT NOT NULL,
    ContentType NVARCHAR(100),
    UploadedAt DATETIME2 DEFAULT GETUTCDATE(),
    IsDeleted BIT DEFAULT 0,
    DeletedAt DATETIME2 NULL,
    FOREIGN KEY (UserId) REFERENCES Users(UserId)
);

-- FileLoanAssociations table
CREATE TABLE FileLoanAssociations (
    AssociationId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    FileId UNIQUEIDENTIFIER NOT NULL,
    LoanId UNIQUEIDENTIFIER NOT NULL,
    AssociatedAt DATETIME2 DEFAULT GETUTCDATE(),
    FOREIGN KEY (FileId) REFERENCES Files(FileId),
    FOREIGN KEY (LoanId) REFERENCES Loans(LoanId),
    UNIQUE(FileId, LoanId)
);

-- AuditLogs table (optional but recommended)
CREATE TABLE AuditLogs (
    LogId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NULL,
    Action NVARCHAR(50) NOT NULL,
    ResourceType NVARCHAR(50) NOT NULL,
    ResourceId NVARCHAR(100),
    Timestamp DATETIME2 DEFAULT GETUTCDATE(),
    Details NVARCHAR(MAX)
);
```

### 2.2 Add Indexes for Performance

```sql
CREATE INDEX IX_Files_UserId ON Files(UserId);
CREATE INDEX IX_Files_IsDeleted ON Files(IsDeleted);
CREATE INDEX IX_Files_UploadedAt ON Files(UploadedAt);
CREATE INDEX IX_FileLoanAssociations_FileId ON FileLoanAssociations(FileId);
CREATE INDEX IX_FileLoanAssociations_LoanId ON FileLoanAssociations(LoanId);
CREATE INDEX IX_Loans_Status ON Loans(Status);
CREATE INDEX IX_Loans_LoanNumber ON Loans(LoanNumber);
```

### 2.3 Add Sample Data

```sql
-- Sample users
INSERT INTO Users (UserId, Name, Email, Role)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'Test User', 'test@example.com', 'user'),
    ('22222222-2222-2222-2222-222222222222', 'Admin User', 'admin@example.com', 'admin');

-- Sample loans
INSERT INTO Loans (LoanId, LoanNumber, BorrowerName, Amount, Status)
VALUES
    ('33333333-3333-3333-3333-333333333333', 'L-2024-001', 'John Doe', 250000.00, 'active'),
    ('44444444-4444-4444-4444-444444444444', 'L-2024-002', 'Jane Smith', 180000.00, 'active'),
    ('55555555-5555-5555-5555-555555555555', 'L-2024-003', 'Bob Johnson', 320000.00, 'pending');
```

---

## Step 3: Implement Workflows

### Workflow 1: Get Loan List

**Specification:** [get-loans-spec.md](./get-loans-spec.md)
**Priority:** High (needed for file upload)

**Steps:**
1. Create new workflow in n8n
2. Name it: "Get Loan List"
3. Add webhook trigger node:
   - Path: `/webhook/get-loans`
   - Method: POST
4. Follow node structure from specification
5. Connect Azure SQL credential to all SQL nodes
6. Test with cURL from spec
7. Export workflow to `n8n-workflows/get-loans.json`

**Quick Test:**
```bash
curl -X POST http://48.223.194.241:5678/webhook/get-loans \
  -H "Content-Type: application/json" \
  -d '{"userId":"11111111-1111-1111-1111-111111111111"}'
```

---

### Workflow 2: File Upload

**Specification:** [file-upload-spec.md](./file-upload-spec.md)
**Priority:** High (core feature)

**Steps:**
1. Create new workflow in n8n
2. Name it: "File Upload"
3. Add webhook trigger node:
   - Path: `/webhook/file-upload`
   - Method: POST
   - Binary Data: Enabled
4. Follow node structure from specification
5. Connect both Azure Blob Storage and Azure SQL credentials
6. Important: Configure Azure Blob Storage node:
   - Container: `loan-files`
   - Create container if it doesn't exist
7. Test with a small file first
8. Export workflow to `n8n-workflows/file-upload.json`

**Quick Test:**
```bash
# Create a test file
echo "Test file content" > test.txt

# Upload it
curl -X POST http://48.223.194.241:5678/webhook/file-upload \
  -F "file=@test.txt" \
  -F "userId=11111111-1111-1111-1111-111111111111" \
  -F 'loanIds=["33333333-3333-3333-3333-333333333333"]'
```

---

### Workflow 3: File List

**Specification:** [file-list-spec.md](./file-list-spec.md)
**Priority:** High (core feature)

**Steps:**
1. Create new workflow in n8n
2. Name it: "File List"
3. Add webhook trigger node:
   - Path: `/webhook/file-list`
   - Method: POST
4. Follow node structure from specification
5. Connect Azure SQL credential
6. Pay attention to the dynamic SQL building logic
7. Test with various filters
8. Export workflow to `n8n-workflows/file-list.json`

**Quick Test:**
```bash
curl -X POST http://48.223.194.241:5678/webhook/file-list \
  -H "Content-Type: application/json" \
  -d '{"userId":"11111111-1111-1111-1111-111111111111"}'
```

---

### Workflow 4: File Download

**Specification:** [file-download-spec.md](./file-download-spec.md)
**Priority:** High (core feature)

**Steps:**
1. Create new workflow in n8n
2. Name it: "File Download"
3. Add webhook trigger node:
   - Path: `/webhook/file-download`
   - Method: POST
4. Follow node structure from specification
5. Configure response to return binary data
6. Test by downloading a previously uploaded file
7. Export workflow to `n8n-workflows/file-download.json`

**Quick Test:**
```bash
# Get a fileId from the file list first, then:
curl -X POST http://48.223.194.241:5678/webhook/file-download \
  -H "Content-Type: application/json" \
  -d '{"fileId":"YOUR_FILE_ID","userId":"11111111-1111-1111-1111-111111111111"}' \
  --output downloaded-file.txt
```

---

### Workflow 5: File Delete

**Specification:** [file-delete-spec.md](./file-delete-spec.md)
**Priority:** Medium

**Steps:**
1. Create new workflow in n8n
2. Name it: "File Delete"
3. Add webhook trigger node:
   - Path: `/webhook/file-delete`
   - Method: POST, DELETE
4. Follow node structure from specification
5. Default to soft delete (IsDeleted flag)
6. Hard delete is optional
7. Export workflow to `n8n-workflows/file-delete.json`

**Quick Test:**
```bash
curl -X POST http://48.223.194.241:5678/webhook/file-delete \
  -H "Content-Type: application/json" \
  -d '{"fileId":"YOUR_FILE_ID","userId":"11111111-1111-1111-1111-111111111111","hardDelete":false}'
```

---

## Step 4: Update Environment Variables

After implementing workflows, update `.env` file:

```env
# n8n Configuration
VITE_N8N_BASE_URL=http://48.223.194.241:5678
VITE_N8N_UPLOAD_WEBHOOK=/webhook/file-upload
VITE_N8N_DOWNLOAD_WEBHOOK=/webhook/file-download
VITE_N8N_LIST_WEBHOOK=/webhook/file-list
VITE_N8N_DELETE_WEBHOOK=/webhook/file-delete
VITE_N8N_GET_LOANS_WEBHOOK=/webhook/get-loans

# Azure Configuration (not needed in frontend, but document here)
# AZURE_STORAGE_ACCOUNT=your-account
# AZURE_STORAGE_KEY=your-key
# AZURE_SQL_CONNECTION=Server=...

# Application Configuration
VITE_MAX_FILE_SIZE=104857600
VITE_ALLOWED_FILE_TYPES=.pdf,.doc,.docx,.xls,.xlsx,.jpg,.png,.gif
```

---

## Step 5: Test Integration

### 5.1 Test Each Workflow Individually

Use the test cURL commands in each specification file.

### 5.2 Test Complete Flow

1. Get list of loans
2. Upload a file associated with a loan
3. List files for user
4. List files for specific loan
5. Download the uploaded file
6. Delete the file (soft delete)
7. Verify file is marked as deleted

### 5.3 Test Error Scenarios

- Upload oversized file
- Upload invalid file type
- Download non-existent file
- Download file as wrong user
- Delete file as wrong user

---

## Step 6: Export and Version Control

After implementing all workflows:

1. **Export each workflow:**
   - Go to n8n workflow
   - Click menu → Download
   - Save to `n8n-workflows/` directory

2. **Commit to git:**
   ```bash
   git add n8n-workflows/*.json
   git commit -m "Add n8n workflow implementations"
   ```

3. **Document changes:**
   - Update `n8n-workflows/README.md` if needed
   - Note any deviations from specifications

---

## Troubleshooting

### Common Issues

**Issue: Webhook returns 404**
- Solution: Ensure workflow is activated in n8n
- Check webhook path matches exactly

**Issue: Azure Blob Storage upload fails**
- Solution: Verify credentials are correct
- Check container exists and is accessible
- Verify firewall rules

**Issue: Database connection timeout**
- Solution: Check Azure SQL firewall rules
- Verify connection string is correct
- Test connection from n8n server

**Issue: File download returns empty/corrupted file**
- Solution: Verify binary data is properly configured
- Check response headers are set correctly
- Ensure blob URL is accessible

**Issue: SQL errors in workflows**
- Solution: Check table names match your schema
- Verify column names are correct
- Test SQL queries directly in Azure

---

## Performance Optimization

### For Production

1. **Enable caching** for frequently accessed data
2. **Add connection pooling** for database
3. **Use CDN** for file downloads
4. **Implement rate limiting** on webhooks
5. **Add monitoring** and alerting
6. **Set up backup workflows** for critical operations

### Recommended n8n Settings

- Enable workflow statistics
- Set appropriate timeout values (e.g., 5 minutes for large uploads)
- Configure error workflows
- Enable execution logging
- Set up webhook security (API keys)

---

## Security Hardening

### Before Production Deployment

1. **Add authentication** to webhooks:
   - Use n8n webhook authentication
   - Or add custom API key validation

2. **Enable HTTPS** for all webhook calls

3. **Validate all inputs** in workflows

4. **Use environment variables** for sensitive data

5. **Implement rate limiting**

6. **Set up audit logging** for all operations

7. **Regular security audits** of workflow logic

---

## Monitoring and Logging

### Metrics to Track

- Workflow execution success rate
- Average execution duration
- Error rate by workflow
- File upload size distribution
- Most common error types

### n8n Built-in Monitoring

- View execution history in n8n UI
- Check error logs for failed executions
- Monitor webhook response times

### External Monitoring (Optional)

- Set up Application Insights for Azure
- Use n8n webhooks to send metrics to monitoring service
- Create dashboards for visualization

---

## Next Steps

After successfully implementing all workflows:

1. ✅ Mark tasks as complete in `TASKS.md`
2. ✅ Proceed to Phase 2 of project (React frontend)
3. ✅ Integrate frontend with these webhooks
4. ✅ Add end-to-end tests
5. ✅ Prepare for production deployment

---

## Support and Resources

- **n8n Documentation:** https://docs.n8n.io
- **Azure Blob Storage SDK:** https://docs.microsoft.com/azure/storage/blobs/
- **Project Documentation:** See `PDR.md`, `PLANNING.md`, `TASKS.md`
- **Workflow Specifications:** All files in `n8n-workflows/` directory

---

**Last Updated:** 2025-11-10
**Status:** Ready for Implementation
