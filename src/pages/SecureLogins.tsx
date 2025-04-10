
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCreators } from '../context/CreatorContext';
import { useSecureLogins } from '../hooks/useSecureLogins';
import { useToast } from '@/hooks/use-toast';
import AuthForm from '../components/secure-logins/AuthForm';
import CreatorSelect from '../components/secure-logins/CreatorSelect';
import LoginDetailsEditor from '../components/secure-logins/LoginDetailsEditor';
import NoCreatorSelected from '../components/secure-logins/NoCreatorSelected';
import { Creator } from '../types';

const SECURE_PASSWORD = "bananas";

const SecureLogins: React.FC = () => {
  const { creators } = useCreators();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [authorized, setAuthorized] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  
  const { 
    getLoginDetailsForCreator, 
    updateLoginDetail, 
    saveLoginDetails 
  } = useSecureLogins();
  
  // Update selected creator when id param changes or after authorization
  useEffect(() => {
    if (authorized && id) {
      const creator = creators.find(c => c.id === id);
      if (creator) {
        setSelectedCreator(creator);
      } else if (creators.length > 0) {
        // If no creator is selected but creators exist, select the first one
        setSelectedCreator(creators[0]);
        navigate(`/secure-logins/${creators[0].id}`);
      }
    } else if (authorized && creators.length > 0 && !id) {
      // If we're authorized but no ID in URL, select the first creator
      setSelectedCreator(creators[0]);
      navigate(`/secure-logins/${creators[0].id}`);
    }
  }, [id, authorized, creators, navigate]);

  const handleAuthentication = (isAuthenticated: boolean) => {
    setAuthorized(isAuthenticated);
  };
  
  const handleCreatorSelect = (creatorId: string) => {
    navigate(`/secure-logins/${creatorId}`);
  };
  
  const handleUpdateLogin = (platform: string, field: string, value: string) => {
    if (selectedCreator) {
      updateLoginDetail(selectedCreator.id, platform, field, value);
    }
  };
  
  const handleSaveLoginDetails = (platform: string) => {
    if (selectedCreator) {
      saveLoginDetails(selectedCreator.id, platform);
      toast({
        title: "Login Details Saved",
        description: `Saved credentials for ${platform}`,
      });
    }
  };
  
  if (!authorized) {
    return <AuthForm onAuthenticate={handleAuthentication} securePassword={SECURE_PASSWORD} />;
  }
  
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Secure Login Details</h1>
      
      <div className="grid gap-8 md:grid-cols-[300px_1fr]">
        <div>
          <CreatorSelect 
            creators={creators}
            selectedCreator={selectedCreator}
            onSelectCreator={handleCreatorSelect}
          />
        </div>
        
        {selectedCreator ? (
          <div>
            <LoginDetailsEditor 
              creator={selectedCreator}
              loginDetails={getLoginDetailsForCreator(selectedCreator.id)}
              onUpdateLogin={handleUpdateLogin}
              onSaveLoginDetails={handleSaveLoginDetails}
            />
          </div>
        ) : (
          <NoCreatorSelected />
        )}
      </div>
    </div>
  );
};

export default SecureLogins;
