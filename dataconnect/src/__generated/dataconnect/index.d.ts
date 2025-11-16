import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface AssociateFileWithLoanData {
  fileLoanAssociation_insert: FileLoanAssociation_Key;
}

export interface AssociateFileWithLoanVariables {
  fileId: UUIDString;
  loanId: UUIDString;
  associatedBy?: UUIDString | null;
}

export interface AuthAuditLog_Key {
  id: UUIDString;
  __typename?: 'AuthAuditLog_Key';
}

export interface AuthSession_Key {
  id: UUIDString;
  __typename?: 'AuthSession_Key';
}

export interface CloseLoanData {
  loan_update?: Loan_Key | null;
}

export interface CloseLoanVariables {
  id: UUIDString;
  closedAt: TimestampString;
}

export interface CreateAuthSessionData {
  authSession_insert: AuthSession_Key;
}

export interface CreateAuthSessionVariables {
  sessionId: string;
  userId: UUIDString;
  loanIds?: string | null;
  emailHash: string;
  magicToken?: string | null;
  expiresAt: TimestampString;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdBy?: UUIDString | null;
}

export interface CreateAuthSessionWithFirebaseData {
  authSession_insert: AuthSession_Key;
}

export interface CreateAuthSessionWithFirebaseVariables {
  sessionId: string;
  userId: UUIDString;
  firebaseUid: string;
  emailHash: string;
  loanIds?: string | null;
  borrowerContactId?: string | null;
  loanNumber?: string | null;
  expiresAt: TimestampString;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface CreateFileData {
  file_insert: File_Key;
}

export interface CreateFileVariables {
  userId: UUIDString;
  originalFilename: string;
  storagePath: string;
  fileSize: number;
  mimeType?: string | null;
  fileExtension?: string | null;
  tags?: string | null;
  description?: string | null;
}

export interface CreateLoanData {
  loan_insert: Loan_Key;
}

export interface CreateLoanVariables {
  userId: UUIDString;
  loanNumber: string;
  borrowerName: string;
  borrowerEmail?: string | null;
  loanAmount?: number | null;
  loanType?: string | null;
  propertyAddress?: string | null;
  loanOfficerId?: UUIDString | null;
}

export interface CreateUserData {
  user_insert: User_Key;
}

export interface CreateUserVariables {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role?: string | null;
  phoneNumber?: string | null;
}

export interface CreateVerificationCodeData {
  verificationCode_insert: VerificationCode_Key;
}

export interface CreateVerificationCodeVariables {
  sessionId: string;
  codeHash: string;
  expiresAt: TimestampString;
}

export interface DeactivateUserData {
  user_update?: User_Key | null;
}

export interface DeactivateUserVariables {
  id: UUIDString;
}

export interface DeleteExpiredSessionsData {
  authSession_deleteMany: number;
}

export interface DeleteExpiredSessionsVariables {
  currentTime: TimestampString;
}

export interface DeleteExpiredVerificationCodesData {
  verificationCode_deleteMany: number;
}

export interface DeleteExpiredVerificationCodesVariables {
  currentTime: TimestampString;
}

export interface DeleteLoanData {
  loan_delete?: Loan_Key | null;
}

export interface DeleteLoanVariables {
  id: UUIDString;
}

export interface FileLoanAssociation_Key {
  id: UUIDString;
  __typename?: 'FileLoanAssociation_Key';
}

export interface File_Key {
  id: UUIDString;
  __typename?: 'File_Key';
}

export interface GetActiveAuthSessionForUserData {
  authSessions: ({
    id: UUIDString;
    sessionId: string;
    userId: UUIDString;
    loanIds?: string | null;
    status: string;
    expiresAt: TimestampString;
    lastAccessedAt?: TimestampString | null;
    borrowerContactId?: string | null;
    loanNumber?: string | null;
  } & AuthSession_Key)[];
}

export interface GetActiveAuthSessionForUserVariables {
  userId: UUIDString;
}

export interface GetAuthAuditLogsData {
  authAuditLogs: ({
    id: UUIDString;
    sessionId?: string | null;
    eventType: string;
    success: boolean;
    errorMessage?: string | null;
    ipAddress?: string | null;
    createdAt: TimestampString;
  } & AuthAuditLog_Key)[];
}

export interface GetAuthAuditLogsVariables {
  userId?: UUIDString | null;
  limit?: number | null;
}

export interface GetAuthSessionByEmailHashData {
  authSessions: ({
    id: UUIDString;
    sessionId: string;
    userId: UUIDString;
    loanIds?: string | null;
    emailHash: string;
    status: string;
    expiresAt: TimestampString;
    verifiedAt?: TimestampString | null;
    borrowerContactId?: string | null;
    loanNumber?: string | null;
    firebaseUid?: string | null;
  } & AuthSession_Key)[];
}

export interface GetAuthSessionByEmailHashVariables {
  emailHash: string;
}

export interface GetAuthSessionByFirebaseUidData {
  authSessions: ({
    id: UUIDString;
    sessionId: string;
    userId: UUIDString;
    loanIds?: string | null;
    emailHash: string;
    status: string;
    expiresAt: TimestampString;
    verifiedAt?: TimestampString | null;
    createdAt: TimestampString;
    borrowerContactId?: string | null;
    loanNumber?: string | null;
    firebaseUid?: string | null;
    user: {
      id: UUIDString;
      email: string;
      role: string;
      firstName?: string | null;
      lastName?: string | null;
    } & User_Key;
  } & AuthSession_Key)[];
}

export interface GetAuthSessionByFirebaseUidVariables {
  firebaseUid: string;
  email: string;
}

export interface GetAuthSessionData {
  authSessions: ({
    id: UUIDString;
    sessionId: string;
    userId: UUIDString;
    loanIds?: string | null;
    emailHash: string;
    tokenType: string;
    status: string;
    expiresAt: TimestampString;
    createdAt: TimestampString;
    verifiedAt?: TimestampString | null;
    lastAccessedAt?: TimestampString | null;
    ipAddress?: string | null;
    userAgent?: string | null;
  } & AuthSession_Key)[];
}

export interface GetAuthSessionVariables {
  sessionId: string;
}

export interface GetDashboardData {
  user?: {
    id: UUIDString;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    role: string;
  } & User_Key;
    loans: ({
      id: UUIDString;
      loanNumber: string;
      borrowerName: string;
      loanAmount?: number | null;
      status: string;
      createdAt: TimestampString;
    } & Loan_Key)[];
      files: ({
        id: UUIDString;
        originalFilename: string;
        fileSize: number;
        uploadedAt: TimestampString;
      } & File_Key)[];
}

export interface GetDashboardVariables {
  userId: UUIDString;
}

export interface GetFileAssociationsData {
  fileLoanAssociations: ({
    id: UUIDString;
    loanId: UUIDString;
    associatedAt: TimestampString;
  } & FileLoanAssociation_Key)[];
}

export interface GetFileAssociationsVariables {
  fileId: UUIDString;
}

export interface GetFileData {
  file?: {
    id: UUIDString;
    userId: UUIDString;
    originalFilename: string;
    storagePath: string;
    fileSize: number;
    mimeType?: string | null;
    fileExtension?: string | null;
    uploadedAt: TimestampString;
    updatedAt: TimestampString;
    tags?: string | null;
    description?: string | null;
    downloadUrl?: string | null;
    isDeleted: boolean;
    deletedAt?: TimestampString | null;
    deletedBy?: UUIDString | null;
  } & File_Key;
}

export interface GetFileVariables {
  id: UUIDString;
}

export interface GetFilesByLoanData {
  fileLoanAssociations: ({
    id: UUIDString;
    fileId: UUIDString;
    loanId: UUIDString;
    associatedAt: TimestampString;
  } & FileLoanAssociation_Key)[];
}

export interface GetFilesByLoanVariables {
  loanId: UUIDString;
}

export interface GetFilesWithAssociationsData {
  files: ({
    id: UUIDString;
    originalFilename: string;
    fileSize: number;
    uploadedAt: TimestampString;
  } & File_Key)[];
}

export interface GetFilesWithAssociationsVariables {
  userId: UUIDString;
}

export interface GetLoanAssociationsData {
  fileLoanAssociations: ({
    id: UUIDString;
    fileId: UUIDString;
    associatedAt: TimestampString;
  } & FileLoanAssociation_Key)[];
}

export interface GetLoanAssociationsVariables {
  loanId: UUIDString;
}

export interface GetLoanByNumberData {
  loans: ({
    id: UUIDString;
    userId: UUIDString;
    loanNumber: string;
    borrowerName: string;
    loanAmount?: number | null;
    status: string;
  } & Loan_Key)[];
}

export interface GetLoanByNumberVariables {
  loanNumber: string;
}

export interface GetLoanData {
  loan?: {
    id: UUIDString;
    userId: UUIDString;
    loanNumber: string;
    borrowerName: string;
    borrowerEmail?: string | null;
    loanAmount?: number | null;
    loanType?: string | null;
    status: string;
    propertyAddress?: string | null;
    loanOfficerId?: UUIDString | null;
    notes?: string | null;
    createdAt: TimestampString;
    updatedAt: TimestampString;
    closedAt?: TimestampString | null;
  } & Loan_Key;
}

export interface GetLoanDetailsData {
  loan?: {
    id: UUIDString;
    loanNumber: string;
    borrowerName: string;
    borrowerEmail?: string | null;
    loanAmount?: number | null;
    loanType?: string | null;
    status: string;
    propertyAddress?: string | null;
    notes?: string | null;
    createdAt: TimestampString;
  } & Loan_Key;
    fileLoanAssociations: ({
      id: UUIDString;
      fileId: UUIDString;
      associatedAt: TimestampString;
    } & FileLoanAssociation_Key)[];
}

export interface GetLoanDetailsVariables {
  loanId: UUIDString;
}

export interface GetLoanVariables {
  id: UUIDString;
}

export interface GetUserAuthSessionsData {
  authSessions: ({
    sessionId: string;
    expiresAt: TimestampString;
    lastAccessedAt?: TimestampString | null;
    createdAt: TimestampString;
    ipAddress?: string | null;
  })[];
}

export interface GetUserAuthSessionsVariables {
  userId: UUIDString;
}

export interface GetUserByEmailData {
  users: ({
    id: UUIDString;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    role: string;
    isActive: boolean;
  } & User_Key)[];
}

export interface GetUserByEmailVariables {
  email: string;
}

export interface GetUserData {
  user?: {
    id: UUIDString;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    role: string;
    isActive: boolean;
    phoneNumber?: string | null;
    createdAt: TimestampString;
    lastLoginAt?: TimestampString | null;
  } & User_Key;
}

export interface GetUserFilesData {
  files: ({
    id: UUIDString;
    originalFilename: string;
    storagePath: string;
    fileSize: number;
    mimeType?: string | null;
    fileExtension?: string | null;
    uploadedAt: TimestampString;
    tags?: string | null;
    description?: string | null;
    downloadUrl?: string | null;
    isDeleted: boolean;
  } & File_Key)[];
}

export interface GetUserFilesVariables {
  userId: UUIDString;
  includeDeleted?: boolean | null;
}

export interface GetUserLoansData {
  loans: ({
    id: UUIDString;
    loanNumber: string;
    borrowerName: string;
    borrowerEmail?: string | null;
    loanAmount?: number | null;
    loanType?: string | null;
    status: string;
    propertyAddress?: string | null;
    createdAt: TimestampString;
    closedAt?: TimestampString | null;
  } & Loan_Key)[];
}

export interface GetUserLoansVariables {
  userId: UUIDString;
}

export interface GetUserVariables {
  id: UUIDString;
}

export interface GetVerificationCodeData {
  verificationCodes: ({
    id: UUIDString;
    sessionId: string;
    codeHash: string;
    expiresAt: TimestampString;
    attemptCount: number;
    maxAttempts: number;
    isUsed: boolean;
    usedAt?: TimestampString | null;
  } & VerificationCode_Key)[];
}

export interface GetVerificationCodeVariables {
  sessionId: string;
}

export interface HardDeleteFileData {
  file_delete?: File_Key | null;
}

export interface HardDeleteFileVariables {
  id: UUIDString;
}

export interface ListAllUsersData {
  users: ({
    id: UUIDString;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    role: string;
    isActive: boolean;
    createdAt: TimestampString;
  } & User_Key)[];
}

export interface Loan_Key {
  id: UUIDString;
  __typename?: 'Loan_Key';
}

export interface LogAuthEventData {
  authAuditLog_insert: AuthAuditLog_Key;
}

export interface LogAuthEventVariables {
  sessionId?: string | null;
  userId?: UUIDString | null;
  eventType: string;
  success: boolean;
  errorMessage?: string | null;
  errorCode?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  requestPayload?: string | null;
}

export interface MarkVerificationCodeUsedData {
  verificationCode_update?: VerificationCode_Key | null;
}

export interface MarkVerificationCodeUsedVariables {
  id: UUIDString;
  usedAt: TimestampString;
}

export interface RateLimitTracking_Key {
  id: UUIDString;
  __typename?: 'RateLimitTracking_Key';
}

export interface RemoveFileFromLoanData {
  fileLoanAssociation_delete?: FileLoanAssociation_Key | null;
}

export interface RemoveFileFromLoanVariables {
  id: UUIDString;
}

export interface RevokeAuthSessionData {
  authSession_update?: AuthSession_Key | null;
}

export interface RevokeAuthSessionVariables {
  id: UUIDString;
  revokedBy?: UUIDString | null;
  revokeReason?: string | null;
  revokedAt: TimestampString;
}

export interface SoftDeleteFileData {
  file_update?: File_Key | null;
}

export interface SoftDeleteFileVariables {
  id: UUIDString;
  deletedBy?: UUIDString | null;
  deletedAt: TimestampString;
}

export interface TrackRateLimitData {
  rateLimitTracking_insert: RateLimitTracking_Key;
}

export interface TrackRateLimitVariables {
  identifier: string;
  actionType: string;
  attemptCount?: number | null;
  blockedUntil?: TimestampString | null;
}

export interface UpdateAuthSessionData {
  authSession_update?: AuthSession_Key | null;
}

export interface UpdateAuthSessionVariables {
  id: UUIDString;
  status?: string | null;
  sessionToken?: string | null;
  verifiedAt?: TimestampString | null;
  lastAccessedAt?: TimestampString | null;
}

export interface UpdateFileData {
  file_update?: File_Key | null;
}

export interface UpdateFileVariables {
  id: UUIDString;
  tags?: string | null;
  description?: string | null;
  downloadUrl?: string | null;
}

export interface UpdateLoanData {
  loan_update?: Loan_Key | null;
}

export interface UpdateLoanVariables {
  id: UUIDString;
  status?: string | null;
  notes?: string | null;
  loanAmount?: number | null;
}

export interface UpdateRateLimitData {
  rateLimitTracking_update?: RateLimitTracking_Key | null;
}

export interface UpdateRateLimitVariables {
  id: UUIDString;
  attemptCount: number;
  blockedUntil?: TimestampString | null;
}

export interface UpdateSessionAccessData {
  authSession_update?: AuthSession_Key | null;
}

export interface UpdateSessionAccessVariables {
  id: UUIDString;
  lastAccessedAt: TimestampString;
}

export interface UpdateUserData {
  user_update?: User_Key | null;
}

export interface UpdateUserVariables {
  id: UUIDString;
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
  lastLoginAt?: TimestampString | null;
}

export interface UpdateVerificationCodeAttemptsData {
  verificationCode_update?: VerificationCode_Key | null;
}

export interface UpdateVerificationCodeAttemptsVariables {
  id: UUIDString;
  attemptCount: number;
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

export interface VerificationCode_Key {
  id: UUIDString;
  __typename?: 'VerificationCode_Key';
}

export interface VerifyAuthSessionData {
  authSession_update?: AuthSession_Key | null;
}

export interface VerifyAuthSessionVariables {
  id: UUIDString;
  sessionToken: string;
  verifiedAt: TimestampString;
}

interface CreateUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
  operationName: string;
}
export const createUserRef: CreateUserRef;

export function createUser(vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;
export function createUser(dc: DataConnect, vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;

interface UpdateUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateUserVariables): MutationRef<UpdateUserData, UpdateUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateUserVariables): MutationRef<UpdateUserData, UpdateUserVariables>;
  operationName: string;
}
export const updateUserRef: UpdateUserRef;

