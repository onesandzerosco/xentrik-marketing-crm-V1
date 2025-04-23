
import React from 'react';
import { Control } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { CheckboxGroup } from "@/components/ui/checkbox-group";
import { Checkbox } from "@/components/ui/checkbox";
import { TeamMemberFormValues } from '@/schemas/teamMemberSchema';

interface TeamAssignmentSectionProps {
  control: Control<TeamMemberFormValues>;
}

const TeamAssignmentSection: React.FC<TeamAssignmentSectionProps> = ({ control }) => {
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
                      checked={field.value?.includes(team as any)} 
                      onCheckedChange={(checked) => {
                        const currentValue = field.value || [];
                        if (checked) {
                          field.onChange([...currentValue, team]);
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
};

export default TeamAssignmentSection;
