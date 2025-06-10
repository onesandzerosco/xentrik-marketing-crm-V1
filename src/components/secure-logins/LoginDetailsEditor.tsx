
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Save } from 'lucide-react';
import { Creator } from '../../types';
import { useToast } from '@/hooks/use-toast';
import { LoginDetail } from '@/hooks/useSecureLogins';
import SocialMediaAccountsEditor from './SocialMediaAccountsEditor';
import { useCreators } from '@/context/creator';
import { supabase } from '@/integrations/supabase/client';

interface LoginDetailsEditorProps {
  creator: Creator;
  loginDetails: {
    [platform: string]: LoginDetail;
  };
  onUpdateLogin: (platform: string, field: string, value: string) => void;
  onSaveLoginDetails: (platform: string) => void;
}

interface OnboardingData {
  personalInfo?: any;
  contentAndService?: {
    socialMediaHandles?: {
      instagram?: string;
      twitter?: string;
      tiktok?: string;
      onlyfans?: string;
      snapchat?: string;
      other?: Array<{
        platform: string;
        handle: string;
      }>;
    };
  };
  socialMediaHandles?: {
    instagram?: string;
    twitter?: string;
    tiktok?: string;
    onlyfans?: string;
    snapchat?: string;
    other?: Array<{
      platform: string;
      handle: string;
    }>;
  };
}

const LoginDetailsEditor: React.FC<LoginDetailsEditorProps> = ({
  creator,
  loginDetails,
  onUpdateLogin,
  onSaveLoginDetails
}) => {
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [socialMediaHandles, setSocialMediaHandles] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { updateCreator } = useCreators();

  // Fetch social media handles from onboarding_submissions
  useEffect(() => {
    const fetchSocialMediaData = async () => {
      try {
        setLoading(true);
        console.log('Fetching social media data for creator:', creator.name);
        
        // Try to find onboarding submission by creator name or email
        const { data: submissions, error } = await supabase
          .from('onboarding_submissions')
          .select('data')
          .or(`name.eq.${creator.name},email.eq.${creator.email}`)
          .order('submitted_at', { ascending: false })
          .limit(1);

        if (error) {
          console.error('Error fetching onboarding submissions:', error);
          return;
        }

        if (submissions && submissions.length > 0) {
          const submissionData = submissions[0].data as OnboardingData;
          console.log('Found submission data:', submissionData);
          
          // Extract social media handles from the submission data
          const handles = submissionData?.socialMediaHandles || 
                         submissionData?.contentAndService?.socialMediaHandles ||
                         null;
          
          console.log('Extracted social media handles:', handles);
          setSocialMediaHandles(handles);
        } else {
          console.log('No onboarding submission found for creator');
          setSocialMediaHandles(null);
        }
      } catch (error) {
        console.error('Error fetching social media data:', error);
        setSocialMediaHandles(null);
      } finally {
        setLoading(false);
      }
    };

    if (creator.name || creator.email) {
      fetchSocialMediaData();
    } else {
      setLoading(false);
    }
  }, [creator.name, creator.email]);

  const togglePasswordVisibility = (platform: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [platform]: !prev[platform]
    }));
  };

  const getLoginDetail = (platform: string, field: keyof LoginDetail) => {
    if (!loginDetails[platform]) return "";
    return loginDetails[platform][field] || "";
  };

  const handleInputChange = (platform: string, field: string, value: string) => {
    onUpdateLogin(platform, field, value);
  };

  const handleUpdateSocialMedia = async (updatedHandles: any) => {
    try {
      console.log('Updating social media handles:', updatedHandles);
      
      // First, update the onboarding_submissions table
      const { error: submissionError } = await supabase
        .from('onboarding_submissions')
        .update({ 
          data: {
            ...socialMediaHandles,
            socialMediaHandles: updatedHandles
          }
        })
        .or(`name.eq.${creator.name},email.eq.${creator.email}`);

      if (submissionError) {
        console.error('Error updating onboarding submission:', submissionError);
        throw submissionError;
      }

      // Also update the creator's model_profile if it exists
      if (creator.model_profile) {
        let updatedModelProfile;
        
        if (typeof creator.model_profile === 'string') {
          try {
            const parsed = JSON.parse(creator.model_profile);
            updatedModelProfile = {
              ...parsed,
              socialMediaHandles: updatedHandles
            };
          } catch (e) {
            updatedModelProfile = { socialMediaHandles: updatedHandles };
          }
        } else {
          updatedModelProfile = {
            ...creator.model_profile,
            socialMediaHandles: updatedHandles
          };
        }

        await updateCreator(creator.id, {
          model_profile: updatedModelProfile
        });
      }

      // Update local state
      setSocialMediaHandles(updatedHandles);

      toast({
        title: "Social Media Updated",
        description: "Social media accounts have been saved successfully",
      });
    } catch (error) {
      console.error('Error updating social media:', error);
      toast({
        title: "Error",
        description: "Failed to update social media accounts",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center p-8">
          <div className="text-muted-foreground">Loading social media data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Social Media Accounts Section */}
      <SocialMediaAccountsEditor 
        socialMediaHandles={socialMediaHandles}
        onUpdateSocialMedia={handleUpdateSocialMedia}
      />

      {/* Login Details Section */}
      <Card>
        <CardHeader>
          <CardTitle>{creator.name}'s Login Details</CardTitle>
          <CardDescription>
            Securely store login information for {creator.name}'s social media accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={Object.keys(creator.socialLinks).find(key => creator.socialLinks[key as keyof typeof creator.socialLinks]) || "instagram"}>
            <TabsList className="mb-4">
              {Object.entries(creator.socialLinks)
                .filter(([_, url]) => url)
                .map(([platform, _]) => (
                  <TabsTrigger key={platform} value={platform} className="capitalize rounded-[15px]">
                    {platform}
                  </TabsTrigger>
                ))}
            </TabsList>
            
            {Object.entries(creator.socialLinks)
              .filter(([_, url]) => url)
              .map(([platform, url]) => (
                <TabsContent key={platform} value={platform}>
                  <div className="space-y-4">
                    <div>
                      <Label>Account URL</Label>
                      <div className="p-2 border rounded-[15px] mt-1 bg-muted/30">
                        {url}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Username</Label>
                      <Input 
                        placeholder="Enter username"
                        value={getLoginDetail(platform, "username")}
                        onChange={(e) => handleInputChange(platform, "username", e.target.value)}
                        className="rounded-[15px]"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Password</Label>
                      <div className="flex">
                        <Input 
                          type={showPasswords[platform] ? "text" : "password"}
                          placeholder="Enter password"
                          value={getLoginDetail(platform, "password")}
                          onChange={(e) => handleInputChange(platform, "password", e.target.value)}
                          className="flex-1 rounded-[15px]"
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="icon"
                          onClick={() => togglePasswordVisibility(platform)}
                          className="ml-2 rounded-[15px] transition-all duration-300 hover:opacity-90"
                        >
                          {showPasswords[platform] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Additional Notes</Label>
                      <Input 
                        placeholder="Any additional information"
                        value={getLoginDetail(platform, "notes")}
                        onChange={(e) => handleInputChange(platform, "notes", e.target.value)}
                        className="rounded-[15px]"
                      />
                    </div>
                    
                    <Button 
                      onClick={() => onSaveLoginDetails(platform)}
                      className="w-full mt-4 rounded-[15px]"
                      variant="premium"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save {platform} Login Details
                    </Button>
                  </div>
                </TabsContent>
              ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginDetailsEditor;
