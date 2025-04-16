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
import PasswordManagementDialog from '../components/secure-logins/PasswordManagementDialog';
import { Button } from '@/components/ui/button';
import { Lock, Settings } from 'lucide-react';
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
  
  // Update authorization check to use Supabase
  const [authorized, setAuthorized] = useState(false);
  
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

  const handleAuthentication = async (isAuthenticated: boolean) => {
    console.log("Authentication result:", isAuthenticated);
    setAuthorized(isAuthenticated);
    
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
  
  const handleManualLock = async () => {
    // Lock the secure area using Supabase
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
        
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={() => setPasswordDialogOpen(true)}
        >
          <Settings className="h-4 w-4" />
          Manage Access Password
        </Button>
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
      
      {/* Password Management Dialog */}
      <PasswordManagementDialog 
        open={passwordDialogOpen} 
        onOpenChange={setPasswordDialogOpen} 
      />
      
      {/* Add the Lock button */}
      <LockButton onLock={handleManualLock} />
    </div>
  );
};

export default SecureLogins;
