
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Employee } from "@/types/employee";
import { useToast } from "@/components/ui/use-toast";

// Fetch team members from localStorage
const getTeamMembers = (): Employee[] => {
  try {
    const savedEmployees = localStorage.getItem('team_employees_data');
    if (savedEmployees) {
      const employeesData = JSON.parse(savedEmployees) as Employee[];
      return employeesData.filter(emp => emp.status === "Active");
    }
  } catch (error) {
    console.error("Error loading team members data:", error);
  }
  return [];
};

interface TeamMemberAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  creatorId: string;
  selectedMembers: Employee[];
  onAssign: (members: Employee[]) => void;
}

const TeamMemberAssignmentDialog: React.FC<TeamMemberAssignmentDialogProps> = ({
  open,
  onOpenChange,
  creatorId,
  selectedMembers,
  onAssign,
}) => {
  const { toast } = useToast();
  const [teamMembers, setTeamMembers] = useState<Employee[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>(
    selectedMembers.map(member => member.id)
  );

  useEffect(() => {
    if (open) {
      setTeamMembers(getTeamMembers());
      setSelectedIds(selectedMembers.map(member => member.id));
    }
  }, [open, selectedMembers]);

  const handleSave = () => {
    const selectedTeamMembers = teamMembers.filter(member => 
      selectedIds.includes(member.id)
    );
    
    onAssign(selectedTeamMembers);
    
    toast({
      title: "Team members assigned",
      description: `${selectedTeamMembers.length} team member(s) assigned to creator`
    });
    
    onOpenChange(false);
  };

  const toggleMember = (memberId: string) => {
    setSelectedIds(prev => {
      if (prev.includes(memberId)) {
        return prev.filter(id => id !== memberId);
      } else {
        return [...prev, memberId];
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Team Members</DialogTitle>
          <DialogDescription>
            Select team members who will manage this creator
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {teamMembers.length > 0 ? (
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-4">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center space-x-2 p-2 hover:bg-accent/20 rounded-md">
                    <Checkbox 
                      id={`member-${member.id}`}
                      checked={selectedIds.includes(member.id)}
                      onCheckedChange={() => toggleMember(member.id)}
                    />
                    <div className="flex flex-col">
                      <Label 
                        htmlFor={`member-${member.id}`}
                        className="font-medium cursor-pointer"
                      >
                        {member.name}
                      </Label>
                      <span className="text-xs text-muted-foreground">
                        {member.role} • {member.email}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No team members available</p>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            variant="premium" 
            onClick={handleSave}
            className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground"
          >
            Save Assignments
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TeamMemberAssignmentDialog;
