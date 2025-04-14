
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';

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
  const { userProfile } = useSupabaseAuth();
  
  // Load login details from Supabase
  useEffect(() => {
    const fetchLoginDetails = async () => {
      if (!userProfile) return;
      
      try {
        const { data, error } = await supabase
          .from('secure_logins')
          .select('creator_id, login_details')
          .eq('user_id', userProfile.id);
        
        if (error) {
          console.error("Failed to fetch login details:", error);
          return;
        }
        
        const formattedData: CreatorLoginDetails = {};
        data?.forEach(item => {
          formattedData[item.creator_id] = item.login_details || {};
        });
        
        console.log("Loaded login details from Supabase:", formattedData);
        setAllLoginDetails(formattedData);
      } catch (e) {
        console.error("Error fetching stored login details", e);
      }
    };
    
    fetchLoginDetails();
  }, [userProfile]);

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
  
  const updateLoginDetail = async (creatorId: string, platform: string, field: string, value: string) => {
    if (!userProfile) return;
    
    console.log(`Updating login detail for ${creatorId}, ${platform}, ${field}:`, value);
    const key = `${platform}_${field}`;
    
    // Update local state
    const updatedDetails = { 
      ...allLoginDetails,
      [creatorId]: {
        ...(allLoginDetails[creatorId] || {}),
        [key]: value
      }
    };
    
    setAllLoginDetails(updatedDetails);
    
    // Update in Supabase
    try {
      const existingEntry = await supabase
        .from('secure_logins')
        .select('*')
        .eq('user_id', userProfile.id)
        .eq('creator_id', creatorId)
        .maybeSingle();
      
      if (existingEntry.data) {
        // Update existing entry
        const { error } = await supabase
          .from('secure_logins')
          .update({
            login_details: updatedDetails[creatorId],
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userProfile.id)
          .eq('creator_id', creatorId);
        
        if (error) throw error;
      } else {
        // Create new entry
        const { error } = await supabase
          .from('secure_logins')
          .insert({
            user_id: userProfile.id,
            creator_id: creatorId,
            login_details: updatedDetails[creatorId]
          });
        
        if (error) throw error;
      }
      
      console.log("Saved updated login details to Supabase");
    } catch (error) {
      console.error("Error saving login details:", error);
    }
  };
  
  const getLoginDetailsForCreator = (creatorId: string): LoginDetails => {
    const details = allLoginDetails[creatorId] || {};
    console.log(`Retrieved login details for creator ${creatorId}:`, details);
    return details;
  };
  
  const saveLoginDetails = async (creatorId: string, platform: string) => {
    if (!userProfile) return false;
    
    try {
      const { error } = await supabase
        .from('secure_logins')
        .upsert({
          user_id: userProfile.id,
          creator_id: creatorId,
          login_details: allLoginDetails[creatorId] || {},
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      console.log(`Saving login details for ${creatorId}, platform ${platform} completed`);
      return true;
    } catch (error) {
      console.error("Error explicitly saving login details:", error);
      return false;
    }
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
