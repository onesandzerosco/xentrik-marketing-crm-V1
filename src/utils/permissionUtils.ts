
// File permission utility functions
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { DEFAULT_PERMISSIONS, RolePermission } from './permissionModels';

/**
 * Checks if a user's role has a specific permission
 */
export const hasPermission = (permissions: RolePermission[], userRole: string, userRoles: string[], action: 'preview' | 'edit' | 'upload' | 'download' | 'delete'): boolean => {
  // Admin always has all permissions
  if (userRole === "Admin") return true;
  
  // Check if primary role has the permission
  const primaryRolePermission = permissions.find(p => p.rolename === userRole);
  if (primaryRolePermission && primaryRolePermission[action]) return true;

  // Check if any additional roles have the permission
  return userRoles.some(role => {
    const rolePermission = permissions.find(p => p.rolename === role);
    return rolePermission ? rolePermission[action] : false;
  });
};

/**
 * Checks if a user can manage tags (create, edit, delete tags)
 */
export const canManageTags = (userRole: string, userRoles: string[]): boolean => {
  // Allow Admin, VA, Creator, and Manager to manage tags
  const allowedRoles = ["Admin", "VA", "Creator", "Manager"];
  return userRole && allowedRoles.includes(userRole) || 
         userRoles.some(role => allowedRoles.includes(role));
};

/**
 * Hook to get user permissions for file operations
 * @returns Object with permission flags
 */
export const useFilePermissions = () => {
  const { userRole, userRoles } = useAuth();
  
  const { data: permissions = DEFAULT_PERMISSIONS } = useQuery({
    queryKey: ['file-permissions'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('role_permissions')
          .select('*');
        
        if (error) throw error;
        
        // If we have permissions in the database, use those. Otherwise, use defaults
        return data && data.length > 0 ? data as RolePermission[] : DEFAULT_PERMISSIONS;
      } catch (error) {
        console.error('Error fetching permissions:', error);
        return DEFAULT_PERMISSIONS;
      }
    }
  });

  // Allow certain roles to manage folders directly
  const allowedRoles = ["Admin", "VA", "Creator"];
  const canManageFoldersByRole = userRole && allowedRoles.includes(userRole) || 
                               userRoles.some(role => allowedRoles.includes(role));

  return {
    canEdit: hasPermission(permissions, userRole, userRoles, 'edit'),
    canDelete: hasPermission(permissions, userRole, userRoles, 'delete'),
    canUpload: hasPermission(permissions, userRole, userRoles, 'upload'),
    canManageFolders: canManageFoldersByRole || hasPermission(permissions, userRole, userRoles, 'upload'),
    canDownload: hasPermission(permissions, userRole, userRoles, 'download'),
    canPreview: hasPermission(permissions, userRole, userRoles, 'preview'),
    canManageTags: canManageTags(userRole, userRoles)
  };
};
