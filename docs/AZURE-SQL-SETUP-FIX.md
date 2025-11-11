# Azure SQL Database Setup - Fix for Free Tier Error

## Error Explanation

**Error Code:** `ProvisioningDisabled`
**Error Message:** "Provisioning of free limit database is not supported for provided service level objective or region"

**Causes:**
1. Azure only allows **1 free database per subscription** (you may already have one)
2. Free tier not available in your selected region
3. Selected service tier doesn't support free option

---

## Solution 1: Use Basic Tier (RECOMMENDED for Development)

**Cost:** ~$5/month
**Performance:** 5 DTUs, 2GB storage
**Best For:** Development, testing, small production apps

### Step-by-Step Instructions:

1. **Go to Azure Portal:** https://portal.azure.com

2. **Create SQL Database:**
   - Click "Create a resource"
   - Search for "SQL Database"
   - Click "Create"

3. **Configure Database:**
   - **Subscription:** Select your subscription
   - **Resource Group:** Create new or use existing (e.g., `mybox-resources`)
   - **Database Name:** `mybox-auth-db`
   - **Server:** Click "Create new"
     - **Server name:** `mybox-sql-server-[unique-id]` (must be globally unique)
     - **Location:** Choose closest to you (e.g., `East US`, `West Europe`)
     - **Authentication:** SQL authentication
     - **Server admin login:** `myboxadmin`
     - **Password:** Create strong password (save it securely!)
     - Click "OK"

4. **Configure Compute + Storage:**
   - Click "Configure database"
   - Select **"Basic"** tier
   - **Service tier:** Basic
   - **DTUs:** 5 (cannot change for Basic)
   - **Max data size:** 2 GB
   - Click "Apply"

5. **Networking:**
   - **Connectivity method:** Public endpoint
   - **Allow Azure services:** YES (important for n8n)
   - **Add current client IP:** YES
   - **Add IP for n8n server:** Add `48.223.194.241/32`

6. **Additional Settings:**
   - **Use existing data:** None
   - **Collation:** SQL_Latin1_General_CP1_CI_AS (default)

7. **Click "Review + Create" → "Create"**

**Provisioning Time:** 2-5 minutes

---

## Solution 2: Use Standard S0 Tier (Better Performance)

**Cost:** ~$15/month
**Performance:** 10 DTUs, 250GB storage
**Best For:** Production applications with moderate traffic

### Configuration:
- Follow same steps as Basic tier
- In "Configure database", select **"Standard S0"**
- Better performance for concurrent users
- Suitable for production

---

## Solution 3: Check Existing Free Database

If you want to use the free tier, check if you already have a free database:

```bash
# Using Azure CLI
az sql db list --query "[?sku.tier=='Free']" --output table

# Check in Portal
Azure Portal → SQL databases → Check for any database with "Free" tier
```

If you have one, you can either:
- Delete the existing free database
- Use the existing database for this project
- Use Basic tier for this project

---

## Solution 4: Try Different Region (Free Tier Only)

Free tier is available in limited regions. Try these:

**Supported Regions for Free Tier:**
- East US
- West US 2
- West Europe
- Southeast Asia

**When creating, select one of these regions for your SQL Server.**

---

## Connection String Format

After database is created, your connection string will be:

```
Server=mybox-sql-server-[unique-id].database.windows.net;
Database=mybox-auth-db;
User Id=myboxadmin;
Password=[your-password];
Encrypt=true;
TrustServerCertificate=false;
Connection Timeout=30;
```

---

## Firewall Configuration

**Critical:** Add these IP addresses to SQL Server firewall:

1. **Your development machine IP:**
   - Azure Portal → SQL Server → Networking
   - Click "Add client IP"

2. **n8n server IP:**
   - Add firewall rule:
   - Name: `n8n-server`
   - Start IP: `48.223.194.241`
   - End IP: `48.223.194.241`

3. **Allow Azure services:**
   - Enable "Allow Azure services and resources to access this server"

---

## Run Database Schema

Once database is created:

### Method 1: Azure Portal Query Editor

1. Go to your database in Azure Portal
2. Click "Query editor (preview)" in left menu
3. Login with your admin credentials
4. Copy entire contents of `database/auth-schema.sql`
5. Paste and click "Run"

### Method 2: Azure Data Studio (Recommended)

1. Download Azure Data Studio: https://aka.ms/azuredatastudio
2. Connect to your database:
   - Server: `mybox-sql-server-[unique-id].database.windows.net`
   - Authentication: SQL Login
   - User: `myboxadmin`
   - Password: [your password]
   - Database: `mybox-auth-db`
   - Encrypt: True
