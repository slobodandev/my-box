/**
 * Document Path Service
 * Handles document path (folder structure) operations with Data Connect
 */

import { dataConnect } from '@/config/firebase';
import {
  listDocumentPaths as listDocumentPathsQuery,
  listActiveDocumentPaths as listActiveDocumentPathsQuery,
  getDocumentPath as getDocumentPathQuery,
  getDocumentPathByName as getDocumentPathByNameQuery,
  createDocumentPath as createDocumentPathMutation,
  createDocumentPathWithId as createDocumentPathWithIdMutation,
  updateDocumentPath as updateDocumentPathMutation,
  deactivateDocumentPath as deactivateDocumentPathMutation,
  deleteDocumentPath as deleteDocumentPathMutation,
} from '../../../dataconnect/src/__generated/dataconnect';

export interface DocumentPath {
  id: string;
  name: string;
  sourceLookupId?: string;
  isActive: boolean;
  description?: string;
  sortOrder: number;
  createdOn?: Date | string;
  createdBy?: string;
  updatedOn?: Date | string;
  updatedBy?: string;
}

export interface CreateDocumentPathInput {
  name: string;
  sourceLookupId?: string;
  description?: string;
  sortOrder?: number;
  createdBy?: string;
}

export interface CreateDocumentPathWithIdInput extends CreateDocumentPathInput {
  id: string;
}

export interface UpdateDocumentPathInput {
  id: string;
  name?: string;
  sourceLookupId?: string;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
  updatedBy?: string;
}

/**
 * Get all document paths (including inactive)
 * @returns Array of document paths
 */
export async function listDocumentPaths(): Promise<DocumentPath[]> {
  try {
    const result = await listDocumentPathsQuery(dataConnect);

    if (!result.data?.documentPaths) {
      return [];
    }

    return result.data.documentPaths.map((path: any) => ({
      id: path.id,
      name: path.name,
      sourceLookupId: path.sourceLookupId || undefined,
      isActive: path.isActive,
      description: path.description || undefined,
      sortOrder: path.sortOrder,
      createdOn: path.createdOn,
      createdBy: path.createdBy || undefined,
      updatedOn: path.updatedOn,
      updatedBy: path.updatedBy || undefined,
    }));
  } catch (error) {
    console.error('Error fetching document paths:', error);
    throw new Error('Failed to fetch document paths');
  }
}

/**
 * Get only active document paths
 * @returns Array of active document paths
 */
export async function listActiveDocumentPaths(): Promise<DocumentPath[]> {
  try {
    const result = await listActiveDocumentPathsQuery(dataConnect);

    if (!result.data?.documentPaths) {
      return [];
    }

    return result.data.documentPaths.map((path: any) => ({
      id: path.id,
      name: path.name,
      sourceLookupId: path.sourceLookupId || undefined,
      isActive: true,
      description: path.description || undefined,
      sortOrder: path.sortOrder,
    }));
  } catch (error) {
    console.error('Error fetching active document paths:', error);
    throw new Error('Failed to fetch active document paths');
  }
}

/**
 * Get a single document path by ID
 * @param id - Document Path ID (UUID)
 * @returns Document path object or null if not found
 */
export async function getDocumentPath(id: string): Promise<DocumentPath | null> {
  try {
    const result = await getDocumentPathQuery(dataConnect, { id });

    if (!result.data?.documentPath) {
      return null;
    }

    const path = result.data.documentPath;
    return {
      id: path.id,
      name: path.name,
      sourceLookupId: path.sourceLookupId || undefined,
      isActive: path.isActive,
      description: path.description || undefined,
      sortOrder: path.sortOrder,
      createdOn: path.createdOn,
      createdBy: path.createdBy || undefined,
      updatedOn: path.updatedOn,
      updatedBy: path.updatedBy || undefined,
    };
  } catch (error) {
    console.error('Error fetching document path:', error);
    return null;
  }
}

/**
 * Get document path by name
 * @param name - Document path name
 * @returns Document path object or null if not found
 */
