# n8n Workflows for My Box File Management System

> **⚠️ DEPRECATED**: This documentation is obsolete. The project has been migrated from n8n + Azure to Firebase.
>
> **Current Architecture:**
> - Firebase Cloud Functions (replaced n8n webhooks)
> - Firebase Data Connect (replaced Azure SQL)
> - Firebase Storage (replaced Azure Blob Storage)
> - Firebase Email Link Auth (replaced custom magic links)
>
> See `docs/IMPLEMENTATION-SUMMARY.md` for current implementation details.
> See `docs/MIGRATION-STATUS.md` for migration status.
>
> These files are kept for historical reference only.

---

## Historical Documentation (Archived)

This directory contains n8n workflow specifications and exported workflow JSON files that were originally planned for the My Box application.

## Overview (OBSOLETE)

~~All file operations in the My Box application are handled through n8n workflows. This provides a flexible, maintainable middleware layer between the React frontend and Azure cloud services.~~

## n8n Instance Configuration

**n8n API URL:** `http://48.223.194.241:5678`

## Workflows

### 1. File Upload Workflow
**File:** `file-upload.json`
**Webhook Path:** `/webhook/file-upload`
**Method:** POST
**Purpose:** Upload files to Azure Blob Storage and create database records

### 2. File Download Workflow
**File:** `file-download.json`
**Webhook Path:** `/webhook/file-download`
**Method:** POST
**Purpose:** Retrieve files from Azure Blob Storage

### 3. File List Workflow
**File:** `file-list.json`
**Webhook Path:** `/webhook/file-list`
**Method:** POST
**Purpose:** Get filtered list of user files

### 4. File Delete Workflow
**File:** `file-delete.json`
**Webhook Path:** `/webhook/file-delete`
**Method:** POST/DELETE
**Purpose:** Soft-delete files from database

### 5. Get Loan List Workflow
**File:** `get-loans.json`
**Webhook Path:** `/webhook/get-loans`
**Method:** POST
**Purpose:** Retrieve available loans for a user

## Azure Credentials Required

Before implementing these workflows, ensure you have configured the following credentials in n8n:

### Azure Blob Storage Credential
- **Account Name:** Your Azure Storage account name
- **Account Key:** Your Azure Storage account key
- **Container Name:** `loan-files`

### Azure SQL Database Credential
- **Server:** Your Azure SQL server address
- **Database:** Your database name
- **User:** Database username
- **Password:** Database password

## Implementation Steps

1. **Import credentials into n8n**
   - Go to n8n Settings > Credentials
   - Add Azure Blob Storage credential
   - Add Azure SQL Database credential

2. **Import or create workflows**
   - Use the JSON files in this directory
   - Or create workflows manually using specifications below

3. **Test each workflow**
   - Use n8n's test webhook feature
   - Verify Azure connections work
   - Check database operations

4. **Update frontend configuration**
   - Copy webhook URLs to `.env` file
   - Test integration from React app

## Workflow Specifications

See individual specification files:
- [file-upload-spec.md](./file-upload-spec.md)
- [file-download-spec.md](./file-download-spec.md)
- [file-list-spec.md](./file-list-spec.md)
- [file-delete-spec.md](./file-delete-spec.md)
- [get-loans-spec.md](./get-loans-spec.md)

## Testing Workflows

### Test File Upload
```bash
curl -X POST http://48.223.194.241:5678/webhook/file-upload \
  -F "file=@test.pdf" \
  -F "userId=test-user-id" \
  -F "loanIds=[\"loan-1\",\"loan-2\"]"
```

### Test File List
```bash
curl -X POST http://48.223.194.241:5678/webhook/file-list \
  -H "Content-Type: application/json" \
  -d '{"userId":"test-user-id"}'
```

### Test File Download
```bash
curl -X POST http://48.223.194.241:5678/webhook/file-download \
  -H "Content-Type: application/json" \
  -d '{"fileId":"test-file-id","userId":"test-user-id"}' \
  --output downloaded-file.pdf
```

### Test File Delete
```bash
curl -X POST http://48.223.194.241:5678/webhook/file-delete \
  -H "Content-Type: application/json" \
  -d '{"fileId":"test-file-id","userId":"test-user-id"}'
```

### Test Get Loans
```bash
curl -X POST http://48.223.194.241:5678/webhook/get-loans \
  -H "Content-Type: application/json" \
  -d '{"userId":"test-user-id"}'
```

## Troubleshooting

### Webhook not responding
- Check workflow is activated in n8n
- Verify webhook path is correct
- Check n8n instance is running

### Azure connection errors
- Verify credentials are correctly configured
- Check Azure firewall rules
- Verify connection strings

### Database errors
- Check SQL syntax in workflow
- Verify table schema matches queries
- Check database permissions

## Monitoring and Logging

All workflows include error handling nodes that:
- Log errors to n8n execution logs
- Return appropriate error responses to client
- Include detailed error messages for debugging

Access logs in n8n UI: Executions > View execution logs

## Security Considerations

- API key authentication should be added to webhooks
- Validate all user inputs in workflows
- Use parameterized SQL queries to prevent SQL injection
- Ensure proper access control (users can only access their own files)
- Enable HTTPS in production

## Future Enhancements

- Add file virus scanning
- Implement rate limiting
- Add caching layer for file lists
- Support chunked uploads for large files
- Add workflow for bulk operations
