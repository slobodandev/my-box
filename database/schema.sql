-- ============================================================================
-- MyBox - Loan File Management System Database Schema
-- Purpose: Core tables for users, loans, and file management
-- Author: Development Team
-- Created: 2025-11-10
-- ============================================================================

-- ============================================================================
-- TABLE: Users
-- Purpose: Store user information
-- ============================================================================
CREATE TABLE Users (
    UserId NVARCHAR(50) PRIMARY KEY,
    Email NVARCHAR(255) NOT NULL UNIQUE,
    FirstName NVARCHAR(100),
    LastName NVARCHAR(100),
    Role NVARCHAR(50) NOT NULL DEFAULT 'borrower', -- 'admin', 'loan_officer', 'borrower'
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    LastLoginAt DATETIME2,
    PhoneNumber NVARCHAR(20),
    CONSTRAINT CK_Users_Role CHECK (Role IN ('admin', 'loan_officer', 'borrower'))
);

-- Indexes for Users
CREATE INDEX IX_Users_Email ON Users(Email);
CREATE INDEX IX_Users_Role ON Users(Role);
CREATE INDEX IX_Users_IsActive ON Users(IsActive);

-- ============================================================================
-- TABLE: Loans
-- Purpose: Store loan information
-- ============================================================================
CREATE TABLE Loans (
    LoanId NVARCHAR(50) PRIMARY KEY,
    UserId NVARCHAR(50) NOT NULL,
    LoanNumber NVARCHAR(100) NOT NULL UNIQUE,
    BorrowerName NVARCHAR(255) NOT NULL,
    BorrowerEmail NVARCHAR(255),
    LoanAmount DECIMAL(18, 2),
    LoanType NVARCHAR(100), -- 'Mortgage', 'Personal', 'Auto', 'Business', etc.
    Status NVARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'pending', 'approved', 'closed', 'denied'
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    ClosedAt DATETIME2,
    PropertyAddress NVARCHAR(500),
    LoanOfficerId NVARCHAR(50),
    Notes NVARCHAR(MAX),
    FOREIGN KEY (UserId) REFERENCES Users(UserId),
    FOREIGN KEY (LoanOfficerId) REFERENCES Users(UserId),
    CONSTRAINT CK_Loans_Status CHECK (Status IN ('active', 'pending', 'approved', 'closed', 'denied'))
);

-- Indexes for Loans
CREATE INDEX IX_Loans_UserId ON Loans(UserId);
CREATE INDEX IX_Loans_LoanNumber ON Loans(LoanNumber);
CREATE INDEX IX_Loans_Status ON Loans(Status);
CREATE INDEX IX_Loans_LoanOfficerId ON Loans(LoanOfficerId);
CREATE INDEX IX_Loans_CreatedAt ON Loans(CreatedAt);

-- ============================================================================
-- TABLE: Files
-- Purpose: Store file metadata (actual files stored in Azure Blob Storage)
-- ============================================================================
CREATE TABLE Files (
    FileId NVARCHAR(50) PRIMARY KEY,
    UserId NVARCHAR(50) NOT NULL,
    OriginalFilename NVARCHAR(500) NOT NULL,
    BlobIdentifier NVARCHAR(500) NOT NULL UNIQUE, -- Azure Blob Storage identifier
    FileSize BIGINT NOT NULL, -- Size in bytes
    MimeType NVARCHAR(255),
    FileExtension NVARCHAR(50),
    UploadedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    IsDeleted BIT NOT NULL DEFAULT 0,
    DeletedAt DATETIME2,
    DeletedBy NVARCHAR(50),
    Tags NVARCHAR(MAX), -- JSON array of tags
    Description NVARCHAR(MAX),
    FOREIGN KEY (UserId) REFERENCES Users(UserId)
);

