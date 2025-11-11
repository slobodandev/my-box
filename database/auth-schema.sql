-- ============================================================================
-- Authentication System Database Schema
-- Purpose: Passwordless authentication with magic links and email verification
-- Author: Development Team
-- Created: 2025-11-11
-- ============================================================================

-- ============================================================================
-- TABLE: AuthSessions
-- Purpose: Stores magic links and active user sessions
-- ============================================================================
CREATE TABLE AuthSessions (
    SessionId NVARCHAR(50) PRIMARY KEY,
    UserId NVARCHAR(50) NOT NULL,
    LoanIds NVARCHAR(MAX), -- JSON array of loan IDs, e.g., '["loan-1","loan-2"]'
    EmailHash NVARCHAR(64) NOT NULL, -- SHA-256 hash of email address
    MagicToken NVARCHAR(255) UNIQUE, -- Secure random token for magic link (null after verification)
    SessionToken NVARCHAR(1000), -- JWT token after successful authentication
    TokenType NVARCHAR(20) NOT NULL DEFAULT 'magic_link', -- 'magic_link' or 'session'
    Status NVARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'verified', 'expired', 'revoked'
    ExpiresAt DATETIME2 NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    VerifiedAt DATETIME2,
    LastAccessedAt DATETIME2,
    IpAddress NVARCHAR(45), -- Supports both IPv4 and IPv6
    UserAgent NVARCHAR(500),
    CreatedBy NVARCHAR(50), -- Admin user who created the magic link
    RevokedBy NVARCHAR(50), -- Admin user who revoked the session
    RevokedAt DATETIME2,
    RevokeReason NVARCHAR(255),
    FOREIGN KEY (UserId) REFERENCES Users(UserId)
);

-- Indexes for AuthSessions
CREATE UNIQUE INDEX IX_AuthSessions_MagicToken ON AuthSessions(MagicToken) WHERE MagicToken IS NOT NULL;
CREATE INDEX IX_AuthSessions_SessionId ON AuthSessions(SessionId);
CREATE INDEX IX_AuthSessions_UserId ON AuthSessions(UserId);
CREATE INDEX IX_AuthSessions_Status ON AuthSessions(Status);
CREATE INDEX IX_AuthSessions_ExpiresAt ON AuthSessions(ExpiresAt);
CREATE INDEX IX_AuthSessions_EmailHash ON AuthSessions(EmailHash);
CREATE INDEX IX_AuthSessions_CreatedAt ON AuthSessions(CreatedAt);

-- ============================================================================
-- TABLE: VerificationCodes
-- Purpose: Stores email verification codes (6-digit TOTP)
-- ============================================================================
CREATE TABLE VerificationCodes (
    CodeId INT IDENTITY(1,1) PRIMARY KEY,
    SessionId NVARCHAR(50) NOT NULL,
    CodeHash NVARCHAR(64) NOT NULL, -- SHA-256 hash of verification code
    ExpiresAt DATETIME2 NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UsedAt DATETIME2,
    AttemptCount INT NOT NULL DEFAULT 0,
    MaxAttempts INT NOT NULL DEFAULT 3,
    IsUsed BIT NOT NULL DEFAULT 0,
    IpAddress NVARCHAR(45),
    FOREIGN KEY (SessionId) REFERENCES AuthSessions(SessionId) ON DELETE CASCADE
);

-- Indexes for VerificationCodes
CREATE INDEX IX_VerificationCodes_SessionId ON VerificationCodes(SessionId);
CREATE INDEX IX_VerificationCodes_ExpiresAt ON VerificationCodes(ExpiresAt);
CREATE INDEX IX_VerificationCodes_CreatedAt ON VerificationCodes(CreatedAt);
CREATE INDEX IX_VerificationCodes_IsUsed ON VerificationCodes(IsUsed);

