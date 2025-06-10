
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
      console.log('Fetching onboarding data for creator:', creatorId);
      
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

      console.log('Raw submissions data:', submissions);

      if (submissions && submissions.length > 0) {
        const submission = submissions[0];
        console.log('Found submission:', submission);
        console.log('Raw submission data:', submission.data);
        
        let parsedData: OnboardingData = {};
        
        if (typeof submission.data === 'string') {
          try {
            parsedData = JSON.parse(submission.data);
            console.log('Parsed JSON data:', parsedData);
          } catch (e) {
            console.error('Error parsing submission data:', e);
          }
        } else if (typeof submission.data === 'object' && submission.data !== null) {
          parsedData = submission.data as OnboardingData;
          console.log('Direct object data:', parsedData);
        }
        
        console.log('Final parsed data:', parsedData);
        console.log('Social media handles from data:', parsedData.socialMediaHandles);
        
        setOnboardingData(parsedData);
      } else {
        console.log('No submissions found for creator:', creatorId);
        setOnboardingData(null);
      }
    } catch (error) {
      console.error('Error in fetchOnboardingData:', error);
    } finally {
      setLoading(false);
    }
  }, [creatorId]);

  const updateSocialMediaHandles = useCallback(async (updatedHandles: SocialMediaHandles) => {
    if (!creatorId || !onboardingData) {
      console.log('Missing creatorId or onboardingData:', { creatorId, onboardingData });
      return false;
    }

    try {
      console.log('Updating social media handles:', updatedHandles);
      
      const updatedData = {
        ...onboardingData,
        socialMediaHandles: updatedHandles
      };

      console.log('Updated data to save:', updatedData);

      // Find the submission to update
      const { data: submissions, error: fetchError } = await supabase
        .from('onboarding_submissions')
        .select('id')
        .ilike('name', `%${creatorId.replace('-', ' ')}%`)
        .eq('status', 'accepted')
        .limit(1);

      if (fetchError || !submissions || submissions.length === 0) {
        console.error('Error finding submission to update:', fetchError);
        toast({
          title: "Error",
          description: "Could not find creator's onboarding data to update",
          variant: "destructive",
        });
        return false;
      }

      console.log('Found submission to update:', submissions[0]);

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
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    }
  }, [creatorId, onboardingData, toast]);

  useEffect(() => {
    fetchOnboardingData();
  }, [fetchOnboardingData]);

  const socialMediaHandles = onboardingData?.socialMediaHandles || {};
  console.log('Returning social media handles:', socialMediaHandles);

  return {
    onboardingData,
    socialMediaHandles,
    loading,
    updateSocialMediaHandles,
    refetch: fetchOnboardingData
  };
};
