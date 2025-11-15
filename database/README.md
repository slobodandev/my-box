# Database Schema Files

This directory contains SQL schema files for the MyBox loan file management system.

## Execution Order

**IMPORTANT:** Run the SQL files in this specific order:

### 1. `schema.sql` (Run First)
Creates the core application tables:
- **Users** - User accounts (borrowers, loan officers, admins)
- **Loans** - Loan information and status
- **Files** - File metadata (actual files stored in Azure Blob Storage)
- **FileLoanAssociations** - Many-to-many relationship between files and loans

### 2. `auth-schema.sql` (Run Second)
Creates the authentication system tables:
- **AuthSessions** - Magic links and active user sessions
- **VerificationCodes** - Email verification codes (6-digit TOTP)
- **AuthAuditLog** - Complete audit trail of authentication events
- **RateLimitTracking** - Rate limiting for authentication endpoints

## Why This Order?

The `auth-schema.sql` file has a foreign key constraint:
```sql
FOREIGN KEY (UserId) REFERENCES Users(UserId)
```

This means the `Users` table must exist before creating the `AuthSessions` table. If you run `auth-schema.sql` first, you'll get this error:
```
Foreign key 'FK__AuthSessi__UserI__73BA3083' references invalid table 'Users'.
```

## Quick Start

### Using Azure Portal Query Editor

1. **Run schema.sql:**
   ```sql
   -- Copy and paste entire contents of schema.sql
   -- Click "Run"
   -- Wait for completion
   ```

2. **Run auth-schema.sql:**
   ```sql
   -- Copy and paste entire contents of auth-schema.sql
   -- Click "Run"
   -- Wait for completion
   ```

### Using Azure Data Studio or SSMS

1. Connect to your Azure SQL Database
2. Open `schema.sql` → Execute
3. Open `auth-schema.sql` → Execute

## Verification

After running both files, verify all tables were created:

```sql
SELECT
    TABLE_NAME,
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = t.TABLE_NAME) AS ColumnCount
FROM INFORMATION_SCHEMA.TABLES t
WHERE TABLE_NAME IN ('Users', 'Loans', 'Files', 'FileLoanAssociations', 'AuthSessions', 'VerificationCodes', 'AuthAuditLog', 'RateLimitTracking')
ORDER BY TABLE_NAME;
```

Expected result: **8 tables**

| Table Name | Column Count |
|------------|--------------|
| AuthAuditLog | 9 |
| AuthSessions | 17 |
| Files | 13 |
| FileLoanAssociations | 4 |
| Loans | 13 |
| RateLimitTracking | 6 |
| Users | 11 |
| VerificationCodes | 8 |

## Schema Overview

### Core Tables (schema.sql)

#### Users
```sql
CREATE TABLE Users (
    UserId NVARCHAR(50) PRIMARY KEY,
    Email NVARCHAR(255) NOT NULL UNIQUE,
    FirstName NVARCHAR(100),
    LastName NVARCHAR(100),
    Role NVARCHAR(50) NOT NULL DEFAULT 'borrower',
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    LastLoginAt DATETIME2,
    PhoneNumber NVARCHAR(20)
);
```

#### Loans
```sql
CREATE TABLE Loans (
    LoanId NVARCHAR(50) PRIMARY KEY,
    UserId NVARCHAR(50) NOT NULL,
    LoanNumber NVARCHAR(100) NOT NULL UNIQUE,
    BorrowerName NVARCHAR(255) NOT NULL,
    LoanAmount DECIMAL(18, 2),
    LoanType NVARCHAR(100),
    Status NVARCHAR(50) NOT NULL DEFAULT 'active',
    -- ... more columns
    FOREIGN KEY (UserId) REFERENCES Users(UserId)
);
```

#### Files
```sql
CREATE TABLE Files (
    FileId NVARCHAR(50) PRIMARY KEY,
    UserId NVARCHAR(50) NOT NULL,
    OriginalFilename NVARCHAR(500) NOT NULL,
    BlobIdentifier NVARCHAR(500) NOT NULL UNIQUE,
    FileSize BIGINT NOT NULL,
    MimeType NVARCHAR(255),
    UploadedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    IsDeleted BIT NOT NULL DEFAULT 0,
    -- ... more columns
    FOREIGN KEY (UserId) REFERENCES Users(UserId)
);
```

