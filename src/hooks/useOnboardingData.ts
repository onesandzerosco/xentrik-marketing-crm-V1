
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
      console.log('Fetching onboarding data for creator ID:', creatorId);
      
      // First try to find by exact creator name match
      const creatorNameQuery = creatorId.replace('-', ' ');
      console.log('Searching for creator name:', creatorNameQuery);
      
      const { data: submissions, error } = await supabase
        .from('onboarding_submissions')
        .select('*')
        .eq('status', 'accepted')
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('Error fetching onboarding submissions:', error);
        return;
      }

      console.log('All accepted submissions:', submissions);

      if (submissions && submissions.length > 0) {
        // Try to find the submission by name matching
        let submission = submissions.find(sub => 
          sub.name.toLowerCase().includes(creatorNameQuery.toLowerCase()) ||
          creatorNameQuery.toLowerCase().includes(sub.name.toLowerCase())
        );

        // If no name match, take the first one for now (you might want to improve this logic)
        if (!submission) {
          console.log('No exact name match found, using first submission');
          submission = submissions[0];
        }

        console.log('Using submission:', submission);
        console.log('Raw submission data column:', submission.data);
        
        let parsedData: OnboardingData = {};
        
        // Handle different data formats
        if (typeof submission.data === 'string') {
          try {
            parsedData = JSON.parse(submission.data);
            console.log('Parsed data from string:', parsedData);
          } catch (e) {
            console.error('Error parsing submission data as JSON:', e);
            parsedData = {};
          }
        } else if (typeof submission.data === 'object' && submission.data !== null) {
          parsedData = submission.data as OnboardingData;
          console.log('Using data as object:', parsedData);
        }
        
        console.log('Final parsed data:', parsedData);
        console.log('Social media handles found:', parsedData.socialMediaHandles);
        
        setOnboardingData(parsedData);
      } else {
        console.log('No accepted submissions found');
        setOnboardingData(null);
      }
    } catch (error) {
      console.error('Error in fetchOnboardingData:', error);
      setOnboardingData(null);
    } finally {
      setLoading(false);
    }
  }, [creatorId]);

  const updateSocialMediaHandles = useCallback(async (updatedHandles: SocialMediaHandles) => {
    if (!creatorId || !onboardingData) {
      console.log('Missing creatorId or onboardingData for update');
      return false;
    }

    try {
      console.log('Updating social media handles:', updatedHandles);
      
      const updatedData = {
        ...onboardingData,
        socialMediaHandles: updatedHandles
      };

      console.log('Updated data to save:', updatedData);

      // Find the submission to update using the same logic as fetch
      const creatorNameQuery = creatorId.replace('-', ' ');
      
      const { data: submissions, error: fetchError } = await supabase
        .from('onboarding_submissions')
        .select('id, name')
        .eq('status', 'accepted')
        .order('submitted_at', { ascending: false });

      if (fetchError || !submissions || submissions.length === 0) {
        console.error('Error finding submission to update:', fetchError);
        toast({
          title: "Error",
          description: "Could not find creator's onboarding data to update",
          variant: "destructive",
        });
        return false;
      }

      // Find the matching submission
      let targetSubmission = submissions.find(sub => 
        sub.name.toLowerCase().includes(creatorNameQuery.toLowerCase()) ||
        creatorNameQuery.toLowerCase().includes(sub.name.toLowerCase())
      );

      if (!targetSubmission) {
        targetSubmission = submissions[0];
      }

      console.log('Updating submission ID:', targetSubmission.id);

      const { error: updateError } = await supabase
        .from('onboarding_submissions')
        .update({ data: updatedData })
        .eq('id', targetSubmission.id);

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
  console.log('Hook returning social media handles:', socialMediaHandles);

  return {
    onboardingData,
    socialMediaHandles,
    loading,
    updateSocialMediaHandles,
    refetch: fetchOnboardingData
  };
};
