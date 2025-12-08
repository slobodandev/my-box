/**
 * Naming Convention Utility
 *
 * Processes naming convention patterns and generates renamed filenames
 * based on contextual data (loan, user, property, dates, etc.)
 *
 * Pattern format: {Variable} or {Variable.Column}
 * Examples: {Loan.LoanNumber}, {Borrower.FullName}, {Year}, {Property}
 *
 * @see docs/NAMING-CONVENTION-IMPLEMENTATION.md for full documentation
 */

// Regex pattern matching legacy C# implementation
// Matches patterns like: {Loan}, {Loan.LoanNumber}, {Contact.FirstName}
const NAMING_CONVENTION_REGEX = /\{(\w+)(?:\.(\w+)(?:\.(\w+))?)?\}/g;

/**
 * Supported variable names (first segment in placeholder)
 */
export const NamingConventionVariables = {
  Bank: 'Bank',
  Company: 'Company',
  Contact: 'Contact',
  CreatedOn: 'CreatedOn',
  Date: 'Date',
  EffectiveDate: 'EffectiveDate',
  ExpiryDate: 'ExpiryDate',
  Guarantor: 'Guarantor',
  Loan: 'Loan',
  Property: 'Property',
  Year: 'Year',
  Borrower: 'Borrower',
  User: 'User',
} as const;

/**
 * Supported column names (second segment in placeholder)
 */
export const NamingConventionColumns = {
  Display: 'Display',
  FirstName: 'FirstName',
  LastName: 'LastName',
  LoanIdentifier: 'LoanIdentifier',
  LoanNumber: 'LoanNumber',
  Name: 'Name',
  Email: 'Email',
  FullName: 'FullName',
  Address: 'Address',
  Street: 'Street',
  City: 'City',
  State: 'State',
  Zip: 'Zip',
} as const;

/**
 * Context interface providing values for placeholder replacement
 */
export interface NamingConventionContext {
  loan?: {
    id?: string;
    loanNumber?: string;
    loanIdentifier?: string;
    name?: string;
    display?: string;
  };
  borrower?: {
    id?: string;
    firstName?: string;
    lastName?: string;
    fullName?: string;
    email?: string;
    companyName?: string;
    display?: string;
  };
  user?: {
    id?: string;
    firstName?: string;
    lastName?: string;
    fullName?: string;
    email?: string;
    display?: string;
  };
  property?: {
    name?: string;
    address?: string;
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    display?: string;
  };
  dates?: {
    createdOn?: Date | string;
    effectiveDate?: Date | string;
    expiryDate?: Date | string;
    uploadedAt?: Date | string;
  };
  company?: {
    name?: string;
    display?: string;
  };
  bank?: {
    name?: string;
    display?: string;
  };
  guarantor?: {
    firstName?: string;
    lastName?: string;
    fullName?: string;
    name?: string;
    display?: string;
  };
}

/**
 * Configuration for naming convention processing
 */
export interface NamingConventionConfig {
  pattern: string;
  context: NamingConventionContext;
  originalFilename: string;
  isVersioningEnabled?: boolean;
  versionNumber?: number;
}

/**
 * Result of naming convention processing
 */
export interface NamingConventionResult {
  success: boolean;
  renamedFilename: string;
  originalFilename: string;
  appliedPattern?: string;
  error?: string;
  placeholdersReplaced?: number;
  placeholdersTotal?: number;
}

/**
 * Format date for use in filename
 * Returns date in YYYY-MM-DD format
 */
function formatDate(date?: Date | string): string {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
}

/**
 * Format date with custom format for filename
 * @param date - Date to format
 * @param format - 'iso' | 'short' | 'year'
 */
function formatDateWithFormat(date?: Date | string, format: 'iso' | 'short' | 'year' = 'iso'): string {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  switch (format) {
    case 'iso':
      return d.toISOString().split('T')[0]; // YYYY-MM-DD
    case 'short':
      return `${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}-${d.getFullYear()}`; // MM-DD-YYYY
    case 'year':
      return d.getFullYear().toString();
    default:
      return d.toISOString().split('T')[0];
  }
}

