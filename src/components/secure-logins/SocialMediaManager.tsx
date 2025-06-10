
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Save, Trash2, Edit, Eye, EyeOff, X } from 'lucide-react';
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

interface ExtendedSocialMediaHandles extends SocialMediaHandles {
  tiktokAccount?: SocialMediaAccount;
  twitterAccount?: SocialMediaAccount;
  onlyfansAccount?: SocialMediaAccount;
  snapchatAccount?: SocialMediaAccount;
  instagramAccount?: SocialMediaAccount;
}

interface SocialMediaManagerProps {
  creator: Creator;
}

const SocialMediaManager: React.FC<SocialMediaManagerProps> = ({ creator }) => {
  const [socialMediaData, setSocialMediaData] = useState<ExtendedSocialMediaHandles>({
    tiktok: '',
    twitter: '',
    onlyfans: '',
    snapchat: '',
    instagram: '',
    other: [],
    tiktokAccount: { platform: 'TikTok', username: '', password: '', notes: '' },
    twitterAccount: { platform: 'Twitter', username: '', password: '', notes: '' },
    onlyfansAccount: { platform: 'OnlyFans', username: '', password: '', notes: '' },
    snapchatAccount: { platform: 'Snapchat', username: '', password: '', notes: '' },
    instagramAccount: { platform: 'Instagram', username: '', password: '', notes: '' }
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
      
      const { data, error } = await supabase
        .from('onboarding_submissions')
        .select('data')
        .eq('email', creator.email)
        .single();

      if (error) {
        console.error('Error fetching social media data:', error);
        return;
      }

      const submissionData = data?.data as Record<string, any>;
      
      if (submissionData?.contentAndService?.socialMediaHandles) {
        const handles = submissionData.contentAndService.socialMediaHandles as ExtendedSocialMediaHandles;
        console.log('Social media handles found:', handles);
        
        setSocialMediaData({
          tiktok: handles.tiktok || '',
          twitter: handles.twitter || '',
          onlyfans: handles.onlyfans || '',
          snapchat: handles.snapchat || '',
          instagram: handles.instagram || '',
          other: handles.other || [],
          tiktokAccount: handles.tiktokAccount || { platform: 'TikTok', username: handles.tiktok || '', password: '', notes: '' },
          twitterAccount: handles.twitterAccount || { platform: 'Twitter', username: handles.twitter || '', password: '', notes: '' },
          onlyfansAccount: handles.onlyfansAccount || { platform: 'OnlyFans', username: handles.onlyfans || '', password: '', notes: '' },
          snapchatAccount: handles.snapchatAccount || { platform: 'Snapchat', username: handles.snapchat || '', password: '', notes: '' },
          instagramAccount: handles.instagramAccount || { platform: 'Instagram', username: handles.instagram || '', password: '', notes: '' }
        });
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

      const existingData = (currentData?.data as Record<string, any>) || {};
      
      const socialMediaHandlesForSave = {
        tiktok: socialMediaData.tiktokAccount?.username || '',
        twitter: socialMediaData.twitterAccount?.username || '',
        onlyfans: socialMediaData.onlyfansAccount?.username || '',
        snapchat: socialMediaData.snapchatAccount?.username || '',
        instagram: socialMediaData.instagramAccount?.username || '',
        other: socialMediaData.other.map(account => ({
          platform: account.platform,
          username: account.username,
          password: account.password,
          notes: account.notes || ''
        })),
        tiktokAccount: socialMediaData.tiktokAccount,
        twitterAccount: socialMediaData.twitterAccount,
        onlyfansAccount: socialMediaData.onlyfansAccount,
        snapchatAccount: socialMediaData.snapchatAccount,
        instagramAccount: socialMediaData.instagramAccount
      };
      
      const updatedData = {
        ...existingData,
        contentAndService: {
          ...(existingData.contentAndService || {}),
          socialMediaHandles: socialMediaHandlesForSave
        }
      };

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

      toast({
        title: "Success",
        description: "Social media accounts saved successfully",
      });

      setIsEditing(false);
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

  // Update predefined platform account
  const updatePredefinedPlatformAccount = (platform: string, field: keyof SocialMediaAccount, value: string) => {
    const accountKey = `${platform}Account` as keyof ExtendedSocialMediaHandles;
    setSocialMediaData(prev => ({
      ...prev,
      [accountKey]: {
        ...((prev[accountKey] as SocialMediaAccount) || { platform: platform.charAt(0).toUpperCase() + platform.slice(1), username: '', password: '', notes: '' }),
        [field]: value
      }
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
      <div className="p-6 text-center">
        <div className="text-sm text-muted-foreground">Loading social media accounts...</div>
      </div>
    );
  }

  const predefinedPlatforms = [
    { key: 'tiktok', label: 'TikTok', color: 'from-gray-800 to-red-500' },
    { key: 'twitter', label: 'Twitter', color: 'from-blue-400 to-blue-600' },
    { key: 'onlyfans', label: 'OnlyFans', color: 'from-blue-500 to-cyan-400' },
    { key: 'snapchat', label: 'Snapchat', color: 'from-yellow-400 to-yellow-600' },
    { key: 'instagram', label: 'Instagram', color: 'from-purple-500 to-pink-500' }
  ];

  const allPlatforms = [
    ...predefinedPlatforms
      .map(p => {
        const accountKey = `${p.key}Account` as keyof ExtendedSocialMediaHandles;
        const account = socialMediaData[accountKey] as SocialMediaAccount;
        return {
          id: p.key,
          name: p.label,
          username: account?.username || '',
          password: account?.password || '',
          notes: account?.notes || '',
          color: p.color,
          type: 'predefined' as const
        };
      })
      .filter(p => p.username), // Only show predefined platforms that have usernames
    ...socialMediaData.other.map((account, index) => ({
      id: `other-${index}`,
      name: account.platform,
      username: account.username,
      password: account.password,
      notes: account.notes || '',
      color: 'from-gray-500 to-gray-700',
      type: 'other' as const,
      index
    }))
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Social Media Accounts</h3>
          <p className="text-sm text-muted-foreground">View and manage social media login credentials</p>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <>
              <Button 
                onClick={() => setIsEditing(true)}
                variant="outline"
                className="rounded-[15px]"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAddPlatform(true)}
                className="rounded-[15px]"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Platform
              </Button>
            </>
          ) : (
            <div className="flex gap-2">
              <Button 
                onClick={saveSocialMediaData}
                disabled={saving}
                className="rounded-[15px]"
                variant="premium"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save All'}
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
      </div>

      {allPlatforms.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/30">
          <div className="text-muted-foreground">
            <p className="text-lg font-medium mb-2">No social media accounts found</p>
            <p className="text-sm">Add platforms to manage login credentials</p>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="font-semibold text-foreground">Platform</TableHead>
                <TableHead className="font-semibold text-foreground">Username/Handle</TableHead>
                <TableHead className="font-semibold text-foreground">Login Password</TableHead>
                <TableHead className="font-semibold text-foreground">Notes</TableHead>
                {isEditing && <TableHead className="font-semibold text-foreground w-20">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {allPlatforms.map((platform) => (
                <TableRow key={platform.id} className="hover:bg-muted/20">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${platform.color} flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
                        {platform.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-foreground">{platform.name}</span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    {isEditing ? (
                      <Input
                        value={platform.username}
                        onChange={(e) => {
                          if (platform.type === 'predefined') {
                            updatePredefinedPlatformAccount(platform.id, 'username', e.target.value);
                          } else {
                            updateOtherPlatform(platform.index!, 'username', e.target.value);
                          }
                        }}
                        placeholder="username"
                        className="rounded-[15px] h-9 border-muted-foreground/20"
                      />
                    ) : (
                      <div className="flex items-center">
                        <span className="text-sm font-mono bg-muted/50 px-2 py-1 rounded">
                          {platform.username || 'Not set'}
                        </span>
                      </div>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    {isEditing ? (
                      <div className="flex gap-1">
                        <Input
                          type={showPasswords[platform.id] ? 'text' : 'password'}
                          value={platform.password}
                          onChange={(e) => {
                            if (platform.type === 'predefined') {
                              updatePredefinedPlatformAccount(platform.id, 'password', e.target.value);
                            } else {
                              updateOtherPlatform(platform.index!, 'password', e.target.value);
                            }
                          }}
                          placeholder="Enter password"
                          className="rounded-[15px] h-9 flex-1 border-muted-foreground/20"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePasswordVisibility(platform.id)}
                          className="h-9 w-9 p-0"
                        >
                          {showPasswords[platform.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {platform.password ? (showPasswords[platform.id] ? platform.password : '••••••••') : 'Not set'}
                        </span>
                        {platform.password && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => togglePasswordVisibility(platform.id)}
                            className="h-6 w-6 p-0"
                          >
                            {showPasswords[platform.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          </Button>
                        )}
                      </div>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    {isEditing ? (
                      <Input
                        value={platform.notes}
                        onChange={(e) => {
                          if (platform.type === 'predefined') {
                            updatePredefinedPlatformAccount(platform.id, 'notes', e.target.value);
                          } else {
                            updateOtherPlatform(platform.index!, 'notes', e.target.value);
                          }
                        }}
                        placeholder="Additional notes"
                        className="rounded-[15px] h-9 border-muted-foreground/20"
                      />
                    ) : (
                      <span className="text-sm text-muted-foreground">{platform.notes || '-'}</span>
                    )}
                  </TableCell>
                  
                  {isEditing && (
                    <TableCell>
                      {platform.type === 'other' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removePlatform(platform.index!)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add New Platform Form */}
      {showAddPlatform && (
        <div className="border rounded-lg p-4 bg-muted/30 border-dashed">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Add New Platform</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter platform name (e.g., LinkedIn, YouTube)"
                value={newPlatformName}
                onChange={(e) => setNewPlatformName(e.target.value)}
                className="rounded-[15px] border-muted-foreground/20"
              />
              <Button 
                onClick={addNewPlatform} 
                className="rounded-[15px]"
                disabled={!newPlatformName.trim()}
              >
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
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialMediaManager;
