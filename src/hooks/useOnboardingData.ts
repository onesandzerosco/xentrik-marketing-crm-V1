
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SocialMediaHandles {
  [platform: string]: string;
}

interface OnboardingData {
  socialMediaHandles?: SocialMediaHandles;
  [key: string]: any;
}

export const useOnboardingData = (creatorId: string) => {
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchOnboardingData = useCallback(async () => {
    if (!creatorId) return;
    
    setLoading(true);
    try {
      // Find the submission by creator name (assuming creatorId contains the name)
      const { data: submissions, error } = await supabase
        .from('onboarding_submissions')
        .select('*')
        .ilike('name', `%${creatorId.replace('-', ' ')}%`)
        .eq('status', 'accepted')
        .limit(1);

      if (error) {
        console.error('Error fetching onboarding data:', error);
        return;
      }

      if (submissions && submissions.length > 0) {
        const submission = submissions[0];
        let parsedData: OnboardingData = {};
        
        if (typeof submission.data === 'string') {
          try {
            parsedData = JSON.parse(submission.data);
          } catch (e) {
            console.error('Error parsing submission data:', e);
          }
        } else if (typeof submission.data === 'object' && submission.data !== null) {
          parsedData = submission.data as OnboardingData;
        }
        
        setOnboardingData(parsedData);
        console.log('Fetched onboarding data:', parsedData);
      }
    } catch (error) {
      console.error('Error in fetchOnboardingData:', error);
    } finally {
      setLoading(false);
    }
  }, [creatorId]);

  const updateSocialMediaHandles = useCallback(async (updatedHandles: SocialMediaHandles) => {
    if (!creatorId || !onboardingData) return;

    try {
      const updatedData = {
        ...onboardingData,
        socialMediaHandles: updatedHandles
      };

      // Find the submission to update
      const { data: submissions, error: fetchError } = await supabase
        .from('onboarding_submissions')
        .select('id')
        .ilike('name', `%${creatorId.replace('-', ' ')}%`)
        .eq('status', 'accepted')
        .limit(1);

      if (fetchError || !submissions || submissions.length === 0) {
        console.error('Error finding submission to update:', fetchError);
        return false;
      }

      const { error: updateError } = await supabase
        .from('onboarding_submissions')
        .update({ data: updatedData })
        .eq('id', submissions[0].id);

      if (updateError) {
        console.error('Error updating onboarding data:', updateError);
        toast({
          title: "Error",
          description: "Failed to update social media accounts",
          variant: "destructive",
        });
        return false;
      }

      setOnboardingData(updatedData);
      toast({
        title: "Success",
        description: "Social media accounts updated successfully",
      });
      return true;
    } catch (error) {
      console.error('Error in updateSocialMediaHandles:', error);
      return false;
    }
  }, [creatorId, onboardingData, toast]);

  useEffect(() => {
    fetchOnboardingData();
  }, [fetchOnboardingData]);

  return {
    onboardingData,
    socialMediaHandles: onboardingData?.socialMediaHandles || {},
    loading,
    updateSocialMediaHandles,
    refetch: fetchOnboardingData
  };
};
