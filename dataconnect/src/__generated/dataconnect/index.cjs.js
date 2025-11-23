const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'mybox-connector',
  service: 'mybox-dataconnect',
  location: 'us-central1'
};
exports.connectorConfig = connectorConfig;

const createUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateUser', inputVars);
}
createUserRef.operationName = 'CreateUser';
exports.createUserRef = createUserRef;

exports.createUser = function createUser(dcOrVars, vars) {
  return executeMutation(createUserRef(dcOrVars, vars));
};

const updateUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateUser', inputVars);
}
updateUserRef.operationName = 'UpdateUser';
exports.updateUserRef = updateUserRef;

exports.updateUser = function updateUser(dcOrVars, vars) {
  return executeMutation(updateUserRef(dcOrVars, vars));
};

const updateUserPasswordStatusRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateUserPasswordStatus', inputVars);
}
updateUserPasswordStatusRef.operationName = 'UpdateUserPasswordStatus';
exports.updateUserPasswordStatusRef = updateUserPasswordStatusRef;

exports.updateUserPasswordStatus = function updateUserPasswordStatus(dcOrVars, vars) {
  return executeMutation(updateUserPasswordStatusRef(dcOrVars, vars));
};

const deactivateUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeactivateUser', inputVars);
}
deactivateUserRef.operationName = 'DeactivateUser';
exports.deactivateUserRef = deactivateUserRef;

exports.deactivateUser = function deactivateUser(dcOrVars, vars) {
  return executeMutation(deactivateUserRef(dcOrVars, vars));
};

const updateUserRoleRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateUserRole', inputVars);
}
updateUserRoleRef.operationName = 'UpdateUserRole';
exports.updateUserRoleRef = updateUserRoleRef;

exports.updateUserRole = function updateUserRole(dcOrVars, vars) {
  return executeMutation(updateUserRoleRef(dcOrVars, vars));
};

const createLoanRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateLoan', inputVars);
}
createLoanRef.operationName = 'CreateLoan';
exports.createLoanRef = createLoanRef;

exports.createLoan = function createLoan(dcOrVars, vars) {
  return executeMutation(createLoanRef(dcOrVars, vars));
};

const updateLoanRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateLoan', inputVars);
}
updateLoanRef.operationName = 'UpdateLoan';
exports.updateLoanRef = updateLoanRef;

exports.updateLoan = function updateLoan(dcOrVars, vars) {
  return executeMutation(updateLoanRef(dcOrVars, vars));
};

const closeLoanRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CloseLoan', inputVars);
}
closeLoanRef.operationName = 'CloseLoan';
exports.closeLoanRef = closeLoanRef;

exports.closeLoan = function closeLoan(dcOrVars, vars) {
  return executeMutation(closeLoanRef(dcOrVars, vars));
};

const deleteLoanRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteLoan', inputVars);
}
deleteLoanRef.operationName = 'DeleteLoan';
exports.deleteLoanRef = deleteLoanRef;

exports.deleteLoan = function deleteLoan(dcOrVars, vars) {
  return executeMutation(deleteLoanRef(dcOrVars, vars));
};

const createFileRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateFile', inputVars);
}
createFileRef.operationName = 'CreateFile';
exports.createFileRef = createFileRef;

exports.createFile = function createFile(dcOrVars, vars) {
  return executeMutation(createFileRef(dcOrVars, vars));
};

const updateFileRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateFile', inputVars);
}
updateFileRef.operationName = 'UpdateFile';
exports.updateFileRef = updateFileRef;

exports.updateFile = function updateFile(dcOrVars, vars) {
  return executeMutation(updateFileRef(dcOrVars, vars));
};

const softDeleteFileRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'SoftDeleteFile', inputVars);
}
softDeleteFileRef.operationName = 'SoftDeleteFile';
exports.softDeleteFileRef = softDeleteFileRef;

exports.softDeleteFile = function softDeleteFile(dcOrVars, vars) {
  return executeMutation(softDeleteFileRef(dcOrVars, vars));
};

const hardDeleteFileRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'HardDeleteFile', inputVars);
}
hardDeleteFileRef.operationName = 'HardDeleteFile';
exports.hardDeleteFileRef = hardDeleteFileRef;

exports.hardDeleteFile = function hardDeleteFile(dcOrVars, vars) {
  return executeMutation(hardDeleteFileRef(dcOrVars, vars));
};

const renameFileRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'RenameFile', inputVars);
}
renameFileRef.operationName = 'RenameFile';
exports.renameFileRef = renameFileRef;

exports.renameFile = function renameFile(dcOrVars, vars) {
  return executeMutation(renameFileRef(dcOrVars, vars));
};

const moveFileRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'MoveFile', inputVars);
}
moveFileRef.operationName = 'MoveFile';
exports.moveFileRef = moveFileRef;

exports.moveFile = function moveFile(dcOrVars, vars) {
  return executeMutation(moveFileRef(dcOrVars, vars));
};

const copyFileRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CopyFile', inputVars);
}
copyFileRef.operationName = 'CopyFile';
exports.copyFileRef = copyFileRef;

exports.copyFile = function copyFile(dcOrVars, vars) {
  return executeMutation(copyFileRef(dcOrVars, vars));
};

const restoreFileRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'RestoreFile', inputVars);
}
restoreFileRef.operationName = 'RestoreFile';
exports.restoreFileRef = restoreFileRef;

exports.restoreFile = function restoreFile(dcOrVars, vars) {
  return executeMutation(restoreFileRef(dcOrVars, vars));
};

const associateFileWithLoanRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'AssociateFileWithLoan', inputVars);
}
associateFileWithLoanRef.operationName = 'AssociateFileWithLoan';
exports.associateFileWithLoanRef = associateFileWithLoanRef;

exports.associateFileWithLoan = function associateFileWithLoan(dcOrVars, vars) {
  return executeMutation(associateFileWithLoanRef(dcOrVars, vars));
};

const removeFileFromLoanRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'RemoveFileFromLoan', inputVars);
}
removeFileFromLoanRef.operationName = 'RemoveFileFromLoan';
exports.removeFileFromLoanRef = removeFileFromLoanRef;

exports.removeFileFromLoan = function removeFileFromLoan(dcOrVars, vars) {
  return executeMutation(removeFileFromLoanRef(dcOrVars, vars));
};

const createAuthSessionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateAuthSession', inputVars);
}
createAuthSessionRef.operationName = 'CreateAuthSession';
exports.createAuthSessionRef = createAuthSessionRef;

exports.createAuthSession = function createAuthSession(dcOrVars, vars) {
  return executeMutation(createAuthSessionRef(dcOrVars, vars));
};

const createAuthSessionWithFirebaseRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateAuthSessionWithFirebase', inputVars);
}
createAuthSessionWithFirebaseRef.operationName = 'CreateAuthSessionWithFirebase';
exports.createAuthSessionWithFirebaseRef = createAuthSessionWithFirebaseRef;

exports.createAuthSessionWithFirebase = function createAuthSessionWithFirebase(dcOrVars, vars) {
  return executeMutation(createAuthSessionWithFirebaseRef(dcOrVars, vars));
};

const updateAuthSessionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateAuthSession', inputVars);
}
updateAuthSessionRef.operationName = 'UpdateAuthSession';
exports.updateAuthSessionRef = updateAuthSessionRef;

exports.updateAuthSession = function updateAuthSession(dcOrVars, vars) {
  return executeMutation(updateAuthSessionRef(dcOrVars, vars));
};

const verifyAuthSessionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'VerifyAuthSession', inputVars);
}
verifyAuthSessionRef.operationName = 'VerifyAuthSession';
exports.verifyAuthSessionRef = verifyAuthSessionRef;

exports.verifyAuthSession = function verifyAuthSession(dcOrVars, vars) {
  return executeMutation(verifyAuthSessionRef(dcOrVars, vars));
};

const updateSessionAccessRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateSessionAccess', inputVars);
}
updateSessionAccessRef.operationName = 'UpdateSessionAccess';
exports.updateSessionAccessRef = updateSessionAccessRef;

exports.updateSessionAccess = function updateSessionAccess(dcOrVars, vars) {
  return executeMutation(updateSessionAccessRef(dcOrVars, vars));
};

const revokeAuthSessionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'RevokeAuthSession', inputVars);
}
revokeAuthSessionRef.operationName = 'RevokeAuthSession';
exports.revokeAuthSessionRef = revokeAuthSessionRef;

exports.revokeAuthSession = function revokeAuthSession(dcOrVars, vars) {
  return executeMutation(revokeAuthSessionRef(dcOrVars, vars));
};

const createVerificationCodeRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateVerificationCode', inputVars);
}
createVerificationCodeRef.operationName = 'CreateVerificationCode';
exports.createVerificationCodeRef = createVerificationCodeRef;

exports.createVerificationCode = function createVerificationCode(dcOrVars, vars) {
  return executeMutation(createVerificationCodeRef(dcOrVars, vars));
};

const updateVerificationCodeAttemptsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateVerificationCodeAttempts', inputVars);
}
updateVerificationCodeAttemptsRef.operationName = 'UpdateVerificationCodeAttempts';
exports.updateVerificationCodeAttemptsRef = updateVerificationCodeAttemptsRef;

exports.updateVerificationCodeAttempts = function updateVerificationCodeAttempts(dcOrVars, vars) {
  return executeMutation(updateVerificationCodeAttemptsRef(dcOrVars, vars));
};

const markVerificationCodeUsedRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'MarkVerificationCodeUsed', inputVars);
}
markVerificationCodeUsedRef.operationName = 'MarkVerificationCodeUsed';
exports.markVerificationCodeUsedRef = markVerificationCodeUsedRef;

exports.markVerificationCodeUsed = function markVerificationCodeUsed(dcOrVars, vars) {
  return executeMutation(markVerificationCodeUsedRef(dcOrVars, vars));
};

const logAuthEventRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'LogAuthEvent', inputVars);
}
logAuthEventRef.operationName = 'LogAuthEvent';
exports.logAuthEventRef = logAuthEventRef;

exports.logAuthEvent = function logAuthEvent(dcOrVars, vars) {
  return executeMutation(logAuthEventRef(dcOrVars, vars));
};

const trackRateLimitRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'TrackRateLimit', inputVars);
}
trackRateLimitRef.operationName = 'TrackRateLimit';
exports.trackRateLimitRef = trackRateLimitRef;

exports.trackRateLimit = function trackRateLimit(dcOrVars, vars) {
  return executeMutation(trackRateLimitRef(dcOrVars, vars));
};

const updateRateLimitRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateRateLimit', inputVars);
}
updateRateLimitRef.operationName = 'UpdateRateLimit';
exports.updateRateLimitRef = updateRateLimitRef;

exports.updateRateLimit = function updateRateLimit(dcOrVars, vars) {
  return executeMutation(updateRateLimitRef(dcOrVars, vars));
};

const deleteExpiredSessionsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteExpiredSessions', inputVars);
}
deleteExpiredSessionsRef.operationName = 'DeleteExpiredSessions';
exports.deleteExpiredSessionsRef = deleteExpiredSessionsRef;

exports.deleteExpiredSessions = function deleteExpiredSessions(dcOrVars, vars) {
  return executeMutation(deleteExpiredSessionsRef(dcOrVars, vars));
};

const deleteExpiredVerificationCodesRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteExpiredVerificationCodes', inputVars);
}
deleteExpiredVerificationCodesRef.operationName = 'DeleteExpiredVerificationCodes';
exports.deleteExpiredVerificationCodesRef = deleteExpiredVerificationCodesRef;

