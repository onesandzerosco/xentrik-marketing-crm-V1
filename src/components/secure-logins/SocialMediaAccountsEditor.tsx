import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ExternalLink, Edit2, Save, X, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SocialMediaAccountsEditorProps {
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
  onUpdateSocialMedia: (updatedHandles: any) => void;
}

const SocialMediaAccountsEditor: React.FC<SocialMediaAccountsEditorProps> = ({ 
  socialMediaHandles, 
  onUpdateSocialMedia 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedHandles, setEditedHandles] = useState(socialMediaHandles || {});
  const [newPlatform, setNewPlatform] = useState('');
  const [newHandle, setNewHandle] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();

  const formatHandle = (handle: string) => {
    if (!handle) return '';
    return handle.startsWith('@') ? handle.slice(1) : handle;
  };

  const getProfileUrl = (platform: string, handle: string) => {
    const formattedHandle = formatHandle(handle);
    if (!formattedHandle) return null;

    const urls = {
      instagram: `https://instagram.com/${formattedHandle}`,
      twitter: `https://twitter.com/${formattedHandle}`,
      tiktok: `https://tiktok.com/@${formattedHandle}`,
      onlyfans: `https://onlyfans.com/${formattedHandle}`,
      snapchat: `https://snapchat.com/add/${formattedHandle}`
    };

    return urls[platform as keyof typeof urls] || null;
  };

  const mainPlatforms = [
    { key: 'instagram', label: 'Instagram' },
    { key: 'twitter', label: 'Twitter' },
    { key: 'tiktok', label: 'TikTok' },
    { key: 'onlyfans', label: 'OnlyFans' },
    { key: 'snapchat', label: 'Snapchat' }
  ];

  const handleMainPlatformChange = (platform: string, value: string) => {
    setEditedHandles(prev => ({
      ...prev,
      [platform]: value
    }));
  };

  const handleOtherPlatformChange = (index: number, field: 'platform' | 'handle', value: string) => {
    setEditedHandles(prev => ({
      ...prev,
      other: prev.other?.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      ) || []
    }));
  };

  const removeOtherPlatform = (index: number) => {
    setEditedHandles(prev => ({
      ...prev,
      other: prev.other?.filter((_, i) => i !== index) || []
    }));
  };

  const addNewPlatform = () => {
    if (!newPlatform.trim() || !newHandle.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both platform and handle",
        variant: "destructive"
      });
      return;
    }

    setEditedHandles(prev => ({
      ...prev,
      other: [...(prev.other || []), { platform: newPlatform, handle: newHandle }]
    }));

    setNewPlatform('');
    setNewHandle('');
    setShowAddForm(false);
  };

  const handleSave = () => {
    onUpdateSocialMedia(editedHandles);
    setIsEditing(false);
    toast({
      title: "Social Media Updated",
      description: "Social media handles have been updated successfully"
    });
  };

  const handleCancel = () => {
    setEditedHandles(socialMediaHandles || {});
    setIsEditing(false);
    setShowAddForm(false);
  };

  const hasAnyAccounts = mainPlatforms.some(platform => socialMediaHandles?.[platform.key as keyof typeof socialMediaHandles]) || 
                        (socialMediaHandles?.other && socialMediaHandles.other.length > 0);

  if (!hasAnyAccounts && !isEditing) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Social Media Accounts</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Accounts
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No social media accounts found. Click "Add Accounts" to get started.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Social Media Accounts</CardTitle>
          {!isEditing ? (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Platforms */}
        {mainPlatforms.map(platform => {
          const value = isEditing ? editedHandles[platform.key as keyof typeof editedHandles] as string : socialMediaHandles?.[platform.key as keyof typeof socialMediaHandles];
          
          if (!value && !isEditing) return null;
          
          return (
            <div key={platform.key} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <Badge variant="secondary" className="mb-1">
                  {platform.label}
                </Badge>
                {isEditing ? (
                  <div className="mt-2">
                    <Label className="text-xs">Handle</Label>
                    <Input
                      value={value || ''}
                      onChange={(e) => handleMainPlatformChange(platform.key, e.target.value)}
                      placeholder={`Enter ${platform.label} handle`}
                      className="mt-1"
                    />
                  </div>
                ) : (
                  <p className="text-sm font-medium">@{formatHandle(value || '')}</p>
                )}
              </div>
              {!isEditing && value && (
                <a 
                  href={getProfileUrl(platform.key, value) || '#'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Visit <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          );
        })}

        {/* Other Platforms */}
        {(isEditing ? editedHandles.other : socialMediaHandles?.other)?.map((account, index) => (
          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-2">
                  <div>
                    <Label className="text-xs">Platform</Label>
                    <Input
                      value={account.platform}
                      onChange={(e) => handleOtherPlatformChange(index, 'platform', e.target.value)}
                      placeholder="Platform name"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Handle</Label>
                    <Input
                      value={account.handle}
                      onChange={(e) => handleOtherPlatformChange(index, 'handle', e.target.value)}
                      placeholder="Handle"
                      className="mt-1"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <Badge variant="outline" className="mb-1">
                    {account.platform}
                  </Badge>
                  <p className="text-sm font-medium">{account.handle}</p>
                </>
              )}
            </div>
            {isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeOtherPlatform(index)}
                className="ml-2"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}

        {/* Add New Platform Form */}
        {isEditing && (
          <div className="space-y-2">
            {showAddForm ? (
              <div className="p-3 border rounded-lg space-y-2">
                <div>
                  <Label className="text-xs">Platform</Label>
                  <Input
                    value={newPlatform}
                    onChange={(e) => setNewPlatform(e.target.value)}
                    placeholder="Platform name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Handle</Label>
                  <Input
                    value={newHandle}
                    onChange={(e) => setNewHandle(e.target.value)}
                    placeholder="Handle"
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={addNewPlatform}>
                    Add
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Platform
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SocialMediaAccountsEditor;
