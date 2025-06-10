
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Save, ExternalLink, Edit, Check, X } from 'lucide-react';
import { Creator } from '../../types';
import { useToast } from '@/hooks/use-toast';
import { useSecureSocialMedia, SocialMediaHandles } from '@/hooks/useSecureSocialMedia';

interface SocialMediaManagerProps {
  creator: Creator;
}

const SocialMediaManager: React.FC<SocialMediaManagerProps> = ({ creator }) => {
  const { toast } = useToast();
  const {
    getSocialMediaForCreator,
    updateSocialMediaForCreator,
    addOtherSocialMedia,
    removeOtherSocialMedia,
    saveSocialMediaForCreator,
    loading
  } = useSecureSocialMedia();

  // Database state - this is what we display
  const [databaseData, setDatabaseData] = useState<SocialMediaHandles | null>(null);
  
  // UI state only
  const [newOtherPlatform, setNewOtherPlatform] = useState('');
  const [newOtherUrl, setNewOtherUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  // ALWAYS fetch fresh data from database when creator changes
  useEffect(() => {
    console.log('=== COMPONENT EFFECT TRIGGERED ===');
    console.log('Creator changed, fetching FRESH database data for:', creator.id, creator.name);
    
    const loadFreshData = async () => {
      try {
        const freshData = await getSocialMediaForCreator(creator.id);
        console.log('=== FRESH DATABASE DATA RECEIVED ===');
        console.log('Fresh data from DB:', freshData);
        setDatabaseData(freshData);
      } catch (error) {
        console.error('Error loading fresh data:', error);
        setDatabaseData(null);
      }
    };
    
    loadFreshData();
  }, [creator.id, getSocialMediaForCreator]);

  const handleStartEdit = (platform: string, currentValue: string) => {
    setEditingField(platform);
    setEditValue(currentValue);
  };

  const handleSaveEdit = async () => {
    if (editingField && databaseData) {
      console.log('=== SAVING EDIT ===');
      console.log('Updating platform:', editingField, 'with value:', editValue);
      
      // Update in the hook's internal state
      updateSocialMediaForCreator(creator.id, editingField, editValue);
      
      // Update our display data immediately
      const updatedData = {
        ...databaseData,
        [editingField]: editValue
      };
      setDatabaseData(updatedData);
      
      setEditingField(null);
      setEditValue('');
    }
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setEditValue('');
  };

  const handleAddOtherPlatform = () => {
    if (newOtherPlatform.trim() && newOtherUrl.trim() && databaseData) {
      console.log('Adding other platform:', newOtherPlatform, newOtherUrl);
      
      // Add to hook's internal state
      addOtherSocialMedia(creator.id, newOtherPlatform.trim(), newOtherUrl.trim());
      
      // Update display data immediately
      const updatedData = {
        ...databaseData,
        other: [...databaseData.other, { platform: newOtherPlatform.trim(), url: newOtherUrl.trim() }]
      };
      setDatabaseData(updatedData);
      
      setNewOtherPlatform('');
      setNewOtherUrl('');
      toast({
        title: "Platform Added",
        description: `Added ${newOtherPlatform} to other platforms`,
      });
    }
  };

  const handleRemoveOtherPlatform = (index: number) => {
    if (databaseData) {
      console.log('Removing other platform at index:', index);
      
      // Remove from hook's internal state
      removeOtherSocialMedia(creator.id, index);
      
      // Update display data immediately
      const updatedData = {
        ...databaseData,
        other: databaseData.other.filter((_, i) => i !== index)
      };
      setDatabaseData(updatedData);
      
      toast({
        title: "Platform Removed",
        description: "Platform has been removed",
      });
    }
  };

  const handleSave = async () => {
    console.log('=== COMPONENT SAVE PROCESS ===');
    console.log('Starting save process for creator:', creator.id);
    setIsSaving(true);
    try {
      const result = await saveSocialMediaForCreator(creator.id);
      if (result.success) {
        // ALWAYS fetch fresh data after save to show what's actually in the database
        console.log('Save successful, fetching fresh data from database...');
        const freshData = await getSocialMediaForCreator(creator.id);
        console.log('Fresh data after save:', freshData);
        setDatabaseData(freshData);
        
        toast({
          title: "Social Media Saved",
          description: "All social media accounts have been saved successfully",
        });
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

  // Predefined platforms that should be in Standard Platforms
  const predefinedPlatforms = [
    { key: 'instagram', label: 'Instagram', icon: '📷' },
    { key: 'tiktok', label: 'TikTok', icon: '🎵' },
    { key: 'twitter', label: 'Twitter/X', icon: '🐦' },
    { key: 'onlyfans', label: 'OnlyFans', icon: '🔞' },
    { key: 'snapchat', label: 'Snapchat', icon: '👻' }
  ];

  if (loading || !databaseData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading social media data for {creator.name}...</div>
        </CardContent>
      </Card>
    );
  }

  console.log('=== COMPONENT RENDERING DATABASE DATA ===');
  console.log('Rendering social media data for creator:', creator.name, databaseData);

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
            <TabsTrigger value="other" className="rounded-[15px]">
              Other Platforms
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="predefined">
            <div className="space-y-4">
              {predefinedPlatforms.map((platform) => {
                const value = databaseData[platform.key as keyof SocialMediaHandles] as string || '';
                const isEditing = editingField === platform.key;
                
                return (
                  <div key={platform.key} className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <span>{platform.icon}</span>
                      {platform.label}
                    </Label>
                    <div className="flex gap-2">
                      {isEditing ? (
                        <>
                          <Input 
                            placeholder={`Enter ${platform.label} URL or username`}
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="rounded-[15px]"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={handleSaveEdit}
                            className="rounded-[15px]"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={handleCancelEdit}
                            className="rounded-[15px]"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <div className="flex-1 p-2 border rounded-[15px] bg-muted/30 min-h-[40px] flex items-center">
                            {value || <span className="text-muted-foreground">Not provided</span>}
                          </div>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleStartEdit(platform.key, value)}
                            className="rounded-[15px]"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {value && (
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => window.open(value.startsWith('http') ? value : `https://${value}`, '_blank')}
                              className="rounded-[15px]"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
          
          <TabsContent value="other">
            <div className="space-y-4">
              <div className="p-4 border rounded-[15px] bg-muted/30">
                <h4 className="font-medium mb-3">Add New Platform</h4>
                <div className="space-y-3">
                  <div>
                    <Label>Platform Name</Label>
                    <Input 
                      placeholder="e.g., Reddit, YouTube, etc."
                      value={newOtherPlatform}
                      onChange={(e) => setNewOtherPlatform(e.target.value)}
                      className="rounded-[15px]"
                    />
                  </div>
                  <div>
                    <Label>URL</Label>
                    <Input 
                      placeholder="https://..."
                      value={newOtherUrl}
                      onChange={(e) => setNewOtherUrl(e.target.value)}
                      className="rounded-[15px]"
                    />
                  </div>
                  <Button 
                    onClick={handleAddOtherPlatform}
                    disabled={!newOtherPlatform.trim() || !newOtherUrl.trim()}
                    className="w-full rounded-[15px]"
                    variant="outline"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Platform
                  </Button>
                </div>
              </div>
              
              {databaseData.other && databaseData.other.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="font-medium">Other Platforms</h4>
                  {databaseData.other.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 border rounded-[15px]">
                      <div className="flex-1">
                        <div className="font-medium">{item.platform}</div>
                        <div className="text-sm text-muted-foreground truncate">{item.url}</div>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => window.open(item.url.startsWith('http') ? item.url : `https://${item.url}`, '_blank')}
                        className="rounded-[15px]"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleRemoveOtherPlatform(index)}
                        className="rounded-[15px] text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No other platforms added yet
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
