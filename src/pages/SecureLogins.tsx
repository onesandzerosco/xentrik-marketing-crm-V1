
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCreators } from '../context/creator';
import { useSecureLogins } from '../hooks/useSecureLogins';
import { useOnboardingData } from '../hooks/useOnboardingData';
import { useToast } from '@/hooks/use-toast';
import AuthForm from '../components/secure-logins/AuthForm';
import CreatorSelect from '../components/secure-logins/CreatorSelect';
import LoginDetailsEditor from '../components/secure-logins/LoginDetailsEditor';
import SocialMediaManager from '../components/secure-logins/SocialMediaManager';
import NoCreatorSelected from '../components/secure-logins/NoCreatorSelected';
import LockButton from '../components/secure-logins/LockButton';
import { Creator } from '../types';
import { useSecurePasswordManager } from '@/hooks/useSecurePasswordManager';

const SecureLogins: React.FC = () => {
  const { creators } = useCreators();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { 
    getLoginDetailsForCreator, 
    updateLoginDetail, 
    saveLoginDetails,
    checkAutoLock 
  } = useSecureLogins();
  
  const { checkSecureAreaAuthorization, setSecureAreaAuthorization } = useSecurePasswordManager();
  
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [authorized, setAuthorized] = useState(false);
  
  // Get onboarding data for the selected creator
  const { 
    socialMediaHandles, 
    loading: onboardingLoading, 
    updateSocialMediaHandles 
  } = useOnboardingData(selectedCreator?.id || '');
  
  // Check authorization on initial load
  useEffect(() => {
    const checkAuth = async () => {
      const isAuthorized = await checkSecureAreaAuthorization();
      setAuthorized(isAuthorized);
    };
    
    checkAuth();
  }, [checkSecureAreaAuthorization]);
  
  // Check for auto-lock on initial load and on return to this page
  useEffect(() => {
    const isStillAuthorized = checkAutoLock();
    if (authorized && !isStillAuthorized) {
      setAuthorized(false);
      toast({
        title: "Session Expired",
        description: "Your secure session has timed out due to inactivity",
        variant: "destructive",
      });
    }
  }, [authorized, checkAutoLock, toast]);
  
  // Update selected creator when id param changes or after authorization
  useEffect(() => {
    if (authorized) {
      if (id) {
        const creator = creators.find(c => c.id === id);
        if (creator) {
          console.log("Setting selected creator from URL param:", creator.name);
          setSelectedCreator(creator);
        } else if (creators.length > 0) {
          console.log("Creator ID not found, selecting first creator");
          setSelectedCreator(creators[0]);
          navigate(`/secure-logins/${creators[0].id}`);
        }
      } else if (creators.length > 0) {
        console.log("No ID in URL, selecting first creator");
        setSelectedCreator(creators[0]);
        navigate(`/secure-logins/${creators[0].id}`);
      }
    }
  }, [id, authorized, creators, navigate]);

  const handleAuthentication = async (isAuthenticated: boolean) => {
    console.log("Authentication result:", isAuthenticated);
    setAuthorized(isAuthenticated);
    
    if (isAuthenticated && creators.length > 0 && !id) {
      navigate(`/secure-logins/${creators[0].id}`);
    }
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
  
  const handleManualLock = async () => {
    await setSecureAreaAuthorization(false);
    setAuthorized(false);
    console.log("Manually locked secure area");
  };
  
  if (!authorized) {
    return <AuthForm onAuthenticate={handleAuthentication} />;
  }
  
  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Secure Login Details</h1>
      </div>
      
      <div className="grid gap-8 md:grid-cols-[300px_1fr]">
        <div>
          <CreatorSelect 
            creators={creators}
            selectedCreator={selectedCreator}
            onSelectCreator={handleCreatorSelect}
          />
        </div>
        
        {selectedCreator ? (
          <div className="space-y-6">
            <LoginDetailsEditor 
              creator={selectedCreator}
              loginDetails={getLoginDetailsForCreator(selectedCreator.id)}
              onUpdateLogin={handleUpdateLogin}
              onSaveLoginDetails={handleSaveLoginDetails}
            />
            
            <SocialMediaManager
              creator={selectedCreator}
              socialMediaHandles={socialMediaHandles}
              onUpdateSocialMedia={updateSocialMediaHandles}
            />
          </div>
        ) : (
          <NoCreatorSelected />
        )}
      </div>
      
      <LockButton onLock={handleManualLock} />
    </div>
  );
};

export default SecureLogins;
