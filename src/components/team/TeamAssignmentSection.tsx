
import React from "react";
import { FormLabel } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { EmployeeTeam } from "@/types/employee";

interface TeamAssignmentSectionProps {
  selectedTeams: EmployeeTeam[];
  toggleTeam: (team: EmployeeTeam) => void;
}

const TeamAssignmentSection: React.FC<TeamAssignmentSectionProps> = ({
  selectedTeams,
  toggleTeam,
}) => {
  return (
    <div>
      <FormLabel className="block mb-2">Team Assignment</FormLabel>
      <div className="flex flex-wrap gap-2 mb-4">
        {["A", "B", "C"].map((team) => (
          <Button
            key={team}
            type="button"
            variant={selectedTeams.includes(team as EmployeeTeam) ? "default" : "outline"}
            onClick={() => toggleTeam(team as EmployeeTeam)}
            className="flex-1"
          >
            Team {team}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default TeamAssignmentSection;
