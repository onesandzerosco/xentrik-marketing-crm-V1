
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface LoginDetail {
  platform: string;
  username: string;
  password: string;
  notes: string;
  lastUpdated: string;
}

interface CreatorLoginDetails {
  [creatorId: string]: {
    [platform: string]: LoginDetail;
  };
}

export const useSecureLogins = () => {
  const [loginDetails, setLoginDetails] = useState<CreatorLoginDetails>({});
  
  const getLoginDetailsForCreator = useCallback((creatorId: string) => {
    return loginDetails[creatorId] || {};
  }, [loginDetails]);
  
  const updateLoginDetail = useCallback((
    creatorId: string, 
    platform: string, 
    field: string, 
    value: string
  ) => {
    setLoginDetails(prev => {
      const creatorDetails = prev[creatorId] || {};
      const platformDetails = creatorDetails[platform] || {
        platform,
        username: '',
        password: '',
        notes: '',
        lastUpdated: new Date().toISOString()
      };
      
      const updatedPlatformDetails = {
        ...platformDetails,
        [field]: value,
        lastUpdated: new Date().toISOString()
      };
      
      return {
        ...prev,
        [creatorId]: {
          ...creatorDetails,
          [platform]: updatedPlatformDetails
        }
      };
    });
  }, []);
  
  const saveLoginDetails = useCallback((creatorId: string, platform: string) => {
    const details = loginDetails[creatorId]?.[platform];
    if (details) {
      // In a real implementation, this would save to Supabase
      console.log('Saving login details:', { creatorId, platform, details });
    }
  }, [loginDetails]);
  
  const checkAutoLock = useCallback(() => {
    // For this implementation, we'll just check if the user is still authorized
    // In a real implementation, you'd check the timestamp of the last activity
    const authorized = localStorage.getItem("secure_area_authorized") === "true";
    return authorized;
  }, []);
  
  return {
    getLoginDetailsForCreator,
    updateLoginDetail,
    saveLoginDetails,
    checkAutoLock
  };
};
