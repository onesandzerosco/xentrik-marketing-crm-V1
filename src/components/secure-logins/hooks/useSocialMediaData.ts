
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SocialMediaLogin, OnboardingSubmissionData } from '../types';

export const useSocialMediaData = (creatorEmail: string) => {
  const [socialMediaLogins, setSocialMediaLogins] = useState<SocialMediaLogin[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const predefinedPlatforms = ['TikTok', 'Twitter', 'OnlyFans', 'Snapchat', 'Instagram'];

  const fetchSocialMediaLogins = async () => {
    try {
      setLoading(true);
      console.log('=== FETCHING SOCIAL MEDIA LOGINS ===');
      
      const { data, error } = await supabase
        .from('social_media_logins')
        .select('*')
        .eq('creator_email', creatorEmail)
        .order('is_predefined', { ascending: false })
        .order('platform');

      if (error) {
        console.error('Error fetching social media logins:', error);
        toast({
          title: "Error",
          description: "Failed to fetch social media accounts",
          variant: "destructive",
        });
        return;
      }

      const existingPlatforms = new Map((data || []).map(login => [login.platform, login]));
      const allLogins = [...(data || [])];
      
      // Fetch additional "other" platforms from onboarding submission
      try {
        const { data: submissionData, error: submissionError } = await supabase
          .from('onboarding_submissions')
          .select('data')
          .eq('email', creatorEmail)
          .single();

        if (!submissionError && submissionData?.data) {
          const typedData = submissionData.data as OnboardingSubmissionData;
          const otherPlatforms = typedData.contentAndService?.socialMediaHandles?.other;
          
          if (otherPlatforms && Array.isArray(otherPlatforms)) {
            otherPlatforms.forEach((otherPlatform: { platform: string; handle: string }) => {
              if (!existingPlatforms.has(otherPlatform.platform) && otherPlatform.platform && otherPlatform.handle) {
                allLogins.push({
                  id: `onboarding-${otherPlatform.platform.toLowerCase()}`,
                  creator_email: creatorEmail,
                  platform: otherPlatform.platform,
                  username: otherPlatform.handle,
                  password: '',
                  notes: 'From onboarding submission',
                  is_predefined: false,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                });
              }
            });
          }
        }
      } catch (submissionError) {
        console.warn('Could not fetch onboarding submission data:', submissionError);
      }
      
      // Always ensure predefined platforms are present
      const finalLogins = [...allLogins];
      const currentPlatforms = new Set(finalLogins.map(login => login.platform));
      
      predefinedPlatforms.forEach(platform => {
        if (!currentPlatforms.has(platform)) {
          finalLogins.push({
            id: `placeholder-${platform.toLowerCase()}`,
            creator_email: creatorEmail,
            platform,
            username: '',
            password: '',
            notes: '',
            is_predefined: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }
      });
      
      finalLogins.sort((a, b) => {
        if (a.is_predefined && !b.is_predefined) return -1;
        if (!a.is_predefined && b.is_predefined) return 1;
        return a.platform.localeCompare(b.platform);
      });

      setSocialMediaLogins(finalLogins);
    } catch (error) {
      console.error('Error in fetchSocialMediaLogins:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (creatorEmail) {
      fetchSocialMediaLogins();
    }
  }, [creatorEmail]);

  return {
    socialMediaLogins,
    setSocialMediaLogins,
    loading,
    predefinedPlatforms,
    fetchSocialMediaLogins
  };
};
