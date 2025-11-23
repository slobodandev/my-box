/**
 * User Management Page (Super Admin Only)
 * Allows super-admins to manage user roles
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllUsers, updateUserRole, User } from '@/services/dataconnect/userService';
import {
  getUserLoans,
  createLoan,
  updateLoan,
  deleteLoan,
  Loan,
  CreateLoanInput,
  UpdateLoanInput,
} from '@/services/dataconnect/loanService';
import {
  getUserMagicLinks,
  resendMagicLink,
  revokeMagicLink,
  extendMagicLink,
  getMagicLinkStatus,
  formatTimeUntilExpiry,
  MagicLink,
} from '@/services/dataconnect/magicLinkService';
import { useAuth } from '@/contexts/AuthContext';
import { CloudFunctionUrls, getCloudFunctionHeaders } from '@/config/cloudFunctions';

const AVAILABLE_ROLES = [
  { value: 'super-admin', label: 'Super Admin', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200', description: 'Full system access, can manage admins' },
  { value: 'admin', label: 'Admin', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200', description: 'Can manage borrowers and loans' },
  { value: 'borrower', label: 'Borrower', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200', description: 'Standard user access' },
];

export const UserManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const navigate = useNavigate();

  // Loan management state
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [userLoans, setUserLoans] = useState<{ [userId: string]: Loan[] }>({});
  const [showAddLoanModal, setShowAddLoanModal] = useState(false);
  const [showEditLoanModal, setShowEditLoanModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [loanFormData, setLoanFormData] = useState({
    loanNumber: '',
    borrowerName: '',
  });
  const [editFormData, setEditFormData] = useState({
    status: 'active',
    notes: '',
  });

  // Create User modal state
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [createUserFormData, setCreateUserFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'borrower',
    generateMagicLink: true,
    sendEmail: true,
  });
  const [creatingUser, setCreatingUser] = useState(false);
  const [createUserError, setCreateUserError] = useState<string | null>(null);

  // Magic link management state
  const [showMagicLinkModal, setShowMagicLinkModal] = useState(false);
  const [selectedUserForLink, setSelectedUserForLink] = useState<User | null>(null);
  const [magicLinkFormData, setMagicLinkFormData] = useState({
    borrowerEmail: '',
    sendToEmail: '',
    daysValid: 7,
    sendEmailImmediately: false,
  });
  const [generatingLink, setGeneratingLink] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [existingMagicLinks, setExistingMagicLinks] = useState<MagicLink[]>([]);
  const [loadingLinks, setLoadingLinks] = useState(false);
  const [resendingLinkId, setResendingLinkId] = useState<string | null>(null);
  const [revokingLinkId, setRevokingLinkId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const allUsers = await getAllUsers();
      // Sort: super-admins first, then admins, then borrowers, then by email
      allUsers.sort((a, b) => {
        const roleOrder = { 'super-admin': 0, 'admin': 1, 'borrower': 2 };
        const aOrder = roleOrder[a.role as keyof typeof roleOrder] ?? 3;
        const bOrder = roleOrder[b.role as keyof typeof roleOrder] ?? 3;
        if (aOrder !== bOrder) return aOrder - bOrder;
        return a.email.localeCompare(b.email);
      });
      setUsers(allUsers);

      // Fetch loan counts for all users
      const loansMap: { [userId: string]: Loan[] } = {};
      await Promise.all(
        allUsers.map(async (user) => {
          try {
            const loans = await getUserLoans(user.id);
            loansMap[user.id] = loans;
          } catch (err) {
            console.error(`Failed to fetch loans for user ${user.id}:`, err);
            loansMap[user.id] = [];
          }
        })
      );
      setUserLoans(loansMap);
    } catch (err) {
      setError('Failed to load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    // Prevent changing own role
    if (userId === currentUser?.id) {
      alert('You cannot change your own role');
      return;
    }

    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      return;
    }

    setUpdatingUserId(userId);
    try {
      await updateUserRole(userId, newRole);
      // Update local state
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      alert('Failed to update user role');
      console.error(err);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const getRoleInfo = (role: string) => {
    return AVAILABLE_ROLES.find(r => r.value === role) || AVAILABLE_ROLES[2];
  };

  // Loan management functions
  const handleToggleUserLoans = async (userId: string) => {
    if (expandedUserId === userId) {
      setExpandedUserId(null);
      return;
    }

    setExpandedUserId(userId);
    // Loans are already loaded during initial page load, so no need to fetch again
  };

  const handleOpenAddLoan = (userId: string, user: User) => {
    setSelectedUserId(userId);
    setLoanFormData({
      loanNumber: '',
      borrowerName: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email,
    });
    setShowAddLoanModal(true);
  };

  const handleAddLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;

    try {
      const input: CreateLoanInput = {
        userId: selectedUserId,
        loanNumber: loanFormData.loanNumber,
        borrowerName: loanFormData.borrowerName,
      };

      await createLoan(input);

      // Refresh loans for this user
      const loans = await getUserLoans(selectedUserId);
      setUserLoans(prev => ({ ...prev, [selectedUserId]: loans }));

      setShowAddLoanModal(false);
      setLoanFormData({
        loanNumber: '',
        borrowerName: '',
      });
    } catch (err) {
      console.error('Error adding loan:', err);
      alert('Failed to add loan');
    }
  };

  const handleOpenEditLoan = (loan: Loan) => {
    setSelectedLoan(loan);
    setEditFormData({
      status: loan.status || 'active',
      notes: '',
    });
    setShowEditLoanModal(true);
  };

  const handleEditLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoan) return;

    try {
      const input: UpdateLoanInput = {
        id: selectedLoan.id,
        status: editFormData.status,
        notes: editFormData.notes || undefined,
      };

      await updateLoan(input);

      // Refresh loans for this user
      const userId = users.find(u => userLoans[u.id]?.some(l => l.id === selectedLoan.id))?.id;
      if (userId) {
        const loans = await getUserLoans(userId);
        setUserLoans(prev => ({ ...prev, [userId]: loans }));
      }

      setShowEditLoanModal(false);
      setSelectedLoan(null);
    } catch (err) {
      console.error('Error updating loan:', err);
      alert('Failed to update loan');
    }
  };

  const handleDeleteLoan = async (loanId: string, userId: string) => {
    if (!confirm('Are you sure you want to delete this loan?')) {
      return;
    }

    try {
      await deleteLoan(loanId);

      // Refresh loans for this user
      const loans = await getUserLoans(userId);
      setUserLoans(prev => ({ ...prev, [userId]: loans }));
    } catch (err) {
      console.error('Error deleting loan:', err);
      alert('Failed to delete loan');
    }
  };

  // Create User function
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingUser(true);
    setCreateUserError(null);

    try {
      const headers = getCloudFunctionHeaders();

      // Call Cloud Function to create user and optionally generate magic link
      const response = await fetch(`${CloudFunctionUrls.createUserWithMagicLink}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          email: createUserFormData.email,
          firstName: createUserFormData.firstName || undefined,
          lastName: createUserFormData.lastName || undefined,
          role: createUserFormData.role,
          generateMagicLink: createUserFormData.generateMagicLink,
          sendEmail: createUserFormData.sendEmail,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create user');
      }

      alert(
        createUserFormData.generateMagicLink && data.magicLink
          ? `User created successfully! Magic link ${createUserFormData.sendEmail ? 'sent' : 'generated'}: ${data.magicLink}`
          : 'User created successfully!'
      );

      // Refresh users list
      await fetchUsers();

      // Reset form
      setCreateUserFormData({
        email: '',
        firstName: '',
        lastName: '',
        role: 'borrower',
        generateMagicLink: true,
        sendEmail: true,
      });
      setShowCreateUserModal(false);
    } catch (err: any) {
      console.error('Error creating user:', err);
      setCreateUserError(err.message);
    } finally {
      setCreatingUser(false);
    }
  };

  // Magic link management functions
  const handleOpenMagicLinkModal = async (user: User) => {
    setSelectedUserForLink(user);
    setMagicLinkFormData({
      borrowerEmail: user.email,
      sendToEmail: user.email, // Default to same email
      daysValid: 7,
      sendEmailImmediately: false,
    });
    setGeneratedLink(null);
    setLinkError(null);
    setShowMagicLinkModal(true);

    // Load existing magic links for this user
    setLoadingLinks(true);
    try {
      const links = await getUserMagicLinks(user.id);
      setExistingMagicLinks(links);
    } catch (err) {
      console.error('Error loading magic links:', err);
      setExistingMagicLinks([]);
    } finally {
      setLoadingLinks(false);
    }
  };

  const handleGenerateMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForLink) return;

    setGeneratingLink(true);
    setLinkError(null);
    setGeneratedLink(null);

    try {
      const response = await fetch(CloudFunctionUrls.generateAuthLink(), {
        method: 'POST',
        headers: getCloudFunctionHeaders(),
        body: JSON.stringify({
          email: magicLinkFormData.sendToEmail.toLowerCase().trim(),
          borrowerContactId: selectedUserForLink.id,
          expirationHours: magicLinkFormData.daysValid * 24,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to generate magic link: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to generate magic link');
      }

      setGeneratedLink(data.emailLink || null);
    } catch (err: any) {
      console.error('Error generating magic link:', err);
      setLinkError(err.message || 'Failed to generate magic link. Please try again.');
    } finally {
      setGeneratingLink(false);
    }
  };

  const copyLinkToClipboard = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      alert('Link copied to clipboard!');
    }
  };

  const handleResendMagicLink = async (linkId: string, linkUrl: string) => {
    if (!confirm('Are you sure you want to resend this magic link?')) {
      return;
    }

    setResendingLinkId(linkId);
    try {
      // Update send count in database
      await resendMagicLink(linkId);

      // TODO: In production, actually send the email here
      // For now, just copy to clipboard
      navigator.clipboard.writeText(linkUrl);
      alert('Link send count updated and copied to clipboard! In production, this would send an email.');

      // Refresh the links
      if (selectedUserForLink) {
        const links = await getUserMagicLinks(selectedUserForLink.id);
        setExistingMagicLinks(links);
      }
    } catch (err: any) {
      console.error('Error resending magic link:', err);
      alert(err.message || 'Failed to resend magic link');
    } finally {
      setResendingLinkId(null);
    }
  };

  const handleRevokeMagicLink = async (linkId: string) => {
    if (!confirm('Are you sure you want to revoke this magic link? This action cannot be undone.')) {
      return;
    }

    setRevokingLinkId(linkId);
    try {
      await revokeMagicLink(linkId, currentUser?.id, 'Manually revoked by admin');

      alert('Magic link has been revoked successfully.');

      // Refresh the links
      if (selectedUserForLink) {
        const links = await getUserMagicLinks(selectedUserForLink.id);
        setExistingMagicLinks(links);
      }
    } catch (err: any) {
      console.error('Error revoking magic link:', err);
      alert(err.message || 'Failed to revoke magic link');
    } finally {
      setRevokingLinkId(null);
    }
  };

  const handleExtendMagicLink = async (linkId: string) => {
    const daysToAdd = prompt('How many days would you like to extend this link?', '7');
    if (!daysToAdd || isNaN(parseInt(daysToAdd))) {
      return;
    }

    try {
      const newExpiryDate = new Date();
      newExpiryDate.setDate(newExpiryDate.getDate() + parseInt(daysToAdd));

      await extendMagicLink(linkId, newExpiryDate);

      alert(`Magic link extended by ${daysToAdd} days.`);

      // Refresh the links
      if (selectedUserForLink) {
        const links = await getUserMagicLinks(selectedUserForLink.id);
        setExistingMagicLinks(links);
      }
    } catch (err: any) {
      console.error('Error extending magic link:', err);
      alert(err.message || 'Failed to extend magic link');
    }
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.firstName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

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
                User Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage user roles and permissions
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowCreateUserModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors"
              >
                <span className="material-symbols-outlined text-base">person_add</span>
                <span>Create User</span>
              </button>
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg px-4 py-2">
                <p className="text-sm text-purple-800 dark:text-purple-200 flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">shield</span>
                  Super Admin Access
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200 flex items-start gap-2">
            <span className="material-symbols-outlined text-base mt-0.5">info</span>
            <span>
              <strong>Super Admins</strong> can manage all user roles including promoting users to admin.
              <strong> Regular Admins</strong> can view users but cannot change roles.
              You can also manage roles directly from Firebase Console → Data Connect → GraphQL Explorer using the <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">UpdateUserRole</code> mutation.
            </span>
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex gap-4">
          {/* Search */}
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
                  placeholder="Search by name or email..."
                />
              </div>
            </label>
          </div>

          {/* Role Filter */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-4 h-12 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="all">All Roles</option>
            {AVAILABLE_ROLES.map(role => (
              <option key={role.value} value={role.value}>{role.label}</option>
            ))}
          </select>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading users...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined text-5xl text-red-500 mb-4">error</span>
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined text-5xl text-gray-400 mb-4">person_search</span>
              <p className="text-gray-600 dark:text-gray-400">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider w-8">

                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Loans
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
                  {filteredUsers.map((user) => {
                    const roleInfo = getRoleInfo(user.role);
                    const isCurrentUser = user.id === currentUser?.id;
                    const isUpdating = updatingUserId === user.id;
                    const isExpanded = expandedUserId === user.id;
                    const loans = userLoans[user.id] || [];
                    const loanCount = loans.length;

                    return (
                      <React.Fragment key={user.id}>
                        <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleToggleUserLoans(user.id)}
                              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                            >
                              <span className="material-symbols-outlined text-base">
                                {isExpanded ? 'expand_more' : 'chevron_right'}
                              </span>
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary">
                                  {user.role === 'super-admin' ? 'shield' : user.role === 'admin' ? 'admin_panel_settings' : 'person'}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {user.firstName && user.lastName
                                    ? `${user.firstName} ${user.lastName}`
                                    : user.firstName || user.lastName || 'Unknown'}
                                  {isCurrentUser && (
                                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">(You)</span>
                                  )}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-gray-900 dark:text-white">{user.email}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleInfo.color}`}>
                              {roleInfo.label}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
                                {loanCount} {loanCount === 1 ? 'Loan' : 'Loans'}
                              </span>
                              <button
                                onClick={() => handleOpenAddLoan(user.id, user)}
                                className="text-primary hover:text-primary/80"
                                title="Add loan"
                              >
                                <span className="material-symbols-outlined text-base">add_circle</span>
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {user.isActive ? (
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
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenMagicLinkModal(user)}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
                                title="Generate magic link for this user"
                              >
                                <span className="material-symbols-outlined text-sm">link</span>
                                Generate Link
                              </button>
                              <select
                                value={user.role}
                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                disabled={isCurrentUser || isUpdating}
                                className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {AVAILABLE_ROLES.map(role => (
                                  <option key={role.value} value={role.value}>
                                    {role.label}
                                  </option>
                                ))}
                              </select>
                              {isUpdating && (
                                <span className="ml-2 inline-block animate-spin material-symbols-outlined text-primary">refresh</span>
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* Expanded Loan Rows */}
                        {isExpanded && (
                          <tr>
                            <td colSpan={7} className="px-6 py-4 bg-gray-50 dark:bg-gray-900/30">
                              {loans.length === 0 ? (
                                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                                  <p className="text-sm">No loans found for this user</p>
                                  <button
                                    onClick={() => handleOpenAddLoan(user.id, user)}
                                    className="mt-2 text-primary hover:text-primary/80 text-sm font-medium"
                                  >
                                    Add First Loan
                                  </button>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                                    Loans for {user.firstName || user.email}
                                  </h4>
                                  <div className="grid gap-3">
                                    {loans.map((loan) => (
                                      <div
                                        key={loan.id}
                                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                                      >
                                        <div className="flex items-center justify-between">
                                          <div className="flex-1 grid grid-cols-3 gap-4">
                                            <div>
                                              <p className="text-xs text-gray-500 dark:text-gray-400">Loan Number</p>
                                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                {loan.loanNumber}
                                              </p>
                                            </div>
                                            <div>
                                              <p className="text-xs text-gray-500 dark:text-gray-400">Borrower</p>
                                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                {loan.borrowerName || 'N/A'}
                                              </p>
                                            </div>
                                            <div>
                                              <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                                loan.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200' :
                                                loan.status === 'closed' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' :
                                                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200'
                                              }`}>
                                                {loan.status || 'active'}
                                              </span>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-2 ml-4">
                                            <button
                                              onClick={() => handleOpenEditLoan(loan)}
                                              className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                                              title="Edit loan"
                                            >
                                              <span className="material-symbols-outlined text-base">edit</span>
                                            </button>
                                            <button
                                              onClick={() => handleDeleteLoan(loan.id, user.id)}
                                              className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                              title="Delete loan"
                                            >
                                              <span className="material-symbols-outlined text-base">delete</span>
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {AVAILABLE_ROLES.map(role => {
            const count = users.filter(u => u.role === role.value).length;
            return (
              <div key={role.value} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{role.label}s</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{count}</p>
                  </div>
                  <span className={`material-symbols-outlined text-3xl ${role.color.split(' ')[0].replace('bg-', 'text-')}`}>
                    {role.value === 'super-admin' ? 'shield' : role.value === 'admin' ? 'admin_panel_settings' : 'group'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Loan Modal */}
      {showAddLoanModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Loan</h2>
                <button
                  onClick={() => setShowAddLoanModal(false)}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleAddLoan} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Loan Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={loanFormData.loanNumber}
                  onChange={(e) => setLoanFormData({ ...loanFormData, loanNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="e.g., LN-2025-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Borrower Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={loanFormData.borrowerName}
                  onChange={(e) => setLoanFormData({ ...loanFormData, borrowerName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowAddLoanModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-lg"
                >
                  Add Loan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Loan Modal */}
      {showEditLoanModal && selectedLoan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Loan</h2>
                <button
                  onClick={() => setShowEditLoanModal(false)}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Loan Number: {selectedLoan.loanNumber}
              </p>
            </div>

            <form onSubmit={handleEditLoan} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={editFormData.notes}
                  onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  rows={3}
                  placeholder="Add any notes about this loan..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowEditLoanModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-lg"
                >
                  Update Loan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Magic Link Modal */}
      {showMagicLinkModal && selectedUserForLink && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Magic Link Management
                </h2>
                <button
                  onClick={() => setShowMagicLinkModal(false)}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Manage passwordless authentication links for {selectedUserForLink.firstName && selectedUserForLink.lastName
                  ? `${selectedUserForLink.firstName} ${selectedUserForLink.lastName}`
                  : selectedUserForLink.email}
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Existing Links Section */}
              {loadingLinks ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-3 text-gray-600 dark:text-gray-400">Loading existing links...</span>
                </div>
              ) : existingMagicLinks.length > 0 ? (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Existing Links ({existingMagicLinks.length})
                  </h3>
                  <div className="space-y-3">
                    {existingMagicLinks.map((link) => {
                      const status = getMagicLinkStatus(link);
                      const timeInfo = formatTimeUntilExpiry(link);
                      const isProcessing = resendingLinkId === link.id || revokingLinkId === link.id;

                      return (
                        <div
                          key={link.id}
                          className="bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg">{status.icon}</span>
                                <span className={`text-sm font-medium ${status.color}`}>
                                  {status.text}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {timeInfo}
                                </span>
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                <p>
                                  <strong>Created:</strong>{' '}
                                  {new Date(link.createdAt).toLocaleDateString()}{' '}
                                  {new Date(link.createdAt).toLocaleTimeString()}
                                </p>
                                {link.sendCount > 0 && (
                                  <p>
                                    <strong>Sent:</strong> {link.sendCount} time{link.sendCount !== 1 ? 's' : ''}
                                    {link.lastSentAt && (
                                      <span>
                                        {' '}(last: {new Date(link.lastSentAt).toLocaleDateString()})
                                      </span>
                                    )}
                                  </p>
                                )}
                                {link.usedAt && (
                                  <p className="text-green-600 dark:text-green-400">
                                    <strong>Used:</strong>{' '}
                                    {new Date(link.usedAt).toLocaleDateString()}{' '}
                                    {new Date(link.usedAt).toLocaleTimeString()}
                                  </p>
                                )}
                                {link.revokedAt && (
                                  <p className="text-red-600 dark:text-red-400">
                                    <strong>Revoked:</strong>{' '}
                                    {new Date(link.revokedAt).toLocaleDateString()}
                                    {link.revokeReason && ` - ${link.revokeReason}`}
                                  </p>
                                )}
                                <p className="text-xs font-mono bg-white dark:bg-gray-800 px-2 py-1 rounded mt-2 break-all">
                                  {link.sendToEmail}
                                </p>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 ml-4">
                              {link.isActive && !link.usedAt && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => navigator.clipboard.writeText(link.magicLinkUrl).then(() => alert('Link copied!'))}
                                    className="px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                    title="Copy link"
                                    disabled={isProcessing}
                                  >
                                    <span className="material-symbols-outlined text-sm">content_copy</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleResendMagicLink(link.id, link.magicLinkUrl)}
                                    className="px-3 py-1.5 text-xs font-medium text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors disabled:opacity-50"
                                    title="Resend link"
                                    disabled={isProcessing}
                                  >
                                    {resendingLinkId === link.id ? (
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                                    ) : (
                                      <span className="material-symbols-outlined text-sm">send</span>
                                    )}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleExtendMagicLink(link.id)}
                                    className="px-3 py-1.5 text-xs font-medium text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors disabled:opacity-50"
                                    title="Extend expiry"
                                    disabled={isProcessing}
                                  >
                                    <span className="material-symbols-outlined text-sm">schedule</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRevokeMagicLink(link.id)}
                                    className="px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                                    title="Revoke link"
                                    disabled={isProcessing}
                                  >
                                    {revokingLinkId === link.id ? (
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                    ) : (
                                      <span className="material-symbols-outlined text-sm">block</span>
                                    )}
                                  </button>
                                </>
                              )}
                              {(!link.isActive || link.usedAt) && (
                                <span className="text-xs text-gray-400 italic">No actions available</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {/* Divider */}
              {existingMagicLinks.length > 0 && (
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                      or Generate New Link
                    </span>
                  </div>
                </div>
              )}

              {/* New Link Form */}
              <form onSubmit={handleGenerateMagicLink} className="space-y-4">
                {/* Borrower Email (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Borrower Email
                  </label>
                  <input
                    type="email"
                    value={magicLinkFormData.borrowerEmail}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-900/50 text-gray-700 dark:text-gray-400 cursor-not-allowed"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    This is the borrower's registered email address
                  </p>
                </div>

                {/* Send To Email */}
                <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Send To Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={magicLinkFormData.sendToEmail}
                  onChange={(e) => setMagicLinkFormData({ ...magicLinkFormData, sendToEmail: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="email@example.com"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  This email will be used for authentication. Defaults to borrower email but can be overridden.
                </p>
              </div>

              {/* Days Valid */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Valid For (Days) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="30"
                  value={magicLinkFormData.daysValid}
                  onChange={(e) => setMagicLinkFormData({ ...magicLinkFormData, daysValid: parseInt(e.target.value) || 7 })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Link will expire after this many days (1-30 days)
                </p>
              </div>

              {/* Send Email Immediately Checkbox */}
              <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <input
                  type="checkbox"
                  id="sendEmailImmediately"
                  checked={magicLinkFormData.sendEmailImmediately}
                  onChange={(e) => setMagicLinkFormData({ ...magicLinkFormData, sendEmailImmediately: e.target.checked })}
                  className="w-4 h-4 text-primary bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded focus:ring-primary focus:ring-2"
                />
                <label htmlFor="sendEmailImmediately" className="flex-1 text-sm text-gray-700 dark:text-gray-300">
                  <strong className="font-medium">Send email immediately</strong>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    If checked, the magic link will be sent to the specified email address automatically. Otherwise, you'll need to copy and send it manually.
                  </p>
                </label>
              </div>

              {/* Generated Link Display */}
              {generatedLink && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                        Generated Magic Link:
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400 break-all font-mono">
                        {generatedLink}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={copyLinkToClipboard}
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">content_copy</span>
                      Copy
                    </button>
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    <span className="material-symbols-outlined text-xs align-middle mr-1">info</span>
                    Link expires in {magicLinkFormData.daysValid} day{magicLinkFormData.daysValid !== 1 ? 's' : ''}. In production, this link would be sent via email.
                  </p>
                </div>
              )}

              {/* Error Display */}
              {linkError && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">error</span>
                    {linkError}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowMagicLinkModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  {generatedLink ? 'Done' : 'Cancel'}
                </button>
                {!generatedLink && (
                  <button
                    type="submit"
                    disabled={generatingLink}
                    className="px-6 py-2 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {generatingLink ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-base">link</span>
                        <span>Generate Link</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create New User</h2>
                <button
                  onClick={() => {
                    setShowCreateUserModal(false);
                    setCreateUserFormData({
                      email: '',
                      firstName: '',
                      lastName: '',
                      role: 'borrower',
                      generateMagicLink: true,
                      sendEmail: true,
                    });
                    setCreateUserError(null);
                  }}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={createUserFormData.email}
                  onChange={(e) => setCreateUserFormData({ ...createUserFormData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="user@example.com"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  User's email address (will be used for authentication)
                </p>
              </div>

              {/* First Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={createUserFormData.firstName}
                  onChange={(e) => setCreateUserFormData({ ...createUserFormData, firstName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="John"
                />
              </div>

              {/* Last Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={createUserFormData.lastName}
                  onChange={(e) => setCreateUserFormData({ ...createUserFormData, lastName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Doe"
                />
              </div>

              {/* Role Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  User Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={createUserFormData.role}
                  onChange={(e) => setCreateUserFormData({ ...createUserFormData, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  {AVAILABLE_ROLES.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label} - {role.description}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Select the appropriate role for this user
                </p>
              </div>

              {/* Generate Magic Link Checkbox */}
              <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <input
                  type="checkbox"
                  id="generateMagicLink"
                  checked={createUserFormData.generateMagicLink}
                  onChange={(e) => setCreateUserFormData({ ...createUserFormData, generateMagicLink: e.target.checked })}
                  className="w-4 h-4 mt-0.5 text-primary bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded focus:ring-primary focus:ring-2"
                />
                <div className="flex-1">
                  <label htmlFor="generateMagicLink" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                    Generate Magic Link and Send Welcome Email
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    If checked, a magic link will be generated and a welcome email will be sent to the user's email address with access instructions.
                  </p>

                  {/* Send Email Immediately Sub-option (only shown if generateMagicLink is true) */}
                  {createUserFormData.generateMagicLink && (
                    <div className="mt-3 pl-2 border-l-2 border-blue-300 dark:border-blue-700">
                      <div className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          id="sendEmail"
                          checked={createUserFormData.sendEmail}
                          onChange={(e) => setCreateUserFormData({ ...createUserFormData, sendEmail: e.target.checked })}
                          className="w-4 h-4 mt-0.5 text-primary bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded focus:ring-primary focus:ring-2"
                        />
                        <div className="flex-1">
                          <label htmlFor="sendEmail" className="text-xs font-medium text-gray-600 dark:text-gray-400 cursor-pointer">
                            Send email immediately
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Uncheck if you only want to generate the link without sending it
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Error Display */}
              {createUserError && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">error</span>
                    {createUserError}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateUserModal(false);
                    setCreateUserFormData({
                      email: '',
                      firstName: '',
                      lastName: '',
                      role: 'borrower',
                      generateMagicLink: true,
                      sendEmail: true,
                    });
                    setCreateUserError(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingUser}
                  className="px-6 py-2 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {creatingUser ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-base">person_add</span>
                      <span>Create User</span>
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

export default UserManagement;
