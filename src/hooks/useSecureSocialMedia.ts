
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SocialMediaAccount {
  platform: string;
  url: string;
}

export interface SocialMediaHandles {
  instagram: string;
  tiktok: string;
  twitter: string;
  onlyfans: string;
  snapchat: string;
  other: SocialMediaAccount[];
  [key: string]: string | SocialMediaAccount[];
}

export const useSecureSocialMedia = () => {
  const [socialMediaData, setSocialMediaData] = useState<Record<string, SocialMediaHandles>>({});
  const [loading, setLoading] = useState(false);

  const fetchSocialMediaForCreator = useCallback(async (creatorId: string) => {
    setLoading(true);
    try {
      console.log('=== STARTING FRESH DB FETCH ===');
      console.log('Fetching social media data for creator:', creatorId);
      
      // Step 1: Get creator email
      const { data: creatorData, error: creatorError } = await supabase
        .from('creators')
        .select('email')
        .eq('id', creatorId)
        .single();

      console.log('=== CREATOR EMAIL FETCH ===');
      console.log('Creator query result:', creatorData);
      console.log('Creator query error:', creatorError);

      if (creatorError || !creatorData?.email) {
        console.log('No creator email found for:', creatorId, creatorError);
        const emptyData = getEmptySocialMediaHandles();
        setSocialMediaData(prev => ({
          ...prev,
          [creatorId]: emptyData
        }));
        return emptyData;
      }

      console.log('Found creator email:', creatorData.email);

      // Step 2: Get onboarding submission data - THIS IS THE KEY STEP
      const { data: submissionData, error: submissionError } = await supabase
        .from('onboarding_submissions')
        .select('data')
        .eq('email', creatorData.email)
        .eq('status', 'accepted')
        .order('submitted_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      console.log('=== ONBOARDING SUBMISSION FETCH FROM DB ===');
      console.log('Submission query result:', submissionData);
      console.log('Submission query error:', submissionError);
      console.log('Raw data column content:', submissionData?.data);

      if (submissionError) {
        console.error('Error fetching submission data:', submissionError);
        const emptyData = getEmptySocialMediaHandles();
        setSocialMediaData(prev => ({
          ...prev,
          [creatorId]: emptyData
        }));
        return emptyData;
      }

      if (!submissionData?.data) {
        console.log('No submission data found for:', creatorData.email);
        const emptyData = getEmptySocialMediaHandles();
        setSocialMediaData(prev => ({
          ...prev,
          [creatorId]: emptyData
        }));
        return emptyData;
      }

      // Step 3: Extract socialMediaHandles from the data JSON column
      const submissionJsonData = submissionData.data as Record<string, any>;
      console.log('=== EXTRACTING FROM JSON DATA COLUMN ===');
      console.log('Full JSON from data column:', submissionJsonData);
      console.log('Available keys in data JSON:', Object.keys(submissionJsonData));
      
      const socialMediaHandles = submissionJsonData.socialMediaHandles || {};
      console.log('=== SOCIAL MEDIA HANDLES FROM DB ===');
      console.log('Raw socialMediaHandles from JSON:', socialMediaHandles);
      console.log('Type of socialMediaHandles:', typeof socialMediaHandles);
      console.log('Keys in socialMediaHandles:', Object.keys(socialMediaHandles));
      
      // Log each individual platform value from the actual database
      console.log('=== INDIVIDUAL PLATFORM VALUES FROM ACTUAL DB ===');
      console.log('Instagram from actual DB:', socialMediaHandles.instagram);
      console.log('TikTok from actual DB:', socialMediaHandles.tiktok);
      console.log('Twitter from actual DB:', socialMediaHandles.twitter);
      console.log('OnlyFans from actual DB:', socialMediaHandles.onlyfans);
      console.log('Snapchat from actual DB:', socialMediaHandles.snapchat);
      console.log('Other array from actual DB:', socialMediaHandles.other);
      
      const processedData = processSocialMediaData(socialMediaHandles);
      console.log('=== PROCESSED DATA RESULT ===');
      console.log('Processed social media data:', processedData);
      
      // Update state with actual database data
      setSocialMediaData(prev => ({
        ...prev,
        [creatorId]: processedData
      }));

      return processedData;
    } catch (error) {
      console.error('=== ERROR IN FETCH ===');
      console.error('Error in fetchSocialMediaForCreator:', error);
      const emptyData = getEmptySocialMediaHandles();
      setSocialMediaData(prev => ({
        ...prev,
        [creatorId]: emptyData
      }));
      return emptyData;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSocialMediaForCreator = useCallback((creatorId: string, platform: string, url: string) => {
    console.log('Updating social media for creator:', creatorId, platform, url);
    setSocialMediaData(prev => {
      const currentData = prev[creatorId] || getEmptySocialMediaHandles();
      
      const updatedData = {
        ...currentData,
        [platform]: url
      };

      console.log('Updated social media data:', updatedData);

      return {
        ...prev,
        [creatorId]: updatedData
      };
    });
  }, []);

  const addOtherSocialMedia = useCallback((creatorId: string, platform: string, url: string) => {
    console.log('Adding other social media:', creatorId, platform, url);
    setSocialMediaData(prev => {
      const currentData = prev[creatorId] || getEmptySocialMediaHandles();
      
      return {
        ...prev,
        [creatorId]: {
          ...currentData,
          other: [...currentData.other, { platform, url }]
        }
      };
    });
  }, []);

  const removeOtherSocialMedia = useCallback((creatorId: string, index: number) => {
    console.log('Removing other social media:', creatorId, index);
    setSocialMediaData(prev => {
      const currentData = prev[creatorId] || getEmptySocialMediaHandles();
      
      return {
        ...prev,
        [creatorId]: {
          ...currentData,
          other: currentData.other.filter((_, i) => i !== index)
        }
      };
    });
  }, []);

  const saveSocialMediaForCreator = useCallback(async (creatorId: string) => {
    try {
      console.log('=== SAVING TO DATABASE ===');
      console.log('Saving social media for creator:', creatorId);
      console.log('Current social media data to save:', socialMediaData[creatorId]);

      const { data: creatorData, error: creatorError } = await supabase
        .from('creators')
        .select('email')
        .eq('id', creatorId)
        .single();

      if (creatorError || !creatorData?.email) {
        console.error('Creator email not found:', creatorError);
        throw new Error('Creator email not found');
      }

      console.log('Creator email for saving:', creatorData.email);

      const { data: submissionData, error: fetchError } = await supabase
        .from('onboarding_submissions')
        .select('data, id')
        .eq('email', creatorData.email)
        .eq('status', 'accepted')
        .order('submitted_at', { ascending: false })
        .limit(1)
        .single();

      if (fetchError || !submissionData) {
        console.error('Submission data not found:', fetchError);
        throw new Error('Submission data not found');
      }

      console.log('Current submission data:', submissionData);

      const currentData = submissionData.data as Record<string, any>;
      const socialMediaToSave = socialMediaData[creatorId];
      
      if (!socialMediaToSave) {
        throw new Error('No social media data to save');
      }
      
      // Convert the other array to plain objects for Supabase compatibility
      const otherForSaving = socialMediaToSave.other.map(item => ({
        platform: item.platform,
        url: item.url
      }));
      
      // Create the socialMediaHandles object - this will go into the JSON data column
      const updatedSocialMediaHandles = {
        instagram: socialMediaToSave.instagram || '',
        tiktok: socialMediaToSave.tiktok || '',
        twitter: socialMediaToSave.twitter || '',
        onlyfans: socialMediaToSave.onlyfans || '',
        snapchat: socialMediaToSave.snapchat || '',
        other: otherForSaving
      };

      console.log('=== SAVING TO DB JSON ===');
      console.log('Social media handles to save to JSON:', updatedSocialMediaHandles);
      
      const updatedData = {
        ...currentData,
        socialMediaHandles: updatedSocialMediaHandles
      };

      console.log('Updated JSON data to save:', updatedData);

      const { error: updateError } = await supabase
        .from('onboarding_submissions')
        .update({ data: updatedData })
        .eq('id', submissionData.id);

      if (updateError) {
        console.error('Update error:', updateError);
        throw updateError;
      }

      console.log('Successfully saved social media data to database');
      
      // Refetch to get the latest data from database and verify save
      const freshData = await fetchSocialMediaForCreator(creatorId);
      console.log('Fresh data after save:', freshData);
      
      return { success: true };
    } catch (error) {
      console.error('Error saving social media data:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }, [socialMediaData, fetchSocialMediaForCreator]);

  // Async function to get fresh data from database
  const getSocialMediaForCreator = useCallback(async (creatorId: string) => {
    console.log('=== getSocialMediaForCreator CALLED ===');
    console.log('Getting fresh data for creator:', creatorId);
    
    // Always fetch fresh data from database
    const freshData = await fetchSocialMediaForCreator(creatorId);
    console.log('Returning fresh data from DB:', freshData);
    
    return freshData;
  }, [fetchSocialMediaForCreator]);

  return {
    fetchSocialMediaForCreator,
    updateSocialMediaForCreator,
    addOtherSocialMedia,
    removeOtherSocialMedia,
    saveSocialMediaForCreator,
    getSocialMediaForCreator,
    loading
  };
};

function getEmptySocialMediaHandles(): SocialMediaHandles {
  return {
    instagram: '',
    tiktok: '',
    twitter: '',
    onlyfans: '',
    snapchat: '',
    other: []
  };
}

function processSocialMediaData(data: any): SocialMediaHandles {
  console.log('=== PROCESSING SOCIAL MEDIA DATA ===');
  console.log('Input data to process:', data);
  
  const result: SocialMediaHandles = {
    instagram: '',
    tiktok: '',
    twitter: '',
    onlyfans: '',
    snapchat: '',
    other: []
  };

  if (!data || typeof data !== 'object') {
    console.log('Data is not valid object, returning empty');
    return result;
  }

  // Handle predefined platforms
  const predefinedPlatforms = ['instagram', 'tiktok', 'twitter', 'onlyfans', 'snapchat'];
  
  predefinedPlatforms.forEach(platform => {
    if (typeof data[platform] === 'string') {
      result[platform] = data[platform];
      console.log(`Processed ${platform}:`, data[platform]);
    }
  });

  // Handle the 'other' array
  if (Array.isArray(data.other)) {
    result.other = data.other.map((item: any) => ({
      platform: item.platform || '',
      url: item.url || ''
    }));
    console.log('Processed other platforms:', result.other);
  }

  console.log('Final processed result:', result);
  return result;
}
