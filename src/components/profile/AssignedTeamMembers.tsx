
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users } from "lucide-react";
import { Employee } from "@/types/employee";

interface AssignedTeamMembersProps {
  members: Employee[];
}

const AssignedTeamMembers: React.FC<AssignedTeamMembersProps> = ({ members }) => {
  if (members.length === 0) {
    return (
      <div className="bg-card rounded-xl p-6 shadow-sm mb-6">
        <h2 className="text-xl font-bold mb-4">Assigned Team Members</h2>
        <div className="flex items-center justify-center p-4 text-muted-foreground">
          <Users className="h-5 w-5 mr-2" />
          <span>No team members assigned</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl p-6 shadow-sm mb-6">
      <h2 className="text-xl font-bold mb-4">Assigned Team Members</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {members.map((member) => (
          <div 
            key={member.id}
            className="flex items-center p-3 border border-border rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
          >
            <Avatar className="h-10 w-10 mr-3">
              <AvatarImage src={member.profileImage} alt={member.name} />
              <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{member.name}</div>
              <div className="text-xs text-muted-foreground">{member.role}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssignedTeamMembers;
