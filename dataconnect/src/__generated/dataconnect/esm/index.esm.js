import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'mybox-connector',
  service: 'mybox-dataconnect',
  location: 'us-central1'
};

export const createUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateUser', inputVars);
}
createUserRef.operationName = 'CreateUser';

export function createUser(dcOrVars, vars) {
  return executeMutation(createUserRef(dcOrVars, vars));
}

export const updateUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateUser', inputVars);
}
updateUserRef.operationName = 'UpdateUser';

export function updateUser(dcOrVars, vars) {
  return executeMutation(updateUserRef(dcOrVars, vars));
}

export const updateUserPasswordStatusRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateUserPasswordStatus', inputVars);
}
updateUserPasswordStatusRef.operationName = 'UpdateUserPasswordStatus';

export function updateUserPasswordStatus(dcOrVars, vars) {
  return executeMutation(updateUserPasswordStatusRef(dcOrVars, vars));
}

export const deactivateUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeactivateUser', inputVars);
}
deactivateUserRef.operationName = 'DeactivateUser';

export function deactivateUser(dcOrVars, vars) {
  return executeMutation(deactivateUserRef(dcOrVars, vars));
}

export const updateUserRoleRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateUserRole', inputVars);
}
updateUserRoleRef.operationName = 'UpdateUserRole';

export function updateUserRole(dcOrVars, vars) {
  return executeMutation(updateUserRoleRef(dcOrVars, vars));
}

export const createLoanRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateLoan', inputVars);
}
createLoanRef.operationName = 'CreateLoan';

export function createLoan(dcOrVars, vars) {
  return executeMutation(createLoanRef(dcOrVars, vars));
}

export const updateLoanRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateLoan', inputVars);
}
updateLoanRef.operationName = 'UpdateLoan';

export function updateLoan(dcOrVars, vars) {
  return executeMutation(updateLoanRef(dcOrVars, vars));
}

export const closeLoanRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CloseLoan', inputVars);
}
closeLoanRef.operationName = 'CloseLoan';

export function closeLoan(dcOrVars, vars) {
  return executeMutation(closeLoanRef(dcOrVars, vars));
}

export const deleteLoanRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteLoan', inputVars);
}
deleteLoanRef.operationName = 'DeleteLoan';

export function deleteLoan(dcOrVars, vars) {
  return executeMutation(deleteLoanRef(dcOrVars, vars));
}

export const createFileRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateFile', inputVars);
}
createFileRef.operationName = 'CreateFile';

export function createFile(dcOrVars, vars) {
  return executeMutation(createFileRef(dcOrVars, vars));
}

export const updateFileRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateFile', inputVars);
}
updateFileRef.operationName = 'UpdateFile';

export function updateFile(dcOrVars, vars) {
  return executeMutation(updateFileRef(dcOrVars, vars));
}

export const softDeleteFileRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'SoftDeleteFile', inputVars);
}
softDeleteFileRef.operationName = 'SoftDeleteFile';

export function softDeleteFile(dcOrVars, vars) {
  return executeMutation(softDeleteFileRef(dcOrVars, vars));
}

export const hardDeleteFileRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'HardDeleteFile', inputVars);
}
hardDeleteFileRef.operationName = 'HardDeleteFile';

export function hardDeleteFile(dcOrVars, vars) {
  return executeMutation(hardDeleteFileRef(dcOrVars, vars));
}

export const renameFileRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'RenameFile', inputVars);
}
renameFileRef.operationName = 'RenameFile';

export function renameFile(dcOrVars, vars) {
  return executeMutation(renameFileRef(dcOrVars, vars));
}

export const moveFileRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'MoveFile', inputVars);
}
moveFileRef.operationName = 'MoveFile';

export function moveFile(dcOrVars, vars) {
  return executeMutation(moveFileRef(dcOrVars, vars));
}

export const copyFileRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CopyFile', inputVars);
}
copyFileRef.operationName = 'CopyFile';

export function copyFile(dcOrVars, vars) {
  return executeMutation(copyFileRef(dcOrVars, vars));
}

export const restoreFileRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'RestoreFile', inputVars);
}
restoreFileRef.operationName = 'RestoreFile';

export function restoreFile(dcOrVars, vars) {
  return executeMutation(restoreFileRef(dcOrVars, vars));
}

export const associateFileWithLoanRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'AssociateFileWithLoan', inputVars);
}
associateFileWithLoanRef.operationName = 'AssociateFileWithLoan';