-- ============================================================================
-- TABLE: AuthAuditLog
-- Purpose: Complete audit trail of all authentication events
-- ============================================================================
CREATE TABLE AuthAuditLog (
    LogId INT IDENTITY(1,1) PRIMARY KEY,
    SessionId NVARCHAR(50),
    UserId NVARCHAR(50),
    EventType NVARCHAR(50) NOT NULL, -- 'link_generated', 'email_sent', 'code_sent', 'code_verified', 'token_issued', 'token_validated', 'invalid_attempt', 'session_revoked'
    Success BIT NOT NULL,
    ErrorMessage NVARCHAR(MAX),
    ErrorCode NVARCHAR(50),
    IpAddress NVARCHAR(45),
    UserAgent NVARCHAR(500),
    RequestPayload NVARCHAR(MAX), -- JSON of request data (sanitized, no sensitive info)
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (SessionId) REFERENCES AuthSessions(SessionId) ON DELETE SET NULL
);

-- Indexes for AuthAuditLog
CREATE INDEX IX_AuthAuditLog_SessionId ON AuthAuditLog(SessionId);
CREATE INDEX IX_AuthAuditLog_UserId ON AuthAuditLog(UserId);
CREATE INDEX IX_AuthAuditLog_EventType ON AuthAuditLog(EventType);
CREATE INDEX IX_AuthAuditLog_CreatedAt ON AuthAuditLog(CreatedAt);
CREATE INDEX IX_AuthAuditLog_Success ON AuthAuditLog(Success);

-- ============================================================================
-- TABLE: RateLimitTracking
-- Purpose: Track rate limiting for authentication endpoints
-- ============================================================================
CREATE TABLE RateLimitTracking (
    TrackingId INT IDENTITY(1,1) PRIMARY KEY,
    Identifier NVARCHAR(255) NOT NULL, -- email hash, IP address, or sessionId
    ActionType NVARCHAR(50) NOT NULL, -- 'send_code', 'verify_code', 'generate_link'
    AttemptCount INT NOT NULL DEFAULT 1,
    WindowStartAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    LastAttemptAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    BlockedUntil DATETIME2,
    IpAddress NVARCHAR(45)
);

-- Indexes for RateLimitTracking
CREATE INDEX IX_RateLimitTracking_Identifier ON RateLimitTracking(Identifier, ActionType);
CREATE INDEX IX_RateLimitTracking_WindowStartAt ON RateLimitTracking(WindowStartAt);
CREATE INDEX IX_RateLimitTracking_BlockedUntil ON RateLimitTracking(BlockedUntil);

-- ============================================================================
-- STORED PROCEDURES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Procedure: sp_CleanupExpiredAuthSessions
-- Purpose: Delete expired sessions and verification codes
-- Schedule: Run daily via SQL Server Agent or external scheduler
-- ----------------------------------------------------------------------------
GO
CREATE OR ALTER PROCEDURE sp_CleanupExpiredAuthSessions
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @CleanupDate DATETIME2 = DATEADD(DAY, -90, GETDATE()); -- Keep 90 days of history
    DECLARE @DeletedSessions INT;
    DECLARE @DeletedCodes INT;
    DECLARE @DeletedLogs INT;

    BEGIN TRANSACTION;

    BEGIN TRY
        -- Delete expired verification codes older than 90 days
        DELETE FROM VerificationCodes
        WHERE ExpiresAt < @CleanupDate;
        SET @DeletedCodes = @@ROWCOUNT;

        -- Delete expired/revoked sessions older than 90 days
        DELETE FROM AuthSessions
        WHERE Status IN ('expired', 'revoked')
        AND CreatedAt < @CleanupDate;
        SET @DeletedSessions = @@ROWCOUNT;

        -- Delete old audit logs (keep 1 year)
        DELETE FROM AuthAuditLog
        WHERE CreatedAt < DATEADD(YEAR, -1, GETDATE());
        SET @DeletedLogs = @@ROWCOUNT;

        -- Delete old rate limit tracking
        DELETE FROM RateLimitTracking
        WHERE WindowStartAt < DATEADD(HOUR, -24, GETDATE());

        COMMIT TRANSACTION;

        -- Log cleanup results
        PRINT 'Cleanup completed successfully:';
        PRINT '  - Deleted ' + CAST(@DeletedSessions AS NVARCHAR) + ' expired sessions';
        PRINT '  - Deleted ' + CAST(@DeletedCodes AS NVARCHAR) + ' expired verification codes';
        PRINT '  - Deleted ' + CAST(@DeletedLogs AS NVARCHAR) + ' old audit logs';

    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- ----------------------------------------------------------------------------