#### FileLoanAssociations
```sql
CREATE TABLE FileLoanAssociations (
    AssociationId INT IDENTITY(1,1) PRIMARY KEY,
    FileId NVARCHAR(50) NOT NULL,
    LoanId NVARCHAR(50) NOT NULL,
    AssociatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (FileId) REFERENCES Files(FileId),
    FOREIGN KEY (LoanId) REFERENCES Loans(LoanId)
);
```

### Authentication Tables (auth-schema.sql)

#### AuthSessions
```sql
CREATE TABLE AuthSessions (
    SessionId NVARCHAR(50) PRIMARY KEY,
    UserId NVARCHAR(50) NOT NULL,
    LoanIds NVARCHAR(MAX), -- JSON array
    EmailHash NVARCHAR(64) NOT NULL, -- SHA-256
    MagicToken NVARCHAR(255) UNIQUE,
    SessionToken NVARCHAR(1000), -- JWT
    Status NVARCHAR(20) NOT NULL DEFAULT 'pending',
    ExpiresAt DATETIME2 NOT NULL,
    -- ... more columns
    FOREIGN KEY (UserId) REFERENCES Users(UserId)
);
```

#### VerificationCodes
```sql
CREATE TABLE VerificationCodes (
    CodeId INT IDENTITY(1,1) PRIMARY KEY,
    SessionId NVARCHAR(50) NOT NULL,
    CodeHash NVARCHAR(64) NOT NULL, -- SHA-256
    ExpiresAt DATETIME2 NOT NULL,
    AttemptCount INT NOT NULL DEFAULT 0,
    MaxAttempts INT NOT NULL DEFAULT 3,
    IsUsed BIT NOT NULL DEFAULT 0,
    FOREIGN KEY (SessionId) REFERENCES AuthSessions(SessionId)
);
```

## Additional Features

### Stored Procedures (schema.sql)
- `sp_GetUserFiles` - Retrieve files for a user (with optional loan filter)
- `sp_DeleteFile` - Soft delete a file
- `sp_AssociateFileWithLoans` - Associate file with multiple loans

### Stored Procedures (auth-schema.sql)
- `sp_CleanupExpiredAuthSessions` - Daily cleanup of old sessions
- `sp_ExpireOldSessions` - Mark expired sessions
- `sp_GetAuthSessionStats` - Authentication statistics

### Views (schema.sql)
- `vw_FilesWithLoans` - Files with associated loan information
- `vw_LoansWithFileCounts` - Loans with file counts

### Views (auth-schema.sql)
- `vw_ActiveSessions` - Currently active authentication sessions
- `vw_AuthenticationFailures` - Security monitoring (failed auth attempts)

### Functions (auth-schema.sql)
- `fn_IsSessionValid` - Check if session is valid
- `fn_GetRateLimitStatus` - Check rate limit status

## Sample Data

Both files include commented-out sample data sections for development/testing. To use:

1. Uncomment the sample data section
2. Execute the INSERT statements
3. Verify data was inserted

## Troubleshooting

### Error: "Foreign key references invalid table 'Users'"
**Solution:** You ran `auth-schema.sql` before `schema.sql`. Run `schema.sql` first.

### Error: "There is already an object named 'Users' in the database"
**Solution:** The tables already exist. Either:
- Skip `schema.sql` and run only `auth-schema.sql`
- Drop existing tables first (careful - this deletes data!)
- Use a fresh database

### How to drop all tables (WARNING: Deletes all data)
```sql
-- Drop in reverse order due to foreign keys
DROP TABLE IF EXISTS VerificationCodes;
DROP TABLE IF EXISTS AuthAuditLog;
DROP TABLE IF EXISTS RateLimitTracking;
DROP TABLE IF EXISTS AuthSessions;
DROP TABLE IF EXISTS FileLoanAssociations;
DROP TABLE IF EXISTS Files;
DROP TABLE IF EXISTS Loans;
DROP TABLE IF EXISTS Users;
```

## Related Documentation

- **Azure SQL Setup Guide:** `../docs/AZURE-SQL-SETUP-FIX.md`
- **Authentication Implementation Plan:** `../docs/AUTHENTICATION-PLAN.md`
- **Authentication Implementation Status:** `../docs/AUTH-IMPLEMENTATION-STATUS.md`

## Support

For issues or questions, see:
- [Azure SQL Documentation](https://docs.microsoft.com/en-us/azure/azure-sql/)
- [Project README](../README.md)
