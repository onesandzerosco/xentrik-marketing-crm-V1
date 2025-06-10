
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
  reddit: string;
  chaturbate: string;
  youtube: string;
  other: SocialMediaAccount[];
  // Allow for any additional platforms from the database
  [key: string]: string | SocialMediaAccount[];
}

export const useSecureSocialMedia = () => {
  const [socialMediaData, setSocialMediaData] = useState<Record<string, SocialMediaHandles>>({});
  const [loading, setLoading] = useState(false);

  const fetchSocialMediaForCreator = useCallback(async (creatorId: string) => {
    // Always fetch fresh data, don't use cache
    setLoading(true);
    try {
      console.log('Fetching social media data for creator:', creatorId);
      
      // First get the creator's email from the creators table
      const { data: creatorData, error: creatorError } = await supabase
        .from('creators')
        .select('email')
        .eq('id', creatorId)
        .single();

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

      // Then fetch from onboarding_submissions using the email
      const { data: submissionData, error: submissionError } = await supabase
        .from('onboarding_submissions')
        .select('data')
        .eq('email', creatorData.email)
        .eq('status', 'accepted')
        .order('submitted_at', { ascending: false })
        .limit(1)
        .maybeSingle();

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

      // Type assertion and safe access to socialMediaHandles
      const submissionJsonData = submissionData.data as Record<string, any>;
      const socialMediaHandles = submissionJsonData.socialMediaHandles || {};
      const processedData = processSocialMediaData(socialMediaHandles);
      
      console.log('Raw social media handles from DB:', socialMediaHandles);
      console.log('Processed social media data:', processedData);
      
      setSocialMediaData(prev => ({
        ...prev,
        [creatorId]: processedData
      }));

      return processedData;
    } catch (error) {
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
      
      if (platform === 'other') {
        // Handle 'other' platform differently - this shouldn't happen with current UI
        return prev;
      }

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

  const addCustomSocialMedia = useCallback((creatorId: string, platform: string, url: string) => {
    console.log('Adding custom social media:', creatorId, platform, url);
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

  const removeCustomSocialMedia = useCallback((creatorId: string, index: number) => {
    console.log('Removing custom social media:', creatorId, index);
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
      console.log('Saving social media for creator:', creatorId);
      console.log('Current social media data:', socialMediaData[creatorId]);

      // Get the creator's email
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

      // Get the current submission data
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

      // Type assertion and safe update of the socialMediaHandles in the data
      const currentData = submissionData.data as Record<string, any>;
      const currentSocialMediaHandles = (currentData.socialMediaHandles || {}) as Record<string, any>;
      const socialMediaToSave = socialMediaData[creatorId];
      
      if (!socialMediaToSave) {
        throw new Error('No social media data to save');
      }
      
      // Merge the current data with the updated data, preserving existing fields
      const mergedSocialMediaHandles = {
        ...currentSocialMediaHandles, // Keep existing data from DB
        ...Object.fromEntries(
          Object.entries(socialMediaToSave).filter(([key, value]) => {
            // Only include non-empty values and the 'other' array
            return key === 'other' || (typeof value === 'string' && value.trim() !== '');
          })
        )
      };

      console.log('Original DB social media handles:', currentSocialMediaHandles);
      console.log('Data to save:', socialMediaToSave);
      console.log('Merged social media handles:', mergedSocialMediaHandles);
      
      // Convert to plain object to ensure JSON compatibility
      const updatedData = {
        ...currentData,
        socialMediaHandles: mergedSocialMediaHandles
      };

      console.log('Updated data to save:', updatedData);

      // Save back to database
      const { error: updateError } = await supabase
        .from('onboarding_submissions')
        .update({ data: updatedData })
        .eq('id', submissionData.id);

      if (updateError) {
        console.error('Update error:', updateError);
        throw updateError;
      }

      console.log('Successfully saved social media data');
      
      // Refresh the data after saving to show the updated state
      await fetchSocialMediaForCreator(creatorId);
      
      return { success: true };
    } catch (error) {
      console.error('Error saving social media data:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }, [socialMediaData, fetchSocialMediaForCreator]);

  return {
    fetchSocialMediaForCreator,
    updateSocialMediaForCreator,
    addCustomSocialMedia,
    removeCustomSocialMedia,
    saveSocialMediaForCreator,
    getSocialMediaForCreator: (creatorId: string) => {
      const data = socialMediaData[creatorId];
      if (!data) {
        // Return empty data if no data exists for this creator
        return getEmptySocialMediaHandles();
      }
      return data;
    },
    loading
  };
};

function getEmptySocialMediaHandles(): SocialMediaHandles {
  return {
    instagram: '',
    tiktok: '',
    twitter: '',
    reddit: '',
    chaturbate: '',
    youtube: '',
    other: []
  };
}

function processSocialMediaData(data: any): SocialMediaHandles {
  // Start with empty structure
  const result: SocialMediaHandles = {
    instagram: '',
    tiktok: '',
    twitter: '',
    reddit: '',
    chaturbate: '',
    youtube: '',
    other: []
  };

  if (!data || typeof data !== 'object') {
    return result;
  }

  // Process each field from the database
  Object.entries(data).forEach(([key, value]) => {
    if (key === 'other' && Array.isArray(value)) {
      result.other = value;
    } else if (typeof value === 'string') {
      // Add all string fields to the result, whether they're predefined or not
      result[key] = value;
    }
  });

  console.log('Processed social media data result:', result);
  return result;
}
