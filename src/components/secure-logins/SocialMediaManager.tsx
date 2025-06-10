import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Save, Trash2 } from 'lucide-react';
import { Creator } from '../../types';

interface SocialMediaManagerProps {
  creator: Creator;
  socialMediaHandles: Record<string, string>;
  onUpdateSocialMedia: (handles: Record<string, string>) => Promise<boolean>;
}

const SocialMediaManager: React.FC<SocialMediaManagerProps> = ({
  creator,
  socialMediaHandles,
  onUpdateSocialMedia
}) => {
  const [editedHandles, setEditedHandles] = useState<Record<string, string>>({});
  const [newPlatform, setNewPlatform] = useState('');
  const [newHandle, setNewHandle] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Update editedHandles when socialMediaHandles prop changes
  useEffect(() => {
    console.log('SocialMediaManager - received socialMediaHandles:', socialMediaHandles);
    setEditedHandles(socialMediaHandles);
  }, [socialMediaHandles]);

  const handleUpdateHandle = (platform: string, handle: string) => {
    setEditedHandles(prev => ({
      ...prev,
      [platform]: handle
    }));
  };

  const handleAddNew = () => {
    if (newPlatform.trim() && newHandle.trim()) {
      setEditedHandles(prev => ({
        ...prev,
        [newPlatform.trim()]: newHandle.trim()
      }));
      setNewPlatform('');
      setNewHandle('');
    }
  };

  const handleRemove = (platform: string) => {
    setEditedHandles(prev => {
      const updated = { ...prev };
      delete updated[platform];
      return updated;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    console.log('Saving social media handles:', editedHandles);
    const success = await onUpdateSocialMedia(editedHandles);
    setIsSaving(false);
  };

  const hasChanges = JSON.stringify(editedHandles) !== JSON.stringify(socialMediaHandles);

  console.log('SocialMediaManager render - editedHandles:', editedHandles);
  console.log('SocialMediaManager render - hasChanges:', hasChanges);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Social Media Accounts</CardTitle>
        <p className="text-sm text-muted-foreground">
          Manage {creator.name}'s social media accounts from onboarding data
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Display current data for debugging */}
        <div className="text-xs text-muted-foreground border-l-2 border-muted pl-2">
          <p>Debug: Found {Object.keys(editedHandles).length} social media handles</p>
          {Object.keys(editedHandles).length === 0 && (
            <p className="text-amber-600">No social media handles found in onboarding data</p>
          )}
        </div>

        {/* Existing handles */}
        {Object.entries(editedHandles).map(([platform, handle]) => (
          <div key={platform} className="flex items-center space-x-2">
            <div className="flex-1">
              <Label className="capitalize">{platform}</Label>
              <Input
                value={handle}
                onChange={(e) => handleUpdateHandle(platform, e.target.value)}
                placeholder={`Enter ${platform} handle`}
                className="rounded-[15px]"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleRemove(platform)}
              className="rounded-[15px] mt-6"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}

        {/* Show message if no handles exist */}
        {Object.keys(editedHandles).length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            <p>No social media accounts found in onboarding data.</p>
            <p className="text-xs">Add new platforms below.</p>
          </div>
        )}

        {/* Add new platform */}
        <div className="border-t pt-4">
          <Label>Add New Platform</Label>
          <div className="flex space-x-2 mt-2">
            <Input
              placeholder="Platform name"
              value={newPlatform}
              onChange={(e) => setNewPlatform(e.target.value)}
              className="rounded-[15px]"
            />
            <Input
              placeholder="Handle/URL"
              value={newHandle}
              onChange={(e) => setNewHandle(e.target.value)}
              className="rounded-[15px]"
            />
            <Button
              onClick={handleAddNew}
              variant="outline"
              size="icon"
              className="rounded-[15px]"
              disabled={!newPlatform.trim() || !newHandle.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Save button */}
        {hasChanges && (
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full rounded-[15px]"
            variant="premium"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default SocialMediaManager;