export function associateFileWithLoan(dcOrVars, vars) {
  return executeMutation(associateFileWithLoanRef(dcOrVars, vars));
}

export const removeFileFromLoanRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'RemoveFileFromLoan', inputVars);
}
removeFileFromLoanRef.operationName = 'RemoveFileFromLoan';

export function removeFileFromLoan(dcOrVars, vars) {
  return executeMutation(removeFileFromLoanRef(dcOrVars, vars));
}

export const createAuthSessionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateAuthSession', inputVars);
}
createAuthSessionRef.operationName = 'CreateAuthSession';

export function createAuthSession(dcOrVars, vars) {
  return executeMutation(createAuthSessionRef(dcOrVars, vars));
}

export const createAuthSessionWithFirebaseRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateAuthSessionWithFirebase', inputVars);
}
createAuthSessionWithFirebaseRef.operationName = 'CreateAuthSessionWithFirebase';

export function createAuthSessionWithFirebase(dcOrVars, vars) {
  return executeMutation(createAuthSessionWithFirebaseRef(dcOrVars, vars));
}

export const updateAuthSessionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateAuthSession', inputVars);
}
updateAuthSessionRef.operationName = 'UpdateAuthSession';

export function updateAuthSession(dcOrVars, vars) {
  return executeMutation(updateAuthSessionRef(dcOrVars, vars));
}

export const verifyAuthSessionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'VerifyAuthSession', inputVars);
}
verifyAuthSessionRef.operationName = 'VerifyAuthSession';

export function verifyAuthSession(dcOrVars, vars) {
  return executeMutation(verifyAuthSessionRef(dcOrVars, vars));
}

export const updateSessionAccessRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateSessionAccess', inputVars);
}
updateSessionAccessRef.operationName = 'UpdateSessionAccess';

export function updateSessionAccess(dcOrVars, vars) {
  return executeMutation(updateSessionAccessRef(dcOrVars, vars));
}

export const revokeAuthSessionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'RevokeAuthSession', inputVars);
}
revokeAuthSessionRef.operationName = 'RevokeAuthSession';

export function revokeAuthSession(dcOrVars, vars) {
  return executeMutation(revokeAuthSessionRef(dcOrVars, vars));
}

export const createVerificationCodeRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateVerificationCode', inputVars);
}
createVerificationCodeRef.operationName = 'CreateVerificationCode';

export function createVerificationCode(dcOrVars, vars) {
  return executeMutation(createVerificationCodeRef(dcOrVars, vars));
}

export const updateVerificationCodeAttemptsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateVerificationCodeAttempts', inputVars);
}
updateVerificationCodeAttemptsRef.operationName = 'UpdateVerificationCodeAttempts';

export function updateVerificationCodeAttempts(dcOrVars, vars) {
  return executeMutation(updateVerificationCodeAttemptsRef(dcOrVars, vars));
}

export const markVerificationCodeUsedRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'MarkVerificationCodeUsed', inputVars);
}
markVerificationCodeUsedRef.operationName = 'MarkVerificationCodeUsed';

export function markVerificationCodeUsed(dcOrVars, vars) {
  return executeMutation(markVerificationCodeUsedRef(dcOrVars, vars));
}

export const logAuthEventRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'LogAuthEvent', inputVars);
}
logAuthEventRef.operationName = 'LogAuthEvent';

export function logAuthEvent(dcOrVars, vars) {
  return executeMutation(logAuthEventRef(dcOrVars, vars));
}

export const trackRateLimitRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'TrackRateLimit', inputVars);
}
trackRateLimitRef.operationName = 'TrackRateLimit';

export function trackRateLimit(dcOrVars, vars) {
  return executeMutation(trackRateLimitRef(dcOrVars, vars));
}

export const updateRateLimitRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateRateLimit', inputVars);
}
updateRateLimitRef.operationName = 'UpdateRateLimit';

export function updateRateLimit(dcOrVars, vars) {
  return executeMutation(updateRateLimitRef(dcOrVars, vars));
}

export const deleteExpiredSessionsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteExpiredSessions', inputVars);
}
deleteExpiredSessionsRef.operationName = 'DeleteExpiredSessions';

export function deleteExpiredSessions(dcOrVars, vars) {
  return executeMutation(deleteExpiredSessionsRef(dcOrVars, vars));
}

export const deleteExpiredVerificationCodesRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteExpiredVerificationCodes', inputVars);
}
deleteExpiredVerificationCodesRef.operationName = 'DeleteExpiredVerificationCodes';