-- Procedure: sp_ExpireOldSessions
-- Purpose: Mark old sessions as expired (run periodically)
-- ----------------------------------------------------------------------------
GO
CREATE OR ALTER PROCEDURE sp_ExpireOldSessions
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE AuthSessions
    SET Status = 'expired'
    WHERE Status IN ('pending', 'verified')
    AND ExpiresAt < GETDATE();

    DECLARE @ExpiredCount INT = @@ROWCOUNT;

    IF @ExpiredCount > 0
    BEGIN
        INSERT INTO AuthAuditLog (SessionId, EventType, Success, ErrorMessage)
        SELECT SessionId, 'session_expired', 1, 'Auto-expired by system'
        FROM AuthSessions
        WHERE Status = 'expired'
        AND ExpiresAt < GETDATE()
        AND ExpiresAt > DATEADD(MINUTE, -5, GETDATE()); -- Only recently expired
    END;

    PRINT 'Expired ' + CAST(@ExpiredCount AS NVARCHAR) + ' sessions';
END;
GO

-- ----------------------------------------------------------------------------
-- Procedure: sp_GetAuthSessionStats
-- Purpose: Get authentication statistics for monitoring
-- ----------------------------------------------------------------------------
GO
CREATE OR ALTER PROCEDURE sp_GetAuthSessionStats
    @StartDate DATETIME2 = NULL,
    @EndDate DATETIME2 = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @StartDate IS NULL SET @StartDate = DATEADD(DAY, -30, GETDATE());
    IF @EndDate IS NULL SET @EndDate = GETDATE();

    -- Session statistics
    SELECT
        'Session Statistics' AS Category,
        COUNT(*) AS TotalSessions,
        SUM(CASE WHEN Status = 'verified' THEN 1 ELSE 0 END) AS VerifiedSessions,
        SUM(CASE WHEN Status = 'pending' THEN 1 ELSE 0 END) AS PendingSessions,
        SUM(CASE WHEN Status = 'expired' THEN 1 ELSE 0 END) AS ExpiredSessions,
        SUM(CASE WHEN Status = 'revoked' THEN 1 ELSE 0 END) AS RevokedSessions,
        AVG(DATEDIFF(SECOND, CreatedAt, ISNULL(VerifiedAt, GETDATE()))) AS AvgTimeToVerifySeconds
    FROM AuthSessions
    WHERE CreatedAt BETWEEN @StartDate AND @EndDate;

    -- Verification code statistics
    SELECT
        'Verification Code Statistics' AS Category,
        COUNT(*) AS TotalCodes,
        SUM(CASE WHEN IsUsed = 1 THEN 1 ELSE 0 END) AS UsedCodes,
        SUM(CASE WHEN ExpiresAt < GETDATE() AND IsUsed = 0 THEN 1 ELSE 0 END) AS ExpiredCodes,
        AVG(AttemptCount) AS AvgAttemptsPerCode
    FROM VerificationCodes
    WHERE CreatedAt BETWEEN @StartDate AND @EndDate;

    -- Authentication events by type
    SELECT
        EventType,
        COUNT(*) AS EventCount,
        SUM(CASE WHEN Success = 1 THEN 1 ELSE 0 END) AS SuccessCount,
        SUM(CASE WHEN Success = 0 THEN 1 ELSE 0 END) AS FailureCount,
        CAST(SUM(CASE WHEN Success = 1 THEN 1.0 ELSE 0 END) / COUNT(*) * 100 AS DECIMAL(5,2)) AS SuccessRate
    FROM AuthAuditLog
    WHERE CreatedAt BETWEEN @StartDate AND @EndDate
    GROUP BY EventType
    ORDER BY EventCount DESC;
