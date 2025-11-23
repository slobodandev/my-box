/**
 * Magic Link Service
 * Handles magic link-related operations with Data Connect
 */

import {
  getUserMagicLinks as getUserMagicLinksQuery,
  getActiveMagicLinks as getActiveMagicLinksQuery,
  getMagicLink as getMagicLinkQuery,
  getMagicLinkStats as getMagicLinkStatsQuery,
  createMagicLink as createMagicLinkMutation,
  updateMagicLinkSendCount as updateMagicLinkSendCountMutation,
  revokeMagicLink as revokeMagicLinkMutation,
  markMagicLinkUsed as markMagicLinkUsedMutation,
  extendMagicLink as extendMagicLinkMutation,
} from '../../../dataconnect/src/__generated/dataconnect';

export interface MagicLink {
  id: string;
  userId: string;
  borrowerEmail: string;
  sendToEmail: string;
  magicLinkUrl: string;
  sessionId?: string;
  expiresAt: Date | string;
  createdAt: Date | string;
  createdBy?: string;
  sentAt?: Date | string;
  lastSentAt?: Date | string;
  sendCount: number;
  usedAt?: Date | string;
  isActive: boolean;
  revokedAt?: Date | string;
  revokedBy?: string;
  revokeReason?: string;
}

export interface CreateMagicLinkInput {
  userId: string;
  borrowerEmail: string;
  sendToEmail: string;
  magicLinkUrl: string;
  sessionId?: string;
  expiresAt: Date;
  createdBy?: string;
  sentAt?: Date;
}

export interface MagicLinkStats {
  totalLinks: number;
  activeLinks: number;
  expiredLinks: number;
  usedLinks: number;
  unusedLinks: number;
}

/**
 * Get all magic links for a user
 * @param userId - User ID (UUID)
 * @returns Array of magic links
 */
export async function getUserMagicLinks(userId: string): Promise<MagicLink[]> {
  try {
    const result = await getUserMagicLinksQuery({ userId });

    if (!result.data?.magicLinks) {
      return [];
    }

    return result.data.magicLinks.map((link: any) => ({
      id: link.id,
      userId: link.userId,
      borrowerEmail: link.borrowerEmail,
      sendToEmail: link.sendToEmail,
      magicLinkUrl: link.magicLinkUrl,
      sessionId: link.sessionId || undefined,
      expiresAt: link.expiresAt,
      createdAt: link.createdAt,
      createdBy: link.createdBy || undefined,
      sentAt: link.sentAt || undefined,
      lastSentAt: link.lastSentAt || undefined,
      sendCount: link.sendCount || 0,
      usedAt: link.usedAt || undefined,
      isActive: link.isActive,
      revokedAt: link.revokedAt || undefined,
      revokedBy: link.revokedBy || undefined,
      revokeReason: link.revokeReason || undefined,
    }));
  } catch (error) {
    console.error('Error fetching user magic links:', error);
    throw new Error('Failed to fetch magic links');
  }
}

/**
 * Get active magic links for a user
 * @param userId - User ID (UUID)
 * @returns Array of active magic links
 */
export async function getActiveMagicLinks(userId: string): Promise<MagicLink[]> {
  try {
    const result = await getActiveMagicLinksQuery({ userId });

    if (!result.data?.magicLinks) {
      return [];
    }

    return result.data.magicLinks.map((link: any) => ({
      id: link.id,
      userId: link.userId,
      borrowerEmail: link.borrowerEmail,
      sendToEmail: link.sendToEmail,
      magicLinkUrl: link.magicLinkUrl,
      sessionId: link.sessionId || undefined,
      expiresAt: link.expiresAt,
      createdAt: link.createdAt,
      sentAt: link.sentAt || undefined,
      lastSentAt: link.lastSentAt || undefined,
      sendCount: link.sendCount || 0,
      usedAt: link.usedAt || undefined,
      isActive: true,
    }));
  } catch (error) {
    console.error('Error fetching active magic links:', error);
    throw new Error('Failed to fetch active magic links');
  }
}

