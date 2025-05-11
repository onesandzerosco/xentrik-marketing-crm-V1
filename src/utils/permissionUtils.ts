
// File permission utility functions
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { DEFAULT_PERMISSIONS, Permission } from './permissionModels';

/**
 * Checks if a user's role has a specific permission
 */
export const hasPermission = (permissions: Permission[], userRole: string, userRoles: string[], action: string): boolean => {
  // Admin always has all permissions
  if (userRole === "Admin") return true;
  
  // Check if primary role has the permission
  const primaryRolePermission = permissions.find(p => p.role === userRole && p.action === action);
  if (primaryRolePermission && primaryRolePermission.allowed) return true;

  // Check if any additional roles have the permission
  return userRoles.some(role => {
    const rolePermission = permissions.find(p => p.role === role && p.action === action);
    return rolePermission ? rolePermission.allowed : false;
  });
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
          .from('permissions')
          .select('*')
          .eq('module', 'SharedFiles');
        
        if (error) throw error;
        
        // If we have permissions in the database, use those. Otherwise, use defaults
        return data && data.length > 0 ? data : DEFAULT_PERMISSIONS;
      } catch (error) {
        console.error('Error fetching permissions:', error);
        return DEFAULT_PERMISSIONS;
      }
    }
  });

  return {
    canEdit: hasPermission(permissions, userRole, userRoles, 'canEditDescription'),
    canDelete: hasPermission(permissions, userRole, userRoles, 'canDelete'),
    canUpload: hasPermission(permissions, userRole, userRoles, 'canUpload'),
    canManageFolders: hasPermission(permissions, userRole, userRoles, 'canUpload'), // Using same permission as upload for folder management
    canDownload: hasPermission(permissions, userRole, userRoles, 'canDownload'),
    canPreview: hasPermission(permissions, userRole, userRoles, 'canPreview')
  };
};
