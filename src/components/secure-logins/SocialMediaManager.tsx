
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Save, ExternalLink } from 'lucide-react';
import { Creator } from '../../types';
import { useToast } from '@/hooks/use-toast';
import { useSecureSocialMedia } from '@/hooks/useSecureSocialMedia';

interface SocialMediaManagerProps {
  creator: Creator;
}

const SocialMediaManager: React.FC<SocialMediaManagerProps> = ({ creator }) => {
  const { toast } = useToast();
  const {
    fetchSocialMediaForCreator,
    updateSocialMediaForCreator,
    addCustomSocialMedia,
    removeCustomSocialMedia,
    saveSocialMediaForCreator,
    getSocialMediaForCreator,
    loading
  } = useSecureSocialMedia();

  const [newCustomPlatform, setNewCustomPlatform] = useState('');
  const [newCustomUrl, setNewCustomUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Fetch data whenever creator changes
  useEffect(() => {
    console.log('Creator changed, fetching data for:', creator.id, creator.name);
    fetchSocialMediaForCreator(creator.id);
  }, [creator.id, fetchSocialMediaForCreator]);

  const socialMediaData = getSocialMediaForCreator(creator.id);

  const handleInputChange = (platform: string, value: string) => {
    console.log('Input changed:', platform, value, 'for creator:', creator.id);
    updateSocialMediaForCreator(creator.id, platform, value);
  };

  const handleAddCustomPlatform = () => {
    if (newCustomPlatform.trim() && newCustomUrl.trim()) {
      console.log('Adding custom platform:', newCustomPlatform, newCustomUrl);
      addCustomSocialMedia(creator.id, newCustomPlatform.trim(), newCustomUrl.trim());
      setNewCustomPlatform('');
      setNewCustomUrl('');
      toast({
        title: "Custom Platform Added",
        description: `Added ${newCustomPlatform} to social media accounts`,
      });
    }
  };

  const handleRemoveCustomPlatform = (index: number) => {
    console.log('Removing custom platform at index:', index);
    removeCustomSocialMedia(creator.id, index);
    toast({
      title: "Platform Removed",
      description: "Custom platform has been removed",
    });
  };

  const handleSave = async () => {
    console.log('Starting save process for creator:', creator.id);
    setIsSaving(true);
    try {
      const result = await saveSocialMediaForCreator(creator.id);
      if (result.success) {
        toast({
          title: "Social Media Saved",
          description: "All social media accounts have been saved successfully",
        });
        console.log('Save successful');
      } else {
        console.error('Save failed:', result.error);
        toast({
          title: "Save Failed",
          description: result.error || "Failed to save social media accounts",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Save Failed",
        description: "An error occurred while saving",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const predefinedPlatforms = [
    { key: 'instagram', label: 'Instagram', icon: '📷' },
    { key: 'tiktok', label: 'TikTok', icon: '🎵' },
    { key: 'twitter', label: 'Twitter/X', icon: '🐦' },
    { key: 'reddit', label: 'Reddit', icon: '🤖' },
    { key: 'chaturbate', label: 'Chaturbate', icon: '💬' },
    { key: 'youtube', label: 'YouTube', icon: '📺' }
  ];

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading social media data for {creator.name}...</div>
        </CardContent>
      </Card>
    );
  }

  console.log('Rendering social media data for creator:', creator.name, socialMediaData);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{creator.name}'s Social Media Accounts</CardTitle>
        <CardDescription>
          Manage social media accounts from onboarding data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="predefined">
          <TabsList className="mb-4">
            <TabsTrigger value="predefined" className="rounded-[15px]">
              Standard Platforms
            </TabsTrigger>
            <TabsTrigger value="custom" className="rounded-[15px]">
              Custom Platforms
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="predefined">
            <div className="space-y-4">
              {predefinedPlatforms.map((platform) => {
                const value = socialMediaData[platform.key as keyof typeof socialMediaData] as string || '';
                return (
                  <div key={platform.key} className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <span>{platform.icon}</span>
                      {platform.label}
                    </Label>
                    <div className="flex gap-2">
                      <Input 
                        placeholder={value ? value : `Enter ${platform.label} URL or "Not provided"`}
                        value={value}
                        onChange={(e) => handleInputChange(platform.key, e.target.value)}
                        className="rounded-[15px]"
                      />
                      {value && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => window.open(value, '_blank')}
                          className="rounded-[15px]"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    {!value && (
                      <p className="text-sm text-muted-foreground">Not provided</p>
                    )}
                  </div>
                );
              })}
            </div>
          </TabsContent>
          
          <TabsContent value="custom">
            <div className="space-y-4">
              <div className="p-4 border rounded-[15px] bg-muted/30">
                <h4 className="font-medium mb-3">Add Custom Platform</h4>
                <div className="space-y-3">
                  <div>
                    <Label>Platform Name</Label>
                    <Input 
                      placeholder="e.g., OnlyFans, Twitch, etc."
                      value={newCustomPlatform}
                      onChange={(e) => setNewCustomPlatform(e.target.value)}
                      className="rounded-[15px]"
                    />
                  </div>
                  <div>
                    <Label>URL</Label>
                    <Input 
                      placeholder="https://..."
                      value={newCustomUrl}
                      onChange={(e) => setNewCustomUrl(e.target.value)}
                      className="rounded-[15px]"
                    />
                  </div>
                  <Button 
                    onClick={handleAddCustomPlatform}
                    disabled={!newCustomPlatform.trim() || !newCustomUrl.trim()}
                    className="w-full rounded-[15px]"
                    variant="outline"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Custom Platform
                  </Button>
                </div>
              </div>
              
              {socialMediaData.other && socialMediaData.other.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="font-medium">Custom Platforms</h4>
                  {socialMediaData.other.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 border rounded-[15px]">
                      <div className="flex-1">
                        <div className="font-medium">{item.platform}</div>
                        <div className="text-sm text-muted-foreground truncate">{item.url}</div>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => window.open(item.url, '_blank')}
                        className="rounded-[15px]"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleRemoveCustomPlatform(index)}
                        className="rounded-[15px] text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No custom platforms added yet
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        <Button 
          onClick={handleSave}
          disabled={isSaving}
          className="w-full mt-6 rounded-[15px]"
          variant="premium"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save All Social Media Accounts'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SocialMediaManager;
