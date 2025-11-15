/**
 * Cloud Functions Configuration
 * Centralized configuration for all Cloud Function endpoints
 */

/**
 * Cloud Function Endpoints Enum
 */
export enum CloudFunction {
  // Authentication
  GENERATE_AUTH_LINK = 'generateAuthLink',
  VALIDATE_SESSION = 'validateSession',
  VERIFY_CODE = 'verifyCode',
  SEND_VERIFICATION_CODE = 'sendVerificationCode',
  VERIFY_MAGIC_LINK = 'verifyMagicLink',
  
  // File Operations
  PROCESS_UPLOAD = 'processUpload',
  LIST_FILES = 'listFiles',
  DELETE_FILE = 'deleteFile',
  GENERATE_DOWNLOAD_URL = 'generateDownloadURL',
  BATCH_GENERATE_DOWNLOAD_URLS = 'batchGenerateDownloadURLs',
  
  // Cleanup
  CLEANUP_DELETED_FILES = 'cleanupDeletedFiles',
}

/**
 * Cloud Functions Base URL from environment
 */
const getCloudFunctionsBaseUrl = (): string => {
  const baseUrl = import.meta.env.VITE_CLOUD_FUNCTIONS_BASE_URL;
  
  if (!baseUrl) {
    throw new Error(
      'VITE_CLOUD_FUNCTIONS_BASE_URL is not defined in environment variables. ' +
      'Please check your .env file.'
    );
  }
  
  return baseUrl;
};

/**
 * Get the full URL for a Cloud Function
 * @param functionName - The Cloud Function endpoint name
 * @returns The complete URL for the function
 */
export const getCloudFunctionUrl = (functionName: CloudFunction): string => {
  const baseUrl = getCloudFunctionsBaseUrl();
  return `${baseUrl}/${functionName}`;
};

/**
 * Cloud Functions URL Helper
 * Provides easy access to all Cloud Function URLs
 */
export const CloudFunctionUrls = {
  // Authentication
  generateAuthLink: () => getCloudFunctionUrl(CloudFunction.GENERATE_AUTH_LINK),
  validateSession: () => getCloudFunctionUrl(CloudFunction.VALIDATE_SESSION),
  verifyCode: () => getCloudFunctionUrl(CloudFunction.VERIFY_CODE),
  sendVerificationCode: () => getCloudFunctionUrl(CloudFunction.SEND_VERIFICATION_CODE),
  verifyMagicLink: () => getCloudFunctionUrl(CloudFunction.VERIFY_MAGIC_LINK),
  
  // File Operations
  processUpload: () => getCloudFunctionUrl(CloudFunction.PROCESS_UPLOAD),
  listFiles: () => getCloudFunctionUrl(CloudFunction.LIST_FILES),
  deleteFile: () => getCloudFunctionUrl(CloudFunction.DELETE_FILE),
  generateDownloadUrl: () => getCloudFunctionUrl(CloudFunction.GENERATE_DOWNLOAD_URL),
  batchGenerateDownloadUrls: () => getCloudFunctionUrl(CloudFunction.BATCH_GENERATE_DOWNLOAD_URLS),
  
  // Cleanup
  cleanupDeletedFiles: () => getCloudFunctionUrl(CloudFunction.CLEANUP_DELETED_FILES),
} as const;

/**
 * API Key Configuration
 */
export const getApiKey = (): string => {
  const apiKey = import.meta.env.VITE_TEST_API_KEY;
  
  if (!apiKey) {
    console.warn('VITE_TEST_API_KEY is not defined. API calls may fail.');
    return '';
  }
  
  return apiKey;
};

/**
 * Common headers for Cloud Function requests
 */
export const getCloudFunctionHeaders = (includeAuth = false): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  // Add API key for endpoints that require it
  const apiKey = getApiKey();
  if (apiKey) {
    headers['x-api-key'] = apiKey;
  }
  
  // Add session token for authenticated requests
  if (includeAuth) {
    const sessionToken = localStorage.getItem('mybox_session_token');
    if (sessionToken) {
      headers['Authorization'] = `Bearer ${sessionToken}`;
    }
  }
  
  return headers;
};

/**
 * Type-safe Cloud Function caller
 */
export const callCloudFunction = async <TRequest = any, TResponse = any>(
  functionName: CloudFunction,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: TRequest;
    requiresAuth?: boolean;
  } = {}
): Promise<TResponse> => {
  const {
    method = 'POST',
    body,
    requiresAuth = false,
  } = options;
  
  const url = getCloudFunctionUrl(functionName);
  const headers = getCloudFunctionHeaders(requiresAuth);
  
  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Cloud Function request failed: ${response.statusText}`
    );
  }
  
  return response.json();
};

/**
 * Export base URL for direct access if needed
 */
export const CLOUD_FUNCTIONS_BASE_URL = getCloudFunctionsBaseUrl();

/**
 * Type definitions for common request/response types
 */
export interface CloudFunctionResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
