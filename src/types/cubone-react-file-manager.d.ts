declare module '@cubone/react-file-manager' {
  export interface FileManagerFile {
    id: string;
    name: string;
    size: number;
    type: string;
    modifiedAt?: Date;
    createdAt?: Date;
    url?: string;
    path?: string;
    icon?: string;
    [key: string]: any;
  }

  export interface FileManagerFolder {
    id: string;
    name: string;
    path?: string;
    [key: string]: any;
  }

  export interface FileManagerProps {
    files: FileManagerFile[];
    folders?: FileManagerFolder[];
    loading?: boolean;
    onUpload?: (file: File) => Promise<void>;
    onDownload?: (file: FileManagerFile) => void | Promise<void>;
    onDelete?: (fileId: string) => void | Promise<void>;
    onSelect?: (file: FileManagerFile) => void;
    onRefresh?: () => void | Promise<void>;
    uploadProgress?: number;
    uploading?: boolean;
    showFolders?: boolean;
    showBreadcrumbs?: boolean;
    showSearch?: boolean;
    showSort?: boolean;
    showGrid?: boolean;
    showList?: boolean;
    defaultView?: 'list' | 'grid';
    theme?: 'light' | 'dark';
    primaryColor?: string;
    locale?: string;
    multiple?: boolean;
    maxFileSize?: number;
    acceptedFileTypes?: string[];
  }

  export const FileManager: React.FC<FileManagerProps>;
}