-- Indexes for Files
CREATE INDEX IX_Files_UserId ON Files(UserId);
CREATE INDEX IX_Files_BlobIdentifier ON Files(BlobIdentifier);
CREATE INDEX IX_Files_UploadedAt ON Files(UploadedAt);
CREATE INDEX IX_Files_IsDeleted ON Files(IsDeleted);
CREATE INDEX IX_Files_OriginalFilename ON Files(OriginalFilename);

-- ============================================================================
-- TABLE: FileLoanAssociations
-- Purpose: Many-to-many relationship between files and loans
-- ============================================================================
CREATE TABLE FileLoanAssociations (
    AssociationId INT IDENTITY(1,1) PRIMARY KEY,
    FileId NVARCHAR(50) NOT NULL,
    LoanId NVARCHAR(50) NOT NULL,
    AssociatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    AssociatedBy NVARCHAR(50), -- UserId who created the association
    FOREIGN KEY (FileId) REFERENCES Files(FileId) ON DELETE CASCADE,
    FOREIGN KEY (LoanId) REFERENCES Loans(LoanId) ON DELETE CASCADE,
    CONSTRAINT UQ_FileLoanAssociation UNIQUE (FileId, LoanId)
);

-- Indexes for FileLoanAssociations
CREATE INDEX IX_FileLoanAssociations_FileId ON FileLoanAssociations(FileId);
CREATE INDEX IX_FileLoanAssociations_LoanId ON FileLoanAssociations(LoanId);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger to update Users.UpdatedAt
GO
CREATE OR ALTER TRIGGER tr_Users_UpdateTimestamp
ON Users
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Users
    SET UpdatedAt = GETDATE()
    FROM Users u
    INNER JOIN inserted i ON u.UserId = i.UserId;
END;
GO

-- Trigger to update Loans.UpdatedAt
GO
CREATE OR ALTER TRIGGER tr_Loans_UpdateTimestamp
ON Loans
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Loans
    SET UpdatedAt = GETDATE()
    FROM Loans l
    INNER JOIN inserted i ON l.LoanId = i.LoanId;
END;
GO

-- Trigger to update Files.UpdatedAt
GO
CREATE OR ALTER TRIGGER tr_Files_UpdateTimestamp
ON Files
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Files
    SET UpdatedAt = GETDATE()
    FROM Files f
    INNER JOIN inserted i ON f.FileId = i.FileId;
END;
GO

-- ============================================================================
-- VIEWS
-- ============================================================================

-- View: Get all files with their associated loans
GO
CREATE OR ALTER VIEW vw_FilesWithLoans
AS
SELECT
    f.FileId,
    f.UserId,
    f.OriginalFilename,
    f.BlobIdentifier,
    f.FileSize,
    f.MimeType,
    f.FileExtension,
    f.UploadedAt,
    f.IsDeleted,
    f.Tags,
    f.Description,
    u.Email AS UserEmail,
    u.FirstName AS UserFirstName,
    u.LastName AS UserLastName,
    STRING_AGG(l.LoanId, ',') AS LoanIds,
    STRING_AGG(l.LoanNumber, ',') AS LoanNumbers,
    COUNT(fla.LoanId) AS LoanCount
FROM Files f
INNER JOIN Users u ON f.UserId = u.UserId
LEFT JOIN FileLoanAssociations fla ON f.FileId = fla.FileId
LEFT JOIN Loans l ON fla.LoanId = l.LoanId
WHERE f.IsDeleted = 0
GROUP BY
    f.FileId,
    f.UserId,
    f.OriginalFilename,
    f.BlobIdentifier,
    f.FileSize,
    f.MimeType,
    f.FileExtension,
    f.UploadedAt,
    f.IsDeleted,
    f.Tags,
    f.Description,
    u.Email,
    u.FirstName,
    u.LastName;
GO

