
import React from "react";
import { FormLabel } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";

interface GeographicRestrictionsFieldProps {
  selectedRestrictions: string[];
  handleRestrictionChange: (checked: boolean | string, restriction: string) => void;
}

const GeographicRestrictionsField: React.FC<GeographicRestrictionsFieldProps> = ({
  selectedRestrictions,
  handleRestrictionChange
}) => {
  const availableRestrictions = [
    { value: "south_africa", label: "South African (cannot view SA creators)" }
  ];

  return (
    <div className="space-y-3">
      <FormLabel>Geographic Restrictions</FormLabel>
      <p className="text-sm text-muted-foreground">
        Select any geographic restrictions for this team member
      </p>
      
      <div className="space-y-2">
        {availableRestrictions.map((restriction) => (
          <div key={restriction.value} className="flex items-center space-x-2">
            <Checkbox 
              id={`restriction-${restriction.value}`}
              checked={selectedRestrictions.includes(restriction.value)}
              onCheckedChange={(checked) => handleRestrictionChange(checked, restriction.value)}
            />
            <label 
              htmlFor={`restriction-${restriction.value}`}
              className="text-sm cursor-pointer"
            >
              {restriction.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GeographicRestrictionsField;
