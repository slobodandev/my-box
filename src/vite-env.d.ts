/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Application Settings
  readonly VITE_APP_NAME: string
  readonly VITE_APP_ENV: string
  readonly VITE_MOCK_USER_ID: string
  readonly VITE_MOCK_USER_NAME: string

  // Firebase Configuration
  readonly VITE_FIREBASE_API_KEY: string
  readonly VITE_FIREBASE_AUTH_DOMAIN: string
  readonly VITE_FIREBASE_PROJECT_ID: string
  readonly VITE_FIREBASE_STORAGE_BUCKET: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string
  readonly VITE_FIREBASE_APP_ID: string
  readonly VITE_FIREBASE_MEASUREMENT_ID: string

  // Cloud Functions URLs
  readonly VITE_VERIFY_MAGIC_LINK_URL: string
  readonly VITE_SEND_VERIFICATION_CODE_URL: string
  readonly VITE_VERIFY_CODE_URL: string
  readonly VITE_VALIDATE_SESSION_URL: string
  readonly VITE_PROCESS_UPLOAD_URL: string
  readonly VITE_GENERATE_DOWNLOAD_URL: string
  readonly VITE_BATCH_GENERATE_DOWNLOAD_URLS_URL: string
  readonly VITE_HEALTH_CHECK_URL: string

  // Legacy n8n Webhooks (backward compatibility)
  readonly VITE_N8N_BASE_URL: string
  readonly VITE_N8N_GET_LOANS_WEBHOOK: string
  readonly VITE_N8N_FILE_LIST_WEBHOOK: string
  readonly VITE_N8N_FILE_UPLOAD_WEBHOOK: string
  readonly VITE_N8N_FILE_DOWNLOAD_WEBHOOK: string
  readonly VITE_N8N_FILE_DELETE_WEBHOOK: string

  // Legacy Azure Storage (migration reference)
  readonly VITE_AZURE_STORAGE_ACCOUNT_NAME: string
  readonly VITE_AZURE_STORAGE_CONTAINER_NAME: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
