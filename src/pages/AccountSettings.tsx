import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Mail, ArrowLeft, UserCircle, Lock, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProfilePicture from "@/components/profile/ProfilePicture";

const AccountSettings = () => {
  const { updateCredentials, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);
  const [profileImage, setProfileImage] = useState("");
  
  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setEmail(user.email || "");
      setDisplayName(user.displayName || "");
      setProfileImage(user.profileImage || "");
    }
  }, [user]);

  const handleSendVerification = () => {
    if (!email) {
      toast({
        variant: "destructive",
        title: "Missing email",
        description: "Please enter a valid email address",
      });
      return;
    }

    // In a real application, this would make an API call to send verification email
    setVerificationSent(true);
    toast({
      title: "Verification Email Sent",
      description: `A verification link has been sent to ${email}. Please check your inbox.`,
    });
  };

  const handleUpdateProfile = () => {
    // Validate inputs
    if (!username) {
      toast({
        variant: "destructive",
        title: "Missing username",
        description: "Please enter a username",
      });
      return;
    }

    // Fix: Pass a credentials object instead of multiple arguments
    const success = updateCredentials({ 
      email: email !== user.email ? email : undefined,
      displayName,
      profileImage
    });
    
    if (success) {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "There was an error updating your profile",
      });
    }
  };

  const handleChangePassword = () => {
    if (!newPassword) {
      toast({
        variant: "destructive",
        title: "Missing password",
        description: "Please enter a new password",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords don't match",
        description: "New password and confirmation must match",
      });
      return;
    }

    if (!currentPassword) {
      toast({
        variant: "destructive",
        title: "Current password required",
        description: "Please enter your current password",
      });
      return;
    }

    const success = updateCredentials({ 
      password: newPassword,
      currentPassword
    });
    
    if (success) {
      toast({
        title: "Password changed",
        description: "Your password has been updated successfully",
      });

      // Send email notification if password was changed
      if (email) {
        // In a real application, this would make an API call to send an email
        // For now, we'll just show another toast to simulate email notification
        setTimeout(() => {
          toast({
            title: "Email Notification Sent",
            description: `A confirmation email has been sent to ${email} about your recent password change.`,
          });
        }, 1000);
      }
      
      // Reset password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      toast({
        variant: "destructive",
        title: "Password change failed",
        description: "Current password is incorrect or there was a system error",
      });
    }
  };

  return (
    <div className="container max-w-4xl py-10">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="mr-4"
          size="sm"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
          <p className="text-muted-foreground">
            Update your account information and manage your security settings.
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>
              Update your profile picture and display name
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex justify-center">
                <ProfilePicture 
                  profileImage={profileImage}
                  name={displayName || username}
                  setProfileImage={setProfileImage}
                />
              </div>
              <div className="md:col-span-2 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                  <Label htmlFor="displayName" className="md:text-right">
                    Display Name
                  </Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="md:col-span-3"
                    placeholder="How you want to be known to others"
                  />
                </div>
                <p className="text-sm text-muted-foreground md:col-start-2 md:col-span-3">
                  This is the name that will be displayed to other users on the platform.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your account profile details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              <Label htmlFor="username" className="md:text-right">
                Username
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="md:col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              <Label htmlFor="email" className="md:text-right">
                Email
              </Label>
              <div className="md:col-span-3 flex space-x-2">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full"
                />
                <Button 
                  variant="outline" 
                  onClick={handleSendVerification}
                  disabled={verificationSent}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Verify
                </Button>
              </div>
            </div>
            
            {/* Email verification status */}
            {(() => {
              const userData = JSON.parse(localStorage.getItem("user") || '{}');
              const isEmailVerified = userData.emailVerified || false;
              
              return (
                <div className="col-span-full md:col-start-2 md:col-span-3">
                  <Alert variant={isEmailVerified ? "default" : "destructive"}>
                    <AlertTitle className="flex items-center">
                      {isEmailVerified ? 'Email Verified' : 'Email Not Verified'}
                    </AlertTitle>
                    <AlertDescription>
                      {isEmailVerified 
                        ? "Your email is verified." 
                        : "Your email is not verified, but you can still change your password."}
                    </AlertDescription>
                  </Alert>
                </div>
              );
            })()}
          </CardContent>
          <CardFooter className="flex justify-between border-t px-6 py-4">
            <Button 
              variant="outline" 
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateProfile} 
              className="bg-brand-yellow text-black hover:bg-brand-yellow/90"
            >
              Save Profile
            </Button>
          </CardFooter>
        </Card>

        {/* Change Password Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lock className="h-5 w-5 mr-2" />
              Change Password
            </CardTitle>
            <CardDescription>
              Update your account password for enhanced security
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              <Label htmlFor="currentPassword" className="md:text-right">
                Current Password
              </Label>
              <div className="md:col-span-3 relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              <Label htmlFor="newPassword" className="md:text-right">
                New Password
              </Label>
              <div className="md:col-span-3 relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your new password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              <Label htmlFor="confirmPassword" className="md:text-right">
                Confirm Password
              </Label>
              <div className="md:col-span-3 relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t px-6 py-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
              }}
            >
              Clear
            </Button>
            <Button 
              onClick={handleChangePassword} 
              className="bg-brand-yellow text-black hover:bg-brand-yellow/90"
            >
              Change Password
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AccountSettings;