/**
 * Get a single magic link by ID
 * @param id - Magic link ID (UUID)
 * @returns Magic link details
 */
export async function getMagicLink(id: string): Promise<MagicLink | null> {
  try {
    const result = await getMagicLinkQuery({ id });

    if (!result.data?.magicLink) {
      return null;
    }

    const link = result.data.magicLink;
    return {
      id: link.id,
      userId: link.userId,
      borrowerEmail: link.borrowerEmail,
      sendToEmail: link.sendToEmail,
      magicLinkUrl: link.magicLinkUrl,
      sessionId: link.sessionId || undefined,
      expiresAt: link.expiresAt,
      createdAt: link.createdAt,
      createdBy: link.createdBy || undefined,
      sentAt: link.sentAt || undefined,
      lastSentAt: link.lastSentAt || undefined,
      sendCount: link.sendCount || 0,
      usedAt: link.usedAt || undefined,
      isActive: link.isActive,
      revokedAt: link.revokedAt || undefined,
      revokedBy: link.revokedBy || undefined,
      revokeReason: link.revokeReason || undefined,
    };
  } catch (error) {
    console.error('Error fetching magic link:', error);
    throw new Error('Failed to fetch magic link');
  }
}

/**
 * Create a new magic link
 * @param input - Magic link creation data
 * @returns Created magic link ID
 */
export async function createMagicLink(input: CreateMagicLinkInput): Promise<string> {
  try {
    await createMagicLinkMutation({
      userId: input.userId,
      borrowerEmail: input.borrowerEmail,
      sendToEmail: input.sendToEmail,
      magicLinkUrl: input.magicLinkUrl,
      sessionId: input.sessionId || null,
      expiresAt: input.expiresAt.toISOString(),
      createdBy: input.createdBy || null,
      sentAt: input.sentAt ? input.sentAt.toISOString() : null,
    });

    // Note: The mutation might not return the ID directly
    // You may need to query the user's magic links after creation
    return 'created'; // Placeholder
  } catch (error) {
    console.error('Error creating magic link:', error);
    throw new Error('Failed to create magic link');
  }
}

/**
 * Update send count for a magic link (when resending)
 * @param id - Magic link ID
 * @param sendCount - New send count
 */
