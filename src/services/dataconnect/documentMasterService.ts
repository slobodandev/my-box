/**
 * Document Master Service
 * Handles document type operations with Data Connect
 */

import { dataConnect } from '@/config/firebase';
import {
  listDocumentMasters as listDocumentMastersQuery,
  listActiveDocumentMasters as listActiveDocumentMastersQuery,
  getDocumentMaster as getDocumentMasterQuery,
  listDocumentMastersByPath as listDocumentMastersByPathQuery,
  getDocumentMasterByName as getDocumentMasterByNameQuery,
  createDocumentMaster as createDocumentMasterMutation,
  createDocumentMasterWithId as createDocumentMasterWithIdMutation,
  updateDocumentMaster as updateDocumentMasterMutation,
  deactivateDocumentMaster as deactivateDocumentMasterMutation,
  deleteDocumentMaster as deleteDocumentMasterMutation,
} from '../../../dataconnect/src/__generated/dataconnect';

export interface DocumentMaster {
  id: string;
  name: string;
  documentPathId?: string;
  documentPath?: {
    id: string;
    name: string;
  };
  isActive: boolean;
  description?: string;
  sortOrder: number;
  isSystemGenerated: boolean;
  reviewRequired: boolean;
  isVersioningEnabled: boolean;
  namingConvention?: string;
  display?: string;
  createdOn?: Date | string;
  createdBy?: string;
  updatedOn?: Date | string;
  updatedBy?: string;
}

export interface CreateDocumentMasterInput {
  name: string;
  documentPathId?: string;
  description?: string;
  sortOrder?: number;
  isSystemGenerated?: boolean;
  reviewRequired?: boolean;
  isVersioningEnabled?: boolean;
  namingConvention?: string;
  display?: string;
  createdBy?: string;
}

export interface CreateDocumentMasterWithIdInput extends CreateDocumentMasterInput {
  id: string;
}

export interface UpdateDocumentMasterInput {
  id: string;
  name?: string;
  documentPathId?: string;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
  isSystemGenerated?: boolean;
  reviewRequired?: boolean;
  isVersioningEnabled?: boolean;
  namingConvention?: string;
  display?: string;
  updatedBy?: string;
}

/**
 * Get all document masters (including inactive)
 * @returns Array of document masters
 */
export async function listDocumentMasters(): Promise<DocumentMaster[]> {
  try {
    const result = await listDocumentMastersQuery(dataConnect);

    if (!result.data?.documentMasters) {
      return [];
    }

    return result.data.documentMasters.map((doc: any) => ({
      id: doc.id,
      name: doc.name,
      documentPathId: doc.documentPathId || undefined,
      documentPath: doc.documentPath ? {
        id: doc.documentPath.id,
        name: doc.documentPath.name,
      } : undefined,
      isActive: doc.isActive,
      description: doc.description || undefined,
      sortOrder: doc.sortOrder,
      isSystemGenerated: doc.isSystemGenerated,
      reviewRequired: doc.reviewRequired,
      isVersioningEnabled: doc.isVersioningEnabled,
      namingConvention: doc.namingConvention || undefined,
      display: doc.display || undefined,
      createdOn: doc.createdOn,
      createdBy: doc.createdBy || undefined,
      updatedOn: doc.updatedOn,
      updatedBy: doc.updatedBy || undefined,
    }));
  } catch (error) {
    console.error('Error fetching document masters:', error);
    throw new Error('Failed to fetch document types');
  }
}

/**
 * Get only active document masters
 * @returns Array of active document masters
 */
export async function listActiveDocumentMasters(): Promise<DocumentMaster[]> {
  try {
    const result = await listActiveDocumentMastersQuery(dataConnect);

    if (!result.data?.documentMasters) {
      return [];
    }

    return result.data.documentMasters.map((doc: any) => ({
      id: doc.id,
      name: doc.name,
      documentPathId: doc.documentPathId || undefined,
      documentPath: doc.documentPath ? {
        id: doc.documentPath.id,
        name: doc.documentPath.name,
      } : undefined,
      isActive: true,
      description: doc.description || undefined,
      sortOrder: doc.sortOrder,
      isSystemGenerated: false,
      reviewRequired: false,
      isVersioningEnabled: false,
      namingConvention: doc.namingConvention || undefined,
      display: doc.display || undefined,
    }));
  } catch (error) {
    console.error('Error fetching active document masters:', error);
    throw new Error('Failed to fetch active document types');
  }
}

/**
 * Get a single document master by ID
 * @param id - Document Master ID (UUID)
 * @returns Document master object or null if not found
 */
export async function getDocumentMaster(id: string): Promise<DocumentMaster | null> {
  try {
    const result = await getDocumentMasterQuery(dataConnect, { id });

    if (!result.data?.documentMaster) {
      return null;
    }

    const doc = result.data.documentMaster;
    return {
      id: doc.id,
      name: doc.name,
      documentPathId: doc.documentPathId || undefined,
      documentPath: doc.documentPath ? {
        id: doc.documentPath.id,
        name: doc.documentPath.name,
      } : undefined,
      isActive: doc.isActive,
      description: doc.description || undefined,
      sortOrder: doc.sortOrder,
      isSystemGenerated: doc.isSystemGenerated,
      reviewRequired: doc.reviewRequired,
      isVersioningEnabled: doc.isVersioningEnabled,
      namingConvention: doc.namingConvention || undefined,
      display: doc.display || undefined,
      createdOn: doc.createdOn,
      createdBy: doc.createdBy || undefined,
      updatedOn: doc.updatedOn,
      updatedBy: doc.updatedBy || undefined,
    };
  } catch (error) {
    console.error('Error fetching document master:', error);
    return null;
  }
}