/**
 * Get value for a placeholder based on segment and column
 * Matches legacy C# GetSegmentValue implementation
 */
function getSegmentValue(
  context: NamingConventionContext,
  segment: string,
  column?: string
): string {
  const segmentLower = segment.toLowerCase();
  const columnLower = column?.toLowerCase();

  switch (segmentLower) {
    case 'loan':
      if (!context.loan) return '';
      if (!column) return context.loan.display || context.loan.loanNumber || context.loan.name || '';
      switch (columnLower) {
        case 'loannumber': return context.loan.loanNumber || '';
        case 'loanidentifier': return context.loan.loanIdentifier || context.loan.loanNumber || '';
        case 'name': return context.loan.name || '';
        case 'display': return context.loan.display || context.loan.loanNumber || '';
        default: return '';
      }

    case 'borrower':
    case 'contact':
      if (!context.borrower) return '';
      if (!column) return context.borrower.display || context.borrower.fullName || '';
      switch (columnLower) {
        case 'firstname': return context.borrower.firstName || '';
        case 'lastname': return context.borrower.lastName || '';
        case 'fullname': return context.borrower.fullName || `${context.borrower.firstName || ''} ${context.borrower.lastName || ''}`.trim();
        case 'name': return context.borrower.fullName || context.borrower.companyName || '';
        case 'email': return context.borrower.email || '';
        case 'display': return context.borrower.display || context.borrower.fullName || '';
        default: return '';
      }

    case 'user':
      if (!context.user) return '';
      if (!column) return context.user.display || context.user.fullName || '';
      switch (columnLower) {
        case 'firstname': return context.user.firstName || '';
        case 'lastname': return context.user.lastName || '';
        case 'fullname': return context.user.fullName || `${context.user.firstName || ''} ${context.user.lastName || ''}`.trim();
        case 'email': return context.user.email || '';
        case 'display': return context.user.display || context.user.fullName || '';
        default: return '';
      }

    case 'property':
      if (!context.property) return '';
      if (!column) return context.property.display || context.property.name || context.property.address || '';
      switch (columnLower) {
        case 'name': return context.property.name || '';
        case 'address': return context.property.address || '';
        case 'street': return context.property.street || '';
        case 'city': return context.property.city || '';
        case 'state': return context.property.state || '';
        case 'zip': return context.property.zip || '';
        case 'display': return context.property.display || context.property.name || context.property.address || '';
        default: return '';
      }

    case 'company':
      if (!context.company && !context.borrower?.companyName) return '';
      if (!column) return context.company?.display || context.company?.name || context.borrower?.companyName || '';
      switch (columnLower) {
        case 'name': return context.company?.name || context.borrower?.companyName || '';
        case 'display': return context.company?.display || context.company?.name || '';
        default: return '';
      }

    case 'bank':
      if (!context.bank) return '';
      if (!column) return context.bank.display || context.bank.name || '';
      switch (columnLower) {
        case 'name': return context.bank.name || '';
        case 'display': return context.bank.display || context.bank.name || '';
        default: return '';
      }

    case 'guarantor':
      if (!context.guarantor) return '';
      if (!column) return context.guarantor.display || context.guarantor.fullName || context.guarantor.name || '';
      switch (columnLower) {
        case 'firstname': return context.guarantor.firstName || '';
        case 'lastname': return context.guarantor.lastName || '';
        case 'fullname': return context.guarantor.fullName || `${context.guarantor.firstName || ''} ${context.guarantor.lastName || ''}`.trim();
        case 'name': return context.guarantor.name || context.guarantor.fullName || '';
        case 'display': return context.guarantor.display || context.guarantor.fullName || '';
        default: return '';
      }

    case 'createdon':
      return formatDate(context.dates?.createdOn || context.dates?.uploadedAt);

    case 'date':
      return formatDate(context.dates?.createdOn || context.dates?.uploadedAt || new Date());

    case 'effectivedate':
      return formatDate(context.dates?.effectiveDate);

    case 'expirydate':
      return formatDate(context.dates?.expiryDate);

    case 'year':
      const dateForYear = context.dates?.createdOn || context.dates?.uploadedAt || new Date();
      return formatDateWithFormat(dateForYear, 'year');

    default:
      return '';
  }
}

