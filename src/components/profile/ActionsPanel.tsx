
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, Tag, Users } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import TeamMemberAssignmentDialog from "./TeamMemberAssignmentDialog";
import { Employee } from "@/types/employee";

interface ActionsPanelProps {
  needsReview: boolean;
  setNeedsReview: (value: boolean) => void;
  creatorId: string;
  assignedMembers: Employee[];
  onAssignMembers: (members: Employee[]) => void;
}

const ActionsPanel: React.FC<ActionsPanelProps> = ({
  needsReview,
  setNeedsReview,
  creatorId,
  assignedMembers,
  onAssignMembers,
}) => {
  const { toast } = useToast();
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);

  return (
    <div className="bg-card rounded-xl p-6 shadow-sm">
      <h2 className="text-xl font-bold mb-4">Actions</h2>
      <div className="space-y-4">
        <Button 
          className="w-full flex items-center gap-2 rounded-[15px] px-3 py-3 text-black font-medium transition-all hover:bg-gradient-premium-yellow hover:text-black hover:-translate-y-0.5 hover:shadow-premium-yellow hover:opacity-90 bg-gradient-premium-yellow shadow-premium-yellow"
          variant="default"
        >
          <MessageSquare className="h-4 w-4" />
          Create Telegram Chat
        </Button>
        
        <Button 
          className="w-full flex items-center gap-2 rounded-[15px] px-3 py-3 text-black font-medium transition-all hover:bg-gradient-premium-yellow hover:text-black hover:-translate-y-0.5 hover:shadow-premium-yellow hover:opacity-90 bg-gradient-premium-yellow shadow-premium-yellow"
          variant="default"
          onClick={() => setAssignDialogOpen(true)}
        >
          <Users className="h-4 w-4" />
          Assign Team Members {assignedMembers.length > 0 && `(${assignedMembers.length})`}
        </Button>
        
        <Separator />
        
        <div className="flex items-center justify-between py-2">
          <div className="space-y-1">
            <Label htmlFor="review" className={needsReview ? "font-medium text-red-400" : "font-medium"}>Manual Review Needed</Label>
            <p className="text-xs text-muted-foreground">
              {needsReview ? "This profile needs review" : "No review needed"}
            </p>
          </div>
          <Switch 
            id="review" 
            checked={needsReview}
            onCheckedChange={setNeedsReview}
            className={needsReview ? "data-[state=checked]:bg-red-500" : ""}
          />
        </div>
        
        <Separator />
        
        <Button 
          variant="destructive" 
          className="w-full transition-all duration-300 hover:translate-y-[-2px]" 
          onClick={() => {
            toast({
              title: "Feature not implemented",
              description: "This feature is not yet available"
            });
          }}
        >
          <Tag className="h-4 w-4 mr-2" />
          Remove Creator
        </Button>
      </div>
      
      <TeamMemberAssignmentDialog 
        open={assignDialogOpen} 
        onOpenChange={setAssignDialogOpen} 
        creatorId={creatorId}
        selectedMembers={assignedMembers}
        onAssign={onAssignMembers}
      />
    </div>
  );
};

export default ActionsPanel;
