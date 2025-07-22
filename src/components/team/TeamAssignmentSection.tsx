
import React from 'react';
import { Control } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { EmployeeTeam } from "@/types/employee";
import { TeamMemberFormValues } from '@/schemas/teamMemberSchema';

// Define two different interfaces for different usage contexts
interface TeamAssignmentFormProps {
  control: Control<TeamMemberFormValues>;
  selectedTeams?: never;
  toggleTeam?: never;
}

interface TeamAssignmentSelectionProps {
  control?: never;
  selectedTeams: EmployeeTeam[];
  toggleTeam: (team: EmployeeTeam) => void;
}

// Union type for all possible props combinations
export type TeamAssignmentSectionProps = TeamAssignmentFormProps | TeamAssignmentSelectionProps;

const TeamAssignmentSection: React.FC<TeamAssignmentSectionProps> = (props) => {
  // Check which variation of the component we're using
  if ('control' in props) {
    // Form field version
    const { control } = props;
    return (
      <div className="bg-[#1a1a33]/50 backdrop-blur-sm p-6 rounded-xl border border-[#252538]/50">
        <h2 className="text-xl font-semibold mb-4">Team Assignment</h2>
        
        <FormField
          control={control}
          name="teams"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assign to Teams</FormLabel>
              <FormControl>
                <div className="grid grid-cols-3 gap-4">
                  {["A", "B", "C"].map((team) => (
                    <div key={team} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`team-${team}`} 
                        checked={field.value?.includes(team as EmployeeTeam)} 
                        onCheckedChange={(checked) => {
                          const currentValue = field.value || [];
                          if (checked) {
                            field.onChange([...currentValue, team as EmployeeTeam]);
                          } else {
                            field.onChange(currentValue.filter(val => val !== team));
                          }
                        }}
                      />
                      <label
                        htmlFor={`team-${team}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Team {team}
                      </label>
                    </div>
                  ))}
                </div>
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    );
  } else {
    // Selection version (used in EditEmployeeModal and ProfileFormContainer)
    const { selectedTeams, toggleTeam } = props;
    return (
      <div className="bg-[#1a1a33]/50 backdrop-blur-sm p-6 rounded-xl border border-[#252538]/50">
        <h2 className="text-xl font-semibold mb-4">Team Assignment</h2>
        <div className="grid grid-cols-3 gap-4">
          {["A", "B", "C"].map((team) => (
            <div key={team} className="flex items-center space-x-2">
              <Checkbox 
                id={`team-${team}`} 
                checked={selectedTeams.includes(team as EmployeeTeam)} 
                onCheckedChange={() => toggleTeam(team as EmployeeTeam)}
              />
              <label
                htmlFor={`team-${team}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Team {team}
              </label>
            </div>
          ))}
        </div>
      </div>
    );
  }
};

export default TeamAssignmentSection;
