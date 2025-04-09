
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Employee } from "@/types/employee";

interface EmployeeCardProfileProps {
  employee: Employee;
}

const EmployeeCardProfile: React.FC<EmployeeCardProfileProps> = ({ employee }) => {
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
      <h3 className="font-medium text-xl">{employee.name}</h3>
    </div>
  );
};

export default EmployeeCardProfile;