exports.deleteExpiredVerificationCodes = function deleteExpiredVerificationCodes(dcOrVars, vars) {
  return executeMutation(deleteExpiredVerificationCodesRef(dcOrVars, vars));
};

const createMagicLinkRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateMagicLink', inputVars);
}
createMagicLinkRef.operationName = 'CreateMagicLink';
exports.createMagicLinkRef = createMagicLinkRef;

exports.createMagicLink = function createMagicLink(dcOrVars, vars) {
  return executeMutation(createMagicLinkRef(dcOrVars, vars));
};

const updateMagicLinkSendCountRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateMagicLinkSendCount', inputVars);
}
updateMagicLinkSendCountRef.operationName = 'UpdateMagicLinkSendCount';
exports.updateMagicLinkSendCountRef = updateMagicLinkSendCountRef;

exports.updateMagicLinkSendCount = function updateMagicLinkSendCount(dcOrVars, vars) {
  return executeMutation(updateMagicLinkSendCountRef(dcOrVars, vars));
};

const revokeMagicLinkRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'RevokeMagicLink', inputVars);
}
revokeMagicLinkRef.operationName = 'RevokeMagicLink';
exports.revokeMagicLinkRef = revokeMagicLinkRef;

exports.revokeMagicLink = function revokeMagicLink(dcOrVars, vars) {
  return executeMutation(revokeMagicLinkRef(dcOrVars, vars));
};

const markMagicLinkUsedRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'MarkMagicLinkUsed', inputVars);
}
markMagicLinkUsedRef.operationName = 'MarkMagicLinkUsed';
exports.markMagicLinkUsedRef = markMagicLinkUsedRef;

exports.markMagicLinkUsed = function markMagicLinkUsed(dcOrVars, vars) {
  return executeMutation(markMagicLinkUsedRef(dcOrVars, vars));
};

const extendMagicLinkRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'ExtendMagicLink', inputVars);
}
extendMagicLinkRef.operationName = 'ExtendMagicLink';
exports.extendMagicLinkRef = extendMagicLinkRef;

exports.extendMagicLink = function extendMagicLink(dcOrVars, vars) {
  return executeMutation(extendMagicLinkRef(dcOrVars, vars));
};

const getUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetUser', inputVars);
}
getUserRef.operationName = 'GetUser';
exports.getUserRef = getUserRef;

exports.getUser = function getUser(dcOrVars, vars) {
  return executeQuery(getUserRef(dcOrVars, vars));
};

const getUserByEmailRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetUserByEmail', inputVars);
}
getUserByEmailRef.operationName = 'GetUserByEmail';
exports.getUserByEmailRef = getUserByEmailRef;

exports.getUserByEmail = function getUserByEmail(dcOrVars, vars) {
  return executeQuery(getUserByEmailRef(dcOrVars, vars));
};

const listAllUsersRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListAllUsers');
}
listAllUsersRef.operationName = 'ListAllUsers';
exports.listAllUsersRef = listAllUsersRef;

exports.listAllUsers = function listAllUsers(dc) {
  return executeQuery(listAllUsersRef(dc));
};

const getUserLoansRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetUserLoans', inputVars);
}
getUserLoansRef.operationName = 'GetUserLoans';
exports.getUserLoansRef = getUserLoansRef;

exports.getUserLoans = function getUserLoans(dcOrVars, vars) {
  return executeQuery(getUserLoansRef(dcOrVars, vars));
};

const getLoanRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetLoan', inputVars);
}
getLoanRef.operationName = 'GetLoan';
exports.getLoanRef = getLoanRef;

exports.getLoan = function getLoan(dcOrVars, vars) {
  return executeQuery(getLoanRef(dcOrVars, vars));
};

const getLoanByNumberRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetLoanByNumber', inputVars);
}
getLoanByNumberRef.operationName = 'GetLoanByNumber';
exports.getLoanByNumberRef = getLoanByNumberRef;