/**
 * Sanitize filename - remove characters invalid for file systems
 * Matches legacy C# SanitizeFileNameStringRegex behavior
 * Note: This is a local helper function, use fileHelpers.sanitizeFilename for general use
 */
function sanitizeNamingConventionFilename(filename: string): string {
  if (!filename) return '';

  return filename
    // Remove characters invalid in Windows/Mac/Linux filenames
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    // Replace multiple spaces with single space
    .replace(/\s+/g, ' ')
    // Remove leading/trailing spaces
    .trim()
    // Remove leading/trailing dots (problematic on some systems)
    .replace(/^\.+|\.+$/g, '');
}

/**
 * Extract file extension from filename (internal helper)
 * Note: Use fileHelpers.getFileExtension for general use
 */
function extractFileExtension(filename: string): string {
  if (!filename) return '';
  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex <= 0 || lastDotIndex === filename.length - 1) return '';
  return filename.slice(lastDotIndex);
}

/**
 * Get filename without extension
 */
export function getFilenameWithoutExtension(filename: string): string {
  if (!filename) return '';
  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex <= 0) return filename;
  return filename.slice(0, lastDotIndex);
}

/**
 * Apply naming convention pattern to generate renamed filename
 *
 * @param config - Configuration object with pattern, context, and original filename
 * @returns Result object with renamed filename and metadata
 *
 * @example
 * const result = applyNamingConvention({
 *   pattern: '{Loan.LoanNumber} - {Borrower.FullName} - Appraisal',
 *   context: {
 *     loan: { loanNumber: 'LN-2024-001' },
 *     borrower: { fullName: 'John Doe' }
 *   },
 *   originalFilename: 'scan.pdf'
 * });
 * // result.renamedFilename = 'LN-2024-001 - John Doe - Appraisal.pdf'
 */
export function applyNamingConvention(config: NamingConventionConfig): NamingConventionResult {
  const { pattern, context, originalFilename, isVersioningEnabled, versionNumber } = config;

  try {
    // Get file extension
    const extension = extractFileExtension(originalFilename);

    // If no pattern or empty pattern, return original filename
    if (!pattern || pattern.trim() === '') {
      return {
        success: true,
        renamedFilename: originalFilename,
        originalFilename,
        placeholdersReplaced: 0,
        placeholdersTotal: 0,
      };
    }

    // Count total placeholders
    const placeholderMatches = pattern.match(NAMING_CONVENTION_REGEX);
    const totalPlaceholders = placeholderMatches?.length || 0;
    let replacedCount = 0;

    // Replace all placeholders
    // Need to create new regex instance for each replace to avoid stateful issues
    const result = pattern.replace(
      new RegExp(NAMING_CONVENTION_REGEX.source, 'g'),
      (_match, segment, column) => {
        const value = getSegmentValue(context, segment, column);
        if (value) {
          replacedCount++;
          return value;
        }
        // Return empty string instead of keeping placeholder for cleaner filenames
        return '';
      }
    );

    // Clean up result (remove double spaces, trim)
    let cleanResult = result
      .replace(/\s+/g, ' ')
      .replace(/\s*-\s*-\s*/g, ' - ')  // Fix double dashes from empty placeholders
      .replace(/\s*-\s*$/g, '')         // Remove trailing dash
      .replace(/^\s*-\s*/g, '')         // Remove leading dash
      .trim();

    // Apply versioning if enabled and version number provided
    if (isVersioningEnabled && versionNumber && versionNumber > 0) {
      cleanResult = `${cleanResult} v${versionNumber}`;
    }

    // Sanitize the filename
    cleanResult = sanitizeNamingConventionFilename(cleanResult);

    // Ensure we have a valid filename
    if (!cleanResult) {
      // Fall back to original filename without extension
      cleanResult = sanitizeNamingConventionFilename(getFilenameWithoutExtension(originalFilename)) || 'document';
    }

    // Add extension back
    const finalFilename = extension ? `${cleanResult}${extension}` : cleanResult;

    return {
      success: true,
      renamedFilename: finalFilename,
      originalFilename,
      appliedPattern: pattern,
      placeholdersReplaced: replacedCount,
      placeholdersTotal: totalPlaceholders,
    };
  } catch (error) {
    return {
      success: false,
      renamedFilename: originalFilename,
      originalFilename,
      error: error instanceof Error ? error.message : 'Unknown error processing naming convention',
    };
  }
}