-- View: Get all loans with file counts
GO
CREATE OR ALTER VIEW vw_LoansWithFileCounts
AS
SELECT
    l.LoanId,
    l.UserId,
    l.LoanNumber,
    l.BorrowerName,
    l.BorrowerEmail,
    l.LoanAmount,
    l.LoanType,
    l.Status,
    l.CreatedAt,
    l.PropertyAddress,
    u.Email AS BorrowerUserEmail,
    u.FirstName AS BorrowerFirstName,
    u.LastName AS BorrowerLastName,
    lo.Email AS LoanOfficerEmail,
    lo.FirstName AS LoanOfficerFirstName,
    lo.LastName AS LoanOfficerLastName,
    COUNT(fla.FileId) AS FileCount
FROM Loans l
INNER JOIN Users u ON l.UserId = u.UserId
LEFT JOIN Users lo ON l.LoanOfficerId = lo.UserId
LEFT JOIN FileLoanAssociations fla ON l.LoanId = fla.LoanId
LEFT JOIN Files f ON fla.FileId = f.FileId AND f.IsDeleted = 0
GROUP BY
    l.LoanId,
    l.UserId,
    l.LoanNumber,
    l.BorrowerName,
    l.BorrowerEmail,
    l.LoanAmount,
    l.LoanType,
    l.Status,
    l.CreatedAt,
    l.PropertyAddress,
    u.Email,
    u.FirstName,
    u.LastName,
    lo.Email,
    lo.FirstName,
    lo.LastName;
GO

-- ============================================================================
-- STORED PROCEDURES
-- ============================================================================

-- Procedure: Get files for a specific user (with optional loan filter)
GO
CREATE OR ALTER PROCEDURE sp_GetUserFiles
    @UserId NVARCHAR(50),
    @LoanId NVARCHAR(50) = NULL,
    @IncludeDeleted BIT = 0
AS
BEGIN
    SET NOCOUNT ON;

    IF @LoanId IS NULL
    BEGIN
        -- Get all files for user
        SELECT
            f.FileId,
            f.OriginalFilename,
            f.BlobIdentifier,
            f.FileSize,
            f.MimeType,
            f.FileExtension,
            f.UploadedAt,
            f.Tags,
            f.Description,
            (
                SELECT l.LoanId, l.LoanNumber
                FROM FileLoanAssociations fla
                INNER JOIN Loans l ON fla.LoanId = l.LoanId
                WHERE fla.FileId = f.FileId
                FOR JSON PATH
            ) AS AssociatedLoans
        FROM Files f
        WHERE f.UserId = @UserId
        AND (@IncludeDeleted = 1 OR f.IsDeleted = 0)
        ORDER BY f.UploadedAt DESC;
    END
    ELSE
    BEGIN
        -- Get files for user filtered by loan
        SELECT
            f.FileId,
            f.OriginalFilename,
            f.BlobIdentifier,
            f.FileSize,
            f.MimeType,
            f.FileExtension,
            f.UploadedAt,
            f.Tags,
            f.Description,
            (
                SELECT l.LoanId, l.LoanNumber
                FROM FileLoanAssociations fla
                INNER JOIN Loans l ON fla.LoanId = l.LoanId
                WHERE fla.FileId = f.FileId
                FOR JSON PATH
            ) AS AssociatedLoans
        FROM Files f
        INNER JOIN FileLoanAssociations fla ON f.FileId = fla.FileId
        WHERE f.UserId = @UserId
        AND fla.LoanId = @LoanId
        AND (@IncludeDeleted = 1 OR f.IsDeleted = 0)
        ORDER BY f.UploadedAt DESC;
    END
END;
GO

-- Procedure: Soft delete a file
GO
CREATE OR ALTER PROCEDURE sp_DeleteFile
    @FileId NVARCHAR(50),
    @DeletedBy NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE Files
    SET
        IsDeleted = 1,
        DeletedAt = GETDATE(),
        DeletedBy = @DeletedBy
    WHERE FileId = @FileId;

    SELECT @@ROWCOUNT AS RowsAffected;
END;
GO

