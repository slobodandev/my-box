/**
 * ZIP Extractor Utility
 *
 * Provides utilities for analyzing and extracting ZIP files with folder structure detection.
 * This module is critical for the file upload workflow when users upload ZIP archives.
 *
 * ## Key Features
 * - Analyzes ZIP file contents without full extraction
 * - Builds hierarchical folder tree structure from flat file paths
 * - Detects and preserves folder hierarchy
 * - Filters out system files (macOS __MACOSX, hidden files)
 * - Provides MIME type detection based on file extensions
 *
 * ## Architecture
 *
 * The module uses a two-pass algorithm for building folder trees:
 * 1. **First Pass**: Creates all folder nodes by parsing file paths
 * 2. **Second Pass**: Assigns files to folders and calculates aggregate statistics
 *
 * This approach ensures parent folders exist before children are added,
 * preventing orphaned nodes in the tree structure.
 *
 * ## Usage Examples
 *
 * ```typescript
 * // Analyze a ZIP file before extraction
 * const analysis = await analyzeZipFile(zipFile);
 *
 * if (analysis.hasfolderStructure) {
 *   console.log(`ZIP contains ${analysis.totalFolders} folders`);
 *   console.log(`Total files: ${analysis.totalFiles}`);
 *   console.log(`Total size: ${formatBytes(analysis.totalSize)}`);
 *
 *   // Display folder tree
 *   console.log(generateFolderTreeString(analysis.folderTree));
 * }
 *
 * // Access individual files
 * for (const file of analysis.flatFiles) {
 *   console.log(`${file.relativePath} (${file.mimeType})`);
 * }
 * ```
 *
 * ## Data Flow
 *
 * ```
 * ZIP File (Blob)
 *     │
 *     ▼
 * ┌─────────────────────────────────┐
 * │     analyzeZipFile()            │
 * │  - Load ZIP with JSZip          │
 * │  - Filter system/hidden files   │
 * │  - Extract file blobs           │
 * │  - Determine MIME types         │
 * └─────────────────────────────────┘
 *     │
 *     ▼
 * ┌─────────────────────────────────┐
 * │     buildFolderTree()           │
 * │  - Two-pass tree building       │
 * │  - Calculate folder statistics  │
 * └─────────────────────────────────┘
 *     │
 *     ▼
 * ZipAnalysis {
 *   folderTree: FolderNode,
 *   flatFiles: ZipFileEntry[],
 *   ...statistics
 * }
 * ```
 *
 * @module zipExtractor
 * @see {@link FileFolderManager} - Component that uses this utility for ZIP uploads
 * @see {@link FileUploadZone} - Upload component that handles ZIP file detection
 */

import JSZip from 'jszip';

/**
 * Represents a single file extracted from a ZIP archive.
 *
 * This interface captures both the file content and its location within
 * the original ZIP structure.
 *
 * @example
 * // File at "documents/reports/Q1-2024.pdf" in ZIP
 * const entry: ZipFileEntry = {
 *   relativePath: "documents/reports/Q1-2024.pdf",
 *   filename: "Q1-2024.pdf",
 *   folderPath: "documents/reports",
 *   size: 1048576,
 *   blob: Blob,
 *   mimeType: "application/pdf"
 * };
 */
export interface ZipFileEntry {
  /**
   * Full path within the ZIP archive.
   * Includes all parent folders and the filename.
   * Uses forward slashes as path separators regardless of OS.
   * @example "folder/subfolder/file.pdf"
   */
  relativePath: string;

  /**
   * Just the filename portion without any path.
   * @example "file.pdf"
   */
  filename: string;

  /**
   * The folder path containing this file (excludes filename).
   * Empty string for files at the root of the ZIP.
   * @example "folder/subfolder" or ""
   */
  folderPath: string;

  /**
   * File size in bytes.
   * Obtained from the decompressed blob.
   */
  size: number;

  /**
   * The file content as a Blob object.
   * Ready for upload to Firebase Storage or conversion to File.
   */
  blob: Blob;