END;
GO

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Trigger: tr_AuthSessions_UpdateLastAccessed
-- Purpose: Auto-update LastAccessedAt when session is validated
-- ----------------------------------------------------------------------------
GO
CREATE OR ALTER TRIGGER tr_AuthSessions_UpdateLastAccessed
ON AuthSessions
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    -- Only update if session was accessed (not if status changed)
    IF UPDATE(Status) AND EXISTS (
        SELECT 1 FROM inserted i
        INNER JOIN deleted d ON i.SessionId = d.SessionId
        WHERE i.Status = 'verified' AND d.Status = 'verified'
    )
    BEGIN
        UPDATE AuthSessions
        SET LastAccessedAt = GETDATE()
        FROM AuthSessions a
        INNER JOIN inserted i ON a.SessionId = i.SessionId;
    END;
END;
GO

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Function: fn_IsSessionValid
-- Purpose: Check if a session is currently valid
-- ----------------------------------------------------------------------------
GO
CREATE OR ALTER FUNCTION fn_IsSessionValid
(
    @SessionId NVARCHAR(50)
)
RETURNS BIT
AS
BEGIN
    DECLARE @IsValid BIT = 0;

    SELECT @IsValid = 1
    FROM AuthSessions
    WHERE SessionId = @SessionId
    AND Status = 'verified'
    AND ExpiresAt > GETDATE();

    RETURN ISNULL(@IsValid, 0);
END;
GO

-- ----------------------------------------------------------------------------
-- Function: fn_GetRateLimitStatus
-- Purpose: Check if an identifier is rate limited
-- ----------------------------------------------------------------------------
GO
CREATE OR ALTER FUNCTION fn_GetRateLimitStatus
(
    @Identifier NVARCHAR(255),
    @ActionType NVARCHAR(50),
    @MaxAttempts INT,
    @WindowMinutes INT
)
RETURNS BIT
AS
BEGIN
    DECLARE @IsBlocked BIT = 0;
    DECLARE @WindowStart DATETIME2 = DATEADD(MINUTE, -@WindowMinutes, GETDATE());

    SELECT @IsBlocked = 1
    FROM RateLimitTracking
    WHERE Identifier = @Identifier
    AND ActionType = @ActionType
    AND (
        (WindowStartAt >= @WindowStart AND AttemptCount >= @MaxAttempts)
        OR (BlockedUntil IS NOT NULL AND BlockedUntil > GETDATE())
    );

    RETURN ISNULL(@IsBlocked, 0);
END;
GO

-- ============================================================================
-- VIEWS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- View: vw_ActiveSessions
-- Purpose: Get all currently active sessions
-- ----------------------------------------------------------------------------
GO
CREATE OR ALTER VIEW vw_ActiveSessions
AS
SELECT
    a.SessionId,
    a.UserId,
    u.Email,
    u.FirstName,
    u.LastName,
    a.LoanIds,
    a.Status,
    a.CreatedAt,
    a.VerifiedAt,
    a.LastAccessedAt,
    a.ExpiresAt,
    DATEDIFF(MINUTE, GETDATE(), a.ExpiresAt) AS MinutesUntilExpiration,
    a.IpAddress,
    a.UserAgent
FROM AuthSessions a
INNER JOIN Users u ON a.UserId = u.UserId
WHERE a.Status = 'verified'
AND a.ExpiresAt > GETDATE();
GO

