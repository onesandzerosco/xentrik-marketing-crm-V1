
import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import type { Database } from "@/integrations/supabase/types";

// Define the enum types from Supabase
type TeamEnum = Database["public"]["Enums"]["team"];
type CreatorTypeEnum = Database["public"]["Enums"]["creator_type"];

// Define the CreatorData type
interface CreatorData {
  name: string;
  team: TeamEnum;
  creatorType: CreatorTypeEnum;
}

interface AcceptSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: (creatorData: CreatorData) => Promise<void>;
  defaultName: string;
  isLoading: boolean;
}

const AcceptSubmissionModal: React.FC<AcceptSubmissionModalProps> = ({
  isOpen,
  onClose,
  onAccept,
  defaultName,
  isLoading
}) => {
  const [name, setName] = useState(defaultName);
  const [team, setTeam] = useState<TeamEnum>("A Team");
  const [creatorType, setCreatorType] = useState<CreatorTypeEnum>("Real");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const acceptClickedRef = useRef(false);
  
  // Reset submission state when modal opens/closes
  React.useEffect(() => {
    if (!isOpen) {
      setIsSubmitting(false);
      acceptClickedRef.current = false;
    }
  }, [isOpen]);

  const handleAccept = async () => {
    // Multiple protections against double submissions
    if (isSubmitting || isLoading || acceptClickedRef.current) {
      console.log("Preventing duplicate submission attempt");
      return;
    } 
    
    try {
      // Set flags to prevent re-entry
      setIsSubmitting(true);
      acceptClickedRef.current = true;
      
      console.log("AcceptSubmissionModal: Accepting submission with name:", name);
      await onAccept({
        name,
        team,
        creatorType,
      });
    } finally {
      // No need to reset isSubmitting here as the modal will close
      // and the effect will handle the reset
    }
  };

  // Combine local and parent loading states
  const isButtonDisabled = isLoading || isSubmitting || !name.trim() || acceptClickedRef.current;

  // Function to safely close the modal
  const handleClose = () => {
    if (!isSubmitting && !isLoading) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] bg-[#1a1a33] text-white border-[#252538]">
        <DialogHeader>
          <DialogTitle>Accept Creator Submission</DialogTitle>
          <DialogDescription className="text-gray-300">
            This will create a new creator account with the email from their submission and set their password to "XentrikBananas". The creator will be able to login with these credentials.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3 bg-[#252538] border-[#383854] text-white"
              disabled={isSubmitting || isLoading}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="team" className="text-right">
              Team
            </Label>
            <Select 
              value={team} 
              onValueChange={(value: TeamEnum) => setTeam(value)}
              disabled={isSubmitting || isLoading}
            >
              <SelectTrigger className="col-span-3 bg-[#252538] border-[#383854] text-white">
                <SelectValue placeholder="Select a team" />
              </SelectTrigger>
              <SelectContent className="bg-[#252538] border-[#383854] text-white">
                <SelectItem value="A Team">A Team</SelectItem>
                <SelectItem value="B Team">B Team</SelectItem>
                <SelectItem value="C Team">C Team</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="creatorType" className="text-right">
              Creator Type
            </Label>
            <Select 
              value={creatorType} 
              onValueChange={(value: CreatorTypeEnum) => setCreatorType(value)}
              disabled={isSubmitting || isLoading}
            >
              <SelectTrigger className="col-span-3 bg-[#252538] border-[#383854] text-white">
                <SelectValue placeholder="Select creator type" />
              </SelectTrigger>
              <SelectContent className="bg-[#252538] border-[#383854] text-white">
                <SelectItem value="Real">Real</SelectItem>
                <SelectItem value="AI">AI</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleClose}
            className="text-white border-white/20"
            disabled={isSubmitting || isLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAccept} 
            disabled={isButtonDisabled}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white"
          >
            {(isLoading || isSubmitting) ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Accept'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AcceptSubmissionModal;
