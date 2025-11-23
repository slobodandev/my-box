/**
 * User Service
 * Handles user-related operations with Data Connect
 */

import {
  listAllUsers as listAllUsersQuery,
  getUser as getUserQuery,
  updateUserRole as updateUserRoleMutation,
} from '../../../dataconnect/src/__generated/dataconnect';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  isActive: boolean;
  createdAt?: Date | string;
}

/**
 * Get all users (admin/super-admin only)
 * @returns Array of users
 */
export async function getAllUsers(): Promise<User[]> {
  try {
    const result = await listAllUsersQuery();

    if (!result.data?.users) {
      return [];
    }

    return result.data.users.map((user: any) => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    }));
  } catch (error) {
    console.error('Error fetching all users:', error);
    throw new Error('Failed to fetch users');
  }
}

/**
 * Get a single user by ID
 * @param userId - User ID (UUID)
 * @returns User object or null if not found
 */
export async function getUser(userId: string): Promise<User | null> {
  try {
    const result = await getUserQuery({
      id: userId,
    });

    if (!result.data?.user) {
      return null;
    }

    const user = result.data.user;
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

/**
 * Update user role (super-admin only in UI, anyone in GraphQL playground)
 * @param userId - User ID (UUID)
 * @param role - New role (e.g., 'super-admin', 'admin', 'borrower')
 */
export async function updateUserRole(userId: string, role: string): Promise<void> {
  try {
    await updateUserRoleMutation({
      userId,
      role,
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    throw new Error('Failed to update user role');
  }
}
