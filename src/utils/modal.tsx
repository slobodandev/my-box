/**
 * Modal Utility
 * Provides consistent, styled modals using Ant Design
 * Replaces native browser alert() and confirm() dialogs
 */

import { Modal } from 'antd';
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  CloseCircleOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';

// Modal type definitions
type ModalType = 'success' | 'error' | 'info' | 'warning' | 'confirm';

interface ModalOptions {
  title?: string;
  content: string | React.ReactNode;
  okText?: string;
  cancelText?: string;
  onOk?: () => void | Promise<void>;
  onCancel?: () => void;
  type?: ModalType;
  centered?: boolean;
  width?: number;
}

interface ConfirmOptions {
  title?: string;
  content: string | React.ReactNode;
  okText?: string;
  cancelText?: string;
  onOk?: () => void | Promise<void>;
  onCancel?: () => void;
  okButtonProps?: {
    danger?: boolean;
  };
  centered?: boolean;
  width?: number;
}

// Icon mapping
const iconMap = {
  success: <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 22 }} />,
  error: <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 22 }} />,
  info: <InfoCircleOutlined style={{ color: '#1890ff', fontSize: 22 }} />,
  warning: <ExclamationCircleOutlined style={{ color: '#faad14', fontSize: 22 }} />,
  confirm: <QuestionCircleOutlined style={{ color: '#1890ff', fontSize: 22 }} />,
};

// Default titles for each type
const defaultTitles: Record<ModalType, string> = {
  success: 'Success',
  error: 'Error',
  info: 'Information',
  warning: 'Warning',
  confirm: 'Confirm',
};

/**
 * Show a success modal
 */
export const showSuccess = (content: string, options?: Partial<ModalOptions>): void => {
  Modal.success({
    title: options?.title || 'Success',
    content,
    okText: options?.okText || 'OK',
    centered: options?.centered ?? true,
    width: options?.width,
    onOk: options?.onOk,
  });
};

/**
 * Show an error modal
 */
export const showError = (content: string, options?: Partial<ModalOptions>): void => {
  Modal.error({
    title: options?.title || 'Error',
    content,
    okText: options?.okText || 'OK',
    centered: options?.centered ?? true,
    width: options?.width,
    onOk: options?.onOk,
  });
};

/**
 * Show an info modal
 */
export const showInfo = (content: string, options?: Partial<ModalOptions>): void => {
  Modal.info({
    title: options?.title || 'Information',
    content,
    okText: options?.okText || 'OK',
    centered: options?.centered ?? true,
    width: options?.width,
    onOk: options?.onOk,
  });
};

/**
 * Show a warning modal
 */
export const showWarning = (content: string, options?: Partial<ModalOptions>): void => {
  Modal.warning({
    title: options?.title || 'Warning',
    content,
    okText: options?.okText || 'OK',
    centered: options?.centered ?? true,
    width: options?.width,
    onOk: options?.onOk,
  });
};

/**
 * Show a confirm modal
 * Returns a promise that resolves to true if confirmed, false if cancelled
 */
export const showConfirm = (options: ConfirmOptions): Promise<boolean> => {
  return new Promise((resolve) => {
    Modal.confirm({
      title: options.title || 'Confirm',
      content: options.content,
      okText: options.okText || 'Confirm',
      cancelText: options.cancelText || 'Cancel',
      centered: options.centered ?? true,
      width: options.width,
      icon: iconMap.confirm,
      okButtonProps: options.okButtonProps,
      onOk: async () => {
        if (options.onOk) {
          await options.onOk();
        }
        resolve(true);
      },
      onCancel: () => {
        if (options.onCancel) {
          options.onCancel();
        }
        resolve(false);
      },
    });
  });
};

/**
 * Show a delete confirmation modal
 * Pre-styled for delete actions with danger button
 */
