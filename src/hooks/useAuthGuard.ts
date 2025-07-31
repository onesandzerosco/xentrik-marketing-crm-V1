import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAuthGuard = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const checkUserStatus = async () => {
      if (!user?.id) return;

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('status')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error checking user status:', error);
          return;
        }

        if (profile?.status === 'Suspended') {
          toast({
            title: "Account Suspended",
            description: "Your account has been suspended. Please contact an administrator.",
            variant: "destructive",
          });
          await signOut();
        }
      } catch (error) {
        console.error('Error in auth guard:', error);
      }
    };

    // Check user status when component mounts and when user changes
    checkUserStatus();
  }, [user, signOut, toast]);
};