exports.getLoanByNumber = function getLoanByNumber(dcOrVars, vars) {
  return executeQuery(getLoanByNumberRef(dcOrVars, vars));
};

const getUserFilesRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetUserFiles', inputVars);
}
getUserFilesRef.operationName = 'GetUserFiles';
exports.getUserFilesRef = getUserFilesRef;

exports.getUserFiles = function getUserFiles(dcOrVars, vars) {
  return executeQuery(getUserFilesRef(dcOrVars, vars));
};

const getFilesByLoanRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetFilesByLoan', inputVars);
}
getFilesByLoanRef.operationName = 'GetFilesByLoan';
exports.getFilesByLoanRef = getFilesByLoanRef;

exports.getFilesByLoan = function getFilesByLoan(dcOrVars, vars) {
  return executeQuery(getFilesByLoanRef(dcOrVars, vars));
};

const getFileRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetFile', inputVars);
}
getFileRef.operationName = 'GetFile';
exports.getFileRef = getFileRef;

exports.getFile = function getFile(dcOrVars, vars) {
  return executeQuery(getFileRef(dcOrVars, vars));
};

const getFilesWithAssociationsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetFilesWithAssociations', inputVars);
}
getFilesWithAssociationsRef.operationName = 'GetFilesWithAssociations';
exports.getFilesWithAssociationsRef = getFilesWithAssociationsRef;

exports.getFilesWithAssociations = function getFilesWithAssociations(dcOrVars, vars) {
  return executeQuery(getFilesWithAssociationsRef(dcOrVars, vars));
};

const getFileAssociationsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetFileAssociations', inputVars);
}
getFileAssociationsRef.operationName = 'GetFileAssociations';
exports.getFileAssociationsRef = getFileAssociationsRef;

exports.getFileAssociations = function getFileAssociations(dcOrVars, vars) {
  return executeQuery(getFileAssociationsRef(dcOrVars, vars));
};

const getLoanAssociationsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetLoanAssociations', inputVars);
}
getLoanAssociationsRef.operationName = 'GetLoanAssociations';
exports.getLoanAssociationsRef = getLoanAssociationsRef;

exports.getLoanAssociations = function getLoanAssociations(dcOrVars, vars) {
  return executeQuery(getLoanAssociationsRef(dcOrVars, vars));
};

const getAuthSessionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetAuthSession', inputVars);
}
getAuthSessionRef.operationName = 'GetAuthSession';
exports.getAuthSessionRef = getAuthSessionRef;

exports.getAuthSession = function getAuthSession(dcOrVars, vars) {
  return executeQuery(getAuthSessionRef(dcOrVars, vars));
};

const getUserAuthSessionsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetUserAuthSessions', inputVars);
}
getUserAuthSessionsRef.operationName = 'GetUserAuthSessions';
exports.getUserAuthSessionsRef = getUserAuthSessionsRef;

exports.getUserAuthSessions = function getUserAuthSessions(dcOrVars, vars) {
  return executeQuery(getUserAuthSessionsRef(dcOrVars, vars));
};

const getVerificationCodeRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetVerificationCode', inputVars);
}
getVerificationCodeRef.operationName = 'GetVerificationCode';
exports.getVerificationCodeRef = getVerificationCodeRef;

exports.getVerificationCode = function getVerificationCode(dcOrVars, vars) {
  return executeQuery(getVerificationCodeRef(dcOrVars, vars));
};

const getAuthAuditLogsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetAuthAuditLogs', inputVars);
}
getAuthAuditLogsRef.operationName = 'GetAuthAuditLogs';
exports.getAuthAuditLogsRef = getAuthAuditLogsRef;

exports.getAuthAuditLogs = function getAuthAuditLogs(dcOrVars, vars) {
  return executeQuery(getAuthAuditLogsRef(dcOrVars, vars));
};

const getAuthSessionByFirebaseUidRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetAuthSessionByFirebaseUid', inputVars);
}
getAuthSessionByFirebaseUidRef.operationName = 'GetAuthSessionByFirebaseUid';
exports.getAuthSessionByFirebaseUidRef = getAuthSessionByFirebaseUidRef;

