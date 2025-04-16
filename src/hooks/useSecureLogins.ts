
import { useState, useCallback } from 'react';

export interface LoginDetail {
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
  
  // Fix: The checkAutoLock function now uses sessionStorage instead of localStorage
  const checkAutoLock = useCallback(() => {
    try {
      // Check if the user is still authorized from sessionStorage
      const authData = sessionStorage.getItem('secure_area_auth');
      if (!authData) return false;
      
      const { authorized, expires } = JSON.parse(authData);
      
      // Check if the authorization is expired
      if (new Date(expires) < new Date()) {
        sessionStorage.removeItem('secure_area_auth');
        return false;
      }
      
      return !!authorized;
    } catch (error) {
      console.error('Error checking authorization:', error);
      return false;
    }
  }, []);
  
  return {
    getLoginDetailsForCreator,
    updateLoginDetail,
    saveLoginDetails,
    checkAutoLock
  };
};
