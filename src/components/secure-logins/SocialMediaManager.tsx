
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Save, Trash2, Edit, Eye, EyeOff } from 'lucide-react';
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
  const [isEditing, setIsEditing] = useState(false);
  const [newPlatformName, setNewPlatformName] = useState('');
  const [showAddPlatform, setShowAddPlatform] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
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
      
      // Look for contentAndService.socialMediaHandles
      if (submissionData?.contentAndService?.socialMediaHandles) {
        const handles = submissionData.contentAndService.socialMediaHandles as SocialMediaHandles;
        console.log('=== SOCIAL MEDIA HANDLES FOUND IN contentAndService ===');
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
        console.log('=== NO SOCIAL MEDIA HANDLES FOUND IN contentAndService ===');
        console.log('Available keys in submission data:', submissionData ? Object.keys(submissionData) : 'No data');
        console.log('contentAndService data:', submissionData?.contentAndService);
        if (submissionData?.contentAndService) {
          console.log('Keys in contentAndService:', Object.keys(submissionData.contentAndService));
        }
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
      
      // Update the socialMediaHandles in contentAndService
      const updatedData = {
        ...existingData,
        contentAndService: {
          ...(existingData.contentAndService || {}),
          socialMediaHandles: socialMediaHandlesForSave
        }
      };

      console.log('Full updated data structure:', updatedData);

      const { error: updateError } = await supabase
        .from('onboarding_submissions')
        .update({ data: updatedData as any })
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

      setIsEditing(false);
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

  // Toggle password visibility
  const togglePasswordVisibility = (platform: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [platform]: !prev[platform]
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
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Social Media Accounts</h3>
        {!isEditing ? (
          <Button 
            onClick={() => setIsEditing(true)}
            variant="outline"
            className="rounded-[15px]"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button 
              onClick={saveSocialMediaData}
              disabled={saving}
              className="rounded-[15px]"
              variant="premium"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
            <Button 
              variant="outline"
              onClick={() => setIsEditing(false)}
              className="rounded-[15px]"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
        
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
                {isEditing ? (
                  <Input
                    placeholder={`${label} username`}
                    value={socialMediaData[key]}
                    onChange={(e) => updatePredefinedPlatform(key, e.target.value)}
                    className="rounded-[15px]"
                  />
                ) : (
                  <div className="p-2 border rounded-[15px] mt-1 bg-muted/30">
                    {socialMediaData[key] ? `@${socialMediaData[key]}` : 'Not set'}
                  </div>
                )}
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
                  {isEditing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removePlatform(index)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Username</Label>
                    {isEditing ? (
                      <Input
                        placeholder="Username"
                        value={account.username}
                        onChange={(e) => updateOtherPlatform(index, 'username', e.target.value)}
                        className="rounded-[15px]"
                      />
                    ) : (
                      <div className="p-2 border rounded-[15px] mt-1 bg-muted/30">
                        {account.username ? `@${account.username}` : 'Not set'}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Password</Label>
                    {isEditing ? (
                      <div className="flex">
                        <Input
                          type={showPasswords[`${account.platform}-${index}`] ? 'text' : 'password'}
                          placeholder="Password"
                          value={account.password}
                          onChange={(e) => updateOtherPlatform(index, 'password', e.target.value)}
                          className="rounded-[15px] flex-1"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePasswordVisibility(`${account.platform}-${index}`)}
                          className="ml-2"
                        >
                          {showPasswords[`${account.platform}-${index}`] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="p-2 border rounded-[15px] mt-1 bg-muted/30 flex-1">
                          {account.password ? (
                            showPasswords[`${account.platform}-${index}`] ? account.password : '••••••••'
                          ) : 'Not set'}
                        </div>
                        {account.password && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => togglePasswordVisibility(`${account.platform}-${index}`)}
                          >
                            {showPasswords[`${account.platform}-${index}`] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Notes</Label>
                  {isEditing ? (
                    <Input
                      placeholder="Additional notes"
                      value={account.notes || ''}
                      onChange={(e) => updateOtherPlatform(index, 'notes', e.target.value)}
                      className="rounded-[15px]"
                    />
                  ) : (
                    <div className="p-2 border rounded-[15px] mt-1 bg-muted/30">
                      {account.notes || 'No notes'}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isEditing && (
              <>
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
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SocialMediaManager;
