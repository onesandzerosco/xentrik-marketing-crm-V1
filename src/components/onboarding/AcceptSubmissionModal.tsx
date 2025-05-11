
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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

interface AcceptSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: (creatorData: {
    name: string;
    team: "A" | "B" | "C";
    creatorType: "AI" | "Real";
  }) => Promise<void>;
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
  const [team, setTeam] = useState<"A" | "B" | "C">("A");
  const [creatorType, setCreatorType] = useState<"AI" | "Real">("Real");

  const handleAccept = async () => {
    await onAccept({
      name,
      team,
      creatorType,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-[#1a1a33] text-white border-[#252538]">
        <DialogHeader>
          <DialogTitle>Accept Creator Submission</DialogTitle>
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
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="team" className="text-right">
              Team
            </Label>
            <Select 
              value={team} 
              onValueChange={(value: "A" | "B" | "C") => setTeam(value)}
            >
              <SelectTrigger className="col-span-3 bg-[#252538] border-[#383854] text-white">
                <SelectValue placeholder="Select a team" />
              </SelectTrigger>
              <SelectContent className="bg-[#252538] border-[#383854] text-white">
                <SelectItem value="A">Team A</SelectItem>
                <SelectItem value="B">Team B</SelectItem>
                <SelectItem value="C">Team C</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="creatorType" className="text-right">
              Creator Type
            </Label>
            <Select 
              value={creatorType} 
              onValueChange={(value: "AI" | "Real") => setCreatorType(value)}
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
            onClick={onClose}
            className="text-white border-white/20"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAccept} 
            disabled={isLoading || !name.trim()}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white"
          >
            {isLoading ? (
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
