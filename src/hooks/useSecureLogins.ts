
import { useState, useEffect } from 'react';

const STORAGE_KEY = "creator_secure_logins";
const AUTH_KEY = "secure_area_authorized";
const LAST_ACTIVE_KEY = "secure_area_last_active";
const TIMEOUT_DURATION = 2 * 60 * 1000; // 2 minutes in milliseconds

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

  // Update the last active timestamp whenever this hook is used
  useEffect(() => {
    const updateLastActive = () => {
      const timestamp = new Date().getTime();
      localStorage.setItem(LAST_ACTIVE_KEY, timestamp.toString());
      console.log("Updated last active timestamp:", new Date(timestamp).toLocaleTimeString());
    };

    // Update on mount
    updateLastActive();

    // Set up interval to regularly update the timestamp while on the page
    const interval = setInterval(updateLastActive, 10000); // Update every 10 seconds

    return () => {
      clearInterval(interval);
      // One final update when leaving the page
      updateLastActive();
    };
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

  const checkAutoLock = (): boolean => {
    const isAuthorized = localStorage.getItem(AUTH_KEY) === "true";
    const lastActiveStr = localStorage.getItem(LAST_ACTIVE_KEY);
    
    if (!isAuthorized || !lastActiveStr) {
      return false;
    }
    
    const lastActive = parseInt(lastActiveStr, 10);
    const now = new Date().getTime();
    const timeSinceActive = now - lastActive;
    
    console.log(`Time since last active: ${timeSinceActive / 1000} seconds`);
    
    // If more than TIMEOUT_DURATION has passed, lock the secure area
    if (timeSinceActive > TIMEOUT_DURATION) {
      console.log("Auto-locking secure area due to inactivity");
      localStorage.setItem(AUTH_KEY, "false");
      return false;
    }
    
    return true;
  };
  
  return {
    allLoginDetails,
    updateLoginDetail,
    getLoginDetailsForCreator,
    saveLoginDetails,
    checkAutoLock
  };
};
