import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Save, Trash2, Edit, Eye, EyeOff, X, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Creator } from '../../types';

interface SocialMediaLogin {
  id: string;
  creator_email: string;
  platform: string;
  username: string;
  password: string;
  notes: string;
  is_predefined: boolean;
  created_at: string;
  updated_at: string;
}

interface SocialMediaManagerProps {
  creator: Creator;
  onLock?: () => void;
}

interface OnboardingSubmissionData {
  personalInfo?: any;
  physicalAttributes?: any;
  personalPreferences?: any;
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
    [key: string]: any;
  };
  [key: string]: any;
}

const SocialMediaManager: React.FC<SocialMediaManagerProps> = ({ creator, onLock }) => {
  const navigate = useNavigate();
  const [socialMediaLogins, setSocialMediaLogins] = useState<SocialMediaLogin[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newPlatformName, setNewPlatformName] = useState('');
  const [showAddPlatform, setShowAddPlatform] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  const { userRole, isCreator, creatorId } = useAuth();

  // Predefined platforms that should always be visible
  const predefinedPlatforms = ['TikTok', 'Twitter', 'OnlyFans', 'Snapchat', 'Instagram'];

  // Check if current user can edit this creator's data
  const canEdit = userRole === 'Admin' || (isCreator && creatorId === creator.id);

  // Helper function to update onboarding submission JSON data
  const updateOnboardingSubmissionData = async (updatedLogins: SocialMediaLogin[]) => {
    try {
      console.log('=== UPDATING ONBOARDING SUBMISSION JSON ===');
      
      const { data: submissionData, error: fetchError } = await supabase
        .from('onboarding_submissions')
        .select('data')
        .eq('email', creator.email)
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
        .eq('email', creator.email);

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

  // Fetch social media logins from the new table
  const fetchSocialMediaLogins = async () => {
    try {
      setLoading(true);
      console.log('=== FETCHING SOCIAL MEDIA LOGINS ===');
      console.log('Creator email:', creator.email);
      
      const { data, error } = await supabase
        .from('social_media_logins')
        .select('*')
        .eq('creator_email', creator.email)
        .order('is_predefined', { ascending: false })
        .order('platform');

      if (error) {
        console.error('Error fetching social media logins:', error);
        toast({
          title: "Error",
          description: "Failed to fetch social media accounts",
          variant: "destructive",
        });
        return;
      }

      console.log('Social media logins found:', data);
      
      const existingPlatforms = new Map((data || []).map(login => [login.platform, login]));
      const allLogins = [...(data || [])];
      
      // Fetch additional "other" platforms from onboarding submission if they don't exist
      try {
        const { data: submissionData, error: submissionError } = await supabase
          .from('onboarding_submissions')
          .select('data')
          .eq('email', creator.email)
          .single();

        if (!submissionError && submissionData?.data) {
          const typedData = submissionData.data as OnboardingSubmissionData;
          const otherPlatforms = typedData.contentAndService?.socialMediaHandles?.other;
          
          if (otherPlatforms && Array.isArray(otherPlatforms)) {
            otherPlatforms.forEach((otherPlatform: { platform: string; handle: string }) => {
              if (!existingPlatforms.has(otherPlatform.platform) && otherPlatform.platform && otherPlatform.handle) {
                allLogins.push({
                  id: `onboarding-${otherPlatform.platform.toLowerCase()}`,
                  creator_email: creator.email,
                  platform: otherPlatform.platform,
                  username: otherPlatform.handle,
                  password: '',
                  notes: 'From onboarding submission',
                  is_predefined: false,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                });
              }
            });
          }
        }
      } catch (submissionError) {
        console.warn('Could not fetch onboarding submission data:', submissionError);
      }
      
      // Always ensure predefined platforms are present
      const finalLogins = [...allLogins];
      const currentPlatforms = new Set(finalLogins.map(login => login.platform));
      
      predefinedPlatforms.forEach(platform => {
        if (!currentPlatforms.has(platform)) {
          finalLogins.push({
            id: `placeholder-${platform.toLowerCase()}`,
            creator_email: creator.email,
            platform,
            username: '',
            password: '',
            notes: '',
            is_predefined: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }
      });
      
      finalLogins.sort((a, b) => {
        if (a.is_predefined && !b.is_predefined) return -1;
        if (!a.is_predefined && b.is_predefined) return 1;
        return a.platform.localeCompare(b.platform);
      });

      setSocialMediaLogins(finalLogins);
    } catch (error) {
      console.error('Error in fetchSocialMediaLogins:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Save all changes
  const saveAllChanges = async () => {
    if (!canEdit) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to edit this creator's data",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      
      const realLogins = socialMediaLogins.filter(login => 
        !login.id.startsWith('placeholder-') && !login.id.startsWith('onboarding-')
      );
      const virtualLogins = socialMediaLogins.filter(login => 
        (login.id.startsWith('placeholder-') || login.id.startsWith('onboarding-')) && 
        (login.username || login.password || login.notes)
      );

      const updatePromises = realLogins.map(login => 
        supabase
          .from('social_media_logins')
          .update({
            username: login.username || '',
            password: login.password || '',
            notes: login.notes || ''
          })
          .eq('id', login.id)
      );

      const insertPromises = virtualLogins.map(login =>
        supabase
          .from('social_media_logins')
          .insert({
            creator_email: creator.email,
            platform: login.platform,
            username: login.username || '',
            password: login.password || '',
            notes: login.notes || '',
            is_predefined: login.is_predefined
          })
      );

      const allPromises = [...updatePromises, ...insertPromises];
      const results = await Promise.all(allPromises);
      
      const hasErrors = results.some(result => result.error);
      if (hasErrors) {
        toast({
          title: "Error",
          description: "Failed to save some accounts",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "All social media accounts saved successfully",
      });

      setIsEditing(false);
      await fetchSocialMediaLogins();
      await updateOnboardingSubmissionData(socialMediaLogins);
    } catch (error) {
      console.error('Error saving all changes:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Update login in local state
  const updateLogin = (id: string, field: keyof SocialMediaLogin, value: string) => {
    if (!canEdit) return;
    
    setSocialMediaLogins(prev => 
      prev.map(login => 
        login.id === id ? { ...login, [field]: value } : login
      )
    );
  };

  // Add new platform
  const addNewPlatform = async () => {
    if (!canEdit || !newPlatformName.trim()) return;

    console.log('=== ADDING NEW PLATFORM ===');
    console.log('Platform name:', newPlatformName);
    
    try {
      const { error } = await supabase
        .from('social_media_logins')
        .insert({
          creator_email: creator.email,
          platform: newPlatformName,
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
        return;
      }

      toast({
        title: "Success",
        description: `${newPlatformName} platform added successfully`,
      });

      setNewPlatformName('');
      setShowAddPlatform(false);
      await fetchSocialMediaLogins();
    } catch (error) {
      console.error('Error in addNewPlatform:', error);
    }
  };

  // Remove platform
  const removePlatform = async (id: string, platform: string) => {
    if (!canEdit) return;

    if (predefinedPlatforms.includes(platform)) {
      updateLogin(id, 'username', '');
      updateLogin(id, 'password', '');
      updateLogin(id, 'notes', '');
      return;
    }

    if (id.startsWith('onboarding-')) {
      setSocialMediaLogins(prev => prev.filter(login => login.id !== id));
      return;
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
        return;
      }

      toast({
        title: "Success",
        description: `${platform} platform removed successfully`,
      });

      await fetchSocialMediaLogins();
    } catch (error) {
      console.error('Error in removePlatform:', error);
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = (id: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Start editing mode
  const startEditing = () => {
    if (!canEdit) {
      toast({
        title: "Access Denied", 
        description: "You don't have permission to edit this creator's data",
        variant: "destructive",
      });
      return;
    }
    
    setIsEditing(true);
    fetchSocialMediaLogins();
  };

  useEffect(() => {
    if (creator?.email) {
      fetchSocialMediaLogins();
    }
  }, [creator?.email]);

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="text-sm text-muted-foreground">Loading social media accounts...</div>
      </div>
    );
  }
  
  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'tiktok': return 'from-gray-800 to-red-500';
      case 'twitter': return 'from-blue-400 to-blue-600';
      case 'onlyfans': return 'from-blue-500 to-cyan-400';
      case 'snapchat': return 'from-yellow-400 to-yellow-600';
      case 'instagram': return 'from-purple-500 to-pink-500';
      default: return 'from-gray-500 to-gray-700';
    }
  };

  const handleLock = () => {
    if (onLock) {
      onLock();
    }
    
    toast({
      title: "Secure Area Locked",
      description: "You've successfully locked the secure area",
    });
    
    navigate('/secure-logins');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          {/* Empty div to maintain spacing */}
        </div>
        <Button 
          variant="destructive" 
          size="sm"
          className="flex items-center gap-2 rounded-[15px] shadow-premium-sm hover:shadow-premium-md transform hover:-translate-y-1 transition-all duration-300 hover:opacity-90"
          onClick={handleLock}
        >
          <Lock className="h-4 w-4" />
          Lock Secure Area
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {canEdit && !isEditing && (
            <>
              <Button 
                onClick={startEditing}
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
          )}
          {canEdit && isEditing && (
            <div className="flex gap-2">
              <Button 
                onClick={saveAllChanges}
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

      <div className="border rounded-lg overflow-hidden bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="font-semibold text-foreground">Platform</TableHead>
              <TableHead className="font-semibold text-foreground">Username/Handle</TableHead>
              <TableHead className="font-semibold text-foreground">Login Password</TableHead>
              <TableHead className="font-semibold text-foreground">Notes</TableHead>
              {isEditing && canEdit && <TableHead className="font-semibold text-foreground w-20">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {socialMediaLogins.map((login) => (
              <TableRow key={login.id} className="hover:bg-muted/20">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getPlatformColor(login.platform)} flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
                      {login.platform.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-foreground">{login.platform}</span>
                  </div>
                </TableCell>
                
                <TableCell>
                  {isEditing && canEdit ? (
                    <Input
                      value={login.username}
                      onChange={(e) => updateLogin(login.id, 'username', e.target.value)}
                      placeholder="username"
                      className="rounded-[15px] h-9 border-muted-foreground/20"
                    />
                  ) : (
                    <div className="flex items-center">
                      <span className="text-sm font-mono bg-muted/50 px-2 py-1 rounded">
                        {login.username || '-'}
                      </span>
                    </div>
                  )}
                </TableCell>
                
                <TableCell>
                  {isEditing && canEdit ? (
                    <div className="flex gap-1">
                      <Input
                        type={showPasswords[login.id] ? 'text' : 'password'}
                        value={login.password}
                        onChange={(e) => updateLogin(login.id, 'password', e.target.value)}
                        placeholder="Enter password"
                        className="rounded-[15px] h-9 flex-1 border-muted-foreground/20"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => togglePasswordVisibility(login.id)}
                        className="h-9 w-9 p-0"
                      >
                        {showPasswords[login.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {login.password ? (showPasswords[login.id] ? login.password : '••••••••') : '-'}
                      </span>
                      {login.password && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePasswordVisibility(login.id)}
                          className="h-6 w-6 p-0"
                        >
                          {showPasswords[login.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </Button>
                      )}
                    </div>
                  )}
                </TableCell>
                
                <TableCell>
                  {isEditing && canEdit ? (
                    <Input
                      value={login.notes}
                      onChange={(e) => updateLogin(login.id, 'notes', e.target.value)}
                      placeholder="Additional notes"
                      className="rounded-[15px] h-9 border-muted-foreground/20"
                    />
                  ) : (
                    <span className="text-sm text-muted-foreground">{login.notes || '-'}</span>
                  )}
                </TableCell>
                
                {isEditing && canEdit && (
                  <TableCell>
                    {!login.is_predefined && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePlatform(login.id, login.platform)}
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

      {/* Add New Platform Form */}
      {showAddPlatform && canEdit && (
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
