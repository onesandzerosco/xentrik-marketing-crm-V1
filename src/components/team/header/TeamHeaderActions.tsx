
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const TeamHeaderActions: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div>
      <Button 
        onClick={() => navigate('/team/onboard')} 
        variant="premium" 
        className="flex items-center gap-2 shadow-premium-yellow hover:shadow-premium-highlight"
      >
        <Plus className="h-4 w-4" />
        Onboard Team Member
      </Button>
    </div>
  );
};

export default TeamHeaderActions;
