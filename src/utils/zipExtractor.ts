/**
 * ZIP Extractor Utility
 * Provides utilities for analyzing and extracting ZIP files with folder structure detection
 */

import JSZip from 'jszip';

export interface ZipFileEntry {
  relativePath: string; // Full path within the ZIP (e.g., "folder/subfolder/file.pdf")
  filename: string; // Just the filename (e.g., "file.pdf")
  folderPath: string; // The folder path (e.g., "folder/subfolder")
  size: number;
  blob: Blob;
  mimeType: string;
}

export interface FolderNode {
  name: string;
  path: string;
  files: string[];
  subfolders: FolderNode[];
  fileCount: number;
  totalSize: number;
}

export interface ZipAnalysis {
  hasfolderStructure: boolean;
  rootFolders: FolderNode[];
  totalFiles: number;
  totalFolders: number;
  totalSize: number;
  flatFiles: ZipFileEntry[]; // All files with their paths
  folderTree: FolderNode; // Root folder containing all structure
}

/**
 * Get MIME type from file extension
 */
const getMimeTypeFromExtension = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase();

  const mimeTypes: { [key: string]: string } = {
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'bmp': 'image/bmp',
    'webp': 'image/webp',
    'txt': 'text/plain',
    'csv': 'text/csv',
    'json': 'application/json',
    'xml': 'application/xml',
  };

  return mimeTypes[ext || ''] || 'application/octet-stream';
};

/**
 * Build folder tree from file paths
 */
const buildFolderTree = (files: ZipFileEntry[]): FolderNode => {
  const root: FolderNode = {
    name: 'root',
    path: '',
    files: [],
    subfolders: [],
    fileCount: 0,
    totalSize: 0,
  };

  // Track all folders
  const folderMap = new Map<string, FolderNode>();
  folderMap.set('', root);

  // First pass: create all folder nodes
  files.forEach(file => {
    const parts = file.folderPath.split('/').filter(p => p);
    let currentPath = '';

    parts.forEach((part) => {
      const parentPath = currentPath;
      currentPath = currentPath ? `${currentPath}/${part}` : part;

      if (!folderMap.has(currentPath)) {
        const folder: FolderNode = {
          name: part,
          path: currentPath,
          files: [],
          subfolders: [],
          fileCount: 0,
          totalSize: 0,
        };
        folderMap.set(currentPath, folder);

        // Add to parent
        const parent = folderMap.get(parentPath);
        if (parent) {
          parent.subfolders.push(folder);
        }
      }
    });
  });

  // Second pass: add files to their folders and calculate sizes
  files.forEach(file => {
    const folder = folderMap.get(file.folderPath) || root;
    folder.files.push(file.filename);
    folder.fileCount++;
    folder.totalSize += file.size;

    // Update parent folder counts
    let currentPath = file.folderPath;
    while (currentPath) {
      const parent = folderMap.get(currentPath);
      if (parent && currentPath !== file.folderPath) {
        parent.fileCount++;
        parent.totalSize += file.size;
      }
      const lastSlash = currentPath.lastIndexOf('/');
      currentPath = lastSlash > 0 ? currentPath.substring(0, lastSlash) : '';
    }

    // Update root
    if (file.folderPath) {
      root.fileCount++;
      root.totalSize += file.size;
    } else {
      // File is at root level
      root.files.push(file.filename);
      root.fileCount++;
      root.totalSize += file.size;
    }
  });

  return root;
};

/**
 * Count total folders in tree
 */
const countFolders = (node: FolderNode): number => {
  let count = node.subfolders.length;
  node.subfolders.forEach(subfolder => {
    count += countFolders(subfolder);
  });
  return count;
};

/**
 * Analyze a ZIP file to detect folder structure
 */
export const analyzeZipFile = async (zipFile: File): Promise<ZipAnalysis> => {
  const zip = new JSZip();
  const zipContent = await zip.loadAsync(zipFile);

  const files: ZipFileEntry[] = [];
  const filePromises: Promise<void>[] = [];

  // Process all entries in the ZIP
  zipContent.forEach((relativePath, zipEntry) => {
    // Skip directories and system files
    if (zipEntry.dir || relativePath.startsWith('__MACOSX') || relativePath.startsWith('.')) {
      return;
    }

    // Skip hidden files within folders
    const filename = relativePath.split('/').pop() || '';
    if (filename.startsWith('.')) {
      return;
    }

    const promise = zipEntry.async('blob').then((blob) => {
      // Get folder path (everything before the filename)
      const lastSlash = relativePath.lastIndexOf('/');
      const folderPath = lastSlash > 0 ? relativePath.substring(0, lastSlash) : '';

      const mimeType = getMimeTypeFromExtension(filename);

      files.push({
        relativePath,
        filename,
        folderPath,
        size: blob.size,
        blob,
        mimeType,
      });
    });

    filePromises.push(promise);
  });

  await Promise.all(filePromises);

  // Build folder tree
  const folderTree = buildFolderTree(files);

  // Determine if there's a folder structure
  const uniqueFolders = new Set(files.map(f => f.folderPath).filter(p => p));
  const hasfolderStructure = uniqueFolders.size > 0;

  // Get root-level folders
  const rootFolders = folderTree.subfolders;

  // Calculate totals
  const totalSize = files.reduce((sum, f) => sum + f.size, 0);

  return {
    hasfolderStructure,
    rootFolders,
    totalFiles: files.length,
    totalFolders: countFolders(folderTree),
    totalSize,
    flatFiles: files,
    folderTree,
  };
};

/**
 * Format bytes to human readable string
 */
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};

/**
 * Generate a tree visualization string for display
 */
export const generateFolderTreeString = (node: FolderNode, indent: string = '', isLast: boolean = true): string => {
  let result = '';

  // Skip root node name
  if (node.name !== 'root') {
    const prefix = isLast ? '└── ' : '├── ';
    result += `${indent}${prefix}${node.name}/ (${node.fileCount} files)\n`;
    indent += isLast ? '    ' : '│   ';
  }

  // Add subfolders
  node.subfolders.forEach((subfolder, index) => {
    const isLastFolder = index === node.subfolders.length - 1 && node.files.length === 0;
    result += generateFolderTreeString(subfolder, indent, isLastFolder);
  });

  // Only show files at root level in the visualization (not all files)
  if (node.name === 'root' && node.files.length > 0) {
    node.files.forEach((file, index) => {
      const isLastFile = index === node.files.length - 1;
      const prefix = isLastFile ? '└── ' : '├── ';
      result += `${indent}${prefix}${file}\n`;
    });
  }

  return result;
};

/**
 * Convert ZipFileEntry to File object
 */
export const zipEntryToFile = (entry: ZipFileEntry): File => {
  return new File([entry.blob], entry.filename, { type: entry.mimeType });
};

/**
 * Convert ZipFileEntry to File object preserving folder path in name
 * This is useful for creating virtual folder structure in the file name
 */
export const zipEntryToFileWithPath = (entry: ZipFileEntry): File => {
  // Replace slashes with a safe separator for filename
  const nameWithPath = entry.relativePath.replace(/\//g, '__');
  return new File([entry.blob], nameWithPath, { type: entry.mimeType });
};
