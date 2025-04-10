
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCreators } from '../context/CreatorContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { LockKeyhole, Eye, EyeOff, Save, UserCircle } from 'lucide-react';
import { Creator } from '../types';

const SECURE_PASSWORD = "bananas";
const STORAGE_KEY = "creator_secure_logins";

interface LoginDetails {
  [platform: string]: string;
}

interface CreatorLoginDetails {
  [creatorId: string]: LoginDetails;
}

const SecureLogins: React.FC = () => {
  const { creators } = useCreators();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [authorized, setAuthorized] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [allLoginDetails, setAllLoginDetails] = useState<CreatorLoginDetails>({});
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  
  // Load saved login details from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        setAllLoginDetails(JSON.parse(savedData));
      } catch (e) {
        console.error("Failed to parse stored login details");
      }
    }
  }, []);
  
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

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === SECURE_PASSWORD) {
      setAuthorized(true);
      setPasswordError("");
      toast({
        title: "Access Granted",
        description: "You now have access to secure login details",
      });
    } else {
      setPasswordError("Incorrect password");
      toast({
        title: "Access Denied",
        description: "The password is incorrect",
        variant: "destructive",
      });
    }
  };
  
  const handleCreatorSelect = (creatorId: string) => {
    navigate(`/secure-logins/${creatorId}`);
  };
  
  const togglePasswordVisibility = (platform: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [platform]: !prev[platform]
    }));
  };
  
  const updateLoginDetail = (creatorId: string, platform: string, password: string) => {
    const updatedDetails = { 
      ...allLoginDetails,
      [creatorId]: {
        ...(allLoginDetails[creatorId] || {}),
        [platform]: password
      }
    };
    
    setAllLoginDetails(updatedDetails);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDetails));
    
    toast({
      title: "Login Details Saved",
      description: `Saved credentials for ${platform}`,
    });
  };
  
  const getLoginDetail = (creatorId: string, platform: string) => {
    return allLoginDetails[creatorId]?.[platform] || "";
  };
  
  if (!authorized) {
    return (
      <div className="container mx-auto flex items-center justify-center h-[calc(100vh-4rem)]">
        <Card className="w-full max-w-md mx-auto bg-card shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <LockKeyhole className="w-6 h-6" />
              Secure Area
            </CardTitle>
            <CardDescription>
              Enter the password to access creator login details
            </CardDescription>
          </CardHeader>
          <form onSubmit={handlePasswordSubmit}>
            <CardContent>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {passwordError && (
                    <p className="text-sm text-red-500 mt-1">{passwordError}</p>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full">
                Authenticate
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Secure Login Details</h1>
      
      <div className="grid gap-8 md:grid-cols-[300px_1fr]">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Creators</CardTitle>
              <CardDescription>Select a creator to manage login details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {creators.map(creator => (
                  <Button
                    key={creator.id}
                    variant={selectedCreator?.id === creator.id ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => handleCreatorSelect(creator.id)}
                  >
                    <UserCircle className="w-5 h-5 mr-2" />
                    {creator.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {selectedCreator ? (
          <div>
            <Card>
              <CardHeader>
                <CardTitle>{selectedCreator.name}'s Login Details</CardTitle>
                <CardDescription>
                  Securely store login information for {selectedCreator.name}'s social media accounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="instagram">
                  <TabsList className="mb-4">
                    {Object.entries(selectedCreator.socialLinks)
                      .filter(([_, url]) => url)
                      .map(([platform, _]) => (
                        <TabsTrigger key={platform} value={platform} className="capitalize">
                          {platform}
                        </TabsTrigger>
                      ))}
                  </TabsList>
                  
                  {Object.entries(selectedCreator.socialLinks)
                    .filter(([_, url]) => url)
                    .map(([platform, url]) => (
                      <TabsContent key={platform} value={platform}>
                        <div className="space-y-4">
                          <div>
                            <Label>Account URL</Label>
                            <div className="p-2 border rounded mt-1 bg-muted/30">
                              {url}
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Username</Label>
                            <Input 
                              placeholder="Enter username"
                              value={getLoginDetail(selectedCreator.id, `${platform}_username`) || ""}
                              onChange={(e) => updateLoginDetail(selectedCreator.id, `${platform}_username`, e.target.value)}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Password</Label>
                            <div className="flex">
                              <Input 
                                type={showPasswords[platform] ? "text" : "password"}
                                placeholder="Enter password"
                                value={getLoginDetail(selectedCreator.id, `${platform}_password`) || ""}
                                onChange={(e) => updateLoginDetail(selectedCreator.id, `${platform}_password`, e.target.value)}
                                className="flex-1"
                              />
                              <Button 
                                type="button" 
                                variant="outline" 
                                size="icon"
                                onClick={() => togglePasswordVisibility(platform)}
                                className="ml-2"
                              >
                                {showPasswords[platform] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Additional Notes</Label>
                            <Input 
                              placeholder="Any additional information"
                              value={getLoginDetail(selectedCreator.id, `${platform}_notes`) || ""}
                              onChange={(e) => updateLoginDetail(selectedCreator.id, `${platform}_notes`, e.target.value)}
                            />
                          </div>
                          
                          <Button 
                            onClick={() => {
                              const username = getLoginDetail(selectedCreator.id, `${platform}_username`);
                              const password = getLoginDetail(selectedCreator.id, `${platform}_password`);
                              const notes = getLoginDetail(selectedCreator.id, `${platform}_notes`);
                              
                              updateLoginDetail(selectedCreator.id, `${platform}_username`, username);
                              updateLoginDetail(selectedCreator.id, `${platform}_password`, password);
                              updateLoginDetail(selectedCreator.id, `${platform}_notes`, notes);
                            }}
                            className="w-full mt-4"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Save {platform} Login Details
                          </Button>
                        </div>
                      </TabsContent>
                    ))}
                </Tabs>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Select a Creator</CardTitle>
              <CardDescription>
                Please select a creator from the list to manage their login details
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SecureLogins;
