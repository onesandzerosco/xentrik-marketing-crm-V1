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
      console.log('=== STARTING FRESH DATABASE FETCH ===');
      console.log('Creator ID:', creatorId);
      
      // Step 1: Get creator email
      const { data: creatorData, error: creatorError } = await supabase
        .from('creators')
        .select('*')  // Get all creator data
        .eq('id', creatorId)
        .single();

      console.log('=== CREATOR FETCH RESULT ===');
      console.log('Creator data:', creatorData);
      console.log('Creator error:', creatorError);

      if (creatorError || !creatorData?.email) {
        console.error('No creator found or no email:', creatorError);
        const emptyData = getEmptySocialMediaHandles();
        setSocialMediaData(prev => ({
          ...prev,
          [creatorId]: emptyData
        }));
        return emptyData;
      }

      const creatorEmail = creatorData.email;
      console.log('Using creator email for lookup:', creatorEmail);

      // Step 2: Get ALL onboarding submissions for this email
      const { data: allSubmissions, error: submissionError } = await supabase
        .from('onboarding_submissions')
        .select('*')  // GET EVERYTHING
        .eq('email', creatorEmail)
        .order('submitted_at', { ascending: false });

      console.log('=== ALL SUBMISSIONS FETCH RESULT ===');
      console.log('All submissions found:', allSubmissions);
      console.log('Submission error:', submissionError);
      console.log('Number of submissions:', allSubmissions?.length || 0);

      if (submissionError) {
        console.error('Database error fetching submissions:', submissionError);
        const emptyData = getEmptySocialMediaHandles();
        setSocialMediaData(prev => ({
          ...prev,
          [creatorId]: emptyData
        }));
        return emptyData;
      }

      if (!allSubmissions || allSubmissions.length === 0) {
        console.log('No submissions found for email:', creatorEmail);
        const emptyData = getEmptySocialMediaHandles();
        setSocialMediaData(prev => ({
          ...prev,
          [creatorId]: emptyData
        }));
        return emptyData;
      }

      // Find the most recent accepted submission
      const acceptedSubmission = allSubmissions.find(sub => sub.status === 'accepted');
      const mostRecentSubmission = allSubmissions[0]; // Most recent regardless of status

      console.log('=== SUBMISSION ANALYSIS ===');
      console.log('Most recent submission:', mostRecentSubmission);
      console.log('Most recent accepted submission:', acceptedSubmission);
      
      // Use accepted submission if available, otherwise use most recent
      const submissionToUse = acceptedSubmission || mostRecentSubmission;
      
      if (!submissionToUse) {
        console.log('No suitable submission found');
        const emptyData = getEmptySocialMediaHandles();
        setSocialMediaData(prev => ({
          ...prev,
          [creatorId]: emptyData
        }));
        return emptyData;
      }

      console.log('=== USING SUBMISSION ===');
      console.log('Submission ID:', submissionToUse.id);
      console.log('Submission status:', submissionToUse.status);
      console.log('Submission date:', submissionToUse.submitted_at);
      console.log('Raw data column:', submissionToUse.data);
      console.log('Data type:', typeof submissionToUse.data);

      // Extract socialMediaHandles from the data JSON
      const submissionJsonData = submissionToUse.data as Record<string, any>;
      
      console.log('=== JSON DATA BREAKDOWN ===');
      console.log('Parsed JSON keys:', Object.keys(submissionJsonData || {}));
      
      // Try different possible paths for social media data
      let socialMediaHandles = null;
      
      // Check direct socialMediaHandles
      if (submissionJsonData.socialMediaHandles) {
        socialMediaHandles = submissionJsonData.socialMediaHandles;
        console.log('Found socialMediaHandles directly:', socialMediaHandles);
      }
      
      // Check inside contentAndService
      if (!socialMediaHandles && submissionJsonData.contentAndService?.socialMediaHandles) {
        socialMediaHandles = submissionJsonData.contentAndService.socialMediaHandles;
        console.log('Found socialMediaHandles in contentAndService:', socialMediaHandles);
      }
      
      // Check other possible nested locations
      if (!socialMediaHandles) {
        console.log('=== SEARCHING ALL NESTED OBJECTS ===');
        Object.keys(submissionJsonData).forEach(key => {
          const value = submissionJsonData[key];
          if (value && typeof value === 'object' && value.socialMediaHandles) {
            console.log(`Found socialMediaHandles in ${key}:`, value.socialMediaHandles);
            socialMediaHandles = value.socialMediaHandles;
          }
        });
      }

      if (!socialMediaHandles) {
        console.log('No socialMediaHandles found in any location');
        socialMediaHandles = {};
      }

      console.log('=== FINAL SOCIAL MEDIA HANDLES ===');
      console.log('Final socialMediaHandles object:', socialMediaHandles);
      console.log('Instagram value:', socialMediaHandles.instagram);
      console.log('TikTok value:', socialMediaHandles.tiktok);
      console.log('Twitter value:', socialMediaHandles.twitter);
      console.log('OnlyFans value:', socialMediaHandles.onlyfans);
      console.log('Snapchat value:', socialMediaHandles.snapchat);
      console.log('Other value:', socialMediaHandles.other);

      const processedData = processSocialMediaData(socialMediaHandles);
      console.log('=== PROCESSED FINAL RESULT ===');
      console.log('Processed data:', processedData);
      
      setSocialMediaData(prev => ({
        ...prev,
        [creatorId]: processedData
      }));

      return processedData;
    } catch (error) {
      console.error('=== CATCH BLOCK ERROR ===');
      console.error('Unexpected error:', error);
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
      
      const otherForSaving = socialMediaToSave.other.map(item => ({
        platform: item.platform,
        url: item.url
      }));
      
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
      
      const freshData = await fetchSocialMediaForCreator(creatorId);
      console.log('Fresh data after save:', freshData);
      
      return { success: true };
    } catch (error) {
      console.error('Error saving social media data:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }, [socialMediaData, fetchSocialMediaForCreator]);

  const getSocialMediaForCreator = useCallback(async (creatorId: string) => {
    console.log('=== getSocialMediaForCreator CALLED ===');
    console.log('Getting fresh data for creator:', creatorId);
    
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

  const predefinedPlatforms = ['instagram', 'tiktok', 'twitter', 'onlyfans', 'snapchat'];
  
  predefinedPlatforms.forEach(platform => {
    if (typeof data[platform] === 'string') {
      result[platform] = data[platform];
      console.log(`Processed ${platform}:`, data[platform]);
    }
  });

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
