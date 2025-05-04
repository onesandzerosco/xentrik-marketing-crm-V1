
import { User } from '@supabase/supabase-js';

export interface MediaPermissions {
  canUpload: boolean;
  canDownload: boolean;
  canDelete: boolean;
  canEdit: boolean;
}

/**
 * Determines user permissions for media operations based on their role
 * 
 * Permission rules:
 * - Chatter: can download only
 * - VA: can upload, download, and edit descriptions
 * - Creator: can upload, download, edit descriptions, and delete their own files
 * - Admin: can do everything
 */
export const getMediaPermissions = (
  userRole: string | undefined,
  userRoles: string[] | undefined,
  isCreatorSelf: boolean = false
): MediaPermissions => {
  // Default permissions (minimal access)
  const permissions: MediaPermissions = {
    canUpload: false,
    canDownload: true, // Everyone can download
    canDelete: false,
    canEdit: false
  };

  // Check primary role
  const primaryRole = userRole || '';
  const allRoles = [...(userRoles || [])];
  if (primaryRole) allRoles.push(primaryRole);
  
  // If user has Admin role, they can do everything
  if (allRoles.includes('Admin')) {
    permissions.canUpload = true;
    permissions.canDelete = true;
    permissions.canEdit = true;
    return permissions;
  }

  // Creators can edit, upload, download, and delete their own files
  if (isCreatorSelf) {
    permissions.canUpload = true;
    permissions.canDelete = true;
    permissions.canEdit = true;
    return permissions;
  }

  // VAs can upload, download, and edit descriptions
  if (allRoles.includes('VA')) {
    permissions.canUpload = true;
    permissions.canEdit = true;
    return permissions;
  }

  // Chatters can only download
  if (allRoles.includes('Chatter')) {
    return permissions; // Already has default permissions (download only)
  }

  return permissions;
};