-- ----------------------------------------------------------------------------
-- View: vw_AuthenticationFailures
-- Purpose: Monitor failed authentication attempts for security
-- ----------------------------------------------------------------------------
GO
CREATE OR ALTER VIEW vw_AuthenticationFailures
AS
SELECT
    SessionId,
    UserId,
    EventType,
    ErrorMessage,
    ErrorCode,
    IpAddress,
    UserAgent,
    CreatedAt
FROM AuthAuditLog
WHERE Success = 0
AND CreatedAt > DATEADD(DAY, -7, GETDATE()); -- Last 7 days
GO

-- ============================================================================
-- SAMPLE DATA (FOR DEVELOPMENT/TESTING ONLY)
-- ============================================================================

-- Uncomment below to insert sample data for testing
/*
-- Sample admin user (assuming Users table exists)
IF NOT EXISTS (SELECT 1 FROM Users WHERE UserId = 'admin-001')
BEGIN
    INSERT INTO Users (UserId, Email, FirstName, LastName, Role, IsActive)
    VALUES ('admin-001', 'admin@example.com', 'Admin', 'User', 'admin', 1);
END;

-- Sample test user
IF NOT EXISTS (SELECT 1 FROM Users WHERE UserId = 'user-test-001')
BEGIN
    INSERT INTO Users (UserId, Email, FirstName, LastName, Role, IsActive)
    VALUES ('user-test-001', 'test@example.com', 'Test', 'User', 'borrower', 1);
END;

-- Sample loan
IF NOT EXISTS (SELECT 1 FROM Loans WHERE LoanId = 'loan-test-001')
BEGIN
    INSERT INTO Loans (LoanId, UserId, LoanNumber, BorrowerName, BorrowerEmail, LoanAmount, LoanType, Status)
    VALUES ('loan-test-001', 'user-test-001', 'TEST-12345', 'Test User', 'test@example.com', 250000.00, 'Mortgage', 'active');
END;
*/

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify all tables were created
SELECT
    TABLE_NAME,
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = t.TABLE_NAME) AS ColumnCount
FROM INFORMATION_SCHEMA.TABLES t
WHERE TABLE_NAME IN ('AuthSessions', 'VerificationCodes', 'AuthAuditLog', 'RateLimitTracking')
ORDER BY TABLE_NAME;

-- Verify all indexes were created
SELECT
    t.name AS TableName,
    i.name AS IndexName,
    i.type_desc AS IndexType
FROM sys.indexes i
INNER JOIN sys.tables t ON i.object_id = t.object_id
WHERE t.name IN ('AuthSessions', 'VerificationCodes', 'AuthAuditLog', 'RateLimitTracking')
AND i.name IS NOT NULL
ORDER BY t.name, i.name;

-- Verify all stored procedures were created
SELECT
    ROUTINE_NAME,
    CREATED,
    LAST_ALTERED
FROM INFORMATION_SCHEMA.ROUTINES
WHERE ROUTINE_TYPE = 'PROCEDURE'
AND ROUTINE_NAME LIKE 'sp_%Auth%'
ORDER BY ROUTINE_NAME;

PRINT 'Authentication database schema created successfully!';
PRINT 'Tables: AuthSessions, VerificationCodes, AuthAuditLog, RateLimitTracking';
PRINT 'Stored Procedures: sp_CleanupExpiredAuthSessions, sp_ExpireOldSessions, sp_GetAuthSessionStats';
PRINT 'Functions: fn_IsSessionValid, fn_GetRateLimitStatus';
PRINT 'Views: vw_ActiveSessions, vw_AuthenticationFailures';
PRINT '';
PRINT 'Next steps:';
PRINT '1. Review and run this script on your Azure SQL Database';
PRINT '2. Schedule sp_CleanupExpiredAuthSessions to run daily';
PRINT '3. Schedule sp_ExpireOldSessions to run every 15 minutes';
PRINT '4. Generate a strong JWT secret for token signing';
PRINT '5. Configure email service (SendGrid, AWS SES, or Mailgun)';
PRINT '6. Deploy n8n authentication workflows';