-- Procedure: Associate file with loan(s)
GO
CREATE OR ALTER PROCEDURE sp_AssociateFileWithLoans
    @FileId NVARCHAR(50),
    @LoanIds NVARCHAR(MAX), -- JSON array: ["loan-1", "loan-2"]
    @AssociatedBy NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    -- Parse JSON array and insert associations
    INSERT INTO FileLoanAssociations (FileId, LoanId, AssociatedBy)
    SELECT
        @FileId,
        value,
        @AssociatedBy
    FROM OPENJSON(@LoanIds);

    SELECT @@ROWCOUNT AS AssociationsCreated;
END;
GO

-- ============================================================================
-- SAMPLE DATA (FOR DEVELOPMENT/TESTING ONLY)
-- ============================================================================

-- Uncomment to insert sample data
/*
-- Sample Users
INSERT INTO Users (UserId, Email, FirstName, LastName, Role, IsActive)
VALUES
    ('user-admin-001', 'admin@mybox.com', 'Admin', 'User', 'admin', 1),
    ('user-officer-001', 'officer@mybox.com', 'John', 'Smith', 'loan_officer', 1),
    ('user-borrower-001', 'borrower1@example.com', 'Jane', 'Doe', 'borrower', 1),
    ('user-borrower-002', 'borrower2@example.com', 'Bob', 'Johnson', 'borrower', 1);

-- Sample Loans
INSERT INTO Loans (LoanId, UserId, LoanNumber, BorrowerName, BorrowerEmail, LoanAmount, LoanType, Status, LoanOfficerId, PropertyAddress)
VALUES
    ('loan-001', 'user-borrower-001', 'LN-2025-001', 'Jane Doe', 'borrower1@example.com', 350000.00, 'Mortgage', 'active', 'user-officer-001', '123 Main St, Springfield, IL 62701'),
    ('loan-002', 'user-borrower-001', 'LN-2025-002', 'Jane Doe', 'borrower1@example.com', 50000.00, 'Personal', 'pending', 'user-officer-001', NULL),
    ('loan-003', 'user-borrower-002', 'LN-2025-003', 'Bob Johnson', 'borrower2@example.com', 450000.00, 'Mortgage', 'active', 'user-officer-001', '456 Oak Ave, Chicago, IL 60601');
*/

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify all tables were created
SELECT
    TABLE_NAME,
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = t.TABLE_NAME) AS ColumnCount
FROM INFORMATION_SCHEMA.TABLES t
WHERE TABLE_NAME IN ('Users', 'Loans', 'Files', 'FileLoanAssociations')
ORDER BY TABLE_NAME;

-- Verify all indexes
SELECT
    t.name AS TableName,
    i.name AS IndexName,
    i.type_desc AS IndexType
FROM sys.indexes i
INNER JOIN sys.tables t ON i.object_id = t.object_id
WHERE t.name IN ('Users', 'Loans', 'Files', 'FileLoanAssociations')
AND i.name IS NOT NULL
ORDER BY t.name, i.name;

-- Verify all stored procedures
SELECT
    ROUTINE_NAME,
    CREATED,
    LAST_ALTERED
FROM INFORMATION_SCHEMA.ROUTINES
WHERE ROUTINE_TYPE = 'PROCEDURE'
AND ROUTINE_NAME LIKE 'sp_%'
AND ROUTINE_NAME NOT LIKE 'sp_%Auth%'
ORDER BY ROUTINE_NAME;

PRINT 'MyBox core database schema created successfully!';
PRINT 'Tables: Users, Loans, Files, FileLoanAssociations';
PRINT 'Views: vw_FilesWithLoans, vw_LoansWithFileCounts';
PRINT 'Stored Procedures: sp_GetUserFiles, sp_DeleteFile, sp_AssociateFileWithLoans';
PRINT '';
PRINT 'Next steps:';
PRINT '1. (Optional) Uncomment and run sample data section for testing';
PRINT '2. Run database/auth-schema.sql to add authentication tables';
PRINT '3. Configure n8n workflows with Azure SQL credentials';
PRINT '4. Test file upload and retrieval workflows';
