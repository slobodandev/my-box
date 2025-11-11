# Azure Setup Guide for n8n Workflows

This guide walks you through setting up Azure Blob Storage and Azure SQL Database credentials in n8n, then updating the workflows with production-ready Azure nodes.

---

## Prerequisites

- ✅ n8n instance running at http://48.223.194.241:5678
- ⏳ Azure Subscription with access to create resources
- ⏳ Azure Blob Storage Account
- ⏳ Azure SQL Database

---

## Part 1: Azure Blob Storage Setup

### Step 1: Create Azure Storage Account

1. **Go to Azure Portal:** https://portal.azure.com
2. **Create Storage Account:**
   - Click "Create a resource"
   - Search for "Storage Account"
   - Click "Create"

3. **Configure Storage Account:**
   - **Subscription:** Select your subscription
   - **Resource Group:** Create new or use existing
   - **Storage Account Name:** `myboxfilestorage` (must be globally unique)
   - **Region:** Choose closest to your users
   - **Performance:** Standard
   - **Redundancy:** LRS (Locally Redundant Storage) for dev, GRS for production
   - Click "Review + Create" → "Create"

4. **Create Container:**
   - Go to your Storage Account
   - Click "Containers" in the left menu
   - Click "+ Container"
   - **Name:** `loan-files`
   - **Public access level:** Private (no anonymous access)
   - Click "Create"

5. **Get Connection String:**
   - In your Storage Account, go to "Access keys" (under Security + networking)
   - Copy "Connection string" from key1 or key2
   - **Format:** `DefaultEndpointsProtocol=https;AccountName=myboxfilestorage;AccountKey=xxx;EndpointSuffix=core.windows.net`

### Step 2: Add Azure Storage Credential to n8n

1. **Go to n8n:** http://48.223.194.241:5678
2. **Open Credentials:**
   - Click your profile icon (top right)
   - Click "Settings"
   - Click "Credentials" tab

3. **Add New Credential:**
   - Click "Add Credential"
   - Search for "Azure Storage"
   - Click "Azure Storage"

4. **Configure Credential:**
   - **Credential Name:** `Azure Storage Account`
   - **Connection String:** Paste the connection string from Step 1.5
   - Click "Test" to verify connection
   - Click "Save"

