
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Save, Trash2, RefreshCw } from 'lucide-react';
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

  // Define predefined platforms
  const predefinedPlatforms = ['instagram', 'tiktok', 'twitter', 'reddit', 'chaturbate', 'youtube', 'onlyfans', 'snapchat'];

  // Update editedHandles when socialMediaHandles prop changes
  useEffect(() => {
    console.log('SocialMediaManager - received socialMediaHandles:', socialMediaHandles);
    console.log('SocialMediaManager - socialMediaHandles type:', typeof socialMediaHandles);
    console.log('SocialMediaManager - socialMediaHandles keys:', Object.keys(socialMediaHandles));
    
    // Ensure we have a valid object and filter out the "other" field
    const validHandles = socialMediaHandles && typeof socialMediaHandles === 'object' 
      ? socialMediaHandles 
      : {};
    
    // Remove the "other" field if it exists (it shouldn't at this point, but just in case)
    const filteredHandles = { ...validHandles };
    if (filteredHandles.other) {
      console.log('Removing "other" field from UI handles:', filteredHandles.other);
      delete filteredHandles.other;
    }
    
    console.log('Filtered handles for UI:', filteredHandles);
    setEditedHandles(filteredHandles);
  }, [socialMediaHandles]);

  const handleUpdateHandle = (platform: string, handle: string) => {
    setEditedHandles(prev => ({
      ...prev,
      [platform]: handle
    }));
  };

  const handleAddNew = () => {
    if (newPlatform.trim() && newHandle.trim()) {
      console.log(`Adding new platform: ${newPlatform.trim()} = ${newHandle.trim()}`);
      setEditedHandles(prev => ({
        ...prev,
        [newPlatform.trim()]: newHandle.trim()
      }));
      setNewPlatform('');
      setNewHandle('');
    }
  };

  const handleRemove = (platform: string) => {
    console.log(`Removing platform: ${platform}`);
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

  // Compare handles excluding the "other" field for change detection
  const originalHandlesWithoutOther = { ...socialMediaHandles };
  if (originalHandlesWithoutOther.other) {
    delete originalHandlesWithoutOther.other;
  }
  
  const hasChanges = JSON.stringify(editedHandles) !== JSON.stringify(originalHandlesWithoutOther);

  // Separate predefined and custom platforms for display
  const predefinedHandles = Object.entries(editedHandles).filter(([platform]) => 
    predefinedPlatforms.includes(platform.toLowerCase())
  );
  
  const customHandles = Object.entries(editedHandles).filter(([platform]) => 
    !predefinedPlatforms.includes(platform.toLowerCase())
  );

  console.log('SocialMediaManager render state:');
  console.log('- editedHandles:', editedHandles);
  console.log('- socialMediaHandles:', socialMediaHandles);
  console.log('- hasChanges:', hasChanges);
  console.log('- predefinedHandles:', predefinedHandles);
  console.log('- customHandles:', customHandles);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Social Media Accounts</CardTitle>
        <p className="text-sm text-muted-foreground">
          Manage {creator.name}'s social media accounts from onboarding data
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Debug information */}
        <div className="text-xs text-muted-foreground border-l-2 border-muted pl-2">
          <p>Debug: Found {Object.keys(editedHandles).length} social media handles</p>
          <p>Predefined platforms: {predefinedHandles.length}</p>
          <p>Custom platforms: {customHandles.length}</p>
          {Object.keys(editedHandles).length === 0 && Object.keys(socialMediaHandles).length === 0 && (
            <p className="text-amber-600">No social media handles found in onboarding data</p>
          )}
          {Object.keys(socialMediaHandles).length > 0 && (
            <p className="text-green-600">Social media data loaded from onboarding submission</p>
          )}
        </div>

        {/* Existing handles */}
        {Object.entries(editedHandles).length > 0 ? (
          <div className="space-y-4">
            {/* Predefined platforms */}
            {predefinedHandles.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Standard Platforms</h4>
                <div className="space-y-2">
                  {predefinedHandles.map(([platform, handle]) => (
                    <div key={platform} className="flex items-center space-x-2">
                      <div className="flex-1">
                        <Label className="capitalize">{platform}</Label>
                        <Input
                          value={handle || ''}
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
                </div>
              </div>
            )}
            
            {/* Custom platforms (from "Other" array) */}
            {customHandles.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Custom Platforms</h4>
                <div className="space-y-2">
                  {customHandles.map(([platform, handle]) => (
                    <div key={platform} className="flex items-center space-x-2">
                      <div className="flex-1">
                        <Label className="capitalize">{platform}</Label>
                        <Input
                          value={handle || ''}
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
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <p>No social media accounts found in onboarding data.</p>
            <p className="text-xs">Add new platforms below or check if the creator has completed onboarding.</p>
          </div>
        )}

        {/* Add new platform */}
        <div className="border-t pt-4">
          <Label>Add New Platform</Label>
          <div className="flex space-x-2 mt-2">
            <Input
              placeholder="Platform name (e.g., Instagram)"
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
          <p className="text-xs text-muted-foreground mt-1">
            New platforms will be saved as custom entries in the database
          </p>
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