export function updateUser(vars: UpdateUserVariables): MutationPromise<UpdateUserData, UpdateUserVariables>;
export function updateUser(dc: DataConnect, vars: UpdateUserVariables): MutationPromise<UpdateUserData, UpdateUserVariables>;

interface DeactivateUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeactivateUserVariables): MutationRef<DeactivateUserData, DeactivateUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeactivateUserVariables): MutationRef<DeactivateUserData, DeactivateUserVariables>;
  operationName: string;
}
export const deactivateUserRef: DeactivateUserRef;

export function deactivateUser(vars: DeactivateUserVariables): MutationPromise<DeactivateUserData, DeactivateUserVariables>;
export function deactivateUser(dc: DataConnect, vars: DeactivateUserVariables): MutationPromise<DeactivateUserData, DeactivateUserVariables>;

interface CreateLoanRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateLoanVariables): MutationRef<CreateLoanData, CreateLoanVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateLoanVariables): MutationRef<CreateLoanData, CreateLoanVariables>;
  operationName: string;
}
export const createLoanRef: CreateLoanRef;

export function createLoan(vars: CreateLoanVariables): MutationPromise<CreateLoanData, CreateLoanVariables>;
export function createLoan(dc: DataConnect, vars: CreateLoanVariables): MutationPromise<CreateLoanData, CreateLoanVariables>;