  /**
   * MIME type derived from file extension.
   * Defaults to "application/octet-stream" for unknown types.
   * @see {@link getMimeTypeFromExtension} for supported types
   */
  mimeType: string;
}

/**
 * Represents a folder in the hierarchical folder tree structure.
 *
 * Each node contains references to its children (files and subfolders)
 * along with aggregate statistics for the entire subtree.
 *
 * @example
 * // Folder "documents" containing 5 files across subfolders
 * const folder: FolderNode = {
 *   name: "documents",
 *   path: "documents",
 *   files: ["readme.txt"],           // Direct children only
 *   subfolders: [reportsFolderNode], // Nested folders
 *   fileCount: 5,                     // Total including nested
 *   totalSize: 2097152                // Total bytes including nested
 * };
 */
export interface FolderNode {
  /**
   * Folder name (not the full path).
   * @example "reports" (not "documents/reports")
   */
  name: string;

  /**
   * Full path from root.
   * Empty string for the virtual root node.
   * @example "documents/reports"
   */
  path: string;

  /**
   * Filenames of files directly in this folder (not nested).
   * Does not include files in subfolders.
   */
  files: string[];

  /**
   * Child folder nodes.
   * Forms the recursive tree structure.
   */
  subfolders: FolderNode[];

  /**
   * Total count of ALL files in this folder and all subfolders.
   * This is an aggregate statistic, not just direct children.
   */
  fileCount: number;

  /**
   * Total size in bytes of ALL files in this folder and subfolders.
   * This is an aggregate statistic for the entire subtree.
   */
  totalSize: number;
}

/**
 * Complete analysis result for a ZIP archive.
 *
 * Contains both the hierarchical folder structure and a flat list
 * of all files for flexible access patterns.
 *
 * @example
 * const analysis = await analyzeZipFile(zipFile);
 *
 * // Check if ZIP has folder structure
 * if (analysis.hasfolderStructure) {
 *   // Use tree structure for folder operations
 *   displayTree(analysis.folderTree);
 * } else {
 *   // Just flat files at root
 *   uploadFiles(analysis.flatFiles);
 * }
 */
export interface ZipAnalysis {
  /**
   * True if the ZIP contains at least one folder.
   * False if all files are at the root level.
   */
  hasfolderStructure: boolean;

  /**
   * Top-level folders in the ZIP (direct children of root).
   * Convenience accessor - same as folderTree.subfolders.
   */
  rootFolders: FolderNode[];

  /**
   * Total number of files in the ZIP (excluding directories and system files).
   */
  totalFiles: number;

  /**
   * Total number of folders in the ZIP hierarchy.
   */
  totalFolders: number;

  /**
   * Total uncompressed size in bytes of all files.
   */
  totalSize: number;

  /**
   * Flat array of all files with their extracted blobs and metadata.
   * Useful for iteration, filtering, or batch operations.
   */
  flatFiles: ZipFileEntry[];

  /**
   * Root node of the folder tree structure.
   * The root itself is a virtual node (name: "root", path: "").
   * Actual folders are in root.subfolders.
   */
  folderTree: FolderNode;
}

/**
 * Determines the MIME type of a file based on its extension.
 *
 * This function is used internally to assign proper content types to files
 * extracted from ZIP archives, which is important for:
 * - Correct file handling by browsers
 * - Proper Content-Type headers when uploading to Firebase Storage
 * - File preview functionality in the UI
 *
 * @param filename - The filename (with or without path) to analyze
 * @returns The MIME type string, or "application/octet-stream" for unknown types
 *
 * @example
 * getMimeTypeFromExtension("report.pdf")     // "application/pdf"
 * getMimeTypeFromExtension("data.xlsx")      // "application/vnd.openxmlformats-..."
 * getMimeTypeFromExtension("image.PNG")      // "image/png" (case-insensitive)
 * getMimeTypeFromExtension("unknown.xyz")    // "application/octet-stream"
 *
 * @remarks
 * The function extracts the extension from the last dot in the filename,
 * converts it to lowercase for case-insensitive matching, and looks it up
 * in a predefined mapping. This covers common document and image types
 * used in loan file management.
 *
 * ## Supported Types
 * | Extension | MIME Type |
 * |-----------|-----------|
 * | pdf | application/pdf |
 * | doc | application/msword |
 * | docx | application/vnd.openxmlformats-officedocument.wordprocessingml.document |
 * | xls | application/vnd.ms-excel |
 * | xlsx | application/vnd.openxmlformats-officedocument.spreadsheetml.sheet |
 * | jpg, jpeg | image/jpeg |
 * | png | image/png |
 * | gif | image/gif |
 * | bmp | image/bmp |
 * | webp | image/webp |
 * | txt | text/plain |
 * | csv | text/csv |
 * | json | application/json |
 * | xml | application/xml |
 *
 * @internal
 */
