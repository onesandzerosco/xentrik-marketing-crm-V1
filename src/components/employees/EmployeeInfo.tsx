
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Clock, User, Users } from "lucide-react";
import { Employee } from "@/types/employee";

interface EmployeeInfoProps {
  employee: Employee;
}

const EmployeeInfo: React.FC<EmployeeInfoProps> = ({ employee }) => {
  return (
    <div className="space-y-3 mb-4">
      {/* Last Login */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span className="text-sm">Last login:</span>
        </div>
        <span className="text-sm">{employee.lastLogin}</span>
      </div>
      
      {/* Status and Team */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <User className="h-4 w-4" />
          <span className="text-sm">Status:</span>
        </div>
        <div className="flex gap-1 flex-wrap justify-end">
          <Badge 
            className={employee.status === "Active" ? "bg-green-500" : 
              employee.status === "Inactive" ? "bg-red-500" : "bg-amber-500"}
          >
            {employee.status}
          </Badge>
          
          {employee.teams && employee.teams.map(team => (
            <Badge 
              key={team} 
              className={team === "A" ? "bg-purple-500" : 
                team === "B" ? "bg-indigo-500" : "bg-teal-500"}
            >
              Team {team}
            </Badge>
          ))}
        </div>
      </div>
      
      {/* Telegram (if available) */}
      {employee.telegram && (
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M21.73 2.27a2 2 0 0 0-2.83 0L4.06 17.1a2 2 0 0 0 0 2.83a2 2 0 0 0 2.83 0L21.73 5.1a2 2 0 0 0 0-2.83Z" />
              <path d="m4.1 17.1 15.8-15.8" />
              <path d="M8 15H2v5a2 2 0 0 0 2 2h5v-6" />
              <path d="M17 9h6V4a2 2 0 0 0-2-2h-5v6" />
            </svg>
            <span className="text-sm">Telegram:</span>
          </div>
          <span className="text-sm">@{employee.telegram}</span>
        </div>
      )}
      
      {/* Department (if available) */}
      {employee.department && (
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="h-4 w-4" />
            <span className="text-sm">Department:</span>
          </div>
          <span className="text-sm">{employee.department}</span>
        </div>
      )}
      
      {/* Assigned Creators (if available) */}
      {employee.assignedCreators && employee.assignedCreators.length > 0 && (
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span className="text-sm">Assigned Creators:</span>
          </div>
          <Badge variant="outline">
            {employee.assignedCreators.length}
          </Badge>
        </div>
      )}
    </div>
  );
};

export default EmployeeInfo;