interface UpdateLoanRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateLoanVariables): MutationRef<UpdateLoanData, UpdateLoanVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateLoanVariables): MutationRef<UpdateLoanData, UpdateLoanVariables>;
  operationName: string;
}
export const updateLoanRef: UpdateLoanRef;

export function updateLoan(vars: UpdateLoanVariables): MutationPromise<UpdateLoanData, UpdateLoanVariables>;
export function updateLoan(dc: DataConnect, vars: UpdateLoanVariables): MutationPromise<UpdateLoanData, UpdateLoanVariables>;

interface CloseLoanRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CloseLoanVariables): MutationRef<CloseLoanData, CloseLoanVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CloseLoanVariables): MutationRef<CloseLoanData, CloseLoanVariables>;
  operationName: string;
}
export const closeLoanRef: CloseLoanRef;

export function closeLoan(vars: CloseLoanVariables): MutationPromise<CloseLoanData, CloseLoanVariables>;
export function closeLoan(dc: DataConnect, vars: CloseLoanVariables): MutationPromise<CloseLoanData, CloseLoanVariables>;

interface DeleteLoanRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteLoanVariables): MutationRef<DeleteLoanData, DeleteLoanVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteLoanVariables): MutationRef<DeleteLoanData, DeleteLoanVariables>;
  operationName: string;
}
export const deleteLoanRef: DeleteLoanRef;

