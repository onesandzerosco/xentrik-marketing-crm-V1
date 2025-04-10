
import React from 'react';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface LockButtonProps {
  onLock: () => void;
}

const LockButton: React.FC<LockButtonProps> = ({ onLock }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleLock = () => {
    // Call the parent's lock handler
    onLock();
    
    // Show a toast notification
    toast({
      title: "Secure Area Locked",
      description: "You've successfully locked the secure area",
    });
    
    // Navigate to the secure logins page (without ID parameter)
    navigate('/secure-logins');
  };
  
  return (
    <div className="fixed bottom-4 left-4 z-50">
      <Button 
        variant="destructive" 
        size="sm"
        className="flex items-center gap-2"
        onClick={handleLock}
      >
        <Lock className="h-4 w-4" />
        Lock Secure Area
      </Button>
    </div>
  );
};

export default LockButton;
