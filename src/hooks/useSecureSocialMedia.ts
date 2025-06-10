
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
      console.log('Fetching social media data for creator:', creatorId);
      
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
      console.log('Saving social media for creator:', creatorId);
      console.log('Current social media data:', socialMediaData[creatorId]);

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
      
      // Create the socialMediaHandles object with the exact structure we want
      const updatedSocialMediaHandles = {
        instagram: socialMediaToSave.instagram || '',
        tiktok: socialMediaToSave.tiktok || '',
        twitter: socialMediaToSave.twitter || '',
        reddit: socialMediaToSave.reddit || '',
        chaturbate: socialMediaToSave.chaturbate || '',
        youtube: socialMediaToSave.youtube || '',
        onlyfans: socialMediaToSave.onlyfans || '',
        snapchat: socialMediaToSave.snapchat || '',
        other: otherForSaving
      };

      console.log('Social media handles to save:', updatedSocialMediaHandles);
      
      const updatedData = {
        ...currentData,
        socialMediaHandles: updatedSocialMediaHandles
      };

      console.log('Updated data to save:', updatedData);

      const { error: updateError } = await supabase
        .from('onboarding_submissions')
        .update({ data: updatedData })
        .eq('id', submissionData.id);

      if (updateError) {
        console.error('Update error:', updateError);
        throw updateError;
      }

      console.log('Successfully saved social media data');
      
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
    addOtherSocialMedia,
    removeOtherSocialMedia,
    saveSocialMediaForCreator,
    getSocialMediaForCreator: (creatorId: string) => {
      const data = socialMediaData[creatorId];
      if (!data) {
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
    onlyfans: '',
    snapchat: '',
    other: []
  };
}

function processSocialMediaData(data: any): SocialMediaHandles {
  const result: SocialMediaHandles = {
    instagram: '',
    tiktok: '',
    twitter: '',
    reddit: '',
    chaturbate: '',
    youtube: '',
    onlyfans: '',
    snapchat: '',
    other: []
  };

  if (!data || typeof data !== 'object') {
    return result;
  }

  // Handle predefined platforms
  const predefinedPlatforms = ['instagram', 'tiktok', 'twitter', 'reddit', 'chaturbate', 'youtube', 'onlyfans', 'snapchat'];
  
  predefinedPlatforms.forEach(platform => {
    if (typeof data[platform] === 'string') {
      result[platform] = data[platform];
    }
  });

  // Handle the 'other' array
  if (Array.isArray(data.other)) {
    result.other = data.other.map((item: any) => ({
      platform: item.platform || '',
      url: item.url || ''
    }));
  }

  console.log('Processed social media data result:', result);
  return result;
}
