
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Employee } from "@/types/employee";

interface EmployeeCardHeaderProps {
  employee: Employee;
}

const EmployeeCardHeader: React.FC<EmployeeCardHeaderProps> = ({ employee }) => {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <div className="text-muted-foreground">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
        </div>
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

export default EmployeeCardHeader;