const getMimeTypeFromExtension = (filename: string): string => {
  // Extract extension from filename (handles paths like "folder/file.pdf")
  const ext = filename.split('.').pop()?.toLowerCase();

  // MIME type lookup table for common file types
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

  // Return mapped type or fallback to generic binary type
  return mimeTypes[ext || ''] || 'application/octet-stream';
};

/**
 * Builds a hierarchical folder tree from a flat list of file entries.
 *
 * This function implements a **two-pass algorithm** to construct a tree structure
 * from file paths. This approach is necessary because:
 * 1. Files may arrive in any order (not depth-first)
 * 2. Parent folders must exist before children can be added
 * 3. Aggregate statistics require all files to be processed
 *
 * ## Algorithm Overview
 *
 * ### Pass 1: Create Folder Structure
 * ```
 * Input: ["a/b/file1.pdf", "a/c/file2.pdf", "a/b/d/file3.pdf"]
 *
 * For "a/b/file1.pdf":
 *   - Create folder "a" → add to root
 *   - Create folder "a/b" → add to "a"
 *
 * For "a/c/file2.pdf":
 *   - Folder "a" exists → skip
 *   - Create folder "a/c" → add to "a"
 *
 * For "a/b/d/file3.pdf":
 *   - Folder "a" exists → skip
 *   - Folder "a/b" exists → skip
 *   - Create folder "a/b/d" → add to "a/b"
 * ```
 *
 * ### Pass 2: Add Files and Calculate Statistics
 * ```
 * For each file:
 *   1. Add filename to its direct folder's files[]
 *   2. Increment fileCount in direct folder
 *   3. Add size to direct folder's totalSize
 *   4. Walk UP the tree, incrementing parent counts
 * ```
 *
 * ## Time Complexity
 * - O(n * d) where n = number of files, d = average path depth
 * - Space: O(f) where f = number of unique folders
 *
 * @param files - Array of ZipFileEntry objects with populated folderPath
 * @returns The root FolderNode containing the complete tree structure
 *
 * @example
 * // Input files
 * const files: ZipFileEntry[] = [
 *   { folderPath: "docs", filename: "readme.txt", size: 100, ... },
 *   { folderPath: "docs/reports", filename: "q1.pdf", size: 5000, ... },
 *   { folderPath: "", filename: "root-file.txt", size: 50, ... },
 * ];
 *
 * const tree = buildFolderTree(files);
 *
 * // Result structure:
 * // root (fileCount: 3, totalSize: 5150)
 * //   ├── files: ["root-file.txt"]
 * //   └── subfolders:
 * //       └── docs (fileCount: 2, totalSize: 5100)
 * //           ├── files: ["readme.txt"]
 * //           └── subfolders:
 * //               └── reports (fileCount: 1, totalSize: 5000)
 * //                   └── files: ["q1.pdf"]
 *
 * @remarks
 * - The root node is a virtual container (name: "root", path: "")
 * - Folder statistics (fileCount, totalSize) are AGGREGATE values including all nested content
 * - The files[] array in each folder contains only DIRECT children, not nested files
 * - Empty folders (from ZIP directory entries) are not created unless they contain files
 *
 * @internal
 */