export function deleteExpiredVerificationCodes(dcOrVars, vars) {
  return executeMutation(deleteExpiredVerificationCodesRef(dcOrVars, vars));
}

export const createMagicLinkRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateMagicLink', inputVars);
}
createMagicLinkRef.operationName = 'CreateMagicLink';

export function createMagicLink(dcOrVars, vars) {
  return executeMutation(createMagicLinkRef(dcOrVars, vars));
}

export const updateMagicLinkSendCountRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateMagicLinkSendCount', inputVars);
}
updateMagicLinkSendCountRef.operationName = 'UpdateMagicLinkSendCount';

export function updateMagicLinkSendCount(dcOrVars, vars) {
  return executeMutation(updateMagicLinkSendCountRef(dcOrVars, vars));
}

export const revokeMagicLinkRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'RevokeMagicLink', inputVars);
}
revokeMagicLinkRef.operationName = 'RevokeMagicLink';

export function revokeMagicLink(dcOrVars, vars) {
  return executeMutation(revokeMagicLinkRef(dcOrVars, vars));
}

export const markMagicLinkUsedRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'MarkMagicLinkUsed', inputVars);
}
markMagicLinkUsedRef.operationName = 'MarkMagicLinkUsed';

export function markMagicLinkUsed(dcOrVars, vars) {
  return executeMutation(markMagicLinkUsedRef(dcOrVars, vars));
}

export const extendMagicLinkRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'ExtendMagicLink', inputVars);
}
extendMagicLinkRef.operationName = 'ExtendMagicLink';

export function extendMagicLink(dcOrVars, vars) {
  return executeMutation(extendMagicLinkRef(dcOrVars, vars));
}

export const getUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetUser', inputVars);
}
getUserRef.operationName = 'GetUser';

export function getUser(dcOrVars, vars) {
  return executeQuery(getUserRef(dcOrVars, vars));
}

export const getUserByEmailRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetUserByEmail', inputVars);
}
getUserByEmailRef.operationName = 'GetUserByEmail';

export function getUserByEmail(dcOrVars, vars) {
  return executeQuery(getUserByEmailRef(dcOrVars, vars));
}

export const listAllUsersRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListAllUsers');
}
listAllUsersRef.operationName = 'ListAllUsers';

export function listAllUsers(dc) {
  return executeQuery(listAllUsersRef(dc));
}

export const getUserLoansRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetUserLoans', inputVars);
}
getUserLoansRef.operationName = 'GetUserLoans';

export function getUserLoans(dcOrVars, vars) {
  return executeQuery(getUserLoansRef(dcOrVars, vars));
}

export const getLoanRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetLoan', inputVars);
}
getLoanRef.operationName = 'GetLoan';

export function getLoan(dcOrVars, vars) {
  return executeQuery(getLoanRef(dcOrVars, vars));
}

export const getLoanByNumberRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetLoanByNumber', inputVars);
}
getLoanByNumberRef.operationName = 'GetLoanByNumber';

export function getLoanByNumber(dcOrVars, vars) {
  return executeQuery(getLoanByNumberRef(dcOrVars, vars));
}

export const getUserFilesRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetUserFiles', inputVars);
}
getUserFilesRef.operationName = 'GetUserFiles';

export function getUserFiles(dcOrVars, vars) {
  return executeQuery(getUserFilesRef(dcOrVars, vars));
}

export const getFilesByLoanRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetFilesByLoan', inputVars);
}
getFilesByLoanRef.operationName = 'GetFilesByLoan';

export function getFilesByLoan(dcOrVars, vars) {
  return executeQuery(getFilesByLoanRef(dcOrVars, vars));
}

export const getFileRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetFile', inputVars);
}
getFileRef.operationName = 'GetFile';

export function getFile(dcOrVars, vars) {
  return executeQuery(getFileRef(dcOrVars, vars));
}

export const getFilesWithAssociationsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetFilesWithAssociations', inputVars);
}
getFilesWithAssociationsRef.operationName = 'GetFilesWithAssociations';

export function getFilesWithAssociations(dcOrVars, vars) {
  return executeQuery(getFilesWithAssociationsRef(dcOrVars, vars));
}

export const getFileAssociationsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetFileAssociations', inputVars);
}
getFileAssociationsRef.operationName = 'GetFileAssociations';

export function getFileAssociations(dcOrVars, vars) {
  return executeQuery(getFileAssociationsRef(dcOrVars, vars));
}

