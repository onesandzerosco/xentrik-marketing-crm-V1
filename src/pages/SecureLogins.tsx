import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCreators } from '../context/creator';
import { useSecureLogins } from '../hooks/useSecureLogins';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import AuthForm from '../components/secure-logins/AuthForm';
import CreatorSelect from '../components/secure-logins/CreatorSelect';
import LoginDetailsEditor from '../components/secure-logins/LoginDetailsEditor';
import NoCreatorSelected from '../components/secure-logins/NoCreatorSelected';
import LockButton from '../components/secure-logins/LockButton';
import { Creator } from '../types';
import { useSecurePasswordManager } from '@/hooks/useSecurePasswordManager';

const SecureLogins: React.FC = () => {
  const { creators } = useCreators();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, userRole, isCreator, creatorId } = useAuth();
  
  const { 
    getLoginDetailsForCreator, 
    updateLoginDetail, 
    saveLoginDetails,
    checkAutoLock 
  } = useSecureLogins();
  
  const { checkSecureAreaAuthorization, setSecureAreaAuthorization } = useSecurePasswordManager();
  
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [authorized, setAuthorized] = useState(false);
  
  // Determine if user is admin or creator
  const isAdminUser = userRole === 'Admin';
  const isCreatorUser = isCreator && creatorId;
  
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
  
  // Log authentication state for debugging
  console.log("Auth state:", authorized);
  console.log("Current creator ID from params:", id);
  console.log("Available creators:", creators);
  console.log("User role:", userRole, "Is creator:", isCreator, "Creator ID:", creatorId);
  
  // Update selected creator when id param changes or after authorization
  useEffect(() => {
    if (authorized) {
      if (isCreatorUser) {
        // For creators, always show their own profile
        const creatorProfile = creators.find(c => c.id === creatorId);
        if (creatorProfile) {
          console.log("Setting creator's own profile:", creatorProfile.name);
          setSelectedCreator(creatorProfile);
          // Update URL to match creator's own ID if different
          if (id !== creatorId) {
            navigate(`/secure-logins/${creatorId}`, { replace: true });
          }
        } else {
          toast({
            title: "Profile Not Found",
            description: "Your creator profile could not be found.",
            variant: "destructive",
          });
        }
      } else if (isAdminUser) {
        // Admin behavior (existing logic)
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
    }
  }, [id, authorized, creators, navigate, isAdminUser, isCreatorUser, creatorId, toast]);

  const handleAuthentication = async (isAuthenticated: boolean) => {
    console.log("Authentication result:", isAuthenticated);
    setAuthorized(isAuthenticated);
    
    // Navigation logic after authentication
    if (isAuthenticated) {
      if (isCreatorUser && creatorId) {
        navigate(`/secure-logins/${creatorId}`);
      } else if (isAdminUser && creators.length > 0 && !id) {
        navigate(`/secure-logins/${creators[0].id}`);
      }
    }
  };
  
  const handleCreatorSelect = (creatorId: string) => {
    // Only allow admin users to select different creators
    if (isAdminUser) {
      navigate(`/secure-logins/${creatorId}`);
    }
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
        <h1 className="text-3xl font-bold">
          {isCreatorUser ? "My Social Media Accounts" : "Secure Login Details"}
        </h1>
      </div>
      
      <div className="grid gap-8 md:grid-cols-[300px_1fr]">
        {isAdminUser && (
          <div>
            <CreatorSelect 
              creators={creators}
              selectedCreator={selectedCreator}
              onSelectCreator={handleCreatorSelect}
            />
          </div>
        )}
        
        {selectedCreator ? (
          <div className={isCreatorUser ? "col-span-2" : "space-y-8"}>
            <LoginDetailsEditor 
              creator={selectedCreator}
              loginDetails={getLoginDetailsForCreator(selectedCreator.id)}
              onUpdateLogin={handleUpdateLogin}
              onSaveLoginDetails={handleSaveLoginDetails}
              onLock={handleManualLock}
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