3. Open `database/auth-schema.sql`
4. Click "Run"

### Method 3: SQL Server Management Studio (SSMS)

1. Download SSMS: https://aka.ms/ssmsfullsetup
2. Connect with same credentials as Azure Data Studio
3. Open and execute `database/auth-schema.sql`

---

## Verify Schema Installation

Run this query to verify tables were created:

```sql
-- Check all authentication tables
SELECT
    TABLE_NAME,
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = t.TABLE_NAME) AS ColumnCount
FROM INFORMATION_SCHEMA.TABLES t
WHERE TABLE_NAME IN ('AuthSessions', 'VerificationCodes', 'AuthAuditLog', 'RateLimitTracking', 'Users', 'Loans', 'Files', 'FileLoanAssociations')
ORDER BY TABLE_NAME;

-- Should return 8 tables:
-- AuthAuditLog
-- AuthSessions
-- Files
-- FileLoanAssociations
-- Loans
-- RateLimitTracking
-- Users
-- VerificationCodes
```

---

## Cost Comparison

| Tier | Monthly Cost | DTUs | Storage | Best For |
|------|--------------|------|---------|----------|
| Free | $0 | Limited | 32MB | Learning/Testing |
| Basic | ~$5 | 5 | 2GB | Development |
| Standard S0 | ~$15 | 10 | 250GB | Small Production |
| Standard S1 | ~$30 | 20 | 250GB | Production |

**Recommendation:** Start with **Basic** for development, upgrade to **Standard S0** for production.

---

## Configure n8n Credentials

After database is created:

1. **Go to n8n:** http://48.223.194.241:5678

2. **Add Credential:**
   - Click profile icon → Settings → Credentials
   - Click "Add Credential"
   - Search for "Microsoft SQL"
   - Click "Microsoft SQL"

3. **Configure:**
   - **Credential Name:** `Azure SQL Database - MyBox Auth`
   - **Server:** `mybox-sql-server-[unique-id].database.windows.net`
   - **Database:** `mybox-auth-db`
   - **User:** `myboxadmin`
   - **Password:** [your password]
   - **Port:** `1433`
   - **Connect via SSL:** YES ✓
   - Click "Test Connection"
   - If successful, click "Save"

4. **Copy Credential ID:**
   - After saving, note the credential ID
   - You'll need this for workflow configuration

---

## Troubleshooting

### Error: "Cannot open server"
**Solution:** Check firewall rules, ensure your IP is whitelisted

### Error: "Login failed for user"
**Solution:** Verify username/password, ensure using SQL authentication

### Error: "Cannot connect to server"
**Solution:**
- Verify server name format: `servername.database.windows.net`
- Check internet connection
- Verify SSL is enabled

### Error: "Database does not exist"
**Solution:** Verify database name is correct, wait for provisioning to complete

---

## Next Steps

1. ✅ Create Azure SQL Database (Basic tier)
2. ✅ Configure firewall rules
3. ✅ Run `database/auth-schema.sql` to create tables
4. ✅ Run `database/schema.sql` to create Users, Loans, Files tables (if not exists)
5. ✅ Configure SQL credential in n8n
6. ✅ Test connection
7. ✅ Import authentication workflows to n8n
8. ✅ Configure Azure Storage credential
9. ✅ Test authentication flow

---

## Security Best Practices

1. **Strong Admin Password:**
   - Minimum 16 characters
   - Mix of uppercase, lowercase, numbers, symbols
   - Store in password manager

2. **Limited Firewall Access:**
   - Only whitelist necessary IPs
   - Review regularly
   - Remove unused rules

3. **Separate Credentials:**
   - Create separate SQL user for n8n (not admin)
   - Grant only necessary permissions

4. **Enable Auditing:**
   - Azure SQL → Auditing
   - Enable for compliance and security

5. **Regular Backups:**
   - Azure SQL auto-backups enabled
   - Test restore procedure
   - Set retention period

---

## Support Resources

- **Azure SQL Documentation:** https://docs.microsoft.com/en-us/azure/azure-sql/
- **Pricing Calculator:** https://azure.microsoft.com/en-us/pricing/calculator/
- **Azure Support:** https://azure.microsoft.com/en-us/support/

---

**Created:** 2025-11-11
**Status:** Ready for implementation
**Recommended Tier:** Basic ($5/month)