exports.getAuthSessionByFirebaseUid = function getAuthSessionByFirebaseUid(dcOrVars, vars) {
  return executeQuery(getAuthSessionByFirebaseUidRef(dcOrVars, vars));
};

const getAuthSessionByEmailHashRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetAuthSessionByEmailHash', inputVars);
}
getAuthSessionByEmailHashRef.operationName = 'GetAuthSessionByEmailHash';
exports.getAuthSessionByEmailHashRef = getAuthSessionByEmailHashRef;

exports.getAuthSessionByEmailHash = function getAuthSessionByEmailHash(dcOrVars, vars) {
  return executeQuery(getAuthSessionByEmailHashRef(dcOrVars, vars));
};

const getActiveAuthSessionForUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetActiveAuthSessionForUser', inputVars);
}
getActiveAuthSessionForUserRef.operationName = 'GetActiveAuthSessionForUser';
exports.getActiveAuthSessionForUserRef = getActiveAuthSessionForUserRef;

exports.getActiveAuthSessionForUser = function getActiveAuthSessionForUser(dcOrVars, vars) {
  return executeQuery(getActiveAuthSessionForUserRef(dcOrVars, vars));
};

const getDashboardRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetDashboard', inputVars);
}
getDashboardRef.operationName = 'GetDashboard';
exports.getDashboardRef = getDashboardRef;

exports.getDashboard = function getDashboard(dcOrVars, vars) {
  return executeQuery(getDashboardRef(dcOrVars, vars));
};

const getLoanDetailsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetLoanDetails', inputVars);
}
getLoanDetailsRef.operationName = 'GetLoanDetails';
exports.getLoanDetailsRef = getLoanDetailsRef;

exports.getLoanDetails = function getLoanDetails(dcOrVars, vars) {
  return executeQuery(getLoanDetailsRef(dcOrVars, vars));
};

const getUserMagicLinksRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetUserMagicLinks', inputVars);
}
getUserMagicLinksRef.operationName = 'GetUserMagicLinks';
exports.getUserMagicLinksRef = getUserMagicLinksRef;

exports.getUserMagicLinks = function getUserMagicLinks(dcOrVars, vars) {
  return executeQuery(getUserMagicLinksRef(dcOrVars, vars));
};

const getActiveMagicLinksRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetActiveMagicLinks', inputVars);
}
getActiveMagicLinksRef.operationName = 'GetActiveMagicLinks';
exports.getActiveMagicLinksRef = getActiveMagicLinksRef;

exports.getActiveMagicLinks = function getActiveMagicLinks(dcOrVars, vars) {
  return executeQuery(getActiveMagicLinksRef(dcOrVars, vars));
};

const getMagicLinkRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetMagicLink', inputVars);
}
getMagicLinkRef.operationName = 'GetMagicLink';
exports.getMagicLinkRef = getMagicLinkRef;

exports.getMagicLink = function getMagicLink(dcOrVars, vars) {
  return executeQuery(getMagicLinkRef(dcOrVars, vars));
};

const getMagicLinkBySessionIdRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetMagicLinkBySessionId', inputVars);
}
getMagicLinkBySessionIdRef.operationName = 'GetMagicLinkBySessionId';
exports.getMagicLinkBySessionIdRef = getMagicLinkBySessionIdRef;

exports.getMagicLinkBySessionId = function getMagicLinkBySessionId(dcOrVars, vars) {
  return executeQuery(getMagicLinkBySessionIdRef(dcOrVars, vars));
};

const getMagicLinkStatsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetMagicLinkStats');
}
getMagicLinkStatsRef.operationName = 'GetMagicLinkStats';
exports.getMagicLinkStatsRef = getMagicLinkStatsRef;

exports.getMagicLinkStats = function getMagicLinkStats(dc) {
  return executeQuery(getMagicLinkStatsRef(dc));
};
