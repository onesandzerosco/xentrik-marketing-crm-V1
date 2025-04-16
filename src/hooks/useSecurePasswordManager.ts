
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { verifyPassword, hashPassword } from '@/utils/passwordUtils';
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
        .maybeSingle();
      
      if (error) {
        console.error('Error getting active password:', error);
        return null;
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
        // If no password is set in the database, use the default password
        console.log('No password found in database, using default password');
        return password === 'bananas';
      }
      
      // If we have a stored hash, verify against it
      console.log('Verifying against stored password hash');
      return verifyPassword(password, storedHash);
    } catch (error) {
      console.error('Error verifying password:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [getActivePassword]);

  // Adding this utility function to help set up the default password in Supabase
  const setupDefaultPassword = useCallback(async (): Promise<boolean> => {
    try {
      const hashedPassword = hashPassword('bananas');
      
      // First deactivate any existing passwords
      await supabase
        .from('secure_area_passwords')
        .update({ active: false })
        .not('id', 'is', null);
        
      // Insert the new default password
      const { error } = await supabase
        .from('secure_area_passwords')
        .insert({ password_hash: hashedPassword, active: true });
        
      if (error) {
        console.error('Error setting up default password:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error setting up default password:', error);
      return false;
    }
  }, []);

  return {
    verifySecurePassword,
    setupDefaultPassword,
    isLoading
  };
};
