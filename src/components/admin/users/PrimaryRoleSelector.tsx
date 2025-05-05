
import React from "react";
import { 
  RadioGroup, 
  RadioGroupItem 
} from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { PrimaryRole } from "@/types/employee";
import { PRIMARY_ROLES } from "./constants";

interface PrimaryRoleSelectorProps {
  primaryRole: PrimaryRole;
  onPrimaryRoleChange: (role: PrimaryRole) => void;
}

const PrimaryRoleSelector: React.FC<PrimaryRoleSelectorProps> = ({
  primaryRole,
  onPrimaryRoleChange
}) => {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium">Primary Role</h3>
      <p className="text-sm text-muted-foreground">
        Select the main role for this user
      </p>
      
      <RadioGroup 
        value={primaryRole} 
        className="grid grid-cols-3 gap-2 pt-2"
        onValueChange={(value) => onPrimaryRoleChange(value as PrimaryRole)}
      >
        {PRIMARY_ROLES.map(role => (
          <div key={role} className="flex items-center space-x-2">
            <RadioGroupItem 
              value={role} 
              id={`role-${role}`}
            />
            <Label htmlFor={`role-${role}`} className="cursor-pointer">{role}</Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};

export default PrimaryRoleSelector;
