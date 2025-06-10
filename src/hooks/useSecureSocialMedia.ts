
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
}

export const useSecureSocialMedia = () => {
  const [socialMediaData, setSocialMediaData] = useState<Record<string, SocialMediaHandles>>({});
  const [loading, setLoading] = useState(false);

  const fetchSocialMediaForCreator = useCallback(async (creatorId: string) => {
    if (socialMediaData[creatorId]) return socialMediaData[creatorId];

    setLoading(true);
    try {
      // First get the creator's email from the creators table
      const { data: creatorData, error: creatorError } = await supabase
        .from('creators')
        .select('email')
        .eq('id', creatorId)
        .single();

      if (creatorError || !creatorData?.email) {
        console.log('No creator email found for:', creatorId);
        return getEmptySocialMediaHandles();
      }

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
        return getEmptySocialMediaHandles();
      }

      if (!submissionData?.data) {
        return getEmptySocialMediaHandles();
      }

      const socialMediaHandles = submissionData.data.socialMediaHandles || {};
      const processedData = processSocialMediaData(socialMediaHandles);
      
      setSocialMediaData(prev => ({
        ...prev,
        [creatorId]: processedData
      }));

      return processedData;
    } catch (error) {
      console.error('Error in fetchSocialMediaForCreator:', error);
      return getEmptySocialMediaHandles();
    } finally {
      setLoading(false);
    }
  }, [socialMediaData]);

  const updateSocialMediaForCreator = useCallback((creatorId: string, platform: string, url: string) => {
    setSocialMediaData(prev => {
      const currentData = prev[creatorId] || getEmptySocialMediaHandles();
      
      if (platform === 'other') {
        // Handle 'other' platform differently - this shouldn't happen with current UI
        return prev;
      }

      return {
        ...prev,
        [creatorId]: {
          ...currentData,
          [platform]: url
        }
      };
    });
  }, []);

  const addCustomSocialMedia = useCallback((creatorId: string, platform: string, url: string) => {
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
      // Get the creator's email
      const { data: creatorData, error: creatorError } = await supabase
        .from('creators')
        .select('email')
        .eq('id', creatorId)
        .single();

      if (creatorError || !creatorData?.email) {
        throw new Error('Creator email not found');
      }

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
        throw new Error('Submission data not found');
      }

      // Update the socialMediaHandles in the data
      const updatedData = {
        ...submissionData.data,
        socialMediaHandles: socialMediaData[creatorId]
      };

      // Save back to database
      const { error: updateError } = await supabase
        .from('onboarding_submissions')
        .update({ data: updatedData })
        .eq('id', submissionData.id);

      if (updateError) {
        throw updateError;
      }

      return { success: true };
    } catch (error) {
      console.error('Error saving social media data:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }, [socialMediaData]);

  return {
    fetchSocialMediaForCreator,
    updateSocialMediaForCreator,
    addCustomSocialMedia,
    removeCustomSocialMedia,
    saveSocialMediaForCreator,
    getSocialMediaForCreator: (creatorId: string) => socialMediaData[creatorId] || getEmptySocialMediaHandles(),
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
  return {
    instagram: data.instagram || '',
    tiktok: data.tiktok || '',
    twitter: data.twitter || '',
    reddit: data.reddit || '',
    chaturbate: data.chaturbate || '',
    youtube: data.youtube || '',
    other: Array.isArray(data.other) ? data.other : []
  };
}
