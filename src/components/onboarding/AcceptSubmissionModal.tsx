
import React, { useState, useRef, useEffect } from 'react';
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
  
  // Use refs to prevent duplicate submissions
  const hasSubmittedRef = useRef(false);
  
  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setName(defaultName);
      setTeam("A Team");
      setCreatorType("Real");
      setIsSubmitting(false);
      hasSubmittedRef.current = false;
    }
  }, [isOpen, defaultName]);

  const handleAccept = async () => {
    // Multiple protections against double submissions
    console.log("Accept button clicked, checking submission state...");
    console.log("isSubmitting:", isSubmitting);
    console.log("isLoading:", isLoading);
    console.log("hasSubmittedRef.current:", hasSubmittedRef.current);
    
    if (isSubmitting || isLoading || hasSubmittedRef.current) {
      console.log("Preventing duplicate submission attempt");
      return;
    } 
    
    try {
      // Set flags to prevent re-entry
      setIsSubmitting(true);
      hasSubmittedRef.current = true;
      
      console.log("AcceptSubmissionModal: Accepting submission with name:", name);
      await onAccept({
        name,
        team,
        creatorType,
      });
    } catch (error) {
      console.error("Error in modal during submission:", error);
      // Only reset the flags on error to allow retrying
      setIsSubmitting(false);
      hasSubmittedRef.current = false;
    }
    // We don't reset the flags here on success 
    // because the modal will close and be reset via the effect
  };

  // Combine all loading/submitting states
  const isButtonDisabled = isLoading || isSubmitting || !name.trim() || hasSubmittedRef.current;

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
