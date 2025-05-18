
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Save } from 'lucide-react';
import { useSecureLogins, LoginDetail } from '@/hooks/useSecureLogins';
import { useToast } from '@/hooks/use-toast';

interface SecureLoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  creatorId: string;
  creatorName: string;
}

const SecureLoginModal: React.FC<SecureLoginModalProps> = ({ 
  open, 
  onOpenChange, 
  creatorId, 
  creatorName 
}) => {
  const { getLoginDetailsForCreator, updateLoginDetail, saveLoginDetails } = useSecureLogins();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loginDetails, setLoginDetails] = useState<LoginDetail>({
    platform: 'default',
    username: '',
    password: '',
    notes: '',
    lastUpdated: new Date().toISOString()
  });
  const { toast } = useToast();

  // Load creator login details when the modal opens
  useEffect(() => {
    if (open && creatorId) {
      const details = getLoginDetailsForCreator(creatorId);
      const defaultDetails = details['default'] || {
        platform: 'default',
        username: '',
        password: '',
        notes: '',
        lastUpdated: ''
      };
      setLoginDetails(defaultDetails);
    }
  }, [open, creatorId, getLoginDetailsForCreator]);
  
  const handleUpdateDetail = (field: string, value: string) => {
    updateLoginDetail(creatorId, 'default', field, value);
    
    // Also update our local state
    setLoginDetails(prev => ({
      ...prev,
      [field]: value,
      lastUpdated: new Date().toISOString()
    }));
  };
  
  const handleSave = () => {
    saveLoginDetails(creatorId, 'default');
    toast({
      title: "Credentials saved",
      description: `Login details for ${creatorName} have been securely saved.`
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Secure Login Details</DialogTitle>
          <DialogDescription>
            Manage secure login credentials for {creatorName}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Username
            </Label>
            <Input
              id="username"
              value={loginDetails.username}
              onChange={(e) => handleUpdateDetail('username', e.target.value)}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="text-right">
              Password
            </Label>
            <div className="col-span-3 relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={loginDetails.password}
                onChange={(e) => handleUpdateDetail('password', e.target.value)}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          {loginDetails.lastUpdated && (
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-right text-sm text-muted-foreground">Last updated</span>
              <span className="col-span-3 text-sm text-muted-foreground">
                {new Date(loginDetails.lastUpdated).toLocaleString()}
              </span>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save credentials
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SecureLoginModal;
