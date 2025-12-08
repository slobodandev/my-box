/**
 * Document Path Management Page (Admin Only)
 * Allows admins to manage document folder paths/categories
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  listDocumentPaths,
  createDocumentPath,
  updateDocumentPath,
  deactivateDocumentPath,
  deleteDocumentPath,
  getDisplayName,
  DocumentPath,
  CreateDocumentPathInput,
  UpdateDocumentPathInput,
} from '@/services/dataconnect/documentPathService';
import { useAuth } from '@/contexts/AuthContext';
import { modal } from '@/utils/modal';

export const DocumentPathManagement: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [documentPaths, setDocumentPaths] = useState<DocumentPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(true);

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPath, setSelectedPath] = useState<DocumentPath | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sortOrder: 0,
  });

  useEffect(() => {
    fetchDocumentPaths();
  }, []);

  const fetchDocumentPaths = async () => {
    setLoading(true);
    setError(null);
    try {
      const paths = await listDocumentPaths();
      paths.sort((a, b) => a.sortOrder - b.sortOrder);
      setDocumentPaths(paths);
    } catch (err) {
      setError('Failed to load document paths');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const input: CreateDocumentPathInput = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        sortOrder: formData.sortOrder,
        createdBy: user?.email || 'admin',
      };

      await createDocumentPath(input);
      modal.success('Document path created successfully');
      setShowCreateModal(false);
      resetForm();
      await fetchDocumentPaths();
    } catch (err: any) {
      console.error('Error creating document path:', err);
      modal.error(err.message || 'Failed to create document path');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPath) return;

    setSaving(true);

    try {
      const input: UpdateDocumentPathInput = {
        id: selectedPath.id,
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        sortOrder: formData.sortOrder,
        updatedBy: user?.email || 'admin',
      };

      await updateDocumentPath(input);
      modal.success('Document path updated successfully');
      setShowEditModal(false);
      setSelectedPath(null);
      resetForm();
      await fetchDocumentPaths();
    } catch (err: any) {
      console.error('Error updating document path:', err);
      modal.error(err.message || 'Failed to update document path');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (path: DocumentPath) => {
    const confirmed = await modal.confirm({
      title: 'Deactivate Document Path',
      content: `Are you sure you want to deactivate "${getDisplayName(path.name)}"? This will hide it from document organization options.`,
      okText: 'Deactivate',
    });

    if (!confirmed) return;

    try {
      await deactivateDocumentPath(path.id, user?.email);
      modal.success('Document path deactivated');
      await fetchDocumentPaths();
    } catch (err: any) {
      console.error('Error deactivating document path:', err);
      modal.error(err.message || 'Failed to deactivate document path');
    }
  };

  const handleActivate = async (path: DocumentPath) => {
    try {
      await updateDocumentPath({
        id: path.id,
        isActive: true,
        updatedBy: user?.email || 'admin',
      });
      modal.success('Document path activated');
      await fetchDocumentPaths();
    } catch (err: any) {
      console.error('Error activating document path:', err);
      modal.error(err.message || 'Failed to activate document path');
    }
  };

  const handleDelete = async (path: DocumentPath) => {
    const confirmed = await modal.deleteConfirm(getDisplayName(path.name), {
      title: 'Delete Document Path',
      content: 'This action cannot be undone. Any document types using this path will lose their path reference.',
    });

    if (!confirmed) return;

    try {
      await deleteDocumentPath(path.id);
      modal.success('Document path deleted');
      await fetchDocumentPaths();
    } catch (err: any) {
      console.error('Error deleting document path:', err);
      modal.error(err.message || 'Failed to delete document path');
    }
  };

  const openEditModal = (path: DocumentPath) => {
    setSelectedPath(path);
    setFormData({
      name: path.name,
      description: path.description || '',
      sortOrder: path.sortOrder,
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      sortOrder: documentPaths.length > 0 ? Math.max(...documentPaths.map(p => p.sortOrder)) + 1 : 0,
    });
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  // Filter paths
  const filteredPaths = documentPaths.filter(path => {
    const matchesSearch = path.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (path.description?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesActive = showActiveOnly ? path.isActive : true;
    return matchesSearch && matchesActive;
  });

  // Group paths by root folder
  const groupedPaths = filteredPaths.reduce((acc, path) => {
    const rootFolder = path.name.split('/')[0].trim();
    if (!acc[rootFolder]) {
      acc[rootFolder] = [];
    }
    acc[rootFolder].push(path);
    return acc;
  }, {} as Record<string, DocumentPath[]>);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            <span className="text-sm">Back to Dashboard</span>
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Document Paths
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage folder structure for document organization
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/admin/document-types')}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <span className="material-symbols-outlined text-base">description</span>
                <span>Document Types</span>
              </button>
              <button
                onClick={openCreateModal}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors"
              >
                <span className="material-symbols-outlined text-base">add</span>
                <span>Add Path</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex gap-4 items-center">
          <div className="flex-1">
            <label className="flex flex-col min-w-40 h-12 w-full">
              <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
                <div className="text-gray-500 dark:text-gray-400 flex border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 items-center justify-center pl-4 rounded-l-lg border-r-0">
                  <span className="material-symbols-outlined">search</span>
                </div>
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 h-full placeholder:text-gray-500 dark:placeholder-gray-400 px-4 border-l-0 text-sm font-normal"
                  placeholder="Search paths..."
                />
              </div>
            </label>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showActiveOnly}
              onChange={(e) => setShowActiveOnly(e.target.checked)}
              className="w-4 h-4 text-primary bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded focus:ring-primary focus:ring-2"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Active only</span>
          </label>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading document paths...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined text-5xl text-red-500 mb-4">error</span>
              <p className="text-red-600 dark:text-red-400">{error}</p>
              <button
                onClick={fetchDocumentPaths}
                className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                Retry
              </button>
            </div>
          ) : filteredPaths.length === 0 ? (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined text-5xl text-gray-400 mb-4">folder_off</span>
              <p className="text-gray-600 dark:text-gray-400">No document paths found</p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-4 text-primary hover:text-primary/80 text-sm"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {Object.entries(groupedPaths).map(([rootFolder, paths]) => (
                <div key={rootFolder} className="p-4">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-primary">folder</span>
                    {rootFolder}
                    <span className="text-xs font-normal text-gray-500">({paths.length})</span>
                  </h3>
                  <div className="space-y-2 pl-6">
                    {paths.map((path) => (
                      <div
                        key={path.id}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          path.isActive
                            ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30'
                            : 'border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/50 opacity-60'
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-base text-gray-500 dark:text-gray-400">
                              {path.name.includes('/') ? 'subdirectory_arrow_right' : 'folder'}
                            </span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {path.name}
                            </span>
                            {!path.isActive && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                                Inactive
                              </span>
                            )}
                          </div>
                          {path.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-6">
                              {path.description}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 ml-6">
                            Sort Order: {path.sortOrder}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(path)}
                            className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                            title="Edit"
                          >
                            <span className="material-symbols-outlined text-base">edit</span>
                          </button>
                          {path.isActive ? (
                            <button
                              onClick={() => handleDeactivate(path)}
                              className="p-2 text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg"
                              title="Deactivate"
                            >
                              <span className="material-symbols-outlined text-base">visibility_off</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleActivate(path)}
                              className="p-2 text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg"
                              title="Activate"
                            >
                              <span className="material-symbols-outlined text-base">visibility</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(path)}
                            className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                            title="Delete"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Paths</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{documentPaths.length}</p>
              </div>
              <span className="material-symbols-outlined text-3xl text-blue-500">folder</span>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Paths</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {documentPaths.filter(p => p.isActive).length}
                </p>
              </div>
              <span className="material-symbols-outlined text-3xl text-green-500">check_circle</span>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Root Folders</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Object.keys(groupedPaths).length}
                </p>
              </div>
              <span className="material-symbols-outlined text-3xl text-purple-500">folder_open</span>
            </div>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add Document Path</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Path Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="e.g., 1 - Borrower Docs/1.1 - Company"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Use "/" to create nested folders (e.g., "Parent/Child")
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  rows={2}
                  placeholder="Optional description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sort Order
                </label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-base">add</span>
                      <span>Create Path</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedPath && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Document Path</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedPath(null);
                  }}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Path Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sort Order
                </label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedPath(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-base">save</span>
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentPathManagement;