export function deleteLoan(vars: DeleteLoanVariables): MutationPromise<DeleteLoanData, DeleteLoanVariables>;
export function deleteLoan(dc: DataConnect, vars: DeleteLoanVariables): MutationPromise<DeleteLoanData, DeleteLoanVariables>;

interface CreateFileRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateFileVariables): MutationRef<CreateFileData, CreateFileVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateFileVariables): MutationRef<CreateFileData, CreateFileVariables>;
  operationName: string;
}
export const createFileRef: CreateFileRef;

export function createFile(vars: CreateFileVariables): MutationPromise<CreateFileData, CreateFileVariables>;
export function createFile(dc: DataConnect, vars: CreateFileVariables): MutationPromise<CreateFileData, CreateFileVariables>;

interface UpdateFileRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateFileVariables): MutationRef<UpdateFileData, UpdateFileVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateFileVariables): MutationRef<UpdateFileData, UpdateFileVariables>;
  operationName: string;
}
export const updateFileRef: UpdateFileRef;

export function updateFile(vars: UpdateFileVariables): MutationPromise<UpdateFileData, UpdateFileVariables>;
export function updateFile(dc: DataConnect, vars: UpdateFileVariables): MutationPromise<UpdateFileData, UpdateFileVariables>;

interface SoftDeleteFileRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: SoftDeleteFileVariables): MutationRef<SoftDeleteFileData, SoftDeleteFileVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: SoftDeleteFileVariables): MutationRef<SoftDeleteFileData, SoftDeleteFileVariables>;
  operationName: string;
}
export const softDeleteFileRef: SoftDeleteFileRef;

export function softDeleteFile(vars: SoftDeleteFileVariables): MutationPromise<SoftDeleteFileData, SoftDeleteFileVariables>;
export function softDeleteFile(dc: DataConnect, vars: SoftDeleteFileVariables): MutationPromise<SoftDeleteFileData, SoftDeleteFileVariables>;

interface HardDeleteFileRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: HardDeleteFileVariables): MutationRef<HardDeleteFileData, HardDeleteFileVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: HardDeleteFileVariables): MutationRef<HardDeleteFileData, HardDeleteFileVariables>;
  operationName: string;
}
export const hardDeleteFileRef: HardDeleteFileRef;

export function hardDeleteFile(vars: HardDeleteFileVariables): MutationPromise<HardDeleteFileData, HardDeleteFileVariables>;
export function hardDeleteFile(dc: DataConnect, vars: HardDeleteFileVariables): MutationPromise<HardDeleteFileData, HardDeleteFileVariables>;

interface AssociateFileWithLoanRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: AssociateFileWithLoanVariables): MutationRef<AssociateFileWithLoanData, AssociateFileWithLoanVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: AssociateFileWithLoanVariables): MutationRef<AssociateFileWithLoanData, AssociateFileWithLoanVariables>;
  operationName: string;
}
export const associateFileWithLoanRef: AssociateFileWithLoanRef;

export function associateFileWithLoan(vars: AssociateFileWithLoanVariables): MutationPromise<AssociateFileWithLoanData, AssociateFileWithLoanVariables>;
export function associateFileWithLoan(dc: DataConnect, vars: AssociateFileWithLoanVariables): MutationPromise<AssociateFileWithLoanData, AssociateFileWithLoanVariables>;

interface RemoveFileFromLoanRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: RemoveFileFromLoanVariables): MutationRef<RemoveFileFromLoanData, RemoveFileFromLoanVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: RemoveFileFromLoanVariables): MutationRef<RemoveFileFromLoanData, RemoveFileFromLoanVariables>;
  operationName: string;
}
export const removeFileFromLoanRef: RemoveFileFromLoanRef;

export function removeFileFromLoan(vars: RemoveFileFromLoanVariables): MutationPromise<RemoveFileFromLoanData, RemoveFileFromLoanVariables>;
export function removeFileFromLoan(dc: DataConnect, vars: RemoveFileFromLoanVariables): MutationPromise<RemoveFileFromLoanData, RemoveFileFromLoanVariables>;