export const showDeleteConfirm = (
  itemName: string,
  options?: Partial<ConfirmOptions>
): Promise<boolean> => {
  return showConfirm({
    title: options?.title || 'Delete Confirmation',
    content: options?.content || `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
    okText: options?.okText || 'Delete',
    cancelText: options?.cancelText || 'Cancel',
    okButtonProps: { danger: true },
    centered: options?.centered ?? true,
    width: options?.width,
    onOk: options?.onOk,
    onCancel: options?.onCancel,
  });
};

/**
 * ZIP upload option type
 */
export type ZipUploadOption = 'preserve' | 'flat' | 'cancel';

/**
 * Show a ZIP folder structure confirmation modal
 * Asks user whether to preserve folder structure or import flat
 */
export const showZipUploadConfirm = (options: {
  zipName: string;
  fileCount: number;
  folderCount: number;
  totalSize: string;
  folderTree: string;
}): Promise<ZipUploadOption> => {
  return new Promise((resolve) => {
    const modal = Modal.confirm({
      title: 'ZIP File Detected',
      width: 520,
      centered: true,
      icon: <InfoCircleOutlined style={{ color: '#1890ff', fontSize: 22 }} />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            <strong>"{options.zipName}"</strong> contains a folder structure.
          </p>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Files:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">{options.fileCount}</span>
              </div>
              <div>
                <span className="text-gray-500">Folders:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">{options.folderCount}</span>
              </div>
              <div>
                <span className="text-gray-500">Size:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">{options.totalSize}</span>
              </div>
            </div>
          </div>

          {options.folderTree && (
            <div className="bg-gray-900 dark:bg-gray-950 rounded-lg p-3 max-h-48 overflow-y-auto">
              <pre className="text-xs text-green-400 font-mono whitespace-pre">
                {options.folderTree}
              </pre>
            </div>
          )}

          <p className="text-sm text-gray-600 dark:text-gray-400">
            Would you like to preserve the folder structure or import all files flat?
          </p>
        </div>
      ),
      okText: 'Preserve Structure',
      cancelText: 'Import Flat',
      okButtonProps: {
        style: { backgroundColor: '#135bec' },
      },
      cancelButtonProps: {
        style: { marginRight: 8 },
      },
      footer: (_, { OkBtn, CancelBtn }) => (
        <div className="flex justify-end gap-2 mt-4">
          <button
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            onClick={() => {
              modal.destroy();
              resolve('cancel');
            }}
          >
            Cancel
          </button>
          <CancelBtn />
          <OkBtn />
        </div>
      ),
      onOk: () => {
        resolve('preserve');
      },
      onCancel: () => {
        resolve('flat');
      },
    });
  });
};

/**
 * Show a download confirmation modal
 * Pre-styled for download actions with file info
 */
export const showDownloadConfirm = (options: {
  folderName: string;
  fileCount: number;
  totalSizeMB: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}): Promise<boolean> => {
  return showConfirm({
    title: 'Download Folder',
    content: (
      <div className="space-y-2">
        <p>
          Download <strong>"{options.folderName}"</strong>?
        </p>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mt-3">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <span>Files:</span>
            <span className="font-medium">{options.fileCount}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <span>Total size:</span>
            <span className="font-medium">{options.totalSizeMB} MB</span>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          The folder will be downloaded as a ZIP file.
        </p>
      </div>
    ),
    okText: 'Download',
    cancelText: 'Cancel',
    onOk: options.onConfirm,
    onCancel: options.onCancel,
  });
};

/**
 * Show a generic modal with custom type
 */
export const showModal = (options: ModalOptions): void => {
  const type = options.type || 'info';
  const title = options.title || defaultTitles[type];

  switch (type) {
    case 'success':
      Modal.success({
        title,
        content: options.content,
        okText: options.okText || 'OK',
        centered: options.centered ?? true,
        width: options.width,
        onOk: options.onOk,
      });
      break;
    case 'error':
      Modal.error({
        title,
        content: options.content,
        okText: options.okText || 'OK',
        centered: options.centered ?? true,
        width: options.width,
        onOk: options.onOk,
      });
      break;
    case 'warning':
      Modal.warning({
        title,
        content: options.content,
        okText: options.okText || 'OK',
        centered: options.centered ?? true,
        width: options.width,
        onOk: options.onOk,
      });
      break;
    case 'confirm':
      Modal.confirm({
        title,
        content: options.content,
        okText: options.okText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        centered: options.centered ?? true,
        width: options.width,
        icon: iconMap.confirm,
        onOk: options.onOk,
        onCancel: options.onCancel,
      });
      break;
    default:
      Modal.info({
        title,
        content: options.content,
        okText: options.okText || 'OK',
        centered: options.centered ?? true,
        width: options.width,
        onOk: options.onOk,
      });
  }
};

// Export all utilities as a namespace for convenience
export const modal = {
  success: showSuccess,
  error: showError,
  info: showInfo,
  warning: showWarning,
  confirm: showConfirm,
  deleteConfirm: showDeleteConfirm,
  downloadConfirm: showDownloadConfirm,
  zipUploadConfirm: showZipUploadConfirm,
  show: showModal,
};

export default modal;
