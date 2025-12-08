/**
 * Document Master Management Page (Admin Only)
 * Allows admins to manage document types and their path assignments
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  listDocumentMasters,
  createDocumentMaster,
  updateDocumentMaster,
  deactivateDocumentMaster,
  deleteDocumentMaster,
  DocumentMaster,
  CreateDocumentMasterInput,
  UpdateDocumentMasterInput,
} from '@/services/dataconnect/documentMasterService';
import {
  listActiveDocumentPaths,
  DocumentPath,
} from '@/services/dataconnect/documentPathService';
import { useAuth } from '@/contexts/AuthContext';
import { modal } from '@/utils/modal';

export const DocumentMasterManagement: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [documentMasters, setDocumentMasters] = useState<DocumentMaster[]>([]);
  const [documentPaths, setDocumentPaths] = useState<DocumentPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [filterPathId, setFilterPathId] = useState<string>('all');

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMaster, setSelectedMaster] = useState<DocumentMaster | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    documentPathId: '',
    description: '',
    sortOrder: 0,
    isSystemGenerated: false,
    reviewRequired: false,
    isVersioningEnabled: false,
    namingConvention: '',
    display: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [masters, paths] = await Promise.all([
        listDocumentMasters(),
        listActiveDocumentPaths(),
      ]);
      masters.sort((a, b) => a.sortOrder - b.sortOrder);
      setDocumentMasters(masters);
      setDocumentPaths(paths);
    } catch (err) {
      setError('Failed to load document types');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const input: CreateDocumentMasterInput = {
        name: formData.name.trim(),
        documentPathId: formData.documentPathId || undefined,
        description: formData.description.trim() || undefined,
        sortOrder: formData.sortOrder,
        isSystemGenerated: formData.isSystemGenerated,
        reviewRequired: formData.reviewRequired,
        isVersioningEnabled: formData.isVersioningEnabled,
        namingConvention: formData.namingConvention.trim() || undefined,
        display: formData.display.trim() || undefined,
        createdBy: user?.email || 'admin',
      };

      await createDocumentMaster(input);
      modal.success('Document type created successfully');
      setShowCreateModal(false);
      resetForm();
      await fetchData();
    } catch (err: any) {
      console.error('Error creating document type:', err);
      modal.error(err.message || 'Failed to create document type');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaster) return;

    setSaving(true);

    try {
      const input: UpdateDocumentMasterInput = {
        id: selectedMaster.id,
        name: formData.name.trim(),
        documentPathId: formData.documentPathId || undefined,
        description: formData.description.trim() || undefined,
        sortOrder: formData.sortOrder,
        isSystemGenerated: formData.isSystemGenerated,
        reviewRequired: formData.reviewRequired,
        isVersioningEnabled: formData.isVersioningEnabled,
        namingConvention: formData.namingConvention.trim() || undefined,
        display: formData.display.trim() || undefined,
        updatedBy: user?.email || 'admin',
      };

      await updateDocumentMaster(input);
      modal.success('Document type updated successfully');
      setShowEditModal(false);
      setSelectedMaster(null);
      resetForm();
      await fetchData();
    } catch (err: any) {
      console.error('Error updating document type:', err);
      modal.error(err.message || 'Failed to update document type');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (master: DocumentMaster) => {
    const confirmed = await modal.confirm({
      title: 'Deactivate Document Type',
      content: `Are you sure you want to deactivate "${master.name}"? This will hide it from document type options.`,
      okText: 'Deactivate',
    });

    if (!confirmed) return;

    try {
      await deactivateDocumentMaster(master.id, user?.email);
      modal.success('Document type deactivated');
      await fetchData();
    } catch (err: any) {
      console.error('Error deactivating document type:', err);
      modal.error(err.message || 'Failed to deactivate document type');
    }
  };

  const handleActivate = async (master: DocumentMaster) => {
    try {
      await updateDocumentMaster({
        id: master.id,
        isActive: true,
        updatedBy: user?.email || 'admin',
      });
      modal.success('Document type activated');
      await fetchData();
    } catch (err: any) {
      console.error('Error activating document type:', err);
      modal.error(err.message || 'Failed to activate document type');
    }
  };

  const handleDelete = async (master: DocumentMaster) => {
    const confirmed = await modal.deleteConfirm(master.name, {
      title: 'Delete Document Type',
      content: 'This action cannot be undone.',
    });

    if (!confirmed) return;

    try {
      await deleteDocumentMaster(master.id);
      modal.success('Document type deleted');
      await fetchData();
    } catch (err: any) {
      console.error('Error deleting document type:', err);
      modal.error(err.message || 'Failed to delete document type');
    }
  };

  const openEditModal = (master: DocumentMaster) => {
    setSelectedMaster(master);
    setFormData({
      name: master.name,
      documentPathId: master.documentPathId || '',
      description: master.description || '',
      sortOrder: master.sortOrder,
      isSystemGenerated: master.isSystemGenerated,
      reviewRequired: master.reviewRequired,
      isVersioningEnabled: master.isVersioningEnabled,
      namingConvention: master.namingConvention || '',
      display: master.display || '',
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      documentPathId: '',
      description: '',
      sortOrder: documentMasters.length > 0 ? Math.max(...documentMasters.map(m => m.sortOrder)) + 1 : 0,
      isSystemGenerated: false,
      reviewRequired: false,
      isVersioningEnabled: false,
      namingConvention: '',
      display: '',
    });
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  // Filter masters
  const filteredMasters = documentMasters.filter(master => {
    const matchesSearch = master.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (master.description?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesActive = showActiveOnly ? master.isActive : true;
    const matchesPath = filterPathId === 'all' ||
      (filterPathId === 'none' && !master.documentPathId) ||
      master.documentPathId === filterPathId;
    return matchesSearch && matchesActive && matchesPath;
  });

  // Group by path (for future use in grouped view)
  const _groupedMasters = filteredMasters.reduce((acc, master) => {
    const pathName = master.documentPath?.name || 'Unassigned';
    if (!acc[pathName]) {
      acc[pathName] = [];
    }
    acc[pathName].push(master);
    return acc;
  }, {} as Record<string, DocumentMaster[]>);
  void _groupedMasters;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
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
                Document Types
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage document types and their folder assignments
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/admin/document-paths')}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <span className="material-symbols-outlined text-base">folder</span>
                <span>Document Paths</span>
              </button>
              <button
                onClick={openCreateModal}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors"
              >
                <span className="material-symbols-outlined text-base">add</span>
                <span>Add Type</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-64">
            <label className="flex flex-col min-w-40 h-12 w-full">
              <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
                <div className="text-gray-500 dark:text-gray-400 flex border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 items-center justify-center pl-4 rounded-l-lg border-r-0">
                  <span className="material-symbols-outlined">search</span>
                </div>
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 h-full placeholder:text-gray-500 dark:placeholder-gray-400 px-4 border-l-0 text-sm font-normal"
                  placeholder="Search document types..."
                />
              </div>
            </label>
          </div>
          <select
            value={filterPathId}
            onChange={(e) => setFilterPathId(e.target.value)}
            className="h-12 px-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="all">All Paths</option>
            <option value="none">Unassigned</option>
            {documentPaths.map(path => (
              <option key={path.id} value={path.id}>{path.name}</option>
            ))}
          </select>
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
              <p className="text-gray-600 dark:text-gray-400">Loading document types...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined text-5xl text-red-500 mb-4">error</span>
              <p className="text-red-600 dark:text-red-400">{error}</p>
              <button
                onClick={fetchData}
                className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                Retry
              </button>
            </div>
          ) : filteredMasters.length === 0 ? (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined text-5xl text-gray-400 mb-4">description</span>
              <p className="text-gray-600 dark:text-gray-400">No document types found</p>
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Document Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Folder Path
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Flags
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Sort
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredMasters.map((master) => (
                    <tr
                      key={master.id}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 ${!master.isActive ? 'opacity-60' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {master.name}
                          </p>
                          {master.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {master.description}
                            </p>
                          )}
                          {master.display && (
                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                              Display: {master.display}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {master.documentPath ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
                            <span className="material-symbols-outlined text-xs mr-1">folder</span>
                            {master.documentPath.name}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 dark:text-gray-500 italic">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {master.isSystemGenerated && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200">
                              System
                            </span>
                          )}
                          {master.reviewRequired && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200">
                              Review
                            </span>
                          )}
                          {master.isVersioningEnabled && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200">
                              Versioning
                            </span>
                          )}
                          {!master.isSystemGenerated && !master.reviewRequired && !master.isVersioningEnabled && (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {master.sortOrder}
                      </td>
                      <td className="px-6 py-4">
                        {master.isActive ? (
                          <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <span className="material-symbols-outlined text-sm">cancel</span>
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(master)}
                            className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                            title="Edit"
                          >
                            <span className="material-symbols-outlined text-base">edit</span>
                          </button>
                          {master.isActive ? (
                            <button
                              onClick={() => handleDeactivate(master)}
                              className="p-2 text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg"
                              title="Deactivate"
                            >
                              <span className="material-symbols-outlined text-base">visibility_off</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleActivate(master)}
                              className="p-2 text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg"
                              title="Activate"
                            >
                              <span className="material-symbols-outlined text-base">visibility</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(master)}
                            className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                            title="Delete"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Types</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{documentMasters.length}</p>
              </div>
              <span className="material-symbols-outlined text-3xl text-blue-500">description</span>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Types</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {documentMasters.filter(m => m.isActive).length}
                </p>
              </div>
              <span className="material-symbols-outlined text-3xl text-green-500">check_circle</span>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">System Generated</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {documentMasters.filter(m => m.isSystemGenerated).length}
                </p>
              </div>
              <span className="material-symbols-outlined text-3xl text-purple-500">settings</span>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Unassigned</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {documentMasters.filter(m => !m.documentPathId).length}
                </p>
              </div>
              <span className="material-symbols-outlined text-3xl text-orange-500">folder_off</span>
            </div>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add Document Type</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Document Type Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="e.g., Loan Agreement"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Folder Path
                  </label>
                  <select
                    value={formData.documentPathId}
                    onChange={(e) => setFormData({ ...formData, documentPathId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="">-- No Path (Unassigned) --</option>
                    {documentPaths.map(path => (
                      <option key={path.id} value={path.id}>{path.name}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
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
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={formData.display}
                    onChange={(e) => setFormData({ ...formData, display: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Optional display override..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Naming Convention
                  </label>
                  <input
                    type="text"
                    value={formData.namingConvention}
                    onChange={(e) => setFormData({ ...formData, namingConvention: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="e.g., {LoanNumber}_{DocType}"
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

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isSystemGenerated}
                      onChange={(e) => setFormData({ ...formData, isSystemGenerated: e.target.checked })}
                      className="w-4 h-4 text-primary bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded focus:ring-primary focus:ring-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">System Generated</span>
                  </label>
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.reviewRequired}
                      onChange={(e) => setFormData({ ...formData, reviewRequired: e.target.checked })}
                      className="w-4 h-4 text-primary bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded focus:ring-primary focus:ring-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Review Required</span>
                  </label>
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isVersioningEnabled}
                      onChange={(e) => setFormData({ ...formData, isVersioningEnabled: e.target.checked })}
                      className="w-4 h-4 text-primary bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded focus:ring-primary focus:ring-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Enable Versioning</span>
                  </label>
                </div>
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
                      <span>Create Type</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedMaster && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Document Type</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedMaster(null);
                  }}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Document Type Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Folder Path
                  </label>
                  <select
                    value={formData.documentPathId}
                    onChange={(e) => setFormData({ ...formData, documentPathId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="">-- No Path (Unassigned) --</option>
                    {documentPaths.map(path => (
                      <option key={path.id} value={path.id}>{path.name}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
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
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={formData.display}
                    onChange={(e) => setFormData({ ...formData, display: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Naming Convention
                  </label>
                  <input
                    type="text"
                    value={formData.namingConvention}
                    onChange={(e) => setFormData({ ...formData, namingConvention: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
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

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isSystemGenerated}
                      onChange={(e) => setFormData({ ...formData, isSystemGenerated: e.target.checked })}
                      className="w-4 h-4 text-primary bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded focus:ring-primary focus:ring-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">System Generated</span>
                  </label>
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.reviewRequired}
                      onChange={(e) => setFormData({ ...formData, reviewRequired: e.target.checked })}
                      className="w-4 h-4 text-primary bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded focus:ring-primary focus:ring-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Review Required</span>
                  </label>
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isVersioningEnabled}
                      onChange={(e) => setFormData({ ...formData, isVersioningEnabled: e.target.checked })}
                      className="w-4 h-4 text-primary bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded focus:ring-primary focus:ring-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Enable Versioning</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedMaster(null);
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

export default DocumentMasterManagement;