/**
 * Validation result for naming convention pattern
 */
export interface PatternValidationResult {
  valid: boolean;
  placeholders: string[];
  segments: Array<{ segment: string; column?: string }>;
  errors: string[];
  warnings: string[];
}

/**
 * Validate a naming convention pattern
 * Checks for valid variable names and structure
 */
export function validateNamingConventionPattern(pattern: string): PatternValidationResult {
  const placeholders: string[] = [];
  const segments: Array<{ segment: string; column?: string }> = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!pattern || pattern.trim() === '') {
    return { valid: true, placeholders: [], segments: [], errors: [], warnings: [] };
  }

  // Get valid segment names (case-insensitive)
  const validSegments = Object.values(NamingConventionVariables).map(s => s.toLowerCase());

  // Match all placeholders
  const regex = new RegExp(NAMING_CONVENTION_REGEX.source, 'g');
  let match;

  while ((match = regex.exec(pattern)) !== null) {
    const [fullMatch, segment, column] = match;
    placeholders.push(fullMatch);
    segments.push({ segment, column });

    // Validate segment name
    if (!validSegments.includes(segment.toLowerCase())) {
      errors.push(`Unknown variable "${segment}" in placeholder "${fullMatch}"`);
    }
  }

  // Check for unclosed braces
  const openBraces = (pattern.match(/\{/g) || []).length;
  const closeBraces = (pattern.match(/\}/g) || []).length;
  if (openBraces !== closeBraces) {
    errors.push('Mismatched braces in pattern');
  }

  // Warn if no placeholders found
  if (placeholders.length === 0 && pattern.includes('{')) {
    warnings.push('Pattern contains "{" but no valid placeholders were found');
  }

  return {
    valid: errors.length === 0,
    placeholders,
    segments,
    errors,
    warnings,
  };
}

/**
 * Generate a preview of the renamed filename
 * Useful for showing users what the filename will look like before download
 */
export function previewNamingConvention(
  pattern: string,
  context: NamingConventionContext,
  originalFilename: string
): string {
  const result = applyNamingConvention({
    pattern,
    context,
    originalFilename,
  });
  return result.renamedFilename;
}

/**
 * Get a list of all supported placeholders with descriptions
 * Useful for displaying in UI when configuring naming conventions
 */