export const getLoanAssociationsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetLoanAssociations', inputVars);
}
getLoanAssociationsRef.operationName = 'GetLoanAssociations';

export function getLoanAssociations(dcOrVars, vars) {
  return executeQuery(getLoanAssociationsRef(dcOrVars, vars));
}

export const getAuthSessionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetAuthSession', inputVars);
}
getAuthSessionRef.operationName = 'GetAuthSession';

export function getAuthSession(dcOrVars, vars) {
  return executeQuery(getAuthSessionRef(dcOrVars, vars));
}

export const getUserAuthSessionsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetUserAuthSessions', inputVars);
}
getUserAuthSessionsRef.operationName = 'GetUserAuthSessions';

export function getUserAuthSessions(dcOrVars, vars) {
  return executeQuery(getUserAuthSessionsRef(dcOrVars, vars));
}

export const getVerificationCodeRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetVerificationCode', inputVars);
}
getVerificationCodeRef.operationName = 'GetVerificationCode';

export function getVerificationCode(dcOrVars, vars) {
  return executeQuery(getVerificationCodeRef(dcOrVars, vars));
}

export const getAuthAuditLogsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetAuthAuditLogs', inputVars);
}
getAuthAuditLogsRef.operationName = 'GetAuthAuditLogs';

export function getAuthAuditLogs(dcOrVars, vars) {
  return executeQuery(getAuthAuditLogsRef(dcOrVars, vars));
}

export const getAuthSessionByFirebaseUidRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetAuthSessionByFirebaseUid', inputVars);
}
getAuthSessionByFirebaseUidRef.operationName = 'GetAuthSessionByFirebaseUid';

export function getAuthSessionByFirebaseUid(dcOrVars, vars) {
  return executeQuery(getAuthSessionByFirebaseUidRef(dcOrVars, vars));
}

export const getAuthSessionByEmailHashRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetAuthSessionByEmailHash', inputVars);
}
getAuthSessionByEmailHashRef.operationName = 'GetAuthSessionByEmailHash';

export function getAuthSessionByEmailHash(dcOrVars, vars) {
  return executeQuery(getAuthSessionByEmailHashRef(dcOrVars, vars));
}

export const getActiveAuthSessionForUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetActiveAuthSessionForUser', inputVars);
}
getActiveAuthSessionForUserRef.operationName = 'GetActiveAuthSessionForUser';

export function getActiveAuthSessionForUser(dcOrVars, vars) {
  return executeQuery(getActiveAuthSessionForUserRef(dcOrVars, vars));
}

export const getDashboardRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetDashboard', inputVars);
}
getDashboardRef.operationName = 'GetDashboard';

export function getDashboard(dcOrVars, vars) {
  return executeQuery(getDashboardRef(dcOrVars, vars));
}

export const getLoanDetailsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetLoanDetails', inputVars);
}
getLoanDetailsRef.operationName = 'GetLoanDetails';

export function getLoanDetails(dcOrVars, vars) {
  return executeQuery(getLoanDetailsRef(dcOrVars, vars));
}

export const getUserMagicLinksRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetUserMagicLinks', inputVars);
}
getUserMagicLinksRef.operationName = 'GetUserMagicLinks';

export function getUserMagicLinks(dcOrVars, vars) {
  return executeQuery(getUserMagicLinksRef(dcOrVars, vars));
}

export const getActiveMagicLinksRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetActiveMagicLinks', inputVars);
}
getActiveMagicLinksRef.operationName = 'GetActiveMagicLinks';

export function getActiveMagicLinks(dcOrVars, vars) {
  return executeQuery(getActiveMagicLinksRef(dcOrVars, vars));
}

export const getMagicLinkRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetMagicLink', inputVars);
}
getMagicLinkRef.operationName = 'GetMagicLink';

export function getMagicLink(dcOrVars, vars) {
  return executeQuery(getMagicLinkRef(dcOrVars, vars));
}

export const getMagicLinkBySessionIdRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetMagicLinkBySessionId', inputVars);
}
getMagicLinkBySessionIdRef.operationName = 'GetMagicLinkBySessionId';

export function getMagicLinkBySessionId(dcOrVars, vars) {
  return executeQuery(getMagicLinkBySessionIdRef(dcOrVars, vars));
}

export const getMagicLinkStatsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetMagicLinkStats');
}
getMagicLinkStatsRef.operationName = 'GetMagicLinkStats';

export function getMagicLinkStats(dc) {
  return executeQuery(getMagicLinkStatsRef(dc));
}

