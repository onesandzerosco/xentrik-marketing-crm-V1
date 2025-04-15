
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Filter } from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  department?: string;
}

interface TeamMemberSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (selectedMembers: string[]) => void;
  teamMembers: TeamMember[];
}

const TeamMemberSelectionDialog = ({
  open,
  onOpenChange,
  onConfirm,
  teamMembers,
}: TeamMemberSelectionDialogProps) => {
  const [search, setSearch] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [departmentFilter, setDepartmentFilter] = useState<string[]>([]);

  const filteredMembers = teamMembers.filter(
    (member) =>
      member.name.toLowerCase().includes(search.toLowerCase()) &&
      (!departmentFilter.length || (member.department && departmentFilter.includes(member.department)))
  );

  const handleConfirm = () => {
    onConfirm(selectedMembers);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle>Select Team Members</DialogTitle>
          <DialogDescription>
            Choose team members to add to the Telegram group
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search team members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="h-[300px] rounded-md border p-4">
          <div className="space-y-4">
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center space-x-3 hover:bg-secondary/20 p-2 rounded-lg transition-colors"
              >
                <Checkbox
                  id={member.id}
                  checked={selectedMembers.includes(member.id)}
                  onCheckedChange={(checked) => {
                    setSelectedMembers(
                      checked
                        ? [...selectedMembers, member.id]
                        : selectedMembers.filter((id) => id !== member.id)
                    );
                  }}
                />
                <label
                  htmlFor={member.id}
                  className="flex-1 text-sm cursor-pointer"
                >
                  <div className="font-medium">{member.name}</div>
                  <div className="text-muted-foreground text-xs">
                    {member.role}
                    {member.department && ` • ${member.department}`}
                  </div>
                </label>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>Add Selected Members</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TeamMemberSelectionDialog;
