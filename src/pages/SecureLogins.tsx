import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCreators } from '../context/CreatorContext';
import { useSecureLogins } from '../hooks/useSecureLogins';
import { useToast } from '@/hooks/use-toast';
import AuthForm from '../components/secure-logins/AuthForm';
import CreatorSelect from '../components/secure-logins/CreatorSelect';
import LoginDetailsEditor from '../components/secure-logins/LoginDetailsEditor';
import NoCreatorSelected from '../components/secure-logins/NoCreatorSelected';
import LockButton from '../components/secure-logins/LockButton';
import { Creator } from '../types';

const SECURE_PASSWORD = "bananas";

const SecureLogins: React.FC = () => {
  const { creators } = useCreators();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [authorized, setAuthorized] = useState(() => {
    // Initial authorization check now using localStorage directly
    const savedAuth = localStorage.getItem("secure_area_authorized");
    return savedAuth === "true";
  });
  
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  
  const { 
    getLoginDetailsForCreator, 
    updateLoginDetail, 
    saveLoginDetails,
    checkAutoLock 
  } = useSecureLogins();
  
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
  
  // Log authentication state for debugging
  console.log("Auth state:", authorized);
  console.log("Current creator ID from params:", id);
  console.log("Available creators:", creators);
  
  // Update selected creator when id param changes or after authorization
  useEffect(() => {
    if (authorized) {
      if (id) {
        const creator = creators.find(c => c.id === id);
        if (creator) {
          console.log("Setting selected creator from URL param:", creator.name);
          setSelectedCreator(creator);
        } else if (creators.length > 0) {
          // If no creator is found but creators exist, select the first one
          console.log("Creator ID not found, selecting first creator");
          setSelectedCreator(creators[0]);
          navigate(`/secure-logins/${creators[0].id}`);
        }
      } else if (creators.length > 0) {
        // If we're authorized but no ID in URL, select the first creator
        console.log("No ID in URL, selecting first creator");
        setSelectedCreator(creators[0]);
        navigate(`/secure-logins/${creators[0].id}`);
      }
    }
  }, [id, authorized, creators, navigate]);

  const handleAuthentication = (isAuthenticated: boolean) => {
    console.log("Authentication result:", isAuthenticated);
    setAuthorized(isAuthenticated);
    // Save auth state to localStorage
    localStorage.setItem("secure_area_authorized", isAuthenticated.toString());
    
    // If authentication was successful and we have creators, navigate to the first one
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
  
  const handleManualLock = () => {
    // Lock the secure area
    setAuthorized(false);
    localStorage.setItem("secure_area_authorized", "false");
    console.log("Manually locked secure area");
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
      
      {/* Add the Lock button */}
      <LockButton onLock={handleManualLock} />
    </div>
  );
};

export default SecureLogins;