interface CreateAuthSessionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateAuthSessionVariables): MutationRef<CreateAuthSessionData, CreateAuthSessionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateAuthSessionVariables): MutationRef<CreateAuthSessionData, CreateAuthSessionVariables>;
  operationName: string;
}
export const createAuthSessionRef: CreateAuthSessionRef;

export function createAuthSession(vars: CreateAuthSessionVariables): MutationPromise<CreateAuthSessionData, CreateAuthSessionVariables>;
export function createAuthSession(dc: DataConnect, vars: CreateAuthSessionVariables): MutationPromise<CreateAuthSessionData, CreateAuthSessionVariables>;

interface CreateAuthSessionWithFirebaseRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateAuthSessionWithFirebaseVariables): MutationRef<CreateAuthSessionWithFirebaseData, CreateAuthSessionWithFirebaseVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateAuthSessionWithFirebaseVariables): MutationRef<CreateAuthSessionWithFirebaseData, CreateAuthSessionWithFirebaseVariables>;
  operationName: string;
}
export const createAuthSessionWithFirebaseRef: CreateAuthSessionWithFirebaseRef;

export function createAuthSessionWithFirebase(vars: CreateAuthSessionWithFirebaseVariables): MutationPromise<CreateAuthSessionWithFirebaseData, CreateAuthSessionWithFirebaseVariables>;
export function createAuthSessionWithFirebase(dc: DataConnect, vars: CreateAuthSessionWithFirebaseVariables): MutationPromise<CreateAuthSessionWithFirebaseData, CreateAuthSessionWithFirebaseVariables>;

interface UpdateAuthSessionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateAuthSessionVariables): MutationRef<UpdateAuthSessionData, UpdateAuthSessionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateAuthSessionVariables): MutationRef<UpdateAuthSessionData, UpdateAuthSessionVariables>;
  operationName: string;
}
export const updateAuthSessionRef: UpdateAuthSessionRef;

export function updateAuthSession(vars: UpdateAuthSessionVariables): MutationPromise<UpdateAuthSessionData, UpdateAuthSessionVariables>;
export function updateAuthSession(dc: DataConnect, vars: UpdateAuthSessionVariables): MutationPromise<UpdateAuthSessionData, UpdateAuthSessionVariables>;

interface VerifyAuthSessionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: VerifyAuthSessionVariables): MutationRef<VerifyAuthSessionData, VerifyAuthSessionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: VerifyAuthSessionVariables): MutationRef<VerifyAuthSessionData, VerifyAuthSessionVariables>;
  operationName: string;
}
export const verifyAuthSessionRef: VerifyAuthSessionRef;

export function verifyAuthSession(vars: VerifyAuthSessionVariables): MutationPromise<VerifyAuthSessionData, VerifyAuthSessionVariables>;
export function verifyAuthSession(dc: DataConnect, vars: VerifyAuthSessionVariables): MutationPromise<VerifyAuthSessionData, VerifyAuthSessionVariables>;

interface UpdateSessionAccessRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateSessionAccessVariables): MutationRef<UpdateSessionAccessData, UpdateSessionAccessVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateSessionAccessVariables): MutationRef<UpdateSessionAccessData, UpdateSessionAccessVariables>;
  operationName: string;
}
export const updateSessionAccessRef: UpdateSessionAccessRef;

export function updateSessionAccess(vars: UpdateSessionAccessVariables): MutationPromise<UpdateSessionAccessData, UpdateSessionAccessVariables>;
export function updateSessionAccess(dc: DataConnect, vars: UpdateSessionAccessVariables): MutationPromise<UpdateSessionAccessData, UpdateSessionAccessVariables>;

interface RevokeAuthSessionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: RevokeAuthSessionVariables): MutationRef<RevokeAuthSessionData, RevokeAuthSessionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: RevokeAuthSessionVariables): MutationRef<RevokeAuthSessionData, RevokeAuthSessionVariables>;
  operationName: string;
}
export const revokeAuthSessionRef: RevokeAuthSessionRef;

export function revokeAuthSession(vars: RevokeAuthSessionVariables): MutationPromise<RevokeAuthSessionData, RevokeAuthSessionVariables>;
export function revokeAuthSession(dc: DataConnect, vars: RevokeAuthSessionVariables): MutationPromise<RevokeAuthSessionData, RevokeAuthSessionVariables>;

interface CreateVerificationCodeRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateVerificationCodeVariables): MutationRef<CreateVerificationCodeData, CreateVerificationCodeVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateVerificationCodeVariables): MutationRef<CreateVerificationCodeData, CreateVerificationCodeVariables>;
  operationName: string;
}
export const createVerificationCodeRef: CreateVerificationCodeRef;

export function createVerificationCode(vars: CreateVerificationCodeVariables): MutationPromise<CreateVerificationCodeData, CreateVerificationCodeVariables>;
export function createVerificationCode(dc: DataConnect, vars: CreateVerificationCodeVariables): MutationPromise<CreateVerificationCodeData, CreateVerificationCodeVariables>;

interface UpdateVerificationCodeAttemptsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateVerificationCodeAttemptsVariables): MutationRef<UpdateVerificationCodeAttemptsData, UpdateVerificationCodeAttemptsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateVerificationCodeAttemptsVariables): MutationRef<UpdateVerificationCodeAttemptsData, UpdateVerificationCodeAttemptsVariables>;
  operationName: string;
}
export const updateVerificationCodeAttemptsRef: UpdateVerificationCodeAttemptsRef;

export function updateVerificationCodeAttempts(vars: UpdateVerificationCodeAttemptsVariables): MutationPromise<UpdateVerificationCodeAttemptsData, UpdateVerificationCodeAttemptsVariables>;
export function updateVerificationCodeAttempts(dc: DataConnect, vars: UpdateVerificationCodeAttemptsVariables): MutationPromise<UpdateVerificationCodeAttemptsData, UpdateVerificationCodeAttemptsVariables>;

interface MarkVerificationCodeUsedRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: MarkVerificationCodeUsedVariables): MutationRef<MarkVerificationCodeUsedData, MarkVerificationCodeUsedVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: MarkVerificationCodeUsedVariables): MutationRef<MarkVerificationCodeUsedData, MarkVerificationCodeUsedVariables>;
  operationName: string;
}
export const markVerificationCodeUsedRef: MarkVerificationCodeUsedRef;

export function markVerificationCodeUsed(vars: MarkVerificationCodeUsedVariables): MutationPromise<MarkVerificationCodeUsedData, MarkVerificationCodeUsedVariables>;
export function markVerificationCodeUsed(dc: DataConnect, vars: MarkVerificationCodeUsedVariables): MutationPromise<MarkVerificationCodeUsedData, MarkVerificationCodeUsedVariables>;

interface LogAuthEventRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: LogAuthEventVariables): MutationRef<LogAuthEventData, LogAuthEventVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: LogAuthEventVariables): MutationRef<LogAuthEventData, LogAuthEventVariables>;
  operationName: string;
}
export const logAuthEventRef: LogAuthEventRef;

export function logAuthEvent(vars: LogAuthEventVariables): MutationPromise<LogAuthEventData, LogAuthEventVariables>;
export function logAuthEvent(dc: DataConnect, vars: LogAuthEventVariables): MutationPromise<LogAuthEventData, LogAuthEventVariables>;

interface TrackRateLimitRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: TrackRateLimitVariables): MutationRef<TrackRateLimitData, TrackRateLimitVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: TrackRateLimitVariables): MutationRef<TrackRateLimitData, TrackRateLimitVariables>;
  operationName: string;
}
export const trackRateLimitRef: TrackRateLimitRef;

export function trackRateLimit(vars: TrackRateLimitVariables): MutationPromise<TrackRateLimitData, TrackRateLimitVariables>;
export function trackRateLimit(dc: DataConnect, vars: TrackRateLimitVariables): MutationPromise<TrackRateLimitData, TrackRateLimitVariables>;

interface UpdateRateLimitRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateRateLimitVariables): MutationRef<UpdateRateLimitData, UpdateRateLimitVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateRateLimitVariables): MutationRef<UpdateRateLimitData, UpdateRateLimitVariables>;
  operationName: string;
}
export const updateRateLimitRef: UpdateRateLimitRef;

export function updateRateLimit(vars: UpdateRateLimitVariables): MutationPromise<UpdateRateLimitData, UpdateRateLimitVariables>;
export function updateRateLimit(dc: DataConnect, vars: UpdateRateLimitVariables): MutationPromise<UpdateRateLimitData, UpdateRateLimitVariables>;

interface DeleteExpiredSessionsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteExpiredSessionsVariables): MutationRef<DeleteExpiredSessionsData, DeleteExpiredSessionsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteExpiredSessionsVariables): MutationRef<DeleteExpiredSessionsData, DeleteExpiredSessionsVariables>;
  operationName: string;
}
export const deleteExpiredSessionsRef: DeleteExpiredSessionsRef;

export function deleteExpiredSessions(vars: DeleteExpiredSessionsVariables): MutationPromise<DeleteExpiredSessionsData, DeleteExpiredSessionsVariables>;
export function deleteExpiredSessions(dc: DataConnect, vars: DeleteExpiredSessionsVariables): MutationPromise<DeleteExpiredSessionsData, DeleteExpiredSessionsVariables>;

interface DeleteExpiredVerificationCodesRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteExpiredVerificationCodesVariables): MutationRef<DeleteExpiredVerificationCodesData, DeleteExpiredVerificationCodesVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteExpiredVerificationCodesVariables): MutationRef<DeleteExpiredVerificationCodesData, DeleteExpiredVerificationCodesVariables>;
  operationName: string;
}
export const deleteExpiredVerificationCodesRef: DeleteExpiredVerificationCodesRef;

export function deleteExpiredVerificationCodes(vars: DeleteExpiredVerificationCodesVariables): MutationPromise<DeleteExpiredVerificationCodesData, DeleteExpiredVerificationCodesVariables>;
export function deleteExpiredVerificationCodes(dc: DataConnect, vars: DeleteExpiredVerificationCodesVariables): MutationPromise<DeleteExpiredVerificationCodesData, DeleteExpiredVerificationCodesVariables>;

interface GetUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserVariables): QueryRef<GetUserData, GetUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetUserVariables): QueryRef<GetUserData, GetUserVariables>;
  operationName: string;
}
export const getUserRef: GetUserRef;

export function getUser(vars: GetUserVariables): QueryPromise<GetUserData, GetUserVariables>;
export function getUser(dc: DataConnect, vars: GetUserVariables): QueryPromise<GetUserData, GetUserVariables>;

interface GetUserByEmailRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserByEmailVariables): QueryRef<GetUserByEmailData, GetUserByEmailVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetUserByEmailVariables): QueryRef<GetUserByEmailData, GetUserByEmailVariables>;
  operationName: string;
}
export const getUserByEmailRef: GetUserByEmailRef;

export function getUserByEmail(vars: GetUserByEmailVariables): QueryPromise<GetUserByEmailData, GetUserByEmailVariables>;
export function getUserByEmail(dc: DataConnect, vars: GetUserByEmailVariables): QueryPromise<GetUserByEmailData, GetUserByEmailVariables>;

interface ListAllUsersRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListAllUsersData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListAllUsersData, undefined>;
  operationName: string;
}
export const listAllUsersRef: ListAllUsersRef;

export function listAllUsers(): QueryPromise<ListAllUsersData, undefined>;
export function listAllUsers(dc: DataConnect): QueryPromise<ListAllUsersData, undefined>;

interface GetUserLoansRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserLoansVariables): QueryRef<GetUserLoansData, GetUserLoansVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetUserLoansVariables): QueryRef<GetUserLoansData, GetUserLoansVariables>;
  operationName: string;
}
export const getUserLoansRef: GetUserLoansRef;

