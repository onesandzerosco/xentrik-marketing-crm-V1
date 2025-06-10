
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Save, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Creator } from '../../types';

interface SocialMediaAccount {
  platform: string;
  username: string;
  password: string;
  notes?: string;
}

interface SocialMediaHandles {
  tiktok: string;
  twitter: string;
  onlyfans: string;
  snapchat: string;
  instagram: string;
  other: SocialMediaAccount[];
}

interface SocialMediaManagerProps {
  creator: Creator;
}

const SocialMediaManager: React.FC<SocialMediaManagerProps> = ({ creator }) => {
  const [socialMediaData, setSocialMediaData] = useState<SocialMediaHandles>({
    tiktok: '',
    twitter: '',
    onlyfans: '',
    snapchat: '',
    instagram: '',
    other: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newPlatformName, setNewPlatformName] = useState('');
  const [showAddPlatform, setShowAddPlatform] = useState(false);
  const { toast } = useToast();

  // Fetch social media data from onboarding_submissions
  const fetchSocialMediaData = async () => {
    try {
      setLoading(true);
      console.log('=== FETCHING SOCIAL MEDIA DATA ===');
      console.log('Creator email:', creator.email);
      console.log('Creator name:', creator.name);
      
      const { data, error } = await supabase
        .from('onboarding_submissions')
        .select('data')
        .eq('email', creator.email)
        .single();

      console.log('Raw query result:', { data, error });

      if (error) {
        console.error('Error fetching social media data:', error);
        return;
      }

      // Log the entire data structure
      console.log('Full submission data:', data?.data);
      
      // Properly type cast the Json data
      const submissionData = data?.data as Record<string, any>;
      console.log('Parsed submission data:', submissionData);
      
      if (submissionData?.socialMediaHandles) {
        const handles = submissionData.socialMediaHandles as SocialMediaHandles;
        console.log('=== SOCIAL MEDIA HANDLES FOUND ===');
        console.log('Social media handles:', handles);
        console.log('TikTok:', handles.tiktok);
        console.log('Twitter:', handles.twitter);
        console.log('OnlyFans:', handles.onlyfans);
        console.log('Snapchat:', handles.snapchat);
        console.log('Instagram:', handles.instagram);
        console.log('Other platforms:', handles.other);
        
        setSocialMediaData({
          tiktok: handles.tiktok || '',
          twitter: handles.twitter || '',
          onlyfans: handles.onlyfans || '',
          snapchat: handles.snapchat || '',
          instagram: handles.instagram || '',
          other: handles.other || []
        });
      } else {
        console.log('=== NO SOCIAL MEDIA HANDLES FOUND ===');
        console.log('Available keys in submission data:', submissionData ? Object.keys(submissionData) : 'No data');
      }
    } catch (error) {
      console.error('Error in fetchSocialMediaData:', error);
    } finally {
      setLoading(false);
    }
  };

  // Save social media data back to onboarding_submissions
  const saveSocialMediaData = async () => {
    try {
      setSaving(true);
      console.log('=== SAVING SOCIAL MEDIA DATA ===');
      console.log('Data to save:', socialMediaData);

      // First, get current data
      const { data: currentData, error: fetchError } = await supabase
        .from('onboarding_submissions')
        .select('data')
        .eq('email', creator.email)
        .single();

      if (fetchError) {
        console.error('Error fetching current data:', fetchError);
        toast({
          title: "Error",
          description: "Failed to fetch current data",
          variant: "destructive",
        });
        return;
      }

      // Properly handle the existing data
      const existingData = (currentData?.data as Record<string, any>) || {};
      
      // Convert socialMediaData to a JSON-compatible format
      const socialMediaHandlesForSave = {
        tiktok: socialMediaData.tiktok,
        twitter: socialMediaData.twitter,
        onlyfans: socialMediaData.onlyfans,
        snapchat: socialMediaData.snapchat,
        instagram: socialMediaData.instagram,
        other: socialMediaData.other.map(account => ({
          platform: account.platform,
          username: account.username,
          password: account.password,
          notes: account.notes || ''
        }))
      };
      
      console.log('Social media data being saved:', socialMediaHandlesForSave);
      
      // Update the socialMediaHandles in the existing data
      const updatedData = {
        ...existingData,
        socialMediaHandles: socialMediaHandlesForSave
      };

      console.log('Full updated data structure:', updatedData);

      const { error: updateError } = await supabase
        .from('onboarding_submissions')
        .update({ data: updatedData })
        .eq('email', creator.email);

      if (updateError) {
        console.error('Error updating social media data:', updateError);
        toast({
          title: "Error", 
          description: "Failed to save social media data",
          variant: "destructive",
        });
        return;
      }

      console.log('Successfully saved social media data');
      toast({
        title: "Success",
        description: "Social media accounts saved successfully",
      });

      // Fetch fresh data after saving
      await fetchSocialMediaData();
    } catch (error) {
      console.error('Error in saveSocialMediaData:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Update predefined platform
  const updatePredefinedPlatform = (platform: keyof Omit<SocialMediaHandles, 'other'>, value: string) => {
    setSocialMediaData(prev => ({
      ...prev,
      [platform]: value
    }));
  };

  // Update other platform
  const updateOtherPlatform = (index: number, field: keyof SocialMediaAccount, value: string) => {
    setSocialMediaData(prev => ({
      ...prev,
      other: prev.other.map((account, i) => 
        i === index ? { ...account, [field]: value } : account
      )
    }));
  };

  // Add new platform
  const addNewPlatform = () => {
    if (!newPlatformName.trim()) return;

    setSocialMediaData(prev => ({
      ...prev,
      other: [...prev.other, {
        platform: newPlatformName,
        username: '',
        password: '',
        notes: ''
      }]
    }));

    setNewPlatformName('');
    setShowAddPlatform(false);
  };

  // Remove platform from other
  const removePlatform = (index: number) => {
    setSocialMediaData(prev => ({
      ...prev,
      other: prev.other.filter((_, i) => i !== index)
    }));
  };

  useEffect(() => {
    if (creator?.email) {
      fetchSocialMediaData();
    }
  }, [creator?.email]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center">
          <div className="text-sm text-muted-foreground">Loading social media data...</div>
        </div>
      </div>
    );
  }

  const predefinedPlatforms = [
    { key: 'tiktok' as const, label: 'TikTok' },
    { key: 'twitter' as const, label: 'Twitter' },
    { key: 'onlyfans' as const, label: 'OnlyFans' },
    { key: 'snapchat' as const, label: 'Snapchat' },
    { key: 'instagram' as const, label: 'Instagram' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Social Media Accounts</h3>
        
        <Tabs defaultValue="platforms">
          <TabsList className="mb-4">
            <TabsTrigger value="platforms" className="rounded-[15px]">
              Platforms
            </TabsTrigger>
            <TabsTrigger value="other" className="rounded-[15px]">
              Other Platforms ({socialMediaData.other.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="platforms">
            <div className="space-y-4">
              {predefinedPlatforms.map(({ key, label }) => (
                <div key={key} className="space-y-2">
                  <Label>{label}</Label>
                  <Input
                    placeholder={`${label} username`}
                    value={socialMediaData[key]}
                    onChange={(e) => updatePredefinedPlatform(key, e.target.value)}
                    className="rounded-[15px]"
                  />
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="other">
            <div className="space-y-6">
              {socialMediaData.other.map((account, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium capitalize">{account.platform}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removePlatform(index)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Username</Label>
                      <Input
                        placeholder="Username"
                        value={account.username}
                        onChange={(e) => updateOtherPlatform(index, 'username', e.target.value)}
                        className="rounded-[15px]"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Password</Label>
                      <Input
                        type="password"
                        placeholder="Password"
                        value={account.password}
                        onChange={(e) => updateOtherPlatform(index, 'password', e.target.value)}
                        className="rounded-[15px]"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Input
                      placeholder="Additional notes"
                      value={account.notes || ''}
                      onChange={(e) => updateOtherPlatform(index, 'notes', e.target.value)}
                      className="rounded-[15px]"
                    />
                  </div>
                </div>
              ))}

              {showAddPlatform ? (
                <div className="border rounded-lg p-4 space-y-3">
                  <Label>Platform Name</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter platform name"
                      value={newPlatformName}
                      onChange={(e) => setNewPlatformName(e.target.value)}
                      className="rounded-[15px]"
                    />
                    <Button onClick={addNewPlatform} className="rounded-[15px]">
                      Add
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowAddPlatform(false);
                        setNewPlatformName('');
                      }}
                      className="rounded-[15px]"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setShowAddPlatform(true)}
                  className="w-full rounded-[15px]"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Platform
                </Button>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 pt-4 border-t">
          <Button 
            onClick={saveSocialMediaData}
            disabled={saving}
            className="w-full rounded-[15px]"
            variant="premium"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save All Social Media Accounts'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SocialMediaManager;