/**
 * Get document masters by document path ID
 * @param documentPathId - Document Path ID (UUID)
 * @returns Array of document masters in that path
 */
export async function listDocumentMastersByPath(documentPathId: string): Promise<DocumentMaster[]> {
  try {
    const result = await listDocumentMastersByPathQuery(dataConnect, { documentPathId });

    if (!result.data?.documentMasters) {
      return [];
    }

    return result.data.documentMasters.map((doc: any) => ({
      id: doc.id,
      name: doc.name,
      documentPathId: doc.documentPathId || undefined,
      isActive: doc.isActive,
      description: doc.description || undefined,
      sortOrder: doc.sortOrder,
      isSystemGenerated: false,
      reviewRequired: false,
      isVersioningEnabled: false,
      namingConvention: doc.namingConvention || undefined,
      display: doc.display || undefined,
    }));
  } catch (error) {
    console.error('Error fetching document masters by path:', error);
    throw new Error('Failed to fetch document types for path');
  }
}

/**
 * Get document master by name
 * @param name - Document master name
 * @returns Document master object or null if not found
 */
export async function getDocumentMasterByName(name: string): Promise<DocumentMaster | null> {
  try {
    const result = await getDocumentMasterByNameQuery(dataConnect, { name });

    if (!result.data?.documentMasters || result.data.documentMasters.length === 0) {
      return null;
    }

    const doc = result.data.documentMasters[0];
    return {
      id: doc.id,
      name: doc.name,
      documentPathId: doc.documentPathId || undefined,
      documentPath: doc.documentPath ? {
        id: doc.documentPath.id,
        name: doc.documentPath.name,
      } : undefined,
      isActive: doc.isActive,
      description: doc.description || undefined,
      sortOrder: doc.sortOrder,
      isSystemGenerated: false,
      reviewRequired: false,
      isVersioningEnabled: false,
    };
  } catch (error) {
    console.error('Error fetching document master by name:', error);
    return null;
  }
}

/**
 * Create a new document master
 * @param input - Document master creation data
 * @returns Created document master ID
 */
export async function createDocumentMaster(input: CreateDocumentMasterInput): Promise<string> {
  try {
    const result = await createDocumentMasterMutation(dataConnect, {
      name: input.name,
      documentPathId: input.documentPathId || null,
      description: input.description || null,
      sortOrder: input.sortOrder ?? 0,
      isSystemGenerated: input.isSystemGenerated ?? false,
      reviewRequired: input.reviewRequired ?? false,
      isVersioningEnabled: input.isVersioningEnabled ?? false,
      namingConvention: input.namingConvention || null,
      display: input.display || null,
      createdBy: input.createdBy || null,
    });

    if (!result.data?.documentMaster_insert.id) {
      throw new Error('Failed to create document type');
    }

    return result.data.documentMaster_insert.id;
  } catch (error) {
    console.error('Error creating document master:', error);
    throw new Error('Failed to create document type');
  }
}

/**
 * Create a document master with a specific ID (for migration)
 * @param input - Document master creation data with ID
 * @returns Created document master ID
 */
export async function createDocumentMasterWithId(input: CreateDocumentMasterWithIdInput): Promise<string> {
  try {
    const result = await createDocumentMasterWithIdMutation(dataConnect, {
      id: input.id,
      name: input.name,
      documentPathId: input.documentPathId || null,
      description: input.description || null,
      sortOrder: input.sortOrder ?? 0,
      isSystemGenerated: input.isSystemGenerated ?? false,
      reviewRequired: input.reviewRequired ?? false,
      isVersioningEnabled: input.isVersioningEnabled ?? false,
      namingConvention: input.namingConvention || null,
      display: input.display || null,
      createdBy: input.createdBy || null,
    });

    if (!result.data?.documentMaster_insert.id) {
      throw new Error('Failed to create document type');
    }

    return result.data.documentMaster_insert.id;
  } catch (error) {
    console.error('Error creating document master with ID:', error);
    throw new Error('Failed to create document type');
  }
}

/**
 * Update an existing document master
 * @param input - Document master update data
 */
export async function updateDocumentMaster(input: UpdateDocumentMasterInput): Promise<void> {
  try {
    await updateDocumentMasterMutation(dataConnect, {
      id: input.id,
      name: input.name || null,
      documentPathId: input.documentPathId || null,
      description: input.description || null,
      sortOrder: input.sortOrder ?? null,
      isActive: input.isActive ?? null,
      isSystemGenerated: input.isSystemGenerated ?? null,
      reviewRequired: input.reviewRequired ?? null,
      isVersioningEnabled: input.isVersioningEnabled ?? null,
      namingConvention: input.namingConvention || null,
      display: input.display || null,
      updatedBy: input.updatedBy || null,
    });
  } catch (error) {
    console.error('Error updating document master:', error);
    throw new Error('Failed to update document type');
  }
}

/**
 * Deactivate a document master (soft delete)
 * @param id - Document master ID
 * @param updatedBy - User who deactivated
 */
export async function deactivateDocumentMaster(id: string, updatedBy?: string): Promise<void> {
  try {
    await deactivateDocumentMasterMutation(dataConnect, {
      id,
      updatedBy: updatedBy || null,
    });
  } catch (error) {
    console.error('Error deactivating document master:', error);
    throw new Error('Failed to deactivate document type');
  }
}

/**
 * Delete a document master (hard delete)
 * @param id - Document master ID to delete
 */
export async function deleteDocumentMaster(id: string): Promise<void> {
  try {
    await deleteDocumentMasterMutation(dataConnect, { id });
  } catch (error) {
    console.error('Error deleting document master:', error);
    throw new Error('Failed to delete document type');
  }
}
