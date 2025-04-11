
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
    <div className="absolute bottom-4 right-4">
      <Button 
        variant="destructive" 
        size="sm"
        className="flex items-center gap-2 rounded-2xl shadow-premium-sm hover:shadow-premium-md transform hover:-translate-y-1 transition-all duration-300 hover:opacity-90"
        onClick={handleLock}
      >
        <Lock className="h-4 w-4" />
        Lock Secure Area
      </Button>
    </div>
  );
};

export default LockButton;