export function getUserLoans(vars: GetUserLoansVariables): QueryPromise<GetUserLoansData, GetUserLoansVariables>;
export function getUserLoans(dc: DataConnect, vars: GetUserLoansVariables): QueryPromise<GetUserLoansData, GetUserLoansVariables>;

interface GetLoanRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetLoanVariables): QueryRef<GetLoanData, GetLoanVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetLoanVariables): QueryRef<GetLoanData, GetLoanVariables>;
  operationName: string;
}
export const getLoanRef: GetLoanRef;

export function getLoan(vars: GetLoanVariables): QueryPromise<GetLoanData, GetLoanVariables>;
export function getLoan(dc: DataConnect, vars: GetLoanVariables): QueryPromise<GetLoanData, GetLoanVariables>;

interface GetLoanByNumberRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetLoanByNumberVariables): QueryRef<GetLoanByNumberData, GetLoanByNumberVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetLoanByNumberVariables): QueryRef<GetLoanByNumberData, GetLoanByNumberVariables>;
  operationName: string;
}
export const getLoanByNumberRef: GetLoanByNumberRef;

export function getLoanByNumber(vars: GetLoanByNumberVariables): QueryPromise<GetLoanByNumberData, GetLoanByNumberVariables>;
export function getLoanByNumber(dc: DataConnect, vars: GetLoanByNumberVariables): QueryPromise<GetLoanByNumberData, GetLoanByNumberVariables>;

interface GetUserFilesRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserFilesVariables): QueryRef<GetUserFilesData, GetUserFilesVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetUserFilesVariables): QueryRef<GetUserFilesData, GetUserFilesVariables>;
  operationName: string;
}
export const getUserFilesRef: GetUserFilesRef;

export function getUserFiles(vars: GetUserFilesVariables): QueryPromise<GetUserFilesData, GetUserFilesVariables>;
export function getUserFiles(dc: DataConnect, vars: GetUserFilesVariables): QueryPromise<GetUserFilesData, GetUserFilesVariables>;

interface GetFilesByLoanRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetFilesByLoanVariables): QueryRef<GetFilesByLoanData, GetFilesByLoanVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetFilesByLoanVariables): QueryRef<GetFilesByLoanData, GetFilesByLoanVariables>;
  operationName: string;
}
export const getFilesByLoanRef: GetFilesByLoanRef;

export function getFilesByLoan(vars: GetFilesByLoanVariables): QueryPromise<GetFilesByLoanData, GetFilesByLoanVariables>;
export function getFilesByLoan(dc: DataConnect, vars: GetFilesByLoanVariables): QueryPromise<GetFilesByLoanData, GetFilesByLoanVariables>;

interface GetFileRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetFileVariables): QueryRef<GetFileData, GetFileVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetFileVariables): QueryRef<GetFileData, GetFileVariables>;
  operationName: string;
}
export const getFileRef: GetFileRef;

export function getFile(vars: GetFileVariables): QueryPromise<GetFileData, GetFileVariables>;
export function getFile(dc: DataConnect, vars: GetFileVariables): QueryPromise<GetFileData, GetFileVariables>;

interface GetFilesWithAssociationsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetFilesWithAssociationsVariables): QueryRef<GetFilesWithAssociationsData, GetFilesWithAssociationsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetFilesWithAssociationsVariables): QueryRef<GetFilesWithAssociationsData, GetFilesWithAssociationsVariables>;
  operationName: string;
}
export const getFilesWithAssociationsRef: GetFilesWithAssociationsRef;

export function getFilesWithAssociations(vars: GetFilesWithAssociationsVariables): QueryPromise<GetFilesWithAssociationsData, GetFilesWithAssociationsVariables>;
export function getFilesWithAssociations(dc: DataConnect, vars: GetFilesWithAssociationsVariables): QueryPromise<GetFilesWithAssociationsData, GetFilesWithAssociationsVariables>;

interface GetFileAssociationsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetFileAssociationsVariables): QueryRef<GetFileAssociationsData, GetFileAssociationsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetFileAssociationsVariables): QueryRef<GetFileAssociationsData, GetFileAssociationsVariables>;
  operationName: string;
}
export const getFileAssociationsRef: GetFileAssociationsRef;

export function getFileAssociations(vars: GetFileAssociationsVariables): QueryPromise<GetFileAssociationsData, GetFileAssociationsVariables>;
export function getFileAssociations(dc: DataConnect, vars: GetFileAssociationsVariables): QueryPromise<GetFileAssociationsData, GetFileAssociationsVariables>;

interface GetLoanAssociationsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetLoanAssociationsVariables): QueryRef<GetLoanAssociationsData, GetLoanAssociationsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetLoanAssociationsVariables): QueryRef<GetLoanAssociationsData, GetLoanAssociationsVariables>;
  operationName: string;
}
export const getLoanAssociationsRef: GetLoanAssociationsRef;

export function getLoanAssociations(vars: GetLoanAssociationsVariables): QueryPromise<GetLoanAssociationsData, GetLoanAssociationsVariables>;
export function getLoanAssociations(dc: DataConnect, vars: GetLoanAssociationsVariables): QueryPromise<GetLoanAssociationsData, GetLoanAssociationsVariables>;

interface GetAuthSessionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetAuthSessionVariables): QueryRef<GetAuthSessionData, GetAuthSessionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetAuthSessionVariables): QueryRef<GetAuthSessionData, GetAuthSessionVariables>;
  operationName: string;
}
export const getAuthSessionRef: GetAuthSessionRef;

export function getAuthSession(vars: GetAuthSessionVariables): QueryPromise<GetAuthSessionData, GetAuthSessionVariables>;
export function getAuthSession(dc: DataConnect, vars: GetAuthSessionVariables): QueryPromise<GetAuthSessionData, GetAuthSessionVariables>;