export async function resendMagicLink(id: string): Promise<void> {
  try {
    // First, get the current link to increment send count
    const link = await getMagicLink(id);
    if (!link) {
      throw new Error('Magic link not found');
    }

    await updateMagicLinkSendCountMutation({
      id,
      sendCount: link.sendCount + 1,
      lastSentAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error resending magic link:', error);
    throw new Error('Failed to resend magic link');
  }
}

/**
 * Revoke a magic link
 * @param id - Magic link ID
 * @param revokedBy - User ID who revoked the link
 * @param reason - Reason for revocation
 */
export async function revokeMagicLink(
  id: string,
  revokedBy?: string,
  reason?: string
): Promise<void> {
  try {
    await revokeMagicLinkMutation({
      id,
      revokedAt: new Date().toISOString(),
      revokedBy: revokedBy || null,
      revokeReason: reason || null,
    });
  } catch (error) {
    console.error('Error revoking magic link:', error);
    throw new Error('Failed to revoke magic link');
  }
}

/**
 * Mark a magic link as used (called when user signs in)
 * @param sessionId - Session ID from the magic link
 */
export async function markMagicLinkUsed(sessionId: string): Promise<void> {
  try {
    await markMagicLinkUsedMutation({
      sessionId,
      usedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error marking magic link as used:', error);
    throw new Error('Failed to mark magic link as used');
  }
}

/**
 * Extend the expiry date of a magic link
 * @param id - Magic link ID
 * @param newExpiryDate - New expiry date
 */
export async function extendMagicLink(id: string, newExpiryDate: Date): Promise<void> {
  try {
    await extendMagicLinkMutation({
      id,
      expiresAt: newExpiryDate.toISOString(),
    });
  } catch (error) {
    console.error('Error extending magic link:', error);
    throw new Error('Failed to extend magic link');
  }
}

/**
 * Get magic link statistics
 * @returns Magic link stats
 */
export async function getMagicLinkStats(): Promise<MagicLinkStats> {
  try {
    const result = await getMagicLinkStatsQuery();

    if (!result.data?.magicLinks) {
      return {
        totalLinks: 0,
        activeLinks: 0,
        expiredLinks: 0,
        usedLinks: 0,
        unusedLinks: 0,
      };
    }

    const links = result.data.magicLinks;
    const now = new Date();

    const stats = {
      totalLinks: links.length,
      activeLinks: links.filter((l: any) => l.isActive).length,
      expiredLinks: links.filter((l: any) => new Date(l.expiresAt) < now && !l.usedAt).length,
      usedLinks: links.filter((l: any) => l.usedAt).length,
      unusedLinks: links.filter((l: any) => !l.usedAt).length,
    };

    return stats;
  } catch (error) {
    console.error('Error fetching magic link stats:', error);
    throw new Error('Failed to fetch magic link stats');
  }
}

/**
 * Check if a magic link is expired
 * @param link - Magic link object
 * @returns True if expired
 */
export function isMagicLinkExpired(link: MagicLink): boolean {
  const expiryDate = new Date(link.expiresAt);
  return expiryDate < new Date();
}

/**
 * Get time remaining until expiry
 * @param link - Magic link object
 * @returns Milliseconds until expiry (negative if expired)
 */
export function getTimeUntilExpiry(link: MagicLink): number {
  const expiryDate = new Date(link.expiresAt);
  return expiryDate.getTime() - new Date().getTime();
}

/**
 * Format time until expiry as a human-readable string
 * @param link - Magic link object
 * @returns Formatted string (e.g., "2 days", "3 hours", "expired")
 */
export function formatTimeUntilExpiry(link: MagicLink): string {
  const ms = getTimeUntilExpiry(link);

  if (ms < 0) {
    const daysAgo = Math.floor(Math.abs(ms) / (1000 * 60 * 60 * 24));
    if (daysAgo > 0) {
      return `Expired ${daysAgo} day${daysAgo !== 1 ? 's' : ''} ago`;
    }
    return 'Expired';
  }

  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) {
    return `Expires in ${days} day${days !== 1 ? 's' : ''}`;
  }
  if (hours > 0) {
    return `Expires in ${hours} hour${hours !== 1 ? 's' : ''}`;
  }
  return 'Expires soon';
}

/**
 * Get status icon/indicator for a magic link
 * @param link - Magic link object
 * @returns Status indicator object
 */
export function getMagicLinkStatus(link: MagicLink): {
  icon: string;
  color: string;
  text: string;
} {
  if (link.usedAt) {
    return {
      icon: '✅',
      color: 'text-green-600 dark:text-green-400',
      text: 'Used',
    };
  }

  if (!link.isActive) {
    return {
      icon: '🔴',
      color: 'text-red-600 dark:text-red-400',
      text: 'Revoked',
    };
  }

  if (isMagicLinkExpired(link)) {
    return {
      icon: '🔴',
      color: 'text-red-600 dark:text-red-400',
      text: 'Expired',
    };
  }

  const timeRemaining = getTimeUntilExpiry(link);
  const twoDays = 2 * 24 * 60 * 60 * 1000;

  if (timeRemaining < twoDays) {
    return {
      icon: '🟡',
      color: 'text-yellow-600 dark:text-yellow-400',
      text: 'Expiring soon',
    };
  }

  return {
    icon: '🟢',
    color: 'text-green-600 dark:text-green-400',
    text: 'Active',
  };
}