5. **Copy Credential ID:**
   - After saving, note the credential ID (you'll see it in the URL or credential list)
   - You can now use this credential in all Azure Storage nodes in your workflows

---

## Part 2: Azure SQL Database Setup

### Step 1: Create Azure SQL Database

1. **Go to Azure Portal:** https://portal.azure.com
2. **Create SQL Database:**
   - Click "Create a resource"
   - Search for "SQL Database"
   - Click "Create"

3. **Configure Database:**
   - **Subscription:** Select your subscription
   - **Resource Group:** Same as Storage Account
   - **Database Name:** `mybox-db`
   - **Server:** Click "Create new"
     - **Server name:** `mybox-sql-server` (must be globally unique)
     - **Location:** Same as Storage Account
     - **Authentication:** SQL authentication
     - **Server admin login:** `myboxadmin`
     - **Password:** [Create strong password]
     - Click "OK"
   - **Compute + storage:** Click "Configure database"
     - Choose "Basic" for dev (cheaper), "Standard" for production
     - Click "Apply"
   - Click "Review + Create" → "Create"

4. **Configure Firewall:**
   - Go to your SQL Server (not database)
   - Click "Networking" (under Security)
   - **Public network access:** Enabled
   - Click "+ Add client IP" to add your current IP
   - **Allow Azure services:** Yes
   - Add IP range for n8n server: `48.223.194.241/32`
   - Click "Save"

5. **Create Database Schema:**
   - Connect using Azure Data Studio, SQL Server Management Studio, or Azure Portal Query Editor
   - Run the schema creation script (provided in `database-schema.sql`)

### Step 2: Get Connection Details

**Connection String Format:**
```
Server=mybox-sql-server.database.windows.net;Database=mybox-db;User Id=myboxadmin;Password=[your-password];Encrypt=true;TrustServerCertificate=false;Connection Timeout=30;
```

**Individual Details:**
- **Server:** `mybox-sql-server.database.windows.net`
- **Database:** `mybox-db`
- **User:** `myboxadmin`
- **Password:** [your password]
- **Port:** `1433` (default)

### Step 3: Add Azure SQL Credential to n8n

1. **Go to n8n:** http://48.223.194.241:5678
2. **Open Credentials:**
   - Click your profile icon → Settings → Credentials

3. **Add New Credential:**
   - Click "Add Credential"
   - Search for "Microsoft SQL"
   - Click "Microsoft SQL"

4. **Configure Credential:**
   - **Credential Name:** `Azure SQL Database`
   - **Server:** `mybox-sql-server.database.windows.net`
   - **Database:** `mybox-db`
   - **User:** `myboxadmin`
   - **Password:** [your password]
   - **Port:** `1433`
   - **Connect via SSL:** Yes
   - Click "Test Connection" to verify
   - Click "Save"

5. **Copy Credential ID:**
   - Note the credential ID for updating workflows

---

## Part 3: Update n8n Workflows

### Method 1: Manual Update via n8n UI (Recommended)

For each workflow (File Upload, File Download, File List, File Delete, Get Loan List):

1. **Open Workflow in n8n:**
   - Go to http://48.223.194.241:5678
   - Click "Workflows" in left menu
   - Click on the workflow name

2. **Replace Mock Nodes with Real Azure Nodes:**

   **For Azure Storage nodes (File Upload/Download):**
   - Delete any "Simulate Blob Upload" or mock function nodes
   - Add "Azure Storage" node
   - Configure the node:
     - **Credential:** Select "Azure Storage Account"
     - **Resource:** Blob
     - **Operation:**
       - `create` for file upload
       - `get` for file download
       - `delete` for file deletion (optional)
     - **Container Name:** `loan-files`
     - **Blob Name:** Use expression from previous node (e.g., `={{ $json.blobName }}`)
     - **Data Property Name:** `binary` for upload, `data` for download
   - Connect to workflow

   **For Azure SQL nodes:**
   - Delete any mock database function nodes
   - Add "Microsoft SQL" node
   - Configure the node:
     - **Credential:** Select "Azure SQL Database"
     - **Operation:** "Execute Query"
     - **Query:** Use SQL from production JSON files
     - **Parameters:** Add parameters as needed
   - Connect to workflow

3. **Test Workflow:**
   - Click "Execute Workflow" button
   - Provide test data
   - Verify Azure resources are accessed correctly

4. **Save Workflow:**
   - Click "Save" button
   - Activate workflow if not already active

### Method 2: Import Production Workflow JSONs

**NOTE:** This method requires updating credential IDs in the JSON files first.

1. **Update Credential IDs in JSON files:**
   - Open each `*-production.json` file
   - Find all instances of:
     - `"AZURE_STORAGE_CREDENTIAL_ID"` → Replace with your Azure Storage credential ID
     - `"AZURE_SQL_CREDENTIAL_ID"` → Replace with your SQL Database credential ID
   - Save files

2. **Import Workflows:**
   - In n8n, click "Workflows" → "Import"
   - Upload each production JSON file
   - Or use n8n API to update existing workflows:

```bash
# Example: Update File Upload workflow
curl -X PATCH "http://48.223.194.241:5678/api/v1/workflows/WasCK3iLH2jj4gap" \
  -H "X-N8N-API-KEY: [your-api-key]" \
  -H "Content-Type: application/json" \
  -d @n8n-workflows/file-upload-production.json
```

---

## Part 4: Database Schema

Create the following tables in your Azure SQL Database:

```sql
-- Users table
CREATE TABLE Users (
    UserId NVARCHAR(50) PRIMARY KEY,
    Email NVARCHAR(255) NOT NULL UNIQUE,
    FirstName NVARCHAR(100),
    LastName NVARCHAR(100),
    Role NVARCHAR(50) DEFAULT 'borrower',
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    LastLoginAt DATETIME2,
    IsActive BIT DEFAULT 1
);

-- Loans table
CREATE TABLE Loans (
    LoanId NVARCHAR(50) PRIMARY KEY,
    UserId NVARCHAR(50) NOT NULL,
    LoanNumber NVARCHAR(100) NOT NULL UNIQUE,
    BorrowerName NVARCHAR(255) NOT NULL,
    BorrowerEmail NVARCHAR(255),
    LoanAmount DECIMAL(18,2),
    LoanType NVARCHAR(50),
    Status NVARCHAR(50) DEFAULT 'pending',
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (UserId) REFERENCES Users(UserId)
);

-- Files table
CREATE TABLE Files (
    FileId NVARCHAR(50) PRIMARY KEY,
    UserId NVARCHAR(50) NOT NULL,
    OriginalFilename NVARCHAR(500) NOT NULL,
    BlobIdentifier NVARCHAR(500) NOT NULL,
    FileSize BIGINT NOT NULL,
    ContentType NVARCHAR(255),
    UploadedAt DATETIME2 DEFAULT GETDATE(),
    IsDeleted BIT DEFAULT 0,
    DeletedAt DATETIME2,
    FOREIGN KEY (UserId) REFERENCES Users(UserId)
);

-- File-Loan Associations table
CREATE TABLE FileLoanAssociations (
    AssociationId INT IDENTITY(1,1) PRIMARY KEY,
    FileId NVARCHAR(50) NOT NULL,
    LoanId NVARCHAR(50) NOT NULL,
    AssociatedAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (FileId) REFERENCES Files(FileId),
    FOREIGN KEY (LoanId) REFERENCES Loans(LoanId),
    UNIQUE (FileId, LoanId)
);

-- Create indexes for better performance
CREATE INDEX IX_Files_UserId ON Files(UserId);
CREATE INDEX IX_Files_IsDeleted ON Files(IsDeleted);
CREATE INDEX IX_FileLoanAssociations_FileId ON FileLoanAssociations(FileId);
CREATE INDEX IX_FileLoanAssociations_LoanId ON FileLoanAssociations(LoanId);
CREATE INDEX IX_Loans_UserId ON Loans(UserId);
```

---

## Part 5: Test the Workflows

### Test File Upload

```bash
curl -X POST "http://48.223.194.241:5678/webhook/file-upload" \
  -F "userId=user-123" \
  -F "loanIds=[\"loan-1\"]" \
  -F "file=@/path/to/test-file.pdf"
```

**Expected Response:**
```json
{
  "success": true,
  "fileId": "abc123-1234567890",
  "filename": "test-file.pdf",
  "blobIdentifier": "user-123/1234567890-abc123.pdf",
  "blobUrl": "https://myboxfilestorage.blob.core.windows.net/loan-files/user-123/1234567890-abc123.pdf",
  "size": 102400,
  "contentType": "application/pdf",
  "uploadedAt": "2025-11-10T20:00:00.000Z",
  "loanIds": ["loan-1"],
  "message": "File uploaded successfully"
}
```

### Test File List

```bash
curl -X POST "http://48.223.194.241:5678/webhook/file-list" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "page": 1,
    "pageSize": 10
  }'
```

### Test File Download

```bash
curl -X POST "http://48.223.194.241:5678/webhook/file-download" \
  -H "Content-Type: application/json" \
  -d '{
    "fileId": "abc123-1234567890",
    "userId": "user-123"
  }' \
  --output downloaded-file.pdf
```

### Test File Delete

```bash
curl -X POST "http://48.223.194.241:5678/webhook/file-delete" \
  -H "Content-Type: application/json" \
  -d '{
    "fileId": "abc123-1234567890",
    "userId": "user-123"
  }'
```

### Test Get Loans

```bash
curl -X POST "http://48.223.194.241:5678/webhook/get-loans" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "includeFileCount": true
  }'
```

---

## Part 6: Seed Data (Optional)

Add test data to your database:

```sql
-- Insert test user
INSERT INTO Users (UserId, Email, FirstName, LastName, Role)
VALUES ('user-123', 'test@example.com', 'Test', 'User', 'borrower');

-- Insert test loans
INSERT INTO Loans (LoanId, UserId, LoanNumber, BorrowerName, BorrowerEmail, LoanAmount, LoanType, Status)
VALUES
('loan-1', 'user-123', '12345', 'John Doe', 'john@example.com', 250000.00, 'Mortgage', 'active'),
('loan-2', 'user-123', '67890', 'Jane Smith', 'jane@example.com', 350000.00, 'Mortgage', 'active');
```

---

## Troubleshooting

### Azure Blob Storage Issues

**Error: "Connection failed"**
- Verify connection string is correct
- Check Azure Storage Account is not behind firewall
- Verify n8n server IP is whitelisted

**Error: "Container not found"**
- Verify container name is exactly `loan-files`
- Check container exists in Azure Portal

### Azure SQL Database Issues

**Error: "Cannot connect to server"**
- Verify firewall rules include n8n server IP (48.223.194.241)
- Check "Allow Azure services" is enabled
- Verify server name format: `servername.database.windows.net`

**Error: "Login failed"**
- Verify username and password are correct
- Check user has permissions on the database

**Error: "Table does not exist"**
- Run the database schema creation script
- Verify you're connected to the correct database

### n8n Workflow Issues

**Workflow fails at Azure node:**
- Check credential is selected in the node
- Verify credential test connection passes
- Review execution logs in n8n for detailed error

**Webhook not responding:**
- Verify workflow is activated (toggle switch is ON)
- Check webhook path matches your API calls
- Review n8n logs for errors

---

## Security Best Practices

1. **Storage Account:**
   - Use SAS tokens for granular access control (advanced)
   - Enable soft delete for blob recovery
   - Enable versioning for important files
   - Use private endpoints for production

2. **SQL Database:**
   - Use separate user accounts for n8n (not admin)
   - Enable auditing and threat detection
   - Regular backups
   - Use Azure Key Vault for secrets (advanced)

3. **n8n:**
   - Secure n8n instance with authentication
   - Use HTTPS for webhook endpoints
   - Rotate credentials periodically
   - Monitor execution logs for suspicious activity

---

## Next Steps

1. ✅ Complete Azure resource setup
2. ✅ Configure credentials in n8n
3. ✅ Update all 5 workflows with production Azure nodes
4. ✅ Test all workflows with curl commands
5. ✅ Add seed data for testing
6. ✅ Update React app environment variables
7. ✅ Test end-to-end file upload from React app

---

## Support

If you encounter issues:
1. Check Azure Portal for resource status
2. Review n8n execution logs
3. Test credentials using Azure tools (Azure Storage Explorer, SSMS)
4. Verify network connectivity and firewall rules

---

**Last Updated:** 2025-11-10
**Created By:** Development Team
