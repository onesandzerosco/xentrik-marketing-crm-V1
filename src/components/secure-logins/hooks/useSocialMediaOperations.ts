
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SocialMediaLogin, OnboardingSubmissionData } from '../types';

export const useSocialMediaOperations = (creatorEmail: string) => {
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const updateOnboardingSubmissionData = async (updatedLogins: SocialMediaLogin[]) => {
    try {
      console.log('=== UPDATING ONBOARDING SUBMISSION JSON ===');
      
      const { data: submissionData, error: fetchError } = await supabase
        .from('onboarding_submissions')
        .select('data')
        .eq('email', creatorEmail)
        .single();

      if (fetchError) {
        console.warn('No onboarding submission found to update:', fetchError);
        return;
      }

      const currentData = submissionData.data as OnboardingSubmissionData;
      
      const socialMediaHandles: any = {
        instagram: '',
        twitter: '',
        tiktok: '',
        onlyfans: '',
        snapchat: '',
        other: []
      };

      updatedLogins.forEach(login => {
        const platformKey = login.platform.toLowerCase();
        
        if (['instagram', 'twitter', 'tiktok', 'onlyfans', 'snapchat'].includes(platformKey)) {
          socialMediaHandles[platformKey] = login.username || '';
        } else if (login.username) {
          socialMediaHandles.other.push({
            platform: login.platform,
            handle: login.username
          });
        }
      });

      const updatedData: OnboardingSubmissionData = {
        ...currentData,
        contentAndService: {
          ...currentData.contentAndService,
          socialMediaHandles
        }
      };

      const { error: updateError } = await supabase
        .from('onboarding_submissions')
        .update({ data: updatedData as any })
        .eq('email', creatorEmail);

      if (updateError) {
        console.error('Error updating onboarding submission:', updateError);
        toast({
          title: "Warning",
          description: "Social media logins saved but failed to update onboarding data",
          variant: "destructive",
        });
      } else {
        console.log('Successfully updated onboarding submission JSON');
      }
    } catch (error) {
      console.error('Error in updateOnboardingSubmissionData:', error);
    }
  };

  const saveSocialMediaLogin = async (login: Partial<SocialMediaLogin>) => {
    try {
      setSaving(true);
      console.log('=== SAVING SOCIAL MEDIA LOGIN ===');

      if (login.id && !login.id.startsWith('placeholder-') && !login.id.startsWith('onboarding-')) {
        const { error } = await supabase
          .from('social_media_logins')
          .update({
            username: login.username || '',
            password: login.password || '',
            notes: login.notes || ''
          })
          .eq('id', login.id);

        if (error) {
          console.error('Error updating social media login:', error);
          toast({
            title: "Error",
            description: "Failed to update social media account",
            variant: "destructive",
          });
          return false;
        }
      } else {
        const { error } = await supabase
          .from('social_media_logins')
          .insert({
            creator_email: creatorEmail,
            platform: login.platform!,
            username: login.username || '',
            password: login.password || '',
            notes: login.notes || '',
            is_predefined: login.is_predefined || false
          });

        if (error) {
          console.error('Error creating social media login:', error);
          toast({
            title: "Error",
            description: "Failed to create social media account",
            variant: "destructive",
          });
          return false;
        }
      }

      toast({
        title: "Success",
        description: "Social media account saved successfully",
      });
      return true;
    } catch (error) {
      console.error('Error in saveSocialMediaLogin:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const addNewPlatform = async (platformName: string) => {
    try {
      const { error } = await supabase
        .from('social_media_logins')
        .insert({
          creator_email: creatorEmail,
          platform: platformName,
          username: '',
          password: '',
          notes: '',
          is_predefined: false
        });

      if (error) {
        console.error('Error adding new platform:', error);
        toast({
          title: "Error",
          description: "Failed to add new platform",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Success",
        description: `${platformName} platform added successfully`,
      });
      return true;
    } catch (error) {
      console.error('Error in addNewPlatform:', error);
      return false;
    }
  };

  const removePlatform = async (id: string, platform: string, predefinedPlatforms: string[]) => {
    if (predefinedPlatforms.includes(platform)) {
      return 'clear'; // Signal to clear data instead of delete
    }

    if (id.startsWith('onboarding-')) {
      return 'remove'; // Signal to remove from local state
    }

    try {
      const { error } = await supabase
        .from('social_media_logins')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error removing platform:', error);
        toast({
          title: "Error",
          description: "Failed to remove platform",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Success",
        description: `${platform} platform removed successfully`,
      });
      return true;
    } catch (error) {
      console.error('Error in removePlatform:', error);
      return false;
    }
  };

  return {
    saving,
    saveSocialMediaLogin,
    addNewPlatform,
    removePlatform,
    updateOnboardingSubmissionData
  };
};
