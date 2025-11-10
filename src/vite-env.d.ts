/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_N8N_BASE_URL: string
  readonly VITE_N8N_GET_LOANS_WEBHOOK: string
  readonly VITE_N8N_FILE_LIST_WEBHOOK: string
  readonly VITE_N8N_FILE_UPLOAD_WEBHOOK: string
  readonly VITE_N8N_FILE_DOWNLOAD_WEBHOOK: string
  readonly VITE_N8N_FILE_DELETE_WEBHOOK: string
  readonly VITE_AZURE_STORAGE_ACCOUNT_NAME: string
  readonly VITE_AZURE_STORAGE_CONTAINER_NAME: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_ENV: string
  readonly VITE_MOCK_USER_ID: string
  readonly VITE_MOCK_USER_NAME: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
