
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Mail } from "lucide-react";
import { Employee } from "@/types/employee";

interface EmployeeHeaderProps {
  employee: Employee;
}

const EmployeeHeader: React.FC<EmployeeHeaderProps> = ({ employee }) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center gap-2">
        <Mail className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm">{employee.email}</span>
      </div>
      <Badge 
        className={employee.role === "Admin" ? "bg-red-500" : 
          employee.role === "Manager" ? "bg-blue-500" : "bg-gray-500"}
      >
        {employee.role}
      </Badge>
    </div>
  );
};

export default EmployeeHeader;