export function getSupportedPlaceholders(): Array<{
  placeholder: string;
  description: string;
  example: string;
}> {
  return [
    { placeholder: '{Loan}', description: 'Loan display name or number', example: 'LN-2024-001' },
    { placeholder: '{Loan.LoanNumber}', description: 'Loan number', example: 'LN-2024-001' },
    { placeholder: '{Loan.LoanIdentifier}', description: 'Loan identifier', example: 'ABC123' },
    { placeholder: '{Borrower}', description: 'Borrower full name', example: 'John Doe' },
    { placeholder: '{Borrower.FirstName}', description: 'Borrower first name', example: 'John' },
    { placeholder: '{Borrower.LastName}', description: 'Borrower last name', example: 'Doe' },
    { placeholder: '{Borrower.FullName}', description: 'Borrower full name', example: 'John Doe' },
    { placeholder: '{Borrower.Email}', description: 'Borrower email', example: 'john@example.com' },
    { placeholder: '{Contact}', description: 'Contact name (alias for Borrower)', example: 'John Doe' },
    { placeholder: '{Contact.FirstName}', description: 'Contact first name', example: 'John' },
    { placeholder: '{Contact.LastName}', description: 'Contact last name', example: 'Doe' },
    { placeholder: '{User}', description: 'Current user full name', example: 'Admin User' },
    { placeholder: '{User.FirstName}', description: 'Current user first name', example: 'Admin' },
    { placeholder: '{User.LastName}', description: 'Current user last name', example: 'User' },
    { placeholder: '{User.Email}', description: 'Current user email', example: 'admin@example.com' },
    { placeholder: '{Property}', description: 'Property name or address', example: '123 Main St' },
    { placeholder: '{Property.Name}', description: 'Property name', example: 'Main Street Property' },
    { placeholder: '{Property.Address}', description: 'Property full address', example: '123 Main St, City, ST 12345' },
    { placeholder: '{Property.Street}', description: 'Property street address', example: '123 Main St' },
    { placeholder: '{Property.City}', description: 'Property city', example: 'Springfield' },
    { placeholder: '{Property.State}', description: 'Property state', example: 'CA' },
    { placeholder: '{Company}', description: 'Company name', example: 'Acme Corp' },
    { placeholder: '{Bank}', description: 'Bank name', example: 'First National Bank' },
    { placeholder: '{Guarantor}', description: 'Guarantor name', example: 'Jane Smith' },
    { placeholder: '{Guarantor.FirstName}', description: 'Guarantor first name', example: 'Jane' },
    { placeholder: '{Guarantor.LastName}', description: 'Guarantor last name', example: 'Smith' },
    { placeholder: '{Year}', description: 'Current year', example: '2024' },
    { placeholder: '{Date}', description: 'Current date (YYYY-MM-DD)', example: '2024-01-15' },
    { placeholder: '{CreatedOn}', description: 'File creation date', example: '2024-01-15' },
    { placeholder: '{EffectiveDate}', description: 'Document effective date', example: '2024-01-15' },
    { placeholder: '{ExpiryDate}', description: 'Document expiry date', example: '2024-12-31' },
  ];
}

/**
 * Build a naming convention context from available data
 * Helper function to simplify context creation
 */
export function buildNamingConventionContext(data: {
  loan?: { id?: string; loanNumber?: string; name?: string };
  borrower?: { id?: string; firstName?: string; lastName?: string; email?: string; companyName?: string };
  user?: { id?: string; firstName?: string; lastName?: string; email?: string };
  property?: { name?: string; address?: string; street?: string; city?: string; state?: string; zip?: string };
  uploadedAt?: Date | string;
  effectiveDate?: Date | string;
  expiryDate?: Date | string;
}): NamingConventionContext {
  const context: NamingConventionContext = {};

  if (data.loan) {
    context.loan = {
      id: data.loan.id,
      loanNumber: data.loan.loanNumber,
      name: data.loan.name,
      display: data.loan.loanNumber || data.loan.name,
    };
  }

  if (data.borrower) {
    const fullName = data.borrower.firstName && data.borrower.lastName
      ? `${data.borrower.firstName} ${data.borrower.lastName}`
      : data.borrower.firstName || data.borrower.lastName || '';

    context.borrower = {
      id: data.borrower.id,
      firstName: data.borrower.firstName,
      lastName: data.borrower.lastName,
      fullName,
      email: data.borrower.email,
      companyName: data.borrower.companyName,
      display: fullName || data.borrower.companyName,
    };
  }

  if (data.user) {
    const fullName = data.user.firstName && data.user.lastName
      ? `${data.user.firstName} ${data.user.lastName}`
      : data.user.firstName || data.user.lastName || '';

    context.user = {
      id: data.user.id,
      firstName: data.user.firstName,
      lastName: data.user.lastName,
      fullName,
      email: data.user.email,
      display: fullName,
    };
  }

  if (data.property) {
    const address = [data.property.street, data.property.city, data.property.state, data.property.zip]
      .filter(Boolean)
      .join(', ');

    context.property = {
      name: data.property.name,
      address: data.property.address || address,
      street: data.property.street,
      city: data.property.city,
      state: data.property.state,
      zip: data.property.zip,
      display: data.property.name || data.property.address || address,
    };
  }

  context.dates = {
    createdOn: data.uploadedAt,
    uploadedAt: data.uploadedAt,
    effectiveDate: data.effectiveDate,
    expiryDate: data.expiryDate,
  };

  return context;
}
