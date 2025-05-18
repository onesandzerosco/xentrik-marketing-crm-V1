
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
  const [platform, setPlatform] = useState<string>('instagram');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loginDetails, setLoginDetails] = useState<{[key: string]: LoginDetail}>({});
  const { toast } = useToast();

  // Load creator login details when the modal opens
  useEffect(() => {
    if (open && creatorId) {
      const details = getLoginDetailsForCreator(creatorId);
      setLoginDetails(details);
    }
  }, [open, creatorId, getLoginDetailsForCreator]);
  
  const handleUpdateDetail = (platform: string, field: string, value: string) => {
    updateLoginDetail(creatorId, platform, field, value);
    
    // Also update our local state
    setLoginDetails(prev => ({
      ...prev,
      [platform]: {
        ...(prev[platform] || {
          platform,
          username: '',
          password: '',
          notes: '',
          lastUpdated: new Date().toISOString()
        }),
        [field]: value,
        lastUpdated: new Date().toISOString()
      }
    }));
  };
  
  const handleSave = () => {
    saveLoginDetails(creatorId, platform);
    toast({
      title: "Credentials saved",
      description: `Login details for ${creatorName}'s ${platform} account have been securely saved.`
    });
  };
  
  const platforms = [
    { id: 'instagram', name: 'Instagram' },
    { id: 'tiktok', name: 'TikTok' },
    { id: 'twitter', name: 'Twitter/X' },
    { id: 'onlyfans', name: 'OnlyFans' },
    { id: 'snapchat', name: 'Snapchat' },
    { id: 'youtube', name: 'YouTube' },
    { id: 'website', name: 'Website' },
    { id: 'other', name: 'Other' }
  ];
  
  const currentDetail = loginDetails[platform] || {
    platform,
    username: '',
    password: '',
    notes: '',
    lastUpdated: ''
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
            <Label htmlFor="platform" className="text-right">
              Platform
            </Label>
            <select 
              id="platform"
              className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
            >
              {platforms.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Username
            </Label>
            <Input
              id="username"
              value={currentDetail.username}
              onChange={(e) => handleUpdateDetail(platform, 'username', e.target.value)}
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
                value={currentDetail.password}
                onChange={(e) => handleUpdateDetail(platform, 'password', e.target.value)}
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
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="notes" className="text-right">
              Notes
            </Label>
            <textarea
              id="notes"
              value={currentDetail.notes}
              onChange={(e) => handleUpdateDetail(platform, 'notes', e.target.value)}
              className="col-span-3 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          
          {currentDetail.lastUpdated && (
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-right text-sm text-muted-foreground">Last updated</span>
              <span className="col-span-3 text-sm text-muted-foreground">
                {new Date(currentDetail.lastUpdated).toLocaleString()}
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
