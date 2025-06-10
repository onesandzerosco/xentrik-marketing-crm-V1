
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Save, ExternalLink, Edit, Check, X } from 'lucide-react';
import { Creator } from '../../types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SocialMediaManagerProps {
  creator: Creator;
}

// Simple interface for other platforms that matches Json type
interface OtherPlatform {
  platform: string;
  url: string;
}

interface SocialMediaHandles {
  instagram: string;
  tiktok: string;
  twitter: string;
  onlyfans: string;
  snapchat: string;
  other: OtherPlatform[];
}

const SocialMediaManager: React.FC<SocialMediaManagerProps> = ({ creator }) => {
  const { toast } = useToast();
  
  // ONLY database data - NO caching, NO local state
  const [freshDatabaseData, setFreshDatabaseData] = useState<SocialMediaHandles | null>(null);
  const [loading, setLoading] = useState(false);
  
  // UI-only state
  const [newOtherPlatform, setNewOtherPlatform] = useState('');
  const [newOtherUrl, setNewOtherUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  // ALWAYS fetch FRESH data from database
  const fetchFreshDataFromDatabase = async () => {
    console.log('=== FETCHING FRESH DATA FROM DATABASE ===');
    console.log('Creator ID:', creator.id, 'Creator Name:', creator.name);
    
    setLoading(true);
    try {
      // Step 1: Get creator email
      const { data: creatorData, error: creatorError } = await supabase
        .from('creators')
        .select('*')
        .eq('id', creator.id)
        .single();

      console.log('Creator data from DB:', creatorData);
      console.log('Creator error:', creatorError);

      if (creatorError || !creatorData?.email) {
        console.error('No creator found or no email');
        setFreshDatabaseData({
          instagram: '',
          tiktok: '',
          twitter: '',
          onlyfans: '',
          snapchat: '',
          other: []
        });
        return;
      }

      // Step 2: Get submission data
      const { data: submissions, error: submissionError } = await supabase
        .from('onboarding_submissions')
        .select('*')
        .eq('email', creatorData.email)
        .order('submitted_at', { ascending: false });

      console.log('=== RAW DATABASE SUBMISSIONS ===');
      console.log('All submissions from DB:', submissions);
      console.log('Submission error:', submissionError);

      if (submissionError || !submissions || submissions.length === 0) {
        console.log('No submissions found');
        setFreshDatabaseData({
          instagram: '',
          tiktok: '',
          twitter: '',
          onlyfans: '',
          snapchat: '',
          other: []
        });
        return;
      }

      // Find accepted submission or use most recent
      const acceptedSubmission = submissions.find(sub => sub.status === 'accepted');
      const submissionToUse = acceptedSubmission || submissions[0];

      console.log('=== USING SUBMISSION FROM DATABASE ===');
      console.log('Submission ID:', submissionToUse.id);
      console.log('Submission status:', submissionToUse.status);
      console.log('Raw data from DB:', submissionToUse.data);

      // Extract social media data
      const submissionData = submissionToUse.data as Record<string, any>;
      let socialMediaHandles = null;

      // Check different possible locations
      if (submissionData.socialMediaHandles) {
        socialMediaHandles = submissionData.socialMediaHandles;
        console.log('Found socialMediaHandles directly:', socialMediaHandles);
      } else if (submissionData.contentAndService?.socialMediaHandles) {
        socialMediaHandles = submissionData.contentAndService.socialMediaHandles;
        console.log('Found in contentAndService:', socialMediaHandles);
      } else {
        console.log('No socialMediaHandles found, using empty');
        socialMediaHandles = {};
      }

      const processedData: SocialMediaHandles = {
        instagram: socialMediaHandles.instagram || '',
        tiktok: socialMediaHandles.tiktok || '',
        twitter: socialMediaHandles.twitter || '',
        onlyfans: socialMediaHandles.onlyfans || '',
        snapchat: socialMediaHandles.snapchat || '',
        other: Array.isArray(socialMediaHandles.other) ? socialMediaHandles.other : []
      };

      console.log('=== FRESH DATABASE DATA SET TO STATE ===');
      console.log('Processed fresh data:', processedData);
      
      setFreshDatabaseData(processedData);
    } catch (error) {
      console.error('Database fetch error:', error);
      setFreshDatabaseData({
        instagram: '',
        tiktok: '',
        twitter: '',
        onlyfans: '',
        snapchat: '',
        other: []
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch fresh data whenever creator changes
  useEffect(() => {
    console.log('=== CREATOR CHANGED - FETCHING FRESH DATA ===');
    fetchFreshDataFromDatabase();
  }, [creator.id]);

  const handleStartEdit = (platform: string, currentValue: string) => {
    setEditingField(platform);
    setEditValue(currentValue);
  };

  const handleSaveEdit = async () => {
    if (editingField && freshDatabaseData) {
      // Update display immediately for UI responsiveness
      const updatedData = {
        ...freshDatabaseData,
        [editingField]: editValue
      };
      setFreshDatabaseData(updatedData);
      
      setEditingField(null);
      setEditValue('');
    }
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setEditValue('');
  };

  const handleAddOtherPlatform = () => {
    if (newOtherPlatform.trim() && newOtherUrl.trim() && freshDatabaseData) {
      const updatedData = {
        ...freshDatabaseData,
        other: [...freshDatabaseData.other, { platform: newOtherPlatform.trim(), url: newOtherUrl.trim() }]
      };
      setFreshDatabaseData(updatedData);
      
      setNewOtherPlatform('');
      setNewOtherUrl('');
      toast({
        title: "Platform Added",
        description: `Added ${newOtherPlatform} to other platforms`,
      });
    }
  };

  const handleRemoveOtherPlatform = (index: number) => {
    if (freshDatabaseData) {
      const updatedData = {
        ...freshDatabaseData,
        other: freshDatabaseData.other.filter((_, i) => i !== index)
      };
      setFreshDatabaseData(updatedData);
      
      toast({
        title: "Platform Removed",
        description: "Platform has been removed",
      });
    }
  };

  const handleSave = async () => {
    console.log('=== SAVING TO DATABASE ===');
    setIsSaving(true);
    try {
      // Get creator email
      const { data: creatorData, error: creatorError } = await supabase
        .from('creators')
        .select('email')
        .eq('id', creator.id)
        .single();

      if (creatorError || !creatorData?.email) {
        throw new Error('Creator email not found');
      }

      // Get current submission
      const { data: submissionData, error: fetchError } = await supabase
        .from('onboarding_submissions')
        .select('data, id')
        .eq('email', creatorData.email)
        .eq('status', 'accepted')
        .order('submitted_at', { ascending: false })
        .limit(1)
        .single();

      if (fetchError || !submissionData) {
        throw new Error('Submission data not found');
      }

      const currentData = submissionData.data as Record<string, any>;
      
      // Properly structure the data to match Supabase Json type
      const socialMediaHandlesForDB = {
        instagram: freshDatabaseData?.instagram || '',
        tiktok: freshDatabaseData?.tiktok || '',
        twitter: freshDatabaseData?.twitter || '',
        onlyfans: freshDatabaseData?.onlyfans || '',
        snapchat: freshDatabaseData?.snapchat || '',
        other: freshDatabaseData?.other.map(item => ({
          platform: item.platform,
          url: item.url
        })) || []
      };

      const updatedData = {
        ...currentData,
        socialMediaHandles: socialMediaHandlesForDB
      };

      console.log('Saving updated data to DB:', updatedData);

      const { error: updateError } = await supabase
        .from('onboarding_submissions')
        .update({ data: updatedData })
        .eq('id', submissionData.id);

      if (updateError) {
        throw updateError;
      }

      console.log('Save successful - fetching fresh data from DB');
      // ALWAYS fetch fresh data after save
      await fetchFreshDataFromDatabase();
      
      toast({
        title: "Social Media Saved",
        description: "All social media accounts have been saved successfully",
      });
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
    { key: 'onlyfans', label: 'OnlyFans', icon: '🔞' },
    { key: 'snapchat', label: 'Snapchat', icon: '👻' }
  ];

  if (loading || !freshDatabaseData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading fresh data from database for {creator.name}...</div>
        </CardContent>
      </Card>
    );
  }

  console.log('=== RENDERING FRESH DATABASE DATA ONLY ===');
  console.log('Creator:', creator.name);
  console.log('Fresh database data being displayed:', freshDatabaseData);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{creator.name}'s Social Media Accounts</CardTitle>
        <CardDescription>
          Displaying FRESH data from database only
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
                const value = freshDatabaseData[platform.key as keyof SocialMediaHandles] as string || '';
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
              
              {freshDatabaseData.other && freshDatabaseData.other.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="font-medium">Other Platforms</h4>
                  {freshDatabaseData.other.map((item, index) => (
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
