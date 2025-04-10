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
        const parsedData = JSON.parse(savedData);
        console.log("Loaded login details from localStorage:", parsedData);
        setAllLoginDetails(parsedData);
      } catch (e) {
        console.error("Failed to parse stored login details", e);
      }
    } else {
      console.log("No saved login details found in localStorage");
    }
  }, []);
  
  const updateLoginDetail = (creatorId: string, platform: string, field: string, value: string) => {
    console.log(`Updating login detail for ${creatorId}, ${platform}, ${field}:`, value);
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
    console.log("Saved updated login details to localStorage");
  };
  
  const getLoginDetailsForCreator = (creatorId: string): LoginDetails => {
    const details = allLoginDetails[creatorId] || {};
    console.log(`Retrieved login details for creator ${creatorId}:`, details);
    return details;
  };
  
  const saveLoginDetails = (creatorId: string, platform: string) => {
    // This function doesn't need to do anything special as updateLoginDetail already saves to localStorage
    // But we keep it as a separate function to maintain the component API
    console.log(`Saving login details for ${creatorId}, platform ${platform}`);
    return true;
  };
  
  return {
    allLoginDetails,
    updateLoginDetail,
    getLoginDetailsForCreator,
    saveLoginDetails
  };
};
