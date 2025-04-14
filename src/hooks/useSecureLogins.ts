
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';

// Constants for auth and timeout
const AUTH_KEY = "secure_area_authorized";
const LAST_ACTIVE_KEY = "secure_area_last_active";
const TIMEOUT_DURATION = 2 * 60 * 1000; // 2 minutes

// Type definitions
export interface LoginDetail {
  platform: string;
  username: string;
  password: string;
  notes?: string;
}

export interface CreatorLoginDetails {
  [creatorId: string]: LoginDetail[];
}

// Type for Supabase RPC response data
interface SecureLoginData {
  creator_id: string;
  login_details: LoginDetail[];
}

export const useSecureLogins = () => {
  const [loginDetails, setLoginDetails] = useState<CreatorLoginDetails>({});
  const { userProfile } = useSupabaseAuth();

  // Load login details from Supabase
  useEffect(() => {
    const fetchLoginDetails = async () => {
      if (!userProfile) return;

      // Using RPC to avoid TypeScript errors with table that isn't in the generated types
      const { data, error } = await supabase.rpc<SecureLoginData[]>('get_secure_logins_for_user', {
        user_id_param: userProfile.id
      });

      if (error) {
        console.error("Failed to fetch login details:", error);
        return;
      }

      const formattedData: CreatorLoginDetails = {};
      
      if (data) {
        data.forEach(item => {
          if (item.creator_id && Array.isArray(item.login_details)) {
            formattedData[item.creator_id] = item.login_details;
          }
        });
      }

      setLoginDetails(formattedData);
    };

    fetchLoginDetails();
  }, [userProfile]);

  // Update last active timestamp
  useEffect(() => {
    const updateLastActive = () => {
      const timestamp = new Date().getTime();
      localStorage.setItem(LAST_ACTIVE_KEY, timestamp.toString());
    };

    updateLastActive();
    const interval = setInterval(updateLastActive, 10000);
    return () => clearInterval(interval);
  }, []);

  const updateLoginDetail = async (
    creatorId: string, 
    platform: string, 
    detail: Partial<LoginDetail>
  ) => {
    if (!userProfile) return;

    const currentDetails = loginDetails[creatorId] || [];
    const detailIndex = currentDetails.findIndex(d => d.platform === platform);
    
    let updatedDetails: LoginDetail[];
    if (detailIndex >= 0) {
      updatedDetails = [
        ...currentDetails.slice(0, detailIndex),
        { ...currentDetails[detailIndex], ...detail },
        ...currentDetails.slice(detailIndex + 1)
      ];
    } else {
      updatedDetails = [
        ...currentDetails,
        { platform, username: '', password: '', ...detail }
      ];
    }

    const newLoginDetails = {
      ...loginDetails,
      [creatorId]: updatedDetails
    };

    setLoginDetails(newLoginDetails);

    try {
      // Using RPC to avoid TypeScript errors with table that isn't in the generated types
      const { error } = await supabase.rpc('upsert_secure_login', {
        user_id_param: userProfile.id,
        creator_id_param: creatorId,
        login_details_param: updatedDetails
      });

      if (error) throw error;
    } catch (error) {
      console.error("Error saving login details:", error);
    }
  };

  const getLoginDetailsForCreator = (creatorId: string): LoginDetail[] => {
    return loginDetails[creatorId] || [];
  };

  const checkAutoLock = (): boolean => {
    const isAuthorized = localStorage.getItem(AUTH_KEY) === "true";
    const lastActiveStr = localStorage.getItem(LAST_ACTIVE_KEY);

    if (!isAuthorized || !lastActiveStr) return false;

    const lastActive = parseInt(lastActiveStr, 10);
    const timeSinceActive = new Date().getTime() - lastActive;

    if (timeSinceActive > TIMEOUT_DURATION) {
      localStorage.setItem(AUTH_KEY, "false");
      return false;
    }

    return true;
  };

  return {
    loginDetails,
    updateLoginDetail,
    getLoginDetailsForCreator,
    checkAutoLock
  };
};