const buildFolderTree = (files: ZipFileEntry[]): FolderNode => {
  // Initialize virtual root node - this is the container for the entire tree
  const root: FolderNode = {
    name: 'root',
    path: '',
    files: [],
    subfolders: [],
    fileCount: 0,
    totalSize: 0,
  };

  // Map for O(1) folder lookup by path
  // Key: folder path (e.g., "docs/reports"), Value: FolderNode reference
  const folderMap = new Map<string, FolderNode>();
  folderMap.set('', root); // Register root for parent lookups

  // ═══════════════════════════════════════════════════════════════════════════
  // PASS 1: Create all folder nodes
  //
  // This pass ensures all parent folders exist before we try to add files.
  // We parse each file's folderPath and create any missing folder nodes.
  // ═══════════════════════════════════════════════════════════════════════════
  files.forEach(file => {
    // Split path into parts: "a/b/c" → ["a", "b", "c"]
    // Filter removes empty strings from leading/trailing slashes
    const parts = file.folderPath.split('/').filter(p => p);
    let currentPath = '';

    // Walk down the path, creating folders as needed
    parts.forEach((part) => {
      const parentPath = currentPath;
      // Build cumulative path: "" → "a" → "a/b" → "a/b/c"
      currentPath = currentPath ? `${currentPath}/${part}` : part;

      // Only create folder if it doesn't exist yet
      if (!folderMap.has(currentPath)) {
        const folder: FolderNode = {
          name: part,           // Just the folder name, not full path
          path: currentPath,    // Full path for lookups
          files: [],
          subfolders: [],
          fileCount: 0,
          totalSize: 0,
        };
        folderMap.set(currentPath, folder);

        // Link to parent folder (parent is guaranteed to exist due to iteration order)
        const parent = folderMap.get(parentPath);
        if (parent) {
          parent.subfolders.push(folder);
        }
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // PASS 2: Assign files to folders and calculate aggregate statistics
  //
  // Now that all folders exist, we can:
  // 1. Add each file to its containing folder
  // 2. Update statistics for the folder AND all ancestor folders
  // ═══════════════════════════════════════════════════════════════════════════
  files.forEach(file => {
    // Find the folder this file belongs to (default to root for path "")
    const folder = folderMap.get(file.folderPath) || root;

    // Add file to its direct parent folder
    folder.files.push(file.filename);
    folder.fileCount++;
    folder.totalSize += file.size;

    // Propagate counts UP the tree to all ancestor folders
    // This ensures parent folders reflect total nested content
    let currentPath = file.folderPath;
    while (currentPath) {
      const parent = folderMap.get(currentPath);
      // Skip the direct folder (already counted above)
      if (parent && currentPath !== file.folderPath) {
        parent.fileCount++;
        parent.totalSize += file.size;
      }
      // Move up: "a/b/c" → "a/b" → "a" → ""
      const lastSlash = currentPath.lastIndexOf('/');
      currentPath = lastSlash > 0 ? currentPath.substring(0, lastSlash) : '';
    }

    // Update root node statistics
    if (file.folderPath) {
      // File is in a subfolder - root should reflect it in aggregate counts
      root.fileCount++;
      root.totalSize += file.size;
    } else {
      // File is at root level - add to root's direct files list
      root.files.push(file.filename);
      root.fileCount++;
      root.totalSize += file.size;
    }
  });

  return root;
};

/**
 * Recursively counts all folders in a folder tree.
 *
 * This function traverses the tree depth-first, counting all folder nodes
 * (excluding the root node itself). Used to provide folder count statistics
 * in the ZipAnalysis result.
 *
 * @param node - The FolderNode to start counting from (usually root)
 * @returns Total number of folders in the subtree
 *
 * @example
 * // Tree structure:
 * // root
 * //   ├── docs (1)
 * //   │   └── reports (2)
 * //   └── images (3)
 *
 * countFolders(root); // Returns 3
 *
 * @remarks
 * - The count excludes the input node itself
 * - Returns 0 for a folder with no subfolders
 * - Time complexity: O(f) where f = total folder count
 *
 * @internal
 */
const countFolders = (node: FolderNode): number => {
  // Count direct subfolders
  let count = node.subfolders.length;

  // Recursively count subfolders of each subfolder
  node.subfolders.forEach(subfolder => {
    count += countFolders(subfolder);
  });

  return count;
};

/**
 * Analyzes a ZIP file to extract its contents and detect folder structure.
 *
 * This is the primary entry point for ZIP file analysis. It performs the following:
 * 1. Loads and parses the ZIP archive using JSZip
 * 2. Filters out system files and hidden files
 * 3. Extracts file blobs and determines MIME types
 * 4. Builds a hierarchical folder tree structure
 * 5. Calculates aggregate statistics
 *
 * ## Filtering Rules
 *
 * The following entries are automatically excluded:
 * - **Directory entries**: ZIP directory markers (folders without content)
 * - **macOS system files**: Paths starting with `__MACOSX`
 * - **Hidden files**: Files starting with `.` (e.g., `.DS_Store`, `.gitkeep`)
 * - **Root hidden files**: Files at root starting with `.`
 *
 * ## Performance Considerations
 *
 * - File extraction runs in parallel using Promise.all
 * - Large ZIPs may consume significant memory as all blobs are held in memory
 * - Consider streaming for ZIPs > 100MB
 *
 * @param zipFile - The ZIP file to analyze (Web File API object)
 * @returns Promise resolving to ZipAnalysis with complete structure and statistics
 * @throws Error if the ZIP file is corrupted or cannot be parsed
 *
 * @example
 * // Basic usage
 * const fileInput = document.querySelector('input[type="file"]');
 * const zipFile = fileInput.files[0];
 *
 * try {
 *   const analysis = await analyzeZipFile(zipFile);
 *
 *   console.log(`Files: ${analysis.totalFiles}`);
 *   console.log(`Folders: ${analysis.totalFolders}`);
 *   console.log(`Size: ${formatBytes(analysis.totalSize)}`);
 *
 *   if (analysis.hasfolderStructure) {
 *     console.log("ZIP contains folder structure:");
 *     console.log(generateFolderTreeString(analysis.folderTree));
 *   }
 *
 *   // Process files
 *   for (const file of analysis.flatFiles) {
 *     console.log(`Uploading: ${file.relativePath}`);
 *     await uploadFile(file.blob, file.filename);
 *   }
 * } catch (error) {
 *   console.error("Failed to analyze ZIP:", error);
 * }
 *
 * @example
 * // Checking for folder structure to decide upload strategy
 * const analysis = await analyzeZipFile(zipFile);
 *
 * if (analysis.hasfolderStructure) {
 *   // Show modal asking user how to handle folders
 *   const preserveFolders = await showFolderPrompt(analysis);
 *   if (preserveFolders) {
 *     await uploadWithFolderTags(analysis.flatFiles);
 *   } else {
 *     await uploadFlat(analysis.flatFiles);
 *   }
 * } else {
 *   // No folders - upload directly
 *   await uploadFlat(analysis.flatFiles);
 * }
 *
 * @see {@link buildFolderTree} - Internal function for tree construction
 * @see {@link ZipAnalysis} - Return type documentation
 */
export const analyzeZipFile = async (zipFile: File): Promise<ZipAnalysis> => {
  // Initialize JSZip and load the archive
  const zip = new JSZip();
  const zipContent = await zip.loadAsync(zipFile);

  const files: ZipFileEntry[] = [];
  const filePromises: Promise<void>[] = [];

  // Process all entries in the ZIP
  // JSZip.forEach iterates over all entries (files and directories)
  zipContent.forEach((relativePath, zipEntry) => {
    // ─────────────────────────────────────────────────────────────────────────
    // FILTERING: Skip unwanted entries
    // ─────────────────────────────────────────────────────────────────────────

    // Skip directory entries (we build folders from file paths instead)
    // Skip __MACOSX folder (macOS resource fork data, not user content)
    // Skip root-level hidden files (e.g., .DS_Store at ZIP root)
    if (zipEntry.dir || relativePath.startsWith('__MACOSX') || relativePath.startsWith('.')) {
      return;
    }

    // Extract just the filename from the path
    const filename = relativePath.split('/').pop() || '';

    // Skip hidden files within folders (e.g., "folder/.hidden")
    if (filename.startsWith('.')) {
      return;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // EXTRACTION: Extract blob and build entry
    // ─────────────────────────────────────────────────────────────────────────

    const promise = zipEntry.async('blob').then((blob) => {
      // Extract folder path: "folder/subfolder/file.pdf" → "folder/subfolder"
      const lastSlash = relativePath.lastIndexOf('/');
      const folderPath = lastSlash > 0 ? relativePath.substring(0, lastSlash) : '';

      // Determine MIME type from file extension
      const mimeType = getMimeTypeFromExtension(filename);

      files.push({
        relativePath,
        filename,
        folderPath,
        size: blob.size,  // Use actual decompressed size from blob
        blob,
        mimeType,
      });
    });

    filePromises.push(promise);
  });

  // Wait for all file extractions to complete (parallel processing)
  await Promise.all(filePromises);

  // ─────────────────────────────────────────────────────────────────────────
  // ANALYSIS: Build tree and calculate statistics
  // ─────────────────────────────────────────────────────────────────────────

  // Build hierarchical folder tree from flat file list
  const folderTree = buildFolderTree(files);

  // Determine if there's a folder structure
  // A ZIP has folder structure if any file is in a subdirectory
  const uniqueFolders = new Set(files.map(f => f.folderPath).filter(p => p));
  const hasfolderStructure = uniqueFolders.size > 0;

  // Get root-level folders (convenience accessor)
  const rootFolders = folderTree.subfolders;

  // Calculate total uncompressed size
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
 * Formats a byte count into a human-readable string with appropriate units.
 *
 * Uses binary units (1 KB = 1024 bytes) which matches how file systems
 * typically report sizes.
 *
 * @param bytes - The number of bytes to format
 * @returns Formatted string with 2 decimal places and unit suffix
 *
 * @example
 * formatBytes(0);           // "0 Bytes"
 * formatBytes(1023);        // "1023.00 Bytes"
 * formatBytes(1024);        // "1.00 KB"
 * formatBytes(1536);        // "1.50 KB"
 * formatBytes(1048576);     // "1.00 MB"
 * formatBytes(1073741824);  // "1.00 GB"
 *
 * @remarks
 * This function is commonly used in the UI to display:
 * - Individual file sizes
 * - Folder total sizes
 * - Upload progress statistics
 */
export const formatBytes = (bytes: number): string => {
  // Handle zero case explicitly
  if (bytes === 0) return '0 Bytes';

  // Binary unit multiplier (1 KB = 1024 bytes)
  const k = 1024;

  // Available unit labels (supports up to GB)
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];

  // Calculate appropriate unit index using logarithm
  // log(bytes) / log(1024) gives us which power of 1024 fits
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  // Format with 2 decimal places and appropriate unit
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};

/**
 * Generates an ASCII tree visualization string for displaying folder structure.
 *
 * Creates a human-readable representation of the folder tree using box-drawing
 * characters (├──, └──, │). This is useful for:
 * - Console logging during development
 * - Displaying in UI modals before ZIP upload
 * - Debugging folder structure issues
 *
 * ## Output Format
 *
 * ```
 * ├── folder1/ (3 files)
 * │   ├── subfolder/ (2 files)
 * │   └── another/ (1 files)
 * └── folder2/ (5 files)
 * file-at-root.txt
 * ```
 *
 * @param node - The FolderNode to visualize (typically the root)
 * @param indent - Current indentation string (used for recursion, start with '')
 * @param isLast - Whether this is the last sibling (used for recursion, start with true)
 * @returns Multi-line string representation of the tree
 *
 * @example
 * const analysis = await analyzeZipFile(zipFile);
 * const treeString = generateFolderTreeString(analysis.folderTree);
 * console.log(treeString);
 *
 * // Output:
 * // ├── documents/ (5 files)
 * // │   ├── reports/ (3 files)
 * // │   └── archives/ (2 files)
 * // └── images/ (10 files)
 *
 * @remarks
 * - The root node itself is not displayed (only its children)
 * - Files are only shown at the root level to keep output concise
 * - Each folder shows aggregate file count in parentheses
 * - Box-drawing characters work in most terminals and monospace fonts
 */
export const generateFolderTreeString = (node: FolderNode, indent: string = '', isLast: boolean = true): string => {
  let result = '';

  // Skip root node name - we only visualize its children
  if (node.name !== 'root') {
    // Use └── for last item, ├── for others
    const prefix = isLast ? '└── ' : '├── ';
    result += `${indent}${prefix}${node.name}/ (${node.fileCount} files)\n`;
    // Adjust indent: use spaces if last item, vertical line if not
    indent += isLast ? '    ' : '│   ';
  }

  // Recursively add subfolders
  node.subfolders.forEach((subfolder, index) => {
    // Folder is "last" if it's the final subfolder AND there are no files to show
    const isLastFolder = index === node.subfolders.length - 1 && node.files.length === 0;
    result += generateFolderTreeString(subfolder, indent, isLastFolder);
  });

  // Only show files at root level in the visualization
  // Showing all nested files would make the output too verbose
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
 * Converts a ZipFileEntry to a standard Web File object.
 *
 * Creates a File object suitable for use with:
 * - File upload APIs
 * - Firebase Storage uploads
 * - FormData construction
 * - File preview components
 *
 * The resulting File uses just the filename (no path), so folder
 * structure is discarded. Use this when uploading files without
 * preserving folder hierarchy.
 *
 * @param entry - The ZipFileEntry to convert
 * @returns A File object with the original filename and MIME type
 *
 * @example
 * // Upload extracted files without folder structure
 * const analysis = await analyzeZipFile(zipFile);
 *
 * for (const entry of analysis.flatFiles) {
 *   const file = zipEntryToFile(entry);
 *   await uploadToStorage(file); // Uploads as "document.pdf", not "folder/document.pdf"
 * }
 *
 * @see {@link zipEntryToFileWithPath} - Alternative that preserves path in filename
 */
export const zipEntryToFile = (entry: ZipFileEntry): File => {
  // Create File from blob with original filename and detected MIME type
  return new File([entry.blob], entry.filename, { type: entry.mimeType });
};

/**
 * Converts a ZipFileEntry to a File object with the folder path encoded in the filename.
 *
 * This is useful when you need to preserve folder structure but can't use
 * actual directories (e.g., when uploading to flat storage systems).
 * The folder separators (/) are replaced with double underscores (__).
 *
 * ## Path Encoding
 *
 * | Original Path | Encoded Filename |
 * |---------------|------------------|
 * | `file.pdf` | `file.pdf` |
 * | `docs/file.pdf` | `docs__file.pdf` |
 * | `a/b/c/file.pdf` | `a__b__c__file.pdf` |
 *
 * @param entry - The ZipFileEntry to convert
 * @returns A File object with path-encoded filename
 *
 * @example
 * // Upload files with path preserved in filename
 * const analysis = await analyzeZipFile(zipFile);
 *
 * for (const entry of analysis.flatFiles) {
 *   const file = zipEntryToFileWithPath(entry);
 *   console.log(file.name);
 *   // "folder__subfolder__document.pdf" for "folder/subfolder/document.pdf"
 * }
 *
 * @example
 * // Decode the path later
 * const originalPath = file.name.replace(/__/g, '/');
 *
 * @remarks
 * - Uses `__` as separator to minimize conflicts with normal filenames
 * - Single underscores in original names are preserved
 * - Consider using tags/metadata instead for proper folder reconstruction
 *
 * @see {@link zipEntryToFile} - Alternative that uses just the filename
 */
export const zipEntryToFileWithPath = (entry: ZipFileEntry): File => {
  // Replace path separators with safe double-underscore delimiter
  const nameWithPath = entry.relativePath.replace(/\//g, '__');
  return new File([entry.blob], nameWithPath, { type: entry.mimeType });
};
