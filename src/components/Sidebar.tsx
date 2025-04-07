
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BarChart2, LogOut, Users, UserCog, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Sidebar = () => {
  const { logout, updateCredentials, user } = useAuth();
  const location = useLocation();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [open, setOpen] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

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

  const handleUpdateAccount = () => {
    // Validate inputs
    if (!username) {
      toast({
        variant: "destructive",
        title: "Missing username",
        description: "Please enter a username",
      });
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords don't match",
        description: "New password and confirmation must match",
      });
      return;
    }

    // Get the current user's email verification status
    const userData = JSON.parse(localStorage.getItem("user") || '{}');
    const isEmailVerified = userData.emailVerified || false;

    // Check if trying to change password without verified email
    if (newPassword && !isEmailVerified) {
      toast({
        variant: "destructive",
        title: "Email not verified",
        description: "You must verify your email before changing your password",
      });
      return;
    }

    // Call the updateCredentials function from AuthContext
    const success = updateCredentials(username, currentPassword, newPassword, email, userData.emailVerified);
    
    if (success) {
      toast({
        title: "Account updated",
        description: "Your account details have been updated successfully",
      });

      // Send email notification if password was changed
      if (newPassword && email) {
        // In a real application, this would make an API call to send an email
        // For now, we'll just show another toast to simulate email notification
        setTimeout(() => {
          toast({
            title: "Email Notification Sent",
            description: `A confirmation email has been sent to ${email} about your recent password change.`,
          });
        }, 1000);
      }
      
      // Reset form and close dialog
      setOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "Current password is incorrect or there was a system error",
      });
    }
  };

  // Get current user data when the dialog opens
  const handleOpenChange = (open: boolean) => {
    if (open) {
      const userData = JSON.parse(localStorage.getItem("user") || '{}');
      setUsername(userData.username || "");
      setEmail(userData.email || "");
      setVerificationSent(false);
    }
    setOpen(open);
  };

  return (
    <div className="h-screen w-60 bg-sidebar fixed left-0 top-0 border-r border-border flex flex-col">
      <div className="p-1.5">
        <div className="mb-1 flex justify-center">
          <img 
            src="/lovable-uploads/983659fc-5fdc-41ec-b019-cd6578bbbb3e.png" 
            alt="XENTRIK MARKETING" 
            className="h-32 w-auto mb-0.5"
          />
        </div>

        <nav className="space-y-2">
          <Link to="/dashboard">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start",
                isActive("/dashboard") && "bg-sidebar-accent text-sidebar-accent-foreground"
              )}
            >
              <BarChart2 className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          
          <Link to="/creators">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start",
                isActive("/creators") && "bg-sidebar-accent text-sidebar-accent-foreground"
              )}
            >
              <Users className="mr-2 h-4 w-4" />
              Creators
            </Button>
          </Link>
        </nav>
      </div>

      <div className="mt-auto p-1.5 space-y-2">
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full justify-start"
            >
              <UserCog className="mr-2 h-4 w-4" />
              Account Settings
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Account Settings</DialogTitle>
              <DialogDescription>
                Update your account details. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                  Username
                </Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <div className="col-span-3 flex space-x-2">
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full"
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleSendVerification}
                    disabled={verificationSent}
                  >
                    <Mail className="h-4 w-4 mr-1" />
                    Verify
                  </Button>
                </div>
              </div>
              
              {/* Email verification status */}
              {(() => {
                const userData = JSON.parse(localStorage.getItem("user") || '{}');
                const isEmailVerified = userData.emailVerified || false;
                
                return (
                  <div className="col-span-4">
                    <Alert variant={isEmailVerified ? "default" : "destructive"}>
                      <AlertTitle className="flex items-center">
                        Email Verification Status: {isEmailVerified ? 'Verified' : 'Not Verified'}
                      </AlertTitle>
                      <AlertDescription>
                        {isEmailVerified 
                          ? "Your email is verified. You can change your password." 
                          : "You must verify your email before you can change your password."}
                      </AlertDescription>
                    </Alert>
                  </div>
                );
              })()}

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="currentPassword" className="text-right">
                  Current Password
                </Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="newPassword" className="text-right">
                  New Password
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="confirmPassword" className="text-right">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleUpdateAccount} className="bg-brand text-black hover:bg-brand/80">
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Button 
          variant="outline" 
          className="w-full justify-start"
          onClick={logout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
