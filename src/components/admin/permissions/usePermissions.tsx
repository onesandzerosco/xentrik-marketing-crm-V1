
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DEFAULT_PERMISSIONS, RolePermission } from '@/utils/permissionModels';

export const usePermissions = () => {
  const queryClient = useQueryClient();
  const [isInitialized, setIsInitialized] = useState(false);

  // Fetch permissions from the database
  const { data: permissions = DEFAULT_PERMISSIONS, isLoading } = useQuery({
    queryKey: ['role-permissions'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('role_permissions')
          .select('*');
        
        if (error) throw error;
        
        // If we have permissions in the database, use those
        if (data && data.length > 0) {
          return data as RolePermission[];
        }
        
        // Otherwise, initialize with default permissions
        if (!isInitialized) {
          await initializePermissions();
          setIsInitialized(true);
        }
        
        return DEFAULT_PERMISSIONS;
      } catch (error) {
        console.error('Error fetching permissions:', error);
        return DEFAULT_PERMISSIONS;
      }
    }
  });

  // Initialize permissions if they don't exist
  const initializePermissions = async () => {
    try {
      // Make sure each permission has a rolename which is required
      const permissionsToInsert = DEFAULT_PERMISSIONS.map(p => ({
        rolename: p.rolename,
        preview: p.preview,
        edit: p.edit,
        upload: p.upload,
        download: p.download,
        delete: p.delete
      }));
      
      const { error } = await supabase
        .from('role_permissions')
        .insert(permissionsToInsert);
      
      if (error) {
        console.error('Error initializing permissions:', error);
      }
    } catch (error) {
      console.error('Error initializing permissions:', error);
    }
  };

  // Save permissions mutation
  const { mutateAsync: savePermissions } = useMutation({
    mutationFn: async (updatedPermissions: RolePermission[]) => {
      for (const permission of updatedPermissions) {
        // Make sure each permission has a rolename which is required
        const { error } = await supabase
          .from('role_permissions')
          .upsert({
            rolename: permission.rolename,
            preview: permission.preview,
            edit: permission.edit,
            upload: permission.upload,
            download: permission.download,
            delete: permission.delete
          }, { onConflict: 'rolename' });
        
        if (error) throw error;
      }
      return updatedPermissions;
    },
    onSuccess: () => {
      // Invalidate the permissions query to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
    }
  });

  return {
    permissions,
    isLoading,
    savePermissions,
    isInitialized
  };
};
