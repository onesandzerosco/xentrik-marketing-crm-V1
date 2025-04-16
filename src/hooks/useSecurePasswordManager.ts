
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { verifyPassword } from '@/utils/passwordUtils';
import { useToast } from '@/hooks/use-toast';

export const useSecurePasswordManager = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const getActivePassword = useCallback(async (): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('secure_area_passwords')
        .select('password_hash')
        .eq('active', true)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No active password found
          return null;
        }
        throw error;
      }
      
      return data?.password_hash || null;
    } catch (error: any) {
      console.error('Error getting active password:', error);
      return null;
    }
  }, []);

  const verifySecurePassword = useCallback(async (password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const storedHash = await getActivePassword();
      
      if (!storedHash) {
        // If no password is set, use the default password
        return password === 'bananas';
      }
      
      return verifyPassword(password, storedHash);
    } catch (error) {
      console.error('Error verifying password:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [getActivePassword]);

  return {
    verifySecurePassword,
    isLoading
  };
};
