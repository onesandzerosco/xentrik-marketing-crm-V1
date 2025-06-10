
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Save, Edit } from 'lucide-react';
import { Creator } from '../../types';
import { useSocialMediaData } from './hooks/useSocialMediaData';
import { useSocialMediaOperations } from './hooks/useSocialMediaOperations';
import { SocialMediaLogin } from './types';
import SocialMediaTable from './SocialMediaTable';
import AddPlatformForm from './AddPlatformForm';

interface SocialMediaManagerProps {
  creator: Creator;
}

const SocialMediaManager: React.FC<SocialMediaManagerProps> = ({ creator }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newPlatformName, setNewPlatformName] = useState('');
  const [showAddPlatform, setShowAddPlatform] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  const {
    socialMediaLogins,
    setSocialMediaLogins,
    loading,
    predefinedPlatforms,
    fetchSocialMediaLogins
  } = useSocialMediaData(creator.email);

  const {
    saving,
    saveSocialMediaLogin,
    addNewPlatform,
    removePlatform,
    updateOnboardingSubmissionData
  } = useSocialMediaOperations(creator.email);

  const saveAllChanges = async () => {
    try {
      const realLogins = socialMediaLogins.filter(login => 
        !login.id.startsWith('placeholder-') && !login.id.startsWith('onboarding-')
      );
      const virtualLogins = socialMediaLogins.filter(login => 
        (login.id.startsWith('placeholder-') || login.id.startsWith('onboarding-')) && 
        (login.username || login.password || login.notes)
      );

      const updatePromises = realLogins.map(login => 
        saveSocialMediaLogin(login)
      );

      const insertPromises = virtualLogins.map(login =>
        saveSocialMediaLogin(login)
      );

      const allPromises = [...updatePromises, ...insertPromises];
      const results = await Promise.all(allPromises);
      
      const hasErrors = results.some(result => result === false);
      if (hasErrors) {
        return;
      }

      setIsEditing(false);
      await fetchSocialMediaLogins();
      await updateOnboardingSubmissionData(socialMediaLogins);
    } catch (error) {
      console.error('Error saving all changes:', error);
    }
  };

  const updateLogin = (id: string, field: keyof SocialMediaLogin, value: string) => {
    setSocialMediaLogins(prev => 
      prev.map(login => 
        login.id === id ? { ...login, [field]: value } : login
      )
    );
  };

  const handleAddNewPlatform = async () => {
    if (!newPlatformName.trim()) return;

    const success = await addNewPlatform(newPlatformName);
    if (success) {
      setNewPlatformName('');
      setShowAddPlatform(false);
      await fetchSocialMediaLogins();
    }
  };

  const handleRemovePlatform = async (id: string, platform: string) => {
    const result = await removePlatform(id, platform, predefinedPlatforms);
    
    if (result === 'clear') {
      updateLogin(id, 'username', '');
      updateLogin(id, 'password', '');
      updateLogin(id, 'notes', '');
    } else if (result === 'remove') {
      setSocialMediaLogins(prev => prev.filter(login => login.id !== id));
    } else if (result === true) {
      await fetchSocialMediaLogins();
    }
  };

  const togglePasswordVisibility = (id: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const startEditing = () => {
    setIsEditing(true);
    fetchSocialMediaLogins();
  };

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

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="text-sm text-muted-foreground">Loading social media accounts...</div>
      </div>
    );
  }

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
          ) : (
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

      <SocialMediaTable
        socialMediaLogins={socialMediaLogins}
        isEditing={isEditing}
        showPasswords={showPasswords}
        onUpdateLogin={updateLogin}
        onTogglePasswordVisibility={togglePasswordVisibility}
        onRemovePlatform={handleRemovePlatform}
        getPlatformColor={getPlatformColor}
      />

      {showAddPlatform && (
        <AddPlatformForm
          newPlatformName={newPlatformName}
          setNewPlatformName={setNewPlatformName}
          onAdd={handleAddNewPlatform}
          onCancel={() => {
            setShowAddPlatform(false);
            setNewPlatformName('');
          }}
        />
      )}
    </div>
  );
};

export default SocialMediaManager;
