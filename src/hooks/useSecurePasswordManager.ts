
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { hashPassword, verifyPassword } from '@/utils/passwordUtils';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';

export const useSecurePasswordManager = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useSupabaseAuth();

  const savePassword = useCallback(async (password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const hashedPassword = hashPassword(password);
      
      // First, deactivate all current passwords
      await supabase
        .from('secure_area_passwords')
        .update({ active: false })
        .eq('active', true);
      
      // Then insert the new password
      const { error } = await supabase
        .from('secure_area_passwords')
        .insert([{ password_hash: hashedPassword, active: true }]);
      
      if (error) throw error;
      
      toast({
        title: "Password Updated",
        description: "Secure area password has been successfully updated."
      });
      
      return true;
    } catch (error: any) {
      console.error('Error saving password:', error);
      toast({
        variant: "destructive",
        title: "Failed to Save Password",
        description: error.message || "An unexpected error occurred"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

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

  const setSecureAreaAuthorization = async (authorized: boolean) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('secure_area_authorizations')
        .insert([{
          user_id: user.id,
          authorized,
        }]);

      if (error) throw error;
    } catch (error) {
      console.error('Error setting secure area authorization:', error);
      throw error;
    }
  };

  const checkSecureAreaAuthorization = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('secure_area_authorizations')
        .select('authorized')
        .eq('user_id', user.id)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

      if (error) throw error;
      return !!data?.authorized;
    } catch (error) {
      console.error('Error checking secure area authorization:', error);
      return false;
    }
  };

  return {
    savePassword,
    verifySecurePassword,
    setSecureAreaAuthorization,
    checkSecureAreaAuthorization,
    isLoading
  };
};