interface GetUserAuthSessionsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserAuthSessionsVariables): QueryRef<GetUserAuthSessionsData, GetUserAuthSessionsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetUserAuthSessionsVariables): QueryRef<GetUserAuthSessionsData, GetUserAuthSessionsVariables>;
  operationName: string;
}
export const getUserAuthSessionsRef: GetUserAuthSessionsRef;

export function getUserAuthSessions(vars: GetUserAuthSessionsVariables): QueryPromise<GetUserAuthSessionsData, GetUserAuthSessionsVariables>;
export function getUserAuthSessions(dc: DataConnect, vars: GetUserAuthSessionsVariables): QueryPromise<GetUserAuthSessionsData, GetUserAuthSessionsVariables>;

interface GetVerificationCodeRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetVerificationCodeVariables): QueryRef<GetVerificationCodeData, GetVerificationCodeVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetVerificationCodeVariables): QueryRef<GetVerificationCodeData, GetVerificationCodeVariables>;
  operationName: string;
}
export const getVerificationCodeRef: GetVerificationCodeRef;

export function getVerificationCode(vars: GetVerificationCodeVariables): QueryPromise<GetVerificationCodeData, GetVerificationCodeVariables>;
export function getVerificationCode(dc: DataConnect, vars: GetVerificationCodeVariables): QueryPromise<GetVerificationCodeData, GetVerificationCodeVariables>;

interface GetAuthAuditLogsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars?: GetAuthAuditLogsVariables): QueryRef<GetAuthAuditLogsData, GetAuthAuditLogsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars?: GetAuthAuditLogsVariables): QueryRef<GetAuthAuditLogsData, GetAuthAuditLogsVariables>;
  operationName: string;
}
export const getAuthAuditLogsRef: GetAuthAuditLogsRef;

export function getAuthAuditLogs(vars?: GetAuthAuditLogsVariables): QueryPromise<GetAuthAuditLogsData, GetAuthAuditLogsVariables>;
export function getAuthAuditLogs(dc: DataConnect, vars?: GetAuthAuditLogsVariables): QueryPromise<GetAuthAuditLogsData, GetAuthAuditLogsVariables>;

interface GetAuthSessionByFirebaseUidRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetAuthSessionByFirebaseUidVariables): QueryRef<GetAuthSessionByFirebaseUidData, GetAuthSessionByFirebaseUidVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetAuthSessionByFirebaseUidVariables): QueryRef<GetAuthSessionByFirebaseUidData, GetAuthSessionByFirebaseUidVariables>;
  operationName: string;
}
export const getAuthSessionByFirebaseUidRef: GetAuthSessionByFirebaseUidRef;

export function getAuthSessionByFirebaseUid(vars: GetAuthSessionByFirebaseUidVariables): QueryPromise<GetAuthSessionByFirebaseUidData, GetAuthSessionByFirebaseUidVariables>;
export function getAuthSessionByFirebaseUid(dc: DataConnect, vars: GetAuthSessionByFirebaseUidVariables): QueryPromise<GetAuthSessionByFirebaseUidData, GetAuthSessionByFirebaseUidVariables>;

interface GetAuthSessionByEmailHashRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetAuthSessionByEmailHashVariables): QueryRef<GetAuthSessionByEmailHashData, GetAuthSessionByEmailHashVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetAuthSessionByEmailHashVariables): QueryRef<GetAuthSessionByEmailHashData, GetAuthSessionByEmailHashVariables>;
  operationName: string;
}
export const getAuthSessionByEmailHashRef: GetAuthSessionByEmailHashRef;

export function getAuthSessionByEmailHash(vars: GetAuthSessionByEmailHashVariables): QueryPromise<GetAuthSessionByEmailHashData, GetAuthSessionByEmailHashVariables>;
export function getAuthSessionByEmailHash(dc: DataConnect, vars: GetAuthSessionByEmailHashVariables): QueryPromise<GetAuthSessionByEmailHashData, GetAuthSessionByEmailHashVariables>;

interface GetActiveAuthSessionForUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetActiveAuthSessionForUserVariables): QueryRef<GetActiveAuthSessionForUserData, GetActiveAuthSessionForUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetActiveAuthSessionForUserVariables): QueryRef<GetActiveAuthSessionForUserData, GetActiveAuthSessionForUserVariables>;
  operationName: string;
}
export const getActiveAuthSessionForUserRef: GetActiveAuthSessionForUserRef;

export function getActiveAuthSessionForUser(vars: GetActiveAuthSessionForUserVariables): QueryPromise<GetActiveAuthSessionForUserData, GetActiveAuthSessionForUserVariables>;
export function getActiveAuthSessionForUser(dc: DataConnect, vars: GetActiveAuthSessionForUserVariables): QueryPromise<GetActiveAuthSessionForUserData, GetActiveAuthSessionForUserVariables>;

interface GetDashboardRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetDashboardVariables): QueryRef<GetDashboardData, GetDashboardVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetDashboardVariables): QueryRef<GetDashboardData, GetDashboardVariables>;
  operationName: string;
}
export const getDashboardRef: GetDashboardRef;

export function getDashboard(vars: GetDashboardVariables): QueryPromise<GetDashboardData, GetDashboardVariables>;
export function getDashboard(dc: DataConnect, vars: GetDashboardVariables): QueryPromise<GetDashboardData, GetDashboardVariables>;

interface GetLoanDetailsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetLoanDetailsVariables): QueryRef<GetLoanDetailsData, GetLoanDetailsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetLoanDetailsVariables): QueryRef<GetLoanDetailsData, GetLoanDetailsVariables>;
  operationName: string;
}
export const getLoanDetailsRef: GetLoanDetailsRef;

export function getLoanDetails(vars: GetLoanDetailsVariables): QueryPromise<GetLoanDetailsData, GetLoanDetailsVariables>;
export function getLoanDetails(dc: DataConnect, vars: GetLoanDetailsVariables): QueryPromise<GetLoanDetailsData, GetLoanDetailsVariables>;

