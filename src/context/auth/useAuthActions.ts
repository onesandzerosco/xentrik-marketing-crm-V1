
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { clearStoredAuthValues, updateUserCredentials, createTeamMember as createTeamMemberUtil } from './authUtils';

export const useAuthActions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message,
      });
      throw error;
    }
  };

  const signInWithOAuth = async (provider: 'google') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
      });

      if (error) throw error;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message,
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Logged out successfully",
        description: "You have been securely logged out",
      });
      navigate('/login');
      
      // Clear stored values
      clearStoredAuthValues();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: error.message,
      });
    }
  };

  const updateCredentials = async (credentials: { 
    email?: string; 
    password?: string;
    currentPassword?: string;
    displayName?: string;
    profileImage?: string;
  }): Promise<boolean> => {
    try {
      await updateUserCredentials(credentials);
      
      toast({
        title: "Success",
        description: "Your account has been updated",
      });
      
      if (credentials.email) {
        toast({
          title: "Email Verification",
          description: "Please check your email to verify the new address",
        });
      }
      
      return true;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error.message,
      });
      return false;
    }
  };

  const createTeamMember = async (data: { 
    username: string; 
    email: string; 
    role: string;
  }): Promise<boolean> => {
    try {
      await createTeamMemberUtil(data);
      return true;
    } catch (error: any) {
      console.error("Error creating team member:", error);
      toast({
        variant: "destructive",
        title: "Failed to create team member",
        description: error.message || "An unknown error occurred"
      });
      return false;
    }
  };

  // Placeholder functions for pending users management
  const fetchPendingUsers = async () => {
    // This is a placeholder - implement if needed
    return [];
  };

  const approvePendingUser = async (userId: string, approved: boolean) => {
    // This is a placeholder - implement if needed
  };

  return {
    signInWithEmail,
    signInWithOAuth,
    signOut,
    updateCredentials,
    createTeamMember,
    pendingUsers: [],
    approvePendingUser
  };
};