export async function getDocumentPathByName(name: string): Promise<DocumentPath | null> {
  try {
    const result = await getDocumentPathByNameQuery(dataConnect, { name });

    if (!result.data?.documentPaths || result.data.documentPaths.length === 0) {
      return null;
    }

    const path = result.data.documentPaths[0];
    return {
      id: path.id,
      name: path.name,
      sourceLookupId: path.sourceLookupId || undefined,
      isActive: path.isActive,
      description: path.description || undefined,
      sortOrder: path.sortOrder,
    };
  } catch (error) {
    console.error('Error fetching document path by name:', error);
    return null;
  }
}

/**
 * Create a new document path
 * @param input - Document path creation data
 * @returns Created document path ID
 */
export async function createDocumentPath(input: CreateDocumentPathInput): Promise<string> {
  try {
    const result = await createDocumentPathMutation(dataConnect, {
      name: input.name,
      sourceLookupId: input.sourceLookupId || null,
      description: input.description || null,
      sortOrder: input.sortOrder ?? 0,
      createdBy: input.createdBy || null,
    });

    if (!result.data?.documentPath_insert.id) {
      throw new Error('Failed to create document path');
    }

    return result.data.documentPath_insert.id;
  } catch (error) {
    console.error('Error creating document path:', error);
    throw new Error('Failed to create document path');
  }
}

/**
 * Create a document path with a specific ID (for migration)
 * @param input - Document path creation data with ID
 * @returns Created document path ID
 */
export async function createDocumentPathWithId(input: CreateDocumentPathWithIdInput): Promise<string> {
  try {
    const result = await createDocumentPathWithIdMutation(dataConnect, {
      id: input.id,
      name: input.name,
      sourceLookupId: input.sourceLookupId || null,
      description: input.description || null,
      sortOrder: input.sortOrder ?? 0,
      createdBy: input.createdBy || null,
    });

    if (!result.data?.documentPath_insert.id) {
      throw new Error('Failed to create document path');
    }

    return result.data.documentPath_insert.id;
  } catch (error) {
    console.error('Error creating document path with ID:', error);
    throw new Error('Failed to create document path');
  }
}

/**
 * Update an existing document path
 * @param input - Document path update data
 */
export async function updateDocumentPath(input: UpdateDocumentPathInput): Promise<void> {
  try {
    await updateDocumentPathMutation(dataConnect, {
      id: input.id,
      name: input.name || null,
      sourceLookupId: input.sourceLookupId || null,
      description: input.description || null,
      sortOrder: input.sortOrder ?? null,
      isActive: input.isActive ?? null,
      updatedBy: input.updatedBy || null,
    });
  } catch (error) {
    console.error('Error updating document path:', error);
    throw new Error('Failed to update document path');
  }
}

/**
 * Deactivate a document path (soft delete)
 * @param id - Document path ID
 * @param updatedBy - User who deactivated
 */
export async function deactivateDocumentPath(id: string, updatedBy?: string): Promise<void> {
  try {
    await deactivateDocumentPathMutation(dataConnect, {
      id,
      updatedBy: updatedBy || null,
    });
  } catch (error) {
    console.error('Error deactivating document path:', error);
    throw new Error('Failed to deactivate document path');
  }
}

/**
 * Delete a document path (hard delete)
 * @param id - Document path ID to delete
 */
export async function deleteDocumentPath(id: string): Promise<void> {
  try {
    await deleteDocumentPathMutation(dataConnect, { id });
  } catch (error) {
    console.error('Error deleting document path:', error);
    throw new Error('Failed to delete document path');
  }
}

/**
 * Parse a hierarchical path name into parts
 * @param pathName - Full path name (e.g., "1 - Borrower Docs/1.1 - Company")
 * @returns Array of path parts
 */
export function parsePathHierarchy(pathName: string): string[] {
  return pathName.split('/').map(part => part.trim()).filter(Boolean);
}

/**
 * Get the parent path from a full path name
 * @param pathName - Full path name
 * @returns Parent path or null if at root
 */
export function getParentPath(pathName: string): string | null {
  const parts = parsePathHierarchy(pathName);
  if (parts.length <= 1) return null;
  return parts.slice(0, -1).join('/');
}

/**
 * Get the display name (last part) from a full path
 * @param pathName - Full path name
 * @returns Display name
 */
export function getDisplayName(pathName: string): string {
  const parts = parsePathHierarchy(pathName);
  return parts[parts.length - 1] || pathName;
}
