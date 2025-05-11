import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DEFAULT_PERMISSIONS, Permission } from '@/utils/permissionModels';

export const usePermissions = () => {
  const queryClient = useQueryClient();
  const [isInitialized, setIsInitialized] = useState(false);

  // Fetch permissions from the database
  const { data: permissions = DEFAULT_PERMISSIONS, isLoading } = useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('permissions')
          .select('*')
          .eq('module', 'SharedFiles');
        
        if (error) throw error;
        
        // If we have permissions in the database, use those
        if (data && data.length > 0) {
          return data as Permission[];
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
      await supabase.from('permissions').insert(DEFAULT_PERMISSIONS);
    } catch (error) {
      console.error('Error initializing permissions:', error);
    }
  };

  // Save permissions mutation
  const { mutateAsync: savePermissions } = useMutation({
    mutationFn: async (updatedPermissions: Permission[]) => {
      // Use upsert to handle both inserting new permissions and updating existing ones
      const { error } = await supabase
        .from('permissions')
        .upsert(updatedPermissions, { onConflict: 'id' });
      
      if (error) throw error;
      return updatedPermissions;
    },
    onSuccess: () => {
      // Invalidate the permissions query to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      queryClient.invalidateQueries({ queryKey: ['file-permissions'] });
    }
  });

  return {
    permissions,
    isLoading,
    savePermissions,
    isInitialized
  };
};
