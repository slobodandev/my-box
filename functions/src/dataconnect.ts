/**
 * Data Connect Configuration
 * Simple wrapper using @firebase/data-connect for Cloud Functions
 */

import { getDataConnect, connectDataConnectEmulator, queryRef, executeQuery, mutationRef, executeMutation } from '@firebase/data-connect';
import { initializeApp, getApp } from '@firebase/app';

// Firebase config for server-side (Cloud Functions)
const firebaseConfig = {
  projectId: process.env.GCLOUD_PROJECT || 'my-box-53040',
};

// Initialize Firebase app for Data Connect
let app;
try {
  app = getApp();
} catch {
  app = initializeApp(firebaseConfig);
}

export const connectorConfig = {
  connector: 'mybox-connector',
  service: 'mybox-dataconnect',
  location: 'us-central1',
};

// Get Data Connect instance
export const dataConnect = getDataConnect(app, connectorConfig);

// Connect to emulator if running locally
const isEmulator = process.env.FUNCTIONS_EMULATOR === 'true';
if (isEmulator) {
  const host = '127.0.0.1';
  const port = 9399;
  console.log(`Connecting to Data Connect emulator at ${host}:${port}`);
  connectDataConnectEmulator(dataConnect, host, port);
}

// Export wrapper functions for queries and mutations
export async function getUserByEmail(variables: { email: string }): Promise<{ data: { users: Array<{ id: string; email: string }> } }> {
  const ref = queryRef(dataConnect, 'GetUserByEmail', variables);
  const result = await executeQuery(ref);
  return result as any;
}

export async function createUser(variables: {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role?: string | null;
  phoneNumber?: string | null;
}): Promise<{ data: any }> {
  const ref = mutationRef(dataConnect, 'CreateUser', variables);
  const result = await executeMutation(ref);
  return result as any;
}

export async function createAuthSessionWithFirebase(variables: {
  sessionId: string;
  userId: string;
  firebaseUid: string;
  emailHash: string;
  loanIds?: string | null;
  borrowerContactId?: string | null;
  loanNumber?: string | null;
  expiresAt: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}): Promise<{ data: any }> {
  const ref = mutationRef(dataConnect, 'CreateAuthSessionWithFirebase', variables);
  const result = await executeMutation(ref);
  return result as any;
}

export async function getAuthSessionByFirebaseUid(variables: {
  firebaseUid: string;
  email: string;
}): Promise<{
  data: {
    authSessions: Array<{
      id: string;
      sessionId: string;
      userId: string;
      loanIds?: string | null;
      emailHash: string;
      status: string;
      expiresAt: string;
      verifiedAt?: string | null;
      createdAt: string;
      borrowerContactId?: string | null;
      loanNumber?: string | null;
      firebaseUid: string;
      user: {
        id: string;
        email: string;
        role: string;
        firstName?: string | null;
        lastName?: string | null;
      };
    }>;
  };
}> {
  const ref = queryRef(dataConnect, 'GetAuthSessionByFirebaseUid', variables);
  const result = await executeQuery(ref);
  return result as any;
}

export async function verifyAuthSession(variables: {
  id: string;
  sessionToken: string;
  verifiedAt: string;
}): Promise<{ data: any }> {
  const ref = mutationRef(dataConnect, 'VerifyAuthSession', variables);
  const result = await executeMutation(ref);
  return result as any;
}

export async function updateUserPasswordStatus(variables: {
  userId: string;
  hasPassword: boolean;
  isTemporary: boolean;
}): Promise<{ data: any }> {
  const ref = mutationRef(dataConnect, 'UpdateUserPasswordStatus', variables);
  const result = await executeMutation(ref);
  return result as any;
}

export async function createMagicLink(variables: {
  userId: string;
  borrowerEmail: string;
  sendToEmail: string;
  magicLinkUrl: string;
  sessionId?: string | null;
  expiresAt: string;
  createdBy?: string | null;
  sentAt?: string | null;
}): Promise<{ data: any }> {
  const ref = mutationRef(dataConnect, 'CreateMagicLink', variables);
  const result = await executeMutation(ref);
  return result as any;
}

export async function markMagicLinkUsed(variables: {
  sessionId: string;
  usedAt: string;
}): Promise<{ data: any }> {
  const ref = mutationRef(dataConnect, 'MarkMagicLinkUsed', variables);
  const result = await executeMutation(ref);
  return result as any;
}

// For backward compatibility with other Cloud Functions
export async function executeGraphql(params: {
  query: string;
  variables?: Record<string, any>;
}): Promise<any> {
  console.log('executeGraphql called with raw query (deprecated)');
  // This is a placeholder - migrate to use specific functions above
  throw new Error('executeGraphql is deprecated. Use specific query/mutation functions instead.');
}
