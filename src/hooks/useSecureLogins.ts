import { useState, useEffect } from 'react';

const STORAGE_KEY = "creator_secure_logins";

interface LoginDetails {
  [platform: string]: string;
}

interface CreatorLoginDetails {
  [creatorId: string]: LoginDetails;
}

export const useSecureLogins = () => {
  const [allLoginDetails, setAllLoginDetails] = useState<CreatorLoginDetails>({});
  
  // Load saved login details from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        setAllLoginDetails(JSON.parse(savedData));
      } catch (e) {
        console.error("Failed to parse stored login details");
      }
    }
  }, []);
  
  const updateLoginDetail = (creatorId: string, platform: string, field: string, value: string) => {
    const key = `${platform}_${field}`;
    const updatedDetails = { 
      ...allLoginDetails,
      [creatorId]: {
        ...(allLoginDetails[creatorId] || {}),
        [key]: value
      }
    };
    
    setAllLoginDetails(updatedDetails);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDetails));
  };
  
  const getLoginDetailsForCreator = (creatorId: string): LoginDetails => {
    return allLoginDetails[creatorId] || {};
  };
  
  const saveLoginDetails = (creatorId: string, platform: string) => {
    // This function doesn't need to do anything special as updateLoginDetail already saves to localStorage
    // But we keep it as a separate function to maintain the component API
    return true;
  };
  
  return {
    allLoginDetails,
    updateLoginDetail,
    getLoginDetailsForCreator,
    saveLoginDetails
  };
};
