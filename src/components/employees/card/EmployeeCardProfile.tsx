
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Employee } from "@/types/employee";

interface EmployeeCardProfileProps {
  employee: Employee;
  isCurrentUser?: boolean;
}

const EmployeeCardProfile: React.FC<EmployeeCardProfileProps> = ({ 
  employee, 
  isCurrentUser = false 
}) => {
  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="flex flex-col items-center space-y-3">
      <Avatar className="h-24 w-24">
        <AvatarImage src={employee.profileImage} alt={employee.name} />
        <AvatarFallback className="text-lg">{getInitials(employee.name)}</AvatarFallback>
      </Avatar>
      <h3 className="font-medium text-xl">
        {employee.name}
        {isCurrentUser && <span className="ml-2 text-muted-foreground text-sm font-normal">(You)</span>}
      </h3>
    </div>
  );
};

export default EmployeeCardProfile;
